"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Atom,
  Bot,
  ScanEye,
  MapPinned,
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
    id: "energy",
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
    id: "carbon",
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
    id: "ai",
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
    id: "spatial",
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
            <div key={section.id} className="mb-4" role="group" aria-labelledby={`sidebar-section-${section.id}`}>
              {/* Category Header */}
              {!collapsed ? (
                <div
                  id={`sidebar-section-${section.id}`}
                  role="heading"
                  aria-level={2}
                  className={cn(
                    "mb-2 flex min-h-7 items-center gap-2 px-2",
                    sectionActive ? "text-cyan-300" : "text-slate-300"
                  )}
                >
                  <SectionIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="text-[11px] font-semibold leading-none">
                    {section.name}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-px flex-1",
                      sectionActive ? "bg-cyan-500/40" : "bg-slate-700/80"
                    )}
                  />
                </div>
              ) : (
                <div
                  id={`sidebar-section-${section.id}`}
                  role="heading"
                  aria-level={2}
                  title={`${section.name}（分类）`}
                  className={cn(
                    "mb-1 flex items-center gap-1.5 py-2",
                    sectionActive ? "text-cyan-300" : "text-slate-400"
                  )}
                >
                  <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
                  <SectionIcon aria-hidden="true" className="size-3.5 shrink-0" />
                  <span className="sr-only">{section.name}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-current opacity-40" />
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
                      aria-current={isActive ? "page" : undefined}
                      aria-label={collapsed ? item.name : undefined}
                      title={collapsed ? item.name : undefined}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg border text-sm transition-[background-color,border-color,color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
                        collapsed
                          ? "h-11 w-full justify-center p-0"
                          : "min-h-12 px-2.5 py-2",
                        isActive
                          ? cn(item.bgActive, item.borderActive, "shadow-sm")
                          : cn("border-slate-800/90 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/80", item.bgHover)
                      )}
                    >
                      {/* Icon with unique color per item */}
                      <div
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-md border transition-[background-color,border-color,color] duration-200",
                          isActive
                            ? cn(item.bgActive, item.borderActive, item.color)
                            : cn(
                                "border-slate-700/90 bg-slate-800/90 group-hover:border-slate-600 group-hover:bg-slate-700/90",
                                item.color
                              )
                        )}
                      >
                        <ItemIcon aria-hidden="true" className="size-[18px]" strokeWidth={1.8} />
                      </div>
                      {!collapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "text-[13px] font-medium leading-tight",
                                isActive ? "text-white" : "text-slate-200 group-hover:text-white"
                              )}
                            >
                              {item.name}
                            </div>
                            <div
                              className={cn(
                                "text-[10px] leading-tight mt-0.5",
                                isActive ? "text-slate-300" : "text-slate-400 group-hover:text-slate-300"
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
          <div className="text-[10px] text-slate-400 text-center">Demo 模拟数据 仅课题演示</div>
        </div>
      )}
    </aside>
  );
}
