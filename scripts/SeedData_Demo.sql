-- ==============================================================================
-- SCRIPT BỔ SUNG DỮ LIỆU MẪU (SEED DATA) CHO SMARTSTOCK DATABASE
-- Cơ sở dữ liệu: SmartStockDB
-- Ngày tạo: 2026-10-26
-- ==============================================================================

USE [SmartStockDB];
GO

SET NOCOUNT ON;

PRINT N'>>> ĐANG KIỂM TRA VÀ BỔ SUNG DỮ LIỆU CHO SMARTSTOCKDB...';

-- ------------------------------------------------------------------------------
-- 1. BỔ SUNG NHÀ CUNG CẤP (Suppliers)
-- ------------------------------------------------------------------------------
PRINT N'1. Thêm Nhà cung cấp (Suppliers)...';

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [SupplierCode] = N'SUP004')
BEGIN
    INSERT INTO [Suppliers] ([SupplierCode], [Name], [Phone], [Email], [Address], [ContactPerson], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'SUP004', N'ASUS Vietnam Official', N'02838383838', N'contact@asus.vn', N'Quận 1, TP.HCM', N'Lê Hữu Phước', N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [SupplierCode] = N'SUP005')
BEGIN
    INSERT INTO [Suppliers] ([SupplierCode], [Name], [Phone], [Email], [Address], [ContactPerson], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'SUP005', N'Dell Technologies VN', N'02439393939', N'sales@dell.vn', N'Ba Đình, Hà Nội', N'Phạm Đức Thắng', N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Suppliers] WHERE [SupplierCode] = N'SUP006')
BEGIN
    INSERT INTO [Suppliers] ([SupplierCode], [Name], [Phone], [Email], [Address], [ContactPerson], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'SUP006', N'Logitech Authorized Dealer', N'02837373737', N'info@logitechdealer.vn', N'Quận 7, TP.HCM', N'Vũ Hoàng Nam', N'active', GETUTCDATE(), GETUTCDATE());
END;
GO

-- ------------------------------------------------------------------------------
-- 2. BỔ SUNG SẢN PHẨM (Products)
-- ------------------------------------------------------------------------------
PRINT N'2. Thêm Sản phẩm mới (Products)...';

DECLARE @SupApple INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP001');
DECLARE @SupSamsung INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP002');
DECLARE @SupAnPhat INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP003');
DECLARE @SupAsus INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP004');
DECLARE @SupDell INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP005');
DECLARE @SupLogi INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP006');

-- PRD-DELL-XPS15
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-DELL-XPS15')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-DELL-XPS15', N'Dell XPS 15 9530 i7-13700H / 16GB / 512GB RTX 4050', N'Laptop đồ họa cao cấp màn 3.5K OLED', NULL, 42990000, 36000000, 8, 2, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 2, @SupDell);
END;

-- PRD-ASUS-ROG16
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-ASUS-ROG16')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-ASUS-ROG16', N'ASUS ROG Zephyrus G16 OLED 2026', N'Laptop gaming mỏng nhẹ màn 240Hz OLED', NULL, 45990000, 39000000, 6, 2, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 2, @SupAsus);
END;

-- PRD-IP16PM-256
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-IP16PM-256')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-IP16PM-256', N'iPhone 16 Pro Max 256GB Desert Titanium', N'Flagship Apple chip A18 Pro, khung titan mới', NULL, 34990000, 30500000, 25, 5, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 1, @SupApple);
END;

-- PRD-IPAD-AIR6
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-IPAD-AIR6')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-IPAD-AIR6', N'iPad Air 6 M2 11 inch 128GB Wifi', N'iPad Air mới nhất tích hợp chip M2 mạnh mẽ', NULL, 16490000, 14000000, 15, 3, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 3, @SupApple);
END;

-- PRD-SS-TAB-S9
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-SS-TAB-S9')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-SS-TAB-S9', N'Samsung Galaxy Tab S9 Ultra 5G', N'Máy tính bảng cao cấp màn hình 14.6 inch kèm S-Pen', NULL, 22990000, 19500000, 10, 3, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 3, @SupSamsung);
END;

-- PRD-LOGI-MX3S
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-LOGI-MX3S')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-LOGI-MX3S', N'Chuột không dây Logitech MX Master 3S', N'Chuột công thái học cảm biến 8K DPI chống ồn', NULL, 2490000, 1800000, 40, 10, N'cái', N'active', 0, GETUTCDATE(), GETUTCDATE(), 4, @SupLogi);
END;

-- PRD-KEYCHRON-K2
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-KEYCHRON-K2')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-KEYCHRON-K2', N'Bàn phím cơ Keychron K2 Pro Wireless', N'Layout 75%, hot-swap, kết nối Bluetooth/Type-C', NULL, 2190000, 1600000, 30, 8, N'cái', N'active', 0, GETUTCDATE(), GETUTCDATE(), 4, @SupAnPhat);
END;

-- PRD-AIRPODS-PRO2
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-AIRPODS-PRO2')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-AIRPODS-PRO2', N'Tai nghe Apple AirPods Pro 2 USB-C', N'Chống ồn chủ động ANC thế hệ mới, cổng Type-C', NULL, 5690000, 4700000, 28, 6, N'cái', N'active', 0, GETUTCDATE(), GETUTCDATE(), 4, @SupApple);
END;

-- PRD-DELL-U2723QE
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-DELL-U2723QE')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-DELL-U2723QE', N'Màn hình Dell UltraSharp U2723QE 27'' 4K', N'Tấm nền IPS Black chuẩn đồ họa, cổng Type-C 90W', NULL, 13490000, 11200000, 9, 2, N'chiếc', N'active', 0, GETUTCDATE(), GETUTCDATE(), 5, @SupDell);
END;

-- PRD-ANKER-65W
IF NOT EXISTS (SELECT 1 FROM [Products] WHERE [ProductCode] = N'PRD-ANKER-65W')
BEGIN
    INSERT INTO [Products] ([ProductCode], [Name], [Description], [Image], [Price], [CostPrice], [Quantity], [MinStock], [Unit], [Status], [IsDeleted], [CreatedAt], [UpdatedAt], [CategoryId], [SupplierId])
    VALUES (N'PRD-ANKER-65W', N'Củ sạc nhanh Anker GaNPrime 65W 3 cổng', N'Công nghệ GaN, 2 cổng USB-C và 1 cổng USB-A', NULL, 1050000, 750000, 50, 15, N'cái', N'active', 0, GETUTCDATE(), GETUTCDATE(), 4, @SupAnPhat);
END;
GO

-- ------------------------------------------------------------------------------
-- 3. BỔ SUNG KHÁCH HÀNG (Customers)
-- ------------------------------------------------------------------------------
PRINT N'3. Thêm Khách hàng (Customers)...';

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS003')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS003', N'Hoàng Gia Huy', N'0933112233', N'huy.hoang@gmail.com', N'45 Lê Văn Duyệt, Bình Thạnh, TP.HCM', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS004')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS004', N'Phan Thị Thu Hà', N'0944223344', N'thuha.phan@yahoo.com', N'12 Chùa Bộc, Đống Đa, Hà Nội', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS005')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS005', N'Vũ Đình Trọng', N'0911556677', N'trongvu@outlook.com', N'88 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS006')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS006', N'Lê Mỹ Duyên', N'0977889900', N'duyen.le@gmail.com', N'24 Đại Lộ Hòa Bình, Ninh Kiều, Cần Thơ', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS007')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS007', N'Đỗ Tuấn Khang', N'0988001122', N'khang.do@gmail.com', N'15 Duy Tân, Cầu Giấy, Hà Nội', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Customers] WHERE [CustomerCode] = N'CUS008')
BEGIN
    INSERT INTO [Customers] ([CustomerCode], [Name], [Phone], [Email], [Address], [TotalPurchase], [Status], [CreatedAt], [UpdatedAt])
    VALUES (N'CUS008', N'Trịnh Thảo Nhi', N'0909334455', N'thaonhi99@gmail.com', N'120 Võ Văn Ngân, TP.Thủ Đức, TP.HCM', 0, N'active', GETUTCDATE(), GETUTCDATE());
END;
GO

-- ------------------------------------------------------------------------------
-- 4. BỔ SUNG PHIẾU NHẬP HÀNG (ImportReceipts & ImportDetails)
-- ------------------------------------------------------------------------------
PRINT N'4. Thêm Phiếu nhập hàng (ImportReceipts & ImportDetails)...';

DECLARE @EmpWarehouse INT = (SELECT TOP 1 [Id] FROM [Users] WHERE [Role] = N'warehouse');
IF @EmpWarehouse IS NULL SET @EmpWarehouse = (SELECT TOP 1 [Id] FROM [Users] WHERE [Username] = N'warehouse');
IF @EmpWarehouse IS NULL SET @EmpWarehouse = 1;

DECLARE @SupApple INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP001');
DECLARE @SupSamsung INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP002');
DECLARE @SupDell INT = (SELECT TOP 1 [Id] FROM [Suppliers] WHERE [SupplierCode] = N'SUP005');

-- Phiếu nhập 1: Apple
IF NOT EXISTS (SELECT 1 FROM [ImportReceipts] WHERE [ReceiptCode] = N'IMP-20261001-001')
BEGIN
    INSERT INTO [ImportReceipts] ([ReceiptCode], [TotalAmount], [Note], [Status], [CreatedAt], [UpdatedAt], [SupplierId], [EmployeeId])
    VALUES (N'IMP-20261001-001', 375500000, N'Nhập kho lô hàng đầu tháng từ Apple VN', N'completed', DATEADD(day, -20, GETUTCDATE()), DATEADD(day, -20, GETUTCDATE()), @SupApple, @EmpWarehouse);
    
    DECLARE @ImpId1 INT = SCOPE_IDENTITY();
    
    DECLARE @PrdIP15 INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'IP15PM-256');
    DECLARE @PrdIP16 INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-IP16PM-256');
    DECLARE @PrdAirPods INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-AIRPODS-PRO2');
    
    IF @PrdIP15 IS NOT NULL
        INSERT INTO [ImportDetails] ([Quantity], [ImportPrice], [Total], [ImportReceiptId], [ProductId])
        VALUES (5, 25000000, 125000000, @ImpId1, @PrdIP15);

    IF @PrdIP16 IS NOT NULL
        INSERT INTO [ImportDetails] ([Quantity], [ImportPrice], [Total], [ImportReceiptId], [ProductId])
        VALUES (6, 30500000, 183000000, @ImpId1, @PrdIP16);

    IF @PrdAirPods IS NOT NULL
        INSERT INTO [ImportDetails] ([Quantity], [ImportPrice], [Total], [ImportReceiptId], [ProductId])
        VALUES (14, 4700000, 65800000, @ImpId1, @PrdAirPods);

    -- Ghi log lịch sử biến động kho (InventoryTransactions)
    IF @PrdIP15 IS NOT NULL
        INSERT INTO [InventoryTransactions] ([Type], [Quantity], [BeforeQuantity], [AfterQuantity], [ReferenceId], [Note], [CreatedAt], [ProductId], [EmployeeId])
        VALUES (N'IMPORT', 5, 13, 18, @ImpId1, N'Nhập theo phiếu IMP-20261001-001', DATEADD(day, -20, GETUTCDATE()), @PrdIP15, @EmpWarehouse);

    IF @PrdIP16 IS NOT NULL
        INSERT INTO [InventoryTransactions] ([Type], [Quantity], [BeforeQuantity], [AfterQuantity], [ReferenceId], [Note], [CreatedAt], [ProductId], [EmployeeId])
        VALUES (N'IMPORT', 6, 19, 25, @ImpId1, N'Nhập theo phiếu IMP-20261001-001', DATEADD(day, -20, GETUTCDATE()), @PrdIP16, @EmpWarehouse);
END;

-- Phiếu nhập 2: Dell Technologies
IF NOT EXISTS (SELECT 1 FROM [ImportReceipts] WHERE [ReceiptCode] = N'IMP-20261010-002')
BEGIN
    INSERT INTO [ImportReceipts] ([ReceiptCode], [TotalAmount], [Note], [Status], [CreatedAt], [UpdatedAt], [SupplierId], [EmployeeId])
    VALUES (N'IMP-20261010-002', 157200000, N'Nhập bổ sung màn hình và laptop Dell', N'completed', DATEADD(day, -14, GETUTCDATE()), DATEADD(day, -14, GETUTCDATE()), @SupDell, @EmpWarehouse);
    
    DECLARE @ImpId2 INT = SCOPE_IDENTITY();
    
    DECLARE @PrdDellXps INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-DELL-XPS15');
    DECLARE @PrdDellMonitor INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-DELL-U2723QE');
    
    IF @PrdDellXps IS NOT NULL
        INSERT INTO [ImportDetails] ([Quantity], [ImportPrice], [Total], [ImportReceiptId], [ProductId])
        VALUES (2, 36000000, 72000000, @ImpId2, @PrdDellXps);

    IF @PrdDellMonitor IS NOT NULL
        INSERT INTO [ImportDetails] ([Quantity], [ImportPrice], [Total], [ImportReceiptId], [ProductId])
        VALUES (6, 11200000, 67200000, @ImpId2, @PrdDellMonitor);

    IF @PrdDellXps IS NOT NULL
        INSERT INTO [InventoryTransactions] ([Type], [Quantity], [BeforeQuantity], [AfterQuantity], [ReferenceId], [Note], [CreatedAt], [ProductId], [EmployeeId])
        VALUES (N'IMPORT', 2, 6, 8, @ImpId2, N'Nhập theo phiếu IMP-20261010-002', DATEADD(day, -14, GETUTCDATE()), @PrdDellXps, @EmpWarehouse);
END;
GO

-- ------------------------------------------------------------------------------
-- 5. BỔ SUNG ĐƠN HÀNG (Orders, OrderDetails, Payments)
-- ------------------------------------------------------------------------------
PRINT N'5. Thêm Đơn hàng & Chi tiết & Thanh toán (Orders, OrderDetails, Payments)...';

DECLARE @EmpStaff INT = (SELECT TOP 1 [Id] FROM [Users] WHERE [Role] = N'staff');
IF @EmpStaff IS NULL SET @EmpStaff = (SELECT TOP 1 [Id] FROM [Users] WHERE [Username] = N'staff');
IF @EmpStaff IS NULL SET @EmpStaff = 1;

DECLARE @Cus1 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS001');
DECLARE @Cus2 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS002');
DECLARE @Cus3 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS003');
DECLARE @Cus4 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS004');
DECLARE @Cus5 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS005');
DECLARE @Cus6 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS006');
DECLARE @Cus7 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS007');
DECLARE @Cus8 INT = (SELECT TOP 1 [Id] FROM [Customers] WHERE [CustomerCode] = N'CUS008');

DECLARE @PrdIP15 INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'IP15PM-256');
DECLARE @PrdMacBook INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'MBA-M3-15');
DECLARE @PrdSony INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'SONY-WH5-BLK');
DECLARE @PrdIP16 INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-IP16PM-256');
DECLARE @PrdAirPods INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-AIRPODS-PRO2');
DECLARE @PrdKeychron INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-KEYCHRON-K2');
DECLARE @PrdLogi INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-LOGI-MX3S');
DECLARE @PrdDellXps INT = (SELECT TOP 1 [Id] FROM [Products] WHERE [ProductCode] = N'PRD-DELL-XPS15');

-- Đơn hàng 1: Khách CUS001 (Hoàn thành)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261012-0001')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261012-0001', 35680000, 500000, 35180000, 35180000, N'transfer', N'completed', N'Giao hàng giờ hành chính', 0, DATEADD(day, -12, GETUTCDATE()), DATEADD(day, -12, GETUTCDATE()), @Cus1, @EmpStaff);
    
    DECLARE @Ord1 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 29990000, 29990000, @Ord1, @PrdIP15);
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 5690000, 5690000, @Ord1, @PrdAirPods);

    INSERT INTO [Payments] ([Amount], [PaymentMethod], [TransactionCode], [Note], [CreatedAt], [OrderId], [EmployeeId])
    VALUES (35180000, N'transfer', N'TXN20261012-001', N'Khách đã thanh toán qua Vietcombank', DATEADD(day, -12, GETUTCDATE()), @Ord1, @EmpStaff);

    INSERT INTO [InventoryTransactions] ([Type], [Quantity], [BeforeQuantity], [AfterQuantity], [ReferenceId], [Note], [CreatedAt], [ProductId], [EmployeeId])
    VALUES (N'SALE', 1, 19, 18, @Ord1, N'Xuất bán đơn ORD-20261012-0001', DATEADD(day, -12, GETUTCDATE()), @PrdIP15, @EmpStaff);
END;

-- Đơn hàng 2: Khách CUS003 (Hoàn thành)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261015-0002')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261015-0002', 32490000, 0, 32490000, 32490000, N'card', N'completed', N'Khách thanh toán quẹt thẻ tại quầy', 0, DATEADD(day, -9, GETUTCDATE()), DATEADD(day, -9, GETUTCDATE()), @Cus3, @EmpStaff);
    
    DECLARE @Ord2 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 32490000, 32490000, @Ord2, @PrdMacBook);

    INSERT INTO [Payments] ([Amount], [PaymentMethod], [TransactionCode], [Note], [CreatedAt], [OrderId], [EmployeeId])
    VALUES (32490000, N'card', N'POS20261015-889', N'Quẹt thẻ tín dụng Techcombank', DATEADD(day, -9, GETUTCDATE()), @Ord2, @EmpStaff);
    
    UPDATE [Customers] SET [TotalPurchase] = [TotalPurchase] + 32490000 WHERE [Id] = @Cus3;
END;

-- Đơn hàng 3: Khách CUS004 (Hoàn thành)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261018-0003')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261018-0003', 4680000, 200000, 4480000, 4480000, N'cash', N'completed', N'Mua combo chuột & bàn phím', 0, DATEADD(day, -6, GETUTCDATE()), DATEADD(day, -6, GETUTCDATE()), @Cus4, @EmpStaff);
    
    DECLARE @Ord3 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 2490000, 2490000, @Ord3, @PrdLogi);

    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 2190000, 2190000, @Ord3, @PrdKeychron);

    INSERT INTO [Payments] ([Amount], [PaymentMethod], [TransactionCode], [Note], [CreatedAt], [OrderId], [EmployeeId])
    VALUES (4480000, N'cash', NULL, N'Thu tiền mặt tại quầy', DATEADD(day, -6, GETUTCDATE()), @Ord3, @EmpStaff);

    UPDATE [Customers] SET [TotalPurchase] = [TotalPurchase] + 4480000 WHERE [Id] = @Cus4;
END;

-- Đơn hàng 4: Khách CUS005 (Đang xác nhận / Đặt cọc)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261021-0004')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261021-0004', 34990000, 0, 34990000, 10000000, N'transfer', N'confirmed', N'Khách đã cọc 10tr, giao hàng sau', 0, DATEADD(day, -3, GETUTCDATE()), DATEADD(day, -3, GETUTCDATE()), @Cus5, @EmpStaff);
    
    DECLARE @Ord4 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 34990000, 34990000, @Ord4, @PrdIP16);

    INSERT INTO [Payments] ([Amount], [PaymentMethod], [TransactionCode], [Note], [CreatedAt], [OrderId], [EmployeeId])
    VALUES (10000000, N'transfer', N'MB-8383921', N'Đặt cọc trước giữ hàng', DATEADD(day, -3, GETUTCDATE()), @Ord4, @EmpStaff);
END;

-- Đơn hàng 5: Khách CUS006 (Chờ xử lý)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261023-0005')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261023-0005', 7490000, 0, 7490000, 0, N'cash', N'pending', N'Đơn đặt online, chờ gọi xác nhận', 0, DATEADD(day, -2, GETUTCDATE()), DATEADD(day, -2, GETUTCDATE()), @Cus6, @EmpStaff);
    
    DECLARE @Ord5 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 7490000, 7490000, @Ord5, @PrdSony);
END;

-- Đơn hàng 6: Khách CUS007 (Đã hủy)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261024-0006')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261024-0006', 42990000, 0, 42990000, 0, N'transfer', N'cancelled', N'Khách đổi nhu cầu sang bản màn hình 4K', 0, DATEADD(day, -1, GETUTCDATE()), DATEADD(day, -1, GETUTCDATE()), @Cus7, @EmpStaff);
    
    DECLARE @Ord6 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 42990000, 42990000, @Ord6, @PrdDellXps);
END;

-- Đơn hàng 7: Khách CUS008 (Hoàn thành)
IF NOT EXISTS (SELECT 1 FROM [Orders] WHERE [OrderCode] = N'ORD-20261025-0007')
BEGIN
    INSERT INTO [Orders] ([OrderCode], [TotalAmount], [Discount], [FinalAmount], [PaidAmount], [PaymentMethod], [Status], [Note], [IsDeleted], [CreatedAt], [UpdatedAt], [CustomerId], [EmployeeId])
    VALUES (N'ORD-20261025-0007', 8180000, 300000, 7880000, 7880000, N'transfer', N'completed', N'Thanh toán chuyển khoản 100%', 0, GETUTCDATE(), GETUTCDATE(), @Cus8, @EmpStaff);
    
    DECLARE @Ord7 INT = SCOPE_IDENTITY();
    
    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 5690000, 5690000, @Ord7, @PrdAirPods);

    INSERT INTO [OrderDetails] ([Quantity], [ReturnedQuantity], [Price], [Total], [OrderId], [ProductId])
    VALUES (1, 0, 2490000, 2490000, @Ord7, @PrdLogi);

    INSERT INTO [Payments] ([Amount], [PaymentMethod], [TransactionCode], [Note], [CreatedAt], [OrderId], [EmployeeId])
    VALUES (7880000, N'transfer', N'TPB-9988776', N'Chuyển qua TPBank QR', GETUTCDATE(), @Ord7, @EmpStaff);

    UPDATE [Customers] SET [TotalPurchase] = [TotalPurchase] + 7880000 WHERE [Id] = @Cus8;
END;
GO

-- ------------------------------------------------------------------------------
-- 6. BỔ SUNG MÃ KHUYẾN MÃI (Promotions) & THÔNG BÁO (Notifications)
-- ------------------------------------------------------------------------------
PRINT N'6. Thêm Khuyến mãi & Thông báo (Promotions & Notifications)...';

IF NOT EXISTS (SELECT 1 FROM [Promotions] WHERE [Code] = N'TECHFEST2026')
BEGIN
    INSERT INTO [Promotions] ([Name], [Code], [Description], [DiscountType], [DiscountValue], [StartsAt], [EndsAt], [IsActive], [CreatedAt], [UpdatedAt])
    VALUES (N'Ưu đãi Lễ hội Công nghệ 2026', N'TECHFEST2026', N'Giảm 10% tối đa cho đơn linh kiện và phụ kiện', N'percent', 10.00, DATEADD(month, -1, GETUTCDATE()), DATEADD(month, 2, GETUTCDATE()), 1, GETUTCDATE(), GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Promotions] WHERE [Code] = N'WELCOME50K')
BEGIN
    INSERT INTO [Promotions] ([Name], [Code], [Description], [DiscountType], [DiscountValue], [StartsAt], [EndsAt], [IsActive], [CreatedAt], [UpdatedAt])
    VALUES (N'Quà tặng khách hàng mới', N'WELCOME50K', N'Giảm trực tiếp 50,000đ cho đơn hàng đầu tiên', N'fixed', 50000.00, DATEADD(month, -1, GETUTCDATE()), DATEADD(month, 3, GETUTCDATE()), 1, GETUTCDATE(), GETUTCDATE());
END;

-- Thêm thông báo
IF NOT EXISTS (SELECT 1 FROM [Notifications] WHERE [Title] LIKE N'%cảnh báo tồn kho%')
BEGIN
    INSERT INTO [Notifications] ([Title], [Message], [Type], [IsRead], [UserId], [CreatedAt])
    VALUES (N'Cảnh báo tồn kho thấp', N'Sản phẩm Samsung Galaxy S24 Ultra 512GB hiện đã hết hàng (số lượng = 0). Cần lập phiếu nhập kho gấp.', N'warning', 0, 1, GETUTCDATE());
END;

IF NOT EXISTS (SELECT 1 FROM [Notifications] WHERE [Title] LIKE N'%đơn hàng mới%')
BEGIN
    INSERT INTO [Notifications] ([Title], [Message], [Type], [IsRead], [UserId], [CreatedAt])
    VALUES (N'Có đơn hàng mới cần xác nhận', N'Đơn hàng ORD-20261023-0005 của khách hàng Lê Mỹ Duyên đang chờ duyệt.', N'info', 0, 1, GETUTCDATE());
END;

PRINT N'>>> HOÀN TẤT BỔ SUNG DỮ LIỆU THÀNH CÔNG!';
GO
