const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const pinyin = require('pinyin');
const jwt = require('jsonwebtoken');
const AuthSystem = require('./auth');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'warehouse-data.json');

// 初始化身份验证系统
const authSystem = new AuthSystem();

// 中间件
app.use(cors());
app.use(express.json());

// 验证JWT的中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-very-secure-secret-key-change-this-in-production', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// 登录API - 不需要验证
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // 获取客户端IP地址，考虑代理情况
    const ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               (req.connection.socket ? req.connection.socket.remoteAddress : null);
    
    authSystem.login(username, password, ip)
        .then(result => {
            if (result.success) {
                res.json(result);
            } else {
                res.status(401).json({ error: result.error });
            }
        })
        .catch(err => {
            res.status(401).json({ error: err.message });
        });
});

// 注册API - 不需要验证
app.post('/api/register', (req, res) => {
    const { username, password, token } = req.body;
    
    authSystem.register(username, password, token)
        .then(result => {
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json({ error: result.error });
            }
        })
        .catch(err => {
            res.status(400).json({ error: err.message });
        });
});

// 生成注册Token的API
app.post('/api/generate-token', (req, res) => {
    const token = authSystem.generateRegistrationToken();
    res.json({ token: token });
});

// 需要认证的API路由
app.use('/api/inventory', authenticateToken);
app.use('/api/search', authenticateToken);

// 确保数据文件存在
function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            items: [
                { id: 1, name: "笔记本电脑", quantity: 10 },
                { id: 2, name: "鼠标", quantity: 50 },
                { id: 3, name: "键盘", quantity: 30 }
            ],
            nextId: 4
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// 读取数据
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 获取所有库存
app.get('/api/inventory', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 添加新物品
app.post('/api/inventory', (req, res) => {
    try {
        const { name, quantity } = req.body;
        if (!name || quantity === undefined) {
            return res.status(400).json({ error: 'Name and quantity are required' });
        }

        // 防止注入攻击
        const sanitizedName = name.replace(/[<>'"&;]/g, '');
        
        const data = readData();
        const newItem = {
            id: data.nextId++,
            name: sanitizedName.trim(),
            quantity: parseInt(quantity)
        };
        data.items.push(newItem);
        writeData(data);

        res.json(newItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 更新物品数量
app.put('/api/inventory/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { quantity } = req.body;

        const data = readData();
        const itemIndex = data.items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        data.items[itemIndex].quantity = parseInt(quantity);
        writeData(data);

        res.json(data.items[itemIndex]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 删除物品
app.delete('/api/inventory/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);

        const data = readData();
        const itemIndex = data.items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
            return res.status(404).json({ error: 'Item not found' });
        }

        data.items.splice(itemIndex, 1);
        writeData(data);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 搜索物品
// 辅助函数：获取汉字的拼音
function getPinyin(text) {
    try {
        const result = pinyin.pinyin(text, {
            heteronym: false,  // 不开启多音字模式
            segment: false,    // 不开启分词模式
            style: pinyin.STYLE_NORMAL  // 普通风格，不带声调
        });
        
        // 处理嵌套数组结构，例如 [['bǐ'], ['jì'], ['běn'], ['diàn'], ['nǎo']]
        if (Array.isArray(result)) {
            return result.map(item => {
                if (Array.isArray(item)) {
                    // 获取声调去除后的拼音，通常是第一个元素
                    return item[0].replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g, function(match) {
                        // 去除声调符号
                        const replacements = {
                            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
                            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                            'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v'
                        };
                        return replacements[match] || match.charAt(0);
                    });
                }
                return item;
            }).join('');
        }
        return result;
    } catch (error) {
        console.error('Pinyin conversion error:', error);
        return text; // 如果转换失败，返回原始文本
    }
}

// 辅助函数：获取拼音首字母
function getFirstLetters(text) {
    try {
        const result = pinyin.pinyin(text, {
            heteronym: false,
            segment: false,
            style: pinyin.STYLE_FIRST_LETTER  // 获取首字母
        });
        
        // 处理嵌套数组结构，例如 [['b'], ['j'], ['b'], ['d'], ['n']]
        if (Array.isArray(result)) {
            return result.map(item => {
                if (Array.isArray(item)) {
                    const letter = item[0];
                    // Remove tone marks properly
                    return letter.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜüǐ]/g, function(match) {
                        const replacements = {
                            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
                            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                            'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v',
                            'ǐ': 'i' // Add ǐ
                        };
                        return replacements[match] || match.charAt(0);
                    }).charAt(0).toLowerCase();
                }
                return item.toLowerCase();
            }).join('');
        }
        return result.toLowerCase();
    } catch (error) {
        console.error('Pinyin first letter conversion error:', error);
        return text; // 如果转换失败，返回原始文本
    }
}

app.get('/api/search/:query', (req, res) => {
    try {
        // 防止注入攻击
        const query = req.params.query.replace(/[<>'"&;]/g, '').toLowerCase();
        const data = readData();
        
        const filteredItems = data.items.filter(item => {
            const itemName = item.name.toLowerCase();
            
            // 原始匹配
            if (itemName.includes(query)) {
                return true;
            }
            
            // 拼音匹配
            const itemNamePinyin = getPinyin(item.name).toLowerCase();
            if (itemNamePinyin.includes(query)) {
                return true;
            }
            
            // 拼音首字母匹配
            const itemNameFirstLetters = getFirstLetters(item.name).toLowerCase();
            if (itemNameFirstLetters.includes(query)) {
                return true;
            }
            
            return false;
        });
        
        res.json(filteredItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 提供主页
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.status(404).send('Main page not found');
    }
});

// 提供登录页面
app.get('/login', (req, res) => {
    const loginPath = path.join(__dirname, 'login.html');
    if (fs.existsSync(loginPath)) {
        const html = fs.readFileSync(loginPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.status(404).send('Login page not found');
    }
});

// 提供注册页面
app.get('/register', (req, res) => {
    const registerPath = path.join(__dirname, 'register.html');
    if (fs.existsSync(registerPath)) {
        const html = fs.readFileSync(registerPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        res.status(404).send('Register page not found');
    }
});

// 静态文件服务 - 放在最后
app.use(express.static('.'));

ensureDataFile();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`请在浏览器中访问 http://你的电脑IP:${PORT}/login 来使用仓库管理系统`);
});