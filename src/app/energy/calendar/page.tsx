"use client";

import { useState, useMemo, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Calendar,
  BarChart3,
  PieChart,
  Thermometer,
  Gauge,
  Info,
  Wrench,
  CheckCircle,
  X,
} from "lucide-react";

/* ========== 类型定义 ========== */
interface DayData {
  day: number;
  energy: number;
  ratio: number; // 实际/参考值
  isWeekend: boolean;
  isHoliday: boolean;
  hasData: boolean;
}

interface HourlyData {
  hour: number;
  total: number;
  ac: number;
  lighting: number;
  lab: number;
  other: number;
}

interface AlarmItem {
  id: number;
  type: "danger" | "warning" | "info";
  description: string;
  time: string;
  expanded: boolean;
}

interface TopRankItem {
  rank: number;
  name: string;
  value: number;
}

/* ========== 模拟数据 ========== */
const REFERENCE_DAILY = 3200; // 参考日均值 kWh

function generateMonthDays(year: number, month: number): DayData[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: DayData[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = d === 4 || d === 5; // 模拟节假日

    // 确定性模拟数据
    const seed = (d * 137 + month * 53) % 100;
    const baseEnergy = 2800 + seed * 12;
    const ratio = baseEnergy / REFERENCE_DAILY;

    // 7/21 之后的数据（未来日期无数据）
    const hasData = d <= 21;

    days.push({
      day: d,
      energy: hasData ? baseEnergy : 0,
      ratio: hasData ? ratio : 0,
      isWeekend,
      isHoliday,
      hasData,
    });
  }
  return days;
}

function generateHourlyData(day: number): HourlyData[] {
  const hours: HourlyData[] = [];
  for (let h = 0; h < 24; h++) {
    const seed = (h * 47 + day * 83) % 100;
    // 峰谷特征
    let baseMultiplier = 0.4;
    if (h >= 8 && h <= 11) baseMultiplier = 1.2;
    else if (h >= 18 && h <= 21) baseMultiplier = 1.0;
    else if (h >= 23 || h <= 7) baseMultiplier = 0.25;

    const total = Math.round((100 + seed * 2.5) * baseMultiplier);
    hours.push({
      hour: h,
      total,
      ac: Math.round(total * (0.35 + (seed % 15) / 100)),
      lighting: Math.round(total * (0.15 + (seed % 10) / 100)),
      lab: Math.round(total * (0.25 + (seed % 12) / 100)),
      other: Math.round(total * (0.25 + (seed % 8) / 100)),
    });
  }
  return hours;
}

const PIE_DATA = [
  { name: "教学楼区", value: 28.5, color: "#3B82F6" },
  { name: "宿舍区", value: 22.3, color: "#10B981" },
  { name: "实验楼", value: 18.6, color: "#F59E0B" },
  { name: "食堂", value: 12.1, color: "#EF4444" },
  { name: "行政楼", value: 8.4, color: "#8B5CF6" },
  { name: "体育馆", value: 4.8, color: "#EC4899" },
  { name: "LED照明", value: 3.3, color: "#06B6D4" },
  { name: "其他", value: 2.0, color: "#94A3B8" },
];

const TOP_RANK: TopRankItem[] = [
  { rank: 1, name: "中央空调机组-教学区", value: 12450 },
  { rank: 2, name: "宿舍区总用电", value: 8920 },
  { rank: 3, name: "实验楼总用电", value: 7380 },
  { rank: 4, name: "食堂用电", value: 4820 },
  { rank: 5, name: "LED照明总控", value: 3150 },
  { rank: 6, name: "行政楼用电", value: 2680 },
  { rank: 7, name: "体育馆用电", value: 1540 },
  { rank: 8, name: "数据中心/机房", value: 1200 },
  { rank: 9, name: "充电桩", value: 680 },
  { rank: 10, name: "光伏自发自用抵消", value: -4200 },
];

const INITIAL_ALARMS: AlarmItem[] = [
  { id: 1, type: "danger", description: "实验楼分项电表负荷率达85%，超过预警阈值", time: "2026-07-21 14:32", expanded: false },
  { id: 2, type: "warning", description: "数据中心UPS负载率持续偏高", time: "2026-07-21 13:15", expanded: false },
  { id: 3, type: "warning", description: "西区燃气锅炉排烟温度偏高", time: "2026-07-21 11:48", expanded: false },
  { id: 4, type: "info", description: "中央空调机组-行政区进入检修模式", time: "2026-07-21 09:00", expanded: false },
  { id: 5, type: "info", description: "地源热泵通信模块离线", time: "2026-07-21 08:22", expanded: false },
];

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

/* ========== 简单饼图组件 ========== */
function SimplePieChart({ data }: { data: typeof PIE_DATA }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const segments = useMemo(() => {
    const { result } = data.reduce<{
      acc: number;
      result: (typeof data[number] & { startAngle: number; endAngle: number })[];
    }>(
      (prev, d) => {
        const startAngle = (prev.acc / total) * 360;
        const newAcc = prev.acc + d.value;
        const endAngle = (newAcc / total) * 360;
        return {
          acc: newAcc,
          result: [...prev.result, { ...d, startAngle, endAngle }],
        };
      },
      { acc: 0, result: [] }
    );
    return result;
  }, [data, total]);

  const radius = 70;
  const cx = 80;
  const cy = 80;

  return (
    <div className="flex items-center gap-3">
      <svg width={160} height={160} viewBox="0 0 160 160">
        {segments.map((seg) => {
          const startRad = ((seg.startAngle - 90) * Math.PI) / 180;
          const endRad = ((seg.endAngle - 90) * Math.PI) / 180;
          const x1 = cx + radius * Math.cos(startRad);
          const y1 = cy + radius * Math.sin(startRad);
          const x2 = cx + radius * Math.cos(endRad);
          const y2 = cy + radius * Math.sin(endRad);
          const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
          return (
            <path
              key={seg.name}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}
        <circle cx={cx} cy={cy} r={35} fill="white" />
      </svg>
      <div className="flex-1 space-y-1">
        {data.map((d) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-slate-600">{d.name}</span>
            </div>
            <span className="text-slate-700 font-medium">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========== 逐时负荷曲线 ========== */
function HourlyLoadChart({
  data,
  selectedDay,
  overlays,
}: {
  data: HourlyData[];
  selectedDay: number;
  overlays: { ac: boolean; lighting: boolean; lab: boolean; other: boolean };
}) {
  const maxVal = Math.max(...data.map((d) => d.total), 1);
  const chartW = 600;
  const chartH = 200;
  const padL = 40;
  const padR = 10;
  const padT = 10;
  const padB = 25;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const xScale = (h: number) => padL + (h / 23) * plotW;
  const yScale = (v: number) => padT + plotH - (v / maxVal) * plotH;

  const refLineY = yScale(REFERENCE_DAILY / 24);

  // 峰时区域
  const peakRanges = [
    { start: 8, end: 11 },
    { start: 18, end: 21 },
  ];
  const valleyRanges = [{ start: 23, end: 24 }, { start: 0, end: 7 }];

  return (
    <div className="w-full overflow-x-auto">
      <svg width={chartW} height={chartH} className="mx-auto">
        {/* 谷时底色 */}
        {valleyRanges.map((r) => (
          <rect
            key={`valley-${r.start}`}
            x={xScale(r.start)}
            y={padT}
            width={xScale(r.end === 24 ? 23 : r.end) - xScale(r.start)}
            height={plotH}
            fill="#ECFDF5"
            opacity={0.6}
          />
        ))}
        {/* 峰时底色 */}
        {peakRanges.map((r) => (
          <rect
            key={`peak-${r.start}`}
            x={xScale(r.start)}
            y={padT}
            width={xScale(r.end) - xScale(r.start)}
            height={plotH}
            fill="#FEF2F2"
            opacity={0.5}
          />
        ))}

        {/* 参考线 */}
        <line x1={padL} y1={refLineY} x2={padL + plotW} y2={refLineY} stroke="#94A3B8" strokeDasharray="4 3" strokeWidth={1} />
        <text x={padL + plotW - 2} y={refLineY - 4} fontSize={9} fill="#94A3B8" textAnchor="end">
          参考 {Math.round(REFERENCE_DAILY / 24)}kW
        </text>

        {/* Y轴刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = yScale(maxVal * pct);
          return (
            <g key={`y-${pct}`}>
              <line x1={padL - 3} y1={y} x2={padL} y2={y} stroke="#CBD5E1" strokeWidth={0.5} />
              <text x={padL - 5} y={y + 3} fontSize={9} fill="#94A3B8" textAnchor="end">
                {Math.round(maxVal * pct)}
              </text>
            </g>
          );
        })}

        {/* 叠加曲线 */}
        {overlays.ac && (
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.7}
            points={data.map((d) => `${xScale(d.hour)},${yScale(d.ac)}`).join(" ")}
          />
        )}
        {overlays.lighting && (
          <polyline
            fill="none"
            stroke="#8B5CF6"
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.7}
            points={data.map((d) => `${xScale(d.hour)},${yScale(d.lighting)}`).join(" ")}
          />
        )}
        {overlays.lab && (
          <polyline
            fill="none"
            stroke="#EC4899"
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.7}
            points={data.map((d) => `${xScale(d.hour)},${yScale(d.lab)}`).join(" ")}
          />
        )}
        {overlays.other && (
          <polyline
            fill="none"
            stroke="#06B6D4"
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.7}
            points={data.map((d) => `${xScale(d.hour)},${yScale(d.other)}`).join(" ")}
          />
        )}

        {/* 主曲线 */}
        <polyline
          fill="none"
          stroke="#3488FF"
          strokeWidth={2}
          points={data.map((d) => `${xScale(d.hour)},${yScale(d.total)}`).join(" ")}
        />
        {/* 数据点 */}
        {data.map((d) => (
          <circle key={d.hour} cx={xScale(d.hour)} cy={yScale(d.total)} r={2} fill="#3488FF" />
        ))}

        {/* X轴 */}
        <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="#CBD5E1" strokeWidth={1} />
        {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
          <text key={`x-${h}`} x={xScale(h)} y={padT + plotH + 14} fontSize={9} fill="#94A3B8" textAnchor="middle">
            {h}:00
          </text>
        ))}
      </svg>
    </div>
  );
}

/* ========== 主页面 ========== */
export default function EnergyCalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // 0-based, July
  const [selectedDay, setSelectedDay] = useState(21);
  const [alarmFilter, setAlarmFilter] = useState<"全部" | "danger" | "warning" | "info">("全部");
  const [alarms, setAlarms] = useState(INITIAL_ALARMS);
  const [overlays, setOverlays] = useState({ ac: false, lighting: false, lab: false, other: false });
  const [isLoading, setIsLoading] = useState(false);

  const days = useMemo(() => generateMonthDays(year, month), [year, month]);
  const hourlyData = useMemo(() => generateHourlyData(selectedDay), [selectedDay]);

  const monthTotal = useMemo(() => days.reduce((s, d) => s + d.energy, 0), [days]);
  const dataDays = useMemo(() => days.filter((d) => d.hasData).length, [days]);
  const totalDays = days.length;

  const selectedDayData = useMemo(() => days.find((d) => d.day === selectedDay), [days, selectedDay]);

  const filteredAlarms = useMemo(() => {
    if (alarmFilter === "全部") return alarms;
    return alarms.filter((a) => a.type === alarmFilter);
  }, [alarms, alarmFilter]);

  const changeMonth = useCallback(
    (delta: number) => {
      setIsLoading(true);
      setTimeout(() => {
        let newMonth = month + delta;
        let newYear = year;
        if (newMonth < 0) {
          newMonth = 11;
          newYear--;
        } else if (newMonth > 11) {
          newMonth = 0;
          newYear++;
        }
        setYear(newYear);
        setMonth(newMonth);
        setSelectedDay(1);
        setIsLoading(false);
      }, 300);
    },
    [month, year]
  );

  const toggleOverlay = (key: keyof typeof overlays) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAlarmExpand = (id: number) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, expanded: !a.expanded } : a))
    );
  };

  const monthLabel = `${year}-${String(month + 1).padStart(2, "0")}`;

  // 获取当月第一天是周几（0=周日）
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 转为周一=0

  return (
    <div className="p-4 space-y-4">
      {/* 页面标题 */}
      <div>
        <h1 className="text-xl font-bold text-slate-800">用电日历</h1>
        <p className="text-sm text-slate-500 mt-0.5">校园用电逐日监测与异常分析</p>
      </div>

      {/* 9c.1 顶部月度切换栏 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 font-mono">{monthLabel}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-xs text-slate-500">月累计用电量</div>
              <div className="text-lg font-bold text-slate-800">{(monthTotal / 1000).toFixed(1)} <span className="text-sm font-normal text-slate-400">MWh</span></div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">同比</div>
              <div className="text-sm font-semibold text-red-500 flex items-center gap-0.5">
                <TrendingUp size={12} /> +3.2%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">环比</div>
              <div className="text-sm font-semibold text-emerald-500 flex items-center gap-0.5">
                <TrendingDown size={12} /> -1.8%
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-slate-500">数据完整率</div>
              <div className="text-sm font-semibold text-slate-700">
                {dataDays}/{totalDays} <span className="text-slate-400">({((dataDays / totalDays) * 100).toFixed(0)}%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 9c.2 左侧月历 + 右侧详情 */}
      <div className="grid grid-cols-5 gap-4">
        {/* 左侧：月历热力图 */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            {/* 星期头 */}
            <div className="grid grid-cols-7 mb-2">
              {["一", "二", "三", "四", "五", "六", "日"].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
                  {d}
                </div>
              ))}
            </div>
            {/* 日历网格 */}
            <div className="grid grid-cols-7 gap-1">
              {/* 填充空白 */}
              {Array.from({ length: startOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {/* 日期 */}
              {days.map((day) => {
                const isSelected = day.day === selectedDay;
                let bgColor = "bg-slate-100";
                if (day.hasData) {
                  if (day.ratio > 1.1) bgColor = "bg-red-100 hover:bg-red-200";
                  else if (day.ratio >= 0.8) bgColor = "bg-blue-50 hover:bg-blue-100";
                  else bgColor = "bg-emerald-50 hover:bg-emerald-100";
                }
                if (day.isWeekend && day.hasData) bgColor += " opacity-80";

                return (
                  <button
                    key={day.day}
                    onClick={() => day.hasData && setSelectedDay(day.day)}
                    disabled={!day.hasData}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all text-xs relative ${
                      isSelected
                        ? "ring-2 ring-blue-500 bg-blue-100 font-bold shadow-sm"
                        : bgColor
                    } ${!day.hasData ? "cursor-default opacity-40" : "cursor-pointer"}`}
                    title={
                      day.hasData
                        ? `${day.energy.toLocaleString()} kWh / 参考${REFERENCE_DAILY.toLocaleString()}kWh / ${day.ratio > 1.1 ? `超出${((day.ratio - 1) * 100).toFixed(0)}%` : day.ratio < 0.8 ? `低于${((1 - day.ratio) * 100).toFixed(0)}%` : "正常范围"}`
                        : "无数据"
                    }
                  >
                    <span className={`${isSelected ? "text-blue-700" : "text-slate-600"}`}>
                      {day.day}
                    </span>
                    {day.hasData && (
                      <span className={`text-[10px] ${isSelected ? "text-blue-600" : "text-slate-500"}`}>
                        {day.energy >= 1000 ? `${(day.energy / 1000).toFixed(1)}k` : day.energy}
                      </span>
                    )}
                    {day.isHoliday && day.hasData && (
                      <span className="absolute top-0.5 right-1 text-[9px] text-amber-500 font-medium">假</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 图例 */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-200" /> 偏高(&gt;1.1x)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-50 border border-blue-200" /> 正常(0.8~1.1x)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" /> 偏低(&lt;0.8x)
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200" /> 无数据
              </div>
            </div>
          </div>

          {/* 参考值对比区 */}
          {selectedDayData && selectedDayData.hasData && (
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">参考值对比</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">参考值</span>
                  <span className="font-mono text-slate-700">{REFERENCE_DAILY.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">当日累计</span>
                  <span className="font-mono text-slate-700">{selectedDayData.energy.toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">同比差值</span>
                  <span className={`font-mono ${selectedDayData.energy > REFERENCE_DAILY ? "text-red-500" : "text-emerald-500"}`}>
                    {selectedDayData.energy > REFERENCE_DAILY ? "+" : ""}
                    {(selectedDayData.energy - REFERENCE_DAILY).toLocaleString()} kWh
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">月累计</span>
                  <span className="font-mono text-slate-700">{(monthTotal / 1000).toFixed(1)} MWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">环比</span>
                  <span className="font-mono text-emerald-500">-1.8%</span>
                </div>
              </div>
            </div>
          )}

          {/* 区域占比饼图 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <PieChart size={14} className="text-blue-500" />
              区域用电占比
            </h3>
            <SimplePieChart data={PIE_DATA} />
          </div>
        </div>

        {/* 右侧：当日详情 */}
        <div className="col-span-3 space-y-4">
          {/* 9c.3 逐时负荷曲线 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-700">
                当日用电曲线 — {year}-{String(month + 1).padStart(2, "0")}-{String(selectedDay).padStart(2, "0")}
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overlays.ac}
                    onChange={() => toggleOverlay("ac")}
                    className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-slate-600">空调</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overlays.lighting}
                    onChange={() => toggleOverlay("lighting")}
                    className="rounded border-slate-300 text-purple-500 focus:ring-purple-400"
                  />
                  <span className="text-slate-600">照明</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overlays.lab}
                    onChange={() => toggleOverlay("lab")}
                    className="rounded border-slate-300 text-pink-500 focus:ring-pink-400"
                  />
                  <span className="text-slate-600">实验设备</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overlays.other}
                    onChange={() => toggleOverlay("other")}
                    className="rounded border-slate-300 text-cyan-500 focus:ring-cyan-400"
                  />
                  <span className="text-slate-600">其他</span>
                </label>
              </div>
            </div>
            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center">
                <div className="animate-pulse space-y-3 w-full">
                  <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto" />
                  <div className="h-32 bg-slate-50 rounded" />
                </div>
              </div>
            ) : selectedDayData?.hasData ? (
              <HourlyLoadChart data={hourlyData} selectedDay={selectedDay} overlays={overlays} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm">
                该日暂无数据
              </div>
            )}
          </div>

          {/* 当日用电排名 TOP10 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <BarChart3 size={14} className="text-blue-500" />
              当日用电排名 TOP10
            </h3>
            <div className="space-y-1.5">
              {TOP_RANK.map((item) => (
                <div
                  key={item.rank}
                  className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-slate-50 transition-colors"
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    item.rank <= 3
                      ? "bg-blue-100 text-blue-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {item.rank}
                  </span>
                  <span className="flex-1 text-sm text-slate-700 truncate">{item.name}</span>
                  <span className={`text-sm font-mono font-semibold ${item.value < 0 ? "text-emerald-500" : "text-slate-700"}`}>
                    {item.value.toLocaleString()} <span className="text-xs font-normal text-slate-400">kWh</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 设备运行状态统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-xs text-slate-500 mb-1">多功能电表</div>
              <div className="text-lg font-bold text-slate-800">10 <span className="text-xs font-normal text-slate-400">台</span></div>
              <div className="text-xs text-slate-500 mt-1">
                在线 <span className="text-emerald-600 font-medium">9</span> / 离线 <span className="text-red-500 font-medium">1</span>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-xs text-slate-500 mb-1">变压器</div>
              <div className="text-lg font-bold text-slate-800">4 <span className="text-xs font-normal text-slate-400">台</span></div>
              <div className="text-xs text-emerald-600 mt-1">全部正常</div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3">
              <div className="text-xs text-slate-500 mb-1">继电保护装置</div>
              <div className="text-lg font-bold text-slate-800">12 <span className="text-xs font-normal text-slate-400">组</span></div>
              <div className="text-xs text-emerald-600 mt-1">全部正常</div>
            </div>
          </div>
        </div>
      </div>

      {/* 9c.4 底部告警中心 */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              当前告警
            </h3>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {alarms.length}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-0.5">
            {(["全部", "danger", "warning", "info"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setAlarmFilter(f)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  alarmFilter === f
                    ? "bg-white text-slate-700 shadow-sm font-medium"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f === "全部" ? "全部" : f === "danger" ? "🚨 危险" : f === "warning" ? "⚠️ 警告" : "ℹ️ 信息"}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {filteredAlarms.map((alarm) => (
            <div key={alarm.id}>
              <div className="px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50/50 transition-colors">
                <AlarmTypeBadge type={alarm.type} />
                <span className="flex-1 text-sm text-slate-700">{alarm.description}</span>
                <span className="text-xs text-slate-400 whitespace-nowrap">{alarm.time}</span>
                <button
                  onClick={() => toggleAlarmExpand(alarm.id)}
                  className="p-1 rounded hover:bg-slate-100 text-slate-400"
                >
                  <ChevronDown size={14} className={`transition-transform ${alarm.expanded ? "" : "-rotate-90"}`} />
                </button>
              </div>
              {alarm.expanded && (
                <div className="px-4 pb-3 flex items-center gap-2 bg-slate-50/30">
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                    <Wrench size={12} /> 转工单
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                    <CheckCircle size={12} /> 标记已处理
                  </button>
                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                    <X size={12} /> 忽略
                  </button>
                </div>
              )}
            </div>
          ))}
          {filteredAlarms.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">暂无告警</div>
          )}
        </div>
      </div>

      {/* Demo水印 */}
      <div className="fixed bottom-2 right-4 text-xs text-slate-300/80 select-none pointer-events-none">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
