"use client";

import { useState, useCallback } from "react";
import { CampusScene3D } from "@/components/3d/campus-scene";
import { BottomActionBar } from "@/components/dashboard/bottom-action-bar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ThreeColumnLayoutProps {
  level: "L1" | "L2" | "L3" | "L4";
  leftPanel: React.ReactNode;
  children?: React.ReactNode;
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
}

export function ThreeColumnLayout({
  level,
  leftPanel,
  children,
  selectedBuilding,
  onBuildingClick,
  filterType,
}: ThreeColumnLayoutProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  const handleLevelSwitch = useCallback(
    (targetLevel: "L1" | "L2" | "L3" | "L4") => {
      const routes = {
        L1: "/",
        L2: "/department",
        L3: "/operations",
        L4: "/compliance",
      };
      router.push(routes[targetLevel]);
    },
    [router]
  );

  const handleAction = useCallback((action: string) => {
    switch (action) {
      case "refresh":
        window.location.reload();
        break;
      case "export":
        alert("导出报告功能（演示）");
        break;
      case "settings":
        alert("设置功能（演示）");
        break;
    }
  }, []);

  return (
    <div className={cn("flex flex-col h-screen bg-[#081028] overflow-hidden", isFullscreen && "fixed inset-0 z-50")}>
      {/* 主内容区：左侧指标 + 中间3D场景 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧指标面板 - 26% */}
        <div className="w-[26%] min-w-[300px] max-w-[400px] border-r border-cyan-500/20 bg-gray-900/30 backdrop-blur-sm overflow-y-auto p-4">
          {leftPanel}
        </div>

        {/* 中间 3D 场景 - 64% */}
        <div className="flex-1 relative">
          <CampusScene3D
            level={level}
            selectedBuilding={selectedBuilding}
            onBuildingClick={onBuildingClick}
            filterType={filterType}
          />

          {/* 场景顶部标题 */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div>
              <h2 className="text-cyan-400 text-lg font-bold">
                {level === "L1" && "虚拟校园碳排放全景"}
                {level === "L2" && "院系建筑排放分布"}
                {level === "L3" && "楼栋级排放热力图"}
                {level === "L4" && "数据溯源与核查视图"}
              </h2>
              <p className="text-gray-500 text-xs mt-1">
                {level === "L1" && "点击建筑查看详情 · 拖拽旋转视角 · 滚轮缩放"}
                {level === "L2" && "按院系筛选 · 点击建筑查看明细"}
                {level === "L3" && "异常楼栋红色闪烁 · 点击查看小时负荷"}
                {level === "L4" && "数据锁定状态 · 核查追溯链条"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs">
                {level} 模式
              </span>
            </div>
          </div>

          {/* 图例 */}
          <div className="absolute bottom-4 left-4 bg-gray-900/80 border border-gray-700/50 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-gray-400 text-xs mb-2">排放热力图例</div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span className="text-gray-300">减排</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-500" />
                <span className="text-gray-300">低</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-purple-500" />
                <span className="text-gray-300">中</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-gray-300">高</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span className="text-gray-300">超标</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部操作栏 - 80px */}
      <BottomActionBar
        level={level}
        onLevelSwitch={handleLevelSwitch}
        onAction={handleAction}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />
    </div>
  );
}
