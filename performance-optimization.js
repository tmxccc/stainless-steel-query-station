// 性能优化模块
const PerformanceOptimizer = {
    cache: new Map(),
    debounceTimers: new Map(),
    
    init() {
        this.setupCaching();
        this.optimizeSearch();
        this.setupLazyLoading();
        this.optimizeRendering();
        this.setupServiceWorker();
    },
    
    // 缓存机制
    setupCaching() {
        // 缓存搜索结果
        this.cacheSearchResults = this.debounce((query, results) => {
            this.cache.set(`search_${query}`, {
                results: results,
                timestamp: Date.now(),
                ttl: 5 * 60 * 1000 // 5分钟缓存
            });
        }, 300);
        
        // 缓存渲染结果
        this.cacheRenderResults = this.debounce((key, html) => {
            this.cache.set(`render_${key}`, {
                html: html,
                timestamp: Date.now(),
                ttl: 10 * 60 * 1000 // 10分钟缓存
            });
        }, 200);
    },
    
    // 优化搜索性能
    optimizeSearch() {
        // 防抖搜索
        const originalSearch = window.performSearch;
        if (originalSearch) {
            window.performSearch = this.debounce((query) => {
                // 检查缓存
                const cached = this.getCachedSearchResults(query);
                if (cached) {
                    this.displaySearchResults(cached);
                    return;
                }
                
                // 执行搜索
                const results = originalSearch(query);
                this.cacheSearchResults(query, results);
            }, 300);
        }
        
        // 虚拟滚动优化
        this.setupVirtualScrolling();
    },
    
    // 设置虚拟滚动
    setupVirtualScrolling() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // 观察列表项
        document.addEventListener('DOMContentLoaded', () => {
            const listItems = document.querySelectorAll('.grade-item');
            listItems.forEach(item => {
                observer.observe(item);
            });
        });
    },
    
    // 优化渲染性能
    optimizeRendering() {
        // 使用 requestAnimationFrame 优化渲染
        this.optimizedRender = (callback) => {
            if (this.renderFrame) {
                cancelAnimationFrame(this.renderFrame);
            }
            this.renderFrame = requestAnimationFrame(callback);
        };
        
        // 批量DOM更新
        this.batchDOMUpdates = (updates) => {
            const fragment = document.createDocumentFragment();
            updates.forEach(update => {
                if (update.element && update.content) {
                    update.element.innerHTML = update.content;
                    fragment.appendChild(update.element);
                }
            });
            return fragment;
        };
    },
    
    // 懒加载设置
    setupLazyLoading() {
        // 图片懒加载
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        // 观察懒加载图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // 组件懒加载
        this.lazyLoadComponent = (componentName, callback) => {
            if (this.loadedComponents.has(componentName)) {
                callback();
                return;
            }
            
            // 动态加载组件
            const script = document.createElement('script');
            script.src = `components/${componentName}.js`;
            script.onload = () => {
                this.loadedComponents.add(componentName);
                callback();
            };
            document.head.appendChild(script);
        };
    },
    
    // 设置Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    },
    
    // 缓存管理
    getCachedSearchResults(query) {
        const cached = this.cache.get(`search_${query}`);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.results;
        }
        return null;
    },
    
    getCachedRenderResults(key) {
        const cached = this.cache.get(`render_${key}`);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            return cached.html;
        }
        return null;
    },
    
    clearCache() {
        this.cache.clear();
        console.log('缓存已清空');
    },
    
    // 防抖函数
    debounce(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            const timeout = setTimeout(later, wait);
        };
    },
    
    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // 内存管理
    optimizeMemory() {
        // 清理未使用的缓存
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > value.ttl) {
                this.cache.delete(key);
            }
        }
        
        // 清理防抖定时器
        for (const [key, timer] of this.debounceTimers.entries()) {
            if (timer && timer.expired) {
                this.debounceTimers.delete(key);
            }
        }
    },
    
    // 性能监控
    setupPerformanceMonitoring() {
        // 监控页面加载性能
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('页面加载时间:', perfData.loadEventEnd - perfData.loadEventStart);
        });
        
        // 监控搜索性能
        this.monitorSearchPerformance = (query, startTime) => {
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`搜索 "${query}" 耗时: ${duration.toFixed(2)}ms`);
            
            // 如果搜索时间过长，给出警告
            if (duration > 1000) {
                console.warn('搜索性能较慢，建议优化');
            }
        };
    },
    
    // 代码分割
    setupCodeSplitting() {
        // 动态导入模块
        this.loadModule = async (moduleName) => {
            try {
                const module = await import(`./modules/${moduleName}.js`);
                return module;
            } catch (error) {
                console.error(`加载模块 ${moduleName} 失败:`, error);
                return null;
            }
        };
    },
    
    // 预加载关键资源
    preloadCriticalResources() {
        const criticalResources = [
            'https://cdn.tailwindcss.com',
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.includes('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    },
    
    // 优化事件监听器
    optimizeEventListeners() {
        // 使用事件委托
        document.addEventListener('click', (e) => {
            // 处理牌号项点击
            if (e.target.closest('.grade-item')) {
                const gradeItem = e.target.closest('.grade-item');
                const grade = gradeItem.dataset.grade;
                const standard = gradeItem.dataset.standard;
                
                if (e.target.closest('.add-btn')) {
                    this.addToComparison(grade, standard);
                } else if (e.target.closest('.favorite-btn')) {
                    this.toggleFavorite(grade, standard);
                }
            }
        });
        
        // 优化滚动事件
        const scrollHandler = this.throttle(() => {
            // 处理滚动逻辑
            this.handleScroll();
        }, 16); // 60fps
        
        window.addEventListener('scroll', scrollHandler);
    },
    
    // 处理滚动
    handleScroll() {
        // 实现无限滚动或其他滚动优化
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // 接近底部时加载更多内容
        if (scrollTop + windowHeight >= documentHeight - 100) {
            this.loadMoreContent();
        }
    },
    
    // 加载更多内容
    loadMoreContent() {
        // 实现分页加载
        if (this.isLoading || this.hasReachedEnd) return;
        
        this.isLoading = true;
        // 加载更多数据的逻辑
        setTimeout(() => {
            this.isLoading = false;
        }, 1000);
    },
    
    // 优化CSS
    optimizeCSS() {
        // 内联关键CSS
        const criticalCSS = `
            .grade-item { opacity: 0; transform: translateY(20px); transition: all 0.3s ease; }
            .grade-item.visible { opacity: 1; transform: translateY(0); }
            .lazy { opacity: 0; transition: opacity 0.3s; }
            .lazy.loaded { opacity: 1; }
        `;
        
        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.appendChild(style);
    },
    
    // 初始化所有优化
    initAll() {
        this.init();
        this.setupPerformanceMonitoring();
        this.setupCodeSplitting();
        this.preloadCriticalResources();
        this.optimizeEventListeners();
        this.optimizeCSS();
        
        // 定期清理内存
        setInterval(() => {
            this.optimizeMemory();
        }, 5 * 60 * 1000); // 每5分钟清理一次
    }
};

// 初始化性能优化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof PerformanceOptimizer !== 'undefined') {
        PerformanceOptimizer.initAll();
    }
}); 