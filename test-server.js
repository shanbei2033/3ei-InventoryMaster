const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 测试基本的文件服务
app.get('/login', (req, res) => {
    const filePath = path.join(__dirname, 'login.html');
    console.log('Looking for file at:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('File not found');
    }
});

// 也测试一个简单文本响应
app.get('/test', (req, res) => {
    res.send('Test successful');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on http://0.0.0.0:${PORT}`);
});