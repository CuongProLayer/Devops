IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(450) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Icon] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Customers] (
        [Id] int NOT NULL IDENTITY,
        [CustomerCode] nvarchar(450) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NULL,
        [Email] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [TotalPurchase] decimal(18,2) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Suppliers] (
        [Id] int NOT NULL IDENTITY,
        [SupplierCode] nvarchar(450) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NULL,
        [Email] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [ContactPerson] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Suppliers] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Username] nvarchar(450) NOT NULL,
        [Email] nvarchar(450) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [FullName] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NOT NULL,
        [Role] nvarchar(max) NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Products] (
        [Id] int NOT NULL IDENTITY,
        [ProductCode] nvarchar(450) NOT NULL,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NULL,
        [Image] nvarchar(max) NULL,
        [Price] decimal(18,2) NOT NULL,
        [CostPrice] decimal(18,2) NOT NULL,
        [Quantity] int NOT NULL,
        [MinStock] int NOT NULL,
        [Unit] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [IsDeleted] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [CategoryId] int NOT NULL,
        [SupplierId] int NULL,
        CONSTRAINT [PK_Products] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Products_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Products_Suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [ImportReceipts] (
        [Id] int NOT NULL IDENTITY,
        [ReceiptCode] nvarchar(450) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [Note] nvarchar(max) NULL,
        [Status] nvarchar(max) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [SupplierId] int NOT NULL,
        [EmployeeId] int NOT NULL,
        CONSTRAINT [PK_ImportReceipts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ImportReceipts_Suppliers_SupplierId] FOREIGN KEY ([SupplierId]) REFERENCES [Suppliers] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ImportReceipts_Users_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [Id] int NOT NULL IDENTITY,
        [Title] nvarchar(max) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Type] nvarchar(max) NOT NULL,
        [IsRead] bit NOT NULL,
        [UserId] int NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] int NOT NULL IDENTITY,
        [OrderCode] nvarchar(450) NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [Discount] decimal(18,2) NOT NULL,
        [FinalAmount] decimal(18,2) NOT NULL,
        [PaidAmount] decimal(18,2) NOT NULL,
        [PaymentMethod] nvarchar(max) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [Note] nvarchar(max) NULL,
        [IdempotencyKey] nvarchar(max) NULL,
        [IsDeleted] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        [CustomerId] int NULL,
        [EmployeeId] int NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]),
        CONSTRAINT [FK_Orders_Users_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [InventoryTransactions] (
        [Id] int NOT NULL IDENTITY,
        [Type] nvarchar(max) NOT NULL,
        [Quantity] int NOT NULL,
        [BeforeQuantity] int NOT NULL,
        [AfterQuantity] int NOT NULL,
        [ReferenceId] int NULL,
        [Note] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ProductId] int NOT NULL,
        [EmployeeId] int NOT NULL,
        CONSTRAINT [PK_InventoryTransactions] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_InventoryTransactions_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_InventoryTransactions_Users_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [ImportDetails] (
        [Id] int NOT NULL IDENTITY,
        [Quantity] int NOT NULL,
        [ImportPrice] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        [ImportReceiptId] int NOT NULL,
        [ProductId] int NOT NULL,
        CONSTRAINT [PK_ImportDetails] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ImportDetails_ImportReceipts_ImportReceiptId] FOREIGN KEY ([ImportReceiptId]) REFERENCES [ImportReceipts] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_ImportDetails_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderDetails] (
        [Id] int NOT NULL IDENTITY,
        [Quantity] int NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [Total] decimal(18,2) NOT NULL,
        [OrderId] int NOT NULL,
        [ProductId] int NOT NULL,
        CONSTRAINT [PK_OrderDetails] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderDetails_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_OrderDetails_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE TABLE [Payments] (
        [Id] int NOT NULL IDENTITY,
        [Amount] decimal(18,2) NOT NULL,
        [PaymentMethod] nvarchar(max) NOT NULL,
        [TransactionCode] nvarchar(max) NULL,
        [Note] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        [OrderId] int NOT NULL,
        [EmployeeId] int NOT NULL,
        CONSTRAINT [PK_Payments] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Payments_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_Payments_Users_EmployeeId] FOREIGN KEY ([EmployeeId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Icon', N'IsActive', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] ON;
    EXEC(N'INSERT INTO [Categories] ([Id], [CreatedAt], [Description], [Icon], [IsActive], [Name])
    VALUES (1, ''2026-01-01T00:00:00.0000000'', N''Smartphone các hãng'', N''📱'', CAST(1 AS bit), N''Điện thoại''),
    (2, ''2026-01-01T00:00:00.0000000'', N''Máy tính xách tay'', N''💻'', CAST(1 AS bit), N''Laptop''),
    (3, ''2026-01-01T00:00:00.0000000'', N''Tablet'', N''📲'', CAST(1 AS bit), N''Máy tính bảng''),
    (4, ''2026-01-01T00:00:00.0000000'', N''Tai nghe, chuột, bàn phím'', N''🎧'', CAST(1 AS bit), N''Phụ kiện''),
    (5, ''2026-01-01T00:00:00.0000000'', N''Monitor'', N''🖥️'', CAST(1 AS bit), N''Màn hình'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Description', N'Icon', N'IsActive', N'Name') AND [object_id] = OBJECT_ID(N'[Categories]'))
        SET IDENTITY_INSERT [Categories] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CreatedAt', N'CustomerCode', N'Email', N'Name', N'Phone', N'Status', N'TotalPurchase', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Customers]'))
        SET IDENTITY_INSERT [Customers] ON;
    EXEC(N'INSERT INTO [Customers] ([Id], [Address], [CreatedAt], [CustomerCode], [Email], [Name], [Phone], [Status], [TotalPurchase], [UpdatedAt])
    VALUES (1, N''Quận 1, TP.HCM'', ''2026-01-01T00:00:00.0000000'', N''CUS001'', N''anh@gmail.com'', N''Nguyễn Minh Anh'', N''0912345678'', N''active'', 62480000.0, ''2026-01-01T00:00:00.0000000''),
    (2, N''Quận 3, TP.HCM'', ''2026-01-01T00:00:00.0000000'', N''CUS002'', N''bao@gmail.com'', N''Trần Quốc Bảo'', N''0987654321'', N''active'', 7490000.0, ''2026-01-01T00:00:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'CreatedAt', N'CustomerCode', N'Email', N'Name', N'Phone', N'Status', N'TotalPurchase', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Customers]'))
        SET IDENTITY_INSERT [Customers] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'ContactPerson', N'CreatedAt', N'Email', N'Name', N'Phone', N'Status', N'SupplierCode', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Suppliers]'))
        SET IDENTITY_INSERT [Suppliers] ON;
    EXEC(N'INSERT INTO [Suppliers] ([Id], [Address], [ContactPerson], [CreatedAt], [Email], [Name], [Phone], [Status], [SupplierCode], [UpdatedAt])
    VALUES (1, N''TP.HCM'', N''Apple VN'', ''2026-01-01T00:00:00.0000000'', N''contact@apple.vn'', N''Apple Distribution VN'', N''02812345678'', N''active'', N''SUP001'', ''2026-01-01T00:00:00.0000000''),
    (2, N''Hà Nội'', N''Samsung VN'', ''2026-01-01T00:00:00.0000000'', N''partner@samsung.vn'', N''Samsung Electronics VN'', N''02887654321'', N''active'', N''SUP002'', ''2026-01-01T00:00:00.0000000''),
    (3, N''Hà Nội'', N''Nguyễn An'', ''2026-01-01T00:00:00.0000000'', N''sales@anphat.vn'', N''An Phát Accessories'', N''02899887766'', N''active'', N''SUP003'', ''2026-01-01T00:00:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'Address', N'ContactPerson', N'CreatedAt', N'Email', N'Name', N'Phone', N'Status', N'SupplierCode', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Suppliers]'))
        SET IDENTITY_INSERT [Suppliers] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'PasswordHash', N'Phone', N'Role', N'UpdatedAt', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] ON;
    EXEC(N'INSERT INTO [Users] ([Id], [CreatedAt], [Email], [FullName], [IsActive], [PasswordHash], [Phone], [Role], [UpdatedAt], [Username])
    VALUES (1, ''2026-01-01T00:00:00.0000000'', N''admin@smartstock.vn'', N''Quản trị viên'', CAST(1 AS bit), N''$2a$11$AZ3yy4QMKChWNuqVMla1bObFZu1uivXKwb3DH2o3YNYfMhoezZKYa'', N''0900000001'', N''admin'', ''2026-01-01T00:00:00.0000000'', N''admin''),
    (2, ''2026-01-01T00:00:00.0000000'', N''warehouse@smartstock.vn'', N''Trần Minh Kho'', CAST(1 AS bit), N''$2a$11$dgdh5FT7L.vuJg4aF.kN4e1N3VX1AqVb80LwQQ2AnMg4XrWt9Fv8.'', N''0900000002'', N''warehouse'', ''2026-01-01T00:00:00.0000000'', N''warehouse''),
    (3, ''2026-01-01T00:00:00.0000000'', N''staff@smartstock.vn'', N''Nguyễn Hà Sales'', CAST(1 AS bit), N''$2a$11$NgkLu8aLGhR85Hx8dtzRp.DnTIy6atNsyuPygZCOjjKRk92QS8/hy'', N''0900000003'', N''staff'', ''2026-01-01T00:00:00.0000000'', N''staff'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CreatedAt', N'Email', N'FullName', N'IsActive', N'PasswordHash', N'Phone', N'Role', N'UpdatedAt', N'Username') AND [object_id] = OBJECT_ID(N'[Users]'))
        SET IDENTITY_INSERT [Users] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CategoryId', N'CostPrice', N'CreatedAt', N'Description', N'Image', N'IsDeleted', N'MinStock', N'Name', N'Price', N'ProductCode', N'Quantity', N'Status', N'SupplierId', N'Unit', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] ON;
    EXEC(N'INSERT INTO [Products] ([Id], [CategoryId], [CostPrice], [CreatedAt], [Description], [Image], [IsDeleted], [MinStock], [Name], [Price], [ProductCode], [Quantity], [Status], [SupplierId], [Unit], [UpdatedAt])
    VALUES (1, 1, 25000000.0, ''2026-01-01T00:00:00.0000000'', N''iPhone 15 Pro Max chính hãng VN/A'', NULL, CAST(0 AS bit), 5, N''iPhone 15 Pro Max 256GB'', 29990000.0, N''IP15PM-256'', 18, N''active'', 1, N''cái'', ''2026-01-01T00:00:00.0000000''),
    (2, 2, 27000000.0, ''2026-01-01T00:00:00.0000000'', N''MacBook Air chip M3 màn 15 inch'', NULL, CAST(0 AS bit), 3, N''MacBook Air M3 15 inch'', 32490000.0, N''MBA-M3-15'', 7, N''active'', 1, N''cái'', ''2026-01-01T00:00:00.0000000''),
    (3, 4, 5500000.0, ''2026-01-01T00:00:00.0000000'', N''Tai nghe chống ồn cao cấp'', NULL, CAST(0 AS bit), 5, N''Sony WH-1000XM5'', 7490000.0, N''SONY-WH5-BLK'', 24, N''active'', 3, N''cái'', ''2026-01-01T00:00:00.0000000''),
    (4, 1, 21000000.0, ''2026-01-01T00:00:00.0000000'', N''Samsung flagship 2026'', NULL, CAST(0 AS bit), 5, N''Samsung Galaxy S24 Ultra 512GB'', 25990000.0, N''SS-S24U-512'', 0, N''active'', 2, N''cái'', ''2026-01-01T00:00:00.0000000''),
    (5, 3, 18000000.0, ''2026-01-01T00:00:00.0000000'', N''iPad Pro chip M4 màn 11 inch'', NULL, CAST(0 AS bit), 3, N''iPad Pro M4 11 inch'', 21990000.0, N''IPAD-M4-11'', 13, N''active'', 1, N''cái'', ''2026-01-01T00:00:00.0000000'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'Id', N'CategoryId', N'CostPrice', N'CreatedAt', N'Description', N'Image', N'IsDeleted', N'MinStock', N'Name', N'Price', N'ProductCode', N'Quantity', N'Status', N'SupplierId', N'Unit', N'UpdatedAt') AND [object_id] = OBJECT_ID(N'[Products]'))
        SET IDENTITY_INSERT [Products] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Categories_Name] ON [Categories] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Customers_CustomerCode] ON [Customers] ([CustomerCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ImportDetails_ImportReceiptId] ON [ImportDetails] ([ImportReceiptId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ImportDetails_ProductId] ON [ImportDetails] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ImportReceipts_EmployeeId] ON [ImportReceipts] ([EmployeeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ImportReceipts_ReceiptCode] ON [ImportReceipts] ([ReceiptCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ImportReceipts_SupplierId] ON [ImportReceipts] ([SupplierId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InventoryTransactions_EmployeeId] ON [InventoryTransactions] ([EmployeeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_InventoryTransactions_ProductId] ON [InventoryTransactions] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderDetails_OrderId] ON [OrderDetails] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderDetails_ProductId] ON [OrderDetails] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_EmployeeId] ON [Orders] ([EmployeeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Orders_OrderCode] ON [Orders] ([OrderCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Payments_EmployeeId] ON [Payments] ([EmployeeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Payments_OrderId] ON [Payments] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_CategoryId] ON [Products] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Products_ProductCode] ON [Products] ([ProductCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Products_SupplierId] ON [Products] ([SupplierId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Suppliers_SupplierCode] ON [Suppliers] ([SupplierCode]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Username] ON [Users] ([Username]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261001063510_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261001063510_InitialCreate', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002080647_AddPromotionsAndProductReviews'
)
BEGIN
    CREATE TABLE [ProductReviews] (
        [Id] int NOT NULL IDENTITY,
        [CustomerName] nvarchar(max) NOT NULL,
        [CustomerEmail] nvarchar(max) NULL,
        [Rating] int NOT NULL,
        [Comment] nvarchar(max) NOT NULL,
        [IsApproved] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [ProductId] int NOT NULL,
        CONSTRAINT [PK_ProductReviews] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_ProductReviews_Products_ProductId] FOREIGN KEY ([ProductId]) REFERENCES [Products] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002080647_AddPromotionsAndProductReviews'
)
BEGIN
    CREATE TABLE [Promotions] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Code] nvarchar(450) NOT NULL,
        [Description] nvarchar(max) NULL,
        [DiscountType] nvarchar(max) NOT NULL,
        [DiscountValue] decimal(18,2) NOT NULL,
        [StartsAt] datetime2 NOT NULL,
        [EndsAt] datetime2 NOT NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Promotions] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002080647_AddPromotionsAndProductReviews'
)
BEGIN
    CREATE INDEX [IX_ProductReviews_ProductId] ON [ProductReviews] ([ProductId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002080647_AddPromotionsAndProductReviews'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Promotions_Code] ON [Promotions] ([Code]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002080647_AddPromotionsAndProductReviews'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002080647_AddPromotionsAndProductReviews', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    ALTER TABLE [Categories] ADD [ImageUrl] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageUrl] = NULL
    WHERE [Id] = 1;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageUrl] = NULL
    WHERE [Id] = 2;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageUrl] = NULL
    WHERE [Id] = 3;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageUrl] = NULL
    WHERE [Id] = 4;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageUrl] = NULL
    WHERE [Id] = 5;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002082233_AddCategoryImage'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002082233_AddCategoryImage', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    ALTER TABLE [Categories] ADD [ImageContentType] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageContentType] = NULL
    WHERE [Id] = 1;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageContentType] = NULL
    WHERE [Id] = 2;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageContentType] = NULL
    WHERE [Id] = 3;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageContentType] = NULL
    WHERE [Id] = 4;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    EXEC(N'UPDATE [Categories] SET [ImageContentType] = NULL
    WHERE [Id] = 5;
    SELECT @@ROWCOUNT');
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002092544_AddCategoryImageContentType'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002092544_AddCategoryImageContentType', N'10.0.12');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002095009_TrackReturnedOrderQuantities'
)
BEGIN
    ALTER TABLE [OrderDetails] ADD [ReturnedQuantity] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261002095009_TrackReturnedOrderQuantities'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261002095009_TrackReturnedOrderQuantities', N'10.0.12');
END;

COMMIT;
GO

