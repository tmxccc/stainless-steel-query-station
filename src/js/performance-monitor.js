// 性能监控模块
window.PerformanceMonitor = (function() {
    'use strict';
    
    let metrics = {
        pageLoad: 0,
        searchTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        searchCount: 0,
        errorCount: 0,
        userActions: []
    };
    
    let observers = [];
    let isMonitoring = false;
    
    // 初始化性能监控
    function init() {
        if (isMonitoring) return;
        
        console.log('PerformanceMonitor: 初始化性能监控');
        isMonitoring = true;
        
        // 监控页面加载性能
        monitorPageLoad();
        
        // 监控资源加载
        monitorResourceLoad();
        
        // 监控内存使用
        monitorMemoryUsage();
        
        // 监控用户交互
        monitorUserInteractions();
        
        // 监控错误
        monitorErrors();
        
        // 监控长任务
        monitorLongTasks();
        
        // 定期收集指标
        setInterval(collectMetrics, 30000); // 每30秒收集一次
        
        // 页面卸载时发送数据
        window.addEventListener('beforeunload', sendMetrics);
    }
    
    // 监控页面加载性能
    function monitorPageLoad() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const timing = window.performance.timing;
                    metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
                    
                    console.log('PerformanceMonitor: 页面加载时间', metrics.pageLoad + 'ms');
                    
                    // 记录核心Web指标
                    recordCoreWebVitals();
                }, 0);
            });
        }
    }
    
    // 记录核心Web指标
    function recordCoreWebVitals() {
        // Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    const lastEntry = entries[entries.length - 1];
                    console.log('LCP:', lastEntry.startTime);
                    metrics.lcp = lastEntry.startTime;
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                observers.push(lcpObserver);
            } catch (e) {
                console.warn('LCP monitoring not supported');
            }
            
            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        console.log('FID:', entry.processingStart - entry.startTime);
                        metrics.fid = entry.processingStart - entry.startTime;
                    });
                });
                fidObserver.observe({ entryTypes: ['first-input'] });
                observers.push(fidObserver);
            } catch (e) {
                console.warn('FID monitoring not supported');
            }
            
            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    console.log('CLS:', clsValue);
                    metrics.cls = clsValue;
                });
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                observers.push(clsObserver);
            } catch (e) {
                console.warn('CLS monitoring not supported');
            }
        }
    }
    
    // 监控资源加载
    function monitorResourceLoad() {
        if ('PerformanceObserver' in window) {
            try {
                const resourceObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        if (entry.duration > 1000) { // 超过1秒的资源
                            console.warn('慢资源加载:', entry.name, entry.duration + 'ms');
                        }
                    });
                });
                resourceObserver.observe({ entryTypes: ['resource'] });
                observers.push(resourceObserver);
            } catch (e) {
                console.warn('Resource monitoring not supported');
            }
        }
    }
    
    // 监控内存使用
    function monitorMemoryUsage() {
        if (window.performance && window.performance.memory) {
            setInterval(() => {
                const memory = window.performance.memory;
                metrics.memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
                };
                
                // 内存使用过高警告
                if (metrics.memoryUsage.used > metrics.memoryUsage.limit * 0.8) {
                    console.warn('内存使用过高:', metrics.memoryUsage);
                    optimizeMemory();
                }
            }, 10000); // 每10秒检查一次
        }
    }
    
    // 监控用户交互
    function monitorUserInteractions() {
        const events = ['click', 'scroll', 'keydown', 'touchstart'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                const action = {
                    type: eventType,
                    timestamp: Date.now(),
                    target: e.target.tagName + (e.target.id ? '#' + e.target.id : ''),
                    x: e.clientX || 0,
                    y: e.clientY || 0
                };
                
                metrics.userActions.push(action);
                
                // 只保留最近100个操作
                if (metrics.userActions.length > 100) {
                    metrics.userActions = metrics.userActions.slice(-100);
                }
            }, { passive: true });
        });
    }
    
    // 监控错误
    function monitorErrors() {
        window.addEventListener('error', (e) => {
            metrics.errorCount++;
            console.error('JavaScript错误:', e.error);
            
            // 记录错误详情
            const errorInfo = {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                timestamp: Date.now()
            };
            
            // 发送错误报告
            sendErrorReport(errorInfo);
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            metrics.errorCount++;
            console.error('未处理的Promise拒绝:', e.reason);
            
            const errorInfo = {
                type: 'unhandledrejection',
                reason: e.reason.toString(),
                timestamp: Date.now()
            };
            
            sendErrorReport(errorInfo);
        });
    }
    
    // 监控长任务
    function monitorLongTasks() {
        if ('PerformanceObserver' in window) {
            try {
                const longTaskObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach((entry) => {
                        console.warn('长任务检测:', entry.duration + 'ms');
                        
                        // 如果任务超过100ms，记录警告
                        if (entry.duration > 100) {
                            metrics.longTasks = (metrics.longTasks || 0) + 1;
                        }
                    });
                });
                longTaskObserver.observe({ entryTypes: ['longtask'] });
                observers.push(longTaskObserver);
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        }
    }
    
    // 测量搜索性能
    function measureSearchTime(searchFunction) {
        return function(...args) {
            const startTime = performance.now();
            const result = searchFunction.apply(this, args);
            const endTime = performance.now();
            
            metrics.searchTime = endTime - startTime;
            metrics.searchCount++;
            
            console.log('搜索耗时:', metrics.searchTime + 'ms');
            
            return result;
        };
    }
    
    // 测量渲染性能
    function measureRenderTime(renderFunction) {
        return function(...args) {
            const startTime = performance.now();
            const result = renderFunction.apply(this, args);
            
            // 使用requestAnimationFrame确保渲染完成
            requestAnimationFrame(() => {
                const endTime = performance.now();
                metrics.renderTime = endTime - startTime;
                console.log('渲染耗时:', metrics.renderTime + 'ms');
            });
            
            return result;
        };
    }
    
    // 内存优化
    function optimizeMemory() {
        console.log('执行内存优化...');
        
        // 清理缓存
        if (window.Utils && window.Utils.clearCache) {
            window.Utils.clearCache();
        }
        
        // 清理事件监听器
        cleanupEventListeners();
        
        // 建议垃圾回收
        if (window.gc) {
            window.gc();
        }
        
        // 显示内存优化提示
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast('已执行内存优化', 'info');
        }
    }
    
    // 清理事件监听器
    function cleanupEventListeners() {
        // 移除性能观察器
        observers.forEach(observer => {
            try {
                observer.disconnect();
            } catch (e) {
                console.warn('清理观察器失败:', e);
            }
        });
        observers = [];
    }
    
    // 收集指标
    function collectMetrics() {
        const currentMetrics = {
            ...metrics,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        console.log('性能指标:', currentMetrics);
        
        // 存储到本地存储
        try {
            const storedMetrics = JSON.parse(localStorage.getItem('performanceMetrics') || '[]');
            storedMetrics.push(currentMetrics);
            
            // 只保留最近10条记录
            if (storedMetrics.length > 10) {
                storedMetrics.splice(0, storedMetrics.length - 10);
            }
            
            localStorage.setItem('performanceMetrics', JSON.stringify(storedMetrics));
        } catch (e) {
            console.warn('存储性能指标失败:', e);
        }
        
        return currentMetrics;
    }
    
    // 发送指标数据
    function sendMetrics() {
        const metricsData = collectMetrics();
        
        // 这里可以发送到分析服务
        console.log('发送性能数据:', metricsData);
        
        // 禁用API发送，避免在简单HTTP服务器上产生错误
        // if (navigator.sendBeacon) {
        //     const data = JSON.stringify(metricsData);
        //     navigator.sendBeacon('/api/metrics', data);
        // }
    }
    
    // 发送错误报告
    function sendErrorReport(errorInfo) {
        console.log('发送错误报告:', errorInfo);
        
        // 禁用API发送，避免在简单HTTP服务器上产生错误
        // if (navigator.sendBeacon) {
        //     const data = JSON.stringify(errorInfo);
        //     navigator.sendBeacon('/api/errors', data);
        // }
    }
    
    // 获取性能报告
    function getPerformanceReport() {
        const report = {
            current: metrics,
            history: JSON.parse(localStorage.getItem('performanceMetrics') || '[]'),
            recommendations: generateRecommendations()
        };
        
        return report;
    }
    
    // 生成性能建议
    function generateRecommendations() {
        const recommendations = [];
        
        if (metrics.pageLoad > 3000) {
            recommendations.push('页面加载时间过长，建议优化资源加载');
        }
        
        if (metrics.searchTime > 500) {
            recommendations.push('搜索响应时间过长，建议优化搜索算法');
        }
        
        if (metrics.memoryUsage && metrics.memoryUsage.used > 50) {
            recommendations.push('内存使用较高，建议清理缓存');
        }
        
        if (metrics.errorCount > 5) {
            recommendations.push('错误数量较多，建议检查代码质量');
        }
        
        if (metrics.longTasks > 3) {
            recommendations.push('检测到多个长任务，建议优化代码执行');
        }
        
        return recommendations;
    }
    
    // 公共API
    return {
        init,
        measureSearchTime,
        measureRenderTime,
        getPerformanceReport,
        optimizeMemory,
        collectMetrics,
        
        // 获取当前指标
        getMetrics: () => ({ ...metrics }),
        
        // 重置指标
        resetMetrics: () => {
            metrics = {
                pageLoad: 0,
                searchTime: 0,
                renderTime: 0,
                memoryUsage: 0,
                searchCount: 0,
                errorCount: 0,
                userActions: []
            };
        },
        
        // 停止监控
        stop: () => {
            isMonitoring = false;
            cleanupEventListeners();
        }
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    window.PerformanceMonitor.init();
});