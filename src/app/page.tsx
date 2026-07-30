"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import {
  leaderKPIs,
  economicZoneData,
  emissionSourceData,
  riskWarnings,
  monthlyTrendData,
  resourceConsumptionData,
  carbonCompositionData,
  energyCompositionData,
  waterCompositionData,
  emissionRankingData,
} from "@/data/leader-dashboard-data";
import type {
  EconomicZoneData,
  EmissionSourceItem,
  RiskWarning,
  MonthlyTrendPoint,
  ResourceConsumptionItem,
  CompositionItem,
  EmissionRankingItem,
} from "@/data/leader-dashboard-data";

// ============================================================
// 顶部 KPI 栏
// ============================================================
function TopKpiBar() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      {leaderKPIs.map((kpi, i) => (
        <div key={i} className="flex-1 bg-[#0a1e3d]/60 rounded-lg px-4 py-2.5 border border-cyan-500/10 min-w-0">
          <div className="text-gray-400 text-[11px] mb-0.5 truncate">{kpi.label}</div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-xl font-mono font-bold">{kpi.value}</span>
            <span className="text-gray-500 text-xs">{kpi.unit}</span>
          </div>
          {kpi.sub && <div className="text-[10px] text-gray-600 mt-0.5">{kpi.sub}</div>}
        </div>
      ))}
      {/* 右侧筛选器 */}
      <div className="flex items-center gap-2 shrink-0">
        <select className="bg-[#0a1e3d]/60 border border-cyan-500/10 rounded-md px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500/30">
          <option>2026年度</option>
          <option>2025年度</option>
        </select>
        <select className="bg-[#0a1e3d]/60 border border-cyan-500/10 rounded-md px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-cyan-500/30">
          <option>主校区</option>
          <option>东校区</option>
        </select>
        <span className="flex items-center gap-1 text-green-400 text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          数据实时
        </span>
      </div>
    </div>
  );
}

// ============================================================
// 经济控制分区面板
// ============================================================
function EconomicZonePanel({ data }: { data: EconomicZoneData }) {
  const riskPct = Math.round((data.usedQuota / data.totalQuota) * 100);
  const remaining = data.totalQuota - data.usedQuota;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-cyan-400" />
        <h3 className="text-white text-sm font-semibold">经济控制分区</h3>
      </div>
      <div className="bg-[#0a1e3d]/60 rounded-lg p-3 border border-cyan-500/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400 text-xs">碳排放总量配额</span>
          <span className="text-white text-sm font-mono font-bold">{data.totalQuota.toLocaleString()} tCO₂</span>
        </div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-gray-400 text-xs">已用</span>
          <span className="text-orange-400 text-sm font-mono font-bold">{data.usedQuota.toLocaleString()} tCO₂</span>
        </div>
        <div className="w-full h-2 bg-gray-700/50 rounded-full mb-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-500 to-orange-500 rounded-full transition-all" style={{ width: `${riskPct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-red-400 text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {data.riskLabel}
          </span>
          <span className="text-gray-500 text-xs">剩余 {remaining.toLocaleString()} tCO₂</span>
        </div>
      </div>
      {/* 配额合规 / 成本控制 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
          <div className="flex items-center gap-1.5 mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-gray-400 text-[10px]">配额合规</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-lg font-mono font-bold">{riskPct}</span>
            <span className="text-gray-500 text-xs">%</span>
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">消耗进度</div>
        </div>
        <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-green-400" />
            <span className="text-gray-400 text-[10px]">成本控制</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-white text-lg font-mono font-bold">{data.costControl[0]?.value ?? 0}</span>
            <span className="text-gray-500 text-xs">%</span>
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">碳价风险</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 排放源构成 (环形图)
// ============================================================
function EmissionSourceRing({ data, viewMode, setViewMode }: {
  data: EmissionSourceItem[];
  viewMode: "total" | "perCapita";
  setViewMode: (v: "total" | "perCapita") => void;
}) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  // Simple SVG ring chart
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const offset = -accumulated * circumference;
    accumulated += pct;
    return { ...d, dash, offset, pct };
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-cyan-400" />
          <h3 className="text-white text-sm font-semibold">排放源构成</h3>
        </div>
        <div className="flex bg-[#0a1e3d]/60 rounded-md p-0.5 border border-cyan-500/10">
          <button
            onClick={() => setViewMode("total")}
            className={`px-2 py-0.5 text-[10px] rounded ${viewMode === "total" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}
          >
            总量
          </button>
          <button
            onClick={() => setViewMode("perCapita")}
            className={`px-2 py-0.5 text-[10px] rounded ${viewMode === "perCapita" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}
          >
            人均
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
            {slices.map((s, i) => (
              <circle
                key={i}
                cx="70" cy="70" r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={s.offset}
                transform="rotate(-90 70 70)"
                strokeLinecap="round"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-lg font-mono font-bold">{total.toLocaleString()}</span>
            <span className="text-gray-500 text-[10px]">tCO₂</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          {data.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-400 text-[11px] truncate">{s.name}</span>
              <span className="text-gray-500 text-[11px] ml-auto shrink-0">{s.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 风险预警
// ============================================================
function RiskWarningPanel({ data }: { data: RiskWarning[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-red-400" />
        <h3 className="text-white text-sm font-semibold">风险预警</h3>
      </div>
      <div className="space-y-2">
        {data.map((w, i) => (
          <div key={i} className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-gray-400 text-[11px]">{w.label}</span>
              <span className={`text-sm font-mono font-bold ${
                w.status === "danger" ? "text-red-400" : w.status === "warning" ? "text-orange-400" : "text-green-400"
              }`}>{w.value}</span>
            </div>
            <div className="text-[10px] text-gray-600">{w.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 月度累计趋势 (可拖动时间轴折线图)
// ============================================================
function MonthlyTrendChart({ data }: { data: MonthlyTrendPoint[] }) {
  const [sliderIndex, setSliderIndex] = useState(data.length - 1);
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // 根据 sliderIndex 裁剪可见数据
  const visibleData = useMemo(() => data.slice(0, sliderIndex + 1), [data, sliderIndex]);
  const currentPoint = data[sliderIndex];

  const maxVal = Math.max(...data.map(d => d.target));
  const h = 140;
  const w = 600;
  const pad = { top: 10, right: 10, bottom: 20, left: 45 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  const xScale = useCallback((i: number) => pad.left + (i / (data.length - 1)) * chartW, [chartW]);
  const yScale = useCallback((v: number) => pad.top + chartH - (v / maxVal) * chartH, [chartH, maxVal]);

  const linePath = useCallback((key: "actual" | "target" | "forecast") =>
    visibleData.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d[key])}`).join(" "),
    [visibleData, xScale, yScale]);

  // 拖动处理
  const handlePointerDown = useCallback(() => setIsDragging(true), []);
  const handlePointerUp = useCallback(() => setIsDragging(false), []);
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setSliderIndex(Math.round(ratio * (data.length - 1)));
  }, [isDragging, data.length]);

  // 全局 pointer 事件（拖出滑块区域也能响应）
  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: PointerEvent) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      setSliderIndex(Math.round(ratio * (data.length - 1)));
    };
    const onUp = () => setIsDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [isDragging, data.length]);

  return (
    <div className="space-y-2 select-none">
      {/* 标题 + 年份选择 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-cyan-400" />
          <h3 className="text-white text-sm font-semibold">月度累计趋势</h3>
        </div>
        <div className="flex items-center gap-1">
          {["2024", "2025", "2026"].map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                selectedYear === y ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {y}年
            </button>
          ))}
        </div>
      </div>

      {/* 图例 + 当前值 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-0.5 bg-cyan-400 inline-block" /> 实际</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-0.5 bg-gray-500 inline-block" /> 目标</span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="w-2 h-0.5 bg-orange-400 inline-block" /> 预测</span>
        </div>
        <span className="text-cyan-400 text-[10px] font-mono">
          {currentPoint.month} · 累计 {currentPoint.actual.toLocaleString()} tCO₂
        </span>
      </div>

      {/* SVG 折线图 */}
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <g key={i}>
            <line x1={pad.left} y1={yScale(maxVal * pct)} x2={w - pad.right} y2={yScale(maxVal * pct)} stroke="#1e293b" strokeWidth="0.5" />
            <text x={pad.left - 4} y={yScale(maxVal * pct) + 3} textAnchor="end" fill="#475569" fontSize="9">
              {Math.round(maxVal * pct).toLocaleString()}
            </text>
          </g>
        ))}
        {/* 当前月份竖线 */}
        <line x1={xScale(sliderIndex)} y1={pad.top} x2={xScale(sliderIndex)} y2={pad.top + chartH} stroke="#22d3ee" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.6" />
        {/* Lines */}
        <path d={linePath("actual")} fill="none" stroke="#22d3ee" strokeWidth="2" />
        <path d={linePath("target")} fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="4 3" />
        <path d={linePath("forecast")} fill="none" stroke="#fb923c" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* 当前点标记 */}
        <circle cx={xScale(sliderIndex)} cy={yScale(currentPoint.actual)} r="3" fill="#22d3ee" stroke="#0a1628" strokeWidth="1.5" />
        {/* Month labels */}
        {data.map((d, i) => (
          <text key={i} x={xScale(i)} y={h - 4} textAnchor="middle" fill={i === sliderIndex ? "#22d3ee" : "#475569"} fontSize="8">
            {d.month}
          </text>
        ))}
      </svg>

      {/* 可拖动时间轴 */}
      <div
        ref={sliderRef}
        className="relative h-8 cursor-pointer touch-none"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {/* 轨道 */}
        <div className="absolute top-3 left-0 right-0 h-1 bg-gray-700/50 rounded-full" />
        {/* 已走过部分 */}
        <div
          className="absolute top-3 left-0 h-1 bg-cyan-400/60 rounded-full transition-[width] duration-75"
          style={{ width: `${(sliderIndex / (data.length - 1)) * 100}%` }}
        />
        {/* 滑块手柄 */}
        <div
          className="absolute top-1 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/40 border-2 border-[#0a1628] -translate-x-1/2 cursor-grab active:cursor-grabbing transition-none"
          style={{ left: `${(sliderIndex / (data.length - 1)) * 100}%` }}
        />
        {/* 月份刻度 */}
        {data.map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSliderIndex(i)}
            className={`absolute top-5 text-[8px] -translate-x-1/2 transition-colors ${
              i === sliderIndex ? "text-cyan-400 font-semibold" : "text-gray-600 hover:text-gray-400"
            }`}
            style={{ left: `${(i / (data.length - 1)) * 100}%` }}
          >
            {d.month.replace("月", "")}
          </button>
        ))}
      </div>

      {/* 底部数值摘要 */}
      <div className="flex justify-between text-[10px] text-gray-500 px-1">
        <span>实际: {currentPoint.actual.toLocaleString()}</span>
        <span>目标: {currentPoint.target.toLocaleString()}</span>
        <span>预测: {currentPoint.forecast.toLocaleString()}</span>
      </div>
    </div>
  );
}

// ============================================================
// 资源消耗分析
// ============================================================
function ResourceAnalysisPanel({ data }: { data: ResourceConsumptionItem[] }) {
  const [viewMode, setViewMode] = useState<"total" | "perCapita">("total");
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-cyan-400" />
          <h3 className="text-white text-sm font-semibold">资源消耗分析</h3>
        </div>
        <div className="flex bg-[#0a1e3d]/60 rounded-md p-0.5 border border-cyan-500/10">
          <button
            onClick={() => setViewMode("total")}
            className={`px-2 py-0.5 text-[10px] rounded ${viewMode === "total" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}
          >
            全校资源总消耗
          </button>
          <button
            onClick={() => setViewMode("perCapita")}
            className={`px-2 py-0.5 text-[10px] rounded ${viewMode === "perCapita" ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}
          >
            生均资源消耗强度
          </button>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="bg-[#0a1e3d]/60 rounded-lg p-3 border border-cyan-500/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-400 text-xs">{item.label}</span>
              <span className="text-white text-lg font-mono font-bold">
                {viewMode === "total" ? item.totalValue : item.perCapitaValue}
                {" "}
                <span className="text-gray-500 text-xs">
                  {viewMode === "total" ? item.totalUnit : item.perCapitaUnit}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] flex items-center gap-0.5 ${item.yoy < 0 ? "text-green-400" : "text-red-400"}`}>
                {item.yoy < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {item.yoyLabel}
              </span>
              <span className={`text-[10px] flex items-center gap-0.5 ${item.mom < 0 ? "text-green-400" : "text-red-400"}`}>
                {item.momLabel}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 三类组成环形图
// ============================================================
function CompositionRings() {
  const [activeTab, setActiveTab] = useState<"carbon" | "energy" | "water">("carbon");
  const dataMap: Record<string, CompositionItem[]> = {
    carbon: carbonCompositionData,
    energy: energyCompositionData,
    water: waterCompositionData,
  };
  const labelMap: Record<string, string> = { carbon: "碳排放组成", energy: "能耗组成", water: "水耗组成" };
  const data = dataMap[activeTab];
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;
  const slices = data.map((d) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const offset = -accumulated * circumference;
    accumulated += pct;
    return { ...d, dash, offset, pct };
  });

  return (
    <div className="space-y-2">
      <div className="flex bg-[#0a1e3d]/60 rounded-md p-0.5 border border-cyan-500/10">
        {(["carbon", "energy", "water"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-1 text-[10px] rounded ${activeTab === tab ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"}`}
          >
            {labelMap[tab]}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="12" />
            {slices.map((s, i) => (
              <circle
                key={i}
                cx="60" cy="60" r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth="12"
                strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                strokeDashoffset={s.offset}
                transform="rotate(-90 60 60)"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </div>
        <div className="flex-1 space-y-1 min-w-0">
          {data.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-gray-400 text-[10px] truncate">{s.name}</span>
              <span className="text-gray-500 text-[10px] ml-auto shrink-0">{s.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 排放 TOP 5
// ============================================================
function EmissionTop5({ data }: { data: EmissionRankingItem[] }) {
  const maxVal = data[0]?.value ?? 1;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-orange-400" />
        <h3 className="text-white text-sm font-semibold">排放 TOP 5</h3>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-xs font-mono w-4 shrink-0 ${i < 3 ? "text-orange-400" : "text-gray-500"}`}>{i + 1}</span>
            <span className="text-gray-300 text-xs truncate flex-1 min-w-0">{item.name}</span>
            <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden mx-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="text-white text-xs font-mono shrink-0">{item.value.toLocaleString()} <span className="text-gray-500">{item.unit}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================
export default function LeaderDashboard() {
  const [emissionViewMode, setEmissionViewMode] = useState<"total" | "perCapita">("total");

  const leftPanel = (
    <div className="space-y-4 p-3">
      <EconomicZonePanel data={economicZoneData} />
      <EmissionSourceRing data={emissionSourceData} viewMode={emissionViewMode} setViewMode={setEmissionViewMode} />
      <RiskWarningPanel data={riskWarnings} />
    </div>
  );

  const centerContent = (
    <div className="relative h-full">
      <CampusTileBackground map="2_5d" tone="leader" />
      {/* 图例 */}
      <div className="absolute bottom-3 left-3 bg-[#0a1e3d]/80 rounded-lg p-2 border border-cyan-500/10">
        <div className="text-[10px] text-gray-400 mb-1.5">碳排放强度</div>
        <div className="flex items-center gap-1.5">
          {[
            { color: "#EF4444", label: ">50" },
            { color: "#F97316", label: "30-50" },
            { color: "#EAB308", label: "15-30" },
            { color: "#06B6D4", label: "<15" },
            { color: "#10B981", label: "负排放" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-0.5">
              <span className="w-3 h-2 rounded-sm" style={{ backgroundColor: l.color }} />
              <span className="text-[9px] text-gray-500">{l.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const centerBottomPanel = (
    <div className="p-3">
      <MonthlyTrendChart data={monthlyTrendData} />
    </div>
  );

  const rightPanel = (
    <div className="space-y-4 p-3">
      <ResourceAnalysisPanel data={resourceConsumptionData} />
      <CompositionRings />
      <EmissionTop5 data={emissionRankingData} />
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      centerBottomPanel={centerBottomPanel}
      colorMode="carbon"
    >
      {centerContent}
    </ThreeColumnLayout>
  );
}
