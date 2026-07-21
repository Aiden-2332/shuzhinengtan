"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndicatorCardProps {
  title: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  status?: "normal" | "warning" | "danger" | "success";
  icon?: React.ReactNode;
  compact?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export function IndicatorCard({
  title,
  value,
  unit,
  trend,
  trendLabel,
  status = "normal",
  icon,
  compact = false,
  onClick,
  active = false,
}: IndicatorCardProps) {
  const statusColors = useMemo(() => {
    switch (status) {
      case "success":
        return { border: "border-green-500/50", glow: "shadow-[0_0_15px_rgba(54,217,104,0.3)]", text: "text-green-400" };
      case "warning":
        return { border: "border-orange-500/50", glow: "shadow-[0_0_15px_rgba(255,123,37,0.3)]", text: "text-orange-400" };
      case "danger":
        return { border: "border-red-500/50", glow: "shadow-[0_0_15px_rgba(239,68,68,0.3)]", text: "text-red-400" };
      default:
        return { border: "border-cyan-500/30", glow: "shadow-[0_0_15px_rgba(52,136,255,0.2)]", text: "text-cyan-400" };
    }
  }, [status]);

  const trendIcon = trend !== undefined ? (
    trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3" /> : <Minus className="w-3 h-3" />
  ) : null;

  const trendColor = trend !== undefined ? (trend > 0 ? "text-red-400" : trend < 0 ? "text-green-400" : "text-gray-400") : "";

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-lg border bg-gray-900/60 backdrop-blur-sm transition-all duration-200",
        statusColors.border,
        statusColors.glow,
        onClick && "cursor-pointer hover:bg-gray-800/60 hover:scale-[1.02]",
        active && "ring-2 ring-cyan-400/60",
        compact ? "p-2" : "p-3"
      )}
    >
      {/* 标题 */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-gray-400 text-xs truncate">{title}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>

      {/* 数值 */}
      <div className="flex items-baseline gap-1">
        <span className={cn("font-bold font-mono", compact ? "text-lg" : "text-xl", statusColors.text)}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-gray-500 text-xs">{unit}</span>}
      </div>

      {/* 趋势 */}
      {trend !== undefined && (
        <div className={cn("flex items-center gap-1 mt-1 text-xs", trendColor)}>
          {trendIcon}
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-gray-500 ml-1">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

interface IndicatorGroupProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

export function IndicatorGroup({ title, children, collapsible = false }: IndicatorGroupProps) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-1 h-3 bg-cyan-500 rounded-full" />
        <span className="text-cyan-400 text-xs font-medium">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
