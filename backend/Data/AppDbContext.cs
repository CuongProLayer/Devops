using Microsoft.EntityFrameworkCore;
using SmartStock.API.Models;

namespace SmartStock.API.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ImportReceipt> ImportReceipts => Set<ImportReceipt>();
    public DbSet<ImportDetail> ImportDetails => Set<ImportDetail>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderDetail> OrderDetails => Set<OrderDetail>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<Payment> Payments => Set<Payment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        // Category
        modelBuilder.Entity<Category>().HasIndex(c => c.Name).IsUnique();

        // Supplier
        modelBuilder.Entity<Supplier>().HasIndex(s => s.SupplierCode).IsUnique();

        // Customer
        modelBuilder.Entity<Customer>().HasIndex(c => c.CustomerCode).IsUnique();

        // Product
        modelBuilder.Entity<Product>().HasIndex(p => p.ProductCode).IsUnique();
        modelBuilder.Entity<Product>().Property(p => p.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Product>().Property(p => p.CostPrice).HasColumnType("decimal(18,2)");

        // ImportReceipt
        modelBuilder.Entity<ImportReceipt>().HasIndex(i => i.ReceiptCode).IsUnique();
        modelBuilder.Entity<ImportReceipt>().Property(i => i.TotalAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<ImportDetail>().Property(i => i.ImportPrice).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<ImportDetail>().Property(i => i.Total).HasColumnType("decimal(18,2)");

        // Order
        modelBuilder.Entity<Order>().HasIndex(o => o.OrderCode).IsUnique();
        modelBuilder.Entity<Order>().Property(o => o.TotalAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.Discount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.FinalAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Order>().Property(o => o.PaidAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<OrderDetail>().Property(o => o.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<OrderDetail>().Property(o => o.Total).HasColumnType("decimal(18,2)");

        // Customer
        modelBuilder.Entity<Customer>().Property(c => c.TotalPurchase).HasColumnType("decimal(18,2)");

        // Payment
        modelBuilder.Entity<Payment>().Property(p => p.Amount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Order)
            .WithMany(o => o.Payments)
            .HasForeignKey(p => p.OrderId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Payment>()
            .HasOne(p => p.Employee)
            .WithMany()
            .HasForeignKey(p => p.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Avoid cascade delete cycles
        modelBuilder.Entity<ImportReceipt>()
            .HasOne(i => i.Employee)
            .WithMany(u => u.ImportReceipts)
            .HasForeignKey(i => i.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Order>()
            .HasOne(o => o.Employee)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(t => t.Employee)
            .WithMany(u => u.InventoryTransactions)
            .HasForeignKey(t => t.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed data
        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        // Admin user (password: admin123)
        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@smartstock.vn",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin123"),
            FullName = "Quản trị viên",
            Phone = "0900000001",
            Role = "admin",
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1),
            UpdatedAt = new DateTime(2026, 1, 1)
        });

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 2,
            Username = "warehouse",
            Email = "warehouse@smartstock.vn",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("warehouse123"),
            FullName = "Trần Minh Kho",
            Phone = "0900000002",
            Role = "warehouse",
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1),
            UpdatedAt = new DateTime(2026, 1, 1)
        });

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 3,
            Username = "staff",
            Email = "staff@smartstock.vn",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("staff123"),
            FullName = "Nguyễn Hà Sales",
            Phone = "0900000003",
            Role = "staff",
            IsActive = true,
            CreatedAt = new DateTime(2026, 1, 1),
            UpdatedAt = new DateTime(2026, 1, 1)
        });

        // Categories
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Điện thoại", Description = "Smartphone các hãng", Icon = "📱", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new Category { Id = 2, Name = "Laptop", Description = "Máy tính xách tay", Icon = "💻", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new Category { Id = 3, Name = "Máy tính bảng", Description = "Tablet", Icon = "📲", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new Category { Id = 4, Name = "Phụ kiện", Description = "Tai nghe, chuột, bàn phím", Icon = "🎧", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) },
            new Category { Id = 5, Name = "Màn hình", Description = "Monitor", Icon = "🖥️", IsActive = true, CreatedAt = new DateTime(2026, 1, 1) }
        );

        // Suppliers
        modelBuilder.Entity<Supplier>().HasData(
            new Supplier { Id = 1, SupplierCode = "SUP001", Name = "Apple Distribution VN", Phone = "02812345678", Email = "contact@apple.vn", Address = "TP.HCM", ContactPerson = "Apple VN", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Supplier { Id = 2, SupplierCode = "SUP002", Name = "Samsung Electronics VN", Phone = "02887654321", Email = "partner@samsung.vn", Address = "Hà Nội", ContactPerson = "Samsung VN", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Supplier { Id = 3, SupplierCode = "SUP003", Name = "An Phát Accessories", Phone = "02899887766", Email = "sales@anphat.vn", Address = "Hà Nội", ContactPerson = "Nguyễn An", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) }
        );

        // Products
        modelBuilder.Entity<Product>().HasData(
            new Product { Id = 1, ProductCode = "IP15PM-256", Name = "iPhone 15 Pro Max 256GB", Description = "iPhone 15 Pro Max chính hãng VN/A", Price = 29990000, CostPrice = 25000000, Quantity = 18, MinStock = 5, CategoryId = 1, SupplierId = 1, Unit = "cái", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Product { Id = 2, ProductCode = "MBA-M3-15", Name = "MacBook Air M3 15 inch", Description = "MacBook Air chip M3 màn 15 inch", Price = 32490000, CostPrice = 27000000, Quantity = 7, MinStock = 3, CategoryId = 2, SupplierId = 1, Unit = "cái", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Product { Id = 3, ProductCode = "SONY-WH5-BLK", Name = "Sony WH-1000XM5", Description = "Tai nghe chống ồn cao cấp", Price = 7490000, CostPrice = 5500000, Quantity = 24, MinStock = 5, CategoryId = 4, SupplierId = 3, Unit = "cái", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Product { Id = 4, ProductCode = "SS-S24U-512", Name = "Samsung Galaxy S24 Ultra 512GB", Description = "Samsung flagship 2026", Price = 25990000, CostPrice = 21000000, Quantity = 0, MinStock = 5, CategoryId = 1, SupplierId = 2, Unit = "cái", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Product { Id = 5, ProductCode = "IPAD-M4-11", Name = "iPad Pro M4 11 inch", Description = "iPad Pro chip M4 màn 11 inch", Price = 21990000, CostPrice = 18000000, Quantity = 13, MinStock = 3, CategoryId = 3, SupplierId = 1, Unit = "cái", Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) }
        );

        // Customers
        modelBuilder.Entity<Customer>().HasData(
            new Customer { Id = 1, CustomerCode = "CUS001", Name = "Nguyễn Minh Anh", Phone = "0912345678", Email = "anh@gmail.com", Address = "Quận 1, TP.HCM", TotalPurchase = 62480000, Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) },
            new Customer { Id = 2, CustomerCode = "CUS002", Name = "Trần Quốc Bảo", Phone = "0987654321", Email = "bao@gmail.com", Address = "Quận 3, TP.HCM", TotalPurchase = 7490000, Status = "active", CreatedAt = new DateTime(2026, 1, 1), UpdatedAt = new DateTime(2026, 1, 1) }
        );
    }
}
