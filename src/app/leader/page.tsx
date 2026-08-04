"use client";

// Leader cockpit lives on its own route so the product root can be the login surface.

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  ChartNoAxesCombined,
  Droplets,
  Layers3,
  Leaf,
  Target,
  Zap,
} from "lucide-react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import { formatCampusDateTime } from "@/lib/campus-realtime";
import type { FloatingPanelSpec } from "@/components/dashboard/floating-glass-panel";
import {
  AdaptiveTrendChart,
  clampPercent,
  CompositionWaffle,
  DonutBreakdown,
  formatMeasure,
  GaugeDial,
  KpiRibbon,
  LollipopRanking,
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
  getEmissionRankingData,
} from "@/data/leader-dashboard-data";
import type {
  EconomicZoneData,
  EmissionSourceItem,
  RiskWarning,
  MonthlyTrendPoint,
  ResourceConsumptionItem,
  CompositionItem,
  EmissionRankingItem,
} from "@/data/leader-dashboard-data";

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
      <RadarProfile data={diagnostics.map((item) => ({ label: item.label, value: item.value, max: item.max }))} height={105} />
    </div>
  );
}

function EmissionSourcePanel({ data }: { data: EmissionSourceItem[] }) {
  const total = useMemo(() => data.reduce((sum, item) => sum + Math.max(item.value, 0), 0), [data]);
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Layers3 />} title="排放源构成" meta={`合计 ${formatMeasure(total, 0)} tCO₂e`} />
      <DonutBreakdown
        data={data.map((item) => ({ id: item.name, label: item.name, value: item.value, color: item.color }))}
        unit="tCO₂e"
        centerLabel="排放总量"
      />
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
          {sorted.slice(0, 3).map((item) => (
            <div className="cockpit-alert" data-level={item.status} key={`${item.label}-${item.value}`}>
              <span className="cockpit-alert__signal" aria-hidden="true" />
              <div className="min-w-0"><div className="cockpit-alert__title">{item.label}</div><div className="cockpit-alert__detail">{item.desc}</div></div>
              <span className="cockpit-alert__value">{item.value}</span>
            </div>
          ))}
          {sorted.length > 3 ? <div className="cockpit-list-overflow">另有 {sorted.length - 3} 项，进入功能面板查看</div> : null}
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
  const latest = data.at(-1);

  return (
    <div className="p-4">
      <PanelHeading
        icon={<ChartNoAxesCombined />}
        title="月度累计排放趋势"
        meta={latest ? `最新 ${formatMeasure(latest.actual, 0)} tCO₂e` : "暂无数据"}
      />
      <AdaptiveTrendChart
        data={trendData}
        unit="tCO₂e"
        height={190}
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
            <em>{item.yoyLabel}</em>
            <em>{item.momLabel}</em>
          </div>
        ))}
      </div>
    </div>
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

function EmissionRankingPanel({ data }: { data: EmissionRankingItem[] }) {
  return (
    <div>
      <PanelHeading icon={<Building2 />} title="建筑排放排名" meta={`${data.length} 栋`} tone="risk" />
      <LollipopRanking data={data.map((item) => ({ id: item.name, label: item.name, value: item.value, unit: item.unit, color: item.color }))} />
    </div>
  );
}

export default function LeaderDashboard() {
  const nowMs = useRealtimeNow();
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
      ranking: getEmissionRankingData(now),
    };
  }, [nowMs]);

  if (dashboardData === null) return null;

  const leftPanels: FloatingPanelSpec[] = [
    { id: "economic-zone", label: "经济控制分区", priority: "critical", content: <EconomicZonePanel data={dashboardData.economic} /> },
    { id: "emission-source", label: "排放源构成", content: <EmissionSourcePanel data={dashboardData.emissionSources} /> },
    { id: "risk-warning", label: "风险与决策事项", priority: "critical", content: <RiskWarningPanel data={dashboardData.risks} /> },
  ];
  const rightPanels: FloatingPanelSpec[] = [
    { id: "resource-analysis", label: "资源消耗", priority: "critical", content: <ResourceAnalysisPanel data={dashboardData.resources} /> },
    { id: "composition", label: "分类构成", priority: "secondary", content: <CompositionPanel carbon={carbonCompositionData} energy={energyCompositionData} water={waterCompositionData} /> },
    { id: "emission-ranking", label: "建筑排放排名", content: <EmissionRankingPanel data={dashboardData.ranking} /> },
  ];

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanels={leftPanels}
      rightPanels={rightPanels}
      centerBottomPanel={<MonthlyTrendPanel data={dashboardData.monthlyTrend} />}
      centerBottomLabel="月度累计排放趋势"
      colorMode="carbon"
    >
      <div className="relative h-full">
        <CampusTileBackground map="2_5d" />
        <KpiRibbon metrics={dashboardData.kpis.map((item) => ({ id: item.label, label: item.label, value: item.value, unit: item.unit, detail: item.sub }))} />
        {nowMs !== null ? (
          <div className="absolute right-3 top-3 z-20 rounded-md border border-cyan-400/20 bg-[#07152f]/90 px-2 py-1 text-[10px] text-cyan-100">
            数据截至 {formatCampusDateTime(new Date(nowMs))}
          </div>
        ) : null}
        <div className="map-legend-glass absolute bottom-3 rounded-lg p-2">
          <div className="mb-1 text-[9px] text-slate-400">建筑排放强度 · kgCO₂e/㎡</div>
          <div className="flex items-center gap-2 text-[9px] text-slate-400">
            <span className="h-1.5 w-8 bg-cyan-400" />低
            <span className="h-1.5 w-8 bg-amber-400" />关注
            <span className="h-1.5 w-8 bg-red-400" />高
          </div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
