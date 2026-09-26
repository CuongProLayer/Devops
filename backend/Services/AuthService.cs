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
    Task<ForgotPasswordResponse?> ForgotPasswordAsync(ForgotPasswordRequest request);
}

public class AuthService(AppDbContext db, IConfiguration config) : IAuthService
{
    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        return new AuthResponse(GenerateToken(user), user.Role, user.FullName, user.Email, user.Id);
    }

    public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email || u.Username == request.Username))
            return null;

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Phone = request.Phone ?? "",
            Role = request.Role
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return new AuthResponse(GenerateToken(user), user.Role, user.FullName, user.Email, user.Id);
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

    public async Task<ForgotPasswordResponse?> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email && u.IsActive);
        if (user == null)
            return null;

        var tempPassword = $"SS@{Random.Shared.Next(100000, 999999)}";
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return new ForgotPasswordResponse(
            "Mật khẩu mới đã được tạo thành công. Vui lòng dùng mật khẩu tạm để đăng nhập và đổi mật khẩu mới.",
            tempPassword
        );
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
