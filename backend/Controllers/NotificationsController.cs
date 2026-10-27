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

        var stockAlerts = await db.Products.AsNoTracking()
            .Where(p => p.Status == "active" && (p.Quantity == 0 || (p.Quantity > 0 && p.Quantity <= p.MinStock)))
            .Select(p => new { p.Name, p.Quantity, IsOutOfStock = p.Quantity == 0 })
            .ToListAsync();

        foreach (var product in stockAlerts)
        {
            var title = product.IsOutOfStock ? "Hết hàng" : "Sắp hết hàng";
            var type = product.IsOutOfStock ? "error" : "warning";
            var message = product.IsOutOfStock
                ? $"{product.Name} đã hết hàng trong kho"
                : $"{product.Name} chỉ còn {product.Quantity} sản phẩm trong kho";
            var exists = await db.Notifications.AnyAsync(n =>
                n.UserId == null && n.Title == title && n.Type == type && n.Message == message);

            if (!exists)
                db.Notifications.Add(new Notification { Title = title, Message = message, Type = type });
        }

        if (db.ChangeTracker.HasChanges())
            await db.SaveChangesAsync();

        var notifications = await db.Notifications
            .Where(n => n.UserId == null || (userId.HasValue && n.UserId == userId.Value))
            .OrderByDescending(n => n.CreatedAt)
            .Take(30)
            .Select(n => new NotificationDto(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAt))
            .ToListAsync();

        return Ok(notifications.OrderByDescending(n => n.CreatedAt));
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Create([FromBody] CreateNotificationRequest request)
    {
        var n = new Notification
        {
            Title = request.Title ?? "Yêu cầu nhập hàng",
            Message = request.Message,
            Type = request.Type ?? "warning",
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        };
        db.Notifications.Add(n);
        await db.SaveChangesAsync();
        return Ok(new NotificationDto(n.Id, n.Title, n.Message, n.Type, n.IsRead, n.CreatedAt));
    }

    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        int? userId = int.TryParse(sub, out var parsedId) ? parsedId : null;
        var n = await db.Notifications.FirstOrDefaultAsync(n =>
            n.Id == id && (n.UserId == null || (userId.HasValue && n.UserId == userId.Value)));
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

    [HttpPost]
    public async Task<IActionResult> Create(CreateUserRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var username = request.Username.Trim();
        if (await db.Users.AnyAsync(u => u.Email.ToLower() == email || u.Username.ToLower() == username.ToLower()))
            return BadRequest(new { message = "Email hoặc tên đăng nhập đã tồn tại trong hệ thống" });

        var allowedRoles = new[] { "admin", "warehouse", "staff", "customer" };
        var role = allowedRoles.Contains(request.Role.Trim().ToLower()) ? request.Role.Trim().ToLower() : "staff";

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim() ?? "",
            Role = role,
            IsActive = true
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Created($"/api/users/{user.Id}", new UserDto(user.Id, user.Username, user.Email, user.FullName, user.Phone, user.Role, user.IsActive, user.CreatedAt));
    }

    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPassword(int id, AdminResetPasswordRequest request)
    {
        var u = await db.Users.FindAsync(id);
        if (u == null) return NotFound(new { message = "Không tìm thấy người dùng" });
        u.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        u.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new { message = $"Đã cấp lại mật khẩu mới cho tài khoản {u.Username} ({u.FullName}) thành công!" });
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
