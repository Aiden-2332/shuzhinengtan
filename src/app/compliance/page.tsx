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

// ==================== 状态颜色映射（深色主题适配） ====================

const nodeStatusColors: Record<string, string> = {
  completed: "bg-emerald-500",
  pending: "bg-amber-500",
  reviewing: "bg-violet-500",
  abnormal: "bg-red-500",
  locked: "bg-slate-500",
};

const nodeStatusBg: Record<string, string> = {
  completed: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  pending: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  reviewing: "bg-violet-500/10 border-violet-500/30 text-violet-300",
  abnormal: "bg-red-500/10 border-red-500/30 text-red-300",
  locked: "bg-slate-500/10 border-slate-500/30 text-slate-400",
};

const auditStatusColors: Record<string, string> = {
  passed: "bg-emerald-500/15 text-emerald-300",
  pending: "bg-amber-500/15 text-amber-300",
  rejected: "bg-red-500/15 text-red-300",
  expired: "bg-red-500/20 text-red-400",
};

const severityColors: Record<string, string> = {
  critical: "bg-red-500/15 text-red-300 border-red-500/30",
  major: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  minor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

const issueStatusColors: Record<string, string> = {
  unassigned: "bg-slate-500/15 text-slate-400",
  processing: "bg-blue-500/15 text-blue-300",
  reviewing: "bg-violet-500/15 text-violet-300",
  closed: "bg-emerald-500/15 text-emerald-300",
  overdue: "bg-red-500/15 text-red-300",
};

const completenessColors: Record<string, string> = {
  complete: "bg-emerald-500/15 text-emerald-300",
  partial: "bg-amber-500/15 text-amber-300",
  missing: "bg-red-500/15 text-red-300",
};

// ==================== 子组件 ====================

function KpiCard({ data, onClick }: { data: KpiCardData; onClick: () => void }) {
  const isPositive = data.change > 0;
  const changeColor = data.status === "danger"
    ? "text-red-400"
    : data.status === "warning"
      ? (isPositive ? "text-red-400" : "text-emerald-400")
      : isPositive ? "text-emerald-400" : "text-red-400";

  const statusBadgeColor = data.status === "danger"
    ? "bg-red-500/15 text-red-300"
    : data.status === "warning"
      ? "bg-amber-500/15 text-amber-300"
      : data.status === "info"
        ? "bg-blue-500/15 text-blue-300"
        : "bg-emerald-500/15 text-emerald-300";

  return (
    <button
      onClick={onClick}
      className="bg-white/5 border border-white/10 rounded-lg p-4 text-left hover:border-white/20 hover:bg-white/[0.07] transition-all w-full"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-white/50 font-medium">{data.label}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusBadgeColor}`}>
          {data.statusLabel}
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-white">{data.value}</span>
        <span className="text-sm text-white/40">{data.unit}</span>
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
        <Link2 className="w-4 h-4 text-[#3488ff]" />
        MRV 溯源链路
        <span className="text-xs text-white/40 font-normal">排放源 → 审核确认</span>
      </h3>
      <div className="flex items-start gap-0 overflow-x-auto pb-2">
        {nodes.map((node, idx) => (
          <div key={node.id} className="flex items-start shrink-0">
            <button
              onClick={() => onNodeClick(node)}
              className={`relative w-[120px] rounded-lg border p-3 text-left transition-all ${
                selectedNodeId === node.id
                  ? "border-[#3488ff] bg-[#3488ff]/10 shadow-lg shadow-[#3488ff]/10"
                  : nodeStatusBg[node.status] || "bg-white/5 border-white/10"
              } hover:shadow-lg`}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-2 h-2 rounded-full ${nodeStatusColors[node.status] || "bg-slate-400"}`} />
                <span className="text-[11px] font-semibold text-white/80 leading-tight">{node.name}</span>
              </div>
              <div className="text-[10px] text-white/50 space-y-0.5">
                <div className="flex justify-between">
                  <span>数据</span>
                  <span className="font-medium text-white/70">{node.dataCount}条</span>
                </div>
                <div className="flex justify-between">
                  <span>完整率</span>
                  <span className={`font-medium ${node.completeness >= 95 ? "text-emerald-400" : node.completeness >= 90 ? "text-amber-400" : "text-red-400"}`}>
                    {node.completeness}%
                  </span>
                </div>
                {node.abnormalCount > 0 && (
                  <div className="flex justify-between">
                    <span>异常</span>
                    <span className="font-medium text-red-400">{node.abnormalCount}条</span>
                  </div>
                )}
              </div>
              <div className="mt-1.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  node.status === "completed" ? "bg-emerald-500/15 text-emerald-300" :
                  node.status === "abnormal" ? "bg-red-500/15 text-red-300" :
                  node.status === "reviewing" ? "bg-violet-500/15 text-violet-300" :
                  node.status === "locked" ? "bg-slate-500/20 text-slate-400" :
                  "bg-amber-500/15 text-amber-300"
                }`}>
                  {node.statusLabel}
                </span>
              </div>
            </button>
            {idx < nodes.length - 1 && (
              <div className="flex items-center pt-6 px-0.5">
                <ArrowRight className="w-4 h-4 text-white/20 shrink-0" />
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
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-4 flex items-center gap-2">
        <Gauge className="w-4 h-4 text-[#3488ff]" />
        数据质量分析
      </h3>

      {/* Score ring */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius} fill="none"
              stroke="#3488ff" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{overallScore}</span>
            <span className="text-xs text-white/50">综合评分</span>
          </div>
        </div>
        <div className="flex-1 space-y-2.5">
          {qualityDimensions.map((dim) => (
            <div key={dim.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">{dim.name}</span>
                <span className="text-white/80 font-medium">{dim.score}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    dim.score >= 95 ? "bg-emerald-500" : dim.score >= 90 ? "bg-[#3488ff]" : dim.score >= 80 ? "bg-amber-500" : "bg-red-500"
                  }`}
                  style={{ width: `${dim.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality issues */}
      <div>
        <h4 className="text-xs font-semibold text-white/70 mb-2">质量问题分布</h4>
        <div className="space-y-1.5">
          {qualityIssues.map((issue) => (
            <div key={issue.type} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  issue.severity === "high" ? "bg-red-500" : issue.severity === "medium" ? "bg-amber-500" : "bg-blue-500"
                }`} />
                <span className="text-white/60">{issue.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                  issue.severity === "high" ? "bg-red-500/15 text-red-300" : issue.severity === "medium" ? "bg-amber-500/15 text-amber-300" : "bg-blue-500/15 text-blue-300"
                }`}>
                  {issue.severityLabel}
                </span>
                <span className="text-white/50">{issue.count}条</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VoucherCenter() {
  const [activeTab, setActiveTab] = useState(voucherCategories[0]);

  const filteredItems = useMemo(
    () => voucherItems.filter((v) => v.category === activeTab),
    [activeTab]
  );

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    voucherCategories.forEach((cat) => {
      counts[cat] = voucherItems.filter((v) => v.category === cat).length;
    });
    return counts;
  }, []);

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-[#3488ff]" />
        凭证管理中心
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {voucherCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === cat
                ? "bg-[#3488ff]/20 text-[#3488ff] border border-[#3488ff]/30"
                : "text-white/50 hover:text-white/70 bg-white/5 border border-transparent"
            }`}
          >
            {cat}
            <span className="ml-1 opacity-60">({tabCounts[cat] || 0})</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-2 text-white/40 font-medium">凭证名称</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">类型</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">对应数据项</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">院区</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">建筑/系统</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">周期</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">编号</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">上传人</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">有效期</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">审核</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">完整性</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">版本</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="py-2.5 px-2 text-white/80">{item.name}</td>
                <td className="py-2.5 px-2 text-white/50">{item.type}</td>
                <td className="py-2.5 px-2 text-white/60">{item.dataItem}</td>
                <td className="py-2.5 px-2 text-white/50">{item.campus}</td>
                <td className="py-2.5 px-2 text-white/50">{item.building}</td>
                <td className="py-2.5 px-2 text-white/50">{item.period}</td>
                <td className="py-2.5 px-2 text-white/40 font-mono text-[10px]">{item.voucherNo}</td>
                <td className="py-2.5 px-2 text-white/50">{item.uploader}</td>
                <td className="py-2.5 px-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    item.expired ? "bg-red-500/15 text-red-300" :
                    item.expiringSoon ? "bg-amber-500/15 text-amber-300" :
                    "text-white/50"
                  }`}>
                    {item.validUntil}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${auditStatusColors[item.auditStatus] || ""}`}>
                    {item.auditStatusLabel}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${completenessColors[item.completeness] || ""}`}>
                    {item.completenessLabel}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-white/40 font-mono">{item.dataVersion}</td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70" title="预览"><Eye className="w-3 h-3" /></button>
                    <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70" title="下载"><Download className="w-3 h-3" /></button>
                    <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70" title="更多"><MoreHorizontal className="w-3 h-3" /></button>
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

function RectificationPanel({
  onIssueClick,
}: {
  onIssueClick: (issue: RectificationIssue) => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        异常整改闭环
      </h3>

      {/* Flow indicator */}
      <div className="flex items-center gap-1 mb-4 text-[10px] text-white/40 overflow-x-auto pb-1">
        {["系统识别异常", "生成问题工单", "分派责任人", "补充数据/凭证", "重新计算", "审核确认", "问题关闭"].map((step, i) => (
          <div key={step} className="flex items-center gap-1 shrink-0">
            <span className={`px-1.5 py-0.5 rounded ${
              i <= 2 ? "bg-[#3488ff]/15 text-[#3488ff]" : "bg-white/5 text-white/40"
            }`}>{step}</span>
            {i < 6 && <ArrowRight className="w-3 h-3" />}
          </div>
        ))}
      </div>

      {/* Issues table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-2 text-white/40 font-medium">编号</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">类型</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">严重程度</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">涉及数据</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">影响排放量</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">责任人</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">发现时间</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">整改截止</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">状态</th>
              <th className="text-left py-2 px-2 text-white/40 font-medium">进度</th>
            </tr>
          </thead>
          <tbody>
            {rectificationIssues.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => onIssueClick(issue)}
                className="border-b border-white/5 hover:bg-white/[0.03] cursor-pointer"
              >
                <td className="py-2.5 px-2 text-[#3488ff] font-mono text-[10px]">{issue.id}</td>
                <td className="py-2.5 px-2 text-white/70">{issue.type}</td>
                <td className="py-2.5 px-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${severityColors[issue.severity] || ""}`}>
                    {issue.severityLabel}
                  </span>
                </td>
                <td className="py-2.5 px-2 text-white/60">{issue.relatedData}</td>
                <td className="py-2.5 px-2 text-red-400 font-medium">{issue.impactEmission}{issue.impactUnit}</td>
                <td className="py-2.5 px-2 text-white/50">{issue.responsible}</td>
                <td className="py-2.5 px-2 text-white/50">{issue.foundTime}</td>
                <td className="py-2.5 px-2 text-white/50">{issue.deadline}</td>
                <td className="py-2.5 px-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${issueStatusColors[issue.status] || ""}`}>
                    {issue.statusLabel}
                  </span>
                </td>
                <td className="py-2.5 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${issue.progress >= 100 ? "bg-emerald-500" : "bg-[#3488ff]"}`}
                        style={{ width: `${issue.progress}%` }}
                      />
                    </div>
                    <span className="text-white/40">{issue.progress}%</span>
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
  data,
  onClose,
}: {
  data: TraceDetailData;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[560px] bg-[#0a1628] border-l border-white/10 h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-semibold text-white">溯源详情</h3>
            <p className="text-xs text-white/50 mt-0.5">{data.emissionSource} · {data.building}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* 排放源信息 */}
          <Section title="排放源信息">
            <Field label="所属校区/院区" value={data.campus} />
            <Field label="所属建筑" value={data.building} />
            <Field label="排放源类型" value={data.emissionSource} />
          </Section>

          {/* 计量设备 */}
          <Section title="计量设备">
            <Field label="电表编号" value={data.meterId} />
            <Field label="数据采集时间" value={data.collectTime} />
            <Field label="原始电表读数" value={String(data.rawReading)} />
            <Field label="月度电量" value={`${data.monthlyConsumption} ${data.unit}`} />
          </Section>

          {/* 凭证信息 */}
          <Section title="原始凭证">
            <Field label="电费发票" value={data.invoiceNo} />
            <Field label="电力结算单" value={data.settlementNo} />
            <Field label="是否存在转供电" value={data.hasTransferPower ? "是" : "否"} />
            <Field label="数据修正记录" value={data.dataCorrection || "无"} />
          </Section>

          {/* 排放因子 */}
          <Section title="排放因子">
            <Field label="电力排放因子" value={String(data.emissionFactor)} />
            <Field label="排放因子来源" value={data.factorSource} />
            <Field label="排放因子年份/版本" value={`${data.factorYear} / ${data.factorVersion}`} />
          </Section>

          {/* 计算与结果 */}
          <Section title="计算与结果">
            <Field label="计算公式" value={data.formula} />
            <Field label="计算结果" value={`${data.result} ${data.resultUnit}`} />
          </Section>

          {/* 审核与版本 */}
          <Section title="审核与版本">
            <Field label="填报人" value={data.reporter} />
            <Field label="复核人" value={data.reviewer} />
            <Field label="审批人" value={data.approver} />
            <Field label="当前数据版本" value={data.dataVersion} />
          </Section>

          {/* 版本历史 */}
          <Section title="版本历史">
            <div className="space-y-2">
              {data.versions.map((vh) => (
                <div key={vh.version} className="bg-white/5 rounded-lg p-3 border border-white/5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-white/80">{vh.version}</span>
                    <span className="text-[10px] text-white/40">{vh.modifyTime}</span>
                  </div>
                  <div className="text-[11px] text-white/50 space-y-0.5">
                    <div>修改前: {vh.beforeValue}</div>
                    <div>修改后: {vh.afterValue}</div>
                    <div>原因: {vh.reason}</div>
                    <div>修改人: {vh.modifier} | 审核人: {vh.reviewer}</div>
                    <div>对碳排放影响: <span className={vh.impact.includes("增加") ? "text-red-400" : "text-emerald-400"}>{vh.impact}</span></div>
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
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[560px] bg-[#0a1628] border-l border-white/10 h-full overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#0a1628] border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-base font-semibold text-white">问题详情</h3>
            <p className="text-xs text-white/50 mt-0.5">{issue.id} · {issue.type}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white/80">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <Section title="基本信息">
            <Field label="问题编号" value={issue.issueNo} />
            <Field label="问题类型" value={issue.type} />
            <Field label="严重程度" value={issue.severityLabel} />
            <Field label="涉及数据" value={issue.relatedData} />
            <Field label="影响排放量" value={`${issue.impactEmission} ${issue.impactUnit}`} />
            <Field label="责任部门" value={issue.department} />
            <Field label="责任人" value={issue.responsible} />
            <Field label="发现时间" value={issue.foundTime} />
            <Field label="整改截止时间" value={issue.deadline} />
            <Field label="当前状态" value={issue.statusLabel} />
          </Section>

          <Section title="整改流程">
            <div className="space-y-2">
              {["系统识别异常", "生成问题工单", "分派责任人员", "补充数据或凭证", "重新计算", "审核确认", "问题关闭"].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i <= 2 ? "bg-[#3488ff] text-white" : "bg-white/10 text-white/40"
                  }`}>
                    {i <= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span className={`text-xs ${i <= 2 ? "text-white/80" : "text-white/40"}`}>{step}</span>
                  {i <= 2 && <span className="text-[10px] text-white/30 ml-auto">已完成</span>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="异常原因">
            <p className="text-xs text-white/60 bg-white/5 rounded-lg p-3">
              {issue.detail?.abnormalReason || "电表数据采集异常，导致6月15日至6月18日期间数据缺失，需人工补录并核实。"}
            </p>
          </Section>

          <Section title="整改说明">
            <p className="text-xs text-white/60 bg-white/5 rounded-lg p-3">
              {issue.detail?.rectificationNote || "已联系后勤能源管理科进行现场核查，确认电表通讯模块故障，已更换并补录缺失数据。"}
            </p>
          </Section>

          <Section title="补充凭证">
            <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#3488ff]" />
                <span className="text-xs text-white/70">电表维修记录单_20260618.pdf</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70"><Eye className="w-3 h-3" /></button>
                <button className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white/70"><Download className="w-3 h-3" /></button>
              </div>
            </div>
          </Section>

          <Section title="重新计算结果">
            <div className="bg-white/5 rounded-lg p-3 text-xs text-white/60">
              <div>修正前排放量: 72.35 tCO₂</div>
              <div>修正后排放量: 73.18 tCO₂</div>
              <div className="text-red-400">差异: +0.83 tCO₂ (+1.15%)</div>
            </div>
          </Section>

          <Section title="审核意见">
            <div className="bg-white/5 rounded-lg p-3 text-xs text-white/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white/70 font-medium">审核人: 张工</span>
                <span className="text-white/40">2026-07-02</span>
              </div>
              <p>数据修正合理，凭证齐全，同意关闭此问题。</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// ==================== 辅助组件 ====================

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-[#3488ff] mb-2 uppercase tracking-wide">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-white/5">
      <span className="text-xs text-white/50">{label}</span>
      <span className="text-xs text-white/80 font-medium text-right max-w-[280px]">{value}</span>
    </div>
  );
}

// ==================== 主页面 ====================

export default function CompliancePage() {
  const [expandedFilter, setExpandedFilter] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [traceDrawerData, setTraceDrawerData] = useState<TraceDetailData | null>(null);
  const [issueDrawerData, setIssueDrawerData] = useState<RectificationIssue | null>(null);

  // Filters state
  const [filters, setFilters] = useState({
    orgType: "school",
    orgName: "北京市某高校",
    campus: "主校区",
    year: "2026",
    month: "6",
    scope: "all",
    energyType: "all",
    dataStatus: "all",
    auditStatus: "all",
  });

  const handleNodeClick = (node: MrvNodeData) => {
    setSelectedNodeId(node.id);
    setTraceDrawerData(traceDetail);
  };

  const handleIssueClick = (issue: RectificationIssue) => {
    setIssueDrawerData(issue);
  };

  return (
    <div className="space-y-4">
      {/* ===== 顶部标题栏 + 功能按钮 ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">合规凭证看板</h1>
          <p className="text-xs text-white/40 mt-0.5">MRV 监测·报告·核查 | 数据可追溯 · 过程可复现 · 结果可核查 · 责任可落实</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton icon={<FileCheck className="w-3.5 h-3.5" />} label="生成合规报告" variant="primary" />
          <ActionButton icon={<Package className="w-3.5 h-3.5" />} label="导出证据包" variant="default" />
          <ActionButton icon={<ClipboardCheck className="w-3.5 h-3.5" />} label="发起审核" variant="default" />
          <ActionButton icon={<Lock className="w-3.5 h-3.5" />} label="锁定核算版本" variant="default" />
          <ActionButton icon={<Upload className="w-3.5 h-3.5" />} label="上传凭证" variant="default" />
        </div>
      </div>

      {/* ===== 筛选条件 ===== */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* 机构类型 */}
          <FilterSelect
            value={filters.orgType === "school" ? "学校" : "医院"}
            options={filterOptions.orgTypes}
            onChange={(v) => setFilters({ ...filters, orgType: v === "学校" ? "school" : "hospital" })}
          />
          {/* 机构名称 */}
          <FilterSelect
            value={filters.orgName}
            options={filterOptions.orgNames}
            onChange={(v) => setFilters({ ...filters, orgName: v })}
          />
          {/* 院区 */}
          <FilterSelect
            value={filters.campus}
            options={filterOptions.campuses}
            onChange={(v) => setFilters({ ...filters, campus: v })}
          />
          {/* 核算年度 */}
          <FilterSelect
            value={`${filters.year}年`}
            options={filterOptions.years}
            onChange={(v) => setFilters({ ...filters, year: v.replace("年", "") })}
          />
          {/* 核算月份 */}
          <FilterSelect
            value={`${filters.month}月`}
            options={filterOptions.months}
            onChange={(v) => setFilters({ ...filters, month: v.replace("月", "") })}
          />

          <button
            onClick={() => setExpandedFilter(!expandedFilter)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:text-white/80 hover:bg-white/10 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            更多筛选
            {expandedFilter ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/50 text-xs hover:text-white/70 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            重置
          </button>
        </div>

        {expandedFilter && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
            <FilterSelect
              value={filters.scope === "all" ? "全部范围" : filters.scope}
              options={filterOptions.emissionScopes}
              onChange={(v) => setFilters({ ...filters, scope: v })}
            />
            <FilterSelect
              value={filters.energyType === "all" ? "全部能源品种" : filters.energyType}
              options={filterOptions.energyTypes}
              onChange={(v) => setFilters({ ...filters, energyType: v })}
            />
            <FilterSelect
              value={filters.dataStatus === "all" ? "全部数据状态" : filters.dataStatus}
              options={filterOptions.dataStatuses}
              onChange={(v) => setFilters({ ...filters, dataStatus: v })}
            />
            <FilterSelect
              value={filters.auditStatus === "all" ? "全部审核状态" : filters.auditStatus}
              options={filterOptions.auditStatuses}
              onChange={(v) => setFilters({ ...filters, auditStatus: v })}
            />
          </div>
        )}
      </div>

      {/* ===== 8个核心指标卡 ===== */}
      <div className="grid grid-cols-4 gap-3">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} data={card} onClick={() => {}} />
        ))}
      </div>

      {/* ===== 中部：MRV溯源链路（左）+ 数据质量分析（右） ===== */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <MrvTraceChain
            nodes={mrvNodes}
            onNodeClick={handleNodeClick}
            selectedNodeId={selectedNodeId}
          />
        </div>
        <div className="col-span-1">
          <QualityAnalysis />
        </div>
      </div>

      {/* ===== 下部：凭证管理中心（左）+ 异常整改闭环（右） ===== */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <VoucherCenter />
        </div>
        <div className="col-span-1">
          <RectificationPanel onIssueClick={handleIssueClick} />
        </div>
      </div>

      {/* ===== 底部水印 ===== */}
      <div className="text-center text-[11px] text-white/20 pb-2">
        Demo 模拟数据，不用于申报
      </div>

      {/* ===== 抽屉 ===== */}
      {traceDrawerData && (
        <TraceDetailDrawer
          data={traceDrawerData}
          onClose={() => { setTraceDrawerData(null); setSelectedNodeId(null); }}
        />
      )}
      {issueDrawerData && (
        <IssueDetailDrawer
          issue={issueDrawerData}
          onClose={() => setIssueDrawerData(null)}
        />
      )}
    </div>
  );
}

// ==================== 小型辅助组件 ====================

function ActionButton({
  icon,
  label,
  variant,
}: {
  icon: React.ReactNode;
  label: string;
  variant: "primary" | "default";
}) {
  return (
    <button
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        variant === "primary"
          ? "bg-[#3488ff] text-white hover:bg-[#3488ff]/90"
          : "bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white/90"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function FilterSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/80 text-xs focus:outline-none focus:border-[#3488ff]/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#0a1628] text-white">
          {opt}
        </option>
      ))}
    </select>
  );
}
