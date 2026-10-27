using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/promotions")]
[Authorize(Roles = "admin,warehouse")]
public class PromotionsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var promotions = await db.Promotions
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToDto(p))
            .ToListAsync();
        return Ok(promotions);
    }

    [HttpPost]
    public async Task<IActionResult> Create(SavePromotionRequest request)
    {
        if (!IsValid(request, out var error)) return BadRequest(new { message = error });
        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Promotions.AnyAsync(p => p.Code == code))
            return Conflict(new { message = "Mã khuyến mãi đã tồn tại" });

        var promotion = new Promotion();
        Apply(promotion, request, code);
        db.Promotions.Add(promotion);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = promotion.Id }, ToDto(promotion));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, SavePromotionRequest request)
    {
        if (!IsValid(request, out var error)) return BadRequest(new { message = error });
        var promotion = await db.Promotions.FindAsync(id);
        if (promotion == null) return NotFound(new { message = "Không tìm thấy khuyến mãi" });

        var code = request.Code.Trim().ToUpperInvariant();
        if (await db.Promotions.AnyAsync(p => p.Id != id && p.Code == code))
            return Conflict(new { message = "Mã khuyến mãi đã tồn tại" });

        Apply(promotion, request, code);
        await db.SaveChangesAsync();
        return Ok(ToDto(promotion));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var promotion = await db.Promotions.FindAsync(id);
        if (promotion == null) return NotFound(new { message = "Không tìm thấy khuyến mãi" });
        db.Promotions.Remove(promotion);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static bool IsValid(SavePromotionRequest request, out string error)
    {
        if (request.StartsAt >= request.EndsAt)
        {
            error = "Ngày kết thúc phải sau ngày bắt đầu";
            return false;
        }

        if (request.DiscountType == "percent" && request.DiscountValue > 100)
        {
            error = "Mức giảm theo phần trăm không được vượt quá 100%";
            return false;
        }

        error = string.Empty;
        return true;
    }

    private static void Apply(Promotion promotion, SavePromotionRequest request, string code)
    {
        promotion.Name = request.Name.Trim();
        promotion.Code = code;
        promotion.Description = request.Description?.Trim();
        promotion.DiscountType = request.DiscountType;
        promotion.DiscountValue = request.DiscountValue;
        promotion.StartsAt = request.StartsAt;
        promotion.EndsAt = request.EndsAt;
        promotion.IsActive = request.IsActive;
        promotion.UpdatedAt = DateTime.UtcNow;
    }

    private static PromotionDto ToDto(Promotion promotion) => new(
        promotion.Id, promotion.Name, promotion.Code, promotion.Description, promotion.DiscountType,
        promotion.DiscountValue, promotion.StartsAt, promotion.EndsAt, promotion.IsActive,
        promotion.CreatedAt, promotion.UpdatedAt);
}