'use client';

import { useEffect, useState } from 'react';
import { useAICenterStore, type AnomalyTimelineEvent } from '@/stores/ai-center-store';
import { getMockAnomalyTimeline } from '@/data/ai-center-mock';

const PHASE_COLORS: Record<string, string> = {
  detected: '#3488ff',
  confirmed: '#ff7b25',
  dispatched: '#9b6bff',
  processing: '#ffc107',
  resolved: '#36d968',
  closed: '#8c8c8c',
};

export default function AnomalyTimeline({ anomalyId }: { anomalyId: string }) {
  const timelines = useAICenterStore((s) => s.anomalyTimelines);
  const setAnomalyTimeline = useAICenterStore((s) => s.setAnomalyTimeline);
  const [events, setEvents] = useState<AnomalyTimelineEvent[]>([]);

  useEffect(() => {
    if (!anomalyId) return;
    if (timelines[anomalyId]) {
      setEvents(timelines[anomalyId]);
    } else {
      const mockEvents = getMockAnomalyTimeline(anomalyId);
      setAnomalyTimeline(anomalyId, mockEvents);
      setEvents(mockEvents);
    }
  }, [anomalyId]);

  if (events.length === 0) {
    return <div className="text-xs text-center py-4" style={{ color: '#8c8c8c' }}>暂无时间线数据</div>;
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-3 relative">
          {/* 时间线 */}
          <div className="flex flex-col items-center">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
              style={{ background: PHASE_COLORS[event.phase] || '#8c8c8c' }}
            />
            {i < events.length - 1 && (
              <div className="w-px flex-1 min-h-[20px]" style={{ background: 'rgba(255,255,255,0.08)' }} />
            )}
          </div>
          {/* 内容 */}
          <div className="pb-3 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-medium" style={{ color: PHASE_COLORS[event.phase] }}>{event.phaseLabel}</span>
              <span className="text-[10px]" style={{ color: '#8c8c8c' }}>{new Date(event.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="text-xs" style={{ color: '#e0e0e0' }}>{event.detail}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#8c8c8c' }}>{event.actor}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
