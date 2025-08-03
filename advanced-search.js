// 高级搜索功能模块
const AdvancedSearch = {
    filters: {
        standard: '',
        type: '',
        family: '',
        minYield: '',
        maxYield: '',
        minTensile: '',
        maxTensile: '',
        hasMolybdenum: false,
        hasTitanium: false,
        hasNiobium: false
    },

    init() {
        this.createAdvancedSearchUI();
        this.bindEvents();
    },

    createAdvancedSearchUI() {
        const searchContainer = document.querySelector('.p-4.border-b.border-gray-700');
        const advancedSearchHTML = `
            <div class="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-white">高级搜索</h3>
                    <button id="toggle-advanced" class="text-xs text-blue-400 hover:text-blue-300">展开</button>
                </div>
                <div id="advanced-filters" class="hidden space-y-3">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">标准</label>
                            <select id="filter-standard" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                                <option value="">全部标准</option>
                                <option value="GB">GB</option>
                                <option value="ASTM">ASTM</option>
                                <option value="EN">EN</option>
                                <option value="nickel">镍基合金</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">类型</label>
                            <select id="filter-type" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                                <option value="">全部类型</option>
                                <option value="austenitic">奥氏体</option>
                                <option value="ferritic">铁素体</option>
                                <option value="martensitic">马氏体</option>
                                <option value="duplex">双相钢</option>
                                <option value="precipitation-hardening">沉淀硬化</option>
                                <option value="nickel-chromium">镍铬合金</option>
                                <option value="nickel-copper">镍铜合金</option>
                                <option value="nickel-chromium-molybdenum">镍铬钼合金</option>
                                <option value="nickel-chromium-iron">镍铬铁合金</option>
                                <option value="nickel-chromium-aluminum">镍铬铝合金</option>
                                <option value="nickel-copper-aluminum">镍铜铝合金</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">牌号系列</label>
                            <select id="filter-family" class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                                <option value="">全部系列</option>
                                <option value="300系列">300系列</option>
                                <option value="400系列">400系列</option>
                                <option value="200系列">200系列</option>
                                <option value="沉淀硬化系列">沉淀硬化系列</option>
                                <option value="镍基合金">镍基合金</option>
                                <option value="chromium-nickel">铬镍系列</option>
                                <option value="chromium-nickel-molybdenum">铬镍钼系列</option>
                                <option value="chromium-nickel-titanium">铬镍钛系列</option>
                                <option value="chromium-nickel-copper">铬镍铜系列</option>
                                <option value="chromium">铬系列</option>
                                <option value="nickel-based">镍基系列</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">屈服强度范围 (MPa)</label>
                            <div class="flex gap-2">
                                <input type="number" id="min-yield" placeholder="最小值" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                                <span class="text-gray-400 self-center">-</span>
                                <input type="number" id="max-yield" placeholder="最大值" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-400 mb-1">抗拉强度范围 (MPa)</label>
                            <div class="flex gap-2">
                                <input type="number" id="min-tensile" placeholder="最小值" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                                <span class="text-gray-400 self-center">-</span>
                                <input type="number" id="max-tensile" placeholder="最大值" class="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm">
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex flex-wrap gap-3">
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-molybdenum" class="rounded">
                            <span class="text-gray-300">含钼</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-titanium" class="rounded">
                            <span class="text-gray-300">含钛</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-niobium" class="rounded">
                            <span class="text-gray-300">含铌</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-aluminum" class="rounded">
                            <span class="text-gray-300">含铝</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-copper" class="rounded">
                            <span class="text-gray-300">含铜</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-tungsten" class="rounded">
                            <span class="text-gray-300">含钨</span>
                        </label>
                        <label class="flex items-center gap-2 text-sm">
                            <input type="checkbox" id="has-cobalt" class="rounded">
                            <span class="text-gray-300">含钴</span>
                        </label>
                    </div>
                    
                    <div class="flex gap-2">
                        <button id="apply-filters" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded">
                            应用筛选
                        </button>
                        <button id="clear-filters" class="bg-gray-600 hover:bg-gray-700 text-white text-sm font-bold py-2 px-4 rounded">
                            清除筛选
                        </button>
                    </div>
                </div>
            </div>
        `;
        searchContainer.insertAdjacentHTML('afterend', advancedSearchHTML);
    },

    bindEvents() {
        document.getElementById('toggle-advanced').addEventListener('click', () => {
            const filters = document.getElementById('advanced-filters');
            const toggleBtn = document.getElementById('toggle-advanced');
            if (filters.classList.contains('hidden')) {
                filters.classList.remove('hidden');
                toggleBtn.textContent = '收起';
            } else {
                filters.classList.add('hidden');
                toggleBtn.textContent = '展开';
            }
        });

        document.getElementById('apply-filters').addEventListener('click', () => {
            this.updateFilters();
            this.applyAdvancedSearch();
        });

        document.getElementById('clear-filters').addEventListener('click', () => {
            this.clearAllFilters();
        });

        // 实时筛选
        const filterInputs = ['filter-standard', 'filter-type', 'filter-family', 'min-yield', 'max-yield', 'min-tensile', 'max-tensile'];
        filterInputs.forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateFilters();
                this.applyAdvancedSearch();
            });
        });

        const checkboxes = ['has-molybdenum', 'has-titanium', 'has-niobium'];
        checkboxes.forEach(id => {
            document.getElementById(id).addEventListener('change', () => {
                this.updateFilters();
                this.applyAdvancedSearch();
            });
        });
    },

    updateFilters() {
        this.filters.standard = document.getElementById('filter-standard').value;
        this.filters.type = document.getElementById('filter-type').value;
        this.filters.family = document.getElementById('filter-family').value;
        this.filters.minYield = document.getElementById('min-yield').value;
        this.filters.maxYield = document.getElementById('max-yield').value;
        this.filters.minTensile = document.getElementById('min-tensile').value;
        this.filters.maxTensile = document.getElementById('max-tensile').value;
        this.filters.hasMolybdenum = document.getElementById('has-molybdenum').checked;
        this.filters.hasTitanium = document.getElementById('has-titanium').checked;
        this.filters.hasNiobium = document.getElementById('has-niobium').checked;
        this.filters.hasAluminum = document.getElementById('has-aluminum').checked;
        this.filters.hasCopper = document.getElementById('has-copper').checked;
        this.filters.hasTungsten = document.getElementById('has-tungsten').checked;
        this.filters.hasCobalt = document.getElementById('has-cobalt').checked;
    },

    clearAllFilters() {
        document.getElementById('filter-standard').value = '';
        document.getElementById('filter-type').value = '';
        document.getElementById('filter-family').value = '';
        document.getElementById('min-yield').value = '';
        document.getElementById('max-yield').value = '';
        document.getElementById('min-tensile').value = '';
        document.getElementById('max-tensile').value = '';
        document.getElementById('has-molybdenum').checked = false;
        document.getElementById('has-titanium').checked = false;
        document.getElementById('has-niobium').checked = false;
        document.getElementById('has-aluminum').checked = false;
        document.getElementById('has-copper').checked = false;
        document.getElementById('has-tungsten').checked = false;
        document.getElementById('has-cobalt').checked = false;
        
        this.filters = {
            standard: '',
            type: '',
            family: '',
            minYield: '',
            maxYield: '',
            minTensile: '',
            maxTensile: '',
            hasMolybdenum: false,
            hasTitanium: false,
            hasNiobium: false,
            hasAluminum: false,
            hasCopper: false,
            hasTungsten: false,
            hasCobalt: false
        };
        
        this.applyAdvancedSearch();
    },

    applyAdvancedSearch() {
        const query = document.getElementById('globalSearchInput').value;
        let filteredData = AppState.allData;

        // 基础搜索
        if (query.trim()) {
            filteredData = filteredData.filter(item => 
                item.name.toLowerCase().includes(query.toLowerCase()) || 
                (item.usn && item.usn.toLowerCase().includes(query.toLowerCase())) ||
                item.family.toLowerCase().includes(query.toLowerCase())
            );
        }

        // 高级筛选
        if (this.filters.standard) {
            filteredData = filteredData.filter(item => item.standard === this.filters.standard);
        }

        if (this.filters.type) {
            filteredData = filteredData.filter(item => item.type === this.filters.type);
        }

        if (this.filters.family) {
            filteredData = filteredData.filter(item => item.family === this.filters.family);
        }

        if (this.filters.minYield) {
            const minYield = parseInt(this.filters.minYield);
            filteredData = filteredData.filter(item => {
                const yieldStr = item.yield_strength;
                const yieldValue = parseInt(yieldStr.replace(/[^\d]/g, ''));
                return yieldValue >= minYield;
            });
        }

        if (this.filters.maxYield) {
            const maxYield = parseInt(this.filters.maxYield);
            filteredData = filteredData.filter(item => {
                const yieldStr = item.yield_strength;
                const yieldValue = parseInt(yieldStr.replace(/[^\d]/g, ''));
                return yieldValue <= maxYield;
            });
        }

        if (this.filters.minTensile) {
            const minTensile = parseInt(this.filters.minTensile);
            filteredData = filteredData.filter(item => {
                const tensileStr = item.tensile_strength;
                const tensileValue = parseInt(tensileStr.replace(/[^\d]/g, ''));
                return tensileValue >= minTensile;
            });
        }

        if (this.filters.maxTensile) {
            const maxTensile = parseInt(this.filters.maxTensile);
            filteredData = filteredData.filter(item => {
                const tensileStr = item.tensile_strength;
                const tensileValue = parseInt(tensileStr.replace(/[^\d]/g, ''));
                return tensileValue <= maxTensile;
            });
        }

        if (this.filters.hasMolybdenum) {
            filteredData = filteredData.filter(item => item.钼 && item.钼 !== '—');
        }

        if (this.filters.hasTitanium) {
            filteredData = filteredData.filter(item => item.ti && item.ti !== '—');
        }

        if (this.filters.hasNiobium) {
            filteredData = filteredData.filter(item => item.nb && item.nb !== '—');
        }

        if (this.filters.hasAluminum) {
            filteredData = filteredData.filter(item => item.al && item.al !== '—');
        }

        if (this.filters.hasCopper) {
            filteredData = filteredData.filter(item => item.cu && item.cu !== '—');
        }

        if (this.filters.hasTungsten) {
            filteredData = filteredData.filter(item => item.w && item.w !== '—');
        }

        if (this.filters.hasCobalt) {
            filteredData = filteredData.filter(item => item.co && item.co !== '—');
        }

        // 更新搜索结果
        AppState.searchResultGroups = filteredData.reduce((acc, item) => {
            const family = item.family || item.name;
            if (!acc[family]) acc[family] = [];
            acc[family].push(item);
            return acc;
        }, {});

        UI.renderSearchResults();
        
        // 显示筛选结果统计
        const totalResults = filteredData.length;
        const totalGroups = Object.keys(AppState.searchResultGroups).length;
        Utils.showToast(`找到 ${totalResults} 个牌号，共 ${totalGroups} 个系列`, 'success');
    }
};

// 初始化高级搜索
document.addEventListener('DOMContentLoaded', () => {
    if (typeof AdvancedSearch !== 'undefined') {
        AdvancedSearch.init();
    }
}); 