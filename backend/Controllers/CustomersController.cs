using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController(AppDbContext db, IOrderService orderService) : ControllerBase
{
    private async Task EnsureCustomersSyncedAsync()
    {
        // 1. Tự động đồng bộ các tài khoản khách hàng từ bảng Users (role = 'customer') sang Customers nếu chưa có
        var customerUsers = await db.Users
            .Where(u => u.Role == "customer")
            .ToListAsync();

        bool hasChanges = false;
        foreach (var user in customerUsers)
        {
            var userEmail = (user.Email ?? "").Trim().ToLower();
            var userPhone = (user.Phone ?? "").Trim();

            var existing = await db.Customers.FirstOrDefaultAsync(c =>
                (!string.IsNullOrWhiteSpace(userEmail) && c.Email != null && c.Email.ToLower() == userEmail) ||
                (!string.IsNullOrWhiteSpace(userPhone) && c.Phone != null && c.Phone == userPhone) ||
                c.CustomerCode == $"KH{user.Id:D4}");

            if (existing == null)
            {
                var c = new Customer
                {
                    CustomerCode = $"KH{user.Id:D4}",
                    Name = user.FullName,
                    Phone = string.IsNullOrWhiteSpace(userPhone) ? null : userPhone,
                    Email = string.IsNullOrWhiteSpace(userEmail) ? null : userEmail,
                    Address = "",
                    TotalPurchase = 0,
                    Status = user.IsActive ? "active" : "inactive",
                    CreatedAt = user.CreatedAt,
                    UpdatedAt = user.UpdatedAt
                };
                db.Customers.Add(c);
                hasChanges = true;
            }
            else
            {
                bool updated = false;
                if (string.IsNullOrWhiteSpace(existing.Name) && !string.IsNullOrWhiteSpace(user.FullName))
                {
                    existing.Name = user.FullName;
                    updated = true;
                }
                if (string.IsNullOrWhiteSpace(existing.Email) && !string.IsNullOrWhiteSpace(userEmail))
                {
                    existing.Email = userEmail;
                    updated = true;
                }
                if (string.IsNullOrWhiteSpace(existing.Phone) && !string.IsNullOrWhiteSpace(userPhone))
                {
                    existing.Phone = userPhone;
                    updated = true;
                }
                if (updated)
                {
                    existing.UpdatedAt = DateTime.UtcNow;
                    hasChanges = true;
                }
            }
        }

        if (hasChanges)
        {
            await db.SaveChangesAsync();
        }
    }

    [HttpGet]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        await EnsureCustomersSyncedAsync();

        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Customers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Name.ToLower().Contains(s) || (c.Phone != null && c.Phone.Contains(s)) || (c.Email != null && c.Email.ToLower().Contains(s)) || c.CustomerCode.ToLower().Contains(s));
        }

        var total = await query.CountAsync();
        var customers = await query.OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .ToListAsync();

        // Tính toán lại TotalPurchase thực tế từ các đơn hàng đã hoàn tất (status == 'completed' hoặc 'confirmed' hợp lệ)
        var completedOrders = await db.Orders.AsNoTracking()
            .Where(o => !o.IsDeleted && (o.Status == "completed" || o.Status == "thành công" || o.Status == "confirmed" || o.Status == "đã xác nhận"))
            .ToListAsync();

        var items = customers.Select(c =>
        {
            var cPhone = (c.Phone ?? "").Trim();
            var cEmail = (c.Email ?? "").Trim().ToLower();

            var matchedOrders = completedOrders.Where(o =>
                (o.CustomerId.HasValue && o.CustomerId.Value == c.Id) ||
                (!string.IsNullOrWhiteSpace(cPhone) && !string.IsNullOrWhiteSpace(o.Note) && o.Note.Contains(cPhone)) ||
                (!string.IsNullOrWhiteSpace(cEmail) && !string.IsNullOrWhiteSpace(o.Note) && o.Note.ToLower().Contains(cEmail))
            ).ToList();

            decimal calculatedTotal = matchedOrders.Any()
                ? matchedOrders.Sum(o => o.FinalAmount > 0 ? o.FinalAmount : o.TotalAmount)
                : c.TotalPurchase;

            return new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, calculatedTotal, c.Status, c.CreatedAt);
        }).ToList();

        return Ok(new PagedResult<CustomerDto>(items, total, page, pageSize, (int)Math.Ceiling((double)total / pageSize)));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await db.Customers.FindAsync(id);
        if (c == null) return NotFound(new { message = "Không tìm thấy khách hàng" });

        var cPhone = (c.Phone ?? "").Trim();
        var cEmail = (c.Email ?? "").Trim().ToLower();

        var completedOrders = await db.Orders.AsNoTracking()
            .Where(o => !o.IsDeleted && (o.Status == "completed" || o.Status == "thành công" || o.Status == "confirmed" || o.Status == "đã xác nhận"))
            .Where(o => (o.CustomerId.HasValue && o.CustomerId.Value == c.Id) ||
                        (!string.IsNullOrWhiteSpace(cPhone) && !string.IsNullOrWhiteSpace(o.Note) && o.Note.Contains(cPhone)) ||
                        (!string.IsNullOrWhiteSpace(cEmail) && !string.IsNullOrWhiteSpace(o.Note) && o.Note.ToLower().Contains(cEmail)))
            .ToListAsync();

        decimal calculatedTotal = completedOrders.Any()
            ? completedOrders.Sum(o => o.FinalAmount > 0 ? o.FinalAmount : o.TotalAmount)
            : c.TotalPurchase;

        return Ok(new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, calculatedTotal, c.Status, c.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> Create(CreateCustomerRequest request)
    {
        var count = await db.Customers.CountAsync();
        var customerCode = $"KH{count + 1:D4}";

        var name = request.Name?.Trim() ?? "Khách hàng";
        var phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        var email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLower();
        var address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();

        var c = new Customer
        {
            CustomerCode = customerCode,
            Name = name,
            Phone = phone,
            Email = email,
            Address = address,
            TotalPurchase = 0,
            Status = "active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Customers.Add(c);

        // Đồng thời tạo hoặc đồng bộ vào bảng Users với Role = 'customer'
        var userEmail = !string.IsNullOrWhiteSpace(email) ? email : $"{customerCode.ToLower()}@smartstock.vn";
        var username = !string.IsNullOrWhiteSpace(phone) ? phone : customerCode.ToLower();

        var existingUser = await db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == userEmail || u.Username.ToLower() == username.ToLower());
        if (existingUser == null)
        {
            var user = new User
            {
                Username = username,
                Email = userEmail,
                FullName = name,
                Phone = phone ?? "",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                Role = "customer",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Users.Add(user);
        }

        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = c.Id },
            new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, c.TotalPurchase, c.Status, c.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> Update(int id, UpdateCustomerRequest request)
    {
        var c = await db.Customers.FindAsync(id);
        if (c == null) return NotFound(new { message = "Không tìm thấy khách hàng" });

        var oldPhone = c.Phone;
        var oldEmail = c.Email;

        c.Name = request.Name.Trim();
        c.Phone = string.IsNullOrWhiteSpace(request.Phone) ? null : request.Phone.Trim();
        c.Email = string.IsNullOrWhiteSpace(request.Email) ? null : request.Email.Trim().ToLower();
        c.Address = string.IsNullOrWhiteSpace(request.Address) ? null : request.Address.Trim();
        c.Status = request.Status;
        c.UpdatedAt = DateTime.UtcNow;

        // Đồng bộ sang bảng Users nếu có tài khoản tương ứng
        var u = await db.Users.FirstOrDefaultAsync(u =>
            (oldEmail != null && u.Email.ToLower() == oldEmail.ToLower()) ||
            (oldPhone != null && u.Phone == oldPhone) ||
            (c.Email != null && u.Email.ToLower() == c.Email.ToLower()) ||
            (c.Phone != null && u.Phone == c.Phone));

        if (u != null)
        {
            u.FullName = c.Name;
            if (!string.IsNullOrWhiteSpace(c.Phone)) u.Phone = c.Phone;
            if (!string.IsNullOrWhiteSpace(c.Email)) u.Email = c.Email;
            u.IsActive = c.Status == "active";
            u.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return Ok(new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, c.TotalPurchase, c.Status, c.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await db.Customers.FindAsync(id);
        if (c == null) return NotFound(new { message = "Không tìm thấy khách hàng" });
        c.Status = "inactive";
        c.UpdatedAt = DateTime.UtcNow;

        // Vô hiệu hóa tài khoản user tương ứng nếu có
        var u = await db.Users.FirstOrDefaultAsync(u =>
            (c.Email != null && u.Email.ToLower() == c.Email.ToLower()) ||
            (c.Phone != null && u.Phone == c.Phone));

        if (u != null)
        {
            u.IsActive = false;
            u.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/orders")]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> GetOrders(int id)
    {
        var orders = await orderService.GetCustomerOrdersAsync(id);
        return Ok(orders);
    }
}
