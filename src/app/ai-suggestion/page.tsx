"use client";

import { useMemo, useState, useCallback } from "react";
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
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  GanttChart,
  SlidersHorizontal,
  Plus,
  Minus,
  Play,
  Pause,
  Flag,
  ClipboardList,
  MessageSquare,
  RotateCcw,
  Settings2,
  TrendingUp,
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

// ---- 类型定义 ----
type PageStatus = "pending" | "adopted" | "rejected" | "adjusting";

interface MeasureItem {
  id: string;
  name: string;
  icon: typeof Thermometer;
  energySaving: number;
  cost: number;
  difficulty: string;
  description: string;
  timeline: string;
}

interface Milestone {
  id: string;
  name: string;
  target: string;
  status: "completed" | "in_progress" | "pending";
  date: string;
}

interface AdjustmentOption {
  id: string;
  label: string;
  description: string;
  icon: typeof Settings2;
}

// ---- 措施数据 ----
const defaultMeasures: MeasureItem[] = [
  {
    id: "m1",
    name: "空调时段优化",
    icon: Thermometer,
    energySaving: 35,
    cost: 5,
    difficulty: "低",
    description: "调整空调运行时段，在非使用时段自动关闭或降低功率运行",
    timeline: "2-4周",
  },
  {
    id: "m2",
    name: "夜间基载治理",
    icon: Zap,
    energySaving: 28,
    cost: 15,
    difficulty: "中",
    description: "排查夜间非必要用电设备，建立关机检查清单与自动化关断机制",
    timeline: "4-8周",
  },
  {
    id: "m3",
    name: "智能照明改造",
    icon: Lightbulb,
    energySaving: 20,
    cost: 30,
    difficulty: "中",
    description: "更换为LED灯具并加装人体感应与光照传感器，实现按需照明",
    timeline: "8-12周",
  },
  {
    id: "m4",
    name: "光伏发电扩容",
    icon: Sun,
    energySaving: 15,
    cost: 80,
    difficulty: "高",
    description: "在屋顶加装光伏板，提升可再生能源自给率，降低外购电力碳排放",
    timeline: "12-24周",
  },
];

// ---- 里程碑模板 ----
const defaultMilestones: Milestone[] = [
  { id: "ms1", name: "方案评审", target: "完成技术方案内部评审", status: "pending", date: "第1周" },
  { id: "ms2", name: "预算审批", target: "获得财务预算批复", status: "pending", date: "第2周" },
  { id: "ms3", name: "设备采购", target: "完成主要设备招标采购", status: "pending", date: "第3-4周" },
  { id: "ms4", name: "施工安装", target: "完成现场施工与设备安装", status: "pending", date: "第5-8周" },
  { id: "ms5", name: "调试验收", target: "系统联调与节能效果验证", status: "pending", date: "第9-10周" },
  { id: "ms6", name: "运行监测", target: "持续监测节能效果并优化", status: "pending", date: "第11周起" },
];

// ---- 驳回调整选项 ----
const adjustmentOptions: AdjustmentOption[] = [
  {
    id: "adj1",
    label: "调整措施组合",
    description: "重新选择推荐措施，去掉不合适的、增加替代方案",
    icon: SlidersHorizontal,
  },
  {
    id: "adj2",
    label: "修改假设参数",
    description: "调整节能率、电价、投资额等关键假设，重新试算效益",
    icon: Settings2,
  },
  {
    id: "adj3",
    label: "更换目标建筑",
    description: "将方案应用到其他更适合的建筑或校区",
    icon: Target,
  },
  {
    id: "adj4",
    label: "补充数据证据",
    description: "补充更多监测数据或现场勘查信息，提高建议可信度",
    icon: ClipboardList,
  },
  {
    id: "adj5",
    label: "调整实施优先级",
    description: "重新排序措施优先级，优先实施投入产出比更高的项目",
    icon: TrendingUp,
  },
];

// ---- 驳回原因 ----
const rejectReasons = [
  "投资回收期过长，不符合财务要求",
  "当前预算不足，建议延后实施",
  "技术方案不成熟，需要进一步论证",
  "与现有系统兼容性存疑",
  "节能效果预估过于乐观",
  "实施周期影响正常教学秩序",
];

export default function AISuggestionPage() {
  // ---- 页面状态机 ----
  const [pageStatus, setPageStatus] = useState<PageStatus>("pending");

  // ---- 措施选择状态 ----
  const [selectedMeasures, setSelectedMeasures] = useState<Set<string>>(
    new Set(["m1", "m2"])
  );
  const [expandedMeasure, setExpandedMeasure] = useState<string | null>(null);

  // ---- 假设参数 ----
  const [energySavingRate, setEnergySavingRate] = useState(25);
  const [electricityPrice, setElectricityPrice] = useState(0.65);
  const [investment, setInvestment] = useState(50);
  const [lifespan, setLifespan] = useState(10);

  // ---- 采纳后项目状态 ----
  const [milestones, setMilestones] = useState<Milestone[]>(defaultMilestones);
  const [projectNote, setProjectNote] = useState("");

  // ---- 驳回状态 ----
  const [selectedReasons, setSelectedReasons] = useState<Set<string>>(new Set());
  const [rejectNote, setRejectNote] = useState("");
  const [selectedAdjustment, setSelectedAdjustment] = useState<string | null>(null);
  const [showAdjustmentPanel, setShowAdjustmentPanel] = useState(false);

  // ---- 数据 ----
  const suggestion = useMemo(() => getAISuggestion("anomaly-001"), []);

  // ---- 计算选中措施的总效益 ----
  const selectedMeasuresData = useMemo(
    () => defaultMeasures.filter((m) => selectedMeasures.has(m.id)),
    [selectedMeasures]
  );

  const totalEnergySaving = useMemo(
    () => selectedMeasuresData.reduce((sum, m) => sum + m.energySaving, 0),
    [selectedMeasuresData]
  );

  const totalCost = useMemo(
    () => selectedMeasuresData.reduce((sum, m) => sum + m.cost, 0),
    [selectedMeasuresData]
  );

  // ---- 根据假设参数计算效益 ----
  const benefits = useMemo(() => {
    const baseSaving = 1850;
    const adjustedSaving = baseSaving * (totalEnergySaving / 63); // 63 = 默认全选节能率总和
    const annualEnergySaving = adjustedSaving * (energySavingRate / 100);
    const emissionFactor = 0.5703;
    const annualEmissionReduction = (annualEnergySaving / 1000) * emissionFactor;
    const annualCostSaving = annualEnergySaving * electricityPrice;
    const paybackPeriod =
      annualCostSaving > 0 ? totalCost / (annualCostSaving / 10000) : 99;

    return {
      annualEnergySaving: Math.round(annualEnergySaving),
      annualEmissionReduction: annualEmissionReduction.toFixed(2),
      annualCostSaving: Math.round(annualCostSaving),
      paybackPeriod: paybackPeriod > 50 ? ">50" : paybackPeriod.toFixed(1),
    };
  }, [energySavingRate, electricityPrice, totalCost, totalEnergySaving]);

  // ---- 雷达图数据 ----
  const radarData = useMemo(() => {
    const count = selectedMeasuresData.length;
    if (count === 0) return [];
    return [
      { subject: "节能效果", A: Math.round(totalEnergySaving / count * 2.4), fullMark: 100 },
      { subject: "经济性", A: Math.max(30, 90 - totalCost * 0.6), fullMark: 100 },
      { subject: "实施难度", A: Math.max(40, 90 - totalCost * 0.5), fullMark: 100 },
      { subject: "技术成熟度", A: 90, fullMark: 100 },
      { subject: "可持续性", A: 78, fullMark: 100 },
    ];
  }, [selectedMeasuresData, totalEnergySaving, totalCost]);

  // ---- 措施勾选切换 ----
  const toggleMeasure = useCallback((id: string) => {
    setSelectedMeasures((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleAllMeasures = useCallback(() => {
    setSelectedMeasures((prev) => {
      if (prev.size === defaultMeasures.length) {
        return new Set<string>();
      }
      return new Set(defaultMeasures.map((m) => m.id));
    });
  }, []);

  // ---- 采纳操作 ----
  const handleAdopt = useCallback(() => {
    if (selectedMeasures.size === 0) return;
    setPageStatus("adopted");
    // 初始化里程碑：第一个设为进行中
    setMilestones((prev) =>
      prev.map((m, i) =>
        i === 0 ? { ...m, status: "in_progress" as const } : m
      )
    );
  }, [selectedMeasures]);

  // ---- 驳回操作 ----
  const handleReject = useCallback(() => {
    setPageStatus("rejected");
    setShowAdjustmentPanel(true);
  }, []);

  const toggleRejectReason = useCallback((reason: string) => {
    setSelectedReasons((prev) => {
      const next = new Set(prev);
      if (next.has(reason)) {
        next.delete(reason);
      } else {
        next.add(reason);
      }
      return next;
    });
  }, []);

  // ---- 里程碑操作 ----
  const advanceMilestone = useCallback(() => {
    setMilestones((prev) => {
      const currentIdx = prev.findIndex((m) => m.status === "in_progress");
      if (currentIdx === -1) return prev;
      const next = prev.map((m, i) => {
        if (i === currentIdx) return { ...m, status: "completed" as const };
        if (i === currentIdx + 1) return { ...m, status: "in_progress" as const };
        return m;
      });
      return next;
    });
  }, []);

  // ---- 重新开始 ----
  const handleReset = useCallback(() => {
    setPageStatus("pending");
    setSelectedMeasures(new Set(["m1", "m2"]));
    setMilestones(defaultMilestones);
    setSelectedReasons(new Set());
    setRejectNote("");
    setSelectedAdjustment(null);
    setShowAdjustmentPanel(false);
    setProjectNote("");
  }, []);

  // ---- 从驳回进入调整 ----
  const handleStartAdjust = useCallback(() => {
    setPageStatus("adjusting");
  }, []);

  const handleConfirmAdjust = useCallback(() => {
    setPageStatus("pending");
    setSelectedReasons(new Set());
    setRejectNote("");
    setSelectedAdjustment(null);
    setShowAdjustmentPanel(false);
  }, []);

  // ---- 渲染：pending 状态（初始建议视图）----
  const renderPendingView = () => (
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
                        <span className="text-sm font-medium text-white">
                          {evidence.title}
                        </span>
                        <span className="text-sm font-bold text-orange-400">
                          {evidence.value}
                        </span>
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
                  <span className="text-xs text-blue-400 font-medium">
                    {item.confidence}%
                  </span>
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
        {/* 措施组合 - 可勾选 */}
        <div className="tech-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="tech-title text-sm font-medium text-gray-300">推荐措施组合</h3>
            <button
              onClick={toggleAllMeasures}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              {selectedMeasures.size === defaultMeasures.length ? "取消全选" : "全选"}
            </button>
          </div>
          <div className="space-y-3">
            {defaultMeasures.map((measure) => {
              const Icon = measure.icon;
              const isSelected = selectedMeasures.has(measure.id);
              const isExpanded = expandedMeasure === measure.id;
              return (
                <div
                  key={measure.id}
                  className={`rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50"
                  }`}
                >
                  <div
                    className="p-4 flex items-start gap-3"
                    onClick={() => toggleMeasure(measure.id)}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected ? "bg-blue-500/20" : "bg-gray-700/30"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? "text-blue-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {measure.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedMeasure(
                                isExpanded ? null : measure.id
                              );
                            }}
                            className="text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">节能率：</span>
                          <span className="text-green-400 font-medium">
                            {measure.energySaving}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">投资：</span>
                          <span className="text-orange-400 font-medium">
                            {measure.cost}万
                          </span>
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
                  {/* 展开详情 */}
                  {isExpanded && (
                    <div
                      className="px-4 pb-4 pt-0 border-t border-gray-700/30 mx-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="pt-3 space-y-2">
                        <p className="text-xs text-gray-400">{measure.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-500">预计工期：</span>
                          <span className="text-gray-300">{measure.timeline}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* 已选措施汇总 */}
          {selectedMeasures.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  已选 <span className="text-blue-400 font-medium">{selectedMeasures.size}</span>{" "}
                  项措施
                </span>
                <span className="text-gray-400">
                  综合节能率：<span className="text-green-400 font-medium">{totalEnergySaving}%</span>
                  {" · "}
                  总投资：<span className="text-orange-400 font-medium">{totalCost}万</span>
                </span>
              </div>
            </div>
          )}
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
                <span className="text-sm font-bold text-blue-400">
                  {electricityPrice} 元/kWh
                </span>
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

      {/* 右侧：效益结果 + 操作 */}
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

        {/* 雷达图 */}
        {radarData.length > 0 && (
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-2">综合评估</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#9CA3AF", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  name="综合评分"
                  dataKey="A"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="tech-card rounded-xl p-4">
          <div className="space-y-3">
            <button
              onClick={handleAdopt}
              disabled={selectedMeasures.size === 0}
              className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              采纳并转项目
            </button>
            <button
              onClick={handleReject}
              className="w-full px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300 hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              驳回
            </button>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400">
              以上建议基于模拟数据生成，实际效果需结合现场情况评估。AI 输出仅供参考，不构成决策依据。
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- 渲染：adopted 状态（项目执行计划）----
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const inProgressIdx = milestones.findIndex((m) => m.status === "in_progress");
  const totalMilestones = milestones.length;
  const progressPercent = Math.round((completedCount / totalMilestones) * 100);

  const renderAdoptedView = () => (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：项目概览 */}
      <div className="col-span-4 space-y-4">
        {/* 项目状态卡片 */}
        <div className="tech-card rounded-xl p-4 border-green-500/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">减排项目已启动</h3>
              <p className="text-xs text-gray-400">项目编号：EP-2026-001</p>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">总体进度</span>
              <span className="text-xs font-bold text-green-400">{progressPercent}%</span>
            </div>
            <div className="tech-progress h-2">
              <div
                className="tech-progress-bar h-full rounded-full bg-green-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 基本信息 */}
          <div className="space-y-2 mt-4 pt-4 border-t border-gray-700/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">选中措施</span>
              <span className="text-white font-medium">{selectedMeasures.size} 项</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">总投资</span>
              <span className="text-orange-400 font-medium">{totalCost} 万元</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">预计年减排</span>
              <span className="text-green-400 font-medium">{benefits.annualEmissionReduction} tCO₂</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">当前阶段</span>
              <span className="text-blue-400 font-medium">
                {inProgressIdx >= 0 ? milestones[inProgressIdx].name : "已完成"}
              </span>
            </div>
          </div>
        </div>

        {/* 选中措施清单 */}
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-3">实施措施清单</h3>
          <div className="space-y-2">
            {selectedMeasuresData.map((measure) => {
              const Icon = measure.icon;
              return (
                <div
                  key={measure.id}
                  className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30 flex items-center gap-3"
                >
                  <div className="p-1.5 rounded bg-blue-500/20">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{measure.name}</div>
                    <div className="text-xs text-gray-400">
                      节能 {measure.energySaving}% · 投资 {measure.cost}万 · {measure.timeline}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 中间：里程碑 */}
      <div className="col-span-5 space-y-4">
        <div className="tech-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="tech-title text-sm font-medium text-gray-300">项目里程碑</h3>
            <button
              onClick={advanceMilestone}
              disabled={inProgressIdx === -1}
              className="text-xs px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3 h-3" />
              推进下一阶段
            </button>
          </div>

          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-700/50" />

            <div className="space-y-0">
              {milestones.map((milestone, index) => {
                const isCompleted = milestone.status === "completed";
                const isInProgress = milestone.status === "in_progress";
                const isPending = milestone.status === "pending";

                return (
                  <div key={milestone.id} className="relative flex gap-4 pb-5 last:pb-0">
                    {/* 节点 */}
                    <div className="relative z-10 flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-[38px] h-[38px] rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        </div>
                      ) : isInProgress ? (
                        <div className="w-[38px] h-[38px] rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center animate-pulse">
                          <RefreshCw className="w-4 h-4 text-blue-400" />
                        </div>
                      ) : (
                        <div className="w-[38px] h-[38px] rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* 内容 */}
                    <div
                      className={`flex-1 p-3 rounded-lg border transition-all ${
                        isInProgress
                          ? "bg-blue-500/10 border-blue-500/30"
                          : isCompleted
                          ? "bg-green-500/5 border-green-500/20"
                          : "bg-gray-800/20 border-gray-700/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isCompleted
                              ? "text-green-300"
                              : isInProgress
                              ? "text-blue-300"
                              : "text-gray-400"
                          }`}
                        >
                          {milestone.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            isCompleted
                              ? "bg-green-500/20 text-green-400"
                              : isInProgress
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-700/50 text-gray-500"
                          }`}
                        >
                          {isCompleted ? "已完成" : isInProgress ? "进行中" : "待开始"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">{milestone.target}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {milestone.date}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-3">项目备注</h3>
          <textarea
            value={projectNote}
            onChange={(e) => setProjectNote(e.target.value)}
            placeholder="添加项目执行备注、注意事项..."
            rows={3}
            className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
          />
        </div>
      </div>

      {/* 右侧：效益跟踪 + 操作 */}
      <div className="col-span-3 space-y-4">
        {/* 效益跟踪 */}
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">效益跟踪</h3>
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
          </div>
        </div>

        {/* 操作 */}
        <div className="tech-card rounded-xl p-4">
          <div className="space-y-3">
            <button
              onClick={advanceMilestone}
              disabled={inProgressIdx === -1}
              className="w-full px-4 py-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              推进到下一阶段
            </button>
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-gray-700/30 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重新评估
            </button>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400">
              项目处于执行阶段，请定期更新里程碑进度。AI 输出仅供参考。
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- 渲染：rejected 状态（驳回调整面板）----
  const renderRejectedView = () => (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：驳回原因选择 */}
      <div className="col-span-5 space-y-4">
        <div className="tech-card rounded-xl p-4 border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-red-500/20">
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">建议已驳回</h3>
              <p className="text-xs text-gray-400">请选择驳回原因并选择调整策略</p>
            </div>
          </div>

          {/* 驳回原因选择 */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-400 mb-3">驳回原因（可多选）</h4>
            <div className="space-y-2">
              {rejectReasons.map((reason) => {
                const isSelected = selectedReasons.has(reason);
                return (
                  <button
                    key={reason}
                    onClick={() => toggleRejectReason(reason)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                      isSelected
                        ? "bg-red-500/10 border-red-500/30 text-red-200"
                        : "bg-gray-800/30 border-gray-700/30 text-gray-300 hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected
                            ? "bg-red-500 border-red-500"
                            : "border-gray-600"
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {reason}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 补充说明 */}
          <div>
            <h4 className="text-xs font-medium text-gray-400 mb-2">补充说明</h4>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="请输入驳回的具体原因和期望调整方向..."
              rows={3}
              className="w-full bg-gray-800/50 border border-gray-700/30 rounded-lg p-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-red-500/50 resize-none"
            />
          </div>
        </div>
      </div>

      {/* 右侧：调整策略 */}
      <div className="col-span-7 space-y-4">
        {showAdjustmentPanel && (
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">
              可选调整策略
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {adjustmentOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedAdjustment === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() =>
                      setSelectedAdjustment(
                        isSelected ? null : option.id
                      )
                    }
                    className={`text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/30"
                        : "bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          isSelected ? "bg-blue-500/20" : "bg-gray-700/30"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? "text-blue-400" : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-white">
                            {option.label}
                          </span>
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-600"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 操作按钮 */}
            <div className="mt-4 pt-4 border-t border-gray-700/30 flex gap-3">
              <button
                onClick={handleStartAdjust}
                disabled={!selectedAdjustment && selectedReasons.size === 0}
                className="flex-1 px-4 py-2.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Settings2 className="w-4 h-4" />
                按此策略调整
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 bg-gray-700/30 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                放弃
              </button>
            </div>
          </div>
        )}

        {/* 驳回摘要 */}
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-3">驳回摘要</h3>
          <div className="space-y-2">
            {selectedReasons.size > 0 ? (
              Array.from(selectedReasons).map((reason) => (
                <div
                  key={reason}
                  className="flex items-center gap-2 text-xs text-red-300 p-2 bg-red-500/5 rounded-lg"
                >
                  <XCircle className="w-3 h-3 flex-shrink-0" />
                  {reason}
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500">尚未选择驳回原因</p>
            )}
            {rejectNote && (
              <div className="mt-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
                <p className="text-xs text-gray-400">{rejectNote}</p>
              </div>
            )}
          </div>
        </div>

        {/* 免责声明 */}
        <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-gray-400">
              驳回后系统将记录反馈，优化后续推荐模型。AI 输出仅供参考。
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- 渲染：adjusting 状态（调整中）----
  const renderAdjustingView = () => (
    <div className="grid grid-cols-12 gap-4">
      {/* 左侧：调整说明 */}
      <div className="col-span-4 space-y-4">
        <div className="tech-card rounded-xl p-4 border-yellow-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-lg bg-yellow-500/20">
              <RefreshCw className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-white">方案调整中</h3>
              <p className="text-xs text-gray-400">
                基于驳回反馈重新优化方案
              </p>
            </div>
          </div>

          {/* 调整依据 */}
          <div className="space-y-3">
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-2">驳回原因</h4>
              <div className="space-y-1.5">
                {Array.from(selectedReasons).map((reason) => (
                  <div
                    key={reason}
                    className="text-xs text-red-300 p-2 bg-red-500/5 rounded-lg flex items-center gap-2"
                  >
                    <XCircle className="w-3 h-3 flex-shrink-0" />
                    {reason}
                  </div>
                ))}
              </div>
            </div>
            {selectedAdjustment && (
              <div>
                <h4 className="text-xs font-medium text-gray-400 mb-2">调整策略</h4>
                <div className="text-xs text-blue-300 p-2 bg-blue-500/5 rounded-lg flex items-center gap-2">
                  <Settings2 className="w-3 h-3 flex-shrink-0" />
                  {adjustmentOptions.find((o) => o.id === selectedAdjustment)?.label}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 调整提示 */}
        <div className="p-3 bg-yellow-500/5 rounded-lg border border-yellow-500/20">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-yellow-300/80">
              请在下方重新选择措施组合并调整参数，确认后提交新方案。
            </div>
          </div>
        </div>
      </div>

      {/* 中间：重新选择措施 */}
      <div className="col-span-5 space-y-4">
        <div className="tech-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="tech-title text-sm font-medium text-gray-300">
              调整措施组合
            </h3>
            <button
              onClick={toggleAllMeasures}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {selectedMeasures.size === defaultMeasures.length ? "取消全选" : "全选"}
            </button>
          </div>
          <div className="space-y-3">
            {defaultMeasures.map((measure) => {
              const Icon = measure.icon;
              const isSelected = selectedMeasures.has(measure.id);
              return (
                <div
                  key={measure.id}
                  onClick={() => toggleMeasure(measure.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-gray-800/30 border-gray-700/30 hover:border-gray-600/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? "bg-blue-500/20" : "bg-gray-700/30"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          isSelected ? "text-blue-400" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {measure.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-600"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">节能率：</span>
                          <span className="text-green-400 font-medium">
                            {measure.energySaving}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">投资：</span>
                          <span className="text-orange-400 font-medium">
                            {measure.cost}万
                          </span>
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

        {/* 参数调节 */}
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">
            调整假设参数
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">节能率</span>
                <span className="text-sm font-bold text-blue-400">
                  {energySavingRate}%
                </span>
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
                <span className="text-sm font-bold text-blue-400">
                  {electricityPrice} 元/kWh
                </span>
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
          </div>
        </div>
      </div>

      {/* 右侧：效益预览 + 操作 */}
      <div className="col-span-3 space-y-4">
        <div className="tech-card rounded-xl p-4">
          <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">
            调整后效益预览
          </h3>
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
          </div>
        </div>

        <div className="tech-card rounded-xl p-4">
          <div className="space-y-3">
            <button
              onClick={handleConfirmAdjust}
              disabled={selectedMeasures.size === 0}
              className="w-full px-4 py-3 bg-green-500/20 border border-green-500/30 rounded-lg text-sm text-green-300 hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" />
              确认调整方案
            </button>
            <button
              onClick={handleReset}
              className="w-full px-4 py-3 bg-gray-700/30 border border-gray-700/50 rounded-lg text-sm text-gray-400 hover:bg-gray-700/50 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              放弃调整
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- 页面标题 ----
  const getTitle = () => {
    switch (pageStatus) {
      case "adopted":
        return { title: "减排项目执行计划", subtitle: "方案已采纳，跟踪项目执行进度", color: "text-green-400" };
      case "rejected":
        return { title: "建议驳回处理", subtitle: "选择驳回原因并确定调整策略", color: "text-red-400" };
      case "adjusting":
        return { title: "方案调整", subtitle: "基于反馈重新优化减排方案", color: "text-yellow-400" };
      default:
        return { title: "AI 减排建议", subtitle: "基于数据分析的智能减排方案推荐", color: "data-highlight" };
    }
  };

  const headerInfo = getTitle();

  return (
    <div className="min-h-screen grid-bg p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className={`text-3xl font-bold ${headerInfo.color}`}>{headerInfo.title}</h1>
          {pageStatus !== "pending" && (
            <button
              onClick={handleReset}
              className="text-xs px-2.5 py-1 bg-gray-700/50 border border-gray-600/50 rounded-lg text-gray-400 hover:text-gray-300 hover:bg-gray-700/80 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              返回建议
            </button>
          )}
        </div>
        <p className="text-gray-400 mt-1 text-sm">{headerInfo.subtitle}</p>
      </div>

      {/* 状态指示器 */}
      {pageStatus !== "pending" && (
        <div className="mb-6 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700/30">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                pageStatus === "adopted" ? "bg-green-500" :
                pageStatus === "rejected" ? "bg-red-500" : "bg-yellow-500"
              }`} />
              <span className="text-xs text-gray-400">建议</span>
            </div>
            <ChevronRight className="w-3 h-3 text-gray-600" />
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${
                pageStatus === "adopted" ? "bg-green-500 animate-pulse" :
                pageStatus === "rejected" ? "bg-red-500" : "bg-yellow-500"
              }`} />
              <span className={`text-xs font-medium ${
                pageStatus === "adopted" ? "text-green-400" :
                pageStatus === "rejected" ? "text-red-400" : "text-yellow-400"
              }`}>
                {pageStatus === "adopted" ? "已采纳 · 执行中" :
                 pageStatus === "rejected" ? "已驳回" : "调整中"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 主内容区 */}
      {pageStatus === "pending" && renderPendingView()}
      {pageStatus === "adopted" && renderAdoptedView()}
      {pageStatus === "rejected" && renderRejectedView()}
      {pageStatus === "adjusting" && renderAdjustingView()}

      {/* 底部水印 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-80">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
