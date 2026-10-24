using SmartStock.API.Models;

namespace SmartStock.API.Data;

/// <summary>
/// Tạo tài khoản mẫu khi khởi động (chỉ chạy nếu chưa có user nào trong DB)
/// </summary>
public static class DbSeeder
{
    public static async Task SeedUsersAsync(AppDbContext db)
    {
        if (db.Users.Any()) return; // Đã có dữ liệu → bỏ qua

        var users = new List<User>
        {
            // ─── ADMIN: toàn quyền ───────────────────────────────────────────
            new()
            {
                Username   = "admin",
                Email      = "admin@smartstock.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                FullName   = "Quản trị viên",
                Phone      = "0901000001",
                Role       = "admin",
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
                UpdatedAt  = DateTime.UtcNow,
            },

            // ─── WAREHOUSE: quản lý kho ──────────────────────────────────────
            // Quyền: sản phẩm, danh mục, nhà cung cấp, tồn kho, nhập hàng, đánh giá, khuyến mãi
            new()
            {
                Username   = "warehouse",
                Email      = "warehouse@smartstock.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Warehouse@123"),
                FullName   = "Thủ kho Nguyễn Văn A",
                Phone      = "0901000002",
                Role       = "warehouse",
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
                UpdatedAt  = DateTime.UtcNow,
            },

            // ─── STAFF: nhân viên bán hàng ───────────────────────────────────
            // Quyền: đơn hàng, khách hàng, thanh toán, xem sản phẩm
            new()
            {
                Username   = "staff",
                Email      = "staff@smartstock.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                FullName   = "Nhân viên Trần Thị B",
                Phone      = "0901000003",
                Role       = "staff",
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
                UpdatedAt  = DateTime.UtcNow,
            },

            // ─── STAFF 2: nhân viên thứ 2 ───────────────────────────────────
            new()
            {
                Username   = "staff2",
                Email      = "staff2@smartstock.vn",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Staff@123"),
                FullName   = "Nhân viên Lê Văn C",
                Phone      = "0901000004",
                Role       = "staff",
                IsActive   = true,
                CreatedAt  = DateTime.UtcNow,
                UpdatedAt  = DateTime.UtcNow,
            },
        };

        await db.Users.AddRangeAsync(users);
        await db.SaveChangesAsync();
    }
}
