"use client";

/* eslint-disable @next/next/no-img-element -- Raw tile URLs must bypass Next image optimization. */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Minus, Move, Plus, RotateCcw } from "lucide-react";
import { CampusBuildingLayer } from "@/components/dashboard/campus-building-layer";
import { CampusMapOverlayControls } from "@/components/dashboard/campus-map-overlay-controls";
import {
  getCampusMapBuildings,
  type CampusMapKind,
} from "@/data/campus-map-buildings";

interface CampusTileBackgroundProps {
  map: CampusMapKind;
  className?: string;
  /** Adds a dark dashboard tint above the map without blocking foreground UI. */
  tone?: "leader" | "operations";
  cockpit?: boolean;
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
const BUTTON_ZOOM_FACTOR = 1.5;
const WHEEL_ZOOM_SPEED = 0.0015;
const DRAG_CLICK_THRESHOLD = 5;

// These values mirror public/campus-map/metadata.json. z5 is the native
// source resolution, so the interaction never scales beyond 100% clarity.
const MAP_CONFIG: Record<CampusMapKind, MapConfig> = {
  "2d": {
    width: 13_139,
    height: 8_759,
    minZoom: 0,
    maxZoom: 5,
  },
  "2_5d": {
    width: 14_336,
    height: 7_263,
    minZoom: 0,
    maxZoom: 5,
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getFitScale(viewport: ViewportSize, config: MapConfig) {
  if (viewport.width === 0 || viewport.height === 0) return 0;
  return Math.min(
    viewport.width / config.width,
    viewport.height / config.height,
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
  const scaledWidth = config.width * scale;
  const scaledHeight = config.height * scale;

  const offsetX = scaledWidth <= viewport.width
    ? (viewport.width - scaledWidth) / 2
    : clamp(candidate.offsetX, viewport.width - scaledWidth, 0);
  const offsetY = scaledHeight <= viewport.height
    ? (viewport.height - scaledHeight) / 2
    : clamp(candidate.offsetY, viewport.height - scaledHeight, 0);

  return { scale, offsetX, offsetY };
}

function getFitView(viewport: ViewportSize, config: MapConfig): ViewState {
  const scale = getFitScale(viewport, config);
  return constrainView({ scale, offsetX: 0, offsetY: 0 }, viewport, config);
}

function getLevelDimensions(config: MapConfig, zoom: number) {
  const divisor = 2 ** (config.maxZoom - zoom);
  return {
    divisor,
    width: Math.ceil(config.width / divisor),
    height: Math.ceil(config.height / divisor),
  };
}

function selectTileZoom(scale: number, config: MapConfig) {
  const idealZoom = Math.ceil(config.maxZoom + Math.log2(Math.max(scale, 0.000_001)));
  return clamp(idealZoom, config.minZoom, config.maxZoom);
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
          className="absolute max-w-none select-none opacity-0"
          style={{
            left: x * TILE_SIZE,
            top: y * TILE_SIZE,
            width: TILE_SIZE + 0.5,
            height: TILE_SIZE + 0.5,
          }}
          onLoad={(event) => {
            event.currentTarget.classList.remove("opacity-0");
            event.currentTarget.classList.add("opacity-100");
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
  tone = "leader",
  cockpit = false,
}: CampusTileBackgroundProps) {
  const config = MAP_CONFIG[map];
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<ViewState | null>(null);
  const viewportRef = useRef<ViewportSize>({ width: 0, height: 0 });
  const pendingViewRef = useRef<ViewState | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const dragRef = useRef<DragGesture | null>(null);
  const pinchRef = useRef<PinchGesture | null>(null);

  const [viewport, setViewport] = useState<ViewportSize>({ width: 0, height: 0 });
  const [view, setView] = useState<ViewState | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  // The cockpit uses compact status points; the standalone map keeps its
  // searchable building-name labels and can still toggle them from the toolbar.
  const [showBuildingLabels, setShowBuildingLabels] = useState(() => !cockpit);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);

  const mappedBuildings = getCampusMapBuildings(map);

  const scheduleView = useCallback((candidate: ViewState) => {
    const constrained = constrainView(candidate, viewportRef.current, config);
    viewRef.current = constrained;
    pendingViewRef.current = constrained;

    if (animationFrameRef.current !== null) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      const pending = pendingViewRef.current;
      if (pending) setView(pending);
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

  const selectFromSearch = useCallback((buildingId: string) => {
    setSelectedBuildingId(buildingId);
    if (!cockpit) focusBuilding(buildingId);
  }, [cockpit, focusBuilding]);

  const selectBuilding = useCallback((buildingId: string | null) => {
    setSelectedBuildingId(buildingId);
    if (buildingId && !cockpit) focusBuilding(buildingId);
  }, [cockpit, focusBuilding]);

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
        const oldFitScale = getFitScale(previousViewport, config);
        const newFitScale = getFitScale(nextViewport, config);
        const relativeZoom = oldFitScale > 0 ? current.scale / oldFitScale : 1;
        const centerX = (previousViewport.width / 2 - current.offsetX) / current.scale;
        const centerY = (previousViewport.height / 2 - current.offsetY) / current.scale;
        const scale = clamp(newFitScale * relativeZoom, newFitScale, MAX_NATIVE_SCALE);
        nextView = constrainView({
          scale,
          offsetX: nextViewport.width / 2 - centerX * scale,
          offsetY: nextViewport.height / 2 - centerY * scale,
        }, nextViewport, config);
      }

      viewportRef.current = nextViewport;
      viewRef.current = nextView;
      setViewport(nextViewport);
      setView(nextView);
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
      event.preventDefault();
      const current = viewRef.current;
      if (!current) return;
      const rect = container.getBoundingClientRect();
      const factor = Math.exp(-event.deltaY * WHEEL_ZOOM_SPEED);
      zoomAt(
        current.scale * factor,
        event.clientX - rect.left,
        event.clientY - rect.top,
      );
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [zoomAt]);

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
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
        setSelectedBuildingId(null);
      }
    }
  }, []);

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
    const zoom = selectTileZoom(view.scale, config);
    return {
      zoom,
      tiles: getVisibleTiles(view, viewport, config, zoom),
      overviewTiles: getVisibleTiles(view, viewport, config, config.minZoom),
    };
  }, [config, view, viewport]);

  const tint = tone === "leader"
    ? cockpit
      ? "radial-gradient(circle at 51% 43%, rgba(104,202,232,.04) 0%, rgba(13,69,97,.03) 48%, rgba(3,27,45,.16) 100%), linear-gradient(180deg, rgba(24,83,112,.04), rgba(3,25,42,.14))"
      : "linear-gradient(180deg, rgba(8,16,40,0.16), rgba(8,16,40,0.38))"
    : cockpit
      ? "radial-gradient(circle at 50% 44%, rgba(104,202,232,.035) 0%, rgba(13,69,97,.025) 50%, rgba(3,27,45,.15) 100%), linear-gradient(180deg, rgba(24,83,112,.035), rgba(3,25,42,.13))"
      : "linear-gradient(180deg, rgba(8,16,40,0.10), rgba(8,16,40,0.30))";
  const fitScale = getFitScale(viewport, config);
  const canZoomOut = Boolean(view && view.scale > fitScale + 0.000_001);
  const canZoomIn = Boolean(view && view.scale < MAX_NATIVE_SCALE - 0.000_001);

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="可缩放校园地图"
      tabIndex={0}
      className={`absolute inset-0 overflow-clip bg-[#081028] select-none outline-none ${isInteracting ? "cursor-grabbing" : "cursor-grab"} ${className}`}
      style={{ touchAction: "none", contain: "layout paint" }}
      data-campus-map={map}
      data-campus-map-zoom={plan?.zoom ?? "loading"}
      data-campus-map-max-zoom={config.maxZoom}
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
          <TileLayer
            map={map}
            zoom={config.minZoom}
            view={view}
            tiles={plan.overviewTiles}
            className={cockpit ? "z-0 brightness-[.94] saturate-[.94] contrast-[1.06] hue-rotate-[4deg]" : "z-0"}
            animateTransform={!isInteracting}
          />
          {plan.zoom !== config.minZoom ? (
            <TileLayer
              map={map}
              zoom={plan.zoom}
              view={view}
              tiles={plan.tiles}
              className={cockpit ? "z-[1] brightness-[.94] saturate-[.94] contrast-[1.06] hue-rotate-[4deg]" : "z-[1]"}
              animateTransform={!isInteracting}
            />
          ) : null}
        </>
      ) : null}

      <div className="pointer-events-none absolute inset-0 z-10" style={{ background: tint }} />
      {cockpit ? (
        <>
          <div className="campus-night-blueprint pointer-events-none absolute inset-0 z-[9]" />
          <div className="campus-night-lights pointer-events-none absolute inset-0 z-[11]" />
          <div className="campus-night-vignette pointer-events-none absolute inset-0 z-[13]" />
        </>
      ) : null}

      {view ? (
        <CampusBuildingLayer
          buildings={mappedBuildings}
          mapWidth={config.width}
          mapHeight={config.height}
          view={view}
          viewport={viewport}
          showLabels={showBuildingLabels}
          selectedBuildingId={selectedBuildingId}
          animateTransform={!isInteracting}
          onSelect={selectBuilding}
          cockpit={cockpit}
        />
      ) : null}

      {!cockpit && <div
        className="absolute top-3 z-20"
        style={{ left: "calc(var(--cockpit-side-panel-width, 0px) + 2rem)" }}
      >
        <CampusMapOverlayControls
          buildings={mappedBuildings}
          selectedBuildingId={selectedBuildingId}
          showLabels={showBuildingLabels}
          onShowLabelsChange={setShowBuildingLabels}
          onBuildingSelect={selectFromSearch}
        />
      </div>}

      {!cockpit && <div
        className="absolute top-3 z-20 flex flex-col items-end gap-2"
        style={{ right: "calc(var(--cockpit-side-panel-width, 0px) + 2rem)" }}
        onPointerDown={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
      >
        <div className="overflow-hidden rounded-lg border border-cyan-400/20 bg-[#07152f]/85 shadow-lg backdrop-blur-sm">
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
        <div className="flex items-center gap-1.5 rounded-md border border-cyan-400/15 bg-[#07152f]/80 px-2 py-1 text-[10px] text-cyan-50/80 backdrop-blur-sm">
          <Move className="h-3 w-3" />
          <span>Z{plan?.zoom ?? 0}/{config.maxZoom}</span>
          <span className="text-cyan-100/35">·</span>
          <span>{view ? Math.round(view.scale * 100) : 0}%</span>
        </div>
      </div>}
    </div>
  );
}
