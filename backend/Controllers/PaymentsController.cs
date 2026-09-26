using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController(AppDbContext db) : ControllerBase
{
    /// <summary>
    /// Lấy danh sách các giao dịch thanh toán
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> GetAll(
        [FromQuery] int? orderId,
        [FromQuery] string? paymentMethod,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Payments.AsNoTracking()
            .Include(p => p.Order)
            .Include(p => p.Employee)
            .AsQueryable();

        if (orderId.HasValue)
            query = query.Where(p => p.OrderId == orderId.Value);

        if (!string.IsNullOrWhiteSpace(paymentMethod))
            query = query.Where(p => p.PaymentMethod == paymentMethod);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new PaymentDto(
                p.Id,
                p.OrderId,
                p.Order.OrderCode,
                p.Amount,
                p.PaymentMethod,
                p.TransactionCode,
                p.Note,
                p.EmployeeId,
                p.Employee.FullName,
                p.CreatedAt
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        return Ok(new PagedResult<PaymentDto>(items, total, page, pageSize, totalPages));
    }

    /// <summary>
    /// Lấy chi tiết một khoản thanh toán
    /// </summary>
    [HttpGet("{id}")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Payments.AsNoTracking()
            .Include(p => p.Order)
            .Include(p => p.Employee)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (p == null) return NotFound(new { message = "Không tìm thấy giao dịch thanh toán" });

        return Ok(new PaymentDto(
            p.Id,
            p.OrderId,
            p.Order.OrderCode,
            p.Amount,
            p.PaymentMethod,
            p.TransactionCode,
            p.Note,
            p.EmployeeId,
            p.Employee.FullName,
            p.CreatedAt
        ));
    }

    /// <summary>
    /// Lấy danh sách thanh toán của một đơn hàng cụ thể
    /// </summary>
    [HttpGet("/api/orders/{orderId}/payments")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> GetByOrder(int orderId)
    {
        var exists = await db.Orders.AnyAsync(o => o.Id == orderId && !o.IsDeleted);
        if (!exists) return NotFound(new { message = "Không tìm thấy đơn hàng" });

        var items = await db.Payments.AsNoTracking()
            .Include(p => p.Order)
            .Include(p => p.Employee)
            .Where(p => p.OrderId == orderId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentDto(
                p.Id,
                p.OrderId,
                p.Order.OrderCode,
                p.Amount,
                p.PaymentMethod,
                p.TransactionCode,
                p.Note,
                p.EmployeeId,
                p.Employee.FullName,
                p.CreatedAt
            ))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Ghi nhận thanh toán / đặt cọc cho một đơn hàng
    /// </summary>
    [HttpPost("/api/orders/{orderId}/payments")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> CreatePayment(int orderId, [FromBody] CreatePaymentRequest request)
    {
        var employeeId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == orderId && !o.IsDeleted);
            if (order == null)
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            if (order.Status is "cancelled" or "returned")
                return BadRequest(new { message = $"Không thể thanh toán cho đơn hàng đã {order.Status}" });

            var payment = new Payment
            {
                OrderId = order.Id,
                Amount = request.Amount,
                PaymentMethod = request.PaymentMethod,
                TransactionCode = request.TransactionCode,
                Note = request.Note,
                EmployeeId = employeeId
            };
            db.Payments.Add(payment);

            // Cập nhật số tiền đã trả cho đơn
            order.PaidAmount += request.Amount;
            order.UpdatedAt = DateTime.UtcNow;

            // Nếu đã thanh toán đủ hoặc thừa, chuyển trạng thái confirmed -> completed
            if (order.PaidAmount >= order.FinalAmount && order.Status == "confirmed")
            {
                order.Status = "completed";
            }

            await db.SaveChangesAsync();
            await tx.CommitAsync();

            var employee = await db.Users.FindAsync(employeeId);

            var dto = new PaymentDto(
                payment.Id,
                order.Id,
                order.OrderCode,
                payment.Amount,
                payment.PaymentMethod,
                payment.TransactionCode,
                payment.Note,
                employeeId,
                employee?.FullName ?? "",
                payment.CreatedAt
            );

            return CreatedAtAction(nameof(GetById), new { id = payment.Id }, dto);
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}
