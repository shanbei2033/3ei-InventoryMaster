const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const pinyin = require('pinyin');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'warehouse-data.json');

// 设置CORS策略，允许来自任何源的请求
app.use(cors({
  origin: '*', // 允许所有来源
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供静态文件服务，但明确指定目录
app.use(express.static(path.join(__dirname)));

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
        const query = req.params.query.toLowerCase();
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

// 根路由，返回主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 在所有网络接口上监听
app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`请在浏览器中访问 http://你的电脑IP:3000 来使用仓库管理系统`);
    console.log(`可能的访问地址:`);
    console.log(`- http://localhost:3000`);
    console.log(`- http://127.0.0.1:3000`);
    console.log(`- http://172.26.11.73:3000 (WSL内部)`);
    console.log(`- http://10.0.0.241:3000 (Windows主机 - 从外部访问)`);
});