const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthSystem {
    constructor() {
        this.usersFile = path.join(__dirname, 'users.json');
        this.tokensFile = path.join(__dirname, 'tokens.json');
        this.users = this.loadUsers();
        this.tokens = this.loadTokens();
        this.loginAttempts = new Map(); // 存储登录尝试次数
        this.blockedIPs = new Map(); // 存储被封禁的IP
    }

    // 加载用户数据
    loadUsers() {
        try {
            if (fs.existsSync(this.usersFile)) {
                const data = fs.readFileSync(this.usersFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (err) {
            console.error('Error loading users:', err);
        }
        return { users: [] }; // 如果文件不存在，返回空数组
    }

    // 保存用户数据
    saveUsers() {
        fs.writeFileSync(this.usersFile, JSON.stringify(this.users, null, 2));
    }

    // 加载Token数据
    loadTokens() {
        try {
            if (fs.existsSync(this.tokensFile)) {
                const data = fs.readFileSync(this.tokensFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (err) {
            console.error('Error loading tokens:', err);
        }
        return { tokens: [] };
    }

    // 保存Token数据
    saveTokens() {
        fs.writeFileSync(this.tokensFile, JSON.stringify(this.tokens, null, 2));
    }

    // 生成安全的注册Token
    generateRegistrationToken() {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24小时后过期
        
        this.tokens.tokens.push({
            token: token,
            createdAt: Date.now(),
            expiresAt: expiresAt,
            used: false
        });
        
        this.saveTokens();
        return token;
    }

    // 验证注册Token
    validateRegistrationToken(token) {
        const tokenObj = this.tokens.tokens.find(t => t.token === token);
        
        if (!tokenObj) {
            return { valid: false, reason: 'Invalid token' };
        }
        
        if (tokenObj.used) {
            return { valid: false, reason: 'Token already used' };
        }
        
        if (Date.now() > tokenObj.expiresAt) {
            return { valid: false, reason: 'Token expired' };
        }
        
        return { valid: true };
    }

    // 标记Token为已使用
    markTokenAsUsed(token) {
        const tokenObj = this.tokens.tokens.find(t => t.token === token);
        if (tokenObj) {
            tokenObj.used = true;
            this.saveTokens();
        }
    }

    // 注册新用户
    async register(username, password, token) {
        // 验证注册Token
        const tokenValidation = this.validateRegistrationToken(token);
        if (!tokenValidation.valid) {
            throw new Error(tokenValidation.reason);
        }

        // 验证用户名是否已存在
        if (this.users.users.some(user => user.username === username)) {
            throw new Error('Username already exists');
        }

        // 输入验证和清理
        if (!username || !password) {
            throw new Error('Username and password are required');
        }

        // 验证用户名格式（只允许英文和数字，不超过12位）
        if (!/^[a-zA-Z0-9]{1,12}$/.test(username)) {
            throw new Error('Username must contain only English letters and numbers, maximum 12 characters');
        }

        // 验证密码格式（至少9位，必须包含大写字母、小写字母、数字和特殊符号）
        if (!this.isValidPassword(password)) {
            throw new Error('Password must be at least 9 characters long and contain uppercase, lowercase, numbers, and special symbols');
        }

        // 防止SQL注入和XSS攻击的基本清理
        username = this.sanitizeInput(username);

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const newUser = {
            id: this.users.users.length > 0 ? Math.max(...this.users.users.map(u => u.id)) + 1 : 1,
            username: username,
            password: hashedPassword,
            role: 'user',
            createdAt: new Date().toISOString()
        };

        this.users.users.push(newUser);
        this.saveUsers();

        // 标记注册Token为已使用
        this.markTokenAsUsed(token);

        return { success: true, userId: newUser.id };
    }

    // 验证密码格式（至少9位，包含大小写、数字和特殊符号）
    isValidPassword(password) {
        if (password.length < 9) {
            return false;
        }
        
        // 检查是否包含大写字母
        const hasUpperCase = /[A-Z]/.test(password);
        // 检查是否包含小写字母
        const hasLowerCase = /[a-z]/.test(password);
        // 检查是否包含数字
        const hasNumbers = /\d/.test(password);
        // 检查是否包含特殊符号
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        
        return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }

    // 用户登录
    async login(username, password, ip) {
        // 防爆破攻击检查
        if (this.isBlocked(ip)) {
            throw new Error('Too many failed attempts. Account temporarily blocked.');
        }

        // 输入清理
        username = this.sanitizeInput(username);

        // 查找用户
        const user = this.users.users.find(u => u.username === username);
        if (!user) {
            this.recordFailedAttempt(ip);
            throw new Error('Invalid username or password');
        }

        // 验证密码
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            this.recordFailedAttempt(ip);
            throw new Error('Invalid username or password');
        }

        // 登录成功，重置尝试计数
        this.resetAttempts(ip);

        // 生成JWT令牌
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET || 'your-very-secure-secret-key-change-this-in-production',
            { expiresIn: '24h' }
        );

        return { success: true, token: token, username: user.username };
    }

    // 输入清理函数，防止注入攻击
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // 移除潜在危险字符
        return input
            .replace(/'/g, '')  // 移除单引号
            .replace(/"/g, '')  // 移除双引号
            .replace(/;/g, '')  // 移除分号
            .replace(/--/g, '') // 移除SQL注释
            .replace(/\//g, '') // 移除斜杠
            .replace(/\*/g, '') // 移除星号
            .trim();
    }

    // 记录失败的登录尝试
    recordFailedAttempt(ip) {
        const now = Date.now();
        const attempts = this.loginAttempts.get(ip) || [];
        
        // 清理超过15分钟的旧记录
        const recentAttempts = attempts.filter(time => now - time < 15 * 60 * 1000);
        recentAttempts.push(now);
        
        this.loginAttempts.set(ip, recentAttempts);
        
        // 如果15分钟内失败超过5次，封禁IP 30分钟
        if (recentAttempts.length >= 5) {
            this.blockedIPs.set(ip, now + 30 * 60 * 1000);
        }
    }

    // 重置登录尝试计数
    resetAttempts(ip) {
        this.loginAttempts.delete(ip);
    }

    // 检查IP是否被封禁
    isBlocked(ip) {
        const blockExpireTime = this.blockedIPs.get(ip);
        if (blockExpireTime && Date.now() < blockExpireTime) {
            return true;
        } else if (blockExpireTime && Date.now() >= blockExpireTime) {
            // 如果封禁时间已过，移除封禁
            this.blockedIPs.delete(ip);
        }
        return false;
    }

    // JWT验证中间件
    verifyToken(req, res, next) {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        try {
            const decoded = jwt.verify(
                token.startsWith('Bearer ') ? token.slice(7) : token,
                process.env.JWT_SECRET || 'your-very-secure-secret-key-change-this-in-production'
            );
            req.user = decoded;
            next();
        } catch (ex) {
            res.status(400).json({ error: 'Invalid token.' });
        }
    }
}

module.exports = AuthSystem;