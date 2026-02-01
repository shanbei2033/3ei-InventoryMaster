// WSL专用代理服务器
// 用于解决WSL2网络访问问题
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 首先检查是否安装了所需模块
try {
  require('http-proxy-middleware');
} catch (e) {
  console.error('缺少 http-proxy-middleware 模块，正在安装...');
  const { execSync } = require('child_process');
  execSync('npm install http-proxy-middleware', { stdio: 'inherit' });
}

// 设置代理，将请求转发到本地服务
const apiProxy = createProxyMiddleware('/api', {
  target: 'http://localhost:3000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`API请求: ${req.method} ${req.url}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`API响应: ${proxyRes.statusCode} ${req.url}`);
  }
});

// 静态文件服务
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 代理API请求到原始服务器
app.use('/api', apiProxy);

// 根路由
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 为了解决WSL2的网络问题，我们尝试以下步骤：

// 1. 启动内部服务器（监听在127.0.0.1）
const internalApp = express();
internalApp.use(express.json());
internalApp.use(express.urlencoded({ extended: true }));
internalApp.use(express.static(path.join(__dirname)));

// 内部服务器的API路由
const cors = require('cors');
const pinyin = require('pinyin');

const DATA_FILE = path.join(__dirname, 'warehouse-data.json');

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

ensureDataFile();

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
internalApp.get('/api/inventory', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 添加新物品
internalApp.post('/api/inventory', (req, res) => {
    try {
        const { name, quantity } = req.body;
        if (!name || quantity === undefined) {
            return res.status(400).json({ error: 'Name and quantity are required' });
        }

        const data = readData();
        const newItem = {
            id: data.nextId++,
            name: name.trim(),
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
internalApp.put('/api/inventory/:id', (req, res) => {
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
internalApp.delete('/api/inventory/:id', (req, res) => {
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

// 搜索物品辅助函数
function getPinyin(text) {
    try {
        const result = pinyin.pinyin(text, {
            heteronym: false,
            segment: false,
            style: pinyin.STYLE_NORMAL
        });
        
        if (Array.isArray(result)) {
            return result.map(item => {
                if (Array.isArray(item)) {
                    return item[0].replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜü]/g, function(match) {
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
        return text;
    }
}

function getFirstLetters(text) {
    try {
        const result = pinyin.pinyin(text, {
            heteronym: false,
            segment: false,
            style: pinyin.STYLE_FIRST_LETTER
        });
        
        if (Array.isArray(result)) {
            return result.map(item => {
                if (Array.isArray(item)) {
                    const letter = item[0];
                    return letter.replace(/[āáǎàōóǒòēéěèīíǐìūúǔùǖǘǚǜüǐ]/g, function(match) {
                        const replacements = {
                            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
                            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
                            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
                            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
                            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
                            'ǖ': 'v', 'ǘ': 'v', 'ǚ': 'v', 'ǜ': 'v', 'ü': 'v',
                            'ǐ': 'i'
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
        return text;
    }
}

internalApp.get('/api/search/:query', (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const data = readData();
        
        const filteredItems = data.items.filter(item => {
            const itemName = item.name.toLowerCase();
            
            if (itemName.includes(query)) {
                return true;
            }
            
            const itemNamePinyin = getPinyin(item.name).toLowerCase();
            if (itemNamePinyin.includes(query)) {
                return true;
            }
            
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

// 启动内部服务器
const internalServer = internalApp.listen(3001, '127.0.0.1', () => {
    console.log('内部服务器运行在 http://127.0.0.1:3001');
});

// 主服务器监听所有接口
app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`请在浏览器中访问 http://你的电脑IP:3000 来使用仓库管理系统`);
    console.log(`可能的访问地址:`);
    console.log(`- http://localhost:3000`);
    console.log(`- http://127.0.0.1:3000`);
    console.log(`- http://172.26.11.73:3000 (WSL内部)`);
    console.log(`- http://10.0.0.241:3000 (Windows主机 - 从外部访问)`);
    
    console.log('\n注意：如果外部访问失败，这可能是WSL2的网络限制。');
    console.log('请尝试以下解决方案:');
    console.log('1. 在Windows防火墙中为端口3000创建入站规则');
    console.log('2. 或者在Windows上直接运行此应用');
    console.log('3. 或者使用WSL的端口转发功能');
});