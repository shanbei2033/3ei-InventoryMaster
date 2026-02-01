# 仓库管理系统

这个仓库管理系统提供了两种版本：

## 1. Web版（完整功能）

### 功能
- 图形化界面
- 响应式设计，支持手机
- 添加、修改、删除货物
- 搜索功能
- 数据统计
- PWA支持（可添加到主屏幕）

### 运行
```bash
cd ~/warehouse-manager
node server.js
```
然后在浏览器中访问 http://localhost:3000

## 2. Shell版（简化功能）

### 功能
- 添加货物
- 查看所有货物
- 修改货物数量
- 删除货物
- 搜索货物
- 统计信息

### 运行
```bash
cd ~/warehouse-manager
./simple_inventory.sh
```

## 3. Shell版（高级功能，需要安装jq）

如果系统支持jq工具，可以使用功能更丰富的版本：
```bash
# Ubuntu/Debian系统安装jq
sudo apt-get install jq

# 或 CentOS/RHEL系统
sudo yum install jq

# 或 macOS
brew install jq

# 然后运行
./inventory_manager.sh
```

## 数据存储

- Web版：数据存储在 `warehouse-data.json`
- Shell版：数据存储在 `$HOME/warehouse_simple.txt`
- 高级Shell版：数据存储在 `$HOME/warehouse_inventory.json`

选择适合您需求的版本使用。