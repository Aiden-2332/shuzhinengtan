"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuildingRanking, getAnomalies, getBuilding3DData, getBuildingDetail } from "@/data/mock-data";
import { AlertTriangle, Zap, TrendingDown, Building2, Target, Shield } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface ResourceItem {
  name: string;
  value: number;
  unit: string;
}

function ResourceDonutChart({ title, data, unit }: { title: string; data: ResourceItem[]; unit: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const COLORS = ["#3b82f6", "#f59e0b", "#06b6d4"];

  return (
    <div className="rounded-lg bg-gray-900/50 border border-gray-700/30 p-3">
      <div className="text-xs text-gray-400 mb-2">{title}</div>
      <div className="flex items-center gap-3">
        <div className="relative w-[100px] h-[100px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={44}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-cyan-400 font-mono">{total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-gray-400">{item.name}</span>
              </div>
              <span className="text-gray-200 font-mono">
                {item.value.toLocaleString()} <span className="text-gray-500">{item.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function L1Dashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const rankings = useMemo(() => getBuildingRanking(2026), []);
  const anomalies = useMemo(() => getAnomalies(), []);
  const building3DData = useMemo(() => getBuilding3DData(), []);

  // 计算核心指标
  const totalEmission = useMemo(() => {
    return building3DData.reduce((sum, b) => sum + b.emission, 0);
  }, [building3DData]);

  const quotaProgress = useMemo(() => {
    const total = 12000; // 年度配额
    return Math.round((totalEmission / total) * 100);
  }, [totalEmission]);

  // 资源消耗计算
  const STUDENT_COUNT = 25000;
  const totalArea = useMemo(() => building3DData.reduce((s, b) => s + b.area, 0), [building3DData]);

  const resourceData = useMemo(() => {
    const totalEnergy = Math.round(totalArea * 0.095); // 95 kWh/m² → MWh
    const totalWater = Math.round(totalArea * 0.65);   // 0.65 m³/m² → m³
    return { totalEnergy, totalWater };
  }, [totalArea]);

  const totalResourceData = useMemo(() => [
    { name: "碳排放", value: totalEmission, unit: "tCO₂" },
    { name: "能耗", value: resourceData.totalEnergy, unit: "MWh" },
    { name: "水耗", value: resourceData.totalWater, unit: "m³" },
  ], [totalEmission, resourceData]);

  const perCapitaResourceData = useMemo(() => [
    { name: "碳排放", value: Math.round(totalEmission / STUDENT_COUNT * 100) / 100, unit: "kgCO₂" },
    { name: "能耗", value: Math.round(resourceData.totalEnergy / STUDENT_COUNT * 100) / 100, unit: "kWh" },
    { name: "水耗", value: Math.round(resourceData.totalWater / STUDENT_COUNT * 100) / 100, unit: "m³" },
  ], [totalEmission, resourceData]);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setSelectedBuilding(buildingId);
    const building = getBuildingDetail(buildingId);
    if (building) {
      setSelectedDept(building.dept);
    }
  }, []);

  const selectedBuildingData = useMemo(() => {
    if (!selectedBuilding) return null;
    return getBuildingDetail(selectedBuilding);
  }, [selectedBuilding]);

  // 左侧指标面板 - 核心KPI + 风险预警
  const leftPanel = (
    <div className="space-y-3">
      {/* 核心 KPI 组 */}
      <IndicatorGroup title="核心指标">
        <IndicatorCard
          title="年度累计排放"
          value={totalEmission}
          unit="tCO₂"
          status={quotaProgress > 80 ? "danger" : quotaProgress > 60 ? "warning" : "normal"}
          trend={-3.2}
          trendLabel="同比"
          icon={<Zap className="w-4 h-4" />}
        />
        <IndicatorCard
          title="配额使用进度"
          value={quotaProgress}
          unit="%"
          status={quotaProgress > 80 ? "danger" : quotaProgress > 60 ? "warning" : "success"}
          icon={<Target className="w-4 h-4" />}
        />
        <IndicatorCard
          title="年度配额余额"
          value={12000 - totalEmission}
          unit="tCO₂"
          status={12000 - totalEmission < 2000 ? "danger" : "normal"}
          icon={<Shield className="w-4 h-4" />}
        />
      </IndicatorGroup>

      {/* 风险预警组 */}
      <IndicatorGroup title="风险预警">
        <IndicatorCard
          title="异常建筑"
          value={anomalies.length}
          unit="栋"
          status={anomalies.length > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
        <IndicatorCard
          title="超标建筑"
          value={anomalies.filter((a: { severity: string }) => a.severity === "阻断").length}
          unit="栋"
          status={anomalies.some((a: { severity: string }) => a.severity === "阻断") ? "danger" : "success"}
        />
        <IndicatorCard
          title="预测超配风险"
          value="中"
          status="warning"
          icon={<TrendingDown className="w-4 h-4" />}
        />
      </IndicatorGroup>
    </div>
  );

  // 右侧指标面板 - 建筑排名 + 选中建筑详情 + 资源消耗饼图
  const rightPanel = (
    <div className="space-y-3">
      {/* 建筑排名 TOP 5 */}
      <IndicatorGroup title="排放 TOP 5">
        {rankings.slice(0, 5).map((item, index) => (
          <div
            key={item.buildingName}
            onClick={() => {
              const building = building3DData.find(b => b.name === item.buildingName);
              if (building) handleBuildingClick(building.id);
            }}
            className="flex items-center justify-between p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30 hover:border-cyan-500/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                index === 0 ? "bg-red-500/20 text-red-400" :
                index === 1 ? "bg-orange-500/20 text-orange-400" :
                index === 2 ? "bg-yellow-500/20 text-yellow-400" :
                "bg-gray-700/50 text-gray-400"
              }`}>
                {index + 1}
              </span>
              <div>
                <span className="text-gray-300 text-sm group-hover:text-cyan-300 transition-colors">{item.buildingName}</span>
                <div className="text-gray-500 text-[10px]">{index === 0 ? "化学学院" : index === 1 ? "机械学院" : index === 2 ? "计算机学院" : index === 3 ? "图书馆" : "餐饮中心"}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-cyan-400 text-sm font-mono">{item.emission}</div>
              <div className="text-gray-500 text-[10px]">tCO₂</div>
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 选中建筑详情 */}
      {selectedBuildingData ? (
        <IndicatorGroup title="选中建筑">
          <IndicatorCard
            title={selectedBuildingData.name}
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status === "danger" ? "danger" : selectedBuildingData.status === "warning" ? "warning" : "normal"}
            trend={selectedBuildingData.trend}
            trendLabel="同比"
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">建筑面积</div>
              <div className="text-gray-300 text-xs font-mono mt-0.5">{selectedBuildingData.area.toLocaleString()} m²</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">楼层</div>
              <div className="text-gray-300 text-xs font-mono mt-0.5">{selectedBuildingData.floors} 层</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">所属院系</div>
              <div className="text-cyan-400 text-xs font-mono mt-0.5">{selectedBuildingData.dept}</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">排放强度</div>
              <div className="text-cyan-400 text-xs font-mono mt-0.5">{(selectedBuildingData.emission / selectedBuildingData.area * 1000).toFixed(1)} kg/m²</div>
            </div>
          </div>
        </IndicatorGroup>
      ) : (
        <IndicatorGroup title="提示">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/30 text-center">
            <Building2 className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">点击场景中的建筑查看详情</p>
          </div>
        </IndicatorGroup>
      )}

      {/* 资源消耗饼图 */}
      <IndicatorGroup title="资源消耗分析">
        <div className="space-y-3">
          <ResourceDonutChart
            title="全校资源消耗"
            data={totalResourceData}
            unit="tCO₂ / MWh / m³"
          />
          <ResourceDonutChart
            title="生均资源消耗"
            data={perCapitaResourceData}
            unit="kgCO₂/人 / kWh/人 / m³/人"
          />
        </div>
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
    />
  );
}