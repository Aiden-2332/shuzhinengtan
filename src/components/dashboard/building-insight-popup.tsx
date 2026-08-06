"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CheckCircle2,
  MapPin,
  Sparkles,
  X,
} from "lucide-react";

import { AlarmWorkflowCompact } from "@/components/alarms/alarm-workflow";
import { AdaptiveTrendChart, type TrendDatum } from "@/components/dashboard/cockpit-visuals";
import { getAllAlarms, SEVERITY_META } from "@/data/alarm-data";
import {
  type CampusMapBuilding,
} from "@/data/campus-map-buildings";
import { getBuildingPeerBenchmark } from "@/data/building-benchmark-data";
import { formatCampusDateTime } from "@/lib/campus-realtime";

export type BuildingInsightMode = "leader" | "operations";

interface BuildingInsightPopupProps {
  building: CampusMapBuilding;
  mode: BuildingInsightMode;
  nowMs: number;
  focusedAlarmId?: string | null;
  onClose: () => void;
}

const MONTHLY_PATTERN = [0.91, 0.94, 0.9, 0.96, 1.01, 1.07, 1.12, 1.08, 1.03, 0.99, 1.04, 1] as const;
function formatDelta(value: number): string {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, 0)}%`;
}

function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat("zh-CN", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function getMonthlyRatios(nowMs: number, buildingId: string, currentRatio: number): TrendDatum[] {
  const seedOffset = Array.from(buildingId).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 7;

  return MONTHLY_PATTERN.map((pattern, index) => {
    const date = new Date(nowMs);
    date.setMonth(date.getMonth() - (MONTHLY_PATTERN.length - 1 - index));
    const offset = ((index * 3 + seedOffset) % 7) - 3;
    return {
      label: `${date.getMonth() + 1}月`,
      ratio: index === MONTHLY_PATTERN.length - 1
        ? currentRatio
        : Math.round(currentRatio * pattern + offset),
      limit: 100,
    };
  });
}

function PopupHeader({
  building,
  mode,
  onClose,
}: Pick<BuildingInsightPopupProps, "building" | "mode" | "onClose">) {
  return (
    <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-[#071923]/96 px-4 py-3 backdrop-blur-md">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[11px] text-cyan-100/65">
          <Building2 aria-hidden="true" className="h-3.5 w-3.5" />
          <span>{mode === "leader" ? "楼宇碳排决策" : "楼宇运行问题"}</span>
        </div>
        <h2 className="mt-1 truncate text-base font-semibold text-white">{building.name}</h2>
      </div>
      <button
        type="button"
        aria-label={`关闭${building.name}信息框`}
        title="关闭"
        onClick={onClose}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </header>
  );
}

function LeaderBuildingInsight({ building, nowMs }: Pick<BuildingInsightPopupProps, "building" | "nowMs">) {
  const carbon = building.carbon;
  const rawRatio = (carbon.annualEmission / carbon.targetEmission) * 100;
  const displayRatio = Math.round(rawRatio);
  const exceededPercent = Math.max(0, Math.round(rawRatio - 100));
  const isOverLimit = rawRatio > 100;
  const trendData = getMonthlyRatios(nowMs, building.name, displayRatio);
  const trendSummary = trendData
    .map((item) => `${item.label}${formatNumber(Number(item.ratio))}%`)
    .join("、");
  const benchmark = getBuildingPeerBenchmark(building);
  const isPriorityGovernance = isOverLimit || benchmark.energyDelta > 10 || benchmark.carbonDelta > 10;
  const aiModule = isPriorityGovernance ? "suggestion" : "prediction";
  const aiFocus = isOverLimit ? "quota-overrun" : "peer-benchmark";

  return (
    <>
      <div className="px-4 py-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] text-slate-400">预计排放相对年度限额</div>
            <div className={`mt-1 text-3xl font-semibold tabular-nums ${isOverLimit ? "text-rose-300" : "text-emerald-300"}`}>
              {displayRatio}%
            </div>
          </div>
          <div className={`mb-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isOverLimit ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
            {isOverLimit ? <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" /> : <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />}
            {isOverLimit ? `超限 ${exceededPercent}%` : "限额内运行"}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 border-y border-white/10 text-xs sm:grid-cols-3">
          <div className="py-2.5 pr-3">
            <div className="text-slate-500">预计年排放</div>
            <div className="mt-1 font-semibold text-slate-100">{formatNumber(carbon.annualEmission)} tCO2e</div>
          </div>
          <div className="border-l border-white/10 px-3 py-2.5">
            <div className="text-slate-500">年度限额</div>
            <div className="mt-1 font-semibold text-slate-100">{formatNumber(carbon.targetEmission)} tCO2e</div>
          </div>
          <div className="border-t border-white/10 py-2.5 pr-3 sm:border-l sm:border-t-0 sm:px-3">
            <div className="text-slate-500">能耗强度</div>
            <div className="mt-1 font-semibold text-slate-100">{formatNumber(carbon.energyIntensity, 1)} kWh/m2</div>
          </div>
        </div>
      </div>

      <section className="px-4 pb-3" aria-label="过去十二个月相对限额比例">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold text-slate-200">
            过去 12 个月相对比例
            <span className="ml-1.5 font-normal text-slate-500">演示推算</span>
          </h3>
          <span className="text-[10px] text-slate-500">100% 为限额线</span>
        </div>
        <p className="sr-only">过去十二个月相对限额比例依次为：{trendSummary}。限额线为 100%。</p>
        <AdaptiveTrendChart
          data={trendData}
          unit="%"
          height={138}
          areaKey="ratio"
          series={[
            { key: "ratio", label: "相对比例", color: isOverLimit ? "#fb7185" : "#4ade80" },
            { key: "limit", label: "限额线", color: "#f6c85f", dashed: true },
          ]}
        />
      </section>

      <section className="border-t border-white/10 px-4 py-3" aria-labelledby={`peer-benchmark-${building.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <ChartNoAxesCombined aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            <h3 id={`peer-benchmark-${building.id}`} className="truncate text-xs font-semibold text-slate-200">同类楼宇横向对标</h3>
          </div>
          <span className="shrink-0 text-[10px] text-slate-500">{benchmark.peerLabel} · {benchmark.peerCount} 栋</span>
        </div>

        <div className="mt-3 grid grid-cols-2 border-y border-white/10 text-xs">
          <div className="py-2.5 pr-3">
            <div className="text-slate-500">能耗强度</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <strong className="text-slate-100">{formatNumber(carbon.energyIntensity, 1)}</strong>
              <span className={benchmark.energyDelta > 10 ? "text-rose-300" : "text-emerald-300"}>{formatDelta(benchmark.energyDelta)}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">同类中位 {formatNumber(benchmark.energyMedian, 1)} · 高耗能序位 {benchmark.energyRank}/{benchmark.peerCount}</p>
          </div>
          <div className="border-l border-white/10 px-3 py-2.5">
            <div className="text-slate-500">单位面积碳排</div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <strong className="text-slate-100">{formatNumber((carbon.annualEmission * 1_000) / carbon.area, 1)}</strong>
              <span className={benchmark.carbonDelta > 10 ? "text-rose-300" : "text-emerald-300"}>{formatDelta(benchmark.carbonDelta)}</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">kgCO₂e/㎡ · 高碳序位 {benchmark.carbonRank}/{benchmark.peerCount}</p>
          </div>
        </div>

        <div className="mt-2.5 flex items-start justify-between gap-3 text-[11px]">
          <span className="text-slate-500">领导决策结论</span>
          <strong className={isPriorityGovernance ? "text-rose-200" : "text-emerald-200"}>
            {isPriorityGovernance ? "列入优先治理清单" : "保持跟踪，无需专项干预"}
          </strong>
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 px-4 py-3 text-xs">
        <div><dt className="text-slate-500">归口部门</dt><dd className="mt-0.5 truncate text-slate-200">{carbon.department}</dd></div>
        <div><dt className="text-slate-500">建筑用途</dt><dd className="mt-0.5 truncate text-slate-200">{building.category}</dd></div>
        <div><dt className="text-slate-500">建筑面积</dt><dd className="mt-0.5 text-slate-200">{formatNumber(carbon.area)} m2</dd></div>
        <div><dt className="text-slate-500">楼层</dt><dd className="mt-0.5 text-slate-200">{carbon.floorCount} 层</dd></div>
        <div className="col-span-2"><dt className="text-slate-500">数据来源</dt><dd className="mt-0.5 text-slate-200">{carbon.sourceLabel}{carbon.isEstimated ? " · Demo 估算" : ""}</dd></div>
      </dl>

      <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#071923]/96 p-3 backdrop-blur-md">
        <Link
          href={`/ai-center?building=${encodeURIComponent(building.id)}&module=${aiModule}&focus=${aiFocus}&source=leader`}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-semibold text-cyan-950 transition-colors hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          {isPriorityGovernance ? "AI 生成楼宇治理方案" : "查看 AI 预测分析"}
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

function OperationsBuildingInsight({
  building,
  nowMs,
  focusedAlarmId,
}: Pick<BuildingInsightPopupProps, "building" | "nowMs" | "focusedAlarmId">) {
  const allAlarms = getAllAlarms(new Date(nowMs));
  const focusedHistoricalAlarm = focusedAlarmId
    ? allAlarms.find((alarm) => (
      alarm.id === focusedAlarmId
      && alarm.buildingId === building.id
      && (alarm.status === "resolved" || alarm.status === "closed")
    )) ?? null
    : null;
  const issues = allAlarms
    .filter((alarm) => (
      alarm.buildingId === building.id
      && alarm.status !== "resolved"
      && alarm.status !== "closed"
    ))
    .toSorted((a, b) => {
      if (a.id === focusedAlarmId) return -1;
      if (b.id === focusedAlarmId) return 1;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  return (
    <>
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5">
        <span className="text-xs text-slate-400">当前未关闭问题</span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${issues.length ? "bg-rose-500/15 text-rose-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {issues.length} 项
        </span>
      </div>

      {focusedHistoricalAlarm ? (
        <section className="border-b border-white/10 bg-emerald-400/6 px-4 py-3" aria-label="已定位历史告警">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
                <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{focusedHistoricalAlarm.title}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                <span>{focusedHistoricalAlarm.floor} · {focusedHistoricalAlarm.room}</span>
                <span>{formatCampusDateTime(new Date(focusedHistoricalAlarm.time))}</span>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
              {focusedHistoricalAlarm.status === "resolved" ? "已解决" : "已关闭"}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{focusedHistoricalAlarm.description}</p>
          <Link
            href={`/alarms?alarm=${encodeURIComponent(focusedHistoricalAlarm.id)}`}
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            查看历史告警详情 <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
          </Link>
        </section>
      ) : null}

      {issues.length ? (
        <div className="divide-y divide-white/10">
          {issues.map((alarm) => {
            const isFocused = alarm.id === focusedAlarmId;
            return (
              <article
                key={alarm.id}
                data-focused={isFocused ? "true" : "false"}
                className={`px-4 py-3 ${isFocused ? "bg-cyan-400/8" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${alarm.severity === "danger" ? "bg-rose-400" : alarm.severity === "warning" ? "bg-amber-300" : "bg-sky-300"}`} />
                      <h3 className="truncate text-xs font-semibold text-slate-100">{alarm.title}</h3>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className="inline-flex items-center gap-1"><MapPin aria-hidden="true" className="h-3 w-3" />{alarm.floor ?? "楼层待确认"} · {alarm.room ?? "房间待确认"}</span>
                      <span className="inline-flex items-center gap-1"><CalendarClock aria-hidden="true" className="h-3 w-3" />{formatCampusDateTime(new Date(alarm.time))}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${SEVERITY_META[alarm.severity].bgColor} ${SEVERITY_META[alarm.severity].color}`}>
                    {SEVERITY_META[alarm.severity].label}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-[11px] leading-5 text-slate-400">{alarm.description}</p>
                <AlarmWorkflowCompact
                  alarm={alarm}
                  nowMs={nowMs}
                  aiSource="operations"
                  defaultExpanded={isFocused}
                />
                <Link
                  href={`/alarms?alarm=${encodeURIComponent(alarm.id)}`}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                >
                  查看告警详情 <ArrowUpRight aria-hidden="true" className="h-3 w-3" />
                </Link>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="flex min-h-32 flex-col items-center justify-center px-6 text-center">
          <CheckCircle2 aria-hidden="true" className="h-7 w-7 text-emerald-300" />
          <p className="mt-2 text-sm font-medium text-slate-200">当前未发现运行问题</p>
          <p className="mt-1 text-[11px] text-slate-500">设备、能源、环境和数据状态均无未关闭告警</p>
        </div>
      )}

      <div className="sticky bottom-0 z-10 border-t border-white/10 bg-[#071923]/96 p-3 backdrop-blur-md">
        <Link
          href={issues[0] ? `/alarms?alarm=${encodeURIComponent(issues[0].id)}` : "/alarms"}
          className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-cyan-300/30 bg-cyan-300/10 px-3 text-xs font-semibold text-cyan-100 transition-colors hover:bg-cyan-300/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          打开告警中心
          <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
}

export function BuildingInsightPopup({
  building,
  mode,
  nowMs,
  focusedAlarmId = null,
  onClose,
}: BuildingInsightPopupProps) {
  return (
    <div
      className="w-[min(380px,calc(100vw-24px))] max-h-[min(570px,76vh)] overscroll-contain overflow-y-auto rounded-lg border border-cyan-300/25 bg-[#071923]/96 text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,.48)] backdrop-blur-xl"
      onWheel={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <PopupHeader building={building} mode={mode} onClose={onClose} />
      {mode === "leader" ? (
        <LeaderBuildingInsight building={building} nowMs={nowMs} />
      ) : (
        <OperationsBuildingInsight building={building} nowMs={nowMs} focusedAlarmId={focusedAlarmId} />
      )}
    </div>
  );
}
