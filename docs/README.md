# 不锈钢牌号查询工作站

## 📋 项目简介

不锈钢牌号查询工作站是一个专业的材料科学查询工具，支持GB、ASTM、EN三大标准的不锈钢牌号查询和对比分析。

**版本**: Beta 1.3  
**开发者**: 唐淼 (台州国富)  
**联系方式**: 15861558321 / wuxi304@outlook.com

## ✨ 主要功能

### 🔍 智能搜索
- **多标准支持**: GB、ASTM、EN三大标准
- **模糊搜索**: 支持牌号、UNS编号、系列名称搜索
- **高级筛选**: 按类型、强度范围、合金元素等筛选

### ⚖️ 对比分析
- **多牌号对比**: 最多支持3个牌号同时对比
- **可视化图表**: 强度对比、元素分布、类型统计
- **数据导出**: 支持CSV格式导出对比结果

### 📊 数据可视化
- **强度对比图**: 屈服强度和抗拉强度对比
- **元素分布图**: 铬、镍、钼等合金元素分布
- **类型统计图**: 奥氏体、铁素体、马氏体、双相钢统计

### 📱 响应式设计
- **移动端适配**: 完美支持手机、平板访问
- **现代化UI**: 深色主题，专业美观
- **快速响应**: 优化的搜索和渲染性能

## 🚀 快速开始

### 本地运行
```bash
# 方法1: 使用Python
python -m http.server 8000

# 方法2: 使用Node.js
npm install
npm start

# 方法3: 使用live-server (推荐开发)
npm install -g live-server
live-server --port=8000
```

### 访问地址
打开浏览器访问: `http://localhost:8000`

## 📁 项目结构

```
stainless-steel-query-station/
├── indel.html              # 主页面
├── data-enhancement.js     # 数据扩展模块
├── advanced-search.js      # 高级搜索功能
├── data-visualization.js   # 数据可视化
├── package.json           # 项目配置
├── README.md             # 项目说明
└── assets/               # 静态资源
    └── images/           # 图片资源
```

## 🛠️ 技术栈

- **前端框架**: 原生JavaScript + HTML5 + CSS3
- **UI框架**: Tailwind CSS
- **图表库**: Canvas API (原生)
- **字体**: Google Fonts (Inter)
- **图标**: SVG Icons

## 📈 数据覆盖

### GB标准 (国标)
- 304系列: 06Cr19Ni10, 022Cr19Ni10
- 316系列: 06Cr17Ni12Mo2, 022Cr17Ni12Mo2
- 321系列: 06Cr18Ni11Ti
- 347系列: 06Cr18Ni11Nb
- 2205系列: 022Cr22Ni5Mo3N
- 2507系列: 022Cr25Ni7Mo4N
- 430系列: 10Cr17
- 410系列: 12Cr13
- 420系列: 20Cr13
- 405系列: 06Cr13Al
- 409系列: 022Cr12Ni

### ASTM标准 (美标)
- 304系列: 304, 304L
- 316系列: 316, 316L, 316Ti
- 321系列: 321
- 347系列: 347
- 2205系列: 2205
- 2507系列: 2507
- 430系列: 430
- 410系列: 410
- 420系列: 420
- 405系列: 405
- 409系列: 409
- 310系列: 310, 310S

### EN标准 (欧标)
- 304系列: 1.4301, 1.4307
- 316系列: 1.4401, 1.4404, 1.4571
- 321系列: 1.4541
- 347系列: 1.4550
- 2205系列: 1.4462
- 2507系列: 1.4410
- 430系列: 1.4006
- 420系列: 1.4021
- 405系列: 1.4002
- 409系列: 1.4512
- 310系列: 1.4845

## 🌐 部署方案

### 1. GitHub Pages (免费)
```bash
# 创建GitHub仓库
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/stainless-steel-query-station.git
git push -u origin main

# 在GitHub设置中启用Pages
```

### 2. Netlify (免费)
- 拖拽项目文件夹到Netlify
- 或连接GitHub仓库自动部署

### 3. Vercel (免费)
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 4. 阿里云/腾讯云 (付费)
- 购买云服务器
- 配置Nginx/Apache
- 上传项目文件

## 🔧 自定义配置

### 添加新牌号数据
在 `data-enhancement.js` 中添加新的牌号数据：

```javascript
{
    "name": "新牌号名称",
    "usn": "UNS编号",
    "type": "类型",
    "碳": "碳含量",
    "硅": "硅含量",
    "锰": "锰含量",
    "磷": "磷含量",
    "硫": "硫含量",
    "铬": "铬含量",
    "镍": "镍含量",
    "钼": "钼含量",
    "family": "系列",
    "spec": "执行标准",
    "yield_strength": "屈服强度",
    "tensile_strength": "抗拉强度"
}
```

### 修改样式主题
在 `indel.html` 的 `<style>` 标签中修改CSS变量：

```css
:root {
    --primary-color: #3B82F6;
    --secondary-color: #10B981;
    --background-color: #0d1117;
    --text-color: #c9d1d9;
}
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📞 联系方式

- **电话**: 15861558321
- **微信**: wuxi3042205
- **邮箱**: wuxi304@outlook.com
- **公司**: 台州国富

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

感谢所有为不锈钢材料科学做出贡献的工程师和研究人员。

---

**台州国富 唐淼 2025**  
*专业的不锈钢材料解决方案* 