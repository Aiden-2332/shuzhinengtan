"use client";

import { useState, useMemo, useCallback } from "react";
import { AlertTriangle, TrendingDown, TrendingUp, ShieldAlert } from "lucide-react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { getCampusMapBuildings } from "@/data/campus-map-buildings";
import { getEmissionColor, getEmissionLevel } from "@/data/campus-data";
import {
  leaderKPIs,
  economicZoneData,
  emissionSourceData,
  riskWarnings,
  complianceProgressData,
  monthlyTrendData2024,
  monthlyTrendData2025,
  monthlyTrendData2026,
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
  ComplianceProgressData,
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
// 年度履约进度
// ============================================================
function ComplianceProgressPanel({ data }: { data: ComplianceProgressData }) {
  const statusColor: Record<string, string> = {
    completed: "text-green-400",
    on_track: "text-cyan-400",
    at_risk: "text-orange-400",
    overdue: "text-red-400",
  };
  const statusBg: Record<string, string> = {
    completed: "bg-green-500/20 border-green-500/30",
    on_track: "bg-cyan-500/15 border-cyan-500/20",
    at_risk: "bg-orange-500/15 border-orange-500/20",
    overdue: "bg-red-500/15 border-red-500/20",
  };
  const statusLabel: Record<string, string> = {
    completed: "已完成",
    on_track: "进行中",
    at_risk: "有风险",
    overdue: "已逾期",
  };

  // 月度进度条 SVG
  const barH = 8;
  const barW = 200;
  const monthBarH = 6;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-cyan-400" />
        <h3 className="text-white text-sm font-semibold">年度履约进度</h3>
        <span className="text-gray-500 text-[10px] ml-auto">{data.year}年度</span>
      </div>

      {/* 总进度 + 配额使用 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
          <div className="text-gray-400 text-[10px] mb-1">履约总进度</div>
          <div className="flex items-baseline gap-1">
            <span className="text-white text-xl font-mono font-bold">{data.overallProgress}</span>
            <span className="text-gray-500 text-xs">%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-700/50 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" style={{ width: `${data.overallProgress}%` }} />
          </div>
        </div>
        <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
          <div className="text-gray-400 text-[10px] mb-1">配额使用</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-mono font-bold ${data.quotaProgress.pct > 80 ? "text-red-400" : data.quotaProgress.pct > 60 ? "text-orange-400" : "text-green-400"}`}>
              {data.quotaProgress.pct}
            </span>
            <span className="text-gray-500 text-xs">%</span>
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">
            {data.quotaProgress.used.toLocaleString()} / {data.quotaProgress.total.toLocaleString()} tCO₂
          </div>
        </div>
      </div>

      {/* 任务状态统计 */}
      <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
        <div className="text-gray-400 text-[10px] mb-1.5">履约任务 ({data.tasks.total}项)</div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 text-[10px] text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400" /> 完成 {data.tasks.completed}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> 进行中 {data.tasks.inProgress}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-orange-400">
            <span className="w-2 h-2 rounded-full bg-orange-400" /> 风险 {data.tasks.atRisk}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400" /> 逾期 {data.tasks.overdue}
          </span>
        </div>
      </div>

      {/* 月度履约进度条 */}
      <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
        <div className="text-gray-400 text-[10px] mb-1.5">月度履约进度</div>
        <div className="space-y-1">
          {data.monthlyProgress.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-gray-500 text-[9px] w-6 shrink-0">{m.month}</span>
              <div className="flex-1 h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${m.progress}%`,
                    backgroundColor: m.progress > 80 ? "#22d3ee" : m.progress > 60 ? "#34d399" : m.progress > 40 ? "#f59e0b" : "#ef4444",
                  }}
                />
              </div>
              <span className="text-gray-500 text-[9px] w-6 text-right shrink-0">{m.progress}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 关键里程碑 */}
      <div className="bg-[#0a1e3d]/60 rounded-lg p-2.5 border border-cyan-500/10">
        <div className="text-gray-400 text-[10px] mb-1.5">关键里程碑</div>
        <div className="space-y-1.5">
          {data.keyMilestones.map((m, i) => (
            <div key={i} className={`flex items-center gap-2 rounded px-2 py-1.5 border ${statusBg[m.status]}`}>
              <span className={`text-[10px] font-medium ${statusColor[m.status]} w-10 shrink-0`}>{statusLabel[m.status]}</span>
              <span className="text-gray-300 text-[10px] flex-1 truncate">{m.label}</span>
              <span className="text-gray-500 text-[9px] shrink-0">{m.deadline}</span>
              <span className={`text-[10px] font-mono font-bold ${statusColor[m.status]} w-8 text-right shrink-0`}>{m.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 月度累计趋势 (三年对比折线图)
// ============================================================
function MonthlyTrendChart({
  data2024,
  data2025,
  data2026,
}: {
  data2024: MonthlyTrendPoint[];
  data2025: MonthlyTrendPoint[];
  data2026: MonthlyTrendPoint[];
}) {
  const h = 160;
  const w = 600;
  const pad = { top: 10, right: 10, bottom: 24, left: 48 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  // 所有数据中的最大值
  const allData = [...data2024, ...data2025, ...data2026];
  const maxVal = Math.max(...allData.map(d => d.actual));

  // X 轴：12 个月
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];

  const xScale = useCallback((i: number) => pad.left + (i / 11) * chartW, [chartW]);
  const yScale = useCallback((v: number) => pad.top + chartH - (v / maxVal) * chartH, [chartH, maxVal]);

  // 构建折线路径（仅到有效数据点）
  const linePath = useCallback((data: MonthlyTrendPoint[]) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(d.actual)}`).join(" "),
    [xScale, yScale]);

  return (
    <div className="space-y-2">
      {/* 标题 + 图例 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-cyan-400" />
          <h3 className="text-white text-sm font-semibold">月度累计趋势</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-3 h-0.5 bg-cyan-400 inline-block rounded" /> 2026年
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-3 h-0.5 bg-emerald-400 inline-block rounded" /> 2025年
          </span>
          <span className="flex items-center gap-1 text-[10px] text-gray-400">
            <span className="w-3 h-0.5 bg-orange-400 inline-block rounded" /> 2024年
          </span>
        </div>
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

        {/* 2024 折线 (全年) */}
        <path d={linePath(data2024)} fill="none" stroke="#fb923c" strokeWidth="2" opacity="0.7" />
        {/* 2025 折线 (全年) */}
        <path d={linePath(data2025)} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.8" />
        {/* 2026 折线 (仅到7月) */}
        <path d={linePath(data2026)} fill="none" stroke="#22d3ee" strokeWidth="2.5" />

        {/* 2026 终点标记 */}
        <circle
          cx={xScale(data2026.length - 1)}
          cy={yScale(data2026[data2026.length - 1].actual)}
          r="4"
          fill="#22d3ee"
          stroke="#0a1628"
          strokeWidth="1.5"
        />

        {/* 7月截止竖线 */}
        <line
          x1={xScale(6)}
          y1={pad.top}
          x2={xScale(6)}
          y2={pad.top + chartH}
          stroke="#22d3ee"
          strokeWidth="0.5"
          strokeDasharray="3 2"
          opacity="0.4"
        />

        {/* Month labels */}
        {months.map((m, i) => (
          <text key={i} x={xScale(i)} y={h - 4} textAnchor="middle" fill={i === 6 ? "#22d3ee" : "#475569"} fontSize="8">
            {m}
          </text>
        ))}
      </svg>

      {/* 底部数值摘要 */}
      <div className="flex justify-between text-[10px] text-gray-500 px-1">
        <span className="text-cyan-400">2026 截至7月: {data2026[data2026.length - 1].actual.toLocaleString()} tCO₂</span>
        <span className="text-emerald-400">2025 全年: {data2025[data2025.length - 1].actual.toLocaleString()} tCO₂</span>
        <span className="text-orange-400">2024 全年: {data2024[data2024.length - 1].actual.toLocaleString()} tCO₂</span>
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
  const dataMap: Record<string, CompositionItem[]> = {
    carbon: carbonCompositionData,
    energy: energyCompositionData,
    water: waterCompositionData,
  };
  const labelMap: Record<string, string> = { carbon: "碳排放组成", energy: "能耗组成", water: "水耗组成" };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 rounded-full bg-cyan-400" />
        <h3 className="text-white text-sm font-semibold">组成分析</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {(["carbon", "energy", "water"] as const).map((tab) => {
          const data = dataMap[tab];
          const total = data.reduce((s, d) => s + d.value, 0);
          const radius = 36;
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
            <div key={tab} className="bg-[#0a1e3d]/40 rounded-lg p-2 border border-cyan-500/10">
              <div className="text-[10px] text-cyan-400 text-center mb-1.5 font-medium">{labelMap[tab]}</div>
              <div className="flex items-center gap-1.5">
                <div className="relative shrink-0">
                  <svg width="76" height="76" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e293b" strokeWidth="14" />
                    {slices.map((s, i) => (
                      <circle
                        key={i}
                        cx="60" cy="60" r={radius}
                        fill="none"
                        stroke={s.color}
                        strokeWidth="14"
                        strokeDasharray={`${s.dash} ${circumference - s.dash}`}
                        strokeDashoffset={s.offset}
                        transform="rotate(-90 60 60)"
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                </div>
                <div className="flex-1 space-y-0.5 min-w-0">
                  {data.map((s, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-gray-400 text-[9px] truncate">{s.name}</span>
                      <span className="text-gray-500 text-[9px] ml-auto shrink-0">{s.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
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

  // 建筑碳排放色阶映射
  const emissionColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const buildings = getCampusMapBuildings("2_5d");
    buildings.forEach((b) => {
      if (b.carbon) {
        const level = getEmissionLevel(b.carbon.annualEmission);
        map.set(b.id, getEmissionColor(level));
      }
    });
    return map;
  }, []);

  const leftPanel = (
    <div className="space-y-4 p-3">
      <EconomicZonePanel data={economicZoneData} />
      <EmissionSourceRing data={emissionSourceData} viewMode={emissionViewMode} setViewMode={setEmissionViewMode} />
      <RiskWarningPanel data={riskWarnings} />
      <ComplianceProgressPanel data={complianceProgressData} />
    </div>
  );

  const centerContent = (
    <div className="relative h-full">
      <CampusTileBackground map="2_5d" tone="leader" emissionColorMap={emissionColorMap} />
      {/* 图例 */}
      <div className="absolute bottom-3 left-3 bg-[#0a1e3d]/80 rounded-lg p-2 border border-cyan-500/10">
        <div className="text-[10px] text-gray-400 mb-1.5">建筑碳排放等级</div>
        <div className="flex items-center gap-1.5">
          {[
            { color: "#ef4444", label: "超标 ≥850" },
            { color: "#ff7b25", label: "偏高 650-850" },
            { color: "#3488ff", label: "中等 400-650" },
            { color: "#36d968", label: "低碳 <400" },
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
      <MonthlyTrendChart data2024={monthlyTrendData2024} data2025={monthlyTrendData2025} data2026={monthlyTrendData2026} />
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
