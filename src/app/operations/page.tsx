"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Droplets,
  Flame,
  Factory,
  AlertTriangle,
  Bell,
  Wrench,
  Thermometer,
  Zap,
  Gauge,
  TrendingDown,
  TrendingUp,
  Circle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  Cpu,
  Lightbulb,
  Wind,
  Server,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import { getCampusMapBuildings } from "@/data/campus-map-buildings";
import { getEmissionColor, getEmissionLevel } from "@/data/campus-data";
import {
  getOperationsKPIs,
  getCarbonOverview,
  getAlertsData,
  getDeviceWarnings,
  getSystemEfficiency,
  getInstrumentStatus,
  getBuildingEnergyRanking,
  getRealtimeLoadData,
  type OperationsKPI,
  type CarbonOverview,
  type AlertItem,
  type DeviceWarningItem,
  type SystemEfficiencyItem,
  type InstrumentStatus,
  type BuildingEnergyRankItem,
  type LoadCurvePoint,
} from "@/data/operations-data";

// ============================================================
// 颜色常量
// ============================================================
const COLORS = {
  electricity: "#3B82F6",
  water: "#06B6D4",
  heat: "#F97316",
  energy: "#8B5CF6",
  carbon: "#EF4444",
  danger: "#EF4444",
  warning: "#F59E0B",
  success: "#10B981",
  info: "#3B82F6",
  muted: "#94A3B8",
};

const statusColor = {
  emergency: "bg-red-500",
  important: "bg-orange-500",
  minor: "bg-yellow-500",
  normal: "bg-green-500",
};

const statusBorderColor = {
  emergency: "border-l-red-500",
  important: "border-l-orange-500",
  minor: "border-l-yellow-500",
  normal: "border-l-green-500",
};

const statusTextColor = {
  emergency: "text-red-400",
  important: "text-orange-400",
  minor: "text-yellow-400",
  normal: "text-green-400",
};

const statusBgColor = {
  emergency: "bg-red-500/10",
  important: "bg-orange-500/10",
  minor: "bg-yellow-500/10",
  normal: "bg-green-500/10",
};

// ============================================================
// 子组件
// ============================================================

/** 顶部能耗 KPI 栏 */
function TopKpiBar({ kpis }: { kpis: OperationsKPI[] }) {
  const icons: Record<string, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4" />,
    water: <Droplets className="w-4 h-4" />,
    heat: <Flame className="w-4 h-4" />,
    energy: <Factory className="w-4 h-4" />,
  };
  const colors: Record<string, string> = {
    electricity: COLORS.electricity,
    water: COLORS.water,
    heat: COLORS.heat,
    energy: COLORS.energy,
  };

  return (
    <div className="flex items-center gap-4 px-6 py-3 bg-[#0a1628]/90 border-b border-white/5">
      {kpis.map((kpi) => {
        const c = colors[kpi.type] || COLORS.info;
        return (
          <div
            key={kpi.type}
            className="flex-1 flex items-center gap-3 px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${c}15`, color: c }}
            >
              {icons[kpi.type]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {kpi.label}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-white font-mono">
                  {kpi.value}
                </span>
                <span className="text-[10px] text-slate-500">{kpi.unit}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5 shrink-0">
              <span
                className={`text-[11px] font-medium ${
                  kpi.yoy >= 0 ? "text-red-400" : "text-green-400"
                }`}
              >
                同比 {kpi.yoy >= 0 ? "+" : ""}
                {kpi.yoy}%
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${kpi.budgetProgress}%`,
                      backgroundColor: c,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-500">
                  预算{kpi.budgetProgress}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** 碳排放总览 */
function CarbonOverviewPanel({ data }: { data: CarbonOverview }) {
  const scopeData = [
    { name: "范围1", value: data.scope1, color: "#EF4444", pct: data.scope1Pct },
    { name: "范围2", value: data.scope2, color: "#F59E0B", pct: data.scope2Pct },
    { name: "范围3", value: data.scope3, color: "#3B82F6", pct: data.scope3Pct },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
        碳排放总览
      </div>

      {/* 三大指标 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-0.5">年度</div>
          <div className="text-base font-bold text-white font-mono">
            {data.annual.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">tCO₂</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-0.5">本月</div>
          <div className="text-base font-bold text-white font-mono">
            {data.monthly.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500">tCO₂</div>
        </div>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-slate-500 mb-0.5">今日</div>
          <div className="text-base font-bold text-white font-mono">
            {data.today}
          </div>
          <div className="text-[10px] text-slate-500">tCO₂</div>
        </div>
      </div>

      {/* 同比 */}
      <div className="flex items-center gap-1.5 text-[11px]">
        <span className="text-slate-500">同比</span>
        <span
          className={`font-medium ${
            data.yoy >= 0 ? "text-red-400" : "text-green-400"
          }`}
        >
          {data.yoy >= 0 ? "+" : ""}
          {data.yoy}%
        </span>
        {data.yoy < 0 ? (
          <TrendingDown className="w-3 h-3 text-green-400" />
        ) : (
          <TrendingUp className="w-3 h-3 text-red-400" />
        )}
      </div>

      {/* 排放范围构成 */}
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">
        排放范围构成
      </div>
      <div className="space-y-1.5">
        {scopeData.map((s) => (
          <div key={s.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-[11px] text-slate-400 w-10">{s.name}</span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
              />
            </div>
            <span className="text-[11px] text-slate-300 font-mono w-16 text-right">
              {s.value.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 w-10 text-right">
              {s.pct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 告警中心 */
function AlertCenterPanel({ alerts }: { alerts: AlertItem[] }) {
  const emergencyCount = alerts.filter((a) => a.level === "emergency").length;
  const stats = [
    { label: "待处理", value: 5, color: COLORS.danger },
    { label: "超时", value: 2, color: COLORS.warning },
    { label: "处理中", value: 3, color: COLORS.info },
    { label: "今日完成", value: 7, color: COLORS.success },
  ];

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Bell className="w-3.5 h-3.5 text-red-400" />
        告警中心
        <span className="ml-auto text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
          共{emergencyCount}紧急
        </span>
      </div>

      {/* 统计小卡片 */}
      <div className="grid grid-cols-4 gap-1.5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white/[0.03] border border-white/[0.06] rounded-md p-2 text-center"
          >
            <div
              className="text-sm font-bold font-mono"
              style={{ color: s.color }}
            >
              {s.value}
            </div>
            <div className="text-[9px] text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 告警列表 */}
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
        {alerts.slice(0, 6).map((alert, i) => (
          <div
            key={i}
            className={`bg-white/[0.03] border border-white/[0.06] ${statusBorderColor[alert.level]} border-l-2 rounded-r-md p-2.5`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] text-slate-200 truncate">
                  {alert.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {alert.location}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    statusBgColor[alert.level]
                  } ${statusTextColor[alert.level]}`}
                >
                  {alert.level === "emergency"
                    ? "紧急"
                    : alert.level === "important"
                    ? "重要"
                    : "次要"}
                </span>
                <span className="text-[10px] text-slate-600">{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 设备警告 */
function DeviceWarningPanel({ warnings }: { warnings: DeviceWarningItem[] }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Wrench className="w-3.5 h-3.5 text-orange-400" />
        设备警告
      </div>
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto scrollbar-thin">
        {warnings.map((w, i) => (
          <div
            key={i}
            className={`bg-white/[0.03] border border-white/[0.06] ${statusBorderColor[w.level]} border-l-2 rounded-r-md p-2.5`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] text-slate-200">{w.device}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {w.issue}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    statusBgColor[w.level]
                  } ${statusTextColor[w.level]}`}
                >
                  {w.level === "emergency"
                    ? "紧急"
                    : w.level === "important"
                    ? "重要"
                    : "次要"}
                </span>
                <span className="text-[10px] text-slate-600">{w.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 重点系统运行效率 */
function SystemEfficiencyPanel({ systems }: { systems: SystemEfficiencyItem[] }) {
  const icons: Record<string, React.ReactNode> = {
    "空调与冷站": <Thermometer className="w-3.5 h-3.5" />,
    "供热与锅炉": <Flame className="w-3.5 h-3.5" />,
    "照明与动力": <Lightbulb className="w-3.5 h-3.5" />,
  };

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Activity className="w-3.5 h-3.5 text-green-400" />
        重点系统运行效率
      </div>
      <div className="space-y-2">
        {systems.map((sys) => {
          const icon = icons[sys.name] || <Cpu className="w-3.5 h-3.5" />;
          const effColor =
            sys.efficiency >= 85
              ? COLORS.success
              : sys.efficiency >= 70
              ? COLORS.warning
              : COLORS.danger;
          return (
            <div
              key={sys.name}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span style={{ color: effColor }}>{icon}</span>
                  <span className="text-[12px] text-slate-300 font-medium">
                    {sys.name}
                  </span>
                </div>
                <span
                  className="text-lg font-bold font-mono"
                  style={{ color: effColor }}
                >
                  {sys.efficiency}%
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>
                  运行 {sys.runningUnits}/{sys.totalUnits}
                </span>
                {sys.lowEfficiencyCount > 0 && (
                  <span className="text-orange-400">
                    {sys.lowEfficiencyCount}台低效
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 仪表在线率 & 数据完整率 */
function InstrumentStatusPanel({ data }: { data: InstrumentStatus }) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <Gauge className="w-3.5 h-3.5 text-blue-400" />
        仪表在线率 & 数据完整率
      </div>
      <div className="grid grid-cols-2 gap-2">
        {/* 仪表在线率 */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
          <div className="text-[10px] text-slate-500 mb-1">仪表在线率</div>
          <div className="text-xl font-bold text-green-400 font-mono">
            {data.onlineRate}%
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
            <span className="text-green-400">
              在线{data.onlineCount}台
            </span>
            <span className="text-red-400">
              离线{data.offlineCount}台
            </span>
          </div>
          <div className="text-[10px] text-slate-600 mt-0.5">
            总计{data.totalCount}台
          </div>
        </div>

        {/* 数据完整率 */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
          <div className="text-[10px] text-slate-500 mb-1">数据完整率</div>
          <div className="text-xl font-bold text-blue-400 font-mono">
            {data.completenessRate}%
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500">
            <span className="text-blue-400">
              完整{data.completeCount}台
            </span>
            <span className="text-orange-400">
              缺失{data.missingCount}台
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 校园楼宇能耗排行 */
function BuildingRankingPanel({ buildings }: { buildings: BuildingEnergyRankItem[] }) {
  const maxValue = Math.max(...buildings.map((b) => b.value), 1);

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
        校园楼宇能耗排行
        <span className="text-[10px] text-slate-500 ml-auto">kWh/㎡·月</span>
      </div>
      <div className="space-y-1.5">
        {buildings.map((b, i) => {
          const barColor =
            b.value >= 90
              ? COLORS.danger
              : b.value >= 75
              ? COLORS.warning
              : b.value >= 60
              ? "#EAB308"
              : COLORS.success;
          return (
            <div key={b.name} className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-4 text-right font-mono">
                {i + 1}
              </span>
              <span className="text-[11px] text-slate-300 w-24 truncate">
                {b.name}
              </span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(b.value / maxValue) * 100}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              <span className="text-[11px] text-slate-300 font-mono w-8 text-right">
                {b.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** 校园实时负荷 */
function RealtimeLoadChart({ data }: { data: LoadCurvePoint[] }) {
  return (
    <div className="bg-[#0a1628]/95 border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-slate-200">
            校园实时负荷
          </span>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-blue-400 rounded" />
            <span className="text-slate-400">实时</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-slate-500 rounded" />
            <span className="text-slate-400">昨日</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-0.5 bg-slate-600 rounded" />
            <span className="text-slate-400">预测</span>
          </div>
          <span className="text-slate-500 ml-2">
            当前负荷{" "}
            <span className="text-blue-400 font-mono font-bold">7.7 kW</span>
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0F172A",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              fontSize: "11px",
            }}
            labelStyle={{ color: "#94A3B8" }}
          />
          <Line
            type="monotone"
            dataKey="realtime"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name="实时"
          />
          <Line
            type="monotone"
            dataKey="yesterday"
            stroke="#64748B"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
            name="昨日"
          />
          <Line
            type="monotone"
            dataKey="forecast"
            stroke="#475569"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 2"
            name="预测"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================

export default function OperationsDashboardPage() {
  const [selectedYear] = useState("2026");
  const [selectedCampus] = useState("主校区");

  // 建筑碳排放色阶映射
  const emissionColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const buildings = getCampusMapBuildings("2d");
    buildings.forEach((b) => {
      if (b.carbon) {
        const level = getEmissionLevel(b.carbon.annualEmission);
        map.set(b.id, getEmissionColor(level));
      }
    });
    return map;
  }, []);

  const kpis = useMemo(() => getOperationsKPIs(), []);
  const carbonOverview = useMemo(() => getCarbonOverview(), []);
  const alerts = useMemo(() => getAlertsData(), []);
  const deviceWarnings = useMemo(() => getDeviceWarnings(), []);
  const systemEfficiency = useMemo(() => getSystemEfficiency(), []);
  const instrumentStatus = useMemo(() => getInstrumentStatus(), []);
  const buildingRanking = useMemo(() => getBuildingEnergyRanking(), []);
  const loadData = useMemo(() => getRealtimeLoadData(), []);

  const leftPanel = (
    <div className="space-y-4 p-3">
      <CarbonOverviewPanel data={carbonOverview} />
      <div className="border-t border-white/[0.06]" />
      <AlertCenterPanel alerts={alerts} />
      <div className="border-t border-white/[0.06]" />
      <DeviceWarningPanel warnings={deviceWarnings} />
    </div>
  );

  const rightPanel = (
    <div className="space-y-4 p-3">
      <SystemEfficiencyPanel systems={systemEfficiency} />
      <div className="border-t border-white/[0.06]" />
      <InstrumentStatusPanel data={instrumentStatus} />
      <div className="border-t border-white/[0.06]" />
      <BuildingRankingPanel buildings={buildingRanking} />
    </div>
  );

  const centerBottomPanel = <RealtimeLoadChart data={loadData} />;

  return (
    <ThreeColumnLayout
      level="L3"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      centerBottomPanel={centerBottomPanel}
      colorMode="energy"
    >
      <CampusTileBackground map="2d" tone="operations" emissionColorMap={emissionColorMap} />
    </ThreeColumnLayout>
  );
}
