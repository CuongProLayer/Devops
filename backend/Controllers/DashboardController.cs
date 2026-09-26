using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStock.API.DTOs;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetDashboard()
    {
        return Ok(await dashboardService.GetDashboardAsync());
    }
}

[ApiController]
[Route("api/reports")]
[Authorize(Roles = "admin")]
public class ReportsController(IReportService reportService) : ControllerBase
{
    [HttpGet("revenue")]
    public async Task<IActionResult> Revenue(
        [FromQuery] string period = "monthly",
        [FromQuery] int? year = null,
        [FromQuery] int? month = null
    )
    {
        int y = year ?? DateTime.UtcNow.Year;
        return Ok(await reportService.GetRevenueAsync(period, y, month));
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> TopProducts([FromQuery] int? year, [FromQuery] int? month, [FromQuery] int top = 10)
    {
        return Ok(await reportService.GetTopProductsAsync(top, year, month));
    }

    [HttpGet("inventory")]
    public async Task<IActionResult> Inventory()
    {
        return Ok(await reportService.GetInventoryReportAsync());
    }

    [HttpGet("import-export")]
    public async Task<IActionResult> ImportExport([FromQuery] int? productId, [FromQuery] string? type, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        return Ok(await reportService.GetTransactionHistoryAsync(productId, type, page, pageSize));
    }
}
