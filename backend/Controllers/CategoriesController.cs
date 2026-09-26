using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var cats = await db.Categories
            .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.Icon, c.IsActive, c.Products.Count(p => p.Status == "active")))
            .ToListAsync();
        return Ok(cats);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await db.Categories.Include(c => c.Products).FirstOrDefaultAsync(c => c.Id == id);
        if (c == null) return NotFound();
        return Ok(new CategoryDto(c.Id, c.Name, c.Description, c.Icon, c.IsActive, c.Products.Count(p => p.Status == "active")));
    }

    [HttpPost]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Create(CreateCategoryRequest request)
    {
        var cat = new Category { Name = request.Name, Description = request.Description, Icon = request.Icon };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Icon, cat.IsActive, 0));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Update(int id, UpdateCategoryRequest request)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat == null) return NotFound();
        cat.Name = request.Name;
        cat.Description = request.Description;
        cat.Icon = request.Icon;
        cat.IsActive = request.IsActive;
        await db.SaveChangesAsync();
        return Ok(new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Icon, cat.IsActive, 0));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var cat = await db.Categories.FindAsync(id);
        if (cat == null) return NotFound();
        cat.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }
}
