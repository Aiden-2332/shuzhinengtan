"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  MapPin,
  MapPinned,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Wrench,
  Zap,
  ThermometerSun,
  WifiOff,
  ArrowUpDown,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { AlarmWorkflowPanel } from "@/components/alarms/alarm-workflow";
import { cn } from "@/lib/utils";
import {
  getAllAlarms,
  CATEGORY_META,
  SEVERITY_META,
  STATUS_META,
  type AlarmDetail,
  type AlarmSeverity,
  type AlarmStatus,
  type AlarmCategory,
} from "@/data/alarm-data";
import { getAlarmAiAnalysisHref } from "@/data/alarm-workflow-data";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import { formatCampusDateTime } from "@/lib/campus-realtime";

// Icon helper
function CategoryIcon({ category, className }: { category: AlarmCategory; className?: string }) {
  const meta = CATEGORY_META[category];
  switch (category) {
    case "energy":
      return <Zap className={cn(className, meta.color)} />;
    case "equipment":
      return <Wrench className={cn(className, meta.color)} />;
    case "environment":
      return <ThermometerSun className={cn(className, meta.color)} />;
    case "data":
      return <WifiOff className={cn(className, meta.color)} />;
  }
}

function SeverityIcon({ severity, className }: { severity: AlarmSeverity; className?: string }) {
  switch (severity) {
    case "danger":
      return <AlertTriangle className={cn(className, "text-red-400")} />;
    case "warning":
      return <AlertCircle className={cn(className, "text-amber-400")} />;
    case "info":
      return <Info className={cn(className, "text-blue-400")} />;
  }
}

export default function AlarmsPage() {
  const nowMs = useRealtimeNow();
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlarmSeverity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<AlarmCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"time" | "severity">("time");
  const lastScrolledAlarmIdRef = useRef<string | null>(null);
  const deepLinkHandledRef = useRef(false);
  const allAlarms = useMemo(() => nowMs === null ? [] : getAllAlarms(new Date(nowMs)), [nowMs]);

  useEffect(() => {
    if (deepLinkHandledRef.current || nowMs === null) return;
    deepLinkHandledRef.current = true;
    const requestedAlarmId = new URLSearchParams(window.location.search).get("alarm");
    const matchedAlarm = requestedAlarmId
      ? allAlarms.find((alarm) => alarm.id === requestedAlarmId)
      : null;
    setExpandedId(matchedAlarm?.id ?? null);

    if (requestedAlarmId && !matchedAlarm) {
      const url = new URL(window.location.href);
      url.searchParams.delete("alarm");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [allAlarms, nowMs]);

  const handleAlarmToggle = useCallback((alarmId: string, isExpanded: boolean) => {
    const nextExpandedId = isExpanded ? null : alarmId;
    setExpandedId(nextExpandedId);
    const url = new URL(window.location.href);
    if (nextExpandedId) {
      url.searchParams.set("alarm", nextExpandedId);
    } else {
      url.searchParams.delete("alarm");
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  useEffect(() => {
    if (!expandedId) {
      lastScrolledAlarmIdRef.current = null;
      return;
    }
    if (
      lastScrolledAlarmIdRef.current === expandedId
      || !allAlarms.some((alarm) => alarm.id === expandedId)
    ) return;

    lastScrolledAlarmIdRef.current = expandedId;
    const frame = window.requestAnimationFrame(() => {
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth";
      document.getElementById(`alarm-${expandedId}`)?.scrollIntoView({ behavior, block: "center" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [allAlarms, expandedId]);

  const filteredAlarms = useMemo(() => {
    const result = allAlarms.filter((alarm) => {
      if (severityFilter !== "all" && alarm.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && alarm.category !== categoryFilter) return false;
      if (statusFilter !== "all" && alarm.status !== statusFilter) return false;
      if (
        searchQuery &&
        !alarm.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alarm.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !alarm.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "time") {
        return new Date(b.time).getTime() - new Date(a.time).getTime();
      }
      // severity: danger > warning > info
      const order: Record<AlarmSeverity, number> = { danger: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });

    return result;
  }, [allAlarms, searchQuery, severityFilter, categoryFilter, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: allAlarms.length,
      pending: allAlarms.filter((a) => a.status === "pending").length,
      processing: allAlarms.filter((a) => a.status === "processing").length,
      danger: allAlarms.filter((a) => a.severity === "danger").length,
      warning: allAlarms.filter((a) => a.severity === "warning").length,
      info: allAlarms.filter((a) => a.severity === "info").length,
    };
  }, [allAlarms]);

  return (
    <div className="min-h-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/10 border border-red-500/30 flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">告警中心</h1>
            <p className="text-sm text-gray-400">全量告警信息、根因分析与处置建议</p>
          </div>
        </div>
        <div className="text-xs text-gray-600">Demo模拟数据 仅课题演示</div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-6 gap-3">
        <div className="bg-slate-900/60 border border-gray-800/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">告警总数</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.danger}</div>
          <div className="text-xs text-gray-500 mt-1">危险</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.warning}</div>
          <div className="text-xs text-gray-500 mt-1">警告</div>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-blue-400">{stats.info}</div>
          <div className="text-xs text-gray-500 mt-1">提示</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.pending}</div>
          <div className="text-xs text-gray-500 mt-1">待处理</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.processing}</div>
          <div className="text-xs text-gray-500 mt-1">处理中</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索告警标题、描述、位置..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-gray-800/50 rounded-lg text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-500/40 transition-colors"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-500" />
          {(["all", "danger", "warning", "info"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                severityFilter === s
                  ? s === "all"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : cn(SEVERITY_META[s].bgColor, SEVERITY_META[s].borderColor, SEVERITY_META[s].color)
                  : "bg-slate-900/40 border-gray-800/50 text-gray-500 hover:text-gray-300"
              )}
            >
              {s === "all" ? "全部等级" : SEVERITY_META[s].label}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          {(["all", "energy", "equipment", "environment", "data"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5",
                categoryFilter === c
                  ? c === "all"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : cn(CATEGORY_META[c].bgColor, "border-gray-700/50", CATEGORY_META[c].color)
                  : "bg-slate-900/40 border-gray-800/50 text-gray-500 hover:text-gray-300"
              )}
            >
              {c !== "all" && <CategoryIcon category={c} className="w-3 h-3" />}
              {c === "all" ? "全部分类" : CATEGORY_META[c].label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          {(["all", "pending", "processing", "resolved", "closed"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                statusFilter === s
                  ? s === "all"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-400"
                    : cn(STATUS_META[s].bgColor, "border-gray-700/50", STATUS_META[s].color)
                  : "bg-slate-900/40 border-gray-800/50 text-gray-500 hover:text-gray-300"
              )}
            >
              {s === "all" ? "全部状态" : STATUS_META[s].label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <button
          onClick={() => setSortBy(sortBy === "time" ? "severity" : "time")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-900/40 border-gray-800/50 text-gray-400 hover:text-gray-300 transition-all"
        >
          <ArrowUpDown className="w-3 h-3" />
          {sortBy === "time" ? "按时间" : "按等级"}
        </button>
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-500">
        共 {filteredAlarms.length} 条告警
      </div>

      {/* Alarm List */}
      <div className="space-y-3">
        {filteredAlarms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-500/30" />
            <span className="text-sm">暂无匹配的告警记录</span>
          </div>
        ) : (
          filteredAlarms.map((alarm) => {
            const isExpanded = expandedId === alarm.id;
            return <AlarmCard key={alarm.id} alarm={alarm} nowMs={nowMs ?? 0} isExpanded={isExpanded} onToggle={() => handleAlarmToggle(alarm.id, isExpanded)} />;
          })
        )}
      </div>
    </div>
  );
}

function AlarmCard({
  alarm,
  nowMs,
  isExpanded,
  onToggle,
}: {
  alarm: AlarmDetail;
  nowMs: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sevMeta = SEVERITY_META[alarm.severity];
  const statusMeta = STATUS_META[alarm.status];

  return (
    <div
      id={`alarm-${alarm.id}`}
      className={cn(
        "rounded-xl border bg-slate-900/60 overflow-hidden transition-all duration-200",
        alarm.severity === "danger" ? "border-red-500/20" : alarm.severity === "warning" ? "border-amber-500/20" : "border-gray-800/50",
        isExpanded && "ring-1 ring-cyan-500/20"
      )}
    >
      {/* Card Header - Always Visible */}
      <button onClick={onToggle} className="w-full text-left px-5 py-4 hover:bg-slate-800/30 transition-colors">
        <div className="flex items-start gap-4">
          {/* Severity Icon */}
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5", sevMeta.bgColor)}>
            <SeverityIcon severity={alarm.severity} className="w-5 h-5" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h3 className="text-sm font-semibold text-white">{alarm.title}</h3>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", sevMeta.bgColor, sevMeta.color)}>
                {sevMeta.label}
              </span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1", CATEGORY_META[alarm.category].bgColor, CATEGORY_META[alarm.category].color)}>
                <CategoryIcon category={alarm.category} className="w-2.5 h-2.5" />
                {alarm.categoryLabel}
              </span>
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", statusMeta.bgColor, statusMeta.color)}>
                {statusMeta.label}
              </span>
              {alarm.escalationLevel > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">
                  已升级 Lv.{alarm.escalationLevel}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{alarm.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatCampusDateTime(new Date(alarm.time))}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {alarm.location}
              </span>
              {alarm.duration && (
                <span className="flex items-center gap-1">
                  持续 {alarm.duration}
                </span>
              )}
            </div>
          </div>

          {/* Expand Icon */}
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-gray-800/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-4">
            {/* Left Column: Root Cause & Suggestion */}
            <div className="space-y-4">
              {/* Related Metrics */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3" />
                  关键指标
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {alarm.relatedMetrics.map((m, i) => (
                    <div key={i} className={cn("px-3 py-2 rounded-lg border", m.isAbnormal ? "bg-red-500/5 border-red-500/20" : "bg-slate-800/30 border-gray-800/50")}>
                      <div className="text-[10px] text-gray-500 mb-0.5">{m.label}</div>
                      <div className={cn("text-sm font-bold", m.isAbnormal ? "text-red-400" : "text-gray-300")}>
                        {m.value}
                        {m.isAbnormal && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Root Cause */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  根因分析
                </h4>
                <div className="px-3 py-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                  <p className="text-xs text-amber-200/80 leading-relaxed">{alarm.rootCause}</p>
                </div>
              </div>

              {/* Impact */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  影响评估
                </h4>
                <div className="px-3 py-2.5 rounded-lg bg-slate-800/30 border border-gray-800/50">
                  <p className="text-xs text-gray-300 leading-relaxed">{alarm.impact}</p>
                </div>
              </div>
            </div>

            {/* Right Column: Suggestion & Assignment */}
            <div className="space-y-4">
              {/* Suggestion */}
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  处置建议
                </h4>
                <div className="px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
                  <div className="space-y-1.5">
                    {alarm.suggestion.split("\n").map((line, i) => (
                      <p key={i} className="text-xs text-emerald-200/80 leading-relaxed">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
          <AlarmWorkflowPanel alarm={alarm} nowMs={nowMs} aiSource="alarms" />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-800/50 px-5 py-2.5">
        <Link
          href={getAlarmAiAnalysisHref(alarm, "alarms")}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-amber-400/20 bg-amber-400/8 px-3 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-400/12 hover:text-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          AI 根因分析
          <ExternalLink aria-hidden="true" className="h-3 w-3" />
        </Link>
        <Link
          href={`/operations?building=${encodeURIComponent(alarm.buildingId)}&alarm=${encodeURIComponent(alarm.id)}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-cyan-500/25 bg-cyan-500/10 px-3 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/15 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          <MapPinned aria-hidden="true" className="h-3.5 w-3.5" />
          定位到后勤驾驶舱
          <ExternalLink aria-hidden="true" className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
