using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SmartStock.API.Data;
using SmartStock.API.DTOs;
using SmartStock.API.Models;

namespace SmartStock.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task<AuthResponse?> RegisterAsync(RegisterRequest request);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request);
    Task<UserDto?> GetProfileAsync(int userId);
    Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request);
}

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var login = request.Email.Trim();
        var user = await db.Users.FirstOrDefaultAsync(u =>
            (u.Email == login || u.Username == login) && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return new AuthResponse(GenerateToken(user), user.Role, user.FullName, user.Email, user.Id, user.Username, user.Phone);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        var email = request.Email.Trim().ToLower();
        var username = request.Username.Trim();
        if (await db.Users.AnyAsync(u => u.Email.ToLower() == email || u.Username.ToLower() == username.ToLower()))
            return null;

        // BẢO MẬT PHÂN QUYỀN (RBAC): Người dùng tự đăng ký công khai BẮT BUỘC có vai trò 'customer'.
        // Toàn bộ tài khoản nội bộ (Admin, Warehouse, Staff) chỉ được Admin tạo trực tiếp qua API quản lý.
        var role = "customer";

        var user = new User
        {
            Username = username,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName.Trim(),
            Phone = request.Phone?.Trim() ?? "",
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // ĐỒNG BỘ KIẾN TRÚC: Lưu đồng thời vào bảng Customers để hiển thị ngay lập tức ở tab Khách hàng
        var existingCust = await db.Customers.FirstOrDefaultAsync(c =>
            (!string.IsNullOrWhiteSpace(email) && c.Email != null && c.Email.ToLower() == email) ||
            (!string.IsNullOrWhiteSpace(user.Phone) && c.Phone != null && c.Phone == user.Phone));

        if (existingCust == null)
        {
            var customer = new Customer
            {
                CustomerCode = $"KH{user.Id:D4}",
                Name = user.FullName,
                Phone = string.IsNullOrWhiteSpace(user.Phone) ? null : user.Phone,
                Email = string.IsNullOrWhiteSpace(user.Email) ? null : user.Email,
                Address = "",
                TotalPurchase = 0,
                Status = "active",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            db.Customers.Add(customer);
            await db.SaveChangesAsync();
        }

        return new AuthResponse(GenerateToken(user), user.Role, user.FullName, user.Email, user.Id, user.Username, user.Phone);
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequest request)
    {
        var user = await db.Users.FindAsync(userId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
            return false;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return true;
    }

    public async Task<UserDto?> GetProfileAsync(int userId)
    {
        var u = await db.Users.FindAsync(userId);
        return u == null ? null : new UserDto(u.Id, u.Username, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.CreatedAt);
    }

    public async Task<UserDto?> UpdateProfileAsync(int userId, UpdateProfileRequest request)
    {
        var u = await db.Users.FindAsync(userId);
        if (u == null) return null;
        u.FullName = request.FullName;
        u.Phone = request.Phone ?? u.Phone;
        u.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return new UserDto(u.Id, u.Username, u.Email, u.FullName, u.Phone, u.Role, u.IsActive, u.CreatedAt);
    }

    private string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(ClaimTypes.Name, user.FullName)
        };
        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );
        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
