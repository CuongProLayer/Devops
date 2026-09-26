using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStock.API.DTOs;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/imports")]
[Authorize(Roles = "admin,warehouse")]
public class ImportsController(IImportService importService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        return Ok(await importService.GetAllAsync(page, pageSize));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await importService.GetByIdAsync(id);
        return result == null ? NotFound(new { message = "Không tìm thấy phiếu nhập kho" }) : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateImportRequest request)
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await importService.CreateAsync(employeeId, request);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>
    /// Xác nhận phiếu nhập kho (phiếu nháp draft -> completed và thực hiện cộng tồn kho)
    /// </summary>
    [HttpPost("{id}/confirm")]
    public async Task<IActionResult> Confirm(int id)
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await importService.ConfirmAsync(id, employeeId);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật thông tin phiếu nhập kho
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateImportRequest request)
    {
        var result = await importService.UpdateAsync(id, request);
        return result == null ? NotFound(new { message = "Không tìm thấy phiếu nhập kho" }) : Ok(result);
    }

    /// <summary>
    /// Hủy phiếu nhập kho và hoàn trừ tồn kho tương ứng
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var success = await importService.DeleteAsync(id, employeeId);
        if (!success) return NotFound(new { message = "Không tìm thấy phiếu nhập kho" });
        return Ok(new { message = "Đã hủy phiếu nhập kho và hoàn trừ tồn kho thành công" });
    }
}
