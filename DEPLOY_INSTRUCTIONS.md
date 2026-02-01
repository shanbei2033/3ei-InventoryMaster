# 仓库管理系统部署说明

## 一键部署脚本

我已经为您创建了一个完整的部署脚本，您需要手动复制并在您的服务器上执行。

### 部署步骤

1. 将以下脚本内容复制到您的服务器上：

   将 `~/warehouse-manager/full_deploy_script.sh` 文件的内容复制到您的服务器上，例如：

   ```bash
   # 在您的服务器上创建文件
   nano deploy.sh
   # 粘贴脚本内容并保存
   ```

2. 给脚本赋予执行权限：

   ```bash
   chmod +x deploy.sh
   ```

3. 运行部署脚本：

   ```bash
   ./deploy.sh
   ```

### 部署后操作

1. 部署完成后，使用PM2启动应用：

   ```bash
   cd /opt/warehouse-manager
   npm install express cors
   pm2 start server.js --name warehouse-manager
   pm2 startup
   pm2 save
   ```

2. 应用将运行在端口 3000 上，您可以通过以下地址访问：
   
   ```
   http://154.82.136.72:3000
   ```

### 防火墙设置

如果服务器有防火墙，请开放3000端口：

```bash
ufw allow 3000
```

### 管理应用

使用PM2管理应用：

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs warehouse-manager

# 重启应用
pm2 restart warehouse-manager

# 停止应用
pm2 stop warehouse-manager
```

### 脚本内容预览

完整的部署脚本包含：

1. 系统更新和Node.js安装
2. PM2安装（用于后台运行）
3. 应用文件创建（包括前端和后端）
4. 依赖安装
5. 服务启动

脚本会创建一个完整的仓库管理系统，包含添加、修改、删除、搜索货物等功能，并将数据持久化存储。