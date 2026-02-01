#!/bin/bash

# 仓库管理系统 - Shell脚本版
# 功能：添加、查看、修改、删除库存项目

DATA_FILE="$HOME/warehouse_inventory.json"

# 初始化数据文件
init_data_file() {
    if [ ! -f "$DATA_FILE" ]; then
        echo '{"items": []}' > "$DATA_FILE"
        echo "初始化仓库数据文件..."
    fi
}

# 读取数据
read_data() {
    cat "$DATA_FILE"
}

# 写入数据
write_data() {
    echo "$1" > "$DATA_FILE"
}

# 显示菜单
show_menu() {
    clear
    echo "=================================="
    echo "     仓库管理系统 - Shell版"
    echo "=================================="
    echo "1. 添加货物"
    echo "2. 查看所有货物"
    echo "3. 修改货物数量"
    echo "4. 删除货物"
    echo "5. 搜索货物"
    echo "6. 统计信息"
    echo "0. 退出"
    echo "=================================="
    echo -n "请选择操作 (0-6): "
}

# 添加货物
add_item() {
    echo -n "请输入货物名称: "
    read name
    
    if [ -z "$name" ]; then
        echo "货物名称不能为空!"
        sleep 2
        return
    fi
    
    echo -n "请输入货物数量: "
    read quantity
    
    # 验证数量是否为数字
    if ! [[ "$quantity" =~ ^[0-9]+$ ]]; then
        echo "数量必须是正整数!"
        sleep 2
        return
    fi
    
    # 读取现有数据
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    local new_id=$(echo "$items" | jq 'length + 1')
    
    # 创建新项目
    local new_item=$(jq -n --arg name "$name" --argjson quantity "$quantity" --argjson id "$new_id" \
        '{id: $id, name: $name, quantity: $quantity}')
    
    # 添加到数组
    local updated_items=$(echo "$items" | jq --argjson new_item "$new_item" '. + [$new_item]')
    local updated_data=$(echo "$data" | jq --argjson items "$updated_items" '.items = $items')
    
    write_data "$updated_data"
    echo "货物 '$name' 已添加，数量: $quantity"
    sleep 2
}

# 查看所有货物
view_all_items() {
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    
    if [ "$(echo "$items" | jq 'length')" -eq 0 ]; then
        echo "暂无库存数据"
    else
        echo "仓库库存清单:"
        echo "----------------------------------------"
        echo "ID  | 名称                 | 数量"
        echo "----------------------------------------"
        echo "$items" | jq -c '.[]' | while read item; do
            local id=$(echo "$item" | jq -r '.id')
            local name=$(echo "$item" | jq -r '.name')
            local quantity=$(echo "$item" | jq -r '.quantity')
            printf "%-3s | %-20s | %s\n" "$id" "$name" "$quantity"
        done
    fi
    echo ""
    echo -n "按任意键返回主菜单..."
    read -n 1
}

# 修改货物数量
modify_quantity() {
    view_all_items
    
    echo -n "请输入要修改的货物ID: "
    read id
    
    # 验证ID是否为数字
    if ! [[ "$id" =~ ^[0-9]+$ ]]; then
        echo "ID必须是数字!"
        sleep 2
        return
    fi
    
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    local item_count=$(echo "$items" | jq 'length')
    
    if [ "$id" -lt 1 ] || [ "$id" -gt "$item_count" ]; then
        echo "无效的ID!"
        sleep 2
        return
    fi
    
    echo -n "请输入新的数量: "
    read new_quantity
    
    # 验证数量是否为数字
    if ! [[ "$new_quantity" =~ ^[0-9]+$ ]]; then
        echo "数量必须是正整数!"
        sleep 2
        return
    fi
    
    # 更新指定ID的项目数量
    local updated_items=$(echo "$items" | jq --argjson id "$id" --argjson new_quantity "$new_quantity" \
        'map(if .id == $id then .quantity = $new_quantity else . end)')
    local updated_data=$(echo "$data" | jq --argjson items "$updated_items" '.items = $items')
    
    write_data "$updated_data"
    echo "货物ID $id 的数量已更新为 $new_quantity"
    sleep 2
}

# 删除货物
delete_item() {
    view_all_items
    
    echo -n "请输入要删除的货物ID: "
    read id
    
    # 验证ID是否为数字
    if ! [[ "$id" =~ ^[0-9]+$ ]]; then
        echo "ID必须是数字!"
        sleep 2
        return
    fi
    
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    local item_count=$(echo "$items" | jq 'length')
    
    if [ "$id" -lt 1 ] || [ "$id" -gt "$item_count" ]; then
        echo "无效的ID!"
        sleep 2
        return
    fi
    
    # 删除指定ID的项目
    local updated_items=$(echo "$items" | jq --argjson id "$id" \
        'map(select(.id != $id)) | map(if .id > $id then .id -= 1 else . end)')
    local updated_data=$(echo "$data" | jq --argjson items "$updated_items" '.items = $items')
    
    write_data "$updated_data"
    echo "货物ID $id 已删除"
    sleep 2
}

# 搜索货物
search_items() {
    echo -n "请输入搜索关键词: "
    read keyword
    
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    local results=$(echo "$items" | jq --arg keyword "$keyword" \
        '[.[] | select(.name | contains($keyword))]')
    
    if [ "$(echo "$results" | jq 'length')" -eq 0 ]; then
        echo "未找到匹配的货物"
    else
        echo "搜索结果:"
        echo "----------------------------------------"
        echo "ID  | 名称                 | 数量"
        echo "----------------------------------------"
        echo "$results" | jq -c '.[]' | while read item; do
            local id=$(echo "$item" | jq -r '.id')
            local name=$(echo "$item" | jq -r '.name')
            local quantity=$(echo "$item" | jq -r '.quantity')
            printf "%-3s | %-20s | %s\n" "$id" "$name" "$quantity"
        done
    fi
    echo ""
    echo -n "按任意键返回主菜单..."
    read -n 1
}

# 统计信息
show_stats() {
    local data=$(read_data)
    local items=$(echo "$data" | jq '.items')
    local total_items=$(echo "$items" | jq 'length')
    local total_quantity=$(echo "$items" | jq 'map(.quantity) | add // 0')
    
    echo "仓库统计信息:"
    echo "------------------------"
    echo "货物种类总数: $total_items"
    echo "货物总数量: $total_quantity"
    echo "------------------------"
    echo ""
    echo -n "按任意键返回主菜单..."
    read -n 1
}

# 检查jq是否安装
check_jq_installed() {
    if ! command -v jq &> /dev/null; then
        echo "错误: 需要安装jq工具来处理JSON数据"
        echo "在Ubuntu/Debian系统上运行: sudo apt-get install jq"
        echo "在CentOS/RHEL系统上运行: sudo yum install jq"
        echo "在macOS上运行: brew install jq"
        exit 1
    fi
}

# 主程序
main() {
    check_jq_installed
    init_data_file
    
    while true; do
        show_menu
        read choice
        
        case $choice in
            1) add_item ;;
            2) view_all_items ;;
            3) modify_quantity ;;
            4) delete_item ;;
            5) search_items ;;
            6) show_stats ;;
            0) 
                echo "感谢使用仓库管理系统，再见！"
                exit 0
                ;;
            *)
                echo "无效选择，请重新输入"
                sleep 2
                ;;
        esac
    done
}

# 运行主程序
main