"use client";

import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ComposedChart, Legend,
} from "recharts";
import {
  getMonthlyTrends, getEmissionBreakdown, getPerCapitaBreakdown,
  getCostStructure, getMonthlyDualAxis, getRetrofitProjects,
  getQuotaGap, getBudgetStatus, ANNUAL_QUOTA,
  type EmissionBreakdown,
} from "@/data/economic-data";
import { AlertTriangle, AlertCircle, TrendingUp, DollarSign, Target, BarChart3 } from "lucide-react";

// ---------- 颜色常量 ----------
const COLORS = {
  primary: "#0099FF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#DC2626",
  info: "#0099CC",
  muted: "#6B7280",
  bg: "#1E293B",
  border: "rgba(148,163,184,0.15)",
};

// ---------- 自定义 Tooltip ----------
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-800 border border-gray-700/50 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-medium">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ---------- 环形进度条 ----------
function RingGauge({ used, total, label }: { used: number; total: number; label: string }) {
  const percentage = Math.round((used / total) * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const isDanger = percentage > 85;
  const isWarning = percentage > 65;

  return (
    <div className="flex flex-col items-center py-1">
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={radius}
          fill="none"
          stroke={isDanger ? COLORS.danger : isWarning ? COLORS.warning : COLORS.success}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text x="65" y="58" textAnchor="middle" className="fill-white" fontSize="24" fontWeight="700">
          {percentage}%
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#94A3B8" fontSize="11">
          {label}
        </text>
      </svg>
      <div className="flex justify-between w-full text-xs text-gray-400 mt-1 px-2">
        <span>已用: {used.toLocaleString()} tCO₂</span>
        <span>总量: {total.toLocaleString()} tCO₂</span>
      </div>
    </div>
  );
}

// ---------- 微型饼图 ----------
function MiniPieChart({ data, title, unit }: { data: EmissionBreakdown[]; title: string; unit?: string }) {
  const total = useMemo(() => data.reduce((s, d) => s + d.value, 0), [data]);
  return (
    <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
      <h4 className="text-xs font-medium text-gray-300 mb-2">{title}</h4>
      <div className="flex items-center gap-2">
        <div className="w-[80px] h-[80px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={22} outerRadius={38}
                dataKey="value"
                paddingAngle={1.5}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-0.5 min-w-0">
          {data.slice(0, 4).map((item) => (
            <div key={item.name} className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-400 truncate">{item.name}</span>
              </div>
              <span className="text-gray-200 font-medium ml-1">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- 预警卡片 ----------
function WarningCard({ type, title, message, value }: {
  type: "danger" | "warning";
  title: string;
  message: string;
  value?: string;
}) {
  return (
    <div className={`rounded-lg border p-2.5 ${
      type === "danger"
        ? "bg-red-900/15 border-red-500/30"
        : "bg-amber-900/15 border-amber-500/30"
    }`}>
      <div className="flex items-start gap-2">
        {type === "danger" ? (
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${type === "danger" ? "text-red-300" : "text-amber-300"}`}>
              {title}
            </span>
            {value && <span className={`text-xs font-bold ${type === "danger" ? "text-red-400" : "text-amber-400"}`}>{value}</span>}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
}

// ---------- 主组件 ----------
export function EconomicControlZone() {
  const [tab, setTab] = useState<"quota" | "cost">("quota");
  const [quotaView, setQuotaView] = useState<"total" | "perCapita">("total");

  const trends = useMemo(() => getMonthlyTrends(), []);
  const emissionData = useMemo(() => getEmissionBreakdown(), []);
  const perCapitaData = useMemo(() => getPerCapitaBreakdown(), []);
  const costStructure = useMemo(() => getCostStructure(), []);
  const dualAxisData = useMemo(() => getMonthlyDualAxis(), []);
  const retrofitProjects = useMemo(() => getRetrofitProjects(), []);
  const quotaGap = useMemo(() => getQuotaGap(), []);
  const budgetStatus = useMemo(() => getBudgetStatus(), []);

  return (
    <div className="bg-gray-900/60 rounded-xl border border-gray-700/30 overflow-hidden">
      {/* 顶部标题 + 标签切换 */}
      <div className="p-2.5 border-b border-gray-700/30">
        <h3 className="text-xs font-semibold text-gray-200 mb-2 flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          经济控制分区
        </h3>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("quota")}
            className={`flex-1 text-[10px] py-1.5 rounded-md font-medium transition-colors ${
              tab === "quota"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "bg-gray-800/50 text-gray-400 border border-transparent hover:text-gray-300"
            }`}
          >
            配额合规
          </button>
          <button
            onClick={() => setTab("cost")}
            className={`flex-1 text-[10px] py-1.5 rounded-md font-medium transition-colors ${
              tab === "cost"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "bg-gray-800/50 text-gray-400 border border-transparent hover:text-gray-300"
            }`}
          >
            成本控制
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-2.5 space-y-2.5 max-h-[600px] overflow-y-auto">
        {/* ========== 配额合规监控 ========== */}
        {tab === "quota" && (
          <>
            {/* 环形进度仪表盘 */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-[10px] font-medium text-gray-400">配额消耗进度</h4>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  quotaGap.gap > 0 ? "bg-red-900/30 text-red-300" : "bg-green-900/30 text-green-300"
                }`}>
                  {quotaGap.gap > 0 ? "超配风险" : "配额充足"}
                </span>
              </div>
              <RingGauge used={quotaGap.used} total={quotaGap.quota} label="已消耗" />

              {/* 总量/人均切换 */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={() => setQuotaView("total")}
                  className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                    quotaView === "total" ? "bg-cyan-500/15 text-cyan-300" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  总量
                </button>
                <button
                  onClick={() => setQuotaView("perCapita")}
                  className={`flex-1 text-[10px] py-1 rounded transition-colors ${
                    quotaView === "perCapita" ? "bg-cyan-500/15 text-cyan-300" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  人均
                </button>
              </div>
            </div>

            {/* 碳排放分项饼图 */}
            <MiniPieChart
              data={quotaView === "total" ? emissionData : perCapitaData}
              title={quotaView === "total" ? "碳排放分项构成" : "人均碳排放分项"}
              unit={quotaView === "total" ? "tCO₂" : "kgCO₂/人"}
            />

            {/* 月度累计趋势折线图 */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
              <h4 className="text-[10px] font-medium text-gray-400 mb-2">月度累计趋势</h4>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#64748B" }} interval={2} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#64748B" }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="cumulative" stroke={COLORS.primary} strokeWidth={2} dot={false} name="累计排放(tCO₂)" />
                    {quotaView === "perCapita" && (
                      <Line type="monotone" dataKey="perCapita" stroke={COLORS.success} strokeWidth={1.5} dot={false} name="人均(kgCO₂/人)" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 预警卡片 */}
            <WarningCard
              type={quotaGap.gap > 0 ? "danger" : "warning"}
              title="配额缺口预估"
              message={`全年预计排放 ${quotaGap.projectedYearEnd.toLocaleString()} tCO₂，超出配额 ${quotaGap.gap.toLocaleString()} tCO₂`}
              value={`+${quotaGap.gap.toLocaleString()} tCO₂`}
            />
            <WarningCard
              type="warning"
              title="剩余配额月度分配"
              message={`剩余 ${quotaGap.remaining.toLocaleString()} tCO₂，剩余 ${quotaGap.remainingMonths} 个月，月均可用 ${quotaGap.monthlyAvgLeft} tCO₂`}
              value={`${quotaGap.monthlyAvgLeft} tCO₂/月`}
            />
          </>
        )}

        {/* ========== 碳经济成本控制 ========== */}
        {tab === "cost" && (
          <>
            {/* 堆叠柱状图 - 收支结构 */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
              <h4 className="text-[10px] font-medium text-gray-400 mb-2">碳相关收支结构</h4>
              <div className="h-[110px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "支出", 碳配额购买: 588, 电力采购: 1260, 天然气采购: 420, 热力采购: 340, 设备运维: 180 },
                    { name: "收入", 财政补贴: 320, 绿证交易: 85, 碳配额出售: 120, 节能奖励: 45 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 8, fill: "#64748B" }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "8px", color: "#94A3B8" }} />
                    <Bar dataKey="碳配额购买" stackId="a" fill="#EF4444" />
                    <Bar dataKey="电力采购" stackId="a" fill="#F59E0B" />
                    <Bar dataKey="天然气采购" stackId="a" fill="#3B82F6" />
                    <Bar dataKey="热力采购" stackId="a" fill="#8B5CF6" />
                    <Bar dataKey="设备运维" stackId="a" fill="#6B7280" />
                    <Bar dataKey="财政补贴" stackId="b" fill="#10B981" />
                    <Bar dataKey="绿证交易" stackId="b" fill="#06B6D4" />
                    <Bar dataKey="碳配额出售" stackId="b" fill="#EC4899" />
                    <Bar dataKey="节能奖励" stackId="b" fill="#F59E0B" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 双轴折线联动 - 碳排放量 + 能源支出 */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
              <h4 className="text-[10px] font-medium text-gray-400 mb-2">碳排放量 & 能源支出联动</h4>
              <div className="h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={dualAxisData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="month" tick={{ fontSize: 8, fill: "#64748B" }} interval={2} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 8, fill: "#64748B" }} axisLine={false} tickLine={false} width={25} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 8, fill: "#64748B" }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: "8px", color: "#94A3B8" }} />
                    <Bar yAxisId="left" dataKey="emission" fill={COLORS.primary} opacity={0.3} name="碳排放(tCO₂)" barSize={8} />
                    <Line yAxisId="right" type="monotone" dataKey="cost" stroke={COLORS.warning} strokeWidth={2} dot={false} name="能源支出(万元)" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 横向条形图 - 节能改造投入回报 */}
            <div className="bg-gray-800/40 rounded-lg border border-gray-700/30 p-2.5">
              <h4 className="text-[10px] font-medium text-gray-400 mb-2">节能改造投入回报</h4>
              <div className="space-y-1.5">
                {retrofitProjects.slice(0, 4).map((project) => (
                  <div key={project.name} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-14 flex-shrink-0 truncate">{project.name}</span>
                    <div className="flex-1 bg-gray-700/30 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(project.roi * 2, 100)}%`,
                          backgroundColor: project.roi > 30 ? COLORS.success : project.roi > 20 ? COLORS.warning : COLORS.primary,
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-gray-300 w-10 text-right">{project.roi}%</span>
                    <span className="text-[10px] text-gray-500 w-12 text-right">{project.paybackPeriod}年</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 预警卡片 */}
            <WarningCard
              type={budgetStatus.spendingRate > 90 ? "danger" : "warning"}
              title="预算执行状态"
              message={`年度预算 ${budgetStatus.totalBudget} 万元，已支出 ${budgetStatus.totalSpent} 万元（${budgetStatus.spendingRate}%），预计超支 ${budgetStatus.projectedOverspend} 万元`}
              value={`${budgetStatus.spendingRate}%`}
            />
            <WarningCard
              type="warning"
              title="节能改造回本周期"
              message={`平均回本周期 ${(retrofitProjects.reduce((s, p) => s + p.paybackPeriod, 0) / retrofitProjects.length).toFixed(1)} 年，LED改造最快（${retrofitProjects[1].paybackPeriod}年）`}
            />
          </>
        )}
      </div>
    </div>
  );
}