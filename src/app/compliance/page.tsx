"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Download,
  Search,
  Filter,
  Clock,
  Shield,
  Archive,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getReportProgress, getQualityMetrics, getAuditTrail } from "@/data/mock-data";

export default function L4CompliancePage() {
  const [year, setYear] = useState("2026");
  const [framework, setFramework] = useState("all");

  const reportProgress = useMemo(() => getReportProgress(Number(year)), [year]);
  const qualityMetrics = useMemo(() => getQualityMetrics(), [year]);
  const auditTrail = useMemo(() => getAuditTrail(year), [year]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">合规与披露视图</h1>
          <p className="text-sm text-slate-400 mt-1">
            全流程合规溯源 · 报告管理与审计轨迹
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
          <Select value={framework} onValueChange={setFramework}>
            <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部框架</SelectItem>
              <SelectItem value="city">市级年报</SelectItem>
              <SelectItem value="green">节约校园</SelectItem>
              <SelectItem value="esg">ESG 报告</SelectItem>
              <SelectItem value="iso">ISO 碳中和</SelectItem>
              <SelectItem value="ghg">GHG 盘查</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 多框架报告进度看板 */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            报告完成进度
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportProgress.map((report: any) => (
              <div
                key={report.framework}
                className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-white">
                    {report.name}
                  </h3>
                  <Badge
                    className={
                      report.status === "completed"
                        ? "badge-success"
                        : report.status === "in_progress"
                        ? "badge-warning"
                        : "badge-info"
                    }
                  >
                    {report.status === "completed"
                      ? "已完成"
                      : report.status === "in_progress"
                      ? "进行中"
                      : "未开始"}
                  </Badge>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-400">完成进度</span>
                    <span className="text-white font-bold">
                      {report.progress}%
                    </span>
                  </div>
                  <Progress value={report.progress} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    截止：{report.deadline}
                  </span>
                  <span className="text-slate-500">
                    责任人：{report.responsiblePerson}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 数据质量监控 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              数据质量评分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-cyan-400 mb-2">
                {qualityMetrics.score}
              </div>
              <div className="text-sm text-slate-400 mb-4">综合评分</div>
              <div className="space-y-3">
                {[
                  { name: "完整性", value: qualityMetrics.completeness, color: "bg-green-400" },
                  { name: "及时性", value: qualityMetrics.timeliness, color: "bg-cyan-400" },
                  { name: "合理性", value: qualityMetrics.accuracy, color: "bg-blue-400" },
                  { name: "一致性", value: qualityMetrics.consistency, color: "bg-purple-400" },
                  { name: "可追溯性", value: qualityMetrics.traceability, color: "bg-yellow-400" },
                ].map((metric) => (
                  <div key={metric.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">{metric.name}</span>
                      <span className="text-white">{metric.value}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${metric.color}`}
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              数据问题清单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { type: "缺失", count: 3, severity: "warning", description: "3 个计量点 6 月数据未填报" },
                { type: "异常", count: 5, severity: "info", description: "5 处数据波动超阈值待确认" },
                { type: "待校验", count: 12, severity: "info", description: "12 条数据待复核确认" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.severity === "warning" ? "bg-yellow-400" : "bg-cyan-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.type}数据
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        item.severity === "warning" ? "badge-warning" : "badge-info"
                      }
                    >
                      {item.count} 条
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-xs border-slate-600 hover:border-cyan-400"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      导出
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MRV 全审计轨迹 */}
      <Card className="card-dark">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            MRV 审计轨迹
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recent">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="recent">最近修改</TabsTrigger>
              <TabsTrigger value="all">全部记录</TabsTrigger>
            </TabsList>
            <TabsContent value="recent" className="mt-4">
              <div className="space-y-3">
                {auditTrail.slice(0, 5).map((record, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 bg-slate-800/30 rounded-lg border border-slate-700/30"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-cyan-400" />
                      </div>
                      {index < 4 && (
                        <div className="w-px h-8 bg-slate-700 mt-2" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">
                          {record.action}
                        </span>
                        <span className="text-xs text-slate-500">
                          {record.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-1">
                        {record.action}
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-500">
                          操作人：{record.user}
                        </span>
                        <span className="text-slate-500">
                          对象：{record.source}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 政策合规校验 + 报表导出 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              政策合规校验
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "能源计量器具合规性", status: "pass", description: "DB11/T 2344 要求" },
                { name: "核算方法合规性", status: "pass", description: "DB11/T 1785 标准" },
                { name: "数据质量控制方案", status: "warning", description: "待更新 2026 版本" },
                { name: "第三方核查报告", status: "pending", description: "预计 4 月 30 日前完成" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    {item.status === "pass" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : item.status === "warning" ? (
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-white">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={
                      item.status === "pass"
                        ? "badge-success"
                        : item.status === "warning"
                        ? "badge-warning"
                        : "badge-info"
                    }
                  >
                    {item.status === "pass"
                      ? "合规"
                      : item.status === "warning"
                      ? "待确认"
                      : "进行中"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Archive className="w-5 h-5 text-cyan-400" />
              报表一键导出
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "市级公共机构能耗年报", format: "Excel", size: "2.4 MB" },
                { name: "节约型校园自评报告", format: "PDF", size: "5.1 MB" },
                { name: "ESG 报告数据包", format: "ZIP", size: "12.8 MB" },
                { name: "第三方核查台账", format: "Excel", size: "3.2 MB" },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {report.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {report.format} · {report.size}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 hover:border-cyan-400"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    导出
                  </Button>
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
