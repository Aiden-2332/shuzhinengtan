'use client';

import { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useAICenterStore } from '@/stores/ai-center-store';
import { getMockScenarioConfigs, getMockScenarioResults } from '@/data/ai-center-mock';

export default function ScenarioSimulator() {
  const scenarios = useAICenterStore((s) => s.scenarios);
  const runScenario = useAICenterStore((s) => s.runScenario);
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<string[]>(['sc-1']);
  const [params, setParams] = useState<Record<string, number>>({ ac_temp_offset: 1, night_power_cutoff_ratio: 0.3, lighting_cut_minutes: 30 });

  const configs = getMockScenarioConfigs();

  useEffect(() => {
    runScenario(configs.filter((c) => activeScenarios.includes(c.id)));
  }, [activeScenarios, params]);

  const results = getMockScenarioResults(configs.filter((c) => activeScenarios.includes(c.id)));

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
        lineStyle: { color: config?.color || '#3488ff', width: 2 },
        itemStyle: { color: config?.color || '#3488ff' },
      };
    });

    instanceRef.current.setOption(
      {
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(8,16,40,0.95)', borderColor: 'rgba(52,136,255,0.3)', textStyle: { color: '#e0e0e0', fontSize: 11 } },
        legend: { bottom: 0, textStyle: { color: '#8c8c8c', fontSize: 10 } },
        grid: { left: 8, right: 16, top: 8, bottom: 32 },
        xAxis: {
          type: 'category',
          data: results[0]?.predictedCurve.map((d) => d.date.slice(5)) || [],
          axisLabel: { color: '#8c8c8c', fontSize: 9, interval: 5 },
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
        },
        yAxis: {
          type: 'value',
          name: 'tCO₂',
          nameTextStyle: { color: '#8c8c8c', fontSize: 10 },
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
    <div className="space-y-3">
      {/* 情景开关 */}
      <div className="flex flex-wrap gap-2">
        {configs.map((config) => {
          const isActive = activeScenarios.includes(config.id);
          return (
            <button
              key={config.id}
              onClick={() => setActiveScenarios((prev) =>
                prev.includes(config.id) ? prev.filter((id) => id !== config.id) : [...prev, config.id]
              )}
              className="text-xs px-3 py-1 rounded-full transition-all"
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
      {configs.filter((c) => activeScenarios.includes(c.id)).map((config) => (
        <div key={config.id} className="space-y-1">
          {config.params.map((param) => (
            <div key={param.key} className="flex items-center gap-2">
              <span className="text-[10px] w-20" style={{ color: '#8c8c8c' }}>{param.key.replace(/_/g, ' ')}</span>
              <input
                type="range"
                min={param.min}
                max={param.max}
                step={param.step}
                value={params[param.key] || param.value}
                onChange={(e) => setParams((p) => ({ ...p, [param.key]: Number(e.target.value) }))}
                className="flex-1 h-1"
                style={{ accentColor: config.color }}
              />
              <span className="text-xs w-14 text-right" style={{ color: '#e0e0e0' }}>
                {params[param.key] || param.value}{param.unit}
              </span>
            </div>
          ))}
        </div>
      ))}

      {/* 对比曲线 */}
      <div ref={chartRef} style={{ width: '100%', height: 160 }} />

      {/* 汇总 */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {results.map((r) => {
            const config = configs.find((c) => c.id === r.scenarioId);
            return (
              <div key={r.scenarioId} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="text-[10px]" style={{ color: config?.color }}>{config?.name}</div>
                <div className="text-xs" style={{ color: '#36d968' }}>减排 {r.totalSaving} tCO₂</div>
                <div className="text-[10px]" style={{ color: '#8c8c8c' }}>费用影响 ¥{r.totalCostImpact.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
