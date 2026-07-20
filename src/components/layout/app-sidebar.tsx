'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Zap, 
  Calculator, 
  Lightbulb, 
  Coins,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  Leaf
} from 'lucide-react';

const navigation = [
  { name: '领导驾驶舱', href: '/', icon: LayoutDashboard },
  { name: '能源分析', href: '/energy', icon: Zap },
  { name: '碳核算', href: '/calculation', icon: Calculator },
  { name: 'AI减排建议', href: '/ai-suggestion', icon: Lightbulb },
  { name: '碳资产管理', href: '/asset', icon: Coins },
];

const secondaryNav = [
  { name: '数据中心', href: '/data', icon: Database },
  { name: '系统管理', href: '/settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo区域 */}
      <div className="flex items-center h-16 px-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900">智慧碳管理</span>
              <span className="text-xs text-slate-500">高校版</span>
            </div>
          )}
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-500')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-200">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 折叠按钮 */}
      <div className="absolute -right-3 top-20">
        <Button
          variant="outline"
          size="icon"
          className="w-6 h-6 rounded-full shadow-sm bg-white border-slate-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </Button>
      </div>

      {/* 用户信息 */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-medium text-slate-600">碳</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900">碳管理员</span>
              <span className="text-xs text-slate-500">后勤处</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}