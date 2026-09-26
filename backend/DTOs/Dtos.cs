using System.ComponentModel.DataAnnotations;

namespace SmartStock.API.DTOs;

// Auth
public record LoginRequest(
    [Required(ErrorMessage = "Email không được để trống")][EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string Email,
    [Required(ErrorMessage = "Mật khẩu không được để trống")][StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")] string Password);

public record RegisterRequest(
    [Required(ErrorMessage = "Tên đăng nhập không được để trống")][StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3 đến 50 ký tự")] string Username,
    [Required(ErrorMessage = "Email không được để trống")][EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string Email,
    [Required(ErrorMessage = "Mật khẩu không được để trống")][StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu tối thiểu 6 ký tự")] string Password,
    [Required(ErrorMessage = "Họ và tên không được để trống")][StringLength(100, ErrorMessage = "Họ tên không vượt quá 100 ký tự")] string FullName,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [StringLength(20)] string Role = "staff");

public record AuthResponse(string Token, string Role, string FullName, string Email, int UserId);

public record ChangePasswordRequest(
    [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống")][StringLength(100)] string CurrentPassword,
    [Required(ErrorMessage = "Mật khẩu mới không được để trống")][StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu mới tối thiểu 6 ký tự")] string NewPassword);

public record UpdateProfileRequest(
    [Required(ErrorMessage = "Họ và tên không được để trống")][StringLength(100, ErrorMessage = "Họ tên không vượt quá 100 ký tự")] string FullName,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone);

public record ForgotPasswordRequest(
    [Required(ErrorMessage = "Email không được để trống")][EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string Email);

public record ForgotPasswordResponse(string Message, string? TemporaryPassword);

// User
public record UserDto(int Id, string Username, string Email, string FullName, string? Phone, string Role, bool IsActive, DateTime CreatedAt);

public record UpdateUserRequest(
    [Required(ErrorMessage = "Họ và tên không được để trống")][StringLength(100)] string FullName,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [Required(ErrorMessage = "Vai trò không được để trống")][StringLength(20)] string Role,
    bool IsActive);

// Category
public record CategoryDto(int Id, string Name, string? Description, string? Icon, bool IsActive, int ProductCount);

public record CreateCategoryRequest(
    [Required(ErrorMessage = "Tên danh mục không được để trống")][StringLength(100, ErrorMessage = "Tên danh mục không vượt quá 100 ký tự")] string Name,
    [StringLength(500, ErrorMessage = "Mô tả không vượt quá 500 ký tự")] string? Description,
    [StringLength(50, ErrorMessage = "Icon không vượt quá 50 ký tự")] string? Icon);

public record UpdateCategoryRequest(
    [Required(ErrorMessage = "Tên danh mục không được để trống")][StringLength(100, ErrorMessage = "Tên danh mục không vượt quá 100 ký tự")] string Name,
    [StringLength(500, ErrorMessage = "Mô tả không vượt quá 500 ký tự")] string? Description,
    [StringLength(50, ErrorMessage = "Icon không vượt quá 50 ký tự")] string? Icon,
    bool IsActive);

// Supplier
public record SupplierDto(int Id, string SupplierCode, string Name, string? Phone, string? Email, string? Address, string? ContactPerson, string Status, DateTime CreatedAt);

public record CreateSupplierRequest(
    [Required(ErrorMessage = "Tên nhà cung cấp không được để trống")][StringLength(150, ErrorMessage = "Tên NCC không vượt quá 150 ký tự")] string Name,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string? Email,
    [StringLength(255, ErrorMessage = "Địa chỉ không vượt quá 255 ký tự")] string? Address,
    [StringLength(100, ErrorMessage = "Người liên hệ không vượt quá 100 ký tự")] string? ContactPerson);

public record UpdateSupplierRequest(
    [Required(ErrorMessage = "Tên nhà cung cấp không được để trống")][StringLength(150, ErrorMessage = "Tên NCC không vượt quá 150 ký tự")] string Name,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string? Email,
    [StringLength(255, ErrorMessage = "Địa chỉ không vượt quá 255 ký tự")] string? Address,
    [StringLength(100, ErrorMessage = "Người liên hệ không vượt quá 100 ký tự")] string? ContactPerson,
    [Required(ErrorMessage = "Trạng thái không được để trống")][StringLength(20)] string Status);

// Customer
public record CustomerDto(int Id, string CustomerCode, string Name, string? Phone, string? Email, string? Address, decimal TotalPurchase, string Status, DateTime CreatedAt);

public record CreateCustomerRequest(
    [Required(ErrorMessage = "Tên khách hàng không được để trống")][StringLength(100, ErrorMessage = "Tên KH không vượt quá 100 ký tự")] string Name,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string? Email,
    [StringLength(255, ErrorMessage = "Địa chỉ không vượt quá 255 ký tự")] string? Address);

public record UpdateCustomerRequest(
    [Required(ErrorMessage = "Tên khách hàng không được để trống")][StringLength(100, ErrorMessage = "Tên KH không vượt quá 100 ký tự")] string Name,
    [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")][StringLength(20)] string? Phone,
    [EmailAddress(ErrorMessage = "Email không đúng định dạng")][StringLength(100)] string? Email,
    [StringLength(255, ErrorMessage = "Địa chỉ không vượt quá 255 ký tự")] string? Address,
    [Required(ErrorMessage = "Trạng thái không được để trống")][StringLength(20)] string Status);

// Product
public record ProductDto(int Id, string ProductCode, string Name, string? Description, string? Image,
    decimal Price, decimal CostPrice, int Quantity, int MinStock, string? Unit, string Status,
    int CategoryId, string CategoryName, int? SupplierId, string? SupplierName, DateTime CreatedAt, DateTime UpdatedAt);

public record CreateProductRequest(
    [Required(ErrorMessage = "Tên sản phẩm không được để trống")][StringLength(200, ErrorMessage = "Tên sản phẩm không vượt quá 200 ký tự")] string Name,
    [StringLength(1000, ErrorMessage = "Mô tả không vượt quá 1000 ký tự")] string? Description,
    [Range(0, 10000000000, ErrorMessage = "Giá bán không hợp lệ")] decimal Price,
    [Range(0, 10000000000, ErrorMessage = "Giá vốn không hợp lệ")] decimal CostPrice,
    [Range(0, int.MaxValue, ErrorMessage = "Số lượng không được âm")] int Quantity,
    [Range(0, int.MaxValue, ErrorMessage = "Tồn kho tối thiểu không được âm")] int MinStock,
    [StringLength(50, ErrorMessage = "Đơn vị tính không quá 50 ký tự")] string? Unit,
    [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn danh mục hợp lệ")] int CategoryId,
    int? SupplierId);

public record UpdateProductRequest(
    [Required(ErrorMessage = "Tên sản phẩm không được để trống")][StringLength(200, ErrorMessage = "Tên sản phẩm không vượt quá 200 ký tự")] string Name,
    [StringLength(1000, ErrorMessage = "Mô tả không vượt quá 1000 ký tự")] string? Description,
    [Range(0, 10000000000, ErrorMessage = "Giá bán không hợp lệ")] decimal Price,
    [Range(0, 10000000000, ErrorMessage = "Giá vốn không hợp lệ")] decimal CostPrice,
    [Range(0, int.MaxValue, ErrorMessage = "Số lượng không được âm")] int Quantity,
    [Range(0, int.MaxValue, ErrorMessage = "Tồn kho tối thiểu không được âm")] int MinStock,
    [StringLength(50, ErrorMessage = "Đơn vị tính không quá 50 ký tự")] string? Unit,
    [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn danh mục hợp lệ")] int CategoryId,
    int? SupplierId,
    [Required(ErrorMessage = "Trạng thái không được để trống")][StringLength(20)] string Status);

// Import
public record ImportReceiptDto(int Id, string ReceiptCode, int SupplierId, string SupplierName,
    int EmployeeId, string EmployeeName, decimal TotalAmount, string? Note, string Status, DateTime CreatedAt,
    List<ImportDetailDto> Details);

public record ImportDetailDto(int Id, int ProductId, string ProductName, int Quantity, decimal ImportPrice, decimal Total);

public record CreateImportRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Vui lòng chọn nhà cung cấp hợp lệ")] int SupplierId,
    [StringLength(500, ErrorMessage = "Ghi chú không quá 500 ký tự")] string? Note,
    [Required(ErrorMessage = "Danh sách sản phẩm nhập không được để trống")][MinLength(1, ErrorMessage = "Cần ít nhất 1 sản phẩm nhập")] List<CreateImportDetailRequest> Details,
    [StringLength(20)] string Status = "completed" // draft hoặc completed
);

public record CreateImportDetailRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Mã sản phẩm không hợp lệ")] int ProductId,
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng nhập phải lớn hơn 0")] int Quantity,
    [Range(0, 10000000000, ErrorMessage = "Giá nhập không hợp lệ")] decimal ImportPrice);

public record UpdateImportRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Mã nhà cung cấp không hợp lệ")] int? SupplierId,
    [StringLength(500, ErrorMessage = "Ghi chú không quá 500 ký tự")] string? Note,
    [StringLength(20, ErrorMessage = "Trạng thái không quá 20 ký tự")] string? Status);

// Order
public record OrderDto(int Id, string OrderCode, int? CustomerId, string? CustomerName,
    int EmployeeId, string EmployeeName, decimal TotalAmount, decimal Discount, decimal FinalAmount,
    decimal PaidAmount, string PaymentMethod, string Status, string? Note, DateTime CreatedAt,
    List<OrderDetailDto> Details, List<PaymentDto> Payments);

public record OrderDetailDto(int Id, int ProductId, string ProductName, int Quantity, decimal Price, decimal Total);

public record CreateOrderRequest(
    int? CustomerId,
    [Range(0, 10000000000, ErrorMessage = "Chiết khấu không hợp lệ")] decimal Discount,
    [Required(ErrorMessage = "Phương thức thanh toán không được để trống")][StringLength(50)] string PaymentMethod,
    [StringLength(500, ErrorMessage = "Ghi chú không vượt quá 500 ký tự")] string? Note,
    [Required(ErrorMessage = "Chi tiết đơn hàng không được để trống")][MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")] List<CreateOrderDetailRequest> Details,
    [StringLength(100)] string? IdempotencyKey = null,
    [StringLength(20)] string Status = "confirmed" // pending, confirmed, completed
);

public record CreateOrderDetailRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Mã sản phẩm không hợp lệ")] int ProductId,
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải lớn hơn 0")] int Quantity,
    [Range(0, 10000000000, ErrorMessage = "Giá bán không hợp lệ")] decimal Price);

// Return Order
public record ReturnOrderRequest(
    [StringLength(500, ErrorMessage = "Lý do hoàn hàng không vượt quá 500 ký tự")] string? Reason,
    List<ReturnOrderDetailRequest>? Details);

public record ReturnOrderDetailRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Mã sản phẩm không hợp lệ")] int ProductId,
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng hoàn phải lớn hơn 0")] int Quantity);

// Payment
public record PaymentDto(
    int Id, int OrderId, string OrderCode, decimal Amount,
    string PaymentMethod, string? TransactionCode, string? Note,
    int EmployeeId, string EmployeeName, DateTime CreatedAt);

public record CreatePaymentRequest(
    [Range(0.01, 10000000000, ErrorMessage = "Số tiền thanh toán phải lớn hơn 0")] decimal Amount,
    [Required(ErrorMessage = "Phương thức thanh toán không được để trống")][StringLength(50)] string PaymentMethod,
    [StringLength(100, ErrorMessage = "Mã giao dịch không quá 100 ký tự")] string? TransactionCode,
    [StringLength(500, ErrorMessage = "Ghi chú không quá 500 ký tự")] string? Note);

// Inventory
public record InventoryDto(int ProductId, string ProductCode, string ProductName, string CategoryName,
    int Quantity, int MinStock, string StockStatus);

public record InventoryTransactionDto(int Id, int ProductId, string ProductName, string Type,
    int Quantity, int BeforeQuantity, int AfterQuantity, int? ReferenceId, string? Note, string EmployeeName, DateTime CreatedAt);

// Inventory Adjustment
public record InventoryAdjustmentRequest(
    [Range(1, int.MaxValue, ErrorMessage = "Mã sản phẩm không hợp lệ")] int ProductId,
    [Range(0, int.MaxValue, ErrorMessage = "Số lượng tồn kho mới không được âm")] int NewQuantity,
    [StringLength(500, ErrorMessage = "Lý do điều chỉnh không vượt quá 500 ký tự")] string? Reason);

// Dashboard
public record DashboardDto(
    int TotalProducts, int TotalCustomers, int TotalOrders,
    decimal TodayRevenue, decimal MonthRevenue,
    int LowStockProducts, int OutOfStockProducts,
    List<MonthlyRevenueDto> MonthlyRevenue,
    List<TopProductDto> TopProducts
);

public record MonthlyRevenueDto(int Month, int Year, decimal Revenue, int Orders);

public record TopProductDto(int ProductId, string ProductName, int TotalSold, decimal TotalRevenue);

// Notification
public record NotificationDto(int Id, string Title, string Message, string Type, bool IsRead, DateTime CreatedAt);

// Pagination
public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize, int TotalPages);

// Reports
public record RevenueReportDto(string Period, decimal Revenue, int OrderCount, decimal AverageOrderValue);

public record InventoryReportDto(int ProductId, string ProductCode, string ProductName, string CategoryName,
    int OpeningStock, int TotalImport, int TotalExport, int ClosingStock, decimal StockValue);
