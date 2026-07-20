'use client';

import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Calculator, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Lock,
  ChevronDown,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import { emissionFactors, getCalculationBatch, formatNumber, formatEmission, CURRENT_YEAR } from '@/data/mock-data';

// 核算步骤组件
function CalculationStep({ step, title, status, isExpanded, onToggle }: {
  step: number;
  title: string;
  status: 'completed' | 'current' | 'pending';
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${
      status === 'completed' ? 'bg-green-50 border border-green-200' :
      status === 'current' ? 'bg-blue-50 border border-blue-200' :
      'bg-slate-50 border border-slate-200'
    }`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        status === 'completed' ? 'bg-green-500 text-white' :
        status === 'current' ? 'bg-blue-500 text-white' :
        'bg-slate-200 text-slate-500'
      }`}>
        {status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step}
      </div>
      <span className={`font-medium ${
        status === 'current' ? 'text-blue-900' : 'text-slate-700'
      }`}>{title}</span>
      {status === 'current' && (
        <Badge className="bg-blue-100 text-blue-700">进行中</Badge>
      )}
    </div>
  );
}

// 追溯详情组件
function TraceDetail({ label, value, source }: { label: string; value: string; source?: string }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div className="text-sm">
      <div className="flex items-center justify-between py-1 hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <span className="text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-900">{value}</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {expanded && source && (
        <div className="pl-4 py-2 bg-slate-50 text-xs text-slate-500">
          来源: {source}
        </div>
      )}
    </div>
  );
}

// 阻断问题提示
function BlockingIssuesAlert() {
  return (
    <Alert className="bg-red-50 border-red-200">
      <AlertTriangle className="w-4 h-4 text-red-500" />
      <AlertTitle className="text-red-800">存在阻断级质量问题</AlertTitle>
      <AlertDescription className="text-red-700">
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>学生宿舍1号楼缺失超过10%的数据点</li>
          <li>实验楼5月账单与表计差异超阈值，待解释</li>
        </ul>
        <Button variant="outline" size="sm" className="mt-3" >
          前往处理
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export default function CalculationPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-06');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const batchData = useMemo(() => getCalculationBatch(selectedPeriod), [selectedPeriod]);
  
  const emissionBreakdown = [
    { type: 'electricity', name: '外购电力', value: batchData.emissionBreakdown.electricity, factor: emissionFactors[0] },
    { type: 'natural_gas', name: '天然气', value: batchData.emissionBreakdown.natural_gas, factor: emissionFactors[1] },
    { type: 'heat', name: '外购热力', value: batchData.emissionBreakdown.heat, factor: emissionFactors[2] },
    { type: 'solar', name: '光伏发电', value: batchData.emissionBreakdown.solar, factor: emissionFactors[3] },
  ];

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">碳核算工作台</h1>
            <p className="text-sm text-slate-500 mt-1">月度排放核算流程与数据追溯</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-06">2026年6月</SelectItem>
              <SelectItem value="2026-05">2026年5月</SelectItem>
              <SelectItem value="2026-04">2026年4月</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 核算进度 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">核算进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <CalculationStep step={1} title="数据准备" status="completed" isExpanded={false} onToggle={() => {}} />
              <div className="w-8 h-px bg-slate-200" />
              <CalculationStep step={2} title="质量检查" status="completed" isExpanded={false} onToggle={() => {}} />
              <div className="w-8 h-px bg-slate-200" />
              <CalculationStep step={3} title="核算计算" status="completed" isExpanded={false} onToggle={() => {}} />
              <div className="w-8 h-px bg-slate-200" />
              <CalculationStep step={4} title="复核确认" status="current" isExpanded={false} onToggle={() => {}} />
              <div className="w-8 h-px bg-slate-200" />
              <CalculationStep step={5} title="锁定归档" status="pending" isExpanded={false} onToggle={() => {}} />
            </div>
          </CardContent>
        </Card>

        {/* 阻断问题提示 */}
        {batchData.blockingIssues > 0 && <BlockingIssuesAlert />}

        {/* 排放汇总 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">排放汇总</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-sm text-slate-500">本月排放总量</p>
                <p className="text-4xl font-bold text-slate-900 mt-2">
                  {formatEmission(batchData.totalEmission)}
                </p>
                <p className="text-sm text-slate-500 mt-1">tCO₂</p>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">数据完整率</span>
                  <span className="font-medium">{batchData.dataCompleteness}%</span>
                </div>
                <Progress value={batchData.dataCompleteness} className="h-2" />
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-slate-500">核算状态</span>
                <Badge className="bg-blue-100 text-blue-700">复核中</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 排放来源明细 */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">排放来源明细</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>排放源</TableHead>
                    <TableHead className="text-right">排放量 (tCO₂)</TableHead>
                    <TableHead className="text-right">占比</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emissionBreakdown.map((item) => {
                    const percentage = (item.value / batchData.totalEmission * 100).toFixed(1);
                    const isExpanded = expandedRows.has(item.type);
                    
                    return (
                      <>
                        <TableRow 
                          key={item.type} 
                          className="cursor-pointer hover:bg-slate-50"
                          onClick={() => toggleRow(item.type)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                              {item.name}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatNumber(item.value)}
                          </TableCell>
                          <TableCell className="text-right">
                            {percentage}%
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-slate-50">
                            <TableCell colSpan={4} className="px-8 py-4">
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 mb-2">核算追溯</p>
                                <TraceDetail 
                                  label="活动数据" 
                                  value={formatNumber(item.value / (item.factor?.value || 1)) + ' MWh'}
                                  source="表计读数 / 账单"
                                />
                                <TraceDetail 
                                  label="排放因子" 
                                  value={`${item.factor?.value} ${item.factor?.unit}`}
                                  source={item.factor?.source || ''}
                                />
                                <TraceDetail 
                                  label="计算公式" 
                                  value="E = AD × EF"
                                  source="DB11/T 1785"
                                />
                                <TraceDetail 
                                  label="支撑材料" 
                                  value="3份附件"
                                  source="点击查看"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" disabled={batchData.blockingIssues > 0}>
              <Lock className="w-4 h-4 mr-2" />
              锁定核算
            </Button>
            {batchData.blockingIssues > 0 && (
              <span className="text-sm text-red-500">
                存在{batchData.blockingIssues}个阻断问题，无法锁定
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              导出报告
            </Button>
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              生成报告预览
            </Button>
          </div>
        </div>

        {/* 因子版本管理 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">排放因子版本</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>能源类型</TableHead>
                  <TableHead className="text-right">因子值</TableHead>
                  <TableHead>来源</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>生效日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emissionFactors.map((factor) => (
                  <TableRow key={factor.id}>
                    <TableCell className="font-medium">{factor.energyType}</TableCell>
                    <TableCell className="text-right font-mono">
                      {factor.value} {factor.unit}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{factor.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{factor.version}</Badge>
                    </TableCell>
                    <TableCell>{factor.effectiveDate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}