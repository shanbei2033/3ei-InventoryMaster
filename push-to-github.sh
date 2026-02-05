#!/bin/bash

# 推送库存管理系统到GitHub仓库
# 仓库地址: https://github.com/shanbei2033/3ei-InventoryMaster

echo "开始推送库存管理系统到GitHub..."

# 切换到项目目录
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster

# 检查是否已经是git仓库
if [ ! -d ".git" ]; then
    echo "初始化git仓库..."
    git init
fi

# 添加所有文件
echo "添加所有文件到暂存区..."
git add .

# 检查是否有更改需要提交
if git diff --cached --quiet; then
    echo "没有更改需要提交"
else
    # 提交更改
    echo "提交更改..."
    git config user.email "shanbei2033@example.com"
    git config user.name "shanbei"
    git commit -m "Initial commit: Inventory Master R3.0.1"
fi

# 添加远程仓库
echo "添加远程仓库..."
git remote add origin https://github.com/shanbei2033/3ei-InventoryMaster.git

# 推送到GitHub
echo "推送到GitHub..."
git branch -M main
git push -u origin main

echo "推送完成！请访问 https://github.com/shanbei2033/3ei-InventoryMaster 查看项目"