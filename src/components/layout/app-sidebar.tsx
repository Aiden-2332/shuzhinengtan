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
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        'bg-slate-900/95 border-r border-cyan-500/20 backdrop-blur-sm'
      )}
    >
      {/* Logo区域 */}
      <div className="flex items-center h-16 px-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/50">
            <Leaf className="w-5 h-5 text-cyan-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-cyan-100">智慧碳管理</span>
              <span className="text-xs text-cyan-500">高校版</span>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-cyan-300'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-cyan-400')} />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        <div className="pt-4 mt-4 border-t border-cyan-500/20">
          {secondaryNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-500 hover:bg-slate-800/50 hover:text-cyan-300'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 收起按钮 */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-slate-400 hover:text-cyan-300 hover:bg-slate-800/50"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
