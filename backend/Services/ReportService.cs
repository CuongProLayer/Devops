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
            .Where(o => !o.IsDeleted && o.CreatedAt >= todayStart && (o.Status == "completed" || o.Status == "partially_returned"))
            .SumAsync(o => (decimal?)o.PaidAmount) ?? 0m;

        var monthRevenue = await db.Orders.AsNoTracking()
            .Where(o => !o.IsDeleted && o.CreatedAt >= monthStart && (o.Status == "completed" || o.Status == "partially_returned"))
            .SumAsync(o => (decimal?)o.PaidAmount) ?? 0m;

        var monthlyRevenueRaw = await db.Orders.AsNoTracking()
            .Where(o => !o.IsDeleted && (o.Status == "completed" || o.Status == "partially_returned") && o.CreatedAt.Year >= now.Year - 1)
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Revenue = g.Sum(o => o.PaidAmount), Count = g.Count() })
            .ToListAsync();

        var monthlyRevenue = monthlyRevenueRaw
            .Select(r => new MonthlyRevenueDto(r.Month, r.Year, r.Revenue, r.Count))
            .OrderBy(r => r.Year).ThenBy(r => r.Month)
            .ToList();

        var topProductsRaw = await db.OrderDetails.AsNoTracking()
            .Where(d => !d.Order.IsDeleted
                && (d.Order.Status == "confirmed" || d.Order.Status == "completed" || d.Order.Status == "partially_returned"))
            .Select(d => new
            {
                d.ProductId,
                ProductName = d.Product.Name,
                Quantity = d.Quantity - d.ReturnedQuantity,
                Revenue = d.Price * (d.Quantity - d.ReturnedQuantity)
            })
            .Where(d => d.Quantity > 0)
            .GroupBy(d => new { d.ProductId, d.ProductName })
            .Select(g => new { g.Key.ProductId, Name = g.Key.ProductName, TotalSold = g.Sum(d => d.Quantity), TotalRevenue = g.Sum(d => d.Revenue) })
            .OrderByDescending(t => t.TotalSold)
            .Take(5)
            .ToListAsync();

        var topProducts = topProductsRaw
            .Select(t => new TopProductDto(t.ProductId, t.Name, t.TotalSold, t.TotalRevenue))
            .ToList();

        return new DashboardDto(
            await db.Products.AsNoTracking().CountAsync(p => p.Status == "active"),
            await db.Customers.AsNoTracking().CountAsync(c => c.Status == "active"),
            await db.Orders.AsNoTracking().CountAsync(o => !o.IsDeleted),
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
        var query = db.Orders.AsNoTracking().Where(o =>
            !o.IsDeleted
            && (o.Status == "completed" || o.Status == "partially_returned")
            && o.CreatedAt.Year == year);

        if (period == "monthly")
        {
            var raw = await query
                .GroupBy(o => o.CreatedAt.Month)
                .Select(g => new { Month = g.Key, Total = g.Sum(o => o.PaidAmount), Count = g.Count() })
                .ToListAsync();

            return raw
                .OrderBy(g => g.Month)
                .Select(g => new RevenueReportDto(
                    $"Tháng {g.Month}/{year}",
                    g.Total,
                    g.Count,
                    g.Count > 0 ? g.Total / g.Count : 0
                ))
                .ToList();
        }

        if (period == "daily" && month.HasValue)
        {
            var monthQuery = query.Where(o => o.CreatedAt.Month == month.Value);
            var raw = await monthQuery
                .GroupBy(o => o.CreatedAt.Day)
                .Select(g => new { Day = g.Key, Total = g.Sum(o => o.PaidAmount), Count = g.Count() })
                .ToListAsync();

            return raw
                .OrderBy(g => g.Day)
                .Select(g => new RevenueReportDto(
                    $"Ngày {g.Day}/{month}/{year}",
                    g.Total,
                    g.Count,
                    g.Count > 0 ? g.Total / g.Count : 0
                ))
                .ToList();
        }

        // yearly
        var yearlyRaw = await db.Orders.AsNoTracking()
            .Where(o => !o.IsDeleted && (o.Status == "completed" || o.Status == "partially_returned"))
            .GroupBy(o => o.CreatedAt.Year)
            .Select(g => new { Year = g.Key, Total = g.Sum(o => o.PaidAmount), Count = g.Count() })
            .ToListAsync();

        return yearlyRaw
            .OrderBy(g => g.Year)
            .Select(g => new RevenueReportDto(
                $"Năm {g.Year}",
                g.Total,
                g.Count,
                g.Count > 0 ? g.Total / g.Count : 0
            ))
            .ToList();
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(int top, int? year, int? month)
    {
        var query = db.OrderDetails.AsNoTracking()
            .Where(d => !d.Order.IsDeleted
                && (d.Order.Status == "confirmed" || d.Order.Status == "completed" || d.Order.Status == "partially_returned"))
            .AsQueryable();

        if (year.HasValue)
            query = query.Where(d => d.Order.CreatedAt.Year == year.Value);
        if (month.HasValue)
            query = query.Where(d => d.Order.CreatedAt.Month == month.Value);

        var raw = await query
            .Select(d => new
            {
                d.ProductId,
                ProductName = d.Product.Name,
                Quantity = d.Quantity - d.ReturnedQuantity,
                Revenue = d.Price * (d.Quantity - d.ReturnedQuantity)
            })
            .Where(d => d.Quantity > 0)
            .GroupBy(d => new { d.ProductId, d.ProductName })
            .Select(g => new { g.Key.ProductId, Name = g.Key.ProductName, TotalSold = g.Sum(d => d.Quantity), TotalRevenue = g.Sum(d => d.Revenue) })
            .OrderByDescending(t => t.TotalSold)
            .Take(top)
            .ToListAsync();

        return raw
            .Select(t => new TopProductDto(t.ProductId, t.Name, t.TotalSold, t.TotalRevenue))
            .ToList();
    }

    public async Task<List<InventoryReportDto>> GetInventoryReportAsync()
    {
        return await db.Products.AsNoTracking().Include(p => p.Category)
            .Where(p => p.Status == "active")
            .Select(p => new InventoryReportDto(
                p.Id, p.ProductCode, p.Name, p.Category.Name,
                p.InventoryTransactions.OrderBy(t => t.CreatedAt).ThenBy(t => t.Id)
                    .Select(t => (int?)t.BeforeQuantity).FirstOrDefault() ?? p.Quantity,
                p.InventoryTransactions
                    .Where(t => t.Type == "IMPORT" || t.Type == "RETURN" || (t.Type == "ADJUSTMENT" && t.AfterQuantity > t.BeforeQuantity))
                    .Sum(t => (int?)t.Quantity) ?? 0,
                p.InventoryTransactions
                    .Where(t => t.Type == "SALE" || t.Type == "EXPORT" || (t.Type == "ADJUSTMENT" && t.AfterQuantity < t.BeforeQuantity))
                    .Sum(t => (int?)t.Quantity) ?? 0,
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
