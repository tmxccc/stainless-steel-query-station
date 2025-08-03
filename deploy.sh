#!/bin/bash

# 不锈钢牌号查询工作站 - 部署脚本
# 作者: 唐淼 (台州国富)

echo "🚀 开始部署不锈钢牌号查询工作站..."

# 检查必要文件
echo "📋 检查项目文件..."
required_files=("indel.html" "data-enhancement.js" "advanced-search.js" "data-visualization.js")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done
echo "✅ 所有必要文件检查通过"

# 创建部署目录
echo "📁 创建部署目录..."
deploy_dir="deploy_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$deploy_dir"

# 复制文件
echo "📦 复制项目文件..."
cp indel.html "$deploy_dir/"
cp *.js "$deploy_dir/"
cp package.json "$deploy_dir/"
cp README.md "$deploy_dir/"
cp .htaccess "$deploy_dir/"

# 创建assets目录
mkdir -p "$deploy_dir/assets/images"

# 压缩文件
echo "🗜️ 压缩项目文件..."
zip -r "${deploy_dir}.zip" "$deploy_dir"

echo "✅ 部署包已创建: ${deploy_dir}.zip"
echo ""
echo "📋 部署选项:"
echo "1. GitHub Pages: 上传到GitHub仓库并启用Pages"
echo "2. Netlify: 拖拽 ${deploy_dir} 文件夹到Netlify"
echo "3. Vercel: 使用 vercel 命令部署"
echo "4. 传统服务器: 上传 ${deploy_dir} 文件夹到服务器"
echo ""
echo "🎯 推荐部署方式:"
echo "   - 免费方案: GitHub Pages 或 Netlify"
echo "   - 企业方案: 阿里云/腾讯云服务器"
echo ""
echo "📞 技术支持: 15861558321 / wuxi304@outlook.com" 