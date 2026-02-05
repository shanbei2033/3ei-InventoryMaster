# 库存大师 (InventoryMaster) 

仓库管理系统 R3.0.1 版本 - 专业库存管理解决方案

## 功能特性

### 核心功能
- ✅ **多用户支持** - 支持多个用户同时使用
- ✅ **安全登录** - 用户认证和会话管理
- ✅ **实时搜索** - 支持中文、拼音及首字母搜索
- ✅ **数据持久化** - 自动保存库存数据到本地文件
- ✅ **国际化** - 支持中英文界面切换
- ✅ **响应式设计** - 适配桌面端和移动端设备

### 管理功能
- ✅ **用户管理** - 用户注册、登录、登出
- ✅ **库存管理** - 添加、编辑、删除、搜索商品
- ✅ **批量操作** - 导入导出Excel格式数据
- ✅ **统计图表** - 可视化库存数据分析
- ✅ **设置面板** - 个性化配置选项

### 安全特性
- ✅ **注册令牌** - 需要管理员生成的令牌才能注册
- ✅ **防暴力破解** - IP封禁机制防止恶意尝试
- ✅ **输入验证** - 防止XSS和注入攻击
- ✅ **密码加密** - 使用bcrypt安全存储密码
- ✅ **会话管理** - JWT令牌管理用户会话

## 快速开始

### 环境要求
- Node.js v14.0 或更高版本
- npm (随Node.js一起安装)

### 安装步骤

1. 克隆或下载项目文件到本地
2. 进入项目目录，安装依赖：
```bash
npm install
```

3. 启动服务器：
```bash
node server.js
```

4. 打开浏览器访问 `http://localhost:3000/login`

### 首次使用

1. **生成注册令牌**：
   ```bash
   node generate-token.js
   ```
   或者通过API接口：
   ```bash
   curl -X POST http://localhost:3000/api/generate-token
   ```

2. **注册账户**：
   - 访问 `http://localhost:3000/register`
   - 输入用户名、密码和上述生成的令牌

3. **登录使用**：
   - 访问 `http://localhost:3000/login`
   - 使用注册的账号登录

## 部署指南

### 本地部署
```bash
# 安装依赖
npm install

# 启动服务器
node server.js

# 服务器将运行在 http://localhost:3000
```

### 生产环境部署
推荐使用 PM2 进行进程管理：

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start server.js --name inventory-master

# 设置开机自启
pm2 startup
pm2 save
```

### Docker部署 (可选)
```dockerfile
FROM node:16-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "server.js"]
```

## API接口

### 认证相关
- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册
- `POST /api/generate-token` - 生成注册令牌

### 库存管理
- `GET /api/inventory` - 获取所有库存
- `POST /api/inventory` - 添加新物品
- `PUT /api/inventory/:id` - 更新物品数量
- `DELETE /api/inventory/:id` - 删除物品
- `GET /api/search/:query` - 搜索物品

## 文件结构

```
├── server.js           # 主服务器文件
├── auth.js             # 认证系统模块
├── generate-token.js   # 令牌生成工具
├── index.html          # 主界面
├── login.html          # 登录页面
├── register.html       # 注册页面
├── settings.html       # 设置页面
├── script.js           # 前端JavaScript
├── styles.css          # 样式文件
├── warehouse-data.json # 数据存储文件
├── tokens.json         # 注册令牌存储
├── users.json          # 用户数据存储
├── package.json        # 项目配置
└── README.md           # 说明文档
```

## 安全说明

1. **令牌管理**：每次注册后令牌即失效，请为每个用户单独生成新令牌
2. **密码安全**：所有密码均使用bcrypt加密存储
3. **会话安全**：使用JWT令牌进行会话管理，具备自动过期功能
4. **输入过滤**：所有用户输入都会经过安全验证和过滤

## 故障排除

### 常见问题
- **无法访问页面**：检查服务器是否已启动，端口是否正确
- **注册失败**：确认令牌是否有效且未过期
- **数据丢失**：检查 `warehouse-data.json` 文件权限
- **搜索无结果**：确认输入内容与数据库中数据匹配

### 日志查看
服务器运行日志可在终端直接查看，错误信息会详细记录。

## 更新日志

### R3.0.1 (最新)
- 完整重构前端JavaScript，修复各种功能bug
- 实现服务器优先的数据同步策略
- 优化性能，修复删除、图表显示、全选等问题
- 添加全面的国际化支持

### R3.0.0
- 重命名为"库存大师"，统一品牌标识
- 移除界面表情符号，提升专业性
- 添加用户设置下拉菜单动画效果
- 修复JavaScript错误和按钮响应问题

### R2.0.0
- 实现完整安全登录系统
- 添加用户注册功能，需管理员令牌验证
- 引入防暴力破解保护机制
- 增加用户资料和退出功能

### R1.0.0
- 初始版本，实现基础库存管理功能
- 支持增删改查操作
- 添加数据导入导出功能
- 实现搜索和统计图表功能

## 技术栈

- **后端**: Node.js + Express
- **前端**: 原生HTML/CSS/JavaScript
- **数据库**: JSON文件存储
- **认证**: JWT + bcrypt
- **搜索**: 拼音和首字母匹配
- **样式**: Tailwind CSS + 自定义CSS

## 贡献

欢迎提交Issue和Pull Request来改进本项目。

## 许可证

MIT License