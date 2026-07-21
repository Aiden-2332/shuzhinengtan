"use client";

import { useMemo, useState } from "react";
import type { Anomaly } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building2,
  Zap,
  Flame,
  Sun,
  Wind,
  BarChart3,
  Activity,
  Target,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import {
  getKPIData,
  getTrendData,
  getEnergyStructure,
  getBuildingRanking,
  getAnomalies,
} from "@/data/mock-data";

// 3D 建筑模型组件（简化版）
function Building3D() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative" style={{ perspective: "1000px" }}>
        {/* 主建筑 */}
        <div
          className="relative"
          style={{
            transform: "rotateX(60deg) rotateZ(-45deg)",
            transformStyle: "preserve-3d",
          }}
        >
          {/* 建筑主体 */}
          <div className="w-48 h-32 bg-gradient-to-br from-blue-400/30 to-blue-600/30 border border-blue-400/50 rounded-lg backdrop-blur-sm">
            <div className="grid grid-cols-4 grid-rows-3 gap-1 p-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-blue-300/40 rounded-sm"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          {/* 建筑侧面 */}
          <div
            className="absolute top-0 left-full w-8 h-32 bg-gradient-to-r from-blue-600/30 to-blue-800/30 border border-blue-400/30"
            style={{ transformOrigin: "left" }}
          />
        </div>
        {/* 悬浮标签 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tech-card px-3 py-2 rounded-lg text-xs">
          <div className="text-blue-400 font-medium">主教学楼 A</div>
          <div className="text-gray-400 mt-1">日用电: 2,450 kWh</div>
          <div className="text-orange-400 mt-1">⚠ 夜间负荷异常</div>
        </div>
      </div>
    </div>
  );
}

// KPI 卡片组件
function KPICard({
  title,
  value,
  unit,
  trend,
  trendValue,
  icon: Icon,
  color = "blue",
}: {
  title: string;
  value: string | number;
  unit: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  icon: React.ElementType;
  color?: "blue" | "green" | "orange" | "red" | "cyan";
}) {
  const colorMap = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-amber-500",
    red: "from-red-500 to-rose-500",
    cyan: "from-cyan-500 to-teal-500",
  };

  const iconColorMap = {
    blue: "text-blue-400",
    green: "text-green-400",
    orange: "text-orange-400",
    red: "text-red-400",
    cyan: "text-cyan-400",
  };

  return (
    <div className="tech-card rounded-xl p-4 hover:scale-[1.02] transition-transform">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[color]} bg-opacity-20`}>
          <Icon className={`w-5 h-5 ${iconColorMap[color]}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs ${
              trend === "down" ? "text-green-400" : trend === "up" ? "text-red-400" : "text-gray-400"
            }`}
          >
            {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
            {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">
        {value}
        <span className="text-sm text-gray-400 ml-1">{unit}</span>
      </div>
      <div className="text-xs text-gray-400">{title}</div>
    </div>
  );
}

// 数据大屏首页
export default function DashboardPage() {
  const [campus, setCampus] = useState<string>("all");
  const [year, setYear] = useState(2026);

  const kpi = useMemo(() => getKPIData(year, campus === "all" ? undefined : campus), [year, campus]);
  const trend = useMemo(() => getTrendData(year), [year]);
  const energyStructure = useMemo(() => getEnergyStructure(year), [year]);
  const buildingRanking = useMemo(() => getBuildingRanking(year), [year]);
  const risks = useMemo(() => getAnomalies(), []);
  const quotaTotal = 10000; // 总配额（模拟数据）
  const quotaUsed = quotaTotal - kpi.quotaBalance; // 已用配额

  const COLORS = ["#0099FF", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

  return (
    <div className="min-h-screen grid-bg p-6">
      {/* 顶部标题栏 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold data-highlight">碳资产管理驾驶舱</h1>
            <p className="text-gray-400 mt-1 text-sm">某大学 · 智慧碳管理平台</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="tech-card rounded-lg px-4 py-2 text-sm text-gray-300 outline-none"
            >
              <option value={2024}>2024 年</option>
              <option value={2025}>2025 年</option>
              <option value={2026}>2026 年</option>
            </select>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value )}
              className="tech-card rounded-lg px-4 py-2 text-sm text-gray-300 outline-none"
            >
              <option value="all">全部校区</option>
              <option value="main">主校区</option>
              <option value="east">东校区</option>
            </select>
          </div>
        </div>
      </div>

      {/* 主网格布局 */}
      <div className="grid grid-cols-12 gap-4">
        {/* 左侧列 */}
        <div className="col-span-3 space-y-4">
          {/* 碳排放强度 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳排放强度</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">碳排放总量</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {kpi.totalEmission}
                  <span className="text-xs text-gray-400 ml-1">t</span>
                </div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">目标偏差</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {kpi.targetDeviation}
                  <span className="text-xs text-gray-400 ml-1">%</span>
                </div>
              </div>
              <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">单位面积碳排放</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {kpi.intensityPerArea}
                  <span className="text-xs text-gray-400 ml-1">t/㎡</span>
                </div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">人均碳排放</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {kpi.intensityPerCapita}
                  <span className="text-xs text-gray-400 ml-1">t/人</span>
                </div>
              </div>
            </div>
          </div>

          {/* 碳配额 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳配额</h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="rgba(0, 153, 255, 0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#quotaGradient)"
                    strokeWidth="12"
                    strokeDasharray={`${(kpi.quotaBalance / quotaTotal) * 352} 352`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="quotaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0099FF" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white">{kpi.quotaBalance}</div>
                  <div className="text-xs text-gray-400">配额余量 (t)</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2 px-4">
              <span>总配额: {quotaTotal}t</span>
              <span>已用: {quotaUsed}t</span>
            </div>
          </div>

          {/* 碳交易 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳交易</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div>
                  <div className="text-xs text-gray-400">买入</div>
                  <div className="text-lg font-bold text-green-400">9,999.9 t</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">金额</div>
                  <div className="text-lg font-bold text-white">9,999.9 万</div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <div className="text-xs text-gray-400">卖出</div>
                  <div className="text-lg font-bold text-red-400">999.9 t</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">金额</div>
                  <div className="text-lg font-bold text-white">999.9 万</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 中间列 - 3D 建筑模型 */}
        <div className="col-span-6 space-y-4">
          <div className="tech-card rounded-xl p-6 h-[500px] relative overflow-hidden">
            {/* 装饰性背景 */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

            {/* 3D 建筑 */}
            <Building3D />

            {/* 底部控制按钮 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {["还原", "分层展示", "配电房", "巡检", "风速切换"].map((btn) => (
                <button
                  key={btn}
                  className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-300 hover:bg-blue-500/30 transition-colors"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* 碳排放趋势 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳排放趋势</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend}>
                  <defs>
                    <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0099FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0099FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="period" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.9)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    name="当年碳排放量"
                    stroke="#0099FF"
                    fill="url(#colorEmission)"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name="目标值"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 右侧列 */}
        <div className="col-span-3 space-y-4">
          {/* 碳排放结构 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳排放结构</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyStructure}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {energyStructure.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.9)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {energyStructure.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-400">{item.name}</span>
                  <span className="text-white font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 碳排放排名 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳排放排名</h3>
            <div className="space-y-3">
              {buildingRanking.slice(0, 5).map((building, index) => (
                <div key={building.buildingId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? "bg-red-500/20 text-red-400"
                            : index === 1
                            ? "bg-orange-500/20 text-orange-400"
                            : index === 2
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-gray-300">{building.buildingName}</span>
                    </div>
                    <span className="text-white font-medium">{building.emission} t</span>
                  </div>
                  <div className="tech-progress h-2">
                    <div
                      className="tech-progress-bar h-full rounded-full transition-all"
                      style={{
                        width: `${(building.emission / buildingRanking[0].emission) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 碳排放异常 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">碳排放异常</h3>
            <div className="space-y-2">
              {risks.slice(0, 4).map((risk: Anomaly) => (
                <div
                  key={risk.id}
                  className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg border border-red-500/20"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white truncate">{risk.buildingName} - {risk.type}</div>
                    <div className="text-xs text-gray-400 mt-1">{risk.period}</div>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs ${
                      risk.severity === "blocked"
                        ? "bg-red-500/20 text-red-400"
                        : risk.severity === "serious"
                        ? "bg-orange-500/20 text-orange-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {risk.severity === "blocked" ? "应急事件" : risk.severity === "serious" ? "警告" : "提示"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 底部水印 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-80">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}