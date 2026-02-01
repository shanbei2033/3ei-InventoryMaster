# 仓库管理系统完整部署指南

## 部署到远程服务器

### 步骤 1: 连接到您的服务器
```bash
ssh root@154.82.136.72
```

### 步骤 2: 安装 Node.js
```bash
# 更新包列表
apt update

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
apt install -y nodejs

# 验证安装
node --version
npm --version
```

### 步骤 3: 安装 PM2 (用于后台运行)
```bash
npm install -g pm2
```

### 步骤 4: 创建应用目录并进入
```bash
mkdir -p /opt/warehouse-manager
cd /opt/warehouse-manager
```

### 步骤 5: 创建服务器文件 (server.js)
```bash
cat > server.js << 'EOF'
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;
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

// 读取数据
function readData() {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// 写入数据
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// API 路由
app.get('/api/inventory', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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

// 提供主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 确保数据文件存在
ensureDataFile();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`仓库管理系统服务器运行在 http://0.0.0.0:${PORT}`);
    console.log(`请在浏览器中访问 http://你的服务器IP:${PORT} 来使用仓库管理系统`);
});
EOF
```

### 步骤 6: 创建前端文件 (index.html)
```bash
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>仓库管理系统</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f7fa;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        header {
            text-align: center;
            margin-bottom: 30px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .controls {
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            margin-bottom: 30px;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            margin-bottom: 15px;
        }

        .input-group label {
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }

        .input-group input {
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .input-group input:focus {
            outline: none;
            border-color: #667eea;
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }

        .stat-card h3 {
            color: #666;
            margin-bottom: 10px;
            font-size: 1em;
        }

        .stat-card p {
            font-size: 2em;
            font-weight: bold;
            color: #333;
        }

        .search-bar {
            margin-bottom: 20px;
        }

        .search-bar input {
            width: 100%;
            padding: 12px 20px;
            border: 2px solid #e1e5e9;
            border-radius: 6px;
            font-size: 16px;
        }

        .inventory-container {
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            overflow: hidden;
        }

        .inventory-container h2 {
            padding: 20px;
            background-color: #f8f9fa;
            margin: 0;
            border-bottom: 1px solid #eee;
        }

        .inventory-list {
            padding: 20px;
        }

        .empty-state {
            text-align: center;
            color: #999;
            padding: 40px 20px;
        }

        .inventory-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border: 1px solid #eee;
            border-radius: 8px;
            margin-bottom: 10px;
            background-color: #fafafa;
            transition: transform 0.2s;
        }

        .inventory-item:hover {
            transform: translateX(5px);
            background-color: #f0f8ff;
        }

        .item-info {
            flex-grow: 1;
        }

        .item-name {
            font-weight: 600;
            font-size: 1.1em;
            color: #333;
        }

        .item-id {
            color: #999;
            font-size: 0.9em;
        }

        .item-controls {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .quantity-display {
            background: #e3f2fd;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: 600;
            min-width: 60px;
            text-align: center;
        }

        .quantity-btn {
            width: 30px;
            height: 30px;
            border: none;
            border-radius: 50%;
            background: #667eea;
            color: white;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .delete-btn {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        }

        .delete-btn:hover {
            background: #ff5252;
        }

        .edit-input {
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 3px;
            width: 100px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            header h1 {
                font-size: 2em;
            }
            
            .controls {
                padding: 15px;
            }
            
            .stats {
                grid-template-columns: 1fr;
            }
            
            .inventory-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 10px;
            }
            
            .item-controls {
                width: 100%;
                justify-content: space-between;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📦 仓库管理系统</h1>
            <p>管理您的库存物品</p>
        </header>

        <div class="controls">
            <div class="input-group">
                <label for="itemName">货物名称:</label>
                <input type="text" id="itemName" placeholder="输入货物名称">
            </div>
            
            <div class="input-group">
                <label for="itemQuantity">货物数量:</label>
                <input type="number" id="itemQuantity" placeholder="输入数量" min="0">
            </div>
            
            <button id="addItemBtn" class="btn-primary">添加货物</button>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>总货物种类</h3>
                <p id="totalItems">0</p>
            </div>
            <div class="stat-card">
                <h3>总数量</h3>
                <p id="totalQuantity">0</p>
            </div>
        </div>

        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="搜索货物...">
        </div>

        <div class="inventory-container">
            <h2>库存清单</h2>
            <div id="inventoryList" class="inventory-list">
                <div class="empty-state">
                    <p>暂无库存数据</p>
                    <p>添加您的第一件货物吧！</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 仓库管理系统 JavaScript 逻辑
        class WarehouseManager {
            constructor() {
                this.items = [];
                this.nextId = 1;
                this.init();
            }

            init() {
                this.loadFromStorage();
                this.bindEvents();
                this.render();
            }

            async loadFromStorage() {
                try {
                    const response = await fetch('/api/inventory');
                    const data = await response.json();
                    this.items = data.items || [];
                    this.nextId = data.nextId || 1;
                    this.render();
                } catch (error) {
                    console.error('Failed to load data from server:', error);
                }
            }

            async addItem(name, quantity) {
                if (!name.trim()) return false;
                
                try {
                    const response = await fetch('/api/inventory', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: name.trim(),
                            quantity: parseInt(quantity) || 0
                        })
                    });
                    
                    if (response.ok) {
                        const newItem = await response.json();
                        this.items.push(newItem);
                        this.nextId = newItem.id + 1;
                        this.render();
                        return true;
                    }
                } catch (error) {
                    console.error('Failed to add item:', error);
                }
                
                return false;
            }

            async updateQuantity(id, newQuantity) {
                try {
                    const response = await fetch(\`/api/inventory/\${id}\`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            quantity: Math.max(0, parseInt(newQuantity) || 0)
                        })
                    });
                    
                    if (response.ok) {
                        const updatedItem = await response.json();
                        const index = this.items.findIndex(item => item.id === id);
                        if (index !== -1) {
                            this.items[index] = updatedItem;
                            this.render();
                        }
                    }
                } catch (error) {
                    console.error('Failed to update quantity:', error);
                }
            }

            async deleteItem(id) {
                try {
                    const response = await fetch(\`/api/inventory/\${id}\`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        this.items = this.items.filter(item => item.id !== id);
                        this.render();
                    }
                } catch (error) {
                    console.error('Failed to delete item:', error);
                }
            }

            searchItems(query) {
                if (!query) return this.items;
                return this.items.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
            }

            getTotalItems() {
                return this.items.length;
            }

            getTotalQuantity() {
                return this.items.reduce((sum, item) => sum + item.quantity, 0);
            }

            bindEvents() {
                const addItemBtn = document.getElementById('addItemBtn');
                const itemNameInput = document.getElementById('itemName');
                const itemQuantityInput = document.getElementById('itemQuantity');
                const searchInput = document.getElementById('searchInput');

                addItemBtn.addEventListener('click', async () => {
                    const name = itemNameInput.value;
                    const quantity = itemQuantityInput.value;

                    if (await this.addItem(name, quantity)) {
                        itemNameInput.value = '';
                        itemQuantityInput.value = '';
                        itemNameInput.focus();
                    }
                });

                // 按Enter键添加货物
                itemNameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addItemBtn.click();
                    }
                });

                itemQuantityInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        addItemBtn.click();
                    }
                });

                // 搜索功能
                searchInput.addEventListener('input', () => {
                    this.render();
                });
            }

            render() {
                this.renderStats();
                this.renderInventory();
            }

            renderStats() {
                document.getElementById('totalItems').textContent = this.getTotalItems();
                document.getElementById('totalQuantity').textContent = this.getTotalQuantity();
            }

            renderInventory() {
                const inventoryList = document.getElementById('inventoryList');
                const searchQuery = document.getElementById('searchInput').value;
                const filteredItems = this.searchItems(searchQuery);

                if (filteredItems.length === 0) {
                    inventoryList.innerHTML = \`
                        <div class="empty-state">
                            <p>暂无库存数据</p>
                            <p>\${searchQuery ? '搜索条件未匹配到结果' : '添加您的第一件货物吧！'}</p>
                        </div>
                    \`;
                    return;
                }

                inventoryList.innerHTML = filteredItems.map(item => \`
                    <div class="inventory-item" data-id="\${item.id}">
                        <div class="item-info">
                            <div class="item-name">\${item.name}</div>
                            <div class="item-id">ID: \${item.id}</div>
                        </div>
                        <div class="item-controls">
                            <div class="quantity-display">\${item.quantity}</div>
                            <button class="quantity-btn minus" onclick="warehouseManager.updateQuantity(\${item.id}, \${Math.max(0, item.quantity - 1)})">-</button>
                            <button class="quantity-btn plus" onclick="warehouseManager.updateQuantity(\${item.id}, \${item.quantity + 1})">+</button>
                            <button class="delete-btn" onclick="warehouseManager.deleteItem(\${item.id})">删除</button>
                        </div>
                    </div>
                \`).join('');
            }
        }

        // 初始化仓库管理系统
        let warehouseManager;
        document.addEventListener('DOMContentLoaded', () => {
            warehouseManager = new WarehouseManager();
        });
    </script>
</body>
</html>
EOF
```

### 步骤 7: 安装依赖并启动服务
```bash
# 安装 Express 和 CORS
npm install express cors

# 使用 PM2 启动应用
pm2 start server.js --name warehouse-manager
pm2 startup
pm2 save
```

### 步骤 8: 配置防火墙（如果需要）
```bash
ufw allow 3000
```

### 访问应用
现在您可以通过以下地址访问仓库管理系统：
- http://154.82.136.72:3000

系统将自动启动并持续运行，即使服务器重启也会自动恢复服务。