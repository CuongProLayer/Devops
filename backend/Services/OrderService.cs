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

            var targetStatus = string.IsNullOrWhiteSpace(request.Status) ? "confirmed" : request.Status.Trim().ToLowerInvariant();
            if (targetStatus is not ("pending" or "confirmed" or "completed"))
                throw new InvalidOperationException("Trạng thái đơn hàng không hợp lệ.");
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
                var product = await db.Products.FirstOrDefaultAsync(p =>
                    p.Id == detail.ProductId && !p.IsDeleted && p.Status == "active")
                    ?? throw new InvalidOperationException($"Không tìm thấy sản phẩm #{detail.ProductId}");

                var lineTotal = detail.Quantity * product.Price;
                totalAmount += lineTotal;

                db.OrderDetails.Add(new OrderDetail
                {
                    OrderId = order.Id,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    Price = product.Price,
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
                if (order.FinalAmount > 0)
                {
                    db.Payments.Add(new Payment
                    {
                        OrderId = order.Id,
                        Amount = order.FinalAmount,
                        PaymentMethod = request.PaymentMethod,
                        Note = "Thanh toán khi tạo đơn hoàn tất",
                        EmployeeId = employeeId,
                    });
                }
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
            var claimed = await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Orders SET UpdatedAt = {DateTime.UtcNow} WHERE Id = {id} AND Status = 'pending' AND IsDeleted = 0");
            if (claimed == 0)
            {
                if (!await db.Orders.AnyAsync(order => order.Id == id && !order.IsDeleted))
                    throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{id}");
                throw new InvalidOperationException("Đơn hàng không còn ở trạng thái chờ xác nhận.");
            }

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
        if (string.IsNullOrWhiteSpace(status))
            throw new InvalidOperationException("Trạng thái đơn hàng không được để trống.");

        var normalized = status.Trim().ToLowerInvariant();
        if (normalized == "confirmed")
            return await ConfirmAsync(id, employeeId);
        if (normalized == "cancelled")
        {
            return await CancelAsync(id, employeeId) ? await GetByIdAsync(id) : null;
        }
        if (normalized != "completed")
            throw new InvalidOperationException("Chỉ có thể chuyển đơn sang confirmed, completed hoặc cancelled.");

        var order = await db.Orders.FindAsync(id);
        if (order == null || order.IsDeleted) return null;
        if (order.Status != "confirmed")
            throw new InvalidOperationException("Chỉ đơn đã xác nhận mới có thể hoàn tất.");

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
            if (order.Status == "partially_returned")
                throw new InvalidOperationException("Đơn hàng đã hoàn một phần; hãy hoàn tiếp số lượng còn lại thay vì hủy.");

            if (order.Status is not ("pending" or "confirmed" or "completed"))
                throw new InvalidOperationException("Trạng thái hiện tại không thể hủy.");

            // Chỉ hoàn kho nếu đơn trước đó ĐÃ trừ kho (confirmed hoặc completed)
            var wasStockDeducted = order.Status is "confirmed" or "completed";
            var previousStatus = order.Status;
            var claimed = await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Orders SET UpdatedAt = {DateTime.UtcNow} WHERE Id = {orderId} AND Status = {previousStatus} AND IsDeleted = 0");
            if (claimed == 0)
                throw new InvalidOperationException("Trạng thái đơn hàng vừa được thay đổi bởi một thao tác khác.");
            await db.Entry(order).ReloadAsync();

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

            if (order.PaidAmount > 0)
            {
                db.Payments.Add(new Payment
                {
                    OrderId = order.Id,
                    Amount = -order.PaidAmount,
                    PaymentMethod = "refund",
                    Note = $"Hoàn tiền do hủy đơn {order.OrderCode}",
                    EmployeeId = employeeId,
                });
                order.PaidAmount = 0;
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
            var locked = await db.Database.ExecuteSqlInterpolatedAsync(
                $"UPDATE Orders SET UpdatedAt = {DateTime.UtcNow} WHERE Id = {orderId} AND IsDeleted = 0");
            if (locked == 0)
                throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{orderId}");

            var order = await db.Orders
                .Include(o => o.Customer)
                .Include(o => o.Employee)
                .Include(o => o.OrderDetails).ThenInclude(d => d.Product)
                .Include(o => o.Payments).ThenInclude(p => p.Employee)
                .FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted)
                ?? throw new KeyNotFoundException($"Không tìm thấy đơn hàng #{orderId}");

            if (order.Status == "returned")
                throw new InvalidOperationException("Đơn hàng này đã được hoàn trả toàn bộ.");
            if (order.Status is not ("confirmed" or "completed" or "partially_returned"))
                throw new InvalidOperationException("Chỉ đơn đã xác nhận hoặc hoàn tất mới có thể hoàn trả.");

            var reason = string.IsNullOrWhiteSpace(request?.Reason) ? "Khách trả hàng" : request.Reason.Trim();
            var requested = request?.Details is { Count: > 0 }
                ? request.Details
                    .GroupBy(detail => detail.ProductId)
                    .Select(group => new ReturnOrderDetailRequest(group.Key, group.Sum(detail => detail.Quantity)))
                    .ToList()
                : order.OrderDetails
                    .Where(detail => detail.ReturnedQuantity < detail.Quantity)
                    .GroupBy(detail => detail.ProductId)
                    .Select(group => new ReturnOrderDetailRequest(group.Key, group.Sum(detail => detail.Quantity - detail.ReturnedQuantity)))
                    .ToList();

            if (requested.Count == 0)
                throw new InvalidOperationException("Không còn sản phẩm nào có thể hoàn trả.");

            var returnedBaseBefore = order.OrderDetails.Sum(detail => detail.Price * detail.ReturnedQuantity);
            var quantitiesByProduct = new Dictionary<int, int>();
            foreach (var returnItem in requested)
            {
                var productDetails = order.OrderDetails.Where(detail => detail.ProductId == returnItem.ProductId).OrderBy(detail => detail.Id).ToList();
                var availableQuantity = productDetails.Sum(detail => detail.Quantity - detail.ReturnedQuantity);
                if (productDetails.Count == 0)
                    throw new InvalidOperationException($"Sản phẩm #{returnItem.ProductId} không có trong đơn hàng {order.OrderCode}");
                if (returnItem.Quantity > availableQuantity)
                    throw new InvalidOperationException($"Số lượng hoàn vượt quá số lượng còn lại của sản phẩm '{productDetails[0].Product.Name}' ({availableQuantity}).");

                var quantityToAllocate = returnItem.Quantity;
                foreach (var detail in productDetails)
                {
                    var returnedNow = Math.Min(quantityToAllocate, detail.Quantity - detail.ReturnedQuantity);
                    detail.ReturnedQuantity += returnedNow;
                    quantityToAllocate -= returnedNow;
                    if (quantityToAllocate == 0) break;
                }
                quantitiesByProduct[returnItem.ProductId] = returnItem.Quantity;
            }

            foreach (var (productId, quantity) in quantitiesByProduct)
            {
                var product = await db.Products.FindAsync(productId)
                    ?? throw new InvalidOperationException($"Sản phẩm #{productId} không còn tồn tại.");
                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE Products SET Quantity = Quantity + {quantity}, UpdatedAt = {DateTime.UtcNow} WHERE Id = {productId}");
                await db.Entry(product).ReloadAsync();
                var afterQuantity = product.Quantity;
                db.InventoryTransactions.Add(new InventoryTransaction
                {
                    ProductId = product.Id,
                    Type = "RETURN",
                    Quantity = quantity,
                    BeforeQuantity = afterQuantity - quantity,
                    AfterQuantity = afterQuantity,
                    ReferenceId = order.Id,
                    Note = $"Hoàn hàng {order.OrderCode}: {reason}",
                    EmployeeId = employeeId
                });
            }

            var returnedBaseAfter = order.OrderDetails.Sum(detail => detail.Price * detail.ReturnedQuantity);
            var discountRatio = order.TotalAmount > 0 ? order.FinalAmount / order.TotalAmount : 0m;
            var previousRefund = decimal.Round(returnedBaseBefore * discountRatio, 2, MidpointRounding.AwayFromZero);
            var totalRefund = decimal.Round(returnedBaseAfter * discountRatio, 2, MidpointRounding.AwayFromZero);
            var purchaseReduction = Math.Max(0m, totalRefund - previousRefund);
            var cashRefund = Math.Min(order.PaidAmount, purchaseReduction);

            if (order.CustomerId.HasValue && purchaseReduction > 0)
            {
                await db.Database.ExecuteSqlInterpolatedAsync(
                    $"UPDATE Customers SET TotalPurchase = CASE WHEN TotalPurchase > {purchaseReduction} THEN TotalPurchase - {purchaseReduction} ELSE 0 END, UpdatedAt = {DateTime.UtcNow} WHERE Id = {order.CustomerId.Value}");
            }

            order.PaidAmount -= cashRefund;
            if (cashRefund > 0)
            {
                db.Payments.Add(new Payment
                {
                    OrderId = order.Id,
                    Amount = -cashRefund,
                    PaymentMethod = "refund",
                    Note = $"Hoàn tiền theo hoàn hàng: {reason}",
                    EmployeeId = employeeId,
                });
            }
            order.Status = order.OrderDetails.All(detail => detail.ReturnedQuantity >= detail.Quantity)
                ? "returned"
                : "partially_returned";
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
        o.OrderDetails.Select(d => new OrderDetailDto(d.Id, d.ProductId, d.Product?.Name ?? "", d.Quantity, d.Price, d.Total, d.ReturnedQuantity)).ToList(),
        o.Payments.Select(p => new PaymentDto(p.Id, p.OrderId, o.OrderCode, p.Amount, p.PaymentMethod, p.TransactionCode, p.Note, p.EmployeeId, p.Employee?.FullName ?? "", p.CreatedAt)).ToList()
    );
}
