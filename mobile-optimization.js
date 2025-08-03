// 移动端优化模块
const MobileOptimization = {
    isMobile: false,
    isTablet: false,
    
    init() {
        this.detectDevice();
        this.createMobileUI();
        this.bindMobileEvents();
        this.optimizeTouch();
        this.addMobileStyles();
    },
    
    detectDevice() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.innerWidth;
        
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || screenWidth <= 768;
        this.isTablet = screenWidth > 768 && screenWidth <= 1024;
        
        // 添加设备类到body
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        } else if (this.isTablet) {
            document.body.classList.add('tablet-device');
        }
    },
    
    createMobileUI() {
        if (!this.isMobile) return;
        
        // 创建移动端导航栏
        const mobileNav = `
            <div class="mobile-nav fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-700 z-50 lg:hidden">
                <div class="flex items-center justify-between p-3">
                    <div class="flex items-center">
                        <button id="mobileMenuBtn" class="text-white mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </button>
                        <h1 class="text-white text-lg font-semibold">不锈钢查询</h1>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button id="mobileSearchBtn" class="text-white p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </button>
                        <button id="mobileCompareBtn" class="text-white p-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // 创建移动端侧边栏
        const mobileSidebar = `
            <div id="mobileSidebar" class="mobile-sidebar fixed top-0 left-0 h-full w-80 bg-gray-900 transform -translate-x-full transition-transform duration-300 z-50 lg:hidden">
                <div class="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 class="text-white text-lg font-semibold">菜单</h2>
                    <button id="closeSidebar" class="text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-4">
                    <div class="search-section mb-6">
                        <h3 class="text-white font-medium mb-3">搜索</h3>
                        <input type="text" id="mobileSearchInput" 
                               class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-400"
                               placeholder="输入牌号、标准、UNS编号...">
                    </div>
                    
                    <div class="filters-section mb-6">
                        <h3 class="text-white font-medium mb-3">筛选</h3>
                        <div class="space-y-3">
                            <select id="mobileStandardFilter" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                                <option value="">所有标准</option>
                                <option value="gb">GB</option>
                                <option value="astm">ASTM</option>
                                <option value="en">EN</option>
                            </select>
                            
                            <select id="mobileTypeFilter" class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white">
                                <option value="">所有类型</option>
                                <option value="austenitic">奥氏体</option>
                                <option value="ferritic">铁素体</option>
                                <option value="martensitic">马氏体</option>
                                <option value="duplex">双相</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="quick-actions">
                        <h3 class="text-white font-medium mb-3">快速操作</h3>
                        <div class="space-y-2">
                            <button id="mobileClearAll" class="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                                清空所有
                            </button>
                            <button id="mobileExportData" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                导出数据
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 创建移动端遮罩
        const mobileOverlay = `
            <div id="mobileOverlay" class="mobile-overlay fixed inset-0 bg-black bg-opacity-50 z-40 hidden lg:hidden"></div>
        `;
        
        // 插入移动端UI
        document.body.insertAdjacentHTML('afterbegin', mobileNav);
        document.body.insertAdjacentHTML('afterbegin', mobileSidebar);
        document.body.insertAdjacentHTML('afterbegin', mobileOverlay);
        
        // 调整主内容区域
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.marginTop = '60px';
        }
    },
    
    bindMobileEvents() {
        if (!this.isMobile) return;
        
        // 侧边栏切换
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });
        
        document.getElementById('closeSidebar').addEventListener('click', () => {
            this.closeSidebar();
        });
        
        document.getElementById('mobileOverlay').addEventListener('click', () => {
            this.closeSidebar();
        });
        
        // 移动端搜索
        document.getElementById('mobileSearchBtn').addEventListener('click', () => {
            this.focusMobileSearch();
        });
        
        document.getElementById('mobileSearchInput').addEventListener('input', (e) => {
            this.handleMobileSearch(e.target.value);
        });
        
        // 移动端筛选
        document.getElementById('mobileStandardFilter').addEventListener('change', (e) => {
            this.handleMobileFilter('standard', e.target.value);
        });
        
        document.getElementById('mobileTypeFilter').addEventListener('change', (e) => {
            this.handleMobileFilter('type', e.target.value);
        });
        
        // 快速操作
        document.getElementById('mobileClearAll').addEventListener('click', () => {
            this.clearAllData();
        });
        
        document.getElementById('mobileExportData').addEventListener('click', () => {
            this.exportMobileData();
        });
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    },
    
    toggleSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('mobileOverlay');
        
        if (sidebar.classList.contains('-translate-x-full')) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            this.closeSidebar();
        }
    },
    
    closeSidebar() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('mobileOverlay');
        
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    },
    
    focusMobileSearch() {
        document.getElementById('mobileSearchInput').focus();
        this.toggleSidebar();
    },
    
    handleMobileSearch(query) {
        // 调用原有的搜索功能
        if (typeof performSearch === 'function') {
            performSearch(query);
        }
    },
    
    handleMobileFilter(type, value) {
        // 调用原有的筛选功能
        if (typeof AdvancedSearch !== 'undefined' && AdvancedSearch.filters) {
            AdvancedSearch.filters[type] = value;
            AdvancedSearch.applyAdvancedSearch();
        }
    },
    
    clearAllData() {
        // 清空所有数据
        if (typeof AppState !== 'undefined') {
            AppState.comparisonList = [];
            AppState.allData = [];
            this.updateMobileUI();
        }
        this.closeSidebar();
    },
    
    exportMobileData() {
        // 导出数据
        if (typeof exportComparisonData === 'function') {
            exportComparisonData();
        }
        this.closeSidebar();
    },
    
    updateMobileUI() {
        // 更新移动端UI显示
        const compareBtn = document.getElementById('mobileCompareBtn');
        if (compareBtn && typeof AppState !== 'undefined') {
            const count = AppState.comparisonList.length;
            if (count > 0) {
                compareBtn.innerHTML = `
                    <div class="relative">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">${count}</span>
                    </div>
                `;
            } else {
                compareBtn.innerHTML = `
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                `;
            }
        }
    },
    
    handleResize() {
        const newWidth = window.innerWidth;
        
        if (newWidth > 1024) {
            // 桌面端
            this.closeSidebar();
            document.body.classList.remove('mobile-device', 'tablet-device');
            this.isMobile = false;
            this.isTablet = false;
        } else if (newWidth > 768) {
            // 平板端
            document.body.classList.remove('mobile-device');
            document.body.classList.add('tablet-device');
            this.isMobile = false;
            this.isTablet = true;
        } else {
            // 手机端
            document.body.classList.remove('tablet-device');
            document.body.classList.add('mobile-device');
            this.isMobile = true;
            this.isTablet = false;
        }
    },
    
    optimizeTouch() {
        // 优化触摸体验
        if (this.isMobile) {
            // 增加触摸目标大小
            const touchTargets = document.querySelectorAll('button, .clickable, [data-clickable]');
            touchTargets.forEach(target => {
                target.style.minHeight = '44px';
                target.style.minWidth = '44px';
            });
            
            // 禁用双击缩放
            let lastTouchEnd = 0;
            document.addEventListener('touchend', (event) => {
                const now = (new Date()).getTime();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            }, false);
        }
    },
    
    addMobileStyles() {
        // 添加移动端专用样式
        const mobileStyles = `
            <style>
                /* 移动端优化样式 */
                .mobile-device .main-content {
                    margin-top: 60px;
                    padding: 1rem;
                }
                
                .mobile-device .search-container {
                    position: relative;
                    z-index: 30;
                }
                
                .mobile-device .grade-group {
                    margin-bottom: 1rem;
                    border-radius: 8px;
                    overflow: hidden;
                }
                
                .mobile-device .grade-item {
                    padding: 0.75rem;
                    border-bottom: 1px solid #374151;
                }
                
                .mobile-device .grade-item:last-child {
                    border-bottom: none;
                }
                
                .mobile-device .add-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .mobile-device .comparison-table {
                    font-size: 0.875rem;
                }
                
                .mobile-device .comparison-table th,
                .mobile-device .comparison-table td {
                    padding: 0.5rem;
                    word-break: break-word;
                }
                
                /* 平板端优化 */
                .tablet-device .main-content {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .tablet-device .search-section {
                    grid-column: 1;
                }
                
                .tablet-device .comparison-section {
                    grid-column: 2;
                }
                
                /* 触摸优化 */
                @media (hover: none) and (pointer: coarse) {
                    button:hover {
                        background-color: inherit !important;
                    }
                    
                    .hover\\:bg-gray-700:hover {
                        background-color: inherit !important;
                    }
                }
                
                /* 安全区域适配 */
                @supports (padding: max(0px)) {
                    .mobile-device .mobile-nav {
                        padding-top: max(1rem, env(safe-area-inset-top));
                    }
                    
                    .mobile-device .mobile-sidebar {
                        padding-top: max(1rem, env(safe-area-inset-top));
                        padding-bottom: max(1rem, env(safe-area-inset-bottom));
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', mobileStyles);
    }
};

// 初始化移动端优化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof MobileOptimization !== 'undefined') {
        MobileOptimization.init();
    }
}); 