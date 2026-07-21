"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  FileText,
  Calculator,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  TrendingUp,
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
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { getCalculationBatch, getEnergyStructure } from "@/data/mock-data";

const STEPS = [
  { id: 1, name: "数据准备", icon: FileText },
  { id: 2, name: "质量检查", icon: CheckCircle2 },
  { id: 3, name: "核算计算", icon: Calculator },
  { id: 4, name: "复核确认", icon: CheckCircle2 },
  { id: 5, name: "锁定报告", icon: Lock },
];

const ENERGY_ICONS = {
  electricity: Zap,
  natural_gas: Flame,
  heat: Thermometer,
  solar: Sun,
  green_electricity: Zap,
};

const ENERGY_COLORS = {
  electricity: "#0099FF",
  natural_gas: "#F59E0B",
  heat: "#EF4444",
  solar: "#EAB308",
  green_electricity: "#10B981",
};

export default function CalculationPage() {
  const [currentStep, setCurrentStep] = useState(3);
  const [expandedSource, setExpandedSource] = useState<string | null>("electricity");
  const [period] = useState("2026-06");

  const batch = useMemo(() => getCalculationBatch(period), [period]);
  const energyStructure = useMemo(() => getEnergyStructure(2026), []);

  const COLORS = ["#0099FF", "#F59E0B", "#EF4444", "#EAB308", "#10B981"];

  return (
    <div className="min-h-screen grid-bg p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold data-highlight">碳核算工作台</h1>
        <p className="text-gray-400 mt-1 text-sm">月度碳排放核算与数据追溯</p>
      </div>

      {/* 步骤进度条 */}
      <div className="tech-card rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep - 1;
            const isCurrent = index === currentStep - 1;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? "bg-green-500/20 border-2 border-green-500/50 text-green-400"
                        : isCurrent
                        ? "bg-blue-500/20 border-2 border-blue-500/50 text-blue-400 animate-pulse-glow"
                        : "bg-gray-700/30 border-2 border-gray-600/30 text-gray-500"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs mt-2 ${
                      isCompleted
                        ? "text-green-400"
                        : isCurrent
                        ? "text-blue-400 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      isCompleted ? "bg-green-500/50" : "bg-gray-700/50"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：排放汇总 */}
        <div className="col-span-7 space-y-4">
          {/* 排放汇总卡片 */}
          <div className="tech-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="tech-title text-sm font-medium text-gray-300">排放汇总</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">核算周期：</span>
                <span className="text-sm text-white font-medium">{period}</span>
              </div>
            </div>

            {/* KPI 卡片 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                <div className="text-xs text-gray-400 mb-1">总排放量</div>
                <div className="text-2xl font-bold text-white">
                  {batch.totalEmission}
                  <span className="text-sm text-gray-400 ml-1">tCO₂</span>
                </div>
                <div className="text-xs text-green-400 mt-1">↓ 3.2% 环比</div>
              </div>
              <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                <div className="text-xs text-gray-400 mb-1">数据完整率</div>
                <div className="text-2xl font-bold text-white">
                  {batch.dataCompleteness}
                  <span className="text-sm text-gray-400 ml-1">%</span>
                </div>
                <div className="text-xs text-green-400 mt-1">✓ 达标</div>
              </div>
              <div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/20">
                <div className="text-xs text-gray-400 mb-1">质量问题</div>
                <div className="text-2xl font-bold text-white">
                  {batch.blockingIssues}
                  <span className="text-sm text-gray-400 ml-1">项</span>
                </div>
                <div className="text-xs text-orange-400 mt-1"> 待处理</div>
              </div>
            </div>

            {/* 排放来源明细 */}
            <h4 className="text-sm font-medium text-gray-300 mb-3">排放来源明细</h4>
            <div className="space-y-2">
              {Object.entries(batch.emissionBreakdown).map(([energyType, emission]) => {
                const Icon = ENERGY_ICONS[energyType as keyof typeof ENERGY_ICONS] || Zap;
                const color = ENERGY_COLORS[energyType as keyof typeof ENERGY_COLORS] || "#0099FF";
                const isExpanded = expandedSource === energyType;
                const energyNames: Record<string, string> = { electricity: "外购电力", natural_gas: "天然气", heat: "外购热力", solar: "光伏", green_electricity: "绿电" };

                return (
                  <div
                    key={energyType}
                    className="bg-gray-800/30 rounded-lg border border-gray-700/30 overflow-hidden"
                  >
                    <div
                      onClick={() => setExpandedSource(isExpanded ? null : energyType)}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                          <Icon className="w-4 h-4" style={{ color }} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{energyNames[energyType] || energyType}</div>
                          <div className="text-xs text-gray-400">{emission} tCO₂</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-white">{emission} t</div>
                          <div className="text-xs text-gray-400">占比 {((emission / batch.totalEmission) * 100).toFixed(1)}%</div>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-gray-700/30 bg-gray-900/30">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-2">
                            <div><span className="text-gray-400">排放量：</span><span className="text-white">{emission} tCO₂</span></div>
                            <div><span className="text-gray-400">能源类型：</span><span className="text-blue-400">{energyNames[energyType]}</span></div>
                          </div>
                          <div className="space-y-2">
                            <div><span className="text-gray-400">数据来源：</span><span className="text-green-400">表计读数</span></div>
                            <div><span className="text-gray-400">支撑材料：</span><span className="text-cyan-400">3 个附件</span></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 质量检查状态 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">质量检查状态</h3>
            <div className="space-y-3">
              {[
                { name: "完整性检查", status: "passed", count: 0 },
                { name: "合理性检查", status: "warning", count: 2 },
                { name: "一致性检查", status: "passed", count: 0 },
                { name: "时序检查", status: "blocked", count: 1 },
              ].map((check) => (
                <div
                  key={check.name}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    check.status === "passed"
                      ? "bg-green-500/10 border-green-500/20"
                      : check.status === "warning"
                      ? "bg-orange-500/10 border-orange-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {check.status === "passed" && (
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                    )}
                    {check.status === "warning" && (
                      <AlertCircle className="w-5 h-5 text-orange-400" />
                    )}
                    {check.status === "blocked" && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm text-white">{check.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {check.count > 0 && (
                      <span className="text-xs text-gray-400">{check.count} 项问题</span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        check.status === "passed"
                          ? "bg-green-500/20 text-green-400"
                          : check.status === "warning"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {check.status === "passed"
                        ? "通过"
                        : check.status === "warning"
                        ? "警告"
                        : "阻断"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 阻断提示 */}
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-300">存在阻断级问题</div>
                  <div className="text-xs text-gray-400 mt-1">
                    时序检查发现 1 项问题：教学楼 A 6月15-21日夜间负荷异常，需确认后方可锁定。
                  </div>
                  <button className="mt-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 hover:bg-red-500/30 transition-colors">
                    查看问题详情
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：图表 */}
        <div className="col-span-5 space-y-4">
          {/* 能源结构饼图 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">能源结构分布</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyStructure}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {energyStructure.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">核算操作</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2">
                <Calculator className="w-4 h-4" />
                重新试算
              </button>
              <button className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                生成报告预览
              </button>
              <button
                disabled
                className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/30 rounded-lg text-sm text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                锁定核算（需先解决问题）
              </button>
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