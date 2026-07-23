"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Link2,
  FileCheck,
  Cpu,
  Calculator,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronRight,
  Download,
  Upload,
  FileText,
  Lock,
  Send,
  Search,
  Filter,
  X,
  Eye,
  History,
  Paperclip,
  ArrowRight,
  Circle,
  AlertCircle,
  Check,
  RotateCw,
  ExternalLink,
  MoreHorizontal,
} from "lucide-react";
import {
  KPI_CARDS,
  MRV_NODES,
  TRACE_DETAIL_SAMPLE,
  QUALITY_DIMENSIONS,
  QUALITY_ISSUES,
  VOUCHER_TABS,
  VOUCHERS,
  RECTIFICATION_ISSUES,
  DATA_VERSIONS,
  FILTER_OPTIONS,
  type KpiCardData,
  type MrvNode,
  type TraceDetail,
  type VoucherItem,
  type RectificationIssue,
  type DataVersion,
  type SeverityLevel,
} from "@/data/compliance-mock";

// ── 工具函数 ────────────────────────────────────────────────

const severityStyles: Record<SeverityLevel, { bg: string; text: string; dot: string }> = {
  info: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  critical: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const nodeStatusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  completed: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  pending: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: <Clock className="w-3.5 h-3.5" /> },
  reviewing: { bg: "bg-purple-50 border-purple-200", text: "text-purple-700", icon: <Search className="w-3.5 h-3.5" /> },
  locked: { bg: "bg-slate-100 border-slate-200", text: "text-slate-500", icon: <Lock className="w-3.5 h-3.5" /> },
  exception: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

const kpiIconMap: Record<string, React.ReactNode> = {
  "shield-check": <ShieldCheck className="w-5 h-5" />,
  link: <Link2 className="w-5 h-5" />,
  "file-check": <FileCheck className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  calculator: <Calculator className="w-5 h-5" />,
  clock: <Clock className="w-5 h-5" />,
  "alert-triangle": <AlertTriangle className="w-5 h-5" />,
  "check-circle": <CheckCircle2 className="w-5 h-5" />,
};

// ── 子组件 ──────────────────────────────────────────────────

function KpiCard({ data }: { data: KpiCardData }) {
  const statusColor =
    data.status === "good"
      ? "text-emerald-600"
      : data.status === "warning"
        ? "text-amber-600"
        : data.status === "danger"
          ? "text-red-600"
          : "text-slate-600";

  const statusBg =
    data.status === "good"
      ? "bg-emerald-50"
      : data.status === "warning"
        ? "bg-amber-50"
        : data.status === "danger"
          ? "bg-red-50"
          : "bg-slate-50";

  const statusLabel =
    data.status === "good" ? "良好" : data.status === "warning" ? "关注" : data.status === "danger" ? "异常" : "正常";

  const isPositive = data.status === "good" || (data.status === "normal" && data.change > 0);
  const isNegative = data.status === "danger" || (data.status === "warning" && data.change > 0 && data.id === "pending-audit");

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{data.label}</span>
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusBg} ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
          {data.value}
        </span>
        <span className="text-sm text-slate-400">{data.unit}</span>
      </div>
      <div className="flex items-center gap-1 text-xs">
        {data.change > 0 ? (
          <TrendingUp className={`w-3 h-3 ${isNegative ? "text-red-500" : "text-emerald-500"}`} />
        ) : data.change < 0 ? (
          <TrendingDown className={`w-3 h-3 ${isPositive ? "text-emerald-500" : "text-red-500"}`} />
        ) : null}
        <span className={`${data.change > 0 ? (isNegative ? "text-red-500" : "text-emerald-500") : data.change < 0 ? (isPositive ? "text-emerald-500" : "text-red-500") : "text-slate-400"}`}>
          {data.change > 0 ? "+" : ""}{data.change}{data.unit === "分" ? "" : data.unit}
        </span>
        <span className="text-slate-400 ml-0.5">{data.changeLabel}</span>
      </div>
    </div>
  );
}

function MrvTraceChain({
  nodes,
  onNodeClick,
  selectedNodeId,
}: {
  nodes: MrvNode[];
  onNodeClick: (node: MrvNode) => void;
  selectedNodeId: string | null;
}) {
  return (
    <div className="relative">
      {/* 横向链路 */}
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {nodes.map((node, idx) => {
          const config = nodeStatusConfig[node.status] || nodeStatusConfig.pending;
          const isSelected = selectedNodeId === node.id;
          return (
            <div key={node.id} className="flex items-start shrink-0">
              {/* 节点卡片 */}
              <button
                onClick={() => onNodeClick(node)}
                className={`relative flex flex-col items-center w-[100px] p-2.5 rounded-lg border transition-all cursor-pointer
                  ${isSelected ? "border-blue-400 bg-blue-50 shadow-sm ring-1 ring-blue-200" : `${config.bg} hover:shadow-sm hover:border-slate-300`}
                `}
              >
                <span className={`text-[10px] font-medium mb-1 ${config.text}`}>{node.name}</span>
                <span className={`inline-flex items-center gap-1 text-[10px] ${config.text}`}>
                  {config.icon}
                  {node.status === "completed" ? "已完成" : node.status === "pending" ? "待补充" : node.status === "reviewing" ? "待审核" : node.status === "exception" ? "异常" : "已锁定"}
                </span>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                  <span>{node.dataCount}条</span>
                  <span>{node.completeness}%</span>
                </div>
                {node.anomalyCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-medium">
                    {node.anomalyCount}
                  </span>
                )}
              </button>
              {/* 连接线 */}
              {idx < nodes.length - 1 && (
                <div className="flex items-center pt-6 px-0.5">
                  <div className="w-6 h-px bg-slate-300 relative">
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[4px] border-l-slate-400" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QualityBar({ dim }: { dim: { name: string; score: number; maxScore: number; label: string } }) {
  const pct = (dim.score / dim.maxScore) * 100;
  const color = pct >= 90 ? "bg-emerald-500" : pct >= 80 ? "bg-blue-500" : pct >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-16 shrink-0">{dim.name}</span>
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono font-medium text-slate-700 w-8 text-right">{dim.score}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded ${pct >= 90 ? "bg-emerald-50 text-emerald-600" : pct >= 80 ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
        {dim.label}
      </span>
    </div>
  );
}

function VoucherTable({ vouchers }: { vouchers: VoucherItem[] }) {
  const auditStatusLabel: Record<string, { text: string; cls: string }> = {
    passed: { text: "已通过", cls: "bg-emerald-50 text-emerald-700" },
    pending: { text: "待审核", cls: "bg-amber-50 text-amber-700" },
    rejected: { text: "已驳回", cls: "bg-red-50 text-red-700" },
    in_progress: { text: "审核中", cls: "bg-purple-50 text-purple-700" },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-2.5 font-medium text-slate-500">凭证名称</th>
            <th className="text-left p-2.5 font-medium text-slate-500">类型</th>
            <th className="text-left p-2.5 font-medium text-slate-500">对应数据项</th>
            <th className="text-left p-2.5 font-medium text-slate-500">院区</th>
            <th className="text-left p-2.5 font-medium text-slate-500">建筑</th>
            <th className="text-left p-2.5 font-medium text-slate-500">周期</th>
            <th className="text-left p-2.5 font-medium text-slate-500">编号</th>
            <th className="text-left p-2.5 font-medium text-slate-500">上传人</th>
            <th className="text-left p-2.5 font-medium text-slate-500">有效期</th>
            <th className="text-left p-2.5 font-medium text-slate-500">审核</th>
            <th className="text-left p-2.5 font-medium text-slate-500">完整性</th>
            <th className="text-left p-2.5 font-medium text-slate-500">版本</th>
            <th className="text-left p-2.5 font-medium text-slate-500">操作</th>
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => {
            const audit = auditStatusLabel[v.auditStatus] || auditStatusLabel.pending;
            return (
              <tr key={v.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${v.isExpired ? "bg-red-50/30" : v.isExpiring ? "bg-amber-50/30" : ""}`}>
                <td className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    {v.isExpired && <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />}
                    {v.isExpiring && !v.isExpired && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
                    <span className={`font-medium truncate max-w-[160px] ${v.isExpired ? "text-red-600" : "text-slate-700"}`}>{v.name}</span>
                  </div>
                </td>
                <td className="p-2.5 text-slate-500">{v.type}</td>
                <td className="p-2.5 text-slate-600 max-w-[140px] truncate">{v.dataItem}</td>
                <td className="p-2.5 text-slate-500">{v.campus}</td>
                <td className="p-2.5 text-slate-500">{v.building}</td>
                <td className="p-2.5 text-slate-500">{v.period}</td>
                <td className="p-2.5 text-slate-500 font-mono text-[10px]">{v.voucherNo}</td>
                <td className="p-2.5 text-slate-500">{v.uploader}</td>
                <td className="p-2.5">
                  <span className={`${v.isExpired ? "text-red-600 font-medium" : v.isExpiring ? "text-amber-600 font-medium" : "text-slate-500"}`}>
                    {v.validUntil}
                  </span>
                </td>
                <td className="p-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${audit.cls}`}>{audit.text}</span>
                </td>
                <td className="p-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    v.completeness === "complete" ? "bg-emerald-50 text-emerald-700" :
                    v.completeness === "partial" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                  }`}>
                    {v.completeness === "complete" ? "完整" : v.completeness === "partial" ? "部分" : "缺失"}
                  </span>
                </td>
                <td className="p-2.5 text-slate-500 font-mono text-[10px]">{v.version}</td>
                <td className="p-2.5">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="预览"><Eye className="w-3 h-3" /></button>
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="下载"><Download className="w-3 h-3" /></button>
                    <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600" title="更多"><MoreHorizontal className="w-3 h-3" /></button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RectificationTable({ issues, onIssueClick }: { issues: RectificationIssue[]; onIssueClick: (issue: RectificationIssue) => void }) {
  const statusConfig: Record<string, { text: string; cls: string }> = {
    unassigned: { text: "待分派", cls: "bg-slate-100 text-slate-600" },
    processing: { text: "处理中", cls: "bg-blue-50 text-blue-700" },
    pending_review: { text: "待复核", cls: "bg-purple-50 text-purple-700" },
    closed: { text: "已关闭", cls: "bg-emerald-50 text-emerald-700" },
    overdue: { text: "已逾期", cls: "bg-red-50 text-red-700" },
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-2.5 font-medium text-slate-500">编号</th>
            <th className="text-left p-2.5 font-medium text-slate-500">问题类型</th>
            <th className="text-left p-2.5 font-medium text-slate-500">严重程度</th>
            <th className="text-left p-2.5 font-medium text-slate-500">涉及数据</th>
            <th className="text-left p-2.5 font-medium text-slate-500">影响排放量</th>
            <th className="text-left p-2.5 font-medium text-slate-500">责任人</th>
            <th className="text-left p-2.5 font-medium text-slate-500">发现时间</th>
            <th className="text-left p-2.5 font-medium text-slate-500">整改截止</th>
            <th className="text-left p-2.5 font-medium text-slate-500">状态</th>
            <th className="text-left p-2.5 font-medium text-slate-500">进度</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => {
            const sev = severityStyles[issue.severity];
            const st = statusConfig[issue.status] || statusConfig.unassigned;
            return (
              <tr
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="border-b border-slate-100 hover:bg-slate-50/50 cursor-pointer"
              >
                <td className="p-2.5 font-mono text-[10px] text-blue-600">{issue.id}</td>
                <td className="p-2.5 text-slate-700">{issue.type}</td>
                <td className="p-2.5">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${sev.bg} ${sev.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                    {issue.severity === "critical" ? "严重" : issue.severity === "warning" ? "一般" : "提示"}
                  </span>
                </td>
                <td className="p-2.5 text-slate-600 max-w-[160px] truncate">{issue.relatedData}</td>
                <td className="p-2.5 font-mono text-slate-700">{issue.impactEmission} {issue.impactUnit}</td>
                <td className="p-2.5 text-slate-600">{issue.responsible}</td>
                <td className="p-2.5 text-slate-500">{issue.foundTime}</td>
                <td className="p-2.5">
                  <span className={issue.status === "overdue" ? "text-red-600 font-medium" : "text-slate-500"}>
                    {issue.deadline}
                  </span>
                </td>
                <td className="p-2.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${st.cls}`}>{st.text}</span>
                </td>
                <td className="p-2.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${issue.status === "closed" ? "bg-emerald-500" : issue.status === "overdue" ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${issue.progress}%` }}
                      />
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">{issue.progress}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TraceDetailDrawer({
  detail,
  onClose,
}: {
  detail: TraceDetail;
  onClose: () => void;
}) {
  const fields = [
    { label: "排放源", value: detail.emissionSource },
    { label: "所属校区/院区", value: detail.campus },
    { label: "所属建筑", value: detail.building },
    { label: "电表编号", value: detail.meterId, mono: true },
    { label: "数据采集时间", value: detail.collectTime, mono: true },
    { label: "原始电表读数", value: detail.rawReading, mono: true },
    { label: "月度电量", value: detail.monthlyUsage, highlight: true },
    { label: "电费发票", value: detail.invoiceNo, mono: true },
    { label: "电力结算单", value: detail.settlementNo, mono: true },
    { label: "是否存在转供电", value: detail.hasTransferPower ? "是" : "否" },
    { label: "数据修正记录", value: detail.dataCorrection },
    { label: "电力排放因子", value: detail.emissionFactor, highlight: true },
    { label: "排放因子来源", value: detail.factorSource },
    { label: "排放因子年份/版本", value: detail.factorYear },
    { label: "计算公式", value: detail.formula, mono: true },
    { label: "计算结果", value: detail.result, highlight: true },
    { label: "填报人", value: detail.reporter },
    { label: "复核人", value: detail.reviewer },
    { label: "审批人", value: detail.approver },
    { label: "当前数据版本", value: detail.version, mono: true },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end"
      >
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="relative w-[520px] bg-white shadow-xl overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-base font-semibold text-slate-900">溯源详情</h3>
              <p className="text-xs text-slate-500 mt-0.5">{detail.emissionSource} · {detail.campus} · {detail.building}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-1">
            {fields.map((f, i) => (
              <div key={i} className="flex items-start py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-400 w-36 shrink-0">{f.label}</span>
                <span className={`text-xs flex-1 ${f.highlight ? "font-semibold text-slate-900" : "text-slate-700"} ${f.mono ? "font-mono text-[11px]" : ""}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>

          {/* Version History */}
          <div className="border-t border-slate-200 px-6 py-4">
            <h4 className="text-sm font-medium text-slate-800 mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-400" />
              版本历史
            </h4>
            <div className="space-y-2">
              {DATA_VERSIONS.filter((v) => v.dataItem.includes("教学楼A座")).map((ver) => (
                <div key={ver.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-xs font-mono font-medium text-blue-600 shrink-0">{ver.version}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 truncate">{ver.reason}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ver.modifier} · {ver.modifyTime}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-medium ${ver.emissionImpact.startsWith("-") ? "text-emerald-600" : "text-red-600"}`}>
                    {ver.emissionImpact}
                  </span>
                  {ver.isLocked && <Lock className="w-3 h-3 text-slate-400" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function IssueDetailDrawer({
  issue,
  onClose,
}: {
  issue: RectificationIssue;
  onClose: () => void;
}) {
  if (!issue.detail) {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={onClose} />
          <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-[520px] bg-white shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-base font-semibold text-slate-900">问题详情</h3>
                <p className="text-xs text-slate-500 mt-0.5">{issue.id} · {issue.type}</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-12 text-center text-slate-400 text-sm">该问题暂无详细整改记录</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  const d = issue.detail;
  const detailFields = [
    { label: "异常原因", value: d.reason },
    { label: "原始数据", value: d.originalData, mono: true },
    { label: "整改说明", value: d.fixDescription },
    { label: "补充凭证", value: d.supplementaryVoucher },
    { label: "重新计算结果", value: d.recalcResult, highlight: true },
    { label: "审核意见", value: d.auditOpinion },
  ];

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex justify-end">
        <div className="absolute inset-0 bg-black/20" onClick={onClose} />
        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="relative w-[520px] bg-white shadow-xl overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-base font-semibold text-slate-900">问题详情</h3>
              <p className="text-xs text-slate-500 mt-0.5">{issue.id} · {issue.type} · {issue.severity === "critical" ? "严重" : "一般"}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          {/* 整改流程 */}
          <div className="px-6 py-4 border-b border-slate-100">
            <h4 className="text-xs font-medium text-slate-500 mb-3">整改流程</h4>
            <div className="flex items-center gap-1 text-[10px]">
              {["识别异常", "生成工单", "分派人员", "补充数据", "重新计算", "审核确认", "问题关闭"].map((step, i) => {
                const stepIdx = issue.status === "closed" ? 7 : issue.status === "pending_review" ? 6 : issue.status === "processing" ? 4 : issue.status === "unassigned" ? 2 : 1;
                const done = i < stepIdx;
                const current = i === stepIdx - 1;
                return (
                  <div key={step} className="flex items-center gap-1">
                    <div className={`flex flex-col items-center ${done ? "text-emerald-600" : current ? "text-blue-600" : "text-slate-300"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium ${done ? "bg-emerald-100" : current ? "bg-blue-100" : "bg-slate-100"}`}>
                        {done ? <Check className="w-2.5 h-2.5" /> : i + 1}
                      </div>
                      <span className="mt-0.5 whitespace-nowrap">{step}</span>
                    </div>
                    {i < 6 && <div className={`w-4 h-px mt-[-8px] ${done ? "bg-emerald-300" : "bg-slate-200"}`} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 详情字段 */}
          <div className="px-6 py-4 space-y-1">
            {detailFields.map((f, i) => (
              <div key={i} className="flex items-start py-2.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-400 w-28 shrink-0">{f.label}</span>
                <span className={`text-xs flex-1 ${f.highlight ? "font-semibold text-slate-900" : "text-slate-700"} ${f.mono ? "font-mono text-[11px]" : ""}`}>
                  {f.value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── 主页面组件 ──────────────────────────────────────────────

export default function CompliancePage() {
  // 筛选状态
  const [filters, setFilters] = useState({
    orgType: "学校",
    orgName: "北京科技大学",
    campus: "主校区",
    year: "2026",
    month: "6月",
    scope: "",
    energyType: "",
    dataStatus: "",
    auditStatus: "",
  });

  // 展开的筛选面板
  const [showFilters, setShowFilters] = useState(false);

  // MRV 选中节点
  const [selectedMrvNode, setSelectedMrvNode] = useState<MrvNode | null>(null);
  const [traceDetail, setTraceDetail] = useState<TraceDetail | null>(null);

  // 凭证页签
  const [voucherTab, setVoucherTab] = useState("metering");

  // 问题详情
  const [selectedIssue, setSelectedIssue] = useState<RectificationIssue | null>(null);

  const filteredVouchers = useMemo(() => {
    if (voucherTab === "metering") return VOUCHERS.filter((v) => v.type === "计量凭证");
    if (voucherTab === "invoice") return VOUCHERS.filter((v) => v.type === "发票与结算单");
    if (voucherTab === "contract") return VOUCHERS.filter((v) => v.type === "合同与基础资料");
    if (voucherTab === "certificate") return VOUCHERS.filter((v) => v.type === "计量检定证书");
    if (voucherTab === "basis") return VOUCHERS.filter((v) => v.type === "核算依据");
    if (voucherTab === "audit") return VOUCHERS.filter((v) => v.type === "审核与报告材料");
    return VOUCHERS;
  }, [voucherTab]);

  const handleMrvNodeClick = useCallback((node: MrvNode) => {
    setSelectedMrvNode(node);
    // 模拟：点击排放结果节点时展示溯源详情
    if (node.id === "emission-result" || node.id === "activity-data") {
      setTraceDetail(TRACE_DETAIL_SAMPLE);
    }
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length - 5; // 减去默认5个

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── 顶部标题栏 ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">合规凭证看板</h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">MRV管理体系</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <FileText className="w-3.5 h-3.5" />
              生成合规报告
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              导出证据包
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
              <Send className="w-3.5 h-3.5" />
              发起审核
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Lock className="w-3.5 h-3.5" />
              锁定核算版本
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="w-3.5 h-3.5" />
              上传凭证
            </button>
          </div>
        </div>

        {/* 筛选条件 */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <select
            value={filters.orgType}
            onChange={(e) => setFilters((f) => ({ ...f, orgType: e.target.value }))}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
          >
            {FILTER_OPTIONS.orgTypes.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <select
            value={filters.orgName}
            onChange={(e) => setFilters((f) => ({ ...f, orgName: e.target.value }))}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
          >
            {FILTER_OPTIONS.orgNames.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
          <select
            value={filters.campus}
            onChange={(e) => setFilters((f) => ({ ...f, campus: e.target.value }))}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
          >
            {FILTER_OPTIONS.campuses.map((c) => (<option key={c} value={c}>{c}</option>))}
          </select>
          <select
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
          >
            {FILTER_OPTIONS.years.map((y) => (<option key={y} value={y}>{y}</option>))}
          </select>
          <select
            value={filters.month}
            onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
            className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
          >
            {FILTER_OPTIONS.months.map((m) => (<option key={m} value={m}>{m}</option>))}
          </select>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${showFilters ? "bg-blue-50 border-blue-300 text-blue-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <Filter className="w-3 h-3" />
            更多筛选
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-500 text-white text-[9px] flex items-center justify-center">{activeFilterCount}</span>
            )}
            <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* 展开更多筛选 */}
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 flex-wrap">
            <select
              value={filters.scope}
              onChange={(e) => setFilters((f) => ({ ...f, scope: e.target.value }))}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
            >
              <option value="">排放范围</option>
              {FILTER_OPTIONS.scopes.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <select
              value={filters.energyType}
              onChange={(e) => setFilters((f) => ({ ...f, energyType: e.target.value }))}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
            >
              <option value="">能源品种</option>
              {FILTER_OPTIONS.energyTypes.map((et) => (<option key={et} value={et}>{et}</option>))}
            </select>
            <select
              value={filters.dataStatus}
              onChange={(e) => setFilters((f) => ({ ...f, dataStatus: e.target.value }))}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
            >
              <option value="">数据状态</option>
              {FILTER_OPTIONS.dataStatuses.map((ds) => (<option key={ds} value={ds}>{ds}</option>))}
            </select>
            <select
              value={filters.auditStatus}
              onChange={(e) => setFilters((f) => ({ ...f, auditStatus: e.target.value }))}
              className="text-xs border border-slate-200 rounded-md px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:border-blue-300"
            >
              <option value="">审核状态</option>
              {FILTER_OPTIONS.auditStatuses.map((as) => (<option key={as} value={as}>{as}</option>))}
            </select>
          </motion.div>
        )}
      </div>

      {/* ── 主体内容 ── */}
      <div className="px-6 py-4 space-y-4">
        {/* 8 个核心指标卡 */}
        <div className="grid grid-cols-4 gap-3">
          {KPI_CARDS.map((kpi) => (
            <KpiCard key={kpi.id} data={kpi} />
          ))}
        </div>

        {/* 中部：MRV溯源链路 + 数据质量分析 */}
        <div className="grid grid-cols-3 gap-4">
          {/* MRV 溯源链路 - 占 2/3 */}
          <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-500" />
                MRV 溯源链路
              </h2>
              <span className="text-[10px] text-slate-400">监测 → 报告 → 核查 全链条追溯</span>
            </div>
            <MrvTraceChain nodes={MRV_NODES} onNodeClick={handleMrvNodeClick} selectedNodeId={selectedMrvNode?.id || null} />
            {/* 节点说明 */}
            {selectedMrvNode && (
              <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-blue-700">{selectedMrvNode.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${nodeStatusConfig[selectedMrvNode.status]?.bg} ${nodeStatusConfig[selectedMrvNode.status]?.text}`}>
                    {selectedMrvNode.status === "completed" ? "已完成" : selectedMrvNode.status === "pending" ? "待补充" : selectedMrvNode.status === "reviewing" ? "待审核" : selectedMrvNode.status === "exception" ? "存在异常" : "已锁定"}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{selectedMrvNode.description}</p>
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-slate-400">
                  <span>数据数量：{selectedMrvNode.dataCount} 条</span>
                  <span>完整率：{selectedMrvNode.completeness}%</span>
                  {selectedMrvNode.anomalyCount > 0 && <span className="text-red-500">异常：{selectedMrvNode.anomalyCount} 条</span>}
                </div>
              </motion.div>
            )}
          </div>

          {/* 数据质量分析 - 占 1/3 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h2 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              数据质量综合评分
            </h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(92 / 100) * 213.6} 213.6`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-slate-900 font-mono">92</span>
                  <span className="text-[10px] text-slate-400">分</span>
                </div>
              </div>
            </div>
            <div className="space-y-2.5">
              {QUALITY_DIMENSIONS.map((dim) => (
                <QualityBar key={dim.name} dim={dim} />
              ))}
            </div>

            {/* 质量问题分布 */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-medium text-slate-600 mb-2">质量问题分布</h3>
              <div className="space-y-1.5">
                {QUALITY_ISSUES.map((issue) => {
                  const sev = severityStyles[issue.severity];
                  return (
                    <div key={issue.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                        <span className="text-slate-600">{issue.type}</span>
                      </div>
                      <span className={`font-mono font-medium ${issue.severity === "critical" ? "text-red-600" : issue.severity === "warning" ? "text-amber-600" : "text-slate-500"}`}>
                        {issue.count}条
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 下部：凭证管理中心 + 异常整改闭环 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 凭证管理中心 */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 pt-4 pb-0">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-500" />
                凭证管理中心
              </h2>
            </div>
            {/* 页签 */}
            <div className="flex items-center gap-0 px-4 mt-3 border-b border-slate-200 overflow-x-auto">
              {VOUCHER_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVoucherTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    voucherTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span className="ml-1.5 text-[10px] text-slate-400">({tab.count})</span>
                </button>
              ))}
            </div>
            <div className="p-2">
              <VoucherTable vouchers={filteredVouchers} />
            </div>
          </div>

          {/* 异常整改闭环 */}
          <div className="bg-white rounded-lg border border-slate-200">
            <div className="px-4 pt-4 pb-0 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                异常问题与整改任务
              </h2>
              <span className="text-[10px] text-slate-400">共 {RECTIFICATION_ISSUES.length} 条</span>
            </div>
            <div className="p-2">
              <RectificationTable issues={RECTIFICATION_ISSUES} onIssueClick={setSelectedIssue} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 抽屉 ── */}
      {traceDetail && (
        <TraceDetailDrawer detail={traceDetail} onClose={() => { setTraceDetail(null); setSelectedMrvNode(null); }} />
      )}
      {selectedIssue && (
        <IssueDetailDrawer issue={selectedIssue} onClose={() => setSelectedIssue(null)} />
      )}
    </div>
  );
}
