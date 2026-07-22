"use client";

import { useState, useMemo } from "react";
import {
  MonitorMetrics,
  DeviceList,
  SankeyFlowData,
  CategoryOptions,
  type DeviceInfo,
} from "@/data/energy-monitor-data";
import SankeyFlow from "@/components/dashboard/sankey-flow";
import {
  Activity,
  AlertTriangle,
  Zap,
  Thermometer,
  Droplets,
  Wifi,
  WifiOff,
  Settings,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Gauge,
} from "lucide-react";

function StatusBadge({ status }: { status: DeviceInfo["status"] }) {
  const colors: Record<string, string> = {
    正常: "bg-emerald-100 text-emerald-700 border-emerald-200",
    预警: "bg-amber-100 text-amber-700 border-amber-200",
    离线: "bg-slate-100 text-slate-500 border-slate-200",
    检修: "bg-blue-100 text-blue-700 border-blue-200",
  };
  const dots: Record<string, string> = {
    正常: "bg-emerald-500",
    预警: "bg-amber-500",
    离线: "bg-slate-400",
    检修: "bg-blue-500",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${colors[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}

function MetricCard({ label, value, unit, trend, change, status }: typeof MonitorMetrics[0]) {
  const borderColor =
    status === "danger" ? "border-red-300" : status === "warning" ? "border-amber-300" : "border-slate-200";
  const trendColor = trend === "up" ? "text-red-500" : trend === "down" ? "text-emerald-500" : "text-slate-400";
  const trendArrow = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";
  return (
    <div className={`bg-white rounded-lg border ${borderColor} p-3`}>
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-slate-800">{value.toLocaleString()}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
      <div className={`text-xs mt-1 ${trendColor}`}>
        {trendArrow} {change > 0 ? "+" : ""}{change}{trend === "stable" ? "" : "%"}
      </div>
    </div>
  );
}

export default function EnergyMonitorPage() {
  const [sankeyCategory, setSankeyCategory] = useState("总碳排");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceInfo["status"] | "全部">("全部");
  const [expandedDevices, setExpandedDevices] = useState<string[]>([]);

  const filteredDevices = useMemo(() => {
    return DeviceList.filter((d) => {
      if (statusFilter !== "全部" && d.status !== statusFilter) return false;
      if (searchQuery && !d.name.includes(searchQuery) && !d.location.includes(searchQuery)) return false;
      return true;
    });
  }, [searchQuery, statusFilter]);

  const toggleDevice = (id: string) => {
    setExpandedDevices((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const deviceCountByStatus = useMemo(() => {
    return {
      全部: DeviceList.length,
      正常: DeviceList.filter((d) => d.status === "正常").length,
      预警: DeviceList.filter((d) => d.status === "预警").length,
      离线: DeviceList.filter((d) => d.status === "离线").length,
      检修: DeviceList.filter((d) => d.status === "检修").length,
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">能源监测</h1>
          <p className="text-sm text-slate-500 mt-0.5">全校能源设备实时监控与碳排放流向分析</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            系统运行中
          </span>
          <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 实时监控指标 */}
      <div className="grid grid-cols-6 gap-3">
        {MonitorMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* 主内容区：桑基图 + 设备列表 */}
      <div className="grid grid-cols-5 gap-4">
        {/* 左侧：碳排流向图 */}
        <div className="col-span-3 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              碳排流向图
              <span className="text-xs text-slate-400 font-normal">(单位：tCO₂)</span>
            </h2>
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5">
              {CategoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSankeyCategory(opt.value)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    sankeyCategory === opt.value
                      ? "bg-white text-blue-600 shadow-sm font-medium"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <SankeyFlow data={SankeyFlowData} width={560} height={320} />
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: "#93C5FD" }} />
              建筑节点
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: "#60A5FA" }} />
              区域节点
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded" style={{ backgroundColor: "#818CF8" }} />
              排放源节点
            </span>
            <span className="text-slate-300">|</span>
            <span>悬停查看节点详情</span>
          </div>
        </div>

        {/* 右侧：设备管理 */}
        <div className="col-span-2 bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Settings size={16} className="text-slate-500" />
              设备管理
            </h2>
            <span className="text-xs text-slate-400">{DeviceList.length} 台设备</span>
          </div>

          {/* 筛选栏 */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索设备..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
            <div className="flex gap-1">
              {(["全部", "正常", "预警", "离线", "检修"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    statusFilter === s
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {s}
                  <span className="ml-1 opacity-60">({deviceCountByStatus[s]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* 设备列表 */}
          <div className="space-y-1 max-h-[420px] overflow-y-auto">
            {filteredDevices.map((device) => (
              <div key={device.id}>
                <button
                  onClick={() => toggleDevice(device.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                    expandedDevices.includes(device.id)
                      ? "bg-blue-50"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {expandedDevices.includes(device.id) ? (
                      <ChevronDown size={12} className="shrink-0 text-slate-400" />
                    ) : (
                      <ChevronRight size={12} className="shrink-0 text-slate-400" />
                    )}
                    <div className="min-w-0">
                      <div className="font-medium text-slate-700 truncate">{device.name}</div>
                      <div className="text-slate-400 truncate">{device.location}</div>
                    </div>
                  </div>
                  <StatusBadge status={device.status} />
                </button>
                {expandedDevices.includes(device.id) && (
                  <div className="mx-3 mb-1 p-2 bg-slate-50 rounded-lg text-xs space-y-1">
                    <div className="flex justify-between text-slate-500">
                      <span>设备编号</span>
                      <span className="text-slate-700">{device.id}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>设备类型</span>
                      <span className="text-slate-700">{device.type}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>实时功率</span>
                      <span className="text-slate-700 font-mono">{device.power} kW</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>日累计能耗</span>
                      <span className="text-slate-700 font-mono">{device.energy} kWh</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>碳排放量</span>
                      <span className="text-slate-700 font-mono">{device.co2} tCO₂</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>最后更新</span>
                      <span className="text-slate-700">{device.lastUpdate}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filteredDevices.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs">暂无匹配设备</div>
            )}
          </div>
        </div>
      </div>

      {/* Demo水印 */}
      <div className="fixed bottom-2 right-4 text-xs text-slate-300/80 select-none pointer-events-none">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}