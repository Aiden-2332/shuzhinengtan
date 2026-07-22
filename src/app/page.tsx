"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { ResourceAnalysis } from "@/components/dashboard/resource-analysis";
import { EconomicControlZone } from "@/components/dashboard/economic-control-zone";
import { getBuildingRanking, getAnomalies, getBuilding3DData, getBuildingDetail } from "@/data/mock-data";
import { AlertTriangle } from "lucide-react";

export default function L1Dashboard() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const rankings = useMemo(() => getBuildingRanking(2026), []);
  const anomalies = useMemo(() => getAnomalies(), []);
  const building3DData = useMemo(() => getBuilding3DData(), []);

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

  // 左侧指标面板 - 经济控制分区 + 风险预警
  const leftPanel = (
    <div className="space-y-3">
      {/* 经济控制分区 */}
      <EconomicControlZone />

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
        </IndicatorGroup>
    </div>
  );

  // 右侧指标面板
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
        <IndicatorGroup title="场景图例">
          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700/30">
            <p className="text-[10px] text-gray-400 mb-2.5">建筑颜色 — 碳排放强度</p>
            <div className="space-y-1.5">
              {[
                { label: "高排放 (&gt;50 kg/m²)", color: "bg-red-500", bar: "w-full" },
                { label: "中高排放 (30-50)", color: "bg-orange-400", bar: "w-3/4" },
                { label: "中等排放 (15-30)", color: "bg-yellow-400", bar: "w-1/2" },
                { label: "低排放 (&lt;15 kg/m²)", color: "bg-green-400", bar: "w-1/4" },
                { label: "新能源/负排放", color: "bg-cyan-400", bar: "w-1/5" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                  <span className="text-[10px] text-gray-400 truncate">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 pt-2 border-t border-gray-700/30">
              <p className="text-[10px] text-gray-500">🖱 点击建筑查看详情</p>
            </div>
          </div>
        </IndicatorGroup>
      )}

      {/* 资源消耗分析 */}
      <IndicatorGroup title="资源消耗分析">
        <ResourceAnalysis buildings={building3DData} />
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