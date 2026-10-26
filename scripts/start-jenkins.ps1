# Script tự động khởi động Jenkins Local và cấu hình môi trường Docker
$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   KHOI DONG JENKINS LOCAL CHO DU AN DEVOPS" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Kiểm tra Docker
Write-Host "`n[1/4] Kiem tra Docker Daemon..." -ForegroundColor Yellow
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Docker khong phan hoi" }
    Write-Host " -> Docker dang hoat dong tot!" -ForegroundColor Green
} catch {
    Write-Host "[!] Docker chua san sang!" -ForegroundColor Red
    Write-Host "    Hay mo ung dung 'Docker Desktop' tren Windows, doi bieu tuong Docker chuyen sang mau Xanh (Engine running)." -ForegroundColor Yellow
    Write-Host "    Sau khi Docker Desktop khoi dong xong, hay chay lai script nay." -ForegroundColor Yellow
    exit 1
}

# 2. Khoi dong Jenkins Container
Write-Host "`n[2/4] Khoi dong container Jenkins qua Docker Compose..." -ForegroundColor Yellow
docker compose -f docker-compose.jenkins.yml up -d

# 3. Cai dat Docker CLI ben trong container Jenkins (de Jenkins co the build backend & frontend)
Write-Host "`n[3/4] Kiem tra & cai dat Docker CLI va SSH Agent ben trong Jenkins..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $dockerInJenkins = docker exec jenkins-local docker --version 2>&1
    Write-Host " -> Docker da co san trong Jenkins: $dockerInJenkins" -ForegroundColor Green
} catch {
    Write-Host " -> Dang cai dat Docker CLI vao Jenkins container..." -ForegroundColor Gray
    docker exec -u 0 jenkins-local apt-get update -y
    docker exec -u 0 jenkins-local apt-get install -y docker.io
    Write-Host " -> Cai dat Docker CLI thanh cong!" -ForegroundColor Green
}

# Kiem tra plugin ssh-agent
$hasSshAgent = docker exec jenkins-local ls /var/jenkins_home/plugins 2>$null | Select-String "ssh-agent"
if (-not $hasSshAgent) {
    Write-Host " -> Dang cai dat plugin ssh-agent vao Jenkins..." -ForegroundColor Gray
    docker exec -u 0 -e JAVA_OPTS="-Djava.net.preferIPv4Stack=true" jenkins-local jenkins-plugin-cli --plugins ssh-agent
    docker exec -u 0 jenkins-local cp -r /usr/share/jenkins/ref/plugins/ssh-agent.jpi /var/jenkins_home/plugins/ 2>$null
    docker exec -u 0 jenkins-local chown jenkins:jenkins /var/jenkins_home/plugins/ssh-agent.jpi 2>$null
    docker restart jenkins-local
    Start-Sleep -Seconds 10
    Write-Host " -> Cai dat plugin ssh-agent thanh cong!" -ForegroundColor Green
}

# 4. Lay mat khau admin ban dau
Write-Host "`n[4/4] Doi Jenkins khoi tao va lay Initial Admin Password..." -ForegroundColor Yellow
$maxRetries = 30
$password = ""
for ($i = 0; $i -lt $maxRetries; $i++) {
    try {
        $password = docker exec jenkins-local cat /var/jenkins_home/secrets/initialAdminPassword 2>$null
        if ($password -and $password.Length -gt 10) {
            break
        }
    } catch {}
    Start-Sleep -Seconds 3
    Write-Host "." -NoNewline -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host " Jenkins da san sang tai: http://localhost:8080" -ForegroundColor Green
Write-Host ""
if ($password) {
    Write-Host " Mat khau dang nhap ban dau (Initial Admin Password):" -ForegroundColor Cyan
    Write-Host " $password" -ForegroundColor Yellow -BackgroundColor Black
} else {
    Write-Host " De lay mat khau admin, chay lenh sau:" -ForegroundColor Yellow
    Write-Host " docker exec jenkins-local cat /var/jenkins_home/secrets/initialAdminPassword" -ForegroundColor Gray
}
Write-Host "==========================================================" -ForegroundColor Green

# Mo trinh duyet
Start-Process "http://localhost:8080"
