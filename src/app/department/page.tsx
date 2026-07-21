"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getDepartmentRanking } from "@/data/mock-data";
import { Building2, Users, TrendingDown, Target, Award, AlertTriangle } from "lucide-react";

export default function L2DepartmentView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const building3DData = useMemo(() => getBuilding3DData(), []);
  const deptRanking = useMemo(() => getDepartmentRanking(2026), []);

  // 按院系分组建筑
  const deptBuildings = useMemo(() => {
    const grouped: Record<string, typeof building3DData> = {};
    building3DData.forEach((b) => {
      if (!grouped[b.dept]) grouped[b.dept] = [];
      grouped[b.dept].push(b);
    });
    return grouped;
  }, [building3DData]);

  // 计算各院系汇总数据
  const deptSummary = useMemo(() => {
    return Object.entries(deptBuildings).map(([dept, buildings]) => ({
      dept,
      totalEmission: buildings.reduce((sum, b) => sum + b.emission, 0),
      buildingCount: buildings.length,
      avgTrend: buildings.reduce((sum, b) => sum + b.trend, 0) / buildings.length,
      status: buildings.some((b) => b.status === "danger") ? "danger" : buildings.some((b) => b.status === "warning") ? "warning" : "normal",
    }));
  }, [deptBuildings]);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setSelectedBuilding(buildingId);
    const building = getBuildingDetail(buildingId);
    if (building) {
      setSelectedDept(building.dept);
    }
  }, []);

  const handleDeptClick = useCallback((dept: string) => {
    setSelectedDept(dept);
    setSelectedBuilding(null);
    // 筛选该院系建筑类型
    const typeMap: Record<string, string> = {
      "计算机学院": "teaching",
      "机械学院": "teaching",
      "化学学院": "lab",
      "文学院": "teaching",
      "宿舍管理中心": "dorm",
      "餐饮服务中心": "dining",
      "行政部门": "admin",
      "体育部": "gym",
      "图书馆": "library",
      "后勤能源": "solar",
    };
    setFilterType(typeMap[dept] || null);
  }, []);

  const selectedBuildingData = useMemo(() => {
    if (!selectedBuilding) return null;
    return getBuildingDetail(selectedBuilding);
  }, [selectedBuilding]);

  // 左侧指标面板
  const leftPanel = (
    <div className="space-y-4">
      {/* 院系排名 */}
      <IndicatorGroup title="院系排放排名">
        {deptSummary
          .sort((a, b) => b.totalEmission - a.totalEmission)
          .slice(0, 6)
          .map((item, index) => (
            <div
              key={item.dept}
              onClick={() => handleDeptClick(item.dept)}
              className={`flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                selectedDept === item.dept
                  ? "bg-cyan-500/20 border-cyan-500/50"
                  : "bg-gray-800/40 border-gray-700/30 hover:border-cyan-500/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  index === 0 ? "bg-red-500/20 text-red-400" :
                  index === 1 ? "bg-orange-500/20 text-orange-400" :
                  index === 2 ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-gray-700/50 text-gray-400"
                }`}>
                  {index + 1}
                </span>
                <span className="text-gray-300 text-sm">{item.dept}</span>
              </div>
              <div className="text-right">
                <span className="text-cyan-400 text-sm font-mono">{item.totalEmission}</span>
                <span className="text-gray-500 text-xs ml-1">tCO₂</span>
              </div>
            </div>
          ))}
      </IndicatorGroup>

      {/* 选中院系统计 */}
      {selectedDept && (
        <IndicatorGroup title={`${selectedDept} 统计`}>
          <IndicatorCard
            title="院系总排放"
            value={deptSummary.find((d) => d.dept === selectedDept)?.totalEmission || 0}
            unit="tCO₂"
            status={(deptSummary.find((d) => d.dept === selectedDept)?.status || "normal") as "normal" | "warning" | "danger" | "success"}
          />
          <IndicatorCard
            title="建筑数量"
            value={deptSummary.find((d) => d.dept === selectedDept)?.buildingCount || 0}
            unit="栋"
            icon={<Building2 className="w-4 h-4" />}
          />
          <IndicatorCard
            title="平均同比"
            value={(deptSummary.find((d) => d.dept === selectedDept)?.avgTrend || 0).toFixed(1)}
            unit="%"
            status={(deptSummary.find((d) => d.dept === selectedDept)?.avgTrend || 0) > 0 ? "warning" : "success"}
            icon={<TrendingDown className="w-4 h-4" />}
          />
        </IndicatorGroup>
      )}

      {/* 选中建筑详情 */}
      {selectedBuildingData && (
        <IndicatorGroup title="建筑详情">
          <IndicatorCard
            title={selectedBuildingData.name}
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status === "danger" ? "danger" : selectedBuildingData.status === "warning" ? "warning" : "normal"}
            trend={selectedBuildingData.trend}
            trendLabel="同比"
          />
          <div className="p-2 rounded bg-gray-800/40 border border-gray-700/30 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-400">面积</span>
              <span className="text-gray-300">{selectedBuildingData.area.toLocaleString()} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">楼层</span>
              <span className="text-gray-300">{selectedBuildingData.floors} 层</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">强度</span>
              <span className="text-cyan-400">{(selectedBuildingData.emission / selectedBuildingData.area * 1000).toFixed(2)} kg/m²</span>
            </div>
          </div>
        </IndicatorGroup>
      )}

      {/* 节能目标 */}
      <IndicatorGroup title="年度节能目标">
        <IndicatorCard
          title="减排目标"
          value={5}
          unit="%"
          status="normal"
          icon={<Target className="w-4 h-4" />}
        />
        <IndicatorCard
          title="当前完成"
          value={3.2}
          unit="%"
          status="normal"
          trend={3.2}
        />
        <IndicatorCard
          title="节能标兵"
          value="图书馆"
          status="success"
          icon={<Award className="w-4 h-4" />}
        />
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L2"
      leftPanel={leftPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
      filterType={filterType}
    />
  );
}
