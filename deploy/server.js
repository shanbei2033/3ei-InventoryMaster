const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'warehouse-data.json');

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

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
app.get('/api/search/:query', (req, res) => {
    try {
        const query = req.params.query.toLowerCase();
        const data = readData();
        const filteredItems = data.items.filter(item => 
            item.name.toLowerCase().includes(query)
        );
        res.json(filteredItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`请在浏览器中访问 http://你的电脑IP:${PORT} 来使用仓库管理系统`);
});