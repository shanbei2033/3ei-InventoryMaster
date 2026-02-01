// 仓库管理系统 JavaScript 逻辑
class WarehouseManager {
    constructor() {
        this.items = [];
        this.nextId = 1;
        this.lowStockThreshold = 5; // 默认低库存阈值
        this.selectedItems = new Set(); // 用于批量操作
        this.expandedChartId = null; // 当前展开的图表ID
        this.chartHistory = {}; // 存储每个物品的历史数据
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initializeChartHistory();
        this.bindEvents();
        this.render();
    }

    initializeChartHistory() {
        // 初始化图表历史数据，每个物品都有一个历史记录数组
        for (const item of this.items) {
            if (!this.chartHistory[item.id]) {
                // 初始化历史记录，包含当前数量和过去几天的数据
                this.chartHistory[item.id] = [
                    { date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: Math.max(1, item.quantity - 3) },
                    { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: Math.max(1, item.quantity - 2) },
                    { date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: Math.max(1, item.quantity - 1) },
                    { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: item.quantity },
                    { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: item.quantity },
                    { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], quantity: item.quantity },
                    { date: new Date().toISOString().split('T')[0], quantity: item.quantity }
                ];
            }
        }
    }

    async loadFromStorage() {
        try {
            // 首先尝试从服务器加载数据
            const response = await fetch('/api/inventory');
            if (response.ok) {
                const data = await response.json();
                this.items = data.items || [];
                this.nextId = data.nextId || 1;
            } else {
                // 如果服务器不可用，则从本地存储加载
                const savedData = localStorage.getItem('warehouseData');
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    this.items = parsed.items || [];
                    this.nextId = parsed.nextId || 1;
                } else {
                    // 初始化示例数据
                    this.items = [
                        { id: 1, name: "笔记本电脑", quantity: 10, threshold: 5 },
                        { id: 2, name: "鼠标", quantity: 50, threshold: 10 },
                        { id: 3, name: "键盘", quantity: 30, threshold: 8 },
                        { id: 4, name: "显示器", quantity: 15, threshold: 3 },
                        { id: 5, name: "音响", quantity: 8, threshold: 2 }
                    ];
                    this.nextId = 6;
                    this.saveToStorage();
                }
            }
        } catch (error) {
            // 如果服务器请求失败，从本地存储加载
            const savedData = localStorage.getItem('warehouseData');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                this.items = parsed.items || [];
                this.nextId = parsed.nextId || 1;
            } else {
                // 初始化示例数据
                this.items = [
                    { id: 1, name: "笔记本电脑", quantity: 10, threshold: 5 },
                    { id: 2, name: "鼠标", quantity: 50, threshold: 10 },
                    { id: 3, name: "键盘", quantity: 30, threshold: 8 },
                    { id: 4, name: "显示器", quantity: 15, threshold: 3 },
                    { id: 5, name: "音响", quantity: 8, threshold: 2 }
                ];
                this.nextId = 6;
                this.saveToStorage();
            }
        }
        this.initializeChartHistory();
        this.render();
    }

    async saveToStorage() {
        // 尝试保存到服务器
        try {
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: this.items,
                    nextId: this.nextId,
                    chartHistory: this.chartHistory
                })
            });
            
            if (!response.ok) {
                // 如果服务器保存失败，保存到本地存储
                const data = {
                    items: this.items,
                    nextId: this.nextId,
                    chartHistory: this.chartHistory
                };
                localStorage.setItem('warehouseData', JSON.stringify(data));
            }
        } catch (error) {
            // 如果服务器保存失败，保存到本地存储
            const data = {
                items: this.items,
                nextId: this.nextId,
                chartHistory: this.chartHistory
            };
            localStorage.setItem('warehouseData', JSON.stringify(data));
        }
    }

    async addItem(name, quantity, threshold = 5) {
        if (!name.trim()) return false;
        
        const newItem = {
            id: this.nextId++,
            name: name.trim(),
            quantity: parseInt(quantity) || 0,
            threshold: parseInt(threshold) || 5
        };
        
        this.items.push(newItem);
        
        // 为新项目初始化图表历史
        this.chartHistory[newItem.id] = [
            { date: new Date().toISOString().split('T')[0], quantity: newItem.quantity }
        ];
        
        try {
            // 尝试保存到服务器
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name.trim(),
                    quantity: parseInt(quantity) || 0,
                    threshold: parseInt(threshold) || 5
                })
            });
            
            if (response.ok) {
                const savedItem = await response.json();
                // 使用服务器返回的数据更新本地
                const index = this.items.findIndex(item => item.id === savedItem.id);
                if (index !== -1) {
                    this.items[index] = savedItem;
                }
            } else {
                // 服务器保存失败，保存到本地
                this.saveToStorage();
            }
        } catch (error) {
            // 服务器保存失败，保存到本地
            this.saveToStorage();
        }
        
        this.render();
        return true;
    }

    async updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            const oldQuantity = item.quantity;
            item.quantity = Math.max(0, parseInt(newQuantity) || 0);
            
            // 更新图表历史记录
            const today = new Date().toISOString().split('T')[0];
            if (!this.chartHistory[id]) {
                this.chartHistory[id] = [];
            }
            
            // 检查今天是否已有记录
            const todayRecordIndex = this.chartHistory[id].findIndex(record => record.date === today);
            if (todayRecordIndex !== -1) {
                this.chartHistory[id][todayRecordIndex].quantity = item.quantity;
            } else {
                // 添加今天的记录
                this.chartHistory[id].push({ date: today, quantity: item.quantity });
                // 只保留最近7天的数据
                this.chartHistory[id] = this.chartHistory[id].slice(-7);
            }
            
            try {
                // 尝试保存到服务器
                const response = await fetch(`/api/inventory/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        quantity: item.quantity
                    })
                });
                
                if (!response.ok) {
                    // 服务器保存失败，保存到本地
                    this.saveToStorage();
                }
            } catch (error) {
                // 服务器保存失败，保存到本地
                this.saveToStorage();
            }
            
            this.render();
        }
    }

    async deleteItem(id) {
        // 找到要删除的项目元素
        const itemElement = document.querySelector(`.inventory-item[data-id="${id}"]`);
        
        if (itemElement) {
            // 添加删除动画
            itemElement.style.transition = 'all 0.3s ease';
            itemElement.style.opacity = '0';
            itemElement.style.transform = 'translateX(-100%)';
            itemElement.style.height = '0';
            itemElement.style.padding = '0';
            itemElement.style.margin = '0';
            itemElement.style.overflow = 'hidden';
            
            // 等待动画完成后删除元素
            setTimeout(async () => {
                this.items = this.items.filter(item => item.id !== id);
                
                // 删除对应的图表历史
                if (this.chartHistory[id]) {
                    delete this.chartHistory[id];
                }
                
                // 如果删除的是当前展开图表的项目，收起图表
                if (this.expandedChartId === id) {
                    this.expandedChartId = null;
                }
                
                try {
                    // 尝试从服务器删除
                    const response = await fetch(`/api/inventory/${id}`, {
                        method: 'DELETE'
                    });
                    
                    if (!response.ok) {
                        // 服务器删除失败，保存到本地
                        this.saveToStorage();
                    }
                } catch (error) {
                    // 服务器删除失败，保存到本地
                    this.saveToStorage();
                }
                
                this.render();
            }, 300);
        } else {
            // 如果没有找到元素（比如在搜索视图中），直接删除
            this.items = this.items.filter(item => item.id !== id);
            
            // 删除对应的图表历史
            if (this.chartHistory[id]) {
                delete this.chartHistory[id];
            }
            
            // 如果删除的是当前展开图表的项目，收起图表
            if (this.expandedChartId === id) {
                this.expandedChartId = null;
            }
            
            try {
                // 尝试从服务器删除
                const response = await fetch(`/api/inventory/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    // 服务器删除失败，保存到本地
                    this.saveToStorage();
                }
            } catch (error) {
                // 服务器删除失败，保存到本地
                this.saveToStorage();
            }
            
            this.render();
        }
    }

    // 全选功能
    selectAllItems() {
        // 获取当前显示的项目（考虑搜索过滤）
        const searchQuery = document.getElementById('searchInput').value;
        let displayedItems;
        if (!searchQuery) {
            displayedItems = this.items;
        } else {
            displayedItems = this.items.filter(item => 
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 选中所有显示的项目
        displayedItems.forEach(item => {
            this.selectedItems.add(item.id);
        });

        this.render();
    }

    // 批量删除选中的项目
    async deleteSelectedItems() {
        if (this.selectedItems.size === 0) {
            alert('请先选择要删除的项目');
            return;
        }

        if (!confirm(`确定要删除选中的 ${this.selectedItems.size} 个项目吗？`)) {
            return;
        }

        // 将选中的ID转换为数组并倒序排列，避免删除过程中索引变化的问题
        const selectedIds = Array.from(this.selectedItems).map(Number).sort((a, b) => b - a);
        
        // 删除项目
        for (const id of selectedIds) {
            this.items = this.items.filter(item => item.id !== id);
            
            // 删除对应的图表历史
            if (this.chartHistory[id]) {
                delete this.chartHistory[id];
            }
            
            // 如果删除的是当前展开图表的项目，收起图表
            if (this.expandedChartId === id) {
                this.expandedChartId = null;
            }
        }

        // 清空选中项
        this.selectedItems.clear();

        try {
            // 尝试保存到服务器
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: this.items,
                    nextId: this.nextId
                })
            });
            
            if (!response.ok) {
                // 服务器保存失败，保存到本地
                this.saveToStorage();
            }
        } catch (error) {
            // 服务器保存失败，保存到本地
            this.saveToStorage();
        }

        this.render();
    }

    // 切换图表显示
    toggleChart(itemId) {
        if (this.expandedChartId === itemId) {
            // 如果当前展开的就是这个图表，则收起
            this.expandedChartId = null;
        } else {
            // 否则展开这个图表
            this.expandedChartId = itemId;
        }
        this.render();
    }

    // 绘制图表
    drawChart(canvasId, itemId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const history = this.chartHistory[itemId] || [];
        
        if (history.length === 0) return;
        
        // 设置画布大小
        canvas.width = canvas.offsetWidth * 2;
        canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2); // 高分辨率
        
        // 获取最大值和最小值以确定范围
        const quantities = history.map(item => item.quantity);
        const maxQty = Math.max(...quantities);
        const minQty = Math.min(...quantities);
        const range = maxQty - minQty || 1; // 防止范围为0
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = 30;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // 清空画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制网格线
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
            
            // 添加数值标签
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'right';
            const value = Math.round(maxQty - (range / 5) * i);
            ctx.fillText(value.toString(), padding - 5, y + 4);
        }
        
        // 垂直网格线和日期标签
        for (let i = 0; i < history.length; i++) {
            const x = padding + (chartWidth / (history.length - 1)) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
            
            // 添加日期标签
            ctx.fillStyle = '#666';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            const date = history[i].date.split('-')[2]; // 只显示日
            ctx.fillText(date, x, height - 5);
        }
        
        // 绘制折线
        ctx.beginPath();
        for (let i = 0; i < history.length; i++) {
            const x = padding + (chartWidth / (history.length - 1)) * i;
            const y = padding + chartHeight - ((history[i].quantity - minQty) / range) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.strokeStyle = '#667eea';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // 绘制数据点
        for (let i = 0; i < history.length; i++) {
            const x = padding + (chartWidth / (history.length - 1)) * i;
            const y = padding + chartHeight - ((history[i].quantity - minQty) / range) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fillStyle = '#667eea';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // 添加标题
        const item = this.items.find(item => item.id === itemId);
        if (item) {
            ctx.fillStyle = '#333';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${item.name} 数量趋势`, width / 2, 15);
        }
    }

    // 导出数据
    exportData() {
        const dataStr = JSON.stringify({
            items: this.items,
            nextId: this.nextId,
            chartHistory: this.chartHistory
        }, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `warehouse-backup-${new Date().toISOString().slice(0, 19)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // 导入数据
    importData(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (importedData.items && Array.isArray(importedData.items)) {
                    this.items = importedData.items;
                    this.nextId = importedData.nextId || this.items.length + 1;
                    this.chartHistory = importedData.chartHistory || {};
                    
                    this.saveToStorage();
                    this.render();
                    
                    alert('数据导入成功！');
                } else {
                    alert('导入的文件格式不正确！');
                }
            } catch (error) {
                alert('导入失败：文件格式错误或损坏！');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    // 检查低库存
    isLowStock(item) {
        return item.quantity <= (item.threshold || this.lowStockThreshold);
    }

    async searchItems(query) {
        if (!query) return this.items;
        
        try {
            // 使用服务器端的增强搜索功能
            const response = await fetch(`/api/search/${encodeURIComponent(query)}`);
            if (response.ok) {
                return await response.json();
            } else {
                // 如果服务器搜索失败，使用客户端搜索作为备选
                return this.items.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
            }
        } catch (error) {
            // 如果服务器搜索失败，使用客户端搜索作为备选
            return this.items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
        }
    }

    getTotalItems() {
        return this.items.length;
    }

    getTotalQuantity() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // 同步版本的搜索方法，用于渲染时
    // 修复：前端不执行拼音搜索，只做基础搜索，拼音搜索由服务器端完成
    searchItemsSync(query) {
        if (!query) return this.items;
        
        // 只做基础的文本匹配，拼音搜索由服务器端完成
        return this.items.filter(item => 
            item.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    bindEvents() {
        const addItemBtn = document.getElementById('addItemBtn');
        const itemNameInput = document.getElementById('itemName');
        const itemQuantityInput = document.getElementById('itemQuantity');
        const itemThresholdInput = document.getElementById('itemThreshold');
        const searchInput = document.getElementById('searchInput');
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const fileInput = document.getElementById('fileInput');
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const toggleButtonsBtn = document.getElementById('toggleButtonsBtn');
        const actionButtonsContainer = document.getElementById('actionButtonsContainer');

        // 添加货物按钮
        addItemBtn.addEventListener('click', () => {
            const name = itemNameInput.value;
            const quantity = itemQuantityInput.value;
            const threshold = itemThresholdInput.value;

            if (this.addItem(name, quantity, threshold)) {
                itemNameInput.value = '';
                itemQuantityInput.value = '';
                itemThresholdInput.value = '5'; // 重置为默认值
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

        // 搜索功能 - 实现实时搜索
        searchInput.addEventListener('input', () => {
            this.render();
        });
        
        // 搜索框的回车事件
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.render();
            }
        });

        // 导出数据按钮
        exportDataBtn.addEventListener('click', () => {
            this.exportData();
        });

        // 导入数据按钮
        importDataBtn.addEventListener('click', () => {
            fileInput.click();
        });

        // 文件选择事件
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
                e.target.value = ''; // 重置文件输入
            }
        });

        // 全选按钮
        selectAllBtn.addEventListener('click', () => {
            this.selectAllItems();
        });

        // 批量删除按钮
        batchDeleteBtn.addEventListener('click', () => {
            this.deleteSelectedItems();
        });

        // 操作按钮展开/收回切换
        toggleButtonsBtn.addEventListener('click', () => {
            actionButtonsContainer.classList.toggle('collapsed');
            
            // 更新按钮文本
            const isCollapsed = actionButtonsContainer.classList.contains('collapsed');
            toggleButtonsBtn.textContent = isCollapsed ? '操作' : '收起';
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

    async renderInventory() {
        const inventoryList = document.getElementById('inventoryList');
        const searchQuery = document.getElementById('searchInput').value;
        
        // 对于空搜索，显示所有项目；否则执行搜索
        let filteredItems;
        if (!searchQuery) {
            filteredItems = this.items;
        } else {
            // 使用异步搜索方法
            filteredItems = await this.searchItems(searchQuery);
        }

        if (filteredItems.length === 0) {
            inventoryList.innerHTML = `
                <div class="empty-state">
                    <p>暂无库存数据</p>
                    <p>${searchQuery ? '搜索"' + searchQuery + '"未找到结果' : '添加您的第一件货物吧！'}</p>
                </div>
            `;
            return;
        }

        // 创建新的HTML内容
        const newHTML = filteredItems.map(item => {
            const showChart = this.expandedChartId === item.id;
            const chartId = `chart-${item.id}`;
            
            return `
                <div class="inventory-item ${this.isLowStock(item) ? 'low-stock' : ''}" data-id="${item.id}">
                    <div class="item-selector">
                        <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${this.selectedItems.has(item.id) ? 'checked' : ''}>
                    </div>
                    <div class="item-info" onclick="warehouseManager.toggleChart(${item.id})">
                        <div class="item-name">${item.name}</div>
                        <div class="item-id">ID: ${item.id} | 低库存提醒: ${item.threshold || this.lowStockThreshold}</div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-display">${item.quantity}</div>
                        <button class="quantity-btn minus" onclick="warehouseManager.updateQuantity(${item.id}, ${Math.max(0, item.quantity - 1)})">-</button>
                        <button class="quantity-btn plus" onclick="warehouseManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="delete-btn" onclick="warehouseManager.deleteItem(${item.id})">删除</button>
                    </div>
                </div>
                <div class="chart-container ${showChart ? 'expanded' : ''}" id="chart-area-${item.id}">
                    <div class="chart-wrapper">
                        <canvas id="${chartId}" class="inventory-chart"></canvas>
                    </div>
                </div>
            `;
        }).join('');

        // 保存之前的元素引用以便比较
        const previousItems = new Set();
        const existingElements = inventoryList.querySelectorAll('.inventory-item');
        existingElements.forEach(el => {
            previousItems.add(parseInt(el.dataset.id));
        });

        // 更新内容
        inventoryList.innerHTML = newHTML;

        // 为新增的项目添加进入动画
        const currentItems = new Set(filteredItems.map(item => item.id));
        const addedItems = [...currentItems].filter(id => !previousItems.has(id));

        addedItems.forEach(id => {
            const newItem = inventoryList.querySelector(`.inventory-item[data-id="${id}"]`);
            if (newItem) {
                // 初始状态：透明且稍微缩小
                newItem.style.opacity = '0';
                newItem.style.transform = 'translateX(-20px) scale(0.95)';
                newItem.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

                // 强制重绘后触发动画
                setTimeout(() => {
                    newItem.style.opacity = '1';
                    newItem.style.transform = 'translateX(0) scale(1)';
                }, 10);
            }
        });

        // 为复选框添加事件监听器
        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                if (e.target.checked) {
                    this.selectedItems.add(itemId);
                } else {
                    this.selectedItems.delete(itemId);
                }
            });
        });

        // 为展开的图表绘制图形
        setTimeout(() => {
            filteredItems.forEach(item => {
                if (this.expandedChartId === item.id) {
                    this.drawChart(`chart-${item.id}`, item.id);
                }
            });
        }, 100);
    }
}

// 初始化仓库管理系统
let warehouseManager;
document.addEventListener('DOMContentLoaded', () => {
    warehouseManager = new WarehouseManager();
});

// PWA 安装功能
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Show install button if supported
    showInstallButton();
});

function showInstallButton() {
    // 创建安装按钮
    const controlsDiv = document.querySelector('.controls');
    const installBtn = document.createElement('button');
    installBtn.textContent = '安装应用';
    installBtn.className = 'btn-primary';
    installBtn.style.marginTop = '15px';
    installBtn.style.width = '100%';
    
    installBtn.addEventListener('click', () => {
        // Hide the install button
        installBtn.style.display = 'none';
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
        });
    });
    
    controlsDiv.appendChild(installBtn);
}

// 注册 Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}