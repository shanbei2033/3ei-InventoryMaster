#!/bin/bash

# 启动仓库管理系统服务器和localtunnel
echo "启动仓库管理系统..."

# 首先确保服务器在运行
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster
node server.js > server.log 2>&1 &

# 等待服务器启动
sleep 3

# 启动localtunnel
echo "正在创建公网访问地址..."
npx localtunnel --port 3000