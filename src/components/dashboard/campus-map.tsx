"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { campusBuildings, type BuildingProperties } from "@/data/campus-geojson";

// ============================================================
// 常量
// ============================================================
const CAMPUS_CENTER: [number, number] = [116.3498, 39.9912];
const CAMPUS_ZOOM = 16;
const IMAGE_COORDS: [number, number][] = [
  [116.3445, 39.9938], // 左上
  [116.3548, 39.9938], // 右上
  [116.3548, 39.9882], // 右下
  [116.3445, 39.9882], // 左下
];

const STATUS_COLORS: Record<string, string> = {
  "正常": "#36d968",
  "预警": "#ff7b25",
  "超标": "#ff3333",
};

const ENERGY_COLORS: Record<string, string> = {
  A: "#36d968",
  B: "#3488ff",
  C: "#ff7b25",
  D: "#ff3333",
};

// ============================================================
// 工具函数
// ============================================================
function computeCentroid(coords: number[][][]): [number, number] {
  const ring = coords[0];
  let cx = 0, cy = 0;
  for (const [x, y] of ring) { cx += x; cy += y; }
  return [cx / ring.length, cy / ring.length];
}

function formatNumber(n: number): string {
  return n.toLocaleString("zh-CN");
}

// ============================================================
// 子组件
// ============================================================

function BuildingPopup({
  building,
  onClose,
}: {
  building: BuildingProperties;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 w-[380px] max-w-[calc(100vw-2rem)] 
                 bg-[#0a1628]/95 backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl overflow-hidden"
    >
      {/* 照片 */}
      {building.photoUrl && (
        <div className="relative h-44 overflow-hidden">
          <img
            src={building.photoUrl}
            alt={building.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 text-white/80 
                       hover:bg-black/70 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}
      {!building.photoUrl && (
        <div className="flex items-center justify-between px-5 pt-4">
          <h3 className="text-white font-bold text-lg">{building.name}</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 text-white/60 
                       hover:bg-white/20 hover:text-white flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      <div className="p-5 pt-3 space-y-3">
        {building.photoUrl && (
          <h3 className="text-white font-bold text-lg">{building.name}</h3>
        )}

        {/* 状态标签 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: STATUS_COLORS[building.status] + "20",
              color: STATUS_COLORS[building.status],
              border: `1px solid ${STATUS_COLORS[building.status]}40`,
            }}
          >
            {building.status}
          </span>
          <span className="text-white/40 text-xs">{building.type}</span>
          <span className="text-white/40 text-xs">{building.floors}层</span>
          <span className="text-white/40 text-xs">{formatNumber(building.area)}m²</span>
        </div>

        {/* 数据指标 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-white/40 text-[10px] mb-1">年碳排放</div>
            <div className="text-white font-bold text-lg">{formatNumber(building.carbonEmission)}</div>
            <div className="text-white/30 text-[10px]">tCO₂</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-white/40 text-[10px] mb-1">年能耗</div>
            <div className="text-white font-bold text-lg">{formatNumber(building.energyConsumption / 10000)}</div>
            <div className="text-white/30 text-[10px]">万kWh</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-white/40 text-[10px] mb-1">能效等级</div>
            <div
              className="text-lg font-bold"
              style={{ color: ENERGY_COLORS[building.energyLevel] }}
            >
              {building.energyLevel}
            </div>
            <div className="text-white/30 text-[10px]">
              {building.energyLevel === "A" ? "优秀" : building.energyLevel === "B" ? "良好" : building.energyLevel === "C" ? "一般" : "较差"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// 主组件
// ============================================================
export default function CampusMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingProperties | null>(null);
  const [overlayMode, setOverlayMode] = useState<"carbon" | "energy" | "status">("carbon");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [show2dBase, setShow2dBase] = useState(false);

  // 统计摘要
  const summary = useMemo(() => {
    const features = campusBuildings.features;
    const totalEmission = features.reduce((s: number, f) => s + f.properties.carbonEmission, 0);
    const totalEnergy = features.reduce((s: number, f) => s + f.properties.energyConsumption, 0);
    const warningCount = features.filter((f) => f.properties.status === "预警" || f.properties.status === "超标").length;
    return { totalEmission, totalEnergy, totalBuildings: features.length, warningCount };
  }, []);

  // ============================================================
  // 地图初始化
  // ============================================================
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm-tiles",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: CAMPUS_CENTER,
      zoom: CAMPUS_ZOOM,
      minZoom: 14,
      maxZoom: 19,
      pitch: 0,
      bearing: 0,
      cooperativeGestures: true,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // 添加 2.5D 校园全景图作为图像源
      map.addSource("campus-image", {
        type: "image",
        url: "/images/beike-campus-2.5d.png",
        coordinates: IMAGE_COORDS,
      });
      map.addLayer({
        id: "campus-image-layer",
        type: "raster",
        source: "campus-image",
        paint: {
          "raster-opacity": 0.92,
          "raster-fade-duration": 0,
        },
      });

      // 添加建筑照片 Marker
      addPhotoMarkers(map);

      setMapLoaded(true);
    });

    map.on("click", "campus-image-layer", () => {
      setSelectedBuilding(null);
    });

    mapRef.current = map;
  }, []);

  // ============================================================
  // 照片 Marker
  // ============================================================
  const addPhotoMarkers = useCallback((map: maplibregl.Map) => {
    // 清除旧 markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    campusBuildings.features.forEach((feature) => {
      const props = feature.properties;
      const centroid = computeCentroid(feature.geometry.coordinates as number[][][]);

      const el = document.createElement("div");
      el.className = "building-photo-marker";
      el.innerHTML = `
        <div class="relative group cursor-pointer transition-all duration-200 hover:z-50">
          <div class="w-16 h-16 rounded-lg overflow-hidden border-2 border-white/20 
                      shadow-lg group-hover:border-[#3488ff] group-hover:scale-125 
                      group-hover:shadow-[0_0_20px_rgba(52,136,255,0.4)] transition-all duration-200">
            <img src="${props.photoUrl || "/images/buildings/model.jpg"}" 
                 alt="${props.name}" 
                 class="w-full h-full object-cover"
                 onerror="this.src='/images/buildings/model.jpg'" />
          </div>
          <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] 
                      text-white/90 whitespace-nowrap bg-black/60 px-1.5 py-0.5 rounded
                      group-hover:bg-[#3488ff]/80 transition-colors">
            ${props.name}
          </div>
          ${
            props.status === "超标"
              ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-[#ff3333] rounded-full 
                          border border-white animate-pulse"></div>`
              : props.status === "预警"
                ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-[#ff7b25] rounded-full 
                            border border-white"></div>`
                : ""
          }
        </div>
      `;

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedBuilding(props);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(centroid)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, []);

  // ============================================================
  // 生命周期
  // ============================================================
  useEffect(() => {
    // IntersectionObserver 懒加载
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !mapRef.current) {
          initMap();
        }
      },
      { threshold: 0.1 }
    );

    if (mapContainerRef.current) {
      observerRef.current.observe(mapContainerRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
      resizeObserverRef.current?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [initMap]);

  // ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current) return;
    resizeObserverRef.current = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    resizeObserverRef.current.observe(mapContainerRef.current);
    return () => resizeObserverRef.current?.disconnect();
  }, [mapLoaded]);

  // 切换底图（2.5D 图像 ↔ OSM）
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    if (show2dBase) {
      map.setLayoutProperty("campus-image-layer", "visibility", "none");
    } else {
      map.setLayoutProperty("campus-image-layer", "visibility", "visible");
    }
  }, [show2dBase, mapLoaded]);

  // 全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ============================================================
  // 渲染
  // ============================================================
  return (
    <div className="relative w-full h-full min-h-[600px] bg-[#081028] rounded-xl overflow-hidden">
      {/* 地图容器 */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* 加载骨架屏 */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#081028] z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#3488ff]/30 border-t-[#3488ff] rounded-full animate-spin" />
            <span className="text-white/40 text-sm">加载校园地图...</span>
          </div>
        </div>
      )}

      {/* 顶部控制栏 */}
      {mapLoaded && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2">
          {/* 左侧：标题 */}
          <div className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-white text-sm font-medium">北京科技大学 · 校园碳地图</span>
            <span className="text-white/30 text-[10px] ml-2">2.5D 全景</span>
          </div>

          {/* 右侧：控制按钮 */}
          <div className="flex items-center gap-1.5">
            {/* 底图切换 */}
            <button
              onClick={() => setShow2dBase(!show2dBase)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                show2dBase
                  ? "bg-white/10 text-white/60 border border-white/10"
                  : "bg-[#3488ff]/20 text-[#3488ff] border border-[#3488ff]/30"
              }`}
            >
              {show2dBase ? "🗺 地图" : "🏛 全景"}
            </button>

            {/* 覆盖层切换 */}
            <select
              value={overlayMode}
              onChange={(e) => setOverlayMode(e.target.value as typeof overlayMode)}
              className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1.5 
                         text-white text-xs outline-none cursor-pointer hover:border-white/20 transition-colors"
            >
              <option value="carbon">碳排放</option>
              <option value="energy">能效等级</option>
              <option value="status">运行状态</option>
            </select>

            {/* 全屏 */}
            <button
              onClick={toggleFullscreen}
              className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-2.5 py-1.5
                         text-white/60 text-xs hover:text-white hover:border-white/20 transition-all"
            >
              {isFullscreen ? "⤓ 退出" : "⤢ 全屏"}
            </button>
          </div>
        </div>
      )}

      {/* 底部统计摘要 */}
      {mapLoaded && (
        <div className="absolute bottom-3 left-3 z-20 flex gap-2">
          <div className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-white/40 text-[10px]">建筑</span>
            <span className="text-white text-sm font-bold ml-1.5">{summary.totalBuildings}</span>
            <span className="text-white/30 text-[10px] ml-0.5">栋</span>
          </div>
          <div className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-white/40 text-[10px]">年排放</span>
            <span className="text-white text-sm font-bold ml-1.5">{formatNumber(summary.totalEmission)}</span>
            <span className="text-white/30 text-[10px] ml-0.5">tCO₂</span>
          </div>
          <div className="bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5">
            <span className="text-white/40 text-[10px]">预警</span>
            <span
              className="text-sm font-bold ml-1.5"
              style={{ color: summary.warningCount > 0 ? "#ff7b25" : "#36d968" }}
            >
              {summary.warningCount}
            </span>
            <span className="text-white/30 text-[10px] ml-0.5">栋</span>
          </div>
        </div>
      )}

      {/* 图例 */}
      {mapLoaded && (
        <div className="absolute bottom-3 right-3 z-20 bg-[#0a1628]/85 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2">
          <div className="text-white/40 text-[10px] mb-1.5">
            {overlayMode === "carbon" ? "碳排放量" : overlayMode === "energy" ? "能效等级" : "运行状态"}
          </div>
          {overlayMode === "carbon" && (
            <div className="flex items-center gap-3">
              {[
                { color: "#36d968", label: "低" },
                { color: "#3488ff", label: "中" },
                { color: "#ff7b25", label: "高" },
                { color: "#ff3333", label: "超高" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50 text-[10px]">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          {overlayMode === "energy" && (
            <div className="flex items-center gap-3">
              {[
                { color: "#36d968", label: "A" },
                { color: "#3488ff", label: "B" },
                { color: "#ff7b25", label: "C" },
                { color: "#ff3333", label: "D" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50 text-[10px]">{item.label}</span>
                </div>
              ))}
            </div>
          )}
          {overlayMode === "status" && (
            <div className="flex items-center gap-3">
              {[
                { color: "#36d968", label: "正常" },
                { color: "#ff7b25", label: "预警" },
                { color: "#ff3333", label: "超标" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-white/50 text-[10px]">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 建筑详情弹窗 */}
      <AnimatePresence>
        {selectedBuilding && (
          <BuildingPopup building={selectedBuilding} onClose={() => setSelectedBuilding(null)} />
        )}
      </AnimatePresence>

      {/* 水印 */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 text-[10px] text-white/20 pointer-events-none">
        Demo 模拟数据，仅课题演示
      </div>
    </div>
  );
}
