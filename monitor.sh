#!/bin/bash

# 监控库存管理系统进程的脚本
PROJECT_DIR="/Users/shanbei/.openclaw/workspace/3ei-InventoryMaster"
LOG_FILE="$PROJECT_DIR/process_monitor.log"
PID_FILE="$PROJECT_DIR/app.pid"

check_and_restart() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat $PID_FILE)
        if ps -p $PID > /dev/null; then
            # 进程正在运行
            echo "$(date): Process $PID is running" >> $LOG_FILE
            return
        fi
    fi
    
    # 进程未运行，启动它
    echo "$(date): Process not running, starting..." >> $LOG_FILE
    cd $PROJECT_DIR
    nohup node server.js > server.log 2>&1 &
    NEW_PID=$!
    echo $NEW_PID > $PID_FILE
    echo "$(date): Started new process with PID $NEW_PID" >> $LOG_FILE
}

# 执行检查
check_and_restart