'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { KPICard, StatusBadge } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { 
  Coins, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Download
} from 'lucide-react';
import { 
  getQuotaAccount, 
  getComplianceEvents, 
  getQuotaTransactions,
  formatNumber,
  CURRENT_YEAR 
} from '@/data/mock-data';

// 履约时间轴组件
function ComplianceTimeline({ events }: { events: ReturnType<typeof getComplianceEvents> }) {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const isCompleted = event.status === 'completed';
        const isPending = event.status === 'pending';
        const isOverdue = event.status === 'overdue';
        
        return (
          <div key={event.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted ? 'bg-green-100 text-green-600' :
                isOverdue ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              {index < sortedEvents.length - 1 && (
                <div className={`w-0.5 h-8 ${isCompleted ? 'bg-green-200' : 'bg-slate-200'}`} />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-slate-900">{event.name}</span>
                <Badge className={
                  isCompleted ? 'bg-green-100 text-green-700' :
                  isOverdue ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }>
                  {isCompleted ? '已完成' : isOverdue ? '已逾期' : '待处理'}
                </Badge>
              </div>
              <p className="text-sm text-slate-500">
                截止日期: {event.dueDate} | 负责人: {event.responsiblePerson}
              </p>
              {isCompleted && event.completedAt && (
                <p className="text-xs text-green-600 mt-1">
                  完成时间: {event.completedAt}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 方案比较卡片
function SchemeCard({ 
  title, 
  description, 
  gap, 
  cost, 
  feasibility 
}: { 
  title: string;
  description: string;
  gap: number;
  cost: number;
  feasibility: 'high' | 'medium' | 'low';
}) {
  const feasibilityColors = {
    high: 'text-green-600',
    medium: 'text-yellow-600',
    low: 'text-red-600'
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <h4 className="font-medium text-slate-900 mb-2">{title}</h4>
        <p className="text-sm text-slate-500 mb-4">{description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">缺口覆盖</span>
            <span className="font-medium">{gap > 0 ? '+' : ''}{gap} tCO₂</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">预估成本</span>
            <span className="font-medium">{formatNumber(cost)} 元</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">可行性</span>
            <span className={`font-medium ${feasibilityColors[feasibility]}`}>
              {feasibility === 'high' ? '高' : feasibility === 'medium' ? '中' : '低'}
            </span>
          </div>
        </div>
        <Button variant="outline" className="w-full mt-4" size="sm">
          查看详情
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AssetPage() {
  const quotaAccount = useMemo(() => getQuotaAccount(CURRENT_YEAR), []);
  const complianceEvents = useMemo(() => getComplianceEvents(CURRENT_YEAR), []);
  const transactions = useMemo(() => getQuotaTransactions(CURRENT_YEAR), []);
  
  const [emissionScenario, setEmissionScenario] = useState(17000);
  const [priceScenario, setPriceScenario] = useState(85);

  // 计算缺口
  const calculateGap = () => {
    const gap = emissionScenario - quotaAccount.allocatedQuota;
    const exposure = gap * priceScenario;
    return { gap, exposure };
  };

  const { gap, exposure } = calculateGap();

  // 预测曲线数据 (使用确定性的偏差值避免 hydration 问题)
  const forecastData = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const base = quotaAccount.allocatedQuota / 12 * (i + 1);
    // 使用确定性的偏差值（基于月份）
    const deviation = 0.05 + (i * 0.01);
    const actual = emissionScenario / 12 * (i + 1) * (1 + deviation);
    return {
      month: `${month}月`,
      quota: Math.round(base),
      forecast: Math.round(actual),
    };
  }), [quotaAccount.allocatedQuota, emissionScenario]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">碳资产管理</h1>
            <p className="text-sm text-slate-500 mt-1">配额台账、情景预测与履约规划</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-600">
            模拟数据
          </Badge>
        </div>

        {/* KPI 卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="年度配额"
            value={formatNumber(quotaAccount.allocatedQuota)}
            unit="tCO₂"
            subValue="核定发放"
            icon={<Coins className="w-5 h-5 text-blue-500" />}
          />
          <KPICard
            title="预测排放"
            value={formatNumber(emissionScenario)}
            unit="tCO₂"
            subValue="P50情景"
            icon={<TrendingUp className="w-5 h-5 text-orange-500" />}
          />
          <KPICard
            title="配额缺口"
            value={formatNumber(Math.abs(gap))}
            unit="tCO₂"
            status={gap > 500 ? 'danger' : gap > 0 ? 'warning' : 'success'}
            subValue={gap > 0 ? '需采购/减排' : '有盈余'}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          />
          <KPICard
            title="资金敞口"
            value={formatNumber(Math.abs(exposure))}
            unit="元"
            subValue={`基于¥${priceScenario}/tCO₂`}
            icon={<TrendingDown className="w-5 h-5 text-slate-500" />}
          />
        </div>

        {/* 情景分析 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">情景参数调整</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">排放情景 (tCO₂)</span>
                    <span className="text-lg font-semibold">{formatNumber(emissionScenario)}</span>
                  </div>
                  <Slider
                    value={[emissionScenario]}
                    onValueChange={([value]) => setEmissionScenario(value)}
                    min={15000}
                    max={19000}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>15000</span>
                    <span>乐观</span>
                    <span>悲观</span>
                    <span>19000</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">碳价情景 (元/tCO₂)</span>
                    <span className="text-lg font-semibold">¥{priceScenario}</span>
                  </div>
                  <Slider
                    value={[priceScenario]}
                    onValueChange={([value]) => setPriceScenario(value)}
                    min={50}
                    max={150}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>¥50</span>
                    <span>低价</span>
                    <span>高价</span>
                    <span>¥150</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 结果展示 */}
            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-slate-500">缺口预测</p>
                  <p className={`text-2xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {gap > 0 ? '+' : ''}{formatNumber(gap)} tCO₂
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">资金敞口</p>
                  <p className={`text-2xl font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {gap > 0 ? '+' : '-'}{formatNumber(Math.abs(exposure))} 元
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">风险等级</p>
                  <Badge className={
                    gap > 800 ? 'bg-red-100 text-red-700' :
                    gap > 0 ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }>
                    {gap > 800 ? '高风险' : gap > 0 ? '中风险' : '低风险'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 预测曲线 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">排放与配额预测</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="quota" 
                    stroke="#16A34A" 
                    fill="#BBF7D0" 
                    name="配额累计" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={false}
                    name="预测排放累计" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 履约日历与方案 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 履约时间轴 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                履约日历
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceTimeline events={complianceEvents} />
            </CardContent>
          </Card>

          {/* 履约方案 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">履约方案</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <SchemeCard
                  title="方案一：优先减排"
                  description="通过运行优化和改造项目减少排放"
                  gap={-gap + 200}
                  cost={Math.abs(gap) > 0 ? gap * 20 : 0}
                  feasibility="medium"
                />
                <SchemeCard
                  title="方案二：采购配额"
                  description="从碳市场采购配额覆盖缺口"
                  gap={-gap}
                  cost={Math.abs(gap) * priceScenario}
                  feasibility="high"
                />
                <SchemeCard
                  title="方案三：组合策略"
                  description="减排+采购+抵销组合"
                  gap={-gap + 300}
                  cost={Math.abs(gap) * priceScenario * 0.6}
                  feasibility="high"
                />
              </div>
              
              <Button className="w-full mt-4">
                生成履约方案报告 <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 配额流水 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">配额台账</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日期</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead className="text-right">数量 (tCO₂)</TableHead>
                  <TableHead className="text-right">价格 (元/tCO₂)</TableHead>
                  <TableHead>备注</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {txn.type === 'allocation' ? '核定发放' : 
                         txn.type === 'purchase' ? '市场采购' :
                         txn.type === 'sale' ? '出售' :
                         txn.type === 'offset' ? '抵销' : '清缴'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={txn.type === 'allocation' || txn.type === 'purchase' ? 'text-green-600' : 'text-red-600'}>
                        {txn.type === 'allocation' || txn.type === 'purchase' ? '+' : '-'}{formatNumber(txn.quantity)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {txn.price ? `¥${txn.price}` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{txn.reference}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-slate-50">
                  <TableCell colSpan={2} className="font-medium">当前余额</TableCell>
                  <TableCell className="text-right font-mono font-bold">
                    {formatNumber(quotaAccount.allocatedQuota + transactions.reduce((sum, t) => 
                      t.type === 'purchase' ? sum + t.quantity : 
                      t.type === 'sale' ? sum - t.quantity : sum
                    , 0))} tCO₂
                  </TableCell>
                  <TableCell colSpan={2}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}