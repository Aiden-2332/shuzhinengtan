"use client";

import { useMemo, useState } from "react";
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
} from "recharts";
import {
  getQuotaAccount,
  getComplianceEvents,
  getQuotaTransactions,
} from "@/data/mock-data";

export default function AssetPage() {
  const [emissionScenario, setEmissionScenario] = useState(12500);
  const [priceScenario, setPriceScenario] = useState(85);

  const quotaAccount = useMemo(() => getQuotaAccount(2026), []);
  const complianceEvents = useMemo(() => getComplianceEvents(2026), []);
  const transactions = useMemo(() => getQuotaTransactions(2026), []);

  // 情景分析数据
  const scenarioData = useMemo(() => {
    const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    const baseEmission = 1100;
    const cumulativeQuota = quotaAccount.balance / 12;

    return months.map((month, index) => {
      const seasonalFactor = index < 2 || index > 9 ? 1.3 : index > 4 && index < 8 ? 0.8 : 1.0;
      const actual = Math.round(baseEmission * seasonalFactor * (1 + ((index * 7) % 11 - 5) * 0.01));
      const quota = Math.round(cumulativeQuota);
      const cumulativeActual = months
        .slice(0, index + 1)
        .reduce((sum, _, i) => {
          const sf = i < 2 || i > 9 ? 1.3 : i > 4 && i < 8 ? 0.8 : 1.0;
          return sum + Math.round(baseEmission * sf);
        }, 0);
      const cumulativeQuotaTotal = Math.round(cumulativeQuota * (index + 1));

      return {
        month,
        actual,
        quota,
        cumulativeActual,
        cumulativeQuota: cumulativeQuotaTotal,
        gap: cumulativeQuotaTotal - cumulativeActual,
      };
    });
  }, [quotaAccount.balance]);

  const COLORS = ["#0099FF", "#10B981", "#F59E0B", "#EF4444", "#06B6D4"];

  // 风险等级计算
  const riskLevel = useMemo(() => {
    const gap = emissionScenario - quotaAccount.balance;
    if (gap > quotaAccount.balance * 0.05) return { level: "high", label: "高风险", color: "red" };
    if (gap > 0) return { level: "medium", label: "中风险", color: "orange" };
    return { level: "low", label: "低风险", color: "green" };
  }, [emissionScenario, quotaAccount.balance]);

  return (
    <div className="min-h-screen grid-bg p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold data-highlight">碳资产管理</h1>
        <p className="text-gray-400 mt-1 text-sm">配额管理与履约预测</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：配额台账 */}
        <div className="col-span-4 space-y-4">
          {/* 配额余额 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">配额台账</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xs text-gray-400 mb-1">总配额</div>
                <div className="text-2xl font-bold text-white">
                  {quotaAccount.balance.toLocaleString()}
                  <span className="text-sm text-gray-400 ml-1">tCO₂</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <div className="text-xs text-gray-400 mb-1">已使用</div>
                  <div className="text-lg font-bold text-white">
                    {(quotaAccount.allocatedQuota - quotaAccount.balance).toLocaleString()}
                    <span className="text-xs text-gray-400 ml-1">t</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <div className="text-xs text-gray-400 mb-1">剩余配额</div>
                  <div className="text-lg font-bold text-white">
                    {quotaAccount.balance.toLocaleString()}
                    <span className="text-xs text-gray-400 ml-1">t</span>
                  </div>
                </div>
              </div>
              <div className="tech-progress h-2">
                <div
                  className="tech-progress-bar h-full rounded-full"
                  style={{
                    width: `${((quotaAccount.allocatedQuota - quotaAccount.balance) / quotaAccount.balance) * 100}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>已用 {((quotaAccount.allocatedQuota - quotaAccount.balance) / quotaAccount.balance * 100).toFixed(1)}%</span>
                <span>剩余 {(quotaAccount.balance / quotaAccount.balance * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* 交易记录 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">交易记录</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border ${
                    tx.type === "purchase"
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {tx.type === "purchase" ? (
                        <ArrowDownRight className="w-4 h-4 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {tx.type === "purchase" ? "买入" : "卖出"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{tx.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      {tx.quantity.toLocaleString()} t @ {tx.price || 0} 元/t
                    </span>
                    <span className="text-white font-medium">
                      {(((tx.quantity * (tx.price || 0))) / 10000).toFixed(1)} 万
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间：缺口预测 */}
        <div className="col-span-5 space-y-4">
          {/* 情景分析 */}
          <div className="tech-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="tech-title text-sm font-medium text-gray-300">缺口预测（情景分析）</h3>
              <div
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  riskLevel.color === "red"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : riskLevel.color === "orange"
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                    : "bg-green-500/20 text-green-400 border border-green-500/30"
                }`}
              >
                {riskLevel.label}
              </div>
            </div>

            {/* 情景参数调节 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">预测排放量</span>
                  <span className="text-sm font-bold text-blue-400">
                    {emissionScenario.toLocaleString()} t
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="15000"
                  step="100"
                  value={emissionScenario}
                  onChange={(e) => setEmissionScenario(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">碳价格</span>
                  <span className="text-sm font-bold text-blue-400">{priceScenario} 元/t</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="5"
                  value={priceScenario}
                  onChange={(e) => setPriceScenario(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>

            {/* 缺口计算结果 */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-xs text-gray-400 mb-1">配额缺口</div>
                <div className="text-xl font-bold text-red-400">
                  {Math.max(0, emissionScenario - quotaAccount.balance).toLocaleString()}
                  <span className="text-xs text-gray-400 ml-1">t</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-xs text-gray-400 mb-1">资金敞口</div>
                <div className="text-xl font-bold text-orange-400">
                  {Math.max(0, emissionScenario - quotaAccount.balance) * priceScenario / 10000}
                  <span className="text-xs text-gray-400 ml-1">万元</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-xs text-gray-400 mb-1">履约进度</div>
                <div className="text-xl font-bold text-blue-400">
                  {((quotaAccount.allocatedQuota - quotaAccount.balance) / emissionScenario * 100).toFixed(1)}
                  <span className="text-xs text-gray-400 ml-1">%</span>
                </div>
              </div>
            </div>

            {/* 累计排放 vs 配额图表 */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={scenarioData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorQuota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="cumulativeActual"
                    name="累计排放"
                    stroke="#EF4444"
                    fill="url(#colorActual)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulativeQuota"
                    name="累计配额"
                    stroke="#10B981"
                    fill="url(#colorQuota)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              * 以上为模拟情景分析，实际数据以官方核定为准
            </div>
          </div>

          {/* 月度排放 vs 配额 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">月度排放 vs 配额</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="actual" name="实际排放" fill="#EF4444" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="quota" name="配额分配" fill="#10B981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 右侧：履约日历 */}
        <div className="col-span-3 space-y-4">
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">履约日历</h3>
            <div className="space-y-3">
              {complianceEvents.map((event, index) => {
                const isCompleted = event.status === "completed";
                const isUpcoming = event.status === "pending";
                const isOverdue = event.status === "overdue";

                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${
                      isCompleted
                        ? "bg-green-500/10 border-green-500/20"
                        : isOverdue
                        ? "bg-red-500/10 border-red-500/20"
                        : "bg-gray-800/30 border-gray-700/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted
                            ? "bg-green-500/20 text-green-400"
                            : isOverdue
                            ? "bg-red-500/20 text-red-400"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isOverdue ? (
                          <AlertCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white mb-1">{event.name}</div>
                        <div className="text-xs text-gray-400 mb-2">
                          截止：{event.dueDate}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              isCompleted
                                ? "bg-green-500/20 text-green-400"
                                : isOverdue
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                            }`}
                          >
                            {isCompleted ? "已完成" : isOverdue ? "已逾期" : "待完成"}
                          </span>
                          {isUpcoming && (
                            <span className="text-xs text-gray-400">
                              剩余 {30} 天
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 履约方案建议 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">履约方案建议</h3>
            <div className="space-y-3">
              {[
                {
                  name: "方案 A：优先减排",
                  desc: "通过节能项目减少排放，降低配额需求",
                  cost: "投资 50 万，减排 200t",
                },
                {
                  name: "方案 B：市场采购",
                  desc: "在碳市场购买配额补足缺口",
                  cost: `预计支出 ${(Math.max(0, emissionScenario - quotaAccount.balance) * priceScenario / 10000).toFixed(1)} 万`,
                },
                {
                  name: "方案 C：组合策略",
                  desc: "减排 + 采购 + 抵销产品组合",
                  cost: "综合成本最优",
                },
              ].map((scheme, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-blue-500/30 transition-colors cursor-pointer"
                >
                  <div className="text-sm font-medium text-white mb-1">{scheme.name}</div>
                  <div className="text-xs text-gray-400 mb-2">{scheme.desc}</div>
                  <div className="text-xs text-blue-400">{scheme.cost}</div>
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