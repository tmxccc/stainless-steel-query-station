# 不锈钢牌号查询工作站 - 项目结构

## 📁 目录结构

```
stainless-steel-query-station/
├── index.html                 # 主页面
├── package.json              # 项目配置
├── .htaccess                 # Apache服务器配置
├── .git/                     # Git版本控制
│
├── src/                      # 源代码目录
│   ├── index.html            # 主页面副本
│   ├── test.html             # 测试页面
│   ├── 404.html              # 404错误页面
│   ├── js/                   # JavaScript模块
│   │   ├── data-enhancement.js      # 数据增强模块
│   │   ├── advanced-search.js       # 高级搜索模块
│   │   ├── data-visualization.js    # 数据可视化模块
│   │   ├── search-enhancement.js    # 搜索增强模块
│   │   ├── mobile-optimization.js   # 移动端优化
│   │   ├── extended-data.js         # 扩展数据（沉淀硬化+镍基合金）
│   │   ├── favorites.js             # 收藏夹功能
│   │   ├── performance-optimization.js # 性能优化
│   │   └── analytics.js             # 访问统计模块
│   ├── css/                  # 样式文件（预留）
│   └── data/                 # 数据文件（预留）
│
└── docs/                     # 文档目录
    ├── README.md             # 项目说明文档
    └── deploy.sh             # 部署脚本
```

## 🚀 功能模块说明

### 核心功能
- **数据查询**: 支持GB、ASTM、EN三大标准的不锈钢牌号查询
- **智能搜索**: 全局搜索、模糊匹配、搜索建议和历史记录
- **高级过滤**: 按标准、类型、系列、强度范围、合金元素过滤
- **对比分析**: 支持最多3个牌号同时对比
- **数据可视化**: 强度对比图、元素分布图、类型统计图

### 新增功能
- **沉淀硬化不锈钢**: 17-4PH、15-5PH、13-8PH等
- **镍基合金**: Inconel、Hastelloy、Monel系列
- **收藏夹**: 保存常用牌号
- **访问统计**: 记录每日访问量和IP地址
- **移动端优化**: 响应式设计、触摸优化

### 技术特性
- **性能优化**: Gzip压缩、浏览器缓存、懒加载
- **SEO优化**: Meta标签、Open Graph、结构化数据
- **安全防护**: XSS防护、内容类型限制、框架限制
- **用户体验**: 加载动画、错误处理、离线支持

## 📋 开发规范

### 文件命名
- 使用kebab-case命名法（如：`data-enhancement.js`）
- 模块文件以功能命名，清晰表达用途

### 代码组织
- 每个功能模块独立文件
- 模块间通过全局对象通信
- 使用ES6+语法，保持代码现代性

### 部署说明
- 支持静态网站托管（GitHub Pages、Netlify、Vercel）
- 支持传统服务器部署（Apache/Nginx）
- 包含完整的部署脚本和配置

## 🔧 维护说明

### 数据更新
- 新牌号数据添加到对应模块
- 保持数据格式一致性
- 更新统计信息

### 功能扩展
- 新功能创建独立模块
- 在主页面中引入模块
- 更新项目结构文档

### 性能监控
- 定期检查加载速度
- 监控用户访问统计
- 优化资源加载 