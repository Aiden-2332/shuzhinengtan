"use client";

import { useState, useMemo } from "react";
import {
  Search, Download, FileCheck, Lock, Upload, ChevronDown, ChevronUp,
  X, Eye, RotateCcw, Link2, AlertTriangle, CheckCircle2, Clock,
  FileText, ShieldCheck, TrendingUp, TrendingDown, Filter, RefreshCw,
  ArrowRight, Circle, ChevronLeft, History, User, Calendar, Hash,
  Building2, MapPin, Zap, FileBarChart, Package, Wrench, BookOpen,
  ClipboardCheck, Gauge, AlertCircle, Ban, MoreHorizontal,
} from "lucide-react";

import {
  kpiCards, mrvNodes, traceDetail, qualityDimensions, qualityIssues,
  voucherCategories, voucherItems, rectificationIssues, filterOptions,
  type KpiCardData, type MrvNodeData, type TraceDetailData,
  type VoucherItem, type RectificationIssue, type RectificationDetail,
} from "@/data/compliance-mock";

// ==================== 状态颜色映射 ====================

const nodeStatusColors: Record<string, string> = {
  completed: "bg-emerald-500",
  pending: "bg-amber-500",
  reviewing: "bg-violet-500",
  abnormal: "bg-red-500",
  locked: "bg-slate-500",
};

const nodeStatusBg: Record<string, string> = {
  completed: "bg-emerald-50 border-emerald-200 text-emerald-700",
  pending: "bg-amber-50 border-amber-200 text-amber-700",
  reviewing: "bg-violet-50 border-violet-200 text-violet-700",
  abnormal: "bg-red-50 border-red-200 text-red-700",
  locked: "bg-slate-100 border-slate-200 text-slate-600",
};

const auditStatusColors: Record<string, string> = {
  passed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-red-200 text-red-800",
};

const severityColors: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  major: "bg-amber-100 text-amber-700 border-amber-300",
  minor: "bg-blue-100 text-blue-700 border-blue-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
};

const issueStatusColors: Record<string, string> = {
  unassigned: "bg-slate-100 text-slate-600",
  processing: "bg-blue-100 text-blue-700",
  reviewing: "bg-violet-100 text-violet-700",
  closed: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

const completenessColors: Record<string, string> = {
  complete: "bg-emerald-100 text-emerald-700",
  partial: "bg-amber-100 text-amber-700",
  missing: "bg-red-100 text-red-700",
};

// ==================== 子组件 ====================

function KpiCard({ data, onClick }: { data: KpiCardData; onClick: () => void }) {
  const isPositive = data.change > 0;
  const changeColor = data.status === "danger"
    ? "text-red-500"
    : data.status === "warning"
      ? (isPositive ? "text-red-500" : "text-emerald-500")
      : isPositive ? "text-emerald-500" : "text-red-500";

  const statusBadgeColor = data.status === "danger"
    ? "bg-red-100 text-red-700"
    : data.status === "warning"
      ? "bg-amber-100 text-amber-700"
      : data.status === "info"
        ? "bg-blue-100 text-blue-700"
        : "bg-emerald-100 text-emerald-700";

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-lg border border-slate-200 p-4 text-left hover:border-slate-300 hover:shadow-sm transition-all w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{data.label}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadgeColor}`}>
          {data.statusLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-slate-900">{data.value}</span>
        <span className="text-sm text-slate-400">{data.unit}</span>
      </div>
      <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        <span>{data.changeLabel}</span>
      </div>
    </button>
  );
}

function MrvTraceChain({
  nodes,
  onNodeClick,
  selectedNodeId,
}: {
  nodes: MrvNodeData[];
  onNodeClick: (node: MrvNodeData) => void;
  selectedNodeId: string | null;
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-blue-600" />
        MRV 溯源链路
        <span className="text-xs text-slate-400 font-normal">排放源 → 审核确认</span>
      </h3>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {nodes.map((node, idx) => (
          <div key={node.id} className="flex items-start shrink-0">
            {/* Node card */}
            <button
              onClick={() => onNodeClick(node)}
              className={`relative w-[120px] rounded-lg border-2 p-3 text-left transition-all ${
                selectedNodeId === node.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : nodeStatusBg[node.status] || "bg-white border-slate-200"
              } hover:shadow-md`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${nodeStatusColors[node.status] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold text-slate-700 leading-tight">{node.name}</span>
              </div>
              <div className="text-[10px] text-slate-500 space-y-0.5">
                <div className="flex justify-between">
                  <span>数据</span>
                  <span className="font-medium text-slate-700">{node.dataCount}条</span>
                </div>
                <div className="flex justify-between">
                  <span>完整率</span>
                  <span className={`font-medium ${node.completeness >= 95 ? "text-emerald-600" : node.completeness >= 90 ? "text-amber-600" : "text-red-600"}`}>
                    {node.completeness}%
                  </span>
                </div>
                {node.abnormalCount > 0 && (
                  <div className="flex justify-between">
                    <span>异常</span>
                    <span className="font-medium text-red-600">{node.abnormalCount}条</span>
                  </div>
                )}
              </div>
              <div className="mt-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  node.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                  node.status === "abnormal" ? "bg-red-100 text-red-700" :
                  node.status === "reviewing" ? "bg-violet-100 text-violet-700" :
                  node.status === "locked" ? "bg-slate-200 text-slate-600" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  {node.statusLabel}
                </span>
              </div>
            </button>
            {/* Arrow connector */}
            {idx < nodes.length - 1 && (
              <div className="flex items-center pt-6 px-0.5">
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QualityAnalysis() {
  const overallScore = 92;
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Gauge className="w-4 h-4 text-blue-600" />
        数据质量分析
      </h3>

      {/* Score ring */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="none" stroke="#2563eb" strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-slate-900">{overallScore}</span>
            <span className="text-[10px] text-slate-400">综合评分</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {qualityDimensions.map((dim) => (
            <div key={dim.name} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-16 shrink-0">{dim.name}</span>
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    dim.score >= 90 ? "bg-emerald-500" : dim.score >= 80 ? "bg-blue-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
              <span className="text-xs font-medium text-slate-700 w-8 text-right">{dim.score}</span>
              <span className={`text-[10px] px-1 rounded ${
                dim.score >= 90 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
              }`}>
                {dim.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quality issues */}
      <div>
        <h4 className="text-xs font-semibold text-slate-600 mb-2">质量问题分布</h4>
        <div className="grid grid-cols-2 gap-1.5">
          {qualityIssues.map((issue) => (
            <div key={issue.id} className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-50">
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  issue.severity === "high" ? "bg-red-500" : issue.severity === "medium" ? "bg-amber-500" : "bg-blue-500"
                }`} />
                <span className="text-xs text-slate-600">{issue.type}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] px-1 rounded ${severityColors[issue.severity]}`}>
                  {issue.severityLabel}
                </span>
                <span className="text-xs font-medium text-slate-700">{issue.count}条</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoucherCenter({ onVoucherClick }: { onVoucherClick: (v: VoucherItem) => void }) {
  const [activeTab, setActiveTab] = useState(voucherCategories[0]);

  const filtered = useMemo(
    () => voucherItems.filter((v) => v.category === activeTab),
    [activeTab]
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="px-5 pt-4 pb-0">
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          凭证管理中心
        </h3>
        {/* Tabs */}
        <div className="flex gap-0.5 overflow-x-auto border-b border-slate-200">
          {voucherCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === cat
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {cat}
              <span className="ml-1 text-slate-400">
                ({voucherItems.filter((v) => v.category === cat).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">凭证名称</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">类型</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">对应数据项</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">院区</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">建筑</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">周期</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">编号</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">有效期</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">审核</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">完整性</th>
              <th className="text-left px-3 py-2.5 font-medium text-slate-500">版本</th>
              <th className="text-center px-3 py-2.5 font-medium text-slate-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => (
              <tr
                key={v.id}
                className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                  v.expired ? "bg-red-50/50" : v.expiringSoon ? "bg-amber-50/50" : ""
                }`}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    {v.expired && <Ban className="w-3 h-3 text-red-500" />}
                    {v.expiringSoon && !v.expired && <Clock className="w-3 h-3 text-amber-500" />}
                    <span className={`font-medium ${v.expired ? "text-red-700" : "text-slate-700"}`}>
                      {v.name}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate-500">{v.type}</td>
                <td className="px-3 py-2.5 text-slate-600">{v.dataItem}</td>
                <td className="px-3 py-2.5 text-slate-500">{v.campus}</td>
                <td className="px-3 py-2.5 text-slate-500">{v.building}</td>
                <td className="px-3 py-2.5 text-slate-500">{v.period}</td>
                <td className="px-3 py-2.5 text-slate-500 font-mono text-[10px]">{v.voucherNo}</td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] ${v.expired ? "text-red-600 font-medium" : v.expiringSoon ? "text-amber-600 font-medium" : "text-slate-500"}`}>
                    {v.validUntil}
                    {v.expired && " (已过期)"}
                    {v.expiringSoon && !v.expired && " (即将到期)"}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${auditStatusColors[v.auditStatus]}`}>
                    {v.auditStatusLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${completenessColors[v.completeness]}`}>
                    {v.completenessLabel}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-500 font-mono">{v.dataVersion}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1 justify-center">
                    <button onClick={() => onVoucherClick(v)} title="预览" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button title="下载" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button title="更多" className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RectificationPanel({ onIssueClick }: { onIssueClick: (issue: RectificationIssue) => void }) {
  const steps = [
    "系统识别异常", "生成问题工单", "分派责任人员",
    "补充数据/凭证", "重新计算", "审核确认", "问题关闭",
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        异常问题与整改任务
      </h3>

      {/* 整改流程 */}
      <div className="flex items-center gap-1 mb-4 pb-4 border-b border-slate-100 overflow-x-auto">
        {steps.map((step, idx) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-400 w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center font-medium">
                {idx + 1}
              </span>
              <span className="text-[10px] text-slate-600 whitespace-nowrap">{step}</span>
            </div>
            {idx < steps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />}
          </div>
        ))}
      </div>

      {/* Issue table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">编号</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">类型</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">严重程度</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">涉及数据</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">影响排放</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">责任人</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">截止时间</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">状态</th>
              <th className="text-left px-2.5 py-2 font-medium text-slate-500">进度</th>
            </tr>
          </thead>
          <tbody>
            {rectificationIssues.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="px-2.5 py-2.5 font-mono text-[10px] text-blue-600">{issue.issueNo}</td>
                <td className="px-2.5 py-2.5 text-slate-600">{issue.type}</td>
                <td className="px-2.5 py-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[issue.severity]}`}>
                    {issue.severityLabel}
                  </span>
                </td>
                <td className="px-2.5 py-2.5 text-slate-600">{issue.relatedData}</td>
                <td className="px-2.5 py-2.5 text-slate-700 font-medium">{issue.impactEmission} {issue.impactUnit}</td>
                <td className="px-2.5 py-2.5 text-slate-600">{issue.responsible}</td>
                <td className="px-2.5 py-2.5">
                  <span className={issue.status === "overdue" ? "text-red-600 font-medium" : "text-slate-500"}>
                    {issue.deadline}
                  </span>
                </td>
                <td className="px-2.5 py-2.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${issueStatusColors[issue.status]}`}>
                    {issue.statusLabel}
                  </span>
                </td>
                <td className="px-2.5 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          issue.status === "closed" ? "bg-emerald-500" :
                          issue.status === "overdue" ? "bg-red-500" :
                          issue.status === "reviewing" ? "bg-violet-500" :
                          "bg-blue-500"
                        }`}
                        style={{ width: `${issue.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">{issue.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== 抽屉组件 ====================

function TraceDetailDrawer({
  detail,
  onClose,
}: {
  detail: TraceDetailData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[560px] bg-white shadow-2xl h-full overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-semibold text-slate-800">溯源详情</h3>
            <p className="text-xs text-slate-500 mt-0.5">{detail.emissionSource} · {detail.building}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 基本信息 */}
          <Section title="基本信息">
            <DetailRow label="排放源" value={detail.emissionSource} />
            <DetailRow label="所属校区" value={detail.campus} />
            <DetailRow label="所属建筑" value={detail.building} />
            <DetailRow label="电表编号" value={detail.meterId} mono />
            <DetailRow label="数据采集时间" value={detail.collectTime} />
          </Section>

          {/* 活动数据 */}
          <Section title="活动数据">
            <DetailRow label="原始电表读数" value={`${detail.rawReading.toLocaleString()} kWh`} />
            <DetailRow label="月度电量" value={`${detail.monthlyConsumption.toLocaleString()} ${detail.unit}`} highlight />
            <DetailRow label="电费发票" value={detail.invoiceNo} mono />
            <DetailRow label="电力结算单" value={detail.settlementNo} mono />
            <DetailRow label="是否存在转供电" value={detail.hasTransferPower ? "是" : "否"} />
            {detail.dataCorrection && (
              <DetailRow label="数据修正记录" value={detail.dataCorrection} />
            )}
          </Section>

          {/* 排放因子 */}
          <Section title="排放因子">
            <DetailRow label="电力排放因子" value={`${detail.emissionFactor} kgCO₂/kWh`} highlight />
            <DetailRow label="排放因子来源" value={detail.factorSource} />
            <DetailRow label="排放因子年份" value={detail.factorYear} />
            <DetailRow label="排放因子版本" value={detail.factorVersion} mono />
          </Section>

          {/* 计算过程 */}
          <Section title="计算过程">
            <DetailRow label="计算公式" value={detail.formula} mono />
            <DetailRow label="计算结果" value={`${detail.result} ${detail.resultUnit}`} highlight />
          </Section>

          {/* 审核记录 */}
          <Section title="审核记录">
            <DetailRow label="填报人" value={detail.reporter} icon={<User className="w-3.5 h-3.5" />} />
            <DetailRow label="复核人" value={detail.reviewer} icon={<User className="w-3.5 h-3.5" />} />
            <DetailRow label="审批人" value={detail.approver} icon={<User className="w-3.5 h-3.5" />} />
            <DetailRow label="当前版本" value={detail.dataVersion} mono />
          </Section>

          {/* 版本历史 */}
          <Section title="版本历史">
            <div className="space-y-3">
              {detail.versions.map((ver, idx) => (
                <div key={ver.version} className={`p-3 rounded-lg border ${idx === 0 ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <History className="w-3 h-3 text-slate-400" />
                      {ver.version}
                      {idx === 0 && <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">当前</span>}
                    </span>
                    <span className="text-[10px] text-slate-400">{ver.modifyTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div><span className="text-slate-400">修改前：</span>{ver.beforeValue}</div>
                    <div><span className="text-slate-400">修改后：</span>{ver.afterValue}</div>
                    <div><span className="text-slate-400">原因：</span>{ver.reason}</div>
                    <div className="flex gap-3">
                      <span><span className="text-slate-400">修改人：</span>{ver.modifier}</span>
                      <span><span className="text-slate-400">审核人：</span>{ver.reviewer}</span>
                    </div>
                    <div><span className="text-slate-400">影响：</span>{ver.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function IssueDetailDrawer({
  issue,
  onClose,
}: {
  issue: RectificationIssue;
  onClose: () => void;
}) {
  const steps = [
    { label: "识别异常", done: true },
    { label: "生成工单", done: true },
    { label: "分派人员", done: issue.status !== "unassigned" },
    { label: "补充数据", done: issue.progress >= 40 },
    { label: "重新计算", done: issue.progress >= 60 },
    { label: "审核确认", done: issue.status === "closed" || issue.status === "reviewing" },
    { label: "问题关闭", done: issue.status === "closed" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-[560px] bg-white shadow-2xl h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-semibold text-slate-800">问题详情</h3>
            <p className="text-xs text-slate-500 mt-0.5">{issue.issueNo} · {issue.type}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* 整改流程 */}
          <Section title="整改流程">
            <div className="flex items-center gap-1 flex-wrap">
              {steps.map((step, idx) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] ${
                    step.done ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"
                  }`}>
                    {step.done ? <CheckCircle2 className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
                    <span>{step.label}</span>
                  </div>
                  {idx < steps.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                </div>
              ))}
            </div>
          </Section>

          {/* 基本信息 */}
          <Section title="基本信息">
            <DetailRow label="问题编号" value={issue.issueNo} mono />
            <DetailRow label="问题类型" value={issue.type} />
            <DetailRow label="严重程度" value={issue.severityLabel} badge={issue.severity} />
            <DetailRow label="涉及数据" value={issue.relatedData} />
            <DetailRow label="影响排放量" value={`${issue.impactEmission} ${issue.impactUnit}`} highlight />
            <DetailRow label="责任部门" value={issue.department} />
            <DetailRow label="责任人" value={issue.responsible} />
            <DetailRow label="发现时间" value={issue.foundTime} />
            <DetailRow label="整改截止" value={issue.deadline} />
            <DetailRow label="当前状态" value={issue.statusLabel} badge={issue.status} />
          </Section>

          {/* 详情 */}
          {issue.detail && (
            <>
              <Section title="异常原因">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{issue.detail.abnormalReason}</p>
              </Section>
              <Section title="原始数据">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 font-mono">{issue.detail.originalData}</p>
              </Section>
              <Section title="整改说明">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{issue.detail.rectificationNote}</p>
              </Section>
              <Section title="补充凭证">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{issue.detail.supplementaryVoucher}</p>
              </Section>
              <Section title="重新计算结果">
                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 font-mono">{issue.detail.recalculatedResult}</p>
              </Section>
              {issue.detail.auditOpinion && (
                <Section title="审核意见">
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">{issue.detail.auditOpinion}</p>
                </Section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-2">
        <div className="w-1 h-3 bg-blue-500 rounded-full" />
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({
  label, value, mono, highlight, icon, badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded hover:bg-slate-50">
      <span className="text-xs text-slate-500 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <span className={`text-xs ${highlight ? "font-semibold text-blue-700" : "text-slate-700"} ${mono ? "font-mono" : ""}`}>
        {value}
        {badge && (
          <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
            badge === "critical" ? "bg-red-100 text-red-700" :
            badge === "major" ? "bg-amber-100 text-amber-700" :
            badge === "closed" ? "bg-emerald-100 text-emerald-700" :
            badge === "overdue" ? "bg-red-100 text-red-700" :
            "bg-slate-100 text-slate-600"
          }`}>
            {value}
          </span>
        )}
      </span>
    </div>
  );
}

// ==================== 主页面 ====================

export default function CompliancePage() {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [selectedNode, setSelectedNode] = useState<MrvNodeData | null>(null);
  const [traceDrawerOpen, setTraceDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<RectificationIssue | null>(null);
  const [issueDrawerOpen, setIssueDrawerOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  // Filters state
  const [orgType, setOrgType] = useState("学校");
  const [orgName, setOrgName] = useState("北京市某高校");
  const [campus, setCampus] = useState("主校区");
  const [year, setYear] = useState("2026");
  const [month, setMonth] = useState("6月");
  const [emissionScope, setEmissionScope] = useState("范围二");
  const [energyType, setEnergyType] = useState("电力");
  const [dataStatus, setDataStatus] = useState("");
  const [auditStatus, setAuditStatus] = useState("");

  const handleNodeClick = (node: MrvNodeData) => {
    setSelectedNode(node);
    setTraceDrawerOpen(true);
  };

  const handleIssueClick = (issue: RectificationIssue) => {
    setSelectedIssue(issue);
    setIssueDrawerOpen(true);
  };

  const handleVoucherClick = (v: VoucherItem) => {
    setSelectedVoucher(v);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6 space-y-4 max-w-[1440px] mx-auto">
        {/* ===== 顶部标题栏 ===== */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">合规凭证看板</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              MRV管理体系 · 监测 Measurement / 报告 Reporting / 核查 Verification
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <FileCheck className="w-3.5 h-3.5" />
              生成合规报告
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
              <Package className="w-3.5 h-3.5" />
              导出证据包
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet-700 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors">
              <ClipboardCheck className="w-3.5 h-3.5" />
              发起审核
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Lock className="w-3.5 h-3.5" />
              锁定核算版本
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              上传凭证
            </button>
          </div>
        </div>

        {/* ===== 筛选条件 ===== */}
        <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <FilterLabel label="机构类型">
              <select value={orgType} onChange={(e) => setOrgType(e.target.value)} className="filter-select">
                {filterOptions.orgTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </FilterLabel>
            <FilterLabel label="机构名称">
              <select value={orgName} onChange={(e) => setOrgName(e.target.value)} className="filter-select">
                {filterOptions.orgNames.map((n) => <option key={n}>{n}</option>)}
              </select>
            </FilterLabel>
            <FilterLabel label="院区">
              <select value={campus} onChange={(e) => setCampus(e.target.value)} className="filter-select">
                {filterOptions.campuses.map((c) => <option key={c}>{c}</option>)}
              </select>
            </FilterLabel>
            <FilterLabel label="核算年度">
              <select value={year} onChange={(e) => setYear(e.target.value)} className="filter-select">
                {filterOptions.years.map((y) => <option key={y}>{y}</option>)}
              </select>
            </FilterLabel>
            <FilterLabel label="核算月份">
              <select value={month} onChange={(e) => setMonth(e.target.value)} className="filter-select">
                {filterOptions.months.map((m) => <option key={m}>{m}</option>)}
              </select>
            </FilterLabel>
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              <Filter className="w-3.5 h-3.5" />
              {showMoreFilters ? "收起筛选" : "更多筛选"}
              {showMoreFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 ml-auto">
              <RefreshCw className="w-3.5 h-3.5" />
              重置
            </button>
          </div>
          {showMoreFilters && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 flex-wrap">
              <FilterLabel label="排放范围">
                <select value={emissionScope} onChange={(e) => setEmissionScope(e.target.value)} className="filter-select">
                  {filterOptions.emissionScopes.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FilterLabel>
              <FilterLabel label="能源品种">
                <select value={energyType} onChange={(e) => setEnergyType(e.target.value)} className="filter-select">
                  {filterOptions.energyTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FilterLabel>
              <FilterLabel label="数据状态">
                <select value={dataStatus} onChange={(e) => setDataStatus(e.target.value)} className="filter-select">
                  <option value="">全部</option>
                  {filterOptions.dataStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FilterLabel>
              <FilterLabel label="审核状态">
                <select value={auditStatus} onChange={(e) => setAuditStatus(e.target.value)} className="filter-select">
                  <option value="">全部</option>
                  {filterOptions.auditStatuses.map((s) => <option key={s}>{s}</option>)}
                </select>
              </FilterLabel>
            </div>
          )}
        </div>

        {/* ===== 8个核心指标卡 ===== */}
        <div className="grid grid-cols-8 gap-3">
          {kpiCards.map((card) => (
            <KpiCard key={card.id} data={card} onClick={() => {}} />
          ))}
        </div>

        {/* ===== 中部：MRV溯源链路（全宽） ===== */}
        <MrvTraceChain nodes={mrvNodes} onNodeClick={handleNodeClick} selectedNodeId={selectedNode?.id ?? null} />

        {/* ===== 中部下方：数据质量分析（左）+ 凭证管理中心（右）===== */}
        <div className="grid grid-cols-2 gap-4">
          <QualityAnalysis />
          <RectificationPanel onIssueClick={handleIssueClick} />
        </div>

        {/* ===== 下部：凭证管理中心（全宽）===== */}
        <VoucherCenter onVoucherClick={handleVoucherClick} />

        {/* ===== 底部水印 ===== */}
        <div className="text-center text-[11px] text-slate-400/80 py-2">
          Demo 模拟数据，不用于申报
        </div>
      </div>

      {/* ===== 抽屉 ===== */}
      {traceDrawerOpen && (
        <TraceDetailDrawer detail={traceDetail} onClose={() => setTraceDrawerOpen(false)} />
      )}
      {issueDrawerOpen && selectedIssue && (
        <IssueDetailDrawer issue={selectedIssue} onClose={() => setIssueDrawerOpen(false)} />
      )}

      {/* Inline styles for filter selects */}
      <style jsx global>{`
        .filter-select {
          padding: 4px 8px;
          font-size: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: white;
          color: #334155;
          outline: none;
          cursor: pointer;
          min-width: 100px;
        }
        .filter-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59,130,246,0.1);
        }
      `}</style>
    </div>
  );
}

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">{label}</span>
      {children}
    </div>
  );
}
