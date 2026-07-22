'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import {
  Thermometer, Zap, Lightbulb, Sun, Clock, BarChart3,
  ChevronRight, ChevronDown, CheckCircle2, TrendingDown,
  Wind, DollarSign, SlidersHorizontal,
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

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  thermometer: Thermometer,
  zap: Zap,
  lightbulb: Lightbulb,
  sun: Sun,
};

export default function ReductionPanel() {
  const pageStatus = useAICenterStore((s) => s.reductionPageStatus);
  const selectedMeasures = useAICenterStore((s) => s.reductionSelectedMeasures);
  const expandedMeasure = useAICenterStore((s) => s.reductionExpandedMeasure);
  const params = useAICenterStore((s) => s.reductionParams);
  const toggleMeasure = useAICenterStore((s) => s.toggleReductionMeasure);
  const toggleAllMeasures = useAICenterStore((s) => s.toggleAllReductionMeasures);
  const setExpandedMeasure = useAICenterStore((s) => s.setReductionExpandedMeasure);
  const setParams = useAICenterStore((s) => s.setReductionParams);

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

  // 效益计算
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

  // pending 状态
  if (pageStatus === 'pending' || pageStatus === 'adjusting') {
    return (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: 'calc(100vh - 200px)' }}
      >
        {/* 状态标签 */}
        {pageStatus === 'adjusting' && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,123,37,0.15)', border: '1px solid rgba(255,123,37,0.3)' }}>
            <SlidersHorizontal className="w-4 h-4" style={{ color: '#ff7b25' }} />
            <span className="text-xs font-medium" style={{ color: '#ff7b25' }}>调整中 — 重新选择措施并调整参数</span>
          </div>
        )}

        {/* 证据卡片 */}
        <SectionCard title="数据证据">
          <div className="space-y-2">
            {[
              { icon: Thermometer, title: '夜间负荷异常', desc: '22:00-06:00 空调负荷持续偏高', value: '+28%' },
              { icon: Clock, title: '运行时长超标', desc: '日均运行时长超出同类建筑', value: '3.5h' },
              { icon: BarChart3, title: '能效比偏低', desc: 'COP 低于设计值', value: '-15%' },
            ].map((ev, i) => {
              const Icon = ev.icon;
              return (
                <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 rounded-lg" style={{ background: 'rgba(52,136,255,0.2)' }}>
                      <Icon className="w-3.5 h-3.5" style={{ color: '#3488ff' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium" style={{ color: '#e0e0e0' }}>{ev.title}</span>
                        <span className="text-xs font-bold" style={{ color: '#ff7b25' }}>{ev.value}</span>
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#8c8c8c' }}>{ev.desc}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* 原因候选 */}
        <SectionCard title="原因候选">
          <div className="space-y-2">
            {[
              { reason: '空调定时设置未调整', confidence: 85 },
              { reason: '部分区域设备未关闭', confidence: 72 },
              { reason: '温控策略不合理', confidence: 65 },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: '#e0e0e0' }}>{item.reason}</span>
                  <span className="text-[10px] font-medium" style={{ color: '#3488ff' }}>{item.confidence}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${item.confidence}%`, background: '#3488ff' }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* 措施组合 */}
        <SectionCard title="推荐措施组合">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px]" style={{ color: '#8c8c8c' }}>点击措施卡片切换选中状态</span>
            <button onClick={toggleAllMeasures} className="text-[10px] hover:underline" style={{ color: '#3488ff' }}>
              {selectedMeasures.size === defaultMeasures.length ? '取消全选' : '全选'}
            </button>
          </div>
          <div className="space-y-2">
            {defaultMeasures.map((measure) => {
              const IconComp = iconMap[measure.icon] || Thermometer;
              const isSelected = selectedMeasures.has(measure.id);
              const isExpanded = expandedMeasure === measure.id;
              return (
                <div
                  key={measure.id}
                  className="rounded-lg border transition-all cursor-pointer"
                  style={{
                    background: isSelected ? 'rgba(52,136,255,0.08)' : 'rgba(255,255,255,0.03)',
                    borderColor: isSelected ? 'rgba(52,136,255,0.3)' : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <div className="p-3 flex items-start gap-3" onClick={() => toggleMeasure(measure.id)}>
                    <div className="p-1.5 rounded-lg" style={{ background: isSelected ? 'rgba(52,136,255,0.2)' : 'rgba(255,255,255,0.06)' }}>
                      <span style={{ color: isSelected ? '#3488ff' : '#8c8c8c' }}><IconComp className="w-4 h-4" /></span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium" style={{ color: '#e0e0e0' }}>{measure.name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedMeasure(isExpanded ? null : measure.id); }}
                            style={{ color: '#8c8c8c' }}
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <div
                            className="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                            style={{
                              background: isSelected ? '#3488ff' : 'transparent',
                              borderColor: isSelected ? '#3488ff' : 'rgba(255,255,255,0.3)',
                            }}
                          >
                            {isSelected && <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#fff' }} />}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <div><span style={{ color: '#8c8c8c' }}>节能率：</span><span style={{ color: '#36d968' }}>{measure.energySaving}%</span></div>
                        <div><span style={{ color: '#8c8c8c' }}>投资：</span><span style={{ color: '#ff7b25' }}>{measure.cost}万</span></div>
                        <div>
                          <span style={{ color: '#8c8c8c' }}>难度：</span>
                          <span style={{ color: measure.difficulty === '低' ? '#36d968' : measure.difficulty === '中' ? '#ff7b25' : '#ff3333' }}>{measure.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-3 pb-3 pt-0 border-t mx-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }} onClick={(e) => e.stopPropagation()}>
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[10px]" style={{ color: '#8c8c8c' }}>{measure.description}</p>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <Clock className="w-3 h-3" style={{ color: '#8c8c8c' }} />
                          <span style={{ color: '#8c8c8c' }}>预计工期：</span>
                          <span style={{ color: '#e0e0e0' }}>{measure.timeline}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {selectedMeasures.size > 0 && (
            <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between text-[10px]">
                <span style={{ color: '#8c8c8c' }}>
                  已选 <span style={{ color: '#3488ff' }}>{selectedMeasures.size}</span> 项措施
                </span>
                <span style={{ color: '#8c8c8c' }}>
                  综合节能率：<span style={{ color: '#36d968' }}>{totalEnergySaving}%</span>
                  {' · '}
                  总投资：<span style={{ color: '#ff7b25' }}>{totalCost}万</span>
                </span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* 假设参数调节 */}
        <SectionCard title="假设参数调节">
          <div className="space-y-3">
            <ParamSlider label="节能率" value={params.energySavingRate} unit="%" min={10} max={50} onChange={(v) => setParams({ energySavingRate: v })} />
            <ParamSlider label="电价" value={params.electricityPrice} unit="元/kWh" min={0.4} max={1.2} step={0.05} onChange={(v) => setParams({ electricityPrice: v })} />
            <ParamSlider label="投资额" value={params.investment} unit="万元" min={10} max={100} onChange={(v) => setParams({ investment: v })} />
            <ParamSlider label="使用寿命" value={params.lifespan} unit="年" min={5} max={20} onChange={(v) => setParams({ lifespan: v })} />
          </div>
        </SectionCard>

        {/* 预期效益 */}
        <SectionCard title="预期效益">
          <div className="space-y-2">
            <BenefitItem icon={TrendingDown} label="年节电量" value={benefits.annualEnergySaving} unit="kWh" color="#36d968" />
            <BenefitItem icon={Wind} label="年减排量" value={benefits.annualEmissionReduction} unit="tCO₂" color="#3488ff" />
            <BenefitItem icon={DollarSign} label="年费用节省" value={benefits.annualCostSaving} unit="元" color="#ff7b25" />
            <BenefitItem icon={Clock} label="静态回收期" value={benefits.paybackPeriod} unit="年" color="#00bcd4" />
          </div>
        </SectionCard>
      </motion.div>
    );
  }

  // adopted 状态
  if (pageStatus === 'adopted') {
    return <AdoptedLeftPanel />;
  }

  // rejected 状态
  return <RejectedLeftPanel />;
}

// ---- 采纳后左侧面板 ----
function AdoptedLeftPanel() {
  const milestones = useAICenterStore((s) => s.reductionMilestones);
  const projectNote = useAICenterStore((s) => s.reductionProjectNote);
  const setProjectNote = useAICenterStore((s) => s.setReductionProjectNote);
  const advanceMilestone = useAICenterStore((s) => s.advanceReductionMilestone);

  const completedCount = milestones.filter((m) => m.status === 'completed').length;
  const progress = Math.round((completedCount / milestones.length) * 100);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* 项目概览 */}
      <SectionCard title="项目执行计划">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px]" style={{ color: '#8c8c8c' }}>总体进度</span>
              <span className="text-xs font-bold" style={{ color: '#36d968' }}>{progress}%</span>
            </div>
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #36d968, #3488ff)' }} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="text-lg font-bold" style={{ color: '#e0e0e0' }}>{milestones.length}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>总里程碑</div>
          </div>
          <div className="p-2 rounded-lg text-center" style={{ background: 'rgba(54,217,104,0.08)' }}>
            <div className="text-lg font-bold" style={{ color: '#36d968' }}>{completedCount}</div>
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>已完成</div>
          </div>
        </div>
        <button
          onClick={advanceMilestone}
          disabled={!milestones.some((m) => m.status === 'in_progress')}
          className="w-full py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
          style={{ background: 'rgba(54,217,104,0.15)', color: '#36d968', border: '1px solid rgba(54,217,104,0.3)' }}
        >
          推进下一阶段
        </button>
      </SectionCard>

      {/* 里程碑时间线 */}
      <SectionCard title="里程碑">
        <div className="space-y-0">
          {milestones.map((ms, i) => (
            <div key={ms.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{
                    background: ms.status === 'completed' ? '#36d968' : ms.status === 'in_progress' ? '#3488ff' : 'rgba(255,255,255,0.2)',
                    boxShadow: ms.status === 'in_progress' ? '0 0 8px rgba(52,136,255,0.5)' : 'none',
                  }}
                />
                {i < milestones.length - 1 && (
                  <div className="w-px flex-1 min-h-[24px]" style={{ background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
              <div className="pb-3 flex-1">
                <div className="flex items-center justify-between">
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
      </SectionCard>

      {/* 项目备注 */}
      <SectionCard title="项目备注">
        <textarea
          value={projectNote}
          onChange={(e) => setProjectNote(e.target.value)}
          placeholder="添加项目备注..."
          rows={3}
          className="w-full p-2 rounded-lg text-xs resize-none outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </SectionCard>
    </motion.div>
  );
}

// ---- 驳回后左侧面板 ----
function RejectedLeftPanel() {
  const selectedReasons = useAICenterStore((s) => s.reductionSelectedReasons);
  const rejectNote = useAICenterStore((s) => s.reductionRejectNote);
  const selectedAdjustment = useAICenterStore((s) => s.reductionSelectedAdjustment);
  const showAdjustmentPanel = useAICenterStore((s) => s.reductionShowAdjustmentPanel);
  const toggleReason = useAICenterStore((s) => s.toggleReductionRejectReason);
  const setRejectNote = useAICenterStore((s) => s.setReductionRejectNote);
  const setSelectedAdjustment = useAICenterStore((s) => s.setReductionSelectedAdjustment);
  const startAdjust = useAICenterStore((s) => s.startReductionAdjust);

  const rejectReasons = [
    '投资回收期过长，不符合财务要求',
    '当前预算不足，建议延后实施',
    '技术方案不成熟，需要进一步论证',
    '与现有系统兼容性存疑',
    '节能效果预估过于乐观',
    '实施周期影响正常教学秩序',
  ];

  const adjustmentOptions = [
    { id: 'adj1', label: '调整措施组合', description: '重新选择推荐措施，去掉不合适的、增加替代方案' },
    { id: 'adj2', label: '修改假设参数', description: '调整节能率、电价、投资额等关键假设，重新试算效益' },
    { id: 'adj3', label: '更换目标建筑', description: '将方案应用到其他更适合的建筑或校区' },
    { id: 'adj4', label: '补充数据证据', description: '补充更多监测数据或现场勘查信息，提高建议可信度' },
    { id: 'adj5', label: '调整实施优先级', description: '重新排序措施优先级，优先实施投入产出比更高的项目' },
  ];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4 overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* 驳回原因 */}
      <SectionCard title="驳回原因">
        <div className="space-y-1.5">
          {rejectReasons.map((reason) => {
            const isSelected = selectedReasons.has(reason);
            return (
              <button
                key={reason}
                onClick={() => toggleReason(reason)}
                className="w-full text-left p-2.5 rounded-lg text-xs transition-all"
                style={{
                  background: isSelected ? 'rgba(255,51,51,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isSelected ? 'rgba(255,51,51,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  color: isSelected ? '#ff3333' : '#8c8c8c',
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: isSelected ? '#ff3333' : 'rgba(255,255,255,0.3)' }}
                  >
                    {isSelected && <CheckCircle2 className="w-2.5 h-2.5" style={{ color: '#ff3333' }} />}
                  </div>
                  {reason}
                </div>
              </button>
            );
          })}
        </div>
        <textarea
          value={rejectNote}
          onChange={(e) => setRejectNote(e.target.value)}
          placeholder="补充说明（选填）..."
          rows={2}
          className="w-full mt-2 p-2 rounded-lg text-xs resize-none outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.08)' }}
        />
      </SectionCard>

      {/* 调整策略 */}
      {showAdjustmentPanel && (
        <SectionCard title="调整策略">
          <div className="space-y-1.5">
            {adjustmentOptions.map((opt) => {
              const isSelected = selectedAdjustment === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedAdjustment(isSelected ? null : opt.id)}
                  className="w-full text-left p-2.5 rounded-lg transition-all"
                  style={{
                    background: isSelected ? 'rgba(52,136,255,0.1)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSelected ? 'rgba(52,136,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <div className="text-xs font-medium" style={{ color: isSelected ? '#3488ff' : '#e0e0e0' }}>{opt.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#8c8c8c' }}>{opt.description}</div>
                </button>
              );
            })}
          </div>
          {selectedAdjustment && (
            <button
              onClick={startAdjust}
              className="w-full mt-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: 'rgba(52,136,255,0.15)', color: '#3488ff', border: '1px solid rgba(52,136,255,0.3)' }}
            >
              进入调整
            </button>
          )}
        </SectionCard>
      )}
    </motion.div>
  );
}

// ---- 子组件 ----
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <h3 className="text-xs font-semibold mb-3" style={{ color: '#e0e0e0' }}>{title}</h3>
      {children}
    </div>
  );
}

function ParamSlider({ label, value, unit, min, max, step = 1, onChange }: {
  label: string; value: number; unit: string; min: number; max: number; step?: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: '#3488ff' }}>{value} {unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
        style={{ accentColor: '#3488ff', background: 'rgba(255,255,255,0.1)' }}
      />
    </div>
  );
}

function BenefitItem({ icon: Icon, label, value, unit, color }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string | number; unit: string; color: string;
}) {
  return (
    <div className="p-2.5 rounded-lg" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 mb-0.5">
        <span style={{ color }}><Icon className="w-3.5 h-3.5" /></span>
        <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{label}</span>
      </div>
      <div className="text-lg font-bold" style={{ color: '#e0e0e0' }}>
        {value}
        <span className="text-xs ml-1" style={{ color: '#8c8c8c' }}>{unit}</span>
      </div>
    </div>
  );
}
