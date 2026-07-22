'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import {
  CheckCircle2, XCircle, TrendingDown, Wind, DollarSign, Clock,
  Calendar, FileText, AlertTriangle, ArrowRight, RotateCcw,
  SlidersHorizontal, Building2, BarChart3, GanttChartSquare,
} from 'lucide-react';

// ---- 措施数据 ----
interface SuggestionMeasure {
  id: string;
  name: string;
  icon: string;
  energySaving: number;
  cost: number;
  difficulty: string;
  description: string;
  timeline: string;
}

const defaultMeasures: SuggestionMeasure[] = [
  { id: 'm1', name: '空调时段优化', icon: 'thermometer', energySaving: 35, cost: 5, difficulty: '低', description: '调整空调运行时段，在非使用时段自动关闭或降低功率运行', timeline: '2-4周' },
  { id: 'm2', name: '夜间基载治理', icon: 'zap', energySaving: 28, cost: 15, difficulty: '中', description: '排查夜间非必要用电设备，建立关机检查清单与自动化关断机制', timeline: '4-8周' },
  { id: 'm3', name: '智能照明改造', icon: 'lightbulb', energySaving: 20, cost: 30, difficulty: '中', description: '更换为LED灯具并加装人体感应与光照传感器，实现按需照明', timeline: '8-12周' },
  { id: 'm4', name: '光伏发电扩容', icon: 'sun', energySaving: 15, cost: 80, difficulty: '高', description: '在屋顶加装光伏板，提升可再生能源自给率，降低外购电力碳排放', timeline: '12-24周' },
];

export default function ReductionRight() {
  const pageStatus = useAICenterStore((s) => s.reductionPageStatus);
  const selectedMeasures = useAICenterStore((s) => s.reductionSelectedMeasures);
  const params = useAICenterStore((s) => s.reductionParams);
  const milestones = useAICenterStore((s) => s.reductionMilestones);
  const adoptPlan = useAICenterStore((s) => s.adoptReductionPlan);
  const rejectPlan = useAICenterStore((s) => s.rejectReductionPlan);
  const resetPlan = useAICenterStore((s) => s.resetReductionPlan);
  const confirmAdjust = useAICenterStore((s) => s.confirmReductionAdjust);

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

  const benefits = useMemo(() => {
    const baseSaving = 1850;
    const adjustedSaving = baseSaving * (totalEnergySaving / 63);
    const annualEnergySaving = adjustedSaving * (params.energySavingRate / 100);
    const emissionFactor = 0.5703;
    const annualEmissionReduction = (annualEnergySaving / 1000) * emissionFactor;
    const annualCostSaving = annualEnergySaving * params.electricityPrice;
    const paybackPeriod = annualCostSaving > 0 ? totalCost / (annualCostSaving / 10000) : 99;
    return {
      annualEnergySaving: Math.round(annualEnergySaving),
      annualEmissionReduction: annualEmissionReduction.toFixed(2),
      annualCostSaving: Math.round(annualCostSaving),
      paybackPeriod: paybackPeriod > 50 ? '>50' : paybackPeriod.toFixed(1),
    };
  }, [params.energySavingRate, params.electricityPrice, totalCost, totalEnergySaving]);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <AnimatePresence mode="wait">
      {pageStatus === 'pending' && (
        <PendingRight
          key="pending"
          selectedMeasuresData={selectedMeasuresData}
          totalEnergySaving={totalEnergySaving}
          totalCost={totalCost}
          benefits={benefits}
          onAdopt={adoptPlan}
          onReject={rejectPlan}
          hasSelection={selectedMeasures.size > 0}
        />
      )}
      {pageStatus === 'adopted' && (
        <AdoptedRight
          key="adopted"
          milestones={milestones}
          progress={progress}
          completedCount={completedCount}
          benefits={benefits}
          selectedMeasuresData={selectedMeasuresData}
          totalCost={totalCost}
          onReset={resetPlan}
        />
      )}
      {pageStatus === 'rejected' && (
        <RejectedRight
          key="rejected"
          benefits={benefits}
          selectedMeasuresData={selectedMeasuresData}
          totalCost={totalCost}
          onReset={resetPlan}
        />
      )}
      {pageStatus === 'adjusting' && (
        <AdjustingRight
          key="adjusting"
          selectedMeasuresData={selectedMeasuresData}
          totalEnergySaving={totalEnergySaving}
          totalCost={totalCost}
          benefits={benefits}
          onConfirm={confirmAdjust}
          onReset={resetPlan}
        />
      )}
    </AnimatePresence>
  );
}

// ---- Pending 状态右侧 ----
function PendingRight({
  selectedMeasuresData, totalEnergySaving, totalCost, benefits, onAdopt, onReject, hasSelection,
}: {
  selectedMeasuresData: SuggestionMeasure[];
  totalEnergySaving: number;
  totalCost: number;
  benefits: { annualEnergySaving: number; annualEmissionReduction: string; annualCostSaving: number; paybackPeriod: string };
  onAdopt: () => void;
  onReject: () => void;
  hasSelection: boolean;
}) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-5 overflow-y-auto h-full"
    >
      {/* 标题 */}
      <div>
        <h2 className="text-base font-bold mb-1" style={{ color: '#e0e0e0' }}>AI 减排路径优化</h2>
        <p className="text-xs" style={{ color: '#8c8c8c' }}>基于数据证据与原因分析，AI 推荐以下措施组合。请在左侧选择措施并调整参数，确认后采纳或驳回。</p>
      </div>

      {/* 措施效益概览 */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={TrendingDown} label="综合节能率" value={`${totalEnergySaving}%`} color="#36d968" />
        <StatCard icon={Wind} label="年减排量" value={`${benefits.annualEmissionReduction}`} unit="tCO₂" color="#3488ff" />
        <StatCard icon={DollarSign} label="年节省" value={`${(benefits.annualCostSaving / 10000).toFixed(1)}`} unit="万元" color="#ff7b25" />
        <StatCard icon={Clock} label="回收期" value={benefits.paybackPeriod} unit="年" color="#00bcd4" />
      </div>

      {/* 措施详情表 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>措施详情</h3>
        {selectedMeasuresData.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" style={{ color: '#8c8c8c' }} />
            <p className="text-xs" style={{ color: '#8c8c8c' }}>请在左侧选择至少一项措施</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <th className="text-left py-2 px-2" style={{ color: '#8c8c8c' }}>措施名称</th>
                  <th className="text-right py-2 px-2" style={{ color: '#8c8c8c' }}>节能率</th>
                  <th className="text-right py-2 px-2" style={{ color: '#8c8c8c' }}>投资(万)</th>
                  <th className="text-center py-2 px-2" style={{ color: '#8c8c8c' }}>难度</th>
                  <th className="text-right py-2 px-2" style={{ color: '#8c8c8c' }}>工期</th>
                </tr>
              </thead>
              <tbody>
                {selectedMeasuresData.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5 px-2 font-medium" style={{ color: '#e0e0e0' }}>{m.name}</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: '#36d968' }}>{m.energySaving}%</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: '#ff7b25' }}>{m.cost}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px]" style={{
                        color: m.difficulty === '低' ? '#36d968' : m.difficulty === '中' ? '#ff7b25' : '#ff3333',
                        background: m.difficulty === '低' ? 'rgba(54,217,104,0.1)' : m.difficulty === '中' ? 'rgba(255,123,37,0.1)' : 'rgba(255,51,51,0.1)',
                      }}>{m.difficulty}</span>
                    </td>
                    <td className="py-2.5 px-2 text-right" style={{ color: '#8c8c8c' }}>{m.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 效益试算 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>效益试算</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(54,217,104,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>年节电量</div>
            <div className="text-xl font-bold" style={{ color: '#36d968' }}>{benefits.annualEnergySaving.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>kWh</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(52,136,255,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>年减排量</div>
            <div className="text-xl font-bold" style={{ color: '#3488ff' }}>{benefits.annualEmissionReduction}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>tCO₂</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,123,37,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>年费用节省</div>
            <div className="text-xl font-bold" style={{ color: '#ff7b25' }}>{(benefits.annualCostSaving / 10000).toFixed(1)}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>万元</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(0,188,212,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>静态回收期</div>
            <div className="text-xl font-bold" style={{ color: '#00bcd4' }}>{benefits.paybackPeriod}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>年</div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={onAdopt}
          disabled={!hasSelection}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
          style={{ background: 'rgba(54,217,104,0.15)', color: '#36d968', border: '1px solid rgba(54,217,104,0.3)' }}
        >
          <CheckCircle2 className="w-4 h-4" />
          采纳并转项目
        </button>
        <button
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ background: 'rgba(255,51,51,0.1)', color: '#ff3333', border: '1px solid rgba(255,51,51,0.25)' }}
        >
          <XCircle className="w-4 h-4" />
          驳回
        </button>
      </div>

      <p className="text-center text-[10px]" style={{ color: '#8c8c8c' }}>
        Demo 模拟数据，不用于申报
      </p>
    </motion.div>
  );
}

// ---- Adopted 状态右侧 ----
function AdoptedRight({
  milestones, progress, completedCount, benefits, selectedMeasuresData, totalCost, onReset,
}: {
  milestones: { id: string; name: string; target: string; status: string; date: string }[];
  progress: number;
  completedCount: number;
  benefits: { annualEnergySaving: number; annualEmissionReduction: string; annualCostSaving: number; paybackPeriod: string };
  selectedMeasuresData: SuggestionMeasure[];
  totalCost: number;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-5 overflow-y-auto h-full"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold mb-1" style={{ color: '#36d968' }}>
            <CheckCircle2 className="w-5 h-5 inline mr-1.5" />
            项目执行中
          </h2>
          <p className="text-xs" style={{ color: '#8c8c8c' }}>减排方案已转为正式项目，按里程碑推进实施</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          重新评估
        </button>
      </div>

      {/* 项目信息 */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={GanttChartSquare} label="项目编号" value="RED-2026-001" color="#3488ff" />
        <StatCard icon={BarChart3} label="总体进度" value={`${progress}%`} color="#36d968" />
        <StatCard icon={Calendar} label="已实施措施" value={`${selectedMeasuresData.length}`} unit="项" color="#ff7b25" />
        <StatCard icon={DollarSign} label="总投资" value={`${totalCost}`} unit="万元" color="#00bcd4" />
      </div>

      {/* 进度条 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold" style={{ color: '#e0e0e0' }}>项目进度</span>
          <span className="text-xs" style={{ color: '#8c8c8c' }}>{completedCount}/{milestones.length} 里程碑</span>
        </div>
        <div className="h-3 rounded-full mb-3" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #36d968, #3488ff)' }}
          />
        </div>
        <div className="flex justify-between">
          {milestones.map((ms, i) => (
            <div key={ms.id} className="flex flex-col items-center" style={{ width: `${100 / milestones.length}%` }}>
              <div
                className="w-3 h-3 rounded-full mb-1.5"
                style={{
                  background: ms.status === 'completed' ? '#36d968' : ms.status === 'in_progress' ? '#3488ff' : 'rgba(255,255,255,0.2)',
                  boxShadow: ms.status === 'in_progress' ? '0 0 8px rgba(52,136,255,0.5)' : 'none',
                }}
              />
              <span className="text-[9px] text-center leading-tight" style={{ color: ms.status === 'pending' ? '#8c8c8c' : '#e0e0e0' }}>
                {ms.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 里程碑详情 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>里程碑详情</h3>
        <div className="space-y-0">
          {milestones.map((ms, i) => (
            <div key={ms.id} className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    background: ms.status === 'completed' ? '#36d968' : ms.status === 'in_progress' ? '#3488ff' : 'rgba(255,255,255,0.2)',
                    boxShadow: ms.status === 'in_progress' ? '0 0 8px rgba(52,136,255,0.5)' : 'none',
                  }}
                />
                {i < milestones.length - 1 && (
                  <div className="w-px flex-1 min-h-[28px]" style={{ background: ms.status === 'completed' ? 'rgba(54,217,104,0.3)' : 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: ms.status === 'pending' ? '#8c8c8c' : '#e0e0e0' }}>{ms.name}</span>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{
                      color: ms.status === 'completed' ? '#36d968' : ms.status === 'in_progress' ? '#3488ff' : '#8c8c8c',
                      background: ms.status === 'completed' ? 'rgba(54,217,104,0.1)' : ms.status === 'in_progress' ? 'rgba(52,136,255,0.1)' : 'rgba(255,255,255,0.04)',
                    }}
                  >
                    {ms.status === 'completed' ? '已完成' : ms.status === 'in_progress' ? '进行中' : '待开始'}
                  </span>
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#8c8c8c' }}>{ms.target}</div>
                <div className="text-[10px]" style={{ color: '#8c8c8c' }}>{ms.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 效益追踪 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>预期效益追踪</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(54,217,104,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>年节电量</div>
            <div className="text-lg font-bold" style={{ color: '#36d968' }}>{benefits.annualEnergySaving.toLocaleString()}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>kWh</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(52,136,255,0.06)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>年减排量</div>
            <div className="text-lg font-bold" style={{ color: '#3488ff' }}>{benefits.annualEmissionReduction}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>tCO₂</div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px]" style={{ color: '#8c8c8c' }}>
        Demo 模拟数据，不用于申报
      </p>
    </motion.div>
  );
}

// ---- Rejected 状态右侧 ----
function RejectedRight({
  benefits, selectedMeasuresData, totalCost, onReset,
}: {
  benefits: { annualEnergySaving: number; annualEmissionReduction: string; annualCostSaving: number; paybackPeriod: string };
  selectedMeasuresData: SuggestionMeasure[];
  totalCost: number;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-5 overflow-y-auto h-full"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold mb-1" style={{ color: '#ff3333' }}>
            <XCircle className="w-5 h-5 inline mr-1.5" />
            方案已驳回
          </h2>
          <p className="text-xs" style={{ color: '#8c8c8c' }}>请在左侧选择驳回原因和调整策略，重新优化方案</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          返回建议
        </button>
      </div>

      {/* 原方案概览 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,51,51,0.04)', border: '1px solid rgba(255,51,51,0.15)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>原方案概览</h3>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatCard icon={TrendingDown} label="综合节能率" value={`${selectedMeasuresData.reduce((s, m) => s + m.energySaving, 0)}%`} color="#36d968" />
          <StatCard icon={Wind} label="年减排量" value={benefits.annualEmissionReduction} unit="tCO₂" color="#3488ff" />
          <StatCard icon={DollarSign} label="总投资" value={`${totalCost}`} unit="万元" color="#ff7b25" />
          <StatCard icon={Clock} label="回收期" value={benefits.paybackPeriod} unit="年" color="#00bcd4" />
        </div>
        <div className="space-y-1">
          {selectedMeasuresData.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#e0e0e0' }}>{m.name}</span>
              <span style={{ color: '#8c8c8c' }}>节能{m.energySaving}% · {m.cost}万 · {m.difficulty}难度</span>
            </div>
          ))}
        </div>
      </div>

      {/* 调整指引 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>
          <SlidersHorizontal className="w-4 h-4 inline mr-1" />
          调整指引
        </h3>
        <div className="space-y-2">
          {[
            { icon: SlidersHorizontal, title: '调整措施组合', desc: '在左侧重新勾选/取消措施，或选择替代方案' },
            { icon: Building2, title: '更换目标建筑', desc: '选择更合适的建筑或校区作为实施对象' },
            { icon: FileText, title: '补充数据证据', desc: '提供更多监测数据支撑建议可信度' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <item.icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#3488ff' }} />
              <div>
                <div className="text-xs font-medium" style={{ color: '#e0e0e0' }}>{item.title}</div>
                <div className="text-[10px]" style={{ color: '#8c8c8c' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-[10px]" style={{ color: '#8c8c8c' }}>
        Demo 模拟数据，不用于申报
      </p>
    </motion.div>
  );
}

// ---- Adjusting 状态右侧 ----
function AdjustingRight({
  selectedMeasuresData, totalEnergySaving, totalCost, benefits, onConfirm, onReset,
}: {
  selectedMeasuresData: SuggestionMeasure[];
  totalEnergySaving: number;
  totalCost: number;
  benefits: { annualEnergySaving: number; annualEmissionReduction: string; annualCostSaving: number; paybackPeriod: string };
  onConfirm: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-5 overflow-y-auto h-full"
    >
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold mb-1" style={{ color: '#ff7b25' }}>
            <SlidersHorizontal className="w-5 h-5 inline mr-1.5" />
            调整中
          </h2>
          <p className="text-xs" style={{ color: '#8c8c8c' }}>重新选择措施并调整参数，确认后提交新方案</p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          放弃调整
        </button>
      </div>

      {/* 调整后效益预览 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,123,37,0.04)', border: '1px solid rgba(255,123,37,0.15)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>调整后效益预览</h3>
        <div className="grid grid-cols-4 gap-3 mb-3">
          <StatCard icon={TrendingDown} label="综合节能率" value={`${totalEnergySaving}%`} color="#36d968" />
          <StatCard icon={Wind} label="年减排量" value={benefits.annualEmissionReduction} unit="tCO₂" color="#3488ff" />
          <StatCard icon={DollarSign} label="年节省" value={`${(benefits.annualCostSaving / 10000).toFixed(1)}`} unit="万元" color="#ff7b25" />
          <StatCard icon={Clock} label="回收期" value={benefits.paybackPeriod} unit="年" color="#00bcd4" />
        </div>
        {selectedMeasuresData.length > 0 && (
          <div className="space-y-1">
            {selectedMeasuresData.map((m) => (
              <div key={m.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span style={{ color: '#e0e0e0' }}>{m.name}</span>
                <span style={{ color: '#8c8c8c' }}>节能{m.energySaving}% · {m.cost}万</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 对比 */}
      <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
        <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>方案对比</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,51,51,0.06)', border: '1px solid rgba(255,51,51,0.15)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#ff3333' }}>原方案（已驳回）</div>
            <div className="text-xs" style={{ color: '#8c8c8c' }}>节能率: 63%</div>
            <div className="text-xs" style={{ color: '#8c8c8c' }}>投资: 130万</div>
            <div className="text-xs" style={{ color: '#8c8c8c' }}>回收期: 2.8年</div>
          </div>
          <div className="p-3 rounded-lg" style={{ background: 'rgba(255,123,37,0.06)', border: '1px solid rgba(255,123,37,0.15)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#ff7b25' }}>新方案（调整中）</div>
            <div className="text-xs" style={{ color: '#e0e0e0' }}>节能率: {totalEnergySaving}%</div>
            <div className="text-xs" style={{ color: '#e0e0e0' }}>投资: {totalCost}万</div>
            <div className="text-xs" style={{ color: '#e0e0e0' }}>回收期: {benefits.paybackPeriod}年</div>
          </div>
        </div>
      </div>

      {/* 确认按钮 */}
      <button
        onClick={onConfirm}
        disabled={selectedMeasuresData.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
        style={{ background: 'rgba(255,123,37,0.15)', color: '#ff7b25', border: '1px solid rgba(255,123,37,0.3)' }}
      >
        <ArrowRight className="w-4 h-4" />
        确认调整并提交新方案
      </button>

      <p className="text-center text-[10px]" style={{ color: '#8c8c8c' }}>
        Demo 模拟数据，不用于申报
      </p>
    </motion.div>
  );
}

// ---- 子组件 ----
function StatCard({ icon: Icon, label, value, unit, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit?: string;
  color: string;
}) {
  return (
    <div className="p-3 rounded-xl" style={{ background: `${color}0A`, border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span style={{ color }}><Icon className="w-3.5 h-3.5" /></span>
        <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ color: '#e0e0e0' }}>
        {value}
        {unit && <span className="text-xs ml-1 font-normal" style={{ color: '#8c8c8c' }}>{unit}</span>}
      </div>
    </div>
  );
}
