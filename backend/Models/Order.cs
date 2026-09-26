namespace SmartStock.API.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public decimal Discount { get; set; } = 0;
    public decimal FinalAmount { get; set; }
    public decimal PaidAmount { get; set; } = 0; // Đặt cọc / đã thanh toán
    public string PaymentMethod { get; set; } = "cash"; // cash, transfer, card
    public string Status { get; set; } = "confirmed"; // pending, confirmed, completed, cancelled, returned
    public string? Note { get; set; }
    public string? IdempotencyKey { get; set; } // Chống bấm 2 lần tạo trùng đơn
    public bool IsDeleted { get; set; } = false; // Soft delete
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // FK
    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public int EmployeeId { get; set; }
    public User Employee { get; set; } = null!;

    // Navigation
    public ICollection<OrderDetail> OrderDetails { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}

public class OrderDetail
{
    public int Id { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Total { get; set; }

    // FK
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
