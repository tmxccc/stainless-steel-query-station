// =================================================================================
// 模块：访问统计 (Analytics)
// =================================================================================

const Analytics = {
    // 初始化统计模块
    init() {
        this.recordPageView();
        this.setupPeriodicStats();
    },

    // 记录页面访问
    recordPageView() {
        const today = new Date().toISOString().split('T')[0];
        const stats = this.getDailyStats();
        
        // 增加今日访问量
        if (!stats[today]) {
            stats[today] = {
                pageViews: 0,
                uniqueVisitors: new Set(),
                ipAddresses: new Set(),
                lastVisit: null
            };
        }
        
        stats[today].pageViews++;
        stats[today].lastVisit = new Date().toISOString();
        
        // 记录访问者信息
        this.recordVisitorInfo(stats[today]);
        
        // 保存统计信息
        this.saveDailyStats(stats);
        
        // 更新显示
        this.updateStatsDisplay();
    },

    // 记录访问者信息
    recordVisitorInfo(dailyStats) {
        const visitorId = this.generateVisitorId();
        const ipAddress = this.getClientIP();
        
        dailyStats.uniqueVisitors.add(visitorId);
        if (ipAddress) {
            dailyStats.ipAddresses.add(ipAddress);
        }
    },

    // 生成访问者ID
    generateVisitorId() {
        let visitorId = localStorage.getItem('visitor_id');
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitor_id', visitorId);
        }
        return visitorId;
    },

    // 获取客户端IP（模拟，实际需要服务器端支持）
    getClientIP() {
        // 这里只是模拟，实际IP获取需要服务器端支持
        // 可以通过第三方服务如 ipify.org 获取
        return '模拟IP_' + Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255) + '.' + 
               Math.floor(Math.random() * 255);
    },

    // 获取每日统计数据
    getDailyStats() {
        const stats = localStorage.getItem('daily_stats');
        if (!stats) return {};
        
        const parsedStats = JSON.parse(stats);
        // 转换Set对象（JSON.stringify会丢失Set）
        Object.keys(parsedStats).forEach(date => {
            if (parsedStats[date].uniqueVisitors) {
                parsedStats[date].uniqueVisitors = new Set(parsedStats[date].uniqueVisitors);
            }
            if (parsedStats[date].ipAddresses) {
                parsedStats[date].ipAddresses = new Set(parsedStats[date].ipAddresses);
            }
        });
        
        return parsedStats;
    },

    // 保存每日统计数据
    saveDailyStats(stats) {
        const statsToSave = {};
        Object.keys(stats).forEach(date => {
            statsToSave[date] = {
                ...stats[date],
                uniqueVisitors: Array.from(stats[date].uniqueVisitors),
                ipAddresses: Array.from(stats[date].ipAddresses)
            };
        });
        
        localStorage.setItem('daily_stats', JSON.stringify(statsToSave));
    },

    // 设置定期统计
    setupPeriodicStats() {
        // 每小时更新一次统计显示
        setInterval(() => {
            this.updateStatsDisplay();
        }, 3600000); // 1小时
    },

    // 更新统计显示
    updateStatsDisplay() {
        const stats = this.getDailyStats();
        const today = new Date().toISOString().split('T')[0];
        const todayStats = stats[today];
        
        if (todayStats) {
            console.log(`📊 今日统计 - 访问量: ${todayStats.pageViews}, 独立访客: ${todayStats.uniqueVisitors.size}, IP数: ${todayStats.ipAddresses.size}`);
        }
    },

    // 获取统计数据摘要
    getStatsSummary() {
        const stats = this.getDailyStats();
        const today = new Date().toISOString().split('T')[0];
        const todayStats = stats[today];
        
        if (!todayStats) {
            return {
                pageViews: 0,
                uniqueVisitors: 0,
                ipAddresses: 0,
                lastVisit: null
            };
        }
        
        return {
            pageViews: todayStats.pageViews,
            uniqueVisitors: todayStats.uniqueVisitors.size,
            ipAddresses: todayStats.ipAddresses.size,
            lastVisit: todayStats.lastVisit
        };
    },

    // 导出统计数据
    exportStats() {
        const stats = this.getDailyStats();
        const csvContent = this.convertStatsToCSV(stats);
        
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `访问统计_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 转换统计数据为CSV格式
    convertStatsToCSV(stats) {
        const headers = ['日期', '页面访问量', '独立访客数', 'IP地址数', '最后访问时间'];
        let csvContent = headers.join(',') + '\n';
        
        Object.keys(stats).sort().forEach(date => {
            const dayStats = stats[date];
            const row = [
                date,
                dayStats.pageViews,
                dayStats.uniqueVisitors.size,
                dayStats.ipAddresses.size,
                dayStats.lastVisit || ''
            ];
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    },

    // 清除统计数据
    clearStats() {
        if (confirm('确定要清除所有访问统计数据吗？此操作不可恢复。')) {
            localStorage.removeItem('daily_stats');
            localStorage.removeItem('visitor_id');
            console.log('📊 访问统计数据已清除');
        }
    }
};

// 页面加载时初始化统计模块
document.addEventListener('DOMContentLoaded', () => {
    Analytics.init();
});

// 导出到全局对象
window.Analytics = Analytics;