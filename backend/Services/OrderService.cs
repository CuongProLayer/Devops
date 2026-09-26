using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Services;

public interface IOrderService
{
    Task<PagedResult<OrderDto>> GetAllAsync(string? status, int? customerId, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize);
    Task<OrderDto?> GetByIdAsync(int id);
    Task<OrderDto> CreateAsync(int employeeId, CreateOrderRequest request);
    Task<OrderDto?> UpdateStatusAsync(int id, string status, int employeeId);
    Task<OrderDto> ConfirmAsync(int id, int employeeId);
    Task<List<OrderDto>> GetCustomerOrdersAsync(int customerId);
    Task<bool> CancelAsync(int orderId, int employeeId);
    Task<OrderDto> ReturnOrderAsync(int orderId, int employeeId, ReturnOrderRequest? request);
}

public class OrderService(AppDbContext db) : IOrderService
{
    public async Task<PagedResult<OrderDto>> GetAllAsync(string? status, int? customerId, DateTime? dateFrom, DateTime? dateTo, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Orders.AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Employee)
            .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
            .Include(o => o.Payments).ThenInclude(p => p.Employee)
            .Where(o => !o.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(o => o.Status == status);
        if (customerId.HasValue)
            query = query.Where(o => o.CustomerId == customerId.Value);
        if (dateFrom.HasValue)
            query = query.Where(o => o.CreatedAt >= dateFrom.Value);
        if (dateTo.HasValue)
            query = query.Where(o => o.CreatedAt <= dateTo.Value.AddDays(1));

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(o => ToDto(o)).ToListAsync();

        return new PagedResult<OrderDto>(items, total, page, pageSize, (int)Math.Ceiling((double)total / pageSize));
    }

    public async Task<OrderDto?> GetByIdAsync(int id)
    {
        var o = await db.Orders.AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Employee)
            .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
            .Include(o => o.Payments).ThenInclude(p => p.Employee)
            .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
        return o == null ? null : ToDto(o);
    }

    public async Task<OrderDto> CreateAsync(int employeeId, CreateOrderRequest request)
    {
        // 1. Idempotency Check: Tránh bấm 2 lần tạo trùng đơn
        if (!string.IsNullOrWhiteSpace(request.IdempotencyKey))
        {
            var existingOrder = await db.Orders.AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.Employee)
                .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
                .Include(o => o.Payments).ThenInclude(p => p.Employee)
                .FirstOrDefaultAsync(o => o.IdempotencyKey == request.IdempotencyKey);

            if (existingOrder != null)
                return ToDto(existingOrder);
        }

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var code = $"DH{DateTime.Now:yyyyMMdd}{(await db.Orders.CountAsync()) + 1:D4}";
            decimal totalAmount = 0;

            var targetStatus = string.IsNullOrWhiteSpace(request.Status) ? "confirmed" : request.Status.ToLower();
            var shouldDeductStock = targetStatus is "confirmed" or "completed";

            var order = new Order
            {
                OrderCode = code,
                CustomerId = request.CustomerId,
                EmployeeId = employeeId,
                Discount = request.Discount,
                PaymentMethod = request.PaymentMethod,
                Note = request.Note,
                Status = targetStatus,
                IdempotencyKey = request.IdempotencyKey
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            foreach (var detail in request.Details)
            {
                var product = await db.Products.FindAsync(detail.ProductId)
                    ?? throw new InvalidOperationException($"Không tìm thấy sản phẩm #{detail.ProductId}");

                var lineTotal = detail.Quantity * detail.Price;
                totalAmount += lineTotal;

                db.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    Price = detail.Price,
                    Total = lineTotal
                });

                // 2. Chống Race Condition khi trừ kho: Atomic UPDATE WHERE Quantity >= x
                if (shouldDeductStock)
                {
                    var before = product.Quantity;
                    var affectedRows = await db.Database.ExecuteSqlInterpolatedAsync(
                        $"UPDATE Products SET Quantity = Quantity - {detail.Quantity}, UpdatedAt = {DateTime.UtcNow} WHERE Id = {detail.ProductId} AND Quantity >= {detail.Quantity}"
                    );

                    if (affectedRows == 0)
                    {
                        throw new InvalidOperationException(
                            $"Sản phẩm '{product.Name}' không đủ tồn kho hoặc đã được bán bởi giao dịch khác (Tồn hiện tại: {product.Quantity}, yêu cầu: {detail.Quantity}).");
                    }

                    // Refresh entity state
                    await db.Entry(product).ReloadAsync();

                    db.InventoryTransactions.Add(new InventoryTransaction
                    {
                        ProductId = detail.ProductId,
                        Type = "SALE",
                        Quantity = detail.Quantity,
                        BeforeQuantity = before,
                        AfterQuantity = product.Quantity,
                        ReferenceId = order.Id,
                        Note = $"Bán hàng theo đơn {code} (Trạng thái: {targetStatus})",
                        EmployeeId = employeeId
                    });
                }
            }

            order.TotalAmount = totalAmount;
            order.FinalAmount = Math.Max(0, totalAmount - request.Discount);

            // Nếu đơn hoàn tất thì gán số tiền đã thanh toán = FinalAmount
            if (targetStatus == "completed")
            {
                order.PaidAmount = order.FinalAmount;
            }

            await db.SaveChangesAsync();

            // Update customer total purchase nếu đơn xác nhận/hoàn thành
            if (shouldDeductStock && request.CustomerId.HasValue)
            {
                var customer = await db.Customers.FindAsync(request.CustomerId.Value);
                if (customer != null)
                {
                    customer.TotalPurchase += order.FinalAmount;
                    customer.UpdatedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                }
            }

            await tx.CommitAsync();
            return (await GetByIdAsync(order.Id))!;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto> ConfirmAsync(int id, int employeeId)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var order = await db.Orders
                .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted)
                ?? throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{id}");

            if (order.Status != "pending")
                throw new InvalidOperationException($"Chỉ đơn hàng ở trạng thái 'pending' mới có thể xác nhận (trạng thái hiện tại: {order.Status}).");

            // Tiến hành trừ kho atomic chống race condition
            foreach (var detail in order.OrderDetails)
            {
                var product = await db.Products.FindAsync(detail.ProductId)
                    ?? throw new InvalidOperationException($"Sản phẩm #{detail.ProductId} không còn tồn tại");

                var before = product.Quantity;
                var affectedRows = await db.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE Products SET Quantity = Quantity - {detail.Quantity}, UpdatedAt = {DateTime.UtcNow} WHERE Id = {detail.ProductId} AND Quantity >= {detail.Quantity}"
                );

                if (affectedRows == 0)
                {
                    throw new InvalidOperationException(
                        $"Không thể xác nhận đơn vì sản phẩm '{product.Name}' không đủ tồn kho (Tồn: {product.Quantity}, yêu cầu: {detail.Quantity}).");
                }

                await db.Entry(product).ReloadAsync();

                db.InventoryTransactions.Add(new InventoryTransaction
                {
                    ProductId = detail.ProductId,
                    Type = "SALE",
                    Quantity = detail.Quantity,
                    BeforeQuantity = before,
                    AfterQuantity = product.Quantity,
                    ReferenceId = order.Id,
                    Note = $"Xác nhận đơn hàng {order.OrderCode} - Xuất kho",
                    EmployeeId = employeeId
                });
            }

            order.Status = "confirmed";
            order.UpdatedAt = DateTime.UtcNow;

            if (order.CustomerId.HasValue)
            {
                var customer = await db.Customers.FindAsync(order.CustomerId.Value);
                if (customer != null)
                {
                    customer.TotalPurchase += order.FinalAmount;
                    customer.UpdatedAt = DateTime.UtcNow;
                }
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(order.Id))!;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto?> UpdateStatusAsync(int id, string status, int employeeId)
    {
        var normalized = status.Trim().ToLower();
        if (normalized == "confirmed")
            return await ConfirmAsync(id, employeeId);
        if (normalized == "cancelled")
        {
            await CancelAsync(id, employeeId);
            return await GetByIdAsync(id);
        }

        var order = await db.Orders.FindAsync(id);
        if (order == null || order.IsDeleted) return null;

        order.Status = normalized;
        order.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<List<OrderDto>> GetCustomerOrdersAsync(int customerId)
    {
        return await db.Orders.AsNoTracking()
            .Include(o => o.Customer)
            .Include(o => o.Employee)
            .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
            .Include(o => o.Payments).ThenInclude(p => p.Employee)
            .Where(o => o.CustomerId == customerId && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => ToDto(o)).ToListAsync();
    }

    public async Task<bool> CancelAsync(int orderId, int employeeId)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var order = await db.Orders
                .Include(o => o.OrderDetails)
                .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);
            if (order == null) return false;

            if (order.Status == "cancelled")
                throw new InvalidOperationException("Đơn hàng này đã bị hủy trước đó.");

            if (order.Status == "returned")
                throw new InvalidOperationException("Đơn hàng này đã được hoàn trả, không thể hủy.");

            // Chỉ hoàn kho nếu đơn trước đó ĐÃ trừ kho (confirmed hoặc completed)
            var wasStockDeducted = order.Status is "confirmed" or "completed";

            if (wasStockDeducted)
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await db.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        var before = product.Quantity;
                        product.Quantity += detail.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        db.InventoryTransactions.Add(new InventoryTransaction
                        {
                            ProductId = detail.ProductId,
                            Type = "RETURN",
                            Quantity = detail.Quantity,
                            BeforeQuantity = before,
                            AfterQuantity = product.Quantity,
                            ReferenceId = order.Id,
                            Note = $"Hủy đơn hàng {order.OrderCode} - Hoàn kho",
                            EmployeeId = employeeId
                        });
                    }
                }

                // Hoàn lại doanh số tích lũy của khách hàng
                if (order.CustomerId.HasValue)
                {
                    var customer = await db.Customers.FindAsync(order.CustomerId.Value);
                    if (customer != null)
                    {
                        customer.TotalPurchase = Math.Max(0, customer.TotalPurchase - order.FinalAmount);
                        customer.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }

            order.Status = "cancelled";
            order.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            await tx.CommitAsync();
            return true;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<OrderDto> ReturnOrderAsync(int orderId, int employeeId, ReturnOrderRequest? request)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var order = await db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Employee)
                .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
                .Include(o => o.Payments).ThenInclude(p => p.Employee)
                .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted)
                ?? throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{orderId}");

            if (order.Status == "cancelled")
                throw new InvalidOperationException("Đơn hàng đã bị hủy, không thể hoàn trả.");

            if (order.Status == "returned")
                throw new InvalidOperationException("Đơn hàng này đã được xử lý hoàn trả trước đó.");

            var reason = string.IsNullOrWhiteSpace(request?.Reason) ? "Khách trả hàng" : request.Reason.Trim();

            if (request?.Details != null && request.Details.Count > 0)
            {
                foreach (var retItem in request.Details)
                {
                    var detail = order.OrderDetails.FirstOrDefault(d => d.ProductId == retItem.ProductId)
                        ?? throw new InvalidOperationException($"Sản phẩm #{retItem.ProductId} không có trong đơn hàng {order.OrderCode}");

                    if (retItem.Quantity > detail.Quantity)
                        throw new InvalidOperationException($"Số lượng hoàn trả của sản phẩm '{detail.Product?.Name}' ({retItem.Quantity}) vượt quá số lượng đã mua ({detail.Quantity})");

                    var product = await db.Products.FindAsync(retItem.ProductId);
                    if (product != null)
                    {
                        var before = product.Quantity;
                        product.Quantity += retItem.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        db.InventoryTransactions.Add(new InventoryTransaction
                        {
                            ProductId = product.Id,
                            Type = "RETURN",
                            Quantity = retItem.Quantity,
                            BeforeQuantity = before,
                            AfterQuantity = product.Quantity,
                            ReferenceId = order.Id,
                            Note = $"Hoàn hàng {order.OrderCode}: {reason}",
                            EmployeeId = employeeId
                        });
                    }
                }
            }
            else
            {
                foreach (var detail in order.OrderDetails)
                {
                    var product = await db.Products.FindAsync(detail.ProductId);
                    if (product != null)
                    {
                        var before = product.Quantity;
                        product.Quantity += detail.Quantity;
                        product.UpdatedAt = DateTime.UtcNow;

                        db.InventoryTransactions.Add(new InventoryTransaction
                        {
                            ProductId = detail.ProductId,
                            Type = "RETURN",
                            Quantity = detail.Quantity,
                            BeforeQuantity = before,
                            AfterQuantity = product.Quantity,
                            ReferenceId = order.Id,
                            Note = $"Hoàn hàng toàn bộ {order.OrderCode}: {reason}",
                            EmployeeId = employeeId
                        });
                    }
                }
            }

            if (order.CustomerId.HasValue)
            {
                var customer = await db.Customers.FindAsync(order.CustomerId.Value);
                if (customer != null)
                {
                    customer.TotalPurchase = Math.Max(0, customer.TotalPurchase - order.FinalAmount);
                    customer.UpdatedAt = DateTime.UtcNow;
                }
            }

            order.Status = "returned";
            order.Note = string.IsNullOrWhiteSpace(order.Note)
                ? $"[Hoàn hàng]: {reason}"
                : $"{order.Note} | [Hoàn hàng]: {reason}";
            order.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync();
            await tx.CommitAsync();

            return (await GetByIdAsync(order.Id))!;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    private static OrderDto ToDto(Order o) => new(
        o.Id, o.OrderCode, o.CustomerId, o.Customer?.Name,
        o.EmployeeId, o.Employee?.FullName ?? "", o.TotalAmount, o.Discount, o.FinalAmount,
        o.PaidAmount, o.PaymentMethod, o.Status, o.Note, o.CreatedAt,
        o.OrderDetails.Select(d => new OrderDetailDto(d.Id, d.ProductId, d.Product?.Name ?? "", d.Quantity, d.Price, d.Total)).ToList(),
        o.Payments.Select(p => new PaymentDto(p.Id, p.OrderId, o.OrderCode, p.Amount, p.PaymentMethod, p.TransactionCode, p.Note, p.EmployeeId, p.Employee?.FullName ?? "", p.CreatedAt)).ToList()
    );
}
