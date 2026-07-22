'use client';

import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { motion } from 'framer-motion';
import { useAICenterStore } from '@/stores/ai-center-store';
import { getMockScenarioConfigs, getMockScenarioResults } from '@/data/ai-center-mock';

export default function PredictionRight() {
  const scenarios = useAICenterStore((s) => s.scenarios);
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<string[]>(['sc-1', 'sc-2', 'sc-3']);
  const [params, setParams] = useState<Record<string, number>>({ ac_temp_offset: 1, night_power_cutoff_ratio: 0.3, lighting_cut_minutes: 30 });

  const configs = getMockScenarioConfigs();
  const activeConfigs = configs.filter((c) => activeScenarios.includes(c.id));
  const results = getMockScenarioResults(activeConfigs);

  useEffect(() => {
    if (!chartRef.current || results.length === 0) return;
    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current, undefined, { devicePixelRatio: 2 });
    }

    const series = results.map((r) => {
      const config = configs.find((c) => c.id === r.scenarioId);
      return {
        name: config?.name || r.scenarioId,
        type: 'line' as const,
        data: r.predictedCurve.map((d) => d.emission),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: config?.color || '#3488ff', width: 2.5 },
        itemStyle: { color: config?.color || '#3488ff' },
      };
    });

    instanceRef.current.setOption(
      {
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,40,0.95)', borderColor: 'rgba(52,136,255,0.3)', textStyle: { color: '#e0e0e0', fontSize: 12 } },
        legend: { bottom: 0, textStyle: { color: '#8c8c8c', fontSize: 11 } },
        grid: { left: 12, right: 24, top: 12, bottom: 40 },
        xAxis: {
          type: 'category',
          data: results[0]?.predictedCurve.map((d) => d.date.slice(5)) || [],
          axisLabel: { color: '#8c8c8c', fontSize: 10, interval: 3 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        },
        yAxis: {
          type: 'value',
          name: 'tCO₂',
          nameTextStyle: { color: '#8c8c8c', fontSize: 11 },
          axisLabel: { color: '#8c8c8c', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        },
        series,
      },
      { notMerge: true }
    );

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [results]);

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="p-6 space-y-6"
    >
      {/* 情景模拟器大面板 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>多策略情景模拟对比</h3>

        {/* 情景开关 */}
        <div className="flex flex-wrap gap-3 mb-4">
          {configs.map((config) => {
            const isActive = activeScenarios.includes(config.id);
            return (
              <button
                key={config.id}
                onClick={() => setActiveScenarios((prev) =>
                  prev.includes(config.id) ? prev.filter((id) => id !== config.id) : [...prev, config.id]
                )}
                className="text-sm px-4 py-2 rounded-lg transition-all"
                style={{
                  color: isActive ? '#fff' : '#8c8c8c',
                  background: isActive ? config.color : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isActive ? config.color : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {config.name}
              </button>
            );
          })}
        </div>

        {/* 参数滑动条 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {activeConfigs.map((config) => (
            <div key={config.id} className="space-y-2 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="text-xs font-medium" style={{ color: config.color }}>{config.name}</div>
              {config.params.map((param) => (
                <div key={param.key} className="flex items-center gap-3">
                  <span className="text-xs w-24" style={{ color: '#8c8c8c' }}>{param.key.replace(/_/g, ' ')}</span>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={params[param.key] || param.value}
                    onChange={(e) => setParams((p) => ({ ...p, [param.key]: Number(e.target.value) }))}
                    className="flex-1 h-1.5"
                    style={{ accentColor: config.color }}
                  />
                  <span className="text-xs w-16 text-right font-mono" style={{ color: '#e0e0e0' }}>
                    {params[param.key] || param.value}{param.unit}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* 大图表 */}
        <div ref={chartRef} style={{ width: '100%', height: 320 }} />

        {/* 汇总卡片 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {results.map((r) => {
            const config = configs.find((c) => c.id === r.scenarioId);
            return (
              <div key={r.scenarioId} className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${config?.color}20` }}>
                <div className="text-sm font-medium mb-2" style={{ color: config?.color }}>{config?.name}</div>
                <div className="text-2xl font-bold mb-1" style={{ color: '#36d968' }}>{r.totalSaving} <span className="text-xs font-normal" style={{ color: '#8c8c8c' }}>tCO₂</span></div>
                <div className="text-xs" style={{ color: '#8c8c8c' }}>费用影响 ¥{r.totalCostImpact.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 预案对比视图 */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(52,136,255,0.12)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
      >
        <h3 className="text-base font-semibold mb-4" style={{ color: '#e0e0e0' }}>预案对比视图</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(54,217,104,0.2)' }}>
            <div className="text-sm font-medium mb-3" style={{ color: '#36d968' }}>暑假预案 (推荐)</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计节能</span><span style={{ color: '#e0e0e0' }}>850 tce</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计减排</span><span style={{ color: '#e0e0e0' }}>485 tCO₂</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计节省</span><span style={{ color: '#e0e0e0' }}>¥68万</span></div>
            </div>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(52,136,255,0.15)' }}>
            <div className="text-sm font-medium mb-3" style={{ color: '#3488ff' }}>国庆预案</div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计节能</span><span style={{ color: '#e0e0e0' }}>120 tce</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计减排</span><span style={{ color: '#e0e0e0' }}>68 tCO₂</span></div>
              <div className="flex justify-between text-xs"><span style={{ color: '#8c8c8c' }}>预计节省</span><span style={{ color: '#e0e0e0' }}>¥9.6万</span></div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
