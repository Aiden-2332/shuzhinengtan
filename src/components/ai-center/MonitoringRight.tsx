'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';

export default function MonitoringRight() {
  const anomalies = useAICenterStore((s) => s.anomalies);
  const realtimeStream = useAICenterStore((s) => s.realtimeStream);
  const rightPanelDrawer = useAICenterStore((s) => s.rightPanelDrawer);
  const closeDrawer = useAICenterStore((s) => s.closeDrawer);
  const trendChartRef = useRef<HTMLDivElement>(null);
  const trendInstanceRef = useRef<echarts.ECharts | null>(null);

  const newCount = anomalies.filter((a) => a.status === 'new').length;
  const unprocessed = anomalies.filter((a) => a.status === 'new' || a.status === 'acknowledged').length;
  const resolved = anomalies.filter((a) => a.status === 'resolved').length;
  const avgResponse = '12min';

  // 异常趋势图
  useEffect(() => {
    if (!trendChartRef.current) return;
    if (!trendInstanceRef.current) {
      trendInstanceRef.current = echarts.init(trendChartRef.current, undefined, { devicePixelRatio: 2 });
    }

    const days = ['7/6', '7/7', '7/8', '7/9', '7/10', '7/11', '7/12'];
    trendInstanceRef.current.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,40,0.95)', borderColor: 'rgba(52,136,255,0.3)', textStyle: { color: '#e0e0e0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#8c8c8c', fontSize: 10 } },
      grid: { left: 12, right: 24, top: 12, bottom: 36 },
      xAxis: { type: 'category', data: days, axisLabel: { color: '#8c8c8c', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      yAxis: { type: 'value', name: '异常数', nameTextStyle: { color: '#8c8c8c', fontSize: 10 }, axisLabel: { color: '#8c8c8c', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [
        { name: '新增异常', type: 'bar', data: [2, 3, 1, 4, 2, 3, 4], itemStyle: { color: '#ff7b25', borderRadius: [4, 4, 0, 0] }, barWidth: 16 },
        { name: '已解决', type: 'bar', data: [1, 2, 1, 3, 2, 2, 1], itemStyle: { color: '#36d968', borderRadius: [4, 4, 0, 0] }, barWidth: 16 },
        { name: '未处理', type: 'line', data: [3, 4, 4, 5, 5, 6, 7], smooth: true, symbol: 'circle', symbolSize: 6, lineStyle: { color: '#ff3333', width: 2 }, itemStyle: { color: '#ff3333' } },
      ],
    }, { notMerge: true });

    const handleResize = () => trendInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-6"
    >
      {/* 异常统计大屏 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="今日异常" value={newCount} unit="个" color="#ff7b25" />
        <StatCard label="未处理" value={unprocessed} unit="个" color="#ff3333" />
        <StatCard label="平均响应" value={avgResponse} unit="" color="#3488ff" />
        <StatCard label="已解决率" value="28%" unit="" color="#36d968" />
      </div>

      {/* 异常趋势图 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>异常趋势（近7天）</h3>
        <div ref={trendChartRef} style={{ width: '100%', height: 280 }} />
      </div>

      {/* 异常详情抽屉 */}
      {rightPanelDrawer && rightPanelDrawer.type === 'anomaly' && (
        <div className="fixed inset-y-0 right-0 w-[480px] z-50 p-6 overflow-y-auto"
          style={{ background: 'rgba(8,16,40,0.98)', borderLeft: '1px solid rgba(52,136,255,0.15)', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: '#e0e0e0' }}>异常详情</h2>
            <button onClick={closeDrawer} className="text-sm px-3 py-1 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>关闭</button>
          </div>
          {(() => {
            const data = rightPanelDrawer.data as Record<string, unknown>;
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-sm font-medium mb-2" style={{ color: '#e0e0e0' }}>{data.buildingName as string} · {data.deviceName as string || '全楼'}</div>
                  <div className="text-xs mb-2" style={{ color: '#ff7b25' }}>{data.patternLabel as string} · {data.duration as string}</div>
                  <div className="text-xs" style={{ color: '#8c8c8c' }}>AI置信度: {((data.aiConfidence as number) * 100).toFixed(0)}%</div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#8c8c8c' }}>AI根因分析</div>
                  <div className="text-sm" style={{ color: '#e0e0e0' }}>{data.aiRootCause as string}</div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#8c8c8c' }}>影响量化</div>
                  {(() => {
                    const impact = data.impact as Record<string, unknown>;
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>额外排放</div><div className="text-sm font-semibold" style={{ color: '#ff7b25' }}>{impact.extraEmission as number} tCO₂</div></div>
                        <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>额外费用</div><div className="text-sm font-semibold" style={{ color: '#ff7b25' }}>¥{impact.extraCost as number}</div></div>
                        <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>影响范围</div><div className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{impact.affectedArea as string}</div></div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ label, value, unit, color }: { label: string; value: string | number; unit: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
      <div className="text-xs mb-1" style={{ color: '#8c8c8c' }}>{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}<span className="text-sm font-normal ml-1" style={{ color: '#8c8c8c' }}>{unit}</span>
      </div>
    </div>
  );
}
