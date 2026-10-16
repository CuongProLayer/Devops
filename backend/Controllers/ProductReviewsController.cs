using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/reviews")]
[Authorize(Roles = "admin,warehouse")]
public class ProductReviewsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var reviews = await db.ProductReviews
            .AsNoTracking()
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ProductReviewDto(
                r.Id, r.CustomerName, r.CustomerEmail, r.Rating, r.Comment, r.IsApproved,
                r.CreatedAt, r.ProductId, r.Product.Name, r.Product.ProductCode))
            .ToListAsync();
        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateProductReviewRequest request)
    {
        var productExists = await db.Products.AnyAsync(p => p.Id == request.ProductId && !p.IsDeleted);
        if (!productExists) return BadRequest(new { message = "Sản phẩm không tồn tại" });

        var review = new ProductReview
        {
            CustomerName = request.CustomerName.Trim(),
            CustomerEmail = request.CustomerEmail?.Trim(),
            ProductId = request.ProductId,
            Rating = request.Rating,
            Comment = request.Comment.Trim(),
            IsApproved = false,
            CreatedAt = DateTime.UtcNow,
        };
        db.ProductReviews.Add(review);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { id = review.Id }, review.Id);
    }

    [HttpPut("{id:int}/moderation")]
    public async Task<IActionResult> Moderate(int id, ModerateProductReviewRequest request)
    {
        var review = await db.ProductReviews.FindAsync(id);
        if (review == null) return NotFound(new { message = "Không tìm thấy đánh giá" });
        review.IsApproved = request.IsApproved;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var review = await db.ProductReviews.FindAsync(id);
        if (review == null) return NotFound(new { message = "Không tìm thấy đánh giá" });
        db.ProductReviews.Remove(review);
        await db.SaveChangesAsync();
        return NoContent();
    }
}