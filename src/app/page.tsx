"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  AlertTriangle,
  Cloud,
  Coins,
  Leaf,
  PieChart,
  ShieldCheck,
  Droplets,
  Zap,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
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
  EmissionRankingItem,
} from "@/data/leader-dashboard-data";

// ============================================================
// 顶部 KPI 栏
// ============================================================
function TopKpiBar() {
  const icons = [Cloud, PieChart, Coins, Leaf, ShieldCheck];
  return (
    <div className="grid h-full grid-cols-5 gap-3">
      {leaderKPIs.map((kpi, i) => {
        const Icon = icons[i];
        return (
          <div key={i} className="cockpit-kpi-card flex min-w-0 items-center gap-4 px-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center text-cyan-300 [filter:drop-shadow(0_0_7px_rgba(72,220,255,.72))]">
              <Icon className="h-10 w-10" strokeWidth={1.6} />
            </div>
            <div className="min-w-0">
              <div className="mb-1 truncate text-[13px] text-slate-300">{kpi.label}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[28px] font-mono font-bold leading-none tracking-wide text-cyan-50 [text-shadow:0_0_10px_rgba(83,225,255,.42)]">{kpi.value}</span>
                <span className="text-xs text-slate-400">{kpi.unit}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// 经济控制分区面板
// ============================================================
function EconomicZonePanel({ data }: { data: EconomicZoneData }) {
  const usedPct = Math.round((data.usedQuota / data.totalQuota) * 100);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-cyan-400" />
        <h3 className="text-white text-sm font-semibold">经济控制分区</h3>
        <span className="flex h-4 w-4 items-center justify-center rounded-full border border-cyan-400/50 text-[10px] text-cyan-300">i</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_1.5fr_1fr] items-center gap-1 pt-2">
        <div className="flex flex-col items-center gap-2 text-emerald-300">
          <span className="text-xs font-semibold">配额合规</span>
          <ShieldCheck className="h-9 w-9 [filter:drop-shadow(0_0_6px_rgba(74,222,128,.55))]" />
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-[160px]">
          <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#ffab45 0 31%, #43b9ff 31% 36%, #52ded0 36% ${usedPct}%, rgba(29,69,91,.45) ${usedPct}% 100%)` }} />
          <div className="absolute inset-[14%] flex flex-col items-center justify-center rounded-full bg-[#06172a] shadow-[inset_0_0_18px_rgba(31,194,229,.12)]">
            <span className="text-[10px] text-slate-400">已用</span>
            <strong className="font-mono text-[22px] leading-tight text-white">{data.usedQuota.toLocaleString()}</strong>
            <span className="text-xs text-slate-400">tCO₂</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 text-amber-300">
          <span className="text-xs font-semibold">成本控制</span>
          <TrendingUp className="h-9 w-9 [filter:drop-shadow(0_0_6px_rgba(251,191,36,.5))]" />
        </div>
      </div>
      <div className="mx-auto -mt-1 rounded-md border border-cyan-400/20 bg-[#06192d] px-5 py-0.5 text-xs text-slate-400">总量 {data.totalQuota.toLocaleString()} tCO₂</div>
      <div className="mt-1 flex items-center justify-center gap-1 text-xs text-red-400"><AlertTriangle className="h-3.5 w-3.5" />{data.riskLabel}</div>
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
  const slices = data.map((d, index) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const accumulated = data
      .slice(0, index)
      .reduce((sum, item) => sum + item.value / total, 0);
    const offset = -accumulated * circumference;
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
      <div className="divide-y divide-cyan-400/10">
        {data.map((w, i) => (
          <div key={i} className="flex min-h-11 items-center gap-2 px-1">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${w.status === "danger" ? "bg-red-500/25 text-red-400" : "bg-slate-500/20 text-slate-400"}`}>
              {w.status === "danger" ? <AlertTriangle className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-between">
              <span className="truncate text-[11px] text-slate-400">{w.label}</span>
              <span className={`text-sm font-mono font-bold ${
                w.status === "danger" ? "text-red-400" : w.status === "warning" ? "text-orange-400" : "text-green-400"
              }`}>{w.value}</span>
            </div>
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

  const xScale = useCallback((i: number) => pad.left + (i / (data.length - 1)) * chartW, [chartW, data.length, pad.left]);
  const yScale = useCallback((v: number) => pad.top + chartH - (v / maxVal) * chartH, [chartH, maxVal, pad.top]);

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
        className="hidden"
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
      <div className="hidden">
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
  const icons = [Cloud, Zap, Droplets];
  return (
    <div className="flex h-full min-h-0 flex-col">
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
      <div className="mt-2 grid min-h-0 flex-1 grid-rows-[30px_repeat(3,1fr)] overflow-hidden rounded border border-cyan-400/20">
        <div className="grid grid-cols-[1.1fr_1.35fr_.8fr_.8fr] items-center border-b border-cyan-400/15 px-3 text-[10px] text-slate-400">
          <span>资源类型</span><span>本年累计</span><span>同比</span><span>环比</span>
        </div>
        {data.map((item, i) => (
          <div key={i} className="grid grid-cols-[1.1fr_1.35fr_.8fr_.8fr] items-center border-b border-cyan-400/10 px-3 last:border-0">
            <span className="flex items-center gap-2 text-xs text-slate-300">
              {(() => { const Icon = icons[i]; return <Icon className="h-4 w-4 text-cyan-300" />; })()}
              {item.label}
            </span>
            <span className="whitespace-nowrap font-mono text-sm font-semibold text-white">
                {viewMode === "total" ? item.totalValue : item.perCapitaValue}
                <span className="ml-1 text-[10px] font-normal text-slate-400">
                  {viewMode === "total" ? item.totalUnit : item.perCapitaUnit}
                </span>
            </span>
            <span className={`text-[11px] ${item.yoy < 0 ? "text-emerald-400" : "text-red-400"}`}>{item.yoyLabel}</span>
            <span className={`text-[11px] ${item.mom < 0 ? "text-emerald-400" : "text-red-400"}`}>{item.momLabel}</span>
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
  const groups = [
    { title: "碳排放组成", data: carbonCompositionData },
    { title: "能耗组成", data: energyCompositionData },
    { title: "水耗组成", data: waterCompositionData },
  ];

  return (
    <div className="grid h-full grid-cols-3 gap-3">
      {groups.map((group) => {
        const total = group.data.reduce((sum, item) => sum + item.value, 0);
        return (
          <div key={group.title} className="flex min-w-0 flex-col">
            <h3 className="mb-1 text-center text-sm font-semibold text-white">{group.title}</h3>
            <div className="relative mx-auto h-[104px] w-[104px]">
              <svg width="104" height="104" viewBox="0 0 104 104">
                <circle cx="52" cy="52" r="38" fill="none" stroke="#17283c" strokeWidth="14" />
                {group.data.map((item, index) => {
                  const length = (item.value / total) * 238.76;
                  const offset = -group.data
                    .slice(0, index)
                    .reduce((sum, entry) => sum + (entry.value / total) * 238.76, 0);
                  return <circle key={item.name} cx="52" cy="52" r="38" fill="none" stroke={item.color} strokeWidth="14" strokeDasharray={`${length} ${238.76 - length}`} strokeDashoffset={offset} transform="rotate(-90 52 52)" />;
                })}
              </svg>
            </div>
            <div className="mt-1 space-y-1">
              {group.data.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-[10px]">
                  <span className="h-2 w-2 shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="min-w-0 flex-1 truncate text-slate-400">{item.name}</span>
                  <span className="text-slate-300">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
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
        <span className="ml-auto text-[10px] text-slate-500">单位：tCO₂</span>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-xs font-mono text-white" style={{ backgroundColor: item.color }}>{i + 1}</span>
            <span className="text-gray-300 text-xs truncate flex-1 min-w-0">{item.name}</span>
            <div className="flex-1 h-2 bg-gray-700/50 rounded-full overflow-hidden mx-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(item.value / maxVal) * 100}%`, backgroundColor: item.color }}
              />
            </div>
            <span className="w-14 shrink-0 text-right font-mono text-xs text-white">{item.value.toLocaleString()}</span>
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
    <div className="grid h-full min-h-0 gap-2.5" style={{ gridTemplateRows: "1.05fr .92fr 1.15fr" }}>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <EconomicZonePanel data={economicZoneData} />
      </section>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <EmissionSourceRing data={emissionSourceData} viewMode={emissionViewMode} setViewMode={setEmissionViewMode} />
      </section>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <RiskWarningPanel data={riskWarnings} />
      </section>
    </div>
  );

  const centerContent = (
    <div className="relative h-full">
      <CampusTileBackground map="2_5d" tone="leader" cockpit />
      {/* 图例 */}
      <div className="absolute left-3 top-3 z-20 border border-cyan-400/35 bg-[#06172a]/90 p-2.5 backdrop-blur-md">
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
    <div className="grid h-full min-h-0 gap-2.5" style={{ gridTemplateRows: ".72fr 1fr .9fr" }}>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <ResourceAnalysisPanel data={resourceConsumptionData} />
      </section>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <CompositionRings />
      </section>
      <section className="cockpit-tech-panel min-h-0 overflow-hidden border p-3">
        <EmissionTop5 data={emissionRankingData} />
      </section>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      topPanel={<TopKpiBar />}
      centerBottomPanel={centerBottomPanel}
      colorMode="carbon"
    >
      {centerContent}
    </ThreeColumnLayout>
  );
}
