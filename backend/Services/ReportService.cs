using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;

namespace SmartStock.API.Services;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardAsync();
}

public interface IReportService
{
    Task<List<RevenueReportDto>> GetRevenueAsync(string period, int year, int? month);
    Task<List<TopProductDto>> GetTopProductsAsync(int top, int? year, int? month);
    Task<List<InventoryReportDto>> GetInventoryReportAsync();
    Task<List<InventoryTransactionDto>> GetTransactionHistoryAsync(int? productId, string? type, int page, int pageSize);
}

public class DashboardService(AppDbContext db) : IDashboardService
{
    public async Task<DashboardDto> GetDashboardAsync()
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var monthStart = new DateTime(now.Year, now.Month, 1);

        var todayRevenue = await db.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= todayStart && o.Status == "completed")
            .SumAsync(o => o.FinalAmount);

        var monthRevenue = await db.Orders.AsNoTracking()
            .Where(o => o.CreatedAt >= monthStart && o.Status == "completed")
            .SumAsync(o => o.FinalAmount);

        var monthlyRevenue = await db.Orders.AsNoTracking()
            .Where(o => o.Status == "completed" && o.CreatedAt.Year >= now.Year - 1)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new MonthlyRevenueDto(g.Key.Month, g.Key.Year, g.Sum(o => o.FinalAmount), g.Count()))
            .OrderBy(r => r.Year).ThenBy(r => r.Month)
            .ToListAsync();

        var topProducts = await db.OrderDetails.AsNoTracking()
            .Include(d => d.Product)
            .GroupBy(d => new { d.ProductId, d.Product.Name })
            .Select(g => new TopProductDto(g.Key.ProductId, g.Key.Name, g.Sum(d => d.Quantity), g.Sum(d => d.Total)))
            .OrderByDescending(t => t.TotalSold)
            .Take(5).ToListAsync();

        return new DashboardDto(
            await db.Products.AsNoTracking().CountAsync(p => p.Status == "active"),
            await db.Customers.AsNoTracking().CountAsync(c => c.Status == "active"),
            await db.Orders.AsNoTracking().CountAsync(),
            todayRevenue,
            monthRevenue,
            await db.Products.AsNoTracking().CountAsync(p => p.Quantity > 0 && p.Quantity <= p.MinStock && p.Status == "active"),
            await db.Products.AsNoTracking().CountAsync(p => p.Quantity == 0 && p.Status == "active"),
            monthlyRevenue,
            topProducts
        );
    }
}

public class ReportService(AppDbContext db) : IReportService
{
    public async Task<List<RevenueReportDto>> GetRevenueAsync(string period, int year, int? month)
    {
        var query = db.Orders.AsNoTracking().Where(o => o.Status == "completed" && o.CreatedAt.Year == year);

        if (period == "monthly")
        {
            return await query
                .GroupBy(o => o.CreatedAt.Month)
                .Select(g => new RevenueReportDto(
                    $"Tháng {g.Key}/{year}",
                    g.Sum(o => o.FinalAmount),
                    g.Count(),
                    g.Count() > 0 ? g.Sum(o => o.FinalAmount) / g.Count() : 0
                ))
                .OrderBy(r => r.Period)
                .ToListAsync();
        }

        if (period == "daily" && month.HasValue)
        {
            var monthQuery = query.Where(o => o.CreatedAt.Month == month.Value);
            return await monthQuery
                .GroupBy(o => o.CreatedAt.Day)
                .Select(g => new RevenueReportDto(
                    $"Ngày {g.Key}/{month}/{year}",
                    g.Sum(o => o.FinalAmount),
                    g.Count(),
                    g.Count() > 0 ? g.Sum(o => o.FinalAmount) / g.Count() : 0
                ))
                .OrderBy(r => r.Period)
                .ToListAsync();
        }

        // yearly
        return await db.Orders.AsNoTracking().Where(o => o.Status == "completed")
            .GroupBy(o => o.CreatedAt.Year)
            .Select(g => new RevenueReportDto(
                $"Năm {g.Key}",
                g.Sum(o => o.FinalAmount),
                g.Count(),
                g.Count() > 0 ? g.Sum(o => o.FinalAmount) / g.Count() : 0
            ))
            .OrderBy(r => r.Period)
            .ToListAsync();
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int top, int? year, int? month)
    {
        var query = db.OrderDetails.AsNoTracking().Include(d => d.Product).AsQueryable();

        if (year.HasValue)
            query = query.Where(d => d.Order.CreatedAt.Year == year.Value);
        if (month.HasValue)
            query = query.Where(d => d.Order.CreatedAt.Month == month.Value);

        return await query
            .GroupBy(d => new { d.ProductId, d.Product.Name })
            .Select(g => new TopProductDto(g.Key.ProductId, g.Key.Name, g.Sum(d => d.Quantity), g.Sum(d => d.Total)))
            .OrderByDescending(t => t.TotalSold)
            .Take(top)
            .ToListAsync();
    }

    public async Task<List<InventoryReportDto>> GetInventoryReportAsync()
    {
        return await db.Products.AsNoTracking().Include(p => p.Category)
            .Where(p => p.Status == "active")
            .Select(p => new InventoryReportDto(
                p.Id, p.ProductCode, p.Name, p.Category.Name,
                0,
                p.ImportDetails.Sum(d => d.Quantity),
                p.OrderDetails.Sum(d => d.Quantity),
                p.Quantity,
                p.Quantity * p.CostPrice
            ))
            .ToListAsync();
    }

    public async Task<List<InventoryTransactionDto>> GetTransactionHistoryAsync(int? productId, string? type, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.InventoryTransactions.AsNoTracking()
            .Include(t => t.Product).Include(t => t.Employee).AsQueryable();

        if (productId.HasValue)
            query = query.Where(t => t.ProductId == productId.Value);
        if (!string.IsNullOrEmpty(type))
            query = query.Where(t => t.Type == type);

        return await query.OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(t => new InventoryTransactionDto(
                t.Id, t.ProductId, t.Product.Name, t.Type,
                t.Quantity, t.BeforeQuantity, t.AfterQuantity,
                t.ReferenceId, t.Note, t.Employee.FullName, t.CreatedAt
            ))
            .ToListAsync();
    }
}
