# GitHub 上传文件清单

以下是需要上传到 GitHub 仓库的所有重要文件：

## 核心源代码
- server.js - 主服务器文件
- auth.js - 认证系统模块
- generate-token.js - 令牌生成工具
- script.js - 前端JavaScript
- styles.css - 样式文件

## 前端页面
- index.html - 主界面
- login.html - 登录页面
- register.html - 注册页面
- settings.html - 设置页面

## 配置文件
- package.json - 项目配置
- package-lock.json - 依赖锁定

## 文档文件
- README.md - GitHub首页说明
- GITHUB_README.md - 详细功能说明
- DEPLOY_INSTRUCTIONS.md - 部署指南
- SECURITY_NOTICE.md - 安全说明

## 示例数据文件
- warehouse-data.json - 示例库存数据
- tokens.json - 示例令牌数据
- users.json - 示例用户数据

## 工具脚本
- system-control.sh - 系统控制脚本
- launch.sh - 启动脚本
- monitor.sh - 监控脚本

## 其他资源文件
- manifest.json - PWA配置
- sw.js - Service Worker
- capacitor.config.json - Capacitor配置
- static_version.html - 静态版本页面
- GITHUB_SUMMARY.md - GitHub摘要
- GITHUB_UPLOAD_INSTRUCTIONS.md - GitHub上传说明

## 注意事项
1. 请勿上传 .git 目录
2. 请勿上传 node_modules 目录（会由 npm install 自动生成）
3. 请勿上传大型二进制文件或压缩包（除非特别需要）
4. 确保敏感信息（如真实用户数据）已移除或匿名化