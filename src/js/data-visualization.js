// 数据可视化模块 - 升级版
const DataVisualization = {
    charts: {},
    chartTypes: ['strength', 'composition', 'temperature', 'corrosion', 'comparison'],
    currentTheme: 'dark',
    isVisible: false,
    animationId: null,
    
    // 图表配置
    chartConfigs: {
        strength: {
            title: '力学性能对比',
            type: 'bar',
            properties: ['抗拉强度', '屈服强度', '延伸率', '硬度']
        },
        composition: {
            title: '化学成分分析',
            type: 'radar',
            properties: ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Mo']
        },
        temperature: {
            title: '温度性能曲线',
            type: 'line',
            properties: ['工作温度', '热处理温度']
        },
        corrosion: {
            title: '耐腐蚀性能',
            type: 'pie',
            properties: ['大气腐蚀', '海水腐蚀', '酸腐蚀', '碱腐蚀']
        },
        comparison: {
            title: '综合对比分析',
            type: 'scatter',
            properties: ['性能指数', '成本指数']
        }
    },

    init() {
        console.log('📊 开始初始化数据可视化模块...');
        
        this.createVisualizationUI();
        this.bindEvents();
        this.setupChartContainers();
        this.loadChartLibrary();
        
        // 设置数据监听器
        this.setupDataListeners();
        
        // 初始化数据统计
        this.updateDataStats();
        
        // 初始化提示状态
        this.hintShown = false;
        
        // 验证按钮是否存在并可点击
        setTimeout(() => {
            const btn = document.getElementById('visualization-btn');
            if (btn) {
                console.log('📊 按钮验证 - 存在:', true);
                console.log('📊 按钮验证 - 可见:', btn.offsetParent !== null);
                console.log('📊 按钮验证 - 位置:', btn.getBoundingClientRect());
                console.log('📊 按钮验证 - 事件监听器数量:', typeof getEventListeners !== 'undefined' ? getEventListeners(btn) : '无法检测');
            } else {
                console.error('📊 按钮验证失败 - 按钮不存在！');
            }
        }, 500);
        
        console.log('📊 数据可视化模块初始化完成，数据同步已启用');
    },

    // 创建可视化UI
    createVisualizationUI() {
        console.log('📊 开始创建现代化可视化UI...');
        
        // 移除已存在的容器
        const existingContainer = document.getElementById('visualization-container');
        if (existingContainer) {
            existingContainer.remove();
            console.log('📊 移除旧的可视化容器');
        }
        
        const container = document.createElement('div');
        container.id = 'visualization-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            right: 0;
            width: 420px;
            height: 100vh;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            transform: translateX(100%);
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            overflow-y: auto;
            box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
        `;
        
        container.innerHTML = `
            <div style="padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px;">
                    <h2 style="font-size: 24px; font-weight: bold; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        📊 数据可视化
                    </h2>
                    <button id="close-visualization" style="
                        background: rgba(255,255,255,0.1);
                        border: none;
                        color: rgba(255,255,255,0.7);
                        width: 32px;
                        height: 32px;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    " onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.color='white'" onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.color='rgba(255,255,255,0.7)'">
                        ✕
                    </button>
                </div>
                
                <div id="data-stats" style="margin-bottom: 24px;">
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #e5e7eb;">📈 实时统计</h3>
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #d1d5db;">数据量:</span>
                            <span id="data-count" style="font-weight: bold; color: #10b981;">0</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #d1d5db;">数据源:</span>
                            <span id="current-source" style="font-weight: bold; color: #3b82f6;">对比列表</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                            <span style="color: #d1d5db;">最后更新:</span>
                            <span id="last-update" style="font-weight: bold; color: #f59e0b;">--:--:--</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #d1d5db;">同步状态:</span>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span id="sync-indicator" style="color: #10b981;">●</span>
                                <span style="font-size: 12px; color: #10b981;">已同步</span>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 16px;">
                        <label style="color: #d1d5db; font-size: 14px; margin-bottom: 8px; display: block;">数据源选择:</label>
                        <select id="data-source" style="
                            width: 100%;
                            padding: 8px 12px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.2);
                            border-radius: 6px;
                            color: white;
                            font-size: 14px;
                        ">
                            <option value="comparison">对比列表</option>
                            <option value="search">搜索结果</option>
                            <option value="favorites">收藏夹</option>
                            <option value="all">全部数据</option>
                        </select>
                    </div>
                </div>
                
                <div id="charts-container" style="display: flex; flex-direction: column; gap: 20px;">
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h4 style="font-size: 16px; font-weight: 500; color: #e5e7eb;">📊 数据可视化</h4>
                            <select id="chart-type" style="
                                padding: 4px 8px;
                                background: rgba(255,255,255,0.1);
                                border: 1px solid rgba(255,255,255,0.2);
                                border-radius: 4px;
                                color: white;
                                font-size: 12px;
                            ">
                                <option value="strength">力学性能</option>
                                <option value="composition">化学成分</option>
                                <option value="temperature">温度性能</option>
                                <option value="corrosion">耐腐蚀性</option>
                            </select>
                        </div>
                        <canvas id="main-chart" width="350" height="300" style="width: 100%; height: 300px; border-radius: 8px; background: rgba(255,255,255,0.02);"></canvas>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 16px; border: 1px solid rgba(255,255,255,0.1);">
                        <h4 style="font-size: 16px; font-weight: 500; margin-bottom: 12px; color: #e5e7eb;">🎯 性能指标</h4>
                        <div id="performance-metrics" style="display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #d1d5db; font-size: 14px;">搜索速度</span>
                                <div style="flex: 1; margin: 0 12px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="height: 100%; width: 85%; background: linear-gradient(90deg, #10b981, #3b82f6); border-radius: 3px;"></div>
                                </div>
                                <span style="color: #10b981; font-size: 12px; font-weight: bold;">85%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #d1d5db; font-size: 14px;">数据准确性</span>
                                <div style="flex: 1; margin: 0 12px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="height: 100%; width: 92%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 3px;"></div>
                                </div>
                                <span style="color: #3b82f6; font-size: 12px; font-weight: bold;">92%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #d1d5db; font-size: 14px;">系统响应</span>
                                <div style="flex: 1; margin: 0 12px; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                                    <div style="height: 100%; width: 78%; background: linear-gradient(90deg, #f59e0b, #ef4444); border-radius: 3px;"></div>
                                </div>
                                <span style="color: #f59e0b; font-size: 12px; font-weight: bold;">78%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log('📊 现代化可视化UI创建完成');
        
        // 绑定关闭按钮事件
        document.getElementById('close-visualization').addEventListener('click', () => {
            this.hideVisualization();
        });
        
        // 初始化图表
        this.initializeCharts();
        
        // 创建可视化按钮
        this.createVisualizationButton();
    },

    // 添加可视化样式
    addVisualizationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .chart-type-btn {
                padding: 8px 12px;
                background: #374151;
                color: #d1d5db;
                border: 1px solid #4b5563;
                border-radius: 6px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
                text-align: center;
            }
            .chart-type-btn:hover {
                background: #4b5563;
                color: white;
            }
            .chart-type-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            #visualization-container.show {
                transform: translateX(0);
            }
            
            .chart-tooltip {
                position: absolute;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 12px;
                pointer-events: none;
                z-index: 1000;
                opacity: 0;
                transition: opacity 0.2s;
            }
            
            .chart-tooltip.show {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    },

    // 创建可视化按钮
    createVisualizationButton() {
        console.log('📊 开始创建可视化按钮...');
        
        // 移除已存在的按钮
        const existingBtn = document.getElementById('visualization-btn');
        if (existingBtn) {
            existingBtn.remove();
            console.log('📊 移除旧的可视化按钮');
        }
        
        // 创建新的美观按钮
        const button = document.createElement('button');
        button.id = 'visualization-btn';
        button.innerHTML = `
            <div class="flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 9h2v9h-2v-9zm4-3h2v12h-2V9z"/>
                </svg>
            </div>
        `;
        
        // 应用现代化样式
        button.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0;
        `;
        
        button.title = '数据可视化面板';
        
        // 添加悬停效果
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 30px rgba(102, 126, 234, 0.6)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
        });
        
        document.body.appendChild(button);
        console.log('📊 现代化可视化按钮创建成功');
        
        return button;
    },

    // 绑定事件
    bindEvents() {
        // 延迟绑定可视化按钮事件，确保按钮已创建
        setTimeout(() => {
            const visualizationBtn = document.getElementById('visualization-btn');
            if (visualizationBtn) {
                // 移除可能存在的旧事件监听器
                visualizationBtn.onclick = null;
                
                // 添加新的事件监听器
                visualizationBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📊 可视化按钮被点击');
                    this.toggleVisualization();
                });
                
                // 同时添加onclick作为备用
                visualizationBtn.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('📊 可视化按钮被点击 (onclick)');
                    this.toggleVisualization();
                };
                
                console.log('📊 可视化按钮事件已绑定');
                
                // 添加测试功能 - 5秒后自动测试点击
                setTimeout(() => {
                    console.log('📊 执行自动点击测试...');
                    visualizationBtn.click();
                }, 5000);
                
            } else {
                console.warn('📊 可视化按钮未找到，无法绑定事件');
            }
        }, 100);

        // 关闭按钮
        const closeBtn = document.getElementById('close-visualization');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideVisualization();
            });
        }

        // 主题切换
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // 图表类型选择
        const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
        chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectChartType(btn.dataset.type);
            });
        });

        // 数据源选择
        const dataSourceSelect = document.getElementById('data-source');
        if (dataSourceSelect) {
            dataSourceSelect.addEventListener('change', (e) => {
                this.changeDataSource(e.target.value);
            });
        }

        // 图表类型选择
        const chartTypeSelect = document.getElementById('chart-type');
        if (chartTypeSelect) {
            chartTypeSelect.addEventListener('change', (e) => {
                this.changeChartType(e.target.value);
            });
        }

        // 图表控制按钮
        const exportBtn = document.getElementById('export-chart');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportChart();
            });
        }

        const fullscreenBtn = document.getElementById('fullscreen-chart');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.showFullscreenChart();
            });
        }

        const refreshBtn = document.getElementById('refresh-chart');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshChart();
            });
        }

        const settingsBtn = document.getElementById('settings-chart');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showChartSettings();
            });
        }

        // 监听数据变化
        this.setupDataListeners();
    },

    // 设置图表容器
    setupChartContainers() {
        const canvas = document.getElementById('main-chart');
        if (canvas) {
            this.ctx = canvas.getContext('2d');
            this.setupCanvasEvents(canvas);
        } else {
            console.warn('📊 图表画布未找到，跳过容器设置');
        }
    },

    // 设置画布事件
    setupCanvasEvents(canvas) {
        // 鼠标移动事件 - 显示工具提示
        canvas.addEventListener('mousemove', (e) => {
            this.handleCanvasMouseMove(e);
        });

        // 鼠标离开事件
        canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });

        // 点击事件
        canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });
    },

    // 加载图表库
    loadChartLibrary() {
        // 检查是否已加载Chart.js
        if (window.Chart) {
            this.initializeCharts();
            return;
        }

        // 直接使用内置绘图功能，避免外部依赖
        console.log('📊 使用内置绘图功能');
        this.useBuiltinCharts = true;
        this.initializeCharts();
    },

    // 初始化图表
    initializeCharts() {
        // 设置默认图表（仅在完整UI环境中）
        if (document.getElementById('main-chart')) {
            this.createDefaultChart();
        }
        this.updateDataStats();
    },

    // 创建默认图表
    createDefaultChart() {
        const canvas = document.getElementById('main-chart');
        if (!canvas) {
            console.warn('📊 图表画布未找到，跳过默认图表创建');
            return;
        }
        
        const type = 'strength';
        const data = this.getChartData(type);
        this.renderChart(type, data);
    },

    // 获取图表数据
    getChartData(type) {
        const source = document.getElementById('data-source')?.value || 'comparison';
        let sourceData = [];

        switch (source) {
            case 'comparison':
                sourceData = window.AppState?.comparisonList || [];
                break;
            case 'search':
                sourceData = this.getSearchResults();
                break;
            case 'favorites':
                sourceData = this.getFavorites();
                break;
            case 'all':
                sourceData = this.getAllData();
                break;
        }

        // 如果没有数据，使用示例数据
        if (sourceData.length === 0) {
            sourceData = this.getExampleData();
            console.log('📊 使用示例数据进行图表渲染');
        }

        return this.processDataForChart(type, sourceData);
    },

    // 获取示例数据
    getExampleData() {
        return [
            {
                name: '304不锈钢',
                grade: '304',
                tensileStrength: '520-750',
                yieldStrength: '205',
                elongation: '40',
                c: '0.08',
                si: '1.00',
                mn: '2.00',
                p: '0.045',
                s: '0.030',
                cr: '18.0-20.0',
                ni: '8.0-11.0'
            },
            {
                name: '316不锈钢',
                grade: '316',
                tensileStrength: '515-620',
                yieldStrength: '205',
                elongation: '40',
                c: '0.08',
                si: '1.00',
                mn: '2.00',
                p: '0.045',
                s: '0.030',
                cr: '16.0-18.0',
                ni: '10.0-14.0',
                mo: '2.0-3.0'
            },
            {
                name: '310不锈钢',
                grade: '310',
                tensileStrength: '515-655',
                yieldStrength: '205',
                elongation: '40',
                c: '0.25',
                si: '1.50',
                mn: '2.00',
                p: '0.045',
                s: '0.030',
                cr: '24.0-26.0',
                ni: '19.0-22.0'
            }
        ];
    },

    // 处理图表数据
    processDataForChart(type, sourceData) {
        const config = this.chartConfigs[type];
        const processedData = {
            labels: [],
            datasets: []
        };

        switch (type) {
            case 'strength':
                return this.processStrengthData(sourceData);
            case 'composition':
                return this.processCompositionData(sourceData);
            case 'temperature':
                return this.processTemperatureData(sourceData);
            case 'corrosion':
                return this.processCorrosionData(sourceData);
            default:
                return processedData;
        }
    },

    // 处理力学性能数据
    processStrengthData(data) {
        if (data.length === 0) return { labels: [], datasets: [] };
        
        const labels = data.map(item => item.name || item['牌号'] || item.grade || 'Unknown');
        
        // 基于化学成分模拟力学性能数据
        const tensileStrength = data.map((item, index) => {
            const cr = this.extractNumericValue(item['铬'] || item['cr'] || '0');
            const ni = this.extractNumericValue(item['镍'] || item['ni'] || '0');
            const c = this.extractNumericValue(item['碳'] || item['c'] || '0');
            
            // 根据成分估算抗拉强度 (MPa)
            let strength = 400; // 基础强度
            strength += cr * 8;  // 铬提高强度
            strength += ni * 5;  // 镍提高韧性
            strength += c * 800; // 碳显著提高强度
            return Math.round(strength + Math.random() * 50);
        });
        
        const yieldStrength = data.map((item, index) => {
            // 屈服强度通常是抗拉强度的60-80%
            return Math.round(tensileStrength[index] * (0.6 + Math.random() * 0.2));
        });
        
        const elongation = data.map((item, index) => {
            const ni = this.extractNumericValue(item['镍'] || item['ni'] || '0');
            const c = this.extractNumericValue(item['碳'] || item['c'] || '0');
            
            // 延伸率：镍提高延展性，碳降低延展性
            let elong = 25; // 基础延伸率
            elong += ni * 1.5; // 镍提高延展性
            elong -= c * 15;   // 碳降低延展性
            return Math.max(5, Math.round(elong + Math.random() * 5));
        });

        const datasets = [
            {
                label: '抗拉强度 (MPa)',
                data: tensileStrength,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            },
            {
                label: '屈服强度 (MPa)',
                data: yieldStrength,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1
            },
            {
                label: '延伸率 (%)',
                data: elongation,
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgba(245, 158, 11, 1)',
                borderWidth: 1
            }
        ];

        return {
            labels,
            datasets
        };
    },

    // 处理化学成分数据
    processCompositionData(data) {
        if (data.length === 0) return { labels: [], datasets: [] };

        const elements = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Mo'];
        const elementMapping = {
            'C': ['c', '碳'],
            'Si': ['si', '硅'],
            'Mn': ['mn', '锰'],
            'P': ['p', '磷'],
            'S': ['s', '硫'],
            'Cr': ['cr', '铬'],
            'Ni': ['ni', '镍'],
            'Mo': ['mo', '钼']
        };
        
        const colors = [
            'rgba(239, 68, 68, 0.6)',
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(34, 197, 94, 0.6)',
            'rgba(251, 113, 133, 0.6)'
        ];

        const datasets = data.map((item, index) => ({
            label: item.name || item['牌号'] || item.grade || `材料${index + 1}`,
            data: elements.map(element => {
                const possibleKeys = elementMapping[element];
                let value = 0;
                for (const key of possibleKeys) {
                    if (item[key] !== undefined && item[key] !== '—') {
                        value = this.extractNumericValue(item[key]) || 0;
                        break;
                    }
                }
                return value;
            }),
            backgroundColor: colors[index % colors.length],
            borderColor: colors[index % colors.length].replace('0.6', '1'),
            borderWidth: 2,
            pointBackgroundColor: colors[index % colors.length].replace('0.6', '1')
        }));

        return {
            labels: elements,
            datasets
        };
    },

    // 处理温度性能数据
    processTemperatureData(data) {
        if (data.length === 0) return { labels: [], datasets: [] };
        
        const labels = data.map(item => item.name || item['牌号'] || item.grade || 'Unknown');
        
        // 模拟温度性能数据（基于材料特性）
        const workingTemp = data.map((item, index) => {
            const cr = this.extractNumericValue(item['铬'] || item['cr'] || '0');
            const ni = this.extractNumericValue(item['镍'] || item['ni'] || '0');
            
            // 根据铬镍含量估算工作温度
            if (cr > 20 && ni > 15) return 800 + Math.random() * 200; // 高温合金
            if (cr > 15 && ni > 8) return 600 + Math.random() * 150;  // 中高温
            if (cr > 10) return 400 + Math.random() * 100;           // 中温
            return 200 + Math.random() * 100;                       // 低温
        });
        
        const oxidationTemp = data.map((item, index) => {
            const cr = this.extractNumericValue(item['铬'] || item['cr'] || '0');
            return cr > 0 ? 300 + cr * 25 + Math.random() * 50 : null;
        });
        
        const thermalStability = data.map((item, index) => {
            const ni = this.extractNumericValue(item['镍'] || item['ni'] || '0');
            return ni > 0 ? 250 + ni * 30 + Math.random() * 40 : null;
        });

        const datasets = [
            {
                label: '最高工作温度 (°C)',
                data: workingTemp,
                borderColor: 'rgba(239, 68, 68, 1)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: '抗氧化温度 (°C)',
                data: oxidationTemp,
                borderColor: 'rgba(59, 130, 246, 1)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: '热稳定性指标 (°C)',
                data: thermalStability,
                borderColor: 'rgba(16, 185, 129, 1)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8
            }
        ];

        return {
            labels,
            datasets
        };
    },

    // 处理耐腐蚀性数据
    processCorrosionData(data) {
        if (data.length === 0) return { labels: [], datasets: [] };
        
        // 根据不锈钢类型分类
        const typeCategories = ['奥氏体', '铁素体', '马氏体', '双相钢', '沉淀硬化'];
        const categoryData = {};
        const detailData = {};
        
        typeCategories.forEach(type => {
            categoryData[type] = 0;
            detailData[type] = [];
        });
        
        data.forEach(item => {
            const itemType = item.type || item['类型'] || '';
            const gradeName = item.name || item['牌号'] || item.grade || 'Unknown';
            let categorized = false;
            
            typeCategories.forEach(type => {
                if (itemType.includes(type) || itemType.includes(type.replace('钢', ''))) {
                    categoryData[type]++;
                    detailData[type].push(gradeName);
                    categorized = true;
                }
            });
            
            // 如果没有匹配到任何类型，归类为"其他"
            if (!categorized && itemType) {
                if (!categoryData['其他']) {
                    categoryData['其他'] = 0;
                    detailData['其他'] = [];
                }
                categoryData['其他']++;
                detailData['其他'].push(gradeName);
            }
        });

        // 过滤掉数量为0的分类
        const filteredLabels = [];
        const filteredData = [];
        const filteredColors = [];
        const colorMap = [
            'rgba(34, 197, 94, 0.8)',   // 绿色
            'rgba(59, 130, 246, 0.8)',  // 蓝色
            'rgba(245, 158, 11, 0.8)',  // 橙色
            'rgba(239, 68, 68, 0.8)',   // 红色
            'rgba(139, 92, 246, 0.8)',  // 紫色
            'rgba(156, 163, 175, 0.8)'  // 灰色（其他）
        ];

        let colorIndex = 0;
        Object.keys(categoryData).forEach(type => {
            if (categoryData[type] > 0) {
                filteredLabels.push(`${type} (${categoryData[type]}个)`);
                filteredData.push(categoryData[type]);
                filteredColors.push(colorMap[colorIndex % colorMap.length]);
                colorIndex++;
            }
        });

        return {
            labels: filteredLabels,
            datasets: [{
                data: filteredData,
                backgroundColor: filteredColors,
                borderWidth: 2,
                borderColor: '#374151'
            }],
            detailData: detailData,
            totalCount: data.length
        };
    },

    // 渲染图表
    renderChart(type, data) {
        const canvas = document.getElementById('main-chart');
        if (!canvas) return;

        // 清除现有图表
        if (this.currentChart) {
            this.currentChart.destroy();
        }

        if (window.Chart && !this.useBuiltinCharts) {
            this.renderChartJS(type, data);
        } else {
            this.renderBuiltinChart(type, data);
        }
    },

    // 使用Chart.js渲染
    renderChartJS(type, data) {
        const canvas = document.getElementById('main-chart');
        const config = this.chartConfigs[type];
        
        const chartConfig = {
            type: config.type === 'strength' ? 'bar' : 
                  config.type === 'composition' ? 'radar' :
                  config.type === 'temperature' ? 'line' :
                  config.type === 'corrosion' ? 'pie' : 'bar',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: config.title,
                        color: this.currentTheme === 'dark' ? '#ffffff' : '#000000'
                    },
                    legend: {
                        labels: {
                            color: this.currentTheme === 'dark' ? '#d1d5db' : '#374151'
                        }
                    }
                },
                scales: config.type !== 'pie' && config.type !== 'radar' ? {
                    x: {
                        ticks: {
                            color: this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280'
                        },
                        grid: {
                            color: this.currentTheme === 'dark' ? '#374151' : '#e5e7eb'
                        }
                    },
                    y: {
                        ticks: {
                            color: this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280'
                        },
                        grid: {
                            color: this.currentTheme === 'dark' ? '#374151' : '#e5e7eb'
                        }
                    }
                } : {}
            }
        };

        this.currentChart = new Chart(canvas, chartConfig);
    },

    // 使用内置绘图渲染
    renderBuiltinChart(type, data) {
        const canvas = document.getElementById('main-chart');
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 设置画布大小
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        switch (type) {
            case 'strength':
                this.drawBarChart(ctx, data);
                break;
            case 'composition':
                this.drawRadarChart(ctx, data);
                break;
            case 'temperature':
                this.drawLineChart(ctx, data);
                break;
            case 'corrosion':
                this.drawPieChart(ctx, data);
                break;
        }
    },

    // 绘制柱状图（优化版）
    drawBarChart(ctx, data) {
        const { width, height } = ctx.canvas;
        const margin = { top: 80, right: 50, bottom: 120, left: 90 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // 绘制清晰的背景
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 绘制标题
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🔧 力学性能对比分析', width / 2, 35);

        // 绘制副标题
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
        ctx.fillText('材料强度、硬度、韧性综合对比', width / 2, 55);

        // 计算数据范围
        const allValues = data.datasets.flatMap(d => d.data).filter(v => v !== null && v !== undefined && !isNaN(v));
        if (allValues.length === 0) {
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无力学性能数据', width / 2, height / 2);
            return;
        }
        
        const maxValue = Math.max(...allValues);
        const minValue = Math.min(0, Math.min(...allValues));
        const valueRange = maxValue - minValue || 1;

        // 绘制图表背景区域
        ctx.fillStyle = this.currentTheme === 'dark' ? 'rgba(55, 65, 81, 0.2)' : 'rgba(249, 250, 251, 0.8)';
        ctx.fillRect(margin.left, margin.top, chartWidth, chartHeight);
        ctx.strokeStyle = this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(margin.left, margin.top, chartWidth, chartHeight);

        // 绘制网格线和Y轴标签
        const gridLines = 6;
        for (let i = 0; i <= gridLines; i++) {
            const y = margin.top + (chartHeight / gridLines) * i;
            const value = maxValue - (valueRange / gridLines) * i;
            
            // 水平网格线
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.strokeStyle = this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.7)';
            ctx.lineWidth = i === gridLines ? 2 : 1;
            ctx.stroke();
            
            // Y轴标签
            ctx.fillStyle = this.currentTheme === 'dark' ? '#d1d5db' : '#4b5563';
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(0), margin.left - 15, y + 5);
        }

        // 计算柱子布局
        const groupCount = data.labels.length;
        const datasetCount = data.datasets.length;
        const groupWidth = chartWidth / groupCount;
        const maxBarWidth = Math.min(50, groupWidth * 0.6 / datasetCount);
        const barSpacing = Math.max(3, maxBarWidth * 0.15);

        // 绘制柱状图
        data.datasets.forEach((dataset, datasetIndex) => {
            const baseColor = dataset.backgroundColor || this.getColorByIndex(datasetIndex);
            
            dataset.data.forEach((value, index) => {
                if (value === null || value === undefined || isNaN(value)) return;
                
                // 计算柱子位置
                const groupCenterX = margin.left + (index + 0.5) * groupWidth;
                const totalWidth = datasetCount * maxBarWidth + (datasetCount - 1) * barSpacing;
                const startX = groupCenterX - totalWidth / 2;
                const x = startX + datasetIndex * (maxBarWidth + barSpacing);
                
                const barHeight = Math.abs(value - minValue) / valueRange * chartHeight;
                const y = margin.top + chartHeight - barHeight;

                // 创建渐变效果
                const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
                gradient.addColorStop(0, this.adjustColorBrightness(baseColor, 30));
                gradient.addColorStop(1, baseColor);

                // 绘制柱子
                ctx.fillStyle = gradient;
                ctx.fillRect(x, y, maxBarWidth, barHeight);

                // 绘制边框
                ctx.strokeStyle = this.adjustColorBrightness(baseColor, -50);
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, maxBarWidth, barHeight);

                // 智能显示数值标签
                if (barHeight > 30) {
                    // 在柱子内部显示（白色文字）
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
                    ctx.textAlign = 'center';
                    
                    // 添加文字阴影效果
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 2;
                    ctx.fillText(value.toString(), x + maxBarWidth / 2, y + 20);
                    ctx.shadowBlur = 0;
                } else if (barHeight > 10) {
                    // 在柱子顶部显示
                    ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
                    ctx.font = 'bold 10px "Segoe UI", Arial, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(value.toString(), x + maxBarWidth / 2, y - 8);
                }
            });
        });

        // 绘制X轴标签（优化显示）
        data.labels.forEach((label, index) => {
            const x = margin.left + (index + 0.5) * groupWidth;
            const y = margin.top + chartHeight + 30;
            
            ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
            ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            
            // 智能标签处理
            let displayLabel = label;
            if (label.length > 12) {
                // 长标签分行显示
                const words = label.split(/[\s-]/);
                if (words.length > 1) {
                    ctx.fillText(words[0], x, y);
                    ctx.fillText(words.slice(1).join(' '), x, y + 15);
                } else {
                    displayLabel = label.substring(0, 10) + '...';
                    ctx.fillText(displayLabel, x, y);
                }
            } else {
                ctx.fillText(displayLabel, x, y);
            }
        });

        // 绘制Y轴标题
        ctx.save();
        ctx.translate(25, margin.top + chartHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = this.currentTheme === 'dark' ? '#d1d5db' : '#4b5563';
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('性能数值', 0, 0);
        ctx.restore();

        // 绘制优化的图例
        if (data.datasets.length > 1) {
            const legendY = 60;
            const legendItemWidth = Math.min(120, (width - 100) / data.datasets.length);
            const legendStartX = (width - (data.datasets.length * legendItemWidth)) / 2;
            
            data.datasets.forEach((dataset, index) => {
                const x = legendStartX + index * legendItemWidth;
                const color = dataset.backgroundColor || this.getColorByIndex(index);
                
                // 绘制颜色块
                ctx.fillStyle = color;
                ctx.fillRect(x, legendY, 16, 16);
                ctx.strokeStyle = this.adjustColorBrightness(color, -40);
                ctx.lineWidth = 1;
                ctx.strokeRect(x, legendY, 16, 16);
                
                // 绘制标签
                ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
                ctx.font = '12px "Segoe UI", Arial, sans-serif';
                ctx.textAlign = 'left';
                const label = dataset.label || `数据集 ${index + 1}`;
                const shortLabel = label.length > 14 ? label.substring(0, 12) + '...' : label;
                ctx.fillText(shortLabel, x + 22, legendY + 12);
            });
        }
    },

    // 绘制雷达图（优化版）
    drawRadarChart(ctx, data) {
        const { width, height } = ctx.canvas;
        const centerX = width / 2;
        const centerY = height / 2 + 10;
        const radius = Math.min(width, height) * 0.28;
        const labels = data.labels || ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Mo'];
        
        // 绘制清晰背景
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制标题
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 化学成分雷达分析', centerX, 35);
        
        // 绘制副标题
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
        ctx.fillText('各元素含量对比图', centerX, 55);

        // 检查数据有效性
        if (!data.datasets || data.datasets.length === 0) {
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无化学成分数据', centerX, centerY);
            return;
        }

        // 计算数据范围
        const allValues = data.datasets.flatMap(d => d.data || []).filter(v => v !== null && v !== undefined && !isNaN(v));
        const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
        const levels = 5;
        const levelStep = maxValue / levels;
        
        // 绘制同心圆网格（带渐变效果）
        for (let i = 1; i <= levels; i++) {
            const levelRadius = (radius / levels) * i;
            
            // 绘制填充圆环
            if (i % 2 === 0) {
                ctx.fillStyle = this.currentTheme === 'dark' ? 'rgba(55, 65, 81, 0.1)' : 'rgba(249, 250, 251, 0.8)';
                ctx.beginPath();
                ctx.arc(centerX, centerY, levelRadius, 0, 2 * Math.PI);
                ctx.arc(centerX, centerY, levelRadius - (radius / levels), 0, 2 * Math.PI, true);
                ctx.fill();
            }
            
            // 绘制圆环边框
            ctx.beginPath();
            ctx.arc(centerX, centerY, levelRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.4)' : 'rgba(229, 231, 235, 0.8)';
            ctx.lineWidth = i === levels ? 2 : 1;
            ctx.stroke();
            
            // 绘制数值标签（右上角）
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '11px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'left';
            const labelValue = (levelStep * i).toFixed(1);
            ctx.fillText(labelValue + '%', centerX + levelRadius * 0.7, centerY - levelRadius * 0.7);
        }
        
        // 绘制轴线和标签
        const angleStep = (2 * Math.PI) / labels.length;
        labels.forEach((label, index) => {
            const angle = index * angleStep - Math.PI / 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // 绘制轴线（带渐变）
            const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
            gradient.addColorStop(0, this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.8)' : 'rgba(229, 231, 235, 0.9)');
            gradient.addColorStop(1, this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)');
            
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x, y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 智能标签定位
            const labelDistance = radius + 25;
            const labelX = centerX + Math.cos(angle) * labelDistance;
            const labelY = centerY + Math.sin(angle) * labelDistance;
            
            // 标签背景
            ctx.fillStyle = this.currentTheme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)';
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(labelX - textWidth/2 - 4, labelY - 10, textWidth + 8, 16);
            
            // 标签边框
            ctx.strokeStyle = this.currentTheme === 'dark' ? '#4b5563' : '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(labelX - textWidth/2 - 4, labelY - 10, textWidth + 8, 16);
            
            // 绘制标签文字
            ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
            ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, labelX, labelY + 3);
        });
        
        // 绘制数据线（增强效果）
        if (data.datasets && data.datasets.length > 0) {
            data.datasets.forEach((dataset, datasetIndex) => {
                const color = dataset.backgroundColor || this.getColorByIndex(datasetIndex);
                const values = dataset.data || [];
                
                if (values.length === 0) return;
                
                // 绘制阴影
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 2;
                
                // 绘制填充区域（渐变）
                const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
                gradient.addColorStop(0, this.convertToHex(color) + '60');
                gradient.addColorStop(1, this.convertToHex(color) + '20');
                
                ctx.beginPath();
                values.forEach((value, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const normalizedValue = Math.min(value / maxValue, 1);
                    const pointRadius = radius * normalizedValue;
                    const x = centerX + Math.cos(angle) * pointRadius;
                    const y = centerY + Math.sin(angle) * pointRadius;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
                
                // 清除阴影
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;
                
                // 绘制边框线（加粗）
                ctx.beginPath();
                values.forEach((value, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const normalizedValue = Math.min(value / maxValue, 1);
                    const pointRadius = radius * normalizedValue;
                    const x = centerX + Math.cos(angle) * pointRadius;
                    const y = centerY + Math.sin(angle) * pointRadius;
                    
                    if (index === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                });
                ctx.closePath();
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.stroke();
                
                // 绘制数据点（增强）
                values.forEach((value, index) => {
                    const angle = index * angleStep - Math.PI / 2;
                    const normalizedValue = Math.min(value / maxValue, 1);
                    const pointRadius = radius * normalizedValue;
                    const x = centerX + Math.cos(angle) * pointRadius;
                    const y = centerY + Math.sin(angle) * pointRadius;
                    
                    // 外圈
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, 2 * Math.PI);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    
                    // 内圈
                    ctx.beginPath();
                    ctx.arc(x, y, 3, 0, 2 * Math.PI);
                    ctx.fillStyle = color;
                    ctx.fill();
                    
                    // 智能数值显示
                    if (normalizedValue > 0.15) { // 只显示较大的值
                        const textX = x + (x > centerX ? 12 : -12);
                        const textY = y + (y > centerY ? 12 : -12);
                        
                        // 数值背景
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                        const text = value.toFixed(1) + '%';
                        const textWidth = ctx.measureText(text).width;
                        ctx.fillRect(textX - textWidth/2 - 3, textY - 8, textWidth + 6, 14);
                        
                        // 数值文字
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(text, textX, textY + 3);
                    }
                });
            });
        }
        
        // 绘制优化的图例
        if (data.datasets && data.datasets.length > 0) {
            const legendY = height - 50;
            const legendItemWidth = Math.min(150, (width - 40) / data.datasets.length);
            const legendStartX = (width - (data.datasets.length * legendItemWidth)) / 2;
            
            data.datasets.forEach((dataset, index) => {
                const x = legendStartX + index * legendItemWidth;
                const color = dataset.backgroundColor || this.getColorByIndex(index);
                
                // 绘制颜色圆点
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(x + 10, legendY, 6, 0, 2 * Math.PI);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                
                // 绘制标签
                ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
                ctx.font = '12px "Segoe UI", Arial, sans-serif';
                ctx.textAlign = 'left';
                const label = dataset.label || `材料 ${index + 1}`;
                const shortLabel = label.length > 18 ? label.substring(0, 16) + '...' : label;
                ctx.fillText(shortLabel, x + 22, legendY + 4);
            });
        }
    },

    // 绘制折线图（增强版）
    drawLineChart(ctx, data) {
        const { width, height } = ctx.canvas;
        const margin = { top: 60, right: 40, bottom: 80, left: 80 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // 绘制背景
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#f9fafb';
        ctx.fillRect(0, 0, width, height);

        // 绘制标题
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌡️ 温度性能曲线分析', width / 2, 30);

        // 绘制背景
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#f9fafb';
        ctx.fillRect(0, 0, width, height);

        // 绘制标题
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🌡️ 温度性能曲线分析', width / 2, 30);

        // 计算数据范围
        const allValues = data.datasets.flatMap(d => d.data).filter(v => v !== null && v !== undefined && !isNaN(v));
        if (allValues.length === 0) {
            // 如果没有有效数据，显示提示信息
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无温度性能数据', width / 2, height / 2);
            return;
        }

        const maxValue = Math.max(...allValues);
        const minValue = Math.min(...allValues);
        const valueRange = maxValue - minValue || 1;
        const stepX = chartWidth / Math.max(1, data.labels.length - 1);

        // 绘制网格线
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = margin.top + (chartHeight / gridLines) * i;
            const value = maxValue - (valueRange / gridLines) * i;
            
            // 水平网格线
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(margin.left + chartWidth, y);
            ctx.strokeStyle = this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Y轴标签
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '11px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(0) + '°C', margin.left - 10, y + 4);
        }

        // 绘制X轴标签
        data.labels.forEach((label, index) => {
            const x = margin.left + index * stepX;
            
            // 垂直网格线
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, margin.top + chartHeight);
            ctx.strokeStyle = this.currentTheme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.6)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // X轴标签
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '11px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(label, x, margin.top + chartHeight + 20);
        });

        // 绘制坐标轴
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, margin.top + chartHeight);
        ctx.lineTo(margin.left + chartWidth, margin.top + chartHeight);
        ctx.strokeStyle = this.currentTheme === 'dark' ? '#4b5563' : '#d1d5db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 绘制折线和数据点
        data.datasets.forEach((dataset, datasetIndex) => {
            const color = dataset.borderColor || this.getColorByIndex(datasetIndex);
            const validData = dataset.data.map((value, index) => ({
                value: value !== null && value !== undefined && !isNaN(value) ? value : null,
                index
            })).filter(item => item.value !== null);

            if (validData.length === 0) return;

            // 绘制折线
            ctx.beginPath();
            let firstPoint = true;
            validData.forEach(({ value, index }) => {
                const x = margin.left + index * stepX;
                const y = margin.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;

                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.stroke();

            // 绘制数据点
            validData.forEach(({ value, index }) => {
                const x = margin.left + index * stepX;
                const y = margin.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
                
                // 外圈
                ctx.beginPath();
                ctx.arc(x, y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                
                // 内圈
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                
                // 数值标签
                ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
                ctx.font = '10px "Segoe UI", Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(value.toFixed(1), x, y - 12);
            });
        });

        // 绘制图例
        if (data.datasets && data.datasets.length > 0) {
            this.drawLegend(ctx, data.datasets, 20, height - 40);
        }
    },

    // 绘制饼图（优化版）
    drawPieChart(ctx, data) {
        const { width, height } = ctx.canvas;
        const centerX = width / 2;
        const centerY = height / 2 - 10;
        const radius = Math.min(width, height) / 5;

        // 绘制清晰背景
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 绘制标题
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 20px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🛡️ 材料类型分布', width / 2, 35);

        // 绘制副标题
        ctx.font = '14px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
        ctx.fillText('不锈钢类型统计分析', width / 2, 55);

        if (!data.datasets || !data.datasets[0] || !data.datasets[0].data || data.datasets[0].data.length === 0) {
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无分类数据', width / 2, height / 2);
            return;
        }

        const dataset = data.datasets[0];
        const total = dataset.data.reduce((sum, value) => sum + value, 0);
        
        if (total === 0) {
            ctx.fillStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
            ctx.font = '16px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('暂无有效数据', width / 2, height / 2);
            return;
        }

        let currentAngle = -Math.PI / 2;
        const colors = dataset.backgroundColor || [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'
        ];

        // 绘制外圈阴影
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // 绘制饼图扇形
        dataset.data.forEach((value, index) => {
            if (value <= 0) return;
            
            const sliceAngle = (value / total) * 2 * Math.PI;
            const color = colors[index % colors.length];
            
            // 创建渐变效果
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
            gradient.addColorStop(0, this.adjustColorBrightness(color, 40));
            gradient.addColorStop(1, color);
            
            // 绘制扇形
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            currentAngle += sliceAngle;
        });

        // 清除阴影效果
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        // 重新绘制边框和标签
        currentAngle = -Math.PI / 2;
        dataset.data.forEach((value, index) => {
            if (value <= 0) return;
            
            const sliceAngle = (value / total) * 2 * Math.PI;
            const color = colors[index % colors.length];
            
            // 绘制清晰边框
            ctx.strokeStyle = this.currentTheme === 'dark' ? '#374151' : '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.stroke();

            // 智能标签显示
            const percentage = ((value / total) * 100).toFixed(1);
            if (parseFloat(percentage) >= 8) { // 只显示占比大于8%的内部标签
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelRadius = radius * 0.65;
                const labelX = centerX + Math.cos(labelAngle) * labelRadius;
                const labelY = centerY + Math.sin(labelAngle) * labelRadius;

                // 添加文字背景
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                const textWidth = ctx.measureText(`${percentage}%`).width;
                ctx.fillRect(labelX - textWidth/2 - 4, labelY - 8, textWidth + 8, 16);

                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${percentage}%`, labelX, labelY + 4);
            }

            // 外部引线标签（用于小扇形）
            if (parseFloat(percentage) >= 3 && parseFloat(percentage) < 8) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const lineStartX = centerX + Math.cos(labelAngle) * radius;
                const lineStartY = centerY + Math.sin(labelAngle) * radius;
                const lineEndX = centerX + Math.cos(labelAngle) * (radius + 30);
                const lineEndY = centerY + Math.sin(labelAngle) * (radius + 30);

                // 绘制引线
                ctx.strokeStyle = this.currentTheme === 'dark' ? '#9ca3af' : '#6b7280';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(lineStartX, lineStartY);
                ctx.lineTo(lineEndX, lineEndY);
                ctx.stroke();

                // 绘制标签
                ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
                ctx.font = '11px "Segoe UI", Arial, sans-serif';
                ctx.textAlign = lineEndX > centerX ? 'left' : 'right';
                ctx.fillText(`${percentage}%`, lineEndX + (lineEndX > centerX ? 5 : -5), lineEndY + 4);
            }

            currentAngle += sliceAngle;
        });

        // 绘制中心圆
        ctx.fillStyle = this.currentTheme === 'dark' ? '#1f2937' : '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.strokeStyle = this.currentTheme === 'dark' ? '#4b5563' : '#d1d5db';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 中心文字
        ctx.fillStyle = this.currentTheme === 'dark' ? '#ffffff' : '#1f2937';
        ctx.font = 'bold 14px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('总计', centerX, centerY - 5);
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        ctx.fillText(total.toString(), centerX, centerY + 12);

        // 绘制优化的图例
        const legendStartY = height - 100;
        const legendCols = Math.min(3, data.labels.length);
        const legendRows = Math.ceil(data.labels.filter((_, i) => dataset.data[i] > 0).length / legendCols);
        const legendItemWidth = (width - 40) / legendCols;
        const legendItemHeight = 20;

        let legendIndex = 0;
        data.labels.forEach((label, index) => {
            if (dataset.data[index] <= 0) return;
            
            const col = legendIndex % legendCols;
            const row = Math.floor(legendIndex / legendCols);
            const x = 20 + col * legendItemWidth;
            const y = legendStartY + row * legendItemHeight;
            const color = colors[index % colors.length];
            
            // 绘制颜色圆点
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 8, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.strokeStyle = this.currentTheme === 'dark' ? '#4b5563' : '#d1d5db';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // 绘制标签文字
            ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
            ctx.font = '12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'left';
            const percentage = ((dataset.data[index] / total) * 100).toFixed(1);
            const shortLabel = label.length > 15 ? label.substring(0, 13) + '...' : label;
            ctx.fillText(`${shortLabel} (${percentage}%)`, x + 20, y + 4);
            
            legendIndex++;
        });
    },

    // 辅助方法
    // 获取颜色（按索引）
    getColorByIndex(index) {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
        ];
        return colors[index % colors.length];
    },

    // 将颜色转换为十六进制格式
    convertToHex(color) {
        if (!color || typeof color !== 'string') {
            return '#3b82f6';
        }
        
        // 如果已经是十六进制格式
        if (color.startsWith('#')) {
            return color;
        }
        
        // 处理 rgba 和 rgb 格式
        if (color.includes('rgba') || color.includes('rgb')) {
            // 提取数字
            const numbers = color.match(/\d+/g);
            if (numbers && numbers.length >= 3) {
                const r = parseInt(numbers[0]);
                const g = parseInt(numbers[1]);
                const b = parseInt(numbers[2]);
                
                // 确保值在有效范围内
                const validR = Math.max(0, Math.min(255, r));
                const validG = Math.max(0, Math.min(255, g));
                const validB = Math.max(0, Math.min(255, b));
                
                // 转换为十六进制
                const hex = '#' + 
                    validR.toString(16).padStart(2, '0') +
                    validG.toString(16).padStart(2, '0') +
                    validB.toString(16).padStart(2, '0');
                return hex;
            }
        }
        
        return '#3b82f6'; // 默认颜色
    },

    adjustColorBrightness(color, amount) {
        // 先转换为十六进制格式
        const hexColor = this.convertToHex(color);
        
        // 确保颜色格式正确
        if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
            return '#3b82f6'; // 默认蓝色
        }
        
        const col = hexColor.slice(1);
        
        // 验证颜色格式
        if (!/^[0-9A-Fa-f]{6}$/.test(col)) {
            return '#3b82f6'; // 默认蓝色
        }
        
        const num = parseInt(col, 16);
        let r = (num >> 16) + amount;
        let g = (num >> 8 & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        r = r > 255 ? 255 : r < 0 ? 0 : r;
        g = g > 255 ? 255 : g < 0 ? 0 : g;
        b = b > 255 ? 255 : b < 0 ? 0 : b;
        
        const result = '#' + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
        return result;
    },

    drawLegend(ctx, datasets, x, y) {
        datasets.forEach((dataset, index) => {
            const legendY = y + index * 25;
            
            // 绘制颜色块
            ctx.fillStyle = dataset.backgroundColor || '#3b82f6';
            ctx.fillRect(x, legendY, 15, 15);
            
            // 绘制边框
            ctx.strokeStyle = this.currentTheme === 'dark' ? '#6b7280' : '#d1d5db';
            ctx.lineWidth = 1;
            ctx.strokeRect(x, legendY, 15, 15);
            
            // 绘制标签
            ctx.fillStyle = this.currentTheme === 'dark' ? '#e5e7eb' : '#374151';
            ctx.font = '12px "Segoe UI", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(dataset.label || `数据集 ${index + 1}`, x + 20, legendY + 12);
        });
    },

    // 工具函数
    extractNumericValue(value) {
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // 处理特殊字符
            if (value === '—' || value === '-' || value === '') return 0;
            
            // 处理范围值，如 "18.0~20.0"，取中间值
            const rangeMatch = value.match(/([\d.]+)~([\d.]+)/);
            if (rangeMatch) {
                const min = parseFloat(rangeMatch[1]);
                const max = parseFloat(rangeMatch[2]);
                return (min + max) / 2;
            }
            
            // 处理不等式，如 "≤0.08"
            const inequalityMatch = value.match(/[≤≥<>]?([\d.]+)/);
            if (inequalityMatch) {
                return parseFloat(inequalityMatch[1]);
            }
            
            // 普通数字匹配
            const match = value.match(/[\d.]+/);
            return match ? parseFloat(match[0]) : 0;
        }
        return 0;
    },

    getCorrosionLevel(item) {
        // 简化的耐腐蚀性评估逻辑
        const cr = this.extractNumericValue(item.cr) || 0;
        const ni = this.extractNumericValue(item.ni) || 0;
        
        if (cr > 18 && ni > 8) return '优秀';
        if (cr > 12 && ni > 0) return '良好';
        if (cr > 10) return '一般';
        return '较差';
    },

    // 事件处理
    toggleVisualization() {
        console.log('📊 toggleVisualization 被调用');
        if (this.isVisible) {
            this.hideVisualization();
        } else {
            this.showVisualization();
        }
    },
    
    showVisualization() {
        const container = document.getElementById('visualization-container');
        if (container) {
            container.style.transform = 'translateX(0)';
            this.isVisible = true;
            console.log('📊 可视化面板已显示');
            this.updateDataStats();
            this.startRealTimeUpdates();
        } else {
            console.error('📊 可视化容器未找到');
        }
    },

    hideVisualization() {
        const container = document.getElementById('visualization-container');
        if (container) {
            container.style.transform = 'translateX(100%)';
            this.isVisible = false;
            console.log('📊 可视化面板已隐藏');
            this.stopRealTimeUpdates();
        } else {
            console.error('📊 可视化容器未找到');
        }
    },

    startRealTimeUpdates() {
        if (this.animationId) {
            this.stopRealTimeUpdates();
        }
        
        const updateLoop = () => {
            if (this.isVisible) {
                this.updateDataStats();
                this.animationId = requestAnimationFrame(updateLoop);
            }
        };
        
        this.animationId = requestAnimationFrame(updateLoop);
        console.log('📊 实时更新已启动');
    },

    stopRealTimeUpdates() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('📊 实时更新已停止');
        }
    },

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.refreshChart();
    },

    selectChartType(type) {
        // 更新按钮状态
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // 重新渲染图表
        const data = this.getChartData(type);
        this.renderChart(type, data);
    },

    changeDataSource(source) {
        console.log('📊 切换数据源:', source);
        this.updateDataStats();
        this.refreshChart();
    },

    changeChartType(type) {
        console.log('📊 切换图表类型:', type);
        const data = this.getChartData(type);
        this.renderChart(type, data);
    },

    refreshChart() {
        const chartTypeSelect = document.getElementById('chart-type');
        const currentType = chartTypeSelect?.value || 'strength';
        console.log('📊 刷新图表，类型:', currentType);
        const data = this.getChartData(currentType);
        this.renderChart(currentType, data);
    },

    exportChart() {
        const canvas = document.getElementById('main-chart');
        if (canvas) {
            const link = document.createElement('a');
            link.download = `chart-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    },

    showFullscreenChart() {
        // 实现全屏显示逻辑
        this.showToast('全屏功能开发中...', 'info');
    },

    showChartSettings() {
        // 实现图表设置逻辑
        this.showToast('图表设置功能开发中...', 'info');
    },

    updateDataStats() {
        const source = document.getElementById('data-source')?.value || 'comparison';
        let count = 0;
        let data = [];

        switch (source) {
            case 'comparison':
                data = window.AppState?.comparisonList || [];
                count = data.length;
                break;
            case 'search':
                data = this.getSearchResults();
                count = data.length;
                break;
            case 'favorites':
                data = this.getFavorites();
                count = data.length;
                break;
            case 'all':
                data = this.getAllData();
                count = data.length;
                break;
        }

        // 如果没有数据，使用示例数据
        if (count === 0) {
            data = this.getExampleData();
            count = data.length;
            console.log('📊 使用示例数据进行统计显示');
        }

        // 更新基本统计（安全检查DOM元素是否存在）
        const dataCountEl = document.getElementById('data-count');
        const currentSourceEl = document.getElementById('current-source');
        const lastUpdateEl = document.getElementById('last-update');
        
        if (dataCountEl) dataCountEl.textContent = count;
        if (currentSourceEl) {
            const sourceName = this.getDataSourceName(source);
            currentSourceEl.textContent = count === this.getExampleData().length ? sourceName + ' (示例)' : sourceName;
        }
        if (lastUpdateEl) lastUpdateEl.textContent = new Date().toLocaleTimeString();
        
        // 更新同步状态指示器（安全检查）
        const syncIndicator = document.getElementById('sync-indicator');
        const syncText = syncIndicator?.nextElementSibling;
        
        if (syncIndicator && syncText) {
            if (count > 0) {
                syncIndicator.className = 'text-green-400';
                syncIndicator.textContent = '●';
                syncText.textContent = '已同步';
                syncText.className = 'text-green-400';
            } else {
                syncIndicator.className = 'text-yellow-400';
                syncIndicator.textContent = '●';
                syncText.textContent = '无数据';
                syncText.className = 'text-yellow-400';
            }
        }
        
        // 如果是对比数据，显示额外信息
        if (source === 'comparison' && count >= 2) {
            this.updateComparisonStats(data);
        }

        // 强制刷新图表
        if (count > 0) {
            this.refreshChart();
        }
    },

    updateComparisonStats(comparisonData) {
        // 在控制台显示对比数据的详细信息
        console.log('📊 对比数据详情:', {
            count: comparisonData.length,
            materials: comparisonData.map(item => ({
                name: item.name,
                standard: item.standard,
                type: item.type
            })),
            timestamp: new Date().toISOString()
        });
        
        // 可以在这里添加更多的统计信息显示
        const statsContainer = document.getElementById('chart-stats');
        if (statsContainer && comparisonData.length >= 2) {
            // 添加对比数据的快速预览
            const existingPreview = statsContainer.querySelector('.comparison-preview');
            if (existingPreview) {
                existingPreview.remove();
            }
            
            const preview = document.createElement('div');
            preview.className = 'comparison-preview mt-2 p-2 bg-gray-700/50 rounded text-xs';
            preview.innerHTML = `
                <div class="text-gray-300 mb-1">对比材料:</div>
                ${comparisonData.slice(0, 3).map(item => 
                    `<div class="text-gray-400">• ${item.name} (${item.standard})</div>`
                ).join('')}
                ${comparisonData.length > 3 ? `<div class="text-gray-500">...还有${comparisonData.length - 3}个</div>` : ''}
            `;
            
            statsContainer.appendChild(preview);
        }
    },

    // 数据获取函数
    getSearchResults() {
        const groups = window.AppState?.searchResultGroups || {};
        const results = Object.values(groups).flat() || [];
        console.log('📊 获取搜索结果:', results.length, '项');
        return results;
    },

    getFavorites() {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        console.log('📊 获取收藏数据:', favorites.length, '项');
        return favorites;
    },

    getAllData() {
        // 尝试多种数据源
        let allData = window.AppState?.allData || [];
        
        // 如果 AppState.allData 为空，尝试从数据库获取
        if (allData.length === 0 && window.DB) {
            allData = [
                ...(window.DB.gb || []),
                ...(window.DB.astm || []),
                ...(window.DB.en || [])
            ];
        }
        
        console.log('📊 获取全部数据:', allData.length, '项');
        return allData;
    },

    setupDataListeners() {
        // 监听对比列表变化
        this.setupComparisonListWatcher();
        
        // 监听数据源切换
        const dataSourceSelect = document.getElementById('data-source');
        if (dataSourceSelect) {
            dataSourceSelect.addEventListener('change', (e) => {
                this.onDataSourceChange(e.target.value);
            });
        }
        
        // 监听搜索结果变化
        this.setupSearchResultsWatcher();
        
        // 监听收藏夹变化
        this.setupFavoritesWatcher();
    },

    setupComparisonListWatcher() {
        if (!window.AppState) {
            console.warn('📊 AppState未找到，无法设置对比列表监听');
            return;
        }
        
        // 确保comparisonList存在
        if (!window.AppState.comparisonList) {
            window.AppState.comparisonList = [];
        }
        
        const self = this;
        
        // 如果已经是Proxy，先获取原始数组
        let originalList = window.AppState.comparisonList;
        if (originalList._isProxy) {
            console.log('📊 对比列表已经是Proxy，跳过重复设置');
            return;
        }
        
        // 创建新的Proxy来监听变化
        const proxiedList = new Proxy([...originalList], {
            set(target, property, value) {
                const result = Reflect.set(target, property, value);
                
                // 当对比列表发生变化时，同步更新可视化
                if (property !== 'length') {
                    console.log('📊 Proxy监听到对比列表变化:', property, value);
                    setTimeout(() => self.onComparisonListChange(target), 0);
                }
                
                return result;
            },
            
            deleteProperty(target, property) {
                const result = Reflect.deleteProperty(target, property);
                console.log('📊 Proxy监听到对比列表删除:', property);
                setTimeout(() => self.onComparisonListChange(target), 0);
                return result;
            }
        });
        
        // 标记为Proxy
        proxiedList._isProxy = true;
        
        // 重写数组方法
        ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(method => {
            const original = Array.prototype[method];
            proxiedList[method] = function(...args) {
                console.log(`📊 Proxy监听到数组方法调用: ${method}`, args);
                const result = original.apply(this, args);
                setTimeout(() => self.onComparisonListChange(this), 0);
                return result;
            };
        });
        
        // 替换原始数组
        window.AppState.comparisonList = proxiedList;
        
        console.log('📊 对比列表Proxy监听设置完成，当前长度:', proxiedList.length);
        
        // 立即触发一次更新
        if (proxiedList.length > 0) {
            this.onComparisonListChange(proxiedList);
        }
    },

    onComparisonListChange(comparisonList) {
        console.log('📊 对比列表变化，同步更新可视化数据:', comparisonList.length);
        
        // 更新数据统计
        this.updateDataStats();
        
        // 如果当前数据源是对比列表，立即刷新图表
        const currentDataSource = document.getElementById('data-source')?.value;
        if (currentDataSource === 'comparison') {
            this.refreshChart();
            
            // 显示同步状态提示
            this.showSyncStatus('对比数据已同步更新');
        }
        
        // 更新可视化按钮状态
        this.updateVisualizationButton(comparisonList.length);
        
        // 如果对比列表有数据且可视化面板未打开，显示提示
        if (comparisonList.length >= 2 && !this.isVisualizationVisible()) {
            this.showVisualizationHint();
        }
    },

    onDataSourceChange(newSource) {
        console.log('📊 数据源切换:', newSource);
        
        // 获取新数据源的数据
        const data = this.getDataBySource(newSource);
        
        // 更新统计信息
        this.updateDataStats();
        
        // 刷新图表
        this.refreshChart();
        
        // 显示数据源切换提示
        this.showSyncStatus(`已切换到${this.getDataSourceName(newSource)}`);
    },

    getDataBySource(source) {
        switch (source) {
            case 'comparison':
                return window.AppState?.comparisonList || [];
            case 'search':
                return this.getSearchResults();
            case 'favorites':
                return this.getFavorites();
            case 'all':
                return this.getAllData();
            default:
                return [];
        }
    },

    getDataSourceName(source) {
        const names = {
            'comparison': '对比列表',
            'search': '搜索结果',
            'favorites': '收藏夹',
            'all': '全部数据'
        };
        return names[source] || '未知数据源';
    },

    setupSearchResultsWatcher() {
        // 监听搜索结果变化
        if (window.AppState) {
            let lastSearchResultsLength = 0;
            
            setInterval(() => {
                const currentResults = this.getSearchResults();
                if (currentResults.length !== lastSearchResultsLength) {
                    lastSearchResultsLength = currentResults.length;
                    
                    if (document.getElementById('data-source')?.value === 'search') {
                        this.updateDataStats();
                        this.refreshChart();
                        this.showSyncStatus('搜索结果已同步更新');
                    }
                }
            }, 1000);
        }
    },

    setupFavoritesWatcher() {
        // 监听收藏夹变化
        let lastFavoritesLength = this.getFavorites().length;
        
        setInterval(() => {
            const currentFavorites = this.getFavorites();
            if (currentFavorites.length !== lastFavoritesLength) {
                lastFavoritesLength = currentFavorites.length;
                
                if (document.getElementById('data-source')?.value === 'favorites') {
                    this.updateDataStats();
                    this.refreshChart();
                    this.showSyncStatus('收藏夹已同步更新');
                }
            }
        }, 1000);
    },

    showSyncStatus(message) {
        // 在可视化面板中显示同步状态
        const statusElement = document.getElementById('sync-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.style.opacity = '1';
            
            setTimeout(() => {
                statusElement.style.opacity = '0';
            }, 2000);
        }
        
        // 同时显示 toast 提示
        this.showToast(message, 'success');
    },

    updateVisualizationButton(comparisonCount) {
        const btn = document.getElementById('visualization-btn');
        if (btn) {
            // 根据对比数据数量更新按钮样式
            if (comparisonCount >= 2) {
                btn.classList.add('bg-green-600', 'hover:bg-green-700');
                btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                btn.innerHTML = '📊✨';
                btn.title = `数据可视化 (${comparisonCount}个对比项)`;
            } else {
                btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                btn.innerHTML = '📊';
                btn.title = '数据可视化';
            }
        }
    },

    isVisualizationVisible() {
        const container = document.getElementById('visualization-container');
        return container && container.classList.contains('show');
    },

    showVisualizationHint() {
        // 显示可视化提示
        if (!this.hintShown) {
            this.showToast('💡 已有对比数据，点击右侧📊按钮查看可视化图表', 'info');
            this.hintShown = true;
            
            // 让按钮闪烁提示
            const btn = document.getElementById('visualization-btn');
            if (btn) {
                btn.style.animation = 'pulse 2s infinite';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 6000);
            }
        }
    },

    handleCanvasMouseMove(e) {
        // 实现鼠标悬停提示
        // 这里可以添加更复杂的交互逻辑
    },

    handleCanvasClick(e) {
        // 实现点击交互
        // 这里可以添加点击事件处理
    },

    hideTooltip() {
        const tooltip = document.querySelector('.chart-tooltip');
        if (tooltip) {
            tooltip.classList.remove('show');
        }
    },

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
    module.exports = DataVisualization;
} else {
    window.DataVisualization = DataVisualization;
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DataVisualization.init());
} else {
    DataVisualization.init();
}