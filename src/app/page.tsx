"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  Zap,
  Building2,
  Users,
  Leaf,
  Award,
  BarChart3,
  Activity,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Legend,
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
import { Progress } from "@/components/ui/progress";
import {
  getKPIData,
  getTrendData,
  getEnergyStructure,
  getBuildingRanking,
  getAnomalies,
} from "@/data/mock-data";

export default function L1DashboardPage() {
  const [year, setYear] = useState("2026");
  const [campus, setCampus] = useState("all");

  const kpi = useMemo(() => getKPIData(Number(year)), [year, campus]);
  const trendData = useMemo(() => getTrendData(Number(year)), [year]);
  const energyStructure = useMemo(() => getEnergyStructure(Number(year)), [year]);
  const buildingRanking = useMemo(() => getBuildingRanking(Number(year)), [year]);
  const riskAlerts = useMemo(() => getAnomalies(), [year]);

  const CHART_COLORS = {
    electricity: "#0099FF",
    natural_gas: "#F59E0B",
    heat: "#EF4444",
    solar: "#10B981",
    green_electricity: "#06B6D4",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">校领导碳控制塔</h1>
          <p className="text-sm text-slate-400 mt-1">
            全校零碳建设总览 · 数据更新时间：2026-07-21 14:30
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
              <SelectItem value="2024">2024 年</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campus} onValueChange={setCampus}>
            <SelectTrigger className="w-[140px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全校</SelectItem>
              <SelectItem value="main">主校区</SelectItem>
              <SelectItem value="east">东校区</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 双碳总目标看板 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              碳达峰完成率
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">78.5%</div>
            <Progress value={78.5} className="h-2" />
            <p className="text-xs text-slate-400 mt-2">
              目标：2028 年前实现碳达峰
            </p>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-green-400" />
              碳中和进度
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">45.2%</div>
            <Progress value={45.2} className="h-2" />
            <p className="text-xs text-slate-400 mt-2">
              目标：2050 年前实现碳中和
            </p>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              综合评级
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">A-</div>
            <div className="flex items-center gap-2">
              <Badge className="badge-success">节约型校园 92 分</Badge>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              市级公共机构节能考核优秀
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 宏观排放数据 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">年度总碳排放</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {kpi.totalEmission.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400">tCO₂</div>
          <div className="flex items-center gap-1 mt-2">
            {kpi.emissionChange > 0 ? (
              <TrendingUp className="w-3 h-3 text-red-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-green-400" />
            )}
            <span
              className={`text-xs ${kpi.emissionChange > 0 ? "text-red-400" : "text-green-400"}`}
            >
              {Math.abs(kpi.emissionChange)}% 同比
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">单位面积排放</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {kpi.intensityPerArea}
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
            {kpi.intensityPerCapita}
          </div>
          <div className="text-xs text-slate-400">tCO₂/人</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">-3.8% 同比</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">数据完整率</span>
            <BarChart3 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {kpi.dataCompleteness}%
          </div>
          <div className="text-xs text-slate-400">月度数据</div>
          <div className="flex items-center gap-1 mt-2">
            <Badge className="badge-success text-xs">达标</Badge>
          </div>
        </div>
      </div>

      {/* 趋势图 + 能源结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              碳排放趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorEmission" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
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
                  dataKey="emission"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorEmission)"
                  name="排放量 (tCO₂)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              能源结构
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={energyStructure}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {energyStructure.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[entry.type as keyof typeof CHART_COLORS] || "#06B6D4"}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #06B6D4",
                    borderRadius: "0.5rem",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 横向对标 + 建筑排名 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              横向对标（模拟对比数据）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={[
                  { name: "本校", value: 12580 },
                  { name: "高校 A", value: 13200 },
                  { name: "高校 B", value: 11800 },
                  { name: "高校 C", value: 14500 },
                  { name: "高校 D", value: 12100 },
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
                <Bar dataKey="value" name="排放量 (tCO₂)">
                  {[
                    { name: "本校", value: 12580 },
                    { name: "高校 A", value: 13200 },
                    { name: "高校 B", value: 11800 },
                    { name: "高校 C", value: 14500 },
                    { name: "高校 D", value: 12100 },
                  ].map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "本校" ? "#06B6D4" : "#475569"}
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
              建筑碳排放排名 TOP5
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {buildingRanking.slice(0, 5).map((building, index) => (
                <div
                  key={building.buildingName}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {building.buildingName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {building.buildingName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">
                      {building.emission} t
                    </div>
                    <div className="text-xs text-slate-400">
                      {building.intensity} kg/m²
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 重大风险预警 */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            重大风险预警
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskAlerts.map((risk: any) => (
              <div
                key={risk.id}
                className={`p-4 rounded-lg border ${
                  risk.level === "high"
                    ? "bg-red-500/10 border-red-500/30"
                    : "bg-yellow-500/10 border-yellow-500/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      className={`w-4 h-4 ${
                        risk.level === "high" ? "text-red-400" : "text-yellow-400"
                      }`}
                    />
                    <span className="text-sm font-medium text-white">
                      {risk.title}
                    </span>
                  </div>
                  <Badge
                    className={
                      risk.level === "high" ? "badge-danger" : "badge-warning"
                    }
                  >
                    {risk.level === "high" ? "高风险" : "中风险"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-2">{risk.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    责任人：{risk.responsiblePerson}
                  </span>
                  <span className="text-slate-500">截止：{risk.deadline}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 快捷入口 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button className="card-dark h-auto py-4 flex-col gap-2 hover:border-cyan-400/50">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <span className="text-sm">年度节能汇报</span>
        </Button>
        <Button className="card-dark h-auto py-4 flex-col gap-2 hover:border-cyan-400/50">
          <Award className="w-5 h-5 text-cyan-400" />
          <span className="text-sm">零碳申报材料</span>
        </Button>
        <Button className="card-dark h-auto py-4 flex-col gap-2 hover:border-cyan-400/50">
          <ChevronRight className="w-5 h-5 text-cyan-400" />
          <span className="text-sm">下钻至院系视图</span>
        </Button>
      </div>

      {/* Demo Watermark */}
      <div className="demo-watermark">Demo 模拟数据，不用于申报</div>
    </div>
  );
}
