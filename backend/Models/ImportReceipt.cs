namespace SmartStock.API.Models;

public class ImportReceipt
{
    public int Id { get; set; }
    public string ReceiptCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string? Note { get; set; }
    public string Status { get; set; } = "completed"; // pending, completed, cancelled
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // FK
    public int SupplierId { get; set; }
    public Supplier Supplier { get; set; } = null!;
    public int EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    // Navigation
    public ICollection<ImportDetail> ImportDetails { get; set; } = [];
}

public class ImportDetail
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal ImportPrice { get; set; }
    public decimal Total { get; set; }

    // FK
    public int ImportReceiptId { get; set; }
    public ImportReceipt ImportReceipt { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
