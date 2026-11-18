using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStock.API.DTOs;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController(IProductService productService) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int? supplierId,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (User.Identity?.IsAuthenticated != true)
            status = "active";

        return Ok(await productService.GetAllAsync(search, categoryId, supplierId, status, page, pageSize));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await productService.GetByIdAsync(id);
        if (User.Identity?.IsAuthenticated != true && result?.Status != "active")
            return NotFound(new { message = "Không tìm thấy sản phẩm" });
        return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm" }) : Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(CreateProductRequest request)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var employeeId = int.TryParse(idClaim, out var parsedId) ? parsedId : 1;
        var result = await productService.CreateAsync(employeeId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> Update(int id, UpdateProductRequest request)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var employeeId = int.TryParse(idClaim, out var parsedId) ? parsedId : 1;
        var result = await productService.UpdateAsync(id, request, employeeId);
        return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm" }) : Ok(result);
    }

    [HttpDelete("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await productService.DeleteAsync(id);
        return result ? NoContent() : NotFound(new { message = "Không tìm thấy sản phẩm" });
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock()
    {
        return Ok(await productService.GetLowStockAsync());
    }

    [HttpGet("out-of-stock")]
    public async Task<IActionResult> GetOutOfStock()
    {
        return Ok(await productService.GetOutOfStockAsync());
    }
}
