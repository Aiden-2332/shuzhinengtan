"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getAnomalyBuildings, getFloorEmissionData } from "@/data/mock-data";
import { AlertTriangle, Zap, Thermometer, Clock, Wrench, CheckCircle } from "lucide-react";

export default function L3OperationsView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const building3DData = useMemo(() => getBuilding3DData(), []);
  const anomalyBuildings = useMemo(() => getAnomalyBuildings(), []);

  // 获取异常建筑详情
  const anomalyDetails = useMemo(() => {
    return anomalyBuildings.map((b) => ({
      ...b,
      anomalyType: b.status === "danger" ? "夜间空调未关闭" : "负荷异常偏高",
      anomalyTime: "22:00 - 06:00",
      estimatedWaste: Math.round(b.emission * 0.15),
    }));
  }, [anomalyBuildings]);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setSelectedBuilding(buildingId);
  }, []);

  const selectedBuildingData = useMemo(() => {
    if (!selectedBuilding) return null;
    return getBuildingDetail(selectedBuilding);
  }, [selectedBuilding]);

  const floorData = useMemo(() => {
    if (!selectedBuilding) return [];
    return getFloorEmissionData(selectedBuilding);
  }, [selectedBuilding]);

  // 左侧指标面板
  const leftPanel = (
    <div className="space-y-4">
      {/* 异常监控 */}
      <IndicatorGroup title="异常监控">
        <IndicatorCard
          title="异常建筑"
          value={anomalyBuildings.length}
          unit="栋"
          status={anomalyBuildings.length > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="w-4 h-4" />}
          onClick={() => setFilterType(null)}
        />
        <IndicatorCard
          title="超标建筑"
          value={anomalyBuildings.filter((b) => b.status === "danger").length}
          unit="栋"
          status={anomalyBuildings.some((b) => b.status === "danger") ? "danger" : "success"}
          icon={<Zap className="w-4 h-4" />}
        />
        <IndicatorCard
          title="今日告警"
          value={12}
          unit="条"
          status="warning"
          icon={<Clock className="w-4 h-4" />}
        />
      </IndicatorGroup>

      {/* 异常楼栋列表 */}
      <IndicatorGroup title="异常楼栋">
        {anomalyDetails.map((item) => (
          <div
            key={item.id}
            onClick={() => handleBuildingClick(item.id)}
            className={`p-2 rounded border transition-all cursor-pointer ${
              selectedBuilding === item.id
                ? "bg-red-500/20 border-red-500/50"
                : "bg-gray-800/40 border-gray-700/30 hover:border-red-500/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300 text-sm font-medium">{item.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                item.status === "danger" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
              }`}>
                {item.status === "danger" ? "超标" : "警告"}
              </span>
            </div>
            <div className="text-xs text-gray-400">{item.anomalyType}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{item.anomalyTime}</span>
              <span className="text-xs text-orange-400">浪费 ~{item.estimatedWaste} tCO₂</span>
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 选中建筑楼层数据 */}
      {selectedBuildingData && floorData.length > 0 && (
        <IndicatorGroup title={`${selectedBuildingData.name} 楼层排放`}>
          <IndicatorCard
            title="总排放"
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status}
            trend={selectedBuildingData.trend}
            trendLabel="同比"
          />
          <div className="space-y-1">
            {floorData.map((floor) => (
              <div key={floor.floor} className="flex items-center justify-between p-1.5 rounded bg-gray-800/30 text-xs">
                <span className="text-gray-400">{floor.floor}F · {floor.usage}</span>
                <span className="text-cyan-400 font-mono">{floor.emission} tCO₂</span>
              </div>
            ))}
          </div>
        </IndicatorGroup>
      )}

      {/* 设备状态 */}
      <IndicatorGroup title="设备状态">
        <IndicatorCard
          title="空调系统"
          value="正常"
          status="success"
          icon={<Thermometer className="w-4 h-4" />}
        />
        <IndicatorCard
          title="照明系统"
          value="正常"
          status="success"
          icon={<Zap className="w-4 h-4" />}
        />
        <IndicatorCard
          title="待维修"
          value={2}
          unit="台"
          status="warning"
          icon={<Wrench className="w-4 h-4" />}
        />
      </IndicatorGroup>

      {/* 处置建议 */}
      <IndicatorGroup title="处置建议">
        <div className="p-3 rounded bg-gray-800/40 border border-gray-700/30 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">建议关闭夜间空调，预计节约 15% 能耗</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">实验楼建议优化通风系统运行策略</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
            <span className="text-gray-300">宿舍区建议安装智能控电系统</span>
          </div>
        </div>
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L3"
      leftPanel={leftPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
      filterType={filterType}
    />
  );
}
