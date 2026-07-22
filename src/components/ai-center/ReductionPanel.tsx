'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';

const CATEGORY_COLORS: Record<string, string> = {
  teaching: '#3488ff',
  dorm: '#ff7b25',
  lab: '#9b6bff',
  canteen: '#ffc107',
  admin: '#36d968',
  gym: '#ff3333',
  library: '#00bcd4',
};

export default function ReductionPanel() {
  const reductionBubbles = useAICenterStore((s) => s.reductionBubbles);
  const reductionPath = useAICenterStore((s) => s.reductionPath);
  const costScenarios = useAICenterStore((s) => s.costScenarios);
  const selectMeasure = useAICenterStore((s) => s.selectMeasure);
  const openDrawer = useAICenterStore((s) => s.openDrawer);
  const bubbleChartRef = useRef<HTMLDivElement>(null);
  const bubbleInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!bubbleChartRef.current || reductionBubbles.length === 0) return;
    if (!bubbleInstanceRef.current) {
      bubbleInstanceRef.current = echarts.init(bubbleChartRef.current, undefined, { devicePixelRatio: 2 });
    }

    bubbleInstanceRef.current.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8,16,40,0.95)',
        borderColor: 'rgba(52,136,255,0.3)',
        textStyle: { color: '#e0e0e0', fontSize: 11 },
        formatter: (params: { name: string; value: number[]; color: string }) => {
          const b = reductionBubbles.find((bb) => bb.buildingName === params.name);
          if (!b) return params.name;
          return `<div style="font-weight:600;margin-bottom:4px;color:${params.color}">${b.buildingName}</div>
            <div style="font-size:11px">排放强度: ${b.x.toFixed(1)} kgCO₂/m²</div>
            <div style="font-size:11px">减排潜力: ${b.y.toFixed(1)}%</div>
            <div style="font-size:11px">面积: ${(b.size / 1000).toFixed(1)}k m²</div>
            <div style="font-size:11px;color:#ff7b25">预计减排: ${b.estimatedReduction} tCO₂</div>`;
        },
      },
      grid: { left: 50, right: 16, top: 16, bottom: 24 },
      xAxis: {
        name: '排放强度 (kgCO₂/m²)',
        nameTextStyle: { color: '#8c8c8c', fontSize: 10 },
        axisLabel: { color: '#8c8c8c', fontSize: 9 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      yAxis: {
        name: '减排潜力 (%)',
        nameTextStyle: { color: '#8c8c8c', fontSize: 10 },
        axisLabel: { color: '#8c8c8c', fontSize: 9 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      series: [{
        type: 'scatter',
        data: reductionBubbles.map((b) => ({
          name: b.buildingName,
          value: [b.x, b.y, b.size],
          itemStyle: { color: CATEGORY_COLORS[b.category] || '#3488ff', opacity: 0.8 },
        })),
        symbolSize: (val: number[]) => Math.sqrt(val[2]) * 0.15,
        emphasis: { scale: 1.5 },
      }],
    }, { notMerge: true });

    const handleResize = () => bubbleInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [reductionBubbles]);

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-4 space-y-4"
    >
      {/* 减排潜力气泡图 */}
      <SectionCard title="减排潜力量化排名">
        <div ref={bubbleChartRef} style={{ width: '100%', height: 280 }} />
      </SectionCard>

      {/* 路径优化甘特图 */}
      <SectionCard title="减排路径优化">
        {reductionPath && (
          <div className="space-y-2">
            {reductionPath.measures.slice(0, 6).map((m) => (
              <button
                key={m.id}
                onClick={() => openDrawer('measure', m)}
                className="w-full text-left p-2 rounded transition-colors hover:bg-opacity-10"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: '#e0e0e0' }}>{m.name}</span>
                  <span className="text-[10px]" style={{ color: '#8c8c8c' }}>第{m.startMonth}-{m.endMonth}月</span>
                </div>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px]" style={{ color: '#36d968' }}>减排 {m.annualReduction} tCO₂</span>
                  <span className="text-[10px]" style={{ color: '#ff7b25' }}>投资 ¥{m.investment}万</span>
                  <span className="text-[10px]" style={{ color: '#8c8c8c' }}>回收 {m.paybackMonths}月</span>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-3 text-[10px]" style={{ color: '#8c8c8c' }}>
          <span>总投资: ¥{reductionPath?.totalInvestment}万</span>
          <span>总减排: {reductionPath?.totalReduction} tCO₂</span>
          <span>平均回收: {reductionPath?.avgPaybackMonths}月</span>
        </div>
      </SectionCard>

      {/* 碳配额成本对比 */}
      <SectionCard title="碳配额成本对比">
        <div className="space-y-2">
          {costScenarios.map((scenario, i) => (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${i === 0 ? 'rgba(54,217,104,0.3)' : 'rgba(52,136,255,0.1)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium" style={{ color: i === 0 ? '#36d968' : '#3488ff' }}>
                  {scenario.name} {i === 0 && '✓ 推荐'}
                </span>
                <span className="text-sm font-bold" style={{ color: '#e0e0e0' }}>¥{scenario.totalCost}万</span>
              </div>
              <div className="flex gap-1">
                {scenario.costBreakdown.map((item, j) => (
                  <div
                    key={j}
                    className="flex-1 h-1.5 rounded-full"
                    style={{
                      background: ['#3488ff', '#ff7b25', '#9b6bff', '#8c8c8c'][j],
                      flex: item.cost,
                    }}
                    title={`${item.item}: ¥${item.cost}万`}
                  />
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2">
                {scenario.costBreakdown.map((item, j) => (
                  <span key={j} className="text-[10px]" style={{ color: '#8c8c8c' }}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 align-middle" style={{ background: ['#3488ff', '#ff7b25', '#9b6bff', '#8c8c8c'][j] }} />
                    {item.item}: ¥{item.cost}万
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </motion.div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
    >
      <h3 className="text-sm font-semibold mb-3" style={{ color: '#e0e0e0' }}>{title}</h3>
      {children}
    </div>
  );
}
