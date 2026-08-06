"use client";

import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  MapPin,
  Database,
  Bell,
  User,
  ChevronDown,
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Shield,
  LayoutDashboard,
  Factory,
  Grid3X3,
  ArrowLeft,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { CampusMapOverlayControls } from "@/components/dashboard/campus-map-overlay-controls";
import type { AlarmRecord } from "@/data/energy-monitor-data";
import { getSystemAnomalySnapshots } from "@/data/campus-system-data";
import { useRealtimeNow } from "@/hooks/use-realtime-now";
import { formatCampusDateTime, getCampusDateParts } from "@/lib/campus-realtime";
import { useCampusMapToolbarStore } from "@/stores/campus-map-toolbar-store";
import { ThemeSwitcher, type CockpitTheme } from "./theme-switcher";
import { NavAtmosphere } from "./nav-atmosphere";

// 驾驶舱路由列表
const COCKPIT_ROUTES = ["/leader", "/operations"];

interface AppHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  theme: CockpitTheme;
  onThemeChange: (theme: CockpitTheme) => void;
}

export function AppHeader({ sidebarCollapsed = false, onToggleSidebar, theme, onThemeChange }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nowMs = useRealtimeNow();
  const currentYear = nowMs === null ? 2026 : getCampusDateParts(new Date(nowMs)).year;
  const [year, setYear] = useState(() => String(getCampusDateParts(new Date()).year));
  const [campus, setCampus] = useState("all");
  const [dataStatus, setDataStatus] = useState("realtime");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 判断是否在驾驶舱页面
  const isCockpit = COCKPIT_ROUTES.includes(pathname);
  const showGatewayReturn = isCockpit || pathname === "/portal";
  const isMapSurface = isCockpit || pathname === "/campus-map";
  const mapToolbar = useCampusMapToolbarStore((state) => state.toolbar);
  const setMapLabels = useCampusMapToolbarStore((state) => state.setShowLabels);
  const setMapBuildingFrames = useCampusMapToolbarStore((state) => state.setShowBuildingFrames);
  const setMapLayer = useCampusMapToolbarStore((state) => state.setActiveLayer);
  const selectMapBuilding = useCampusMapToolbarStore((state) => state.selectBuilding);
  const currentUser = useMemo(() => {
    if (pathname === "/leader") {
      return { name: "校领导", role: "领导舱演示" };
    }
    if (pathname === "/operations") {
      return { name: "后勤用户", role: "后勤舱演示" };
    }
    return { name: "演示用户", role: "PC 端演示" };
  }, [pathname]);

  // Alarm dropdown state
  const [showAlarms, setShowAlarms] = useState(false);
  const alarmRef = useRef<HTMLDivElement>(null);

  // User login panel state
  const [showLogin, setShowLogin] = useState(false);
  const loginRef = useRef<HTMLDivElement>(null);

  // Collect all alarm records from devices
  const allAlarms = useMemo<(AlarmRecord & { deviceName: string; deviceId: string })[]>(() => {
    if (nowMs === null) return [];
    return getSystemAnomalySnapshots(new Date(nowMs)).map((anomaly) => ({
      type: anomaly.severity === "emergency" || anomaly.severity === "critical" ? "danger" : anomaly.severity === "warning" ? "warning" : "info",
      description: `${anomaly.buildingName}：${anomaly.description}`,
      time: anomaly.detectedAt,
      status: anomaly.status === "resolved" ? "closed" : anomaly.status === "processing" || anomaly.status === "acknowledged" ? "processing" : "pending",
      deviceName: anomaly.deviceName ?? anomaly.buildingName,
      deviceId: anomaly.deviceId ?? anomaly.id,
    }));
  }, [nowMs]);

  const unreadCount = allAlarms.filter((a) => a.status === "pending").length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (alarmRef.current && !alarmRef.current.contains(e.target as Node)) {
        setShowAlarms(false);
      }
      if (loginRef.current && !loginRef.current.contains(e.target as Node)) {
        setShowLogin(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => setIsFullscreen(Boolean(document.fullscreenElement));

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
      console.error("切换全屏失败", error);
    }
  };

  const alarmTypeIcon = (type: AlarmRecord["type"]) => {
    switch (type) {
      case "danger":
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const alarmTypeLabel = (type: AlarmRecord["type"]) => {
    switch (type) {
      case "danger":
        return "危险";
      case "warning":
        return "警告";
      case "info":
        return "信息";
    }
  };

  const alarmStatusLabel = (status: AlarmRecord["status"]) => {
    switch (status) {
      case "pending":
        return { text: "待处理", color: "text-red-400 bg-red-500/10" };
      case "processing":
        return { text: "处理中", color: "text-amber-400 bg-amber-500/10" };
      case "closed":
        return { text: "已关闭", color: "text-gray-400 bg-gray-500/10" };
    }
  };

  // 驾驶舱按钮配置
  const cockpitButtons = [
    { key: "L1", label: "领导组驾驶舱", shortLabel: "领导舱", icon: LayoutDashboard, href: "/leader" },
    { key: "L3", label: "后勤组驾驶舱", shortLabel: "后勤舱", icon: Factory, href: "/operations" },
  ];

  return (
    <header
      className="app-header"
      data-cockpit={isCockpit ? "true" : "false"}
      data-map-surface={isMapSurface ? "true" : "false"}
    >
      <NavAtmosphere theme={theme} staticMode={isMapSurface} />

      <div className="app-header__left">
        {/* Sidebar Toggle (非驾驶舱时显示) */}
        {!isCockpit && (
          <button
            onClick={onToggleSidebar}
            className="app-header__icon-button"
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
            aria-label={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
        )}

        {showGatewayReturn && (
          <button
            type="button"
            aria-label="返回统一门户"
            title="返回统一门户"
            onClick={() => router.push("/gateway")}
            className="app-header__nav-button app-header__gateway-return border-cyan-500/35 bg-cyan-500/10 text-cyan-300 hover:border-cyan-400/55 hover:bg-cyan-500/20 hover:text-cyan-100"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="app-header__nav-label">返回门户</span>
          </button>
        )}

        {isCockpit && mapToolbar ? (
          <div className="app-header__map-toolbar" aria-label="地图顶部工具栏">
            <CampusMapOverlayControls
              key={mapToolbar.ownerId}
              buildings={mapToolbar.buildings}
              selectedBuildingId={mapToolbar.selectedBuildingId}
              showLabels={mapToolbar.showLabels}
              showBuildingFrames={mapToolbar.showBuildingFrames}
              activeLayer={mapToolbar.activeLayer}
              onShowLabelsChange={setMapLabels}
              onShowBuildingFramesChange={setMapBuildingFrames}
              onLayerChange={setMapLayer}
              onBuildingSelect={selectMapBuilding}
            />
          </div>
        ) : null}

        {/* Filters (非驾驶舱时显示) */}
        {!isCockpit && (
          <div className="app-header__filters">
            <div className="app-header__filter">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map((optionYear) => (
                  <option key={optionYear} value={String(optionYear)}>{optionYear} 年度</option>
                ))}
              </select>
            </div>
            <div className="app-header__filter">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
              >
                <option value="all">全校</option>
                <option value="main">主校区</option>
                <option value="east">东校区</option>
              </select>
            </div>
            <div className="app-header__filter">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={dataStatus}
                onChange={(e) => setDataStatus(e.target.value)}
                className="bg-transparent text-xs text-gray-300 outline-none cursor-pointer"
              >
                <option value="realtime">实时估算</option>
                <option value="monthly">月度锁定</option>
                <option value="yearly">年度确认</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="app-header__brand" aria-label="高校智慧碳管理平台">
        <span className="app-header__brand-logo">
          <Image
            src="/brand/timeloit-wordmark-light.png"
            alt="Timeloit"
            width={2184}
            height={720}
            sizes="112px"
            priority
          />
        </span>
        <span className="app-header__brand-divider" aria-hidden="true" />
        <span className="app-header__brand-copy">
          <h1>高校智慧碳管理平台</h1>
          <span>Smart Carbon Platform</span>
        </span>
      </div>

      {/* Right Section */}
      <div className="app-header__right">
        {showGatewayReturn && (
          <nav className="app-header__nav app-header__destination-nav" aria-label="驾驶舱与功能目录">
            {cockpitButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = pathname === btn.href;
              return (
                <button
                  key={btn.key}
                  aria-label={btn.label}
                  title={btn.label}
                  onClick={() => router.push(btn.href)}
                  className={`app-header__nav-button ${
                    isActive
                      ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                      : "bg-slate-800/40 border-gray-700/50 text-gray-400 hover:bg-slate-700/40 hover:border-gray-600 hover:text-gray-300"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="app-header__nav-label">{btn.shortLabel}</span>
                </button>
              );
            })}

            <button
              type="button"
              aria-label="功能目录"
              title="功能目录"
              onClick={() => router.push("/portal")}
              className={`app-header__nav-button ${
                pathname === "/portal"
                  ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                  : "border-gray-700/50 bg-slate-800/40 text-gray-400 hover:border-gray-600 hover:bg-slate-700/40 hover:text-gray-300"
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="app-header__nav-label">功能目录</span>
            </button>
          </nav>
        )}

        <button
          type="button"
          onClick={toggleFullscreen}
          className="app-header__icon-button"
          title={isFullscreen ? "退出全屏" : "进入全屏"}
          aria-label={isFullscreen ? "退出全屏" : "进入全屏"}
          aria-pressed={isFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-[18px] w-[18px]" /> : <Maximize2 className="h-[18px] w-[18px]" />}
        </button>

        <ThemeSwitcher value={theme} onChange={onThemeChange} />
        {/* Notifications - Alarm Center */}
        <div className="relative" ref={alarmRef}>
          <button
            type="button"
            onClick={() => {
              setShowAlarms(!showAlarms);
              setShowLogin(false);
            }}
            className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            title="告警中心"
            aria-label={`告警中心，${unreadCount} 条待处理`}
            aria-expanded={showAlarms}
            aria-haspopup="dialog"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Alarm Dropdown */}
          {showAlarms && (
            <div className="absolute right-0 top-full mt-2 w-[420px] bg-slate-900 border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-white">告警中心</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                    {allAlarms.length}
                  </span>
                </div>
                <button
                  onClick={() => setShowAlarms(false)}
                  className="p-1 rounded hover:bg-slate-800 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Alarm List */}
              <div className="max-h-[360px] overflow-y-auto">
                {allAlarms.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-500/50" />
                    <span className="text-sm">暂无告警</span>
                  </div>
                ) : (
                  allAlarms.slice(0, 20).map((alarm, idx) => (
                    <div
                      key={`${alarm.deviceId}-${idx}`}
                      className="px-4 py-3 border-b border-gray-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 shrink-0">{alarmTypeIcon(alarm.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                alarm.type === "danger"
                                  ? "text-red-400 bg-red-500/10"
                                  : alarm.type === "warning"
                                    ? "text-amber-400 bg-amber-500/10"
                                    : "text-blue-400 bg-blue-500/10"
                              }`}
                            >
                              {alarmTypeLabel(alarm.type)}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{alarm.deviceName}</span>
                          </div>
                          <p className="text-sm text-gray-300 leading-snug mb-1.5">{alarm.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatCampusDateTime(new Date(alarm.time))}
                            </div>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${alarmStatusLabel(alarm.status).color}`}
                            >
                              {alarmStatusLabel(alarm.status).text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {allAlarms.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    共 {allAlarms.length} 条告警，{unreadCount} 条待处理
                  </span>
                  <button
                    onClick={() => {
                      setShowAlarms(false);
                      router.push("/alarms");
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                  >
                    查看全部 →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Demo profile */}
        <div className="relative" ref={loginRef}>
          <button
            type="button"
            onClick={() => {
              setShowLogin(!showLogin);
              setShowAlarms(false);
            }}
            className="flex items-center gap-2.5 rounded-lg border border-cyan-500/20 bg-slate-800/50 px-3 py-1.5 transition-colors hover:border-cyan-500/40 max-[1280px]:gap-1.5 max-[1280px]:px-2"
            aria-label={`${currentUser.name}，${currentUser.role}`}
            aria-expanded={showLogin}
            aria-haspopup="dialog"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-xs max-[1280px]:hidden">
              <div className="text-gray-300 font-medium">{currentUser.name}</div>
              <div className="text-[10px] text-gray-500">{currentUser.role}</div>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform max-[1280px]:hidden ${showLogin ? "rotate-180" : ""}`} />
          </button>

          {/* Demo profile panel */}
          {showLogin && (
            <div className="absolute right-0 top-full mt-2 w-[320px] bg-slate-900 border border-cyan-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50">
              <div className="px-5 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{currentUser.name}</div>
                    <div className="text-xs text-gray-400">{currentUser.role}</div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  <Shield className="w-3.5 h-3.5" />
                  <span>当前为系统演示访问</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>正式账号体系暂未接入</span>
                </div>
              </div>
              <div className="px-5 py-2">
                <button
                  type="button"
                  onClick={() => router.push("/")}
                  className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                >
                  退出演示
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
