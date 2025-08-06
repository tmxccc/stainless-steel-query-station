/**
 * 访问统计功能
 * 记录页面访问次数、用户行为等统计信息
 */

class VisitStatistics {
    constructor() {
        this.storageKey = 'stainless_steel_visit_stats';
        this.sessionKey = 'stainless_steel_session';
        this.init();
    }

    init() {
        this.recordVisit();
        this.trackUserBehavior();
        this.displayStats();
        this.setupStatsModal();
    }

    // 记录访问
    recordVisit() {
        const stats = this.getStats();
        const now = new Date();
        const today = now.toDateString();
        
        // 检查是否是新会话
        const sessionData = sessionStorage.getItem(this.sessionKey);
        if (!sessionData) {
            // 新会话
            stats.totalVisits++;
            stats.sessions++;
            
            // 记录今日访问
            if (!stats.dailyVisits[today]) {
                stats.dailyVisits[today] = 0;
            }
            stats.dailyVisits[today]++;
            
            // 记录访问时间
            stats.visitTimes.push(now.getTime());
            
            // 设置会话标记
            sessionStorage.setItem(this.sessionKey, JSON.stringify({
                startTime: now.getTime(),
                pageViews: 1
            }));
        } else {
            // 现有会话，增加页面浏览量
            const session = JSON.parse(sessionData);
            session.pageViews++;
            sessionStorage.setItem(this.sessionKey, JSON.stringify(session));
        }
        
        // 记录最后访问时间
        stats.lastVisit = now.getTime();
        
        this.saveStats(stats);
    }

    // 跟踪用户行为
    trackUserBehavior() {
        const stats = this.getStats();
        
        // 跟踪搜索行为
        document.addEventListener('search', (e) => {
            if (!stats.searchStats) stats.searchStats = {};
            const query = e.detail?.query || '';
            if (query) {
                stats.searchStats[query] = (stats.searchStats[query] || 0) + 1;
                stats.totalSearches = (stats.totalSearches || 0) + 1;
                this.saveStats(stats);
            }
        });

        // 跟踪点击行为
        document.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('[data-track]')) {
                const action = target.getAttribute('data-track');
                if (!stats.clickStats) stats.clickStats = {};
                stats.clickStats[action] = (stats.clickStats[action] || 0) + 1;
                this.saveStats(stats);
            }
        });

        // 跟踪页面停留时间
        let startTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const duration = Date.now() - startTime;
            stats.totalTime = (stats.totalTime || 0) + duration;
            this.saveStats(stats);
        });
    }

    // 获取统计数据
    getStats() {
        const defaultStats = {
            totalVisits: 0,
            sessions: 0,
            dailyVisits: {},
            visitTimes: [],
            lastVisit: null,
            totalSearches: 0,
            searchStats: {},
            clickStats: {},
            totalTime: 0
        };
        
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? { ...defaultStats, ...JSON.parse(stored) } : defaultStats;
        } catch (e) {
            console.warn('Failed to load visit statistics:', e);
            return defaultStats;
        }
    }

    // 保存统计数据
    saveStats(stats) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(stats));
        } catch (e) {
            console.warn('Failed to save visit statistics:', e);
        }
    }

    // 显示统计信息
    displayStats() {
        const stats = this.getStats();
        
        // 创建统计显示元素
        const statsElement = document.createElement('div');
        statsElement.id = 'visit-stats-display';
        statsElement.className = 'fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-lg text-xs opacity-70 hover:opacity-100 transition-opacity cursor-pointer z-40';
        statsElement.innerHTML = `
            <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>访问: ${stats.totalVisits}</span>
                <span>|</span>
                <span>搜索: ${stats.totalSearches || 0}</span>
            </div>
        `;
        
        // 点击显示详细统计
        statsElement.addEventListener('click', () => {
            this.showStatsModal();
        });
        
        document.body.appendChild(statsElement);
    }

    // 设置统计模态框
    setupStatsModal() {
        const modal = document.createElement('div');
        modal.id = 'stats-modal';
        modal.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 opacity-0 invisible modal-transition';
        modal.innerHTML = `
            <div class="bg-gray-800 text-white p-6 rounded-lg max-w-md w-full max-h-96 overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">访问统计</h3>
                    <button id="close-stats-modal" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div id="stats-content"></div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 关闭模态框
        modal.querySelector('#close-stats-modal').addEventListener('click', () => {
            modal.classList.add('opacity-0', 'invisible');
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('opacity-0', 'invisible');
            }
        });
    }

    // 显示统计模态框
    showStatsModal() {
        const modal = document.getElementById('stats-modal');
        const content = document.getElementById('stats-content');
        const stats = this.getStats();
        
        // 计算统计信息
        const avgSessionTime = stats.sessions > 0 ? Math.round(stats.totalTime / stats.sessions / 1000) : 0;
        const recentDays = Object.keys(stats.dailyVisits).slice(-7);
        const topSearches = Object.entries(stats.searchStats || {})
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        
        content.innerHTML = `
            <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-2xl font-bold text-blue-400">${stats.totalVisits}</div>
                        <div class="text-sm text-gray-300">总访问次数</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-2xl font-bold text-green-400">${stats.sessions}</div>
                        <div class="text-sm text-gray-300">会话数</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-2xl font-bold text-yellow-400">${stats.totalSearches || 0}</div>
                        <div class="text-sm text-gray-300">搜索次数</div>
                    </div>
                    <div class="bg-gray-700 p-3 rounded">
                        <div class="text-2xl font-bold text-purple-400">${avgSessionTime}s</div>
                        <div class="text-sm text-gray-300">平均停留</div>
                    </div>
                </div>
                
                ${recentDays.length > 0 ? `
                <div>
                    <h4 class="font-semibold mb-2">最近7天访问</h4>
                    <div class="space-y-1">
                        ${recentDays.map(day => `
                            <div class="flex justify-between text-sm">
                                <span>${new Date(day).toLocaleDateString()}</span>
                                <span>${stats.dailyVisits[day]} 次</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${topSearches.length > 0 ? `
                <div>
                    <h4 class="font-semibold mb-2">热门搜索</h4>
                    <div class="space-y-1">
                        ${topSearches.map(([query, count]) => `
                            <div class="flex justify-between text-sm">
                                <span class="truncate">${query}</span>
                                <span>${count} 次</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="text-xs text-gray-400 pt-2 border-t border-gray-600">
                    最后访问: ${stats.lastVisit ? new Date(stats.lastVisit).toLocaleString() : '未知'}
                </div>
            </div>
        `;
        
        modal.classList.remove('opacity-0', 'invisible');
    }

    // 重置统计数据
    resetStats() {
        if (confirm('确定要重置所有访问统计数据吗？')) {
            localStorage.removeItem(this.storageKey);
            sessionStorage.removeItem(this.sessionKey);
            location.reload();
        }
    }

    // 导出统计数据
    exportStats() {
        const stats = this.getStats();
        const dataStr = JSON.stringify(stats, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `visit-stats-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }
}

// 初始化访问统计
document.addEventListener('DOMContentLoaded', () => {
    window.visitStats = new VisitStatistics();
});

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisitStatistics;
}