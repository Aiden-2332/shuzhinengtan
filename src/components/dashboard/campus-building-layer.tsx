"use client";

import { useMemo } from "react";
import { X } from "lucide-react";

import type { CampusMapBuilding } from "@/data/campus-map-buildings";

export interface CampusBuildingLayerProps {
  buildings: CampusMapBuilding[];
  mapWidth: number;
  mapHeight: number;
  view: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  showLabels: boolean;
  selectedBuildingId: string | null;
  animateTransform: boolean;
  onSelect: (id: string | null) => void;
  cockpit?: boolean;
}

interface ProjectedBuilding {
  building: CampusMapBuilding;
  points: string;
  screenX: number;
  screenY: number;
  markerScreenX: number;
  markerScreenY: number;
  isOnScreen: boolean;
}

const LABEL_VIEWPORT_MARGIN = 140;
const POPUP_EDGE_GAP = 12;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

/**
 * Authoritative USTB building hit areas projected through the same image-pixel
 * view transform as the raster tiles.
 */
export function CampusBuildingLayer({
  buildings,
  mapWidth,
  mapHeight,
  view,
  viewport,
  showLabels,
  selectedBuildingId,
  animateTransform,
  onSelect,
  cockpit = false,
}: CampusBuildingLayerProps) {
  const grade = (value: number | undefined) => {
    if (value == null) return null;
    if (value > 50) return { label: "高排放", color: "#ff4f57" };
    if (value >= 30) return { label: "中高排放", color: "#ff963c" };
    if (value >= 15) return { label: "中等排放", color: "#ffd34e" };
    return { label: "低排放", color: "#72dc91" };
  };
  const projectedBuildings = useMemo<ProjectedBuilding[]>(
    () =>
      buildings.map((building) => {
        const screenX = view.offsetX + building.anchor[0] * view.scale;
        const screenY = view.offsetY + building.anchor[1] * view.scale;
        const ys = building.polygon.map(([, y]) => y);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const roofBand = building.polygon.filter(
          ([, y]) => y <= minY + (maxY - minY) * 0.2,
        );
        const markerX =
          roofBand.reduce((sum, [x]) => sum + x, 0) /
          Math.max(roofBand.length, 1);
        const markerY =
          roofBand.reduce((sum, [, y]) => sum + y, 0) /
          Math.max(roofBand.length, 1);
        const markerScreenX = view.offsetX + markerX * view.scale;
        const markerScreenY = view.offsetY + markerY * view.scale;

        return {
          building,
          points: building.polygon
            .map(([x, y]) => `${x},${y}`)
            .join(" "),
          screenX,
          screenY,
          markerScreenX,
          markerScreenY,
          isOnScreen:
            markerScreenX >= -LABEL_VIEWPORT_MARGIN &&
            markerScreenX <= viewport.width + LABEL_VIEWPORT_MARGIN &&
            markerScreenY >= -LABEL_VIEWPORT_MARGIN &&
            markerScreenY <= viewport.height + LABEL_VIEWPORT_MARGIN,
        };
      }),
    [
      buildings,
      view.offsetX,
      view.offsetY,
      view.scale,
      viewport.height,
      viewport.width,
    ],
  );

  const selectedBuilding = useMemo(
    () =>
      projectedBuildings.find(
        ({ building }) => building.id === selectedBuildingId,
      ) ?? null,
    [projectedBuildings, selectedBuildingId],
  );

  const popupPosition = useMemo(() => {
    if (!selectedBuilding || viewport.width <= 0 || viewport.height <= 0) {
      return null;
    }

    return {
      x: clamp(
        selectedBuilding.markerScreenX,
        POPUP_EDGE_GAP + 20,
        viewport.width - POPUP_EDGE_GAP - 20,
      ),
      y: clamp(
        selectedBuilding.markerScreenY - 22,
        POPUP_EDGE_GAP + 32,
        viewport.height - POPUP_EDGE_GAP,
      ),
    };
  }, [selectedBuilding, viewport.height, viewport.width]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[12] overflow-clip"
      aria-label="校园建筑交互图层"
    >
      <div
        className={`pointer-events-none absolute left-0 top-0 origin-top-left will-change-transform ${
          animateTransform ? "transition-transform duration-150 ease-out" : ""
        }`}
        style={{
          width: mapWidth,
          height: mapHeight,
          transform: `translate3d(${view.offsetX}px, ${view.offsetY}px, 0) scale(${view.scale})`,
        }}
      >
        <svg
          role="group"
          aria-label="可选择的校园建筑区域"
          className="pointer-events-none absolute inset-0 overflow-visible"
          width={mapWidth}
          height={mapHeight}
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        >
          {cockpit ? (
            <defs>
              <pattern id="cockpit-window-lights" width="72" height="48" patternUnits="userSpaceOnUse" patternTransform="skewX(-9)">
                <rect width="72" height="48" fill="transparent" />
                <rect x="8" y="9" width="15" height="5" rx="1" fill="#ffd98a" opacity=".68" />
                <rect x="39" y="9" width="14" height="5" rx="1" fill="#8be9ff" opacity=".38" />
                <rect x="18" y="29" width="14" height="5" rx="1" fill="#ffc96a" opacity=".5" />
                <rect x="49" y="29" width="12" height="5" rx="1" fill="#b9f3ff" opacity=".32" />
              </pattern>
              <filter id="cockpit-warm-light" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="18" />
              </filter>
            </defs>
          ) : null}
          {projectedBuildings.map(({ building, points }) => {
            const isSelected = building.id === selectedBuildingId;
            const level = grade(building.carbon?.energyIntensity);

            return (
              <g key={building.id}>
                {cockpit && level ? (
                  <>
                    <circle
                      cx={building.centroid[0]}
                      cy={building.centroid[1]}
                      r={isSelected ? 92 : 66}
                      fill={isSelected ? "#68e8ff" : "#ffc766"}
                      opacity={isSelected ? ".2" : ".085"}
                      filter="url(#cockpit-warm-light)"
                    />
                    <polygon
                      points={points}
                      fill="url(#cockpit-window-lights)"
                      opacity={isSelected ? ".5" : ".28"}
                      stroke="#72e9ff"
                      strokeOpacity={isSelected ? ".8" : ".32"}
                      strokeWidth={isSelected ? 2 : .8}
                      vectorEffect="non-scaling-stroke"
                      className="pointer-events-none"
                      filter={`drop-shadow(0 0 ${isSelected ? 7 : 2}px rgba(79,224,255,.65))`}
                    />
                  </>
                ) : null}
                <polygon
                role="button"
                aria-label={`选择建筑：${building.name}`}
                aria-pressed={isSelected}
                tabIndex={0}
                data-carbon-grade={level?.label}
                data-carbon-value={building.carbon?.energyIntensity}
                points={points}
                fill={
                  cockpit && level
                    ? `${level.color}${
                        building.carbon?.energyIntensity != null &&
                        building.carbon.energyIntensity > 50
                          ? isSelected
                            ? "70"
                            : "58"
                          : isSelected
                            ? "48"
                            : "36"
                      }`
                    : isSelected
                      ? "rgba(34,211,238,.2)"
                      : "transparent"
                }
                stroke={cockpit && level ? level.color : isSelected ? "#22d3ee" : "transparent"}
                strokeOpacity={cockpit && level ? isSelected ? .92 : .55 : 1}
                strokeWidth={isSelected ? 1.8 : cockpit && level ? .7 : 1}
                vectorEffect="non-scaling-stroke"
                className={`pointer-events-auto cursor-pointer outline-none transition-[fill,stroke,filter] duration-200 hover:brightness-125 focus-visible:stroke-white ${cockpit && level ? "cockpit-building-grade" : ""} ${cockpit && building.carbon?.energyIntensity != null && building.carbon.energyIntensity > 50 ? "cockpit-building-grade-high" : ""}`}
                filter={cockpit && level ? `drop-shadow(0 0 ${isSelected ? 6 : 2}px ${level.color})` : undefined}
                style={{ pointerEvents: "all" }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(building.id);
                }}
                onKeyDown={(event) => {
                  if (!isActivationKey(event.key)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  onSelect(building.id);
                }}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {showLabels
        ? projectedBuildings.map(
            ({ building, screenX, screenY, isOnScreen }) => {
              if (!isOnScreen) return null;

              return (
                <div
                  key={building.id}
                  className={`absolute ${
                    animateTransform
                      ? "transition-[left,top] duration-150 ease-out"
                      : ""
                  }`}
                  style={{
                    left: screenX,
                    top: screenY,
                    zIndex: Math.round(screenY) + 20,
                    transform: "translate(-50%, calc(-100% - 5px))",
                  }}
                >
                  <button
                    type="button"
                    aria-label={`选择建筑：${building.name}`}
                    aria-pressed={building.id === selectedBuildingId}
                    className="pointer-events-auto relative whitespace-nowrap border border-white bg-[#3366ff] px-1 py-px text-[12px] font-normal leading-5 text-white outline-none focus-visible:ring-2 focus-visible:ring-white"
                    style={{
                      borderRadius: 4,
                      boxShadow: "2px 2px 10px white",
                      fontFamily:
                        "Microsoft Yahei, PingFang SC, Helvetica, sans-serif",
                    }}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(building.id);
                    }}
                  >
                    {building.name}
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-white"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 -translate-y-px border-x-[4px] border-t-[6px] border-x-transparent border-t-[#3366ff]"
                    />
                  </button>
                </div>
              );
            },
          )
        : null}

      {cockpit
        ? projectedBuildings
            .filter(({ building, isOnScreen }) => building.carbon && isOnScreen)
            .slice(0, 14)
            .map(({ building, markerScreenX, markerScreenY }) => (
              <button
                key={`pin-${building.id}`}
                type="button"
                aria-label={`查看${building.name}碳排放信息`}
                aria-pressed={building.id === selectedBuildingId}
                title={`${building.name} · 点击查看碳排数据`}
                className="cockpit-map-pin pointer-events-auto absolute z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-100 bg-emerald-400 outline-none shadow-[0_0_6px_rgba(52,211,153,.95),0_0_16px_rgba(16,185,129,.75)] transition-[transform,background-color,box-shadow] hover:scale-125 hover:bg-emerald-200 focus-visible:scale-125 focus-visible:ring-2 focus-visible:ring-emerald-100 data-[selected=true]:scale-125 data-[selected=true]:bg-white data-[selected=true]:shadow-[0_0_8px_rgba(255,255,255,.95),0_0_22px_rgba(16,185,129,.95)]"
                data-selected={building.id === selectedBuildingId}
                style={{ left: markerScreenX, top: markerScreenY }}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelect(building.id);
                }}
              />
            ))
        : null}

      {selectedBuilding && popupPosition ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={`${selectedBuilding.building.name}能碳信息弹窗位点`}
          data-campus-building-popup-anchor={selectedBuilding.building.id}
          className={`pointer-events-auto absolute min-w-48 border border-cyan-300/55 bg-[#06172a]/95 px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,.45),0_0_12px_rgba(34,211,238,.18)] backdrop-blur-md ${
            animateTransform
              ? "transition-[left,top] duration-150 ease-out"
              : ""
          }`}
          style={{
            left: popupPosition.x,
            top: popupPosition.y,
            transform: "translate(-50%, -100%)",
          }}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
        >
          <div className="pr-7">
            <div className="text-sm font-semibold text-white">{selectedBuilding.building.name}</div>
            <div className="mt-1 text-xs text-cyan-100/70">
              碳排放强度 <span className="font-mono text-cyan-300">{selectedBuilding.building.carbon?.energyIntensity ?? "--"}</span> kgCO₂e/m²·年
            </div>
            <div className="mt-1 text-[11px]" style={{ color: grade(selectedBuilding.building.carbon?.energyIntensity)?.color }}>
              {grade(selectedBuilding.building.carbon?.energyIntensity)?.label ?? "暂无等级"}
            </div>
          </div>
          <button
            type="button"
            aria-label={`关闭${selectedBuilding.building.name}能碳信息弹窗位点`}
            title="关闭弹窗位点"
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            onClick={() => onSelect(null)}
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-emerald-300/60"
          />
        </section>
      ) : null}
    </div>
  );
}
