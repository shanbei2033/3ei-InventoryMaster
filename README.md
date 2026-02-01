# InventoryMaster (仓库管理系统)

一个功能丰富的库存管理Web应用程序，具有实时数据同步、图表可视化和多平台访问能力。

## 功能

- 添加、编辑、删除库存项目
- 实时库存数量跟踪
- 低库存预警系统
- 数据导入导出功能
- 交互式图表展示库存趋势
- 移动端适配
- 离线支持（PWA）
- 搜索功能
- 批量操作
- 展开/收回的操作面板
- 全选功能

---

## Features (功能特性 - English Version)

A comprehensive warehouse management web application with real-time data synchronization, chart visualization, and multi-platform access capabilities.

- Add, edit, and delete inventory items
- Real-time inventory tracking
- Low stock alert system
- Data import/export functionality
- Interactive charts showing inventory trends
- Mobile responsive design
- Offline support (PWA)
- Search functionality
- Bulk operations
- Expandable/collapsible operation panel
- Select all functionality

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Express.js (后端服务器)
- Chart.js (图表库)
- Node.js

## 快速开始

1. 克隆此仓库
2. 安装依赖：`npm install`
3. 启动服务器：`node server.js`
4. 访问 `http://localhost:3000`

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- Express.js (backend server)
- Chart.js (visualization)
- Node.js

## Quick Start

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the server: `node server.js`
4. Visit `http://localhost:3000`

## 部署

系统支持多种部署方式：
- 本地部署
- WSL部署
- Android APK打包
- 静态版本部署

详细部署指南请参见文档文件。

## Deployment

The system supports multiple deployment methods:
- Local deployment
- WSL deployment
- Android APK packaging
- Static version deployment

Detailed deployment guides are available in the documentation files.

## 版本

当前版本：R2.3.3

## Version

Current version: R2.3.3

## 使用说明

应用程序提供图形界面和命令行工具进行库存管理。主Web界面允许您：
- 添加新的库存项目（名称、数量和阈值）
- 用直观的+/-按钮调整数量
- 通过交互式图表查看库存趋势
- 导出JSON数据进行备份
- 从JSON文件导入数据
- 对选定项目执行批量操作

## Usage

The application provides both a graphical interface and command-line tools for inventory management. The main web interface allows you to:
- Add new inventory items with name, quantity, and threshold values
- Adjust quantities with intuitive +/- buttons
- View inventory trends through interactive charts
- Export data as JSON for backup purposes
- Import data from JSON files
- Perform bulk operations on selected items