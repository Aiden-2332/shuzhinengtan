"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  DollarSign,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Flame,
  Thermometer,
  Sun,
  ChevronDown,
  ChevronRight,
  Download,
  Settings,
  RefreshCw,
  Check,
  User,
  Building2,
  FileText,
  Search,
  Shield,
  Activity,
  TrendingUpIcon,
  TrendingDownIcon,
  Minus,
  ExternalLink,
  X,
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
  Area,
  AreaChart,
  Legend,
  Cell,
  PieChart,
  Pie,
  Label,
} from "recharts";
import { useCarbonAssetStore } from "@/stores/carbon-asset-store";
import { useRealtimeNow } from "@/hooks/use-realtime-now";

// ============================================================
// 常量
// ============================================================
const YEARS = [2024, 2025, 2026, 2027];
const CAMPUSES = ["全部校区", "主校区", "东校区"];
const BOTTOM_TABS = [
  { key: "emission-vs-quota", label: "月度排放vs配额", icon: "📊" },
  { key: "trade-records", label: "交易记录", icon: "💰" },
  { key: "asset-value", label: "碳资产增值", icon: "📈" },
  { key: "compliance-radar", label: "合规雷达", icon: "🔍" },
  { key: "audit-prep", label: "核查准备", icon: "📋" },
] as const;

type BottomTabKey = (typeof BOTTOM_TABS)[number]["key"];

// ============================================================
// 工具函数
// ============================================================
function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN");
}

function formatMoney(n: number): string {
  if (Math.abs(n) >= 10000) {
    return `¥${(n / 10000).toFixed(1)}万`;
  }
  return `¥${n.toLocaleString("zh-CN")}`;
}

function getGapRiskLevel(gap: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (gap < 0) return { label: "盈余", color: "#00d4aa", bgColor: "bg-[#00d4aa]/10" };
  if (gap < 5000) return { label: "低风险", color: "#3488ff", bgColor: "bg-[#3488ff]/10" };
  if (gap < 10000) return { label: "中风险", color: "#ff7b25", bgColor: "bg-[#ff7b25]/10" };
  return { label: "高风险", color: "#ff3333", bgColor: "bg-[#ff3333]/10" };
}

// ============================================================
// 子组件：动画数字
// ============================================================
function AnimatedNumber({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  return (
    <span className={className}>
      {formatNumber(value)}
      {suffix && <span className="text-sm ml-1 opacity-70">{suffix}</span>}
    </span>
  );
}

// ============================================================
// 子组件：顶部导航栏
// ============================================================
function TopNavBar() {
  const {
    selectedYear,
    selectedCampus,
    realTimeEstimate,
    setYear,
    setCampus,
    setRealTimeEstimate,
  } = useCarbonAssetStore();
  const [yearOpen, setYearOpen] = useState(false);
  const [campusOpen, setCampusOpen] = useState(false);

  return (
    <div className="h-14 flex items-center justify-between px-6 backdrop-blur-xl bg-[#081028]/80 border-b border-white/10 shrink-0 z-20">
      <div className="flex items-center gap-4">
        {/* 年度选择器 */}
        <div className="relative">
          <button
            onClick={() => { setYearOpen(!yearOpen); setCampusOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
          >
            <Calendar className="w-4 h-4 text-[#3488ff]" />
            {selectedYear}年度
            <ChevronDown className={`w-3 h-3 transition-transform ${yearOpen ? "rotate-180" : ""}`} />
          </button>
          {yearOpen && (
            <div className="absolute top-full mt-1 left-0 bg-[#0a1628] border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setYearOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${y === selectedYear ? "text-[#3488ff]" : "text-white/80"}`}
                >
                  {y}年度
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 校区筛选 */}
        <div className="relative">
          <button
            onClick={() => { setCampusOpen(!campusOpen); setYearOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
          >
            <Building2 className="w-4 h-4 text-[#3488ff]" />
            {selectedCampus}
            <ChevronDown className={`w-3 h-3 transition-transform ${campusOpen ? "rotate-180" : ""}`} />
          </button>
          {campusOpen && (
            <div className="absolute top-full mt-1 left-0 bg-[#0a1628] border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[120px]">
              {CAMPUSES.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCampus(c); setCampusOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${c === selectedCampus ? "text-[#3488ff]" : "text-white/80"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 实时估算开关 */}
        <button
          onClick={() => setRealTimeEstimate(!realTimeEstimate)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all ${
            realTimeEstimate
              ? "bg-[#36d968]/10 border-[#36d968]/30 text-[#36d968]"
              : "bg-white/5 border-white/10 text-white/60"
          }`}
        >
          <Activity className="w-4 h-4" />
          实时估算
          <span className={`w-2 h-2 rounded-full ${realTimeEstimate ? "bg-[#36d968]" : "bg-white/20"}`} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors">
          <Download className="w-4 h-4" />
          导出
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors">
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：配额台账 - 三大指标卡
// ============================================================
function QuotaLedgerCard() {
  const { quotaLedger } = useCarbonAssetStore();
  if (!quotaLedger) return null;

  const { totalQuota, consumedQuota, remainingQuota, quotaStatus } = quotaLedger;

  const statusConfig: Record<string, { color: string; label: string; bgClass: string; pulse?: boolean }> = {
    surplus: { color: "#00d4aa", label: "盈余", bgClass: "bg-[#00d4aa]/10" },
    balanced: { color: "#3488ff", label: "刚好", bgClass: "bg-[#3488ff]/10" },
    deficit: { color: "#ff3333", label: "亏损", bgClass: "bg-[#ff3333]/10", pulse: true },
  };

  const cfg = statusConfig[quotaStatus]!;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 mb-3">配额台账 {quotaLedger.year}年度</div>
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs text-white/40 mb-1">总配额</div>
          <div className="text-xl font-bold text-white">
            <AnimatedNumber value={totalQuota} />
          </div>
          <div className="text-xs text-white/30">tCO₂</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className="text-xs text-white/40 mb-1">已消耗</div>
          <div className="text-xl font-bold text-[#ff7b25]">
            <AnimatedNumber value={consumedQuota} />
          </div>
          <div className="text-xs text-white/30">tCO₂</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40 mb-1">剩余</div>
          <div className={`text-xl font-bold ${cfg.pulse ? "animate-pulse" : ""}`} style={{ color: cfg.color }}>
            <AnimatedNumber value={remainingQuota} />
          </div>
          <div className="text-xs text-white/30">
            tCO₂
            <span className="ml-1" style={{ color: cfg.color }}>
              {quotaStatus === "deficit" ? "⚠️亏损" : quotaStatus === "surplus" ? "✅盈余" : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：月度消耗趋势柱状图
// ============================================================
function MonthlyTrendChart() {
  const { quotaLedger } = useCarbonAssetStore();
  if (!quotaLedger) return null;

  const data = quotaLedger.monthlyConsumption;
  const currentMonth = new Date().getMonth();

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 mb-3">月度消耗趋势</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          />
          <Bar dataKey="quota" fill="#3488ff" radius={[4, 4, 0, 0]} name="配额" />
          <Bar dataKey="actualEmission" fill="rgba(255,255,255,0.25)" radius={[4, 4, 0, 0]} name="实际排放" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 子组件：配额来源饼图
// ============================================================
function QuotaSourcePie() {
  const { quotaLedger } = useCarbonAssetStore();
  if (!quotaLedger) return null;

  const pieData = quotaLedger.quotaSources.map((s) => ({
    name: s.label,
    value: s.amount,
    color:
      s.type === "free_allocation"
        ? "#3488ff"
        : s.type === "paid_purchase"
          ? "#ff7b25"
          : s.type === "ccer_offset"
            ? "#36d968"
            : "#9b6bff",
  }));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 mb-3">配额来源</div>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
            <Label
              value={formatNumber(quotaLedger.totalQuota)}
              position="center"
              fill="#fff"
              style={{ fontSize: 14, fontWeight: "bold" }}
            />
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-1 text-xs text-white/50">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 子组件：TOP5楼栋消耗排名
// ============================================================
function TopBuildingsRank() {
  const { quotaLedger } = useCarbonAssetStore();
  if (!quotaLedger) return null;

  const trendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUpIcon className="w-3 h-3 text-[#ff7b25]" />;
    if (trend === "down") return <TrendingDownIcon className="w-3 h-3 text-[#36d968]" />;
    return <Minus className="w-3 h-3 text-[#3488ff]" />;
  };

  const trendColor = (trend: string) => {
    if (trend === "up") return "#ff7b25";
    if (trend === "down") return "#36d968";
    return "#3488ff";
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 mb-3">消耗排名 TOP5</div>
      <div className="space-y-3">
        {quotaLedger.topBuildings.map((b, i) => (
          <div key={b.buildingId} className="group cursor-pointer">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30 w-4">{i + 1}</span>
                <span className="text-sm text-white/80 group-hover:text-[#3488ff] transition-colors">{b.buildingName}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono text-white/90">{formatNumber(b.consumption)}t</span>
                <span className="flex items-center gap-0.5 text-xs" style={{ color: trendColor(b.trend) }}>
                  {trendIcon(b.trend)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${b.percentage}%`,
                  backgroundColor: trendColor(b.trend),
                  opacity: 0.6,
                }}
              />
            </div>
            <div className="text-right text-xs text-white/30 mt-0.5">{b.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 子组件：左侧栏
// ============================================================
function LeftColumn() {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
      <QuotaLedgerCard />
      <MonthlyTrendChart />
      <QuotaSourcePie />
      <TopBuildingsRank />
    </div>
  );
}

// ============================================================
// 子组件：情景模拟器
// ============================================================
function GapSimulator() {
  const {
    carbonPriceInput,
    forecastEmissionInput,
    gapEngine,
    updateCarbonPrice,
    updateForecastEmission,
    simulateGap,
  } = useCarbonAssetStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      updateCarbonPrice(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { simulateGap(val, forecastEmissionInput); }, 300);
    },
    [forecastEmissionInput, updateCarbonPrice, simulateGap]
  );

  const handleEmissionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Number(e.target.value);
      updateForecastEmission(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => { simulateGap(carbonPriceInput, val); }, 300);
    },
    [carbonPriceInput, updateForecastEmission, simulateGap]
  );

  const sim = gapEngine?.simulator;
  const gap = sim?.quotaGap ?? 0;
  const exposure = sim?.fundingExposure ?? 0;
  const risk = getGapRiskLevel(gap);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-4 h-4 text-[#3488ff]" />
        <span className="text-sm font-medium text-white">情景模拟器</span>
      </div>

      {/* 碳价滑块 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">碳价（元/tCO₂）</span>
          <span className="text-sm font-mono text-[#3488ff]">{carbonPriceInput} 元/t</span>
        </div>
        <input
          type="range"
          min={60}
          max={150}
          step={1}
          value={carbonPriceInput}
          onChange={handlePriceChange}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#3488ff]"
        />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>60</span>
          <span className="text-[#3488ff]">当前市场价: {carbonPriceInput}元/t</span>
          <span>150</span>
        </div>
      </div>

      {/* 排放量滑块 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50">预测全年排放量（tCO₂）</span>
          <span className="text-sm font-mono text-[#ff7b25]">{formatNumber(forecastEmissionInput)} tCO₂</span>
        </div>
        <input
          type="range"
          min={15000}
          max={30000}
          step={100}
          value={forecastEmissionInput}
          onChange={handleEmissionChange}
          className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff7b25]"
        />
        <div className="flex justify-between text-xs text-white/30 mt-1">
          <span>15,000</span>
          <span>基于历史趋势预测</span>
          <span>30,000</span>
        </div>
      </div>

      {/* 结果展示 */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-lg p-3 ${risk.bgColor}`}>
          <div className="text-xs text-white/50 mb-1">配额缺口</div>
          <div className="text-xl font-bold" style={{ color: risk.color }}>
            {formatNumber(Math.abs(gap))} tCO₂
          </div>
          <div className="text-xs mt-1" style={{ color: risk.color }}>
            {gap < 0 ? "✅ 盈余" : `⚠️ ${risk.label}`}
          </div>
        </div>
        <div className="rounded-lg p-3 bg-white/5">
          <div className="text-xs text-white/50 mb-1">资金敞口</div>
          <div className="text-xl font-bold text-white">{formatMoney(exposure)}</div>
          <div className="text-xs text-white/30 mt-1">
            {exposure > 1000000 ? "💰 超百万" : "资金敞口"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：三策略对比卡片
// ============================================================
function StrategyComparison() {
  const { gapEngine, selectStrategy, activeStrategy } = useCarbonAssetStore();
  if (!gapEngine) return null;

  const strategies = gapEngine.strategies;

  return (
    <div className="grid grid-cols-3 gap-3 mt-3">
      {strategies.map((strategy) => {
        const isRecommended = strategy.isRecommended;
        const isExpanded = activeStrategy === strategy.id;

        return (
          <motion.div
            key={strategy.id}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => selectStrategy(isExpanded ? null : strategy.id)}
            className={`cursor-pointer rounded-xl p-4 transition-all ${
              isRecommended
                ? "border-2 border-[#36d968] bg-[#36d968]/5 shadow-[0_0_20px_rgba(54,217,104,0.15)]"
                : "border border-white/10 bg-white/5 hover:border-white/20"
            }`}
          >
            {/* 推荐标签 */}
            {isRecommended && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs bg-[#36d968]/20 text-[#36d968] px-2 py-0.5 rounded-full">✅ 推荐</span>
              </div>
            )}

            {/* 标题 */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{strategy.icon}</span>
              <span className="text-sm font-medium text-white">{strategy.label}</span>
            </div>

            {/* 成本 */}
            <div className="mb-3">
              <div className="text-xs text-white/40 mb-0.5">
                {strategy.id === "implement_reduction" ? "总投资" : "总成本"}
              </div>
              <div className={`text-xl font-bold ${isRecommended ? "text-[#36d968]" : "text-white"}`}>
                {formatMoney(strategy.totalCost)}
              </div>
              {strategy.id === "buy_ccer" && strategy.ccerLimit && (
                <div className="text-xs text-white/30 mt-0.5">
                  CCER单价 {strategy.ccerUnitPrice}元/t · 上限 {strategy.ccerLimit}t
                </div>
              )}
              {strategy.id === "implement_reduction" && strategy.paybackMonths && (
                <div className="text-xs text-white/30 mt-0.5">
                  回收期 {strategy.paybackMonths}个月 · 年减排 {strategy.annualReduction}t
                </div>
              )}
            </div>

            {/* 优劣势（展开时显示） */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div>
                      <div className="text-xs text-[#36d968] mb-1">优势</div>
                      {strategy.pros.map((p, i) => (
                        <div key={i} className="text-xs text-white/60 flex items-start gap-1">
                          <Check className="w-3 h-3 text-[#36d968] mt-0.5 shrink-0" />
                          {p}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs text-[#ff7b25] mb-1">劣势</div>
                      {strategy.cons.map((c, i) => (
                        <div key={i} className="text-xs text-white/60 flex items-start gap-1">
                          <X className="w-3 h-3 text-[#ff7b25] mt-0.5 shrink-0" />
                          {c}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 执行按钮 */}
            <button
              className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isRecommended
                  ? "bg-[#36d968]/20 text-[#36d968] hover:bg-[#36d968]/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (strategy.id === "implement_reduction") {
                  window.location.href = "/ai-center?tab=reduction";
                }
              }}
            >
              {strategy.id === "implement_reduction" ? "查看详情 →" : "执行采购 →"}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// 子组件：最优策略推荐 Banner
// ============================================================
function RecommendationBanner() {
  const { gapEngine } = useCarbonAssetStore();
  if (!gapEngine) return null;

  const rec = gapEngine.recommendation;
  const strategy = gapEngine.strategies.find((s) => s.id === rec.strategyId);
  if (!strategy) return null;

  return (
    <div className="mt-3 bg-gradient-to-r from-[#36d968]/15 to-transparent border border-[#36d968]/20 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#36d968]/20 flex items-center justify-center shrink-0">
          <Target className="w-4 h-4 text-[#36d968]" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-white mb-1">
            💡 推荐策略：{strategy.label}
          </div>
          <div className="text-xs text-white/60 leading-relaxed">
            相比直接购买配额，采用{strategy.label}可节省{" "}
            <span className="text-[#36d968] font-bold text-sm">{formatMoney(rec.savings)}</span>
            （降幅 {((rec.savings / (strategy.totalCost + rec.savings)) * 100).toFixed(1)}%），
            但需注意CCER抵销不超过配额的5%上限。
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button className="px-4 py-1.5 bg-[#36d968]/20 text-[#36d968] text-xs font-medium rounded-lg hover:bg-[#36d968]/30 transition-colors">
              执行{strategy.label} →
            </button>
            <button className="px-4 py-1.5 bg-white/5 text-white/60 text-xs rounded-lg hover:bg-white/10 transition-colors">
              查看计算过程
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：中间栏
// ============================================================
function CenterColumn() {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto pr-1">
      <GapSimulator />
      <StrategyComparison />
      <RecommendationBanner />
    </div>
  );
}

// ============================================================
// 子组件：年度履约进度
// ============================================================
function ComplianceProgress() {
  const { complianceCalendar } = useCarbonAssetStore();
  if (!complianceCalendar) return null;

  const { totalTasks, completedTasks, tasks } = complianceCalendar;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const notStarted = tasks.filter((t) => t.status === "not_started").length;
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
      <div className="text-xs text-white/50 mb-3">年度履约进度</div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-[#36d968] rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-white">
          {completedTasks}/{totalTasks}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#36d968]">已完成 {completedTasks}</span>
          <span className="text-[#3488ff]">进行中 {inProgress}</span>
          <span className="text-white/40">待开始 {notStarted}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：任务卡片列表
// ============================================================
function TaskCardList() {
  const { complianceCalendar, updateTaskStatus } = useCarbonAssetStore();
  if (!complianceCalendar) return null;

  const sortedTasks = [...complianceCalendar.tasks].sort((a, b) => {
    const order = { overdue: 0, at_risk: 1, in_progress: 2, not_started: 3, completed: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  const statusConfig: Record<string, { color: string; label: string; bgClass: string }> = {
    completed: { color: "#36d968", label: "已完成", bgClass: "bg-[#36d968]/10" },
    in_progress: { color: "#3488ff", label: "进行中", bgClass: "bg-[#3488ff]/10" },
    not_started: { color: "#8c8c8c", label: "待开始", bgClass: "bg-white/5" },
    overdue: { color: "#ff3333", label: "已逾期", bgClass: "bg-[#ff3333]/10" },
    at_risk: { color: "#ff7b25", label: "即将到期", bgClass: "bg-[#ff7b25]/10" },
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-2 mt-3">
      {sortedTasks.map((task) => {
        const cfg = statusConfig[task.status];
        const isOverdue = task.status === "overdue";
        const isAtRisk = task.status === "at_risk";

        return (
          <motion.div
            key={task.id}
            layout
            className={`rounded-xl p-3 border transition-all ${
              isOverdue
                ? "border-[#ff3333]/30 bg-[#ff3333]/5"
                : isAtRisk
                  ? "border-[#ff7b25]/30 bg-[#ff7b25]/5"
                  : task.status === "completed"
                    ? "border-[#36d968]/20 bg-[#36d968]/5"
                    : "border-white/10 bg-white/5"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {isOverdue ? (
                  <AlertTriangle className={`w-4 h-4 text-[#ff3333] ${isOverdue ? "animate-pulse" : ""}`} />
                ) : isAtRisk ? (
                  <AlertTriangle className="w-4 h-4 text-[#ff7b25]" />
                ) : task.status === "completed" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#36d968]" />
                ) : (
                  <Clock className="w-4 h-4 text-[#3488ff]" />
                )}
                <span className="text-sm text-white/90 font-medium">{task.taskName}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}>
                {cfg.label}
              </span>
            </div>

            <div className="text-xs text-white/40 mb-2">
              截止: {task.deadline}
              <span className="ml-2" style={{ color: cfg.color }}>
                {isOverdue ? `⏰ 已逾期 ${Math.abs(task.daysRemaining)} 天！` : `⏰ 剩余 ${task.daysRemaining} 天`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
              <User className="w-3 h-3" />
              责任人: {task.responsiblePerson}
            </div>

            {/* 进度条 */}
            <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${task.completionProgress}%`, backgroundColor: cfg.color }}
              />
            </div>

            {/* 操作按钮 */}
            {task.status !== "completed" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateTaskStatus(task.id, "completed")}
                  className="flex items-center gap-1 px-3 py-1 bg-[#36d968]/15 text-[#36d968] text-xs rounded-lg hover:bg-[#36d968]/25 transition-colors"
                >
                  <Check className="w-3 h-3" />
                  完成
                </button>
                <button className="flex items-center gap-1 px-3 py-1 bg-white/5 text-white/50 text-xs rounded-lg hover:bg-white/10 transition-colors">
                  <RefreshCw className="w-3 h-3" />
                  转派
                </button>
              </div>
            )}
            {task.status === "completed" && (
              <button className="text-xs text-[#3488ff] hover:underline">查看详情</button>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

// ============================================================
// 子组件：右侧栏
// ============================================================
function RightColumn() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ComplianceProgress />
      <TaskCardList />
    </div>
  );
}

// ============================================================
// 底部面板子组件：月度排放vs配额
// ============================================================
function EmissionVsQuotaPanel() {
  const { quotaLedger } = useCarbonAssetStore();
  const [viewMode, setViewMode] = useState<"monthly" | "quarterly">("monthly");
  if (!quotaLedger) return null;

  const data = quotaLedger.monthlyConsumption;
  const totalQuota = data.reduce((s, d) => s + d.quota, 0);
  const totalEmission = data.reduce((s, d) => s + d.actualEmission, 0);
  const totalDiff = totalQuota - totalEmission;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/80">📊 月度排放 vs 配额</span>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("monthly")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === "monthly" ? "bg-[#3488ff]/20 text-[#3488ff]" : "text-white/50"}`}
          >
            月度
          </button>
          <button
            onClick={() => setViewMode("quarterly")}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${viewMode === "quarterly" ? "bg-[#3488ff]/20 text-[#3488ff]" : "text-white/50"}`}
          >
            季度
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="quota" fill="#3488ff" radius={[4, 4, 0, 0]} name="配额" />
            <Bar dataKey="actualEmission" fill="rgba(255,255,255,0.3)" radius={[4, 4, 0, 0]} name="实际排放" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 年度汇总 */}
      <div className="flex items-center justify-around mt-3 pt-3 border-t border-white/10">
        <div className="text-center">
          <div className="text-xs text-white/40">总配额</div>
          <div className="text-sm font-bold text-[#3488ff]">{formatNumber(totalQuota)} tCO₂</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">总排放</div>
          <div className="text-sm font-bold text-[#ff7b25]">{formatNumber(totalEmission)} tCO₂</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/40">年度差值</div>
          <div className={`text-sm font-bold ${totalDiff >= 0 ? "text-[#36d968]" : "text-[#ff3333]"}`}>
            {totalDiff >= 0 ? "+" : ""}{formatNumber(totalDiff)} tCO₂
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 底部面板子组件：交易记录
// ============================================================
function TradeRecordsPanel() {
  const { tradeRecords, tradePage, tradeTotal, fetchTradeRecords } = useCarbonAssetStore();
  const pageSize = 10;
  const totalPages = Math.ceil(tradeTotal / pageSize);

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm text-white/80 mb-3">💰 交易记录</div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 text-white/40 font-medium">日期</th>
              <th className="text-left py-2 text-white/40 font-medium">类型</th>
              <th className="text-left py-2 text-white/40 font-medium">产品</th>
              <th className="text-right py-2 text-white/40 font-medium">数量(tCO₂)</th>
              <th className="text-right py-2 text-white/40 font-medium">单价(元/t)</th>
              <th className="text-right py-2 text-white/40 font-medium">总额(元)</th>
              <th className="text-left py-2 text-white/40 font-medium">对手方</th>
              <th className="text-left py-2 text-white/40 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {tradeRecords.map((r) => (
              <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="py-2 text-white/70">{r.tradeDate}</td>
                <td className="py-2">
                  <span className={`flex items-center gap-1 ${r.tradeType === "buy" ? "text-[#ff3333]" : "text-[#36d968]"}`}>
                    {r.tradeType === "buy" ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {r.tradeType === "buy" ? "买入" : "卖出"}
                  </span>
                </td>
                <td className="py-2 text-white/70">{r.tradeProduct}</td>
                <td className="py-2 text-right text-white/90 font-mono">{formatNumber(r.quantity)}</td>
                <td className="py-2 text-right text-white/90 font-mono">{r.unitPrice}</td>
                <td className="py-2 text-right text-white/90 font-mono">{formatNumber(r.totalAmount)}</td>
                <td className="py-2 text-white/50">{r.counterparty}</td>
                <td className="py-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    r.status === "settled" ? "bg-[#36d968]/10 text-[#36d968]" :
                    r.status === "pending" ? "bg-[#ff7b25]/10 text-[#ff7b25]" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {r.status === "settled" ? "已结算" : r.status === "pending" ? "待结算" : "已取消"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <div className="text-xs text-white/40">
          共 {tradeTotal} 条记录
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => fetchTradeRecords(tradePage - 1)}
            disabled={tradePage <= 1}
            className="px-2 py-1 text-xs rounded bg-white/5 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            上一页
          </button>
          <span className="text-xs text-white/50 px-2">{tradePage}/{totalPages}</span>
          <button
            onClick={() => fetchTradeRecords(tradePage + 1)}
            disabled={tradePage >= totalPages}
            className="px-2 py-1 text-xs rounded bg-white/5 text-white/50 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 底部面板子组件：碳资产增值
// ============================================================
function AssetValuePanel() {
  const { assetValue, carbonPriceInput } = useCarbonAssetStore();
  if (!assetValue) return null;

  const trendIcon = assetValue.priceTrend === "rising" ? "↑" : assetValue.priceTrend === "declining" ? "↓" : "→";
  const trendColor = assetValue.priceTrend === "rising" ? "#36d968" : assetValue.priceTrend === "declining" ? "#ff3333" : "#8c8c8c";

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm text-white/80 mb-3">📈 碳资产增值速览</div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40 mb-1">盈余配额</div>
          <div className="text-lg font-bold text-[#00d4aa]">{formatNumber(assetValue.surplusQuota)} tCO₂</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40 mb-1">当前估值</div>
          <div className="text-lg font-bold text-white">{formatMoney(assetValue.estimatedValue)}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 text-center">
          <div className="text-xs text-white/40 mb-1">碳价趋势</div>
          <div className="text-lg font-bold" style={{ color: trendColor }}>
            {trendIcon} 近30天{assetValue.priceChange > 0 ? "+" : ""}{assetValue.priceChange}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* 出售时机建议 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#00d4aa]" />
            <span className="text-sm text-white/80">💡 出售时机建议</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">建议时机</span>
              <span className="text-white">{assetValue.sellingAdvice.timing}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">预期碳价</span>
              <span className="text-[#00d4aa]">{assetValue.sellingAdvice.expectedPrice} 元/t</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">预期收益</span>
              <span className="text-[#00d4aa] font-bold">{formatMoney(assetValue.sellingAdvice.expectedGain)}</span>
            </div>
            <div className="text-xs text-white/40 mt-2">{assetValue.sellingAdvice.reason}</div>
          </div>
          <button className="mt-3 w-full py-1.5 bg-[#00d4aa]/10 text-[#00d4aa] text-xs rounded-lg hover:bg-[#00d4aa]/20 transition-colors">
            查看详情
          </button>
        </div>

        {/* 碳金融工具 */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-[#9b6bff]" />
            <span className="text-sm text-white/80">🏦 碳金融工具</span>
          </div>
          <div className="space-y-3">
            {assetValue.financialTools.map((tool) => (
              <div key={tool.id} className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-white/80">{tool.name}</div>
                  <div className="text-xs text-white/40">{tool.description}</div>
                  {tool.estimatedAmount && (
                    <div className="text-xs text-[#9b6bff] mt-0.5">预估额度: {formatMoney(tool.estimatedAmount)}</div>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tool.status === "available" ? "bg-[#36d968]/10 text-[#36d968]" :
                  tool.status === "applied" ? "bg-[#3488ff]/10 text-[#3488ff]" :
                  "bg-white/10 text-white/40"
                }`}>
                  {tool.status === "available" ? "可申请" : tool.status === "applied" ? "已申请" : "已完成"}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full py-1.5 bg-[#9b6bff]/10 text-[#9b6bff] text-xs rounded-lg hover:bg-[#9b6bff]/20 transition-colors">
            申请融资
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 底部面板子组件：合规雷达
// ============================================================
function ComplianceRadarPanel() {
  const { complianceRadar } = useCarbonAssetStore();
  if (!complianceRadar) return null;

  const scoreColor = complianceRadar.complianceScore >= 80 ? "#36d968" : complianceRadar.complianceScore >= 60 ? "#ff7b25" : "#ff3333";

  const statusIcon = (status: string) => {
    if (status === "pass") return <CheckCircle2 className="w-4 h-4 text-[#36d968]" />;
    if (status === "fail") return <AlertCircle className="w-4 h-4 text-[#ff3333]" />;
    if (status === "warning") return <AlertTriangle className="w-4 h-4 text-[#ff7b25]" />;
    return <Clock className="w-4 h-4 text-white/30" />;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/80">🔍 合规雷达</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">合规评分</span>
          <span className="text-lg font-bold" style={{ color: scoreColor }}>{complianceRadar.complianceScore}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* 政策变更时间线 */}
        <div className="overflow-y-auto pr-1">
          <div className="text-xs text-white/50 mb-2 font-medium">政策变更时间线</div>
          <div className="space-y-3">
            {complianceRadar.policyChanges.map((p) => (
              <div key={p.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-3 h-3 text-[#3488ff]" />
                  <span className="text-xs text-white/70">{p.publishDate}</span>
                </div>
                <div className="text-sm text-white/90 mb-1">{p.policyName}</div>
                <div className="text-xs text-white/40 mb-1">发文: {p.issuer} · 生效: {p.effectiveDate}</div>
                <div className="text-xs text-white/50 mb-1">影响: {p.impactScope.join("、")}</div>
                <button className="text-xs text-[#3488ff] hover:underline flex items-center gap-1">
                  {p.actionRequired} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 合规自检清单 */}
        <div className="overflow-y-auto pr-1">
          <div className="text-xs text-white/50 mb-2 font-medium">合规自检清单</div>
          <div className="space-y-2">
            {complianceRadar.selfCheckList.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                {statusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70 truncate">{item.checkItem}</div>
                  <div className="text-xs text-white/30">{item.category} · 上次检查: {item.lastChecked}</div>
                </div>
                {item.status === "fail" && item.fixUrl && (
                  <button className="text-xs text-[#ff3333] hover:underline shrink-0">修复 →</button>
                )}
              </div>
            ))}
          </div>
          <button className="mt-3 w-full py-1.5 bg-[#ff7b25]/10 text-[#ff7b25] text-xs rounded-lg hover:bg-[#ff7b25]/20 transition-colors">
            修复不合规项 →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 底部面板子组件：核查准备中心
// ============================================================
function AuditPrepPanel() {
  const { auditPrep, auditMrvExpandedId } = useCarbonAssetStore();
  const { setAuditMrvExpandedId } = useCarbonAssetStore();
  if (!auditPrep) return null;

  const scoreColor = auditPrep.readinessScore >= 80 ? "#36d968" : auditPrep.readinessScore >= 60 ? "#ff7b25" : "#ff3333";

  // 递归渲染MRV节点
  const renderMRVNode = (node: import("@/data/carbon-asset-mock").MRVNode, depth: number = 0) => {
    const isExpanded = auditMrvExpandedId === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id} style={{ marginLeft: depth * 20 }}>
        <div
          className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white/5 rounded px-2 transition-colors"
          onClick={() => setAuditMrvExpandedId(isExpanded ? null : node.id)}
        >
          {hasChildren && (
            <ChevronRight className={`w-3 h-3 text-white/40 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          )}
          {!hasChildren && <span className="w-3" />}
          <span className="text-xs text-white/60">
            {node.level === "emission" ? "📊" : node.level === "activity_data" ? "📋" : node.level === "meter" ? "🔌" : "📄"}
          </span>
          <span className="text-xs text-white/80">{node.title}</span>
          <span className="text-xs text-white/50 font-mono">{node.data}</span>
          {node.verified ? (
            <CheckCircle2 className="w-3 h-3 text-[#36d968]" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-[#ff7b25]" />
          )}
        </div>
        {isExpanded && hasChildren && node.children.map((child: import("@/data/carbon-asset-mock").MRVNode) => renderMRVNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white/80">📋 核查准备中心</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">准备度</span>
          <span className="text-lg font-bold" style={{ color: scoreColor }}>{auditPrep.readinessScore}/100</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
        {/* MRV数据溯源链 */}
        <div className="overflow-y-auto pr-1">
          <div className="text-xs text-white/50 mb-2 font-medium">MRV数据溯源链</div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            {renderMRVNode(auditPrep.mrvChain)}
          </div>
          <div className="text-xs text-[#36d968] mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            已核验 (32/35 重点设备)
          </div>
        </div>

        {/* 核查清单自检 */}
        <div className="overflow-y-auto pr-1">
          <div className="text-xs text-white/50 mb-2 font-medium">核查清单自检</div>
          <div className="space-y-2">
            {auditPrep.auditChecklist.map((item) => (
              <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-lg p-2 border border-white/10">
                {item.status === "pass" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#36d968] shrink-0" />
                ) : item.status === "fail" ? (
                  <AlertCircle className="w-4 h-4 text-[#ff3333] shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-white/30 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-white/70">{item.checkContent}</div>
                  <div className="text-xs text-white/30">{item.category}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 缺失文档 */}
          {auditPrep.missingDocuments.length > 0 && (
            <div className="mt-3">
              <div className="text-xs text-[#ff7b25] mb-2 font-medium">
                ⚠️ {auditPrep.missingDocuments.length}栋楼缺失原始凭证
              </div>
              {auditPrep.missingDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between bg-[#ff7b25]/5 rounded-lg p-2 mb-1 border border-[#ff7b25]/20">
                  <div>
                    <div className="text-xs text-white/70">{doc.docName}</div>
                    <div className="text-xs text-white/40">{doc.requiredBy}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    doc.severity === "critical" ? "bg-[#ff3333]/10 text-[#ff3333]" :
                    doc.severity === "major" ? "bg-[#ff7b25]/10 text-[#ff7b25]" :
                    "bg-white/10 text-white/40"
                  }`}>
                    {doc.severity === "critical" ? "严重" : doc.severity === "major" ? "重要" : "一般"}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button className="flex-1 py-1.5 bg-white/5 text-white/60 text-xs rounded-lg hover:bg-white/10 transition-colors">
              下载缺失清单
            </button>
            <button className="flex-1 py-1.5 bg-[#3488ff]/10 text-[#3488ff] text-xs rounded-lg hover:bg-[#3488ff]/20 transition-colors">
              一键生成核查包
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 底部面板
// ============================================================
function BottomPanel() {
  const [activeTab, setActiveTab] = useState<BottomTabKey>("emission-vs-quota");

  return (
    <div className="h-[280px] shrink-0 bg-white/[0.02] backdrop-blur-md border-t border-white/10 flex flex-col">
      {/* Tab 栏 */}
      <div className="flex items-center px-6 border-b border-white/10 shrink-0">
        {BOTTOM_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs transition-all border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-[#3488ff] text-[#3488ff]"
                : "border-transparent text-white/50 hover:text-white/70"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-hidden p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "emission-vs-quota" && <EmissionVsQuotaPanel />}
            {activeTab === "trade-records" && <TradeRecordsPanel />}
            {activeTab === "asset-value" && <AssetValuePanel />}
            {activeTab === "compliance-radar" && <ComplianceRadarPanel />}
            {activeTab === "audit-prep" && <AuditPrepPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// 主页面组件
// ============================================================
export default function AssetPage() {
  const {
    fetchQuotaLedger,
    fetchComplianceTasks,
    fetchAssetValue,
    fetchTradeRecords,
    fetchComplianceRadar,
    fetchAuditPreparation,
    simulateGap,
    carbonPriceInput,
    forecastEmissionInput,
  } = useCarbonAssetStore();

  const [initialized, setInitialized] = useState(false);
  const nowMs = useRealtimeNow();

  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchQuotaLedger();
      fetchComplianceTasks();
      fetchAssetValue();
      fetchTradeRecords(1);
      fetchComplianceRadar();
      fetchAuditPreparation();
      simulateGap(carbonPriceInput, forecastEmissionInput);
    }
  }, [initialized, fetchQuotaLedger, fetchComplianceTasks, fetchAssetValue, fetchTradeRecords, fetchComplianceRadar, fetchAuditPreparation, simulateGap, carbonPriceInput, forecastEmissionInput]);

  useEffect(() => {
    if (initialized && nowMs !== null) fetchQuotaLedger();
  }, [initialized, nowMs, fetchQuotaLedger]);

  return (
    <div className="h-full flex flex-col bg-[#081028] text-white overflow-hidden">
      {/* 顶部导航栏 */}
      <TopNavBar />

      {/* 三栏布局 */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4 min-h-0">
        {/* 左侧栏 25% */}
        <div className="w-1/4 min-w-[280px] flex flex-col overflow-hidden">
          <LeftColumn />
        </div>

        {/* 中间栏 50% */}
        <div className="w-1/2 min-w-[500px] flex flex-col overflow-hidden">
          <CenterColumn />
        </div>

        {/* 右侧栏 25% */}
        <div className="w-1/4 min-w-[280px] flex flex-col overflow-hidden">
          <RightColumn />
        </div>
      </div>

      {/* 底部通栏 */}
      <BottomPanel />

      {/* 水印 */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-[#94A3B8]/80 pointer-events-none z-50">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
