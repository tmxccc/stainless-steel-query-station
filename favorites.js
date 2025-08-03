// 收藏功能模块
const FavoritesManager = {
    favorites: [],
    
    init() {
        this.loadFavorites();
        this.createFavoritesUI();
        this.bindEvents();
    },
    
    createFavoritesUI() {
        // 创建收藏按钮
        const favoriteBtn = `
            <button id="favoritesBtn" class="favorites-btn bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span>收藏夹</span>
                <span id="favoritesCount" class="bg-yellow-500 text-yellow-900 text-xs px-2 py-1 rounded-full">${this.favorites.length}</span>
            </button>
        `;
        
        // 插入到页面
        const header = document.querySelector('header');
        if (header) {
            const headerContent = header.querySelector('.max-w-screen-2xl');
            if (headerContent) {
                headerContent.insertAdjacentHTML('beforeend', favoriteBtn);
            }
        }
    },
    
    bindEvents() {
        // 收藏按钮点击
        document.getElementById('favoritesBtn').addEventListener('click', () => {
            this.showFavoritesPanel();
        });
    },
    
    showFavoritesPanel() {
        // 创建收藏面板
        const panel = `
            <div id="favoritesPanel" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                <div class="bg-gray-900 rounded-lg w-96 max-h-96 overflow-hidden">
                    <div class="flex items-center justify-between p-4 border-b border-gray-700">
                        <h2 class="text-white text-lg font-semibold">收藏夹</h2>
                        <button id="closeFavorites" class="text-white hover:text-gray-300">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="p-4 max-h-64 overflow-y-auto">
                        <div id="favoritesList">
                            ${this.renderFavoritesList()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', panel);
        
        // 绑定关闭事件
        document.getElementById('closeFavorites').addEventListener('click', () => {
            this.closeFavoritesPanel();
        });
        
        document.getElementById('favoritesPanel').addEventListener('click', (e) => {
            if (e.target.id === 'favoritesPanel') {
                this.closeFavoritesPanel();
            }
        });
    },
    
    closeFavoritesPanel() {
        const panel = document.getElementById('favoritesPanel');
        if (panel) {
            panel.remove();
        }
    },
    
    addToFavorites(grade, standard) {
        const favorite = {
            grade: grade,
            standard: standard,
            timestamp: new Date().toISOString()
        };
        
        // 检查是否已存在
        const exists = this.favorites.find(f => f.grade === grade && f.standard === standard);
        if (!exists) {
            this.favorites.unshift(favorite);
            this.saveFavorites();
            this.updateUI();
            this.showToast('已添加到收藏夹');
        }
    },
    
    removeFromFavorites(grade, standard) {
        this.favorites = this.favorites.filter(f => !(f.grade === grade && f.standard === standard));
        this.saveFavorites();
        this.updateUI();
        this.showToast('已从收藏夹移除');
    },
    
    renderFavoritesList() {
        if (this.favorites.length === 0) {
            return '<div class="text-gray-400 text-center py-8">暂无收藏</div>';
        }
        
        return this.favorites.map(favorite => `
            <div class="favorite-item bg-gray-800 rounded-lg p-3 mb-2 border border-gray-700">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-white font-medium">${favorite.grade}</div>
                        <div class="text-gray-400 text-sm">${favorite.standard}</div>
                    </div>
                    <button class="text-red-400 hover:text-red-300" 
                            onclick="FavoritesManager.removeFromFavorites('${favorite.grade}', '${favorite.standard}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    },
    
    updateUI() {
        const countElement = document.getElementById('favoritesCount');
        if (countElement) {
            countElement.textContent = this.favorites.length;
        }
    },
    
    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    },
    
    loadFavorites() {
        const saved = localStorage.getItem('favorites');
        if (saved) {
            this.favorites = JSON.parse(saved);
        }
    },
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
};

// 初始化收藏功能
document.addEventListener('DOMContentLoaded', () => {
    if (typeof FavoritesManager !== 'undefined') {
        FavoritesManager.init();
    }
}); 