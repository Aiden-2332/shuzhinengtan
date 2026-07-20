'use client';

import { useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { KPICard, RiskCard, StatusBadge } from '@/components/dashboard/kpi-card';
import { TrendChart, EnergyPieChart, RankingBarChart } from '@/components/dashboard/charts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { 
  Activity, 
  TrendingUp, 
  Target, 
  Gauge, 
  AlertTriangle,
  Calendar,
  ArrowRight,
  Building2,
  Users,
  Zap
} from 'lucide-react';
import { 
  getKPIData, 
  getTrendData, 
  getBuildingRanking, 
  getEnergyStructure,
  getCampusContribution,
  getAnomalies,
  getComplianceEvents,
  formatNumber,
  formatEmission,
  CURRENT_YEAR
} from '@/data/mock-data';

export default function HomePage() {
  const kpiData = useMemo(() => getKPIData(CURRENT_YEAR), []);
  const trendData = useMemo(() => getTrendData(CURRENT_YEAR), []);
  const rankingData = useMemo(() => getBuildingRanking(CURRENT_YEAR), []);
  const energyData = useMemo(() => getEnergyStructure(CURRENT_YEAR), []);
  const campusData = useMemo(() => getCampusContribution(CURRENT_YEAR), []);
  const anomalies = useMemo(() => getAnomalies('pending'), []);
  const complianceEvents = useMemo(() => getComplianceEvents(CURRENT_YEAR), []);

  const pendingEvents = complianceEvents.filter(e => e.status === 'pending');
  const upcomingEvent = pendingEvents[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">领导驾驶舱</h1>
            <p className="text-sm text-slate-500 mt-1">全局碳排放概览与关键指标监控</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              数据状态: 已锁定
            </Badge>
          </div>
        </div>

        {/* KPI 卡片组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="年度排放总量"
            value={formatEmission(kpiData.totalEmission)}
            unit="tCO₂"
            change={kpiData.emissionChange}
            trend={kpiData.emissionChange > 0 ? 'up' : 'down'}
            changeLabel="同比"
            icon={<Activity className="w-5 h-5 text-blue-500" />}
          />
          <KPICard
            title="目标完成偏差"
            value={kpiData.targetDeviation > 0 ? `+${kpiData.targetDeviation}` : kpiData.targetDeviation}
            unit="%"
            status={kpiData.targetDeviation > 5 ? 'danger' : kpiData.targetDeviation > 0 ? 'warning' : 'success'}
            subValue={kpiData.targetDeviation > 0 ? '超出目标' : '优于目标'}
            icon={<Target className="w-5 h-5 text-green-500" />}
          />
          <KPICard
            title="预测年排放"
            value={formatEmission(kpiData.forecastEmission)}
            unit="tCO₂"
            subValue="基于当前趋势"
            icon={<TrendingUp className="w-5 h-5 text-slate-500" />}
          />
          <KPICard
            title="配额缺口"
            value={formatNumber(kpiData.quotaBalance)}
            unit="tCO₂"
            status={kpiData.quotaBalance > 500 ? 'danger' : kpiData.quotaBalance > 0 ? 'warning' : 'success'}
            subValue="预测值 | P50"
            icon={<Gauge className="w-5 h-5 text-orange-500" />}
          />
        </div>

        {/* 第二行 KPI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="单位面积排放强度"
            value={kpiData.intensityPerArea}
            unit="kgCO₂/m²"
            subValue="全校平均"
            icon={<Building2 className="w-5 h-5 text-slate-400" />}
          />
          <KPICard
            title="人均排放强度"
            value={kpiData.intensityPerCapita}
            unit="tCO₂/人"
            subValue="折算用能人数"
            icon={<Users className="w-5 h-5 text-slate-400" />}
          />
          <KPICard
            title="数据完整率"
            value={kpiData.dataCompleteness}
            unit="%"
            status={kpiData.dataCompleteness >= 98 ? 'success' : 'warning'}
            icon={<Zap className="w-5 h-5 text-blue-400" />}
          />
          <Card className="p-4">
            <CardContent className="p-0">
              <p className="text-sm text-slate-500 mb-2">风险等级</p>
              <div className="flex items-center gap-2">
                {kpiData.riskLevel === 'low' && (
                  <Badge className="bg-green-100 text-green-700">低风险</Badge>
                )}
                {kpiData.riskLevel === 'medium' && (
                  <Badge className="bg-orange-100 text-orange-700">中风险</Badge>
                )}
                {kpiData.riskLevel === 'high' && (
                  <Badge className="bg-red-100 text-red-700">高风险</Badge>
                )}
                {kpiData.riskLevel === 'critical' && (
                  <Badge className="bg-red-200 text-red-800">严重</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-2">基于配额缺口、数据质量综合评估</p>
            </CardContent>
          </Card>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 趋势图 */}
          <div className="lg:col-span-2">
            <TrendChart data={trendData} title="月度排放趋势" />
          </div>
          
          {/* 能源结构 */}
          <EnergyPieChart data={energyData} title="能源结构" />
        </div>

        {/* 建筑排名和风险区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 建筑排放排名 */}
          <RankingBarChart 
            data={rankingData.map(r => ({
              buildingName: r.buildingName,
              emission: r.emission,
              intensity: r.intensity
            }))} 
            title="建筑排放量排名 TOP10"
          />

          {/* 风险与待办 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <span>风险与待办</span>
                <Badge variant="outline">{anomalies.length + pendingEvents.length}项</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 异常风险 */}
              {anomalies.slice(0, 2).map((anomaly) => (
                <RiskCard
                  key={anomaly.id}
                  level={anomaly.severity === 'blocked' ? 'critical' : anomaly.severity === 'serious' ? 'high' : 'medium'}
                  title={`${anomaly.buildingName} - ${anomaly.rule.slice(0, 20)}...`}
                  description={`影响: ${formatNumber(anomaly.impactValue)} kWh | 截止: ${anomaly.dueDate}`}
                  action="查看详情"
                />
              ))}

              {/* 履约节点 */}
              {upcomingEvent && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">{upcomingEvent.name}</span>
                          <Badge variant="outline" className="bg-blue-100 text-blue-600">
                            {upcomingEvent.dueDate}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          负责人: {upcomingEvent.responsiblePerson}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Link href="/energy">
                <Button variant="outline" className="w-full">
                  查看全部风险与待办 <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* 校区贡献 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">校区排放贡献</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {campusData.map((campus) => (
                <div key={campus.campusId} className="p-4 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-900">{campus.name}</span>
                    <span className="text-lg font-semibold text-blue-600">{campus.value}%</span>
                  </div>
                  <Progress value={campus.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}