using Microsoft.EntityFrameworkCore;
using SmartStock.API.Models;

namespace SmartStock.API.Data;

public static class DbSeeder
{
    public static async Task SeedUsersAsync(AppDbContext db)
    {
        if (await db.Users.AnyAsync()) return;

        var users = new List<User>
        {
            // ─── ADMIN: quản trị toàn quyền ──────────────────────────────────
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

    public static async Task SeedProductsAsync(AppDbContext db)
    {
        // 1. Đảm bảo đầy đủ 6 danh mục chuẩn
        var existingCategories = db.Categories.ToList();

        Category EnsureCategory(string name, string desc, string icon)
        {
            var cat = existingCategories.FirstOrDefault(c => c.Name.Trim().ToLower() == name.Trim().ToLower() || (c.Name.Contains(name) && !c.Name.Contains("&")));
            if (cat == null)
            {
                cat = new Category
                {
                    Name = name,
                    Description = desc,
                    Icon = icon,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                db.Categories.Add(cat);
                db.SaveChanges();
                existingCategories = db.Categories.ToList();
            }
            return cat;
        }

        var catPhone = EnsureCategory("Điện thoại", "Điện thoại thông minh, flagship cao cấp mới nhất", "📱");
        var catLaptop = EnsureCategory("Laptop", "Laptop đồ họa, văn phòng mỏng nhẹ, gaming hiệu năng cao", "💻");
        var catTablet = EnsureCategory("Máy tính bảng", "iPad, Galaxy Tab, tablet đồ họa màn hình sắc nét", "📟");
        var catAudio = EnsureCategory("Tai nghe & Âm thanh", "Tai nghe chống ồn ANC, loa bluetooth, âm thanh Hi-Res", "🎧");
        var catMonitor = EnsureCategory("Màn hình", "Màn hình đồ họa 4K, màn hình gaming tần số quét cao", "🖥️");
        var catAccessory = EnsureCategory("Phụ kiện & Gaming Gear", "Củ sạc, pin dự phòng, chuột, bàn phím cơ, cáp kết nối", "⌨️");

        // 2. Danh mục 120 sản phẩm công nghệ thực tế (mỗi danh mục đúng 20 sản phẩm)
        var productsToSeed = new (string Code, string Name, string Desc, decimal Price, decimal Cost, int Qty, int Min, int CatId, string Img, string Unit)[]
        {
            // ==========================================
            // DANH MỤC 1: ĐIỆN THOẠI (20 SẢN PHẨM)
            // ==========================================
            ("PRD-IP16PM-256", "iPhone 16 Pro Max 256GB", "Titan Sa Mạc, Chip A18 Pro, Camera Control 48MP, Zoom quang 5X", 34990000m, 29000000m, 35, 5, catPhone.Id, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16PM-512", "iPhone 16 Pro Max 512GB", "Titan Tự Nhiên, Quay 4K 120fps Dolby Vision, Pin 33 tiếng đỉnh cao", 40990000m, 34500000m, 20, 5, catPhone.Id, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16PM-1TB", "iPhone 16 Pro Max 1TB", "Titan Đen, Dung lượng tối đa, Chơi game AAA Ray Tracing phần cứng", 46990000m, 39500000m, 15, 3, catPhone.Id, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16P-128", "iPhone 16 Pro 128GB", "Màn hình 6.3 inch 120Hz ProMotion, Viền màn hình mỏng nhất thế giới", 28990000m, 24200000m, 28, 5, catPhone.Id, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16P-256", "iPhone 16 Pro 256GB", "Titan Trắng, Khung Titanium cấp 5 siêu nhẹ bền, Nút Camera Control", 31990000m, 26800000m, 25, 5, catPhone.Id, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16-128", "iPhone 16 128GB", "Màu Hồng Pastel, Nút tác vụ Action Button, Chip A18 thế hệ mới", 22490000m, 18500000m, 30, 5, catPhone.Id, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP16PLUS-256", "iPhone 16 Plus 256GB", "Màn hình 6.7 inch siêu nét, Thời lượng pin xem video lên đến 27h", 25990000m, 21800000m, 22, 4, catPhone.Id, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=800&q=80", "cái"),
            ("IP15PM-256", "iPhone 15 Pro Max 256GB", "iPhone 15 Pro Max chính hãng VN/A Titanium Xanh, Camera tiềm vọng 5x", 29990000m, 25000000m, 18, 5, catPhone.Id, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP15P-128", "iPhone 15 Plus 128GB", "Màn hình 6.7 inch Dynamic Island, Cổng USB-C, Camera chính 48MP", 22490000m, 18500000m, 14, 3, catPhone.Id, "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IP14-128", "iPhone 14 128GB", "Thiết kế vuông vắn bền bỉ, Màn hình Super Retina XDR, Pin bền cả ngày", 16990000m, 13800000m, 25, 5, catPhone.Id, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", "cái"),
            ("SS-S24U-512", "Samsung Galaxy S24 Ultra 512GB", "Galaxy AI quyền năng, bút S-Pen, viền Titanium, Camera 200MP Zoom 100X", 25990000m, 21000000m, 15, 4, catPhone.Id, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-S24U-256", "Samsung Galaxy S24 Ultra 256GB", "Màn hình phẳng Dynamic AMOLED 2X 2600 nits, Kính cường lực Gorilla Armor", 27990000m, 23200000m, 20, 5, catPhone.Id, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-S24P-256", "Samsung Galaxy S24 Plus 256GB", "RAM 12GB, Màn hình 2K+ QHD+, Khung nhôm Armor Aluminum siêu nhẹ", 21490000m, 17500000m, 16, 4, catPhone.Id, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ZFOLD6-256", "Samsung Galaxy Z Fold6 256GB", "Thiết kế gập phẳng mỏng nhẹ không kẽ hở, Chip Snapdragon 8 Gen 3 for Galaxy", 41990000m, 35000000m, 10, 2, catPhone.Id, "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ZFLIP6-256", "Samsung Galaxy Z Flip6 256GB", "Màn hình phụ FlexWindow 3.4 inch, Camera 50MP nâng cấp, Pin 4000mAh", 26990000m, 22000000m, 15, 3, catPhone.Id, "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MI14U-512", "Xiaomi 14 Ultra 5G 512GB", "Camera Leica 1-inch quad lens, Snapdragon 8 Gen 3, Màn hình cong 2K C8", 24990000m, 20500000m, 15, 3, catPhone.Id, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MI14T-PRO", "Xiaomi 14T Pro 512GB", "Màn hình AMOLED 144Hz AI, Sạc siêu tốc HyperCharge 120W, Camera Leica Summilux", 16490000m, 13500000m, 24, 5, catPhone.Id, "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-OPPO-N3F", "OPPO Find N3 Flip", "Màn hình gập dọc cao cấp, 3 camera chân dung Hasselblad, Bản lề tàng hình", 17990000m, 14500000m, 10, 2, catPhone.Id, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-OPPO-X7U", "OPPO Find X7 Ultra", "Ống kính tiềm vọng kép đầu tiên thế giới, Cảm biến Sony 1-inch LYT-900", 23990000m, 19800000m, 12, 3, catPhone.Id, "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-OPPO-R12", "OPPO Reno12 5G", "Thiết kế siêu mỏng nhẹ, AI Chỉnh ảnh xóa vật thể thông minh, Kháng nước IP65", 12490000m, 9800000m, 30, 5, catPhone.Id, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80", "cái"),

            // ==========================================
            // DANH MỤC 2: LAPTOP (20 SẢN PHẨM)
            // ==========================================
            ("MBA-M3-15", "MacBook Air M3 15 inch", "MacBook Air chip M3 màn Liquid Retina 15.3 inch, 16GB RAM, 512GB SSD", 32490000m, 27000000m, 18, 3, catLaptop.Id, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MBA-M3-13", "MacBook Air M3 13 inch", "Siêu mỏng nhẹ 1.24kg, Pin 18 tiếng, Màu Midnight sang trọng, 8-core CPU", 26990000m, 22500000m, 25, 4, catLaptop.Id, "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MBP14-M3P", "MacBook Pro 14 M3 Pro", "Chip M3 Pro 18GB RAM 512GB SSD Space Black, Màn hình Liquid Retina XDR", 48990000m, 42000000m, 12, 2, catLaptop.Id, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MBP16-M3M", "MacBook Pro 16 M3 Max", "Chip M3 Max 36GB RAM 1TB SSD Liquid Retina XDR 120Hz, Hiệu năng đồ họa đỉnh", 86990000m, 75000000m, 6, 1, catLaptop.Id, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MBP14-M3", "MacBook Pro 14 M3", "Màn hình ProMotion 120Hz, Độ sáng 1600 nits đỉnh cao, Hệ thống tản nhiệt chủ động", 38990000m, 33000000m, 15, 3, catLaptop.Id, "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ASUS-G16", "ASUS ROG Strix G16 Gaming", "Core i7-13650HX, RTX 4060, Màn hình 16 inch 165Hz chuẩn màu 100% sRGB", 39990000m, 33500000m, 14, 2, catLaptop.Id, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ASUS-G14", "ASUS ROG Zephyrus G14", "Ryzen 9 8945HS, RTX 4070, Màn hình ROG Nebula OLED 3K 120Hz mỏng nhẹ 1.5kg", 52990000m, 45000000m, 8, 2, catLaptop.Id, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ASUS-ZEN14", "ASUS Zenbook 14 OLED", "Intel Core Ultra 7 155H, Màn hình OLED 3K 120Hz, Nặng chỉ 1.2kg vỏ nhôm gốm", 28990000m, 24000000m, 18, 3, catLaptop.Id, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-DELL-XPS13", "Dell XPS 13 Plus", "Thiết kế tương lai viền siêu mỏng, phím cảm ứng ẩn, Màn 3.5K OLED InfinityEdge", 36990000m, 31000000m, 12, 2, catLaptop.Id, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-DELL-XPS15", "Dell XPS 15 9530", "Core i7-13700H, RTX 4050, Màn hình 3.5K OLED Touch, Vỏ nhôm CNC sợi carbon", 45990000m, 39000000m, 8, 2, catLaptop.Id, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-DELL-INSP15", "Dell Inspiron 15 3520", "Core i5-1235U, 16GB RAM, SSD 512GB, Màn hình 120Hz chống chói văn phòng", 15490000m, 12800000m, 30, 5, catLaptop.Id, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LENOVO-X1C", "Lenovo ThinkPad X1 Carbon Gen 11", "Laptop doanh nhân siêu bền nhẹ 1.12kg, Bàn phím gõ đỉnh cao số 1 thế giới", 38500000m, 32000000m, 12, 3, catLaptop.Id, "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LENOVO-LEG5", "Lenovo Legion 5 Pro 16", "Ryzen 7 7745HX, RTX 4060, Màn hình 16 inch 240Hz 2.5K, Tản nhiệt ColdFront 5.0", 35990000m, 30000000m, 15, 3, catLaptop.Id, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LENOVO-YOGA", "Lenovo Yoga Slim 7 Carbon", "Khung sợi carbon siêu nhẹ 968g, Màn 2.8K OLED PureSight 90Hz, Âm thanh Dolby Atmos", 27990000m, 23500000m, 14, 3, catLaptop.Id, "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-HP-SPEC14", "HP Spectre x360 14 2-in-1", "Intel Core Ultra 7 155H, Màn OLED 2.8K gập xoay 360 độ, Bút cảm ứng nghiêng Tilt Pen", 41990000m, 35500000m, 10, 2, catLaptop.Id, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-HP-ENVI14", "HP Envy 14 Studio", "Core i7, RTX 3050, Thiết kế nhôm nguyên khối sáng tạo nội dung, Chuẩn màu 100% DCI-P3", 31490000m, 26500000m, 12, 2, catLaptop.Id, "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-HP-PAV15", "HP Pavilion 15", "Core i5, 16GB RAM, Màu Bạc sang trọng, Mỏng nhẹ học tập văn phòng bền bỉ", 16290000m, 13500000m, 25, 4, catLaptop.Id, "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ACER-PRED", "Acer Predator Helios Neo 16", "Core i7-14700HX, RTX 4060, Màn 165Hz chuẩn sRGB, Quạt AeroBlade 3D thế hệ 5", 37990000m, 32000000m, 12, 2, catLaptop.Id, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ACER-SWIFT", "Acer Swift Go 14 OLED", "Intel Core Ultra 5, Màn 2.8K 90Hz OLED rực rỡ, Trọng lượng nhẹ 1.3kg di động", 21990000m, 18000000m, 20, 3, catLaptop.Id, "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MSI-KATANA", "MSI Katana 15 B13V", "Core i7-13620H, RTX 4060, Bàn phím LED RGB 4 vùng phím xuyên led WASD", 29990000m, 25000000m, 16, 3, catLaptop.Id, "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80", "cái"),

            // ==========================================
            // DANH MỤC 3: MÁY TÍNH BẢNG (20 SẢN PHẨM)
            // ==========================================
            ("IPAD-M4-11", "iPad Pro M4 11 inch", "Màn hình OLED Tandem Ultra Retina XDR siêu sáng, Chip M4 đỉnh cao đồ họa", 21990000m, 18000000m, 20, 3, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-M4-13", "iPad Pro M4 13 inch 256GB", "Độ mỏng kỷ lục 5.1mm, Hỗ trợ Apple Pencil Pro bóp xoay và Magic Keyboard mới", 34990000m, 29500000m, 12, 2, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-AIR6-11", "iPad Air 6 M2 11 inch", "Hiệu năng chip M2, Màn hình Liquid Retina chống chói, Màu Tím thời thượng", 16490000m, 13500000m, 24, 4, catTablet.Id, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-AIR6-13", "iPad Air 6 M2 13 inch", "Màn hình lớn 13 inch lần đầu tiên trên dòng Air, Không gian đa nhiệm rộng rãi", 21990000m, 18200000m, 15, 3, catTablet.Id, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-GEN10", "iPad Gen 10 10.9 inch", "Chip A14 Bionic, Cổng Type-C tiện lợi, Thiết kế viền mỏng đều 4 màu cá tính", 9490000m, 7800000m, 35, 5, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-MINI7", "iPad Mini 7 A17 Pro", "Chip A17 Pro hỗ trợ Apple Intelligence, Màn hình 8.3 inch cầm vừa 1 tay", 13990000m, 11500000m, 20, 3, catTablet.Id, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-IPAD-GEN9", "iPad Gen 9 10.2 inch", "Giá tốt nhất hệ sinh thái Apple, Phục vụ học tập online, Camera trước góc siêu rộng", 6990000m, 5600000m, 40, 6, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-TABS9U", "Samsung Galaxy Tab S9 Ultra 5G", "Màn hình khổng lồ 14.6 inch AMOLED 120Hz, Kèm S-Pen, Chống nước bụi IP68", 24990000m, 20500000m, 10, 2, catTablet.Id, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-TABS9P", "Samsung Galaxy Tab S9 Plus", "Màn hình 12.4 inch chống nước IP68, Snapdragon 8 Gen 2, Đa nhiệm Samsung DeX", 19490000m, 16000000m, 15, 3, catTablet.Id, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-TABS9", "Samsung Galaxy Tab S9 11 inch", "Dynamic AMOLED 2X rực rỡ, Loa Quad AKG Dolby Atmos, Tản nhiệt buồng hơi 2 chiều", 15990000m, 13000000m, 18, 3, catTablet.Id, "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-TABFE", "Samsung Galaxy Tab S9 FE", "Kháng nước IP68, Pin 8000mAh bền bỉ, Bút S-Pen kim loại vẽ viết mượt mà", 9490000m, 7600000m, 25, 4, catTablet.Id, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-TABA9P", "Samsung Galaxy Tab A9 Plus 5G", "Màn hình 11 inch 90Hz, 4 loa vòm công nghệ cao, Hỗ trợ chia 3 cửa sổ thông minh", 5490000m, 4200000m, 30, 5, catTablet.Id, "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MI-PAD6SP", "Xiaomi Pad 6S Pro 12.4", "Màn hình 3K 144Hz, Snapdragon 8 Gen 2, Sạc siêu nhanh 120W đầy pin trong 35 phút", 12990000m, 10500000m, 20, 3, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MI-PAD6", "Xiaomi Pad 6", "Snapdragon 870, Khung kim loại unibody siêu mỏng, Màn 144Hz WQHD+ xem phim cực nét", 7690000m, 6200000m, 25, 4, catTablet.Id, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MI-REDMIPAD", "Redmi Pad Pro 12.1 inch", "Pin trâu 10.000mAh, Màn 2.5K 120Hz đạt chuẩn bảo vệ mắt Rheinland, 4 loa stereo", 6490000m, 5100000m, 28, 5, catTablet.Id, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LEN-TABP12", "Lenovo Tab P12", "Màn hình 3K 12.7 inch, 4 loa JBL chuyên nghiệp, Kèm bút cảm ứng Tab Pen Plus", 8990000m, 7200000m, 20, 3, catTablet.Id, "https://images.unsplash.com/photo-1589739900243-4b52cd9b104e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LEN-M11", "Lenovo Tab M11", "Kèm bút cảm ứng vẽ ghi chú, Màn hình 90Hz học tập và đọc sách báo tiện lợi", 4690000m, 3600000m, 35, 5, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-OPPO-PAD2", "OPPO Pad 2", "Tỷ lệ màn hình vàng 7:5 đọc tài liệu hoàn hảo, Loa Dolby Vision-Atmos công suất lớn", 11990000m, 9800000m, 15, 3, catTablet.Id, "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-HUA-MATE11", "Huawei MatePad 11.5 PaperMatte", "Màn hình nhám chống chói như giấy viết bút chì, Kèm bàn phím rời tiện lợi", 8490000m, 6800000m, 18, 3, catTablet.Id, "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SURFACE-PRO", "Microsoft Surface Pro 9", "Core i5 12th, Màn PixelSense 120Hz chân đế kickstand, Chạy Windows 11 mượt mà", 22990000m, 19000000m, 10, 2, catTablet.Id, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80", "cái"),

            // ==========================================
            // DANH MỤC 4: TAI NGHE & ÂM THANH (20 SẢN PHẨM)
            // ==========================================
            ("SONY-WH5-BLK", "Tai nghe Sony WH-1000XM5", "Tai nghe chống ồn đỉnh cao, âm thanh Hi-Res LDAC, 8 micro khử ồn Auto NC Optimizer", 7490000m, 5500000m, 24, 5, catAudio.Id, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SONY-WF5", "Tai nghe Sony WF-1000XM5", "True Wireless chống ồn số 1, Màng loa Dynamic Driver X, Đàm thoại AI khử ồn gió", 5490000m, 4200000m, 30, 5, catAudio.Id, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SONY-WH4", "Tai nghe Sony WH-1000XM4", "Chống ồn huyền thoại, Gấp gọn tiện lợi, Pin 30 tiếng, Kết nối 2 thiết bị cùng lúc", 5690000m, 4400000m, 25, 4, catAudio.Id, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-AIRPODS-PRO2", "Apple AirPods Pro 2 USB-C", "Chống ồn chủ động ANC 2X, Âm thanh không gian Spatial Audio theo dõi đầu", 5690000m, 4700000m, 30, 6, catAudio.Id, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-AIRPODS-4", "Apple AirPods 4", "Thiết kế công thái học mới, Chip H2, Tự động cách ly giọng nói khi gọi điện", 3490000m, 2800000m, 40, 8, catAudio.Id, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-AIRPODS-4ANC", "Apple AirPods 4 Chống Ồn", "Bản ANC khử tiếng ồn mở, Chế độ thích ứng âm thanh và nhận biết cuộc hội thoại", 4490000m, 3700000m, 35, 6, catAudio.Id, "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-AIRPODS-MAX", "Apple AirPods Max USB-C", "Âm thanh Hi-Fi phòng thu, Khung nhôm cao cấp sang trọng, Đệm tai lưới thoáng khí", 12990000m, 10800000m, 12, 2, catAudio.Id, "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-MARSHALL-ST3", "Loa Bluetooth Marshall Stanmore III", "Âm thanh stereo cổ điển mạnh mẽ, thiết kế biểu tượng viền kim loại núm xoay đồng", 9490000m, 7600000m, 15, 3, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-MARSHALL-ACT3", "Loa Marshall Acton III", "Thiết kế vintage nhỏ gọn phòng ngủ, Công suất 60W âm trường stereo rộng mở", 6990000m, 5500000m, 20, 3, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-MARSHALL-EMB2", "Loa Marshall Emberton II", "Âm thanh 360 độ True Stereophonic, Chống nước bụi chuẩn IP67, Pin 30 giờ", 3990000m, 3100000m, 25, 4, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-MARSHALL-WIL", "Loa Marshall Willen", "Siêu nhỏ gọn bỏ túi du lịch, Dây cao su treo tiện dụng, Micro đàm thoại rảnh tay", 2490000m, 1950000m, 30, 5, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-JBL-TOUR2", "Tai nghe JBL Tour Pro 2", "Hộp sạc thông minh màn hình cảm ứng LCD, Chống ồn thích ứng True Adaptive ANC", 5290000m, 4200000m, 18, 4, catAudio.Id, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-JBL-CHG5", "Loa Bluetooth JBL Charge 5", "Âm bass Original Pro Sound rung sàn, Sạc ngược sạc dự phòng cho điện thoại", 3490000m, 2700000m, 28, 5, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-JBL-PLS5", "Loa Bluetooth JBL Pulse 5", "Đèn LED RGB 360 độ lung linh theo điệu nhạc, Chống nước bụi IP67 tiệc tùng bãi biển", 4990000m, 3900000m, 16, 3, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-JBL-BOOM3", "Loa Di Động JBL Boombox 3", "Âm trầm cực khủng 3 đường tiếng, Tay xách kim loại chắc chắn, Pin 24 tiếng", 9990000m, 8000000m, 10, 2, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-BOSE-QCULTRA", "Tai nghe Bose QuietComfort Ultra", "Âm thanh không gian Bose Immersive Audio, Khử ồn đẳng cấp doanh nhân thế giới", 9990000m, 8200000m, 14, 2, catAudio.Id, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-BOSE-EARULTRA", "Tai nghe Bose QuietComfort Ultra Earbuds", "Khử ồn nhét tai tốt nhất, Công nghệ hiệu chỉnh âm thanh CustomTune theo cấu tạo tai", 6990000m, 5600000m, 20, 3, catAudio.Id, "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SENN-MOM4", "Tai nghe Sennheiser Momentum 4 Wireless", "Thời lượng pin kỷ lục 60 tiếng, Chất âm audiophile đặc trưng của Đức", 7990000m, 6400000m, 15, 3, catAudio.Id, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-B&O-A1", "Loa Bluetooth B&O Beosound A1 2nd Gen", "Âm thanh 360 độ chuẩn Đan Mạch, Vỏ nhôm đục lỗ cao cấp, Chống nước hoàn toàn IP67", 6900000m, 5500000m, 12, 2, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-HARMAN-AURA4", "Loa Bluetooth Harman Kardon Aura Studio 4", "Đèn vòm pha lê kim cương phát sáng, Âm thanh 360 độ công suất 130W sang trọng", 6490000m, 5200000m, 15, 3, catAudio.Id, "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80", "chiếc"),

            // ==========================================
            // DANH MỤC 5: MÀN HÌNH MÁY TÍNH (20 SẢN PHẨM)
            // ==========================================
            ("PRD-DELL-U2723QE", "Màn hình Dell UltraSharp U2723QE 27\" 4K", "Tấm nền IPS Black chuẩn đồ họa 4K, Cổng Type-C 90W, Tỷ lệ tương phản 2000:1", 13490000m, 11200000m, 16, 3, catMonitor.Id, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-DELL-U2424H", "Màn hình Dell UltraSharp U2424H 24\"", "Tần số quét 120Hz mượt mà, Viền siêu mỏng 4 cạnh, Cảm biến ánh sáng tự động", 5890000m, 4800000m, 25, 4, catMonitor.Id, "https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-DELL-U3223QE", "Màn hình Dell UltraSharp U3223QE 32\" 4K", "Không gian làm việc 32 inch 4K IPS Black, Đầy đủ cổng kết nối RJ45 mạng LAN", 18990000m, 15800000m, 10, 2, catMonitor.Id, "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-DELL-G2724D", "Màn hình Gaming Dell G2724D 27\" 2K", "Fast IPS 165Hz 1ms, G-Sync & FreeSync Premium, Độ phủ màu 99% sRGB", 7490000m, 6000000m, 20, 3, catMonitor.Id, "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-LG-27GR95QE", "Màn hình LG UltraGear 27GR95QE OLED 240Hz", "Màn hình Gaming OLED 0.03ms 240Hz QHD chuẩn HDR10, DCI-P3 98.5%", 17990000m, 14800000m, 12, 2, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-LG-34GS95QE", "Màn hình Cong LG UltraGear OLED 34\" 240Hz", "Màn cong 800R UltraWide 21:9 chuẩn điện ảnh, Tốc độ phản hồi tức thì 0.03ms", 27990000m, 23500000m, 8, 1, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-LG-DUALUP", "Màn hình LG DualUp 28MQ780-B Ergo", "Tỷ lệ độc đáo 16:18 tương đương 2 màn hình 21.5\" xếp chồng, Chân đế công thái học Ergo", 13990000m, 11500000m, 14, 2, catMonitor.Id, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-LG-27UP850", "Màn hình LG 27UP850N-W 27\" 4K", "DCI-P3 95%, VESA DisplayHDR400, Cổng USB-C sạc laptop 96W, Loa Waves MaxxAudio", 8990000m, 7300000m, 20, 3, catMonitor.Id, "https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-ASUS-PA279CRV", "Màn hình ASUS ProArt PA279CRV 27\" 4K", "Đồ họa chuyên nghiệp Calman Verified, 99% DCI-P3, USB-C 96W xuất hình và sạc", 12490000m, 10200000m, 15, 2, catMonitor.Id, "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-ASUS-PA248QV", "Màn hình ASUS ProArt PA248QV 24\" 16:10", "Tỷ lệ 16:10 mở rộng không gian, 100% sRGB, Chân đế xoay 90 độ dọc lập trình", 4990000m, 4000000m, 22, 4, catMonitor.Id, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-ASUS-PG27AQDM", "Màn hình ASUS ROG Swift OLED PG27AQDM", "OLED 1440p 240Hz, Tản nhiệt buồng hơi độc quyền chống burn-in, Độ sáng 1000 nits", 22990000m, 19000000m, 10, 2, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-ASUS-VG279Q3A", "Màn hình ASUS TUF Gaming VG279Q3A 27\"", "Fast IPS 180Hz 1ms ELMB Sync, Tương thích FreeSync chiến game mượt mà không xé hình", 4490000m, 3600000m, 30, 5, catMonitor.Id, "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-SS-ODYSSEY-G9", "Màn hình Cong Samsung Odyssey OLED G9 49\"", "Độ cong 1800R Dual QHD 240Hz 0.03ms siêu rộng, Bộ xử lý Neo Quantum Processor Pro", 32990000m, 27500000m, 6, 1, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-SS-ODYSSEY-G7", "Màn hình Cong Samsung Odyssey G7 27\" 240Hz", "Độ cong 1000R góc nhìn mắt người, Tấm nền QLED QHD 240Hz 1ms DisplayHDR 600", 10990000m, 8900000m, 15, 2, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-SS-VIEWFINITY", "Màn hình Samsung ViewFinity S9 27\" 5K", "Độ phân giải 5K 5120x2880 siêu sắc nét, Kèm camera 4K SlimFit thông minh", 24990000m, 20800000m, 8, 1, catMonitor.Id, "https://images.unsplash.com/photo-1551645120-d70bfe84c826?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-SS-SMARTM8", "Màn hình Thông Minh Samsung Smart Monitor M8 32\"", "Tích hợp hệ điều hành Smart TV, Loa kép âm thanh sống động, Hub IoT điều khiển nhà", 11490000m, 9200000m, 18, 3, catMonitor.Id, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-BENQ-PD2705U", "Màn hình Đồ Họa BenQ PD2705U 27\" 4K", "Công nghệ AQCOLOR sRGB 99%, Phím xoay Hotkey Puck G2 tùy chỉnh màu nhanh", 13990000m, 11600000m, 12, 2, catMonitor.Id, "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-BENQ-EX2710Q", "Màn hình Gaming BenQ MOBIUZ EX2710Q 27\" 2K", "IPS 165Hz, Công nghệ HDRi độc quyền, Hệ thống loa 2.1 kênh treVolo có loa subwoofer", 8290000m, 6800000m, 16, 2, catMonitor.Id, "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-AOC-27G2SPE", "Màn hình Gaming AOC 27G2SPE 27\"", "IPS 165Hz 1ms, Viền mỏng 3 cạnh, Chân đế chữ V chắc chắn, Giá tốt cho game thủ", 3590000m, 2800000m, 35, 5, catMonitor.Id, "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-MSI-MAG274QRF", "Màn hình MSI Optix MAG274QRF-QD", "Chấm lượng tử Quantum Dot 165Hz 1ms G-Sync, Dải màu bao phủ 147% sRGB", 8990000m, 7400000m, 15, 2, catMonitor.Id, "https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80", "chiếc"),

            // ==========================================
            // DANH MỤC 6: PHỤ KIỆN & GAMING GEAR (20 SẢN PHẨM)
            // ==========================================
            ("PRD-ANKER-65W", "Củ sạc nhanh Anker GaNPrime 65W", "Công nghệ GaNPrime 3 cổng 2C1A sạc nhanh đa thiết bị, Chân cắm gập gọn", 1050000m, 750000m, 50, 10, catAccessory.Id, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ANKER-100W", "Củ sạc Anker 317 GaN 100W USB-C", "Sạc đầy MacBook Pro 14 chỉ trong 1.5 giờ, Tặng kèm cáp sạc C-C 5A siêu bền", 1390000m, 980000m, 40, 8, catAccessory.Id, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ANKER-140W", "Củ sạc Anker 737 GaNPrime 140W", "Chuẩn Power Delivery 3.1 công suất đỉnh 140W sạc laptop và điện thoại cùng lúc", 1990000m, 1450000m, 30, 5, catAccessory.Id, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ANKER-PRIME20K", "Pin dự phòng Anker Prime 20.000mAh 200W", "Dung lượng khủng 20.000mAh, Công suất ra 200W, Màn hình LCD màu hiển thị thông số", 2790000m, 2150000m, 25, 5, catAccessory.Id, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ANKER-MAGGO", "Pin dự phòng không dây Anker MagGo Qi2 10.000mAh", "Sạc hít nam châm MagSafe chuẩn Qi2 15W, Kèm chân đế kim loại gập xem phim", 1490000m, 1050000m, 45, 8, catAccessory.Id, "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-APPLE-USBC-WOVEN", "Cáp sạc Apple USB-C Woven", "Dây dù bện bền bỉ chính hãng Apple dài 1 mét, Hỗ trợ sạc nhanh và truyền dữ liệu", 590000m, 420000m, 60, 10, catAccessory.Id, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-APPLE-MAGSAFE", "Đế sạc không dây Apple MagSafe Charger", "Hít từ tính chính xác mặt lưng iPhone 12 đến 16, Sạc nhanh chuẩn không dây 15W", 1090000m, 820000m, 40, 6, catAccessory.Id, "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LOGI-MX3S", "Chuột không dây Logitech MX Master 3S", "Cảm biến 8000 DPI lướt trên kính, Cuộn vô cực MagSpeed, Công nghệ Click êm ái", 2490000m, 1950000m, 35, 6, catAccessory.Id, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LOGI-MXANY4", "Chuột không dây Logitech MX Anywhere 3S", "Thiết kế nhỏ gọn di động văn phòng, Kết nối 3 thiết bị cùng lúc, Nút cuộn kim loại", 1790000m, 1380000m, 30, 5, catAccessory.Id, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LOGI-GPROX", "Chuột Gaming Logitech G Pro X Superlight 2", "Siêu nhẹ 60g, Cảm biến HERO 2 32.000 DPI, Switch lai quang cơ học LIGHTFORCE 4KHz", 3490000m, 2750000m, 22, 4, catAccessory.Id, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-LOGI-LIFT", "Chuột công thái học Logitech Lift Vertical", "Góc nghiêng 57 độ tự nhiên bảo vệ cổ tay, Cuộn SmartWheel mượt mà, Kết nối Logi Bolt", 1490000m, 1150000m, 28, 5, catAccessory.Id, "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-KEYCHRON-K2", "Bàn phím cơ Keychron K2 Pro Wireless", "Layout 75%, Mạch xuôi Hot-swap, Keycap PBT Double-shot, Kết nối Bluetooth 5.1 & Type-C", 2190000m, 1600000m, 30, 5, catAccessory.Id, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-KEYCHRON-Q1", "Bàn phím cơ Keychron Q1 Pro Nhôm CNC", "Vỏ nhôm nguyên khối cắt CNC, Đệm Gasket Mount êm tai, Tương thích QMK/VIA tùy biến", 4490000m, 3600000m, 15, 3, catAccessory.Id, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-KEYCHRON-K3", "Bàn phím cơ Low Profile Keychron K3 Pro", "Thiết kế siêu mỏng nhẹ mang đi cà phê, Switch Gateron quang học bấm nhạy", 2390000m, 1850000m, 25, 4, catAccessory.Id, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-SS-T7-1TB", "Ổ cứng di động SSD Samsung T7 Shield 1TB", "Kháng nước bụi IP65, Vỏ cao su chống rơi vỡ 3 mét, Tốc độ truyền đọc ghi 1050MB/s", 2790000m, 2200000m, 30, 5, catAccessory.Id, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-SS-T7-2TB", "Ổ cứng di động SSD Samsung T7 Shield 2TB", "Dung lượng lớn 2TB lưu trữ video ProRes 4K, Chuẩn bảo mật phần cứng AES 256-bit", 4890000m, 3950000m, 18, 3, catAccessory.Id, "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-UGREEN-HUB9", "Hub chuyển đổi Type-C Ugreen Revodok 9 trong 1", "Xuất 2 màn hình HDMI 4K@60Hz, Cổng mạng LAN Gigabit 1000Mbps, Sạc xuyên qua PD 100W", 1190000m, 850000m, 40, 6, catAccessory.Id, "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-UGREEN-HUB6", "Hub chuyển đổi Type-C Ugreen 6 trong 1", "Vỏ nhôm tản nhiệt xám Space Gray, 3 cổng USB 3.0 tốc độ 5Gbps, Khe đọc thẻ SD/TF", 590000m, 400000m, 55, 10, catAccessory.Id, "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-ANKER-FLOW", "Cáp sạc nhanh Anker PowerLine III Flow USB-C", "Chất liệu silicone siêu mềm chống rối, Chịu uốn cong 25.000 lần, Công suất 100W", 390000m, 260000m, 50, 10, catAccessory.Id, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-STAND-ERGO", "Giá đỡ Laptop nhôm xoay 360 độ Ergo", "Chất liệu hợp kim nhôm nguyên khối, Trục xoay 360 độ tiện làm việc nhóm, Tản nhiệt tốt", 490000m, 320000m, 45, 8, catAccessory.Id, "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=800&q=80", "cái"),
            ("PRD-ELGATO-STREAM", "Bàn điều khiển Elgato Stream Deck MK.2", "15 phím màn hình LCD tùy biến thao tác nhanh macro, Đổi mặt nạ faceplate cá tính", 3790000m, 2950000m, 15, 3, catAccessory.Id, "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80", "chiếc"),
            ("PRD-LOGI-C920", "Webcam Logitech C920 Pro HD 1080p", "Video Full HD 1080p 30fps sắc nét, 2 micro stereo lọc tiếng ồn tự động họp trực tuyến", 1590000m, 1200000m, 35, 5, catAccessory.Id, "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80", "chiếc")
        };

        foreach (var item in productsToSeed)
        {
            var p = db.Products.FirstOrDefault(x => x.ProductCode == item.Code || x.Name == item.Name);
            if (p == null)
            {
                db.Products.Add(new Product
                {
                    ProductCode = item.Code,
                    Name = item.Name,
                    Description = item.Desc,
                    Price = item.Price,
                    CostPrice = item.Cost,
                    Quantity = item.Qty,
                    MinStock = item.Min,
                    CategoryId = item.CatId,
                    Image = item.Img,
                    Unit = item.Unit,
                    Status = "active",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
            else
            {
                p.Description = item.Desc;
                p.Price = item.Price;
                p.CostPrice = item.Cost;
                p.CategoryId = item.CatId;
                p.Unit = item.Unit;
                p.Status = "active";
                // Tuyệt đối không ghi đè ảnh nếu đã có ảnh tùy chỉnh
                if (string.IsNullOrWhiteSpace(p.Image))
                {
                    p.Image = item.Img;
                }
                if (p.Quantity <= 0 && item.Qty > 0) p.Quantity = item.Qty;
                p.UpdatedAt = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync();
    }
}
