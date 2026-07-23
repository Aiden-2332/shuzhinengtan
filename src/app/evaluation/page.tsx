"use client";

import React, { useState, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
  level: number; // 1=节约型 2=绿色 3=低碳
  type: "national" | "local";
  year: string;
  description: string;
  totalScore: number;
  maxScore: number;
  grade: string; // A/B/C/D/E or 一星/二星/三星 or 甲级/乙级/丙级
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
    code: "GB/T 29117-2012",
    fullName: "节约型学校评价导则",
    shortName: "节约型校园",
    level: 1,
    type: "national",
    year: "2012",
    description:
      "国家标准，基础层。聚焦资源节约与能源管理，是高校能碳管理的入门门槛。",
    totalScore: 87,
    maxScore: 100,
    grade: "A 级（优秀）",
    categories: [
      {
        name: "管理与制度",
        weight: 15,
        items: [
          { name: "组织机构", score: 14, maxScore: 15, status: "excellent" },
          { name: "制度建设", score: 13, maxScore: 15, status: "good" },
        ],
      },
      {
        name: "建筑与设备",
        weight: 20,
        items: [
          { name: "建筑节能", score: 17, maxScore: 20, status: "good" },
          { name: "设备效率", score: 18, maxScore: 20, status: "excellent" },
        ],
      },
      {
        name: "资源利用",
        weight: 25,
        items: [
          { name: "水资源利用", score: 21, maxScore: 25, status: "good" },
          { name: "能源利用", score: 22, maxScore: 25, status: "good" },
          { name: "土地资源", score: 12, maxScore: 15, status: "good" },
        ],
      },
      {
        name: "节约环保",
        weight: 20,
        items: [
          { name: "废弃物处理", score: 16, maxScore: 20, status: "good" },
          { name: "环境治理", score: 15, maxScore: 18, status: "good" },
        ],
      },
      {
        name: "创新特色",
        weight: 20,
        items: [
          { name: "技术创新", score: 8, maxScore: 10, status: "good" },
          { name: "特色项目", score: 9, maxScore: 10, status: "excellent" },
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
      "国家标准，进阶层。在节约型基础上增加生态规划、健康环境、教育推广维度。",
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
          {
            name: "单位建筑面积碳排放",
            score: 21,
            maxScore: 30,
            status: "pass",
          },
          {
            name: "人均碳排放",
            score: 19,
            maxScore: 25,
            status: "pass",
          },
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

function TierProgressRing({
  score,
  maxScore,
  color,
  size = 80,
}: {
  score: number;
  maxScore: number;
  color: string;
  size?: number;
}) {
  const pct = Math.min(100, (score / maxScore) * 100);
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;
  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray .8s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function TierStepCard({
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
  const isTop = index === 0;
  const isBottom = index === TIERS.length - 1;

  return (
    <div
      className={cn(
        "relative rounded-xl border transition-all duration-300 cursor-pointer group",
        "hover:border-white/20 hover:shadow-lg hover:shadow-black/20",
        isExpanded ? "border-white/25 bg-white/[0.06]" : "border-white/[0.08] bg-white/[0.03]"
      )}
      onClick={onToggle}
    >
      {/* Level connector line */}
      {!isBottom && (
        <div
          className="absolute left-1/2 -bottom-4 w-[2px] h-4 z-10"
          style={{ background: `linear-gradient(to bottom, ${color}, rgba(255,255,255,.08))` }}
        />
      )}

      <CardContent className="pt-5 pb-4 px-5">
        {/* Tier header */}
        <div className="flex items-start gap-4 mb-3">
          <TierProgressRing score={tier.totalScore} maxScore={tier.maxScore} color={color} size={76} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-black"
                style={{ backgroundColor: color }}
              >
                {index + 1}
              </span>
              <h3 className="font-bold text-base text-white">{tier.shortName}</h3>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  tier.type === "national"
                    ? "border-blue-400/40 text-blue-300 bg-blue-400/10"
                    : "border-purple-400/40 text-purple-300 bg-purple-400/10"
                )}
              >
                {tier.type === "national" ? "国标" : "地标"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">{tier.code}</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed line-clamp-2">
              {tier.description}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-lg font-bold" style={{ color }}>
              {tier.grade.split("（")[0]}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {tier.totalScore}/{tier.maxScore} 分
            </div>
          </div>
        </div>

        {/* Expandable categories */}
        <div
          className={cn(
            "grid gap-1 overflow-hidden transition-all duration-400 ease-out",
            isExpanded ? "max-h-[800px] opacity-100 mt-3 pt-3 border-t border-white/[0.06]" : "max-h-0 opacity-0"
          )}
        >
          {tier.categories.map((cat) => (
            <div key={cat.name} className="rounded-lg bg-black/20 p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                {cat.weight !== undefined && (
                  <span className="text-[10px] text-slate-500 font-mono">权重 {(cat.weight * 100).toFixed(0)}%</span>
                )}
              </div>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 truncate flex-1 min-w-0">
                      {item.name}
                    </span>
                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden shrink-0">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(item.score / item.maxScore) * 100}%`,
                          backgroundColor: color,
                          opacity: 0.75,
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 w-12 text-right tabular-nums shrink-0">
                      {item.score}/{item.maxScore}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                           */
/* ------------------------------------------------------------------ */

export default function EvaluationPage() {
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  // Radar data — each dimension = category avg score %
  const radarData = useMemo(() => {
    const dims = ["管理与制度", "建筑设备", "资源利用", "环境健康", "教育文化"];
    return dims.map((dim) => {
      const vals: Record<string, number> = {};
      TIERS.forEach((t) => {
        let sum = 0,
          max = 0;
        t.categories.forEach((c) => {
          c.items.forEach((i) => {
            sum += i.score;
            max += i.maxScore;
          });
        });
        vals[t.id] = max > 0 ? (sum / max) * 100 : 0;
      });
      return { dimension: dim, ...vals };
    });
  }, []);

  // Stacked bar data for score comparison
  const barData = useMemo(() =>
    TIERS.map((t) => ({
      name: t.shortName,
      得分: t.totalScore,
      满分: t.maxScore - t.totalScore,
      color: TIER_COLORS[t.level - 1],
    })),
  []
  );

  // Category-level comparison bar chart
  const catCompareData = useMemo(() => {
    const allCats = [...new Set(TIERS.flatMap((t) => t.categories.map((c) => c.name)))].slice(0, 6);
    return allCats.map((catName) => {
      const row: Record<string, string | number> = { name: catName };
      TIERS.forEach((t) => {
        const cat = t.categories.find((c) => c.name === catName);
        if (cat) {
          const s = cat.items.reduce((a, b) => a + b.score, 0);
          const m = cat.items.reduce((a, b) => a + b.maxScore, 0);
          row[t.shortName] = m > 0 ? +((s / m) * 100).toFixed(1) : 0;
        } else {
          row[t.shortName] = 0;
        }
      });
      return row;
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white p-4 md:p-6 space-y-5">
      {/* ── Page header ── */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">绿色 / 低碳校园评价</h1>
          <p className="text-sm text-slate-400 mt-1">
            基于国家标准 GB/T 29117-2012、GB/T 51356-2019 与北京市地方标准 DB11/T 1404-2025 的三层递进评价体系
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Demo 模拟数据</p>
          <p className="text-[10px] text-slate-600 mt-0.5">不用于正式申报</p>
        </div>
      </header>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 1 – Three-tier Progressive Architecture   */}
      {/* ════════════════════════════════════════════ */}
      <section>
        <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-cyan-400 rounded-full" />
          三层递进评价体系
        </h2>
        <div className="relative grid gap-6 max-w-3xl mx-auto">
          {/* Background gradient line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-0 hidden sm:block"
            style={{
              background:
                "linear-gradient(to bottom, #22C55E 0%, #F59E0B 50%, #EF4444 100%)",
              opacity: 0.35,
            }}
          />

          {TIERS.map((tier, i) => (
            <TierStepCard
              key={tier.id}
              tier={tier}
              index={i}
              isExpanded={expandedTier === i}
              onToggle={() => setExpandedTier(expandedTier === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 2 – Score Comparison (Advanced Visual)     */}
      {/* ════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Stacked horizontal bars */}
        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardContent className="pt-5 pb-4 px-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">三层标准总得分对比</h3>
            <p className="text-[10px] text-slate-500 mb-4">得分越高代表该标准下综合表现越好</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#CBD5E1" }} width={70} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v.toFixed(1)} 分`, ""]}
                />
                <Bar dataKey="得分" stackId="a" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
                <Bar dataKey="满分" stackId="a" fill="rgba(255,255,255,.05)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right: Radar chart */}
        <Card className="border-white/[0.08] bg-white/[0.03]">
          <CardContent className="pt-5 pb-4 px-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-1">多维度能力雷达图</h3>
            <p className="text-[10px] text-slate-500 mb-4">覆盖面越广、得分越高说明综合能力越强</p>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,.06)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: "#64748B" }}
                  axisLine={false}
                  tickCount={5}
                />
                {TIERS.map((t, i) => (
                  <Radar
                    key={t.id}
                    name={t.shortName}
                    dataKey={t.id}
                    stroke={TIER_COLORS[i]}
                    fill={TIER_COLORS[i]}
                    fillOpacity={0.12}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    background: "#1E293B",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`${v.toFixed(1)}%`, ""]}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center justify-center gap-4 mt-2">
              {TIERS.map((t, i) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: TIER_COLORS[i] }} />
                  <span className="text-[10px] text-slate-400">{t.shortName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 3 – Category-level Comparison             */}
      {/* ════════════════════════════════════════════ */}
      <Card className="border-white/[0.08] bg-white/[0.03]">
        <CardContent className="pt-5 pb-4 px-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">分类维度逐项对比</h3>
          <p className="text-[10px] text-slate-500 mb-4">同一维度在不同标准下的得分率差异一目了然</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={catCompareData} barGap={4} barCategoryGap={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={45} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{
                  background: "#1E293B",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                formatter={(v: number) => [`${v.toFixed(1)}%`, ""]}
              />
              {TIERS.map((t, i) => (
                <Bar key={t.id} dataKey={t.shortName} fill={TIER_COLORS[i]} radius={[3, 3, 0, 0]} opacity={0.85} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 4 – Carbon Intensity Benchmark (DB11)     */}
      {/* ════════════════════════════════════════════ */}
      <Card className="border-white/[0.08] bg-white/[0.03]">
        <CardContent className="pt-5 pb-4 px-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold text-slate-200">碳排放强度基准对标（DB11/T 1404-2025）</h3>
            <Badge variant="outline" className="text-[10px] border-purple-400/40 text-purple-300 bg-purple-400/10">
              北京市地方标准
            </Badge>
          </div>
          <p className="text-[10px] text-slate-500 mb-4">
            约束值（底线）→ 平均值（行业）→ 先进值（目标），当前值位置反映低碳水平
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BENCHMARKS.map((bm) => {
              const range = bm.constraint - bm.advanced;
              const pos = ((bm.constraint - bm.current) / range) * 100;
              const clampedPos = Math.max(0, Math.min(100, pos));
              const isGood = bm.current <= bm.average;
              return (
                <div key={bm.label} className="rounded-lg bg-black/20 p-4">
                  <p className="text-xs font-medium text-slate-300 mb-3">{bm.label}</p>
                  <div className="relative h-8 bg-white/5 rounded-md overflow-hidden mb-2">
                    {/* Gradient zone: red → yellow → green */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #22C55E 100%)`,
                        opacity: 0.25,
                      }}
                    />
                    {/* Constraint marker */}
                    <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-red-400/60" style={{ left: "0%" }} />
                    <span className="absolute -top-4 left-0 text-[9px] text-red-400 whitespace-nowrap">
                      约束{bm.constraint}
                    </span>
                    {/* Average marker */}
                    <div
                      className="absolute top-0 bottom-0 w-[1px] bg-yellow-400/60"
                      style={{ left: `${((bm.constraint - bm.average) / range) * 100}%` }}
                    />
                    <span
                      className="absolute -top-4 text-[9px] text-yellow-400 whitespace-nowrap"
                      style={{ left: `${((bm.constraint - bm.average) / range) * 100}%`, transform: "translateX(-50%)" }}
                    >
                      平均{bm.average}
                    </span>
                    {/* Advanced marker */}
                    <div
                      className="absolute top-0 bottom-0 w-[1px] bg-green-400/60"
                      style={{ left: `${((bm.constraint - bm.advanced) / range) * 100}%` }}
                    />
                    <span
                      className="absolute -top-4 text-[9px] text-green-400 whitespace-nowrap"
                      style={{ left: `${((bm.constraint - bm.advanced) / range) * 100}%`, transform: "translateX(-50%)" }}
                    >
                      先进{bm.advanced}
                    </span>
                    {/* Current value pointer */}
                    <div
                      className="absolute top-0 bottom-0 w-[3px] rounded-full shadow-lg z-10"
                      style={{ left: `${clampedPos}%`, backgroundColor: isGood ? "#22C55E" : "#F59E0B" }}
                    />
                    <div
                      className="absolute -top-5 text-[10px] font-bold whitespace-nowrap z-10"
                      style={{ left: `${clampedPos}%`, transform: "translateX(-50%)", color: isGood ? "#22C55E" : "#F59E0B" }}
                    >
                      当前 {bm.current} {bm.unit}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={cn(isGood ? "text-green-400" : "text-yellow-400")}>
                      {isGood ? "✓ 达到平均值以上" : "△ 未达平均值"}
                    </span>
                    <span className="text-slate-500">{bm.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ════════════════════════════════════════════ */}
      {/*  ROW 5 – Progression Summary                     */}
      {/* ════════════════════════════════════════════ */}
      <Card className="border-white/[0.08] bg-white/[0.03]">
        <CardContent className="pt-5 pb-4 px-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">层级递进关系总览</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2.5 px-3 text-slate-400 font-medium">层级</th>
                  <th className="text-left py-2.5 px-3 text-slate-400 font-medium">标准编号</th>
                  <th className="text-left py-2.5 px-3 text-slate-400 font-medium">性质</th>
                  <th className="text-right py-2.5 px-3 text-slate-400 font-medium">总分</th>
                  <th className="text-right py-2.5 px-3 text-slate-400 font-medium">等级</th>
                  <th className="text-left py-2.5 px-3 text-slate-400 font-medium">核心关注</th>
                </tr>
              </thead>
              <tbody>
                {TIERS.map((t, i) => (
                  <tr key={t.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-black"
                        style={{ backgroundColor: TIER_COLORS[i] }}
                      >
                        L{i + 1}
                      </span>
                      <span className="ml-2 text-slate-200 font-medium">{t.shortName}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{t.code}</td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          t.type === "national"
                            ? "border-blue-400/40 text-blue-300"
                            : "border-purple-400/40 text-purple-300"
                        )}
                      >
                        {t.type === "national" ? "国标" : "地标"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums" style={{ color: TIER_COLORS[i] }}>
                      {t.totalScore.toFixed(1)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-300">{t.grade}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {i === 0 && "资源节约、能源管理"}
                      {i === 1 && "生态规划、健康环境、教育推广"}
                      {i === 2 && "碳排放强度、低碳文化与运行"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Watermark */}
      <p className="text-center text-[10px] text-slate-600 pb-4">Demo 模拟数据，不用于申报</p>
    </div>
  );
}
