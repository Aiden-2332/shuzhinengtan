'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Tooltip
} from 'recharts';
import type { TrendPoint } from '@/types';

const chartConfig = {
  actual: {
    label: '实际排放',
    color: '#0099FF',
  },
  target: {
    label: '目标',
    color: '#16A34A',
  },
  forecast: {
    label: '预测',
    color: '#94A3B8',
  },
} satisfies ChartConfig;

interface TrendChartProps {
  data: TrendPoint[];
  title?: string;
}

export function TrendChart({ data, title = '排放趋势' }: TrendChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0099FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0099FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748B' }}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="actual"
              stroke="#0099FF"
              strokeWidth={2}
              fill="url(#colorActual)"
              name="实际排放"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#16A34A"
              strokeWidth={2}
              dot={false}
              name="目标"
            />
            <Line
              type="monotone"
              dataKey="forecast"
              stroke="#94A3B8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="预测"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// 能源结构饼图
interface EnergyPieChartProps {
  data: { type: string; name: string; value: number; color: string }[];
  title?: string;
}

export function EnergyPieChart({ data, title = '能源结构' }: EnergyPieChartProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '占比']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => {
                  const payload = entry.payload as { name?: string; value?: number };
                  return `${payload?.name || value}: ${payload?.value || 0}%`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// 建筑排名柱状图
interface RankingBarChartProps {
  data: { buildingName: string; emission: number; intensity: number }[];
  metric?: 'emission' | 'intensity';
  title?: string;
}

export function RankingBarChart({ data, metric = 'emission', title = '建筑排放排名' }: RankingBarChartProps) {
  const sortedData = [...data].sort((a, b) => 
    metric === 'emission' ? b.emission - a.emission : b.intensity - a.intensity
  ).slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical" margin={{ left: 80, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis 
                dataKey="buildingName" 
                type="category" 
                tick={{ fontSize: 11, fill: '#64748B' }}
                width={70}
              />
              <Tooltip 
                formatter={(value: number) => [metric === 'emission' ? `${value} tCO₂` : `${value} kgCO₂/m²`, metric === 'emission' ? '排放量' : '强度']}
                contentStyle={{ fontSize: '12px' }}
              />
              <Bar 
                dataKey={metric} 
                fill="#0099FF" 
                radius={[0, 4, 4, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}