"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BellRing,
  Check,
  ChevronDown,
  Clock3,
  Send,
  ShieldAlert,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

import type { AlarmDetail } from "@/data/alarm-data";
import {
  getAlarmAiAnalysisHref,
  getAlarmWorkflowSnapshot,
  type AlarmAiAnalysisSource,
  type AlarmWorkflowOverride,
  type AlarmWorkflowSnapshot,
  type AlarmSlaState,
} from "@/data/alarm-workflow-data";
import { formatCampusDateTime } from "@/lib/campus-realtime";
import { cn } from "@/lib/utils";
import {
  hydrateAlarmWorkflowStore,
  useAlarmWorkflowStore,
} from "@/stores/alarm-workflow-store";

const SLA_TONES: Record<AlarmSlaState, string> = {
  "on-track": "bg-emerald-500/12 text-emerald-200",
  "at-risk": "bg-amber-500/15 text-amber-200",
  overdue: "bg-rose-500/15 text-rose-200",
  completed: "bg-slate-500/15 text-slate-300",
};

function useWorkflowSnapshot(alarm: AlarmDetail, nowMs: number) {
  const [initialDetectedAt] = useState(() => alarm.time);
  const override = useAlarmWorkflowStore((state) => state.overrides[alarm.id]);
  const ensureWorkflow = useAlarmWorkflowStore((state) => state.ensureWorkflow);

  useEffect(() => {
    let isActive = true;
    void hydrateAlarmWorkflowStore().then(() => {
      if (isActive) ensureWorkflow(alarm.id, initialDetectedAt);
    });
    return () => {
      isActive = false;
    };
  }, [alarm.id, ensureWorkflow, initialDetectedAt]);

  return {
    override,
    workflow: getAlarmWorkflowSnapshot(alarm, nowMs, override),
  };
}

function WorkflowActions({
  alarm,
  workflow,
  override,
  aiSource,
  compact = false,
}: {
  alarm: AlarmDetail;
  workflow: AlarmWorkflowSnapshot;
  override: AlarmWorkflowOverride | undefined;
  aiSource: AlarmAiAnalysisSource;
  compact?: boolean;
}) {
  const dispatchWorkOrder = useAlarmWorkflowStore((state) => state.dispatchWorkOrder);
  const toggleSubscription = useAlarmWorkflowStore((state) => state.toggleSubscription);
  const notifyAssignee = useAlarmWorkflowStore((state) => state.notifyAssignee);
  const escalate = useAlarmWorkflowStore((state) => state.escalate);
  const isClosed = alarm.status === "resolved" || alarm.status === "closed";
  const assignee = workflow.assignee;
  const buttonClass = compact
    ? "h-8 px-2.5 text-[10px]"
    : "h-9 px-3 text-xs";

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", compact ? "mt-2.5" : "mt-3")}>
        {!isClosed && workflow.assignee !== workflow.recommendedAssignee ? (
          <button
            type="button"
            onClick={() => dispatchWorkOrder(alarm.id, workflow.recommendedAssignee, {
              currentProgress: workflow.progress,
              currentWorkOrderId: workflow.workOrderId,
              previousAssignee: assignee,
            })}
            className={cn(buttonClass, "inline-flex items-center gap-1.5 rounded-md bg-cyan-300 font-semibold text-cyan-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white")}
          >
            <UserRoundCheck aria-hidden="true" className="h-3.5 w-3.5" />
            {workflow.assignee ? `一键转派给 ${workflow.recommendedAssignee}` : `一键派给 ${workflow.recommendedAssignee}`}
          </button>
        ) : null}

        {!isClosed && assignee ? (
          <button
            type="button"
            onClick={() => notifyAssignee(alarm.id, assignee)}
            className={cn(buttonClass, "inline-flex items-center gap-1.5 rounded-md border border-cyan-400/25 bg-cyan-400/10 font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300")}
          >
            <Send aria-hidden="true" className="h-3.5 w-3.5" />
            通知责任人
          </button>
        ) : null}

        {!isClosed ? (
          <button
            type="button"
            aria-pressed={workflow.subscribed}
            onClick={() => toggleSubscription(alarm.id, workflow.subscribed)}
            className={cn(buttonClass, "inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 font-medium text-slate-200 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300")}
          >
            {workflow.subscribed ? <Check aria-hidden="true" className="h-3.5 w-3.5 text-emerald-300" /> : <BellRing aria-hidden="true" className="h-3.5 w-3.5" />}
            {workflow.subscribed ? "已订阅" : "订阅告警"}
          </button>
        ) : null}

        {!compact && !isClosed && workflow.escalationLevel < 3 ? (
          <button
            type="button"
            onClick={() => escalate(alarm.id, workflow.escalationLevel)}
            className={cn(buttonClass, "inline-flex items-center gap-1.5 rounded-md border border-rose-400/20 bg-rose-400/8 font-medium text-rose-200 transition-colors hover:bg-rose-400/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300")}
          >
            <ShieldAlert aria-hidden="true" className="h-3.5 w-3.5" />
            立即升级
          </button>
        ) : null}

        <Link
          href={getAlarmAiAnalysisHref(alarm, aiSource)}
          className={cn(buttonClass, "inline-flex items-center gap-1.5 rounded-md border border-amber-300/20 bg-amber-300/8 font-medium text-amber-100 transition-colors hover:bg-amber-300/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300")}
        >
          <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
          AI 根因分析
          <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
        </Link>
      </div>
      <p className="sr-only" aria-live="polite">{override?.lastAction ?? ""}</p>
      {override?.lastAction ? <p className={cn("text-emerald-200/80", compact ? "mt-2 text-[10px]" : "mt-2.5 text-xs")}>{override.lastAction}</p> : null}
    </>
  );
}

export function AlarmWorkflowCompact({
  alarm,
  nowMs,
  aiSource,
  defaultExpanded = false,
}: {
  alarm: AlarmDetail;
  nowMs: number;
  aiSource: AlarmAiAnalysisSource;
  defaultExpanded?: boolean;
}) {
  const { override, workflow } = useWorkflowSnapshot(alarm, nowMs);
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  return (
    <details
      className="group mt-3 border-t border-white/10 pt-2.5"
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", SLA_TONES[workflow.slaState])}>{workflow.slaLabel}</span>
            {workflow.escalationLevel ? <span className="text-[10px] font-medium text-rose-300">升级 Lv.{workflow.escalationLevel}</span> : null}
          </div>
          <p className="mt-1 truncate text-[10px] text-slate-500">
            {workflow.assignee ? `责任人 ${workflow.assignee}` : `待派单 · 推荐 ${workflow.recommendedAssignee}`} · 进度 {workflow.progress}%
          </p>
        </div>
        <ChevronDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-slate-500 transition-transform group-open:rotate-180" />
      </summary>

      <div className="pt-2.5">
        <div className="h-1 overflow-hidden rounded-full bg-white/8" role="progressbar" aria-label={`${alarm.title}处置进度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={workflow.progress}>
          <div className="h-full rounded-full bg-cyan-300 transition-[width] duration-200" style={{ width: `${workflow.progress}%` }} />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-slate-400">
          <span className="truncate">工单：{workflow.workOrderId}</span>
          <span className="text-right">{workflow.notificationLabel}</span>
        </div>
        <WorkflowActions alarm={alarm} workflow={workflow} override={override} aiSource={aiSource} compact />
      </div>
    </details>
  );
}

export function AlarmWorkflowPanel({
  alarm,
  nowMs,
  aiSource,
}: {
  alarm: AlarmDetail;
  nowMs: number;
  aiSource: AlarmAiAnalysisSource;
}) {
  const { override, workflow } = useWorkflowSnapshot(alarm, nowMs);

  return (
    <section className="mt-5 border-t border-slate-700/60 pt-5" aria-labelledby={`workflow-${alarm.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 id={`workflow-${alarm.id}`} className="text-sm font-semibold text-slate-100">工单执行闭环</h4>
          <p className="mt-1 text-xs text-slate-500">SLA、责任人、通知与整改证据统一留痕</p>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", SLA_TONES[workflow.slaState])}>{workflow.slaLabel}</span>
      </div>

      <dl className="mt-4 grid grid-cols-2 border-y border-slate-700/50 text-xs md:grid-cols-4">
        <div className="py-3 pr-3">
          <dt className="text-slate-500">工单编号</dt>
          <dd className="mt-1 truncate font-medium text-cyan-300">{workflow.workOrderId}</dd>
        </div>
        <div className="border-l border-slate-700/50 px-3 py-3">
          <dt className="text-slate-500">责任人</dt>
          <dd className="mt-1 truncate font-medium text-slate-200">{workflow.assignee ?? `待派 · ${workflow.recommendedAssignee}`}</dd>
        </div>
        <div className="border-t border-slate-700/50 py-3 pr-3 md:border-l md:border-t-0 md:px-3">
          <dt className="text-slate-500">处置进度</dt>
          <dd className="mt-1 font-medium text-slate-200">{workflow.progress}%</dd>
        </div>
        <div className="border-l border-t border-slate-700/50 px-3 py-3 md:border-t-0">
          <dt className="text-slate-500">超时升级</dt>
          <dd className={cn("mt-1 font-medium", workflow.escalationLevel ? "text-rose-300" : "text-slate-200")}>
            {workflow.escalationLevel ? `已升级 Lv.${workflow.escalationLevel}` : "未触发"}
          </dd>
        </div>
      </dl>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-label={`${alarm.title}处置进度`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={workflow.progress}>
        <div className="h-full rounded-full bg-cyan-400 transition-[width] duration-200" style={{ width: `${workflow.progress}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500">
        <span>要求完成：{formatCampusDateTime(new Date(workflow.dueAt))}</span>
        <span>{workflow.subscribed ? "已订阅状态变化与超时提醒" : "未订阅告警变化"}</span>
      </div>

      <WorkflowActions alarm={alarm} workflow={workflow} override={override} aiSource={aiSource} />

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h5 className="text-xs font-semibold text-slate-300">告警处理时间轴</h5>
          <ol className="mt-3 space-y-3">
            {workflow.timeline.map((item, index) => (
              <li key={item.id} className="grid grid-cols-[16px_1fr] gap-2.5">
                <div className="relative flex justify-center">
                  <span className={cn("mt-1.5 h-2 w-2 rounded-full", item.tone === "complete" ? "bg-emerald-400" : item.tone === "attention" ? "bg-rose-400" : "bg-cyan-400")} />
                  {index < workflow.timeline.length - 1 ? <span aria-hidden="true" className="absolute bottom-[-14px] top-4 w-px bg-slate-700" /> : null}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-medium text-slate-200">{item.label}</span>
                    {item.timestamp ? (
                      <time dateTime={item.timestamp} className="text-[10px] text-slate-500">
                        {formatCampusDateTime(new Date(item.timestamp))}
                      </time>
                    ) : (
                      <span className="text-[10px] text-amber-300/75">时间待补录</span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-5 text-slate-500">{item.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="border-t border-slate-700/50 pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <h5 className="text-xs font-semibold text-slate-300">告警数据与整改目标</h5>
          <p className="mt-1 text-[10px] text-slate-500">{workflow.comparison.label} · Demo 目标口径，非整改后实测</p>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div>
              <div className="text-[10px] text-slate-500">告警值</div>
              <div className="mt-1 text-lg font-semibold text-rose-300">{workflow.comparison.before}</div>
            </div>
            <ArrowUpRight aria-hidden="true" className="h-4 w-4 rotate-45 text-slate-600" />
            <div className="text-right">
              <div className="text-[10px] text-slate-500">{workflow.comparison.afterLabel}</div>
              <div className="mt-1 text-lg font-semibold text-amber-200">{workflow.comparison.after}</div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-slate-700/50 pt-3 text-xs text-emerald-200">
            <Clock3 aria-hidden="true" className="h-3.5 w-3.5" />
            {workflow.comparison.improvementLabel}
          </div>
        </div>
      </div>
    </section>
  );
}
