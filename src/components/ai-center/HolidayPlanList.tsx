'use client';

import type { HolidayPlan } from '@/stores/ai-center-store';

export default function HolidayPlanList({ plans }: { plans: HolidayPlan[] }) {
  return (
    <div className="space-y-2">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="rounded-lg p-3 transition-all duration-200 hover:border-opacity-40"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${plan.daysBeforeEvent < 30 ? '#ff7b25' : 'rgba(52,136,255,0.1)'}`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: '#e0e0e0' }}>{plan.holidayName}</span>
            <span
              className="text-xs px-2 py-0.5 rounded"
              style={{
                color: plan.daysBeforeEvent < 30 ? '#ff7b25' : '#36d968',
                background: plan.daysBeforeEvent < 30 ? 'rgba(255,123,37,0.1)' : 'rgba(54,217,104,0.1)',
              }}
            >
              距假期 {plan.daysBeforeEvent} 天
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>预计节能</div>
              <div className="text-xs font-semibold" style={{ color: '#36d968' }}>{plan.estimatedSaving.energy} tce</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>预计减排</div>
              <div className="text-xs font-semibold" style={{ color: '#36d968' }}>{plan.estimatedSaving.carbon} tCO₂</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>预计节省</div>
              <div className="text-xs font-semibold" style={{ color: '#36d968' }}>¥{(plan.estimatedSaving.cost / 10000).toFixed(1)}万</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {plan.actions.map((action, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>
                {action}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button className="text-[10px] px-2 py-0.5 rounded" style={{ color: '#3488ff', background: 'rgba(52,136,255,0.1)' }}>编辑参数</button>
            <button className="text-[10px] px-2 py-0.5 rounded" style={{ color: '#36d968', background: 'rgba(54,217,104,0.1)' }}>确认预案</button>
          </div>
        </div>
      ))}
    </div>
  );
}
