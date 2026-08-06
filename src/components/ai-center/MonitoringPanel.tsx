'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useAICenterStore, type AIAnomalyCard, type SeverityLevel } from '@/stores/ai-center-store';
import RealtimeStreamDisplay from './RealtimeStreamDisplay';
import AnomalyTimeline from './AnomalyTimeline';
import NotificationList from './NotificationList';

const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  blocking: '#ff3333',
  severe: '#ff7b25',
  normal: '#ffc107',
  info: '#3488ff',
};

const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  blocking: '阻断',
  severe: '严重',
  normal: '一般',
  info: '提示',
};

const PATTERN_ICONS: Record<string, string> = {
  spike: '⚡',
  idle_run: '💤',
  over_limit: '📈',
  drift: '📉',
};

export default function MonitoringPanel({ focusAlarmId = null }: { focusAlarmId?: string | null }) {
  const anomalies = useAICenterStore((s) => s.anomalies);
  const acknowledgeAnomaly = useAICenterStore((s) => s.acknowledgeAnomaly);
  const openDrawer = useAICenterStore((s) => s.openDrawer);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const lastFocusedAlarmIdRef = useRef<string | null>(null);

  const sortedAnomalies = anomalies.toSorted((a, b) => {
    const order: SeverityLevel[] = ['blocking', 'severe', 'normal', 'info'];
    return order.indexOf(a.severity) - order.indexOf(b.severity);
  });
  const activeAnomalyId = expandedId ?? sortedAnomalies[0]?.id ?? '';

  useEffect(() => {
    if (
      !focusAlarmId
      || lastFocusedAlarmIdRef.current === focusAlarmId
      || !anomalies.some((anomaly) => anomaly.id === focusAlarmId)
    ) return;

    lastFocusedAlarmIdRef.current = focusAlarmId;
    setExpandedId(focusAlarmId);
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`ai-anomaly-${focusAlarmId}`)?.scrollIntoView({ block: 'center' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [anomalies, focusAlarmId]);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4"
    >
      {/* 实时数据流 */}
      <SectionCard title="实时数据流">
        <RealtimeStreamDisplay />
      </SectionCard>

      {/* AI异常归因卡片 */}
      <SectionCard title="AI异常归因" badge={anomalies.filter((a) => a.status === 'new').length}>
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {sortedAnomalies.map((anomaly) => (
            <AnomalyCard
              key={anomaly.id}
              anomaly={anomaly}
              isExpanded={expandedId === anomaly.id}
              onToggle={() => setExpandedId(expandedId === anomaly.id ? null : anomaly.id)}
              onAcknowledge={() => acknowledgeAnomaly(anomaly.id)}
              onViewDetail={() => openDrawer('anomaly', anomaly)}
            />
          ))}
        </div>
      </SectionCard>

      {/* 事件时间线 */}
      <SectionCard title="事件时间线">
        <AnomalyTimeline anomalyId={activeAnomalyId} />
      </SectionCard>

      {/* 告警推送中心 */}
      <SectionCard title="告警推送中心">
        <NotificationList />
      </SectionCard>
    </motion.div>
  );
}

function AnomalyCard({
  anomaly,
  isExpanded,
  onToggle,
  onAcknowledge,
  onViewDetail,
}: {
  anomaly: AIAnomalyCard;
  isExpanded: boolean;
  onToggle: () => void;
  onAcknowledge: () => void;
  onViewDetail: () => void;
}) {
  const confidenceColor = anomaly.aiConfidence > 0.8 ? '#36d968' : anomaly.aiConfidence > 0.6 ? '#ffc107' : '#8c8c8c';

  return (
    <div
      id={`ai-anomaly-${anomaly.id}`}
      className="rounded-lg overflow-hidden transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${SEVERITY_COLORS[anomaly.severity]}30`,
      }}
    >
      <button onClick={onToggle} className="w-full p-3 text-left">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm">{PATTERN_ICONS[anomaly.pattern]}</span>
            <span className="text-xs font-medium" style={{ color: SEVERITY_COLORS[anomaly.severity] }}>
              {SEVERITY_LABELS[anomaly.severity]}
            </span>
            <span className="text-xs font-medium" style={{ color: '#e0e0e0' }}>{anomaly.patternLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{anomaly.duration}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: confidenceColor, background: `${confidenceColor}15` }}>
              AI {(anomaly.aiConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="text-xs" style={{ color: '#8c8c8c' }}>
          {anomaly.buildingName} · {anomaly.deviceName || '全楼'}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-3 pb-3 space-y-2"
        >
          <div className="p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>AI根因分析</div>
            <div className="text-xs" style={{ color: '#e0e0e0' }}>{anomaly.aiRootCause}</div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px]" style={{ color: '#8c8c8c' }}>证据链</div>
            {anomaly.aiEvidence.map((ev, i) => (
              <div key={i} className="text-xs flex gap-2" style={{ color: '#8c8c8c' }}>
                <span className="text-[10px] px-1 rounded" style={{ background: 'rgba(52,136,255,0.15)', color: '#3488ff' }}>
                  {ev.type}
                </span>
                {ev.description}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2 p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>额外排放</div>
              <div className="text-xs font-semibold" style={{ color: '#ff7b25' }}>{anomaly.impact.extraEmission} tCO₂</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>额外费用</div>
              <div className="text-xs font-semibold" style={{ color: '#ff7b25' }}>¥{anomaly.impact.extraCost}</div>
            </div>
            <div>
              <div className="text-[10px]" style={{ color: '#8c8c8c' }}>影响范围</div>
              <div className="text-xs font-semibold" style={{ color: '#e0e0e0' }}>{anomaly.impact.affectedArea}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {anomaly.status === 'new' && (
              <button onClick={onAcknowledge} className="text-xs px-3 py-1.5 rounded" style={{ color: '#fff', background: '#3488ff' }}>
                确认
              </button>
            )}
            <button onClick={onViewDetail} className="text-xs px-3 py-1.5 rounded" style={{ color: '#3488ff', background: 'rgba(52,136,255,0.1)' }}>
              查看详情
            </button>
            <button className="text-xs px-3 py-1.5 rounded" style={{ color: '#ff7b25', background: 'rgba(255,123,37,0.1)' }}>
              转工单
            </button>
            <button className="text-xs px-3 py-1.5 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>
              忽略
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function SectionCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: number }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{title}</h3>
          {badge !== undefined && badge > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ color: '#fff', background: '#ff3333' }}>{badge}</span>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
