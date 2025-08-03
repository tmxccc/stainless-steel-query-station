// 数据可视化功能模块
const DataVisualization = {
    init() {
        this.createVisualizationUI();
        this.bindEvents();
    },

    createVisualizationUI() {
        const comparisonHeader = document.querySelector('.flex.justify-between.items-center.p-4.border-b.border-gray-700');
        const visualizationHTML = `
            <div class="mt-4 p-4 bg-gray-800/50 rounded-lg border border-gray-600">
                <div class="flex items-center justify-between mb-3">
                    <h3 class="text-sm font-semibold text-white">数据可视化</h3>
                    <button id="toggle-visualization" class="text-xs text-blue-400 hover:text-blue-300">展开</button>
                </div>
                <div id="visualization-content" class="hidden space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-gray-700 rounded-lg p-3">
                            <h4 class="text-sm font-semibold text-white mb-2">强度对比</h4>
                            <canvas id="strength-chart" width="300" height="200"></canvas>
                        </div>
                        <div class="bg-gray-700 rounded-lg p-3">
                            <h4 class="text-sm font-semibold text-white mb-2">合金元素分布</h4>
                            <canvas id="element-chart" width="300" height="200"></canvas>
                        </div>
                    </div>
                    <div class="bg-gray-700 rounded-lg p-3">
                        <h4 class="text-sm font-semibold text-white mb-2">牌号类型统计</h4>
                        <canvas id="type-chart" width="600" height="200"></canvas>
                    </div>
                </div>
            </div>
        `;
        comparisonHeader.insertAdjacentHTML('afterend', visualizationHTML);
    },

    bindEvents() {
        document.getElementById('toggle-visualization').addEventListener('click', () => {
            const content = document.getElementById('visualization-content');
            const toggleBtn = document.getElementById('toggle-visualization');
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                toggleBtn.textContent = '收起';
                this.updateCharts();
            } else {
                content.classList.add('hidden');
                toggleBtn.textContent = '展开';
            }
        });
    },

    updateCharts() {
        if (AppState.comparisonList.length === 0) {
            this.showNoDataMessage();
            return;
        }

        this.renderStrengthChart();
        this.renderElementChart();
        this.renderTypeChart();
    },

    renderStrengthChart() {
        const canvas = document.getElementById('strength-chart');
        const ctx = canvas.getContext('2d');
        
        // 清除画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const steels = AppState.comparisonList;
        const labels = steels.map(s => s.name);
        const yieldValues = steels.map(s => parseInt(s.yield_strength.replace(/[^\d]/g, '')));
        const tensileValues = steels.map(s => parseInt(s.tensile_strength.replace(/[^\d]/g, '')));
        
        const maxValue = Math.max(...yieldValues, ...tensileValues);
        const scale = 180 / maxValue;
        
        // 绘制坐标轴
        ctx.strokeStyle = '#4B5563';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(30, 180);
        ctx.lineTo(280, 180);
        ctx.stroke();
        
        // 绘制屈服强度柱状图
        ctx.fillStyle = '#3B82F6';
        yieldValues.forEach((value, index) => {
            const height = value * scale;
            const x = 40 + index * 60;
            const y = 180 - height;
            ctx.fillRect(x, y, 20, height);
            
            // 标签
            ctx.fillStyle = '#E5E7EB';
            ctx.font = '10px Arial';
            ctx.fillText(value.toString(), x + 5, 195);
        });
        
        // 绘制抗拉强度柱状图
        ctx.fillStyle = '#EF4444';
        tensileValues.forEach((value, index) => {
            const height = value * scale;
            const x = 60 + index * 60;
            const y = 180 - height;
            ctx.fillRect(x, y, 20, height);
            
            // 标签
            ctx.fillStyle = '#E5E7EB';
            ctx.font = '10px Arial';
            ctx.fillText(value.toString(), x + 5, 195);
        });
        
        // 图例
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(30, 10, 15, 10);
        ctx.fillStyle = '#E5E7EB';
        ctx.font = '10px Arial';
        ctx.fillText('屈服强度', 50, 20);
        
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(120, 10, 15, 10);
        ctx.fillStyle = '#E5E7EB';
        ctx.fillText('抗拉强度', 140, 20);
    },

    renderElementChart() {
        const canvas = document.getElementById('element-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const steels = AppState.comparisonList;
        const elements = ['铬', '镍', '钼'];
        const colors = ['#10B981', '#F59E0B', '#8B5CF6'];
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 60;
        
        steels.forEach((steel, steelIndex) => {
            const angleStep = (2 * Math.PI) / elements.length;
            const startAngle = steelIndex * (2 * Math.PI / steels.length);
            
            elements.forEach((element, elementIndex) => {
                const value = this.parseElementValue(steel[element]);
                if (value > 0) {
                    const angle = startAngle + elementIndex * angleStep;
                    const x = centerX + Math.cos(angle) * (value / 30) * radius;
                    const y = centerY + Math.sin(angle) * (value / 30) * radius;
                    
                    ctx.fillStyle = colors[elementIndex];
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    // 标签
                    ctx.fillStyle = '#E5E7EB';
                    ctx.font = '8px Arial';
                    ctx.fillText(steel.name, x - 15, y + 15);
                }
            });
        });
        
        // 图例
        elements.forEach((element, index) => {
            ctx.fillStyle = colors[index];
            ctx.fillRect(10, 10 + index * 15, 10, 10);
            ctx.fillStyle = '#E5E7EB';
            ctx.font = '10px Arial';
            ctx.fillText(element, 25, 20 + index * 15);
        });
    },

    renderTypeChart() {
        const canvas = document.getElementById('type-chart');
        const ctx = canvas.getContext('2d');
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const steels = AppState.comparisonList;
        const typeCount = {};
        
        steels.forEach(steel => {
            typeCount[steel.type] = (typeCount[steel.type] || 0) + 1;
        });
        
        const types = Object.keys(typeCount);
        const counts = Object.values(typeCount);
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
        
        const barWidth = 80;
        const barSpacing = 40;
        const maxCount = Math.max(...counts);
        const scale = 150 / maxCount;
        
        // 绘制柱状图
        types.forEach((type, index) => {
            const x = 50 + index * (barWidth + barSpacing);
            const height = typeCount[type] * scale;
            const y = 180 - height;
            
            ctx.fillStyle = colors[index % colors.length];
            ctx.fillRect(x, y, barWidth, height);
            
            // 标签
            ctx.fillStyle = '#E5E7EB';
            ctx.font = '12px Arial';
            ctx.fillText(type, x + 10, 195);
            ctx.fillText(typeCount[type].toString(), x + 30, y - 5);
        });
    },

    parseElementValue(value) {
        if (!value || value === '—') return 0;
        const match = value.match(/(\d+(?:\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
    },

    showNoDataMessage() {
        const canvases = ['strength-chart', 'element-chart', 'type-chart'];
        canvases.forEach(id => {
            const canvas = document.getElementById(id);
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#6B7280';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('请添加牌号进行对比', canvas.width / 2, canvas.height / 2);
        });
    }
};

// 初始化数据可视化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof DataVisualization !== 'undefined') {
        DataVisualization.init();
    }
}); 