"use client";

import { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDepartmentRanking, getDepartmentKPI } from "@/data/mock-data";

export default function L2DepartmentPage() {
  const [year, setYear] = useState("2026");
  const [department, setDepartment] = useState("cs");

  const deptRanking = useMemo(() => getDepartmentRanking(Number(year)), [year]);
  const deptKPI = useMemo(() => getDepartmentKPI(department), [department, year]);

  const currentDept = deptRanking.find((d) => d.id === department);

  const radarData = [
    { metric: "单位面积排放", value: currentDept?.emission || 0, fullMark: 100 },
    { metric: "人均排放", value: currentDept?.emission || 0, fullMark: 100 },
    { metric: "数据完整率", value: 95, fullMark: 100 },
    { metric: "异常关闭率", value: 88, fullMark: 100 },
    { metric: "减排任务进度", value: 72, fullMark: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">院系业务视图</h1>
          <p className="text-sm text-slate-400 mt-1">
            分部门碳绩效看板 · 当前部门：{currentDept?.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026 年</SelectItem>
              <SelectItem value="2025">2025 年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cs">计算机学院</SelectItem>
              <SelectItem value="me">机械工程学院</SelectItem>
              <SelectItem value="chem">化学学院</SelectItem>
              <SelectItem value="lib">图书馆</SelectItem>
              <SelectItem value="dorm">宿舍管理中心</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 部门 KPI 卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">碳排放总量</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {currentDept?.emission || 0}
          </div>
          <div className="text-xs text-slate-400">tCO₂</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">-8.5% 同比</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">单位面积排放</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {currentDept?.emission || 0}
          </div>
          <div className="text-xs text-slate-400">kgCO₂/m²</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">-5.2% 同比</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">人均排放</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {currentDept?.emission || 0}
          </div>
          <div className="text-xs text-slate-400">tCO₂/人</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400">+2.1% 同比</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">减排任务进度</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">72%</div>
          <Progress value={72} className="h-2 mt-2" />
          <div className="flex items-center gap-1 mt-2">
            <Badge className="badge-warning text-xs">进行中</Badge>
          </div>
        </div>
      </div>

      {/* 分单元排名 + 雷达图 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              分单元碳排放排名
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptRanking} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94A3B8"
                  fontSize={12}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #06B6D4",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="emission" name="排放量 (tCO₂)">
                  {deptRanking.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.id === department ? "#06B6D4" : "#475569"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              部门综合评估
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis
                  dataKey="metric"
                  stroke="#94A3B8"
                  fontSize={11}
                />
                <PolarRadiusAxis stroke="#475569" fontSize={10} />
                <Radar
                  name="本部门"
                  dataKey="value"
                  stroke="#06B6D4"
                  fill="#06B6D4"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 高耗能点位 + 减排任务 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              高耗能点位
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "实验室 A301", type: "实验室", consumption: "高", status: "warning" },
                { name: "机房 B205", type: "机房", consumption: "高", status: "warning" },
                { name: "会议室 C102", type: "公共区域", consumption: "中", status: "info" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.status === "warning" ? "bg-yellow-400" : "bg-cyan-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">{item.type}</div>
                    </div>
                  </div>
                  <Badge
                    className={
                      item.status === "warning" ? "badge-warning" : "badge-info"
                    }
                  >
                    {item.consumption}耗能
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-green-400" />
              减排任务进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "空调节能改造", progress: 85, status: "success" },
                { name: "LED 照明替换", progress: 100, status: "success" },
                { name: "实验室通风优化", progress: 45, status: "warning" },
              ].map((task, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">{task.name}</span>
                    <span className="text-sm text-slate-400">{task.progress}%</span>
                  </div>
                  <Progress
                    value={task.progress}
                    className={`h-2 ${
                      task.status === "success" ? "bg-green-500/20" : "bg-yellow-500/20"
                    }`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demo Watermark */}
      <div className="demo-watermark">Demo 模拟数据，不用于申报</div>
    </div>
  );
}
