"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllAlarms } from "@/data/alarm-data";
import {
  getCampusMapBuildings,
  type CampusMapBuilding,
  type CampusMapKind,
} from "@/data/campus-map-buildings";
import { BuildingInsightPopup } from "@/components/dashboard/building-insight-popup";
import { CampusMapOverlayControls } from "@/components/dashboard/campus-map-overlay-controls";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import { useCampusMapToolbarStore } from "@/stores/campus-map-toolbar-store";
import Header from "./header";
import {
  LeaderBottom,
  LeaderKpi,
  LeaderLeft,
  LeaderRight,
} from "./leader-dashboard";
import {
  LogisticsBottom,
  LogisticsKpi,
  LogisticsLeft,
  LogisticsRight,
} from "./logistics-dashboard";
import FunctionCenter from "./function-center";
import "./screen.css";

type Page = "leader" | "logistics" | "function";

const NAV = [
  { key: "leader" as const, href: "/leader", label: "领导驾驶舱", icon: "◈" },
  { key: "logistics" as const, href: "/operations", label: "后勤组驾驶舱", icon: "◉" },
  { key: "function" as const, href: "/portal", label: "功能中心", icon: "◫" },
];

const OPERATIONS_BUILDING_IDS = new Set(
  getCampusMapBuildings("2d").map((building) => building.id),
);

function pageFromPath(pathname: string): Page {
  if (pathname === "/operations") return "logistics";
  if (pathname === "/portal") return "function";
  return "leader";
}

function NavBar({ page }: { page: Page }) {
  const router = useRouter();

  return (
    <div className="figma-nav-list">
      {NAV.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-current={page === item.key ? "page" : undefined}
          className={`figma-nav-tab ${page === item.key ? "active" : ""}`}
          onClick={() => router.push(item.href)}
        >
          <span className="figma-nav-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function FunctionCenterKpi() {
  const stats = [
    { label: "系统接入设备", value: "3,642", unit: "台", color: "#00d4ff" },
    { label: "本月碳排放量", value: "11,820", unit: "tCO₂", color: "#00d4ff" },
    { label: "数据完整率", value: "98.6", unit: "%", color: "#00e090" },
    { label: "待处理告警", value: "5", unit: "条", color: "#ff8c42" },
  ];

  return (
    <div className="figma-kpi-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="figma-kpi-card">
          <div className="figma-kpi-label">{stat.label}</div>
          <div className="figma-kpi-line">
            <span className="figma-kpi-value" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}80` }}>{stat.value}</span>
            <span className="figma-kpi-unit">{stat.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function MapToolbar() {
  const toolbar = useCampusMapToolbarStore((state) => state.toolbar);
  const setMapLabels = useCampusMapToolbarStore((state) => state.setShowLabels);
  const setMapBuildingFrames = useCampusMapToolbarStore((state) => state.setShowBuildingFrames);
  const setMapLayer = useCampusMapToolbarStore((state) => state.setActiveLayer);
  const selectMapBuilding = useCampusMapToolbarStore((state) => state.selectBuilding);

  if (!toolbar) return null;

  return (
    <div className="figma-map-toolbar">
      <CampusMapOverlayControls
        key={toolbar.ownerId}
        buildings={toolbar.buildings}
        selectedBuildingId={toolbar.selectedBuildingId}
        showLabels={toolbar.showLabels}
        showBuildingFrames={toolbar.showBuildingFrames}
        activeLayer={toolbar.activeLayer}
        onShowLabelsChange={setMapLabels}
        onShowBuildingFramesChange={setMapBuildingFrames}
        onLayerChange={setMapLayer}
        onBuildingSelect={selectMapBuilding}
      />
    </div>
  );
}

function InteractiveCampusMap({ page }: { page: Exclude<Page, "function"> }) {
  const nowMs = useRealtimeNow();
  const map: CampusMapKind = page === "leader" ? "2_5d" : "2d";
  const [initialBuildingId, setInitialBuildingId] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [focusedAlarmId, setFocusedAlarmId] = useState<string | null>(null);
  const deepLinkHandledRef = useRef(false);
  const allAlarms = useMemo(
    () => (page === "logistics" && nowMs !== null ? getAllAlarms(new Date(nowMs)) : []),
    [nowMs, page],
  );

  useEffect(() => {
    deepLinkHandledRef.current = false;
    setInitialBuildingId(null);
    setSelectedBuildingId(null);
    setFocusedAlarmId(null);
  }, [page]);

  useEffect(() => {
    if (page !== "logistics" || deepLinkHandledRef.current || nowMs === null) return;
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
      if (requestedBuildingId && !buildingId) url.searchParams.delete("building");
      if (!buildingId || (requestedAlarmId && !alarmId)) url.searchParams.delete("alarm");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
  }, [allAlarms, nowMs, page]);

  const handleBuildingSelect = useCallback((buildingId: string | null) => {
    const buildingChanged = buildingId !== selectedBuildingId;
    setSelectedBuildingId(buildingId);
    if (page !== "logistics") return;

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
  }, [page, selectedBuildingId]);

  const renderBuildingPopup = useCallback(
    (building: CampusMapBuilding, onClose: () => void) => (
      <BuildingInsightPopup
        building={building}
        mode={page === "leader" ? "leader" : "operations"}
        nowMs={nowMs ?? 0}
        focusedAlarmId={focusedAlarmId}
        onClose={onClose}
      />
    ),
    [focusedAlarmId, nowMs, page],
  );

  return (
    <CampusTileBackground
      map={map}
      initialBuildingId={initialBuildingId}
      onBuildingSelect={handleBuildingSelect}
      renderBuildingPopup={renderBuildingPopup}
      tone={page === "leader" ? "leader" : "operations"}
      cockpit
    />
  );
}

export default function FigmaCockpitScreen() {
  const pathname = usePathname();
  const page = pageFromPath(pathname);

  return (
    <div className="figma-cockpit">
      <Header />

      <div className="figma-kpi-strip">
        {page === "leader" ? <LeaderKpi /> : page === "logistics" ? <LogisticsKpi /> : <FunctionCenterKpi />}
      </div>

      {page !== "function" ? (
        <>
          <div className="figma-map-stage">
            <div className="figma-live-map">
              <InteractiveCampusMap page={page} />
            </div>
            <MapToolbar />

            <aside className="figma-side-panel figma-side-left">
              {page === "leader" ? <LeaderLeft /> : <LogisticsLeft />}
            </aside>

            <aside className="figma-side-panel figma-side-right">
              {page === "leader" ? <LeaderRight /> : <LogisticsRight />}
            </aside>

            <div className="figma-map-nav"><NavBar page={page} /></div>
            <div className="figma-bottom-strip">
              {page === "leader" ? <LeaderBottom /> : <LogisticsBottom />}
            </div>
          </div>
        </>
      ) : (
        <div className="figma-function-stage">
          <div className="figma-function-grid-bg" />
          <div className="figma-function-content"><FunctionCenter /></div>
          <div className="figma-function-nav"><NavBar page={page} /></div>
        </div>
      )}
    </div>
  );
}
