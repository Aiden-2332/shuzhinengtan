"use client";

import { cn } from "@/lib/utils";
import {
  Layers,
  Building2,
  ClipboardList,
  FileText,
  Download,
  RefreshCw,
  Settings,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

interface BottomActionBarProps {
  level: "L1" | "L2" | "L3" | "L4";
  onLevelSwitch?: (level: "L1" | "L2" | "L3" | "L4") => void;
  onAction?: (action: string) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export function BottomActionBar({
  level,
  onLevelSwitch,
  onAction,
  isFullscreen = false,
  onToggleFullscreen,
}: BottomActionBarProps) {
  const levelButtons = [
    { key: "L1" as const, label: "校领导碳控制塔", icon: Layers },
    { key: "L2" as const, label: "院系业务视图", icon: Building2 },
    { key: "L3" as const, label: "后勤运营明细", icon: ClipboardList },
    { key: "L4" as const, label: "合规与披露", icon: FileText },
  ];

  const commonActions = [
    { key: "refresh", label: "刷新数据", icon: RefreshCw },
    { key: "export", label: "导出报告", icon: Download },
    { key: "settings", label: "设置", icon: Settings },
  ];

  return (
    <div className="h-[80px] bg-gray-900/80 border-t border-cyan-500/20 backdrop-blur-md flex items-center justify-between px-4">
      {/* 左侧：层级切换按钮 */}
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-xs mr-2">层级切换</span>
        {levelButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = level === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => onLevelSwitch?.(btn.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200",
                isActive
                  ? "bg-cyan-500/20 border-cyan-500/60 text-cyan-400 shadow-[0_0_15px_rgba(52,136,255,0.3)]"
                  : "bg-gray-800/40 border-gray-700/50 text-gray-400 hover:bg-gray-700/40 hover:border-gray-600"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* 中间：层级说明 */}
      <div className="flex items-center gap-2">
        <div className="text-center">
          <div className="text-cyan-400 text-sm font-bold">
            {level === "L1" && "宏观总览 · 战略决策"}
            {level === "L2" && "院系聚焦 · 业务管理"}
            {level === "L3" && "运维明细 · 异常处置"}
            {level === "L4" && "合规溯源 · 数据锁定"}
          </div>
          <div className="text-gray-500 text-xs mt-0.5">
            {level === "L1" && "全校碳排放全景 · 年度配额进度 · 风险预警"}
            {level === "L2" && "院系级排放分析 · 排名对比 · 节能目标"}
            {level === "L3" && "楼栋级明细 · 小时负荷 · 异常定位"}
            {level === "L4" && "数据锁定 · 核查追溯 · 报告生成"}
          </div>
        </div>
      </div>

      {/* 右侧：通用操作按钮 */}
      <div className="flex items-center gap-2">
        {commonActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.key}
              onClick={() => onAction?.(action.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-700/50 bg-gray-800/40 text-gray-400 hover:bg-gray-700/40 hover:text-gray-300 transition-all duration-200"
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs">{action.label}</span>
            </button>
          );
        })}
        <button
          onClick={onToggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-all duration-200"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          <span className="text-xs">{isFullscreen ? "退出全屏" : "全屏"}</span>
        </button>
      </div>
    </div>
  );
}
