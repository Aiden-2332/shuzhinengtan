'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  Layers,
  ArrowUp,
  ArrowDown,
  Minus,
  ExternalLink,
} from 'lucide-react';

interface EvaluationIndicator {
  id: string;
  category: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
  scoringMethod: string;
  dataSource: string;
}

interface StandardDocument {
  id: string;
  name: string;
  level: 'conservation' | 'green' | 'low-carbon';
  levelLabel: string;
  standardCode: string;
  type: 'national' | 'local';
  description: string;
  indicators: EvaluationIndicator[];
}

interface StandardsResponse {
  standards: StandardDocument[];
}

// 模拟评分数据（演示用）
const MOCK_SCORES: Record<string, Record<string, { score: number; status: 'pass' | 'warn' | 'fail' }>> = {
  conservation: {
    'c-1': { score: 8, status: 'pass' },
    'c-2': { score: 6, status: 'pass' },
    'c-3': { score: 10, status: 'pass' },
    'c-4': { score: 11, status: 'pass' },
    'c-5': { score: 7, status: 'warn' },
    'c-6': { score: 6, status: 'pass' },
    'c-7': { score: 8, status: 'pass' },
    'c-8': { score: 5, status: 'pass' },
    'c-9': { score: 2, status: 'fail' },
    'c-10': { score: 5, status: 'warn' },
    'c-11': { score: 4, status: 'warn' },
  },
  green: {
    'g-1': { score: 6, status: 'pass' },
    'g-2': { score: 3, status: 'warn' },
    'g-3': { score: 4, status: 'warn' },
    'g-4': { score: 9, status: 'pass' },
    'g-5': { score: 4, status: 'fail' },
    'g-6': { score: 5, status: 'warn' },
    'g-7': { score: 6, status: 'pass' },
    'g-8': { score: 4, status: 'pass' },
    'g-9': { score: 3, status: 'warn' },
    'g-10': { score: 6, status: 'pass' },
    'g-11': { score: 4, status: 'pass' },
    'g-12': { score: 7, status: 'warn' },
    'g-13': { score: 3, status: 'warn' },
    'g-14': { score: 2, status: 'fail' },
  },
  'low-carbon': {
    'lc-1': { score: 7, status: 'warn' },
    'lc-2': { score: 10, status: 'warn' },
    'lc-3': { score: 8, status: 'warn' },
    'lc-4': { score: 4, status: 'fail' },
    'lc-5': { score: 6, status: 'warn' },
    'lc-6': { score: 5, status: 'warn' },
    'lc-7': { score: 3, status: 'fail' },
    'lc-8': { score: 3, status: 'warn' },
    'lc-9': { score: 2, status: 'fail' },
    'lc-10': { score: 3, status: 'warn' },
    'lc-11': { score: 2, status: 'fail' },
    'lc-12': { score: 3, status: 'warn' },
    'lc-13': { score: 1, status: 'fail' },
  },
};

const LEVEL_CONFIG = {
  conservation: {
    color: 'emerald',
    bgClass: 'bg-emerald-50 border-emerald-200',
    textClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    icon: '🌱',
    tier: 1,
    tierLabel: '基础层',
  },
  green: {
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200',
    textClass: 'text-blue-700',
    badgeClass: 'bg-blue-100 text-blue-700',
    icon: '🌿',
    tier: 2,
    tierLabel: '进阶层',
  },
  'low-carbon': {
    color: 'violet',
    bgClass: 'bg-violet-50 border-violet-200',
    textClass: 'text-violet-700',
    badgeClass: 'bg-violet-100 text-violet-700',
    icon: '🏆',
    tier: 3,
    tierLabel: '引领层',
  },
} as const;

export default function EvaluationPage() {
  const [standards, setStandards] = useState<StandardDocument[]>([]);
  const [activeStandard, setActiveStandard] = useState<string>('conservation');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/evaluation-standards')
      .then((res) => res.json())
      .then((data: StandardsResponse) => {
        setStandards(data.standards);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentStandard = useMemo(
    () => standards.find((s) => s.id === activeStandard),
    [standards, activeStandard]
  );

  // 按类别分组指标
  const groupedIndicators = useMemo(() => {
    if (!currentStandard) return {};
    const groups: Record<string, EvaluationIndicator[]> = {};
    for (const ind of currentStandard.indicators) {
      if (!groups[ind.category]) groups[ind.category] = [];
      groups[ind.category].push(ind);
    }
    return groups;
  }, [currentStandard]);

  // 计算总分
  const scoreData = useMemo(() => {
    if (!currentStandard) return { totalScore: 0, maxScore: 0, rate: 0 };
    const scores = MOCK_SCORES[currentStandard.id] || {};
    let totalScore = 0;
    let maxScore = 0;
    for (const ind of currentStandard.indicators) {
      maxScore += ind.maxScore;
      totalScore += scores[ind.id]?.score || 0;
    }
    return { totalScore, maxScore, rate: Math.round((totalScore / maxScore) * 100) };
  }, [currentStandard]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getScoreBarColor = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.8) return 'bg-emerald-500';
    if (ratio >= 0.6) return 'bg-blue-500';
    if (ratio >= 0.4) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getLevelBadge = (rate: number) => {
    if (rate >= 90) return { text: '优秀', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' };
    if (rate >= 75) return { text: '良好', color: 'bg-blue-100 text-blue-700 border-blue-300' };
    if (rate >= 60) return { text: '合格', color: 'bg-amber-100 text-amber-700 border-amber-300' };
    return { text: '待改进', color: 'bg-red-100 text-red-700 border-red-300' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-400">加载评价标准中...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">绿色/低碳校园评价</h1>
            <p className="text-sm text-gray-500 mt-1">
              基于国家标准与北京市地方标准的三层递进评价体系
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Demo 模拟数据
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 三层递进说明 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">三层递进评价体系</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {standards.map((std) => {
              const cfg = LEVEL_CONFIG[std.level];
              return (
                <button
                  key={std.id}
                  onClick={() => {
                    setActiveStandard(std.id);
                    setExpandedCategory(null);
                  }}
                  className={`text-left p-4 rounded-lg border-2 transition-all ${
                    activeStandard === std.id
                      ? `${cfg.bgClass} border-current`
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                  style={activeStandard === std.id ? { borderColor: 'currentcolor' } : {}}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{cfg.icon}</span>
                    <span className={`text-sm font-semibold ${cfg.textClass}`}>
                      {cfg.tierLabel}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${cfg.badgeClass}`}>
                      {std.type === 'national' ? '国标' : '地标'}
                    </span>
                  </div>
                  <div className={`text-sm font-bold ${cfg.textClass} mb-1`}>{std.name}</div>
                  <div className="text-xs text-gray-400">{std.standardCode}</div>
                  <div className="text-xs text-gray-500 mt-2 line-clamp-2">{std.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {currentStandard && (
          <>
            {/* 当前标准概览 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {currentStandard.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      {currentStandard.standardCode} · {currentStandard.type === 'national' ? '国家标准' : '北京市地方标准'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {scoreData.totalScore}
                      <span className="text-sm text-gray-400 font-normal">/{scoreData.maxScore}</span>
                    </div>
                    <div className="text-xs text-gray-400">综合得分</div>
                  </div>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getLevelBadge(scoreData.rate).color}`}>
                    {getLevelBadge(scoreData.rate).text}
                  </span>
                </div>
              </div>

              {/* 总分进度条 */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>得分率</span>
                  <span>{scoreData.rate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      scoreData.rate >= 80 ? 'bg-emerald-500' : scoreData.rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${scoreData.rate}%` }}
                  />
                </div>
              </div>

              {/* 指标列表 */}
              <div className="space-y-3">
                {Object.entries(groupedIndicators).map(([category, indicators]) => {
                  const isExpanded = expandedCategory === category;
                  const catScores = indicators.map((ind) => {
                    const s = MOCK_SCORES[currentStandard.id]?.[ind.id];
                    return { score: s?.score || 0, max: ind.maxScore, status: s?.status || 'fail' };
                  });
                  const catTotal = catScores.reduce((a, b) => a + b.score, 0);
                  const catMax = catScores.reduce((a, b) => a + b.max, 0);
                  const catRate = Math.round((catTotal / catMax) * 100);
                  const failCount = catScores.filter((s) => s.status === 'fail').length;
                  const warnCount = catScores.filter((s) => s.status === 'warn').length;

                  return (
                    <div key={category} className="border border-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(isExpanded ? null : category)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                          <span className="text-xs text-gray-400">
                            {indicators.length}项指标
                          </span>
                          {failCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                              {failCount}项不达标
                            </span>
                          )}
                          {warnCount > 0 && (
                            <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded">
                              {warnCount}项预警
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getScoreBarColor(catTotal, catMax)}`}
                              style={{ width: `${catRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12 text-right">
                            {catTotal}/{catMax}
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-100">
                          {indicators.map((ind) => {
                            const scoreInfo = MOCK_SCORES[currentStandard.id]?.[ind.id];
                            const score = scoreInfo?.score || 0;
                            const status = scoreInfo?.status || 'fail';
                            const ratio = score / ind.maxScore;

                            return (
                              <div
                                key={ind.id}
                                className="px-4 py-3 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(status)}
                                      <span className="text-sm font-medium text-gray-900">
                                        {ind.name}
                                      </span>
                                      <span className="text-xs text-gray-400">
                                        权重{ind.weight}%
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 ml-6">
                                      {ind.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 ml-4">
                                    <span className={`text-sm font-bold ${
                                      ratio >= 0.8 ? 'text-emerald-600' :
                                      ratio >= 0.6 ? 'text-blue-600' :
                                      ratio >= 0.4 ? 'text-amber-600' : 'text-red-600'
                                    }`}>
                                      {score}
                                    </span>
                                    <span className="text-xs text-gray-400">/{ind.maxScore}</span>
                                  </div>
                                </div>
                                <div className="ml-6 flex items-center gap-4 text-xs text-gray-400">
                                  <span>评分方法：{ind.scoringMethod}</span>
                                  <span>数据来源：{ind.dataSource}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 层级对比 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">三层标准得分对比</h2>
              </div>
              <div className="space-y-3">
                {standards.map((std) => {
                  const cfg = LEVEL_CONFIG[std.level];
                  const scores = MOCK_SCORES[std.id] || {};
                  let total = 0;
                  let max = 0;
                  for (const ind of std.indicators) {
                    max += ind.maxScore;
                    total += scores[ind.id]?.score || 0;
                  }
                  const rate = Math.round((total / max) * 100);
                  const isActive = std.id === activeStandard;

                  return (
                    <div key={std.id} className="flex items-center gap-4">
                      <div className="w-24 text-right">
                        <span className={`text-xs font-semibold ${cfg.textClass}`}>
                          {cfg.tierLabel}
                        </span>
                        <div className="text-xs text-gray-400">{std.name}</div>
                      </div>
                      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isActive ? 'ring-2 ring-offset-1 ring-blue-400' : ''
                          } ${
                            rate >= 80 ? 'bg-emerald-500' : rate >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-medium text-white text-shadow">
                          {total}/{max} ({rate}%)
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 w-16">{std.standardCode.split('-')[0]}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-center">
                三层标准逐级递进：节约型（基础）→ 绿色（进阶）→ 低碳（引领），要求逐步提高
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
