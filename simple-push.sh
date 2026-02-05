#!/bin/bash

# 推送库存管理系统到GitHub仓库
# 仓库地址: https://github.com/shanbei2033/3ei-InventoryMaster
# 
# 使用前请确保:
# 1. 已在GitHub创建仓库
# 2. 已配置好认证方式 (SSH密钥或个人访问令牌)

echo "准备推送库存管理系统到GitHub..."
echo "仓库地址: https://github.com/shanbei2033/3ei-InventoryMaster"
echo ""

# 切换到项目目录
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster

# 显示将要推送的文件
echo "将要推送的文件:"
git status --short

echo ""
echo "开始推送..."
echo ""

# 推送到GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 推送成功!"
    echo "请访问 https://github.com/shanbei2033/3ei-InventoryMaster 查看项目"
else
    echo ""
    echo "❌ 推送失败，请检查错误信息"
    echo "可能的原因及解决方案："
    echo "1. 需要认证 - 请使用GitHub个人访问令牌作为密码"
    echo "2. 远程仓库不存在 - 请先在GitHub网站创建仓库"
    echo "3. 网络问题 - 请检查网络连接"
fi