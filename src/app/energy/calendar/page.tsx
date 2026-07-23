"use client";

import { useState, useMemo } from "react";
import { getCalendarHeatmapDays, getTypicalDayComparison, getSemesterComparison, getEnergyProfile } from "@/data/energy-three-pages-data";
import type { CalendarHeatmapDay, LoadCurvePoint, TypicalDayComparison, SemesterComparison, EnergyProfile } from "@/types/energy";

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function getIntensityColor(level: CalendarHeatmapDay["level"]): string {
  switch (level) {
    case "abnormal_high": return "bg-red-600 text-white";
    case "high": return "bg-orange-500 text-white";
    case "normal": return "bg-emerald-500 text-white";
    case "low": return "bg-sky-400 text-white";
    case "abnormal_low": return "bg-blue-600 text-white";
    case "holiday": return "bg-violet-400 text-white";
    case "weekend": return "bg-slate-300 text-slate-600";
    default: return "bg-slate-200 text-slate-500";
  }
}

function getLevelLabel(level: CalendarHeatmapDay["level"]): string {
  switch (level) {
    case "abnormal_high": return "异常偏高";
    case "high": return "偏高";
    case "normal": return "正常";
    case "low": return "偏低";
    case "abnormal_low": return "异常偏低";
    case "holiday": return "假期";
    case "weekend": return "周末";
    default: return "-";
  }
}

export default function EnergyCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(6); // July (0-indexed)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<"calendar" | "profile" | "typical" | "semester">("calendar");

  const heatmapDays = useMemo(() => getCalendarHeatmapDays(), []);
  const typicalComparison = useMemo(() => getTypicalDayComparison(), []);
  const semesterComparison = useMemo(() => getSemesterComparison(), []);
  const energyProfile = useMemo(() => getEnergyProfile(), []);

  // Filter days for selected month
  const monthDays = useMemo(() => {
    return heatmapDays.filter((d) => {
      const m = parseInt(d.date.split("-")[1], 10);
      return m === selectedMonth + 1;
    });
  }, [heatmapDays, selectedMonth]);

  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const firstDay = monthDays[0];
    if (!firstDay) return [];
    const firstDate = new Date(firstDay.date);
    const startDow = (firstDate.getDay() + 6) % 7; // Monday = 0
    const weeks: (CalendarHeatmapDay | null)[][] = [];
    let currentWeek: (CalendarHeatmapDay | null)[] = Array(startDow).fill(null);

    monthDays.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      weeks.push(currentWeek);
    }
    return weeks;
  }, [monthDays]);

  const selectedDayData = useMemo(() => {
    if (!selectedDay) return null;
    return heatmapDays.find((d) => d.date === selectedDay) ?? null;
  }, [selectedDay, heatmapDays]);

  // Stats
  const monthStats = useMemo(() => {
    if (monthDays.length === 0) return { totalTce: 0, avgIntensity: 0, abnormalCount: 0, alertCount: 0 };
    const totalTce = monthDays.reduce((s, d) => s + d.totalTce, 0);
    const avgIntensity = monthDays.reduce((s, d) => s + d.intensity, 0) / monthDays.length;
    const abnormalCount = monthDays.filter((d) => d.isAbnormal).length;
    const alertCount = monthDays.reduce((s, d) => s + (d.alertCount ?? 0), 0);
    return { totalTce, avgIntensity, abnormalCount, alertCount };
  }, [monthDays]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-xl font-bold">用能日历</h1>
          <p className="text-sm text-slate-400 mt-0.5">逐日用能热力图 · 用能画像 · 典型日对比 · 学期对比</p>
        </div>
        <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
          {(["calendar", "profile", "typical", "semester"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setViewTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewTab === tab ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {{ calendar: "热力图", profile: "用能画像", typical: "典型日对比", semester: "学期对比" }[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {viewTab === "calendar" && (
          <div className="space-y-6">
            {/* Month Stats */}
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "月总能耗", value: `${monthStats.totalTce.toFixed(1)}`, unit: "tce" },
                { label: "日均强度", value: `${monthStats.avgIntensity.toFixed(2)}`, unit: "kgce/m²·d" },
                { label: "异常天数", value: `${monthStats.abnormalCount}`, unit: "天", warn: monthStats.abnormalCount > 0 },
                { label: "告警次数", value: `${monthStats.alertCount}`, unit: "次", warn: monthStats.alertCount > 0 },
              ].map((stat, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.warn ? "text-red-400" : "text-slate-100"}`}>
                    {stat.value}
                    <span className="text-sm font-normal text-slate-500 ml-1">{stat.unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSelectedMonth(Math.max(0, selectedMonth - 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400">
                ◀
              </button>
              <span className="text-lg font-semibold min-w-[80px] text-center">{MONTHS[selectedMonth]}</span>
              <button onClick={() => setSelectedMonth(Math.min(11, selectedMonth + 1))} className="p-1.5 rounded hover:bg-slate-800 text-slate-400">
                ▶
              </button>
              <div className="flex gap-2 ml-4 text-xs">
                {[
                  { color: "bg-red-600", label: "异常偏高" },
                  { color: "bg-orange-500", label: "偏高" },
                  { color: "bg-emerald-500", label: "正常" },
                  { color: "bg-sky-400", label: "偏低" },
                  { color: "bg-violet-400", label: "假期" },
                  { color: "bg-slate-300", label: "周末" },
                ].map((l) => (
                  <span key={l.label} className="flex items-center gap-1">
                    <span className={`w-3 h-3 rounded-sm ${l.color}`} />
                    {l.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-700/50">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center text-xs text-slate-500 py-2 font-medium">{d}</div>
                ))}
              </div>
              <div>
                {calendarGrid.map((week, wi) => (
                  <div key={wi} className="grid grid-cols-7">
                    {week.map((day, di) => (
                      <div
                        key={di}
                        onClick={() => day && setSelectedDay(day.date)}
                        className={`aspect-square p-1.5 border-r border-b border-slate-700/30 cursor-pointer transition-all hover:ring-2 hover:ring-cyan-400/50 hover:z-10 ${
                          selectedDay === day?.date ? "ring-2 ring-cyan-400 z-10" : ""
                        }`}
                      >
                        {day && (
                          <div className={`h-full rounded-lg flex flex-col items-center justify-center ${getIntensityColor(day.level)}`}>
                            <span className="text-xs font-bold">{parseInt(day.date.split("-")[2], 10)}</span>
                            <span className="text-[10px] opacity-80">{day.totalTce.toFixed(1)}</span>
                            {day.hasAlert && <span className="w-1.5 h-1.5 rounded-full bg-white mt-0.5" />}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Day Detail */}
            {selectedDayData && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{selectedDayData.date} 用能详情</h3>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${getIntensityColor(selectedDayData.level)}`}>
                    {getLevelLabel(selectedDayData.level)}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { label: "总能耗", value: selectedDayData.totalTce.toFixed(2), unit: "tce" },
                    { label: "电力", value: selectedDayData.electricity.toFixed(0), unit: "kWh" },
                    { label: "水耗", value: selectedDayData.water.toFixed(1), unit: "m³" },
                    { label: "天然气", value: selectedDayData.gas.toFixed(1), unit: "m³" },
                    { label: "热力", value: selectedDayData.heat.toFixed(1), unit: "GJ" },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-900/50 rounded-lg p-3 text-center">
                      <div className="text-xs text-slate-400">{item.label}</div>
                      <div className="text-lg font-bold text-slate-100 mt-1">{item.value}</div>
                      <div className="text-[10px] text-slate-500">{item.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {viewTab === "profile" && <EnergyProfileView profile={energyProfile} />}
        {viewTab === "typical" && <TypicalDayView data={typicalComparison} />}
        {viewTab === "semester" && <SemesterView data={semesterComparison} />}
      </div>
    </div>
  );
}

function EnergyProfileView({ profile }: { profile: EnergyProfile }) {
  const [selectedPattern, setSelectedPattern] = useState<"workday" | "weekend" | "holiday">("workday");

  const currentCurve: LoadCurvePoint[] =
    selectedPattern === "workday" ? profile.workdayPattern :
    selectedPattern === "weekend" ? profile.weekendPattern :
    profile.holidayPattern;

  const maxVal = Math.max(...currentCurve.map((p) => p.electricity + p.water + p.gas + p.heat), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-400">峰谷比</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{profile.peakValleyRatio.toFixed(1)}</div>
          <div className="text-[10px] text-slate-500">峰时/谷时</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-400">峰时段</div>
          <div className="text-sm font-medium text-orange-400 mt-1">{profile.peakHours.join(", ")}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-400">谷时段</div>
          <div className="text-sm font-medium text-sky-400 mt-1">{profile.valleyHours.join(", ")}</div>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="text-xs text-slate-400">季节模式</div>
          <div className="text-sm font-medium text-slate-300 mt-1">
            {profile.seasonalPattern.map((s) => s.dominantEnergy).join(" → ")}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["workday", "weekend", "holiday"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPattern(p)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedPattern === p ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {{ workday: "工作日", weekend: "周末", holiday: "节假日" }[p]}
          </button>
        ))}
      </div>

      {/* SVG Line Chart */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
        <svg viewBox="0 0 800 250" className="w-full h-64">
          {/* Grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line key={r} x1={40} y1={20 + r * 200} x2={780} y2={20 + r * 200} stroke="#334155" strokeWidth="0.5" />
          ))}
          {/* Y labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <text key={r} x={35} y={24 + r * 200} textAnchor="end" className="text-[10px] fill-slate-500">
              {(maxVal * (1 - r)).toFixed(0)}
            </text>
          ))}
          {/* Line */}
          <polyline
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2"
            points={currentCurve
              .map((p, i) => {
                const x = 40 + (i / (currentCurve.length - 1)) * 740;
                const total = p.electricity + p.water + p.gas + p.heat;
                const y = 20 + (1 - total / maxVal) * 200;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {/* Area fill */}
          <polygon
            fill="url(#areaGrad)"
            points={`${40},220 ${currentCurve
              .map((p, i) => {
                const x = 40 + (i / (currentCurve.length - 1)) * 740;
                const total = p.electricity + p.water + p.gas + p.heat;
                const y = 20 + (1 - total / maxVal) * 200;
                return `${x},${y}`;
              })
              .join(" ")} ${780},220`}
          />
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* X labels */}
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
            <text key={h} x={40 + (h / 23) * 740} y={240} textAnchor="middle" className="text-[10px] fill-slate-500">
              {`${h}:00`}
            </text>
          ))}
        </svg>
      </div>

      {/* Seasonal Pattern */}
      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold mb-3">季节用能模式</h3>
        <div className="grid grid-cols-4 gap-3">
          {profile.seasonalPattern.map((s) => (
            <div key={s.season} className="bg-slate-900/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">{{ spring: "春季", summer: "夏季", autumn: "秋季", winter: "冬季" }[s.season]}</div>
              <div className="text-lg font-bold text-slate-100 mt-1">{s.avgDaily.toFixed(1)}</div>
              <div className="text-[10px] text-slate-500">tce/日</div>
              <div className="text-[10px] text-slate-500 mt-0.5">峰值 {s.peakDemand.toFixed(0)} kW</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TypicalDayView({ data }: { data: TypicalDayComparison }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const current = data.days[selectedDay];
  if (!current) return null;
  const maxVal = Math.max(...current.data.map((p) => p.electricity + p.water + p.gas + p.heat), 1);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        {data.days.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              selectedDay === i ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {d.label} ({d.date})
          </button>
        ))}
      </div>

      <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
        <svg viewBox="0 0 800 250" className="w-full h-64">
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <line key={r} x1={40} y1={20 + r * 200} x2={780} y2={20 + r * 200} stroke="#334155" strokeWidth="0.5" />
          ))}
          <polyline
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2"
            points={current.data
              .map((p, i) => {
                const x = 40 + (i / (current.data.length - 1)) * 740;
                const total = p.electricity + p.water + p.gas + p.heat;
                const y = 20 + (1 - total / maxVal) * 200;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {[0, 3, 6, 9, 12, 15, 18, 21, 23].map((h) => (
            <text key={h} x={40 + (h / 23) * 740} y={240} textAnchor="middle" className="text-[10px] fill-slate-500">
              {`${h}:00`}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function SemesterView({ data }: { data: SemesterComparison }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {data.semesters.map((sem, i) => (
          <div key={i} className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
            <h3 className="text-lg font-semibold text-slate-100 mb-3">{sem.name}</h3>
            <div className="text-xs text-slate-500 mb-2">{sem.startDate} ~ {sem.endDate}</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">总能耗</div>
                <div className="text-xl font-bold text-slate-100">{sem.totalTce.toFixed(1)} <span className="text-sm font-normal text-slate-500">tce</span></div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">日均能耗</div>
                <div className="text-xl font-bold text-slate-100">{sem.avgDailyTce.toFixed(2)} <span className="text-sm font-normal text-slate-500">tce</span></div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">电力</div>
                <div className="text-lg font-bold text-sky-400">{sem.electricity.toFixed(0)} <span className="text-xs font-normal text-slate-500">kWh</span></div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">水耗</div>
                <div className="text-lg font-bold text-blue-400">{sem.water.toFixed(0)} <span className="text-xs font-normal text-slate-500">m³</span></div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">天然气</div>
                <div className="text-lg font-bold text-orange-400">{sem.gas.toFixed(0)} <span className="text-xs font-normal text-slate-500">m³</span></div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs text-slate-400">热力</div>
                <div className="text-lg font-bold text-red-400">{sem.heat.toFixed(0)} <span className="text-xs font-normal text-slate-500">GJ</span></div>
              </div>
            </div>
            <div className="mt-3 text-xs text-slate-500">
              峰值日: {sem.peakDemandDay} ({sem.peakDemandValue.toFixed(0)} kW)
            </div>
          </div>
        ))}
      </div>

      {/* Comparison bars */}
      {data.semesters.length >= 2 && (
        <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold mb-4">学期能耗对比</h3>
          <div className="space-y-3">
            {(["electricity", "water", "gas", "heat"] as const).map((key) => {
              const v0 = data.semesters[0]?.[key] ?? 0;
              const v1 = data.semesters[1]?.[key] ?? 0;
              const maxV = Math.max(v0, v1, 1);
              const labels = { electricity: "电力(kWh)", water: "水耗(m³)", gas: "天然气(m³)", heat: "热力(GJ)" };
              const colors = { electricity: "bg-sky-500", water: "bg-blue-500", gas: "bg-orange-500", heat: "bg-red-500" };
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>{labels[key]}</span>
                    <span>{data.semesters[0].name}: {v0.toFixed(0)} | {data.semesters[1].name}: {v1.toFixed(0)}</span>
                  </div>
                  <div className="flex gap-1 h-5">
                    <div className={`${colors[key]} rounded-l h-full`} style={{ width: `${(v0 / maxV) * 45}%` }} />
                    <div className="text-[10px] text-slate-400 self-center">{v0.toFixed(0)}</div>
                    <div className="flex-1" />
                    <div className="text-[10px] text-slate-400 self-center">{v1.toFixed(0)}</div>
                    <div className={`${colors[key]} opacity-60 rounded-r h-full`} style={{ width: `${(v1 / maxV) * 45}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
