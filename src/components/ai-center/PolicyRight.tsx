'use client';

import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';

const STATUS_COLORS: Record<string, string> = {
  compliant: '#36d968',
  at_risk: '#ffc107',
  non_compliant: '#ff3333',
};

const STATUS_ICONS: Record<string, string> = {
  compliant: '🟢',
  at_risk: '🟡',
  non_compliant: '🔴',
};

export default function PolicyRight() {
  const complianceChecks = useAICenterStore((s) => s.complianceChecks);
  const policyChanges = useAICenterStore((s) => s.policyChanges);

  const stats = {
    compliant: complianceChecks.filter((c) => c.status === 'compliant').length,
    atRisk: complianceChecks.filter((c) => c.status === 'at_risk').length,
    nonCompliant: complianceChecks.filter((c) => c.status === 'non_compliant').length,
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-6"
    >
      {/* 合规统计 */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="合规" value={stats.compliant} color="#36d968" />
        <StatCard label="存在风险" value={stats.atRisk} color="#ffc107" />
        <StatCard label="不合规" value={stats.nonCompliant} color="#ff3333" />
      </div>

      {/* 合规红绿灯矩阵 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>合规检查红绿灯矩阵</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left py-2 px-3" style={{ color: '#8c8c8c' }}>类别</th>
                <th className="text-left py-2 px-3" style={{ color: '#8c8c8c' }}>检查项</th>
                <th className="text-center py-2 px-3" style={{ color: '#8c8c8c' }}>状态</th>
                <th className="text-left py-2 px-3" style={{ color: '#8c8c8c' }}>说明</th>
              </tr>
            </thead>
            <tbody>
              {complianceChecks.map((item) => (
                <tr key={item.id} className="transition-colors hover:bg-opacity-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: item.status !== 'compliant' ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                  <td className="py-2.5 px-3" style={{ color: '#8c8c8c' }}>{item.categoryLabel}</td>
                  <td className="py-2.5 px-3" style={{ color: '#e0e0e0' }}>{item.item}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="text-lg">{STATUS_ICONS[item.status]}</span>
                    <div className="text-[10px]" style={{ color: STATUS_COLORS[item.status] }}>{item.statusLabel}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    {item.issueDetail ? (
                      <div>
                        <div className="text-[10px]" style={{ color: '#ff7b25' }}>{item.issueDetail}</div>
                        {item.fixAction && (
                          <div className="text-[10px] mt-1" style={{ color: '#3488ff' }}>
                            建议: {item.fixAction}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px]" style={{ color: '#8c8c8c' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 政策变更提醒 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>政策变更提醒</h3>
        <div className="space-y-3">
          {policyChanges.map((change) => (
            <div
              key={change.id}
              className="rounded-lg p-4"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${change.daysUntilEffective < 90 ? 'rgba(255,123,37,0.3)' : 'rgba(52,136,255,0.1)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: '#e0e0e0' }}>{change.policyName}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    color: change.daysUntilEffective < 90 ? '#ff7b25' : '#3488ff',
                    background: change.daysUntilEffective < 90 ? 'rgba(255,123,37,0.1)' : 'rgba(52,136,255,0.1)',
                  }}
                >
                  距生效 {change.daysUntilEffective} 天
                </span>
              </div>
              <div className="space-y-1.5">
                {change.impactAreas.map((area, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className="px-1.5 py-0.5 rounded text-[10px] flex-shrink-0" style={{ color: '#9b6bff', background: 'rgba(155,107,255,0.1)' }}>
                      {area.area}
                    </span>
                    <span style={{ color: '#e0e0e0' }}>{area.impact}</span>
                    <span className="text-[10px] flex-shrink-0" style={{ color: '#ff7b25' }}>
                      → {area.actionRequired}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
      <div className="text-xs mb-1" style={{ color: '#8c8c8c' }}>{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  );
}
