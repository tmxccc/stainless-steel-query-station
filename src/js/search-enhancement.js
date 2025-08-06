// 搜索增强模块 - 升级版
const SearchEnhancement = {
    searchHistory: JSON.parse(localStorage.getItem('searchHistory') || '[]'),
    searchSuggestions: [],
    currentSearchIndex: -1,
    maxHistoryItems: 20,
    searchTimer: null,
    
    // 智能搜索建议数据
    searchKeywords: {
        materials: ['304', '316', '316L', '304L', '2205', '430', '410', '420', '440C', '17-4PH'],
        properties: ['奥氏体', '铁素体', '马氏体', '双相钢', '沉淀硬化'],
        elements: ['铬', '镍', '钼', '碳', '硅', '锰', '磷', '硫', '铜', '氮', '钛', '铌'],
        standards: ['GB', 'ASTM', 'EN', 'JIS', 'ISO', 'UNS'],
        applications: ['耐腐蚀', '高温', '低温', '食品级', '医用', '海洋', '化工', '核电']
    },

    init() {
        this.createSearchUI();
        this.bindEvents();
        this.loadSearchSuggestions();
        this.setupKeyboardNavigation();
        this.setupAdvancedFilters();
        console.log('🔍 搜索增强模块初始化完成');
    },

    // 创建搜索UI
    createSearchUI() {
        const searchContainer = document.querySelector('.search-container') || document.getElementById('searchInput')?.parentElement;
        if (!searchContainer) return;

        // 添加搜索建议容器
        if (!document.getElementById('search-suggestions')) {
            const suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'search-suggestions';
            suggestionsContainer.className = 'absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-sm border border-gray-600 rounded-b-lg shadow-xl z-50 hidden max-h-80 overflow-y-auto';
            suggestionsContainer.style.cssText = `
                border-top: none;
                box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            `;
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(suggestionsContainer);
        }

        // 添加搜索历史按钮
        if (!document.getElementById('search-history-btn')) {
            const historyBtn = document.createElement('button');
            historyBtn.id = 'search-history-btn';
            historyBtn.className = 'absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors';
            historyBtn.innerHTML = '🕒';
            historyBtn.title = '搜索历史';
            searchContainer.appendChild(historyBtn);
        }


    },



    // 绑定事件
    bindEvents() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        // 搜索输入事件已禁用，由原有的Core模块处理
        // searchInput.addEventListener('input', (e) => {
        //     this.handleSearchInput(e.target.value);
        // });

        // 搜索提交事件和键盘导航
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (this.currentSearchIndex >= 0 && this.searchSuggestions[this.currentSearchIndex]) {
                    this.selectSuggestion(this.searchSuggestions[this.currentSearchIndex]);
                } else {
                    this.handleSearchSubmit(e.target.value);
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateSuggestions('down');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateSuggestions('up');
            } else if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });

        // 搜索历史按钮
        document.getElementById('search-history-btn')?.addEventListener('click', () => {
            this.showSearchHistory();
        });



        // 点击外部关闭建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
    },



    // 处理搜索输入
    handleSearchInput(query) {
        // 禁用搜索建议，直接隐藏建议框
        this.hideSuggestions();
        
        // 直接触发搜索，不显示建议
        if (window.Core && window.Core.globalSearch) {
            window.Core.globalSearch(query);
        }
    },

    // 生成搜索建议
    generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // 从实际数据库中获取建议（返回详细信息）
        const dbSuggestions = this.getDataBaseSuggestionsDetailed(query);
        dbSuggestions.forEach(suggestion => {
            suggestions.push(suggestion);
        });

        // 从关键词中匹配
        Object.values(this.searchKeywords).flat().forEach(keyword => {
            if (keyword.toLowerCase().includes(queryLower) && 
                !suggestions.some(s => (typeof s === 'string' ? s : s.text) === keyword)) {
                suggestions.push({
                    text: keyword,
                    type: '关键词',
                    standard: null
                });
            }
        });

        // 从搜索历史中匹配
        this.searchHistory.forEach(item => {
            if (item.toLowerCase().includes(queryLower) && 
                !suggestions.some(s => (typeof s === 'string' ? s : s.text) === item)) {
                suggestions.push({
                    text: item,
                    type: '历史',
                    standard: null
                });
            }
        });

        // 智能建议
        const smartSuggestions = this.getSmartSuggestions(query);
        smartSuggestions.forEach(suggestion => {
            if (!suggestions.some(s => (typeof s === 'string' ? s : s.text) === suggestion)) {
                suggestions.push({
                    text: suggestion,
                    type: '智能',
                    standard: null
                });
            }
        });

        this.searchSuggestions = suggestions.slice(0, 10);
        this.renderSuggestions();
    },

    // 从数据库获取建议
    getDataBaseSuggestions(query) {
        const queryLower = query.toLowerCase();
        
        // 检查是否有全局数据库
        if (typeof window.DB === 'undefined') {
            return [];
        }

        // 按标准分类收集建议
        const suggestionsByStandard = {
            gb: [],      // 国标
            astm: [],    // 美标
            en: [],      // 欧标
            jis: [],     // 日标
            iso: [],     // 国际标准
            other: []    // 其他
        };

        // 遍历所有标准的数据
        Object.keys(window.DB).forEach(standard => {
            if (window.DB[standard] && Array.isArray(window.DB[standard])) {
                const standardKey = standard.toLowerCase();
                const targetArray = suggestionsByStandard[standardKey] || suggestionsByStandard.other;
                
                console.log(`处理标准 ${standard} (${standardKey}), 数据量: ${window.DB[standard].length}`);
                
                window.DB[standard].forEach(item => {
                    const itemSuggestions = [];
                    
                    // 匹配牌号名称
                    if (item.name && item.name.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.name,
                            type: '牌号',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.name, queryLower)
                        });
                    }
                    
                    // 匹配UNS编号
                    if (item.UNS && item.UNS.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.UNS,
                            type: 'UNS',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.UNS, queryLower)
                        });
                    }
                    
                    // 匹配类型
                    if (item.type && item.type.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.type,
                            type: '类型',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.type, queryLower)
                        });
                    }
                    
                    // 匹配全球等效牌号
                    if (item.global) {
                        Object.entries(item.global).forEach(([globalStandard, globalGrade]) => {
                            if (globalGrade && globalGrade.toLowerCase().includes(queryLower)) {
                                itemSuggestions.push({
                                    text: globalGrade,
                                    type: '等效',
                                    standard: globalStandard.toLowerCase(),
                                    relevance: this.calculateRelevance(globalGrade, queryLower)
                                });
                            }
                        });
                    }
                    
                    // 添加到对应标准数组
                    itemSuggestions.forEach(suggestion => {
                        const isDuplicate = targetArray.some(existing => 
                            existing.text === suggestion.text && existing.type === suggestion.type
                        );
                        if (!isDuplicate) {
                            targetArray.push(suggestion);
                        }
                    });
                });
            }
        });

        // 对每个标准的建议按相关性排序
        Object.keys(suggestionsByStandard).forEach(standard => {
            suggestionsByStandard[standard].sort((a, b) => b.relevance - a.relevance);
        });

        // 平衡选择各标准的建议（确保各标准都有代表）
        const finalSuggestions = [];
        const maxPerStandard = 2; // 每个标准最多2个建议
        const priorityStandards = ['gb', 'astm', 'en']; // 优先显示的标准
        
        // 先从优先标准中选择
        priorityStandards.forEach(standard => {
            const standardSuggestions = suggestionsByStandard[standard].slice(0, maxPerStandard);
            standardSuggestions.forEach(suggestion => {
                if (finalSuggestions.length < 8) {
                    finalSuggestions.push(suggestion.text);
                }
            });
        });
        
        // 再从其他标准中补充
        Object.keys(suggestionsByStandard).forEach(standard => {
            if (!priorityStandards.includes(standard)) {
                const standardSuggestions = suggestionsByStandard[standard].slice(0, 1);
                standardSuggestions.forEach(suggestion => {
                    if (finalSuggestions.length < 8 && !finalSuggestions.includes(suggestion.text)) {
                        finalSuggestions.push(suggestion.text);
                    }
                });
            }
        });

        console.log('最终建议结果:', finalSuggestions);
        console.log('各标准建议数量:', Object.keys(suggestionsByStandard).map(k => `${k}: ${suggestionsByStandard[k].length}`));
        
        return finalSuggestions;
    },

    // 获取详细的数据库建议（包含标准信息）
    getDataBaseSuggestionsDetailed(query) {
        const queryLower = query.toLowerCase();
        
        // 检查是否有全局数据库
        if (typeof window.DB === 'undefined') {
            console.log('数据库未定义');
            return [];
        }

        console.log('搜索查询:', query, '数据库标准:', Object.keys(window.DB));

        // 按标准分类收集建议
        const suggestionsByStandard = {
            gb: [],      // 国标
            astm: [],    // 美标
            en: [],      // 欧标
            jis: [],     // 日标
            iso: [],     // 国际标准
            other: []    // 其他
        };

        // 遍历所有标准的数据
        Object.keys(window.DB).forEach(standard => {
            if (window.DB[standard] && Array.isArray(window.DB[standard])) {
                const standardKey = standard.toLowerCase();
                const targetArray = suggestionsByStandard[standardKey] || suggestionsByStandard.other;
                
                console.log(`处理标准 ${standard} (${standardKey}), 数据量: ${window.DB[standard].length}`);
                
                window.DB[standard].forEach(item => {
                    const itemSuggestions = [];
                    
                    // 匹配牌号名称
                    if (item.name && item.name.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.name,
                            type: '牌号',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.name, queryLower)
                        });
                    }
                    
                    // 匹配UNS编号
                    if (item.UNS && item.UNS.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.UNS,
                            type: 'UNS',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.UNS, queryLower)
                        });
                    }
                    
                    // 匹配类型
                    if (item.type && item.type.toLowerCase().includes(queryLower)) {
                        itemSuggestions.push({
                            text: item.type,
                            type: '类型',
                            standard: standardKey,
                            relevance: this.calculateRelevance(item.type, queryLower)
                        });
                    }
                    
                    // 匹配全球等效牌号
                    if (item.global) {
                        Object.entries(item.global).forEach(([globalStandard, globalGrade]) => {
                            if (globalGrade && globalGrade.toLowerCase().includes(queryLower)) {
                                itemSuggestions.push({
                                    text: globalGrade,
                                    type: '等效',
                                    standard: globalStandard.toLowerCase(),
                                    relevance: this.calculateRelevance(globalGrade, queryLower)
                                });
                            }
                        });
                    }
                    
                    // 添加到对应标准数组
                    itemSuggestions.forEach(suggestion => {
                        const isDuplicate = targetArray.some(existing => 
                            existing.text === suggestion.text && existing.type === suggestion.type
                        );
                        if (!isDuplicate) {
                            targetArray.push(suggestion);
                        }
                    });
                });
            }
        });

        // 对每个标准的建议按相关性排序
        Object.keys(suggestionsByStandard).forEach(standard => {
            suggestionsByStandard[standard].sort((a, b) => b.relevance - a.relevance);
        });

        // 平衡选择各标准的建议（确保各标准都有代表）
        const finalSuggestions = [];
        const maxPerStandard = 2; // 每个标准最多2个建议
        const priorityStandards = ['gb', 'astm', 'en']; // 优先显示的标准
        
        // 先从优先标准中选择
        priorityStandards.forEach(standard => {
            const standardSuggestions = suggestionsByStandard[standard].slice(0, maxPerStandard);
            standardSuggestions.forEach(suggestion => {
                if (finalSuggestions.length < 8) {
                    finalSuggestions.push(suggestion);
                }
            });
        });
        
        // 再从其他标准中补充
        Object.keys(suggestionsByStandard).forEach(standard => {
            if (!priorityStandards.includes(standard)) {
                const standardSuggestions = suggestionsByStandard[standard].slice(0, 1);
                standardSuggestions.forEach(suggestion => {
                    if (finalSuggestions.length < 8 && 
                        !finalSuggestions.some(s => s.text === suggestion.text)) {
                        finalSuggestions.push(suggestion);
                    }
                });
            }
        });

        console.log('详细建议最终结果:', finalSuggestions);
        console.log('详细建议各标准数量:', Object.keys(suggestionsByStandard).map(k => `${k}: ${suggestionsByStandard[k].length}`));
        
        return finalSuggestions;
    },

    // 计算相关性得分
    calculateRelevance(text, query) {
        const textLower = text.toLowerCase();
        const queryLower = query.toLowerCase();
        
        // 完全匹配得分最高
        if (textLower === queryLower) return 100;
        
        // 开头匹配得分较高
        if (textLower.startsWith(queryLower)) return 80;
        
        // 包含匹配根据位置和长度计算得分
        const index = textLower.indexOf(queryLower);
        if (index !== -1) {
            const positionScore = Math.max(0, 50 - index * 2); // 位置越靠前得分越高
            const lengthScore = Math.max(0, 30 - (text.length - query.length)); // 长度越接近得分越高
            return positionScore + lengthScore;
        }
        
        return 0;
    },

    // 获取智能建议
    getSmartSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();

        // 数字匹配 - 可能是牌号
        if (/^\d+/.test(query)) {
            const num = query.match(/^\d+/)[0];
            ['304', '316', '430', '410', '420'].forEach(grade => {
                if (grade.startsWith(num)) {
                    suggestions.push(grade);
                }
            });
        }

        // 字母匹配 - 可能是标准
        if (/^[a-zA-Z]+/.test(query)) {
            const letters = query.match(/^[a-zA-Z]+/)[0].toUpperCase();
            if (letters.length >= 2) {
                ['ASTM', 'EN', 'JIS', 'ISO', 'UNS'].forEach(standard => {
                    if (standard.startsWith(letters)) {
                        suggestions.push(standard);
                    }
                });
            }
        }

        // 中文匹配 - 可能是类型或元素
        if (/[\u4e00-\u9fa5]/.test(query)) {
            this.searchKeywords.properties.forEach(prop => {
                if (prop.includes(queryLower)) {
                    suggestions.push(prop);
                }
            });
            this.searchKeywords.elements.forEach(element => {
                if (element.includes(queryLower)) {
                    suggestions.push(element);
                }
            });
        }

        return suggestions;
    },

    // 渲染建议
    renderSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (!container) return;

        if (this.searchSuggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }

        container.innerHTML = this.searchSuggestions.map((suggestion, index) => {
            // 处理新的建议格式（对象）和旧的格式（字符串）
            const suggestionText = typeof suggestion === 'string' ? suggestion : suggestion.text;
            const suggestionType = typeof suggestion === 'string' ? this.getSuggestionType(suggestion) : suggestion.type;
            const suggestionStandard = typeof suggestion === 'string' ? null : suggestion.standard;
            
            const typeColor = this.getTypeColor(suggestionType);
            const typeIcon = this.getTypeIcon(suggestionType);
            const standardInfo = this.getStandardInfo(suggestionStandard);
            
            return `
                <div class="suggestion-item px-4 py-3 hover:bg-gray-700/80 cursor-pointer flex items-center justify-between transition-all duration-200 border-b border-gray-700/50 last:border-b-0 ${index === this.currentSearchIndex ? 'bg-blue-600/20 border-blue-500/30' : ''}" data-suggestion="${suggestionText}">
                    <div class="flex items-center gap-3">
                        <span class="text-lg ${typeColor} flex-shrink-0">${typeIcon}</span>
                        <div class="flex flex-col min-w-0 flex-1">
                            <span class="text-gray-200 font-medium text-sm truncate">${this.highlightMatch(suggestionText)}</span>
                            ${standardInfo ? `<span class="text-xs text-gray-400 mt-0.5 truncate">${standardInfo}</span>` : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-2 flex-shrink-0">
                        ${suggestionStandard ? `<span class="text-xs px-2 py-1 rounded-full ${this.getStandardColor(suggestionStandard)} bg-opacity-20 border border-current border-opacity-30 font-medium">${suggestionStandard.toUpperCase()}</span>` : ''}
                        <span class="text-xs px-2 py-1 rounded-full ${typeColor} bg-opacity-20 border border-current border-opacity-30 font-medium">${suggestionType}</span>
                    </div>
                </div>
            `;
        }).join('');

        // 绑定点击事件
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.suggestion);
            });
        });
    },

    // 获取类型颜色
    getTypeColor(type) {
        const colors = {
            '牌号': 'text-blue-400',
            'UNS': 'text-green-400',
            '类型': 'text-purple-400',
            '等效': 'text-yellow-400',
            '元素': 'text-red-400',
            '标准': 'text-indigo-400',
            '应用': 'text-pink-400',
            '历史': 'text-gray-400',
            '中文': 'text-orange-400',
            '建议': 'text-gray-500'
        };
        return colors[type] || 'text-gray-500';
    },

    // 获取类型图标
    getTypeIcon(type) {
        const icons = {
            '牌号': '🔧',
            'UNS': '🏷️',
            '类型': '📋',
            '等效': '🔄',
            '元素': '⚛️',
            '标准': '📏',
            '应用': '🎯',
            '历史': '🕒',
            '中文': '🇨🇳',
            '建议': '💡'
        };
        return icons[type] || '💡';
    },

    // 获取标准信息
    getStandardInfo(standard) {
        if (!standard) return null;
        
        const standardNames = {
            'gb': '中国国家标准',
            'astm': '美国材料试验协会标准',
            'en': '欧洲标准',
            'jis': '日本工业标准',
            'iso': '国际标准化组织',
            'uns': '统一编号系统',
            'din': '德国工业标准',
            'bs': '英国标准',
            'afnor': '法国标准',
            'other': '其他标准'
        };
        
        return standardNames[standard.toLowerCase()] || standard.toUpperCase();
    },

    // 获取标准颜色
    getStandardColor(standard) {
        if (!standard) return 'text-gray-500';
        
        const colors = {
            'gb': 'text-red-400',      // 国标 - 红色
            'astm': 'text-blue-400',   // 美标 - 蓝色
            'en': 'text-green-400',    // 欧标 - 绿色
            'jis': 'text-purple-400',  // 日标 - 紫色
            'iso': 'text-yellow-400',  // 国际标准 - 黄色
            'uns': 'text-cyan-400',    // UNS - 青色
            'din': 'text-orange-400',  // 德标 - 橙色
            'bs': 'text-pink-400',     // 英标 - 粉色
            'afnor': 'text-indigo-400' // 法标 - 靛蓝
        };
        
        return colors[standard.toLowerCase()] || 'text-gray-500';
    },

    // 高亮匹配文本
    highlightMatch(text) {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || !searchInput.value) return text;
        
        const query = searchInput.value.trim();
        if (!query) return text;
        
        // 转义特殊字符
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.replace(regex, '<mark class="bg-blue-500/40 text-blue-100 px-1 py-0.5 rounded font-semibold">$1</mark>');
    },

    // 获取建议类型
    getSuggestionType(suggestion) {
        // 检查是否是数据库中的实际牌号
        if (typeof window.DB !== 'undefined') {
            let isGradeName = false;
            let isUNS = false;
            let isType = false;
            let isGlobalGrade = false;
            
            Object.keys(window.DB).forEach(standard => {
                if (window.DB[standard] && Array.isArray(window.DB[standard])) {
                    window.DB[standard].forEach(item => {
                        if (item.name === suggestion) isGradeName = true;
                        if (item.UNS === suggestion) isUNS = true;
                        if (item.type === suggestion) isType = true;
                        if (item.global && Object.values(item.global).includes(suggestion)) isGlobalGrade = true;
                    });
                }
            });
            
            if (isGradeName) return '牌号';
            if (isUNS) return 'UNS';
            if (isType) return '类型';
            if (isGlobalGrade) return '等效';
        }
        
        // 原有的关键词匹配
        if (this.searchKeywords.materials.includes(suggestion)) return '牌号';
        if (this.searchKeywords.properties.includes(suggestion)) return '类型';
        if (this.searchKeywords.elements.includes(suggestion)) return '元素';
        if (this.searchKeywords.standards.includes(suggestion)) return '标准';
        if (this.searchKeywords.applications.includes(suggestion)) return '应用';
        if (this.searchHistory.includes(suggestion)) return '历史';
        
        // 智能判断
        if (/^S\d+/.test(suggestion)) return 'UNS';
        if (/^\d+L?$/.test(suggestion)) return '牌号';
        if (/^[A-Z]{2,}/.test(suggestion)) return '标准';
        if (/[\u4e00-\u9fa5]/.test(suggestion)) return '中文';
        
        return '建议';
    },

    // 选择建议
    selectSuggestion(suggestion) {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = suggestion;
            // 只设置值，不自动执行搜索
        }
        this.hideSuggestions();
    },

    // 显示建议
    showSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.remove('hidden');
        }
    },

    // 隐藏建议
    hideSuggestions() {
        const container = document.getElementById('search-suggestions');
        if (container) {
            container.classList.add('hidden');
        }
        this.currentSearchIndex = -1;
    },

    // 导航建议
    navigateSuggestions(direction) {
        if (this.searchSuggestions.length === 0) return;

        if (direction === 'down') {
            this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchSuggestions.length;
        } else if (direction === 'up') {
            this.currentSearchIndex = this.currentSearchIndex <= 0 
                ? this.searchSuggestions.length - 1 
                : this.currentSearchIndex - 1;
        }

        this.updateSuggestionHighlight();
    },

    // 更新建议高亮
    updateSuggestionHighlight() {
        const container = document.getElementById('search-suggestions');
        if (!container) return;

        const items = container.querySelectorAll('.suggestion-item');
        items.forEach((item, index) => {
            if (index === this.currentSearchIndex) {
                item.classList.add('bg-blue-600/20', 'border-blue-500/30');
                item.classList.remove('bg-gray-700');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('bg-blue-600/20', 'border-blue-500/30', 'bg-gray-700');
            }
        });
    },

    // 处理搜索提交
    handleSearchSubmit(query) {
        if (query.trim()) {
            this.addToHistory(query.trim());
            this.hideSuggestions();
            
            // 触发实际搜索
            if (window.Core && window.Core.globalSearch) {
                window.Core.globalSearch(query);
            }
        }
    },

    // 添加到搜索历史
    addToHistory(query) {
        // 移除重复项
        this.searchHistory = this.searchHistory.filter(item => item !== query);
        
        // 添加到开头
        this.searchHistory.unshift(query);
        
        // 限制历史记录数量
        if (this.searchHistory.length > this.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryItems);
        }
        
        // 保存到本地存储
        localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
    },

    // 显示搜索历史
    showSearchHistory() {
        if (this.searchHistory.length === 0) {
            this.showToast('暂无搜索历史', 'info');
            return;
        }

        const container = document.getElementById('search-suggestions');
        if (!container) return;

        container.innerHTML = `
            <div class="px-4 py-2 bg-gray-700 text-gray-300 text-sm font-medium border-b border-gray-600">
                搜索历史
                <button class="float-right text-red-400 hover:text-red-300" onclick="SearchEnhancement.clearHistory()">清空</button>
            </div>
            ${this.searchHistory.map(item => `
                <div class="suggestion-item px-4 py-2 hover:bg-gray-700 cursor-pointer flex items-center justify-between" data-suggestion="${item}">
                    <span class="text-gray-300">${item}</span>
                    <span class="text-xs text-gray-500">🕒</span>
                </div>
            `).join('')}
        `;

        // 绑定点击事件
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.suggestion);
            });
        });

        this.showSuggestions();
    },

    // 清空搜索历史
    clearHistory() {
        this.searchHistory = [];
        localStorage.removeItem('searchHistory');
        this.hideSuggestions();
        this.showToast('搜索历史已清空', 'success');
    },

    // 设置键盘导航
    setupKeyboardNavigation() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('keydown', (e) => {
            const container = document.getElementById('search-suggestions');
            if (!container || container.classList.contains('hidden')) return;

            const items = container.querySelectorAll('.suggestion-item');
            if (items.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.currentSearchIndex = Math.min(this.currentSearchIndex + 1, items.length - 1);
                    this.updateSelectedSuggestion(items);
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.currentSearchIndex = Math.max(this.currentSearchIndex - 1, -1);
                    this.updateSelectedSuggestion(items);
                    break;

                case 'Enter':
                    if (this.currentSearchIndex >= 0) {
                        e.preventDefault();
                        const selectedItem = items[this.currentSearchIndex];
                        this.selectSuggestion(selectedItem.dataset.suggestion);
                    }
                    break;

                case 'Escape':
                    this.hideSuggestions();
                    break;
            }
        });
    },

    // 更新选中的建议
    updateSelectedSuggestion(items) {
        items.forEach((item, index) => {
            if (index === this.currentSearchIndex) {
                item.classList.add('bg-blue-600/20', 'border-blue-500/30');
                item.classList.remove('bg-gray-700');
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else {
                item.classList.remove('bg-blue-600/20', 'border-blue-500/30', 'bg-gray-700');
            }
        });
    },



    // 加载搜索建议
    loadSearchSuggestions() {
        // 可以从服务器加载更多建议数据
        console.log('搜索建议加载完成');
    },

    // 显示提示消息
    showToast(message, type = 'info') {
        if (window.Utils && window.Utils.showToast) {
            window.Utils.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SearchEnhancement;
} else {
    window.SearchEnhancement = SearchEnhancement;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchEnhancement.init());
} else {
    SearchEnhancement.init();
}