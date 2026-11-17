using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(IOrderService orderService, AppDbContext db) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] int? customerId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        return Ok(await orderService.GetAllAsync(status, customerId, dateFrom, dateTo, page, pageSize));
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await orderService.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy đơn hàng" }) : Ok(result);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create(
        [FromBody] CreateOrderRequest request,
        [FromHeader(Name = "X-Idempotency-Key")] string? headerIdempotencyKey)
    {
        int employeeId = 1;
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (claim != null && int.TryParse(claim.Value, out var parsedId))
        {
            employeeId = parsedId;
        }
        else
        {
            var defaultUser = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Role == "admin" || u.Role == "staff");
            if (defaultUser != null) employeeId = defaultUser.Id;
        }

        // Hỗ trợ Idempotency từ Header hoặc Body
        var effectiveRequest = string.IsNullOrEmpty(request.IdempotencyKey) && !string.IsNullOrEmpty(headerIdempotencyKey)
            ? request with { IdempotencyKey = headerIdempotencyKey }
            : request;

        var result = await orderService.CreateAsync(employeeId, effectiveRequest);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Xác nhận đơn hàng (chuyển từ pending sang confirmed và thực hiện trừ kho)
    /// </summary>
    [HttpPost("{id}/confirm")]
    [AllowAnonymous]
    public async Task<IActionResult> Confirm(int id)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        int employeeId = (claim != null && int.TryParse(claim.Value, out var parsedId)) ? parsedId : 1;
        var result = await orderService.ConfirmAsync(id, employeeId);
        return Ok(result);
    }

    [HttpPut("{id}/status")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        int employeeId = (claim != null && int.TryParse(claim.Value, out var parsedId)) ? parsedId : 1;
        var result = await orderService.UpdateStatusAsync(id, status, employeeId);
        return result == null ? NotFound(new { message = "Không tìm thấy đơn hàng" }) : Ok(result);
    }

    /// <summary>
    /// Hủy đơn hàng và hoàn trả tồn kho (POST)
    /// </summary>
    [HttpPost("{id}/cancel")]
    [AllowAnonymous]
    public async Task<IActionResult> CancelPost(int id)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        int employeeId = (claim != null && int.TryParse(claim.Value, out var parsedId)) ? parsedId : 1;
        var result = await orderService.CancelAsync(id, employeeId);
        if (!result) return NotFound(new { message = "Không tìm thấy đơn hàng" });
        return Ok(new { message = "Đã hủy đơn hàng và hoàn trả tồn kho thành công" });
    }

    /// <summary>
    /// Hủy đơn hàng và hoàn trả tồn kho (DELETE)
    /// </summary>
    [HttpDelete("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> CancelDelete(int id)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        int employeeId = (claim != null && int.TryParse(claim.Value, out var parsedId)) ? parsedId : 1;
        var result = await orderService.CancelAsync(id, employeeId);
        if (!result) return NotFound(new { message = "Không tìm thấy đơn hàng" });
        return Ok(new { message = "Đã hủy đơn hàng và hoàn trả tồn kho thành công" });
    }

    /// <summary>
    /// Hoàn trả đơn hàng (toàn bộ hoặc một phần) và hoàn kho
    /// </summary>
    [HttpPost("{id}/return")]
    [AllowAnonymous]
    public async Task<IActionResult> ReturnOrder(int id, [FromBody] ReturnOrderRequest? request)
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier);
        int employeeId = (claim != null && int.TryParse(claim.Value, out var parsedId)) ? parsedId : 1;
        var result = await orderService.ReturnOrderAsync(id, employeeId, request);
        return Ok(result);
    }
}
