// 移动端优化模块
const MobileOptimization = {
    isMobile: false,
    isTablet: false,
    isInitialized: false,
    
    init() {
        if (this.isInitialized) return;
        
        this.detectDevice();
        this.bindMobileEvents();
        this.optimizeTouchExperience();
        
        this.isInitialized = true;
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => {
            this.detectDevice();
            this.updateMobileUI();
        });
    },
    
    detectDevice() {
        const userAgent = navigator.userAgent;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // 更精确的设备检测
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) || 
                       (screenWidth <= 768 && 'ontouchstart' in window);
        this.isTablet = !this.isMobile && screenWidth > 768 && screenWidth <= 1024;
        
        // 添加设备类到body
        document.body.classList.remove('mobile-device', 'tablet-device', 'desktop-device');
        if (this.isMobile) {
            document.body.classList.add('mobile-device');
        } else if (this.isTablet) {
            document.body.classList.add('tablet-device');
        } else {
            document.body.classList.add('desktop-device');
        }
        
        // 设置CSS变量
        document.documentElement.style.setProperty('--vh', `${screenHeight * 0.01}px`);
        document.documentElement.style.setProperty('--vw', `${screenWidth * 0.01}px`);
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
        // 使用事件委托，避免重复绑定
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-mobile-action]');
            if (!target) return;
            
            const action = target.dataset.mobileAction;
            switch (action) {
                case 'toggle-sidebar':
                    this.toggleSidebar();
                    break;
                case 'close-sidebar':
                    this.closeSidebar();
                    break;
                case 'focus-search':
                    this.focusMobileSearch();
                    break;
                case 'clear-all':
                    this.clearAllData();
                    break;
                case 'export-data':
                    this.exportMobileData();
                    break;
                case 'open-comparison':
                    this.openComparison();
                    break;
                case 'close-comparison':
                    this.closeComparison();
                    break;
            }
        });
        
        // 搜索输入事件
        document.addEventListener('input', (e) => {
            if (e.target.id === 'mobileSearchInput') {
                this.handleMobileSearch(e.target.value);
            }
        });
        
        // 筛选变化事件
        document.addEventListener('change', (e) => {
            if (e.target.id === 'mobileStandardFilter') {
                this.handleMobileFilter('standard', e.target.value);
            } else if (e.target.id === 'mobileTypeFilter') {
                this.handleMobileFilter('type', e.target.value);
            }
        });
        
        // 遮罩点击事件
        document.addEventListener('click', (e) => {
            if (e.target.id === 'mobileOverlay') {
                this.closeSidebar();
            }
            if (e.target.id === 'mobileComparisonModal') {
                this.closeComparison();
            }
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
        // 移动端筛选功能已移除高级搜索依赖
        console.log('移动端筛选:', type, value);
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
    
    openComparison() {
        if (!this.isMobile) return;
        
        // 创建移动端对比弹窗
        const modal = document.createElement('div');
        modal.id = 'mobileComparisonModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        modal.innerHTML = `
            <div class="bg-gray-900 rounded-lg w-full max-w-4xl max-h-full overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 class="text-white text-lg font-semibold">材料对比</h2>
                    <button data-mobile-action="close-comparison" class="text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                <div class="p-4 overflow-auto max-h-96">
                    <div id="mobileComparisonContent">
                        <!-- 对比内容将在这里动态生成 -->
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 生成对比内容
        this.generateMobileComparisonContent();
    },
    
    closeComparison() {
        const modal = document.getElementById('mobileComparisonModal');
        if (modal) {
            modal.remove();
        }
    },
    
    generateMobileComparisonContent() {
        const content = document.getElementById('mobileComparisonContent');
        if (!content || !window.AppState || !window.AppState.comparisonList.length) {
            content.innerHTML = '<p class="text-gray-400 text-center">暂无对比数据</p>';
            return;
        }
        
        const comparisonData = window.AppState.comparisonList;
        let html = '<div class="space-y-4">';
        
        comparisonData.forEach((item, index) => {
            html += `
                <div class="bg-gray-800 rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-white font-medium">${item.grade || '未知牌号'}</h3>
                        <button class="text-red-400 text-sm" onclick="this.removeFromComparison(${index})">
                            移除
                        </button>
                    </div>
                    <div class="text-sm text-gray-300 space-y-1">
                        <div>标准: ${item.standard || '-'}</div>
                        <div>类型: ${item.type || '-'}</div>
                        <div>UNS: ${item.uns || '-'}</div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        content.innerHTML = html;
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
    
    optimizeTouchExperience() {
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
            
            // 设置触摸手势
            this.setupTouchGestures();
            
            // 设置PWA功能
            this.setupPWA();
            
            // 设置虚拟键盘优化
            this.setupVirtualKeyboard();
            
            // 设置屏幕方向处理
            this.setupOrientationChange();
        }
    },

    setupTouchGestures() {
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        const minSwipeDistance = 50;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipeGesture(touchStartX, touchStartY, touchEndX, touchEndY, minSwipeDistance);
        }, { passive: true });
        
        // 长按手势
        this.setupLongPress();
        
        // 捏合缩放手势
        this.setupPinchZoom();
    },

    handleSwipeGesture(startX, startY, endX, endY, minDistance) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // 水平滑动
            if (Math.abs(deltaX) > minDistance) {
                if (deltaX > 0) {
                    this.onSwipeRight();
                } else {
                    this.onSwipeLeft();
                }
            }
        } else {
            // 垂直滑动
            if (Math.abs(deltaY) > minDistance) {
                if (deltaY > 0) {
                    this.onSwipeDown();
                } else {
                    this.onSwipeUp();
                }
            }
        }
    },

    onSwipeLeft() {
        // 向左滑动 - 打开侧边栏
        if (!document.getElementById('mobileSidebar').classList.contains('-translate-x-full')) {
            this.closeSidebar();
        }
    },

    onSwipeRight() {
        // 向右滑动 - 关闭侧边栏或返回
        if (document.getElementById('mobileSidebar').classList.contains('-translate-x-full')) {
            this.toggleSidebar();
        }
    },

    onSwipeUp() {
        // 向上滑动 - 显示更多内容
        const comparisonPanel = document.getElementById('comparison-panel');
        if (comparisonPanel && window.AppState && window.AppState.comparisonList.length > 0) {
            comparisonPanel.style.display = 'block';
        }
    },

    onSwipeDown() {
        // 向下滑动 - 隐藏面板或刷新
        if (window.scrollY === 0) {
            this.handlePullToRefresh();
        }
    },

    setupLongPress() {
        let pressTimer;
        
        document.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                this.handleLongPress(e);
            }, 500);
        });
        
        document.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
        });
        
        document.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
        });
    },

    handleLongPress(e) {
        const target = e.target.closest('.grade-item, button');
        if (target) {
            // 震动反馈
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
            // 显示上下文菜单
            this.showContextMenu(target, e.touches[0]);
        }
    },

    showContextMenu(target, touch) {
        const menu = document.createElement('div');
        menu.className = 'context-menu fixed bg-gray-800 rounded-lg shadow-lg z-50 p-2';
        menu.style.left = `${touch.clientX}px`;
        menu.style.top = `${touch.clientY}px`;
        
        const actions = [
            { label: '添加到对比', action: 'add-compare' },
            { label: '添加到收藏', action: 'add-favorite' },
            { label: '复制信息', action: 'copy-info' }
        ];
        
        menu.innerHTML = actions.map(action => 
            `<button class="block w-full text-left p-2 text-white hover:bg-gray-700 rounded" data-action="${action.action}">${action.label}</button>`
        ).join('');
        
        document.body.appendChild(menu);
        
        // 调整位置避免超出屏幕
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${window.innerHeight - rect.height - 10}px`;
        }
        
        // 绑定事件
        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action) {
                this.handleContextAction(action, target);
            }
            menu.remove();
        });
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', () => menu.remove(), { once: true });
        }, 100);
    },

    handleContextAction(action, target) {
        switch (action) {
            case 'add-compare':
                // 添加到对比逻辑
                this.showToast('已添加到对比', 'success');
                break;
            case 'add-favorite':
                // 添加到收藏逻辑
                this.showToast('已添加到收藏', 'success');
                break;
            case 'copy-info':
                // 复制信息逻辑
                this.showToast('信息已复制', 'success');
                break;
        }
    },

    setupPinchZoom() {
        let initialDistance = 0;
        let currentScale = 1;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                const target = e.target.closest('.comparison-table, .chart-container');
                if (target) {
                    target.style.transform = `scale(${currentScale * scale})`;
                }
            }
        }, { passive: false });
        
        document.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                const target = document.querySelector('[style*="scale"]');
                if (target) {
                    const transform = target.style.transform;
                    const scaleMatch = transform.match(/scale\(([\d.]+)\)/);
                    if (scaleMatch) {
                        currentScale = parseFloat(scaleMatch[1]);
                        if (currentScale < 0.8) {
                            target.style.transform = 'scale(1)';
                            currentScale = 1;
                        } else if (currentScale > 3) {
                            target.style.transform = 'scale(3)';
                            currentScale = 3;
                        }
                    }
                }
            }
        });
    },

    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    setupPWA() {
        // 添加PWA元数据
        this.addPWAMetaTags();
        
        // 注册Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                })
                .catch(registrationError => {
                    console.log('SW registration failed: ', registrationError);
                });
        }
        
        // 添加安装提示
        this.setupInstallPrompt();
    },

    addPWAMetaTags() {
        const metaTags = [
            { name: 'theme-color', content: '#1f2937' },
            { name: 'apple-mobile-web-app-capable', content: 'yes' },
            { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
            { name: 'apple-mobile-web-app-title', content: '不锈钢查询' },
            { name: 'msapplication-TileColor', content: '#1f2937' },
            { name: 'msapplication-tap-highlight', content: 'no' }
        ];
        
        metaTags.forEach(tag => {
            if (!document.querySelector(`meta[name="${tag.name}"]`)) {
                const meta = document.createElement('meta');
                meta.name = tag.name;
                meta.content = tag.content;
                document.head.appendChild(meta);
            }
        });
        
        // 添加manifest链接
        if (!document.querySelector('link[rel="manifest"]')) {
            const manifest = document.createElement('link');
            manifest.rel = 'manifest';
            manifest.href = '/manifest.json';
            document.head.appendChild(manifest);
        }
    },

    setupInstallPrompt() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallButton();
        });
        
        window.addEventListener('appinstalled', () => {
            this.hideInstallButton();
            this.showToast('应用已安装到主屏幕', 'success');
        });
    },

    showInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.className = 'fixed bottom-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        installBtn.innerHTML = '📱 安装应用';
        installBtn.addEventListener('click', this.promptInstall.bind(this));
        document.body.appendChild(installBtn);
    },

    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.remove();
        }
    },

    promptInstall() {
        const deferredPrompt = window.deferredPrompt;
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                window.deferredPrompt = null;
            });
        }
    },

    setupVirtualKeyboard() {
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                // 延迟滚动到输入框
                setTimeout(() => {
                    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
                
                // 添加键盘打开类
                document.body.classList.add('keyboard-open');
            });
            
            input.addEventListener('blur', () => {
                document.body.classList.remove('keyboard-open');
            });
        });
        
        // 监听视口变化
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // 键盘打开
                document.body.classList.add('keyboard-open');
            } else {
                // 键盘关闭
                document.body.classList.remove('keyboard-open');
            }
        });
    },

    setupOrientationChange() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    },

    handleOrientationChange() {
        const orientation = window.orientation || 0;
        const isLandscape = Math.abs(orientation) === 90;
        
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // 重新计算布局
        this.recalculateLayout();
    },

    recalculateLayout() {
        // 重新计算表格布局
        const tables = document.querySelectorAll('.comparison-table');
        tables.forEach(table => {
            table.style.width = '100%';
            table.style.overflowX = 'auto';
        });
        
        // 重新计算图表大小
        if (window.DataVisualization && window.DataVisualization.refreshChart) {
            setTimeout(() => {
                window.DataVisualization.refreshChart();
            }, 200);
        }
    },

    handlePullToRefresh() {
        // 显示刷新指示器
        this.showRefreshIndicator();
        
        // 模拟刷新
        setTimeout(() => {
            if (window.Core && window.Core.refreshData) {
                window.Core.refreshData();
            }
            this.hideRefreshIndicator();
            this.showToast('数据已刷新', 'success');
        }, 1000);
    },

    showRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'refreshIndicator';
        indicator.className = 'fixed top-16 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg z-50';
        indicator.innerHTML = '🔄 正在刷新...';
        document.body.appendChild(indicator);
    },

    hideRefreshIndicator() {
        const indicator = document.getElementById('refreshIndicator');
        if (indicator) {
            indicator.remove();
        }
    },

    showToast(message, type = 'info') {
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast(message, type);
        } else {
            // 简单的toast实现
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 left-4 right-4 p-3 rounded-lg text-white z-50 ${
                type === 'success' ? 'bg-green-600' : 
                type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            }`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
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