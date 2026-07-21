"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getKPIData, getTrendData, getBuildingRanking, getAnomalies, getBuilding3DData, getBuildingDetail } from "@/data/mock-data";
import { AlertTriangle, Zap, TrendingDown, Building2, Target, Shield } from "lucide-react";

export default function L1Dashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const kpiData = useMemo(() => getKPIData(2026), []);
  const trendData = useMemo(() => getTrendData(2026), []);
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

  // 左侧指标面板
  const leftPanel = (
    <div className="space-y-4">
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

      {/* 建筑排名组 */}
      <IndicatorGroup title="排放 TOP 5">
        {rankings.slice(0, 5).map((item, index) => (
          <div
            key={item.buildingName}
            className="flex items-center justify-between p-2 rounded bg-gray-800/40 border border-gray-700/30 hover:border-cyan-500/30 transition-all cursor-pointer"
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
              <span className="text-gray-300 text-sm">{item.buildingName}</span>
            </div>
            <div className="text-right">
              <span className="text-cyan-400 text-sm font-mono">{item.emission}</span>
              <span className="text-gray-500 text-xs ml-1">tCO₂</span>
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 选中建筑详情 */}
      {selectedBuildingData && (
        <IndicatorGroup title="选中建筑">
          <IndicatorCard
            title={selectedBuildingData.name}
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status === "danger" ? "danger" : selectedBuildingData.status === "warning" ? "warning" : "normal"}
            trend={selectedBuildingData.trend}
            trendLabel="同比"
          />
          <div className="p-2 rounded bg-gray-800/40 border border-gray-700/30 text-xs">
            <div className="flex justify-between text-gray-400 mb-1">
              <span>所属院系</span>
              <span className="text-gray-300">{selectedBuildingData.dept}</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-1">
              <span>建筑面积</span>
              <span className="text-gray-300">{selectedBuildingData.area.toLocaleString()} m²</span>
            </div>
            <div className="flex justify-between text-gray-400 mb-1">
              <span>楼层数</span>
              <span className="text-gray-300">{selectedBuildingData.floors} 层</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>排放强度</span>
              <span className="text-cyan-400">{(selectedBuildingData.emission / selectedBuildingData.area * 1000).toFixed(2)} kg/m²</span>
            </div>
          </div>
        </IndicatorGroup>
      )}
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L1"
      leftPanel={leftPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
    />
  );
}
