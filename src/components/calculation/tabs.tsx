'use client';

import React, { useMemo } from 'react';
import { useCalculationStore } from '@/stores/calculation-store';
import { getEnergyStructureData, getExtendedEmissionData } from '@/data/calculation-data';
import type { DataSourceRecord } from '@/types';
import {
  Database, CheckCircle2, BarChart3, AlertTriangle, TrendingDown,
  Zap, Building2, Leaf, Bus, Trash2, Droplets, Plane,
  ShoppingCart, Package, Truck,
} from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart, BarChart as EBarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([TitleComponent, TooltipComponent, LegendComponent, GridComponent, PieChart, EBarChart, LineChart, CanvasRenderer]);

// ========== 数据源概览标签页 ==========
export function OverviewTab() {
  const { records, period } = useCalculationStore();

  const stats = useMemo(() => {
    const periodRecords = records.filter((r) => r.period === period);
    const total = periodRecords.length;
    const collected = periodRecords.filter((r) => r.status !== 'missing').length;
    const missing = periodRecords.filter((r) => r.status === 'missing').length;
    const abnormal = periodRecords.filter((r) => r.status === 'abnormal').length;
    const evidenceComplete = periodRecords.filter((r) => r.evidenceStatus === 'complete').length;
    const coverage = total > 0 ? Math.round((evidenceComplete / total) * 100) : 0;

    // 按数据分类统计
    const byType: Record<string, { total: number; collected: number; missing: number; icon: React.ReactNode; color: string }> = {};
    periodRecords.forEach((r) => {
      const cls = r.dataClassification ?? '其他';
      if (!byType[cls]) {
        const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
          '外购电力': { icon: <Zap className="w-4 h-4" />, color: 'text-blue-400' },
          '天然气': { icon: <Zap className="w-4 h-4" />, color: 'text-orange-400' },
          '外购热力': { icon: <Zap className="w-4 h-4" />, color: 'text-red-400' },
          '车辆燃油': { icon: <Bus className="w-4 h-4" />, color: 'text-yellow-400' },
          '可再生能源': { icon: <Leaf className="w-4 h-4" />, color: 'text-green-400' },
          '外购绿电': { icon: <Leaf className="w-4 h-4" />, color: 'text-emerald-400' },
          '制冷剂': { icon: <AlertTriangle className="w-4 h-4" />, color: 'text-purple-400' },
          '用水': { icon: <Droplets className="w-4 h-4" />, color: 'text-sky-400' },
          '通勤': { icon: <Bus className="w-4 h-4" />, color: 'text-amber-400' },
          '差旅': { icon: <Plane className="w-4 h-4" />, color: 'text-indigo-400' },
          '废弃物': { icon: <Trash2 className="w-4 h-4" />, color: 'text-rose-400' },
          '组织边界': { icon: <Building2 className="w-4 h-4" />, color: 'text-slate-400' },
          '排放因子': { icon: <Database className="w-4 h-4" />, color: 'text-cyan-400' },
          '凭证': { icon: <Database className="w-4 h-4" />, color: 'text-teal-400' },
          '其他燃料': { icon: <Zap className="w-4 h-4" />, color: 'text-pink-400' },
        };
        byType[cls] = { total: 0, collected: 0, missing: 0, ...(iconMap[cls] ?? { icon: <Database className="w-4 h-4" />, color: 'text-slate-400' }) };
      }
      byType[cls].total++;
      if (r.status !== 'missing') byType[cls].collected++;
      if (r.status === 'missing') byType[cls].missing++;
    });

    return { total, collected, missing, abnormal, coverage, byType };
  }, [records, period]);

  return (
    <div className="space-y-4">
      {/* 核心统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<Database className="w-4 h-4 text-cyan-400" />} label="数据源总数" value={String(stats.total)} suffix="项" color="text-white" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4 text-green-400" />} label="已采集数" value={String(stats.collected)} suffix="项" color="text-green-400" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-red-400" />} label="缺失数" value={String(stats.missing)} suffix="项" color="text-red-400" />
        <StatCard icon={<AlertTriangle className="w-4 h-4 text-orange-400" />} label="异常数" value={String(stats.abnormal)} suffix="项" color="text-orange-400" />
        <StatCard icon={<BarChart3 className="w-4 h-4 text-cyan-400" />} label="凭证覆盖率" value={`${stats.coverage}`} suffix="%" color="text-cyan-400" />
      </div>

      {/* 数据源分类列表 */}
      <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
        <h3 className="font-medium mb-3">数据源分类详情</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(stats.byType).map(([name, data]) => (
            <div key={name} className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-3">
              <div className={data.color}>{data.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{name}</div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{data.collected}/{data.total} 已采集</span>
                  {data.missing > 0 && <span className="text-red-400">{data.missing} 缺失</span>}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${data.collected === data.total ? 'text-green-400' : 'text-orange-400'}`}>
                  {data.total > 0 ? Math.round((data.collected / data.total) * 100) : 0}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, suffix, color }: { icon: React.ReactNode; label: string; value: string; suffix: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
      <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">{icon}{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}<span className="text-xs text-slate-500 ml-1">{suffix}</span></div>
    </div>
  );
}

// ========== 能源结构分析标签页 ==========
export function EnergyStructureTab() {
  const { calculationResult, standard, period } = useCalculationStore();
  const energyData = useMemo(() => getEnergyStructureData(), []);

  // 饼图数据
  const pieOption = useMemo(() => ({
    tooltip: { trigger: 'item' as const, formatter: '{b}: {c} tCO₂ ({d}%)' },
    legend: { bottom: 0, textStyle: { color: '#94a3b8', fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#0f172a', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e2e8f0' } },
      data: [
        { value: calculationResult?.emissionByEnergyType.electricity ?? energyData.scope2Emission, name: '电力', itemStyle: { color: '#3488ff' } },
        { value: calculationResult?.emissionByEnergyType.natural_gas ?? energyData.scope1Emission * 0.4, name: '天然气', itemStyle: { color: '#ff7b25' } },
        { value: calculationResult?.emissionByEnergyType.heat ?? energyData.scope1Emission * 0.2, name: '热力', itemStyle: { color: '#ef4444' } },
        { value: Math.abs(calculationResult?.emissionByEnergyType.diesel ?? 10), name: '燃油', itemStyle: { color: '#eab308' } },
        { value: Math.abs(calculationResult?.emissionByEnergyType.solar ?? 160), name: '光伏抵扣', itemStyle: { color: '#36d968' } },
        { value: Math.abs(calculationResult?.emissionByEnergyType.refrigerant ?? 26), name: '制冷剂', itemStyle: { color: '#a855f7' } },
      ],
    }],
  }), [calculationResult, energyData]);

  // 柱状图数据
  const barOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['范围一', '范围二'], textStyle: { color: '#94a3b8' } },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: energyData.buildingRanking.map((b) => b.buildingName), axisLabel: { color: '#94a3b8', fontSize: 11 } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e3a5f' } } },
    series: [
      { name: '范围一', type: 'bar', stack: 'total', data: [125, 95, 80, 45, 60], itemStyle: { color: '#ff7b25' } },
      { name: '范围二', type: 'bar', stack: 'total', data: [160, 70, 85, 80, 55], itemStyle: { color: '#3488ff' } },
    ],
  }), [energyData]);

  // 趋势图
  const trendOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['单位面积强度', '人均强度'], textStyle: { color: '#94a3b8' } },
    grid: { left: 50, right: 20, bottom: 30, top: 40 },
    xAxis: { type: 'category' as const, data: energyData.intensityTrend.map((t) => t.month), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e3a5f' } } },
    series: [
      { name: '单位面积强度', type: 'line', data: energyData.intensityTrend.map((t) => t.perArea), smooth: true, lineStyle: { color: '#3488ff' }, itemStyle: { color: '#3488ff' } },
      { name: '人均强度', type: 'line', data: energyData.intensityTrend.map((t) => t.perCapita), smooth: true, lineStyle: { color: '#36d968' }, itemStyle: { color: '#36d968' } },
    ],
  }), [energyData]);

  return (
    <div className="space-y-4">
      {/* 排放指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Zap className="w-4 h-4 text-orange-400" />} label="范围一排放" value={String(calculationResult?.scope1Emission ?? energyData.scope1Emission)} suffix="tCO₂" color="text-orange-400" />
        <StatCard icon={<Zap className="w-4 h-4 text-blue-400" />} label="范围二排放" value={String(calculationResult?.scope2Emission ?? energyData.scope2Emission)} suffix="tCO₂" color="text-blue-400" />
        <StatCard icon={<TrendingDown className="w-4 h-4 text-green-400" />} label="光伏减排" value={String(Math.abs(calculationResult?.emissionByEnergyType.solar ?? energyData.solarReduction))} suffix="tCO₂" color="text-green-400" />
        <StatCard icon={<BarChart3 className="w-4 h-4 text-cyan-400" />} label="同比变化" value={`${energyData.yoyComparison.change}%`} suffix="" color={energyData.yoyComparison.change < 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
          <h3 className="font-medium mb-2">排放结构占比</h3>
          <ReactEChartsCore echarts={echarts} option={pieOption} style={{ height: 300 }} />
        </div>
        <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
          <h3 className="font-medium mb-2">建筑碳排放对比</h3>
          <ReactEChartsCore echarts={echarts} option={barOption} style={{ height: 300 }} />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
        <h3 className="font-medium mb-2">排放强度趋势</h3>
        <ReactEChartsCore echarts={echarts} option={trendOption} style={{ height: 280 }} />
      </div>

      {/* 建筑排名 */}
      <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-cyan-400" />
          <span className="font-medium">建筑碳排排名</span>
        </div>
        <div className="space-y-3">
          {energyData.buildingRanking.map((building, index) => (
            <div key={building.buildingId} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? 'bg-red-500/20 text-red-400' :
                  index === 1 ? 'bg-orange-500/20 text-orange-400' :
                  index === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{index + 1}</span>
                <span className="text-sm">{building.buildingName}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{building.emission} t</div>
                <div className="text-xs text-slate-500">{building.intensity} kgCO₂/m²</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== 扩展排放标签页 ==========
export function ExtendedEmissionTab() {
  const { records, addRecord, updateRecord, batchLocked, period } = useCalculationStore();
  const extendedData = useMemo(() => getExtendedEmissionData(), []);

  const [showAddExtended, setShowAddExtended] = React.useState(false);
  const [newItem, setNewItem] = React.useState({ name: '', category: '师生通勤', value: '', unit: 'tCO₂' });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const extendedItems = useMemo(() => {
    const items = [
      { id: 'ext-1', name: '师生通勤', emission: extendedData.commuteEmission.main + extendedData.commuteEmission.east, factor: 0.255, formula: '人数 × 距离 × 排放因子', icon: <Bus className="w-5 h-5 text-amber-400" />, color: 'text-amber-400' },
      { id: 'ext-2', name: '公务差旅', emission: 2.1, factor: 0.255, formula: '航程 × 排放因子', icon: <Plane className="w-5 h-5 text-indigo-400" />, color: 'text-indigo-400' },
      { id: 'ext-3', name: '采购排放', emission: 45, factor: 0.12, formula: '采购额 × 排放因子', icon: <ShoppingCart className="w-5 h-5 text-purple-400" />, color: 'text-purple-400' },
      { id: 'ext-4', name: '废弃物处理', emission: extendedData.wasteEmission.main + extendedData.wasteEmission.east, factor: 0.1506, formula: '废弃物量 × 排放因子', icon: <Trash2 className="w-5 h-5 text-rose-400" />, color: 'text-rose-400' },
      { id: 'ext-5', name: '用水间接排放', emission: 16.8, factor: 0.00091, formula: '用水量 × 排放因子', icon: <Droplets className="w-5 h-5 text-sky-400" />, color: 'text-sky-400' },
      { id: 'ext-6', name: '物流运输', emission: 8.5, factor: 0.18, formula: '运输量 × 距离 × 排放因子', icon: <Truck className="w-5 h-5 text-orange-400" />, color: 'text-orange-400' },
      { id: 'ext-7', name: '资本品', emission: 32, factor: 0.08, formula: '资产价值 × 排放因子', icon: <Package className="w-5 h-5 text-teal-400" />, color: 'text-teal-400' },
    ];
    return items;
  }, [extendedData]);

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [showFormula, setShowFormula] = React.useState<string | null>(null);

  const handleAddExtended = () => {
    const errs: Record<string, string> = {};
    if (!newItem.name.trim()) errs.name = '请输入项目名称';
    if (!newItem.value || isNaN(Number(newItem.value))) errs.value = '请输入有效数值';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    addRecord({
      id: `ds-ext-${Date.now()}`,
      sourceCode: 'S-A15',
      sourceName: newItem.name,
      category: 'extended',
      emissionScope: 'scope3',
      dataClassification: newItem.category,
      campus: '主校区',
      period,
      value: Number(newItem.value),
      unit: newItem.unit,
      emissionValue: Number(newItem.value),
      source: 'manual',
      status: 'normal',
      auditStatus: 'pending',
      evidenceStatus: 'missing',
      attachmentCount: 0,
      relatedEvidences: [],
      modifyRecords: [],
      auditRecords: [{ time: new Date().toLocaleString('zh-CN'), operator: '当前用户', action: '新增', remark: '扩展排放项目' }],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: '当前用户',
    });
    setShowAddExtended(false);
    setNewItem({ name: '', category: '师生通勤', value: '', unit: 'tCO₂' });
  };

  // 趋势图
  const trendOption = useMemo(() => ({
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['范围三占比'], textStyle: { color: '#94a3b8' } },
    grid: { left: 50, right: 20, bottom: 30, top: 30 },
    xAxis: { type: 'category' as const, data: extendedData.extendedRatioTrend.map((t) => t.month), axisLabel: { color: '#94a3b8' } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#94a3b8' }, splitLine: { lineStyle: { color: '#1e3a5f' } } },
    series: [{
      name: '范围三占比',
      type: 'line',
      data: extendedData.extendedRatioTrend.map((t) => t.ratio),
      smooth: true,
      areaStyle: { color: 'rgba(168, 85, 247, 0.15)' },
      lineStyle: { color: '#a855f7' },
      itemStyle: { color: '#a855f7' },
    }],
  }), [extendedData]);

  return (
    <div className="space-y-4">
      {/* 完成率 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard icon={<BarChart3 className="w-4 h-4 text-purple-400" />} label="范围三完成率" value={`${extendedData.completionRate}`} suffix="%" color="text-purple-400" />
        <StatCard icon={<Leaf className="w-4 h-4 text-green-400" />} label="绿证减排" value={`${extendedData.greenCertReduction}`} suffix="tCO₂" color="text-green-400" />
        <StatCard icon={<Leaf className="w-4 h-4 text-emerald-400" />} label="碳汇抵消" value={`${extendedData.carbonSinkReduction}`} suffix="tCO₂" color="text-emerald-400" />
      </div>

      {/* 排放项目列表 */}
      <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">范围三排放项目</h3>
          <button
            onClick={() => setShowAddExtended(true)}
            disabled={batchLocked}
            className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 transition-all disabled:opacity-50"
          >
            + 新增项目
          </button>
        </div>
        <div className="space-y-2">
          {extendedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              <div className={item.color}>{item.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.name}</div>
                <div className="text-xs text-slate-500">排放因子: {item.factor} · {item.formula}</div>
              </div>
              <div className="text-right">
                {editingId === item.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-20 bg-slate-700 border border-blue-600 rounded px-2 py-1 text-xs" disabled={batchLocked} />
                    <button onClick={() => { setEditingId(null); }} className="text-xs text-slate-400 hover:text-white">取消</button>
                    <button onClick={() => { setEditingId(null); }} className="text-xs text-cyan-400 hover:text-cyan-300" disabled={batchLocked}>保存</button>
                  </div>
                ) : (
                  <div>
                    <div className="text-sm font-bold">{item.emission} <span className="text-xs text-slate-500 font-normal">tCO₂</span></div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowFormula(showFormula === item.id ? null : item.id)} className="p-1 hover:bg-slate-700 rounded text-xs text-slate-400">公式</button>
                <button onClick={() => { setEditingId(item.id); setEditValue(String(item.emission)); }} disabled={batchLocked} className="p-1 hover:bg-slate-700 rounded text-xs text-slate-400 disabled:opacity-50">编辑</button>
              </div>
            </div>
          ))}
        </div>

        {/* 公式显示 */}
        {showFormula && (
          <div className="mt-3 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
            <div className="text-sm text-purple-300">
              {extendedItems.find((i) => i.id === showFormula)?.name} 计算公式:
            </div>
            <div className="text-sm font-mono text-purple-200 mt-1">
              {extendedItems.find((i) => i.id === showFormula)?.formula}
            </div>
          </div>
        )}
      </div>

      {/* 新增表单 */}
      {showAddExtended && (
        <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
          <h3 className="font-medium mb-3">新增扩展排放项目</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">项目名称 <span className="text-red-400">*</span></label>
              <input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">分类</label>
              <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option>师生通勤</option>
                <option>商务差旅</option>
                <option>采购</option>
                <option>废弃物</option>
                <option>用水</option>
                <option>物流运输</option>
                <option>资本品</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">活动数据 <span className="text-red-400">*</span></label>
              <input type="number" value={newItem.value} onChange={(e) => setNewItem({ ...newItem, value: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">单位</label>
              <input value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setShowAddExtended(false)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
            <button onClick={handleAddExtended} className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">保存</button>
          </div>
        </div>
      )}

      {/* 趋势图 */}
      <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
        <h3 className="font-medium mb-2">范围三占比趋势</h3>
        <ReactEChartsCore echarts={echarts} option={trendOption} style={{ height: 250 }} />
      </div>
    </div>
  );
}
