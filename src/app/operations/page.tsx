"use client";

import { useState, useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  Zap,
  Droplets,
  Flame,
  Sun,
  Bell,
  Clock,
  Filter,
} from "lucide-react";
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getRealtimeMonitoring,
  getHourlyLoadData,
  getAnomalies,
} from "@/data/mock-data";

export default function L3OperationsPage() {
  const [year, setYear] = useState("2026");
  const [building, setBuilding] = useState("teaching-a");
  const [granularity, setGranularity] = useState("day");

  const realtimeData = useMemo(() => getRealtimeMonitoring(), [building]);
  const hourlyData = useMemo(() => getHourlyLoadData(building, "2026-06-15", "2026-06-16"), [building]);
  const alerts = useMemo(() => getAnomalies(year), [year]);

  const ENERGY_ICONS = {
    electricity: Zap,
    gas: Flame,
    water: Droplets,
    solar: Sun,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">后勤运营明细视图</h1>
          <p className="text-sm text-slate-400 mt-1">
            实时能耗监测与异常告警 · 数据更新：2026-07-21 14:35:22
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={building} onValueChange={setBuilding}>
            <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="teaching-a">教学楼 A</SelectItem>
              <SelectItem value="teaching-b">教学楼 B</SelectItem>
              <SelectItem value="library">图书馆</SelectItem>
              <SelectItem value="dorm-1">宿舍 1 号楼</SelectItem>
              <SelectItem value="canteen">食堂</SelectItem>
            </SelectContent>
          </Select>
          <Select value={granularity} onValueChange={setGranularity}>
            <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">小时</SelectItem>
              <SelectItem value="day">日</SelectItem>
              <SelectItem value="week">周</SelectItem>
              <SelectItem value="month">月</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 实时能耗监测 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Object.entries(realtimeData).filter(([key]) => key !== 'timestamp').map((item: any) => {
          const Icon = ENERGY_ICONS[item.energyType as keyof typeof ENERGY_ICONS] || Zap;
          return (
            <div key={item.energyType} className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">{item.name}</span>
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {item.currentValue}
              </div>
              <div className="text-xs text-slate-400">{item.unit}</div>
              <div className="flex items-center gap-1 mt-2">
                <Activity className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">正常</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 趋势曲线 + 排放结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              能耗趋势曲线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="hour" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #06B6D4",
                    borderRadius: "0.5rem",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="load"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorLoad)"
                  name="负荷 (kWh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              排放结构拆解
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "范围一（直接排放）", value: 35, color: "bg-yellow-400" },
                { name: "范围二（间接排放）", value: 58, color: "bg-cyan-400" },
                { name: "范围三（其他间接）", value: 7, color: "bg-slate-400" },
              ].map((item: any) => (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{item.name}</span>
                    <span className="text-sm font-bold text-white">
                      {item.value}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 异常告警中心 */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            异常告警中心
            <Badge className="badge-danger ml-2">{alerts.length} 条未处理</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="blocking">阻断</TabsTrigger>
              <TabsTrigger value="severe">严重</TabsTrigger>
              <TabsTrigger value="warning">一般</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-3">
                {alerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.severity === "blocking"
                        ? "bg-red-500/10 border-red-500/30"
                        : alert.severity === "severe"
                        ? "bg-orange-500/10 border-orange-500/30"
                        : "bg-yellow-500/10 border-yellow-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            alert.severity === "blocking"
                              ? "text-red-400"
                              : alert.severity === "severe"
                              ? "text-orange-400"
                              : "text-yellow-400"
                          }`}
                        />
                        <span className="text-sm font-medium text-white">
                          {alert.buildingName} - {alert.alertType}
                        </span>
                      </div>
                      <Badge
                        className={
                          alert.severity === "blocking"
                            ? "badge-danger"
                            : alert.severity === "severe"
                            ? "badge-warning"
                            : "badge-info"
                        }
                      >
                        {alert.severity === "blocking"
                          ? "阻断"
                          : alert.severity === "severe"
                          ? "严重"
                          : "一般"}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {alert.period}
                        </span>
                        <span className="text-slate-500">
                          影响：{alert.impact} tCO₂
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs border-slate-600 hover:border-cyan-400"
                        >
                          转工单
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs border-slate-600 hover:border-cyan-400"
                        >
                          转 AI 建议
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 节能潜力挖掘 */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">
            高耗能设备排名
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={[
                { name: "中央空调", value: 4500 },
                { name: "实验设备", value: 3200 },
                { name: "照明系统", value: 1800 },
                { name: "电梯", value: 1200 },
                { name: "其他", value: 800 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
              <YAxis stroke="#94A3B8" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1E293B",
                  border: "1px solid #06B6D4",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="value" name="能耗 (kWh)" fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Demo Watermark */}
      <div className="demo-watermark">Demo 模拟数据，不用于申报</div>
    </div>
  );
}
