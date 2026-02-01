const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const pinyin = require('pinyin');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'warehouse-data.json');

// 设置CORS中间件，允许所有来源的请求
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static('.'));

// 确保数据文件存在
function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            items: [],
            nextId: 1
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

// 重新排序ID，确保它们是连续的
function reorganizeIds(items) {
    // 按原始ID排序
    const sortedItems = items.sort((a, b) => a.id - b.id);
    // 重新分配连续的ID
    return sortedItems.map((item, index) => ({
        ...item,
        id: index + 1
    }));
}

// 获取所有库存
app.get('/api/inventory', (req, res) => {
    try {
        const data = readData();
        // 重新组织ID以确保连续性
        const organizedItems = reorganizeIds(data.items);
        if (organizedItems.length !== data.items.length || 
            JSON.stringify(organizedItems) !== JSON.stringify(data.items)) {
            // 如果ID被重新组织，更新存储
            const updatedData = {
                items: organizedItems,
                nextId: organizedItems.length > 0 ? organizedItems.length + 1 : 1
            };
            writeData(updatedData);
            res.json(updatedData);
        } else {
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 添加新物品
app.post('/api/inventory', (req, res) => {
    try {
        const { name, quantity, threshold } = req.body;
        if (!name || quantity === undefined) {
            return res.status(400).json({ error: 'Name and quantity are required' });
        }

        const data = readData();
        const newItem = {
            id: data.nextId++,
            name: name.trim(),
            quantity: parseInt(quantity),
            threshold: threshold !== undefined ? parseInt(threshold) : 5 // 默认阈值为5
        };
        data.items.push(newItem);
        
        // 重新组织ID以确保连续性
        data.items = reorganizeIds(data.items);
        // 更新nextId
        data.nextId = data.items.length > 0 ? data.items.length + 1 : 1;
        
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

        // 删除指定ID的项目
        data.items.splice(itemIndex, 1);
        
        // 重新组织ID以确保连续性
        data.items = reorganizeIds(data.items);
        // 更新nextId
        data.nextId = data.items.length > 0 ? data.items.length + 1 : 1;
        
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

app.get('/api/search/:query', (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const data = readData();
        
        // 重新组织ID以确保连续性
        data.items = reorganizeIds(data.items);
        if (data.items.length > 0) {
            writeData(data);
        }
        
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

// 添加错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 添加健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器，监听所有接口
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`服务器时间: ${new Date().toISOString()}`);
    
    // 获取本机所有IP地址
    const os = require('os');
    const interfaces = os.networkInterfaces();
    console.log('可用的网络接口:');
    
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (!iface.internal && iface.family === 'IPv4') {
                console.log(`- ${name}: ${iface.address}`);
            }
        }
    }
    
    console.log(`\n尝试访问以下地址:`);
    console.log(`- 本地访问: http://localhost:${PORT} 或 http://127.0.0.1:${PORT}`);
    console.log(`- 局域网访问: http://${os.hostname()}:${PORT}`);
    console.log(`- WSL内部访问: http://172.26.11.73:${PORT}`);
    console.log(`- Windows主机访问: http://10.0.0.241:${PORT}`);
    
    console.log(`\n如果外部访问失败，可能需要:`);
    console.log(`1. 检查Windows防火墙设置`);
    console.log(`2. 确保Windows Defender没有阻止node.exe`);
    console.log(`3. 在Windows上运行: netsh advfirewall firewall add rule name="Node.js App" dir=in action=allow protocol=TCP localport=${PORT}`);
});

// 错误处理
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`端口 ${PORT} 已被占用，请选择其他端口`);
    } else {
        console.error('服务器启动错误:', err);
    }
});