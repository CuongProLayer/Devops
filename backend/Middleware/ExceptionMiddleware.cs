using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace SmartStock.API.Middleware;

/// <summary>
/// Global exception handler - bắt tất cả lỗi chưa được xử lý và trả về JSON nhất quán.
/// </summary>
public class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            KeyNotFoundException => (HttpStatusCode.NotFound, exception.Message.Contains("key") ? "Không tìm thấy tài nguyên yêu cầu" : exception.Message),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, string.IsNullOrWhiteSpace(exception.Message) ? "Không có quyền truy cập" : exception.Message),
            InvalidOperationException => (HttpStatusCode.BadRequest, exception.Message),
            ArgumentException => (HttpStatusCode.BadRequest, exception.Message),
            BadHttpRequestException => (HttpStatusCode.BadRequest, exception.Message),
            DbUpdateException => (HttpStatusCode.Conflict, "Dữ liệu bị trùng lặp hoặc vi phạm ràng buộc dữ liệu"),
            _ => (HttpStatusCode.InternalServerError, "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            statusCode = (int)statusCode,
            message,
            timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response,
            new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
