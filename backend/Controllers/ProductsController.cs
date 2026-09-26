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
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int? categoryId,
        [FromQuery] int? supplierId,
        [FromQuery] int? supplierID,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var targetSupplierId = supplierId ?? supplierID;
        return Ok(await productService.GetAllAsync(search, categoryId, targetSupplierId, status, page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await productService.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm" }) : Ok(result);
    }

    [HttpPost]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Create(CreateProductRequest request)
    {
        var result = await productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Update(int id, UpdateProductRequest request)
    {
        var result = await productService.UpdateAsync(id, request);
        return result == null ? NotFound(new { message = "Không tìm thấy sản phẩm" }) : Ok(result);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
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
