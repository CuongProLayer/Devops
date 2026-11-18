const fs = require('fs');

async function exportBackup() {
  try {
    const prodRes = await fetch('http://localhost:5086/api/products?pageSize=300');
    const prodData = await prodRes.json();
    const products = prodData.items || prodData || [];

    const catRes = await fetch('http://localhost:5086/api/categories');
    const categories = await catRes.json();

    let sql = `-- SMARTSTOCK DATABASE BACKUP (125 PRODUCTS + FULL CATEGORIES)\n`;
    sql += `-- Generated at: ${new Date().toISOString()}\n\n`;
    sql += `USE [SmartStockDB];\nGO\n\n`;

    // 1. Categories
    sql += `-- 1. UPDATE/INSERT CATEGORIES\n`;
    for (const c of categories) {
      const name = (c.name || '').replace(/'/g, "''");
      const desc = (c.description || '').replace(/'/g, "''");
      const icon = (c.icon || '').replace(/'/g, "''");
      const img = (c.imageUrl || '').replace(/'/g, "''");
      const cType = (c.imageContentType || 'image/jpeg').replace(/'/g, "''");
      sql += `IF EXISTS (SELECT 1 FROM Categories WHERE Id = ${c.id}) BEGIN\n`;
      sql += `    UPDATE Categories SET Name = N'${name}', Description = N'${desc}', Icon = N'${icon}', ImageUrl = '${img}', ImageContentType = '${cType}', IsActive = 1 WHERE Id = ${c.id};\n`;
      sql += `END ELSE BEGIN\n`;
      sql += `    SET IDENTITY_INSERT Categories ON;\n`;
      sql += `    INSERT INTO Categories (Id, Name, Description, Icon, ImageUrl, ImageContentType, IsActive, CreatedAt) VALUES (${c.id}, N'${name}', N'${desc}', N'${icon}', '${img}', '${cType}', 1, GETUTCDATE());\n`;
      sql += `    SET IDENTITY_INSERT Categories OFF;\n`;
      sql += `END\n`;
    }
    sql += `GO\n\n`;

    // 2. Products
    sql += `-- 2. UPDATE/INSERT 125 PRODUCTS WITH COMPLETE UPLOADED IMAGES\n`;
    for (const p of products) {
      const name = (p.name || '').replace(/'/g, "''");
      const code = (p.productCode || '').replace(/'/g, "''");
      const desc = (p.description || '').replace(/'/g, "''");
      const img = (p.image || '').replace(/'/g, "''");
      const price = Number(p.price) || 0;
      const cost = Number(p.costPrice) || 0;
      const qty = Number(p.quantity) || 25;
      const catId = p.categoryId ? Number(p.categoryId) : 'NULL';
      const status = (p.status || 'active').replace(/'/g, "''");

      sql += `IF EXISTS (SELECT 1 FROM Products WHERE Id = ${p.id}) BEGIN\n`;
      sql += `    UPDATE Products SET Name = N'${name}', ProductCode = '${code}', Price = ${price}, CostPrice = ${cost}, Quantity = ${qty}, CategoryId = ${catId}, Status = '${status}', Image = '${img}', IsDeleted = 0, UpdatedAt = GETUTCDATE() WHERE Id = ${p.id};\n`;
      sql += `END ELSE BEGIN\n`;
      sql += `    SET IDENTITY_INSERT Products ON;\n`;
      sql += `    INSERT INTO Products (Id, ProductCode, Name, Description, Price, CostPrice, Quantity, MinStock, Unit, CategoryId, Status, Image, IsDeleted, CreatedAt, UpdatedAt) VALUES (${p.id}, '${code}', N'${name}', N'${desc}', ${price}, ${cost}, ${qty}, 5, N'cái', ${catId}, '${status}', '${img}', 0, GETUTCDATE(), GETUTCDATE());\n`;
      sql += `    SET IDENTITY_INSERT Products OFF;\n`;
      sql += `END\n`;
    }
    sql += `GO\n\nPRINT N'==> Backup completed successfully!';\nGO\n`;

    fs.writeFileSync('scripts/Backup_SmartStock_125_Products.sql', sql, 'utf8');
    console.log(`Backup written successfully! Total products: ${products.length}, Categories: ${categories.length}`);
  } catch (err) {
    console.error('Backup error:', err);
  }
}

exportBackup();
