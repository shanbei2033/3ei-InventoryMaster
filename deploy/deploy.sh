#!/bin/bash

# 仓库管理系统部署脚本
# 适用于 Ubuntu 22.04

set -e  # 遇到错误时退出

echo "仓库管理系统部署脚本"
echo "========================"

# 更新系统包
echo "更新系统包..."
apt update

# 安装 Node.js
echo "安装 Node.js..."
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

# 验证安装
node --version
npm --version

# 安装 pm2 (用于后台运行应用)
echo "安装 PM2..."
npm install -g pm2

# 创建应用目录
echo "创建应用目录..."
mkdir -p /opt/warehouse-manager
cd /opt/warehouse-manager

# 这里会放置应用文件（在实际部署时替换为真实文件）
echo "复制应用文件..."
# cp 会在这里复制实际的应用文件

# 安装依赖
echo "安装应用依赖..."
npm install express cors

# 使用 PM2 启动应用
echo "启动应用..."
pm2 start server.js --name warehouse-manager
pm2 startup
pm2 save

echo "仓库管理系统已成功部署！"
echo "应用将通过 PM2 在后台运行"
echo "访问地址: http://YOUR_SERVER_IP:3000"
echo ""
echo "常用 PM2 命令:"
echo "  pm2 status                    # 查看应用状态"
echo "  pm2 logs warehouse-manager    # 查看应用日志"
echo "  pm2 restart warehouse-manager # 重启应用"
echo "  pm2 stop warehouse-manager    # 停止应用"