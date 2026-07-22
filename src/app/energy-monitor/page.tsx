"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MonitorMetrics,
  CategoryOptions,
  AllDevices,
  DeviceCategories,
  BuildingOptions,
  SortOptions,
  DeviceStatusOrder,
  getSankeyDataByCategory,
  type DeviceDetail,
  type DeviceStatus,
  type DeviceCategory,
} from "@/data/energy-monitor-data";
import SankeyFlow from "@/components/dashboard/sankey-flow";
import {
  Activity,
  AlertTriangle,
  Zap,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Gauge,
  Info,
  ArrowRight,
  Fuel,
  TreePine,
  Factory,
  Trash2,
  Car,
  ChefHat,
  BookOpen,
  Wrench,
  FileSpreadsheet,
  CheckSquare,
  X,
  Download,
  Clock,
  MapPin,
  User,
  Calendar,
  TrendingUp,
  Thermometer,
  Layers,
} from "lucide-react";

/* ========== 状态标签 ========== */
function StatusBadge({ status }: { status: DeviceStatus }) {
  const config: Record<DeviceStatus, { bg: string; text: string; border: string; dot: string }> = {
    正常: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
    预警: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
    离线: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", dot: "bg-slate-400" },
    检修: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
}

/* ========== 告警类型标签 ========== */
function AlarmTypeBadge({ type }: { type: "danger" | "warning" | "info" }) {
  const config = {
    danger: { bg: "bg-red-50", text: "text-red-700", icon: "🚨", label: "危险" },
    warning: { bg: "bg-amber-50", text: "text-amber-700", icon: "⚠️", label: "警告" },
    info: { bg: "bg-blue-50", text: "text-blue-700", icon: "ℹ️", label: "信息" },
  };
  const c = config[type];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>
      {c.icon} {c.label}
    </span>
  );
}

/* ========== 指标卡片 ========== */
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

/* ========== 设备详情展开面板 ========== */
function DeviceDetailPanel({ device, onClose }: { device: DeviceDetail; onClose: () => void }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/50">
      <div className="p-4 grid grid-cols-4 gap-4">
        {/* 运行参数 */}
        <div className="col-span-1 space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <Gauge size={12} /> 运行参数
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">实时功率</span><span className="font-mono text-slate-700">{device.realtimePower} kW</span></div>
            <div className="flex justify-between"><span className="text-slate-500">今日累计</span><span className="font-mono text-slate-700">{device.todayEnergy.toLocaleString()} kWh</span></div>
            <div className="flex justify-between"><span className="text-slate-500">温度</span><span className="font-mono text-slate-700">{device.temperature}℃</span></div>
            <div className="flex justify-between"><span className="text-slate-500">负载率</span><span className="font-mono text-slate-700">{device.loadRate}%</span></div>
            <div className="flex justify-between"><span className="text-slate-500">运行时长</span><span className="font-mono text-slate-700">{device.runtime.toLocaleString()} h</span></div>
          </div>
        </div>

        {/* 历史趋势 */}
        <div className="col-span-1 space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <TrendingUp size={12} /> 历史趋势
          </h4>
          <div>
            <div className="text-xs text-slate-500 mb-1">近7天功率 (kW)</div>
            <div className="flex items-end gap-0.5 h-16">
              {device.trend7d.map((v, i) => {
                const maxVal = Math.max(...device.trend7d.map(Math.abs));
                const height = maxVal > 0 ? (Math.abs(v) / maxVal) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t ${v >= 0 ? "bg-blue-400" : "bg-emerald-400"}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              {["7/16", "7/17", "7/18", "7/19", "7/20", "7/21", "7/22"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">近30天能耗 (kWh)</div>
            <div className="flex items-end gap-px h-12">
              {device.trend30d.filter((_, i) => i % 3 === 0).map((v, i) => {
                const maxVal = Math.max(...device.trend30d.map(Math.abs), 1);
                const height = (Math.abs(v) / maxVal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t ${v >= 0 ? "bg-blue-400" : "bg-emerald-400"}`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 告警历史 */}
        <div className="col-span-1 space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <AlertTriangle size={12} /> 告警历史
          </h4>
          {device.alarmHistory.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">暂无告警记录</div>
          ) : (
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {device.alarmHistory.slice(0, 10).map((alarm, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs">
                  <AlarmTypeBadge type={alarm.type} />
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-700 truncate">{alarm.description}</div>
                    <div className="text-slate-400">{alarm.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 台账信息 */}
        <div className="col-span-1 space-y-2">
          <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <FileSpreadsheet size={12} /> 台账信息
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-slate-500">安装日期</span><span className="text-slate-700">{device.installDate}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">额定参数</span><span className="text-slate-700">{device.ratedParams}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">上次维保</span><span className="text-slate-700">{device.lastMaintenance}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">下次维保</span><span className="text-slate-700">{device.nextMaintenance}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">责任人</span><span className="text-slate-700">{device.responsiblePerson}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">计量点编号</span><span className="font-mono text-slate-700">{device.meterPointCode}</span></div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
          <Wrench size={12} /> 转工单
        </button>
        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <Zap size={12} /> 转 AI 建议
        </button>
        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">
          <Wrench size={12} /> 标记检修
        </button>
        <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
          <MapPin size={12} /> 查看 3D 定位
        </button>
      </div>
    </div>
  );
}

/* ========== 批量操作弹窗 ========== */
function BatchMaintenanceModal({ selected, onClose }: { selected: DeviceDetail[]; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [restoreTime, setRestoreTime] = useState("");

  const handleSubmit = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-slate-800">批量标记检修</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>
        <div className="mb-4 text-sm text-slate-600">
          已选择 <span className="font-semibold text-slate-800">{selected.length}</span> 台设备
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">检修原因</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 resize-none"
              rows={3}
              placeholder="请输入检修原因..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">预计恢复时间</label>
            <input
              type="datetime-local"
              value={restoreTime}
              onChange={(e) => setRestoreTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            取消
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
            确认标记
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== 主页面 ========== */
export default function EnergyMonitorPage() {
  const [sankeyCategory, setSankeyCategory] = useState("总碳排");
  const [showScopeGuide, setShowScopeGuide] = useState(false);

  // 设备管理状态
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "全部">("全部");
  const [categoryFilters, setCategoryFilters] = useState<DeviceCategory[]>([]);
  const [buildingFilters, setBuildingFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("status");
  const [expandedDevices, setExpandedDevices] = useState<Set<string>>(new Set());
  const [selectedDevices, setSelectedDevices] = useState<Set<string>>(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBuildingDropdown, setShowBuildingDropdown] = useState(false);

  const currentSankeyData = useMemo(() => getSankeyDataByCategory(sankeyCategory), [sankeyCategory]);

  const sankeySummary = useMemo(() => {
    const totalLinks = currentSankeyData.links.reduce((s, l) => s + l.value, 0);
    const scope1Links = currentSankeyData.links.filter((l) => {
      const target = currentSankeyData.nodes[l.target];
      return target.name.includes("Scope1");
    }).reduce((s, l) => s + l.value, 0);
    const scope2Links = currentSankeyData.links.filter((l) => {
      const target = currentSankeyData.nodes[l.target];
      return target.name.includes("Scope2");
    }).reduce((s, l) => s + l.value, 0);
    const scope3Links = currentSankeyData.links.filter((l) => {
      const target = currentSankeyData.nodes[l.target];
      return target.name.includes("Scope3");
    }).reduce((s, l) => s + l.value, 0);
    return { total: totalLinks, scope1: scope1Links, scope2: scope2Links, scope3: scope3Links };
  }, [currentSankeyData]);

  const deviceCountByStatus = useMemo(() => {
    return {
      全部: AllDevices.length,
      正常: AllDevices.filter((d) => d.status === "正常").length,
      预警: AllDevices.filter((d) => d.status === "预警").length,
      离线: AllDevices.filter((d) => d.status === "离线").length,
      检修: AllDevices.filter((d) => d.status === "检修").length,
    };
  }, [AllDevices]);

  const onlineRate = useMemo(() => {
    const online = AllDevices.filter((d) => d.status !== "离线").length;
    return { rate: ((online / AllDevices.length) * 100).toFixed(1), online, total: AllDevices.length };
  }, [AllDevices]);

  const alarmCount = useMemo(() => {
    return AllDevices.filter((d) => d.status === "预警").length;
  }, [AllDevices]);

  const filteredDevices = useMemo(() => {
    let list = [...AllDevices];

    if (statusFilter !== "全部") {
      list = list.filter((d) => d.status === statusFilter);
    }
    if (categoryFilters.length > 0) {
      list = list.filter((d) => categoryFilters.includes(d.category));
    }
    if (buildingFilters.length > 0) {
      list = list.filter((d) => buildingFilters.some((b) => d.location.includes(b)));
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.location.toLowerCase().includes(q) ||
          d.code.toLowerCase().includes(q)
      );
    }

    // 排序
    list.sort((a, b) => {
      switch (sortBy) {
        case "status":
          return (DeviceStatusOrder[a.status] ?? 3) - (DeviceStatusOrder[b.status] ?? 3);
        case "name":
          return a.name.localeCompare(b.name, "zh");
        case "location":
          return a.location.localeCompare(b.location, "zh");
        case "alarm": {
          const aTime = a.lastAlarmTime === "—" ? "0000" : a.lastAlarmTime;
          const bTime = b.lastAlarmTime === "—" ? "0000" : b.lastAlarmTime;
          return bTime.localeCompare(aTime);
        }
        default:
          return 0;
      }
    });

    return list;
  }, [searchQuery, statusFilter, categoryFilters, buildingFilters, sortBy]);

  const toggleDevice = useCallback((id: string) => {
    setExpandedDevices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedDevices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedDevices.size === filteredDevices.length) {
      setSelectedDevices(new Set());
    } else {
      setSelectedDevices(new Set(filteredDevices.map((d) => d.id)));
    }
  }, [selectedDevices, filteredDevices]);

  const toggleCategory = useCallback((cat: DeviceCategory) => {
    setCategoryFilters((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleBuilding = useCallback((bld: string) => {
    setBuildingFilters((prev) =>
      prev.includes(bld) ? prev.filter((b) => b !== bld) : [...prev, bld]
    );
  }, []);

  return (
    <div className="p-4 space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">能源监测</h1>
          <p className="text-sm text-slate-500 mt-0.5">全校能源设备实时监控与碳排放全链条溯源分析</p>
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

      {/* 碳排全链条溯源图 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Activity size={16} className="text-blue-500" />
              碳排全链条溯源图
              <span className="text-xs text-slate-400 font-normal">(tCO₂/年)</span>
            </h2>
            <button
              onClick={() => setShowScopeGuide(!showScopeGuide)}
              className="text-xs text-slate-400 hover:text-blue-500 flex items-center gap-1 transition-colors"
            >
              <Info size={12} />
              核算范围说明
            </button>
          </div>
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

        {showScopeGuide && (
          <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100 text-xs space-y-1.5">
            <div className="flex items-center gap-4 text-slate-600">
              <span className="font-medium text-blue-700">核算范围说明：</span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#3B82F6" }} />
                <span>Scope 1 直接排放：化石燃料燃烧、食堂燃气、公务车油耗</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#8B5CF6" }} />
                <span>Scope 2 间接排放：外购电力、热力</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#EC4899" }} />
                <span>Scope 3 其他间接：水、食物、纸张、垃圾、交通</span>
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <SankeyFlow data={currentSankeyData} width={780} height={460} />
        </div>

        {/* 核算结果摘要 */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-center">
            <div className="text-xs text-slate-500 mb-0.5">总碳排</div>
            <div className="text-xl font-bold text-slate-800">{sankeySummary.total}<span className="text-xs font-normal text-slate-400 ml-0.5">tCO₂/年</span></div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <div className="text-xs text-blue-600 mb-0.5">Scope 1 直接排放</div>
            <div className="text-xl font-bold text-blue-700">{sankeySummary.scope1}<span className="text-xs font-normal text-blue-400 ml-0.5">tCO₂/年</span></div>
            <div className="text-xs text-blue-500 mt-0.5">{sankeySummary.total > 0 ? ((sankeySummary.scope1 / sankeySummary.total) * 100).toFixed(1) : 0}%</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
            <div className="text-xs text-purple-600 mb-0.5">Scope 2 间接排放</div>
            <div className="text-xl font-bold text-purple-700">{sankeySummary.scope2}<span className="text-xs font-normal text-purple-400 ml-0.5">tCO₂/年</span></div>
            <div className="text-xs text-purple-500 mt-0.5">{sankeySummary.total > 0 ? ((sankeySummary.scope2 / sankeySummary.total) * 100).toFixed(1) : 0}%</div>
          </div>
          <div className="bg-pink-50 rounded-lg p-3 border border-pink-100 text-center">
            <div className="text-xs text-pink-600 mb-0.5">Scope 3 其他间接</div>
            <div className="text-xl font-bold text-pink-700">{sankeySummary.scope3}<span className="text-xs font-normal text-pink-400 ml-0.5">tCO₂/年</span></div>
            <div className="text-xs text-pink-500 mt-0.5">{sankeySummary.total > 0 ? ((sankeySummary.scope3 / sankeySummary.total) * 100).toFixed(1) : 0}%</div>
          </div>
        </div>
      </div>

      {/* ========== 设备管理面板 ========== */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Layers size={16} className="text-blue-500" />
              设备管理面板
            </h2>
            <span className="text-xs text-slate-400">共 {AllDevices.length} 台设备</span>
          </div>

          {/* 9b.1 顶部统计栏 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">设备总数</div>
              <div className="text-2xl font-bold text-slate-800">{AllDevices.length} <span className="text-sm font-normal text-slate-400">台</span></div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">状态分布</div>
              <div className="flex items-center gap-2 flex-wrap">
                {(["全部", "正常", "预警", "离线", "检修"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                      statusFilter === s
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s === "全部" ? (
                      "全部"
                    ) : (
                      <>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          s === "正常" ? "bg-emerald-500" : s === "预警" ? "bg-amber-500" : s === "离线" ? "bg-slate-400" : "bg-blue-500"
                        }`} />
                        {s}
                      </>
                    )}
                    <span className="opacity-60">({deviceCountByStatus[s]})</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">设备在线率</div>
              <div className="text-2xl font-bold text-emerald-600">{onlineRate.rate}%</div>
              <div className="text-xs text-slate-400">({onlineRate.online}/{onlineRate.total})</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3 border border-red-100">
              <div className="text-xs text-red-500 mb-1">告警设备数</div>
              <div className="text-2xl font-bold text-red-600">{alarmCount} <span className="text-sm font-normal text-red-400">台</span></div>
            </div>
          </div>

          {/* 9b.2 搜索与筛选 */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索设备名称/楼栋/编号..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>

            {/* 类别筛选 */}
            <div className="relative">
              <button
                onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowBuildingDropdown(false); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  categoryFilters.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Filter size={12} />
                类别{categoryFilters.length > 0 ? ` (${categoryFilters.length})` : ""}
                <ChevronDown size={12} />
              </button>
              {showCategoryDropdown && (
                <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-2 w-48 max-h-60 overflow-y-auto">
                  {DeviceCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={categoryFilters.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 楼栋筛选 */}
            <div className="relative">
              <button
                onClick={() => { setShowBuildingDropdown(!showBuildingDropdown); setShowCategoryDropdown(false); }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  buildingFilters.length > 0 ? "bg-blue-50 border-blue-200 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <MapPin size={12} />
                楼栋{buildingFilters.length > 0 ? ` (${buildingFilters.length})` : ""}
                <ChevronDown size={12} />
              </button>
              {showBuildingDropdown && (
                <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-slate-200 rounded-lg shadow-lg p-2 w-44 max-h-60 overflow-y-auto">
                  {BuildingOptions.map((bld) => (
                    <label key={bld} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={buildingFilters.includes(bld)}
                        onChange={() => toggleBuilding(bld)}
                        className="rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                      />
                      {bld}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* 排序 */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              {SortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* 批量操作 */}
            {selectedDevices.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-slate-500">已选 {selectedDevices.size} 台</span>
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Wrench size={12} /> 批量标记检修
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <Download size={12} /> 导出台账
                </button>
                <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  <Download size={12} /> 导出告警
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 9b.3 设备清单表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="w-8 px-3 py-2.5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedDevices.size === filteredDevices.length && filteredDevices.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                  />
                </th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">状态</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">设备名称</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">设备编号</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">设备类别</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">所在楼栋</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">运行参数摘要</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">最近告警时间</th>
                <th className="px-3 py-2.5 text-left text-slate-500 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device) => (
                <tr key={device.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={selectedDevices.has(device.id)}
                      onChange={() => toggleSelect(device.id)}
                      className="rounded border-slate-300 text-blue-500 focus:ring-blue-400"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={device.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      onClick={() => toggleDevice(device.id)}
                      className="text-slate-700 font-medium hover:text-blue-600 transition-colors text-left flex items-center gap-1"
                    >
                      {expandedDevices.has(device.id) ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      {device.name}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-slate-500">{device.code}</td>
                  <td className="px-3 py-2.5 text-slate-600">{device.category}</td>
                  <td className="px-3 py-2.5 text-slate-600">{device.location}</td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {device.realtimePower > 0
                      ? `${device.realtimePower}kW / ${device.todayEnergy}kWh / ${device.temperature}℃`
                      : device.params}
                  </td>
                  <td className="px-3 py-2.5">
                    {device.lastAlarmTime === "—" ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span className="text-amber-600">{device.lastAlarmTime}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleDevice(device.id)}
                        className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        详情
                      </button>
                      <button className="px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 rounded transition-colors">
                        转工单
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredDevices.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">暂无匹配设备</div>
          )}
        </div>

        {/* 展开的详情面板 */}
        {Array.from(expandedDevices).map((id) => {
          const device = AllDevices.find((d) => d.id === id);
          if (!device) return null;
          return (
            <DeviceDetailPanel
              key={id}
              device={device}
              onClose={() => toggleDevice(id)}
            />
          );
        })}
      </div>

      {/* 数据源说明 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-slate-500" />
          数据源与流向说明
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Fuel size={14} className="text-red-500" />
              <span className="text-xs font-semibold text-red-700">能源来源</span>
            </div>
            <div className="space-y-1">
              {["天然气", "地热", "汽油", "柴油", "外购电力", "其他能源"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />{s}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Factory size={14} className="text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">消耗环节</span>
            </div>
            <div className="space-y-1">
              {["供暖", "总耗电", "食堂燃气", "直接能耗", "交通消耗"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{s}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <TreePine size={14} className="text-amber-500" />
              <span className="text-xs font-semibold text-amber-700">细分活动</span>
            </div>
            <div className="space-y-1">
              {["水消耗", "食物消耗", "纸张消耗", "垃圾处理", "校内交通"].map((s) => (
                <div key={s} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{s}
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={14} className="text-purple-500" />
              <span className="text-xs font-semibold text-purple-700">核算范围</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />Scope 1 直接排放
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />Scope 2 间接排放
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />Scope 3 其他间接
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 批量操作弹窗 */}
      {showBatchModal && (
        <BatchMaintenanceModal
          selected={filteredDevices.filter((d) => selectedDevices.has(d.id))}
          onClose={() => setShowBatchModal(false)}
        />
      )}

      {/* Demo水印 */}
      <div className="fixed bottom-2 right-4 text-xs text-slate-300/80 select-none pointer-events-none">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
