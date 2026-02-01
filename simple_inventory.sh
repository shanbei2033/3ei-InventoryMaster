#!/bin/bash

# 简化版仓库管理系统 - Shell脚本
# 功能：添加、查看、修改、删除库存项目
# 不依赖外部工具如jq

DATA_FILE="$HOME/warehouse_simple.txt"

# 初始化数据文件
init_data_file() {
    if [ ! -f "$DATA_FILE" ]; then
        touch "$DATA_FILE"
        echo "# 仓库库存文件" > "$DATA_FILE"
        echo "# 格式: ID|名称|数量" >> "$DATA_FILE"
        echo "# 示例: 1|笔记本电脑|10" >> "$DATA_FILE"
        echo "" >> "$DATA_FILE"
        echo "初始化仓库数据文件..."
    fi
}

# 显示菜单
show_menu() {
    clear
    echo "=================================="
    echo "   简化版仓库管理系统"
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

# 获取下一个ID
get_next_id() {
    if [ ! -f "$DATA_FILE" ] || [ ! -s "$DATA_FILE" ]; then
        echo 1
        return
    fi
    
    local max_id=0
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local id=$(echo "$line" | cut -d'|' -f1)
            if [ "$id" -gt "$max_id" ]; then
                max_id=$id
            fi
        fi
    done < "$DATA_FILE"
    
    echo $((max_id + 1))
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
    
    local next_id=$(get_next_id)
    echo "$next_id|$name|$quantity" >> "$DATA_FILE"
    
    echo "货物 '$name' 已添加，数量: $quantity"
    sleep 2
}

# 查看所有货物
view_all_items() {
    if [ ! -f "$DATA_FILE" ] || [ ! -s "$DATA_FILE" ]; then
        echo "暂无库存数据"
    else
        echo "仓库库存清单:"
        echo "----------------------------------------"
        echo "ID  | 名称                 | 数量"
        echo "----------------------------------------"
        
        while IFS= read -r line; do
            if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
                local id=$(echo "$line" | cut -d'|' -f1)
                local name=$(echo "$line" | cut -d'|' -f2)
                local quantity=$(echo "$line" | cut -d'|' -f3)
                
                # 限制名称长度以适应表格
                if [ ${#name} -gt 18 ]; then
                    name="${name:0:15}..."
                fi
                
                printf "%-3s | %-20s | %s\n" "$id" "$name" "$quantity"
            fi
        done < "$DATA_FILE"
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
    
    # 检查ID是否存在
    local found=0
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local line_id=$(echo "$line" | cut -d'|' -f1)
            if [ "$line_id" -eq "$id" ]; then
                found=1
                break
            fi
        fi
    done < "$DATA_FILE"
    
    if [ $found -eq 0 ]; then
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
    
    # 创建临时文件并更新指定ID的数量
    local temp_file=$(mktemp)
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local line_id=$(echo "$line" | cut -d'|' -f1)
            if [ "$line_id" -eq "$id" ]; then
                local name=$(echo "$line" | cut -d'|' -f2)
                echo "$id|$name|$new_quantity" >> "$temp_file"
            else
                echo "$line" >> "$temp_file"
            fi
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$DATA_FILE"
    
    mv "$temp_file" "$DATA_FILE"
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
    
    # 检查ID是否存在
    local found=0
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local line_id=$(echo "$line" | cut -d'|' -f1)
            if [ "$line_id" -eq "$id" ]; then
                found=1
                break
            fi
        fi
    done < "$DATA_FILE"
    
    if [ $found -eq 0 ]; then
        echo "无效的ID!"
        sleep 2
        return
    fi
    
    # 创建临时文件并排除指定ID的行
    local temp_file=$(mktemp)
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local line_id=$(echo "$line" | cut -d'|' -f1)
            if [ "$line_id" -ne "$id" ]; then
                echo "$line" >> "$temp_file"
            else
                continue  # 跳过要删除的行
            fi
        else
            echo "$line" >> "$temp_file"
        fi
    done < "$DATA_FILE"
    
    mv "$temp_file" "$DATA_FILE"
    echo "货物ID $id 已删除"
    sleep 2
}

# 搜索货物
search_items() {
    echo -n "请输入搜索关键词: "
    read keyword
    
    if [ -z "$keyword" ]; then
        echo "关键词不能为空!"
        sleep 2
        return
    fi
    
    local found_items=()
    local count=0
    
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            local id=$(echo "$line" | cut -d'|' -f1)
            local name=$(echo "$line" | cut -d'|' -f2)
            local quantity=$(echo "$line" | cut -d'|' -f3)
            
            if [[ "$name" == *"$keyword"* ]]; then
                found_items+=("$line")
                ((count++))
            fi
        fi
    done < "$DATA_FILE"
    
    if [ $count -eq 0 ]; then
        echo "未找到匹配的货物"
    else
        echo "搜索结果 ($count 项):"
        echo "----------------------------------------"
        echo "ID  | 名称                 | 数量"
        echo "----------------------------------------"
        for item in "${found_items[@]}"; do
            local id=$(echo "$item" | cut -d'|' -f1)
            local name=$(echo "$item" | cut -d'|' -f2)
            local quantity=$(echo "$item" | cut -d'|' -f3)
            
            # 限制名称长度以适应表格
            if [ ${#name} -gt 18 ]; then
                name="${name:0:15}..."
            fi
            
            printf "%-3s | %-20s | %s\n" "$id" "$name" "$quantity"
        done
    fi
    echo ""
    echo -n "按任意键返回主菜单..."
    read -n 1
}

# 统计信息
show_stats() {
    local total_items=0
    local total_quantity=0
    
    while IFS= read -r line; do
        if [[ $line =~ ^[0-9]+\|.*\|[0-9]+$ ]]; then
            ((total_items++))
            local quantity=$(echo "$line" | cut -d'|' -f3)
            total_quantity=$((total_quantity + quantity))
        fi
    done < "$DATA_FILE"
    
    echo "仓库统计信息:"
    echo "------------------------"
    echo "货物种类总数: $total_items"
    echo "货物总数量: $total_quantity"
    echo "------------------------"
    echo ""
    echo -n "按任意键返回主菜单..."
    read -n 1
}

# 主程序
main() {
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