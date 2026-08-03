'use client';

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Target, Zap, Droplets, Flame, Thermometer,
  Lightbulb, AlertTriangle, CheckCircle2, ArrowRight, Building2,
  ChevronDown, ChevronUp, Clock, Info, ThumbsUp, CalendarDays,
} from 'lucide-react';
import {
  getDiagnosisSummary, getBenchmarkComparison, getEnergyFlowSankey,
  getAIRootCauseAnalysis, getEnergySavingAdvices,
  getCalendarHeatmapDays, getTypicalDayComparison, getSemesterComparison, getEnergyProfile,
} from '@/data/energy-three-pages-data';
import type {
  DiagnosisSummary, BenchmarkComparison, BenchmarkBuildingItem, BenchmarkLine,
  SankeyNode, SankeyLink, AIRootCauseAnalysis, EnergySavingAdvice,
  CalendarHeatmapDay, LoadCurvePoint, TypicalDayComparison, SemesterComparison, EnergyProfile,
} from '@/types/energy';

// ============================================================
// 能效评分环形仪表
// ============================================================
function EfficiencyGauge({ diagnosis }: { diagnosis: DiagnosisSummary }) {
  const score = diagnosis.efficiencyScore;
  const color = score >= 85 ? '#22C55E' : score >= 70 ? '#EAB308' : score >= 55 ? '#F97316' : '#DC2626';
  const label = score >= 85 ? '优秀' : score >= 70 ? '良好' : score >= 55 ? '一般' : '较差';

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-card border border-border rounded-xl p-6 text-center">
      <h3 className="text-sm font-semibold text-foreground mb-4">综合能效评分</h3>
      <div className="relative inline-flex items-center justify-center">
        <svg width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r={radius} fill="none" stroke="var(--muted)" strokeWidth="12" />
          <circle
            cx="90" cy="90" r={radius} fill="none" stroke={color} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={`${progress} ${circumference - progress}`}
            transform="rotate(-90 90 90)" style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums" style={{ color }}>{score}</span>
          <span className="text-sm text-muted-foreground">分</span>
          <span className="text-xs mt-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '20', color }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 超标建筑统计
// ============================================================
function OverStandardStats({ diagnosis }: { diagnosis: DiagnosisSummary }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">超标概况</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-3xl font-bold text-red-600">{diagnosis.overStandardBuildings}</div>
          <div className="text-xs text-muted-foreground mt-1">超标楼宇</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-3xl font-bold text-orange-600">{diagnosis.totalOverStandard}%</div>
          <div className="text-xs text-muted-foreground mt-1">总超标率</div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm font-semibold text-green-700">
          <Lightbulb className="w-4 h-4" />
          预计节能潜力
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
          <span>电: {diagnosis.estimatedSavingPotential.electricity.toLocaleString()} kWh</span>
          <span>水: {diagnosis.estimatedSavingPotential.water.toLocaleString()} m³</span>
          <span>气: {diagnosis.estimatedSavingPotential.gas.toLocaleString()} m³</span>
          <span>热: {diagnosis.estimatedSavingPotential.heat.toLocaleString()} GJ</span>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-green-600 font-semibold">节省成本: ¥{diagnosis.estimatedSavingPotential.totalCostSaving.toLocaleString()}</span>
          <span className="text-green-600 font-semibold">减排: {diagnosis.estimatedSavingPotential.totalCarbonSaving} tCO₂</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 对标分析柱状图
// ============================================================
function BenchmarkChart({ benchmark }: { benchmark: BenchmarkComparison }) {
  const chartData = benchmark.buildings.map((b: BenchmarkBuildingItem) => ({
    name: b.buildingName,
    intensity: b.intensity,
    perCapita: b.perCapita,
    isOver: b.isOverStandard,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold text-foreground mb-2">
        对标分析 - {benchmark.buildingTypeName}
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
          <YAxis tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} unit=" kgce" />
          <Tooltip />
          <Bar dataKey="intensity" name="单位面积能耗" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isOver ? '#DC2626' : '#22C55E'} />
            ))}
          </Bar>
          {benchmark.benchmarks.map((bl: BenchmarkLine) => (
            <Bar key={bl.name} dataKey={() => bl.value} fill="transparent" stroke={bl.color}
              strokeWidth={2} strokeDasharray={bl.lineStyle === 'dashed' ? '5 5' : '0'} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        {benchmark.benchmarks.map((bl: BenchmarkLine) => (
          <div key={bl.name} className="flex items-center gap-1">
            <div className="w-3 h-0.5" style={{ backgroundColor: bl.color, borderStyle: bl.lineStyle === 'dashed' ? 'dashed' : 'solid' }} />
            {bl.name}: {bl.value} kgce/m²·a
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 桑基图（SVG自绘）
// ============================================================
function SankeyDiagram({ sankey }: { sankey: { period: string; nodes: SankeyNode[]; links: SankeyLink[]; totalInput: number; totalLoss: number; overallEfficiency: number } }) {
  const width = 700;
  const height = 320;
  const margin = { left: 10, right: 10, top: 20, bottom: 20 };

  const layers = useMemo(() => {
    const order = ['source', 'conversion', 'enduse', 'loss'];
    const grouped: Record<string, SankeyNode[]> = {};
    order.forEach(cat => { grouped[cat] = sankey.nodes.filter(n => n.category === cat); });
    return order.filter(cat => grouped[cat].length > 0).map(cat => grouped[cat]);
  }, [sankey.nodes]);

  const layerX = useMemo(() => {
    const w = width - margin.left - margin.right;
    const step = layers.length > 1 ? w / (layers.length - 1) : w / 2;
    return layers.map((_, i) => margin.left + i * step);
  }, [layers]);

  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number; w: number; h: number }> = {};
    layers.forEach((layer, li) => {
      const totalVal = layer.reduce((s, n) => s + n.value, 0);
      const availH = height - margin.top - margin.bottom - (layer.length - 1) * 8;
      let y = margin.top;
      layer.forEach(node => {
        const h = Math.max(12, (node.value / totalVal) * availH);
        positions[node.id] = { x: layerX[li], y, w: 24, h };
        y += h + 8;
      });
    });
    return positions;
  }, [layers, layerX]);

  const maxFlow = Math.max(...sankey.links.map(l => l.value), 1);

  const categoryColors: Record<string, string> = {
    source: '#3B82F6', conversion: '#8B5CF6', enduse: '#F59E0B', loss: '#EF4444',
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-foreground">校园能源流向图</h3>
        <span className="text-xs text-muted-foreground">{sankey.period}</span>
      </div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* 流向线 */}
        {sankey.links.map((link, i) => {
          const src = nodePositions[link.source];
          const tgt = nodePositions[link.target];
          if (!src || !tgt) return null;
          const opacity = 0.3 + (link.value / maxFlow) * 0.5;
          const srcX = src.x + src.w;
          const srcY = src.y + src.h / 2;
          const tgtX = tgt.x;
          const tgtY = tgt.y + tgt.h / 2;
          const cpX = (srcX + tgtX) / 2;
          return (
            <path key={i}
              d={`M${srcX},${srcY} C${cpX},${srcY} ${cpX},${tgtY} ${tgtX},${tgtY}`}
              fill="none" stroke={categoryColors[link.energyType as string] || '#94A3B8'}
              strokeWidth={Math.max(1, (link.value / maxFlow) * 20)}
              strokeOpacity={opacity}
            />
          );
        })}
        {/* 节点 */}
        {sankey.nodes.map(node => {
          const pos = nodePositions[node.id];
          if (!pos) return null;
          return (
            <g key={node.id}>
              <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={3}
                fill={categoryColors[node.category] || '#94A3B8'} />
              <text x={node.category === 'loss' ? pos.x - 6 : pos.x + pos.w + 6}
                y={pos.y + pos.h / 2 + 4} fontSize={10}
                fill="var(--foreground)" textAnchor={node.category === 'loss' ? 'end' : 'start'}>
                {node.name} ({node.value.toFixed(1)})
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
        <span>总输入: {sankey.totalInput} tce</span>
        <span>总损耗: {sankey.totalLoss} tce</span>
        <span>综合效率: {sankey.overallEfficiency}%</span>
      </div>
    </div>
  );
}

// ============================================================
// AI根因分析
// ============================================================
function RootCausePanel({ analysis }: { analysis: AIRootCauseAnalysis }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-foreground">{analysis.anomalyDescription}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            置信度 {(analysis.confidence * 100).toFixed(0)}%
          </span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>
      {expanded && (
        <div className="mt-3 space-y-3">
          {analysis.rootCauses.map(rc => (
            <div key={rc.id} className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{rc.cause}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  rc.impactLevel === 'high' ? 'bg-red-100 text-red-700' :
                  rc.impactLevel === 'medium' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  概率 {(rc.probability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {rc.evidence.map((e, i) => <div key={i}>• {e}</div>)}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <ThumbsUp className="w-3 h-3 text-green-500" />
                <span className="text-green-600">{rc.suggestedAction}</span>
                {rc.estimatedSaving && (
                  <span className="text-green-500 font-semibold">预计节省 {rc.estimatedSaving} {rc.savingUnit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 节能建议卡片
// ============================================================
function AdviceCard({ advice }: { advice: EnergySavingAdvice }) {
  const priorityColors = { high: 'bg-red-100 text-red-700', medium: 'bg-orange-100 text-orange-700', low: 'bg-blue-100 text-blue-700' };
  const diffLabels = { easy: '易实施', medium: '中等', hard: '较难' };
  const statusLabels: Record<string, string> = { suggested: '建议中', accepted: '已采纳', in_progress: '实施中', completed: '已完成' };
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[advice.priority]}`}>
              {advice.priority === 'high' ? '高优先' : advice.priority === 'medium' ? '中优先' : '低优先'}
            </span>
            <span className="text-xs text-muted-foreground">{diffLabels[advice.implementationDifficulty]}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{statusLabels[advice.status]}</span>
          </div>
          <h4 className="text-sm font-semibold mt-2">{advice.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{advice.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <div className="flex gap-4 text-xs">
          <span className="text-green-600 font-semibold">预计节省 {advice.estimatedSaving} {advice.savingUnit}</span>
          <span className="text-green-600">¥{advice.estimatedCostSaving.toLocaleString()}/年</span>
        </div>
        {advice.paybackMonths && (
          <span className="text-xs text-muted-foreground">回收期 {advice.paybackMonths} 个月</span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 紧凑型用电日历（整合到能源诊断页面）
// ============================================================
const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function getIntensityColor(level: CalendarHeatmapDay["level"]): string {
  switch (level) {
    case "abnormal_high": return "bg-red-600 text-white";
    case "high": return "bg-orange-500 text-white";
    case "normal": return "bg-emerald-500 text-white";
    case "low": return "bg-sky-400 text-white";
    case "abnormal_low": return "bg-blue-600 text-white";
    case "holiday": return "bg-violet-400 text-white";
    case "weekend": return "bg-slate-200 text-slate-600";
    default: return "bg-slate-100 text-slate-400";
  }
}

function CompactCalendar() {
  const [expanded, setExpanded] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(6);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const heatmapDays = useMemo(() => getCalendarHeatmapDays(), []);

  const monthDays = useMemo(() => {
    return heatmapDays.filter((d) => {
      const m = parseInt(d.date.split("-")[1], 10);
      return m === selectedMonth + 1;
    });
  }, [heatmapDays, selectedMonth]);

  const calendarGrid = useMemo(() => {
    const firstDay = monthDays[0];
    if (!firstDay) return [];
    const firstDate = new Date(firstDay.date);
    const startDow = (firstDate.getDay() + 6) % 7;
    const weeks: (CalendarHeatmapDay | null)[][] = [];
    let currentWeek: (CalendarHeatmapDay | null)[] = Array(startDow).fill(null);

    monthDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [monthDays]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    return heatmapDays.find((d) => d.date === selectedDay) ?? null;
  }, [selectedDay, heatmapDays]);

  const monthStats = useMemo(() => {
    if (monthDays.length === 0) return { totalTce: 0, avgIntensity: 0, abnormalCount: 0, alertCount: 0 };
    const totalTce = monthDays.reduce((s, d) => s + d.totalTce, 0);
    const avgIntensity = monthDays.reduce((s, d) => s + d.intensity, 0) / monthDays.length;
    const abnormalCount = monthDays.filter((d) => d.isAbnormal).length;
    const alertCount = monthDays.reduce((s, d) => s + (d.alertCount ?? 0), 0);
    return { totalTce, avgIntensity, abnormalCount, alertCount };
  }, [monthDays]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-cyan-500" />
          <h2 className="text-sm font-semibold text-foreground">用能日历</h2>
          <span className="text-xs text-muted-foreground">逐日用能热力图</span>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>月总能耗 <b className="text-foreground">{monthStats.totalTce.toFixed(1)}</b> tce</span>
              <span>异常 <b className={monthStats.abnormalCount > 0 ? "text-red-500" : "text-green-500"}>{monthStats.abnormalCount}</b> 天</span>
              <span>告警 <b className={monthStats.alertCount > 0 ? "text-orange-500" : "text-muted-foreground"}>{monthStats.alertCount}</b> 次</span>
            </div>
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {/* 月份选择器 + 图例 */}
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))} className="p-1 rounded hover:bg-muted text-muted-foreground text-xs">◀</button>
            <span className="text-sm font-semibold min-w-[60px] text-center">{MONTHS[selectedMonth]}</span>
            <button onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))} className="p-1 rounded hover:bg-muted text-muted-foreground text-xs">▶</button>
            <div className="flex gap-2 ml-3 text-[10px]">
              {[
                { color: "bg-red-600", label: "异常偏高" },
                { color: "bg-orange-500", label: "偏高" },
                { color: "bg-emerald-500", label: "正常" },
                { color: "bg-sky-400", label: "偏低" },
                { color: "bg-violet-400", label: "假期" },
                { color: "bg-slate-200", label: "周末" },
              ].map((l) => (
                <span key={l.label} className="flex items-center gap-1">
                  <span className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                  {l.label}
                </span>
              ))}
            </div>
          </div>

          {/* 日历网格 + 选中日详情 并排 */}
          <div className="flex gap-4">
            {/* 日历网格 */}
            <div className="flex-1 min-w-0 border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-7 border-b border-border">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground py-1.5 font-medium">{d}</div>
                ))}
              </div>
              <div>
                {calendarGrid.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        onClick={() => day && setSelectedDay(day.date)}
                        className={`aspect-square p-0.5 border-r border-b border-border cursor-pointer transition-all hover:ring-1 hover:ring-cyan-400/50 hover:z-10 ${
                          selectedDay === day?.date ? "ring-1 ring-cyan-400 z-10" : ""
                        }`}
                      >
                        {day && (
                          <div className={`h-full rounded flex flex-col items-center justify-center ${getIntensityColor(day.level)}`}>
                            <span className="text-[10px] font-bold leading-tight">{parseInt(day.date.split("-")[2], 10)}</span>
                            <span className="text-[8px] opacity-80 leading-tight">{day.totalTce.toFixed(1)}</span>
                            {day.hasAlert && <span className="w-1 h-1 rounded-full bg-white mt-0.5" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* 选中日详情 */}
            {selectedDayData && (
              <div className="w-52 shrink-0 bg-muted/50 rounded-lg p-3 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground">{selectedDayData.date}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${getIntensityColor(selectedDayData.level)}`}>
                    {selectedDayData.level === "abnormal_high" ? "异常偏高" : selectedDayData.level === "high" ? "偏高" : selectedDayData.level === "normal" ? "正常" : selectedDayData.level === "low" ? "偏低" : selectedDayData.level === "abnormal_low" ? "异常偏低" : selectedDayData.level === "holiday" ? "假期" : "周末"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: "总能耗", value: selectedDayData.totalTce.toFixed(2), unit: "tce" },
                    { label: "电力", value: selectedDayData.electricity.toFixed(0), unit: "kWh" },
                    { label: "水耗", value: selectedDayData.water.toFixed(1), unit: "m³" },
                    { label: "天然气", value: selectedDayData.gas.toFixed(1), unit: "m³" },
                    { label: "热力", value: selectedDayData.heat.toFixed(1), unit: "GJ" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between text-[11px]">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-foreground">{item.value} <span className="text-[10px] text-muted-foreground">{item.unit}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function EnergyDiagnosisPage() {
  const [activeBenchmarkIdx, setActiveBenchmarkIdx] = useState(0);
  const [adviceFilter, setAdviceFilter] = useState<string>('all');

  const diagnosis = useMemo(() => getDiagnosisSummary(), []);
  const benchmarks = useMemo(() => getBenchmarkComparison(), []);
  const sankey = useMemo(() => getEnergyFlowSankey(), []);
  const rootCause = useMemo(() => getAIRootCauseAnalysis(), []);
  const advices = useMemo(() => getEnergySavingAdvices(), []);

  const filteredAdvices = adviceFilter === 'all' ? advices : advices.filter(a => a.priority === adviceFilter);

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">能源诊断中心</h1>
          <p className="text-xs text-muted-foreground mt-1">能效评估 · 对标分析 · AI根因诊断 · 节能建议</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>数据更新: {new Date().toLocaleString('zh-CN')}</span>
        </div>
      </div>

      {/* 第一行：能效评分 + 超标概况 */}
      <div className="grid grid-cols-2 gap-4">
        <EfficiencyGauge diagnosis={diagnosis} />
        <OverStandardStats diagnosis={diagnosis} />
      </div>

      {/* 第二行：对标分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-semibold text-foreground">对标分析</h2>
          <div className="flex gap-1">
            {benchmarks.map((b, i) => (
              <button key={i} onClick={() => setActiveBenchmarkIdx(i)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  i === activeBenchmarkIdx ? 'bg-blue-100 text-blue-700 font-semibold' : 'bg-muted text-muted-foreground'
                }`}>
                {b.buildingTypeName}
              </button>
            ))}
          </div>
        </div>
        {benchmarks[activeBenchmarkIdx] && <BenchmarkChart benchmark={benchmarks[activeBenchmarkIdx]} />}
      </div>

      {/* 第三行：桑基图 */}
      <SankeyDiagram sankey={sankey} />

      {/* 第四行：用电日历（紧凑可折叠） */}
      <CompactCalendar />

      {/* 第五行：AI根因分析 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-semibold text-foreground">AI 根因分析</h2>
        </div>
        <RootCausePanel analysis={rootCause} />
      </div>

      {/* 第五行：节能建议 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h2 className="text-sm font-semibold text-foreground">节能改造建议</h2>
          </div>
          <div className="flex gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map(f => (
              <button key={f} onClick={() => setAdviceFilter(f)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  adviceFilter === f ? 'bg-yellow-100 text-yellow-700 font-semibold' : 'bg-muted text-muted-foreground'
                }`}>
                {f === 'all' ? '全部' : f === 'high' ? '高优先' : f === 'medium' ? '中优先' : '低优先'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredAdvices.map(a => <AdviceCard key={a.id} advice={a} />)}
        </div>
      </div>
    </div>
  );
}
