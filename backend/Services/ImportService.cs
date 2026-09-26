using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Services;

public interface IImportService
{
    Task<PagedResult<ImportReceiptDto>> GetAllAsync(int page, int pageSize);
    Task<ImportReceiptDto?> GetByIdAsync(int id);
    Task<ImportReceiptDto> CreateAsync(int employeeId, CreateImportRequest request);
    Task<ImportReceiptDto> ConfirmAsync(int id, int employeeId);
    Task<ImportReceiptDto?> UpdateAsync(int id, UpdateImportRequest request);
    Task<bool> DeleteAsync(int id, int employeeId);
}

public class ImportService(AppDbContext db) : IImportService
{
    public async Task<PagedResult<ImportReceiptDto>> GetAllAsync(int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var total = await db.ImportReceipts.CountAsync();
        var items = await db.ImportReceipts.AsNoTracking()
            .Include(i => i.Supplier).Include(i => i.Employee)
            .Include(i => i.ImportDetails).ThenInclude(d => d.Product)
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => ToDto(i)).ToListAsync();

        return new PagedResult<ImportReceiptDto>(items, total, page, pageSize, (int)Math.Ceiling((double)total / pageSize));
    }

    public async Task<ImportReceiptDto?> GetByIdAsync(int id)
    {
        var i = await db.ImportReceipts.AsNoTracking()
            .Include(i => i.Supplier).Include(i => i.Employee)
            .Include(i => i.ImportDetails).ThenInclude(d => d.Product)
            .FirstOrDefaultAsync(i => i.Id == id);
        return i == null ? null : ToDto(i);
    }

    public async Task<ImportReceiptDto> CreateAsync(int employeeId, CreateImportRequest request)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var code = $"NK{DateTime.Now:yyyyMMdd}{(await db.ImportReceipts.CountAsync()) + 1:D4}";
            decimal total = 0;

            var targetStatus = string.IsNullOrWhiteSpace(request.Status) ? "completed" : request.Status.ToLower();
            var shouldAddStock = targetStatus is "completed" or "confirmed";

            var receipt = new ImportReceipt
            {
                ReceiptCode = code,
                SupplierId = request.SupplierId,
                EmployeeId = employeeId,
                Note = request.Note,
                Status = targetStatus
            };
            db.ImportReceipts.Add(receipt);
            await db.SaveChangesAsync();

            foreach (var detail in request.Details)
            {
                var product = await db.Products.FindAsync(detail.ProductId)
                    ?? throw new InvalidOperationException($"Không tìm thấy sản phẩm #{detail.ProductId}");

                var lineTotal = detail.Quantity * detail.ImportPrice;
                total += lineTotal;

                var importDetail = new ImportDetail
                {
                    ImportReceiptId = receipt.Id,
                    ProductId = detail.ProductId,
                    Quantity = detail.Quantity,
                    ImportPrice = detail.ImportPrice,
                    Total = lineTotal
                };
                db.ImportDetails.Add(importDetail);

                // Chỉ cộng kho nếu phiếu ở trạng thái hoàn tất/xác nhận
                if (shouldAddStock)
                {
                    var before = product.Quantity;
                    product.Quantity += detail.Quantity;
                    product.UpdatedAt = DateTime.UtcNow;

                    db.InventoryTransactions.Add(new InventoryTransaction
                    {
                        ProductId = detail.ProductId,
                        Type = "IMPORT",
                        Quantity = detail.Quantity,
                        BeforeQuantity = before,
                        AfterQuantity = product.Quantity,
                        ReferenceId = receipt.Id,
                        Note = $"Nhập kho theo phiếu {code}",
                        EmployeeId = employeeId
                    });
                }
            }

            receipt.TotalAmount = total;
            await db.SaveChangesAsync();

            await tx.CommitAsync();
            return (await GetByIdAsync(receipt.Id))!;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ImportReceiptDto> ConfirmAsync(int id, int employeeId)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var receipt = await db.ImportReceipts
                .Include(i => i.ImportDetails).ThenInclude(d => d.Product)
                .FirstOrDefaultAsync(i => i.Id == id)
                ?? throw new KeyNotFoundException($"Không tìm thấy phiếu nhập #{id}");

            if (receipt.Status != "draft")
                throw new InvalidOperationException($"Chỉ phiếu nhập ở trạng thái 'draft' (nháp) mới có thể xác nhận (hiện tại: {receipt.Status}).");

            // Cộng kho cho từng sản phẩm
            foreach (var detail in receipt.ImportDetails)
            {
                var product = await db.Products.FindAsync(detail.ProductId)
                    ?? throw new InvalidOperationException($"Sản phẩm #{detail.ProductId} không còn tồn tại");

                var before = product.Quantity;
                product.Quantity += detail.Quantity;
                product.UpdatedAt = DateTime.UtcNow;

                db.InventoryTransactions.Add(new InventoryTransaction
                {
                    ProductId = detail.ProductId,
                    Type = "IMPORT",
                    Quantity = detail.Quantity,
                    BeforeQuantity = before,
                    AfterQuantity = product.Quantity,
                    ReferenceId = receipt.Id,
                    Note = $"Xác nhận phiếu nhập kho {receipt.ReceiptCode} - Nhập hàng",
                    EmployeeId = employeeId
                });
            }

            receipt.Status = "completed";
            receipt.UpdatedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            await tx.CommitAsync();
            return (await GetByIdAsync(receipt.Id))!;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task<ImportReceiptDto?> UpdateAsync(int id, UpdateImportRequest request)
    {
        var receipt = await db.ImportReceipts.FindAsync(id);
        if (receipt == null) return null;

        if (request.SupplierId.HasValue)
        {
            var supplierExists = await db.Suppliers.AnyAsync(s => s.Id == request.SupplierId.Value);
            if (!supplierExists)
                throw new InvalidOperationException($"Không tìm thấy nhà cung cấp #{request.SupplierId.Value}");
            receipt.SupplierId = request.SupplierId.Value;
        }

        if (request.Note != null)
            receipt.Note = request.Note;

        if (!string.IsNullOrWhiteSpace(request.Status))
            receipt.Status = request.Status;

        receipt.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id, int employeeId)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var receipt = await db.ImportReceipts
                .Include(i => i.ImportDetails)
                .FirstOrDefaultAsync(i => i.Id == id);
            if (receipt == null) return false;

            if (receipt.Status == "cancelled")
                throw new InvalidOperationException("Phiếu nhập kho này đã bị hủy trước đó.");

            // Chỉ hoàn trừ kho nếu phiếu trước đó ĐÃ cộng kho (completed/confirmed)
            var wasStockAdded = receipt.Status is "completed" or "confirmed";

            if (wasStockAdded)
            {
                // Kiểm tra tồn kho có đủ để hoàn trừ không
                foreach (var detail in receipt.ImportDetails)
                {
                    var product = await db.Products.FindAsync(detail.ProductId)
                        ?? throw new InvalidOperationException($"Sản phẩm #{detail.ProductId} không còn tồn tại.");

                    if (product.Quantity < detail.Quantity)
                    {
                        throw new InvalidOperationException(
                            $"Không thể hủy phiếu nhập vì tồn kho của '{product.Name}' hiện tại ({product.Quantity}) nhỏ hơn số lượng đã nhập ({detail.Quantity}).");
                    }
                }

                // Hoàn trừ tồn kho và ghi nhận transaction
                foreach (var detail in receipt.ImportDetails)
                {
                    var product = (await db.Products.FindAsync(detail.ProductId))!;
                    var before = product.Quantity;
                    product.Quantity -= detail.Quantity;
                    product.UpdatedAt = DateTime.UtcNow;

                    db.InventoryTransactions.Add(new InventoryTransaction
                    {
                        ProductId = product.Id,
                        Type = "EXPORT",
                        Quantity = detail.Quantity,
                        BeforeQuantity = before,
                        AfterQuantity = product.Quantity,
                        ReferenceId = receipt.Id,
                        Note = $"Hủy phiếu nhập kho {receipt.ReceiptCode} - Hoàn trừ kho",
                        EmployeeId = employeeId
                    });
                }
            }

            receipt.Status = "cancelled";
            receipt.UpdatedAt = DateTime.UtcNow;
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

    private static ImportReceiptDto ToDto(ImportReceipt i) => new(
        i.Id, i.ReceiptCode, i.SupplierId, i.Supplier?.Name ?? "",
        i.EmployeeId, i.Employee?.FullName ?? "", i.TotalAmount, i.Note, i.Status, i.CreatedAt,
        i.ImportDetails.Select(d => new ImportDetailDto(d.Id, d.ProductId, d.Product?.Name ?? "", d.Quantity, d.ImportPrice, d.Total)).ToList()
    );
}
