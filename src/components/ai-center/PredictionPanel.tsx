'use client';

import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import PredictionCurveChart from './PredictionCurveChart';
import HolidayPlanList from './HolidayPlanList';
import RiskHeatCalendar from './RiskHeatCalendar';
import ScenarioSimulator from './ScenarioSimulator';
import type { AICenterBuildingContext } from './AICenterDashboard';

export default function PredictionPanel({
  buildingContext,
  analysisFocus,
}: {
  buildingContext: AICenterBuildingContext | null;
  analysisFocus: string | null;
}) {
  const predictionCurve = useAICenterStore((s) => s.predictionCurve);
  const holidayPlans = useAICenterStore((s) => s.holidayPlans);
  const riskCalendar = useAICenterStore((s) => s.riskCalendar);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4"
    >
      {buildingContext?.name && buildingContext.carbon && buildingContext.benchmark ? (
        <section
          aria-labelledby="focused-peer-analysis"
          className="rounded-xl border border-cyan-300/20 bg-cyan-300/6 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="focused-peer-analysis" className="text-sm font-semibold text-cyan-100">
                {buildingContext.name} · 同类楼宇对标
              </h2>
              <p className="mt-1 text-xs text-cyan-100/55">
                {analysisFocus === 'peer-benchmark' ? '已按驾驶舱任务自动定位' : '楼宇分析上下文'} · Demo 对标口径
              </p>
            </div>
            <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-100/75">
              {buildingContext.benchmark.peerLabel} {buildingContext.benchmark.energyRank}/{buildingContext.benchmark.peerCount}
            </span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-cyan-100/50">能耗强度 / 同类中位</dt>
              <dd className="mt-1 font-semibold text-white">
                {buildingContext.carbon.energyIntensity.toFixed(1)} / {buildingContext.benchmark.energyMedian.toFixed(1)} kWh/㎡
              </dd>
            </div>
            <div>
              <dt className="text-cyan-100/50">单位面积碳排 / 同类中位</dt>
              <dd className="mt-1 font-semibold text-white">
                {((buildingContext.carbon.annualEmission * 1_000) / buildingContext.carbon.area).toFixed(1)} / {buildingContext.benchmark.carbonMedian.toFixed(1)} kgCO₂e/㎡
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      {/* 排放趋势预测 */}
      <SectionCard title="排放趋势预测" collapsible>
        <PredictionCurveChart data={predictionCurve} />
      </SectionCard>

      {/* 节假日调控预案 */}
      <SectionCard title="节假日调控预案" collapsible>
        <HolidayPlanList plans={holidayPlans} />
      </SectionCard>

      {/* 超标预警热力日历 */}
      <SectionCard title="超标预警热力日历" collapsible>
        <RiskHeatCalendar days={riskCalendar} />
      </SectionCard>

      {/* 情景模拟器 */}
      <SectionCard title="情景模拟器" collapsible>
        <ScenarioSimulator />
      </SectionCard>
    </motion.div>
  );
}

function SectionCard({ title, children, collapsible }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(52,136,255,0.12)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{title}</h3>
        {collapsible && (
          <button className="text-xs px-2 py-0.5 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.05)' }}>
            折叠
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
