"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  Database,
  Bell,
  User,
  ChevronDown,
} from "lucide-react";

export function AppHeader() {
  const [year, setYear] = useState("2026");
  const [campus, setCampus] = useState("all");
  const [dataStatus, setDataStatus] = useState("realtime");

  return (
    <header className="h-16 bg-slate-900/95 backdrop-blur-xl border-b border-cyan-500/20 flex items-center justify-between px-6">
      {/* Left: Filters */}
      <div className="flex items-center gap-4">
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
