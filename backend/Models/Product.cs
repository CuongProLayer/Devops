namespace SmartStock.API.Models;

public class Product
{
    public int Id { get; set; }
    public string ProductCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public decimal Price { get; set; }
    public decimal CostPrice { get; set; }
    public int Quantity { get; set; } = 0;
    public int MinStock { get; set; } = 5;
    public string? Unit { get; set; } = "cái";
    public string Status { get; set; } = "active"; // active, inactive
    public bool IsDeleted { get; set; } = false; // Soft delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // FK
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public int? SupplierId { get; set; }
    public Supplier? Supplier { get; set; }

    // Navigation
    public ICollection<ImportDetail> ImportDetails { get; set; } = [];
    public ICollection<OrderDetail> OrderDetails { get; set; } = [];
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = [];
}
