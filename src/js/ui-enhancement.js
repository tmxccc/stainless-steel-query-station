// UI增强模块 - 提供高级界面功能
const UIEnhancement = {
    // 配置
    config: {
        animationDuration: 300,
        chartColors: {
            primary: '#3B82F6',
            secondary: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            info: '#6366F1',
            success: '#059669'
        },
        themes: {
            light: {
                background: '#FFFFFF',
                surface: '#F8FAFC',
                text: '#1F2937',
                border: '#E5E7EB'
            },
            dark: {
                background: '#1F2937',
                surface: '#374151',
                text: '#F9FAFB',
                border: '#4B5563'
            }
        }
    },
    
    // 当前主题
    currentTheme: 'light',
    
    // 智能分析面板
    analysisPanel: {
        // 创建分析面板
        create() {
            const panel = document.createElement('div');
            panel.id = 'intelligent-analysis-panel';
            panel.className = 'fixed right-4 top-20 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 transform translate-x-full transition-transform duration-300';
            panel.style.maxHeight = 'calc(100vh - 100px)';
            panel.style.overflowY = 'auto';
            
            panel.innerHTML = `
                <div class="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        智能分析
                    </h3>
                    <button id="close-analysis-panel" class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="p-4">
                    <div class="space-y-4">
                        <!-- 分析类型选择 -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">分析类型</label>
                            <select id="analysis-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="similarity">相似性分析</option>
                                <option value="performance">性能预测</option>
                                <option value="validation">数据验证</option>
                                <option value="recommendation">智能推荐</option>
                                <option value="trends">趋势分析</option>
                            </select>
                        </div>
                        
                        <!-- 材料选择 -->
                        <div id="material-selection">
                            <label class="block text-sm font-medium text-gray-700 mb-2">选择材料</label>
                            <div class="relative">
                                <input type="text" id="material-search" placeholder="搜索材料..." 
                                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <div id="material-suggestions" class="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto hidden z-10"></div>
                            </div>
                        </div>
                        
                        <!-- 应用场景选择（推荐分析时显示） -->
                        <div id="application-selection" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-2">应用场景</label>
                            <select id="application-type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">请选择应用场景</option>
                                <option value="食品加工">食品加工</option>
                                <option value="化工设备">化工设备</option>
                                <option value="海洋环境">海洋环境</option>
                                <option value="高温应用">高温应用</option>
                                <option value="装饰用途">装饰用途</option>
                                <option value="医疗器械">医疗器械</option>
                                <option value="汽车部件">汽车部件</option>
                                <option value="建筑结构">建筑结构</option>
                                <option value="石油化工">石油化工</option>
                                <option value="核工业">核工业</option>
                                <option value="航空航天">航空航天</option>
                                <option value="制药工业">制药工业</option>
                            </select>
                        </div>
                        
                        <!-- 分析按钮 -->
                        <button id="start-analysis" class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center">
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                            </svg>
                            开始分析
                        </button>
                        
                        <!-- 分析结果 -->
                        <div id="analysis-results" class="hidden">
                            <div class="border-t border-gray-200 pt-4">
                                <h4 class="text-md font-medium text-gray-800 mb-3">分析结果</h4>
                                <div id="analysis-content"></div>
                            </div>
                        </div>
                        
                        <!-- 加载状态 -->
                        <div id="analysis-loading" class="hidden text-center py-4">
                            <div class="inline-flex items-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span class="text-gray-600">分析中...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(panel);
            this.bindEvents();
            return panel;
        },
        
        // 绑定事件
        bindEvents() {
            const panel = document.getElementById('intelligent-analysis-panel');
            const closeBtn = document.getElementById('close-analysis-panel');
            const analysisType = document.getElementById('analysis-type');
            const materialSearch = document.getElementById('material-search');
            const startBtn = document.getElementById('start-analysis');
            
            // 关闭面板
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
            
            // 分析类型变化
            analysisType.addEventListener('change', (e) => {
                this.handleAnalysisTypeChange(e.target.value);
            });
            
            // 材料搜索
            materialSearch.addEventListener('input', (e) => {
                this.handleMaterialSearch(e.target.value);
            });
            
            // 开始分析
            startBtn.addEventListener('click', () => {
                this.performAnalysis();
            });
            
            // 点击外部关闭
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !e.target.closest('#analysis-trigger')) {
                    this.hide();
                }
            });
        },
        
        // 显示面板
        show() {
            const panel = document.getElementById('intelligent-analysis-panel') || this.create();
            panel.classList.remove('translate-x-full');
            panel.classList.add('translate-x-0');
        },
        
        // 隐藏面板
        hide() {
            const panel = document.getElementById('intelligent-analysis-panel');
            if (panel) {
                panel.classList.remove('translate-x-0');
                panel.classList.add('translate-x-full');
            }
        },
        
        // 处理分析类型变化
        handleAnalysisTypeChange(type) {
            const applicationSelection = document.getElementById('application-selection');
            const materialSelection = document.getElementById('material-selection');
            
            if (type === 'recommendation') {
                applicationSelection.classList.remove('hidden');
                materialSelection.classList.add('hidden');
            } else if (type === 'trends') {
                applicationSelection.classList.add('hidden');
                materialSelection.classList.add('hidden');
            } else {
                applicationSelection.classList.add('hidden');
                materialSelection.classList.remove('hidden');
            }
        },
        
        // 处理材料搜索
        handleMaterialSearch(query) {
            if (!query || query.length < 2) {
                document.getElementById('material-suggestions').classList.add('hidden');
                return;
            }
            
            if (!window.AppState || !window.AppState.allData) {
                return;
            }
            
            const suggestions = window.AppState.allData
                .filter(item => 
                    item.name.toLowerCase().includes(query.toLowerCase()) ||
                    (item.USN && item.USN.toLowerCase().includes(query.toLowerCase()))
                )
                .slice(0, 10);
            
            this.showMaterialSuggestions(suggestions);
        },
        
        // 显示材料建议
        showMaterialSuggestions(suggestions) {
            const container = document.getElementById('material-suggestions');
            
            if (suggestions.length === 0) {
                container.classList.add('hidden');
                return;
            }
            
            container.innerHTML = suggestions.map(item => `
                <div class="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                     data-material='${JSON.stringify(item)}'>
                    <div class="font-medium text-gray-800">${item.name || item.USN}</div>
                    <div class="text-sm text-gray-500">${item.USN || ''}</div>
                </div>
            `).join('');
            
            container.classList.remove('hidden');
            
            // 绑定点击事件
            container.querySelectorAll('[data-material]').forEach(item => {
                item.addEventListener('click', (e) => {
                    const material = JSON.parse(e.currentTarget.dataset.material);
                    document.getElementById('material-search').value = material.name || material.USN;
                    container.classList.add('hidden');
                    this.selectedMaterial = material;
                });
            });
        },
        
        // 执行分析
        async performAnalysis() {
            const analysisType = document.getElementById('analysis-type').value;
            const loadingEl = document.getElementById('analysis-loading');
            const resultsEl = document.getElementById('analysis-results');
            const contentEl = document.getElementById('analysis-content');
            
            // 显示加载状态
            loadingEl.classList.remove('hidden');
            resultsEl.classList.add('hidden');
            
            try {
                let results;
                
                switch (analysisType) {
                    case 'similarity':
                        if (!this.selectedMaterial) {
                            throw new Error('请选择要分析的材料');
                        }
                        results = await this.performSimilarityAnalysis();
                        break;
                        
                    case 'performance':
                        if (!this.selectedMaterial) {
                            throw new Error('请选择要分析的材料');
                        }
                        results = await this.performPerformanceAnalysis();
                        break;
                        
                    case 'validation':
                        if (!this.selectedMaterial) {
                            throw new Error('请选择要分析的材料');
                        }
                        results = await this.performValidationAnalysis();
                        break;
                        
                    case 'recommendation':
                        const application = document.getElementById('application-type').value;
                        if (!application) {
                            throw new Error('请选择应用场景');
                        }
                        results = await this.performRecommendationAnalysis(application);
                        break;
                        
                    case 'trends':
                        results = await this.performTrendAnalysis();
                        break;
                        
                    default:
                        throw new Error('未知的分析类型');
                }
                
                // 显示结果
                contentEl.innerHTML = this.renderAnalysisResults(analysisType, results);
                resultsEl.classList.remove('hidden');
                
            } catch (error) {
                contentEl.innerHTML = `
                    <div class="bg-red-50 border border-red-200 rounded-md p-3">
                        <div class="flex">
                            <svg class="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <div class="text-sm text-red-700">${error.message}</div>
                        </div>
                    </div>
                `;
                resultsEl.classList.remove('hidden');
            } finally {
                loadingEl.classList.add('hidden');
            }
        },
        
        // 执行相似性分析
        async performSimilarityAnalysis() {
            if (!window.IntelligentAnalysis) {
                throw new Error('智能分析模块未加载');
            }
            
            return window.IntelligentAnalysis.similarityAnalysis.findSimilarMaterials(this.selectedMaterial);
        },
        
        // 执行性能分析
        async performPerformanceAnalysis() {
            if (!window.IntelligentAnalysis) {
                throw new Error('智能分析模块未加载');
            }
            
            const corrosion = window.IntelligentAnalysis.performancePrediction.predictCorrosionResistance(this.selectedMaterial);
            const mechanical = window.IntelligentAnalysis.performancePrediction.predictMechanicalProperties(this.selectedMaterial);
            
            return { corrosion, mechanical };
        },
        
        // 执行验证分析
        async performValidationAnalysis() {
            if (!window.IntelligentAnalysis) {
                throw new Error('智能分析模块未加载');
            }
            
            return window.IntelligentAnalysis.dataValidation.validateComposition(this.selectedMaterial);
        },
        
        // 执行推荐分析
        async performRecommendationAnalysis(application) {
            if (!window.IntelligentAnalysis) {
                throw new Error('智能分析模块未加载');
            }
            
            return window.IntelligentAnalysis.smartRecommendation.recommendByApplication(application);
        },
        
        // 执行趋势分析
        async performTrendAnalysis() {
            if (!window.IntelligentAnalysis) {
                throw new Error('智能分析模块未加载');
            }
            
            return window.IntelligentAnalysis.trendAnalysis.analyzeSearchTrends();
        },
        
        // 渲染分析结果
        renderAnalysisResults(type, results) {
            switch (type) {
                case 'similarity':
                    return this.renderSimilarityResults(results);
                case 'performance':
                    return this.renderPerformanceResults(results);
                case 'validation':
                    return this.renderValidationResults(results);
                case 'recommendation':
                    return this.renderRecommendationResults(results);
                case 'trends':
                    return this.renderTrendResults(results);
                default:
                    return '<div class="text-gray-500">暂无结果</div>';
            }
        },
        
        // 渲染相似性结果
        renderSimilarityResults(results) {
            if (!results || results.length === 0) {
                return '<div class="text-gray-500">未找到相似材料</div>';
            }
            
            return `
                <div class="space-y-3">
                    ${results.slice(0, 5).map(item => `
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-medium text-gray-800">${item.material.name || item.material.USN}</div>
                                <div class="text-sm font-medium text-blue-600">${(item.similarity * 100).toFixed(1)}%</div>
                            </div>
                            <div class="text-sm text-gray-600 mb-2">${item.material.USN || ''}</div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${item.similarity * 100}%"></div>
                            </div>
                            ${item.matchingElements.length > 0 ? `
                                <div class="mt-2 text-xs text-gray-500">
                                    匹配元素: ${item.matchingElements.slice(0, 3).map(el => el.chineseName).join(', ')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        },
        
        // 渲染性能结果
        renderPerformanceResults(results) {
            const { corrosion, mechanical } = results;
            
            return `
                <div class="space-y-4">
                    <!-- 耐腐蚀性能 -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h5 class="font-medium text-gray-800 mb-2">耐腐蚀性能</h5>
                        <div class="flex items-center mb-2">
                            <span class="text-2xl font-bold" style="color: ${corrosion.level.color}">${corrosion.score}</span>
                            <span class="text-sm text-gray-500 ml-2">/ 100</span>
                            <span class="ml-auto px-2 py-1 rounded text-xs font-medium" 
                                  style="background-color: ${corrosion.level.color}20; color: ${corrosion.level.color}">
                                ${corrosion.level.level}
                            </span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div class="h-2 rounded-full" style="width: ${corrosion.score}%; background-color: ${corrosion.level.color}"></div>
                        </div>
                        <div class="text-xs text-gray-600">${corrosion.level.description}</div>
                    </div>
                    
                    <!-- 机械性能 -->
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h5 class="font-medium text-gray-800 mb-3">机械性能</h5>
                        <div class="space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">强度</span>
                                <span class="text-sm font-medium">${mechanical.strength.toFixed(0)}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="bg-blue-500 h-1.5 rounded-full" style="width: ${mechanical.strength}%"></div>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">硬度</span>
                                <span class="text-sm font-medium">${mechanical.hardness.toFixed(0)}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="bg-green-500 h-1.5 rounded-full" style="width: ${mechanical.hardness}%"></div>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">延展性</span>
                                <span class="text-sm font-medium">${mechanical.ductility.toFixed(0)}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="bg-yellow-500 h-1.5 rounded-full" style="width: ${mechanical.ductility}%"></div>
                            </div>
                            
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-600">韧性</span>
                                <span class="text-sm font-medium">${mechanical.toughness.toFixed(0)}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-1.5">
                                <div class="bg-purple-500 h-1.5 rounded-full" style="width: ${mechanical.toughness}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 渲染验证结果
        renderValidationResults(results) {
            const statusColor = results.isValid ? '#10B981' : '#EF4444';
            const statusText = results.isValid ? '通过' : '未通过';
            
            return `
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-gray-800">验证状态</span>
                        <span class="px-2 py-1 rounded text-sm font-medium" 
                              style="background-color: ${statusColor}20; color: ${statusColor}">
                            ${statusText}
                        </span>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <span class="font-medium text-gray-800">质量评分</span>
                        <span class="text-lg font-bold" style="color: ${statusColor}">${results.score}</span>
                    </div>
                    
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full" style="width: ${results.score}%; background-color: ${statusColor}"></div>
                    </div>
                    
                    ${results.errors.length > 0 ? `
                        <div class="bg-red-50 border border-red-200 rounded-md p-3">
                            <h6 class="font-medium text-red-800 mb-2">错误</h6>
                            <ul class="text-sm text-red-700 space-y-1">
                                ${results.errors.map(error => `<li>• ${error}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${results.warnings.length > 0 ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                            <h6 class="font-medium text-yellow-800 mb-2">警告</h6>
                            <ul class="text-sm text-yellow-700 space-y-1">
                                ${results.warnings.map(warning => `<li>• ${warning}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${results.suggestions.length > 0 ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h6 class="font-medium text-blue-800 mb-2">建议</h6>
                            <ul class="text-sm text-blue-700 space-y-1">
                                ${results.suggestions.map(suggestion => `<li>• ${suggestion}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        },
        
        // 渲染推荐结果
        renderRecommendationResults(results) {
            if (!results || results.length === 0) {
                return '<div class="text-gray-500">暂无推荐材料</div>';
            }
            
            return `
                <div class="space-y-3">
                    ${results.slice(0, 5).map(item => `
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="flex justify-between items-start mb-2">
                                <div class="font-medium text-gray-800">${item.material.name || item.material.USN}</div>
                                <div class="text-sm font-medium text-green-600">${item.suitability}%</div>
                            </div>
                            <div class="text-sm text-gray-600 mb-2">${item.reason}</div>
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: ${item.suitability}%"></div>
                            </div>
                            <div class="flex items-center justify-between text-xs">
                                <span class="px-2 py-1 rounded" style="background-color: ${item.cost.color}20; color: ${item.cost.color}">
                                    成本: ${item.cost.level}
                                </span>
                                <button class="text-blue-600 hover:text-blue-800" onclick="UIEnhancement.materialCard.show(${JSON.stringify(item.material).replace(/"/g, '&quot;')})">
                                    查看详情
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },
        
        // 渲染趋势结果
        renderTrendResults(results) {
            return `
                <div class="space-y-4">
                    <div class="bg-gray-50 rounded-lg p-3">
                        <h5 class="font-medium text-gray-800 mb-2">搜索统计</h5>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div class="text-gray-600">总搜索次数</div>
                                <div class="font-medium text-lg">${results.totalSearches}</div>
                            </div>
                            <div>
                                <div class="text-gray-600">搜索词数量</div>
                                <div class="font-medium text-lg">${results.uniqueTerms}</div>
                            </div>
                        </div>
                    </div>
                    
                    ${results.topSearches.length > 0 ? `
                        <div class="bg-gray-50 rounded-lg p-3">
                            <h5 class="font-medium text-gray-800 mb-2">热门搜索</h5>
                            <div class="space-y-2">
                                ${results.topSearches.slice(0, 5).map(item => `
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-700">${item.term}</span>
                                        <span class="text-xs text-gray-500">${item.percentage}%</span>
                                    </div>
                                    <div class="w-full bg-gray-200 rounded-full h-1">
                                        <div class="bg-blue-500 h-1 rounded-full" style="width: ${item.percentage}%"></div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${results.insights.length > 0 ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                            <h6 class="font-medium text-blue-800 mb-2">趋势洞察</h6>
                            <ul class="text-sm text-blue-700 space-y-1">
                                ${results.insights.map(insight => `<li>• ${insight}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    },
    
    // 材料详情卡片
    materialCard: {
        // 显示材料详情
        show(material) {
            const existing = document.getElementById('material-detail-card');
            if (existing) {
                existing.remove();
            }
            
            const card = document.createElement('div');
            card.id = 'material-detail-card';
            card.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
            
            card.innerHTML = `
                <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-full overflow-y-auto">
                    <div class="p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 class="text-xl font-semibold text-gray-800">${material.name || material.USN} 详细信息</h3>
                        <button id="close-material-card" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        ${this.renderMaterialDetails(material)}
                    </div>
                </div>
            `;
            
            document.body.appendChild(card);
            
            // 绑定关闭事件
            card.querySelector('#close-material-card').addEventListener('click', () => {
                card.remove();
            });
            
            card.addEventListener('click', (e) => {
                if (e.target === card) {
                    card.remove();
                }
            });
        },
        
        // 渲染材料详情
        renderMaterialDetails(material) {
            const composition = window.IntelligentAnalysis ? 
                window.IntelligentAnalysis.similarityAnalysis.normalizeComposition(material) : {};
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- 基本信息 -->
                    <div class="space-y-4">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-medium text-gray-800 mb-3">基本信息</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">材料牌号</span>
                                    <span class="font-medium">${material.name || material.USN || '-'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">UNS编号</span>
                                    <span class="font-medium">${material.USN || '-'}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">材料类型</span>
                                    <span class="font-medium">${material.type || '-'}</span>
                                </div>
                                ${material.global ? `
                                    <div class="pt-2 border-t border-gray-200">
                                        <div class="text-gray-600 mb-2">国际标准对照</div>
                                        ${Object.entries(material.global).map(([std, value]) => `
                                            <div class="flex justify-between">
                                                <span class="text-gray-500">${std.toUpperCase()}</span>
                                                <span class="font-medium">${value}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        
                        <!-- 化学成分 -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-medium text-gray-800 mb-3">化学成分 (%)</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                ${Object.entries(composition).filter(([, value]) => value > 0).map(([element, value]) => `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">${element}</span>
                                        <span class="font-medium">${value.toFixed(2)}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <!-- 性能分析 -->
                    <div class="space-y-4">
                        ${this.renderPerformanceChart(material)}
                        ${this.renderApplications(material)}
                    </div>
                </div>
            `;
        },
        
        // 渲染性能图表
        renderPerformanceChart(material) {
            if (!window.IntelligentAnalysis) {
                return '<div class="text-gray-500">性能分析不可用</div>';
            }
            
            const corrosion = window.IntelligentAnalysis.performancePrediction.predictCorrosionResistance(material);
            const mechanical = window.IntelligentAnalysis.performancePrediction.predictMechanicalProperties(material);
            
            return `
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-3">性能评估</h4>
                    <div class="space-y-3">
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm text-gray-600">耐腐蚀性</span>
                                <span class="text-sm font-medium">${corrosion.score}/100</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="h-2 rounded-full" style="width: ${corrosion.score}%; background-color: ${corrosion.level.color}"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm text-gray-600">强度</span>
                                <span class="text-sm font-medium">${mechanical.strength.toFixed(0)}/100</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-blue-500 h-2 rounded-full" style="width: ${mechanical.strength}%"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm text-gray-600">延展性</span>
                                <span class="text-sm font-medium">${mechanical.ductility.toFixed(0)}/100</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-green-500 h-2 rounded-full" style="width: ${mechanical.ductility}%"></div>
                            </div>
                        </div>
                        
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm text-gray-600">韧性</span>
                                <span class="text-sm font-medium">${mechanical.toughness.toFixed(0)}/100</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="bg-purple-500 h-2 rounded-full" style="width: ${mechanical.toughness}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        // 渲染应用场景
        renderApplications(material) {
            if (!window.IntelligentAnalysis) {
                return '';
            }
            
            const corrosion = window.IntelligentAnalysis.performancePrediction.predictCorrosionResistance(material);
            
            return `
                <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-medium text-gray-800 mb-3">适用场景</h4>
                    <div class="space-y-2">
                        ${corrosion.applications.map(app => `
                            <div class="flex items-center">
                                <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span class="text-sm text-gray-700">${app}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${corrosion.recommendations.length > 0 ? `
                        <div class="mt-4 pt-3 border-t border-gray-200">
                            <h5 class="text-sm font-medium text-gray-800 mb-2">使用建议</h5>
                            <ul class="text-xs text-gray-600 space-y-1">
                                ${corrosion.recommendations.map(rec => `<li>• ${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            `;
        }
    },
    
    // 主题管理
    themeManager: {
        // 切换主题
        toggle() {
            this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.apply(this.currentTheme);
            localStorage.setItem('ui-theme', this.currentTheme);
        },
        
        // 应用主题
        apply(theme) {
            const root = document.documentElement;
            const colors = UIEnhancement.config.themes[theme];
            
            Object.entries(colors).forEach(([key, value]) => {
                root.style.setProperty(`--theme-${key}`, value);
            });
            
            document.body.classList.toggle('dark-theme', theme === 'dark');
        },
        
        // 初始化主题
        init() {
            const savedTheme = localStorage.getItem('ui-theme') || 'light';
            this.currentTheme = savedTheme;
            this.apply(savedTheme);
        }
    },
    
    // 初始化
    init() {
        console.log('🎨 UI增强模块初始化...');
        
        this.themeManager.init();
        this.setupGlobalTriggers();
        this.enhanceExistingUI();
        
        console.log('✅ UI增强模块初始化完成');
    },
    
    // 设置全局触发器
    setupGlobalTriggers() {
        // 添加智能分析触发按钮
        const existingBtn = document.getElementById('analysis-trigger');
        if (!existingBtn) {
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'analysis-trigger';
            triggerBtn.className = 'fixed right-4 bottom-20 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors z-40';
            triggerBtn.innerHTML = `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
            `;
            triggerBtn.title = '智能分析';
            
            triggerBtn.addEventListener('click', () => {
                this.analysisPanel.show();
            });
            
            document.body.appendChild(triggerBtn);
        }
        
        // 添加主题切换按钮
        const themeBtn = document.createElement('button');
        themeBtn.className = 'fixed right-4 bottom-36 bg-gray-500 text-white p-3 rounded-full shadow-lg hover:bg-gray-600 transition-colors z-40';
        themeBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
            </svg>
        `;
        themeBtn.title = '切换主题';
        
        themeBtn.addEventListener('click', () => {
            this.themeManager.toggle();
        });
        
        document.body.appendChild(themeBtn);
    },
    
    // 增强现有UI
    enhanceExistingUI() {
        // 增强搜索结果显示
        this.enhanceSearchResults();
        
        // 增强比较表格
        this.enhanceComparisonTable();
        
        // 添加快捷操作
        this.addQuickActions();
    },
    
    // 增强搜索结果
    enhanceSearchResults() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const searchResults = document.querySelector('#search-results, .search-results');
                    if (searchResults && !searchResults.classList.contains('enhanced')) {
                        this.addSearchResultEnhancements(searchResults);
                        searchResults.classList.add('enhanced');
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    // 添加搜索结果增强
    addSearchResultEnhancements(container) {
        const items = container.querySelectorAll('.search-item, .result-item, tr');
        
        items.forEach(item => {
            if (!item.classList.contains('enhanced')) {
                // 添加悬停效果
                item.addEventListener('mouseenter', () => {
                    item.style.transform = 'translateY(-2px)';
                    item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    item.style.transition = 'all 0.2s ease';
                });
                
                item.addEventListener('mouseleave', () => {
                    item.style.transform = 'translateY(0)';
                    item.style.boxShadow = 'none';
                });
                
                // 添加快速操作按钮
                const actionBtn = document.createElement('button');
                actionBtn.className = 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-500 text-white p-1 rounded text-xs';
                actionBtn.innerHTML = '详情';
                actionBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // 获取材料数据并显示详情
                    const materialData = this.extractMaterialData(item);
                    if (materialData) {
                        this.materialCard.show(materialData);
                    }
                });
                
                item.style.position = 'relative';
                item.classList.add('group');
                item.appendChild(actionBtn);
                item.classList.add('enhanced');
            }
        });
    },
    
    // 提取材料数据
    extractMaterialData(element) {
        // 尝试从元素中提取材料数据
        const data = {};
        
        // 查找材料名称
        const nameEl = element.querySelector('.material-name, .name, td:first-child');
        if (nameEl) {
            data.name = nameEl.textContent.trim();
        }
        
        // 查找UNS编号
        const unsEl = element.querySelector('.uns, .UNS');
        if (unsEl) {
            data.USN = unsEl.textContent.trim();
        }
        
        // 查找化学成分
        const compositionEls = element.querySelectorAll('[data-element]');
        compositionEls.forEach(el => {
            const element = el.dataset.element;
            const value = el.textContent.trim();
            if (element && value && value !== '-') {
                data[element] = value;
            }
        });
        
        return Object.keys(data).length > 0 ? data : null;
    },
    
    // 增强比较表格
    enhanceComparisonTable() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const comparisonTable = document.querySelector('#comparison-table, .comparison-table');
                    if (comparisonTable && !comparisonTable.classList.contains('enhanced')) {
                        this.addComparisonEnhancements(comparisonTable);
                        comparisonTable.classList.add('enhanced');
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    // 添加比较增强
    addComparisonEnhancements(table) {
        // 添加高亮差异功能
        const highlightBtn = document.createElement('button');
        highlightBtn.className = 'mb-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors';
        highlightBtn.textContent = '高亮差异';
        highlightBtn.addEventListener('click', () => {
            this.highlightDifferences(table);
        });
        
        table.parentNode.insertBefore(highlightBtn, table);
    },
    
    // 高亮差异
    highlightDifferences(table) {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 1) {
                const values = Array.from(cells).slice(1).map(cell => cell.textContent.trim());
                const hasVariation = values.some(val => val !== values[0]);
                
                if (hasVariation) {
                    cells.forEach(cell => {
                        cell.style.backgroundColor = '#FEF3C7';
                        cell.style.borderLeft = '3px solid #F59E0B';
                    });
                }
            }
        });
    },
    
    // 添加快捷操作
    addQuickActions() {
        // 添加快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'k':
                        e.preventDefault();
                        document.querySelector('#search-input, .search-input')?.focus();
                        break;
                    case 'a':
                        e.preventDefault();
                        this.analysisPanel.show();
                        break;
                    case 't':
                        e.preventDefault();
                        this.themeManager.toggle();
                        break;
                }
            }
        });
        
        // 添加快捷键提示
        const helpBtn = document.createElement('button');
        helpBtn.className = 'fixed left-4 bottom-4 bg-gray-500 text-white p-2 rounded-full shadow-lg hover:bg-gray-600 transition-colors z-40';
        helpBtn.innerHTML = `
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
        `;
        helpBtn.title = '快捷键帮助 (Ctrl+K: 搜索, Ctrl+A: 分析, Ctrl+T: 主题)';
        
        document.body.appendChild(helpBtn);
    }
};

// 自动初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            UIEnhancement.init();
        });
    } else {
        UIEnhancement.init();
    }
    
    // 导出到全局
    window.UIEnhancement = UIEnhancement;
}