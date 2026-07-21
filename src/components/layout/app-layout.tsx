import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function AppLayout({ children, title, subtitle }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* 背景网格效果 */}
      <div 
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* 侧边栏 */}
      <AppSidebar />
      
      {/* 主内容区 */}
      <div className="pl-60">
        {/* 顶部栏 */}
        <AppHeader title={title} subtitle={subtitle} />
        
        {/* 页面内容 */}
        <main className="p-6 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
