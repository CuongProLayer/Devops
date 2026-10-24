#!/bin/bash
# ============================================================
#  SmartStock – Manual Rollback Script
#  Dùng khi cần rollback về image cũ khẩn cấp
# ============================================================

set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

TAG=${1:-"previous"}

echo -e "${YELLOW}⚠️  Bắt đầu rollback về tag: ${TAG}${NC}"

cd ~/smartstock

source .env 2>/dev/null || true

# Đổi tag trong docker-compose.yml tạm thời
BACKEND_IMAGE="${DOCKER_USER}/smartstock-backend:${TAG}"
FRONTEND_IMAGE="${DOCKER_USER}/smartstock-frontend:${TAG}"

echo "Backend:  $BACKEND_IMAGE"
echo "Frontend: $FRONTEND_IMAGE"

# Pull image cũ
docker pull "$BACKEND_IMAGE"
docker pull "$FRONTEND_IMAGE"

# Cập nhật và restart
DOCKER_USER=$DOCKER_USER \
  DB_SA_PASSWORD=$DB_SA_PASSWORD \
  DB_CONNECTION_STRING=$DB_CONNECTION_STRING \
  JWT_SECRET=$JWT_SECRET \
  docker compose up -d --no-deps \
    --pull never \
    smartstock-backend smartstock-frontend

echo -e "${GREEN}✅ Rollback hoàn tất!${NC}"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
