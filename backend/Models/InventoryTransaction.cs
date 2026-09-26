namespace SmartStock.API.Models;

public class InventoryTransaction
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // IMPORT, EXPORT, SALE, RETURN, ADJUSTMENT
    public int Quantity { get; set; }
    public int BeforeQuantity { get; set; }
    public int AfterQuantity { get; set; }
    public int? ReferenceId { get; set; } // ImportReceiptId or OrderId
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
}
