# GitHub 上传指南

## 上传准备

您已经拥有最新的项目打包文件：
`inventory-master-20260205_103302.tar.gz`

此文件包含了完整的项目代码和所有必要的文件。

## 上传步骤

### 1. 创建 GitHub 仓库
1. 登录 GitHub
2. 点击 "New repository"
3. 仓库名称设为 "InventoryMaster" 或您喜欢的名称
4. 选择 "Public" 或 "Private"
5. 不要初始化 README、.gitignore 或许可证（我们有自己的）

### 2. 上传方式一：直接上传文件
1. 在仓库页面点击 "Add file" -> "Upload files"
2. 将 `inventory-master-20260205_103302.tar.gz` 拖拽到上传区域
3. 提交更改

### 3. 上传方式二：解压后逐个上传
1. 解压压缩包：
   ```bash
   tar -xzf inventory-master-20260205_103302.tar.gz
   ```
2. 保留重要文件，移除旧的压缩包和其他不需要的文件
3. 使用 Git 命令上传：
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Inventory Master R3.0.1"
   git branch -M main
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

## 重要文件说明

### 核心功能文件
- `server.js` - 主服务器程序
- `auth.js` - 认证系统
- `script.js` - 前端交互逻辑
- `styles.css` - 样式表

### 页面文件
- `index.html` - 主界面
- `login.html` - 登录页面
- `register.html` - 注册页面
- `settings.html` - 设置页面

### 配置文件
- `package.json` - 项目配置和依赖
- `package-lock.json` - 依赖版本锁定

### 数据文件
- `warehouse-data.json` - 库存数据示例
- `users.json` - 用户数据（请确保移除敏感信息）
- `tokens.json` - 注册令牌（请确保移除敏感信息）

### 文档文件
- `README.md` - GitHub首页说明
- `GITHUB_README.md` - 详细功能说明
- `SECURITY_NOTICE.md` - 安全说明
- `DEPLOY_INSTRUCTIONS.md` - 部署指南

## 上传前注意事项

1. **清理敏感数据**：
   - 检查 `users.json` 和 `tokens.json` 是否包含真实用户信息
   - 如有敏感数据，请替换为示例数据

2. **验证文件完整性**：
   - 确保所有 `.js`、`.html`、`.css` 文件都存在
   - 确保 `package.json` 中的依赖项正确

3. **测试本地运行**：
   - 上传前在本地测试项目能否正常运行

## 仓库设置建议

1. **启用 Issues** - 便于收集反馈
2. **启用 Wiki** - 便于详细文档编写
3. **设置分支保护规则** - 保护主分支
4. **添加 Topics** - 如 `inventory-management`, `warehouse`, `nodejs`, `javascript`

## 后续维护

1. **版本标签**：
   ```bash
   git tag -a v3.0.1 -m "Release version 3.0.1"
   git push origin v3.0.1
   ```

2. **发布 Release**：
   - 在 GitHub Releases 页面创建新版本
   - 附上编译好的文件和更新日志

## 问题排查

如遇上传问题：
1. 检查文件大小限制（单个文件最大100MB，仓库最大1GB）
2. 对于大文件，考虑使用 Git LFS
3. 如需帮助，参考 GitHub 官方文档

## 完成后验证

上传完成后，请验证：
1. 所有源代码文件都能正常查看
2. README.md 正确显示
3. package.json 中的依赖信息正确
4. 可以克隆仓库并在本地运行项目