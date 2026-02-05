// 检查是否已登录
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // 如果没有令牌，重定向到登录页面
        window.location.href = '/login';
        return false;
    }
    return true;
}

// 获取当前用户名
async function getCurrentUser() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return null;
    }
    
    try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        return tokenPayload.username;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

// 显示用户信息和登出选项
function showUserInfo() {
    getCurrentUser().then(username => {
        if (username) {
            // 更新用户名显示
            const usernameDisplay = document.getElementById('usernameDisplay');
            if (usernameDisplay) {
                usernameDisplay.textContent = username;
            }
            
            // 添加事件监听器（如果尚未添加）
            if (!window.settingsInitialized) {
                document.getElementById('settingsButton').addEventListener('click', toggleSettingsDropdown);
                document.getElementById('logoutBtn').addEventListener('click', logout);
                document.getElementById('userSettingsBtn').addEventListener('click', () => {
                    window.location.href = '/settings';
                });
                
                // 点击外部区域隐藏下拉菜单
                document.addEventListener('click', function(event) {
                    const dropdown = document.getElementById('settingsDropdown');
                    const button = document.getElementById('settingsButton');
                    
                    if (button && dropdown && !button.contains(event.target) && !dropdown.contains(event.target)) {
                        dropdown.classList.add('hidden');
                    }
                });
                
                window.settingsInitialized = true;
            }
        }
    });
}

// 切换设置下拉菜单
function toggleSettingsDropdown() {
    const dropdown = document.getElementById('settingsDropdown');
    if (dropdown.classList.contains('visible')) {
        // 隐藏下拉菜单
        dropdown.classList.remove('visible');
        setTimeout(() => {
            dropdown.classList.add('hidden');
        }, 150);
    } else {
        // 显示下拉菜单
        dropdown.classList.remove('hidden');
        setTimeout(() => {
            dropdown.classList.add('visible');
        }, 10);
    }
}

// 登出功能
function logout() {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
}

// 国际化翻译字典
const translations = {
    'zh-CN': {
        // 通用词汇
        'InventoryMaster': '库存大师',
        'Manage your inventory items': '管理您的库存物品',
        'User Menu': '用户菜单',
        'Settings': '设置',
        'Logout': '登出',
        'Input item name': '输入货物名称',
        'Input quantity': '输入数量',
        'Input minimum stock': '输入最低库存',
        'Input username': '输入用户名',
        'Input password': '输入密码',
        'Input registration token': '输入注册Token',
        'Username': '用户名',
        'Password': '密码',
        'Registration Token': '注册Token',
        'Login': '登录',
        'Register': '注册',
        'Already have an account?': '已有账户？',
        'No account yet?': '还没有账户？',
        'Click here to login': '点击这里登录',
        'Click here to register': '点击这里注册',
        'Please enter your credentials': '请输入您的凭据',
        'Please enter registration info': '请输入注册信息',
        'Login Failed': '登录失败',
        'Registration Failed': '注册失败',
        'Network Error, Please try again later': '网络错误，请稍后再试',
        'Username can only contain English letters and numbers, up to 12 characters': '用户名只能包含英文和数字，最多12位',
        'Password must be at least 9 characters long and include uppercase, lowercase, numbers, and special symbols': '密码必须至少9位，包含大小写英文、数字和特殊符号',
        'Please enter the registration token provided by the administrator': '请输入管理员提供的注册Token',
        'Login Successful': '登录成功',
        'Registration Successful': '注册成功',
        'Redirecting...': '跳转中...',
        'Add Item': '添加货物',
        'Total Item Types': '总货物种类',
        'Total Quantity': '总数量',
        'Inventory List': '库存清单',
        'Select All': '全选',
        'Delete Selected Items': '删除选中项',
        'Search Items...': '搜索货物...',
        'No inventory data': '暂无库存数据',
        'Add your first item!': '添加您的第一件货物吧！',
        'Low Stock Alert:': '低库存提醒:',
        'ID:': 'ID:',
        'Delete': '删除',
        'Low Stock': '库存不足',
        'Normal Stock': '库存正常',
        'Operations': '操作',
        'Plus': '+',
        'Minus': '-',
        'System Settings': '系统设置',
        'Customize your warehouse management system': '自定义您的仓库管理系统',
        'Interface Language': '界面语言',
        'Chinese': '简体中文',
        'English': 'English',
        'Management Interface Title': '管理界面标题',
        'Save Settings': '保存设置',
        'Cancel': '取消',
        'Back': '返回',
        'Data Import/Export': '数据导入导出',
        'Export Data': '导出数据',
        'Import Data': '导入数据',
        'Confirm Delete': '确定删除',
        'Are you sure you want to delete the selected %d items?': '确定要删除选中的 %d 个项目吗？',
        'Please select items to delete first': '请先选择要删除的项目',
        'Delete Failed': '删除失败',
        'Some items failed to delete, please refresh and try again': '部分项目删除失败，请刷新页面重试',
        'Add Item Failed': '添加物品失败',
        'Please try again': '请重试',
        'Network Error': '网络错误',
        'Add Item Network Failed': '添加物品网络失败',
        'Update Quantity Failed': '更新数量失败',
        'Update Quantity Network Failed': '更新数量网络失败',
        'Delete Failed': '删除失败',
        'Delete Network Failed': '删除网络失败',
        'Import Success': '导入成功',
        'Import Failed': '导入失败',
        'Export Success': '导出成功',
        'Export Failed': '导出失败',
        'Settings Saved': '设置已保存',
        'Please login first': '请先登录',
        'File format error': '文件格式错误',
        'Read file failed': '读取文件失败'
    },
    'en-US': {
        // 通用词汇
        'InventoryMaster': 'InventoryMaster',
        'Manage your inventory items': 'Manage your inventory items',
        'User Menu': 'User Menu',
        'Settings': 'Settings',
        'Logout': 'Logout',
        'Item Name:': 'Item Name:',
        'Item Quantity:': 'Item Quantity:',
        'Minimum Stock Alert:': 'Minimum Stock Alert:',
        'Add Item': 'Add Item',
        'Total Item Types': 'Total Item Types',
        'Total Quantity': 'Total Quantity',
        'Inventory List': 'Inventory List',
        'Select All': 'Select All',
        'Delete Selected Items': 'Delete Selected',
        'Search Items...': 'Search items...',
        'No inventory data': 'No inventory data',
        'Add your first item!': 'Add your first item!',
        'Low Stock Alert:': 'Low Stock Alert:',
        'ID:': 'ID:',
        'Delete': 'Delete',
        'Low Stock': 'Low Stock',
        'Normal Stock': 'Normal Stock',
        'Operations': 'Operations',
        'Plus': '+',
        'Minus': '-',
        'System Settings': 'System Settings',
        'Customize your warehouse management system': 'Customize your warehouse management system',
        'Interface Language': 'Interface Language',
        'Chinese': 'Chinese',
        'English': 'English',
        'Management Interface Title': 'Management Interface Title',
        'Save Settings': 'Save Settings',
        'Cancel': 'Cancel',
        'Back': 'Back',
        'Data Import/Export': 'Data Import/Export',
        'Export Data': 'Export Data',
        'Import Data': 'Import Data',
        'Confirm Delete': 'Confirm Delete',
        'Are you sure you want to delete the selected %d items?': 'Are you sure you want to delete the selected %d items?',
        'Please select items to delete first': 'Please select items to delete first',
        'Delete Failed': 'Delete Failed',
        'Some items failed to delete, please refresh and try again': 'Some items failed to delete, please refresh and try again',
        'Add Item Failed': 'Add Item Failed',
        'Please try again': 'Please try again',
        'Network Error': 'Network Error',
        'Add Item Network Failed': 'Add Item Network Failed',
        'Update Quantity Failed': 'Update Quantity Failed',
        'Update Quantity Network Failed': 'Update Quantity Network Failed',
        'Delete Failed': 'Delete Failed',
        'Delete Network Failed': 'Delete Network Failed',
        'Import Success': 'Import Success',
        'Import Failed': 'Import Failed',
        'Export Success': 'Export Success',
        'Export Failed': 'Export Failed',
        'Settings Saved': 'Settings Saved',
        'Please login first': 'Please login first',
        'File format error': 'File format error',
        'Read file failed': 'Read file failed'
    }
};

// 应用用户设置
function applyUserSettings() {
    const savedLanguage = localStorage.getItem('language') || 'zh-CN';
    const savedTitle = localStorage.getItem('customTitle') || translations[savedLanguage]['InventoryMaster'];
    
    // 更新页面标题
    const headerTitle = document.querySelector('header h1');
    if (headerTitle) {
        headerTitle.textContent = savedTitle;
    }
    
    // 更新头部描述
    const headerDescription = document.querySelector('header p');
    if (headerDescription) {
        headerDescription.textContent = translations[savedLanguage]['Manage your inventory items'];
    }
    
    // 更新用户菜单标题
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.title = translations[savedLanguage]['User Menu'];
    }
    
    // 更新用户设置按钮文本
    const userSettingsBtn = document.getElementById('userSettingsBtn');
    if (userSettingsBtn) {
        userSettingsBtn.textContent = translations[savedLanguage]['Settings'];
    }
    
    // 更新登出按钮文本
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.textContent = translations[savedLanguage]['Logout'];
    }
    
    // 更新输入标签
    const nameLabel = document.getElementById('itemNameLabel');
    if (nameLabel) nameLabel.textContent = translations[savedLanguage]['Item Name:'];
    
    const quantityLabel = document.getElementById('itemQuantityLabel');
    if (quantityLabel) quantityLabel.textContent = translations[savedLanguage]['Item Quantity:'];
    
    const thresholdLabel = document.getElementById('itemThresholdLabel');
    if (thresholdLabel) thresholdLabel.textContent = translations[savedLanguage]['Minimum Stock Alert:'];
    
    // 更新输入框占位符
    const itemNameInput = document.getElementById('itemName');
    if (itemNameInput) itemNameInput.placeholder = translations[savedLanguage]['Input item name'];
    
    const itemQuantityInput = document.getElementById('itemQuantity');
    if (itemQuantityInput) itemQuantityInput.placeholder = translations[savedLanguage]['Input quantity'];
    
    const itemThresholdInput = document.getElementById('itemThreshold');
    if (itemThresholdInput) itemThresholdInput.placeholder = translations[savedLanguage]['Input minimum stock'];
    
    // 更新添加按钮
    const addItemBtn = document.getElementById('addItemBtn');
    if (addItemBtn) addItemBtn.textContent = translations[savedLanguage]['Add Item'];
    
    // 更新统计卡片标题
    const statCardTitles = document.querySelectorAll('.stat-card h3');
    if (statCardTitles[0]) statCardTitles[0].textContent = translations[savedLanguage]['Total Item Types'];
    if (statCardTitles[1]) statCardTitles[1].textContent = translations[savedLanguage]['Total Quantity'];
    
    // 更新库存清单标题
    const inventoryListTitle = document.querySelector('.inventory-header h2');
    if (inventoryListTitle) inventoryListTitle.textContent = translations[savedLanguage]['Inventory List'];
    
    // 更新全选复选框
    const selectAllLabel = document.querySelector('.inventory-select-all label');
    if (selectAllLabel) {
        // 保持复选框的勾选状态，只更新文本
        const checkbox = selectAllLabel.querySelector('input[type="checkbox"]');
        if (checkbox) {
            const labelText = selectAllLabel.textContent.replace(/^.*?\s/, ''); // 移除之前的文本，保留复选框
            selectAllLabel.innerHTML = `<input type="checkbox" id="selectAllCheckbox" title="${translations[savedLanguage]['Select All']}"> ${translations[savedLanguage]['Select All']}`;
        } else {
            selectAllLabel.innerHTML = `<input type="checkbox" id="selectAllCheckbox" title="${translations[savedLanguage]['Select All']}"> ${translations[savedLanguage]['Select All']}`;
        }
    }
    
    // 更新批量删除按钮
    const batchDeleteBtn = document.getElementById('batchDeleteBtn');
    if (batchDeleteBtn) {
        batchDeleteBtn.title = translations[savedLanguage]['Delete Selected Items'];
        batchDeleteBtn.textContent = translations[savedLanguage]['Delete'];
    }
    
    // 更新搜索框占位符
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = translations[savedLanguage]['Search Items...'];
    }
    
    // 更新空状态文本
    const emptyStateTexts = document.querySelectorAll('.empty-state p');
    if (emptyStateTexts[0]) emptyStateTexts[0].textContent = translations[savedLanguage]['No inventory data'];
    if (emptyStateTexts[1]) emptyStateTexts[1].textContent = translations[savedLanguage]['Add your first item!'];
    
    // 重新渲染库存列表以更新所有项目文本
    if (warehouseManager) {
        warehouseManager.render();
    }
}

// 获取翻译文本
function t(key) {
    const currentLang = localStorage.getItem('language') || 'zh-CN';
    return translations[currentLang] && translations[currentLang][key] ? translations[currentLang][key] : key;
}

// 仓库管理系统类
class WarehouseManager {
    constructor() {
        this.items = [];
        this.nextId = 1;
        this.lowStockThreshold = 5; // 默认低库存阈值
        this.selectedItems = new Set(); // 用于批量操作
        this.expandedChartId = null; // 当前展开的图表ID
        this.chartHistory = {}; // 存储每个物品的历史数据
        this.isLoading = false; // 防止重复操作
        this.init();
    }

    async init() {
        await this.loadFromStorage();
        this.initializeChartHistory();
        this.bindEvents();
        this.render();
    }

    // 从服务器加载数据
    async loadFromStorage() {
        this.isLoading = true;
        try {
            // 首先尝试从服务器加载数据
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
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
            console.error('Load error:', error);
        }
        this.isLoading = false;
    }

    // 保存数据到服务器
    async saveToStorage() {
        if (this.isLoading) return; // 防止重复保存
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    // 添加新物品
    async addItem(name, quantity, threshold = 5) {
        if (this.isLoading || !name.trim()) return false;
        
        this.isLoading = true;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/inventory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name.trim(),
                    quantity: parseInt(quantity) || 0,
                    threshold: parseInt(threshold) || 5
                })
            });
            
            if (!response.ok) {
                alert(t('Add Item Failed') + ': ' + t('Please try again'));
                return false;
            }
            
            const savedItem = await response.json();
            
            // 成功后更新本地数据
            this.items.push(savedItem);
            this.nextId = Math.max(this.nextId, savedItem.id + 1);
            
            // 为新项目初始化图表历史
            this.chartHistory[savedItem.id] = [
                { date: new Date().toISOString().split('T')[0], quantity: savedItem.quantity }
            ];
            
            this.render();
            return true;
        } catch (error) {
            alert(t('Network Error') + ': ' + t('Add Item Network Failed'));
            console.error('Add item error:', error);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    // 更新物品数量
    async updateQuantity(id, newQuantity) {
        if (this.isLoading) return;
        
        const item = this.items.find(item => item.id === id);
        if (!item) return;
        
        const newQty = Math.max(0, parseInt(newQuantity) || 0);
        
        this.isLoading = true;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    quantity: newQty
                })
            });
            
            if (!response.ok) {
                alert(t('Update Quantity Failed') + ': ' + t('Please try again'));
                return;
            }
            
            // 服务器更新成功后，更新本地数据
            item.quantity = newQty;
            
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
            
            this.render();
        } catch (error) {
            alert(t('Network Error') + ': ' + t('Update Quantity Network Failed'));
            console.error('Update quantity error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // 删除单个项目
    async deleteItem(id) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`/api/inventory/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                alert(t('Delete Failed') + ': ' + t('Please try again'));
                return;
            }
            
            // 服务器删除成功后，从本地移除项目
            this.items = this.items.filter(item => item.id !== id);
            
            // 删除对应的图表历史
            if (this.chartHistory[id]) {
                delete this.chartHistory[id];
            }
            
            // 如果删除的是当前展开图表的项目，收起图表
            if (this.expandedChartId === id) {
                this.expandedChartId = null;
            }
            
            this.render();
        } catch (error) {
            alert(t('Network Error') + ': ' + t('Delete Network Failed'));
            console.error('Delete error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // 批量删除选中项目
    async deleteSelectedItems() {
        if (this.isLoading || this.selectedItems.size === 0) {
            if (this.selectedItems.size === 0) {
                alert(t('Please select items to delete first'));
            }
            return;
        }

        if (!confirm(t('Are you sure you want to delete the selected %d items?').replace('%d', this.selectedItems.size))) {
            return;
        }

        this.isLoading = true;
        let allSuccessful = true;
        const selectedIds = Array.from(this.selectedItems);

        // 并行删除所有选中的项目
        const deletePromises = selectedIds.map(async (id) => {
            try {
                const token = localStorage.getItem('authToken');
                const response = await fetch(`/api/inventory/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    console.error(`Failed to delete item ${id}:`, response.statusText);
                    return false;
                }
                return true;
            } catch (error) {
                console.error(`Error deleting item ${id}:`, error);
                return false;
            }
        });

        const results = await Promise.all(deletePromises);
        allSuccessful = results.every(result => result === true);

        if (!allSuccessful) {
            alert(t('Some items failed to delete, please refresh and try again'));
        }

        // 无论服务器操作是否全部成功，都从本地移除已成功删除的项目
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

        this.isLoading = false;
        this.render();
    }

    // 全选功能
    selectAllItems(selectAll = true) {
        if (this.isLoading) return;
        
        // 获取当前显示的项目（考虑搜索过滤）
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        let displayedItems;
        
        if (!searchQuery) {
            displayedItems = this.items;
        } else {
            displayedItems = this.items.filter(item => 
                item.name.toLowerCase().includes(searchQuery)
            );
        }
        
        if (selectAll) {
            // 选中所有显示的项目
            displayedItems.forEach(item => {
                this.selectedItems.add(item.id);
            });
        } else {
            // 取消选中所有显示的项目
            displayedItems.forEach(item => {
                this.selectedItems.delete(item.id);
            });
        }
        
        this.render();
    }

    // 初始化图表历史数据
    initializeChartHistory() {
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

    // 绑定事件
    bindEvents() {
        const addItemBtn = document.getElementById('addItemBtn');
        const itemNameInput = document.getElementById('itemName');
        const itemQuantityInput = document.getElementById('itemQuantity');
        const itemThresholdInput = document.getElementById('itemThreshold');
        const searchInput = document.getElementById('searchInput');
        const fileInput = document.getElementById('fileInput');
        const batchDeleteBtn = document.getElementById('batchDeleteBtn');
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const toggleButtonsBtn = document.getElementById('toggleButtonsBtn');
        const actionButtonsContainer = document.getElementById('actionButtons');
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const settingsFileInput = document.getElementById('fileInput'); // 用于设置页面的导入

        // 添加货物按钮
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                const name = itemNameInput.value;
                const quantity = itemQuantityInput.value;
                const threshold = itemThresholdInput.value;
                
                if (name.trim() && quantity !== '') {
                    this.addItem(name, quantity, threshold);
                    itemNameInput.value = '';
                    itemQuantityInput.value = '';
                    itemThresholdInput.value = '';
                } else {
                    alert(t('Please enter item name and quantity'));
                }
            });
        }

        // 按Enter键添加货物
        if (itemNameInput) {
            itemNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    addItemBtn.click();
                }
            });
        }

        // 搜索功能
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.render();
            });
        }

        // 批量删除按钮
        if (batchDeleteBtn) {
            batchDeleteBtn.addEventListener('click', () => {
                this.deleteSelectedItems();
            });
        }

        // 全选复选框
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', () => {
                this.selectAllItems(selectAllCheckbox.checked);
            });
        }

        // 全选按钮
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                // 翻转当前全选状态
                const searchQuery = document.getElementById('searchInput').value.toLowerCase();
                let displayedItems;
                
                if (!searchQuery) {
                    displayedItems = this.items;
                } else {
                    displayedItems = this.items.filter(item => 
                        item.name.toLowerCase().includes(searchQuery)
                    );
                }
                
                const allSelected = displayedItems.length > 0 && displayedItems.every(item => this.selectedItems.has(item.id));
                this.selectAllItems(!allSelected);
            });
        }

        // 操作按钮展开/收回切换
        if (toggleButtonsBtn && actionButtonsContainer) {
            // 初始设置按钮文本
            const isCollapsed = actionButtonsContainer.classList.contains('collapsed');
            toggleButtonsBtn.textContent = isCollapsed ? t('Operations') : t('Collapse');
            
            toggleButtonsBtn.addEventListener('click', () => {
                actionButtonsContainer.classList.toggle('collapsed');
                
                // 更新按钮文本
                const isNowCollapsed = actionButtonsContainer.classList.contains('collapsed');
                toggleButtonsBtn.textContent = isNowCollapsed ? t('Operations') : t('Collapse');
            });
        }

        // 浮动操作按钮功能
        const fabToggle = document.getElementById('fabToggle');
        const fabMenu = document.getElementById('fabMenu');
        const fabExportBtn = document.getElementById('fabExportBtn');
        const fabImportBtn = document.getElementById('fabImportBtn');
        const fabSelectAllBtn = document.getElementById('fabSelectAllBtn');
        const fabBatchDeleteBtn = document.getElementById('fabBatchDeleteBtn');

        // 浮动按钮功能 - 添加安全检查
        if (fabToggle && fabMenu && fabExportBtn && fabImportBtn && fabSelectAllBtn && fabBatchDeleteBtn) {
            fabToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                fabMenu.classList.toggle('hidden');
            });

            // 为浮动菜单按钮添加事件
            fabExportBtn.addEventListener('click', () => {
                this.exportData();
                fabMenu.classList.add('hidden');
            });

            fabImportBtn.addEventListener('click', () => {
                fileInput.click();
                fabMenu.classList.add('hidden');
            });

            fabSelectAllBtn.addEventListener('click', () => {
                // 翻转全选状态
                const searchQuery = document.getElementById('searchInput').value.toLowerCase();
                let displayedItems;
                
                if (!searchQuery) {
                    displayedItems = this.items;
                } else {
                    displayedItems = this.items.filter(item => 
                        item.name.toLowerCase().includes(searchQuery)
                    );
                }
                
                const allSelected = displayedItems.length > 0 && displayedItems.every(item => this.selectedItems.has(item.id));
                this.selectAllItems(!allSelected);
                fabMenu.classList.add('hidden');
            });

            fabBatchDeleteBtn.addEventListener('click', () => {
                this.deleteSelectedItems();
                fabMenu.classList.add('hidden');
            });

            // 点击其他地方关闭菜单
            document.addEventListener('click', (e) => {
                if (fabToggle && fabMenu && !fabToggle.contains(e.target) && !fabMenu.contains(e.target)) {
                    fabMenu.classList.add('hidden');
                }
            });
        }

        // 导入导出按钮事件
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        // 文件选择事件
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.importData(e.target.files[0]);
                    e.target.value = ''; // 重置文件输入
                }
            });
        }

        // 为复选框添加事件（在render后动态绑定）
        this.bindCheckboxEvents();
    }

    // 绑定复选框事件
    bindCheckboxEvents() {
        // 使用事件委托，因为项目是动态生成的
        const inventoryList = document.getElementById('inventoryList');
        if (inventoryList) {
            inventoryList.removeEventListener('change', this.checkboxHandler);
            
            this.checkboxHandler = (e) => {
                if (e.target.classList.contains('item-checkbox')) {
                    const itemId = parseInt(e.target.dataset.id);
                    if (e.target.checked) {
                        this.selectedItems.add(itemId);
                    } else {
                        this.selectedItems.delete(itemId);
                    }
                    
                    // 更新全选复选框状态
                    this.updateSelectAllCheckbox();
                }
            };
            
            inventoryList.addEventListener('change', this.checkboxHandler);
        }
    }

    // 更新全选复选框的状态
    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        if (!selectAllCheckbox) return;
        
        const searchQuery = document.getElementById('searchInput').value.toLowerCase();
        let displayedItems;
        
        if (!searchQuery) {
            displayedItems = this.items;
        } else {
            displayedItems = this.items.filter(item => 
                item.name.toLowerCase().includes(searchQuery)
            );
        }
        
        // 检查是否所有显示的项目都被选中
        const allSelected = displayedItems.length > 0 && displayedItems.every(item => this.selectedItems.has(item.id));
        // 如果没有任何项目，也应该取消选中
        selectAllCheckbox.checked = displayedItems.length > 0 && allSelected;
    }

    // 渲染统计信息
    renderStats() {
        const totalItemsEl = document.getElementById('totalItems');
        const totalQuantityEl = document.getElementById('totalQuantity');
        
        if (totalItemsEl) {
            totalItemsEl.textContent = this.getTotalItems();
        }
        
        if (totalQuantityEl) {
            totalQuantityEl.textContent = this.getTotalQuantity();
        }
    }

    // 获取总项目数
    getTotalItems() {
        return this.items.length;
    }

    // 获取总数量
    getTotalQuantity() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // 渲染库存列表
    renderInventory() {
        const inventoryList = document.getElementById('inventoryList');
        const searchInput = document.getElementById('searchInput');
        
        if (!inventoryList) return;
        
        // 获取搜索查询
        const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
        
        // 过滤项目
        let filteredItems;
        if (!searchQuery) {
            filteredItems = this.items;
        } else {
            filteredItems = this.searchItems(searchQuery);
        }
        
        // 如果没有项目，显示空状态
        if (filteredItems.length === 0) {
            inventoryList.innerHTML = `
                <div class="empty-state">
                    <p>${t('No inventory data')}</p>
                    <p>${t('Add your first item!')}</p>
                </div>
            `;
            return;
        }
        
        // 生成项目HTML
        const itemsHTML = filteredItems.map(item => {
            const isSelected = this.selectedItems.has(item.id);
            const isLowStock = this.isLowStock(item);
            const showChart = this.expandedChartId === item.id;
            const chartId = `chart-${item.id}`;
            
            return `
                <div class="inventory-item ${isLowStock ? 'low-stock' : ''}" data-id="${item.id}">
                    <div class="item-selector">
                        <input type="checkbox" class="item-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''}>
                    </div>
                    <div class="item-info" onclick="warehouseManager.toggleChart(${item.id})">
                        <div class="item-name">${item.name}</div>
                        <div class="item-id">${t('ID:')} ${item.id} | ${t('Low Stock Alert:')} ${item.threshold || this.lowStockThreshold}</div>
                    </div>
                    <div class="item-controls">
                        <div class="quantity-display">${item.quantity}</div>
                        <button class="quantity-btn minus" onclick="warehouseManager.updateQuantity(${item.id}, ${Math.max(0, item.quantity - 1)})" title="${t('Minus')}">${t('Minus')}</button>
                        <button class="quantity-btn plus" onclick="warehouseManager.updateQuantity(${item.id}, ${item.quantity + 1})" title="${t('Plus')}">${t('Plus')}</button>
                        <button class="delete-btn" onclick="warehouseManager.deleteItem(${item.id})" title="${t('Delete')}">${t('Delete')}</button>
                    </div>
                </div>
                <div class="chart-container ${showChart ? 'expanded' : ''}" id="chart-area-${item.id}">
                    <div class="chart-wrapper">
                        <canvas id="${chartId}" class="inventory-chart"></canvas>
                    </div>
                </div>
            `;
        }).join('');

        inventoryList.innerHTML = itemsHTML;
        
        // 绘制展开的图表
        setTimeout(() => {
            filteredItems.forEach(item => {
                if (this.expandedChartId === item.id) {
                    this.drawChart(`chart-${item.id}`, item.id);
                }
            });
        }, 100);
    }

    // 渲染完整界面
    render() {
        this.renderStats();
        this.renderInventory();
        this.updateSelectAllCheckbox();
    }

    // 检查低库存
    isLowStock(item) {
        return item.quantity <= (item.threshold || this.lowStockThreshold);
    }

    // 搜索项目
    searchItems(query) {
        if (!query) return this.items;
        
        try {
            // 使用服务器端的增强搜索功能
            const token = localStorage.getItem('authToken');
            return fetch(`/api/search/${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    // 如果服务器搜索失败，使用客户端搜索作为备选
                    return this.items.filter(item => 
                        item.name.toLowerCase().includes(query.toLowerCase())
                    );
                }
            })
            .catch(() => {
                // 如果服务器搜索失败，使用客户端搜索作为备选
                return this.items.filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase())
                );
            });
        } catch (error) {
            // 如果服务器搜索失败，使用客户端搜索作为备选
            return this.items.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase())
            );
        }
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
        
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        const padding = 30;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // 获取最大值和最小值以确定范围
        const quantities = history.map(item => item.quantity);
        const maxQty = Math.max(...quantities);
        const minQty = Math.min(...quantities);
        const range = maxQty - minQty || 1; // 防止范围为0
        
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
    }

    // 导出数据
    async exportData() {
        if (this.isLoading) return;
        
        try {
            // 从服务器获取最新数据，确保导出的是最新的数据
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const dataStr = JSON.stringify({
                    items: data.items || [],
                    nextId: data.nextId || 1,
                    chartHistory: this.chartHistory
                }, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `inventory-backup-${new Date().toISOString().slice(0, 19)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            } else {
                // 如果服务器获取失败，使用本地数据导出
                const dataStr = JSON.stringify({
                    items: this.items,
                    nextId: this.nextId,
                    chartHistory: this.chartHistory
                }, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                
                const exportFileDefaultName = `inventory-backup-${new Date().toISOString().slice(0, 19)}.json`;
                
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
            }
        } catch (error) {
            // 如果服务器获取失败，使用本地数据导出
            const dataStr = JSON.stringify({
                items: this.items,
                nextId: this.nextId,
                chartHistory: this.chartHistory
            }, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `inventory-backup-${new Date().toISOString().slice(0, 19)}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            console.error('Export error:', error);
        }
    }

    // 导入数据
    async importData(file) {
        if (this.isLoading) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                
                if (importedData.items && Array.isArray(importedData.items)) {
                    // 发送导入请求到服务器
                    const token = localStorage.getItem('authToken');
                    const response = await fetch('/api/import', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(importedData.items)
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        // 重新从服务器加载数据以确保同步
                        await this.loadFromStorage();
                        this.render();
                        alert(result.message || '数据导入成功！');
                    } else {
                        const errorResult = await response.json();
                        alert('导入失败：' + errorResult.error);
                    }
                } else {
                    alert('导入的文件格式不正确！');
                }
            } catch (error) {
                alert('导入失败：文件格式错误或损坏！');
                console.error('Import error:', error);
            }
        };
        reader.onerror = () => {
            alert('导入失败：无法读取文件！');
        };
        reader.readAsText(file);
    }
}

// 初始化仓库管理系统
let warehouseManager;
document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) {
        warehouseManager = new WarehouseManager();
        applyUserSettings();
        showUserInfo();
    }
});

// 每隔一段时间自动同步数据
setInterval(async () => {
    if (warehouseManager && !warehouseManager.isLoading) {
        await warehouseManager.loadFromStorage();
        warehouseManager.render();
    }
}, 30000); // 每30秒同步一次