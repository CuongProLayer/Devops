param (
    [string]$JenkinsUrl = "http://localhost:8080",
    [string]$JobName = "smartstock-pipeline",
    [Parameter(Mandatory=$true)]
    [string]$User,
    [Parameter(Mandatory=$true)]
    [string]$PasswordOrToken
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   TU DONG TAO PIPELINE JOB TREN JENKINS QUA REST API" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$base64Auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("${User}:${PasswordOrToken}"))
$headers = @{
    "Authorization" = "Basic $base64Auth"
}

# 1. Lay CSRF Crumb
Write-Host "`n[1/3] Lay CSRF Crumb Token tu Jenkins..." -ForegroundColor Yellow
try {
    $crumbResponse = Invoke-RestMethod -Uri "$JenkinsUrl/crumbIssuer/api/json" -Headers $headers -Method Get
    $crumbField = $crumbResponse.crumbRequestField
    $crumbValue = $crumbResponse.crumb
    $headers[$crumbField] = $crumbValue
    Write-Host " -> Lay Crumb thanh cong ($crumbField: $crumbValue)" -ForegroundColor Green
} catch {
    Write-Host " -> Khong can Crumb hoac Crumb issuer chua bat (tiep tuc)..." -ForegroundColor Gray
}

# 2. Doc file xml config
$xmlPath = Join-Path $PSScriptRoot "job-config.xml"
$xmlContent = [System.IO.File]::ReadAllText($xmlPath)

# 3. Tao Job qua REST API
Write-Host "`n[2/3] Dang tao Pipeline Job '$JobName'..." -ForegroundColor Yellow
$headers["Content-Type"] = "application/xml"

try {
    $createUrl = "$JenkinsUrl/createItem?name=$JobName"
    $response = Invoke-WebRequest -Uri $createUrl -Headers $headers -Method Post -Body $xmlContent
    Write-Host " -> Tao Job '$JobName' thanh cong!" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400) {
        Write-Host " -> Job '$JobName' da ton tai! Dang cap nhat cau hinh..." -ForegroundColor Yellow
        $updateUrl = "$JenkinsUrl/job/$JobName/config.xml"
        $response = Invoke-WebRequest -Uri $updateUrl -Headers $headers -Method Post -Body $xmlContent
        Write-Host " -> Cap nhat Job '$JobName' thanh cong!" -ForegroundColor Green
    } else {
        Write-Host " [!] Loi tao job: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

Write-Host "`n[3/3] Kiem tra duong dan Job..." -ForegroundColor Yellow
Write-Host " Link truc tiep den Pipeline Job:" -ForegroundColor Cyan
Write-Host " $JenkinsUrl/job/$JobName/" -ForegroundColor Yellow -BackgroundColor Black
Write-Host "==========================================================" -ForegroundColor Green
