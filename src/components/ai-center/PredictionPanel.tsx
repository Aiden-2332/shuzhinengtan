'use client';

import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import PredictionCurveChart from './PredictionCurveChart';
import HolidayPlanList from './HolidayPlanList';
import RiskHeatCalendar from './RiskHeatCalendar';
import ScenarioSimulator from './ScenarioSimulator';

export default function PredictionPanel() {
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
