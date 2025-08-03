// 搜索体验优化模块
const SearchEnhancement = {
    searchHistory: [],
    searchSuggestions: [],
    
    init() {
        this.createSearchUI();
        this.bindEvents();
        this.loadSearchHistory();
        this.generateSearchSuggestions();
    },
    
    createSearchUI() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        
        // 添加搜索建议容器
        const suggestionsHTML = `
            <div class="search-suggestions hidden" id="searchSuggestions">
                <div class="suggestion-header">
                    <span class="text-sm text-gray-400">搜索建议</span>
                    <button class="clear-suggestions text-xs text-blue-400 hover:text-blue-300">清空</button>
                </div>
                <div class="suggestions-list"></div>
            </div>
            
            <div class="search-history hidden" id="searchHistory">
                <div class="history-header">
                    <span class="text-sm text-gray-400">搜索历史</span>
                    <button class="clear-history text-xs text-blue-400 hover:text-blue-300">清空</button>
                </div>
                <div class="history-list"></div>
            </div>
        `;
        
        searchContainer.insertAdjacentHTML('beforeend', suggestionsHTML);
    },
    
    bindEvents() {
        const searchInput = document.querySelector('#searchInput');
        if (!searchInput) return;
        
        // 输入事件
        searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        // 焦点事件
        searchInput.addEventListener('focus', () => {
            this.showSearchHistory();
        });
        
        // 失焦事件
        searchInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 200);
        });
        
        // 键盘事件
        searchInput.addEventListener('keydown', (e) => {
            this.handleKeydown(e);
        });
        
        // 清空按钮事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('clear-suggestions')) {
                this.clearSuggestions();
            }
            if (e.target.classList.contains('clear-history')) {
                this.clearSearchHistory();
            }
        });
    },
    
    handleSearchInput(value) {
        if (value.length === 0) {
            this.showSearchHistory();
            return;
        }
        
        if (value.length >= 2) {
            this.showSearchSuggestions(value);
        } else {
            this.hideSuggestions();
        }
    },
    
    showSearchSuggestions(query) {
        const suggestions = this.filterSuggestions(query);
        const container = document.getElementById('searchSuggestions');
        const list = container.querySelector('.suggestions-list');
        
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        list.innerHTML = suggestions.map(item => `
            <div class="suggestion-item p-2 hover:bg-gray-700 cursor-pointer rounded" 
                 data-value="${item.value}">
                <div class="flex items-center">
                    <span class="text-blue-400 mr-2">${item.type}</span>
                    <span class="text-white">${item.value}</span>
                    <span class="text-gray-400 ml-auto text-xs">${item.standard}</span>
                </div>
            </div>
        `).join('');
        
        container.classList.remove('hidden');
        document.getElementById('searchHistory').classList.add('hidden');
        
        // 绑定点击事件
        list.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('searchInput').value = item.dataset.value;
                this.hideSuggestions();
                this.performSearch(item.dataset.value);
            });
        });
    },
    
    showSearchHistory() {
        const container = document.getElementById('searchHistory');
        const list = container.querySelector('.history-list');
        
        if (this.searchHistory.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        list.innerHTML = this.searchHistory.map(item => `
            <div class="history-item p-2 hover:bg-gray-700 cursor-pointer rounded flex items-center justify-between" 
                 data-value="${item}">
                <span class="text-white">${item}</span>
                <span class="text-gray-400 text-xs">${this.getTimeAgo(item.timestamp)}</span>
            </div>
        `).join('');
        
        container.classList.remove('hidden');
        document.getElementById('searchSuggestions').classList.add('hidden');
        
        // 绑定点击事件
        list.querySelectorAll('.history-item').forEach(item => {
            item.addEventListener('click', () => {
                document.getElementById('searchInput').value = item.dataset.value;
                this.hideSuggestions();
                this.performSearch(item.dataset.value);
            });
        });
    },
    
    hideSuggestions() {
        document.getElementById('searchSuggestions').classList.add('hidden');
        document.getElementById('searchHistory').classList.add('hidden');
    },
    
    handleKeydown(e) {
        const suggestions = document.querySelectorAll('.suggestion-item');
        const history = document.querySelectorAll('.history-item');
        const items = [...suggestions, ...history];
        
        if (items.length === 0) return;
        
        let currentIndex = items.findIndex(item => item.classList.contains('selected'));
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (currentIndex < items.length - 1) {
                    if (currentIndex >= 0) items[currentIndex].classList.remove('selected');
                    items[currentIndex + 1].classList.add('selected');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (currentIndex > 0) {
                    items[currentIndex].classList.remove('selected');
                    items[currentIndex - 1].classList.add('selected');
                }
                break;
            case 'Enter':
                e.preventDefault();
                const selectedItem = items.find(item => item.classList.contains('selected'));
                if (selectedItem) {
                    document.getElementById('searchInput').value = selectedItem.dataset.value;
                    this.hideSuggestions();
                    this.performSearch(selectedItem.dataset.value);
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    },
    
    generateSearchSuggestions() {
        this.searchSuggestions = [];
        
        // 从数据库生成搜索建议
        Object.keys(DB).forEach(standard => {
            Object.keys(DB[standard]).forEach(grade => {
                const data = DB[standard][grade];
                
                // 添加牌号
                this.searchSuggestions.push({
                    type: '牌号',
                    value: grade,
                    standard: standard.toUpperCase()
                });
                
                // 添加UNS编号
                if (data.uns) {
                    this.searchSuggestions.push({
                        type: 'UNS',
                        value: data.uns,
                        standard: standard.toUpperCase()
                    });
                }
                
                // 添加系列名称
                if (data.series) {
                    this.searchSuggestions.push({
                        type: '系列',
                        value: data.series,
                        standard: standard.toUpperCase()
                    });
                }
                
                // 添加类型名称
                if (data.type) {
                    this.searchSuggestions.push({
                        type: '类型',
                        value: data.type,
                        standard: standard.toUpperCase()
                    });
                }
            });
        });
    },
    
    filterSuggestions(query) {
        const lowerQuery = query.toLowerCase();
        return this.searchSuggestions.filter(item => 
            item.value.toLowerCase().includes(lowerQuery) ||
            item.type.toLowerCase().includes(lowerQuery) ||
            item.standard.toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // 限制显示10个建议
    },
    
    performSearch(query) {
        // 保存搜索历史
        this.addToSearchHistory(query);
        
        // 调用原有的搜索功能
        if (typeof performSearch === 'function') {
            performSearch(query);
        }
    },
    
    addToSearchHistory(query) {
        if (!query.trim()) return;
        
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // 添加到开头
        this.searchHistory.unshift(query);
        
        // 限制历史记录数量
        if (this.searchHistory.length > 10) {
            this.searchHistory = this.searchHistory.slice(0, 10);
        }
        
        // 保存到本地存储
        this.saveSearchHistory();
    },
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();
        this.hideSuggestions();
    },
    
    clearSuggestions() {
        this.searchSuggestions = [];
        this.hideSuggestions();
    },
    
    saveSearchHistory() {
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },
    
    loadSearchHistory() {
        const saved = localStorage.getItem('searchHistory');
        if (saved) {
            this.searchHistory = JSON.parse(saved);
        }
    },
    
    getTimeAgo(timestamp) {
        if (!timestamp) return '';
        const now = new Date();
        const time = new Date(timestamp);
        const diff = now - time;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    }
};

// 初始化搜索增强功能
document.addEventListener('DOMContentLoaded', () => {
    if (typeof SearchEnhancement !== 'undefined') {
        SearchEnhancement.init();
    }
}); 