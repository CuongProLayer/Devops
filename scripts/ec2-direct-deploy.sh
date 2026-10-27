#!/bin/bash
# ============================================================
#  SmartStock – Quick Deploy Script (chạy trên EC2)
#  Không cần GitHub Actions, deploy trực tiếp
# ============================================================
set -euo pipefail

EC2_IP=$(curl -s https://checkip.amazonaws.com || curl -s ifconfig.me || echo "54.66.25.121")
DOCKER_USER="cuong03062005"

# Màu sắc
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  SmartStock – Direct EC2 Deploy (IP: ${EC2_IP})"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Đảm bảo có Swap 4GB cho SQL Server trên EC2 t2/t3.micro
if [ ! -f /swapfile ]; then
    echo -e "${YELLOW}Tạo Swap 4GB cho SQL Server...${NC}"
    sudo fallocate -l 4G /swapfile 2>/dev/null || sudo dd if=/dev/zero of=/swapfile bs=1M count=4096
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile || true
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null || true
fi
sudo sysctl -w vm.max_map_count=262144 >/dev/null || true

# Tạo thư mục deploy
mkdir -p ~/smartstock
cd ~/smartstock

# Patch trực tiếp file nhị phân sqlservr (hạ mức RAM yêu cầu từ 2000MB xuống 512MB)
if [ ! -f ~/smartstock/sqlservr ]; then
    echo -e "${YELLOW}Trích xuất và patch sqlservr để chạy trên EC2 1GB RAM...${NC}"
    docker create --name temp-sql mcr.microsoft.com/mssql/server:2022-latest >/dev/null 2>&1 || sudo docker create --name temp-sql mcr.microsoft.com/mssql/server:2022-latest >/dev/null 2>&1
    docker cp temp-sql:/opt/mssql/bin/sqlservr ~/smartstock/sqlservr >/dev/null 2>&1 || sudo docker cp temp-sql:/opt/mssql/bin/sqlservr ~/smartstock/sqlservr
    docker rm -f temp-sql >/dev/null 2>&1 || sudo docker rm -f temp-sql >/dev/null 2>&1
    python3 -c '
import os
path = os.path.expanduser("~/smartstock/sqlservr")
data = open(path, "rb").read()
# 0x77359400 = 2,000,000,000 bytes (2000MB) -> 0x1E848000 = 512,000,000 bytes (512MB)
patched = data.replace(b"\x00\x94\x35\x77", b"\x00\x80\x84\x1e")
open(path, "wb").write(patched)
print("Số vị trí đã patch:", data.count(b"\x00\x94\x35\x77"))
'
    chmod 755 ~/smartstock/sqlservr
    echo -e "${GREEN}✓ Đã patch sqlservr thành công!${NC}"
fi

# Tạo file docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: smartstock-db
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: "SmartStock@Prod2024!"
      MSSQL_MEMORY_LIMIT_MB: "512"
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
      - ./sqlservr:/opt/mssql/bin/sqlservr:ro
    restart: always
    networks:
      - app-network

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
      - sqlserver
    networks:
      - app-network

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

echo -e "${GREEN}✓ docker-compose.yml đã tạo${NC}"

# Kiểm tra quyền chạy docker
DOCKER_BIN="docker"
if ! docker ps &>/dev/null; then
    DOCKER_BIN="sudo docker"
fi

# Pull images mới nhất
echo -e "${YELLOW}Đang pull images từ Docker Hub...${NC}"
$DOCKER_BIN pull cuong03062005/smartstock-backend:latest
$DOCKER_BIN pull cuong03062005/smartstock-frontend:latest
$DOCKER_BIN pull mcr.microsoft.com/mssql/server:2022-latest

# Khởi động tất cả containers
echo -e "${YELLOW}Đang khởi động 3 containers (Backend, Frontend, SQL Server)...${NC}"
$DOCKER_BIN compose down 2>/dev/null || true
$DOCKER_BIN compose up -d

echo -e "${YELLOW}Chờ SQL Server khởi động (10s) và đồng bộ Backend...${NC}"
sleep 10
$DOCKER_BIN restart smartstock-backend 2>/dev/null || true

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ✅ Deploy hoàn tất!"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
$DOCKER_BIN ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo -e "${CYAN}🌐 Frontend:  http://${EC2_IP}:3000${NC}"
echo -e "${CYAN}⚙️  Backend:   http://${EC2_IP}:5000/swagger${NC}"
echo -e "${CYAN}🔍 Health:    http://${EC2_IP}:5000/health${NC}"
