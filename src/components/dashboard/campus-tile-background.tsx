"use client";

/* eslint-disable @next/next/no-img-element -- Raw tile URLs must bypass Next image optimization. */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import { CampusBuildingLayer } from "@/components/dashboard/campus-building-layer";
import {
  getCampusBuildingLayer,
  getCampusMapBuildings,
  type CampusMapBuilding,
  type CampusLayerFilter,
  type CampusMapKind,
} from "@/data/campus-map-buildings";
import { useCampusMapToolbarStore } from "@/stores/campus-map-toolbar-store";

interface CampusTileBackgroundProps {
  map: CampusMapKind;
  className?: string;
  initialBuildingId?: string | null;
  onBuildingSelect?: (buildingId: string | null) => void;
  renderBuildingPopup?: (building: CampusMapBuilding, onClose: () => void) => ReactNode;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface MapConfig {
  width: number;
  height: number;
  minZoom: number;
  maxZoom: number;
  initialScale: number;
  outerBackdrop: {
    url: string;
    width: number;
    height: number;
    cropOriginX: number;
    cropOriginY: number;
    outputDivisor: number;
    panBounds?: {
      left: number;
      top: number;
      right: number;
      bottom: number;
    };
  };
}

interface TileCoordinate {
  x: number;
  y: number;
}

interface DragGesture {
  pointerId: number;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  moved: boolean;
}

interface PinchGesture {
  distance: number;
  scale: number;
  anchorX: number;
  anchorY: number;
}

const TILE_SIZE = 512;
const TILE_BUFFER = 1;
const MAX_NATIVE_SCALE = 1;
// Keep a generous zoom-out range for inspecting edge buildings, while the
// entry view itself is configured per cockpit below.
const MINIMUM_MAP_FIT_FACTOR = 0.72;
const OUTER_PAN_MARGIN_RATIO = 0.16;
const BUTTON_ZOOM_FACTOR = 1.5;
const WHEEL_ZOOM_SPEED = 0.0015;
const MAX_WHEEL_DELTA = 120;
const TILE_ZOOM_HYSTERESIS = 0.18;
const DRAG_CLICK_THRESHOLD = 5;

// These values mirror public/campus-map/metadata.json. z5 is the native
// source resolution, so the interaction never scales beyond 100% clarity.
const MAP_CONFIG: Record<CampusMapKind, MapConfig> = {
  "2d": {
    width: 13_139,
    height: 8_759,
    minZoom: 0,
    maxZoom: 5,
    initialScale: 0.11,
    outerBackdrop: {
      url: "/campus-map/outer/2d.webp",
      width: 22_528,
      height: 18_432,
      cropOriginX: 3_824,
      cropOriginY: 4_600,
      outputDivisor: 8,
    },
  },
  "2_5d": {
    width: 14_336,
    height: 7_263,
    minZoom: 0,
    maxZoom: 5,
    initialScale: 0.13,
    outerBackdrop: {
      url: "/campus-map/outer/2_5d-expanded.webp",
      // map2.png is aligned to the existing 2.5D image at one output pixel
      // per eight source pixels. Cropping away its website controls still
      // leaves real map coverage on the upper, left, and right sides.
      width: 17_600,
      height: 10_896,
      cropOriginX: 2_368,
      cropOriginY: 2_104,
      outputDivisor: 8,
    },
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getOuterPanBounds(config: MapConfig) {
  const backdrop = config.outerBackdrop;
  const bounds = backdrop.panBounds ?? {
    left: 0,
    top: 0,
    right: backdrop.width,
    bottom: backdrop.height,
  };

  return {
    left: bounds.left - backdrop.cropOriginX,
    top: bounds.top - backdrop.cropOriginY,
    right: bounds.right - backdrop.cropOriginX,
    bottom: bounds.bottom - backdrop.cropOriginY,
  };
}

function getFitScale(viewport: ViewportSize, config: MapConfig) {
  if (viewport.width === 0 || viewport.height === 0) return 0;
  const panBounds = getOuterPanBounds(config);
  const relaxedDetailScale = Math.min(
    viewport.width / config.width,
    viewport.height / config.height,
    MAX_NATIVE_SCALE,
  ) * MINIMUM_MAP_FIT_FACTOR;
  const outerCoverScale = Math.max(
    viewport.width / (panBounds.right - panBounds.left),
    viewport.height / (panBounds.bottom - panBounds.top),
  );

  return Math.min(
    Math.max(relaxedDetailScale, outerCoverScale),
    MAX_NATIVE_SCALE,
  );
}

function getInitialScale(viewport: ViewportSize, config: MapConfig) {
  return clamp(
    Math.max(config.initialScale, getFitScale(viewport, config)),
    getFitScale(viewport, config),
    MAX_NATIVE_SCALE,
  );
}

function constrainView(
  candidate: ViewState,
  viewport: ViewportSize,
  config: MapConfig,
): ViewState {
  const fitScale = getFitScale(viewport, config);
  const scale = clamp(candidate.scale, fitScale, MAX_NATIVE_SCALE);
  const {
    left: outerLeft,
    top: outerTop,
    right: outerRight,
    bottom: outerBottom,
  } = getOuterPanBounds(config);

  const constrainAxis = (
    minimum: number,
    maximum: number,
    viewportSize: number,
    offset: number,
  ) => {
    const scaledSize = (maximum - minimum) * scale;
    if (scaledSize > viewportSize) {
      return clamp(
        offset,
        viewportSize - maximum * scale,
        -minimum * scale,
      );
    }

    const centeredOffset = (viewportSize - scaledSize) / 2 - minimum * scale;
    const margin = Math.min(
      viewportSize * OUTER_PAN_MARGIN_RATIO,
      scaledSize * 0.28,
    );
    return clamp(offset, centeredOffset - margin, centeredOffset + margin);
  };

  const offsetX = constrainAxis(
    outerLeft,
    outerRight,
    viewport.width,
    candidate.offsetX,
  );
  const offsetY = constrainAxis(
    outerTop,
    outerBottom,
    viewport.height,
    candidate.offsetY,
  );

  return { scale, offsetX, offsetY };
}

function getFitView(viewport: ViewportSize, config: MapConfig): ViewState {
  const scale = getInitialScale(viewport, config);
  return constrainView({
    scale,
    offsetX: (viewport.width - config.width * scale) / 2,
    offsetY: (viewport.height - config.height * scale) / 2,
  }, viewport, config);
}

function getLevelDimensions(config: MapConfig, zoom: number) {
  const divisor = 2 ** (config.maxZoom - zoom);
  return {
    divisor,
    width: Math.ceil(config.width / divisor),
    height: Math.ceil(config.height / divisor),
  };
}

function selectTileZoom(
  scale: number,
  config: MapConfig,
  currentZoom?: number,
) {
  const idealZoom = config.maxZoom + Math.log2(Math.max(scale, 0.000_001));
  if (currentZoom === undefined) {
    return clamp(Math.round(idealZoom), config.minZoom, config.maxZoom);
  }

  // Keep the current raster level through a small dead zone. Without this,
  // tiny wheel reversals around a level boundary repeatedly unmount/mount a
  // complete tile layer and are perceived as a full-page flash.
  let nextZoom = clamp(currentZoom, config.minZoom, config.maxZoom);
  while (
    nextZoom < config.maxZoom &&
    idealZoom > nextZoom + 0.5 + TILE_ZOOM_HYSTERESIS
  ) {
    nextZoom += 1;
  }
  while (
    nextZoom > config.minZoom &&
    idealZoom < nextZoom - 0.5 - TILE_ZOOM_HYSTERESIS
  ) {
    nextZoom -= 1;
  }
  return nextZoom;
}

function normalizeWheelDelta(event: WheelEvent, viewportHeight: number) {
  const modeMultiplier =
    event.deltaMode === WheelEvent.DOM_DELTA_LINE
      ? 16
      : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
        ? Math.max(viewportHeight, 1)
        : 1;
  return clamp(event.deltaY * modeMultiplier, -MAX_WHEEL_DELTA, MAX_WHEEL_DELTA);
}

function getVisibleTiles(
  view: ViewState,
  viewport: ViewportSize,
  config: MapConfig,
  zoom: number,
): TileCoordinate[] {
  const level = getLevelDimensions(config, zoom);
  const columns = Math.ceil(level.width / TILE_SIZE);
  const rows = Math.ceil(level.height / TILE_SIZE);

  const sourceMinX = clamp(-view.offsetX / view.scale, 0, config.width);
  const sourceMinY = clamp(-view.offsetY / view.scale, 0, config.height);
  const sourceMaxX = clamp(
    (viewport.width - view.offsetX) / view.scale,
    0,
    config.width,
  );
  const sourceMaxY = clamp(
    (viewport.height - view.offsetY) / view.scale,
    0,
    config.height,
  );

  const minX = clamp(
    Math.floor(sourceMinX / level.divisor / TILE_SIZE) - TILE_BUFFER,
    0,
    columns - 1,
  );
  const minY = clamp(
    Math.floor(sourceMinY / level.divisor / TILE_SIZE) - TILE_BUFFER,
    0,
    rows - 1,
  );
  const maxX = clamp(
    Math.floor(Math.max(0, sourceMaxX - 1) / level.divisor / TILE_SIZE) + TILE_BUFFER,
    0,
    columns - 1,
  );
  const maxY = clamp(
    Math.floor(Math.max(0, sourceMaxY - 1) / level.divisor / TILE_SIZE) + TILE_BUFFER,
    0,
    rows - 1,
  );

  const tiles: TileCoordinate[] = [];
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      tiles.push({ x, y });
    }
  }
  return tiles;
}

function TileLayer({
  map,
  zoom,
  view,
  tiles,
  className,
  animateTransform,
}: {
  map: CampusMapKind;
  zoom: number;
  view: ViewState;
  tiles: TileCoordinate[];
  className: string;
  animateTransform: boolean;
}) {
  const config = MAP_CONFIG[map];
  const level = getLevelDimensions(config, zoom);
  const layerScale = view.scale * level.divisor;

  return (
    <div
      aria-hidden="true"
      className={`absolute left-0 top-0 origin-top-left will-change-transform ${animateTransform ? "transition-transform duration-150 ease-out" : ""} ${className}`}
      style={{
        width: level.width,
        height: level.height,
        transform: `translate3d(${view.offsetX}px, ${view.offsetY}px, 0) scale(${layerScale})`,
      }}
    >
      {tiles.map(({ x, y }) => (
        <img
          key={`${zoom}-${x}-${y}`}
          src={`/campus-map/${map}/${zoom}/${x}/${y}.webp`}
          alt=""
          draggable={false}
          decoding="async"
          className="absolute max-w-none select-none"
          style={{
            left: x * TILE_SIZE,
            top: y * TILE_SIZE,
            width: TILE_SIZE + 0.5,
            height: TILE_SIZE + 0.5,
          }}
          onError={(event) => {
            // Keep the low-resolution overview visible if a detail tile fails.
            event.currentTarget.style.display = "none";
          }}
        />
      ))}
    </div>
  );
}

function OuterBackdropLayer({
  config,
  view,
  animateTransform,
}: {
  config: MapConfig;
  view: ViewState;
  animateTransform: boolean;
}) {
  const backdrop = config.outerBackdrop;
  const layerScale = view.scale * backdrop.outputDivisor;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 z-0 origin-top-left will-change-transform ${
        animateTransform ? "transition-transform duration-150 ease-out" : ""
      }`}
      style={{
        transform: `translate3d(${view.offsetX}px, ${view.offsetY}px, 0) scale(${layerScale})`,
      }}
    >
      <img
        src={backdrop.url}
        alt=""
        draggable={false}
        decoding="async"
        className="absolute max-w-none select-none"
        style={{
          left: -backdrop.cropOriginX / backdrop.outputDivisor,
          top: -backdrop.cropOriginY / backdrop.outputDivisor,
          width: backdrop.width / backdrop.outputDivisor,
          height: backdrop.height / backdrop.outputDivisor,
        }}
      />
    </div>
  );
}

/**
 * Visible mist tied to the live raster boundary. The overview tile supplies
 * a cheap color mask, so the effect lands on pale map paper while every
 * known building polygon is explicitly protected from whitening.
 */
function CampusMapEdgeFog({
  config,
  view,
  viewport,
}: {
  config: MapConfig;
  view: ViewState;
  viewport: ViewportSize;
}) {
  const reactId = useId().replace(/:/g, "");
  const coverageMaskId = `${reactId}-fog-coverage`;
  const mistCloudGradientId = `${reactId}-mist-cloud`;
  const radialGradientId = `${reactId}-fog-radial`;
  const horizontalGradientId = `${reactId}-fog-horizontal`;
  const verticalGradientId = `${reactId}-fog-vertical`;

  const mapLeft = view.offsetX;
  const mapTop = view.offsetY;
  const mapWidth = config.width * view.scale;
  const mapHeight = config.height * view.scale;
  const mapRight = mapLeft + mapWidth;
  const mapBottom = mapTop + mapHeight;
  const centerX = mapLeft + mapWidth * 0.5;
  const centerY = mapTop + mapHeight * 0.49;
  const radiusX = Math.max(mapWidth * 0.56, 1);
  const radiusY = Math.max(mapHeight * 0.58, 1);
  const radialScaleY = radiusY / radiusX;
  const radialTranslateY = centerY * (1 - radialScaleY);

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[11] h-full w-full"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      preserveAspectRatio="none"
    >
      <defs>
        <mask
          id={coverageMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={viewport.width}
          height={viewport.height}
          style={{ maskType: "luminance" }}
        >
          <rect width={viewport.width} height={viewport.height} fill="white" />
          <g transform={`translate(${view.offsetX} ${view.offsetY}) scale(${view.scale})`}>
            <rect width={config.width} height={config.height} fill="black" />
          </g>
        </mask>

        <radialGradient
          id={radialGradientId}
          gradientUnits="userSpaceOnUse"
          cx={centerX}
          cy={centerY}
          r={radiusX}
          gradientTransform={`translate(0 ${radialTranslateY}) scale(1 ${radialScaleY})`}
        >
          <stop offset="0%" stopColor="#f9fbfc" stopOpacity="0" />
          <stop offset="61%" stopColor="#f9fbfc" stopOpacity="0" />
          <stop offset="70%" stopColor="#fbfdfe" stopOpacity="0.2" />
          <stop offset="80%" stopColor="#fbfdfe" stopOpacity="0.72" />
          <stop offset="90%" stopColor="#f4f8fa" stopOpacity="0.94" />
          <stop offset="100%" stopColor="#d5e0e6" stopOpacity="1" />
        </radialGradient>
        <radialGradient id={mistCloudGradientId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.92" />
          <stop offset="38%" stopColor="#fff" stopOpacity="0.68" />
          <stop offset="72%" stopColor="#f8fbfc" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f2f7f9" stopOpacity="0" />
        </radialGradient>
        <linearGradient
          id={horizontalGradientId}
          gradientUnits="userSpaceOnUse"
          x1={mapLeft}
          y1="0"
          x2={mapRight}
          y2="0"
        >
          <stop offset="0%" stopColor="#d5e0e6" stopOpacity="0.8" />
          <stop offset="14%" stopColor="#f7fafb" stopOpacity="0.08" />
          <stop offset="28%" stopColor="#f7fafb" stopOpacity="0" />
          <stop offset="72%" stopColor="#f7fafb" stopOpacity="0" />
          <stop offset="86%" stopColor="#f7fafb" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d5e0e6" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient
          id={verticalGradientId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={mapTop}
          x2="0"
          y2={mapBottom}
        >
          <stop offset="0%" stopColor="#d5e0e6" stopOpacity="0.76" />
          <stop offset="16%" stopColor="#f9fbfc" stopOpacity="0.06" />
          <stop offset="32%" stopColor="#f9fbfc" stopOpacity="0" />
          <stop offset="70%" stopColor="#f9fbfc" stopOpacity="0" />
          <stop offset="86%" stopColor="#f9fbfc" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#d5e0e6" stopOpacity="0.84" />
        </linearGradient>
      </defs>

      <g mask={`url(#${coverageMaskId})`} opacity="0.16">
        <rect width={viewport.width} height={viewport.height} fill={`url(#${radialGradientId})`} />
        <rect width={viewport.width} height={viewport.height} fill={`url(#${horizontalGradientId})`} />
        <rect width={viewport.width} height={viewport.height} fill={`url(#${verticalGradientId})`} />
        {/* Uneven perimeter lobes make the transition read as mist, not a vignette. */}
        <g fill={`url(#${mistCloudGradientId})`}>
          <ellipse cx={mapLeft + mapWidth * 0.16} cy={mapTop + mapHeight * 0.02} rx={mapWidth * 0.18} ry={mapHeight * 0.14} />
          <ellipse cx={mapLeft + mapWidth * 0.42} cy={mapTop - mapHeight * 0.01} rx={mapWidth * 0.22} ry={mapHeight * 0.13} />
          <ellipse cx={mapLeft + mapWidth * 0.72} cy={mapTop + mapHeight * 0.01} rx={mapWidth * 0.2} ry={mapHeight * 0.15} />
          <ellipse cx={mapLeft + mapWidth * 0.91} cy={mapTop + mapHeight * 0.13} rx={mapWidth * 0.14} ry={mapHeight * 0.2} />

          <ellipse cx={mapLeft + mapWidth * 0.08} cy={mapTop + mapHeight * 0.42} rx={mapWidth * 0.13} ry={mapHeight * 0.22} />
          <ellipse cx={mapRight - mapWidth * 0.04} cy={mapTop + mapHeight * 0.48} rx={mapWidth * 0.14} ry={mapHeight * 0.24} />

          <ellipse cx={mapLeft + mapWidth * 0.14} cy={mapBottom - mapHeight * 0.04} rx={mapWidth * 0.2} ry={mapHeight * 0.15} />
          <ellipse cx={mapLeft + mapWidth * 0.43} cy={mapBottom + mapHeight * 0.01} rx={mapWidth * 0.23} ry={mapHeight * 0.14} />
          <ellipse cx={mapLeft + mapWidth * 0.72} cy={mapBottom - mapHeight * 0.01} rx={mapWidth * 0.21} ry={mapHeight * 0.16} />
          <ellipse cx={mapLeft + mapWidth * 0.94} cy={mapBottom - mapHeight * 0.14} rx={mapWidth * 0.13} ry={mapHeight * 0.21} />
        </g>
      </g>
    </svg>
  );
}

/**
 * Interactive image-pixel campus map for dashboard center panels.
 *
 * The overview tile remains behind the active layer as a seamless loading
 * fallback. Only the current viewport plus a one-tile buffer is mounted, so
 * zooming to z5 never puts the complete native-resolution map in memory.
 */
export function CampusTileBackground({
  map,
  className = "",
  initialBuildingId = null,
  onBuildingSelect,
  renderBuildingPopup,
}: CampusTileBackgroundProps) {
  const config = MAP_CONFIG[map];
  const initialTileZoom = selectTileZoom(config.initialScale, config);
  const toolbarOwnerId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ViewState | null>(null);
  const viewportRef = useRef<ViewportSize>({ width: 0, height: 0 });
  const pendingViewRef = useRef<ViewState | null>(null);
  const tileZoomRef = useRef(initialTileZoom);
  const pendingTileZoomRef = useRef(initialTileZoom);
  const animationFrameRef = useRef<number | null>(null);
  const wheelIdleTimeoutRef = useRef<number | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<DragGesture | null>(null);
  const pinchRef = useRef<PinchGesture | null>(null);
  const appliedInitialBuildingRef = useRef<string | null>(null);
  const registerToolbar = useCampusMapToolbarStore((state) => state.registerToolbar);
  const unregisterToolbar = useCampusMapToolbarStore((state) => state.unregisterToolbar);

  const [viewport, setViewport] = useState<ViewportSize>({ width: 0, height: 0 });
  const [view, setView] = useState<ViewState | null>(null);
  const [tileZoom, setTileZoom] = useState(initialTileZoom);
  const [isInteracting, setIsInteracting] = useState(false);
  const [showBuildingLabels, setShowBuildingLabels] = useState(true);
  const [showBuildingFrames, setShowBuildingFrames] = useState(false);
  const [activeLayer, setActiveLayer] = useState<CampusLayerFilter>("all");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const mappedBuildings = getCampusMapBuildings(map);
  const visibleBuildings = useMemo(
    () =>
      activeLayer === "all"
        ? mappedBuildings
        : mappedBuildings.filter(
            (building) => getCampusBuildingLayer(building) === activeLayer,
          ),
    [activeLayer, mappedBuildings],
  );

  const scheduleView = useCallback((candidate: ViewState) => {
    const constrained = constrainView(candidate, viewportRef.current, config);
    const nextTileZoom = selectTileZoom(
      constrained.scale,
      config,
      tileZoomRef.current,
    );
    viewRef.current = constrained;
    pendingViewRef.current = constrained;
    tileZoomRef.current = nextTileZoom;
    pendingTileZoomRef.current = nextTileZoom;

    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      const pending = pendingViewRef.current;
      if (pending) {
        setView(pending);
        setTileZoom(pendingTileZoomRef.current);
      }
    });
  }, [config]);

  const zoomAt = useCallback((targetScale: number, pointX: number, pointY: number) => {
    const current = viewRef.current;
    if (!current) return;
    const nextScale = clamp(
      targetScale,
      getFitScale(viewportRef.current, config),
      MAX_NATIVE_SCALE,
    );
    const mapX = (pointX - current.offsetX) / current.scale;
    const mapY = (pointY - current.offsetY) / current.scale;

    scheduleView({
      scale: nextScale,
      offsetX: pointX - mapX * nextScale,
      offsetY: pointY - mapY * nextScale,
    });
  }, [config, scheduleView]);

  const zoomBy = useCallback((factor: number) => {
    const current = viewRef.current;
    const currentViewport = viewportRef.current;
    if (!current) return;
    zoomAt(
      current.scale * factor,
      currentViewport.width / 2,
      currentViewport.height / 2,
    );
  }, [zoomAt]);

  const resetView = useCallback(() => {
    scheduleView(getFitView(viewportRef.current, config));
  }, [config, scheduleView]);

  const focusBuilding = useCallback((buildingId: string) => {
    const building = mappedBuildings.find((item) => item.id === buildingId);
    const current = viewRef.current;
    const currentViewport = viewportRef.current;
    if (!building || !current) return;

    const fitScale = getFitScale(currentViewport, config);
    const targetScale = clamp(
      Math.max(current.scale, fitScale * 3.5),
      fitScale,
      MAX_NATIVE_SCALE,
    );

    scheduleView({
      scale: targetScale,
      offsetX: currentViewport.width / 2 - building.centroid[0] * targetScale,
      offsetY: currentViewport.height / 2 - building.centroid[1] * targetScale,
    });
  }, [config, mappedBuildings, scheduleView]);

  const updateSelectedBuilding = useCallback((buildingId: string | null) => {
    setSelectedBuildingId(buildingId);
    onBuildingSelect?.(buildingId);
  }, [onBuildingSelect]);

  const selectFromSearch = useCallback((buildingId: string) => {
    const building = mappedBuildings.find((item) => item.id === buildingId);
    if (building && activeLayer !== "all") {
      setActiveLayer(getCampusBuildingLayer(building));
    }
    updateSelectedBuilding(buildingId);
    focusBuilding(buildingId);
  }, [activeLayer, focusBuilding, mappedBuildings, updateSelectedBuilding]);

  const changeLayer = useCallback((layer: CampusLayerFilter) => {
    setActiveLayer(layer);
    if (layer === "all" || !selectedBuildingId) return;

    const selectedBuilding = mappedBuildings.find(
      (building) => building.id === selectedBuildingId,
    );
    if (
      selectedBuilding &&
      getCampusBuildingLayer(selectedBuilding) !== layer
    ) {
      updateSelectedBuilding(null);
    }
  }, [mappedBuildings, selectedBuildingId, updateSelectedBuilding]);

  const selectBuilding = useCallback((buildingId: string | null) => {
    updateSelectedBuilding(buildingId);
    if (buildingId) focusBuilding(buildingId);
  }, [focusBuilding, updateSelectedBuilding]);

  useEffect(() => {
    registerToolbar({
      ownerId: toolbarOwnerId,
      buildings: mappedBuildings,
      selectedBuildingId,
      showLabels: showBuildingLabels,
      showBuildingFrames,
      activeLayer,
      onShowLabelsChange: setShowBuildingLabels,
      onShowBuildingFramesChange: setShowBuildingFrames,
      onLayerChange: changeLayer,
      onBuildingSelect: selectFromSearch,
    });
  }, [
    activeLayer,
    changeLayer,
    mappedBuildings,
    registerToolbar,
    selectFromSearch,
    selectedBuildingId,
    showBuildingFrames,
    showBuildingLabels,
    toolbarOwnerId,
  ]);

  useEffect(
    () => () => unregisterToolbar(toolbarOwnerId),
    [toolbarOwnerId, unregisterToolbar],
  );

  useEffect(() => {
    if (
      !initialBuildingId ||
      !view ||
      appliedInitialBuildingRef.current === initialBuildingId
    ) return;
    const building = mappedBuildings.find((item) => item.id === initialBuildingId);
    if (!building) return;
    appliedInitialBuildingRef.current = initialBuildingId;
    if (activeLayer !== "all") setActiveLayer(getCampusBuildingLayer(building));
    updateSelectedBuilding(initialBuildingId);
    focusBuilding(initialBuildingId);
  }, [
    activeLayer,
    focusBuilding,
    initialBuildingId,
    mappedBuildings,
    updateSelectedBuilding,
    view,
  ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    viewRef.current = null;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const nextViewport = {
        width: Math.max(0, Math.round(rect.width)),
        height: Math.max(0, Math.round(rect.height)),
      };
      const previousViewport = viewportRef.current;
      const current = viewRef.current;

      let nextView = getFitView(nextViewport, config);
      if (current && previousViewport.width > 0 && previousViewport.height > 0) {
        const newFitScale = getFitScale(nextViewport, config);
        const centerX = (previousViewport.width / 2 - current.offsetX) / current.scale;
        const centerY = (previousViewport.height / 2 - current.offsetY) / current.scale;
        // Scale is an explicit native-image percentage. Preserve it across
        // layout changes instead of making 13%/11% drift with the viewport.
        const scale = clamp(current.scale, newFitScale, MAX_NATIVE_SCALE);
        nextView = constrainView({
          scale,
          offsetX: nextViewport.width / 2 - centerX * scale,
          offsetY: nextViewport.height / 2 - centerY * scale,
        }, nextViewport, config);
      }

      viewportRef.current = nextViewport;
      viewRef.current = nextView;
      const nextTileZoom = selectTileZoom(nextView.scale, config);
      tileZoomRef.current = nextTileZoom;
      pendingTileZoomRef.current = nextTileZoom;
      setViewport(nextViewport);
      setView(nextView);
      setTileZoom(nextTileZoom);
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [config]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (event: WheelEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest("[data-campus-building-popup-anchor]")) {
        return;
      }
      event.preventDefault();
      const current = viewRef.current;
      if (!current) return;
      setIsInteracting(true);
      if (wheelIdleTimeoutRef.current !== null) {
        window.clearTimeout(wheelIdleTimeoutRef.current);
      }
      const rect = container.getBoundingClientRect();
      const delta = normalizeWheelDelta(event, viewportRef.current.height);
      const factor = Math.exp(-delta * WHEEL_ZOOM_SPEED);
      zoomAt(
        current.scale * factor,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
      wheelIdleTimeoutRef.current = window.setTimeout(() => {
        wheelIdleTimeoutRef.current = null;
        setIsInteracting(false);
      }, 140);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    if (wheelIdleTimeoutRef.current !== null) {
      window.clearTimeout(wheelIdleTimeoutRef.current);
    }
  }, []);

  const beginPinch = useCallback(() => {
    const [first, second] = Array.from(pointersRef.current.values());
    const current = viewRef.current;
    if (!first || !second || !current) return;
    const centerX = (first.x + second.x) / 2;
    const centerY = (first.y + second.y) / 2;
    pinchRef.current = {
      distance: Math.hypot(second.x - first.x, second.y - first.y),
      scale: current.scale,
      anchorX: (centerX - current.offsetX) / current.scale,
      anchorY: (centerY - current.offsetY) / current.scale,
    };
    dragRef.current = null;
  }, []);

  const handlePointerDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointersRef.current.set(event.pointerId, point);
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsInteracting(true);

    if (pointersRef.current.size >= 2) {
      beginPinch();
      return;
    }

    const current = viewRef.current;
    if (current) {
      dragRef.current = {
        pointerId: event.pointerId,
        startX: point.x,
        startY: point.y,
        offsetX: current.offsetX,
        offsetY: current.offsetY,
        moved: false,
      };
    }
  }, [beginPinch]);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    pointersRef.current.set(event.pointerId, point);

    if (pointersRef.current.size >= 2) {
      if (!pinchRef.current) beginPinch();
      const pinch = pinchRef.current;
      const [first, second] = Array.from(pointersRef.current.values());
      if (!pinch || !first || !second || pinch.distance === 0) return;
      const centerX = (first.x + second.x) / 2;
      const centerY = (first.y + second.y) / 2;
      const distance = Math.hypot(second.x - first.x, second.y - first.y);
      const scale = clamp(
        pinch.scale * (distance / pinch.distance),
        getFitScale(viewportRef.current, config),
        MAX_NATIVE_SCALE,
      );
      scheduleView({
        scale,
        offsetX: centerX - pinch.anchorX * scale,
        offsetY: centerY - pinch.anchorY * scale,
      });
      return;
    }

    const drag = dragRef.current;
    const current = viewRef.current;
    if (!drag || !current || drag.pointerId !== event.pointerId) return;
    if (
      !drag.moved &&
      Math.hypot(point.x - drag.startX, point.y - drag.startY) >= DRAG_CLICK_THRESHOLD
    ) {
      drag.moved = true;
    }
    scheduleView({
      scale: current.scale,
      offsetX: drag.offsetX + point.x - drag.startX,
      offsetY: drag.offsetY + point.y - drag.startY,
    });
  }, [beginPinch, config, scheduleView]);

  const handlePointerEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const completedDrag = dragRef.current;
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const remaining = Array.from(pointersRef.current.entries());
    const current = viewRef.current;
    if (remaining.length === 1 && current) {
      const [pointerId, point] = remaining[0];
      dragRef.current = {
        pointerId,
        startX: point.x,
        startY: point.y,
        offsetX: current.offsetX,
        offsetY: current.offsetY,
        moved: true,
      };
      return;
    }

    dragRef.current = null;
    if (remaining.length === 0) {
      setIsInteracting(false);
      if (
        completedDrag?.pointerId === event.pointerId &&
        !completedDrag.moved
      ) {
        updateSelectedBuilding(null);
      }
    }
  }, [updateSelectedBuilding]);

  const handleDoubleClick = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const current = viewRef.current;
    if (!current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    zoomAt(
      current.scale * BUTTON_ZOOM_FACTOR,
      event.clientX - rect.left,
      event.clientY - rect.top,
    );
  }, [zoomAt]);

  const plan = useMemo(() => {
    if (!view || viewport.width === 0 || viewport.height === 0) return null;
    return {
      zoom: tileZoom,
      tiles: getVisibleTiles(view, viewport, config, tileZoom),
      overviewTiles: getVisibleTiles(view, viewport, config, config.minZoom),
    };
  }, [config, tileZoom, view, viewport]);

  const fitScale = getFitScale(viewport, config);
  const canZoomOut = Boolean(view && view.scale > fitScale + 0.000_001);
  const canZoomIn = Boolean(view && view.scale < MAX_NATIVE_SCALE - 0.000_001);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="可缩放校园地图"
      tabIndex={0}
      className={`campus-tile-map absolute inset-0 overflow-clip select-none outline-none ${isInteracting ? "cursor-grabbing" : "cursor-grab"} ${className}`}
      style={{ touchAction: "none", contain: "layout paint" }}
      data-campus-map={map}
      data-campus-map-zoom={plan?.zoom ?? "loading"}
      data-campus-map-max-zoom={config.maxZoom}
      data-campus-map-initial-scale={config.initialScale.toFixed(2)}
      data-campus-map-outer-width={config.outerBackdrop.width}
      data-campus-map-outer-height={config.outerBackdrop.height}
      data-campus-map-tile-count={plan?.tiles.length ?? 0}
      data-campus-map-scale={view?.scale.toFixed(4) ?? "loading"}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleDoubleClick}
    >
      {plan && view ? (
        <>
          <OuterBackdropLayer
            config={config}
            view={view}
            animateTransform={!isInteracting}
          />
          <TileLayer
            map={map}
            zoom={config.minZoom}
            view={view}
            tiles={plan.overviewTiles}
            className="z-[1]"
            animateTransform={!isInteracting}
          />
          {plan.zoom !== config.minZoom ? (
            <TileLayer
              map={map}
              zoom={plan.zoom}
              view={view}
              tiles={plan.tiles}
              className="z-[2]"
              animateTransform={!isInteracting}
            />
          ) : null}
        </>
      ) : null}

      {map === "2d" && view && viewport.width > 0 && viewport.height > 0 ? (
        <CampusMapEdgeFog
          config={config}
          view={view}
          viewport={viewport}
        />
      ) : null}

      {view ? (
        <CampusBuildingLayer
          buildings={visibleBuildings}
          mapWidth={config.width}
          mapHeight={config.height}
          view={view}
          viewport={viewport}
          showLabels={showBuildingLabels}
          showBuildingFrames={showBuildingFrames}
          fitScale={fitScale}
          selectedBuildingId={selectedBuildingId}
          animateTransform={!isInteracting}
          onSelect={selectBuilding}
          renderPopup={renderBuildingPopup}
        />
      ) : null}

      <div
        className="absolute top-[calc(var(--cockpit-edge)+72px)] z-20 flex flex-col items-end gap-2"
        style={{ right: "calc(var(--cockpit-side-panel-width, 0px) + 2rem)" }}
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-lg border border-cyan-400/20 bg-[#07152f] shadow-lg">
          <button
            type="button"
            aria-label="放大地图"
            title="放大地图"
            disabled={!canZoomIn}
            onClick={() => zoomBy(BUTTON_ZOOM_FACTOR)}
            className="flex h-9 w-9 items-center justify-center text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Plus className="h-4 w-4" />
          </button>
          <div className="h-px bg-cyan-400/15" />
          <button
            type="button"
            aria-label="缩小地图"
            title="缩小地图"
            disabled={!canZoomOut}
            onClick={() => zoomBy(1 / BUTTON_ZOOM_FACTOR)}
            className="flex h-9 w-9 items-center justify-center text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="h-px bg-cyan-400/15" />
          <button
            type="button"
            aria-label="重置地图视图"
            title="重置地图视图"
            onClick={resetView}
            className="flex h-9 w-9 items-center justify-center text-cyan-100 transition-colors hover:bg-cyan-400/15"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-cyan-400/15 bg-[#07152f] px-2 py-1 text-[10px] text-cyan-50/80">
          <Move className="h-3 w-3" />
          <span>Z{plan?.zoom ?? 0}/{config.maxZoom}</span>
          <span className="text-cyan-100/35">·</span>
          <span>{view ? Math.round(view.scale * 100) : 0}%</span>
        </div>
      </div>
    </div>
  );
}
