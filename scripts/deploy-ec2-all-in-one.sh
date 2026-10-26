#!/bin/bash
# ============================================================
#  SmartStock – Script Tự Động Triển Khai 3 Containers Trên AWS EC2
#  Bao gồm: Backend (.NET 10) + Frontend (React) + Database (SQL Server 2022)
# ============================================================
set -euo pipefail

# Màu hiển thị
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}   BẮT ĐẦU CÀI ĐẶT & CHẠY 3 CONTAINERS TRÊN AWS EC2${NC}"
echo -e "${CYAN}============================================================${NC}"

# 1. Cập nhật hệ thống
echo -e "\n${YELLOW}[1/6] Cập nhật các gói hệ thống...${NC}"
sudo apt-get update -y
sudo apt-get install -y curl wget git ufw

# 2. Tạo bộ nhớ ảo Swap 4GB (Bắt buộc cho EC2 t2/t3.micro chạy SQL Server)
echo -e "\n${YELLOW}[2/6] Kiểm tra & Cấu hình bộ nhớ ảo Swap 4GB...${NC}"
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo -e "${GREEN}✓ Đã tạo Swap 4GB thành công!${NC}"
else
    echo -e "${GREEN}✓ Swap 4GB đã tồn tại, tiếp tục...${NC}"
fi

# Tối ưu kernel cho SQL Server
sudo sysctl -w vm.max_map_count=262144 > /dev/null
echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-sqlserver.conf > /dev/null

# 3. Cài đặt Docker và Docker Compose
echo -e "\n${YELLOW}[3/6] Cài đặt Docker & Docker Compose...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo sh /tmp/get-docker.sh
    rm -f /tmp/get-docker.sh
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    echo -e "${GREEN}✓ Đã cài đặt Docker thành công!${NC}"
else
    echo -e "${GREEN}✓ Docker đã có sẵn!${NC}"
fi

# 4. Cấu hình tường lửa UFW mở cổng cần thiết
echo -e "\n${YELLOW}[4/6] Mở các cổng mạng (22, 80, 3000, 5000)...${NC}"
sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 3000/tcp comment 'Frontend React'
sudo ufw allow 5000/tcp comment 'Backend API'
sudo ufw reload

# 5. Tạo cấu hình docker-compose cho 3 Containers
echo -e "\n${YELLOW}[5/6] Thiết lập 3 Containers (Backend, Frontend, SQL Server)...${NC}"
DEPLOY_DIR="$HOME/smartstock"
mkdir -p "$DEPLOY_DIR"
cd "$DEPLOY_DIR"

cat > docker-compose.yml << 'EOF'
services:

  # ── Container 1: SQL Server 2022 Database ──
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: smartstock-db
    restart: always
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "SmartStock@Prod2024!"
      MSSQL_MEMORY_LIMIT_MB: "512"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P 'SmartStock@Prod2024!' -C -Q 'SELECT 1' || exit 1"]
      interval: 20s
      retries: 5
      start_period: 40s
      timeout: 10s

  # ── Container 2: Backend (.NET 10 Web API) ──
  smartstock-backend:
    image: cuong03062005/smartstock-backend:latest
    container_name: smartstock-backend
    restart: always
    ports:
      - "5000:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__DefaultConnection: "Server=sqlserver,1433;Database=SmartStockDB;User Id=sa;Password=SmartStock@Prod2024!;TrustServerCertificate=True;"
      Jwt__Key: "SmartStockJwtSuperSecretKey2024Production!!"
      Jwt__Issuer: "SmartStock.API"
      Jwt__Audience: "SmartStock.Client"
    volumes:
      - uploads-data:/app/uploads
    depends_on:
      sqlserver:
        condition: service_healthy
    networks:
      - app-network

  # ── Container 3: Frontend (React + Nginx) ──
  smartstock-frontend:
    image: cuong03062005/smartstock-frontend:latest
    container_name: smartstock-frontend
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - smartstock-backend
    networks:
      - app-network

volumes:
  sqlserver-data:
  uploads-data:

networks:
  app-network:
    driver: bridge
EOF

# 6. Kéo images và khởi chạy 3 containers
echo -e "\n${YELLOW}[6/6] Kéo Docker images từ Docker Hub và khởi động...${NC}"
sudo docker compose pull
sudo docker compose down 2>/dev/null || true
sudo docker compose up -d

# Lấy Public IP của máy EC2
PUBLIC_IP=$(curl -s https://checkip.amazonaws.com || curl -s ifconfig.me || echo "YOUR_EC2_PUBLIC_IP")

echo ""
echo -e "${CYAN}============================================================${NC}"
echo -e "${GREEN}   ✅ CHÚC MỪNG! CẢ 3 CONTAINERS ĐÃ HOẠT ĐỘNG THÀNH CÔNG!${NC}"
echo -e "${CYAN}============================================================${NC}"
echo ""
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${GREEN}👉 Link truy cập Frontend:    ${CYAN}http://${PUBLIC_IP}:3000${NC}"
echo -e "${GREEN}👉 Link truy cập Swagger API:  ${CYAN}http://${PUBLIC_IP}:5000/swagger${NC}"
echo -e "${GREEN}👉 Link kiểm tra Healthcheck:  ${CYAN}http://${PUBLIC_IP}:5000/health${NC}"
echo ""
echo -e "${YELLOW}Tài khoản đăng nhập hệ thống Web:${NC}"
echo -e "   - Admin:      admin / Admin@123"
echo -e "   - Warehouse:  warehouse / Warehouse@123"
echo -e "   - Staff:      staff / Staff@123"
echo -e "${CYAN}============================================================${NC}"
