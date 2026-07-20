'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { KPICard, StatusBadge } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  Building2, 
  Zap, 
  Clock,
  TrendingUp,
  FileText,
  Wrench
} from 'lucide-react';
import Link from 'next/link';
import { buildings, getBuildingRanking, getAnomalies, getHourlyLoadData, formatNumber, CURRENT_YEAR } from '@/data/mock-data';
import type { Anomaly } from '@/types';

// 小时负荷热力图组件
function HourlyHeatmap({ data }: { data: number[][] }) {
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const maxValue = Math.max(...data.flat());
  const minValue = Math.min(...data.flat());
  
  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    if (ratio < 0.3) return 'bg-green-100';
    if (ratio < 0.5) return 'bg-yellow-100';
    if (ratio < 0.7) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex">
          <div className="w-12" />
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="w-6 text-center text-xs text-slate-400">
              {i}
            </div>
          ))}
        </div>
        {data.map((dayData, dayIndex) => (
          <div key={dayIndex} className="flex items-center">
            <div className="w-12 text-xs text-slate-500">{days[dayIndex]}</div>
            <div className="flex">
              {dayData.map((value, hourIndex) => (
                <div
                  key={hourIndex}
                  className={`w-6 h-6 ${getColor(value)} border border-white flex items-center justify-center`}
                  title={`${days[dayIndex]} ${hourIndex}:00 - ${value} kW`}
                >
                  <span className="text-[10px] text-slate-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 异常详情侧边栏
function AnomalyDetailPanel({ anomaly, onClose }: { anomaly: Anomaly | null; onClose: () => void }) {
  if (!anomaly) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[400px] bg-white shadow-xl z-50 overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">异常详情</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>关闭</Button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">建筑</p>
            <p className="font-medium">{anomaly.buildingName}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-500">问题类型</p>
            <StatusBadge status={anomaly.severity === 'blocked' ? 'danger' : anomaly.severity === 'serious' ? 'warning' : 'info'}>
              {anomaly.rule}
            </StatusBadge>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">影响电量</p>
              <p className="font-medium text-lg">{formatNumber(anomaly.impactValue)} kWh</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">影响费用</p>
              <p className="font-medium text-lg">{formatNumber(anomaly.impactCost)} 元</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-slate-500">时间段</p>
            <p className="font-medium">{anomaly.period}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-500">责任人</p>
            <p className="font-medium">{anomaly.responsiblePerson}</p>
          </div>
          
          <div>
            <p className="text-sm text-slate-500">截止日期</p>
            <p className="font-medium">{anomaly.dueDate}</p>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-sm text-slate-500 mb-2">证据材料</p>
            <div className="space-y-2">
              {anomaly.evidence.map((e, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                  <FileText className="w-4 h-4" />
                  {e}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" variant="outline">
              <Wrench className="w-4 h-4 mr-2" />
              转工单
            </Button>
            <Link href="/ai-suggestion" className="flex-1">
              <Button className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                转AI建议
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EnergyPage() {
  const [selectedMetric, setSelectedMetric] = useState<'emission' | 'intensity'>('emission');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('bldg-ta');
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  const rankingData = useMemo(() => getBuildingRanking(CURRENT_YEAR, selectedMetric), [selectedMetric]);
  const anomalies = useMemo(() => getAnomalies(), []);
  const hourlyData = useMemo(() => getHourlyLoadData(selectedBuilding, '2026-06-15', '2026-06-21'), [selectedBuilding]);

  // 模拟日趋势数据 (使用确定性的偏差值避免 hydration 问题)
  const dailyTrendData = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    // 使用日期作为偏差种子
    const deviation = 200 + (i % 7) * 100;
    return {
      date: `06-${i + 1}`,
      value: 3000 + deviation,
      baseline: 2800
    };
  }), []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">能源分析</h1>
            <p className="text-sm text-slate-500 mt-1">建筑能耗监测、异常定位与处置</p>
          </div>
        </div>

        {/* 指标选择 */}
        <div className="flex gap-2">
          <Button 
            variant={selectedMetric === 'emission' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('emission')}
          >
            按排放量
          </Button>
          <Button 
            variant={selectedMetric === 'intensity' ? 'default' : 'outline'}
            onClick={() => setSelectedMetric('intensity')}
          >
            按排放强度
          </Button>
        </div>

        {/* 建筑排名表格 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">同类建筑排名</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">排名</TableHead>
                  <TableHead>建筑名称</TableHead>
                  <TableHead className="text-right">
                    {selectedMetric === 'emission' ? '排放量 (tCO₂)' : '强度 (kgCO₂/m²)'}
                  </TableHead>
                  <TableHead className="text-right">同比变化</TableHead>
                  <TableHead className="text-right">状态</TableHead>
                  <TableHead className="w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankingData.slice(0, 10).map((item) => (
                  <TableRow 
                    key={item.buildingId}
                    className={item.buildingId === 'bldg-ta' ? 'bg-orange-50' : ''}
                  >
                    <TableCell className="font-medium">{item.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        {item.buildingName}
                        {item.buildingId === 'bldg-ta' && (
                          <Badge className="bg-orange-100 text-orange-700">异常</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {selectedMetric === 'emission' 
                        ? formatNumber(item.emission) 
                        : formatNumber(item.intensity)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={item.change > 0 ? 'text-red-500' : 'text-green-500'}>
                        {item.change > 0 ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />}
                        {Math.abs(item.change)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <StatusBadge status={item.buildingId === 'bldg-ta' ? 'warning' : 'success'}>
                        {item.buildingId === 'bldg-ta' ? '需关注' : '正常'}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedBuilding(item.buildingId)}
                      >
                        详情
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 建筑详情 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                教学楼A - 详细分析
              </CardTitle>
              <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {buildings.filter(b => b.type === 'teaching').map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="hourly">
              <TabsList className="mb-4">
                <TabsTrigger value="hourly">小时负荷热力图</TabsTrigger>
                <TabsTrigger value="daily">日趋势</TabsTrigger>
                <TabsTrigger value="anomalies">异常记录</TabsTrigger>
              </TabsList>
              
              <TabsContent value="hourly">
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    显示近7天各时段负荷分布，颜色越深表示负荷越高。
                    <Badge className="ml-2 bg-orange-100 text-orange-700">6月15-21日夜间负荷异常</Badge>
                  </p>
                  <HourlyHeatmap data={hourlyData} />
                </div>
              </TabsContent>
              
              <TabsContent value="daily">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="value" stroke="#0099FF" fill="#BFDBFE" name="实际负荷" />
                      <Line type="monotone" dataKey="baseline" stroke="#16A34A" strokeDasharray="5 5" name="基线" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </TabsContent>
              
              <TabsContent value="anomalies">
                <div className="space-y-3">
                  {anomalies.filter(a => a.buildingId === selectedBuilding || selectedBuilding === 'bldg-ta').map(anomaly => (
                    <Card 
                      key={anomaly.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedAnomaly(anomaly)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={anomaly.severity === 'blocked' ? 'text-red-500' : 'text-orange-500'} />
                            <div>
                              <p className="font-medium">{anomaly.buildingName}</p>
                              <p className="text-sm text-slate-500">{anomaly.rule.slice(0, 40)}...</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={anomaly.severity === 'blocked' ? 'danger' : 'warning'}>
                              {anomaly.severity === 'blocked' ? '阻断' : '警告'}
                            </StatusBadge>
                            <p className="text-sm text-slate-500 mt-1">影响: {formatNumber(anomaly.impactValue)} kWh</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* 异常详情侧边栏 */}
      {selectedAnomaly && (
        <AnomalyDetailPanel anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />
      )}
    </AppLayout>
  );
}