"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { PortalReturnButton } from "./portal-return-button";

interface AppLayoutProps {
  children: React.ReactNode;
}

// 驾驶舱路由 - 全屏显示，无侧边栏
const COCKPIT_ROUTES = ["/", "/operations", "/portal", "/gateway"];

// 能源管理页面 - 白色背景
const ENERGY_ROUTES = ["/energy-monitor", "/energy-diagnosis"];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  const isCockpit = COCKPIT_ROUTES.includes(pathname) || pathname.startsWith("/gateway/");
  const isEnergy = ENERGY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const showPortalReturn = pathname !== "/gateway" && !pathname.startsWith("/gateway/");

  return (
    <div className={`flex h-screen overflow-hidden ${isEnergy ? "bg-slate-100" : "bg-slate-950"}`}>
      {/* Background Grid Effect - only for dark pages */}
      {!isEnergy && (
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
      )}

      {/* Sidebar - 仅非驾驶舱页面显示 */}
      {!isCockpit && <AppSidebar collapsed={sidebarCollapsed} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!isCockpit && (
          <AppHeader
            sidebarCollapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}
        <main className={`flex-1 min-h-0 relative ${isCockpit ? "overflow-hidden" : "overflow-y-auto p-6"} ${isEnergy ? "energy-theme" : ""}`}>
          {children}
        </main>
      </div>
      {showPortalReturn && <PortalReturnButton compact={!isCockpit} />}
    </div>
  );
}
