"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  AlarmWorkflowEvent,
  AlarmWorkflowEventType,
  AlarmWorkflowOverride,
} from "@/data/alarm-workflow-data";

export interface DispatchWorkOrderContext {
  currentProgress: number;
  currentWorkOrderId: string;
  previousAssignee: string | null;
}

interface AlarmWorkflowState {
  overrides: Record<string, AlarmWorkflowOverride>;
  ensureWorkflow: (alarmId: string, detectedAt: string) => void;
  dispatchWorkOrder: (alarmId: string, assignee: string, context: DispatchWorkOrderContext) => void;
  toggleSubscription: (alarmId: string, currentValue: boolean) => void;
  notifyAssignee: (alarmId: string, assignee: string) => void;
  escalate: (alarmId: string, currentLevel: number) => void;
}

function getStableTimestamp(value: string): string {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : new Date().toISOString();
}

function createWorkflowEvent(
  alarmId: string,
  type: AlarmWorkflowEventType,
  label: string,
  detail: string,
  tone: AlarmWorkflowEvent["tone"],
  existingEventCount: number,
  timestamp = new Date().toISOString(),
): AlarmWorkflowEvent {
  return {
    id: `${alarmId}-${type}-${timestamp}-${existingEventCount + 1}`,
    type,
    timestamp,
    label,
    detail,
    tone,
  };
}

function mergeOverride(
  overrides: Record<string, AlarmWorkflowOverride>,
  alarmId: string,
  patch: AlarmWorkflowOverride,
  event?: AlarmWorkflowEvent,
): Record<string, AlarmWorkflowOverride> {
  const current = overrides[alarmId] ?? {};
  return {
    ...overrides,
    [alarmId]: {
      ...current,
      ...patch,
      events: event ? [...(current.events ?? []), event] : current.events,
    },
  };
}

function getGeneratedWorkOrderId(alarmId: string, timestamp: Date): string {
  return `WO-${timestamp.toISOString().slice(0, 10).replaceAll("-", "")}-${alarmId.replace(/\D/g, "").padStart(3, "0")}`;
}

function isGeneratedWorkOrderPlaceholder(workOrderId: string): boolean {
  return workOrderId.startsWith("待生成");
}

export const useAlarmWorkflowStore = create<AlarmWorkflowState>()(
  persist(
    (set) => ({
      overrides: {},
      ensureWorkflow: (alarmId, detectedAt) => set((state) => {
        const current = state.overrides[alarmId];
        if (current?.detectedAt && Number.isFinite(new Date(current.detectedAt).getTime())) return state;
        return {
          overrides: mergeOverride(state.overrides, alarmId, {
            detectedAt: getStableTimestamp(detectedAt),
          }),
        };
      }),
      dispatchWorkOrder: (alarmId, assignee, context) => set((state) => {
        const now = new Date();
        const current = state.overrides[alarmId] ?? {};
        const isTransfer = context.previousAssignee !== null;
        const workOrderId = isTransfer && !isGeneratedWorkOrderPlaceholder(context.currentWorkOrderId)
          ? context.currentWorkOrderId
          : current.workOrderId ?? getGeneratedWorkOrderId(alarmId, now);
        const progress = isTransfer
          ? context.currentProgress
          : Math.max(18, context.currentProgress);
        const event = createWorkflowEvent(
          alarmId,
          isTransfer ? "transfer" : "dispatch",
          isTransfer ? "工单已转派" : "工单已派发",
          isTransfer
            ? `${context.previousAssignee}转派给${assignee}，当前进度保留为 ${progress}%`
            : `${assignee}已接收工单，处置进度初始化为 ${progress}%`,
          "normal",
          current.events?.length ?? 0,
          now.toISOString(),
        );
        return {
          overrides: mergeOverride(state.overrides, alarmId, {
            assignee,
            progress,
            workOrderId,
            dispatchedAt: now.toISOString(),
            lastAction: isTransfer ? `已转派给 ${assignee}` : `已派单给 ${assignee}`,
          }, event),
        };
      }),
      toggleSubscription: (alarmId, currentValue) => set((state) => {
        const current = state.overrides[alarmId] ?? {};
        const nextValue = !currentValue;
        const event = createWorkflowEvent(
          alarmId,
          nextValue ? "subscription-enabled" : "subscription-disabled",
          nextValue ? "告警订阅已开启" : "告警订阅已取消",
          nextValue
            ? "已订阅状态变化、临期与超时升级提醒"
            : "已停止接收该告警的状态变化与超时提醒",
          "normal",
          current.events?.length ?? 0,
        );
        return {
          overrides: mergeOverride(state.overrides, alarmId, {
            subscribed: nextValue,
            lastAction: nextValue ? "已订阅状态变化与超时提醒" : "已取消告警订阅",
          }, event),
        };
      }),
      notifyAssignee: (alarmId, assignee) => set((state) => {
        const now = new Date();
        const current = state.overrides[alarmId] ?? {};
        const event = createWorkflowEvent(
          alarmId,
          "notification",
          "责任人已通知",
          `已向${assignee}发送站内信与短信处置提醒`,
          "normal",
          current.events?.length ?? 0,
          now.toISOString(),
        );
        return {
          overrides: mergeOverride(state.overrides, alarmId, {
            lastNotifiedAt: now.toISOString(),
            lastAction: `已通知责任人 ${assignee}`,
          }, event),
        };
      }),
      escalate: (alarmId, currentLevel) => set((state) => {
        const now = new Date();
        const current = state.overrides[alarmId] ?? {};
        const nextLevel = Math.min(3, Math.max(1, currentLevel + 1));
        const event = createWorkflowEvent(
          alarmId,
          "escalation",
          `人工升级至 Lv.${nextLevel}`,
          "已通知上级责任人与值班负责人",
          "attention",
          current.events?.length ?? 0,
          now.toISOString(),
        );
        return {
          overrides: mergeOverride(state.overrides, alarmId, {
            escalationLevel: nextLevel,
            escalatedAt: now.toISOString(),
            lastAction: `已升级至 Lv.${nextLevel} 并通知上级责任人`,
          }, event),
        };
      }),
    }),
    {
      name: "campus-alarm-workflow-v1",
      storage: createJSONStorage(() => window.localStorage),
      partialize: (state) => ({ overrides: state.overrides }),
      skipHydration: true,
    },
  ),
);

let hydrationPromise: Promise<void> | null = null;

export function hydrateAlarmWorkflowStore(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const persistApi = useAlarmWorkflowStore.persist;
  if (!persistApi) return Promise.resolve();
  if (!hydrationPromise) {
    hydrationPromise = Promise.resolve(persistApi.rehydrate()).catch(() => undefined);
  }
  return hydrationPromise;
}
