"use client";

// Leader cockpit lives on its own route so the product root can be the login surface.

import { useCallback, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChartNoAxesCombined,
  Droplets,
  Layers3,
  Leaf,
  Minus,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { BuildingPriorityScatter } from "@/components/dashboard/building-priority-scatter";
import { BuildingInsightPopup } from "@/components/dashboard/building-insight-popup";
import { EmissionSourceFlow } from "@/components/dashboard/emission-source-flow";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import { formatCampusDateTime } from "@/lib/campus-realtime";
import type { FloatingPanelSpec } from "@/components/dashboard/floating-glass-panel";
import {
  AdaptiveTrendChart,
  clampPercent,
  CompositionWaffle,
  formatMeasure,
  GaugeDial,
  KpiRibbon,
  PanelHeading,
  RadarProfile,
  StatusMatrix,
  type TrendDatum,
} from "@/components/dashboard/cockpit-visuals";
import {
  getLeaderKPIs,
  getEconomicZoneData,
  getEmissionSourceData,
  getRiskWarnings,
  getMonthlyTrendData,
  getResourceConsumptionData,
  carbonCompositionData,
  energyCompositionData,
  waterCompositionData,
  getBuildingPriorityData,
} from "@/data/leader-dashboard-data";
import type {
  EconomicZoneData,
  EmissionSourceItem,
  RiskWarning,
  MonthlyTrendPoint,
  ResourceConsumptionItem,
  CompositionItem,
  BuildingPriorityItem,
} from "@/data/leader-dashboard-data";
import type { CampusMapBuilding } from "@/data/campus-map-buildings";
import styles from "./leader-dashboard.module.css";

function EconomicZonePanel({ data }: { data: EconomicZoneData }) {
  const usedPercent = clampPercent(data.totalQuota > 0 ? (data.usedQuota / data.totalQuota) * 100 : 0);
  const remaining = Math.max(data.totalQuota - data.usedQuota, 0);
  const diagnostics = [...data.quotaCompliance, ...data.costControl];

  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Target />} title="经济控制分区" meta={data.riskLabel} tone={data.riskLevel === "normal" ? "live" : "risk"} />
      <div className="cockpit-economic-visual">
        <GaugeDial
          data={{
            id: "quota",
            label: "年度配额使用率",
            value: usedPercent,
            unit: "%",
            detail: `${formatMeasure(data.usedQuota, 0)} / ${formatMeasure(data.totalQuota, 0)} tCO₂e`,
            color: data.riskLevel === "critical" ? "#e96f83" : data.riskLevel === "warning" ? "#f0b94f" : "#35d4e4",
          }}
        />
        <div className="cockpit-economic-visual__facts">
          <span>剩余配额<strong>{formatMeasure(remaining, 0)}<small>tCO₂e</small></strong></span>
          <span>风险状态<strong>{data.riskLabel}</strong></span>
        </div>
      </div>
      <RadarProfile
        data={diagnostics.map((item) => ({ label: item.label, value: item.value, max: item.max }))}
        height="clamp(94px, 18vh, 152px)"
      />
    </div>
  );
}

function EmissionSourcePanel({ data }: { data: EmissionSourceItem[] }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + Math.max(item.value, 0), 0), [data]);
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Layers3 />} title="排放源构成" meta={`合计 ${formatMeasure(total, 0)} tCO₂e`} />
      <EmissionSourceFlow data={data} />
    </div>
  );
}

function RiskWarningPanel({ data }: { data: RiskWarning[] }) {
  const sorted = useMemo(() => {
    const order = { danger: 0, warning: 1, normal: 2 } as const;
    return data.toSorted((a, b) => order[a.status] - order[b.status]);
  }, [data]);
  const counts = useMemo(() => sorted.reduce((acc, item) => {
    acc[item.status] += 1;
    return acc;
  }, { danger: 0, warning: 0, normal: 0 }), [sorted]);

  return (
    <div className="cockpit-panel-fill cockpit-risk-panel">
      <PanelHeading icon={<AlertTriangle />} title="风险与决策事项" meta={`${data.length} 项`} tone="risk" />
      <StatusMatrix data={[
        { id: "danger", label: "立即决策", value: `${counts.danger} 项`, detail: "配额与合规", level: "danger" },
        { id: "warning", label: "持续关注", value: `${counts.warning} 项`, detail: "趋势与异常", level: "warning" },
        { id: "normal", label: "状态正常", value: `${counts.normal} 项`, detail: "无需处置", level: "normal" },
      ]} />
      {sorted.length ? (
        <div className="cockpit-alert-list cockpit-alert-list--compact">
          {sorted.slice(0, 2).map((item) => (
            <div className="cockpit-alert" data-level={item.status} key={`${item.label}-${item.value}`}>
              <span className="cockpit-alert__signal" aria-hidden="true" />
              <div className="min-w-0"><div className="cockpit-alert__title">{item.label}</div><div className="cockpit-alert__detail">{item.desc}</div></div>
              <span className="cockpit-alert__value">{item.value}</span>
            </div>
          ))}
          {sorted.length > 2 ? <div className="cockpit-list-overflow">另有 {sorted.length - 2} 项，进入功能面板查看</div> : null}
        </div>
      ) : <div className="cockpit-empty">当前没有风险事项</div>}
    </div>
  );
}

function MonthlyTrendPanel({ data }: { data: MonthlyTrendPoint[] }) {
  const trendData = useMemo<TrendDatum[]>(() => data.map((item) => ({
    label: item.month,
    actual: item.actual,
    target: item.target,
    forecast: item.forecast,
  })), [data]);
  const first = data.at(0);
  const latest = data.at(-1);
  const range = first && latest
    ? `${first.monthKey.replace("-", ".")}—${latest.monthKey.replace("-", ".")}`
    : "近12个月";

  return (
    <div className="p-4">
      <PanelHeading
        icon={<ChartNoAxesCombined />}
        title="近12个月月度排放"
        meta={latest ? `${range} · 本月实时` : "暂无数据"}
      />
      <AdaptiveTrendChart
        data={trendData}
        unit="tCO₂e"
        height={230}
        areaKey="actual"
        series={[
          { key: "actual", label: "实际", color: "#35d4e4" },
          { key: "target", label: "目标", color: "#d6ad5e", dashed: true },
          { key: "forecast", label: "预测", color: "#a7bdc2", dashed: true },
        ]}
      />
    </div>
  );
}

function ResourceAnalysisPanel({ data }: { data: ResourceConsumptionItem[] }) {
  const [viewMode, setViewMode] = useState<"total" | "perCapita">("total");
  const deltaMax = Math.max(1, ...data.flatMap((item) => [Math.abs(item.yoy), Math.abs(item.mom)]));

  return (
    <div>
      <PanelHeading
        icon={<Droplets />}
        title="资源消耗"
        meta={(
          <div className="flex gap-1">
            <button type="button" onClick={() => setViewMode("total")} aria-pressed={viewMode === "total"}>总量</button>
            <span>/</span>
            <button type="button" onClick={() => setViewMode("perCapita")} aria-pressed={viewMode === "perCapita"}>人均</button>
          </div>
        )}
      />
      <div className="cockpit-resource-grid">
        {data.map((item) => (
          <div className="cockpit-resource-tile" key={item.label}>
            <span>{item.label}</span>
            <strong>{viewMode === "total" ? item.totalValue : item.perCapitaValue}<small>{viewMode === "total" ? item.totalUnit : item.perCapitaUnit}</small></strong>
            <div className="cockpit-resource-deltas" aria-label={`${item.label}同比与环比变化`}>
              <ResourceDelta label="同比" value={item.yoy} maxMagnitude={deltaMax} />
              <ResourceDelta label="环比" value={item.mom} maxMagnitude={deltaMax} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceDelta({ label, value, maxMagnitude }: { label: string; value: number; maxMagnitude: number }) {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const Icon = direction === "up" ? TrendingUp : direction === "down" ? TrendingDown : Minus;
  const magnitude = Math.min(100, (Math.abs(value) / maxMagnitude) * 100);
  const formattedValue = `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

  return (
    <span className={`cockpit-resource-delta cockpit-resource-delta--${direction}`} aria-label={`${label} ${formattedValue}`}>
      <span className="cockpit-resource-delta__label">{label}</span>
      <span className="cockpit-resource-delta__track" aria-hidden="true">
        <span className="cockpit-resource-delta__zero" />
        <span className="cockpit-resource-delta__fill" style={{ width: `${magnitude}%` }} />
      </span>
      <span className="cockpit-resource-delta__value"><Icon aria-hidden="true" />{formattedValue}</span>
    </span>
  );
}

function CompositionPanel({ carbon, energy, water }: { carbon: CompositionItem[]; energy: CompositionItem[]; water: CompositionItem[] }) {
  const [activeTab, setActiveTab] = useState<"carbon" | "energy" | "water">("carbon");
  const datasets = { carbon, energy, water };
  const labels = { carbon: "碳排放", energy: "能源", water: "用水" };
  const icons = { carbon: <Leaf />, energy: <Zap />, water: <Droplets /> };
  const data = datasets[activeTab];

  return (
    <div>
      <PanelHeading
        icon={icons[activeTab]}
        title={`${labels[activeTab]}构成`}
        meta={(
          <select value={activeTab} onChange={(event) => setActiveTab(event.target.value as typeof activeTab)} aria-label="选择构成指标">
            {Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        )}
      />
      <CompositionWaffle data={data.map((item) => ({ id: item.name, label: item.name, value: item.value, color: item.color }))} unit="%" />
    </div>
  );
}

function BuildingPriorityPanel({ data }: { data: BuildingPriorityItem[] }) {
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Building2 />} title="建筑治理优先级" meta={`${data.length} 栋 · 强度 × 目标偏差`} tone="risk" />
      <BuildingPriorityScatter data={data} />
    </div>
  );
}

export default function LeaderDashboard() {
  const nowMs = useRealtimeNow();
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const dashboardData = useMemo(() => {
    if (nowMs === null) return null;
    const now = new Date(nowMs);
    return {
      kpis: getLeaderKPIs(now),
      economic: getEconomicZoneData(now),
      emissionSources: getEmissionSourceData(now),
      risks: getRiskWarnings(now),
      monthlyTrend: getMonthlyTrendData(now),
      resources: getResourceConsumptionData(now),
      buildingPriority: getBuildingPriorityData(now),
    };
  }, [nowMs]);

  const renderBuildingPopup = useCallback((building: CampusMapBuilding, onClose: () => void) => {
    if (nowMs === null) return null;
    return (
      <BuildingInsightPopup
        building={building}
        mode="leader"
        nowMs={nowMs}
        onClose={onClose}
      />
    );
  }, [nowMs]);

  if (dashboardData === null) return null;

  const leftPanels: FloatingPanelSpec[] = [
    { id: "economic-zone", label: "经济控制分区", className: "cockpit-economic-zone-panel", content: <EconomicZonePanel data={dashboardData.economic} /> },
    { id: "emission-source", label: "排放源构成", className: "cockpit-emission-source-panel", content: <EmissionSourcePanel data={dashboardData.emissionSources} /> },
    { id: "risk-warning", label: "风险与决策事项", className: "cockpit-risk-warning-panel", content: <RiskWarningPanel data={dashboardData.risks} /> },
  ];
  const rightPanels: FloatingPanelSpec[] = [
    { id: "resource-analysis", label: "资源消耗", priority: "critical", className: styles["resource-panel"], content: <ResourceAnalysisPanel data={dashboardData.resources} /> },
    { id: "composition", label: "分类构成", priority: "secondary", className: styles["composition-panel"], content: <CompositionPanel carbon={carbonCompositionData} energy={energyCompositionData} water={waterCompositionData} /> },
    { id: "building-priority", label: "建筑治理优先级", className: styles["priority-panel"], content: <BuildingPriorityPanel data={dashboardData.buildingPriority} /> },
  ];

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanels={leftPanels}
      rightPanels={rightPanels}
      centerBottomPanel={<MonthlyTrendPanel data={dashboardData.monthlyTrend} />}
      centerBottomLabel="近12个月月度排放"
      colorMode="carbon"
      selectedBuilding={selectedBuildingId}
    >
      <div className="relative h-full">
        <CampusTileBackground
          map="2_5d"
          onBuildingSelect={setSelectedBuildingId}
          renderBuildingPopup={renderBuildingPopup}
        />
        <KpiRibbon metrics={dashboardData.kpis.map((item) => ({ id: item.label, label: item.label, value: item.value, unit: item.unit, detail: item.sub }))} />
        {nowMs !== null ? (
          <div className="absolute right-3 top-3 z-20 rounded-md border border-cyan-400/20 bg-[#07152f]/90 px-2.5 py-1.5 text-xs text-cyan-100">
            数据截至 {formatCampusDateTime(new Date(nowMs))}
          </div>
        ) : null}
        <div className="map-legend-glass absolute bottom-3 rounded-lg p-2.5">
          <div className="mb-1.5 text-xs text-slate-400">建筑排放强度 · kgCO₂e/㎡</div>
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="h-2 w-9 bg-cyan-400" />低
            <span className="h-2 w-9 bg-amber-400" />关注
            <span className="h-2 w-9 bg-red-400" />高
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
