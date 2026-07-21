'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Upload,
  Clock,
  ArrowRight,
  BarChart3,
  Target,
  Award,
  Lightbulb,
} from 'lucide-react';
import {
  getEvaluationData,
  getYearlyTrend,
  getLevelText,
  getLevelColor,
  type EvaluationDimension,
  type DimensionData,
  type SubIndicator,
} from '@/data/evaluation-data';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';

export default function EvaluationPage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [expandedDimension, setExpandedDimension] = useState<EvaluationDimension | null>('energy');

  const evaluationData = useMemo(() => getEvaluationData(selectedYear), [selectedYear]);
  const trendData = useMemo(() => getYearlyTrend(), []);

  const levelText = getLevelText(evaluationData.level);
  const levelColor = getLevelColor(evaluationData.level);

  // 圆环图数据
  const radialData = [
    {
      name: 'score',
      value: evaluationData.totalScore,
      fill: levelColor,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1e] via-[#0d1525] to-[#0a1628] text-white">
      {/* 顶部标题栏 */}
      <div className="border-b border-cyan-900/30 bg-[#0a1628]/80 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">绿色/低碳校园评价看板</h1>
                <p className="text-sm text-gray-400">
                  参考标准：GB/T 51356-2019 + GB/T 29117-2012
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="rounded-lg border border-cyan-800/50 bg-[#0d1b2a] px-4 py-2 text-sm text-white outline-none focus:border-cyan-500"
              >
                <option value={2026}>2026年</option>
                <option value={2025}>2025年</option>
                <option value={2024}>2024年</option>
              </select>
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg border border-cyan-800/50 bg-[#0d1b2a] px-4 py-2 text-sm text-white transition-all hover:border-cyan-500 hover:bg-cyan-900/30"
              >
                <BarChart3 className="h-4 w-4" />
                跳转3D控制塔
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 主区域：左侧圆环 + 右侧维度列表 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧：大型圆环评分 */}
          <div className="col-span-5">
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-[#0d1b2a] to-[#0a1628] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">综合评分</h2>

              {/* 圆环图 */}
              <div className="relative flex items-center justify-center" style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="90%"
                    barSize={20}
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis
                      type="number"
                      domain={[0, 100]}
                      angleAxisId={0}
                      tick={false}
                    />
                    <RadialBar
                      background={{ fill: '#1a2942' }}
                      dataKey="value"
                      cornerRadius={10}
                      fill={levelColor}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
                {/* 中心文字 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-bold" style={{ color: levelColor }}>
                    {evaluationData.totalScore}
                  </span>
                  <span className="mt-2 text-lg font-medium" style={{ color: levelColor }}>
                    {levelText}
                  </span>
                  <span className="mt-1 text-sm text-gray-400">/ 100分</span>
                </div>
              </div>

              {/* 同比变化 */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">较上年 +4.0分</span>
              </div>

              {/* 近三年趋势 */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-medium text-gray-400">近三年评分趋势</h3>
                <div style={{ height: '120px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2942" />
                      <XAxis dataKey="year" stroke="#64748b" fontSize={12} />
                      <YAxis domain={[60, 100]} stroke="#64748b" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0d1b2a',
                          border: '1px solid #1e4976',
                          borderRadius: '8px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalScore"
                        stroke="#3488ff"
                        strokeWidth={2}
                        dot={{ fill: '#3488ff', r: 4 }}
                        name="综合评分"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：四大维度得分列表 */}
          <div className="col-span-7">
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-[#0d1b2a] to-[#0a1628] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">四大维度得分</h2>

              <div className="space-y-4">
                {evaluationData.dimensions.map((dimension) => {
                  const percentage = (dimension.currentScore / dimension.maxScore) * 100;
                  const barColor =
                    percentage >= 80 ? '#36D968' : percentage >= 60 ? '#F59E0B' : '#FF4D4F';
                  const isExpanded = expandedDimension === dimension.id;

                  return (
                    <div key={dimension.id}>
                      <div
                        className="cursor-pointer rounded-lg border border-cyan-900/20 bg-[#0a1628]/50 p-4 transition-all hover:border-cyan-700/50"
                        onClick={() =>
                          setExpandedDimension(isExpanded ? null : dimension.id)
                        }
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg"
                              style={{ backgroundColor: `${barColor}20` }}
                            >
                              <Target className="h-4 w-4" style={{ color: barColor }} />
                            </div>
                            <div>
                              <h3 className="font-medium text-white">{dimension.name}</h3>
                              <p className="text-xs text-gray-400">
                                {dimension.subIndicators.length} 项子指标
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <span className="text-xl font-bold text-white">
                                {dimension.currentScore}
                              </span>
                              <span className="text-sm text-gray-400">
                                {' '}
                                / {dimension.maxScore}
                              </span>
                            </div>
                            <ArrowRight
                              className={`h-4 w-4 text-gray-400 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* 进度条 */}
                        <div className="mt-3">
                          <div className="h-2 overflow-hidden rounded-full bg-[#1a2942]">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: barColor,
                              }}
                            />
                          </div>
                          <div className="mt-1 flex justify-between text-xs">
                            <span className="text-gray-400">达标率</span>
                            <span style={{ color: barColor }}>{percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      {/* 展开的子指标 */}
                      {isExpanded && (
                        <div className="mt-2 rounded-lg border border-cyan-900/20 bg-[#0a1628]/30 p-4">
                          <div className="space-y-3">
                            {dimension.subIndicators.map((indicator) => (
                              <SubIndicatorRow key={indicator.id} indicator={indicator} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 总分汇总 */}
              <div className="mt-4 rounded-lg border border-cyan-700/30 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-white">总分</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: levelColor }}>
                      {evaluationData.totalScore}
                    </span>
                    <span className="text-gray-400">/ 100</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 下部区域：失分项 + 整改建议 + 材料完备度 */}
        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* 失分项 TOP5 */}
          <div className="col-span-5">
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-[#0d1b2a] to-[#0a1628] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <AlertCircle className="h-5 w-5 text-orange-400" />
                失分项 TOP5
              </h2>

              <div className="space-y-3">
                {evaluationData.topGaps.map((gap, index) => (
                  <div
                    key={gap.indicatorId}
                    className="rounded-lg border border-cyan-900/20 bg-[#0a1628]/50 p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-white">{gap.indicatorName}</h4>
                          <p className="text-xs text-gray-400">{gap.dimension}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                        差距 {gap.gap}
                      </span>
                    </div>
                    <div className="mt-2 flex items-start gap-2 rounded bg-[#1a2942]/50 p-2">
                      <Lightbulb className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                      <p className="text-xs text-gray-300">{gap.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 材料完备度 */}
          <div className="col-span-4">
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-[#0d1b2a] to-[#0a1628] p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <FileText className="h-5 w-5 text-cyan-400" />
                材料完备度
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-green-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-white">已上传</span>
                  </div>
                  <span className="text-lg font-bold text-green-400">
                    {evaluationData.evidenceCompleteness.uploaded}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-yellow-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm text-white">待上传</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-400">
                    {evaluationData.evidenceCompleteness.pending}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-red-500/10 p-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span className="text-sm text-white">缺失</span>
                  </div>
                  <span className="text-lg font-bold text-red-400">
                    {evaluationData.evidenceCompleteness.missing}
                  </span>
                </div>
              </div>

              {/* 完备度进度 */}
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">总体完备度</span>
                  <span className="text-cyan-400">
                    {(
                      (evaluationData.evidenceCompleteness.uploaded /
                        (evaluationData.evidenceCompleteness.uploaded +
                          evaluationData.evidenceCompleteness.pending +
                          evaluationData.evidenceCompleteness.missing)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#1a2942]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    style={{
                      width: `${
                        (evaluationData.evidenceCompleteness.uploaded /
                          (evaluationData.evidenceCompleteness.uploaded +
                            evaluationData.evidenceCompleteness.pending +
                            evaluationData.evidenceCompleteness.missing)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 行动区 */}
          <div className="col-span-3">
            <div className="rounded-2xl border border-cyan-900/30 bg-gradient-to-br from-[#0d1b2a] to-[#0a1628] p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">快捷操作</h2>

              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-lg border border-cyan-800/50 bg-[#0a1628] p-3 text-left transition-all hover:border-cyan-500 hover:bg-cyan-900/20">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-white">上传佐证材料</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg border border-cyan-800/50 bg-[#0a1628] p-3 text-left transition-all hover:border-cyan-500 hover:bg-cyan-900/20">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-white">生成自评报告</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg border border-cyan-800/50 bg-[#0a1628] p-3 text-left transition-all hover:border-cyan-500 hover:bg-cyan-900/20">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-white">年度对比分析</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>

                <Link
                  href="/calculation"
                  className="flex w-full items-center justify-between rounded-lg border border-cyan-800/50 bg-[#0a1628] p-3 text-left transition-all hover:border-cyan-500 hover:bg-cyan-900/20"
                >
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-white">碳核算工作台</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Link>
              </div>

              {/* 申报状态 */}
              <div className="mt-4 rounded-lg border border-green-800/30 bg-green-900/10 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-400">申报准备就绪</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  综合评分达到"良好"等级，具备申报条件
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 水印 */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500/50">
        Demo模拟数据 仅课题演示
      </div>
    </div>
  );
}

// 子指标行组件
function SubIndicatorRow({ indicator }: { indicator: SubIndicator }) {
  const percentage = (indicator.currentValue / indicator.targetValue) * 100;
  const statusColor =
    indicator.status === 'compliant'
      ? '#36D968'
      : indicator.status === 'near'
      ? '#F59E0B'
      : '#FF4D4F';

  const StatusIcon =
    indicator.status === 'compliant'
      ? CheckCircle2
      : indicator.status === 'near'
      ? AlertCircle
      : XCircle;

  const TrendIcon =
    indicator.trend === 'up' ? TrendingUp : indicator.trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    indicator.trend === 'up' ? '#36D968' : indicator.trend === 'down' ? '#FF4D4F' : '#94A3B8';

  const EvidenceIcon =
    indicator.evidenceStatus === 'uploaded'
      ? CheckCircle2
      : indicator.evidenceStatus === 'pending'
      ? Clock
      : XCircle;

  const evidenceColor =
    indicator.evidenceStatus === 'uploaded'
      ? '#36D968'
      : indicator.evidenceStatus === 'pending'
      ? '#F59E0B'
      : '#FF4D4F';

  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#0a1628]/50 p-2">
      <StatusIcon className="h-4 w-4 flex-shrink-0" style={{ color: statusColor }} />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white">{indicator.name}</span>
          <div className="flex items-center gap-2">
            <TrendIcon className="h-3 w-3" style={{ color: trendColor }} />
            <span className="text-xs text-gray-400">
              {indicator.currentValue} / {indicator.targetValue} {indicator.unit}
            </span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#1a2942]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: statusColor,
              }}
            />
          </div>
          <EvidenceIcon className="h-3 w-3" style={{ color: evidenceColor }} />
        </div>
      </div>
    </div>
  );
}
