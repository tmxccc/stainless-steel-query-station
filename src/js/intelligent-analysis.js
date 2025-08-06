// 智能分析模块 - 提供高级分析功能
const IntelligentAnalysis = {
    // 初始化配置
    config: {
        similarityThreshold: 0.8,
        maxSuggestions: 10,
        cacheTimeout: 300000, // 5分钟
        analysisTypes: ['similarity', 'performance', 'validation', 'recommendation']
    },
    
    // 缓存管理
    cache: new Map(),
    
    // 材料相似性分析
    similarityAnalysis: {
        // 找出相似材料
        findSimilarMaterials(material, threshold = 0.8) {
            const cacheKey = `similarity_${material.name || material.USN}_${threshold}`;
            
            if (IntelligentAnalysis.cache.has(cacheKey)) {
                return IntelligentAnalysis.cache.get(cacheKey);
            }
            
            const similarities = [];
            const targetComposition = this.normalizeComposition(material);
            
            if (!window.AppState || !window.AppState.allData) {
                console.warn('AppState.allData 不可用');
                return [];
            }
            
            window.AppState.allData.forEach(item => {
                if (item.name !== material.name && item.USN !== material.USN) {
                    const similarity = this.calculateSimilarity(
                        targetComposition, 
                        this.normalizeComposition(item)
                    );
                    
                    if (similarity >= threshold) {
                        similarities.push({
                            material: item,
                            similarity: similarity,
                            differences: this.findDifferences(
                                targetComposition, 
                                this.normalizeComposition(item)
                            ),
                            matchingElements: this.findMatchingElements(
                                targetComposition, 
                                this.normalizeComposition(item)
                            )
                        });
                    }
                }
            });
            
            const result = similarities
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, IntelligentAnalysis.config.maxSuggestions);
            
            // 缓存结果
            IntelligentAnalysis.cache.set(cacheKey, result);
            setTimeout(() => {
                IntelligentAnalysis.cache.delete(cacheKey);
            }, IntelligentAnalysis.config.cacheTimeout);
            
            return result;
        },
        
        // 标准化化学成分
        normalizeComposition(material) {
            const composition = {};
            const elements = ['C', 'Si', 'Mn', 'P', 'S', 'Cr', 'Ni', 'Mo', 'Cu', 'Al', 'Ti', 'Nb', 'N', 'W', 'B', 'V'];
            
            elements.forEach(element => {
                let value = material[element] || 
                           material[element.toLowerCase()] || 
                           material[this.getChineseName(element)];
                
                if (value && value !== '-' && value !== '—') {
                    composition[element] = this.parseElementValue(value);
                } else {
                    composition[element] = 0;
                }
            });
            
            return composition;
        },
        
        // 获取元素中文名称
        getChineseName(element) {
            const mapping = {
                'C': '碳', 'Si': '硅', 'Mn': '锰', 'P': '磷', 'S': '硫',
                'Cr': '铬', 'Ni': '镍', 'Mo': '钼', 'Cu': '铜', 'Al': '铝',
                'Ti': '钛', 'Nb': '铌', 'N': '氮', 'W': '钨', 'B': '硼', 'V': '钒'
            };
            return mapping[element] || element;
        },
        
        // 解析元素含量值
        parseElementValue(value) {
            if (typeof value === 'number') return value;
            if (typeof value !== 'string') return 0;
            
            // 处理范围值，如 "18.0-20.0" 或 "≤0.08"
            if (value.includes('-')) {
                const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
                return (min + max) / 2;
            } else if (value.includes('≤') || value.includes('<=')) {
                return parseFloat(value.replace(/[≤<=]/g, '').trim());
            } else if (value.includes('≥') || value.includes('>=')) {
                return parseFloat(value.replace(/[≥>=]/g, '').trim());
            } else {
                return parseFloat(value) || 0;
            }
        },
        
        // 计算相似度
        calculateSimilarity(comp1, comp2) {
            const elements = Object.keys(comp1);
            let weightedDiff = 0;
            let totalWeight = 0;
            
            // 元素权重（重要性）
            const weights = {
                'Cr': 3.0, 'Ni': 2.5, 'Mo': 2.0, 'C': 1.8, 'Mn': 1.2,
                'Si': 1.0, 'Cu': 1.5, 'N': 1.8, 'Ti': 1.3, 'Nb': 1.3,
                'Al': 1.0, 'W': 1.5, 'B': 1.0, 'V': 1.0, 'P': 0.8, 'S': 0.8
            };
            
            elements.forEach(element => {
                const weight = weights[element] || 1.0;
                const diff = Math.abs(comp1[element] - comp2[element]);
                const maxValue = Math.max(comp1[element], comp2[element], 1);
                const normalizedDiff = diff / maxValue;
                
                weightedDiff += normalizedDiff * weight;
                totalWeight += weight;
            });
            
            const avgDiff = weightedDiff / totalWeight;
            const similarity = Math.max(0, 1 - avgDiff);
            
            return Math.round(similarity * 100) / 100;
        },
        
        // 找出差异
        findDifferences(comp1, comp2) {
            const differences = [];
            const significantThreshold = 0.5; // 显著差异阈值
            
            Object.keys(comp1).forEach(element => {
                const diff = Math.abs(comp1[element] - comp2[element]);
                if (diff > significantThreshold) {
                    differences.push({
                        element: element,
                        chineseName: this.getChineseName(element),
                        value1: comp1[element],
                        value2: comp2[element],
                        difference: diff,
                        percentage: Math.round((diff / Math.max(comp1[element], comp2[element], 1)) * 100)
                    });
                }
            });
            
            return differences.sort((a, b) => b.difference - a.difference);
        },
        
        // 找出匹配元素
        findMatchingElements(comp1, comp2) {
            const matches = [];
            const matchThreshold = 0.3; // 匹配阈值
            
            Object.keys(comp1).forEach(element => {
                const diff = Math.abs(comp1[element] - comp2[element]);
                const maxValue = Math.max(comp1[element], comp2[element], 1);
                const similarity = 1 - (diff / maxValue);
                
                if (similarity > (1 - matchThreshold) && (comp1[element] > 0 || comp2[element] > 0)) {
                    matches.push({
                        element: element,
                        chineseName: this.getChineseName(element),
                        value1: comp1[element],
                        value2: comp2[element],
                        similarity: Math.round(similarity * 100)
                    });
                }
            });
            
            return matches.sort((a, b) => b.similarity - a.similarity);
        }
    },
    
    // 性能预测
    performancePrediction: {
        // 预测耐腐蚀性
        predictCorrosionResistance(material) {
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            let score = 0;
            const factors = [];
            
            // 铬含量影响（最重要因素）
            if (composition.Cr >= 18) {
                score += 40;
                factors.push('高铬含量(≥18%)提供优异的钝化膜保护');
            } else if (composition.Cr >= 12) {
                score += 25;
                factors.push('中等铬含量(12-18%)提供基本的耐腐蚀性');
            } else if (composition.Cr >= 10.5) {
                score += 15;
                factors.push('低铬含量(10.5-12%)提供有限的耐腐蚀性');
            } else {
                factors.push('铬含量过低(<10.5%)，耐腐蚀性差');
            }
            
            // 镍含量影响
            if (composition.Ni >= 8) {
                score += 25;
                factors.push('高镍含量(≥8%)增强耐酸性和韧性');
            } else if (composition.Ni >= 4) {
                score += 15;
                factors.push('中等镍含量(4-8%)提供一定的耐酸性');
            }
            
            // 钼含量影响
            if (composition.Mo >= 2) {
                score += 20;
                factors.push('钼含量(≥2%)显著提高抗点蚀和缝隙腐蚀能力');
            } else if (composition.Mo >= 1) {
                score += 10;
                factors.push('少量钼(1-2%)改善耐腐蚀性');
            }
            
            // 碳含量影响（负面）
            if (composition.C <= 0.03) {
                score += 10;
                factors.push('超低碳(≤0.03%)减少碳化物析出风险');
            } else if (composition.C <= 0.08) {
                score += 5;
                factors.push('低碳(≤0.08%)降低敏化风险');
            } else {
                score -= 5;
                factors.push('高碳含量可能导致碳化物析出，降低耐腐蚀性');
            }
            
            // 氮含量影响（正面）
            if (composition.N >= 0.1) {
                score += 8;
                factors.push('氮含量(≥0.1%)增强强度和耐蚀性');
            }
            
            // 铜含量影响
            if (composition.Cu >= 1) {
                score += 5;
                factors.push('铜含量改善特定环境下的耐腐蚀性');
            }
            
            const finalScore = Math.min(100, Math.max(0, score));
            
            return {
                score: finalScore,
                level: this.getResistanceLevel(finalScore),
                factors: factors,
                applications: this.getCorrosionApplications(finalScore),
                recommendations: this.getCorrosionRecommendations(composition, finalScore)
            };
        },
        
        // 预测机械性能
        predictMechanicalProperties(material) {
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            const type = material.type || '';
            
            let strength = 0;
            let hardness = 0;
            let ductility = 0;
            let toughness = 0;
            
            // 基于材料类型的基础值
            if (type.includes('martensitic') || type.includes('马氏体')) {
                strength = 70; hardness = 80; ductility = 40; toughness = 50;
            } else if (type.includes('austenitic') || type.includes('奥氏体')) {
                strength = 60; hardness = 50; ductility = 80; toughness = 75;
            } else if (type.includes('ferritic') || type.includes('铁素体')) {
                strength = 50; hardness = 60; ductility = 60; toughness = 55;
            } else if (type.includes('duplex') || type.includes('双相') || type.includes('奥氏体-铁素体')) {
                strength = 80; hardness = 70; ductility = 65; toughness = 70;
            } else if (type.includes('precipitation') || type.includes('沉淀硬化')) {
                strength = 85; hardness = 85; ductility = 50; toughness = 60;
            }
            
            // 化学成分调整
            strength += composition.C * 100 + composition.Cr * 0.5 + composition.Ni * 0.3 + composition.Mo * 2;
            hardness += composition.C * 150 + composition.Cr * 0.8 + composition.Mo * 1.5;
            ductility -= composition.C * 50 + composition.Cr * 0.2;
            ductility += composition.Ni * 1.5;
            toughness += composition.Ni * 1.2 - composition.C * 30;
            
            // 特殊元素影响
            if (composition.N > 0.1) {
                strength += 15;
                hardness += 10;
            }
            if (composition.Ti > 0.1 || composition.Nb > 0.1) {
                strength += 10;
                ductility -= 5;
            }
            
            return {
                strength: Math.min(100, Math.max(0, strength)),
                hardness: Math.min(100, Math.max(0, hardness)),
                ductility: Math.min(100, Math.max(0, ductility)),
                toughness: Math.min(100, Math.max(0, toughness)),
                overall: (strength + hardness + ductility + toughness) / 4,
                details: this.getMechanicalDetails(composition, type)
            };
        },
        
        getResistanceLevel(score) {
            if (score >= 85) return { level: '优秀', color: '#10B981', description: '适用于严苛腐蚀环境' };
            if (score >= 70) return { level: '良好', color: '#3B82F6', description: '适用于一般腐蚀环境' };
            if (score >= 50) return { level: '一般', color: '#F59E0B', description: '适用于轻度腐蚀环境' };
            if (score >= 30) return { level: '较差', color: '#EF4444', description: '仅适用于非腐蚀环境' };
            return { level: '差', color: '#7F1D1D', description: '不推荐用于腐蚀环境' };
        },
        
        getCorrosionApplications(score) {
            if (score >= 85) return ['海洋工程', '化工设备', '制药设备', '食品加工'];
            if (score >= 70) return ['建筑装饰', '厨具餐具', '汽车部件', '医疗器械'];
            if (score >= 50) return ['室内装饰', '家用电器', '轻工业'];
            return ['干燥环境', '装饰用途'];
        },
        
        getCorrosionRecommendations(composition, score) {
            const recommendations = [];
            
            if (composition.Cr < 16) {
                recommendations.push('建议选择铬含量更高的材料以提高耐腐蚀性');
            }
            if (composition.Mo < 2 && score < 70) {
                recommendations.push('考虑含钼材料以提高抗点蚀能力');
            }
            if (composition.C > 0.08) {
                recommendations.push('选择低碳或超低碳材料以避免敏化');
            }
            if (score < 50) {
                recommendations.push('此材料不适合腐蚀性环境，建议选择其他材料');
            }
            
            return recommendations;
        },
        
        getMechanicalDetails(composition, type) {
            const details = [];
            
            if (composition.C > 0.3) {
                details.push('高碳含量提供高强度但降低韧性');
            }
            if (composition.Ni > 8) {
                details.push('高镍含量提供优异的韧性和延展性');
            }
            if (composition.Mo > 2) {
                details.push('钼含量提高高温强度');
            }
            if (type.includes('双相')) {
                details.push('双相结构提供强度和韧性的良好平衡');
            }
            
            return details;
        }
    },
    
    // 数据验证
    dataValidation: {
        // 验证化学成分
        validateComposition(material) {
            const errors = [];
            const warnings = [];
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            
            // 检查成分总和
            const totalComposition = Object.values(composition).reduce((sum, val) => sum + val, 0);
            if (totalComposition > 100) {
                errors.push(`化学成分总和超过100% (${totalComposition.toFixed(2)}%)`);
            }
            
            // 检查关键元素
            if (composition.Cr < 10.5) {
                warnings.push('铬含量低于10.5%，可能不符合不锈钢标准');
            }
            
            if (composition.C > 1.2) {
                warnings.push('碳含量过高，可能影响耐腐蚀性和加工性能');
            }
            
            if (composition.S > 0.03) {
                warnings.push('硫含量较高，可能影响热加工性能');
            }
            
            if (composition.P > 0.045) {
                warnings.push('磷含量较高，可能影响韧性');
            }
            
            // 检查元素配比合理性
            if (composition.Ni > 0 && composition.Cr / composition.Ni < 1.5) {
                warnings.push('铬镍比例可能不够稳定奥氏体结构');
            }
            
            if (composition.Mo > 0 && composition.Cr < 16) {
                warnings.push('含钼材料通常需要更高的铬含量');
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors,
                warnings: warnings,
                score: this.calculateQualityScore(composition, errors, warnings),
                suggestions: this.getValidationSuggestions(composition, errors, warnings)
            };
        },
        
        calculateQualityScore(composition, errors, warnings) {
            let score = 100;
            
            // 错误扣分
            score -= errors.length * 20;
            
            // 警告扣分
            score -= warnings.length * 5;
            
            // 成分合理性评分
            if (composition.Cr >= 16 && composition.Cr <= 20) score += 5;
            if (composition.Ni >= 8 && composition.Ni <= 12) score += 5;
            if (composition.C <= 0.08) score += 5;
            if (composition.Mo >= 2 && composition.Mo <= 3) score += 3;
            
            return Math.max(0, Math.min(100, score));
        },
        
        getValidationSuggestions(composition, errors, warnings) {
            const suggestions = [];
            
            if (errors.length > 0) {
                suggestions.push('请检查化学成分数据的准确性');
            }
            
            if (composition.Cr < 12) {
                suggestions.push('建议选择铬含量≥12%的材料确保不锈钢性能');
            }
            
            if (composition.C > 0.08 && composition.Ti === 0 && composition.Nb === 0) {
                suggestions.push('高碳材料建议添加Ti或Nb稳定化元素');
            }
            
            return suggestions;
        }
    },
    
    // 智能推荐
    smartRecommendation: {
        // 根据应用场景推荐材料
        recommendByApplication(application, requirements = {}) {
            const cacheKey = `recommendation_${application}_${JSON.stringify(requirements)}`;
            
            if (IntelligentAnalysis.cache.has(cacheKey)) {
                return IntelligentAnalysis.cache.get(cacheKey);
            }
            
            const recommendations = [];
            const applicationMap = this.getApplicationMap();
            
            const suggested = applicationMap[application] || [];
            
            if (!window.AppState || !window.AppState.allData) {
                return [];
            }
            
            suggested.forEach(grade => {
                const materials = window.AppState.allData.filter(item => 
                    item.name === grade || 
                    item.USN === grade || 
                    (item.global && Object.values(item.global).includes(grade))
                );
                
                materials.forEach(material => {
                    const suitability = this.calculateSuitability(application, material, requirements);
                    if (suitability >= 60) {
                        recommendations.push({
                            material: material,
                            reason: this.getRecommendationReason(application, material),
                            suitability: suitability,
                            pros: this.getAdvantages(application, material),
                            cons: this.getDisadvantages(application, material),
                            cost: this.estimateCost(material)
                        });
                    }
                });
            });
            
            const result = recommendations
                .sort((a, b) => b.suitability - a.suitability)
                .slice(0, IntelligentAnalysis.config.maxSuggestions);
            
            // 缓存结果
            IntelligentAnalysis.cache.set(cacheKey, result);
            setTimeout(() => {
                IntelligentAnalysis.cache.delete(cacheKey);
            }, IntelligentAnalysis.config.cacheTimeout);
            
            return result;
        },
        
        getApplicationMap() {
            return {
                '食品加工': ['316L', '304', '316', '321'],
                '化工设备': ['316L', '317L', '904L', '2205', '2507'],
                '海洋环境': ['316L', '317L', '2205', '254SMO', '2507'],
                '高温应用': ['310S', '321', '347', '309S'],
                '装饰用途': ['304', '201', '430', '409'],
                '医疗器械': ['316LVM', '316L', '304'],
                '汽车部件': ['409', '430', '304', '316'],
                '建筑结构': ['304', '316', '430', '2205'],
                '石油化工': ['316L', '317L', '904L', '2507'],
                '核工业': ['304L', '316L', '347'],
                '航空航天': ['321', '347', '15-5PH', '17-4PH'],
                '制药工业': ['316L', '304L', '321']
            };
        },
        
        calculateSuitability(application, material, requirements) {
            let score = 50; // 基础分
            
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            const corrosionRes = IntelligentAnalysis.performancePrediction.predictCorrosionResistance(material);
            const mechanical = IntelligentAnalysis.performancePrediction.predictMechanicalProperties(material);
            
            // 根据应用场景调整评分
            switch (application) {
                case '食品加工':
                    if (composition.Ni >= 8) score += 20;
                    if (composition.Mo >= 2) score += 15;
                    if (composition.C <= 0.03) score += 15;
                    if (corrosionRes.score >= 70) score += 10;
                    break;
                    
                case '海洋环境':
                    if (composition.Mo >= 2) score += 25;
                    if (composition.Cr >= 17) score += 20;
                    if (composition.N >= 0.1) score += 10;
                    if (corrosionRes.score >= 80) score += 15;
                    break;
                    
                case '高温应用':
                    if (composition.Cr >= 20) score += 25;
                    if (composition.Ni >= 10) score += 15;
                    if (composition.Si >= 1) score += 10;
                    if (material.type && material.type.includes('奥氏体')) score += 10;
                    break;
                    
                case '化工设备':
                    if (composition.Mo >= 2) score += 20;
                    if (composition.Cr >= 18) score += 15;
                    if (corrosionRes.score >= 75) score += 15;
                    break;
                    
                case '装饰用途':
                    if (mechanical.ductility >= 70) score += 15;
                    if (composition.C <= 0.08) score += 10;
                    score += 10; // 成本因素
                    break;
            }
            
            // 考虑特殊要求
            if (requirements.temperature && requirements.temperature > 600) {
                if (composition.Cr >= 20) score += 15;
                else score -= 10;
            }
            
            if (requirements.strength && requirements.strength === 'high') {
                score += mechanical.strength * 0.2;
            }
            
            return Math.min(100, Math.max(0, score));
        },
        
        getRecommendationReason(application, material) {
            const reasons = {
                '食品加工': '优异的耐腐蚀性和卫生性能，符合食品安全标准',
                '化工设备': '良好的耐化学腐蚀性能，适合化工介质',
                '海洋环境': '优秀的抗氯离子腐蚀能力，适合海洋大气环境',
                '高温应用': '良好的高温强度和抗氧化性，适合高温工况',
                '装饰用途': '良好的表面质量和成本效益，适合装饰应用',
                '医疗器械': '生物相容性好，耐腐蚀性优异',
                '汽车部件': '良好的成形性和耐腐蚀性，适合汽车环境',
                '建筑结构': '结构强度好，耐候性优异'
            };
            
            return reasons[application] || '综合性能良好，适合该应用';
        },
        
        getAdvantages(application, material) {
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            const advantages = [];
            
            if (composition.Cr >= 18) advantages.push('优异的耐腐蚀性');
            if (composition.Ni >= 8) advantages.push('良好的韧性和延展性');
            if (composition.Mo >= 2) advantages.push('优秀的抗点蚀能力');
            if (composition.C <= 0.03) advantages.push('低碳，抗敏化性能好');
            if (material.type && material.type.includes('奥氏体')) advantages.push('无磁性，易加工');
            
            return advantages;
        },
        
        getDisadvantages(application, material) {
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            const disadvantages = [];
            
            if (composition.Ni >= 10) disadvantages.push('成本较高');
            if (material.type && material.type.includes('马氏体')) disadvantages.push('韧性相对较低');
            if (composition.C > 0.08) disadvantages.push('可能存在敏化风险');
            if (composition.Cr < 16) disadvantages.push('耐腐蚀性有限');
            
            return disadvantages;
        },
        
        estimateCost(material) {
            const composition = IntelligentAnalysis.similarityAnalysis.normalizeComposition(material);
            let costIndex = 1.0;
            
            // 镍含量对成本影响最大
            costIndex += composition.Ni * 0.15;
            // 钼含量影响
            costIndex += composition.Mo * 0.1;
            // 其他合金元素
            costIndex += (composition.Cu + composition.Ti + composition.Nb) * 0.05;
            
            if (costIndex <= 1.2) return { level: '低', color: '#10B981' };
            if (costIndex <= 1.8) return { level: '中', color: '#F59E0B' };
            return { level: '高', color: '#EF4444' };
        }
    },
    
    // 趋势分析
    trendAnalysis: {
        // 分析搜索趋势
        analyzeSearchTrends() {
            const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
            const trends = {};
            const timeAnalysis = {};
            
            searchHistory.forEach(search => {
                const term = search.query.toLowerCase();
                trends[term] = (trends[term] || 0) + 1;
                
                // 时间分析
                const date = new Date(search.timestamp || Date.now()).toDateString();
                timeAnalysis[date] = (timeAnalysis[date] || 0) + 1;
            });
            
            const sortedTrends = Object.entries(trends)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([term, count]) => ({ term, count, percentage: (count / searchHistory.length * 100).toFixed(1) }));
            
            return {
                topSearches: sortedTrends,
                totalSearches: searchHistory.length,
                uniqueTerms: Object.keys(trends).length,
                averageSearchesPerTerm: (searchHistory.length / Object.keys(trends).length || 0).toFixed(1),
                timeDistribution: timeAnalysis,
                insights: this.generateSearchInsights(sortedTrends, searchHistory)
            };
        },
        
        generateSearchInsights(trends, history) {
            const insights = [];
            
            if (trends.length > 0) {
                insights.push(`最受关注的材料是 "${trends[0].term}"，占搜索量的 ${trends[0].percentage}%`);
            }
            
            const recentSearches = history.filter(s => 
                Date.now() - new Date(s.timestamp || 0).getTime() < 7 * 24 * 60 * 60 * 1000
            );
            
            if (recentSearches.length > history.length * 0.3) {
                insights.push('近期搜索活跃度较高');
            }
            
            const materialTypes = {};
            history.forEach(search => {
                if (search.query.includes('316')) materialTypes['316系列'] = (materialTypes['316系列'] || 0) + 1;
                if (search.query.includes('304')) materialTypes['304系列'] = (materialTypes['304系列'] || 0) + 1;
                if (search.query.includes('双相')) materialTypes['双相钢'] = (materialTypes['双相钢'] || 0) + 1;
            });
            
            const topType = Object.entries(materialTypes).sort(([,a], [,b]) => b - a)[0];
            if (topType) {
                insights.push(`${topType[0]} 是最受关注的材料类型`);
            }
            
            return insights;
        }
    },
    
    // 初始化方法
    init() {
        console.log('🧠 智能分析模块初始化...');
        
        this.setupEventListeners();
        this.loadCachedData();
        this.startBackgroundTasks();
        
        console.log('✅ 智能分析模块初始化完成');
    },
    
    setupEventListeners() {
        // 监听搜索事件
        document.addEventListener('searchPerformed', (event) => {
            this.recordSearchEvent(event.detail);
        });
        
        // 监听比较事件
        document.addEventListener('comparisonUpdated', (event) => {
            this.recordComparisonEvent(event.detail);
        });
    },
    
    loadCachedData() {
        // 加载缓存的分析数据
        const cachedAnalysis = localStorage.getItem('intelligentAnalysisCache');
        if (cachedAnalysis) {
            try {
                const data = JSON.parse(cachedAnalysis);
                if (Date.now() - data.timestamp < this.config.cacheTimeout) {
                    console.log('📊 加载缓存的分析数据');
                }
            } catch (error) {
                console.warn('缓存数据解析失败:', error);
            }
        }
    },
    
    startBackgroundTasks() {
        // 定期清理缓存
        setInterval(() => {
            this.cleanupCache();
        }, 60000); // 每分钟清理一次
        
        // 定期分析趋势
        setInterval(() => {
            this.performBackgroundAnalysis();
        }, 300000); // 每5分钟分析一次
    },
    
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp && now - value.timestamp > this.config.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    },
    
    performBackgroundAnalysis() {
        try {
            const trends = this.trendAnalysis.analyzeSearchTrends();
            
            // 存储分析结果
            localStorage.setItem('intelligentAnalysisCache', JSON.stringify({
                trends: trends,
                timestamp: Date.now()
            }));
            
            console.log('📈 后台智能分析完成');
        } catch (error) {
            console.error('后台分析出错:', error);
        }
    },
    
    recordSearchEvent(searchData) {
        // 记录搜索事件用于趋势分析
        const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        searchHistory.push({
            query: searchData.query,
            timestamp: Date.now(),
            resultsCount: searchData.resultsCount || 0
        });
        
        // 保持最近1000条记录
        if (searchHistory.length > 1000) {
            searchHistory.splice(0, searchHistory.length - 1000);
        }
        
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    },
    
    recordComparisonEvent(comparisonData) {
        // 记录比较事件
        const comparisonHistory = JSON.parse(localStorage.getItem('comparisonHistory') || '[]');
        comparisonHistory.push({
            materials: comparisonData.materials,
            timestamp: Date.now()
        });
        
        // 保持最近500条记录
        if (comparisonHistory.length > 500) {
            comparisonHistory.splice(0, comparisonHistory.length - 500);
        }
        
        localStorage.setItem('comparisonHistory', JSON.stringify(comparisonHistory));
    }
};

// 自动初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            IntelligentAnalysis.init();
        });
    } else {
        IntelligentAnalysis.init();
    }
    
    // 导出到全局
    window.IntelligentAnalysis = IntelligentAnalysis;
}