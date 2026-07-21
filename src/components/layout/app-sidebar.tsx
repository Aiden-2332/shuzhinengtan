"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Factory,
  ShieldCheck,
  Brain,
  Zap,
  Calculator,
  Lightbulb,
  Wallet,
  ChevronRight,
  Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "碳控制塔",
    icon: LayoutDashboard,
    children: [
      { name: "L1 校领导控制塔", href: "/", icon: LayoutDashboard },
      { name: "L2 院系业务视图", href: "/dept", icon: Building2 },
      { name: "L3 后勤运营明细", href: "/operations", icon: Factory },
      { name: "L4 合规与披露", href: "/compliance", icon: ShieldCheck },
    ],
  },
  {
    name: "AI 智能分析",
    icon: Brain,
    children: [
      { name: "AI 智能分析中心", href: "/ai-hub", icon: Brain },
    ],
  },
  {
    name: "能源管理",
    icon: Zap,
    children: [
      { name: "能源分析", href: "/energy", icon: Zap },
    ],
  },
  {
    name: "碳管理",
    icon: Calculator,
    children: [
      { name: "碳核算工作台", href: "/calculation", icon: Calculator },
    ],
  },
  {
    name: "减排管理",
    icon: Lightbulb,
    children: [
      { name: "AI 减排建议", href: "/ai-suggestion", icon: Lightbulb },
    ],
  },
  {
    name: "碳资产",
    icon: Wallet,
    children: [
      { name: "碳资产管理", href: "/asset", icon: Wallet },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900/95 backdrop-blur-xl border-r border-cyan-500/20 flex flex-col h-full overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">高校智慧碳管理</h1>
            <p className="text-xs text-cyan-400">Smart Carbon Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navigation.map((section) => (
          <div key={section.name} className="mb-4">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
              <section.icon className="w-4 h-4" />
              <span>{section.name}</span>
            </div>
            <div className="space-y-1">
              {section.children.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
                        : "text-gray-400 hover:bg-slate-800/50 hover:text-cyan-300"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400"
                      )}
                    />
                    <span className="flex-1">{item.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="text-xs text-gray-500 text-center">
          Demo 模拟数据，不用于申报
        </div>
      </div>
    </aside>
  );
}
