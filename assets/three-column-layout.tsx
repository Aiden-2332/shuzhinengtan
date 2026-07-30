"use client";

import { useState } from "react";
import { CampusScene25D } from "@/components/dashboard/campus-scene-25d";
import { cn } from "@/lib/utils";
import { Building2, Users, Wrench, ShieldCheck } from "lucide-react";

interface ThreeColumnLayoutProps {
  children?: React.ReactNode;
  level: "L1" | "L2" | "L3" | "L4";
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  colorMode?: "carbon" | "energy";
  year?: number;
  campus?: string;
  bottomPanel?: React.ReactNode;
  centerBottomPanel?: React.ReactNode;
}

const levelConfig = {
  L1: { label: "校领导碳控制塔", icon: Building2, color: "from-cyan-500 to-blue-600" },
  L2: { label: "院系业务视图", icon: Users, color: "from-violet-500 to-purple-600" },
  L3: { label: "后勤运营明细", icon: Wrench, color: "from-orange-500 to-amber-600" },
  L4: { label: "合规与披露", icon: ShieldCheck, color: "from-emerald-500 to-teal-600" },
};

export function ThreeColumnLayout({
  children,
  level,
  leftPanel,
  rightPanel,
  selectedBuilding,
  onBuildingClick,
  filterType,
  colorMode,
  year = 2026,
  campus = "主校区",
  bottomPanel,
  centerBottomPanel,
}: ThreeColumnLayoutProps) {
  const config = levelConfig[level];
  const [showWatermark] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#081028]">
      <div className="flex flex-shrink-0 items-center justify-between border-b border-cyan-500/10 bg-[#0a1636]/80 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br", config.color)}>
              <config.icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">{config.label}</h1>
              <p className="text-[10px] text-gray-500">碳排放全景驾驶舱</p>
            </div>
          </div>
          <div className="h-6 w-px bg-gray-700/50" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">年度</span>
            <span className="font-medium text-cyan-400">{year}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">校区</span>
            <span className="font-medium text-cyan-400">{campus}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {filterType && (
            <span className="border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-xs text-cyan-400">
              筛选: {filterType}
            </span>
          )}
          <div className="flex items-center gap-1 border border-gray-700/30 bg-gray-800/50 px-2 py-1">
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
            <span className="text-xs text-gray-400">数据实时</span>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-[20%] min-w-[220px] overflow-x-hidden overflow-y-auto border-r border-cyan-500/10 bg-[#0c1838]/60">
          <div className="p-3">{leftPanel}</div>
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            {children || (
              <CampusScene25D
                level={level}
                selectedBuilding={selectedBuilding ?? null}
                onBuildingClick={onBuildingClick}
                filterType={filterType ?? null}
                colorMode={colorMode ?? "carbon"}
              />
            )}
          </div>
          {centerBottomPanel && (
            <div className="flex-shrink-0 border-t border-cyan-500/10 bg-[#0a1636]/90 px-3 py-2">
              {centerBottomPanel}
            </div>
          )}
        </main>
        <aside className="w-[24%] min-w-[260px] overflow-x-hidden overflow-y-auto border-l border-cyan-500/10 bg-[#0c1838]/60">
          <div className="p-3">{rightPanel}</div>
        </aside>
      </div>

      {bottomPanel && (
        <div className="flex-shrink-0 border-t border-cyan-500/10 bg-[#0a1636]/90 px-4 py-2">
          {bottomPanel}
        </div>
      )}
      {showWatermark && (
        <div className="pointer-events-none fixed bottom-2 right-4 z-50 select-none text-xs text-[#94A3B8] opacity-60">
          Demo 模拟数据，不用于申报
        </div>
      )}
    </div>
  );
}
