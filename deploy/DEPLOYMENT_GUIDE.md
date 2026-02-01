# 仓库管理系统部署指南

## 安全警告
**请勿通过不安全的方式传输敏感凭证（如服务器密码）**

## 部署步骤

### 1. 本地准备
1. 将 `deploy` 目录下的所有文件打包：
   ```bash
   cd ~/warehouse-manager
   tar -czf warehouse-manager-deploy.tar.gz deploy/
   ```

### 2. 传输到服务器
使用安全的文件传输方式将文件传输到您的服务器：

```bash
# 使用 SCP 传输文件
scp warehouse-manager-deploy.tar.gz root@154.82.136.72:/root/

# 或使用 SFTP 等其他安全传输方式
```

### 3. 在服务器上部署
1. SSH 连接到您的服务器：
   ```bash
   ssh root@154.82.136.72
   ```

2. 解压部署包：
   ```bash
   cd /root
   tar -xzf warehouse-manager-deploy.tar.gz
   ```

3. 进入部署目录并运行部署脚本：
   ```bash
   cd deploy
   chmod +x deploy.sh
   ./deploy.sh
   ```

### 4. 防火墙配置（如果需要）
如果服务器启用了防火墙，需要开放 3000 端口：

```bash
ufw allow 3000
```

### 5. 访问应用
部署完成后，您可以通过以下地址访问仓库管理系统：
- http://154.82.136.72:3000

## 管理应用
应用使用 PM2 进行管理，常用的命令：

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs warehouse-manager

# 重启应用
pm2 restart warehouse-manager

# 停止应用
pm2 stop warehouse-manager
```

## 故障排除
1. 如果无法访问，请检查防火墙设置
2. 查看应用日志：`pm2 logs warehouse-manager`
3. 确认服务是否正在运行：`pm2 status`

## 安全建议
1. 更改服务器默认密码
2. 配置防火墙规则
3. 定期更新系统
4. 使用 SSH 密钥认证而非密码认证