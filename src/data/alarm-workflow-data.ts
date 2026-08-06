import type { AlarmDetail } from "@/data/alarm-data";
import { getCampusMapBuildingId } from "@/data/campus-map-buildings";

export type AlarmSlaState = "on-track" | "at-risk" | "overdue" | "completed";

export type AlarmWorkflowEventType =
  | "dispatch"
  | "transfer"
  | "notification"
  | "subscription-enabled"
  | "subscription-disabled"
  | "escalation";

export interface AlarmWorkflowOverride {
  detectedAt?: string;
  completedAt?: string;
  assignee?: string;
  progress?: number;
  workOrderId?: string;
  subscribed?: boolean;
  lastNotifiedAt?: string;
  dispatchedAt?: string;
  escalationLevel?: number;
  escalatedAt?: string;
  lastAction?: string;
  events?: AlarmWorkflowEvent[];
}

export interface AlarmWorkflowTimelineItem {
  id: string;
  timestamp: string | null;
  label: string;
  detail: string;
  tone: "normal" | "attention" | "complete";
}

export interface AlarmWorkflowEvent extends Omit<AlarmWorkflowTimelineItem, "timestamp"> {
  type: AlarmWorkflowEventType;
  timestamp: string;
}

export interface AlarmMetricComparison {
  label: string;
  before: string;
  after: string;
  afterLabel: string;
  improvementLabel: string;
}

export interface AlarmWorkflowSnapshot {
  slaState: AlarmSlaState;
  slaLabel: string;
  slaMinutes: number;
  dueAt: string;
  assignee: string | null;
  recommendedAssignee: string;
  progress: number;
  workOrderId: string;
  subscribed: boolean;
  notificationLabel: string;
  escalationLevel: number;
  timeline: AlarmWorkflowTimelineItem[];
  comparison: AlarmMetricComparison;
}

const SLA_MINUTES_BY_SEVERITY = {
  danger: 120,
  warning: 480,
  info: 1_440,
} as const;

const ASSIGNEES_BY_GROUP: Record<string, readonly string[]> = {
  能源管理组: ["刘节能", "陈能源", "王水暖"],
  设备维保组: ["李维保", "周机电", "孙暖通"],
  环境保障组: ["张物业", "何环境", "赵楼管"],
  数据运维组: ["赵运维", "钱数据", "吴平台"],
};

const DEFAULT_ASSIGNEES = ["张物业", "李维保", "赵运维"] as const;

function stableIndex(value: string, length: number): number {
  const hash = Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return length ? hash % length : 0;
}

function addMinutes(timestamp: number, minutes: number): string {
  return new Date(timestamp + minutes * 60_000).toISOString();
}

function formatDuration(minutes: number): string {
  const roundedMinutes = Math.max(1, Math.round(minutes));
  if (roundedMinutes < 60) return `${roundedMinutes} 分钟`;
  const hours = Math.floor(roundedMinutes / 60);
  const remainder = roundedMinutes % 60;
  return remainder ? `${hours} 小时 ${remainder} 分` : `${hours} 小时`;
}

function getImprovedMetric(value: string): string {
  const numericMatch = value.match(/-?\d+(?:\.\d+)?/);
  if (!numericMatch) return "整改目标待补录";
  const current = Number(numericMatch[0]);
  if (!Number.isFinite(current)) return "整改目标待补录";
  const next = current * 0.78;
  const fractionDigits = numericMatch[0].includes(".") ? 1 : 0;
  return value.replace(numericMatch[0], next.toFixed(fractionDigits));
}

function getMetricComparison(alarm: AlarmDetail): AlarmMetricComparison {
  const abnormalMetric = alarm.relatedMetrics.find((metric) => metric.isAbnormal) ?? alarm.relatedMetrics[0];
  const referenceMetric = alarm.relatedMetrics.find((metric) => !metric.isAbnormal);
  const isCompleted = alarm.status === "resolved" || alarm.status === "closed";
  const target = referenceMetric?.value ?? getImprovedMetric(abnormalMetric?.value ?? "");

  return {
    label: abnormalMetric?.label ?? "核心异常指标",
    before: abnormalMetric?.value ?? "暂无数据",
    after: target,
    afterLabel: isCompleted ? "整改目标（Demo，非实测）" : "整改目标（Demo）",
    improvementLabel: isCompleted
      ? "工单已闭环 · 整改后实测值待补录"
      : "目标值取控制阈值 · 整改后实测值待补录",
  };
}

function getTimeline(
  alarm: AlarmDetail,
  detectedAtMs: number,
  nowMs: number,
  assignee: string | null,
  override: AlarmWorkflowOverride | undefined,
  escalationLevel: number,
  automaticEscalation: number,
  completedAtMs: number | null,
): AlarmWorkflowTimelineItem[] {
  const workflowEvents = override?.events ?? [];
  const hasDispatchEvent = workflowEvents.some((event) => event.type === "dispatch" || event.type === "transfer");
  const hasNotificationEvent = workflowEvents.some((event) => event.type === "notification");
  const hasEscalationEvent = workflowEvents.some((event) => event.type === "escalation");
  const items: AlarmWorkflowTimelineItem[] = [
    {
      id: "detected",
      timestamp: new Date(detectedAtMs).toISOString(),
      label: "系统发现异常",
      detail: `${alarm.floor ?? "全楼"} · ${alarm.room ?? alarm.deviceName ?? "设备区域"}`,
      tone: "attention",
    },
    {
      id: "validated",
      timestamp: addMinutes(detectedAtMs, 2),
      label: "AI 完成异常复核",
      detail: `建议由${alarm.assigneeGroup}接单，已生成根因与处置建议`,
      tone: "normal",
    },
  ];

  if (alarm.assignee) {
    items.push({
      id: "dispatched",
      timestamp: addMinutes(detectedAtMs, 8),
      label: "工单已派发",
      detail: `${alarm.assignee}负责处置，责任组：${alarm.assigneeGroup}`,
      tone: "normal",
    });
  } else if (assignee && !hasDispatchEvent) {
    items.push({
      id: "dispatched",
      timestamp: override?.dispatchedAt ?? addMinutes(detectedAtMs, 8),
      label: "工单已派发",
      detail: `${assignee}负责处置，责任组：${alarm.assigneeGroup}`,
      tone: "normal",
    });
  }

  if (alarm.status === "processing" || alarm.status === "resolved" || alarm.status === "closed") {
    const processingAtMs = detectedAtMs + 25 * 60_000;
    items.push({
      id: "processing",
      timestamp: processingAtMs <= nowMs ? new Date(processingAtMs).toISOString() : null,
      label: "现场处置中",
      detail: processingAtMs <= nowMs
        ? "已按处置建议执行检查并持续回传进度"
        : "告警状态已进入处理中，处置开始时间待补录",
      tone: "normal",
    });
  }

  if (override?.lastNotifiedAt && !hasNotificationEvent) {
    items.push({
      id: "notification",
      timestamp: override.lastNotifiedAt,
      label: "责任人已通知",
      detail: "站内信与短信通知已发送，通知记录已留痕",
      tone: "normal",
    });
  }

  if (automaticEscalation > alarm.escalationLevel) {
    items.push({
      id: "automatic-escalation",
      timestamp: addMinutes(detectedAtMs, SLA_MINUTES_BY_SEVERITY[alarm.severity]),
      label: `系统超时升级至 Lv.${automaticEscalation}`,
      detail: "已通知上级责任人与值班负责人",
      tone: "attention",
    });
  }

  if (alarm.escalationLevel > 0) {
    items.push({
      id: "existing-escalation",
      timestamp: null,
      label: `已升级至 Lv.${alarm.escalationLevel}`,
      detail: "历史升级记录已同步，升级时间待补录",
      tone: "attention",
    });
  }

  if (override?.escalatedAt && !hasEscalationEvent) {
    items.push({
      id: "legacy-escalation",
      timestamp: override.escalatedAt,
      label: `人工升级至 Lv.${escalationLevel}`,
      detail: "已通知上级责任人与值班负责人",
      tone: "attention",
    });
  }

  items.push(...workflowEvents);

  if (alarm.status === "resolved" || alarm.status === "closed") {
    items.push({
      id: "resolved",
      timestamp: completedAtMs === null ? null : new Date(completedAtMs).toISOString(),
      label: alarm.status === "resolved" ? "整改完成" : "工单已关闭",
      detail: completedAtMs === null
        ? "完成时间与整改后实测值待补录"
        : "完成时间已留痕，整改后实测值待补录",
      tone: "complete",
    });
  }

  return items.toSorted((left, right) => {
    const leftTime = left.timestamp ? new Date(left.timestamp).getTime() : Number.POSITIVE_INFINITY;
    const rightTime = right.timestamp ? new Date(right.timestamp).getTime() : Number.POSITIVE_INFINITY;
    return leftTime - rightTime;
  });
}

export function getAlarmWorkflowSnapshot(
  alarm: AlarmDetail,
  nowMs: number,
  override?: AlarmWorkflowOverride,
): AlarmWorkflowSnapshot {
  const stableDetectedAt = override?.detectedAt ?? alarm.time;
  const detectedAtMs = Number.isFinite(new Date(stableDetectedAt).getTime())
    ? new Date(stableDetectedAt).getTime()
    : nowMs;
  const slaMinutes = SLA_MINUTES_BY_SEVERITY[alarm.severity];
  const dueAtMs = detectedAtMs + slaMinutes * 60_000;
  const isCompleted = alarm.status === "resolved" || alarm.status === "closed";
  const completedAtCandidate = override?.completedAt ? new Date(override.completedAt).getTime() : Number.NaN;
  const completedAtMs = Number.isFinite(completedAtCandidate) ? completedAtCandidate : null;
  const remainingMinutes = (dueAtMs - nowMs) / 60_000;
  const slaState: AlarmSlaState = isCompleted
    ? "completed"
    : remainingMinutes < 0
      ? "overdue"
      : remainingMinutes <= Math.min(60, slaMinutes * 0.2)
        ? "at-risk"
        : "on-track";
  const slaLabel = slaState === "completed"
    ? completedAtMs === null
      ? "已闭环 · 完成时间待补录"
      : completedAtMs <= dueAtMs
        ? "已按 SLA 闭环"
        : `已闭环 · 超 SLA ${formatDuration((completedAtMs - dueAtMs) / 60_000)}`
    : slaState === "overdue"
      ? `已超时 ${formatDuration(Math.abs(remainingMinutes))}`
      : slaState === "at-risk"
        ? `临近超时 · 剩余 ${formatDuration(remainingMinutes)}`
        : `剩余 ${formatDuration(remainingMinutes)}`;
  const candidates = ASSIGNEES_BY_GROUP[alarm.assigneeGroup] ?? DEFAULT_ASSIGNEES;
  const recommendedAssignee = candidates[stableIndex(alarm.id, candidates.length)];
  const assignee = override?.assignee ?? alarm.assignee ?? null;
  const baseProgress = alarm.status === "pending" ? 8 : alarm.status === "processing" ? 55 : 100;
  const progress = Math.min(100, Math.max(0, override?.progress ?? baseProgress));
  const automaticEscalation = slaState === "overdue" ? (alarm.severity === "danger" ? 2 : 1) : 0;
  const escalationLevel = Math.max(alarm.escalationLevel, automaticEscalation, override?.escalationLevel ?? 0);

  return {
    slaState,
    slaLabel,
    slaMinutes,
    dueAt: new Date(dueAtMs).toISOString(),
    assignee,
    recommendedAssignee,
    progress,
    workOrderId: override?.workOrderId ?? alarm.workOrderId ?? `待生成 · ${alarm.id}`,
    subscribed: override?.subscribed ?? alarm.severity === "danger",
    notificationLabel: override?.lastNotifiedAt ? "责任人已通知" : assignee ? "待发送处置提醒" : "派单后可通知",
    escalationLevel,
    timeline: getTimeline(
      alarm,
      detectedAtMs,
      nowMs,
      assignee,
      override,
      escalationLevel,
      automaticEscalation,
      completedAtMs,
    ),
    comparison: getMetricComparison(alarm),
  };
}

export type AlarmAiAnalysisSource = "operations" | "alarms";

export function getAlarmAiAnalysisHref(
  alarm: AlarmDetail,
  source: AlarmAiAnalysisSource,
): string {
  const aiBuildingId = getCampusMapBuildingId("2_5d", alarm.buildingName);
  const params = new URLSearchParams({
    module: "monitoring",
    focus: alarm.id,
    source,
  });
  if (aiBuildingId) params.set("building", aiBuildingId);
  return `/ai-center?${params.toString()}`;
}
