"use client";

import { useMemo } from "react";
import {
  BedDouble,
  Building2,
  Coffee,
  FlaskConical,
  GraduationCap,
  MapPinned,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  getCampusBuildingLayer,
  type CampusMapBuilding,
} from "@/data/campus-map-buildings";

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
  fitScale: number;
  selectedBuildingId: string | null;
  animateTransform: boolean;
  onSelect: (id: string | null) => void;
}

interface ProjectedBuilding {
  building: CampusMapBuilding;
  points: string;
  screenX: number;
  screenY: number;
  isOnScreen: boolean;
  priority: number;
}

interface LabelPlacement {
  dx: number;
  dy: number;
  width: number;
}

interface LabelRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

type LabelDetail = "dots" | "important" | "full";

const LABEL_VIEWPORT_MARGIN = 140;
const POPUP_EDGE_GAP = 12;
const LABEL_HEIGHT = 30;
const LABEL_COLLISION_GAP = 6;
const IMPORTANT_LABEL_PRIORITY = 58;
const IMPORTANT_BUILDING_PATTERN =
  /主楼|教学楼|图书馆|体育馆|实验楼|学生活动中心|综合楼|逸夫科技馆/;

const MARKER_ICONS: Record<
  ReturnType<typeof getCampusBuildingLayer>,
  LucideIcon
> = {
  teaching: GraduationCap,
  dormitory: BedDouble,
  laboratory: FlaskConical,
  services: Coffee,
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

function getLabelPriority(building: CampusMapBuilding): number {
  let priority = building.carbon ? 42 : 18;
  if (IMPORTANT_BUILDING_PATTERN.test(building.name)) priority += 44;
  if (building.name.length <= 4) priority += 5;
  return priority;
}

function overlaps(a: LabelRect, b: LabelRect): boolean {
  return !(
    a.right + LABEL_COLLISION_GAP < b.left ||
    a.left > b.right + LABEL_COLLISION_GAP ||
    a.bottom + LABEL_COLLISION_GAP < b.top ||
    a.top > b.bottom + LABEL_COLLISION_GAP
  );
}

function getLabelDetail(scale: number, fitScale: number): LabelDetail {
  const zoomRatio = fitScale > 0 ? scale / fitScale : 1;
  if (zoomRatio < 1.65) return "dots";
  if (zoomRatio < 3.05) return "important";
  return "full";
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
  fitScale,
  selectedBuildingId,
  animateTransform,
  onSelect,
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
          priority: getLabelPriority(building),
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

  const labelDetail = getLabelDetail(view.scale, fitScale);

  const labelPlacements = useMemo(() => {
    const placements = new Map<string, LabelPlacement>();
    if (!showLabels || labelDetail === "dots") return placements;

    const occupied: LabelRect[] = [];
    const candidates = projectedBuildings
      .filter(({ isOnScreen, priority, building }) =>
        isOnScreen &&
        (labelDetail === "full" ||
          priority >= IMPORTANT_LABEL_PRIORITY ||
          building.id === selectedBuildingId),
      )
      .sort((a, b) => {
        const aSelected = a.building.id === selectedBuildingId ? 1 : 0;
        const bSelected = b.building.id === selectedBuildingId ? 1 : 0;
        return bSelected - aSelected || b.priority - a.priority || a.screenY - b.screenY;
      });

    const offsets = [
      { dx: 0, dy: -35 },
      { dx: 56, dy: -21 },
      { dx: -56, dy: -21 },
      { dx: 58, dy: 27 },
      { dx: -58, dy: 27 },
      { dx: 0, dy: 39 },
    ];

    candidates.forEach((candidate) => {
      const width = Math.min(
        188,
        Math.max(82, Array.from(candidate.building.name).length * 13 + 42),
      );
      const isSelected = candidate.building.id === selectedBuildingId;
      let placement: LabelPlacement | null = null;

      for (const offset of offsets) {
        const centerX = candidate.screenX + offset.dx;
        const centerY = candidate.screenY + offset.dy;
        const rect: LabelRect = {
          left: centerX - width / 2,
          right: centerX + width / 2,
          top: centerY - LABEL_HEIGHT / 2,
          bottom: centerY + LABEL_HEIGHT / 2,
        };
        const insideViewport =
          rect.left >= 8 &&
          rect.right <= viewport.width - 8 &&
          rect.top >= 8 &&
          rect.bottom <= viewport.height - 8;

        if (insideViewport && !occupied.some((item) => overlaps(rect, item))) {
          placement = { ...offset, width };
          occupied.push(rect);
          break;
        }
      }

      // The selected item remains named even when the surrounding area is dense.
      if (!placement && isSelected) {
        const centerX = clamp(
          candidate.screenX,
          width / 2 + 8,
          viewport.width - width / 2 - 8,
        );
        const centerY = clamp(
          candidate.screenY - 35,
          LABEL_HEIGHT / 2 + 8,
          viewport.height - LABEL_HEIGHT / 2 - 8,
        );
        placement = {
          dx: centerX - candidate.screenX,
          dy: centerY - candidate.screenY,
          width,
        };
      }

      if (placement) placements.set(candidate.building.id, placement);
    });

    return placements;
  }, [
    labelDetail,
    projectedBuildings,
    selectedBuildingId,
    showLabels,
    viewport.height,
    viewport.width,
  ]);

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

            return (
              <polygon
                key={building.id}
                role="button"
                aria-label={`选择建筑：${building.name}`}
                aria-pressed={isSelected}
                tabIndex={0}
                points={points}
                fill={
                  isSelected
                    ? "rgba(var(--theme-primary-rgb), 0.2)"
                    : "transparent"
                }
                stroke={isSelected ? "var(--theme-primary)" : "transparent"}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                className="pointer-events-auto cursor-pointer outline-none transition-[fill,stroke,filter] duration-150 hover:fill-[rgba(var(--theme-primary-rgb),.18)] hover:stroke-[var(--theme-primary)] hover:[filter:drop-shadow(0_0_5px_rgba(var(--theme-primary-rgb),.62))] focus-visible:fill-[rgba(var(--theme-primary-rgb),.22)] focus-visible:stroke-white"
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
            );
          })}
        </svg>
      </div>

      {showLabels
        ? projectedBuildings.map(
            ({ building, screenX, screenY, isOnScreen }) => {
              if (!isOnScreen) return null;
              const isSelected = building.id === selectedBuildingId;
              const placement = labelPlacements.get(building.id);
              const MarkerIcon =
                MARKER_ICONS[getCampusBuildingLayer(building)] ?? Building2;
              const leaderLength = placement
                ? Math.hypot(placement.dx, placement.dy)
                : 0;
              const leaderAngle = placement
                ? Math.atan2(placement.dy, placement.dx) * (180 / Math.PI)
                : 0;

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
                    zIndex: isSelected ? 9_000 : Math.round(screenY) + 20,
                  }}
                >
                  {placement ? (
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-0 top-0 h-px origin-left ${
                        isSelected
                          ? "bg-[var(--theme-accent)] shadow-[0_0_7px_var(--theme-accent)]"
                          : "bg-[rgba(var(--theme-primary-rgb),.72)] shadow-[0_0_5px_rgba(var(--theme-primary-rgb),.38)]"
                      }`}
                      style={{
                        width: leaderLength,
                        transform: `rotate(${leaderAngle}deg)`,
                      }}
                    />
                  ) : null}

                  <button
                    type="button"
                    aria-label={`选择建筑：${building.name}`}
                    aria-pressed={isSelected}
                    title={labelDetail === "dots" ? building.name : undefined}
                    className={`pointer-events-auto absolute left-0 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border outline-none transition-[width,height,background-color,border-color,box-shadow,transform] duration-200 hover:scale-125 focus-visible:ring-2 focus-visible:ring-white ${
                      isSelected
                        ? "h-3.5 w-3.5 border-white bg-[var(--theme-accent)] shadow-[0_0_0_4px_rgba(var(--theme-primary-rgb),.18),0_0_16px_var(--theme-accent)]"
                        : "h-2.5 w-2.5 border-white/85 bg-[var(--theme-primary)] shadow-[0_0_0_3px_rgba(var(--theme-primary-rgb),.13),0_0_10px_rgba(var(--theme-primary-rgb),.72)]"
                    }`}
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onSelect(building.id);
                    }}
                  >
                    {isSelected ? (
                      <span className="absolute inset-[-7px] animate-ping rounded-full border border-[var(--theme-accent)] opacity-35" />
                    ) : null}
                  </button>

                  {placement ? (
                    <button
                      type="button"
                      aria-label={`选择建筑：${building.name}`}
                      aria-pressed={isSelected}
                      className={`pointer-events-auto absolute flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 text-[11px] font-semibold tracking-[.01em] text-white outline-none backdrop-blur-md transition-[background-color,border-color,box-shadow,transform] duration-200 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-white ${
                        isSelected
                          ? "border-[var(--theme-accent)] bg-[color-mix(in_srgb,var(--theme-surface-strong)_90%,var(--theme-accent))] shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_0_18px_var(--theme-accent)]"
                          : "border-[rgba(var(--theme-primary-rgb),.50)] bg-[color-mix(in_srgb,var(--theme-surface-strong)_92%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_7px_18px_rgba(0,0,0,.28),0_0_12px_rgba(var(--theme-primary-rgb),.18)]"
                      }`}
                      style={{
                        left: placement.dx,
                        top: placement.dy,
                        width: placement.width,
                        transform: "translate(-50%, -50%)",
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
                      <MarkerIcon
                        aria-hidden="true"
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isSelected
                            ? "text-[var(--theme-accent)] drop-shadow-[0_0_6px_var(--theme-accent)]"
                            : "text-[var(--theme-primary)] drop-shadow-[0_0_5px_rgba(var(--theme-primary-rgb),.58)]"
                        }`}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                        {building.name}
                      </span>
                    </button>
                  ) : null}
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
          className={`pointer-events-auto absolute flex h-9 w-10 items-center justify-center rounded-xl border border-[rgba(var(--theme-primary-rgb),.5)] bg-[color-mix(in_srgb,var(--theme-surface-strong)_94%,black)] shadow-[0_8px_24px_rgba(0,0,0,.35),0_0_16px_rgba(var(--theme-primary-rgb),.28)] backdrop-blur-md ${
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
            className="group relative flex h-7 w-7 items-center justify-center rounded-lg text-[var(--theme-primary)] transition-[background-color,box-shadow,transform] hover:scale-105 hover:bg-[rgba(var(--theme-primary-rgb),.12)] hover:shadow-[0_0_12px_rgba(var(--theme-primary-rgb),.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
            onClick={() => onSelect(null)}
          >
            <MapPinned aria-hidden="true" className="h-4 w-4 drop-shadow-[0_0_6px_rgba(var(--theme-primary-rgb),.68)] transition-opacity group-hover:opacity-0" />
            <X aria-hidden="true" className="absolute h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-[var(--theme-primary)] opacity-70"
          />
        </section>
      ) : null}
    </div>
  );
}
