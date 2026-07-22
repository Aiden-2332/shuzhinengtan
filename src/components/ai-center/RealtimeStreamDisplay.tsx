'use client';

import { useEffect, useState } from 'react';
import { useAICenterStore } from '@/stores/ai-center-store';

export default function RealtimeStreamDisplay() {
  const realtimeStream = useAICenterStore((s) => s.realtimeStream);
  const [prevValues, setPrevValues] = useState({ power: 0, water: 0, heat: 0, carbon: 0 });

  useEffect(() => {
    setPrevValues({
      power: realtimeStream.totalPower,
      water: realtimeStream.totalWater,
      heat: realtimeStream.totalHeat,
      carbon: realtimeStream.totalCarbon,
    });
  }, [realtimeStream]);

  const flipClass = (current: number, prev: number) => {
    if (current === prev) return '';
    return current > prev ? 'text-[#ff7b25]' : 'text-[#36d968]';
  };

  return (
    <div className="grid grid-cols-4 gap-2">
      <FlipCard label="总功率" value={realtimeStream.totalPower} unit="kW" prev={prevValues.power} />
      <FlipCard label="总用水" value={realtimeStream.totalWater} unit="t/h" prev={prevValues.water} />
      <FlipCard label="总热力" value={realtimeStream.totalHeat} unit="GJ/h" prev={prevValues.heat} />
      <FlipCard label="碳排放" value={realtimeStream.totalCarbon} unit="tCO₂/h" prev={prevValues.carbon} highlight />
    </div>
  );
}

function FlipCard({ label, value, unit, prev, highlight }: { label: string; value: number; unit: string; prev: number; highlight?: boolean }) {
  return (
    <div className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <div className="text-[10px] mb-1" style={{ color: '#8c8c8c' }}>{label}</div>
      <div
        className={`text-lg font-bold font-mono transition-colors duration-500 ${highlight ? 'text-[#ff7b25]' : ''}`}
        style={{ color: highlight ? '#ff7b25' : '#e0e0e0' }}
      >
        {value.toFixed(1)}
      </div>
      <div className="text-[10px]" style={{ color: '#8c8c8c' }}>{unit}</div>
    </div>
  );
}
