'use client';

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import { getMockOptimizationPath, getMockReductionMeasures } from '@/data/ai-center-mock';

const CATEGORY_COLORS: Record<string, string> = {
  equipment: '#3488ff',
  operation: '#36d968',
  technology: '#9b6bff',
  behavior: '#ffc107',
};

export default function ReductionRight() {
  const optimizationConstraints = useAICenterStore((s) => s.optimizationConstraints);
  const setOptimizationConstraints = useAICenterStore((s) => s.setOptimizationConstraints);
  const costScenarios = useAICenterStore((s) => s.costScenarios);
  const rightPanelDrawer = useAICenterStore((s) => s.rightPanelDrawer);
  const closeDrawer = useAICenterStore((s) => s.closeDrawer);
  const ganttRef = useRef<HTMLDivElement>(null);
  const ganttInstanceRef = useRef<echarts.ECharts | null>(null);
  const costRef = useRef<HTMLDivElement>(null);
  const costInstanceRef = useRef<echarts.ECharts | null>(null);
  const [budget, setBudget] = useState(optimizationConstraints.budget);

  const path = getMockOptimizationPath(budget);

  // 甘特图
  useEffect(() => {
    if (!ganttRef.current) return;
    if (!ganttInstanceRef.current) {
      ganttInstanceRef.current = echarts.init(ganttRef.current, undefined, { devicePixelRatio: 2 });
    }

    const categories = [...new Set(path.measures.map((m) => m.category))];
    ganttInstanceRef.current.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(8,16,40,0.95)',
        borderColor: 'rgba(52,136,255,0.3)',
        textStyle: { color: '#e0e0e0', fontSize: 11 },
        formatter: (params: { name: string; value: number[]; color: string }) => {
          return `<div style="font-weight:600;color:${params.color}">${params.name}</div>
            <div>第${params.value[1]}-${params.value[2]}月</div>`;
        },
      },
      grid: { left: 160, right: 24, top: 16, bottom: 24 },
      xAxis: {
        type: 'value',
        name: '月份',
        min: 0,
        max: Math.ceil(path.measures.reduce((max, m) => Math.max(max, m.endMonth), 0) * 1.2),
        axisLabel: { color: '#8c8c8c', fontSize: 10 },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      },
      yAxis: {
        type: 'category',
        data: path.measures.map((m) => m.name),
        axisLabel: { color: '#8c8c8c', fontSize: 10, width: 150, overflow: 'truncate' },
        axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      },
      series: [{
        type: 'custom',
        renderItem: (_params: unknown, api: { value: (idx: number) => number; coord: (val: [number, number]) => [number, number]; size: (val: [number, number]) => [number, number]; style: (style: Record<string, unknown>) => Record<string, unknown> }) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;
          const cat = path.measures[categoryIndex]?.category || 'equipment';
          return {
            type: 'rect',
            shape: { x: start[0], y: start[1] - height / 2, width: Math.max(end[0] - start[0], 4), height },
            style: api.style({ fill: CATEGORY_COLORS[cat] || '#3488ff', opacity: 0.85 }),
          };
        },
        data: path.measures.map((m, i) => [i, m.startMonth, m.endMonth, m.durationMonths]),
        encode: { x: [1, 2], y: 0 },
      }],
    }, { notMerge: true });

    const handleResize = () => ganttInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [budget]);

  // 成本对比图
  useEffect(() => {
    if (!costRef.current) return;
    if (!costInstanceRef.current) {
      costInstanceRef.current = echarts.init(costRef.current, undefined, { devicePixelRatio: 2 });
    }

    costInstanceRef.current.setOption({
      tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,40,0.95)', borderColor: 'rgba(52,136,255,0.3)', textStyle: { color: '#e0e0e0', fontSize: 11 } },
      legend: { bottom: 0, textStyle: { color: '#8c8c8c', fontSize: 10 } },
      grid: { left: 12, right: 24, top: 12, bottom: 36 },
      xAxis: { type: 'category', data: costScenarios.map((s) => s.name), axisLabel: { color: '#8c8c8c', fontSize: 10 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } } },
      yAxis: { type: 'value', name: '万元', nameTextStyle: { color: '#8c8c8c', fontSize: 10 }, axisLabel: { color: '#8c8c8c', fontSize: 10 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } } },
      series: [
        { name: '减排投资', type: 'bar', stack: 'total', data: costScenarios.map((s) => s.costBreakdown[0]?.cost || 0), itemStyle: { color: '#3488ff' }, barWidth: 60 },
        { name: '配额购买', type: 'bar', stack: 'total', data: costScenarios.map((s) => s.costBreakdown[1]?.cost || 0), itemStyle: { color: '#ff7b25' } },
        { name: 'CCER购买', type: 'bar', stack: 'total', data: costScenarios.map((s) => s.costBreakdown[2]?.cost || 0), itemStyle: { color: '#9b6bff' } },
        { name: '核查费用', type: 'bar', stack: 'total', data: costScenarios.map((s) => s.costBreakdown[3]?.cost || 0), itemStyle: { color: '#8c8c8c' } },
      ],
    }, { notMerge: true });

    const handleResize = () => costInstanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [costScenarios]);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-6"
    >
      {/* 路径甘特图大视图 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: '#e0e0e0' }}>减排路径甘特图</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: '#8c8c8c' }}>预算上限</span>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={budget}
              onChange={(e) => { setBudget(Number(e.target.value)); setOptimizationConstraints({ budget: Number(e.target.value), minPayback: 12 }); }}
              className="w-32 h-1"
              style={{ accentColor: '#3488ff' }}
            />
            <span className="text-xs font-mono w-20" style={{ color: '#e0e0e0' }}>¥{budget}万</span>
          </div>
        </div>
        <div ref={ganttRef} style={{ width: '100%', height: 320 }} />
        <div className="flex gap-4 mt-2">
          {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
            <div key={key} className="flex items-center gap-1 text-[10px]" style={{ color: '#8c8c8c' }}>
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {key === 'equipment' ? '设备改造' : key === 'operation' ? '运营优化' : key === 'technology' ? '技术升级' : '行为节能'}
            </div>
          ))}
        </div>
      </div>

      {/* 成本对比视图 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>碳配额成本对比</h3>
        <div ref={costRef} style={{ width: '100%', height: 240 }} />
      </div>

      {/* 汇总 */}
      <div className="grid grid-cols-4 gap-4">
        <SummaryCard label="总投资" value={`¥${path.totalInvestment}万`} color="#3488ff" />
        <SummaryCard label="总减排" value={`${path.totalReduction} tCO₂`} color="#36d968" />
        <SummaryCard label="平均回收期" value={`${path.avgPaybackMonths}月`} color="#ff7b25" />
        <SummaryCard label="措施数" value={`${path.measures.length}项`} color="#9b6bff" />
      </div>

      {/* 措施详情抽屉 */}
      {rightPanelDrawer && rightPanelDrawer.type === 'measure' && (
        <div className="fixed inset-y-0 right-0 w-[480px] z-50 p-6 overflow-y-auto"
          style={{ background: 'rgba(8,16,40,0.98)', borderLeft: '1px solid rgba(52,136,255,0.15)', boxShadow: '-8px 0 32px rgba(0,0,0,0.5)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: '#e0e0e0' }}>措施详情</h2>
            <button onClick={closeDrawer} className="text-sm px-3 py-1 rounded" style={{ color: '#8c8c8c', background: 'rgba(255,255,255,0.06)' }}>关闭</button>
          </div>
          {(() => {
            const data = rightPanelDrawer.data as Record<string, unknown>;
            return (
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-base font-semibold mb-3" style={{ color: '#e0e0e0' }}>{data.name as string}</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>投资</div><div className="text-sm font-semibold" style={{ color: '#ff7b25' }}>¥{data.investment as number}万</div></div>
                    <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>回收期</div><div className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{data.paybackMonths as number}月</div></div>
                    <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>年减排</div><div className="text-sm font-semibold" style={{ color: '#36d968' }}>{data.annualReduction as number} tCO₂</div></div>
                    <div><div className="text-[10px]" style={{ color: '#8c8c8c' }}>实施周期</div><div className="text-sm font-semibold" style={{ color: '#e0e0e0' }}>{data.durationMonths as number}月</div></div>
                  </div>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#8c8c8c' }}>MRV方法</div>
                  <div className="text-sm" style={{ color: '#e0e0e0' }}>{data.mrvMethod as string}</div>
                  <div className="text-xs mt-2" style={{ color: '#8c8c8c' }}>基线: {data.baseline as string}</div>
                </div>
                {Array.isArray(data.prerequisites) && (data.prerequisites as string[]).length > 0 && (
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs font-medium mb-2" style={{ color: '#ff7b25' }}>前置条件</div>
                    {(data.prerequisites as string[]).map((p: string, i: number) => (
                      <div key={i} className="text-xs" style={{ color: '#e0e0e0' }}>• {p}</div>
                    ))}
                  </div>
                )}
                {Array.isArray(data.risks) && (data.risks as string[]).length > 0 && (
                  <div className="p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="text-xs font-medium mb-2" style={{ color: '#ff3333' }}>风险提示</div>
                    {(data.risks as string[]).map((r: string, i: number) => (
                      <div key={i} className="text-xs" style={{ color: '#e0e0e0' }}>• {r}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </motion.div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)' }}>
      <div className="text-xs mb-1" style={{ color: '#8c8c8c' }}>{label}</div>
      <div className="text-xl font-bold font-mono" style={{ color }}>{value}</div>
    </div>
  );
}
