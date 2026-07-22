"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import {
  energyCategories,
  carbonOverview,
  alertRecords,
  equipmentWarnings,
  workOrderStats,
  systemEfficiencies,
  meterStats,
  buildingEnergyDistribution,
  realtimeLoadData,
  buildingDetails,
  getAlertsByCategory,
  getCriticalAlertCount,
  getBuildingDetail,
  alertCategoryLabels,
  type AlertCategory,
  type AlertSeverity,
  type BuildingSystemDetail,
} from "@/data/operations-data";
import {
  AlertTriangle, Zap, Droplets, Flame, BarChart3,
  Thermometer, Wrench, Clock, Wifi, WifiOff,
  CheckCircle, XCircle, ChevronRight, TrendingUp,
  Snowflake, Sun, Lightbulb, Activity, Bell,
  CircleDot, ArrowRight, Eye,
  Users, Building2, X, ChevronDown,
} from "lucide-react";

// ============================================================
// 子组件：能源四分类卡片
// ============================================================

function EnergyCategoryCards() {
  const iconMap: Record<string, React.ReactNode> = {
    zap: <Zap className="w-3.5 h-3.5" />,
    droplets: <Droplets className="w-3.5 h-3.5" />,
    flame: <Flame className="w-3.5 h-3.5" />,
    "bar-chart-3": <BarChart3 className="w-3.5 h-3.5" />,
  };

  const colorMap: Record<string, string> = {
    zap: "border-blue-500/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]",
    droplets: "border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]",
    flame: "border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]",
    "bar-chart-3": "border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]",
  };

  const textColorMap: Record<string, string> = {
    zap: "text-blue-400",
    droplets: "text-cyan-400",
    flame: "text-orange-400",
    "bar-chart-3": "text-emerald-400",
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {energyCategories.map((e) => (
        <div
          key={e.type}
          className={`relative rounded-lg border bg-gray-900/60 p-2.5 ${colorMap[e.icon]}`}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-gray-500">{iconMap[e.icon]}</span>
            <span className="text-gray-400 text-[11px]">{e.type}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`font-bold font-mono text-lg ${textColorMap[e.icon]}`}>
              {e.todayValue.toLocaleString()}
            </span>
            <span className="text-gray-500 text-[10px]">{e.unit}</span>
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className={`text-[10px] ${e.trend > 0 ? "text-red-400" : "text-green-400"}`}>
              {e.trend > 0 ? "+" : ""}{e.trend}%
            </span>
            <span className="text-gray-600 text-[10px]">预算{e.budgetRatio}%</span>
          </div>
          {/* 预算进度条 */}
          <div className="h-1 bg-gray-700/60 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                e.budgetRatio > 80 ? "bg-red-500" : e.budgetRatio > 60 ? "bg-amber-500" : "bg-green-500"
              }`}
              style={{ width: `${e.budgetRatio}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 子组件：碳排放总览
// ============================================================

function CarbonOverviewPanel() {
  return (
    <div className="p-3 rounded-lg bg-gray-900/60 border border-cyan-500/20">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cyan-400 text-xs font-medium">碳排放总览</span>
        <span className={`text-[10px] ${carbonOverview.yearTrend < 0 ? "text-green-400" : "text-red-400"}`}>
          同比 {carbonOverview.yearTrend > 0 ? "+" : ""}{carbonOverview.yearTrend}%
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div>
          <div className="text-gray-500 text-[10px]">年度</div>
          <div className="text-cyan-400 font-mono font-bold text-base">
            {carbonOverview.totalEmission.toLocaleString()}
          </div>
          <div className="text-gray-600 text-[9px]">tCO₂</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">本月</div>
          <div className="text-orange-400 font-mono font-bold text-base">
            {carbonOverview.monthEmission.toLocaleString()}
          </div>
          <div className="text-gray-600 text-[9px]">tCO₂</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px]">今日</div>
          <div className="text-amber-400 font-mono font-bold text-base">
            {carbonOverview.todayEmission}
          </div>
          <div className="text-gray-600 text-[9px]">tCO₂</div>
        </div>
      </div>
      {/* 排放范围 */}
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-gray-500 text-[10px] w-12">范围1</span>
        <div className="flex-1 h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
          <div className="h-full bg-red-500/80 rounded-full" style={{ width: `${(carbonOverview.scope1 / carbonOverview.totalEmission) * 100}%` }} />
        </div>
        <span className="text-gray-400 text-[9px] font-mono w-12 text-right">{carbonOverview.scope1}</span>
      </div>
      <div className="flex items-center gap-1 mb-1.5">
        <span className="text-gray-500 text-[10px] w-12">范围2</span>
        <div className="flex-1 h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500/80 rounded-full" style={{ width: `${(carbonOverview.scope2 / carbonOverview.totalEmission) * 100}%` }} />
        </div>
        <span className="text-gray-400 text-[9px] font-mono w-12 text-right">{carbonOverview.scope2}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-gray-500 text-[10px] w-12">范围3</span>
        <div className="flex-1 h-1.5 bg-gray-700/60 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500/80 rounded-full" style={{ width: `${(carbonOverview.scope3 / carbonOverview.totalEmission) * 100}%` }} />
        </div>
        <span className="text-gray-400 text-[9px] font-mono w-12 text-right">{carbonOverview.scope3}</span>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：四类告警面板
// ============================================================

function AlertCategoryPanel({
  category,
  onBuildingClick,
}: {
  category: AlertCategory;
  onBuildingClick: (id: string) => void;
}) {
  const config = alertCategoryLabels[category];
  const alerts = getAlertsByCategory(category);
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="rounded-lg border bg-gray-900/40 border-gray-700/30 overflow-hidden">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-700/20">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: config.color }} />
          <span className="text-gray-300 text-[11px] font-medium">{config.label}</span>
          <span className="text-gray-500 text-[10px]">({alerts.length})</span>
        </div>
        {criticalCount > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[9px]">
            {criticalCount} 紧急
          </span>
        )}
      </div>
      {/* 告警列表 */}
      <div className="p-1.5 space-y-1">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            onClick={() => onBuildingClick(alert.buildingId)}
            className="flex items-start gap-2 p-1.5 rounded hover:bg-gray-800/40 cursor-pointer transition-colors"
          >
            <CircleDot
              className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                alert.severity === "critical"
                  ? "text-red-400"
                  : alert.severity === "warning"
                  ? "text-amber-400"
                  : "text-blue-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-gray-300 text-[11px] truncate">{alert.title}</span>
                {alert.autoDispatched && (
                  <span className="px-1 rounded bg-green-500/10 text-green-400 text-[8px] flex-shrink-0">已派发</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-0.5">
                <span>{alert.location}</span>
                <span>·</span>
                <span>{alert.duration}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 子组件：设备警告列表
// ============================================================

function EquipmentWarningList({
  onBuildingClick,
}: {
  onBuildingClick: (id: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {equipmentWarnings.map((ew) => (
        <div
          key={ew.id}
          onClick={() => onBuildingClick(ew.buildingId)}
          className="flex items-center gap-2 p-2 rounded-lg bg-gray-900/40 border border-gray-700/20 hover:border-orange-500/30 cursor-pointer transition-all"
        >
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            ew.severity === "critical" ? "bg-red-400" : "bg-amber-400"
          }`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-[11px] truncate">{ew.equipmentName}</span>
              <span className="text-gray-500 text-[10px] flex-shrink-0">{ew.duration}</span>
            </div>
            <div className="text-gray-500 text-[10px] truncate">{ew.location} · {ew.issue}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 子组件：工单统计
// ============================================================

function WorkOrderPanel() {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      <div className="text-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <div className="text-amber-400 font-mono font-bold text-base">{workOrderStats.pendingCount}</div>
        <div className="text-gray-500 text-[9px]">待处理</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <div className="text-red-400 font-mono font-bold text-base">{workOrderStats.overdueCount}</div>
        <div className="text-gray-500 text-[9px]">超时</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="text-blue-400 font-mono font-bold text-base">{workOrderStats.processingCount}</div>
        <div className="text-gray-500 text-[9px]">处理中</div>
      </div>
      <div className="text-center p-2 rounded-lg bg-green-500/10 border border-green-500/20">
        <div className="text-green-400 font-mono font-bold text-base">{workOrderStats.todayCompleted}</div>
        <div className="text-gray-500 text-[9px]">今日完成</div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：重点系统运行效率
// ============================================================

function SystemEfficiencyPanel() {
  const sysIconMap: Record<string, React.ReactNode> = {
    "空调与冷站": <Snowflake className="w-3.5 h-3.5" />,
    "供热与锅炉": <Sun className="w-3.5 h-3.5" />,
    "照明与动力": <Lightbulb className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-2">
      {systemEfficiencies.map((sys) => (
        <div key={sys.name} className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-700/20">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400">{sysIconMap[sys.name]}</span>
              <span className="text-gray-300 text-[11px] font-medium">{sys.name}</span>
            </div>
            <span className={`font-mono font-bold text-sm ${
              sys.efficiency >= 85 ? "text-green-400" : sys.efficiency >= 75 ? "text-amber-400" : "text-red-400"
            }`}>
              {sys.efficiency}%
            </span>
          </div>
          {/* 效率进度条 */}
          <div className="h-1.5 bg-gray-700/60 rounded-full overflow-hidden mb-1.5">
            <div
              className={`h-full rounded-full transition-all ${
                sys.efficiency >= 85 ? "bg-green-500" : sys.efficiency >= 75 ? "bg-amber-500" : "bg-red-500"
              }`}
              style={{ width: `${sys.efficiency}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-500">
              运行 {sys.runningUnits}/{sys.totalUnits}
            </span>
            {sys.lowEfficiencyCount > 0 ? (
              <span className="text-orange-400">
                {sys.lowEfficiencyCount} 台低效
              </span>
            ) : (
              <span className="text-green-400">全部高效</span>
            )}
            {sys.alarmCount > 0 && (
              <span className="text-red-400 flex items-center gap-0.5">
                <Bell className="w-2.5 h-2.5" />{sys.alarmCount}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// 子组件：楼宇详细面板（点击楼宇后右侧展示）
// ============================================================

function BuildingSystemCard({ sys }: { sys: BuildingSystemDetail }) {
  const sysIconMap: Record<string, React.ReactNode> = {
    "空调与冷站": <Snowflake className="w-3.5 h-3.5" />,
    "供热与锅炉": <Sun className="w-3.5 h-3.5" />,
    "照明与动力": <Lightbulb className="w-3.5 h-3.5" />,
  };

  return (
    <div className="p-2.5 rounded-lg bg-gray-900/40 border border-gray-700/20">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400">{sysIconMap[sys.name]}</span>
          <span className="text-gray-300 text-[11px] font-medium">{sys.name}</span>
        </div>
        <span className={`font-mono font-bold text-sm ${
          sys.efficiency >= 85 ? "text-green-400" : sys.efficiency >= 75 ? "text-amber-400" : "text-red-400"
        }`}>
          {sys.efficiency}%
        </span>
      </div>
      {/* 效率进度条 */}
      <div className="h-1.5 bg-gray-700/60 rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all ${
            sys.efficiency >= 85 ? "bg-green-500" : sys.efficiency >= 75 ? "bg-amber-500" : "bg-red-500"
          }`}
          style={{ width: `${sys.efficiency}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">能耗</span>
          <span className="text-gray-300 font-mono">{sys.energyConsumption.toLocaleString()} kWh</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">运行</span>
          <span className="text-gray-300 font-mono">{sys.runningUnits}/{sys.totalUnits}</span>
        </div>
        {sys.lowEfficiencyCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">低效</span>
            <span className="text-orange-400 font-mono">{sys.lowEfficiencyCount} 台</span>
          </div>
        )}
        {sys.alarmCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500">告警</span>
            <span className="text-red-400 font-mono flex items-center gap-0.5">
              <Bell className="w-2.5 h-2.5" />{sys.alarmCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function BuildingDetailPanel({
  buildingId,
  onClear,
}: {
  buildingId: string;
  onClear: () => void;
}) {
  const detail = getBuildingDetail(buildingId);
  if (!detail) {
    return (
      <div className="text-center text-gray-500 text-[11px] py-4">
        未找到楼宇数据
      </div>
    );
  }

  const occupancyRatio = Math.round((detail.todayOccupancy / detail.maxOccupancy) * 100);
  const occupancyColor = occupancyRatio > 90 ? "text-red-400" : occupancyRatio > 70 ? "text-amber-400" : "text-green-400";
  const occupancyBarColor = occupancyRatio > 90 ? "bg-red-500" : occupancyRatio > 70 ? "bg-amber-500" : "bg-green-500";

  // 楼宇相关的告警
  const buildingAlerts = alertRecords.filter((a) => a.buildingId === buildingId);
  const buildingEquipWarnings = equipmentWarnings.filter((e) => e.buildingId === buildingId);

  return (
    <div className="space-y-3">
      {/* 楼宇标题 + 关闭按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold">{detail.name}</h3>
            <span className="text-gray-500 text-[9px]">楼宇详情</span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-gray-800/60 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 当日人数使用情况 */}
      <div className="p-2.5 rounded-lg bg-gray-900/40 border border-cyan-500/20">
        <div className="flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-400 text-[11px] font-medium">当日人数</span>
        </div>
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className={`font-mono font-bold text-xl ${occupancyColor}`}>
            {detail.todayOccupancy.toLocaleString()}
          </span>
          <span className="text-gray-500 text-[10px]">/ {detail.maxOccupancy.toLocaleString()} 人</span>
          <span className={`ml-auto font-mono text-sm ${occupancyColor}`}>{occupancyRatio}%</span>
        </div>
        <div className="h-2 bg-gray-700/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${occupancyBarColor}`}
            style={{ width: `${occupancyRatio}%` }}
          />
        </div>
      </div>

      {/* 能源消耗概览 */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-blue-400" />
            <span className="text-gray-400 text-[10px]">今日用电</span>
          </div>
          <div className="text-blue-400 font-mono font-bold text-sm">{detail.todayElectricity.toLocaleString()}</div>
          <span className="text-gray-600 text-[9px]">kWh</span>
        </div>
        <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-center gap-1 mb-1">
            <Flame className="w-3 h-3 text-orange-400" />
            <span className="text-gray-400 text-[10px]">今日用热</span>
          </div>
          <div className="text-orange-400 font-mono font-bold text-sm">{detail.todayHeat.toLocaleString()}</div>
          <span className="text-gray-600 text-[9px]">MJ</span>
        </div>
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <div className="flex items-center gap-1 mb-1">
            <Droplets className="w-3 h-3 text-cyan-400" />
            <span className="text-gray-400 text-[10px]">今日用水</span>
          </div>
          <div className="text-cyan-400 font-mono font-bold text-sm">{detail.todayWater}</div>
          <span className="text-gray-600 text-[9px]">m³</span>
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-amber-400" />
            <span className="text-gray-400 text-[10px]">今日碳排</span>
          </div>
          <div className={`font-mono font-bold text-sm ${detail.carbonEmission < 0 ? "text-green-400" : "text-amber-400"}`}>
            {detail.carbonEmission < 0 ? "" : ""}{Math.abs(detail.carbonEmission).toFixed(2)}
          </div>
          <span className="text-gray-600 text-[9px]">tCO₂{detail.carbonEmission < 0 ? " (碳抵消)" : ""}</span>
        </div>
      </div>

      {/* 三大系统运行效率 */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-gray-300 text-[11px] font-medium">系统运行效率</span>
        </div>
        <div className="space-y-1.5">
          {detail.systems.map((sys) => (
            <BuildingSystemCard key={sys.name} sys={sys} />
          ))}
        </div>
      </div>

      {/* 楼宇相关告警 */}
      {(buildingAlerts.length > 0 || buildingEquipWarnings.length > 0) && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-gray-300 text-[11px] font-medium">相关告警</span>
            <span className="text-gray-500 text-[10px]">({buildingAlerts.length + buildingEquipWarnings.length})</span>
          </div>
          <div className="space-y-1">
            {buildingAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-2 p-1.5 rounded bg-gray-900/40 border border-gray-700/20">
                <CircleDot className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                  alert.severity === "critical" ? "text-red-400" : alert.severity === "warning" ? "text-amber-400" : "text-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-[10px] truncate">{alert.title}</div>
                  <div className="text-gray-500 text-[9px]">{alert.location} · {alert.duration}</div>
                </div>
                {alert.autoDispatched ? (
                  <span className="px-1 rounded bg-green-500/10 text-green-400 text-[8px] flex-shrink-0">已派发</span>
                ) : (
                  <span className="px-1 rounded bg-gray-600/20 text-gray-400 text-[8px] flex-shrink-0">待派发</span>
                )}
              </div>
            ))}
            {buildingEquipWarnings.map((ew) => (
              <div key={ew.id} className="flex items-start gap-2 p-1.5 rounded bg-gray-900/40 border border-gray-700/20">
                <Wrench className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                  ew.severity === "critical" ? "text-red-400" : "text-amber-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="text-gray-300 text-[10px] truncate">{ew.equipmentName}</div>
                  <div className="text-gray-500 text-[9px]">{ew.issue} · {ew.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 子组件：仪表在线率 & 数据完整率
// ============================================================

function MeterStatsPanel() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* 环形仪表 - 在线率 */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(55,65,81,0.5)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke="#22C55E" strokeWidth="3"
              strokeDasharray={`${meterStats.onlineRate} ${100 - meterStats.onlineRate}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-green-400 font-mono font-bold text-[10px]">{meterStats.onlineRate}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-gray-400 text-[11px] mb-1">仪表在线率</div>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-gray-500">在线 <span className="text-green-400 font-mono">{meterStats.onlineMeters}</span></span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">离线 <span className="text-red-400 font-mono">{meterStats.offlineMeters}</span></span>
          </div>
          <div className="text-gray-600 text-[9px] mt-0.5">总计 {meterStats.totalMeters} 台</div>
        </div>

        {/* 环形仪表 - 完整率 */}
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(55,65,81,0.5)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="15.5" fill="none"
              stroke="#3B82F6" strokeWidth="3"
              strokeDasharray={`${meterStats.dataCompleteness} ${100 - meterStats.dataCompleteness}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-blue-400 font-mono font-bold text-[10px]">{meterStats.dataCompleteness}%</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-gray-400 text-[11px] mb-1">数据完整率</div>
          <div className="text-[10px]">
            <span className="text-gray-500">缺失 <span className="text-amber-400 font-mono">{meterStats.missingDataMeters}</span> 台</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 子组件：校园楼宇能耗分布 (绿→红)
// ============================================================

function BuildingEnergyMap({
  onBuildingClick,
  selectedBuilding,
}: {
  onBuildingClick: (id: string) => void;
  selectedBuilding: string | null;
}) {
  // 按能耗值排序 (高→低)，合并人数数据
  const sorted = useMemo(
    () => {
      const detailMap = new Map(buildingDetails.map((b) => [b.buildingId, b]));
      return [...buildingEnergyDistribution]
        .map((b) => ({ ...b, detail: detailMap.get(b.buildingId) }))
        .sort((a, b) => b.energyValue - a.energyValue);
    },
    []
  );

  return (
    <div className="space-y-1">
      {/* 图例 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-500 text-[9px]">低能耗</span>
        <div className="flex-1 mx-2 h-1.5 rounded-full" style={{
          background: "linear-gradient(to right, #22C55E, #84CC16, #EAB308, #F97316, #EF4444)",
        }} />
        <span className="text-gray-500 text-[9px]">高能耗</span>
      </div>
      {/* 表头 */}
      <div className="flex items-center gap-2 px-2 py-0.5 text-[9px] text-gray-600">
        <span className="w-2 flex-shrink-0" />
        <span className="flex-1">楼宇</span>
        <span className="w-10 text-right">能耗</span>
        <span className="w-16 text-right flex items-center justify-end gap-0.5">
          <Users className="w-2.5 h-2.5" />人数
        </span>
      </div>
      {/* 楼宇列表 */}
      <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
        {sorted.slice(0, 15).map((b) => {
          const occupancy = b.detail?.todayOccupancy ?? 0;
          const maxOcc = b.detail?.maxOccupancy ?? 1;
          const ratio = Math.round((occupancy / maxOcc) * 100);
          const occColor = ratio > 90 ? "text-red-400" : ratio > 70 ? "text-amber-400" : "text-green-400";

          return (
            <div
              key={b.buildingId}
              onClick={() => onBuildingClick(b.buildingId)}
              className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-all hover:bg-gray-800/40 ${
                selectedBuilding === b.buildingId ? "bg-gray-800/60 ring-1 ring-cyan-400/40" : ""
              }`}
            >
              <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-gray-300 text-[10px] flex-1 truncate">{b.name}</span>
              <span className="text-gray-500 text-[10px] font-mono w-10 text-right">{b.energyValue}</span>
              <span className={`text-[10px] font-mono w-16 text-right ${occColor}`}>
                {occupancy.toLocaleString()}<span className="text-gray-600 text-[8px]"> ({ratio}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// 子组件：实时负荷曲线 (SVG自绘)
// ============================================================

function RealtimeLoadChart() {
  const data = realtimeLoadData;
  const currentHour = 14;

  const maxVal = useMemo(() => {
    const allVals = data.flatMap((d) => [d.realtime, d.yesterday, d.forecast].filter((v) => v > 0));
    return Math.max(...allVals) * 1.1;
  }, [data]);

  const chartW = 300;
  const chartH = 80;
  const padL = 30;
  const padR = 5;
  const padT = 5;
  const padB = 14;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const xScale = (h: number) => padL + (h / 23) * plotW;
  const yScale = (v: number) => padT + plotH - (v / maxVal) * plotH;

  // 生成折线路径
  const makePath = (field: "realtime" | "yesterday" | "forecast") => {
    const points = data
      .filter((d) => d[field] > 0)
      .map((d) => `${xScale(d.hour)},${yScale(d[field])}`);
    return points.length > 1 ? `M${points.join("L")}` : "";
  };

  // 生成面积路径
  const makeArea = (field: "realtime" | "yesterday") => {
    const points = data.filter((d) => d[field] > 0);
    if (points.length < 2) return "";
    const linePath = points.map((d) => `${xScale(d.hour)},${yScale(d[field])}`).join("L");
    return `M${xScale(points[0].hour)},${padT + plotH}L${linePath}L${xScale(points[points.length - 1].hour)},${padT + plotH}Z`;
  };

  const realtimePath = makePath("realtime");
  const yesterdayPath = makePath("yesterday");
  const forecastPath = makePath("forecast");
  const realtimeArea = makeArea("realtime");

  return (
    <div className="w-full">
      {/* 图例 */}
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-cyan-400 rounded" />
          <span className="text-gray-400 text-[9px]">实时</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-gray-500 rounded" style={{ strokeDasharray: "2,2" }} />
          <span className="text-gray-400 text-[9px]">昨日</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-amber-400 rounded" style={{ strokeDasharray: "3,2" }} />
          <span className="text-gray-400 text-[9px]">预测</span>
        </div>
      </div>
      <svg width="100%" height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
        {/* Y轴刻度 */}
        <text x={padL - 3} y={padT + 4} textAnchor="end" fill="#64748B" fontSize="6">{(maxVal / 1000).toFixed(0)}k</text>
        <text x={padL - 3} y={padT + plotH / 2 + 2} textAnchor="end" fill="#64748B" fontSize="6">{(maxVal / 2000).toFixed(0)}k</text>
        <text x={padL - 3} y={padT + plotH + 2} textAnchor="end" fill="#64748B" fontSize="6">0</text>

        {/* 网格线 */}
        <line x1={padL} y1={padT} x2={chartW - padR} y2={padT} stroke="rgba(100,116,139,0.15)" strokeWidth="0.5" />
        <line x1={padL} y1={padT + plotH / 2} x2={chartW - padR} y2={padT + plotH / 2} stroke="rgba(100,116,139,0.1)" strokeWidth="0.5" strokeDasharray="2,2" />
        <line x1={padL} y1={padT + plotH} x2={chartW - padR} y2={padT + plotH} stroke="rgba(100,116,139,0.2)" strokeWidth="0.5" />

        {/* X轴标签 */}
        {[0, 6, 12, 18, 23].map((h) => (
          <text key={h} x={xScale(h)} y={chartH} textAnchor="middle" fill="#64748B" fontSize="6">
            {h.toString().padStart(2, "0")}:00
          </text>
        ))}

        {/* 昨日曲线 (虚线) */}
        {yesterdayPath && (
          <path d={yesterdayPath} fill="none" stroke="#64748B" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
        )}

        {/* 预测曲线 (虚线) */}
        {forecastPath && (
          <path d={forecastPath} fill="none" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,2" opacity="0.7" />
        )}

        {/* 实时面积填充 */}
        {realtimeArea && (
          <path d={realtimeArea} fill="rgba(34,211,238,0.08)" />
        )}

        {/* 实时曲线 */}
        {realtimePath && (
          <path d={realtimePath} fill="none" stroke="#22D3EE" strokeWidth="1.5" />
        )}

        {/* 当前时间标记 */}
        <line
          x1={xScale(currentHour)} y1={padT}
          x2={xScale(currentHour)} y2={padT + plotH}
          stroke="#22D3EE" strokeWidth="0.5" strokeDasharray="2,2" opacity="0.5"
        />
        <circle cx={xScale(currentHour)} cy={yScale(data[currentHour]?.realtime || 0)} r="2.5" fill="#22D3EE" />
        <text
          x={xScale(currentHour) + 4}
          y={yScale(data[currentHour]?.realtime || 0) - 3}
          fill="#22D3EE" fontSize="6" fontWeight="600"
        >
          {((data[currentHour]?.realtime || 0) / 1000).toFixed(1)}kW
        </text>
      </svg>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================

export default function L3OperationsView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [activeAlertTab, setActiveAlertTab] = useState<AlertCategory>("energy");

  const criticalCount = useMemo(() => getCriticalAlertCount(), []);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setSelectedBuilding(buildingId);
  }, []);

  // ========== 左侧面板 ==========
  const leftPanel = (
    <div className="space-y-3">
      {/* 能源四分类 */}
      <IndicatorGroup title="能源消耗">
        <EnergyCategoryCards />
      </IndicatorGroup>

      {/* 碳排放总览 */}
      <CarbonOverviewPanel />

      {/* 四类告警 */}
      <IndicatorGroup title={`告警中心 ${criticalCount > 0 ? `(${criticalCount}紧急)` : ""}`}>
        {/* 告警分类标签 */}
        <div className="flex gap-1 mb-2">
          {(Object.keys(alertCategoryLabels) as AlertCategory[]).map((cat) => {
            const cfg = alertCategoryLabels[cat];
            const count = getAlertsByCategory(cat).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveAlertTab(cat)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-all ${
                  activeAlertTab === cat
                    ? "bg-gray-800/80 border border-gray-600"
                    : "bg-gray-900/40 border border-gray-700/30 hover:border-gray-600"
                }`}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-gray-300">{cfg.label}</span>
                <span className="text-gray-500">{count}</span>
              </button>
            );
          })}
        </div>
        <AlertCategoryPanel category={activeAlertTab} onBuildingClick={handleBuildingClick} />

        {/* 工单统计 */}
        <WorkOrderPanel />
      </IndicatorGroup>

      {/* 设备警告 */}
      <IndicatorGroup title="设备警告">
        <EquipmentWarningList onBuildingClick={handleBuildingClick} />
      </IndicatorGroup>
    </div>
  );

  // ========== 右侧面板 ==========
  const rightPanel = (
    <div className="space-y-3">
      {selectedBuilding ? (
        /* 选中楼宇：显示楼宇详情面板 */
        <IndicatorGroup title="楼宇详情">
          <BuildingDetailPanel
            buildingId={selectedBuilding}
            onClear={() => setSelectedBuilding(null)}
          />
        </IndicatorGroup>
      ) : (
        <>
          {/* 未选中楼宇：显示全局数据 */}
          {/* 重点系统运行效率 */}
          <IndicatorGroup title="重点系统运行效率">
            <SystemEfficiencyPanel />
          </IndicatorGroup>

          {/* 仪表在线率 & 数据完整率 */}
          <IndicatorGroup title="仪表在线率 & 数据完整率">
            <MeterStatsPanel />
          </IndicatorGroup>
        </>
      )}

      {/* 校园楼宇能耗分布 */}
      <IndicatorGroup title="校园楼宇能耗分布">
        <BuildingEnergyMap
          onBuildingClick={handleBuildingClick}
          selectedBuilding={selectedBuilding}
        />
      </IndicatorGroup>

      {/* 实时负荷 */}
      <IndicatorGroup title="校园实时负荷">
        <RealtimeLoadChart />
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L3"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
      filterType={filterType}
      colorMode="energy"
    />
  );
}
