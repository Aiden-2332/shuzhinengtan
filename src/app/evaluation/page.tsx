"use client";

import React, { useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface IndicatorItem {
  name: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "pass" | "fail" | "pending";
}

interface StandardTier {
  id: string;
  code: string;
  fullName: string;
  shortName: string;
  level: number; // 1=绿色学校 2=绿色校园 3=低碳校园
  type: "national" | "local";
  year: string;
  description: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  categories: {
    name: string;
    weight?: number;
    items: IndicatorItem[];
  }[];
}

interface BenchmarkValue {
  label: string;
  constraint: number;
  average: number;
  advanced: number;
  unit: string;
  current: number;
}

/* ------------------------------------------------------------------ */
/*  Mock Data — 三层递进评价体系                                         */
/* ------------------------------------------------------------------ */

const TIERS: StandardTier[] = [
  {
    id: "tier1",
    code: "GB/T 29117-2025",
    fullName: "绿色学校评价导则",
    shortName: "绿色学校",
    level: 1,
    type: "national",
    year: "2025",
    description:
      "国家标准，基础层。覆盖精神文化、物质条件、行为规范、低碳管理四大维度，是学校绿色发展的入门评价。",
    totalScore: 85.5,
    maxScore: 100,
    grade: "A 级（优秀）",
    categories: [
      {
        name: "精神文化",
        weight: 0.25,
        items: [
          { name: "生态文明教育融入教学", score: 22, maxScore: 25, status: "excellent" },
          { name: "学期计划体现绿色建设", score: 21, maxScore: 25, status: "good" },
          { name: "宣传教育活动开展", score: 20, maxScore: 25, status: "good" },
          { name: "节能环保实践活动", score: 18, maxScore: 25, status: "good" },
          { name: "发明创造与产学研", score: 16, maxScore: 25, status: "pass" },
        ],
      },
      {
        name: "物质条件",
        weight: 0.25,
        items: [
          { name: "绿化用地与养护", score: 22, maxScore: 25, status: "excellent" },
          { name: "建筑节能设计改造", score: 20, maxScore: 25, status: "good" },
          { name: "绿色产品采购使用", score: 19, maxScore: 25, status: "good" },
          { name: "新能源与可再生能源", score: 17, maxScore: 25, status: "pass" },
          { name: "能源审计与诊断", score: 21, maxScore: 25, status: "good" },
        ],
      },
      {
        name: "行为规范",
        weight: 0.25,
        items: [
          { name: "管理机构与职责", score: 24, maxScore: 25, status: "excellent" },
          { name: "发展目标与保障", score: 22, maxScore: 25, status: "excellent" },
          { name: "节能降碳管理制度", score: 20, maxScore: 25, status: "good" },
          { name: "节约行为模式推行", score: 18, maxScore: 25, status: "good" },
          { name: "绿色生活方式倡导", score: 16, maxScore: 25, status: "pass" },
        ],
      },
      {
        name: "低碳管理",
        weight: 0.25,
        items: [
          { name: "建筑设备经济运行", score: 21, maxScore: 25, status: "good" },
          { name: "碳排放核算与报告", score: 19, maxScore: 25, status: "good" },
          { name: "改造项目节能评估", score: 17, maxScore: 25, status: "pass" },
          { name: "生活垃圾分类回收", score: 22, maxScore: 25, status: "excellent" },
          { name: "反食品浪费工作", score: 20, maxScore: 25, status: "good" },
        ],
      },
    ],
  },
  {
    id: "tier2",
    code: "GB/T 51356-2019",
    fullName: "绿色校园评价标准",
    shortName: "绿色校园",
    level: 2,
    type: "national",
    year: "2019",
    description:
      "国家标准，进阶层。在绿色学校基础上增加生态规划、健康环境、教育推广维度。",
    totalScore: 78.5,
    maxScore: 100,
    grade: "二星（良好）",
    categories: [
      {
        name: "规划与生态",
        weight: 0.18,
        items: [
          { name: "场地规划", score: 15, maxScore: 18, status: "good" },
          { name: "生态景观", score: 13, maxScore: 16, status: "good" },
          { name: "交通规划", score: 8, maxScore: 10, status: "pass" },
        ],
      },
      {
        name: "能源与资源",
        weight: 0.24,
        items: [
          { name: "建筑能耗", score: 19, maxScore: 24, status: "good" },
          { name: "水资源利用", score: 16, maxScore: 20, status: "good" },
          { name: "材料资源", score: 8, maxScore: 12, status: "pass" },
        ],
      },
      {
        name: "环境与健康",
        weight: 0.22,
        items: [
          { name: "室内环境", score: 16, maxScore: 20, status: "good" },
          { name: "声光热环境", score: 13, maxScore: 16, status: "good" },
          { name: "空气质量", score: 7, maxScore: 10, status: "pass" },
        ],
      },
      {
        name: "运行与管理",
        weight: 0.2,
        items: [
          { name: "智能运维", score: 14, maxScore: 18, status: "good" },
          { name: "管理制度", score: 13, maxScore: 16, status: "good" },
          { name: "应急管理", score: 5, maxScore: 8, status: "pass" },
        ],
      },
      {
        name: "教育与推广",
        weight: 0.16,
        items: [
          { name: "绿色教育", score: 11, maxScore: 14, status: "good" },
          { name: "社会实践", score: 6, maxScore: 10, status: "pass" },
          { name: "宣传推广", score: 4, maxScore: 6, status: "good" },
        ],
      },
    ],
  },
  {
    id: "tier3",
    code: "DB11/T 1404-2025",
    fullName: "高等学校低碳校园评价技术导则",
    shortName: "低碳校园",
    level: 3,
    type: "local",
    year: "2025",
    description:
      "北京市地方标准，最高层。以碳排放为核心指标，要求约束值→平均值→先进值逐级达标。",
    totalScore: 72.3,
    maxScore: 100,
    grade: "乙级（合格）",
    categories: [
      {
        name: "碳排放强度",
        weight: 30,
        items: [
          { name: "单位建筑面积碳排放", score: 21, maxScore: 30, status: "pass" },
          { name: "人均碳排放", score: 19, maxScore: 25, status: "pass" },
        ],
      },
      {
        name: "低碳管理",
        weight: 25,
        items: [
          { name: "组织机构建设", score: 9, maxScore: 10, status: "excellent" },
          { name: "低碳规划及实施方案", score: 8, maxScore: 10, status: "good" },
          { name: "管理制度建设", score: 7, maxScore: 10, status: "good" },
          { name: "碳排放报告与披露", score: 6, maxScore: 8, status: "good" },
          { name: "低碳培训", score: 4, maxScore: 6, status: "pass" },
          { name: "信息化管理", score: 5, maxScore: 7, status: "good" },
        ],
      },
      {
        name: "低碳文化建设",
        weight: 20,
        items: [
          { name: "低碳教学", score: 7, maxScore: 10, status: "good" },
          { name: "低碳科研", score: 6, maxScore: 8, status: "good" },
          { name: "低碳宣传", score: 4, maxScore: 6, status: "pass" },
          { name: "低碳实践", score: 3, maxScore: 5, status: "pass" },
        ],
      },
      {
        name: "低碳运行",
        weight: 25,
        items: [
          { name: "可再生能源利用", score: 7, maxScore: 10, status: "pass" },
          { name: "校园绿化", score: 6, maxScore: 8, status: "good" },
          { name: "技术创新", score: 4, maxScore: 6, status: "pass" },
          { name: "自愿减排产品", score: 3, maxScore: 5, status: "pass" },
          { name: "绿色建筑", score: 5, maxScore: 8, status: "pass" },
          { name: "废弃物处理", score: 4, maxScore: 6, status: "good" },
        ],
      },
    ],
  },
];

const BENCHMARKS: BenchmarkValue[] = [
  {
    label: "单位建筑面积碳排放",
    constraint: 62.64,
    average: 49.92,
    advanced: 45.94,
    unit: "kgCO₂/m²·a",
    current: 47.8,
  },
  {
    label: "人均碳排放",
    constraint: 2017,
    average: 1464,
    advanced: 1202,
    unit: "kgCO₂/(p·a)",
    current: 1385,
  },
];

const TIER_COLORS = ["#22C55E", "#F59E0B", "#EF4444"] as const;

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: IndicatorItem["status"] }) {
  const map: Record<IndicatorItem["status"], { text: string; cls: string }> = {
    excellent: { text: "优秀", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    good: { text: "良好", cls: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    pass: { text: "合格", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
    fail: { text: "不合格", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    pending: { text: "待评", cls: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", map[status].cls)}>
      {map[status].text}
    </Badge>
  );
}

/* ── Large Hero Tier Card ─────────────────────────────────────── */

function HeroTierCard({
  tier,
  index,
  isExpanded,
  onToggle,
}: {
  tier: StandardTier;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const color = TIER_COLORS[index];
  const pct = Math.round((tier.totalScore / tier.maxScore) * 100);
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div
      className={cn(
        "relative rounded-2xl border transition-all duration-300 cursor-pointer group overflow-hidden",
        "hover:border-white/25 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1",
        isExpanded ? "border-white/20 bg-white/[0.07]" : "border-white/[0.08] bg-white/[0.03]"
      )}
      onClick={onToggle}
    >
      {/* Top color accent bar */}
      <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${color}00, ${color}, ${color}00)` }} />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start gap-5 mb-4">
          {/* Large ring */}
          <div className="relative flex-shrink-0">
            <svg width={120} height={120} viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,.04)" strokeWidth="8" />
              <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${dash} ${c - dash}`}
                style={{ transition: "stroke-dasharray .8s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
              <span className="text-2xl font-black tabular-nums" style={{ color }}>{tier.totalScore.toFixed(1)}</span>
              <span className="text-[9px] text-slate-500">满分{tier.maxScore}</span>
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold text-black" style={{ backgroundColor: color }}>
                L{index + 1}
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">{tier.shortName}</h3>
              <Badge variant="outline" className={cn(
                "text-[10px]",
                tier.type === "national"
                  ? "border-cyan-400/40 text-cyan-300 bg-cyan-400/10"
                  : "border-purple-400/40 text-purple-300 bg-purple-400/10"
              )}>
                {tier.type === "national" ? "国标" : "地标"}
              </Badge>
            </div>
            <p className="text-xs font-mono text-slate-400 mb-2">{tier.code} · {tier.year}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{tier.description}</p>

            {/* Grade badge */}
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
              <span className="text-sm font-bold" style={{ color }}>{tier.grade.split("（")[0]}</span>
              <span className="text-[10px] text-slate-400">{tier.grade.includes("（") ? tier.grade.match(/（(.+?)）/)?.[1] || "" : ""}</span>
            </div>
          </div>
        </div>

        {/* Expandable categories */}
        <div className={cn(
          "grid gap-2 overflow-hidden transition-all duration-400 ease-out",
          isExpanded ? "max-h-[900px] opacity-100 mt-4 pt-4 border-t border-white/[0.06]" : "max-h-0 opacity-0"
        )}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {tier.categories.map((cat) => (
              <div key={cat.name} className="rounded-xl bg-black/30 p-3 border border-white/[0.04]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200 truncate">{cat.name}</span>
                </div>
                <div className="space-y-1.5">
                  {cat.items.map((item) => (
                    <div key={item.name}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10px] text-slate-400 truncate">{item.name}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${(item.score / item.maxScore) * 100}%`,
                            backgroundColor: color,
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Switchable Radar Chart ─────────────────────────────────── */

function TierRadarChart({
  activeTierIndex,
  onSwitchTier,
}: {
  activeTierIndex: number;
  onSwitchTier: (idx: number) => void;
}) {
  const activeTier = TIERS[activeTierIndex];
  const color = TIER_COLORS[activeTierIndex];

  const radarData = useMemo(() =>
    activeTier.categories.map((cat) => {
      const sum = cat.items.reduce((a, b) => a + b.score, 0);
      const max = cat.items.reduce((a, b) => a + b.maxScore, 0);
      return {
        dimension: cat.name,
        value: Math.round(max > 0 ? (sum / max) * 100 : 0),
        fullMark: 100,
      };
    }),
    [activeTier]
  );

  return (
    <Card className="border-white/[0.08] bg-white/[0.03]">
      <CardContent className="pt-5 pb-4 px-5">
        {/* Header with switcher */}
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">评价指标体系雷达图</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">切换标准查看各维度指标框架得分</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {TIERS.map((t, i) => (
              <button
                key={t.id}
                onClick={() => onSwitchTier(i)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-medium transition-all duration-200",
                  i === activeTierIndex
                    ? "text-black shadow-md"
                    : "bg-white/[0.05] text-slate-400 hover:text-white hover:bg-white/[0.1]"
                )}
                style={i === activeTierIndex ? { backgroundColor: color } : {}}
              >
                {t.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Active tier info */}
        <div className="flex items-center gap-3 mt-3 mb-2 px-3 py-2 rounded-lg bg-black/20 border border-white/[0.04]">
          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <span className="text-xs font-mono text-slate-300">{activeTier.code}</span>
          <span className="text-xs text-slate-400">—</span>
          <span className="text-xs text-slate-200">{activeTier.fullName}</span>
          <span className="ml-auto text-xs font-semibold tabular-nums" style={{ color }}>
            {activeTier.totalScore}/{activeTier.maxScore} 分
          </span>
        </div>

        {/* Radar */}
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="65%">
            <PolarGrid stroke="rgba(255,255,255,.05)" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#94A3B8" }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: "#64748B" }} axisLine={false} tickCount={5} />
            <Radar
              name={activeTier.shortName}
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.15}
              strokeWidth={2.5}
            />
            <Tooltip
              contentStyle={{
                background: "#1E293B",
                border: "1px solid rgba(255,255,255,.1)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "得分率"]}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Category detail list */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {activeTier.categories.map((cat) => {
            const sum = cat.items.reduce((a, b) => a + b.score, 0);
            const max = cat.items.reduce((a, b) => a + b.maxScore, 0);
            const pct = Math.min(100, Math.round(max > 0 ? (sum / max) * 100 : 0));
            return (
              <div key={cat.name} className="rounded-lg bg-black/20 p-2 border border-white/[0.03]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-slate-300 truncate">{cat.name}</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color, opacity: 0.6 }} />
                </div>
                <div className="text-[9px] text-slate-500 mt-1">{sum}/{max} 分 · {cat.items.length}项</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Benchmark Scale Bar ───────────────────────────────────── */

function BenchmarkBar({ bm }: { bm: BenchmarkValue }) {
  const range = bm.constraint - bm.advanced;
  const pos = ((bm.current - bm.advanced) / range) * 100;
  const avgPos = ((bm.average - bm.advanced) / range) * 100;
  const clampedPos = Math.min(100, Math.max(0, pos));

  let zoneColor: string;
  if (bm.current <= bm.advanced) zoneColor = "#22C55E";
  else if (bm.current <= bm.average) zoneColor = "#F59E0B";
  else zoneColor = "#EF4444";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-300">{bm.label}</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: zoneColor }}>
          {bm.current} <span className="text-[10px] font-normal text-slate-500">{bm.unit}</span>
        </span>
      </div>
      <div className="relative h-6 rounded-full overflow-hidden" style={{
        background: "linear-gradient(90deg, #22C55E 0%, #84CC16 33%, #F59E0B 66%, #EF4444 100%)",
      }}>
        {/* Zone labels */}
        <div className="absolute inset-x-0 top-0 bottom-0 flex items-center justify-between px-2 pointer-events-none">
          <span className="text-[8px] text-white/70 font-medium">先进</span>
          <span className="text-[8px] text-white/70 font-medium">平均</span>
          <span className="text-[8px] text-white/70 font-medium">约束</span>
        </div>
        {/* Average marker */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/60 z-10" style={{ left: `${avgPos}%` }} />
        {/* Current value pointer */}
        <div
          className="absolute top-0 bottom-0 w-[3px] z-20 shadow-lg shadow-current/50"
          style={{ left: `${clampedPos}%`, backgroundColor: zoneColor }}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-black" style={{ backgroundColor: zoneColor }}>
              当前 {bm.current}
            </span>
          </div>
        </div>
      </div>
      <div className="flex justify-between text-[9px] text-slate-600 font-mono">
        <span>{bm.advanced}</span>
        <span>{bm.average}</span>
        <span>{bm.constraint}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function EvaluationPage() {
  const [expandedTier, setExpandedTier] = useState<number | null>(null);
  const [radarTierIdx, setRadarTierIdx] = useState(0);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 md:p-6 space-y-6">
      {/* ── Page header ── */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">绿色 / 低碳校园评价</h1>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            基于国家标准 GB/T 29117-2025、GB/T 51356-2019 与北京市地方标准 DB11/T 1404-2025 的三层递进评价体系
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Demo 模拟数据</p>
          <p className="text-[10px] text-slate-600 mt-0.5">不用于正式申报</p>
        </div>
      </header>

      {/* ════════════════════════════════════════════ */}
      {/*  HERO — Three-tier Progressive Architecture   */}
      {/* ════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-1.5 h-6 bg-cyan-400 rounded-full" />
          <h2 className="text-base font-semibold text-cyan-400 uppercase tracking-wider">三层递进评价体系</h2>
          <span className="text-[10px] text-slate-500 ml-auto">点击卡片展开详细指标</span>
        </div>

        {/* Staggered ascending layout */}
        <div className="relative grid gap-5">
          {/* Background gradient track */}
          <div
            className="absolute left-8 top-0 bottom-0 w-[3px] rounded-full hidden lg:block"
            style={{
              background: "linear-gradient(to bottom, #22C55E 0%, #F59E0B 45%, #EF4444 100%)",
              opacity: 0.2,
            }}
          />

          {TIERS.map((tier, i) => (
            <div
              key={tier.id}
              className={cn(
                "relative transition-all duration-300",
                i === 0 && "lg:ml-0",
                i === 1 && "lg:ml-12",
                i === 2 && "lg:ml-24",
              )}
            >
              {/* Connector dot */}
              <div className="hidden lg:flex absolute -left-[19px] top-8 w-3 h-3 rounded-full border-2 z-10"
                style={{ borderColor: TIER_COLORS[i], backgroundColor: "#0A0E27" }}
              />

              <HeroTierCard
                tier={tier}
                index={i}
                isExpanded={expandedTier === i}
                onToggle={() => setExpandedTier(expandedTier === i ? null : i)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 2 — Switchable Radar Chart               */}
      {/* ════════════════════════════════════════════ */}
      <section>
        <TierRadarChart activeTierIndex={radarTierIdx} onSwitchTier={setRadarTierIdx} />
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 3 — Carbon Intensity Benchmark (DB11)     */}
      {/* ════════════════════════════════════════════ */}
      <Card className="border-white/[0.08] bg-white/[0.03]">
        <CardContent className="pt-5 pb-5 px-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">碳排放强度基准对标</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">DB11/T 1404-2025 北京市地方标准 · 约束值 → 平均值 → 先进值</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-purple-400/40 text-purple-300 bg-purple-400/10">
              北京地标
            </Badge>
          </div>
          <div className="space-y-5">
            {BENCHMARKS.map((bm) => <BenchmarkBar key={bm.label} bm={bm} />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
