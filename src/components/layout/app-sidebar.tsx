"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Droplets,
  Sun,
  ThermometerSun,
  Atom,
  Scale,
  PiggyBank,
  TrendingDown,
  Bot,
  ScanEye,
  MapPinned,
  BarChart3,
  Activity,
  Calculator,
  Wallet,
  Map,
  Leaf,
  ChevronRight,
  Stethoscope,
  ShieldCheck,
  GitBranch,
} from "lucide-react";

import { cn } from "@/lib/utils";

// 小类使用完全不同于大类的专属图标，每个小类图标都独一无二
const navigation = [
  {
    name: "能源管理",
    // 大类图标：火焰 - 代表能源
    icon: Flame,
    // 大类用实心背景的图标标识，小类用完全不同的线条图标
    children: [
      {
        name: "能源监测",
        href: "/energy-monitor",
        // 用 "监控眼" 图标，区别于大类的火焰
        icon: Activity,
        // 每个小类有独立颜色标识
        color: "text-emerald-400",
        bgHover: "hover:bg-emerald-500/10",
        bgActive: "bg-emerald-500/15",
        borderActive: "border-emerald-500/30",
        desc: "实时监控",
      },
      {
        name: "能源流向分析",
        href: "/energy-flow",
        icon: GitBranch,
        color: "text-blue-400",
        bgHover: "hover:bg-blue-500/10",
        bgActive: "bg-blue-500/15",
        borderActive: "border-blue-500/30",
        desc: "流向与平衡",
      },
      {
        name: "能源诊断",
        href: "/energy-diagnosis",
        icon: Stethoscope,
        color: "text-rose-400",
        bgHover: "hover:bg-rose-500/10",
        bgActive: "bg-rose-500/15",
        borderActive: "border-rose-500/30",
        desc: "能效诊断",
      },
    ],
  },
  {
    name: "碳管理",
    icon: Atom,
    children: [
      {
        name: "碳核算工作台",
        href: "/calculation",
        icon: Calculator,
        color: "text-amber-400",
        bgHover: "hover:bg-amber-500/10",
        bgActive: "bg-amber-500/15",
        borderActive: "border-amber-500/30",
        desc: "五步核算",
      },
      {
        name: "绿色低碳校园评价",
        href: "/evaluation",
        icon: Leaf,
        color: "text-green-400",
        bgHover: "hover:bg-green-500/10",
        bgActive: "bg-green-500/15",
        borderActive: "border-green-500/30",
        desc: "绿色评价",
      },
      {
        name: "碳资产管理",
        href: "/asset",
        icon: Wallet,
        color: "text-yellow-400",
        bgHover: "hover:bg-yellow-500/10",
        bgActive: "bg-yellow-500/15",
        borderActive: "border-yellow-500/30",
        desc: "配额履约",
      },
      {
        name: "合规凭证看板",
        href: "/compliance",
        icon: ShieldCheck,
        color: "text-violet-400",
        bgHover: "hover:bg-violet-500/10",
        bgActive: "bg-violet-500/15",
        borderActive: "border-violet-500/30",
        desc: "MRV溯源",
      },
    ],
  },
  {
    name: "AI 分析",
    icon: Bot,
    children: [
      {
        name: "AI智能分析中心",
        href: "/ai-center",
        icon: ScanEye,
        color: "text-violet-400",
        bgHover: "hover:bg-violet-500/10",
        bgActive: "bg-violet-500/15",
        borderActive: "border-violet-500/30",
        desc: "预测与优化",
      },
    ],
  },
  {
    name: "空间可视化",
    icon: MapPinned,
    children: [
      {
        name: "校园碳地图",
        href: "/campus-map",
        icon: Map,
        color: "text-teal-400",
        bgHover: "hover:bg-teal-500/10",
        bgActive: "bg-teal-500/15",
        borderActive: "border-teal-500/30",
        desc: "3D碳地图",
      },
    ],
  },
];

interface AppSidebarProps {
  collapsed?: boolean;
}

export function AppSidebar({ collapsed = false }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col h-full overflow-hidden transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto pb-3 pt-4 transition-all duration-300",
          collapsed ? "px-2" : "px-3"
        )}
      >
        {navigation.map((section) => {
          const SectionIcon = section.icon;

          // Check if any child in this section is active
          const sectionActive = section.children.some(
            (item) => pathname === item.href || pathname.startsWith(item.href + "/")
          );

          return (
            <div key={section.name} className="mb-3">
              {/* Category Header */}
              {!collapsed ? (
                <div
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md mb-1.5 transition-colors",
                    sectionActive
                      ? "bg-slate-800/60"
                      : ""
                  )}
                >
                  <div
                    className={cn(
                      "w-5 h-5 rounded flex items-center justify-center",
                      sectionActive
                        ? "bg-cyan-500/20"
                        : "bg-slate-800/80"
                    )}
                  >
                    <SectionIcon
                      className={cn(
                        "w-3 h-3",
                        sectionActive ? "text-cyan-400" : "text-gray-500"
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-widest",
                      sectionActive ? "text-cyan-300" : "text-gray-500"
                    )}
                  >
                    {section.name}
                  </span>
                  {sectionActive && (
                    <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent ml-2" />
                  )}
                </div>
              ) : (
                <div className="flex justify-center py-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center">
                    <SectionIcon
                      className={cn(
                        "w-3.5 h-3.5",
                        sectionActive ? "text-cyan-400" : "text-gray-500"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Children */}
              <div className="space-y-0.5">
                {section.children.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg text-sm transition-all duration-200 group",
                        collapsed
                          ? "justify-center px-1.5 py-2"
                          : "px-2.5 py-2",
                        isActive
                          ? cn(item.bgActive, "border", item.borderActive, "shadow-sm")
                          : cn("border border-transparent", item.bgHover)
                      )}
                    >
                      {/* Icon with unique color per item */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                          isActive
                            ? cn(item.bgActive, item.color)
                            : "bg-slate-800/60 text-gray-500 group-hover:bg-slate-700/60"
                        )}
                      >
                        <ItemIcon className="w-3.5 h-3.5" />
                      </div>
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-[13px] font-medium leading-tight",
                                isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                              )}
                            >
                              {item.name}
                            </div>
                            <div
                              className={cn(
                                "text-[10px] leading-tight mt-0.5",
                                isActive ? "text-gray-400" : "text-gray-600 group-hover:text-gray-500"
                              )}
                            >
                              {item.desc}
                            </div>
                          </div>
                          {isActive && (
                            <ChevronRight className={cn("w-3.5 h-3.5", item.color)} />
                          )}
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-cyan-500/20">
          <div className="text-[10px] text-gray-600 text-center">Demo 模拟数据 仅课题演示</div>
        </div>
      )}
    </aside>
  );
}
