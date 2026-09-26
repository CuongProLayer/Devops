using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Services;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(string? search, int? categoryId, int? supplierId, string? status, int page, int pageSize);
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(CreateProductRequest request);
    Task<ProductDto?> UpdateAsync(int id, UpdateProductRequest request);
    Task<bool> DeleteAsync(int id);
    Task<List<InventoryDto>> GetLowStockAsync();
    Task<List<InventoryDto>> GetOutOfStockAsync();
}

public class ProductService(AppDbContext db) : IProductService
{
    public async Task<PagedResult<ProductDto>> GetAllAsync(string? search, int? categoryId, int? supplierId, string? status, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .Where(p => !p.IsDeleted)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(p => p.Name.Contains(s) || p.ProductCode.Contains(s));
        }
        if (categoryId.HasValue)
            query = query.Where(p => p.CategoryId == categoryId.Value);
        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(p => p.Status == status);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => ToDto(p)).ToListAsync();

        return new PagedResult<ProductDto>(items, total, page, pageSize, (int)Math.Ceiling((double)total / pageSize));
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        var p = await db.Products.AsNoTracking()
            .Include(p => p.Category)
            .Include(p => p.Supplier)
            .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);
        return p == null ? null : ToDto(p);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        var code = $"PRD{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() % 100000:D5}";
        var product = new Product
        {
            ProductCode = code,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            CostPrice = request.CostPrice,
            Quantity = request.Quantity,
            MinStock = request.MinStock,
            Unit = request.Unit,
            CategoryId = request.CategoryId,
            SupplierId = request.SupplierId
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return (await GetByIdAsync(product.Id))!;
    }

    public async Task<ProductDto?> UpdateAsync(int id, UpdateProductRequest request)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null) return null;

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.CostPrice = request.CostPrice;
        product.Quantity = request.Quantity;
        product.MinStock = request.MinStock;
        product.Unit = request.Unit;
        product.CategoryId = request.CategoryId;
        product.SupplierId = request.SupplierId;
        product.Status = request.Status;
        product.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product == null || product.IsDeleted) return false;
        product.Status = "inactive";
        product.IsDeleted = true;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<List<InventoryDto>> GetLowStockAsync()
    {
        return await db.Products.AsNoTracking().Include(p => p.Category)
            .Where(p => p.Quantity > 0 && p.Quantity <= p.MinStock && p.Status == "active")
            .Select(p => new InventoryDto(p.Id, p.ProductCode, p.Name, p.Category.Name, p.Quantity, p.MinStock, "low"))
            .ToListAsync();
    }

    public async Task<List<InventoryDto>> GetOutOfStockAsync()
    {
        return await db.Products.AsNoTracking().Include(p => p.Category)
            .Where(p => p.Quantity == 0 && p.Status == "active")
            .Select(p => new InventoryDto(p.Id, p.ProductCode, p.Name, p.Category.Name, p.Quantity, p.MinStock, "out"))
            .ToListAsync();
    }

    private static ProductDto ToDto(Product p) => new(
        p.Id, p.ProductCode, p.Name, p.Description, p.Image,
        p.Price, p.CostPrice, p.Quantity, p.MinStock, p.Unit, p.Status,
        p.CategoryId, p.Category?.Name ?? "", p.SupplierId, p.Supplier?.Name,
        p.CreatedAt, p.UpdatedAt
    );
}
