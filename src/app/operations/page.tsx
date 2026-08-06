"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  Building2,
  Cpu,
  Gauge,
  RadioTower,
  Wrench,
} from "lucide-react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { BuildingInsightPopup } from "@/components/dashboard/building-insight-popup";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import type { FloatingPanelSpec } from "@/components/dashboard/floating-glass-panel";
import {
  AdaptiveTrendChart,
  DonutBreakdown,
  formatMeasure,
  GaugeGrid,
  KpiRibbon,
  LollipopRanking,
  PanelHeading,
  StatusMatrix,
  type TrendDatum,
} from "@/components/dashboard/cockpit-visuals";
import {
  getOperationsKPIs,
  getCarbonOverview,
  getAlertsData,
  getDeviceWarnings,
  getSystemEfficiency,
  getInstrumentStatus,
  getBuildingEnergyRanking,
  getRealtimeLoadData,
  type CarbonOverview,
  type AlertItem,
  type DeviceWarningItem,
  type SystemEfficiencyItem,
  type InstrumentStatus,
  type BuildingEnergyRankItem,
  type LoadCurvePoint,
} from "@/data/operations-data";
import { getCampusMapBuildings, type CampusMapBuilding } from "@/data/campus-map-buildings";
import { getAllAlarms } from "@/data/alarm-data";

const LEVEL_LABELS = { emergency: "紧急", important: "重要", minor: "次要" } as const;
const LEVEL_ORDER = { emergency: 0, important: 1, minor: 2 } as const;
const LEVEL_TONE = { emergency: "danger", important: "warning", minor: "normal" } as const;
const OPERATIONS_BUILDING_IDS = new Set(getCampusMapBuildings("2d").map((building) => building.id));

function CarbonOverviewPanel({ data }: { data: CarbonOverview }) {
  const scopes = [
    { id: "scope-1", label: "范围 1", value: data.scope1, color: "#d6ad5e" },
    { id: "scope-2", label: "范围 2", value: data.scope2, color: "#35d4e4" },
    { id: "scope-3", label: "范围 3", value: data.scope3, color: "#789fff" },
  ];
  return (
    <div className="cockpit-panel-fill cockpit-panel-fill--spread">
      <PanelHeading icon={<BarChart3 />} title="碳排放总览" meta={`同比 ${data.yoy > 0 ? "+" : ""}${formatMeasure(data.yoy)}%`} />
      <div className="cockpit-metric-band">
        <div><div className="cockpit-metric-band__label">年度累计</div><div className="cockpit-metric-band__value">{formatMeasure(data.annual, 0)}<small>tCO₂e</small></div></div>
        <div className="cockpit-metric-band__aside"><strong>{formatMeasure(data.today)}</strong><span>今日 tCO₂e</span></div>
      </div>
      <div className="cockpit-facts">
        <div className="cockpit-fact"><span>本月</span><strong>{formatMeasure(data.monthly, 0)}<small>tCO₂e</small></strong></div>
        <div className="cockpit-fact"><span>范围数量</span><strong>{scopes.length}<small>类</small></strong></div>
      </div>
      <DonutBreakdown data={scopes} unit="tCO₂e" centerLabel="范围合计" />
    </div>
  );
}

function AlertCenterPanel({ alerts }: { alerts: AlertItem[] }) {
  const ordered = useMemo(() => alerts.toSorted((a, b) => {
    const levelDiff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    return levelDiff || b.time.localeCompare(a.time);
  }), [alerts]);
  const counts = useMemo(() => alerts.reduce<Record<AlertItem["level"], number>>((acc, item) => {
    acc[item.level] += 1;
    return acc;
  }, { emergency: 0, important: 0, minor: 0 }), [alerts]);
  const visibleAlerts = ordered.slice(0, 2);

  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Bell />} title="实时告警" meta={`${alerts.length} 条`} tone="risk" />
      <DonutBreakdown
        data={[
          { id: "emergency", label: LEVEL_LABELS.emergency, value: counts.emergency, color: "#e96f83" },
          { id: "important", label: LEVEL_LABELS.important, value: counts.important, color: "#f0b94f" },
          { id: "minor", label: LEVEL_LABELS.minor, value: counts.minor, color: "#4cc9a4" },
        ]}
        unit="条"
        centerLabel="待处理"
      />
      {ordered.length ? <div className="cockpit-alert-list cockpit-alert-list--compact">
        {visibleAlerts.map((alert) => (
          <div className="cockpit-alert" data-level={LEVEL_TONE[alert.level]} key={`${alert.title}-${alert.location}-${alert.time}`}>
            <span className="cockpit-alert__signal" aria-hidden="true" />
            <div className="min-w-0"><div className="cockpit-alert__title">{alert.title}</div><div className="cockpit-alert__detail">{alert.location} · {alert.category}</div></div>
            <span className="cockpit-alert__value">{alert.time}</span>
          </div>
        ))}
        {ordered.length > visibleAlerts.length ? <div className="cockpit-list-overflow">另有 {ordered.length - visibleAlerts.length} 条，进入功能面板查看</div> : null}
      </div> : <div className="cockpit-empty">当前没有未处理告警</div>}
    </div>
  );
}

function DeviceWarningPanel({ warnings }: { warnings: DeviceWarningItem[] }) {
  const ordered = useMemo(() => warnings.toSorted((a, b) => {
    const levelDiff = LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level];
    return levelDiff || b.time.localeCompare(a.time);
  }), [warnings]);
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Wrench />} title="设备预警" meta={`${warnings.length} 台`} tone="risk" />
      <StatusMatrix
        emptyLabel="设备运行正常"
        data={ordered.map((warning) => ({
          id: `${warning.device}-${warning.issue}-${warning.time}`,
          label: warning.device,
          value: warning.time,
          detail: warning.issue,
          level: LEVEL_TONE[warning.level],
        })).slice(0, 4)}
      />
      {ordered.length > 4 ? <div className="cockpit-list-overflow">另有 {ordered.length - 4} 台预警设备</div> : null}
    </div>
  );
}

function SystemEfficiencyPanel({ systems }: { systems: SystemEfficiencyItem[] }) {
  return (
    <div className="cockpit-panel-fill cockpit-system-panel">
      <PanelHeading icon={<Cpu />} title="重点系统效率" meta={`${systems.length} 个系统`} />
      <GaugeGrid data={systems.map((system) => ({
        id: system.name,
        label: system.name,
        value: system.efficiency,
        unit: "%",
        detail: `运行 ${system.runningUnits}/${system.totalUnits} · 低效 ${system.lowEfficiencyCount}`,
      }))} />
    </div>
  );
}

function InstrumentStatusPanel({ data }: { data: InstrumentStatus }) {
  const rows = [
    { id: "online", label: "仪表在线率", value: data.onlineRate, unit: "%", detail: `在线 ${data.onlineCount} · 离线 ${data.offlineCount}` },
    { id: "complete", label: "数据完整率", value: data.completenessRate, unit: "%", detail: `完整 ${data.completeCount} · 缺失 ${data.missingCount}` },
  ];
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Gauge />} title="仪表与数据状态" meta="实时质量" />
      <GaugeGrid data={rows} />
    </div>
  );
}

function BuildingRankingPanel({ buildings }: { buildings: BuildingEnergyRankItem[] }) {
  return (
    <div className="cockpit-panel-fill">
      <PanelHeading icon={<Building2 />} title="建筑能耗强度" meta={`${buildings.length} 栋`} />
      <LollipopRanking data={buildings.map((building) => ({ id: building.name, label: building.name, value: building.value, unit: "kWh/㎡" }))} />
    </div>
  );
}

function RealtimeLoadPanel({ data }: { data: LoadCurvePoint[] }) {
  const trendData = useMemo<TrendDatum[]>(() => data.map((item) => ({
    label: item.time,
    realtime: item.realtime,
    yesterday: item.yesterday,
    forecast: item.forecast,
  })), [data]);
  const latest = [...data].reverse().find((item) => Number.isFinite(item.realtime));
  return (
    <div className="p-4">
      <PanelHeading icon={<Activity />} title="校园实时负荷" meta={latest ? `当前 ${formatMeasure(latest.realtime)} kW · ${latest.time}` : "暂无实时数据"} />
      <AdaptiveTrendChart
        data={trendData}
        unit="kW"
        height={190}
        series={[
          { key: "realtime", label: "实时", color: "#35d4e4" },
          { key: "yesterday", label: "昨日", color: "#d6ad5e", presentation: "bar" },
          { key: "forecast", label: "预测", color: "#a7bdc2", dashed: true },
        ]}
      />
    </div>
  );
}

export default function OperationsDashboardPage() {
  const nowMs = useRealtimeNow();
  const [initialBuildingId, setInitialBuildingId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [focusedAlarmId, setFocusedAlarmId] = useState<string | null>(null);
  const deepLinkHandledRef = useRef(false);
  const kpis = useMemo(() => nowMs === null ? [] : getOperationsKPIs(new Date(nowMs)), [nowMs]);
  const carbonOverview = useMemo(() => nowMs === null ? null : getCarbonOverview(new Date(nowMs)), [nowMs]);
  const alerts = useMemo(() => nowMs === null ? [] : getAlertsData(new Date(nowMs)), [nowMs]);
  const warnings = useMemo(() => nowMs === null ? [] : getDeviceWarnings(new Date(nowMs)), [nowMs]);
  const systems = useMemo(() => getSystemEfficiency(), []);
  const instruments = useMemo(() => getInstrumentStatus(), []);
  const buildings = useMemo(() => nowMs === null ? [] : getBuildingEnergyRanking(new Date(nowMs)), [nowMs]);
  const load = useMemo(() => nowMs === null ? [] : getRealtimeLoadData(new Date(nowMs)), [nowMs]);
  const allAlarms = useMemo(() => nowMs === null ? [] : getAllAlarms(new Date(nowMs)), [nowMs]);

  useEffect(() => {
    if (deepLinkHandledRef.current || nowMs === null) return;
    deepLinkHandledRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const requestedBuildingId = params.get("building");
    const requestedAlarmId = params.get("alarm");
    const buildingId = requestedBuildingId && OPERATIONS_BUILDING_IDS.has(requestedBuildingId)
      ? requestedBuildingId
      : null;
    const matchedAlarm = requestedAlarmId
      ? allAlarms.find((alarm) => alarm.id === requestedAlarmId)
      : null;
    const alarmId = buildingId && matchedAlarm?.buildingId === buildingId
      ? matchedAlarm.id
      : null;
    setInitialBuildingId(buildingId);
    setSelectedBuildingId(buildingId);
    setFocusedAlarmId(alarmId);

    if ((requestedBuildingId && !buildingId) || (requestedAlarmId && !alarmId)) {
      const url = new URL(window.location.href);
      if (requestedBuildingId && !buildingId) {
        url.searchParams.delete("building");
      }
      if (!buildingId || (requestedAlarmId && !alarmId)) {
        url.searchParams.delete("alarm");
      }
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [allAlarms, nowMs]);

  const handleBuildingSelect = useCallback((buildingId: string | null) => {
    const buildingChanged = buildingId !== selectedBuildingId;
    setSelectedBuildingId(buildingId);
    const url = new URL(window.location.href);
    if (buildingId) {
      url.searchParams.set("building", buildingId);
      if (buildingChanged) {
        url.searchParams.delete("alarm");
        setFocusedAlarmId(null);
      }
    } else {
      url.searchParams.delete("building");
      url.searchParams.delete("alarm");
      setFocusedAlarmId(null);
    }
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, [selectedBuildingId]);

  const renderBuildingPopup = useCallback((building: CampusMapBuilding, onClose: () => void) => (
    <BuildingInsightPopup
      building={building}
      mode="operations"
      nowMs={nowMs ?? 0}
      focusedAlarmId={focusedAlarmId}
      onClose={onClose}
    />
  ), [focusedAlarmId, nowMs]);

  const leftPanels: FloatingPanelSpec[] = [
    { id: "carbon-overview", label: "碳排放总览", priority: "critical", content: carbonOverview ? <CarbonOverviewPanel data={carbonOverview} /> : null },
    { id: "alert-center", label: "实时告警", priority: "critical", content: <AlertCenterPanel alerts={alerts} /> },
    { id: "device-warning", label: "设备预警", content: <DeviceWarningPanel warnings={warnings} /> },
  ];
  const rightPanels: FloatingPanelSpec[] = [
    { id: "system-efficiency", label: "重点系统效率", content: <SystemEfficiencyPanel systems={systems} /> },
    { id: "instrument-status", label: "仪表与数据状态", priority: "critical", content: <InstrumentStatusPanel data={instruments} /> },
    { id: "building-ranking", label: "建筑能耗强度", priority: "secondary", content: <BuildingRankingPanel buildings={buildings} /> },
  ];

  return (
    <ThreeColumnLayout
      level="L3"
      leftPanels={leftPanels}
      rightPanels={rightPanels}
      centerBottomPanel={<RealtimeLoadPanel data={load} />}
      centerBottomLabel="校园实时负荷"
      colorMode="energy"
      selectedBuilding={selectedBuildingId}
    >
      <div className="relative h-full">
        <CampusTileBackground
          map="2d"
          initialBuildingId={initialBuildingId}
          onBuildingSelect={handleBuildingSelect}
          renderBuildingPopup={renderBuildingPopup}
        />
        <KpiRibbon
          liveLabel="运行数据同步"
          metrics={kpis.map((item) => ({
            id: item.type,
            label: item.label,
            value: item.value,
            unit: item.unit,
            detail: `同比 ${item.yoy > 0 ? "+" : ""}${formatMeasure(item.yoy)}% · 预算 ${formatMeasure(item.budgetProgress)}%`,
          }))}
        />
        <div className="map-legend-glass absolute bottom-3 rounded-lg p-2">
          <div className="flex items-center gap-2 text-[9px] text-slate-400"><RadioTower className="h-3 w-3" />建筑点位 · 点击查看实时状态</div>
        </div>
      </div>
    </ThreeColumnLayout>
  );
}
