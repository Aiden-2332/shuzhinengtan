"use client";

import { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// ========== 类型定义 ==========
interface BuildingData {
  id: string;
  name: string;
  type: string;
  dept: string;
  emission: number;
  targetEmission: number;
  area: number;
  floors: number;
  status: "normal" | "warning" | "danger";
  trend: number;
}

interface PieItem {
  name: string;
  value: number;
  pct: string;
}

// 建筑类型中文映射
const TYPE_LABELS: Record<string, string> = {
  teaching: "教学楼",
  lab: "实验楼",
  dorm: "宿舍",
  dining: "食堂",
  admin: "行政楼",
  gym: "体育馆",
  library: "图书馆",
  solar: "光伏",
};

// 饼图配色（按建筑类型）
const PIE_COLORS: Record<string, string> = {
  teaching: "#3b82f6",
  lab: "#8b5cf6",
  dorm: "#f59e0b",
  dining: "#ef4444",
  admin: "#10b981",
  gym: "#06b6d4",
  library: "#ec4899",
  solar: "#22c55e",
};

// 能源强度系数 (kWh/m²/年)
const ENERGY_INTENSITY: Record<string, number> = {
  teaching: 80, lab: 200, dorm: 60, dining: 150,
  admin: 70, gym: 90, library: 100, solar: 0,
};

// 水耗强度系数 (m³/m²/年)
const WATER_INTENSITY: Record<string, number> = {
  teaching: 0.5, lab: 1.2, dorm: 1.5, dining: 3.0,
  admin: 0.4, gym: 1.0, library: 0.3, solar: 0,
};

const STUDENT_COUNT = 25000;

// ========== 数据计算 ==========
function computeResourceData(buildings: BuildingData[]) {
  const typeMap = new Map<string, { area: number; emission: number }>();

  for (const b of buildings) {
    const key = b.type;
    if (!typeMap.has(key)) typeMap.set(key, { area: 0, emission: 0 });
    const d = typeMap.get(key)!;
    d.area += b.area;
    // 光伏排放为负值，单独处理
    if (key === "solar") {
      d.emission += b.emission; // 保留负值
    } else {
      d.emission += Math.max(b.emission, 0);
    }
  }

  // 过滤掉光伏（负排放会干扰饼图比例）
  const filtered = new Map(typeMap);
  // 保留光伏但单独处理

  const byType: { type: string; label: string; area: number; emission: number; energy: number; water: number }[] = [];

  for (const [type, data] of typeMap) {
    if (type === "solar") continue; // 排除光伏
    byType.push({
      type,
      label: TYPE_LABELS[type] || type,
      area: data.area,
      emission: data.emission,
      energy: Math.round(data.area * ENERGY_INTENSITY[type] / 1000), // 转换为 MWh
      water: Math.round(data.area * WATER_INTENSITY[type]),
    });
  }

  // 总计
  const totalEmission = byType.reduce((s, d) => s + d.emission, 0);
  const totalEnergy = byType.reduce((s, d) => s + d.energy, 0);
  const totalWater = byType.reduce((s, d) => s + d.water, 0);

  // 饼图数据 - 碳排放组成
  const emissionPie: PieItem[] = byType
    .map(d => ({ name: d.label, value: d.emission, pct: ((d.emission / totalEmission) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value);

  // 饼图数据 - 能耗组成
  const energyPie: PieItem[] = byType
    .map(d => ({ name: d.label, value: d.energy, pct: ((d.energy / totalEnergy) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value);

  // 饼图数据 - 水耗组成
  const waterPie: PieItem[] = byType
    .map(d => ({ name: d.label, value: d.water, pct: ((d.water / totalWater) * 100).toFixed(1) }))
    .sort((a, b) => b.value - a.value);

  // 柱状图数据 - 碳/能/水对比
  const barData = [
    { name: "碳排放", value: totalEmission, unit: "tCO₂", color: "#3b82f6" },
    { name: "能耗", value: totalEnergy, unit: "MWh", color: "#f59e0b" },
    { name: "水耗", value: totalWater, unit: "m³", color: "#06b6d4" },
  ];

  // 生均数据
  const perCapitaBar = [
    { name: "碳排放", value: Math.round((totalEmission / STUDENT_COUNT) * 100) / 100, unit: "kgCO₂/人", color: "#3b82f6" },
    { name: "能耗", value: Math.round((totalEnergy * 1000 / STUDENT_COUNT) * 100) / 100, unit: "kWh/人", color: "#f59e0b" },
    { name: "水耗", value: Math.round((totalWater / STUDENT_COUNT) * 100) / 100, unit: "m³/人", color: "#06b6d4" },
  ];

  const perCapitaPie = (pie: PieItem[], total: number) =>
    pie.map(d => ({
      ...d,
      value: Math.round((d.value / STUDENT_COUNT) * 100) / 100,
      pct: d.pct,
    }));

  return {
    total: { barData, emissionPie, energyPie, waterPie },
    perCapita: {
      barData: perCapitaBar,
      emissionPie: perCapitaPie(emissionPie, totalEmission),
      energyPie: perCapitaPie(energyPie, totalEnergy),
      waterPie: perCapitaPie(waterPie, totalWater),
    },
  };
}

// ========== 子组件：小环形饼图 ==========
function MiniDonut({ data, colorMap, onClick }: {
  data: PieItem[];
  colorMap: Record<string, string>;
  onClick?: () => void;
}) {
  const colors = data.map(d => colorMap[d.name] || "#6b7280");
  return (
    <div
      className="rounded-lg bg-gray-900/40 border border-gray-700/20 p-2 cursor-pointer hover:border-cyan-500/30 transition-all"
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-[56px] h-[56px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%" cy="50%"
                innerRadius={16} outerRadius={26}
                paddingAngle={1.5}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => <Cell key={i} fill={colors[i]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-x-2 gap-y-0.5">
            {data.slice(0, 4).map((d, i) => (
              <div key={d.name} className="flex items-center gap-1 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-sm flex-shrink-0" style={{ backgroundColor: colors[i] }} />
                <span className="text-gray-400 truncate max-w-[40px]">{d.name}</span>
                <span className="text-gray-300 font-mono">{d.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 子组件：对比柱状图 ==========
function CompareBar({ data, title }: { data: { name: string; value: number; unit: string; color: string }[]; title: string }) {
  const CHART_HEIGHT = 90;
  return (
    <div className="rounded-lg bg-gray-900/40 border border-gray-700/20 p-2">
      <div className="text-[10px] text-gray-500 mb-1">{title}</div>
      <div style={{ height: CHART_HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 6, fontSize: 11 }}
              formatter={(value: number, _name: string, entry: { payload?: { unit?: string } }) => [`${value.toLocaleString()} ${entry?.payload?.unit ?? ""}`, ""]}
            />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ========== 主组件 ==========
export function ResourceAnalysis({ buildings: building3DData }: { buildings: BuildingData[] }) {
  const [module, setModule] = useState<"total" | "perCapita">("total");

  const computed = useMemo(() => computeResourceData(building3DData), [building3DData]);
  const current = module === "total" ? computed.total : computed.perCapita;

  const pieColorMap: Record<string, string> = {};
  building3DData.forEach(b => {
    const label = TYPE_LABELS[b.type] || b.type;
    if (!pieColorMap[label]) pieColorMap[label] = PIE_COLORS[b.type] || "#6b7280";
  });

  return (
    <div className="space-y-2">
      {/* 模块切换 */}
      <div className="flex rounded-lg bg-gray-900/60 border border-gray-700/30 p-0.5">
        <button
          onClick={() => setModule("total")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            module === "total"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          全校资源总消耗
        </button>
        <button
          onClick={() => setModule("perCapita")}
          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
            module === "perCapita"
              ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
              : "text-gray-500 hover:text-gray-300"
          }`}
        >
          生均资源消耗强度
        </button>
      </div>

      {/* 对比柱状图 */}
      <CompareBar
        data={current.barData}
        title={module === "total" ? "碳/能/水 总量对比" : "碳/能/水 人均对比"}
      />

      {/* 三张分类饼图 */}
      <div className="space-y-1.5">
        <MiniDonut
          data={current.emissionPie}
          colorMap={pieColorMap}
          onClick={() => setModule(module === "total" ? "perCapita" : "total")}
        />
        <div className="text-[9px] text-gray-600 px-1">碳排放组成 · 点击切换总量/人均</div>

        <MiniDonut
          data={current.energyPie}
          colorMap={pieColorMap}
          onClick={() => setModule(module === "total" ? "perCapita" : "total")}
        />
        <div className="text-[9px] text-gray-600 px-1">能耗组成 · 点击切换总量/人均</div>

        <MiniDonut
          data={current.waterPie}
          colorMap={pieColorMap}
          onClick={() => setModule(module === "total" ? "perCapita" : "total")}
        />
        <div className="text-[9px] text-gray-600 px-1">水耗组成 · 点击切换总量/人均</div>
      </div>
    </div>
  );
}