'use client';

import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { PredictionCurve } from '@/stores/ai-center-store';

export default function PredictionCurveChart({ data }: { data: PredictionCurve | null }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || !data) return;

    if (!instanceRef.current) {
      instanceRef.current = echarts.init(chartRef.current, undefined, { devicePixelRatio: 2 });
    }

    const dates = [...data.historical.map((d) => d.date), ...data.forecast.map((d) => d.date)];
    const historicalValues = [...data.historical.map((d) => d.emission), ...Array(data.forecast.length).fill(null)];
    const forecastValues = [...Array(data.historical.length).fill(null), ...data.forecast.map((d) => d.predicted)];
    const upperValues = [...Array(data.historical.length).fill(null), ...data.forecast.map((d) => d.upper95)];
    const lowerValues = [...Array(data.historical.length).fill(null), ...data.forecast.map((d) => d.lower95)];

    instanceRef.current.setOption(
      {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(8,16,40,0.95)',
          borderColor: 'rgba(52,136,255,0.3)',
          textStyle: { color: '#e0e0e0', fontSize: 12 },
        },
        legend: {
          bottom: 0,
          textStyle: { color: '#8c8c8c', fontSize: 11 },
          data: ['历史排放', 'AI预测', '95%置信区间'],
        },
        grid: { left: 8, right: 16, top: 8, bottom: 32 },
        xAxis: {
          type: 'category',
          data: dates,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
          axisLabel: {
            color: '#8c8c8c',
            fontSize: 10,
            formatter: (value: string) => {
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            },
            interval: Math.floor(dates.length / 6),
          },
        },
        yAxis: {
          type: 'value',
          name: 'tCO₂',
          nameTextStyle: { color: '#8c8c8c', fontSize: 10 },
          axisLabel: { color: '#8c8c8c', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
        },
        series: [
          {
            name: '历史排放',
            type: 'line',
            data: historicalValues,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#3488ff', width: 2 },
            itemStyle: { color: '#3488ff' },
          },
          {
            name: 'AI预测',
            type: 'line',
            data: forecastValues,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: '#3488ff', width: 2, type: 'dashed' },
            itemStyle: { color: '#3488ff' },
          },
          {
            name: '95%置信区间',
            type: 'line',
            data: upperValues,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: 'rgba(52,136,255,0.15)', width: 0 },
            areaStyle: { color: 'rgba(52,136,255,0.08)' },
            stack: 'confidence',
          },
          {
            type: 'line',
            data: lowerValues,
            smooth: true,
            symbol: 'none',
            lineStyle: { color: 'rgba(52,136,255,0.15)', width: 0 },
            areaStyle: { color: 'rgba(52,136,255,0.08)' },
            stack: 'confidence',
          },
        ],
      },
      { notMerge: true }
    );

    const handleResize = () => instanceRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  return (
    <div className="relative">
      <div ref={chartRef} style={{ width: '100%', height: 220 }} />
      <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[10px] pointer-events-none" style={{ color: 'rgba(140,140,140,0.5)' }}>
        AI 预测，仅供参考
      </div>
    </div>
  );
}
