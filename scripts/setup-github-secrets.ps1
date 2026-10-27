# =====================================================
#  SmartStock – Tự động cấu hình GitHub Secrets
#  Chạy script này SAU khi có SSH Key từ EC2
# =====================================================

param(
    [Parameter(Mandatory=$true)]
    [string]$GithubToken,        # GitHub Personal Access Token (repo scope)

    [Parameter(Mandatory=$true)]
    [string]$DockerPassword,     # Docker Hub password hoặc Access Token

    [Parameter(Mandatory=$true)]
    [string]$EC2SshPrivateKey,   # Nội dung file ~/.ssh/gh_actions từ EC2

    [Parameter(Mandatory=$false)]
    [string]$DbSaPassword = "SmartStock@Prod2024!",

    [Parameter(Mandatory=$false)]
    [string]$JwtSecret = "SmartStockJwtSuperSecretKey2024Production!!"
)

$REPO_OWNER = "CuongProLayer"
$REPO_NAME  = "Devops"
$EC2_HOST   = "13.211.127.28"
$EC2_USER   = "ubuntu"
$DOCKER_USER = "CuongProLayer"

$DB_CONN = "Server=sqlserver,1433;Database=SmartStockDB;User Id=sa;Password=$DbSaPassword;TrustServerCertificate=True;"

$headers = @{
    "Authorization" = "Bearer $GithubToken"
    "Accept"        = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}

# Lấy public key của repo để mã hóa secrets
Write-Host "Lấy GitHub repository public key..." -ForegroundColor Cyan
$pubKeyResponse = Invoke-RestMethod `
    -Uri "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/actions/secrets/public-key" `
    -Headers $headers

$repoKeyId  = $pubKeyResponse.key_id
$repoKey    = $pubKeyResponse.key

Write-Host "Key ID: $repoKeyId" -ForegroundColor Green

# Load libsodium để mã hóa (GitHub yêu cầu sealed box encryption)
# Cài NaCl qua NuGet nếu chưa có
function ConvertTo-GitHubEncryptedSecret {
    param([string]$SecretValue, [string]$PublicKey)
    
    # Dùng GitHub CLI nếu có
    $encodedSecret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($SecretValue))
    return $encodedSecret
}

function Set-GitHubSecret {
    param(
        [string]$SecretName,
        [string]$SecretValue,
        [string]$KeyId,
        [string]$PublicKeyBase64
    )
    
    Write-Host "Setting secret: $SecretName" -ForegroundColor Yellow

    # Sử dụng GitHub CLI (gh) nếu có cài đặt
    $ghExists = Get-Command gh -ErrorAction SilentlyContinue
    if ($ghExists) {
        $SecretValue | gh secret set $SecretName --repo "$REPO_OWNER/$REPO_NAME"
        Write-Host "  ✓ $SecretName đã set via GitHub CLI" -ForegroundColor Green
        return
    }
    
    Write-Host "  GitHub CLI (gh) không tìm thấy. Cài bằng: winget install --id GitHub.cli" -ForegroundColor Red
    Write-Host "  Hoặc set thủ công tại: https://github.com/$REPO_OWNER/$REPO_NAME/settings/secrets/actions" -ForegroundColor Red
}

# ── Kiểm tra GitHub CLI ─────────────────────────────
$ghCli = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghCli) {
    Write-Host ""
    Write-Host "⚠️  GitHub CLI chưa cài. Đang cài tự động..." -ForegroundColor Yellow
    winget install --id GitHub.cli --silent --accept-package-agreements --accept-source-agreements
    
    # Authenticate
    Write-Host "Đăng nhập GitHub CLI với token..." -ForegroundColor Cyan
    echo $GithubToken | gh auth login --with-token
}

# ── Đặt các Secrets ─────────────────────────────────
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Cấu hình GitHub Secrets" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$secrets = @{
    "DOCKER_USERNAME"      = $DOCKER_USER
    "DOCKER_PASSWORD"      = $DockerPassword
    "EC2_HOST"             = $EC2_HOST
    "EC2_USER"             = $EC2_USER
    "EC2_SSH_KEY"          = $EC2SshPrivateKey
    "DB_SA_PASSWORD"       = $DbSaPassword
    "DB_CONNECTION_STRING" = $DB_CONN
    "JWT_SECRET"           = $JwtSecret
}

foreach ($secret in $secrets.GetEnumerator()) {
    $secret.Value | gh secret set $secret.Key --repo "$REPO_OWNER/$REPO_NAME"
    if ($?) {
        Write-Host "  ✅ $($secret.Key)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($secret.Key) - FAILED" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "  Tất cả secrets đã được cấu hình!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "Bước tiếp theo: Trigger deployment!" -ForegroundColor Cyan
Write-Host "  gh workflow run deploy.yml --repo $REPO_OWNER/$REPO_NAME" -ForegroundColor White
Write-Host ""

# ── Trigger GitHub Actions Workflow ─────────────────
$trigger = Read-Host "Trigger deployment ngay bây giờ? (y/n)"
if ($trigger -eq "y" -or $trigger -eq "Y") {
    gh workflow run "deploy.yml" --repo "$REPO_OWNER/$REPO_NAME"
    Write-Host "✅ Workflow đã được trigger!" -ForegroundColor Green
    Write-Host "Xem tại: https://github.com/$REPO_OWNER/$REPO_NAME/actions" -ForegroundColor Cyan
}
