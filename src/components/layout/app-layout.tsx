'use client';

import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  showFilters?: boolean;
}

export function AppLayout({ children, showFilters = true }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <AppSidebar />
      <div className="ml-60 transition-all duration-300">
        <AppHeader showFilters={showFilters} />
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Demo水印 */}
      <div className="demo-watermark">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}