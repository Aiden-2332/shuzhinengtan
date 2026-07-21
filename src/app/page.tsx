"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getKPIData, getTrendData, getBuildingRanking, getAnomalies, getBuilding3DData, getBuildingDetail } from "@/data/mock-data";
import { AlertTriangle, Zap, TrendingDown, Building2, Target, Shield, Trophy, BarChart3 } from "lucide-react";

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

      {/* 双碳目标 */}
      <IndicatorGroup title="双碳目标">
        <div className="p-3 rounded-lg bg-gray-900/60 border border-cyan-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">碳达峰完成率</span>
            <span className="text-cyan-400 text-xs font-mono">78%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-cyan-500 to-green-400" />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-400 text-xs">碳中和完成率</span>
            <span className="text-green-400 text-xs font-mono">42%</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
            <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />
          </div>
        </div>
      </IndicatorGroup>
    </div>
  );

  // 右侧指标面板 - 建筑排名 + 选中建筑详情 + 对标排名
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

      {/* 对标排名 */}
      <IndicatorGroup title="同区域高校对标">
        <div className="space-y-1.5">
          {[
            { name: "北科大", emission: totalEmission, rank: 1, active: true },
            { name: "北航", emission: Math.round(totalEmission * 0.92), rank: 2 },
            { name: "北理工", emission: Math.round(totalEmission * 0.88), rank: 3 },
            { name: "清华", emission: Math.round(totalEmission * 1.35), rank: 4 },
            { name: "北大", emission: Math.round(totalEmission * 1.18), rank: 5 },
          ].map((item) => (
            <div key={item.name} className={`flex items-center justify-between p-2 rounded-lg text-xs ${
              item.active ? "bg-cyan-500/10 border border-cyan-500/30" : "bg-gray-900/30 border border-gray-700/20"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold ${
                  item.rank === 1 ? "bg-cyan-500/20 text-cyan-400" : "text-gray-500"
                }`}>{item.rank}</span>
                <span className={item.active ? "text-cyan-300 font-medium" : "text-gray-400"}>{item.name}</span>
                {item.active && <span className="px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[9px]">本校</span>}
              </div>
              <span className="text-gray-400 font-mono">{item.emission.toLocaleString()} tCO₂</span>
            </div>
          ))}
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