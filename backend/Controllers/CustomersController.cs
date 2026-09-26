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
    [HttpGet]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Customers.AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(c => c.Name.Contains(s) || (c.Phone != null && c.Phone.Contains(s)) || c.CustomerCode.Contains(s));
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(c => new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, c.TotalPurchase, c.Status, c.CreatedAt))
            .ToListAsync();

        return Ok(new PagedResult<CustomerDto>(items, total, page, pageSize, (int)Math.Ceiling((double)total / pageSize)));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "admin,warehouse,staff")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await db.Customers.FindAsync(id);
        if (c == null) return NotFound(new { message = "Không tìm thấy khách hàng" });
        return Ok(new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, c.TotalPurchase, c.Status, c.CreatedAt));
    }

    [HttpPost]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Create(CreateCustomerRequest request)
    {
        var count = await db.Customers.CountAsync();
        var c = new Customer
        {
            CustomerCode = $"CUS{count + 1:D4}",
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            Status = "active"
        };
        db.Customers.Add(c);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = c.Id },
            new CustomerDto(c.Id, c.CustomerCode, c.Name, c.Phone, c.Email, c.Address, c.TotalPurchase, c.Status, c.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,staff")]
    public async Task<IActionResult> Update(int id, UpdateCustomerRequest request)
    {
        var c = await db.Customers.FindAsync(id);
        if (c == null) return NotFound(new { message = "Không tìm thấy khách hàng" });
        c.Name = request.Name;
        c.Phone = request.Phone;
        c.Email = request.Email;
        c.Address = request.Address;
        c.Status = request.Status;
        c.UpdatedAt = DateTime.UtcNow;
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
