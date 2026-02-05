# 推送代码到GitHub仓库

## 步骤 1: 在GitHub上创建仓库
1. 登录到 https://github.com
2. 点击右上角的 "+" 号，选择 "New repository"
3. 输入仓库名称（例如：InventoryMaster）
4. 选择 "Public" 或 "Private"
5. 不要勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 步骤 2: 获取仓库URL
创建仓库后，您会看到类似这样的URL：
`https://github.com/YOUR_USERNAME/InventoryMaster.git`

## 步骤 3: 推送现有代码
在终端中运行以下命令（将 YOUR_GITHUB_REPO_URL 替换为上面的URL）：

```bash
cd /Users/shanbei/.openclaw/workspace/3ei-InventoryMaster

# 添加远程仓库地址
git remote add origin YOUR_GITHUB_REPO_URL

# 设置主分支为main
git branch -M main

# 推送代码到GitHub
git push -u origin main
```

## 如果出现认证问题
如果推送时出现认证问题，您可能需要：

1. 使用个人访问令牌（Personal Access Token）而不是密码
2. 或者配置SSH密钥进行认证

## 验证推送
推送完成后，刷新GitHub页面，您应该能看到所有项目文件已上传到仓库中。

## 后续更新
以后要更新代码时，只需运行：
```bash
git add .
git commit -m "描述您的更改"
git push
```