'use client';

import { cn } from '@/lib/utils';
import { 
  Bell, 
  Search,
  User,
  Calendar,
  MapPin,
  Database
} from 'lucide-react';
import { useState } from 'react';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
}

export function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedCampus, setSelectedCampus] = useState('all');

  return (
    <header className="h-16 bg-slate-900/95 border-b border-cyan-500/20 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      {/* 左侧标题 */}
      <div className="flex items-center gap-4">
        {title && (
          <div>
            <h1 className="text-xl font-bold text-cyan-100">{title}</h1>
            {subtitle && <p className="text-xs text-cyan-500">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* 中间筛选器 */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Calendar className="w-4 h-4 text-cyan-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent text-sm text-cyan-100 outline-none cursor-pointer"
          >
            <option value="2026">2026年</option>
            <option value="2025">2025年</option>
            <option value="2024">2024年</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <MapPin className="w-4 h-4 text-cyan-500" />
          <select
            value={selectedCampus}
            onChange={(e) => setSelectedCampus(e.target.value)}
            className="bg-transparent text-sm text-cyan-100 outline-none cursor-pointer"
          >
            <option value="all">全校</option>
            <option value="main">主校区</option>
            <option value="east">东校区</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-cyan-500/20">
          <Database className="w-4 h-4 text-cyan-500" />
          <select
            className="bg-transparent text-sm text-cyan-100 outline-none cursor-pointer"
          >
            <option>实时估算</option>
            <option>月度锁定</option>
            <option>年度确认</option>
          </select>
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-3">
        <button className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-cyan-500/20">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center">
            <User className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="hidden md:block">
            <div className="text-sm text-cyan-100">管理员</div>
            <div className="text-xs text-cyan-500">carbon@admin.edu</div>
          </div>
        </div>
      </div>
    </header>
  );
}
