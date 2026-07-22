'use client';

import { useAICenterStore, type RiskCalendarDay } from '@/stores/ai-center-store';

const RISK_COLORS: Record<RiskCalendarDay['riskLevel'], string> = {
  safe: '#36d968',
  watch: '#ffc107',
  warning: '#ff7b25',
  danger: '#ff3333',
};

const RISK_LABELS: Record<RiskCalendarDay['riskLevel'], string> = {
  safe: '安全',
  watch: '关注',
  warning: '警告',
  danger: '危险',
};

export default function RiskHeatCalendar({ days }: { days: RiskCalendarDay[] }) {
  const openDrawer = useAICenterStore((s) => s.openDrawer);

  // 按周分组
  const weeks: RiskCalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {(['safe', 'watch', 'warning', 'danger'] as const).map((level) => (
          <div key={level} className="flex items-center gap-1 text-[10px]" style={{ color: '#8c8c8c' }}>
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: RISK_COLORS[level] }} />
            {RISK_LABELS[level]}
          </div>
        ))}
      </div>
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <button
                key={day.date}
                onClick={() => openDrawer('riskDay', day)}
                className="w-7 h-7 rounded-sm transition-transform hover:scale-110"
                style={{ background: RISK_COLORS[day.riskLevel], opacity: day.riskLevel === 'safe' ? 0.3 : day.riskLevel === 'watch' ? 0.5 : day.riskLevel === 'warning' ? 0.7 : 0.9 }}
                title={`${day.date}: ${day.predictedEmission} tCO₂ - ${RISK_LABELS[day.riskLevel]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
