"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Upload, Search, Gauge, Archive, Bell, Package,
  GraduationCap, Building2, Leaf, ChevronDown, ChevronUp,
  X, Eye, Download, RotateCcw, Link2, AlertTriangle, CheckCircle2,
  Clock, FileText, ShieldCheck, TrendingUp, TrendingDown,
  Filter, RefreshCw, Circle, ChevronLeft,
  History, User, Calendar, Hash, MapPin, Zap, FileBarChart,
  Wrench, BookOpen, ClipboardCheck, AlertCircle, Ban, MoreHorizontal,
  FileCheck, Plus, Trash2, ExternalLink, Info,
} from "lucide-react";

import {
  titleTemplates, standardData, scoringResults, alertItems, subModules,
  getKpiTrendCards, getRiskSummary,
  type TitleType, type TitleStandardData, type MaterialItem,
  type Level1Indicator, type EvaluationItem, type ScoringResult,
  type AlertItem, type KpiTrendCard, type RiskSummary,
} from "@/data/compliance-mock";

import {
  getAllMaterials, getMaterialsByTitle, saveMaterial, deleteMaterial,
  generateId, addLog, saveVersion, getVersionsByMaterial,
  getExportRecords, saveExportRecord, deleteExportRecord,
  formatFileSize, getStatusLabel, getStatusColor,
} from "@/lib/compliance-db";
import type { MaterialRecord, FileVersion, ExportRecord } from "@/types/compliance";
import { MaterialUploadDrawer } from "@/components/compliance/material-upload-drawer";
import { FilePreviewDrawer } from "@/components/compliance/file-preview-drawer";
import { VersionDrawer } from "@/components/compliance/version-drawer";
import { ExportConfigModal } from "@/components/compliance/export-config-modal";
import { ConfirmDeleteModal } from "@/components/compliance/confirm-delete-modal";
import { MaterialStatusTag } from "@/components/compliance/material-status-tag";

// ==================== Toast 通知系统 ====================

interface ToastMessage { id: number; text: string; type: "success" | "info" | "warning" | "error"; }
let toastIdCounter = 0;

function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const show = useCallback((text: string, type: ToastMessage["type"] = "info") => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev.slice(-4), { id, text, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);
  return { toasts, show };
}

function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;
  const colors: Record<ToastMessage["type"], string> = {
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    info: "border-blue-500/40 bg-blue-500/10 text-blue-300",
    warning: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
  };
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-2.5 rounded-lg border text-sm shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 ${colors[t.type]}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ==================== 常量 ====================

const titleIcons: Record<TitleType, typeof GraduationCap> = {
  "green-school": GraduationCap,
  "green-campus": Building2,
  "low-carbon-campus": Leaf,
};

const titleColors: Record<TitleType, string> = {
  "green-school": "emerald",
  "green-campus": "teal",
  "low-carbon-campus": "green",
};

const titleColorClasses: Record<TitleType, { bg: string; text: string; border: string; light: string }> = {
  "green-school": { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30", light: "bg-emerald-500/10" },
  "green-campus": { bg: "bg-teal-500", text: "text-teal-400", border: "border-teal-500/30", light: "bg-teal-500/10" },
  "low-carbon-campus": { bg: "bg-green-500", text: "text-green-400", border: "border-green-500/30", light: "bg-green-500/10" },
};

const materialStatusConfig: Record<string, { icon: typeof CheckCircle2; label: string; cls: string }> = {
  uploaded: { icon: CheckCircle2, label: "已上传", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  missing: { icon: AlertCircle, label: "未上传", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  expired: { icon: Ban, label: "已过期", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  expiring: { icon: Clock, label: "即将过期", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const alertSeverityConfig: Record<string, { icon: typeof AlertTriangle; label: string; cls: string }> = {
  expired: { icon: Ban, label: "已过期", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  urgent: { icon: AlertTriangle, label: "即将到期", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  warning: { icon: Clock, label: "年度提醒", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
};

// ==================== 子组件 ====================

function TabButton({ active, onClick, icon: Icon, label, count }: {
  active: boolean; onClick: () => void; icon: typeof Upload; label: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? "bg-white/10 text-white border border-white/15"
          : "text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${active ? "bg-white/15 text-white/80" : "bg-white/5 text-white/40"}`}>
          {count}
        </span>
      )}
    </button>
  );
}

function Badge({ label, cls }: { label: string; cls: string }) {
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>{label}</span>;
}

function ProgressBar({ value, max, colorClass, showLabel }: {
  value: number; max: number; colorClass: string; showLabel?: boolean;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="text-xs text-white/50 w-10 text-right">{pct}%</span>}
    </div>
  );
}

// ==================== 数据总览：第一层 - KPI 趋势卡片 ====================

function Sparkline({ data, color, height }: { data: number[]; color: string; height?: number }) {
  const h = height || 28;
  const w = 80;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
      {data.map((v, i) => (
        <circle key={i} cx={(i / (data.length - 1)) * w} cy={h - ((v - min) / range) * (h - 4) - 2} r="2" fill={color} opacity="0.9" />
      ))}
    </svg>
  );
}

function KpiOverviewCards({ kpiCards, onAction }: { kpiCards: KpiTrendCard[]; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {kpiCards.map((card) => {
        const isRisk = card.status === "risk";
        const isWarning = card.status === "warning";
        const trendUp = card.trend === "up";
        const trendDown = card.trend === "down";
        const trendColor = card.trendPositive
          ? trendUp ? "text-emerald-400" : trendDown ? "text-red-400" : "text-white/40"
          : trendUp ? "text-red-400" : trendDown ? "text-emerald-400" : "text-white/40";
        const sparkColor = card.trendPositive
          ? trendUp ? "#34d399" : trendDown ? "#f87171" : "#94a3b8"
          : trendUp ? "#f87171" : trendDown ? "#34d399" : "#94a3b8";
        const statusBadge = isRisk
          ? { label: "风险", cls: "bg-red-500/15 text-red-400 border-red-500/30" }
          : isWarning
          ? { label: "预警", cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" }
          : { label: "正常", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
        const trendIconEl = trendUp ? <TrendingUp className="w-3 h-3" /> : trendDown ? <TrendingDown className="w-3 h-3" /> : <Circle className="w-3 h-3" />;

        return (
          <div
            key={card.id}
            onClick={() => onAction("viewDetail", { cardId: card.id, cardName: card.name })}
            className={`group relative bg-white/5 border rounded-xl p-4 transition-all duration-200 hover:bg-white/[0.07] cursor-pointer ${
              isRisk ? "border-red-500/20 hover:border-red-500/40 shadow-[0_0_20px_rgba(239,68,68,0.05)]" :
              isWarning ? "border-amber-500/20 hover:border-amber-500/40" :
              "border-white/10 hover:border-white/20"
            }`}
          >
            {/* 顶部：名称 + 状态标签 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50 font-medium">{card.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBadge.cls}`}>
                {statusBadge.label}
              </span>
            </div>

            {/* 中部：当前值 + 迷你趋势图 */}
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-[28px] font-bold text-white leading-none tracking-tight">
                  {card.currentValue}
                  {card.unit && <span className="text-sm text-white/40 ml-0.5 font-normal">{card.unit}</span>}
                </div>
                {card.id === "uploaded" && (
                  <div className="text-xs text-white/30 mt-0.5">
                    上传率 {Math.round(card.currentValue / (kpiCards[0]?.currentValue || 1) * 100)}%
                  </div>
                )}
                {card.id === "required" && (
                  <div className="text-xs text-white/30 mt-0.5">
                    完成率 {Math.round(card.currentValue / Math.max(1, card.currentValue + (kpiCards[3]?.currentValue || 0)) * 100)}%
                  </div>
                )}
              </div>
              <Sparkline data={card.sparklineData} color={sparkColor} />
            </div>

            {/* 底部：环比 + 趋势箭头 + 说明 */}
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-0.5 text-xs font-medium ${trendColor}`}>
                {trendIconEl}
                <span>{card.changeValue > 0 ? "+" : ""}{card.changeValue}</span>
                <span className="text-white/30">({card.changeRate > 0 ? "+" : ""}{card.changeRate}%)</span>
              </div>
              <span className="text-[11px] text-white/25 truncate">{card.description}</span>
            </div>

            {/* 悬停详情浮层 */}
            <div className="absolute inset-x-0 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-slate-800 border border-white/15 rounded-lg p-3 shadow-xl">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-white/40">本期值</span>
                    <div className="text-white font-semibold">{card.currentValue}{card.unit}</div>
                  </div>
                  <div>
                    <span className="text-white/40">上期值</span>
                    <div className="text-white/70">{card.previousValue}{card.unit}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-white/40">环比变化</span>
                    <div className={`font-semibold ${trendColor}`}>
                      {card.changeValue > 0 ? "+" : ""}{card.changeValue}{card.unit} ({card.changeRate > 0 ? "+" : ""}{card.changeRate}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== 数据总览：第二层 - 风险与运营提醒 ====================

function RiskAndReminderBar({ riskSummary, onAction }: { riskSummary: RiskSummary; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const maxCompletion = Math.max(...riskSummary.recentCompletionTrend.map(d => d.count), 1);
  return (
    <div className="grid grid-cols-3 gap-3">
      {/* 风险汇总 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-white">风险汇总</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className={`text-2xl font-bold ${riskSummary.highRiskCount > 0 ? "text-red-400" : "text-white/50"}`}>
              {riskSummary.highRiskCount}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">高风险单位</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${riskSummary.pendingRequiredCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
              {riskSummary.pendingRequiredCount}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">待补强制材料</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${riskSummary.expiringCount > 0 ? "text-amber-400" : "text-white/50"}`}>
              {riskSummary.expiringCount}
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">即将过期材料</div>
          </div>
        </div>
      </div>

      {/* 缺失类型 TOP3 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">缺失最多材料类型 TOP3</span>
        </div>
        <div className="space-y-2">
          {riskSummary.topMissingTypes.map((item, i) => (
            <div key={item.type} className="flex items-center gap-2">
              <span className={`text-xs font-bold w-5 ${i === 0 ? "text-red-400" : i === 1 ? "text-amber-400" : "text-white/50"}`}>
                #{i + 1}
              </span>
              <span className="text-sm text-white/70 flex-1">{item.type}</span>
              <span className="text-xs text-white/40">{item.count}项</span>
              <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${i === 0 ? "bg-red-500/60" : i === 1 ? "bg-amber-500/60" : "bg-white/20"}`}
                  style={{ width: `${Math.min(100, (item.count / Math.max(1, riskSummary.topMissingTypes[0]?.count || 1)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {riskSummary.topMissingTypes.length === 0 && (
            <div className="text-xs text-white/30 py-2">暂无缺失数据</div>
          )}
        </div>
      </div>

      {/* 最近一周补传趋势 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">最近一周补传完成趋势</span>
        </div>
        <div className="flex items-end gap-2 h-16">
          {riskSummary.recentCompletionTrend.map((d) => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-white/60 font-medium">{d.count}</span>
              <div
                className="w-full rounded-t-sm bg-emerald-500/40 transition-all"
                style={{ height: `${Math.max(4, (d.count / maxCompletion) * 48)}px` }}
              />
              <span className="text-[10px] text-white/30">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== 数据总览：第三层 - 行动入口 ====================

// ==================== 子模块 1: 称号材料上传中心 ====================

function UploadCenter({ data, titleType, onAction }: { data: TitleStandardData; titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showPrerequisites, setShowPrerequisites] = useState(true);

  const toggleIndicator = (id: string) => {
    const next = new Set(expandedIndicators);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedIndicators(next);
  };
  const toggleItem = (id: string) => {
    const next = new Set(expandedItems);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedItems(next);
  };

  const allMaterials = useMemo(() => {
    const ms: MaterialItem[] = [...data.prerequisites];
    data.indicators.forEach(ind => ind.items.forEach(it => ms.push(...it.materials)));
    return ms;
  }, [data]);
  const kpiCards = useMemo(() => getKpiTrendCards(data), [data]);
  const riskSummary = useMemo(() => getRiskSummary(data), [data]);
  const tc = titleColorClasses[titleType];

  return (
    <div className="space-y-4">
      {/* ========== 第一层：顶部总览卡片区（4个核心卡片） ========== */}
      <KpiOverviewCards kpiCards={kpiCards} onAction={onAction} />

      {/* ========== 第二层：风险与运营提醒区 ========== */}
      <RiskAndReminderBar riskSummary={riskSummary} onAction={onAction} />

      {/* 准入前置材料 */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowPrerequisites(!showPrerequisites)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className={`w-5 h-5 ${tc.text}`} />
            <div className="text-left">
              <div className="text-sm font-semibold text-white">准入前置材料</div>
              <div className="text-xs text-white/40">未全部上传将禁止进入指标上传与打分</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              label={`${data.prerequisites.filter(m => m.status === "uploaded").length}/${data.prerequisites.length}`}
              cls={data.prerequisites.every(m => m.status === "uploaded") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}
            />
            {showPrerequisites ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </div>
        </button>
        {showPrerequisites && (
          <div className="border-t border-white/5 px-4 py-3 space-y-2">
            {data.prerequisites.map(m => {
              const sc = materialStatusConfig[m.status];
              const Icon = sc.icon;
              return (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <Icon className={`w-4 h-4 ${m.status === "uploaded" ? "text-emerald-400" : "text-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white/80 truncate">{m.name}</span>
                      <Badge label={sc.label} cls={sc.cls} />
                    </div>
                    <div className="text-xs text-white/30 mt-0.5">{m.description}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {m.fileName && <span className="text-xs text-white/40">{m.fileName}</span>}
                    {m.fileSize && <span className="text-xs text-white/30">{m.fileSize}</span>}
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors" title="上传" onClick={() => onAction("upload", {name: m.name, id: m.id})}>
                      <Upload className="w-4 h-4" />
                    </button>
                    {m.status !== "missing" && m.status !== "expired" && m.status !== "expiring" && (
                      <>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-emerald-400 transition-colors" title="预览" onClick={() => onAction("preview", {name: m.name, id: m.id})}>
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400 transition-colors" title="下载" onClick={() => onAction("download", {name: m.name, id: m.id})}>
                          <Download className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 一级指标 */}
      {data.indicators.map(indicator => {
        const isExpanded = expandedIndicators.has(indicator.id);
        const totalMats = indicator.items.reduce((s, it) => s + it.materials.length, 0);
        const uploadedMats = indicator.items.reduce((s, it) => s + it.materials.filter(m => m.status === "uploaded").length, 0);
        return (
          <div key={indicator.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
              onClick={() => toggleIndicator(indicator.id)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg ${tc.light} flex items-center justify-center`}>
                  <span className={`text-sm font-bold ${tc.text}`}>{indicator.weight}%</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold text-white">{indicator.name}</div>
                  <div className="text-xs text-white/40">{indicator.items.length} 个评价分项 · {totalMats} 项材料</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ProgressBar value={uploadedMats} max={totalMats} colorClass={uploadedMats === totalMats ? "bg-emerald-500" : "bg-amber-500"} />
                <span className="text-xs text-white/40 w-10 text-right">{uploadedMats}/{totalMats}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </div>
            </button>
            {isExpanded && (
              <div className="border-t border-white/5 px-4 py-3 space-y-3">
                {indicator.items.map(item => {
                  const itemExpanded = expandedItems.has(item.id);
                  const itemUploaded = item.materials.filter(m => m.status === "uploaded").length;
                  return (
                    <div key={item.id} className="bg-white/[0.02] rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/30 font-mono">{item.code}</span>
                          <span className="text-sm text-white/70">{item.name}</span>
                          <span className="text-xs text-white/30">({item.maxScore}分)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${itemUploaded === item.materials.length ? "text-emerald-400" : "text-amber-400"}`}>
                            {itemUploaded}/{item.materials.length}
                          </span>
                          {itemExpanded ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />}
                        </div>
                      </button>
                      {itemExpanded && (
                        <div className="border-t border-white/5 px-3 py-2 space-y-1.5">
                          <div className="text-xs text-white/40 mb-2">{item.description}</div>
                          {item.materials.map(m => {
                            const sc = materialStatusConfig[m.status];
                            const MIcon = sc.icon;
                            return (
                              <div key={m.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-white/[0.03] transition-colors">
                                <MIcon className={`w-3.5 h-3.5 shrink-0 ${m.status === "uploaded" ? "text-emerald-400" : "text-red-400"}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-white/70 truncate">{m.name}</span>
                                    {m.required ? (
                                      <span className="text-[10px] text-red-400 font-medium">强制</span>
                                    ) : (
                                      <span className="text-[10px] text-white/30">可选</span>
                                    )}
                                    <Badge label={sc.label} cls={sc.cls} />
                                  </div>
                                  {m.fileName && <div className="text-[10px] text-white/30 mt-0.5">{m.fileName} · {m.fileSize}</div>}
                                </div>
                                <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors" title="上传" onClick={() => onAction("upload", {name: m.name, id: m.id})}>
                                  <Upload className="w-3 h-3" />
                                </button>
                                {m.status !== "missing" && m.status !== "expired" && m.status !== "expiring" && (
                                  <>
                                    <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-emerald-400 transition-colors" title="预览" onClick={() => onAction("preview", {name: m.name, id: m.id})}>
                                      <Eye className="w-3 h-3" />
                                    </button>
                                    <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-blue-400 transition-colors" title="下载" onClick={() => onAction("download", {name: m.name, id: m.id})}>
                                      <Download className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==================== 子模块 2: 指标溯源查询 ====================

function TraceEngine({ data, titleType, onAction }: { data: TitleStandardData; titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<EvaluationItem | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<{ material: MaterialItem; item: EvaluationItem } | null>(null);
  const tc = titleColorClasses[titleType];

  const allItems = useMemo(() => {
    const items: { item: EvaluationItem; indicatorName: string }[] = [];
    data.indicators.forEach(ind => ind.items.forEach(it => items.push({ item: it, indicatorName: ind.name })));
    return items;
  }, [data]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;
    const q = searchQuery.toLowerCase();
    return allItems.filter(({ item, indicatorName }) =>
      item.code.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      indicatorName.toLowerCase().includes(q) ||
      item.materials.some(m => m.name.toLowerCase().includes(q))
    );
  }, [allItems, searchQuery]);

  return (
    <div className="flex gap-4 h-[calc(100vh-280px)] min-h-[500px]">
      {/* 左侧：指标列表 */}
      <div className="w-80 shrink-0 flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="搜索指标编号/名称/材料..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredItems.map(({ item, indicatorName }) => {
            const uploaded = item.materials.filter(m => m.status === "uploaded").length;
            const total = item.materials.length;
            const isActive = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left px-3 py-2.5 border-b border-white/5 transition-colors ${
                  isActive ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] text-white/30 font-mono">{item.code}</span>
                  <span className="text-xs text-white/70 truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white/30">{indicatorName}</span>
                  <span className={`text-[10px] ${uploaded === total ? "text-emerald-400" : "text-amber-400"}`}>
                    {uploaded}/{total} 材料
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 右侧：详情 */}
      <div className="flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
        {selectedItem ? (
          <>
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-white/30 font-mono">{selectedItem.code}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${tc.bg}`} />
                <span className="text-sm font-semibold text-white">{selectedItem.name}</span>
              </div>
              <div className="text-xs text-white/40">{selectedItem.description}</div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-white/30">满分 {selectedItem.maxScore} 分</span>
                <span className="text-xs text-white/30">
                  材料 {selectedItem.materials.filter(m => m.status === "uploaded").length}/{selectedItem.materials.length}
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-xs text-white/30 mb-2 font-medium">关联上传材料清单</div>
              {selectedItem.materials.map(m => {
                const sc = materialStatusConfig[m.status];
                const MIcon = sc.icon;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMaterial({ material: m, item: selectedItem })}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-colors border border-white/5"
                  >
                    <MIcon className={`w-4 h-4 shrink-0 ${m.status === "uploaded" ? "text-emerald-400" : "text-red-400"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-white/70">{m.name}</span>
                        {m.required ? (
                          <span className="text-[10px] text-red-400 font-medium">强制</span>
                        ) : (
                          <span className="text-[10px] text-white/30">可选</span>
                        )}
                        <Badge label={sc.label} cls={sc.cls} />
                      </div>
                      <div className="text-xs text-white/30 mt-0.5">{m.description}</div>
                      {m.fileName && (
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-3 h-3 text-white/30" />
                          <span className="text-xs text-white/40">{m.fileName}</span>
                          <span className="text-xs text-white/20">{m.fileSize}</span>
                        </div>
                      )}
                    </div>
                    <Link2 className="w-4 h-4 text-white/20" />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/20">
            <div className="text-center">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <div className="text-sm">选择左侧指标查看溯源详情</div>
              <div className="text-xs mt-1 opacity-60">支持正向溯源（指标→材料）和反向溯源（材料→指标）</div>
            </div>
          </div>
        )}
      </div>

      {/* 材料详情弹窗 */}
      {selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setSelectedMaterial(null)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-[480px] max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">材料详情</h3>
              <button onClick={() => setSelectedMaterial(null)} className="p-1 rounded-lg hover:bg-white/10 text-white/40">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/30 mb-1">材料名称</div>
                <div className="text-sm text-white/80">{selectedMaterial.material.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 mb-1">所属指标</div>
                  <div className="text-sm text-white/70">{selectedMaterial.item.code} {selectedMaterial.item.name}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 mb-1">标准条款</div>
                  <div className="text-sm text-white/70">{data.template.standardCode}</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <div className="text-xs text-white/30 mb-1">材料说明</div>
                <div className="text-sm text-white/60">{selectedMaterial.material.description}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 mb-1">接受格式</div>
                  <div className="text-sm text-white/70">{selectedMaterial.material.acceptedFormats}</div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 mb-1">命名规范</div>
                  <div className="text-sm text-white/70">{selectedMaterial.material.namingRule}</div>
                </div>
              </div>
              {selectedMaterial.material.fileName && (
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-xs text-white/30 mb-1">已上传文件</div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-white/40" />
                    <span className="text-sm text-white/70">{selectedMaterial.material.fileName}</span>
                    <span className="text-xs text-white/30">{selectedMaterial.material.fileSize}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors" onClick={() => onAction("preview", {name: selectedMaterial?.material.name ?? "", id: selectedMaterial?.material.id})}>
                  <Eye className="w-4 h-4" /> 预览
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors" onClick={() => onAction("download", {name: selectedMaterial?.material.name ?? "", id: selectedMaterial?.material.id})}>
                  <Download className="w-4 h-4" /> 下载
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== 子模块 3: 自评打分看板 ====================

function ScoringDashboard({ data, titleType, onAction }: { data: TitleStandardData; titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const result = scoringResults[titleType];
  const tc = titleColorClasses[titleType];
  const pct = Math.round((result.totalScore / result.totalMaxScore) * 100);

  return (
    <div className="space-y-4">
      {/* 总分概览 */}
      <div className="grid grid-cols-4 gap-3">
        <div className="col-span-1 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth="6" />
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="6"
                strokeLinecap="round" strokeDasharray={`${pct * 2.64} 264`}
                className={tc.text.replace("text-", "text-")}
                style={{ color: pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{result.totalScore}</span>
              <span className="text-xs text-white/30">/ {result.totalMaxScore}</span>
            </div>
          </div>
          <div className={`mt-2 px-2 py-0.5 rounded text-xs font-medium ${
            result.grade === "优秀" || result.grade === "先进" || result.grade === "三星" ? "bg-emerald-500/10 text-emerald-400" :
            result.grade === "良好" || result.grade === "二星" ? "bg-blue-500/10 text-blue-400" :
            "bg-amber-500/10 text-amber-400"
          }`}>
            {result.grade}
          </div>
        </div>
        <div className="col-span-3 grid grid-cols-2 gap-3">
          {result.indicatorScores.map(ind => {
            const indPct = Math.round((ind.score / ind.maxScore) * 100);
            return (
              <div key={ind.indicatorId} className="bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">{ind.indicatorName}</span>
                  <span className="text-xs text-white/30">权重 {ind.weight}%</span>
                </div>
                <div className="flex items-end gap-2 mb-1.5">
                  <span className="text-xl font-bold text-white">{ind.score}</span>
                  <span className="text-xs text-white/30 mb-0.5">/ {ind.maxScore} 分</span>
                  <span className={`text-xs ml-auto ${indPct >= 80 ? "text-emerald-400" : indPct >= 60 ? "text-amber-400" : "text-red-400"}`}>
                    {indPct}%
                  </span>
                </div>
                <ProgressBar value={ind.score} max={ind.maxScore} colorClass={indPct >= 80 ? "bg-emerald-500" : indPct >= 60 ? "bg-amber-500" : "bg-red-500"} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 扣分明细 */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-white">缺失材料扣分明细</span>
          </div>
          <span className="text-xs text-white/30">{result.deductions.length} 条记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/30">
                <th className="text-left px-4 py-2 font-medium">条款编号</th>
                <th className="text-left px-4 py-2 font-medium">评价分项</th>
                <th className="text-left px-4 py-2 font-medium">缺失材料</th>
                <th className="text-center px-4 py-2 font-medium">扣分</th>
                <th className="text-left px-4 py-2 font-medium">原因</th>
              </tr>
            </thead>
            <tbody>
              {result.deductions.map((d, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-white/40 font-mono">{d.itemCode}</td>
                  <td className="px-4 py-2.5 text-white/70">{d.itemName}</td>
                  <td className="px-4 py-2.5 text-white/50">{d.materialName}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className={d.deductedScore > 0 ? "text-red-400" : "text-white/30"}>
                      {d.deductedScore > 0 ? `-${d.deductedScore}` : "0"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-white/40">{d.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 达标等级 */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="text-sm font-semibold text-white mb-3">达标等级划分</div>
        <div className="flex gap-2">
          {data.gradeLevels.map(gl => {
            const isCurrent = result.grade === gl.name;
            return (
              <div key={gl.name} className={`flex-1 rounded-lg p-3 text-center border ${
                isCurrent ? `${tc.border} ${tc.light}` : "border-white/5 bg-white/[0.02]"
              }`}>
                <div className={`text-sm font-semibold ${isCurrent ? tc.text : "text-white/50"}`}>{gl.name}</div>
                <div className="text-xs text-white/30 mt-0.5">{gl.minScore}-{gl.maxScore} 分</div>
                {isCurrent && <div className={`text-[10px] ${tc.text} mt-1`}>当前等级</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== 子模块 4: 材料档案库 ====================

function ArchiveLibrary({ data, titleType, onAction }: { data: TitleStandardData; titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterIndicator, setFilterIndicator] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const tc = titleColorClasses[titleType];

  const allMaterials = useMemo(() => {
    const ms: { material: MaterialItem; indicatorName: string; itemCode: string; itemName: string }[] = [];
    data.prerequisites.forEach(m => ms.push({ material: m, indicatorName: "准入前置", itemCode: "准入", itemName: "准入前置材料" }));
    data.indicators.forEach(ind => ind.items.forEach(it =>
      it.materials.forEach(m => ms.push({ material: m, indicatorName: ind.name, itemCode: it.code, itemName: it.name }))
    ));
    return ms;
  }, [data]);

  const filtered = useMemo(() => {
    return allMaterials.filter(({ material, indicatorName, itemCode, itemName }) => {
      if (filterIndicator !== "all" && indicatorName !== filterIndicator) return false;
      if (filterStatus !== "all" && material.status !== filterStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return material.name.toLowerCase().includes(q) || itemName.toLowerCase().includes(q) || itemCode.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allMaterials, filterIndicator, filterStatus, searchQuery]);

  const indicatorNames = useMemo(() => {
    const names = new Set<string>();
    names.add("准入前置");
    data.indicators.forEach(ind => names.add(ind.name));
    return Array.from(names);
  }, [data]);

  return (
    <div className="space-y-3">
      {/* 筛选 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text" placeholder="搜索材料名称/指标..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
          />
        </div>
        <select value={filterIndicator} onChange={e => setFilterIndicator(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70 focus:outline-none">
          <option value="all">全部指标</option>
          {indicatorNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/70 focus:outline-none">
          <option value="all">全部状态</option>
          <option value="uploaded">已上传</option>
          <option value="missing">未上传</option>
          <option value="expired">已过期</option>
        </select>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white/70 text-xs hover:bg-white/15 transition-colors" onClick={() => onAction("exportZip", {})}>
          <Package className="w-3.5 h-3.5" /> 打包导出
        </button>
      </div>

      {/* 列表 */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/30">
                <th className="text-left px-4 py-2.5 font-medium">材料名称</th>
                <th className="text-left px-4 py-2.5 font-medium">所属指标</th>
                <th className="text-left px-4 py-2.5 font-medium">条款编号</th>
                <th className="text-center px-4 py-2.5 font-medium">类型</th>
                <th className="text-center px-4 py-2.5 font-medium">状态</th>
                <th className="text-left px-4 py-2.5 font-medium">文件</th>
                <th className="text-center px-4 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ material, indicatorName, itemCode, itemName }, i) => {
                const sc = materialStatusConfig[material.status];
                const SIcon = sc.icon;
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-white/70">{material.name}</td>
                    <td className="px-4 py-2.5 text-white/50">{indicatorName} · {itemName}</td>
                    <td className="px-4 py-2.5 text-white/30 font-mono">{itemCode}</td>
                    <td className="px-4 py-2.5 text-center">
                      {material.required ? (
                        <span className="text-[10px] text-red-400 font-medium">强制</span>
                      ) : (
                        <span className="text-[10px] text-white/30">可选</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <SIcon className={`w-3 h-3 ${material.status === "uploaded" ? "text-emerald-400" : "text-red-400"}`} />
                        <span className={material.status === "uploaded" ? "text-emerald-400" : "text-red-400"}>{sc.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-white/40">
                      {material.fileName ? `${material.fileName} · ${material.fileSize}` : "-"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-emerald-400" title="预览" onClick={() => onAction("preview", {name: material.name, id: material.id})}><Eye className="w-3 h-3" /></button>
                        <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-blue-400" title="下载" onClick={() => onAction("download", {name: material.name, id: material.id})}><Download className="w-3 h-3" /></button>
                        <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-amber-400" title="替换" onClick={() => onAction("replace", {name: material.name, id: material.id})}><RotateCcw className="w-3 h-3" /></button>
                        <button className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-red-400" title="删除" onClick={() => onAction("delete", {name: material.name, id: material.id})}><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-white/20 text-sm">无匹配结果</div>
        )}
      </div>
    </div>
  );
}

// ==================== 子模块 5: 材料到期预警 ====================

function ExpiryAlerts({ titleType, onAction }: { titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const filtered = alertItems.filter(a => a.titleId === titleType);
  const tc = titleColorClasses[titleType];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "总预警数", value: filtered.length, sub: "" },
          { label: "已过期", value: filtered.filter(a => a.severity === "expired").length, sub: "需立即处理" },
          { label: "即将到期(30天内)", value: filtered.filter(a => a.severity === "urgent").length, sub: "需尽快更新" },
        ].map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3">
            <div className="text-xs text-white/40 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${i === 1 ? "text-red-400" : "text-white"}`}>{s.value}</div>
            {s.sub && <div className="text-xs text-white/30 mt-0.5">{s.sub}</div>}
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/30">
                <th className="text-left px-4 py-2.5 font-medium">材料名称</th>
                <th className="text-left px-4 py-2.5 font-medium">所属指标</th>
                <th className="text-left px-4 py-2.5 font-medium">条款编号</th>
                <th className="text-left px-4 py-2.5 font-medium">到期时间</th>
                <th className="text-center px-4 py-2.5 font-medium">剩余天数</th>
                <th className="text-center px-4 py-2.5 font-medium">严重程度</th>
                <th className="text-center px-4 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const sc = alertSeverityConfig[a.severity];
                const SIcon = sc.icon;
                return (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-white/70">{a.materialName}</td>
                    <td className="px-4 py-2.5 text-white/50">{a.indicatorName}</td>
                    <td className="px-4 py-2.5 text-white/30 font-mono">{a.itemCode}</td>
                    <td className="px-4 py-2.5 text-white/50">{a.expiryDate}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={a.daysRemaining < 0 ? "text-red-400" : a.daysRemaining <= 30 ? "text-amber-400" : "text-white/50"}>
                        {a.daysRemaining < 0 ? `已过期 ${Math.abs(a.daysRemaining)} 天` : `${a.daysRemaining} 天`}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <SIcon className={`w-3 h-3 ${a.severity === "expired" ? "text-red-400" : a.severity === "urgent" ? "text-amber-400" : "text-blue-400"}`} />
                        <span className={a.severity === "expired" ? "text-red-400" : a.severity === "urgent" ? "text-amber-400" : "text-blue-400"}>
                          {sc.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <button className="px-2 py-1 rounded bg-white/10 text-white/60 text-xs hover:bg-white/15 transition-colors" onClick={() => onAction("upload", {name: a.materialName})}>
                        补充材料
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-white/20 text-sm">暂无到期预警</div>
        )}
      </div>
    </div>
  );
}

// ==================== 子模块 6: 导出申报全套资料 ====================

function ExportPackage({ data, titleType, onAction }: { data: TitleStandardData; titleType: TitleType; onAction: (action: string, params?: Record<string, unknown>) => void }) {
  const tc = titleColorClasses[titleType];
  const allMaterials = useMemo(() => {
    const ms: { material: MaterialItem; indicatorName: string }[] = [];
    data.prerequisites.forEach(m => ms.push({ material: m, indicatorName: "准入前置材料" }));
    data.indicators.forEach(ind => ind.items.forEach(it =>
      it.materials.forEach(m => ms.push({ material: m, indicatorName: ind.name }))
    ));
    return ms;
  }, [data]);
  const uploaded = allMaterials.filter(m => m.material.status === "uploaded").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-xl ${tc.light} flex items-center justify-center`}>
              <Package className={`w-5 h-5 ${tc.text}`} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">完整申报归档包</div>
              <div className="text-xs text-white/40">全部上传文件 + 自评打分表 + 材料目录清单</div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs text-white/50 mb-3">
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 机构及核算边界信息</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 准入前置材料（{data.prerequisites.filter(m => m.status === "uploaded").length}/{data.prerequisites.length}）</div>
            {data.indicators.map(ind => (
              <div key={ind.id} className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {ind.name}指标材料（{ind.items.reduce((s, it) => s + it.materials.filter(m => m.status === "uploaded").length, 0)}项）
              </div>
            ))}
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 自评打分表</div>
            <div className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> 材料目录清单</div>
          </div>
          <button className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg ${tc.light} ${tc.text} text-sm font-medium hover:opacity-80 transition-opacity`} onClick={() => onAction("exportZip", {})}>
            <Download className="w-4 h-4" /> 一键导出完整归档包 (ZIP)
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">分指标导出</div>
              <div className="text-xs text-white/40">按需导出单一模块材料</div>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
              <span className="text-xs text-white/60">准入前置材料</span>
              <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={() => onAction("exportPerIndicator", {})}>
                <Download className="w-3 h-3" /> 导出
              </button>
            </div>
            {data.indicators.map(ind => (
              <div key={ind.id} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02]">
                <span className="text-xs text-white/60">{ind.name} ({ind.weight}%)</span>
                <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1" onClick={() => onAction("exportPerIndicator", {})}>
                  <Download className="w-3 h-3" /> 导出
                </button>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 text-white/70 text-sm hover:bg-white/15 transition-colors" onClick={() => onAction("exportPdf", {})}>
            <FileText className="w-4 h-4" /> 导出 PDF 报告
          </button>
        </div>
      </div>

      {/* 导出历史 */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <span className="text-sm font-semibold text-white">导出记录</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/30">
                <th className="text-left px-4 py-2.5 font-medium">导出时间</th>
                <th className="text-left px-4 py-2.5 font-medium">导出类型</th>
                <th className="text-left px-4 py-2.5 font-medium">包含文件数</th>
                <th className="text-left px-4 py-2.5 font-medium">文件大小</th>
                <th className="text-center px-4 py-2.5 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: "2025-07-15 14:30", type: "完整归档包", files: uploaded, size: "45.2 MB" },
                { time: "2025-06-30 09:15", type: "分指标-精神文化", files: 8, size: "12.8 MB" },
                { time: "2025-06-30 09:10", type: "PDF报告", files: 1, size: "3.5 MB" },
              ].map((r, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-white/50">{r.time}</td>
                  <td className="px-4 py-2.5 text-white/70">{r.type}</td>
                  <td className="px-4 py-2.5 text-white/50">{r.files} 个文件</td>
                  <td className="px-4 py-2.5 text-white/50">{r.size}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button className="text-xs text-blue-400 hover:text-blue-300" onClick={() => onAction("download", {name: "历史导出文件"})}>重新下载</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== 主页面 ====================

export default function CompliancePage() {
  const [activeTitle, setActiveTitle] = useState<TitleType>("green-school");
  const [activeModule, setActiveModule] = useState("upload");
  const { toasts, show } = useToast();

  // ==================== 材料状态 ====================
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  // ==================== 抽屉/弹窗状态 ====================
  const [uploadTarget, setUploadTarget] = useState<MaterialRecord | null>(null);
  const [previewTarget, setPreviewTarget] = useState<MaterialRecord | null>(null);
  const [versionTarget, setVersionTarget] = useState<MaterialRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialRecord | null>(null);
  const [exportConfigOpen, setExportConfigOpen] = useState(false);

  // ==================== 加载材料 ====================
  useEffect(() => {
    getMaterialsByTitle(activeTitle).then((ms) => {
      setMaterials(ms);
      setMaterialsLoaded(true);
    });
  }, [activeTitle]);

  const currentData = standardData[activeTitle];
  const currentTemplate = titleTemplates[activeTitle];
  const tc = titleColorClasses[activeTitle];
  const TitleIcon = titleIcons[activeTitle];

  const moduleIcons: Record<string, typeof Upload> = {
    upload: Upload, trace: Search, score: Gauge,
    archive: Archive, alert: Bell, export: Package,
  };

  // ==================== 材料 CRUD 操作 ====================

  /** 合并 DB 材料与 Mock 材料，返回富化的 MaterialItem 列表 */
  const enrichMaterials = useCallback((mockItems: MaterialItem[]): MaterialItem[] => {
    return mockItems.map((m) => {
      const dbRecord = materials.find((r) => r.id === m.id);
      if (dbRecord && dbRecord.status !== "not_uploaded") {
        // 映射 MaterialRecord 状态到 MaterialItem 状态
        const mappedStatus = dbRecord.status === "uploading" || dbRecord.status === "uploaded" || dbRecord.status === "pending_review" || dbRecord.status === "approved" || dbRecord.status === "rejected"
          ? "uploaded" as const
          : dbRecord.status === "expired"
          ? "expired" as const
          : dbRecord.status === "expiring_soon"
          ? "expiring" as const
          : "missing" as const;
        return {
          ...m,
          status: mappedStatus,
          fileName: dbRecord.fileName,
          fileSize: dbRecord.fileSize ? formatFileSize(dbRecord.fileSize) : undefined,
          uploadedAt: dbRecord.uploadedAt,
        };
      }
      return m;
    });
  }, [materials]);

  /** 创建上传目标 MaterialRecord */
  const createUploadRecord = useCallback((mockItem: MaterialItem): MaterialRecord => {
    return {
      id: mockItem.id,
      name: mockItem.name,
      description: mockItem.description || "",
      required: mockItem.required ?? false,
      status: "not_uploaded",
      titleType: activeTitle,
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [activeTitle]);

  /** 上传完成回调 */
  const handleUploadComplete = useCallback(async (record: MaterialRecord) => {
    await saveMaterial(record);
    // 保存版本
    if (record.fileData && record.fileName) {
      await saveVersion({
        id: generateId(),
        materialId: record.id,
        version: record.version || 1,
        fileName: record.fileName,
        fileType: record.fileType || "",
        fileSize: record.fileSize || 0,
        fileData: record.fileData,
        changeNote: "首次上传",
        uploadedBy: record.uploadedBy || "当前用户",
        uploadedAt: record.uploadedAt || new Date().toISOString(),
        isCurrent: true,
      });
    }
    // 添加日志
    await addLog({
      id: generateId(),
      materialId: record.id,
      action: "uploaded",
      description: `上传文件：${record.fileName}`,
      operator: record.uploadedBy || "当前用户",
      operatedAt: new Date().toISOString(),
      version: record.version,
    });
    // 刷新
    const ms = await getMaterialsByTitle(activeTitle);
    setMaterials(ms);
    show(`${record.name} 上传成功`, "success");
  }, [activeTitle, show]);

  /** 下载材料 */
  const handleDownload = useCallback(async (record: MaterialRecord) => {
    if (!record.fileData || !record.fileName) {
      show("文件数据不存在", "error");
      return;
    }
    const blob = new Blob([record.fileData], { type: record.fileType || "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = record.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    show(`${record.fileName} 下载成功`, "success");
    // 添加日志
    await addLog({
      id: generateId(),
      materialId: record.id,
      action: "downloaded",
      description: `下载文件：${record.fileName}`,
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
    });
  }, [show]);

  /** 删除材料 */
  const handleDelete = useCallback(async (record: MaterialRecord) => {
    await deleteMaterial(record.id);
    const ms = await getMaterialsByTitle(activeTitle);
    setMaterials(ms);
    show(`${record.name} 已删除`, "warning");
  }, [activeTitle, show]);

  /** 替换材料 */
  const handleReplace = useCallback((record: MaterialRecord) => {
    // 打开上传抽屉，但标记为替换模式
    const replaceRecord: MaterialRecord = {
      ...record,
      status: "not_uploaded",
      version: (record.version || 0) + 1,
    };
    setUploadTarget(replaceRecord);
  }, []);

  /** 提交审核 */
  const handleSubmitReview = useCallback(async (record: MaterialRecord) => {
    const updated: MaterialRecord = {
      ...record,
      status: "pending_review",
      reviewStatus: "pending",
      updatedAt: new Date().toISOString(),
    };
    await saveMaterial(updated);
    const ms = await getMaterialsByTitle(activeTitle);
    setMaterials(ms);
    await addLog({
      id: generateId(),
      materialId: record.id,
      action: "submitted_review",
      description: "提交审核",
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
    });
    show(`${record.name} 已提交审核`, "info");
  }, [activeTitle, show]);

  /** 查看历史版本 */
  const handleViewVersions = useCallback((record: MaterialRecord) => {
    setVersionTarget(record);
  }, []);

  /** 恢复版本 */
  const handleRestoreVersion = useCallback(async (version: FileVersion) => {
    const record = materials.find((m) => m.id === version.materialId);
    if (!record) return;
    const updated: MaterialRecord = {
      ...record,
      fileName: version.fileName,
      fileType: version.fileType,
      fileSize: version.fileSize,
      fileData: version.fileData,
      version: version.version,
      status: "uploaded",
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveMaterial(updated);
    const ms = await getMaterialsByTitle(activeTitle);
    setMaterials(ms);
    await addLog({
      id: generateId(),
      materialId: record.id,
      action: "version_restored",
      description: `恢复版本 V${version.version}.0：${version.fileName}`,
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
      version: version.version,
    });
    show(`已恢复至 V${version.version}.0`, "success");
  }, [activeTitle, materials, show]);

  /** 导出 ZIP */
  const handleExportZip = useCallback(async (config: { year: string; schoolName: string }) => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      const uploadedMaterials = materials.filter((m) => m.status === "uploaded" || m.status === "approved");

      // 按类别分组
      const prerequisites = uploadedMaterials.filter((m) => m.itemId === undefined);
      const indicatorMaterials = uploadedMaterials.filter((m) => m.itemId !== undefined);

      if (prerequisites.length > 0) {
        const folder = zip.folder("01_准入前置材料");
        for (const m of prerequisites) {
          if (m.fileData && m.fileName) {
            folder?.file(m.fileName, m.fileData);
          }
        }
      }

      if (indicatorMaterials.length > 0) {
        const folder = zip.folder("02_指标材料");
        for (const m of indicatorMaterials) {
          if (m.fileData && m.fileName) {
            folder?.file(m.fileName, m.fileData);
          }
        }
      }

      // 生成材料目录清单
      const catalogContent = uploadedMaterials
        .map((m, i) => `${i + 1}. ${m.name} - ${m.fileName || "未上传"} - ${getStatusLabel(m.status)}`)
        .join("\n");
      zip.file("材料目录清单.txt", catalogContent);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentTemplate.name}_${config.schoolName}_${config.year}年度.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 保存导出记录
      await saveExportRecord({
        id: generateId(),
        exportedAt: new Date().toISOString(),
        exportedBy: "当前用户",
        exportType: currentTemplate.name,
        year: config.year,
        fileCount: uploadedMaterials.length,
        fileSize: String(blob.size),
        status: "completed",
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        titleType: activeTitle,
        schoolName: config.schoolName,
        includeHistory: false,
        includeReview: false,
        includeCatalog: true,
        includeScore: true,
        includeMissing: true,
      });

      show("归档包导出成功", "success");
    } catch {
      show("导出失败，请重试", "error");
    }
  }, [materials, currentTemplate, show]);

  // ==================== 统一操作分发 ====================
  const handleAction = useCallback((action: string, params?: Record<string, unknown>) => {
    const name = String(params?.name ?? params?.type ?? "");
    switch (action) {
      case "viewDetail": show(`查看详情：${params?.cardName ?? ""}`, "info"); break;
      case "view-missing": setActiveModule("upload"); show("已筛选缺失材料", "info"); break;
      case "view-required": setActiveModule("upload"); show("已筛选强制未完成项", "info"); break;
      case "filter-high-risk": setActiveModule("upload"); show("已筛选高风险单位", "info"); break;
      case "go-upload": setActiveModule("upload"); show("已跳转到材料上传中心", "info"); break;
      case "upload": {
        // 从 mock 数据中找到对应材料项
        const mockItem = findMockItem(name, params);
        if (mockItem) {
          const existing = materials.find((m) => m.id === mockItem.id);
          setUploadTarget(existing || createUploadRecord(mockItem));
        } else {
          show("未找到对应材料项", "error");
        }
        break;
      }
      case "preview": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record && record.status !== "not_uploaded") {
          setPreviewTarget(record);
        } else {
          show("该材料尚未上传，无法预览", "warning");
        }
        break;
      }
      case "download": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record && record.fileData) {
          handleDownload(record);
        } else {
          show("该材料尚未上传，无法下载", "warning");
        }
        break;
      }
      case "delete": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record) setDeleteTarget(record);
        break;
      }
      case "replace": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record) handleReplace(record);
        break;
      }
      case "exportZip": setExportConfigOpen(true); break;
      case "exportPerIndicator": setExportConfigOpen(true); break;
      case "submitReview": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record) handleSubmitReview(record);
        break;
      }
      case "viewVersions": {
        const record = materials.find((m) => m.name === name || m.id === params?.id);
        if (record) handleViewVersions(record);
        break;
      }
      default: show(`操作：${action}`, "info");
    }
  }, [show, materials, createUploadRecord, handleDownload, handleReplace, handleSubmitReview, handleViewVersions]);

  /** 从 mock 数据中查找材料项 */
  const findMockItem = (name: string, params?: Record<string, unknown>): MaterialItem | undefined => {
    const allMaterials: MaterialItem[] = [...currentData.prerequisites];
    currentData.indicators.forEach((ind) =>
      ind.items.forEach((it) => allMaterials.push(...it.materials))
    );
    if (params?.id) return allMaterials.find((m) => m.id === params.id);
    return allMaterials.find((m) => m.name === name);
  };

  // 富化当前数据
  const enrichedData = useMemo(() => {
    return {
      ...currentData,
      prerequisites: enrichMaterials(currentData.prerequisites),
      indicators: currentData.indicators.map((ind) => ({
        ...ind,
        items: ind.items.map((it) => ({
          ...it,
          materials: enrichMaterials(it.materials),
        })),
      })),
    };
  }, [currentData, enrichMaterials]);

  return (
    <div className="p-6 space-y-4">
      {/* 页面标题 + 称号切换 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">合规凭证</h1>
          <p className="text-xs text-white/40 mt-0.5">称号申报材料上传 · 指标溯源 · 自评打分 · 档案管理 · 缺失预警</p>
        </div>
        <div className="flex items-center gap-2">
          {(["green-school", "green-campus", "low-carbon-campus"] as TitleType[]).map(tt => {
            const t = titleTemplates[tt];
            const isActive = activeTitle === tt;
            const ttc = titleColorClasses[tt];
            const TI = titleIcons[tt];
            return (
              <button
                key={tt}
                onClick={() => setActiveTitle(tt)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? `${ttc.light} ${ttc.text} ${ttc.border}`
                    : "border-transparent text-white/40 hover:text-white/60 hover:bg-white/5"
                }`}
              >
                <TI className="w-4 h-4" />
                <span>{t.name}</span>
                <span className="text-[10px] opacity-50">{t.standardCode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 当前称号信息条 */}
      <div className={`${tc.light} border ${tc.border} rounded-xl p-3 flex items-center gap-4`}>
        <div className={`w-10 h-10 rounded-xl ${tc.light} flex items-center justify-center`}>
          <TitleIcon className={`w-5 h-5 ${tc.text}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{currentTemplate.standardCode}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${tc.light} ${tc.text}`}>
              {currentTemplate.name}
            </span>
          </div>
          <div className="text-xs text-white/40 mt-0.5">{currentTemplate.description}</div>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/30">
          <span>适用：{currentTemplate.applicableTo}</span>
          <span>|</span>
          <span>总分 {currentData.totalScore} 分</span>
          <span>|</span>
          <span>达标线 {currentData.passScore} 分</span>
        </div>
      </div>

      {/* 子模块标签 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {subModules.map(sm => {
          const MI = moduleIcons[sm.id];
          return (
            <TabButton
              key={sm.id}
              active={activeModule === sm.id}
              onClick={() => setActiveModule(sm.id)}
              icon={MI}
              label={sm.name}
            />
          );
        })}
      </div>

      {/* 子模块内容 */}
      <div className="min-h-[500px]">
        {activeModule === "upload" && <UploadCenter data={enrichedData} titleType={activeTitle} onAction={handleAction} />}
        {activeModule === "trace" && <TraceEngine data={enrichedData} titleType={activeTitle} onAction={handleAction} />}
        {activeModule === "score" && <ScoringDashboard data={enrichedData} titleType={activeTitle} onAction={handleAction} />}
        {activeModule === "archive" && <ArchiveLibrary data={enrichedData} titleType={activeTitle} onAction={handleAction} />}
        {activeModule === "alert" && <ExpiryAlerts titleType={activeTitle} onAction={handleAction} />}
        {activeModule === "export" && <ExportPackage data={enrichedData} titleType={activeTitle} onAction={handleAction} />}
      </div>

      {/* 底部水印 */}
      <div className="text-center text-[11px] text-white/15 py-2">
        Demo 模拟数据，不用于申报
      </div>

      {/* ==================== 抽屉/弹窗 ==================== */}

      {/* 上传抽屉 */}
      {uploadTarget && (
        <MaterialUploadDrawer
          open={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          material={uploadTarget}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* 预览抽屉 */}
      {previewTarget && (
        <FilePreviewDrawer
          open={!!previewTarget}
          onClose={() => setPreviewTarget(null)}
          material={previewTarget}
          onDownload={handleDownload}
          onReplace={handleReplace}
          onDelete={(r) => { setPreviewTarget(null); setDeleteTarget(r); }}
          onViewVersions={handleViewVersions}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* 版本抽屉 */}
      {versionTarget && (
        <VersionDrawer
          open={!!versionTarget}
          onClose={() => setVersionTarget(null)}
          materialId={versionTarget.id}
          onRestore={handleRestoreVersion}
          onPreview={(v) => {
            const record: MaterialRecord = {
              id: v.materialId,
              name: "",
              description: "",
              required: false,
              status: "uploaded",
              titleType: activeTitle,
              fileName: v.fileName,
              fileType: v.fileType,
              fileSize: v.fileSize,
              fileData: v.fileData,
              version: v.version,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setPreviewTarget(record);
          }}
          onDownload={(v) => {
            if (!v.fileData) return;
            const blob = new Blob([v.fileData], { type: v.fileType || "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = v.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            show(`${v.fileName} 下载成功`, "success");
          }}
        />
      )}

      {/* 删除确认 */}
      {deleteTarget && (
        <ConfirmDeleteModal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => { handleDelete(deleteTarget); setDeleteTarget(null); }}
          title="确认删除材料"
          description={`确定要删除材料「${deleteTarget.fileName || deleteTarget.name}」吗？`}
          warning="此操作不可撤销，文件及所有历史版本将被永久删除。"
        />
      )}

      {/* 导出配置 */}
      <ExportConfigModal
        open={exportConfigOpen}
        onClose={() => setExportConfigOpen(false)}
        titleType={activeTitle}
        onExport={handleExportZip}
      />

      {/* Toast 通知 */}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
