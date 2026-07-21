"use client";

import { useState, useEffect, useRef } from "react";
import { CampusScene3D } from "@/components/3d/campus-scene";
import { cn } from "@/lib/utils";
import { Building2, Users, Wrench, ShieldCheck } from "lucide-react";

interface ThreeColumnLayoutProps {
  level: "L1" | "L2" | "L3" | "L4";
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  year?: number;
  campus?: string;
}

const levelConfig = {
  L1: {
    label: "校领导碳控制塔",
    icon: Building2,
    color: "from-cyan-500 to-blue-600",
    hoverColor: "hover:from-cyan-400 hover:to-blue-500",
  },
  L2: {
    label: "院系业务视图",
    icon: Users,
    color: "from-violet-500 to-purple-600",
    hoverColor: "hover:from-violet-400 hover:to-purple-500",
  },
  L3: {
    label: "后勤运营明细",
    icon: Wrench,
    color: "from-orange-500 to-amber-600",
    hoverColor: "hover:from-orange-400 hover:to-amber-500",
  },
  L4: {
    label: "合规与披露",
    icon: ShieldCheck,
    color: "from-emerald-500 to-teal-600",
    hoverColor: "hover:from-emerald-400 hover:to-teal-500",
  },
};

export function ThreeColumnLayout({
  level,
  leftPanel,
  rightPanel,
  selectedBuilding,
  onBuildingClick,
  filterType,
  year = 2026,
  campus = "主校区",
}: ThreeColumnLayoutProps) {
  const config = levelConfig[level];
  const [showWatermark, setShowWatermark] = useState(true);

  return (
    <div className="flex flex-col h-screen bg-[#081028] overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between px-6 py-3 bg-[#0a1636]/80 border-b border-cyan-500/10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center", config.color)}>
              <config.icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm">{config.label}</h1>
              <p className="text-gray-500 text-[10px]">碳排放全景驾驶舱</p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-700/50" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">年度</span>
            <span className="text-cyan-400 font-medium">{year}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">校区</span>
            <span className="text-cyan-400 font-medium">{campus}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {filterType && (
            <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs">
              筛选: {filterType === "teaching" ? "教学楼" : filterType === "lab" ? "实验室" : filterType === "dorm" ? "宿舍" : filterType === "dining" ? "食堂" : filterType === "admin" ? "行政楼" : filterType === "gym" ? "体育馆" : filterType === "library" ? "图书馆" : filterType === "solar" ? "光伏" : filterType}
            </span>
          )}
          <div className="flex items-center gap-1 px-2 py-1 rounded bg-gray-800/50 border border-gray-700/30">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-gray-400 text-xs">数据实时</span>
          </div>
        </div>
      </div>

      {/* 主体内容区：左面板 + 3D场景 + 右面板 */}
      <div className="flex-1 flex min-h-0">
        {/* 左侧指标面板 */}
        <div className="w-[20%] min-w-[220px] bg-[#0c1838]/60 border-r border-cyan-500/10 overflow-y-auto overflow-x-hidden">
          <div className="p-3">
            {leftPanel}
          </div>
        </div>

        {/* 中间 3D 场景 */}
        <div className="flex-1 relative">
          <CampusScene3D
            level={level}
            selectedBuilding={selectedBuilding || null}
            onBuildingClick={onBuildingClick || (() => {})}
          />
        </div>

        {/* 右侧指标面板 */}
        <div className="w-[24%] min-w-[260px] bg-[#0c1838]/60 border-l border-cyan-500/10 overflow-y-auto overflow-x-hidden">
          <div className="p-3">
            {rightPanel}
          </div>
        </div>
      </div>

      {/* 水印 */}
      {showWatermark && (
        <div className="fixed bottom-2 right-4 text-[#94A3B8] text-xs opacity-60 select-none pointer-events-none z-50">
          Demo 模拟数据，不用于申报
        </div>
      )}
    </div>
  );
}