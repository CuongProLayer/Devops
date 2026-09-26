namespace SmartStock.API.Models;

public class Payment
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "cash"; // cash, transfer, card
    public string? TransactionCode { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // FK
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
}
