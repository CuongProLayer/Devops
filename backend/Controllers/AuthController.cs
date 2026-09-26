using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartStock.API.DTOs;
using SmartStock.API.Services;

namespace SmartStock.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        if (result == null) return Unauthorized(new { message = "Email hoặc mật khẩu không đúng" });
        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        if (result == null) return BadRequest(new { message = "Email hoặc username đã tồn tại" });
        return Ok(result);
    }

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await authService.ChangePasswordAsync(userId, request);
        if (!result) return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });
        return Ok(new { message = "Đổi mật khẩu thành công" });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await authService.GetProfileAsync(userId);
        if (result == null) return NotFound(new { message = "Không tìm thấy thông tin người dùng" });
        return Ok(result);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await authService.UpdateProfileAsync(userId, request);
        if (result == null) return NotFound(new { message = "Không tìm thấy thông tin người dùng" });
        return Ok(result);
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request)
    {
        var result = await authService.ForgotPasswordAsync(request);
        if (result == null) return NotFound(new { message = "Không tìm thấy tài khoản với email này hoặc tài khoản đã bị khóa" });
        return Ok(result);
    }

    /// <summary>
    /// Logout: JWT là stateless nên client chỉ cần xoá token.
    /// Endpoint này trả về 200 để frontend biết đã logout thành công.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        return Ok(new { message = "Đăng xuất thành công" });
    }
}
