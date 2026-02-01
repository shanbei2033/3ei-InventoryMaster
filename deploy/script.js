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

    loadFromStorage() {
        const savedData = localStorage.getItem('warehouseData');
        if (savedData) {
            const parsed = JSON.parse(savedData);
            this.items = parsed.items || [];
            this.nextId = parsed.nextId || 1;
        } else {
            // 初始化示例数据
            this.items = [
                { id: 1, name: "笔记本电脑", quantity: 10 },
                { id: 2, name: "鼠标", quantity: 50 },
                { id: 3, name: "键盘", quantity: 30 }
            ];
            this.nextId = 4;
            this.saveToStorage();
        }
    }

    saveToStorage() {
        const data = {
            items: this.items,
            nextId: this.nextId
        };
        localStorage.setItem('warehouseData', JSON.stringify(data));
    }

    addItem(name, quantity) {
        if (!name.trim()) return false;
        
        const newItem = {
            id: this.nextId++,
            name: name.trim(),
            quantity: parseInt(quantity) || 0
        };
        
        this.items.push(newItem);
        this.saveToStorage();
        this.render();
        return true;
    }

    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(0, parseInt(newQuantity) || 0);
            this.saveToStorage();
            this.render();
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveToStorage();
        this.render();
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

        addItemBtn.addEventListener('click', () => {
            const name = itemNameInput.value;
            const quantity = itemQuantityInput.value;

            if (this.addItem(name, quantity)) {
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
            inventoryList.innerHTML = `
                <div class="empty-state">
                    <p>暂无库存数据</p>
                    <p>${searchQuery ? '搜索条件未匹配到结果' : '添加您的第一件货物吧！'}</p>
                </div>
            `;
            return;
        }

        inventoryList.innerHTML = filteredItems.map(item => `
            <div class="inventory-item" data-id="${item.id}">
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-id">ID: ${item.id}</div>
                </div>
                <div class="item-controls">
                    <div class="quantity-display">${item.quantity}</div>
                    <button class="quantity-btn minus" onclick="warehouseManager.updateQuantity(${item.id}, ${Math.max(0, item.quantity - 1)})">-</button>
                    <button class="quantity-btn plus" onclick="warehouseManager.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    <button class="delete-btn" onclick="warehouseManager.deleteItem(${item.id})">删除</button>
                </div>
            </div>
        `).join('');
    }
}

// 初始化仓库管理系统
let warehouseManager;
document.addEventListener('DOMContentLoaded', () => {
    warehouseManager = new WarehouseManager();
});

// 添加导出数据功能
function exportData() {
    const dataStr = JSON.stringify(warehouseManager.items, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'warehouse-data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

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