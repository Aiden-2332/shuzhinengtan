"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Database,
  Bell,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Leaf,
} from "lucide-react";

interface AppHeaderProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export function AppHeader({ sidebarCollapsed = false, onToggleSidebar }: AppHeaderProps) {
  const [year, setYear] = useState("2026");
  const [campus, setCampus] = useState("all");
  const [dataStatus, setDataStatus] = useState("realtime");

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6">
      {/* Left: Platform Name + Toggle + Filters */}
      <div className="flex items-center gap-4">
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800/50 transition-colors text-gray-400 hover:text-cyan-400"
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>

        {/* Platform Name */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">高校智慧碳管理</h1>
            <p className="text-[10px] text-cyan-400 leading-tight">Smart Carbon Platform</p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-700/50" />

        {/* Year Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="2026">2026 年度</option>
            <option value="2025">2025 年度</option>
            <option value="2024">2024 年度</option>
          </select>
        </div>

        {/* Campus Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="all">全校</option>
            <option value="main">主校区</option>
            <option value="east">东校区</option>
          </select>
        </div>

        {/* Data Status Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Database className="w-4 h-4 text-cyan-400" />
          <select
            value={dataStatus}
            onChange={(e) => setDataStatus(e.target.value)}
            className="bg-transparent text-sm text-gray-300 outline-none cursor-pointer"
          >
            <option value="realtime">实时估算</option>
            <option value="monthly">月度锁定</option>
            <option value="yearly">年度确认</option>
          </select>
        </div>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
          <Bell className="w-5 h-5 text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="text-gray-300 font-medium">校领导</div>
            <div className="text-xs text-gray-500">管理员</div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
