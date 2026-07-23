"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Feature, Polygon } from "geojson";
import {
  campusBuildings,
  campusBoundary,
  CAMPUS_CENTER,
  DEFAULT_ZOOM,
  CAMPUS_3D_PITCH,
  CAMPUS_3D_BEARING,
  CAMPUS_25D_PITCH,
  CAMPUS_25D_BEARING,
  type BuildingProperties,
} from "@/data/campus-geojson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Eye,
  Layers,
  Maximize2,
  RotateCcw,
  AlertTriangle,
  Leaf,
  Zap,
  Thermometer,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ========== 类型 ========== */
type ViewMode = "3d" | "2.5d" | "2d";
type OverlayLayer = "emission" | "energy" | "status";

interface CampusMapProps {
  className?: string;
}

/* ========== 建筑详情弹窗 ========== */
function BuildingPopup({
  building,
  onClose,
}: {
  building: BuildingProperties;
  onClose: () => void;
}) {
  const statusColor: Record<string, string> = {
    正常: "bg-emerald-100 text-emerald-700 border-emerald-300",
    预警: "bg-amber-100 text-amber-700 border-amber-300",
    超标: "bg-red-100 text-red-700 border-red-300",
  };

  const energyColor: Record<string, string> = {
    A: "text-emerald-600",
    B: "text-blue-600",
    C: "text-amber-600",
    D: "text-red-600",
  };

  return (
    <div className="absolute bottom-4 left-4 z-30 w-80 animate-in slide-in-from-bottom-2 duration-200">
      <Card className="shadow-lg border-slate-200">
        <CardHeader className="pb-2 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Building2 size={16} className="text-blue-500" />
              {building.name}
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
              <X size={14} />
            </Button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={cn("text-xs", statusColor[building.status])}>
              {building.status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {building.type}
            </Badge>
            <span className="text-xs text-slate-500">{building.floors}层</span>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Zap size={12} className="text-amber-500" />
              <span className="text-slate-500">年能耗</span>
              <span className="font-mono font-medium ml-auto">
                {Math.abs(building.energyConsumption).toLocaleString()} kWh
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf size={12} className="text-emerald-500" />
              <span className="text-slate-500">碳排放</span>
              <span className="font-mono font-medium ml-auto">
                {Math.abs(building.carbonEmission)} tCO₂
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Thermometer size={12} className="text-red-500" />
              <span className="text-slate-500">面积</span>
              <span className="font-mono font-medium ml-auto">
                {building.area.toLocaleString()} m²
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertTriangle size={12} className="text-slate-400" />
              <span className="text-slate-500">能效</span>
              <span className={cn("font-mono font-bold ml-auto", energyColor[building.energyLevel])}>
                {building.energyLevel}
              </span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                building.energyLevel === "A"
                  ? "bg-emerald-500"
                  : building.energyLevel === "B"
                    ? "bg-blue-500"
                    : building.energyLevel === "C"
                      ? "bg-amber-500"
                      : "bg-red-500"
              )}
              style={{
                width:
                  building.energyLevel === "A"
                    ? "25%"
                    : building.energyLevel === "B"
                      ? "50%"
                      : building.energyLevel === "C"
                        ? "75%"
                        : "100%",
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ========== 主组件 ========== */
export function CampusMap({ className }: CampusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const isVisibleRef = useRef(false);

  const [viewMode, setViewMode] = useState<ViewMode>("2.5d");
  const [overlay, setOverlay] = useState<OverlayLayer>("emission");
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingProperties | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ---- 颜色映射 ---- */
  const getEmissionColor = useCallback((building: BuildingProperties): string => {
    const emission = Math.abs(building.carbonEmission);
    if (emission <= 200) return "#16A34A";
    if (emission <= 400) return "#3B82F6";
    if (emission <= 600) return "#F59E0B";
    return "#DC2626";
  }, []);

  const getEnergyColor = useCallback((building: BuildingProperties): string => {
    const level = building.energyLevel;
    const colors: Record<string, string> = { A: "#16A34A", B: "#3B82F6", C: "#F59E0B", D: "#DC2626" };
    return colors[level] || "#94A3B8";
  }, []);

  const getStatusColor = useCallback((building: BuildingProperties): string => {
    const colors: Record<string, string> = { 正常: "#16A34A", 预警: "#F59E0B", 超标: "#DC2626" };
    return colors[building.status] || "#94A3B8";
  }, []);

  const getBuildingColor = useCallback(
    (building: BuildingProperties): string => {
      if (overlay === "emission") return getEmissionColor(building);
      if (overlay === "energy") return getEnergyColor(building);
      return getStatusColor(building);
    },
    [overlay, getEmissionColor, getEnergyColor, getStatusColor]
  );

  /* ---- 建筑高度（用于3D拉伸） ---- */
  const buildingHeight = useCallback((props: BuildingProperties): number => {
    return props.floors * 4; // 每层约4米
  }, []);

  /* ---- 更新图层颜色 ---- */
  const updateOverlayColors = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // 更新3D拉伸图层颜色
    if (map.getLayer("buildings-3d")) {
      const expression = [
        "match",
        ["get", "id"],
        ...campusBuildings.features.flatMap((f: Feature<Polygon, BuildingProperties>) => [f.properties.id, getBuildingColor(f.properties)]),
        "#94A3B8",
      ] as (string | string[])[];
      map.setPaintProperty("buildings-3d", "fill-extrusion-color", expression as unknown as string);
    }

    // 更新2D底面图层颜色
    if (map.getLayer("buildings-2d")) {
      const expression = [
        "match",
        ["get", "id"],
        ...campusBuildings.features.flatMap((f: Feature<Polygon, BuildingProperties>) => [f.properties.id, getBuildingColor(f.properties)]),
        "#94A3B8",
      ] as (string | string[])[];
      map.setPaintProperty("buildings-2d", "fill-color", expression as unknown as string);
    }
  }, [mapLoaded, getBuildingColor]);

  /* ---- 初始化地图 ---- */
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "&copy; OpenStreetMap contributors",
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
      },
      center: CAMPUS_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: CAMPUS_25D_PITCH,
      bearing: CAMPUS_25D_BEARING,
      maxPitch: 85,
      // 【协同手势】解决页面滚动与地图缩放冲突
      // MapLibre v6 cooperativeGestures 类型只接受 boolean，但运行时支持对象配置
      cooperativeGestures: true as unknown as boolean,
    });

    // 添加导航控件
    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120 }), "bottom-right");

    map.on("load", () => {
      // 校园边界
      map.addSource("campus-boundary", {
        type: "geojson",
        data: campusBoundary,
      });

      map.addLayer({
        id: "campus-boundary-fill",
        type: "fill",
        source: "campus-boundary",
        paint: {
          "fill-color": "#0099FF",
          "fill-opacity": 0.04,
        },
      });

      map.addLayer({
        id: "campus-boundary-line",
        type: "line",
        source: "campus-boundary",
        paint: {
          "line-color": "#0099FF",
          "line-width": 2,
          "line-dasharray": [4, 2],
          "line-opacity": 0.5,
        },
      });

      // 建筑数据源
      map.addSource("campus-buildings", {
        type: "geojson",
        data: campusBuildings,
      });

      // 3D 拉伸建筑图层
      map.addLayer({
        id: "buildings-3d",
        type: "fill-extrusion",
        source: "campus-buildings",
        paint: {
          "fill-extrusion-color": [
            "match",
            ["get", "id"],
            ...campusBuildings.features.flatMap((f: Feature<Polygon, BuildingProperties>) => [
              f.properties.id,
              getBuildingColor(f.properties),
            ]),
            "#94A3B8",
          ] as unknown as string,
          "fill-extrusion-height": [
            "+",
            ["*", ["get", "floors"], 4],
            0,
          ] as unknown as number,
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.85,
        },
      });

      // 2D 建筑底面（当切换到2D模式时显示）
      map.addLayer({
        id: "buildings-2d",
        type: "fill",
        source: "campus-buildings",
        paint: {
          "fill-color": [
            "match",
            ["get", "id"],
            ...campusBuildings.features.flatMap((f: Feature<Polygon, BuildingProperties>) => [
              f.properties.id,
              getBuildingColor(f.properties),
            ]),
            "#94A3B8",
          ] as unknown as string,
          "fill-opacity": 0.7,
        },
        layout: {
          visibility: "none",
        },
      });

      // 建筑轮廓线
      map.addLayer({
        id: "buildings-outline",
        type: "line",
        source: "campus-buildings",
        paint: {
          "line-color": "#334155",
          "line-width": 1,
          "line-opacity": 0.6,
        },
      });

      // 建筑名称标注
      map.addSource("campus-buildings-labels", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: campusBuildings.features.map((f: Feature<Polygon, BuildingProperties>) => ({
            type: "Feature",
            properties: { name: f.properties.name, id: f.properties.id },
            geometry: {
              type: "Point",
              coordinates: getCentroid(f.geometry.coordinates[0] as [number, number][]),
            },
          })),
        },
      });

      map.addLayer({
        id: "building-labels",
        type: "symbol",
        source: "campus-buildings-labels",
        layout: {
          "text-field": ["get", "name"],
          "text-size": 11,
          "text-anchor": "center",
          "text-offset": [0, 0],
          "text-allow-overlap": false,
          "text-font": ["Open Sans Regular"],
        },
        paint: {
          "text-color": "#1E293B",
          "text-halo-color": "#FFFFFF",
          "text-halo-width": 1.5,
        },
      });

      setMapLoaded(true);
    });

    // 点击建筑显示详情
    map.on("click", "buildings-3d", (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
      if (e.features && e.features.length > 0) {
        const props = e.features[0].properties as unknown as BuildingProperties;
        setSelectedBuilding(props);
      }
    });

    // 鼠标悬停变手型
    map.on("mouseenter", "buildings-3d", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "buildings-3d", () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;
  }, [getBuildingColor]);

  /* ---- 计算多边形质心 ---- */
  function getCentroid(coords: [number, number][]): [number, number] {
    const n = coords.length - 1; // 去掉闭合点
    let lng = 0;
    let lat = 0;
    for (let i = 0; i < n; i++) {
      lng += coords[i][0];
      lat += coords[i][1];
    }
    return [lng / n, lat / n];
  }

  /* ---- IntersectionObserver 懒加载 ---- */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    intersectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisibleRef.current) {
            isVisibleRef.current = true;
            initMap();
          } else if (!entry.isIntersecting && isVisibleRef.current) {
            // 离开视口时可选择暂停渲染，这里保持地图运行
          }
        });
      },
      { threshold: 0.1 }
    );

    intersectionObserverRef.current.observe(container);

    // 如果容器已在视口内（首屏场景），直接初始化
    const rect = container.getBoundingClientRect();
    if (
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    ) {
      isVisibleRef.current = true;
      initMap();
    }

    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, [initMap]);

  /* ---- ResizeObserver 容器形变监听 ---- */
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    resizeObserverRef.current = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    resizeObserverRef.current.observe(container);

    return () => {
      resizeObserverRef.current?.disconnect();
    };
  }, []);

  /* ---- 生命周期：组件销毁时释放 WebGL 资源 ---- */
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  /* ---- 切换视角模式 ---- */
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    const map = mapRef.current;
    if (!map) return;

    setViewMode(mode);

    if (mode === "3d") {
      map.easeTo({ pitch: CAMPUS_3D_PITCH, bearing: CAMPUS_3D_BEARING, duration: 800 });
      if (map.getLayer("buildings-3d")) map.setLayoutProperty("buildings-3d", "visibility", "visible");
      if (map.getLayer("buildings-2d")) map.setLayoutProperty("buildings-2d", "visibility", "none");
    } else if (mode === "2.5d") {
      map.easeTo({ pitch: CAMPUS_25D_PITCH, bearing: CAMPUS_25D_BEARING, duration: 800 });
      if (map.getLayer("buildings-3d")) map.setLayoutProperty("buildings-3d", "visibility", "visible");
      if (map.getLayer("buildings-2d")) map.setLayoutProperty("buildings-2d", "visibility", "none");
    } else {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      if (map.getLayer("buildings-3d")) map.setLayoutProperty("buildings-3d", "visibility", "none");
      if (map.getLayer("buildings-2d")) map.setLayoutProperty("buildings-2d", "visibility", "visible");
    }
  }, []);

  /* ---- 重置视角 ---- */
  const handleResetView = useCallback(() => {
    mapRef.current?.easeTo({
      center: CAMPUS_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: viewMode === "2d" ? 0 : viewMode === "3d" ? CAMPUS_3D_PITCH : CAMPUS_25D_PITCH,
      bearing: viewMode === "3d" ? CAMPUS_3D_BEARING : viewMode === "2.5d" ? CAMPUS_25D_BEARING : 0,
      duration: 800,
    });
    setSelectedBuilding(null);
  }, [viewMode]);

  /* ---- 覆盖层切换时更新颜色 ---- */
  useEffect(() => {
    updateOverlayColors();
  }, [overlay, updateOverlayColors]);

  /* ---- 全屏切换 ---- */
  const handleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    // 触发 resize 让地图适配新容器
    setTimeout(() => mapRef.current?.resize(), 100);
  }, []);

  /* ---- 统计摘要 ---- */
  const summary = useMemo(() => {
    const buildings: BuildingProperties[] = campusBuildings.features.map((f: Feature<Polygon, BuildingProperties>) => f.properties);
    const totalEmission = buildings.reduce((sum: number, b: BuildingProperties) => sum + Math.max(0, b.carbonEmission), 0);
    const totalEnergy = buildings.reduce((sum: number, b: BuildingProperties) => sum + Math.max(0, b.energyConsumption), 0);
    const totalArea = buildings.reduce((sum: number, b: BuildingProperties) => sum + b.area, 0);
    const warningCount = buildings.filter((b: BuildingProperties) => b.status === "预警" || b.status === "超标").length;
    const solarGeneration = buildings
      .filter((b: BuildingProperties) => b.energyConsumption < 0)
      .reduce((sum: number, b: BuildingProperties) => sum + Math.abs(b.energyConsumption), 0);
    return { totalEmission, totalEnergy, totalArea, warningCount, solarGeneration, buildingCount: buildings.length };
  }, []);

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        isFullscreen && "fixed inset-0 z-50 bg-slate-50",
        className
      )}
    >
      {/* ===== 顶部工具栏 ===== */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Building2 size={20} className="text-blue-500" />
            北京科技大学 校园碳地图
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            3D/2.5D 可视化校园建筑碳排放分布 · Demo 模拟数据
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 视角切换 */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            {(["2.5d", "3d", "2d"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs rounded-none",
                  viewMode === mode && "bg-blue-500 hover:bg-blue-600"
                )}
                onClick={() => handleViewModeChange(mode)}
              >
                <Layers size={12} className="mr-1" />
                {mode.toUpperCase()}
              </Button>
            ))}
          </div>

          {/* 覆盖层切换 */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
            {([
              { key: "emission" as OverlayLayer, label: "碳排放", icon: Leaf },
              { key: "energy" as OverlayLayer, label: "能效等级", icon: Zap },
              { key: "status" as OverlayLayer, label: "运行状态", icon: AlertTriangle },
            ]).map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={overlay === key ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 px-3 text-xs rounded-none",
                  overlay === key && "bg-blue-500 hover:bg-blue-600"
                )}
                onClick={() => setOverlay(key)}
              >
                <Icon size={12} className="mr-1" />
                {label}
              </Button>
            ))}
          </div>

          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleResetView}>
            <RotateCcw size={12} className="mr-1" />
            重置
          </Button>

          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleFullscreen}>
            <Maximize2 size={12} className="mr-1" />
            {isFullscreen ? "退出全屏" : "全屏"}
          </Button>
        </div>
      </div>

      {/* ===== 统计摘要条 ===== */}
      <div className="grid grid-cols-5 gap-3">
        {[
          {
            label: "建筑总数",
            value: summary.buildingCount,
            unit: "栋",
            icon: Building2,
            color: "text-blue-500",
          },
          {
            label: "年碳排放",
            value: summary.totalEmission.toLocaleString(),
            unit: "tCO₂",
            icon: Leaf,
            color: "text-emerald-500",
          },
          {
            label: "年总能耗",
            value: `${(summary.totalEnergy / 10000).toFixed(1)}`,
            unit: "万kWh",
            icon: Zap,
            color: "text-amber-500",
          },
          {
            label: "光伏年发电",
            value: `${(summary.solarGeneration / 10000).toFixed(1)}`,
            unit: "万kWh",
            icon: Eye,
            color: "text-yellow-500",
          },
          {
            label: "异常建筑",
            value: summary.warningCount,
            unit: "栋",
            icon: AlertTriangle,
            color: "text-red-500",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-2"
          >
            <item.icon size={16} className={item.color} />
            <div>
              <div className="text-xs text-slate-500">{item.label}</div>
              <div className="text-sm font-semibold text-slate-800">
                {item.value}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{item.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== 图例 ===== */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <span className="font-medium">图例：</span>
        {overlay === "emission" && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> ≤200 tCO₂</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500" /> 200-400</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500" /> 400-600</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> &gt;600</span>
          </>
        )}
        {overlay === "energy" && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> A级</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500" /> B级</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500" /> C级</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> D级</span>
          </>
        )}
        {overlay === "status" && (
          <>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> 正常</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500" /> 预警</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500" /> 超标</span>
          </>
        )}
        <span className="ml-auto text-slate-400">Ctrl/Cmd + 滚轮缩放地图</span>
      </div>

      {/* ===== 地图容器 ===== */}
      <div
        className={cn(
          "relative rounded-lg border border-slate-200 overflow-hidden bg-slate-100",
          /* 明确宽高，避免高度塌陷 */
          !isFullscreen ? "h-[560px]" : "flex-1"
        )}
      >
        {/* 地图渲染容器 - 使用绝对定位+100%填充，确保宽高明确 */}
        <div
          ref={mapContainerRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* 建筑详情弹窗 */}
        {selectedBuilding && (
          <BuildingPopup
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
          />
        )}

        {/* 角标水印 */}
        <div className="absolute bottom-2 right-2 z-20 text-[10px] text-slate-400 bg-white/80 px-1.5 py-0.5 rounded">
          Demo 模拟数据，不用于申报
        </div>
      </div>
    </div>
  );
}
