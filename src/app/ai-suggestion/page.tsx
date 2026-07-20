'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Lightbulb, 
  FileText, 
  CheckCircle, 
  XCircle,
  Calculator,
  Leaf,
  TrendingUp,
  Clock,
  AlertTriangle,
  ChevronRight,
  Zap
} from 'lucide-react';
import { getAISuggestion, formatNumber, measures } from '@/data/mock-data';

// 证据卡片组件
function EvidenceCard({ evidence, index }: { evidence: string; index: number }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
        {index + 1}
      </div>
      <p className="text-sm text-slate-700 flex-1">{evidence}</p>
    </div>
  );
}

// 原因候选组件
function CauseCard({ name, confidence }: { name: string; confidence: number }) {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return 'bg-green-100 text-green-700 border-green-200';
    if (conf >= 0.4) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-orange-500" />
        <span className="font-medium">{name}</span>
      </div>
      <Badge className={getConfidenceColor(confidence)}>
        置信度 {Math.round(confidence * 100)}%
      </Badge>
    </div>
  );
}

// 措施建议卡片
function MeasureSuggestionCard({ 
  measure, 
  selected, 
  onToggle 
}: { 
  measure: {
    measureId: string;
    name: string;
    applicability: 'high' | 'medium' | 'low';
    estimatedSavings: { energy: number; emission: number; cost: number };
    investment: number;
    paybackPeriod: number;
  };
  selected: boolean;
  onToggle: () => void;
}) {
  const applicabilityColors = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-600'
  };

  return (
    <Card className={`cursor-pointer transition-all ${selected ? 'ring-2 ring-blue-500' : ''}`} onClick={onToggle}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">{measure.name}</h4>
            <Badge className={`mt-1 ${applicabilityColors[measure.applicability]}`}>
              {measure.applicability === 'high' ? '高适用性' : measure.applicability === 'medium' ? '中等适用' : '低适用性'}
            </Badge>
          </div>
          {selected && (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-slate-500">年节电量</p>
            <p className="font-semibold text-green-600">{formatNumber(measure.estimatedSavings.energy)} kWh</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">年减排量</p>
            <p className="font-semibold text-green-600">{measure.estimatedSavings.emission.toFixed(2)} tCO₂</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">年节省</p>
            <p className="font-semibold text-green-600">{formatNumber(measure.estimatedSavings.cost)} 元</p>
          </div>
        </div>
        
        <Separator className="my-3" />
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">投资额: {formatNumber(measure.investment)} 元</span>
          <span className="text-slate-500">回收期: {measure.paybackPeriod} 年</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AISuggestionPage() {
  const suggestion = useMemo(() => getAISuggestion('anom-001'), []);
  
  const [selectedMeasures, setSelectedMeasures] = useState<Set<string>>(
    new Set(suggestion.measures.slice(0, 2).map(m => m.measureId))
  );
  const [assumptions, setAssumptions] = useState({
    savingRate: 15,
    electricityPrice: 0.8,
    investmentRatio: 100
  });

  const toggleMeasure = (measureId: string) => {
    setSelectedMeasures(prev => {
      const next = new Set(prev);
      if (next.has(measureId)) {
        next.delete(measureId);
      } else {
        next.add(measureId);
      }
      return next;
    });
  };

  // 计算综合效益
  const calculateTotalSavings = () => {
    const selectedMeasuresData = suggestion.measures.filter(m => selectedMeasures.has(m.measureId));
    const totalEnergy = selectedMeasuresData.reduce((sum, m) => sum + m.estimatedSavings.energy, 0);
    const totalEmission = selectedMeasuresData.reduce((sum, m) => sum + m.estimatedSavings.emission, 0);
    const totalCost = selectedMeasuresData.reduce((sum, m) => sum + m.estimatedSavings.cost, 0);
    const totalInvestment = selectedMeasuresData.reduce((sum, m) => sum + m.investment, 0);
    
    // 根据假设参数调整
    const adjustedEnergy = totalEnergy * (assumptions.savingRate / 15);
    const adjustedCost = adjustedEnergy * assumptions.electricityPrice;
    const adjustedInvestment = totalInvestment * (assumptions.investmentRatio / 100);
    
    return {
      energy: adjustedEnergy,
      emission: totalEmission * (assumptions.savingRate / 15),
      cost: adjustedCost,
      investment: adjustedInvestment,
      payback: adjustedInvestment / adjustedCost
    };
  };

  const totalSavings = calculateTotalSavings();

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">AI 减排建议</h1>
            <p className="text-sm text-slate-500 mt-1">基于异常证据的智能分析与减排方案推荐</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700">AI 辅助</Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：证据与原因 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 证据汇总 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  证据汇总
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestion.evidence.map((evidence, index) => (
                  <EvidenceCard key={index} evidence={evidence} index={index} />
                ))}
              </CardContent>
            </Card>

            {/* 原因候选 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  原因候选
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestion.causes.map((cause, index) => (
                  <CauseCard key={index} name={cause.name} confidence={cause.confidence} />
                ))}
                <p className="text-xs text-slate-400 mt-2">
                  * 原因为AI推测，请现场确认
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：措施与效益 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 措施选择 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  建议措施 (已选择 {selectedMeasures.size} 项)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {suggestion.measures.map((measure) => (
                    <MeasureSuggestionCard
                      key={measure.measureId}
                      measure={measure}
                      selected={selectedMeasures.has(measure.measureId)}
                      onToggle={() => toggleMeasure(measure.measureId)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 假设调整 */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  假设参数调整
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">节能率假设</span>
                    <span className="text-sm font-medium">{assumptions.savingRate}%</span>
                  </div>
                  <Slider
                    value={[assumptions.savingRate]}
                    onValueChange={([value]) => setAssumptions(prev => ({ ...prev, savingRate: value }))}
                    min={5}
                    max={30}
                    step={1}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">电价假设 (元/kWh)</span>
                    <span className="text-sm font-medium">{assumptions.electricityPrice}</span>
                  </div>
                  <Slider
                    value={[assumptions.electricityPrice]}
                    onValueChange={([value]) => setAssumptions(prev => ({ ...prev, electricityPrice: value }))}
                    min={0.5}
                    max={1.2}
                    step={0.05}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">投资比例</span>
                    <span className="text-sm font-medium">{assumptions.investmentRatio}%</span>
                  </div>
                  <Slider
                    value={[assumptions.investmentRatio]}
                    onValueChange={([value]) => setAssumptions(prev => ({ ...prev, investmentRatio: value }))}
                    min={50}
                    max={150}
                    step={10}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 综合效益 */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">综合效益预测</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">年节电量</p>
                    <p className="text-xl font-bold text-slate-900">{formatNumber(totalSavings.energy)}</p>
                    <p className="text-xs text-slate-400">kWh</p>
                  </div>
                  <div className="text-center">
                    <Leaf className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">年减排量</p>
                    <p className="text-xl font-bold text-green-600">{totalSavings.emission.toFixed(2)}</p>
                    <p className="text-xs text-slate-400">tCO₂</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">年节省</p>
                    <p className="text-xl font-bold text-green-600">{formatNumber(totalSavings.cost)}</p>
                    <p className="text-xs text-slate-400">元</p>
                  </div>
                  <div className="text-center">
                    <Calculator className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">投资额</p>
                    <p className="text-xl font-bold text-slate-900">{formatNumber(totalSavings.investment)}</p>
                    <p className="text-xs text-slate-400">元</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">回收期</p>
                    <p className="text-xl font-bold text-slate-900">{totalSavings.payback.toFixed(1)}</p>
                    <p className="text-xs text-slate-400">年</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <Button className="flex-1" size="lg">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    采纳并转项目
                  </Button>
                  <Button variant="outline" size="lg">
                    <XCircle className="w-4 h-4 mr-2" />
                    驳回
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 免责声明 */}
            <div className="text-xs text-slate-400 p-4 bg-slate-50 rounded-lg">
              <p className="font-medium mb-1">免责声明</p>
              <p>本建议基于历史数据和规则匹配生成，节能效果受实际运行条件、天气、使用习惯等因素影响。建议现场核实后再实施。投资决策请以财务部门审核为准。</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}