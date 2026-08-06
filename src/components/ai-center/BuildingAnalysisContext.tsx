"use client";

import Link from "next/link";
import { ArrowLeft, Building2, CircleAlert } from "lucide-react";
import { getCampusMapBuildingId } from "@/data/campus-map-buildings";
import type { AIModule } from "@/stores/ai-center-store";

export type AICenterSource = "leader" | "operations" | "alarms";

interface BuildingAnalysisContextProps {
  buildingId: string;
  buildingName: string | null;
  activeModule: AIModule;
  analysisFocus: string | null;
  source: AICenterSource | null;
}

const MODULE_LABELS: Record<AIModule, string> = {
  prediction: "预测性分析",
  monitoring: "异常监控与根因分析",
  policy: "政策与合规助手",
  suggestion: "AI 减排治理方案",
};

function getFocusLabel(analysisFocus: string | null): string | null {
  if (!analysisFocus) return null;
  if (analysisFocus === "quota-overrun") return "配额超限治理";
  if (analysisFocus === "peer-benchmark") return "同类楼宇对标";
  if (/^ANOM-\d+$/.test(analysisFocus)) return `告警 ${analysisFocus}`;
  return "定向分析任务";
}

function getSourceLabel(source: AICenterSource | null): string {
  if (source === "leader") return "领导舱";
  if (source === "operations") return "后勤舱";
  if (source === "alarms") return "告警中心";
  return "驾驶舱";
}

export default function BuildingAnalysisContext({
  buildingId,
  buildingName,
  activeModule,
  analysisFocus,
  source,
}: BuildingAnalysisContextProps) {
  const displayId = buildingId.length > 40 ? `${buildingId.slice(0, 37)}…` : buildingId;
  const focusLabel = getFocusLabel(analysisFocus);
  const sourceLabel = getSourceLabel(source);
  const operationsBuildingId = buildingName ? getCampusMapBuildingId("2d", buildingName) : null;
  const returnHref = source === "alarms"
    ? analysisFocus && /^ANOM-\d+$/.test(analysisFocus)
      ? `/alarms?alarm=${encodeURIComponent(analysisFocus)}`
      : "/alarms"
    : source === "operations"
      ? operationsBuildingId
        ? `/operations?building=${encodeURIComponent(operationsBuildingId)}${analysisFocus && /^ANOM-\d+$/.test(analysisFocus) ? `&alarm=${encodeURIComponent(analysisFocus)}` : ""}`
        : "/operations"
      : "/leader";

  return (
    <aside
      aria-label="当前分析楼宇"
      className="relative z-20 flex min-h-12 shrink-0 flex-wrap items-center justify-between gap-x-5 gap-y-2 border-b border-cyan-300/15 bg-[#0a1734] px-4 py-2 sm:px-6"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            buildingName ? "bg-cyan-300/12 text-cyan-200" : "bg-amber-300/12 text-amber-200"
          }`}
        >
          {buildingName ? (
            <Building2 aria-hidden="true" className="h-4 w-4" />
          ) : (
            <CircleAlert aria-hidden="true" className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-xs text-cyan-100/65">当前分析楼宇</span>
            <strong className={`truncate text-sm ${buildingName ? "text-white" : "text-amber-100"}`}>
              {buildingName ?? "未识别楼宇"}
            </strong>
          </div>
          <p className="truncate text-[11px] text-cyan-100/55" title={`楼宇 ID：${displayId}`}>
            楼宇 ID：{displayId}
            <span aria-hidden="true" className="mx-1.5 text-cyan-200/25">·</span>
            {buildingName ? `分析上下文已从${sourceLabel}带入` : `未匹配校园楼宇数据，请返回${sourceLabel}重新选择`}
          </p>
        </div>
      </div>

      {buildingName ? (
        <div className="hidden min-w-0 flex-1 border-l border-cyan-300/15 pl-5 lg:block">
          <p className="text-[10px] text-cyan-100/50">已定位内部板块</p>
          <p className="mt-0.5 truncate text-xs font-medium text-cyan-100">
            {MODULE_LABELS[activeModule]}{focusLabel ? ` · ${focusLabel}` : ""}
          </p>
        </div>
      ) : null}

      <Link
        href={returnHref}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-cyan-100/80 transition-colors hover:bg-cyan-200/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        {buildingName ? `返回${sourceLabel}` : `返回${sourceLabel}重新选择`}
      </Link>
    </aside>
  );
}
