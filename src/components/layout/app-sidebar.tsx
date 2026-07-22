"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    LayoutDashboard,
    Factory,
    Brain,
    Zap,
    Calculator,
    Wallet,
    ChevronRight,
    Leaf,
    Award,
    BarChart3,
    CalendarDays,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navigation = [{
    name: "碳控制塔",
    icon: LayoutDashboard,

    children: [{
        name: "领导组驾驶舱",
        href: "/",
        icon: LayoutDashboard
    }, {
        name: "后勤组驾驶舱",
        href: "/operations",
        icon: Factory
    }]
}, {
    name: "AI 智能分析中心",
    icon: Brain,
    href: "/ai-center",
}, {
    name: "能源管理",
    icon: Zap,

    children: [{
        name: "能源监测",
        href: "/energy-monitor",
        icon: Zap
    }, {
        name: "能源分析",
        href: "/energy",
        icon: BarChart3
    }, {
        name: "用电日历",
        href: "/energy/calendar",
        icon: CalendarDays
    }]
}, {
    name: "碳管理",
    icon: Calculator,

    children: [{
        name: "碳核算工作台",
        href: "/calculation",
        icon: Calculator
    }, {
        name: "绿色/低碳校园评价",
        href: "/evaluation",
        icon: Award
    }, {
        name: "碳资产管理",
        href: "/asset",
        icon: Wallet
    }]
}];

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
            )}>
            {/* Logo */}
            <div className={cn(
                "h-16 flex items-center border-b border-cyan-500/20 transition-all duration-300",
                collapsed ? "px-4 justify-center" : "px-6"
            )}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <h1 className="text-base font-bold text-white">高校智慧碳管理</h1>
                            <p className="text-xs text-cyan-400">Smart Carbon Platform</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Navigation */}
            <nav className={cn(
                "flex-1 overflow-y-auto py-4 space-y-1 transition-all duration-300",
                collapsed ? "px-2" : "px-3"
            )}>
                {navigation.map(section => {
                    // Direct-link section (no children)
                    if ("href" in section && section.href) {
                        const isActive = pathname === section.href;
                        return (
                            <div key={section.name} className="mb-4">
                                {!collapsed && (
                                    <Link
                                        href={section.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg text-sm transition-all duration-200 group px-3 py-2.5",
                                            isActive ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" : "text-gray-400 hover:bg-slate-800/50 hover:text-cyan-300"
                                        )}>
                                        <section.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400")} />
                                        <span className="flex-1">{section.name}</span>
                                        {isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                                    </Link>
                                )}
                                {collapsed && (
                                    <Link
                                        href={section.href}
                                        title={section.name}
                                        className={cn(
                                            "flex items-center justify-center rounded-lg text-sm transition-all duration-200 group px-2 py-2.5",
                                            isActive ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" : "text-gray-400 hover:bg-slate-800/50 hover:text-cyan-300"
                                        )}>
                                        <section.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400")} />
                                    </Link>
                                )}
                            </div>
                        );
                    }
                    // Section with children
                    return (<div key={section.name} className="mb-4">
                        {!collapsed && (
                            <div
                                className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                                <section.icon className="w-4 h-4" />
                                <span>{section.name}</span>
                            </div>
                        )}
                        {collapsed && (
                            <div className="flex justify-center py-2">
                                <section.icon className="w-4 h-4 text-cyan-400" />
                            </div>
                        )}
                        <div className="space-y-1">
                            {"children" in section && section.children?.map(item => {
                                const isActive = pathname === item.href;

                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={collapsed ? item.name : undefined}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg text-sm transition-all duration-200 group",
                                            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                                            isActive ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10" : "text-gray-400 hover:bg-slate-800/50 hover:text-cyan-300"
                                        )}>
                                        <item.icon
                                            className={cn(
                                                "w-4 h-4 flex-shrink-0",
                                                isActive ? "text-cyan-400" : "text-gray-500 group-hover:text-cyan-400"
                                            )} />
                                        {!collapsed && <span className="flex-1">{item.name}</span>}
                                        {!collapsed && isActive && <ChevronRight className="w-4 h-4 text-cyan-400" />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>);
                })}
            </nav>
            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-cyan-500/20">
                    <div className="text-xs text-gray-500 text-center">Demo 模拟数据，不用于申报</div>
                </div>
            )}
        </aside>
    );
}