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
  /** Optional map of buildingId → fill color for choropleth visualization */
  emissionColorMap?: Map<string, string>;
}

interface ProjectedBuilding {
  building: CampusMapBuilding;
  points: string;
  screenX: number;
  screenY: number;
  isOnScreen: boolean;
}

const LABEL_VIEWPORT_MARGIN = 140;
const POPUP_EDGE_GAP = 12;
const EMISSION_FILL_OPACITY = 0.35;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
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
  emissionColorMap,
}: CampusBuildingLayerProps) {
  const projectedBuildings = useMemo<ProjectedBuilding[]>(
    () =>
      buildings.map((building) => {
        const screenX = view.offsetX + building.anchor[0] * view.scale;
        const screenY = view.offsetY + building.anchor[1] * view.scale;

        return {
          building,
          points: building.polygon
            .map(([x, y]) => `${x},${y}`)
            .join(" "),
          screenX,
          screenY,
          isOnScreen:
            screenX >= -LABEL_VIEWPORT_MARGIN &&
            screenX <= viewport.width + LABEL_VIEWPORT_MARGIN &&
            screenY >= -LABEL_VIEWPORT_MARGIN &&
            screenY <= viewport.height + LABEL_VIEWPORT_MARGIN,
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
        selectedBuilding.screenX,
        POPUP_EDGE_GAP + 20,
        viewport.width - POPUP_EDGE_GAP - 20,
      ),
      y: clamp(
        selectedBuilding.screenY - 22,
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
          {projectedBuildings.map(({ building, points }) => {
            const isSelected = building.id === selectedBuildingId;
            const emissionColor = emissionColorMap?.get(building.id);
            const fill = isSelected
              ? "rgba(0,255,51,0.35)"
              : emissionColor
                ? hexToRgba(emissionColor, EMISSION_FILL_OPACITY)
                : "transparent";
            const strokeColor = isSelected
              ? "#00ff33"
              : emissionColor
                ? emissionColor
                : "transparent";

            return (
              <polygon
                key={building.id}
                role="button"
                aria-label={`选择建筑：${building.name}`}
                aria-pressed={isSelected}
                tabIndex={0}
                points={points}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-auto cursor-pointer outline-none transition-[fill,stroke,filter] duration-100 hover:[filter:drop-shadow(0_0_4px_rgba(0,255,51,.5))]"
                style={{
                  pointerEvents: "all",
                  ...(isSelected
                    ? { fill: "rgba(0,255,51,0.35)", stroke: "#00ff33", filter: "drop-shadow(0 0 4px rgba(0,255,51,0.5))" }
                    : {}),
                }}
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

      {selectedBuilding && popupPosition ? (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={`${selectedBuilding.building.name}能碳信息弹窗位点`}
          data-campus-building-popup-anchor={selectedBuilding.building.id}
          className={`pointer-events-auto absolute flex h-8 w-9 items-center justify-center rounded-md border border-emerald-300/45 bg-[#07152f]/95 shadow-[0_8px_24px_rgba(0,0,0,.35),0_0_10px_rgba(0,255,51,.2)] backdrop-blur-md ${
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
          <button
            type="button"
            aria-label={`关闭${selectedBuilding.building.name}能碳信息弹窗位点`}
            title="关闭弹窗位点"
            className="flex h-6 w-6 items-center justify-center rounded text-white/65 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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
