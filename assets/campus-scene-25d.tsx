"use client";

import { useMemo, useState } from "react";
import {
  CAMPUS_BUILDINGS,
  CAMPUS_LEVELS,
  CAMPUS_MAP_VIEWBOX,
  CAMPUS_METRICS,
  getCampusBuildingValue,
  getCampusEmissionLevel,
  type CampusBuildingOverlay,
  type CampusMetricMode,
} from "@/data/campus-map-config";
import styles from "./campus-scene-25d.module.css";

interface CampusScene25DProps {
  level?: "L1" | "L2" | "L3" | "L4";
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  colorMode?: CampusMetricMode;
}

function markerCardPlacement(building: CampusBuildingOverlay) {
  const isRight = building.markerPosition.x > CAMPUS_MAP_VIEWBOX.width * 0.72;
  const isTop = building.markerPosition.y < CAMPUS_MAP_VIEWBOX.height * 0.25;
  return {
    x: isRight ? -224 : 24,
    y: isTop ? 18 : -82,
  };
}

export function CampusScene25D({
  selectedBuilding,
  onBuildingClick,
  filterType,
  colorMode = "carbon",
}: CampusScene25DProps) {
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [localSelection, setLocalSelection] = useState<string | null>(null);
  const metric = CAMPUS_METRICS[colorMode];
  const activeBuildingId = selectedBuilding ?? localSelection;

  const visibleBuildings = useMemo(
    () =>
      CAMPUS_BUILDINGS.filter(
        (building) => !filterType || building.type === filterType,
      ),
    [filterType],
  );

  const showCardFor = hoveredBuilding ?? activeBuildingId;

  function selectBuilding(buildingId: string) {
    setLocalSelection((current) => (current === buildingId ? null : buildingId));
    onBuildingClick?.(buildingId);
  }

  return (
    <section className={styles.scene} aria-label={metric.title}>
      <div className={styles.mapFrame}>
        <img
          className={styles.baseImage}
          src="/dashboard/campus-map.svg"
          alt="校园楼宇二维半鸟瞰地图"
        />
        <svg
          className={styles.overlay}
          viewBox={`0 0 ${CAMPUS_MAP_VIEWBOX.width} ${CAMPUS_MAP_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid slice"
          role="group"
          aria-label="七个楼宇监测对象"
        >
          <defs>
            <filter id="campus-building-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="campus-building-glow-active" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="5.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="campus-pin-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {visibleBuildings.map((building) => {
            const value = getCampusBuildingValue(building, colorMode);
            const level = getCampusEmissionLevel(value, colorMode);
            const color = CAMPUS_LEVELS[level].color;
            const isActive = activeBuildingId === building.id;
            return (
              <path
                key={`shape-${building.id}`}
                d={building.path}
                className={styles.building}
                data-active={isActive}
                fill={`${color}48`}
                stroke={color}
                strokeWidth={isActive ? 4 : 2.4}
                filter={isActive ? "url(#campus-building-glow-active)" : "url(#campus-building-glow)"}
                tabIndex={0}
                role="button"
                aria-label={`${building.name}，${value} ${metric.unit}，${CAMPUS_LEVELS[level].label}`}
                onFocus={() => setHoveredBuilding(building.id)}
                onBlur={() => setHoveredBuilding(null)}
                onMouseEnter={() => setHoveredBuilding(building.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => selectBuilding(building.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectBuilding(building.id);
                  }
                }}
              />
            );
          })}

          {visibleBuildings.map((building) => {
            const { x, y } = building.markerPosition;
            const value = getCampusBuildingValue(building, colorMode);
            const level = getCampusEmissionLevel(value, colorMode);
            const levelInfo = CAMPUS_LEVELS[level];
            const isActive = activeBuildingId === building.id;
            const card = markerCardPlacement(building);
            const showCard = showCardFor === building.id;
            return (
              <g
                key={`marker-${building.id}`}
                className={styles.marker}
                data-active={isActive}
                tabIndex={0}
                role="button"
                aria-label={`查看${building.name}信息`}
                onFocus={() => setHoveredBuilding(building.id)}
                onBlur={() => setHoveredBuilding(null)}
                onMouseEnter={() => setHoveredBuilding(building.id)}
                onMouseLeave={() => setHoveredBuilding(null)}
                onClick={() => selectBuilding(building.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    selectBuilding(building.id);
                  }
                }}
              >
                <circle className={styles.pulse} cx={x} cy={y} r="24" fill="rgba(45,236,248,.16)" />
                <line className={styles.markerLine} x1={x} y1={y + 17} x2={x} y2={y + 47} stroke="#44eff8" strokeWidth="2" />
                <path d={`M${x} ${y + 50} l-7 -12 h14 Z`} fill="#44eff8" filter="url(#campus-pin-glow)" />
                <circle className={styles.markerCore} cx={x} cy={y} r="17" fill="rgba(4,28,45,.92)" stroke="#56f5ff" strokeWidth="2" filter="url(#campus-pin-glow)" />
                <path d={`M${x - 7} ${y + 7} V${y - 7} H${x + 7} V${y + 7} M${x - 3} ${y - 3} V${y + 4} M${x + 2} ${y - 3} V${y + 4}`} fill="none" stroke="#b9fbff" strokeWidth="2" strokeLinecap="round" />

                {showCard && (
                  <g className={styles.tooltip} aria-live="polite">
                    <rect x={x + card.x} y={y + card.y} width="204" height="66" rx="4" fill="rgba(2,20,35,.96)" stroke="rgba(72,231,245,.72)" />
                    <text x={x + card.x + 12} y={y + card.y + 21} fill="#e7fdff" fontSize="14" fontWeight="700">{building.name}</text>
                    <text x={x + card.x + 12} y={y + card.y + 43} fill={levelInfo.color} fontSize="15" fontFamily="ui-monospace, monospace" fontWeight="700">{value.toFixed(1)}</text>
                    <text x={x + card.x + 64} y={y + card.y + 43} fill="#8ebbc4" fontSize="10">{metric.unit}</text>
                    <text x={x + card.x + 12} y={y + card.y + 58} fill="#9cc7ce" fontSize="10">{levelInfo.label}</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className={`${styles.panel} ${styles.heading}`}>
        <div className="text-[13px] font-semibold">{metric.title}</div>
        <div className="mt-1 text-[10px] text-cyan-200/60">
          {metric.shortName} · {metric.unit}
        </div>
      </div>

      <div className={`${styles.panel} ${styles.legend}`} aria-label="排放等级图例">
        {(Object.keys(CAMPUS_LEVELS) as Array<keyof typeof CAMPUS_LEVELS>).map((level) => {
          const item = CAMPUS_LEVELS[level];
          const thresholds = metric.thresholds;
          const range =
            level === "low"
              ? `<${thresholds.low}`
              : level === "medium"
                ? `${thresholds.low}–${thresholds.medium}`
                : level === "high"
                  ? `${thresholds.medium}–${thresholds.high}`
                  : `>${thresholds.high}`;
          return (
            <span key={level} className="flex items-center gap-1 text-[9px] text-cyan-50/80">
              <i className="h-2 w-4" style={{ backgroundColor: item.color }} />
              {item.label} {range}
            </span>
          );
        })}
      </div>
    </section>
  );
}
