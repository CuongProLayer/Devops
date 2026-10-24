#!/bin/bash
# ============================================================
#  SmartStock – EC2 Bootstrap Script
#  Chạy 1 lần duy nhất sau khi tạo máy ảo EC2 mới
#  Ubuntu 22.04 / 24.04 LTS
# ============================================================

set -euo pipefail

# ── Màu sắc cho output ────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; NC='\033[0m'

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
info()   { echo -e "${CYAN}[i]${NC} $1"; }
warn()   { echo -e "${YELLOW}[!]${NC} $1"; }
section(){ echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n  $1\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

# ══════════════════════════════════════════════════════════
section "1. Update hệ thống"
# ══════════════════════════════════════════════════════════
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git unzip htop
log "Hệ thống đã cập nhật"

# ══════════════════════════════════════════════════════════
section "2. Tạo Swap Memory 4GB (bắt buộc cho SQL Server)"
# ══════════════════════════════════════════════════════════
if [ ! -f /swapfile ]; then
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  log "Swap 4GB đã tạo"
else
  warn "Swap đã tồn tại, bỏ qua"
fi
free -h

# ══════════════════════════════════════════════════════════
section "3. Cài đặt Docker"
# ══════════════════════════════════════════════════════════
if ! command -v docker &> /dev/null; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sudo sh /tmp/get-docker.sh
  rm /tmp/get-docker.sh
  sudo systemctl enable docker
  sudo systemctl start docker
  log "Docker đã cài đặt"
else
  warn "Docker đã tồn tại: $(docker --version)"
fi

# Cấp quyền cho user hiện tại chạy docker không cần sudo
CURRENT_USER=${SUDO_USER:-$USER}
sudo usermod -aG docker "$CURRENT_USER" 2>/dev/null || true
log "User '$CURRENT_USER' đã được thêm vào nhóm docker"

# ══════════════════════════════════════════════════════════
section "4. Cài đặt Docker Compose plugin"
# ══════════════════════════════════════════════════════════
if ! docker compose version &> /dev/null; then
  COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d '"' -f 4)
  sudo curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
  log "Docker Compose plugin cài đặt thành công"
else
  warn "Docker Compose đã tồn tại: $(docker compose version)"
fi

# ══════════════════════════════════════════════════════════
section "5. Cấu hình tường lửa UFW"
# ══════════════════════════════════════════════════════════
sudo ufw --force enable
sudo ufw allow ssh       # Port 22
sudo ufw allow 3000/tcp  # Frontend
sudo ufw allow 5000/tcp  # Backend API
# sudo ufw allow 1433/tcp  # SQL Server (bỏ comment nếu cần remote SQL)
sudo ufw status
log "Tường lửa đã cấu hình"

# ══════════════════════════════════════════════════════════
section "6. Tối ưu kernel cho SQL Server"
# ══════════════════════════════════════════════════════════
# SQL Server yêu cầu vm.max_map_count >= 1048576
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-smartstock.conf
sudo sysctl --system > /dev/null
log "Kernel parameters đã tối ưu"

# ══════════════════════════════════════════════════════════
section "7. Tạo cấu trúc thư mục deploy"
# ══════════════════════════════════════════════════════════
mkdir -p ~/smartstock
mkdir -p ~/smartstock/backups
log "Thư mục ~/smartstock đã tạo"

# ══════════════════════════════════════════════════════════
section "✅ Bootstrap hoàn tất!"
# ══════════════════════════════════════════════════════════
echo ""
info "Docker version: $(docker --version 2>/dev/null || echo 'cần logout/login lại')"
info "Compose version: $(docker compose version 2>/dev/null || echo 'cần logout/login lại')"
echo ""
echo -e "${YELLOW}⚠️  QUAN TRỌNG: Chạy lệnh sau để apply quyền docker:${NC}"
echo -e "    ${GREEN}newgrp docker${NC}  (hoặc logout và login lại SSH)"
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Máy ảo EC2 đã sẵn sàng để deploy SmartStock!"
echo -e "  Bước tiếp theo: Cấu hình GitHub Secrets và push code lên main"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
