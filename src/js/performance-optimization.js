// 性能优化模块 - 增强版
const PerformanceOptimizer = {
    cache: {
        search: new Map(),
        rendering: new Map(),
        data: new Map()
    },
    
    // 增强的缓存机制
    cacheManager: {
        set(type, key, value, ttl = 300000) { // 默认5分钟TTL
            const item = {
                value,
                timestamp: Date.now(),
                ttl
            };
            PerformanceOptimizer.cache[type].set(key, item);
        },
        
        get(type, key) {
            const item = PerformanceOptimizer.cache[type].get(key);
            if (!item) return null;
            
            if (Date.now() - item.timestamp > item.ttl) {
                PerformanceOptimizer.cache[type].delete(key);
                return null;
            }
            
            return item.value;
        },
        
        clear(type) {
            if (type) {
                PerformanceOptimizer.cache[type].clear();
            } else {
                Object.values(PerformanceOptimizer.cache).forEach(cache => cache.clear());
            }
        },
        
        getStats() {
            return {
                search: PerformanceOptimizer.cache.search.size,
                rendering: PerformanceOptimizer.cache.rendering.size,
                data: PerformanceOptimizer.cache.data.size
            };
        }
    },

    // 增强的防抖函数
    debounce(func, delay, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, delay);
            if (callNow) func(...args);
        };
    },

    // 节流函数
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 优化搜索性能
    optimizeSearch() {
        const originalSearch = window.Core?.globalSearch;
        if (!originalSearch) return;

        window.Core.globalSearch = this.debounce((query) => {
            const cacheKey = query.toLowerCase().trim();
            const cached = this.cacheManager.get('search', cacheKey);
            
            if (cached) {
                window.AppState.searchResultGroups = cached;
                window.UI.renderSearchResults();
                return;
            }

            // 执行原始搜索
            const startTime = performance.now();
            originalSearch.call(window.Core, query);
            const endTime = performance.now();
            
            // 缓存结果
            this.cacheManager.set('search', cacheKey, window.AppState.searchResultGroups);
            
            // 性能监控
            if (endTime - startTime > 100) {
                console.warn(`搜索性能警告: ${endTime - startTime}ms for query: ${query}`);
            }
        }, 200);
    },

    // 虚拟滚动优化
    virtualScrolling: {
        itemHeight: 80,
        containerHeight: 600,
        buffer: 5,
        
        init(container, items, renderItem) {
            const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);
            const totalHeight = items.length * this.itemHeight;
            
            container.style.height = `${this.containerHeight}px`;
            container.style.overflow = 'auto';
            
            const viewport = document.createElement('div');
            viewport.style.height = `${totalHeight}px`;
            viewport.style.position = 'relative';
            
            const content = document.createElement('div');
            content.style.position = 'absolute';
            content.style.top = '0';
            content.style.width = '100%';
            
            viewport.appendChild(content);
            container.innerHTML = '';
            container.appendChild(viewport);
            
            const updateView = this.throttle(() => {
                const scrollTop = container.scrollTop;
                const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
                const endIndex = Math.min(items.length, startIndex + visibleCount + this.buffer * 2);
                
                content.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
                content.innerHTML = '';
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = renderItem(items[i], i);
                    content.appendChild(item);
                }
            }, 16);
            
            container.addEventListener('scroll', updateView);
            updateView();
        }
    },

    // 批量DOM更新
    batchDOMUpdates(updates) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                updates.forEach(update => update());
                resolve();
            });
        });
    },

    // 懒加载图片
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    },

    // 预加载关键资源
    preloadResources() {
        // 暂时禁用预加载功能以避免路径问题
        console.log('预加载功能已暂时禁用');
        return;
        
        const criticalResources = [
            'js/search-enhancement.js',
            'js/data-visualization.js',
            'js/favorites.js'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'script';
            link.href = resource;
            document.head.appendChild(link);
        });
    },

    // 内存管理
    memoryManager: {
        cleanup() {
            // 清理过期缓存
            Object.keys(PerformanceOptimizer.cache).forEach(type => {
                const cache = PerformanceOptimizer.cache[type];
                for (const [key, item] of cache.entries()) {
                    if (Date.now() - item.timestamp > item.ttl) {
                        cache.delete(key);
                    }
                }
            });
        },

        getMemoryUsage() {
            if (performance.memory) {
                return {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
                };
            }
            return null;
        }
    },

    // 性能监控
    performanceMonitor: {
        metrics: {
            searchTime: [],
            renderTime: [],
            memoryUsage: []
        },

        recordMetric(type, value) {
            this.metrics[type].push({
                value,
                timestamp: Date.now()
            });

            // 保持最近100条记录
            if (this.metrics[type].length > 100) {
                this.metrics[type] = this.metrics[type].slice(-100);
            }
        },

        getAverageMetric(type) {
            const values = this.metrics[type];
            if (values.length === 0) return 0;
            
            const sum = values.reduce((acc, item) => acc + item.value, 0);
            return sum / values.length;
        },

        getReport() {
            return {
                avgSearchTime: this.getAverageMetric('searchTime'),
                avgRenderTime: this.getAverageMetric('renderTime'),
                cacheStats: PerformanceOptimizer.cacheManager.getStats(),
                memoryUsage: PerformanceOptimizer.memoryManager.getMemoryUsage()
            };
        }
    },

    // Service Worker 注册
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            // 暂时禁用Service Worker注册以避免路径问题
            console.log('Service Worker 注册已暂时禁用');
            return;
            
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker 注册成功:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 注册失败:', error);
                });
        }
    },

    // 初始化所有优化
    init() {
        console.log('🚀 性能优化模块初始化...');
        
        // 优化搜索
        this.optimizeSearch();
        
        // 懒加载图片
        this.lazyLoadImages();
        
        // 预加载资源
        this.preloadResources();
        
        // 注册Service Worker
        this.registerServiceWorker();
        
        // 定期清理内存
        setInterval(() => {
            this.memoryManager.cleanup();
        }, 60000); // 每分钟清理一次
        
        // 性能监控
        setInterval(() => {
            const memory = this.memoryManager.getMemoryUsage();
            if (memory) {
                this.performanceMonitor.recordMetric('memoryUsage', memory.used);
            }
        }, 30000); // 每30秒记录一次内存使用
        
        console.log('✅ 性能优化模块初始化完成');
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else {
    window.PerformanceOptimizer = PerformanceOptimizer;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => PerformanceOptimizer.init());
} else {
    PerformanceOptimizer.init();
}