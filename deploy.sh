#!/bin/bash
# ============================================================
#  烟具电商网站 - 服务器一键部署脚本
#  适用：Debian 12 / Ubuntu 20+ 
#  服务器：103.133.176.68 (硅云香港)
# ============================================================

set -e  # 遇到错误立即停止

echo ""
echo "========================================"
echo "  烟具电商网站 - 开始部署"
echo "========================================"
echo ""

# ─── 1. 安装基础依赖 ───
echo "[1/6] 检查并安装 Node.js + npm + git..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
  echo "Node.js 安装完成: $(node -v)"
else
  echo "Node.js 已存在: $(node -v)"
fi

if ! command -v git &>/dev/null; then
  apt-get install -y git
fi

# 安装 PM2（进程守护）
if ! command -v pm2 &>/dev/null; then
  npm install -g pm2
  echo "PM2 安装完成"
else
  echo "PM2 已存在: $(pm2 -v)"
fi

echo ""

# ─── 2. 拉取代码 ───
echo "[2/6] 拉取代码..."
DEPLOY_DIR="/var/www/smokeshop"

if [ -d "$DEPLOY_DIR/.git" ]; then
  echo "仓库已存在，执行 git pull..."
  cd "$DEPLOY_DIR"
  git pull origin main
else
  echo "首次部署，克隆仓库..."
  mkdir -p /var/www
  git clone https://github.com/ly383676000-boop/smokwangzhan.git "$DEPLOY_DIR"
  cd "$DEPLOY_DIR"
fi

echo ""

# ─── 3. 安装后端依赖 ───
echo "[3/6] 安装后端依赖..."
cd "$DEPLOY_DIR/backend"
npm install --production
echo "后端依赖安装完成"

echo ""

# ─── 4. 安装前端依赖并构建 ───
echo "[4/6] 安装前端依赖并构建..."
cd "$DEPLOY_DIR/frontend"
npm install
npm run build
echo "前端构建完成 -> frontend/dist/"

echo ""

# ─── 5. 安装网关依赖 ───
echo "[5/6] 安装网关依赖..."
cd "$DEPLOY_DIR"
npm install
echo "网关依赖安装完成"

echo ""

# ─── 6. 创建持久化目录 ───
echo "[6/6] 创建持久化数据目录..."
mkdir -p "$DEPLOY_DIR/backend/src/db"
mkdir -p "$DEPLOY_DIR/backend/uploads"
echo "数据目录就绪"

echo ""
echo "========================================"
echo "  依赖安装完成！开始启动服务..."
echo "========================================"
echo ""

# ─── 启动服务（PM2）───
cd "$DEPLOY_DIR"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root 2>/dev/null || true

echo ""
echo "========================================"
echo "  部署完成！"
echo ""
echo "  本地访问: http://localhost:3000"
echo "  公网访问: http://103.133.176.68"
echo "  (如配置 Nginx 反向代理，端口为80)"
echo ""
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs"
echo "========================================"
