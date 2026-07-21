"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getDepartmentRanking } from "@/data/mock-data";
import { Building2, Users, TrendingDown, Target, Award, AlertTriangle, BarChart3, Flame } from "lucide-react";

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

  // 左侧指标面板 - 院系排名 + 选中院系统计
  const leftPanel = (
    <div className="space-y-3">
      {/* 院系排名 */}
      <IndicatorGroup title="院系排放排名">
        {deptSummary
          .sort((a, b) => b.totalEmission - a.totalEmission)
          .slice(0, 6)
          .map((item, index) => (
            <div
              key={item.dept}
              onClick={() => handleDeptClick(item.dept)}
              className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${
                selectedDept === item.dept
                  ? "bg-violet-500/20 border-violet-500/50"
                  : "bg-gray-900/50 border-gray-700/30 hover:border-violet-500/30"
              }`}
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
                  <span className="text-gray-300 text-sm">{item.dept}</span>
                  <div className="text-gray-500 text-[10px]">{item.buildingCount} 栋建筑</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-violet-400 text-sm font-mono">{item.totalEmission}</div>
                <div className="text-gray-500 text-[10px]">tCO₂</div>
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
          <div className="grid grid-cols-2 gap-2">
            <IndicatorCard
              title="建筑数量"
              value={deptSummary.find((d) => d.dept === selectedDept)?.buildingCount || 0}
              unit="栋"
              compact
              icon={<Building2 className="w-4 h-4" />}
            />
            <IndicatorCard
              title="平均同比"
              value={(deptSummary.find((d) => d.dept === selectedDept)?.avgTrend || 0).toFixed(1)}
              unit="%"
              compact
              status={(deptSummary.find((d) => d.dept === selectedDept)?.avgTrend || 0) > 0 ? "warning" : "success"}
              icon={<TrendingDown className="w-4 h-4" />}
            />
          </div>
        </IndicatorGroup>
      )}
    </div>
  );

  // 右侧指标面板 - 建筑详情 + 节能目标 + 横向对比
  const rightPanel = (
    <div className="space-y-3">
      {/* 选中建筑详情 */}
      {selectedBuildingData ? (
        <IndicatorGroup title="建筑详情">
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
              <div className="text-gray-500 text-[10px]">建筑类型</div>
              <div className="text-violet-400 text-xs font-mono mt-0.5">{selectedBuildingData.type === "teaching" ? "教学楼" : selectedBuildingData.type === "lab" ? "实验楼" : selectedBuildingData.type === "dorm" ? "宿舍" : selectedBuildingData.type === "dining" ? "食堂" : selectedBuildingData.type === "admin" ? "行政楼" : selectedBuildingData.type === "gym" ? "体育馆" : selectedBuildingData.type === "library" ? "图书馆" : selectedBuildingData.type === "solar" ? "光伏" : "综合"}</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">排放强度</div>
              <div className="text-violet-400 text-xs font-mono mt-0.5">{(selectedBuildingData.emission / selectedBuildingData.area * 1000).toFixed(1)} kg/m²</div>
            </div>
          </div>
        </IndicatorGroup>
      ) : (
        <IndicatorGroup title="提示">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/30 text-center">
            <Flame className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">点击左侧院系或场景中的建筑查看详情</p>
          </div>
        </IndicatorGroup>
      )}

      {/* 节能目标 */}
      <IndicatorGroup title="年度节能目标">
        <div className="p-3 rounded-lg bg-gray-900/60 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">减排目标</span>
            <span className="text-violet-400 text-xs font-mono">5%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-violet-500 to-purple-400" />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-gray-500 text-[10px]">当前完成 3.2%</span>
            <span className="text-violet-400 text-[10px]">64%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
          <Award className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div>
            <span className="text-gray-300 text-xs">节能标兵</span>
            <span className="text-green-400 text-xs ml-2">图书馆</span>
          </div>
        </div>
      </IndicatorGroup>

      {/* 同类型院系横向对比 */}
      <IndicatorGroup title="同类型院系对比">
        <div className="space-y-1.5">
          {[
            { name: "计算机学院", emission: 2450, rank: 1, active: selectedDept === "计算机学院" },
            { name: "机械学院", emission: 2180, rank: 2, active: selectedDept === "机械学院" },
            { name: "化学学院", emission: 1950, rank: 3, active: selectedDept === "化学学院" },
            { name: "文学院", emission: 1250, rank: 4, active: selectedDept === "文学院" },
          ].map((item) => (
            <div
              key={item.name}
              onClick={() => handleDeptClick(item.name)}
              className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                item.active
                  ? "bg-violet-500/10 border border-violet-500/30"
                  : "bg-gray-900/30 border border-gray-700/20 hover:border-violet-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold bg-gray-800 text-gray-400">{item.rank}</span>
                <span className={item.active ? "text-violet-300 font-medium" : "text-gray-400"}>{item.name}</span>
              </div>
              <span className="text-gray-400 font-mono">{item.emission} tCO₂</span>
            </div>
          ))}
        </div>
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L2"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
      filterType={filterType}
    />
  );
}