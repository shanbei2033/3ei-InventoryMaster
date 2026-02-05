# 创建 GitHub Release 指南

## 如何发布新版本

### 步骤 1: 访问仓库
访问您的仓库: https://github.com/shanbei2033/3ei-InventoryMaster

### 步骤 2: 进入 Releases 页面
1. 点击仓库页面上的 "Releases" 标签
2. 或者点击 "Tags" 标签旁边的 "Create your first release" 链接

### 步骤 3: 创建新版本
1. 点击 "Draft a new release" 按钮
2. 在 "Choose a tag" 字段输入: `v3.0.1`
3. 在 "Release title" 字段输入: `R3.0.1 - 库存大师`
4. 在 "Describe this release" 文本框中粘贴以下内容:

```
# 库存大师 R3.0.1

仓库管理系统正式版本

## 版本亮点
- 完整的用户认证系统（注册/登录）
- 多用户支持和安全管理
- 实时搜索（支持中文、拼音、首字母）
- 响应式界面设计
- 数据持久化存储

## 主要功能
- 用户管理（注册、登录、登出）
- 库存管理（增删改查）
- 批量导入导出功能
- 数据可视化图表
- 个性化设置面板
- 国际化（中英文切换）

## 安全特性
- 注册令牌验证机制
- 防暴力破解保护
- 密码加密存储
- 输入验证防护

## 技术栈
- Node.js + Express
- 原生 HTML/CSS/JavaScript
- JWT 认证
- JSON 数据存储

## 快速开始
```bash
npm install
node server.js
# 访问 http://localhost:3000/login
```

## 致谢
基于OpenClaw部署的AI小扇和小贝编写
```

### 步骤 4: 发布
- 点击 "Publish release" 按钮完成发布

## 可选附件
如果需要提供预编译版本，可以将以下文件作为附件上传：
- RELEASE_NOTES.md (完整发布说明)
- GITHUB_RELEASE.md (简化发布说明)

## 完成
发布完成后，用户可以在 Releases 页面下载和查看版本信息。