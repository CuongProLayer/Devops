param(
    [Parameter(Position = 0)]
    [string]$Query,

    [switch]$Interactive,
    [string]$Database = "SmartStockDB",
    [string]$Server = "localhost"
)

function Execute-SqlQuery {
    param([string]$Sql)
    
    $connStr = "Server=$Server;Database=$Database;Integrated Security=True;TrustServerCertificate=True;"
    $conn = New-Object System.Data.SqlClient.SqlConnection($connStr)
    try {
        $conn.Open()
        $cmd = $conn.CreateCommand()
        $cmd.CommandText = $Sql
        $adapter = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
        $ds = New-Object System.Data.DataSet
        $null = $adapter.Fill($ds)
        if ($ds.Tables.Count -gt 0 -and $ds.Tables[0].Rows.Count -gt 0) {
            $ds.Tables[0] | Format-Table -AutoSize
        } else {
            Write-Host "-> Câu lệnh thực thi thành công (Không có bản ghi hoặc là lệnh DDL/DML)." -ForegroundColor Green
        }
    } catch {
        Write-Host "Lỗi SQL: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        $conn.Close()
    }
}

if ($Interactive) {
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "   SQL TERMINAL CONSOLE - $Database" -ForegroundColor Cyan
    Write-Host "   Gõ lệnh SQL để truy vấn, gõ 'exit' hoặc 'quit' để thoát." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Cyan

    while ($true) {
        $inputSql = Read-Host "SQL"
        if ($inputSql -in @("exit", "quit", "q")) { break }
        if ([string]::IsNullOrWhiteSpace($inputSql)) { continue }
        Execute-SqlQuery -Sql $inputSql
    }
} elseif (-not [string]::IsNullOrWhiteSpace($Query)) {
    Execute-SqlQuery -Sql $Query
} else {
    Write-Host "=== CÁC BẢNG TRONG DATABASE [$Database] ===" -ForegroundColor Cyan
    Execute-SqlQuery -Sql "SELECT TABLE_NAME AS [Tên Bảng], TABLE_TYPE AS [Loại] FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
    Write-Host "`nGợi ý: " -ForegroundColor Yellow
    Write-Host "  .\scripts\query-db.ps1 `"SELECT TOP 5 * FROM Products`"" -ForegroundColor Gray
    Write-Host "  .\scripts\query-db.ps1 -Interactive  (Vào chế độ gõ lệnh SQL trực tiếp)" -ForegroundColor Gray
}

