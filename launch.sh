#!/bin/bash

# 切换到项目目录
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster

# 启动服务器并输出日志
echo "启动库存管理系统服务器..."
nohup node server.js > server.log 2>&1 &

# 获取进程ID
SERVER_PID=$!
echo "服务器进程ID: $SERVER_PID"

# 等待服务器启动
sleep 3

# 检查服务器是否成功启动
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "服务器已启动，PID: $SERVER_PID"
    echo "服务器正在后台运行，访问 http://你的IP:3000/login 使用系统"
else
    echo "服务器启动失败，请检查日志"
    cat server.log
fi