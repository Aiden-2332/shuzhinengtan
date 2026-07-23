"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";

interface AppLayoutProps {
  children: React.ReactNode;
}

// 驾驶舱路由 - 全屏显示，无侧边栏
const COCKPIT_ROUTES = ["/", "/operations"];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isCockpit = COCKPIT_ROUTES.includes(pathname);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Background Grid Effect */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Sidebar - 仅非驾驶舱页面显示 */}
      {!isCockpit && <AppSidebar collapsed={sidebarCollapsed} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className={`flex-1 overflow-y-auto relative ${isCockpit ? "" : "p-6"}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
