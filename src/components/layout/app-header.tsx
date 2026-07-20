'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, RefreshCw } from 'lucide-react';
import { CURRENT_YEAR, UNIVERSITY_NAME, campuses } from '@/data/mock-data';

interface AppHeaderProps {
  onFilterChange?: (key: string, value: string) => void;
  showFilters?: boolean;
}

export function AppHeader({ onFilterChange, showFilters = true }: AppHeaderProps) {
  const [year, setYear] = useState<string>(String(CURRENT_YEAR));
  const [campus, setCampus] = useState<string>('all');

  const handleYearChange = (value: string) => {
    setYear(value);
    onFilterChange?.('year', value);
  };

  const handleCampusChange = (value: string) => {
    setCampus(value);
    onFilterChange?.('campusId', value);
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-full px-6">
        {/* 左侧：页面标题和筛选器 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-slate-900">{UNIVERSITY_NAME}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              2026年度
            </Badge>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
              {/* 年度筛选 */}
              <Select value={year} onValueChange={handleYearChange}>
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="选择年度" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026年</SelectItem>
                  <SelectItem value="2025">2025年</SelectItem>
                  <SelectItem value="2024">2024年</SelectItem>
                </SelectContent>
              </Select>

              {/* 校区筛选 */}
              <Select value={campus} onValueChange={handleCampusChange}>
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue placeholder="选择校区" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全校</SelectItem>
                  {campuses.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 数据状态 */}
              <Select defaultValue="locked">
                <SelectTrigger className="w-28 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="locked">已锁定</SelectItem>
                  <SelectItem value="reviewing">复核中</SelectItem>
                  <SelectItem value="forecast">预测值</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            数据更新: 2026-07-01 08:30
          </span>
          
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <RefreshCw className="w-4 h-4 text-slate-500" />
          </Button>
          
          <Button variant="ghost" size="icon" className="w-8 h-8 relative">
            <Bell className="w-4 h-4 text-slate-500" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}