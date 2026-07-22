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
  Legend,
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

  // 生成教学楼A的小时负荷数据（演示异常场景）
  const hourlyData = useMemo(() => {
    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      // 模拟夜间异常：22:00-06:00 负荷偏高
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
    <div className="min-h-screen grid-bg p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold data-highlight">能源分析</h1>
        <p className="text-gray-400 mt-1 text-sm">建筑能耗监测与异常分析</p>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* 左侧：建筑排名 */}
        <div className="col-span-5 space-y-4">
          <div className="tech-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="tech-title text-sm font-medium text-gray-300">建筑能耗排名</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setMetric("emission")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    metric === "emission"
                      ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                      : "bg-gray-700/30 text-gray-400 border border-gray-600/30"
                  }`}
                >
                  总量
                </button>
                <button
                  onClick={() => setMetric("intensity")}
                  className={`px-3 py-1 rounded text-xs transition-colors ${
                    metric === "intensity"
                      ? "bg-blue-500/30 text-blue-300 border border-blue-500/50"
                      : "bg-gray-700/30 text-gray-400 border border-gray-600/30"
                  }`}
                >
                  强度
                </button>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankings} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    stroke="#64748B"
                    fontSize={12}
                    label={{
                      value: metric === "emission" ? "tCO₂" : "kgCO₂/m²",
                      position: "insideBottom",
                      offset: -5,
                      style: { fill: "#64748B", fontSize: 12 },
                    }}
                  />
                  <YAxis
                    type="category"
                    dataKey="buildingName"
                    stroke="#64748B"
                    fontSize={11}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey={metric} radius={[0, 4, 4, 0]}>
                    {rankings.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        opacity={0.8}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 异常列表 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">异常告警</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {anomalies.map((anomaly: Anomaly) => (
                <div
                  key={anomaly.id}
                  onClick={() => setSelectedBuilding(anomaly.buildingId)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    anomaly.buildingId === selectedBuilding
                      ? "bg-blue-500/20 border-blue-500/50"
                      : "bg-gray-800/30 border-gray-700/30 hover:border-blue-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white">{anomaly.buildingName}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        anomaly.severity === "blocked"
                          ? "bg-red-500/20 text-red-400"
                          : anomaly.severity === "serious"
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {anomaly.severity === "blocked"
                        ? "阻断"
                        : anomaly.severity === "serious"
                        ? "严重"
                        : "警告"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{anomaly.rule}</div>
                  <div className="text-xs text-gray-500 mt-1">影响：{anomaly.impactValue} kWh</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：小时负荷热力图 */}
        <div className="col-span-7 space-y-4">
          <div className="tech-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="tech-title text-sm font-medium text-gray-300">
                {getBuildingName(selectedBuilding)} - 小时负荷曲线
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-400">实际负荷</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-gray-400">基线</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={12} label={{ value: "kWh", angle: -90, position: "insideLeft", style: { fill: "#64748B" } }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
                    }}
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
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <div className="text-red-400 mt-0.5">⚠</div>
                <div>
                  <div className="text-sm font-medium text-red-300">检测到异常</div>
                  <div className="text-xs text-gray-400 mt-1">
                    22:00-06:00 夜间空调负荷持续偏高，较同类建筑基线高出约 28%。
                    建议检查空调定时设置或是否存在设备未关闭情况。
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 散点图：面积 vs 排放 */}
          <div className="tech-card rounded-xl p-4">
            <h3 className="tech-title text-sm font-medium text-gray-300 mb-4">
              建筑面积 vs 碳排放散点图
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    type="number"
                    dataKey="area"
                    name="面积"
                    unit="㎡"
                    stroke="#64748B"
                    fontSize={12}
                  />
                  <YAxis
                    type="number"
                    dataKey="emission"
                    name="排放"
                    unit="t"
                    stroke="#64748B"
                    fontSize={12}
                  />
                  <ZAxis type="number" dataKey="emission" range={[50, 200]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(13, 33, 55, 0.95)",
                      border: "1px solid rgba(0, 153, 255, 0.3)",
                      borderRadius: "8px",
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

      {/* 底部水印 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 opacity-80">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}