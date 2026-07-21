"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getAnomalyBuildings, getFloorEmissionData } from "@/data/mock-data";
import { AlertTriangle, Zap, Thermometer, Clock, Wrench, CheckCircle, BarChart3, Activity } from "lucide-react";

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

  // 左侧指标面板 - 异常监控 + 异常楼栋
  const leftPanel = (
    <div className="space-y-3">
      {/* 异常监控 */}
      <IndicatorGroup title="异常监控">
        <div className="grid grid-cols-2 gap-2">
          <IndicatorCard
            title="异常建筑"
            value={anomalyBuildings.length}
            unit="栋"
            status={anomalyBuildings.length > 0 ? "warning" : "success"}
            icon={<AlertTriangle className="w-4 h-4" />}
            onClick={() => setFilterType(null)}
          />
          <IndicatorCard
            title="今日告警"
            value={12}
            unit="条"
            status="warning"
            icon={<Clock className="w-4 h-4" />}
            compact
          />
        </div>
        <IndicatorCard
          title="超标建筑"
          value={anomalyBuildings.filter((b) => b.status === "danger").length}
          unit="栋"
          status={anomalyBuildings.some((b) => b.status === "danger") ? "danger" : "success"}
          icon={<Zap className="w-4 h-4" />}
        />
      </IndicatorGroup>

      {/* 异常楼栋列表 */}
      <IndicatorGroup title="异常楼栋">
        {anomalyDetails.map((item) => (
          <div
            key={item.id}
            onClick={() => handleBuildingClick(item.id)}
            className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
              selectedBuilding === item.id
                ? "bg-red-500/20 border-red-500/50"
                : "bg-gray-900/50 border-gray-700/30 hover:border-red-500/30"
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
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">{item.anomalyType}</span>
              <span className="text-gray-600">·</span>
              <span className="text-gray-500">{item.anomalyTime}</span>
            </div>
            <div className="text-xs text-orange-400 mt-1">
              预估浪费 ~{item.estimatedWaste} tCO₂
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 设备状态 */}
      <IndicatorGroup title="设备状态">
        <div className="grid grid-cols-2 gap-2">
          <IndicatorCard
            title="空调系统"
            value="正常"
            status="success"
            compact
            icon={<Thermometer className="w-4 h-4" />}
          />
          <IndicatorCard
            title="照明系统"
            value="正常"
            status="success"
            compact
            icon={<Zap className="w-4 h-4" />}
          />
        </div>
        <IndicatorCard
          title="待维修设备"
          value={2}
          unit="台"
          status="warning"
          icon={<Wrench className="w-4 h-4" />}
        />
      </IndicatorGroup>
    </div>
  );

  // 右侧指标面板 - 楼层数据 + 处置建议 + 实时能耗
  const rightPanel = (
    <div className="space-y-3">
      {/* 实时能耗概览 */}
      <IndicatorGroup title="实时能耗概览">
        <div className="p-3 rounded-lg bg-gray-900/60 border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">今日用电</span>
            <span className="text-orange-400 text-sm font-mono">12,580 kWh</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-orange-500 to-amber-400" />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-gray-500 text-[10px]">同比昨日 +3.2%</span>
            <span className="text-amber-400 text-[10px]">72% 峰值</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
            <div className="text-gray-500 text-[10px]">天然气</div>
            <div className="text-orange-400 text-xs font-mono mt-0.5">2,340 m³</div>
          </div>
          <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
            <div className="text-gray-500 text-[10px]">热力</div>
            <div className="text-orange-400 text-xs font-mono mt-0.5">8,560 MJ</div>
          </div>
        </div>
      </IndicatorGroup>

      {/* 选中建筑楼层数据 */}
      {selectedBuildingData && floorData.length > 0 ? (
        <IndicatorGroup title={`${selectedBuildingData.name} 楼层排放`}>
          <IndicatorCard
            title="总排放"
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status}
            trend={selectedBuildingData.trend}
            trendLabel="同比"
          />
          <div className="space-y-1 mt-2">
            {floorData.slice(0, 6).map((floor) => (
              <div key={floor.floor} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-700/20 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-gray-800 flex items-center justify-center text-gray-400 font-mono">{floor.floor}F</span>
                  <span className="text-gray-400">{floor.usage}</span>
                </div>
                <span className="text-orange-400 font-mono">{floor.emission} tCO₂</span>
              </div>
            ))}
            {floorData.length > 6 && (
              <div className="text-center text-gray-500 text-[10px]">+{floorData.length - 6} 层</div>
            )}
          </div>
        </IndicatorGroup>
      ) : (
        <IndicatorGroup title="提示">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/30 text-center">
            <Activity className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">点击场景中或左侧异常楼栋查看楼层数据</p>
          </div>
        </IndicatorGroup>
      )}

      {/* 处置建议 */}
      <IndicatorGroup title="处置建议">
        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-300 text-xs">关闭夜间空调</span>
              <span className="text-gray-500 text-[10px] block">预计节约 15% 能耗</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-300 text-xs">优化通风系统</span>
              <span className="text-gray-500 text-[10px] block">实验楼建议优化运行策略</span>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-300 text-xs">智能控电系统</span>
              <span className="text-gray-500 text-[10px] block">宿舍区建议安装</span>
            </div>
          </div>
        </div>
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L3"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
      filterType={filterType}
    />
  );
}