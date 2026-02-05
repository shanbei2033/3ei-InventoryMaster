# 推送代码到GitHub仓库

## 问题诊断
推送过程中出现 "could not read Username for 'https://github.com': Device not configured" 错误，
这表示需要进行身份验证。

## 解决方案

### 方案1: 使用个人访问令牌 (推荐)
1. 登录GitHub，访问 https://github.com/settings/tokens
2. 点击 "Generate new token" -> "Fine-grained personal access tokens" 或 "Classic personal access tokens"
3. 生成一个新的令牌，复制保存
4. 在推送时，用户名输入您的GitHub用户名(shanbei2033)，密码输入刚才生成的令牌

### 方案2: 配置SSH密钥 (推荐用于长期使用)
1. 生成SSH密钥:
   ```bash
   ssh-keygen -t ed25519 -C "shanbei2033@example.com"
   ```
2. 将SSH公钥添加到GitHub:
   - 复制公钥内容: `cat ~/.ssh/id_ed25519.pub`
   - 访问 https://github.com/settings/ssh/new
   - 粘贴公钥并保存

3. 更改远程仓库URL为SSH方式:
   ```bash
   cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster
   git remote set-url origin git@github.com:shanbei2033/3ei-InventoryMaster.git
   ```

### 方案3: 使用缓存凭证
如果您不想每次都输入密码，可以配置凭证助手：
```bash
git config --global credential.helper store
```

## 手动推送命令
当您完成身份验证配置后，可以使用以下命令推送：

```bash
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster
git push -u origin main
```

## 验证推送
成功推送后，您可以在 https://github.com/shanbei2033/3ei-InventoryMaster 查看项目文件。