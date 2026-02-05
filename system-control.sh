#!/bin/bash

# 库存管理系统启动与监控脚本

PROJECT_DIR="/Users/shanbei/.openclaw/workspace/3ei-InventoryMaster"
LOG_FILE="$PROJECT_DIR/system_status.log"
PID_FILE="$PROJECT_DIR/app.pid"
FRP_PID_FILE="$PROJECT_DIR/frp.pid"

# 函数：启动主服务器
start_server() {
    echo "$(date): 启动库存管理系统服务器..." >> $LOG_FILE
    
    cd $PROJECT_DIR
    nohup node server.js > server.log 2>&1 &
    SERVER_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    # 检查服务器是否成功启动
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo $SERVER_PID > $PID_FILE
        echo "$(date): 服务器启动成功，PID: $SERVER_PID" >> $LOG_FILE
        return 0
    else
        echo "$(date): 服务器启动失败" >> $LOG_FILE
        return 1
    fi
}

# 函数：启动FRP隧道
start_frp() {
    echo "$(date): 启动FRP隧道..." >> $LOG_FILE
    
    cd $PROJECT_DIR
    ./frpc -c frpc.ini > frp.log 2>&1 &
    FRP_PID=$!
    
    # 等待FRP连接建立
    sleep 5
    
    # 检查FRP是否成功启动
    if kill -0 $FRP_PID 2>/dev/null; then
        echo $FRP_PID > $FRP_PID_FILE
        echo "$(date): FRP隧道启动成功，PID: $FRP_PID" >> $LOG_FILE
        return 0
    else
        echo "$(date): FRP隧道启动失败" >> $LOG_FILE
        return 1
    fi
}

# 函数：检查系统状态
check_status() {
    # 检查服务器进程
    CURRENT_SERVER_PID=$(pgrep -f "node server.js" | head -n 1)
    
    if [ ! -z "$CURRENT_SERVER_PID" ]; then
        # 检查PID文件是否存在，如果不存在则创建
        if [ ! -f "$PID_FILE" ]; then
            echo $CURRENT_SERVER_PID > $PID_FILE
        fi
        echo "$(date): 服务器进程 $CURRENT_SERVER_PID 正在运行" >> $LOG_FILE
    else
        echo "$(date): 服务器进程未找到，正在启动服务器..." >> $LOG_FILE
        start_server
    fi
    
    # 检查FRP进程
    if [ -f "$FRP_PID_FILE" ]; then
        FRP_PID=$(cat $FRP_PID_FILE)
        if kill -0 $FRP_PID 2>/dev/null; then
            echo "$(date): FRP进程 $FRP_PID 正在运行" >> $LOG_FILE
        else
            echo "$(date): FRP进程 $FRP_PID 已停止，正在重启..." >> $LOG_FILE
            start_frp
        fi
    else
        # 查找现有的FRP进程
        CURRENT_FRP_PID=$(pgrep -f "./frpc -c frpc.ini" | head -n 1)
        if [ ! -z "$CURRENT_FRP_PID" ]; then
            echo $CURRENT_FRP_PID > $FRP_PID_FILE
            echo "$(date): FRP进程 $CURRENT_FRP_PID 正在运行" >> $LOG_FILE
        else
            echo "$(date): FRP进程未找到，正在启动FRP..." >> $LOG_FILE
            start_frp
        fi
    fi
}

# 主逻辑
case "$1" in
    start)
        echo "$(date): 开始启动库存管理系统..." >> $LOG_FILE
        start_server
        start_frp
        ;;
    stop)
        echo "$(date): 停止库存管理系统..." >> $LOG_FILE
        if [ -f "$PID_FILE" ]; then
            SERVER_PID=$(cat $PID_FILE)
            kill $SERVER_PID 2>/dev/null
            rm -f $PID_FILE
        fi
        if [ -f "$FRP_PID_FILE" ]; then
            FRP_PID=$(cat $FRP_PID_FILE)
            kill $FRP_PID 2>/dev/null
            rm -f $FRP_PID_FILE
        fi
        ;;
    restart)
        echo "$(date): 重启库存管理系统..." >> $LOG_FILE
        if [ -f "$PID_FILE" ]; then
            SERVER_PID=$(cat $PID_FILE)
            kill $SERVER_PID 2>/dev/null
            rm -f $PID_FILE
        fi
        if [ -f "$FRP_PID_FILE" ]; then
            FRP_PID=$(cat $FRP_PID_FILE)
            kill $FRP_PID 2>/dev/null
            rm -f $FRP_PID_FILE
        fi
        sleep 2
        start_server
        start_frp
        ;;
    status)
        check_status
        ;;
    *)
        echo "用法: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac

exit 0