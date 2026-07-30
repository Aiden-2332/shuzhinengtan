"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, ChevronDown } from "lucide-react";
import { CampusScene3D } from "@/components/3d/campus-scene";
import {
  FloatingGlassPanel,
  type FloatingPanelSpec,
} from "@/components/dashboard/floating-glass-panel";

const NOOP = () => undefined;

interface ThreeColumnLayoutProps {
  children?: ReactNode;
  level: "L1" | "L2" | "L3" | "L4";
  leftPanels?: FloatingPanelSpec[];
  rightPanels?: FloatingPanelSpec[];
  /** Legacy slots remain supported for non-migrated callers. */
  leftPanel?: ReactNode;
  rightPanel?: ReactNode;
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  colorMode?: "carbon" | "energy";
  bottomPanel?: ReactNode;
  centerBottomPanel?: ReactNode;
  centerBottomLabel?: string;
}

function PanelRail({
  side,
  panels,
  fallback,
}: {
  side: "left" | "right";
  panels?: FloatingPanelSpec[];
  fallback?: ReactNode;
}) {
  return (
    <aside className={`cockpit-panel-rail cockpit-panel-rail--${side}`} aria-label={`${side === "left" ? "左侧" : "右侧"}数据浮窗`}>
      {panels?.map((panel) => (
        <FloatingGlassPanel key={panel.id} {...panel} />
      )) ?? fallback}
    </aside>
  );
}

export function ThreeColumnLayout({
  children,
  level,
  leftPanels,
  rightPanels,
  leftPanel,
  rightPanel,
  selectedBuilding,
  onBuildingClick,
  filterType,
  colorMode,
  bottomPanel,
  centerBottomPanel,
  centerBottomLabel = "趋势分析",
}: ThreeColumnLayoutProps) {
  const [bottomOpen, setBottomOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!bottomOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBottomOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bottomOpen]);

  return (
    <div className="cockpit-shell relative isolate h-full min-h-0 overflow-hidden text-slate-100">
      <div className="absolute inset-0 z-0">
        {children ?? (
          <CampusScene3D
            level={level}
            selectedBuilding={selectedBuilding ?? null}
            onBuildingClick={onBuildingClick ?? NOOP}
            filterType={filterType ?? null}
            colorMode={colorMode ?? "carbon"}
          />
        )}
      </div>

      <PanelRail side="left" panels={leftPanels} fallback={leftPanel} />
      <PanelRail side="right" panels={rightPanels} fallback={rightPanel} />

      {centerBottomPanel ? (
        <>
          <button
            type="button"
            className="cockpit-trend-trigger"
            onClick={() => setBottomOpen((current) => !current)}
            aria-expanded={bottomOpen}
            aria-controls="cockpit-trend-drawer"
          >
            <Activity className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{centerBottomLabel}</span>
            <ChevronDown className="h-3.5 w-3.5" data-open={bottomOpen ? "true" : "false"} aria-hidden="true" />
          </button>
          <AnimatePresence initial={false}>
            {bottomOpen ? (
              <motion.section
                id="cockpit-trend-drawer"
                key="trend-drawer"
                className="cockpit-trend-drawer"
                initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.99 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {centerBottomPanel}
              </motion.section>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}

      {bottomPanel ? <section className="cockpit-bottom-strip">{bottomPanel}</section> : null}

      <div className="cockpit-demo-note">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
