"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type CampusMapKind = "2d" | "2_5d";

interface CampusTileBackgroundProps {
  map: CampusMapKind;
  className?: string;
  /** Adds a dark dashboard tint above the map without blocking foreground UI. */
  tone?: "leader" | "operations";
}

interface ViewportSize {
  width: number;
  height: number;
  pixelRatio: number;
}

const TILE_SIZE = 512;

const MAP_CONFIG: Record<CampusMapKind, {
  width: number;
  height: number;
  maxZoom: number;
}> = {
  "2d": {
    width: 13_139,
    height: 8_759,
    maxZoom: 5,
  },
  "2_5d": {
    width: 14_336,
    height: 7_263,
    maxZoom: 5,
  },
};

/**
 * Responsive, non-interactive campus map background.
 *
 * It selects the smallest tile pyramid level that remains sharp for the
 * current viewport (up to 2x DPR), then renders only that level. This keeps
 * dashboard startup light while preserving the full-resolution source for
 * larger displays.
 */
export function CampusTileBackground({
  map,
  className = "",
  tone = "leader",
}: CampusTileBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportSize>({
    width: 0,
    height: 0,
    pixelRatio: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(0, Math.round(rect.width));
      const height = Math.max(0, Math.round(rect.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      setViewport((current) => {
        if (
          current.width === width
          && current.height === height
          && current.pixelRatio === pixelRatio
        ) {
          return current;
        }
        return { width, height, pixelRatio };
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const plan = useMemo(() => {
    if (viewport.width === 0 || viewport.height === 0) return null;

    const config = MAP_CONFIG[map];
    const coverScale = Math.max(
      viewport.width / config.width,
      viewport.height / config.height,
    );
    const targetWidth = config.width * coverScale * viewport.pixelRatio;
    const targetHeight = config.height * coverScale * viewport.pixelRatio;

    let zoom = 0;
    while (zoom < config.maxZoom) {
      const divisor = 2 ** (config.maxZoom - zoom);
      const levelWidth = Math.ceil(config.width / divisor);
      const levelHeight = Math.ceil(config.height / divisor);
      if (levelWidth >= targetWidth && levelHeight >= targetHeight) break;
      zoom += 1;
    }

    const divisor = 2 ** (config.maxZoom - zoom);
    const levelWidth = Math.ceil(config.width / divisor);
    const levelHeight = Math.ceil(config.height / divisor);
    const columns = Math.ceil(levelWidth / TILE_SIZE);
    const rows = Math.ceil(levelHeight / TILE_SIZE);
    const displayScale = Math.max(
      viewport.width / levelWidth,
      viewport.height / levelHeight,
    );
    const displayWidth = levelWidth * displayScale;
    const displayHeight = levelHeight * displayScale;
    const offsetX = (viewport.width - displayWidth) / 2;
    const offsetY = (viewport.height - displayHeight) / 2;

    const tiles = Array.from({ length: columns * rows }, (_, index) => ({
      x: index % columns,
      y: Math.floor(index / columns),
    }));

    return {
      zoom,
      levelWidth,
      levelHeight,
      displayScale,
      displayWidth,
      displayHeight,
      offsetX,
      offsetY,
      tiles,
    };
  }, [map, viewport]);

  const tint = tone === "leader"
    ? "linear-gradient(180deg, rgba(8,16,40,0.16), rgba(8,16,40,0.38))"
    : "linear-gradient(180deg, rgba(8,16,40,0.10), rgba(8,16,40,0.30))";

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden bg-[#081028] pointer-events-none select-none ${className}`}
      data-campus-map={map}
      data-campus-map-zoom={plan?.zoom ?? "loading"}
      data-campus-map-tile-count={plan?.tiles.length ?? 0}
    >
      {plan && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: plan.offsetX,
            top: plan.offsetY,
            width: plan.displayWidth,
            height: plan.displayHeight,
          }}
        >
          {plan.tiles.map(({ x, y }) => (
            <img
              key={`${plan.zoom}-${x}-${y}`}
              src={`/campus-map/${map}/${plan.zoom}/${x}/${y}.webp`}
              alt=""
              draggable={false}
              decoding="async"
              className="absolute max-w-none"
              style={{
                left: x * TILE_SIZE * plan.displayScale,
                top: y * TILE_SIZE * plan.displayScale,
                width: TILE_SIZE * plan.displayScale + 0.5,
                height: TILE_SIZE * plan.displayScale + 0.5,
              }}
            />
          ))}
        </div>
      )}
      <div className="absolute inset-0" style={{ background: tint }} />
    </div>
  );
}
