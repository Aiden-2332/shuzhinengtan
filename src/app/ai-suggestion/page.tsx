"use client";

import { useMemo, useState } from "react";
import {
  Lightbulb,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Thermometer,
  Wind,
  Sun,
  ArrowRight,
  BarChart3,
  Target,
  FileText,
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";
import { getAISuggestion } from "@/data/mock-data";

export default function AISuggestionPage() {
  const [energySavingRate, setEnergySavingRate] = useState(25);
  const [electricityPrice, setElectricityPrice] = useState(0.65);
  const [investment, setInvestment] = useState(50);
  const [lifespan, setLifespan] = useState(10);

  const suggestion = useMemo(() => getAISuggestion("anomaly-001"), []);

  // 根据假设参数计算效益
  const benefits = useMemo(() => {
    const annualEnergySaving = 1850 * (energySavingRate / 100); // kWh
    const emissionFactor = 0.5703; // tCO2/MWh
    const annualEmissionReduction = (annualEnergySaving / 1000) * emissionFactor;
    const annualCostSaving = annualEnergySaving * electricityPrice;
    const paybackPeriod = investment / (annualCostSaving / 10000); // 万元转元

    return {
      annualEnergySaving: Math.round(annualEnergySaving),
      annualEmissionReduction: annualEmissionReduction.toFixed(2),
      annualCostSaving: Math.round(annualCostSaving),
      paybackPeriod: paybackPeriod.toFixed(1),
    };
  }, [energySavingRate, electricityPrice, investment, lifespan]);

  const measures = [
    {
      id: "m1",
      name: "空调时段优化",
      icon: Thermometer,
      energySaving: 35,
      cost: 5,
      difficulty: "低",
      selected: true,
    },
    {
      id: "m2",
      name: "夜间基载治理",
      icon: Zap,
      energySaving: 28,
      cost: 15,
      difficulty: "中",
      selected: true,
    },
    {
      id: "m3",
      name: "智能照明改造",
      icon: Lightbulb,
      energySaving: 20,
      cost: 30,
      difficulty: "中",
      selected: false,
    },
  ];

  const radarData = [
    { subject: "节能效果", A: 85, fullMark: 100 },
    { subject: "经济性", A: 72, fullMark: 100 },
    { subject: "实施难度", A: 65, fullMark: 100 },
    { subject: "技术成熟度", A: 90, fullMark: 100 },
    { subject: "可持续性", A: 78, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen grid-bg p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold data-highlight">AI 减排建议</h1>
        <p className="text-gray-400 mt-1 text-sm">基于数据分析的智能减排方案推荐</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：证据与原因 */}
        <div className="col-span-4 space-y-4">
          {/* 证据卡片 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">数据证据</h3>
            <div className="space-y-3">
              {[
                {
                  icon: Thermometer,
                  title: "夜间负荷异常",
                  desc: "22:00-06:00 空调负荷持续偏高",
                  value: "+28%",
                },
                {
                  icon: Clock,
                  title: "运行时长超标",
                  desc: "日均运行时长超出同类建筑",
                  value: "3.5h",
                },
                {
                  icon: BarChart3,
                  title: "能效比偏低",
                  desc: "COP 低于设计值",
                  value: "-15%",
                },
              ].map((evidence, index) => {
                const Icon = evidence.icon;
                return (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Icon className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">{evidence.title}</span>
                          <span className="text-sm font-bold text-orange-400">{evidence.value}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{evidence.desc}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 原因候选 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">原因候选</h3>
            <div className="space-y-2">
              {[
                { reason: "空调定时设置未调整", confidence: 85 },
                { reason: "部分区域设备未关闭", confidence: 72 },
                { reason: "温控策略不合理", confidence: 65 },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{item.reason}</span>
                    <span className="text-xs text-blue-400 font-medium">{item.confidence}%</span>
                  </div>
                  <div className="tech-progress h-1.5">
                    <div
                      className="tech-progress-bar h-full rounded-full"
                      style={{ width: `${item.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 中间：措施与效益 */}
        <div className="col-span-5 space-y-4">
          {/* 措施组合 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">推荐措施组合</h3>
            <div className="space-y-3">
              {measures.map((measure) => {
                const Icon = measure.icon;
                return (
                  <div
                    key={measure.id}
                    className={`p-4 rounded-lg border transition-all ${
                      measure.selected
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-gray-800/30 border-gray-700/30"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          measure.selected ? "bg-blue-500/20" : "bg-gray-700/30"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            measure.selected ? "text-blue-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">{measure.name}</span>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              measure.selected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {measure.selected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-gray-400">节能率：</span>
                            <span className="text-green-400 font-medium">{measure.energySaving}%</span>
                          </div>
                          <div>
                            <span className="text-gray-400">投资：</span>
                            <span className="text-orange-400 font-medium">{measure.cost}万</span>
                          </div>
                          <div>
                            <span className="text-gray-400">难度：</span>
                            <span
                              className={`font-medium ${
                                measure.difficulty === "低"
                                  ? "text-green-400"
                                  : measure.difficulty === "中"
                                  ? "text-orange-400"
                                  : "text-red-400"
                              }`}
                            >
                              {measure.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 假设参数调节 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">假设参数调节</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">节能率</span>
                  <span className="text-sm font-bold text-blue-400">{energySavingRate}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={energySavingRate}
                  onChange={(e) => setEnergySavingRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">电价</span>
                  <span className="text-sm font-bold text-blue-400">{electricityPrice} 元/kWh</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.2"
                  step="0.05"
                  value={electricityPrice}
                  onChange={(e) => setElectricityPrice(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">投资额</span>
                  <span className="text-sm font-bold text-blue-400">{investment} 万元</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={investment}
                  onChange={(e) => setInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">使用寿命</span>
                  <span className="text-sm font-bold text-blue-400">{lifespan} 年</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={lifespan}
                  onChange={(e) => setLifespan(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：效益结果 */}
        <div className="col-span-3 space-y-4">
          {/* 效益卡片 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">预期效益</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-400">年节电量</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {benefits.annualEnergySaving}
                  <span className="text-sm text-gray-400 ml-1">kWh</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Wind className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-400">年减排量</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {benefits.annualEmissionReduction}
                  <span className="text-sm text-gray-400 ml-1">tCO₂</span>
                </div>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-400">年费用节省</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {benefits.annualCostSaving}
                  <span className="text-sm text-gray-400 ml-1">元</span>
                </div>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-gray-400">静态回收期</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {benefits.paybackPeriod}
                  <span className="text-sm text-gray-400 ml-1">年</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="tech-card rounded-xl p-4">
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                采纳并转项目
              </button>
              <button className="w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2">
                <XCircle className="w-4 h-4" />
                驳回
              </button>
            </div>
          </div>

          {/* 免责声明 */}
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="text-xs text-gray-400">
                以上建议基于模拟数据生成，实际效果需结合现场情况评估。AI 输出仅供参考，不构成决策依据。
              </div>
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