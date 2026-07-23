"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import {
  getBuildingRanking,
  getHourlyLoadData,
  getAnomalies,
  getBuildingName,
} from "@/data/mock-data";
import type { Anomaly } from "@/types";

export default function EnergyPage() {
  const [selectedBuilding, setSelectedBuilding] = useState<string>("b01");
  const [metric, setMetric] = useState<"emission" | "intensity">("emission");

  const rankings = useMemo(() => getBuildingRanking(2026, metric), [metric]);
  const anomalies = useMemo(() => getAnomalies(), []);

  const hourlyData = useMemo(() => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      const isNight = hour >= 22 || hour < 6;
      const baseLoad = isNight ? 180 : 120;
      const noise = ((hour * 7) % 11) * 3 - 15;
      data.push({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        load: Math.max(0, baseLoad + noise),
        baseline: isNight ? 140 : 120,
        isAnomaly: isNight && hour >= 22,
      });
    }
    return data;
  }, []);

  const COLORS = ["#0099FF", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899"];

  return (
    <div className="min-h-screen p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">能源分析</h1>
        <p className="text-slate-500 mt-1 text-sm">建筑能耗监测与异常分析</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：建筑排名 */}
        <div className="col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">建筑能耗排名</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetric("emission")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    metric === "emission"
                      ? "bg-cyan-100 text-cyan-700 border border-cyan-300"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  总量
                </button>
                <button
                  onClick={() => setMetric("intensity")}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    metric === "intensity"
                      ? "bg-cyan-100 text-cyan-700 border border-cyan-300"
                      : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                  }`}
                >
                  强度
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankings} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={12}
                    label={{
                      value: metric === "emission" ? "tCO₂" : "kgCO₂/m²",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#94a3b8", fontSize: 12 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="buildingName"
                    stroke="#94a3b8"
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#334155" }}
                  />
                  <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                    {rankings.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 异常列表 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">异常告警</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {anomalies.map((anomaly: Anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedBuilding(anomaly.buildingId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    anomaly.buildingId === selectedBuilding
                      ? "bg-cyan-50 border-cyan-300"
                      : "bg-slate-50 border-slate-200 hover:border-cyan-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{anomaly.buildingName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        anomaly.severity === "blocked"
                          ? "bg-red-100 text-red-700"
                          : anomaly.severity === "serious"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {anomaly.severity === "blocked"
                        ? "阻断"
                        : anomaly.severity === "serious"
                        ? "严重"
                        : "警告"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{anomaly.rule}</div>
                  <div className="text-xs text-slate-400 mt-1">影响：{anomaly.impactValue} kWh</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：小时负荷热力图 */}
        <div className="col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-700">
                {getBuildingName(selectedBuilding)} - 小时负荷曲线
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-slate-500">实际负荷</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-slate-500">基线</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} label={{ value: "kWh", angle: -90, position: "insideLeft", style: { fill: "#94a3b8" } }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "#334155" }}
                  />
                  <Bar dataKey="load" name="实际负荷" radius={[2, 2, 0, 0]}>
                    {hourlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isAnomaly ? "#EF4444" : "#0099FF"}
                        opacity={entry.isAnomaly ? 1 : 0.7}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 text-sm">⚠</span>
                <div>
                  <div className="text-sm font-medium text-red-700">检测到异常</div>
                  <div className="text-xs text-slate-500 mt-1">
                    22:00-06:00 夜间空调负荷持续偏高，较同类建筑基线高出约 28%。
                    建议检查空调定时设置或是否存在设备未关闭情况。
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 散点图：面积 vs 排放 */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-4">
              建筑面积 vs 碳排放散点图
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="area"
                    name="面积"
                    unit="㎡"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis
                    type="number"
                    dataKey="emission"
                    name="排放"
                    unit="t"
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <ZAxis type="number" dataKey="emission" range={[50, 200]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ strokeDasharray: "3 3" }}
                  />
                  <Scatter data={rankings} fill="#0099FF" opacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
