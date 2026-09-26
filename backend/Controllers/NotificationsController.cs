using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        int? userId = null;
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(sub, out var parsedId))
            userId = parsedId;

        // Auto-generate system notifications based on stock
        var notifications = new List<NotificationDto>();

        var outOfStock = await db.Products.Where(p => p.Quantity == 0 && p.Status == "active").ToListAsync();
        foreach (var p in outOfStock)
            notifications.Add(new NotificationDto(0, "Hết hàng", $"{p.Name} đã hết hàng trong kho", "error", false, DateTime.UtcNow));

        var lowStock = await db.Products.Where(p => p.Quantity > 0 && p.Quantity <= p.MinStock && p.Status == "active").ToListAsync();
        foreach (var p in lowStock)
            notifications.Add(new NotificationDto(0, "Sắp hết hàng", $"{p.Name} chỉ còn {p.Quantity} sản phẩm trong kho", "warning", false, DateTime.UtcNow));

        var dbNotifications = await db.Notifications
            .Where(n => n.UserId == null || (userId.HasValue && n.UserId == userId.Value))
            .OrderByDescending(n => n.CreatedAt)
            .Take(30)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAt))
            .ToListAsync();

        notifications.AddRange(dbNotifications);
        return Ok(notifications.OrderByDescending(n => n.CreatedAt));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var n = await db.Notifications.FindAsync(id);
        if (n == null) return NotFound(new { message = "Không tìm thấy thông báo" });
        n.IsRead = true;
        await db.SaveChangesAsync();
        return Ok(new { message = "Đã đánh dấu đã đọc" });
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        int? userId = null;
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (int.TryParse(sub, out var parsedId))
            userId = parsedId;

        var unread = await db.Notifications
            .Where(n => !n.IsRead && (n.UserId == null || (userId.HasValue && n.UserId == userId.Value)))
            .ToListAsync();

        unread.ForEach(n => n.IsRead = true);
        await db.SaveChangesAsync();
        return Ok(new { message = $"Đã đánh dấu đã đọc {unread.Count} thông báo" });
    }
}

[ApiController]
[Route("api/users")]
[Authorize(Roles = "admin")]
public class UsersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await db.Users
            .Select(u => new UserDto(u.Id, u.Username, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.CreatedAt))
            .ToListAsync());
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateUserRequest request)
    {
        var u = await db.Users.FindAsync(id);
        if (u == null) return NotFound(new { message = "Không tìm thấy người dùng" });
        u.FullName = request.FullName;
        u.Phone = request.Phone ?? "";
        u.Role = request.Role;
        u.IsActive = request.IsActive;
        u.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new UserDto(u.Id, u.Username, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var u = await db.Users.FindAsync(id);
        if (u == null) return NotFound(new { message = "Không tìm thấy người dùng" });
        u.IsActive = false;
        u.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
