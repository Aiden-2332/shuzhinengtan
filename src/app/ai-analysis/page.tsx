"use client";

import { useState } from "react";
import {
  Brain,
  TrendingUp,
  Bell,
  Target,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Zap,
  Send,
  Sparkles,
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
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

export default function AIAnalysisPage() {
  const [activeModule, setActiveModule] = useState("predict");
  const [chatInput, setChatInput] = useState("");

  // 模拟预测数据
  const predictData = Array.from({ length: 90 }, (_, i) => ({
    day: i + 1,
    actual: i < 60 ? 45 + Math.sin(i * 0.1) * 10 + 2.5 : undefined,
    predicted: 45 + Math.sin(i * 0.1) * 10 + i * 0.2,
    upper: 45 + Math.sin(i * 0.1) * 10 + i * 0.2 + 15,
    lower: 45 + Math.sin(i * 0.1) * 10 + i * 0.2 - 15,
  }));

  // 模拟对话历史
  const chatHistory = [
    {
      role: "user",
      content: "本月月度报告截止日期是什么时候？",
    },
    {
      role: "ai",
      content:
        "根据北京市碳排放权交易管理办法，2026 年月度数据须在每月结束后 20 个自然日内上报。本月（7 月）的报告截止日期为 2026 年 8 月 20 日。\n\n**引用来源**：《北京市碳排放权交易管理办法》（京政发〔2024〕6 号）第十五条",
      sources: ["京政发〔2024〕6 号 第十五条"],
    },
    {
      role: "user",
      content: "绿电凭证怎么核算？",
    },
    {
      role: "ai",
      content:
        "绿电凭证核算需满足以下条件：\n1. 凭证须来自国家可再生能源信息管理中心\n2. 凭证量与申报绿电量一致\n3. 凭证有效期覆盖核算周期\n\n当前您校 2026 年绿电凭证量为 125 万 kWh，申报绿电量为 120 万 kWh，凭证充足。\n\n**引用来源**：京环发〔2026〕7 号 附件 3",
      sources: ["京环发〔2026〕7 号 附件 3"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">AI 智能分析中心</h1>
        <p className="text-sm text-slate-400 mt-1">
          预测性分析 · 实时监控 · 减排优化 · 政策咨询
        </p>
      </div>

      {/* 模块切换 */}
      <Tabs value={activeModule} onValueChange={setActiveModule}>
        <TabsList className="bg-slate-800 border-slate-700 w-full justify-start">
          <TabsTrigger value="predict" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            预测性分析
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            实时监控报警
          </TabsTrigger>
          <TabsTrigger value="reduction" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            减排路径优化
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            政策咨询 AI 助手
          </TabsTrigger>
        </TabsList>

        {/* 预测性分析 */}
        <TabsContent value="predict" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="card-dark lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  排放趋势预测（未来 90 天）
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictData}>
                    <defs>
                      <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="day"
                      stroke="#94A3B8"
                      fontSize={12}
                      label={{ value: "天", position: "insideBottom", offset: -5 }}
                    />
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
                      dataKey="upper"
                      stroke="transparent"
                      fill="#06B6D4"
                      fillOpacity={0.1}
                      name="置信区间上限"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      stroke="transparent"
                      fill="#1E293B"
                      fillOpacity={1}
                      name="置信区间下限"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#06B6D4"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="AI 预测值"
                    />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="实际值"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="flex items-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-400" />
                    <span className="text-slate-400">实际值</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-cyan-400 border-dashed" />
                    <span className="text-slate-400">AI 预测值</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-cyan-400/20 border border-cyan-400" />
                    <span className="text-slate-400">置信区间</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  节假日调控预案
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        暑假调控预案
                      </span>
                      <Badge className="badge-warning">30 天后</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      预计节能量：125 tCO₂
                    </p>
                    <div className="text-xs text-slate-500">
                      措施：空调温度调高 2°C + 公共区域照明减半
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        国庆调控预案
                      </span>
                      <Badge className="badge-info">90 天后</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      预计节能量：45 tCO₂
                    </p>
                    <div className="text-xs text-slate-500">
                      措施：实验室轮休 + 宿舍区定时供电
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 情景模拟器 */}
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                情景模拟器
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    空调温度调整
                  </label>
                  <Slider defaultValue={[1]} max={3} step={0.5} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0°C</span>
                    <span className="text-cyan-400">+1°C</span>
                    <span>+3°C</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    夜间断电范围
                  </label>
                  <Slider defaultValue={[50]} max={100} step={10} />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>0%</span>
                    <span className="text-cyan-400">50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">
                    预计减排效果
                  </label>
                  <div className="text-2xl font-bold text-cyan-400">-8.5%</div>
                  <div className="text-xs text-slate-500">约 45 tCO₂/月</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 实时监控报警 */}
        <TabsContent value="monitor" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">实时告警</span>
                <Bell className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-xs text-slate-400">条未处理</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">阻断级</span>
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-1">2</div>
              <div className="text-xs text-slate-400">需立即处理</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">严重级</span>
                <AlertTriangle className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-3xl font-bold text-orange-400 mb-1">5</div>
              <div className="text-xs text-slate-400">今日新增</div>
            </div>
            <div className="kpi-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-400">已关闭</span>
                <Bell className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">28</div>
              <div className="text-xs text-slate-400">本周累计</div>
            </div>
          </div>

          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">
                异常事件时间线
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    time: "14:35",
                    building: "教学楼 A",
                    type: "夜间空载",
                    severity: "severe",
                    status: "待确认",
                  },
                  {
                    time: "13:20",
                    building: "实验楼",
                    type: "用气超标",
                    severity: "blocking",
                    status: "处理中",
                  },
                  {
                    time: "11:45",
                    building: "宿舍 1 号楼",
                    type: "用水突增",
                    severity: "warning",
                    status: "已关闭",
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30"
                  >
                    <div className="text-sm text-slate-500 w-12">{event.time}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {event.building}
                        </span>
                        <Badge
                          className={
                            event.severity === "blocking"
                              ? "badge-danger"
                              : event.severity === "severe"
                              ? "badge-warning"
                              : "badge-info"
                          }
                        >
                          {event.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>状态：{event.status}</span>
                        <span>AI 置信度：85%</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-600 hover:border-cyan-400"
                    >
                      详情
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 减排路径优化 */}
        <TabsContent value="reduction" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  减排空间分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "教学楼 A", potential: 85, cost: "低" },
                    { name: "实验楼", potential: 72, cost: "中" },
                    { name: "图书馆", potential: 65, cost: "低" },
                    { name: "宿舍区", potential: 58, cost: "低" },
                    { name: "食堂", potential: 45, cost: "中" },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              item.cost === "低" ? "badge-success" : "badge-warning"
                            }
                          >
                            {item.cost}成本
                          </Badge>
                          <span className="text-sm text-cyan-400 font-bold">
                            {item.potential}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${item.potential}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="card-dark">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">
                  推荐实施路径
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { phase: "短期（0-6 月）", measures: ["空调优化", "LED 替换"], saving: "125 tCO₂" },
                    { phase: "中期（6-18 月）", measures: ["通风优化", "智能控制"], saving: "280 tCO₂" },
                    { phase: "长期（18-36 月）", measures: ["光伏扩建", "围护改造"], saving: "450 tCO₂" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white">
                          {item.phase}
                        </span>
                        <span className="text-sm text-cyan-400 font-bold">
                          {item.saving}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.measures.map((measure, i) => (
                          <Badge key={i} variant="outline" className="text-xs border-slate-600">
                            {measure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 政策咨询 AI 助手 */}
        <TabsContent value="chat" className="space-y-6 mt-6">
          <Card className="card-dark">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                政策咨询 AI 助手
                <Badge className="badge-info ml-2">智能体</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === "user"
                          ? "bg-cyan-500/20 border border-cyan-500/30"
                          : "bg-slate-800/50 border border-slate-700/50"
                      }`}
                    >
                      <p className="text-sm text-white whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      {msg.sources && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
                          <div className="text-xs text-slate-500 mb-1">引用来源：</div>
                          {msg.sources.map((source, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="text-xs border-slate-600 mr-1"
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 快捷问题 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  "月度报告截止日期？",
                  "绿电凭证核算方法？",
                  "配额清缴流程？",
                  "DB11 标准解读",
                ].map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="text-xs border-slate-600 hover:border-cyan-400"
                  >
                    {q}
                  </Button>
                ))}
              </div>

              {/* 输入框 */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="输入您的问题..."
                  className="bg-slate-800 border-slate-700"
                />
                <Button className="bg-cyan-500 hover:bg-cyan-600">
                  <Send className="w-4 h-4 mr-1" />
                  发送
                </Button>
              </div>

              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-xs text-yellow-400">
                  ⚠️ AI 回答仅供参考，请以正式政策文件为准。智能体不会自动生成正式报告或替代核查结论。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Demo Watermark */}
      <div className="demo-watermark">Demo 模拟数据，不用于申报</div>
    </div>
  );
}
