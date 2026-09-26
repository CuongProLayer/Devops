using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize]
public class InventoryController(AppDbContext db, IProductService productService, IReportService reportService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var inventory = await db.Products.Include(p => p.Category)
            .Where(p => p.Status == "active")
            .Select(p => new InventoryDto(
                p.Id, p.ProductCode, p.Name, p.Category.Name, p.Quantity, p.MinStock,
                p.Quantity == 0 ? "out" : p.Quantity <= p.MinStock ? "low" : "ok"
            ))
            .ToListAsync();
        return Ok(inventory);
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var product = await db.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == productId);
        if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });
        return Ok(new InventoryDto(
            product.Id, product.ProductCode, product.Name, product.Category.Name,
            product.Quantity, product.MinStock,
            product.Quantity == 0 ? "out" : product.Quantity <= product.MinStock ? "low" : "ok"
        ));
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> LowStock() => Ok(await productService.GetLowStockAsync());

    [HttpGet("out-of-stock")]
    public async Task<IActionResult> OutOfStock() => Ok(await productService.GetOutOfStockAsync());

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] int? productId, [FromQuery] string? type,
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        return Ok(await reportService.GetTransactionHistoryAsync(productId, type, page, pageSize));
    }

    /// <summary>
    /// Điều chỉnh tồn kho thủ công (kiểm kê kho, bù trừ sai lệch, nhập nhầm)
    /// </summary>
    [HttpPost("adjust")]
    [HttpPost("adjustment")]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Adjust([FromBody] InventoryAdjustmentRequest request)
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var product = await db.Products.Include(p => p.Category).FirstOrDefaultAsync(p => p.Id == request.ProductId);
        if (product == null) return NotFound(new { message = "Không tìm thấy sản phẩm" });

        var before = product.Quantity;
        var diff = request.NewQuantity - before;
        product.Quantity = request.NewQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        var note = string.IsNullOrWhiteSpace(request.Reason)
            ? $"Điều chỉnh tồn kho từ {before} sang {request.NewQuantity} (chênh lệch: {(diff >= 0 ? "+" : "")}{diff})"
            : request.Reason.Trim();

        db.InventoryTransactions.Add(new InventoryTransaction
        {
            ProductId = product.Id,
            Type = "ADJUSTMENT",
            Quantity = Math.Abs(diff),
            BeforeQuantity = before,
            AfterQuantity = request.NewQuantity,
            Note = note,
            EmployeeId = employeeId
        });

        await db.SaveChangesAsync();

        return Ok(new InventoryDto(
            product.Id,
            product.ProductCode,
            product.Name,
            product.Category?.Name ?? "",
            product.Quantity,
            product.MinStock,
            product.Quantity == 0 ? "out" : product.Quantity <= product.MinStock ? "low" : "ok"
        ));
    }
}
