using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize]
public class SuppliersController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var query = db.Suppliers.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim();
            query = query.Where(sup => sup.Name.Contains(s)
                || (sup.Phone != null && sup.Phone.Contains(s))
                || (sup.Email != null && sup.Email.Contains(s))
                || (sup.ContactPerson != null && sup.ContactPerson.Contains(s))
                || sup.SupplierCode.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(sup => sup.Status == status);
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(s => new SupplierDto(s.Id, s.SupplierCode, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.Status, s.CreatedAt))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        return Ok(new PagedResult<SupplierDto>(items, total, page, pageSize, totalPages));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var s = await db.Suppliers.FindAsync(id);
        if (s == null) return NotFound(new { message = "Không tìm thấy nhà cung cấp" });
        return Ok(new SupplierDto(s.Id, s.SupplierCode, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.Status, s.CreatedAt));
    }

    [HttpGet("{id}/imports")]
    public async Task<IActionResult> GetImports(int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;

        var supplierExists = await db.Suppliers.AnyAsync(s => s.Id == id);
        if (!supplierExists)
            return NotFound(new { message = "Không tìm thấy nhà cung cấp" });

        var query = db.ImportReceipts
            .Include(i => i.Supplier)
            .Include(i => i.Employee)
            .Include(i => i.ImportDetails).ThenInclude(d => d.Product)
            .Where(i => i.SupplierId == id);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(i => i.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => new ImportReceiptDto(
                i.Id,
                i.ReceiptCode,
                i.SupplierId,
                i.Supplier.Name,
                i.EmployeeId,
                i.Employee.FullName,
                i.TotalAmount,
                i.Note,
                i.Status,
                i.CreatedAt,
                i.ImportDetails.Select(d => new ImportDetailDto(d.Id, d.ProductId, d.Product.Name, d.Quantity, d.ImportPrice, d.Total)).ToList()
            ))
            .ToListAsync();

        var totalPages = (int)Math.Ceiling((double)total / pageSize);
        return Ok(new PagedResult<ImportReceiptDto>(items, total, page, pageSize, totalPages));
    }

    [HttpPost]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Create(CreateSupplierRequest request)
    {
        var count = await db.Suppliers.CountAsync();
        var s = new Supplier
        {
            SupplierCode = $"SUP{count + 1:D3}",
            Name = request.Name,
            Phone = request.Phone,
            Email = request.Email,
            Address = request.Address,
            ContactPerson = request.ContactPerson,
            Status = "active"
        };
        db.Suppliers.Add(s);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = s.Id },
            new SupplierDto(s.Id, s.SupplierCode, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.Status, s.CreatedAt));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Update(int id, UpdateSupplierRequest request)
    {
        var s = await db.Suppliers.FindAsync(id);
        if (s == null) return NotFound(new { message = "Không tìm thấy nhà cung cấp" });
        s.Name = request.Name;
        s.Phone = request.Phone;
        s.Email = request.Email;
        s.Address = request.Address;
        s.ContactPerson = request.ContactPerson;
        s.Status = request.Status;
        s.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return Ok(new SupplierDto(s.Id, s.SupplierCode, s.Name, s.Phone, s.Email, s.Address, s.ContactPerson, s.Status, s.CreatedAt));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var s = await db.Suppliers.FindAsync(id);
        if (s == null) return NotFound(new { message = "Không tìm thấy nhà cung cấp" });
        s.Status = "inactive";
        s.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
