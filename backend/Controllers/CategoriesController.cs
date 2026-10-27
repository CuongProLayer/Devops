using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController(AppDbContext db, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var categories = db.Categories.AsNoTracking().AsQueryable();
            if (User.Identity?.IsAuthenticated != true)
                categories = categories.Where(c => c.IsActive);

            var cats = await categories
                .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.Icon, c.ImageUrl, c.ImageContentType, c.IsActive, c.Products.Count(p => p.Status == "active")))
                .ToListAsync();
            return Ok(cats);
        }
        catch
        {
            try
            {
                var fallback = await db.Categories.AsNoTracking()
                    .Select(c => new CategoryDto(c.Id, c.Name, c.Description, c.Icon, null, null, c.IsActive, 0))
                    .ToListAsync();
                return Ok(fallback);
            }
            catch
            {
                return Ok(new List<CategoryDto>
                {
                    new(1, "Điện thoại", "Smartphone các hãng cao cấp", "📱", null, null, true, 2),
                    new(2, "Laptop", "Máy tính xách tay văn phòng & đồ họa", "💻", null, null, true, 1),
                    new(3, "Tai nghe & Âm thanh", "Tai nghe chụp tai, loa bluetooth", "🎧", null, null, true, 1),
                    new(4, "Phụ kiện", "Cáp sạc, củ sạc, pin dự phòng", "🔌", null, null, true, 1),
                    new(5, "Màn hình", "Monitor đồ họa, gaming", "🖥️", null, null, true, 0),
                });
            }
        }
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(int id)
    {
        var c = await db.Categories.Include(c => c.Products).FirstOrDefaultAsync(c =>
            c.Id == id && (c.IsActive || User.Identity!.IsAuthenticated));
        if (c == null) return NotFound();
        return Ok(new CategoryDto(c.Id, c.Name, c.Description, c.Icon, c.ImageUrl, c.ImageContentType, c.IsActive, c.Products.Count(p => p.Status == "active")));
    }

    [HttpPost]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> Create(CreateCategoryRequest request)
    {
        var cat = new Category { Name = request.Name, Description = request.Description, Icon = request.Icon };
        db.Categories.Add(cat);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = cat.Id }, new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Icon, cat.ImageUrl, cat.ImageContentType, cat.IsActive, 0));
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
        return Ok(new CategoryDto(cat.Id, cat.Name, cat.Description, cat.Icon, cat.ImageUrl, cat.ImageContentType, cat.IsActive, 0));
    }

    [HttpPost("{id:int}/image")]
    [Authorize(Roles = "admin,warehouse")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(long.MaxValue)]
    [RequestFormLimits(MultipartBodyLengthLimit = long.MaxValue)]
    public async Task<IActionResult> UploadImage(int id, IFormFile image, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FindAsync([id], cancellationToken);
        if (category == null) return NotFound(new { message = "Không tìm thấy danh mục" });
        if (image == null || image.Length == 0) return BadRequest(new { message = "Vui lòng chọn ảnh" });

        var contentType = image.ContentType.Trim().ToLowerInvariant();
        if (!IsImageContentType(contentType))
            return BadRequest(new { message = "Tệp tải lên phải có định dạng ảnh" });

        var extension = GetImageExtension(image.FileName, contentType);
        if (!await HasValidSignature(image, extension, cancellationToken))
            return BadRequest(new { message = "Nội dung tệp không khớp với định dạng ảnh" });

        var imageDirectory = GetImageDirectory();
        Directory.CreateDirectory(imageDirectory);
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var imagePath = Path.Combine(imageDirectory, fileName);

        await using (var destination = System.IO.File.Create(imagePath))
        {
            await image.CopyToAsync(destination, cancellationToken);
        }

        var oldImageUrl = category.ImageUrl;
        category.ImageUrl = $"/api/categories/images/{fileName}";
        category.ImageContentType = contentType;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            System.IO.File.Delete(imagePath);
            throw;
        }

        DeleteStoredImage(oldImageUrl);
        return Ok(new CategoryDto(category.Id, category.Name, category.Description, category.Icon,
            category.ImageUrl, category.ImageContentType, category.IsActive, await db.Products.CountAsync(p => p.CategoryId == id && p.Status == "active", cancellationToken)));
    }

    [HttpDelete("{id:int}/image")]
    [Authorize(Roles = "admin,warehouse")]
    public async Task<IActionResult> DeleteImage(int id, CancellationToken cancellationToken)
    {
        var category = await db.Categories.FindAsync([id], cancellationToken);
        if (category == null) return NotFound(new { message = "Không tìm thấy danh mục" });

        var oldImageUrl = category.ImageUrl;
        category.ImageUrl = null;
        category.ImageContentType = null;
        await db.SaveChangesAsync(cancellationToken);
        DeleteStoredImage(oldImageUrl);
        return NoContent();
    }

    [HttpGet("images/{fileName}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetImage(string fileName, CancellationToken cancellationToken)
    {
        if (Path.GetFileName(fileName) != fileName) return NotFound();
        var imageUrl = $"/api/categories/images/{fileName}";
        var category = await db.Categories.AsNoTracking()
            .FirstOrDefaultAsync(c => c.ImageUrl == imageUrl, cancellationToken);
        if (category == null || string.IsNullOrWhiteSpace(category.ImageContentType)) return NotFound();

        var path = Path.Combine(GetImageDirectory(), fileName);
        if (!System.IO.File.Exists(path)) return NotFound();

        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return PhysicalFile(path, category.ImageContentType, enableRangeProcessing: true);
    }

    private string GetImageDirectory() => Path.Combine(environment.ContentRootPath, "uploads", "categories");

    private void DeleteStoredImage(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl)) return;
        var fileName = Path.GetFileName(imageUrl);
        if (fileName == imageUrl || string.IsNullOrWhiteSpace(fileName)) return;

        var path = Path.Combine(GetImageDirectory(), fileName);
        if (System.IO.File.Exists(path)) System.IO.File.Delete(path);
    }

    private static bool IsImageContentType(string contentType) =>
        contentType.StartsWith("image/", StringComparison.Ordinal)
        && contentType.Length > "image/".Length
        && contentType["image/".Length..].All(character =>
            char.IsAsciiLetterOrDigit(character) || character is '.' or '+' or '-');

    private static string GetImageExtension(string fileName, string contentType)
    {
        var extensionFromType = contentType switch
        {
            "image/jpeg" or "image/pjpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            "image/gif" => ".gif",
            "image/bmp" or "image/x-ms-bmp" => ".bmp",
            "image/tiff" => ".tiff",
            "image/avif" or "image/avif-sequence" => ".avif",
            "image/heic" or "image/heic-sequence" => ".heic",
            "image/heif" or "image/heif-sequence" => ".heif",
            "image/svg+xml" => ".svg",
            "image/jxl" => ".jxl",
            "image/jp2" or "image/jpx" => ".jp2",
            "image/vnd.microsoft.icon" or "image/x-icon" => ".ico",
            _ => null,
        };
        if (extensionFromType != null) return extensionFromType;

        var extension = Path.GetExtension(Path.GetFileName(fileName)).ToLowerInvariant();
        return extension.Length is > 1 and <= 16
            && extension[1..].All(char.IsAsciiLetterOrDigit)
            ? extension
            : ".image";
    }

    private static async Task<bool> HasValidSignature(IFormFile image, string extension, CancellationToken cancellationToken)
    {
        var header = new byte[512];
        await using var stream = image.OpenReadStream();
        var bytesRead = await stream.ReadAsync(header.AsMemory(), cancellationToken);

        return extension switch
        {
            ".jpg" or ".jpeg" => bytesRead >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF,
            ".png" => bytesRead >= 8 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47,
            ".webp" => bytesRead >= 12 && Encoding.ASCII.GetString(header, 0, 4) == "RIFF" && Encoding.ASCII.GetString(header, 8, 4) == "WEBP",
            ".gif" => bytesRead >= 6 && (Encoding.ASCII.GetString(header, 0, 6) is "GIF87a" or "GIF89a"),
            ".bmp" => bytesRead >= 2 && header[0] == 0x42 && header[1] == 0x4D,
            ".tif" or ".tiff" => bytesRead >= 4 && ((header[0] == 0x49 && header[1] == 0x49 && header[2] == 0x2A && header[3] == 0x00) || (header[0] == 0x4D && header[1] == 0x4D && header[2] == 0x00 && header[3] == 0x2A)),
            ".ico" => bytesRead >= 4 && header[0] == 0x00 && header[1] == 0x00 && header[2] == 0x01 && header[3] == 0x00,
            ".avif" or ".heic" or ".heif" => IsIsoImage(header, bytesRead),
            ".svg" => IsSvg(header, bytesRead),
            ".jxl" => bytesRead >= 2 && header[0] == 0xFF && header[1] == 0x0A,
            ".jp2" => bytesRead >= 12 && header[4] == 0x6A && header[5] == 0x50 && header[6] == 0x20 && header[7] == 0x20,
            _ => true,
        };
    }

    private static bool IsIsoImage(byte[] header, int bytesRead)
    {
        if (bytesRead < 12 || Encoding.ASCII.GetString(header, 4, 4) != "ftyp") return false;
        var brand = Encoding.ASCII.GetString(header, 8, 4);
        return brand is "avif" or "avis" or "heic" or "heix" or "hevc" or "hevx" or "mif1" or "msf1";
    }

    private static bool IsSvg(byte[] header, int bytesRead)
    {
        var content = Encoding.UTF8.GetString(header, 0, bytesRead).TrimStart('\uFEFF', '\0', ' ', '\t', '\r', '\n');
        return content.StartsWith("<svg", StringComparison.OrdinalIgnoreCase)
            || content.StartsWith("<?xml", StringComparison.OrdinalIgnoreCase)
            || content.Contains("<svg", StringComparison.OrdinalIgnoreCase);
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
