"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppHeader } from "./app-header";
import { type CockpitTheme } from "./theme-switcher";

interface AppLayoutProps {
  children: React.ReactNode;
}

// ????? - ?????????
const COCKPIT_ROUTES = ["/", "/operations"];

// ?????? - ????
const ENERGY_ROUTES = ["/energy-monitor", "/energy-flow", "/energy-diagnosis"];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<CockpitTheme>("aurora");
  const pathname = usePathname();

  const isCockpit = COCKPIT_ROUTES.includes(pathname);
  const isEnergy = ENERGY_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

  useEffect(() => {
    const saved = window.localStorage.getItem("cockpit-theme") as CockpitTheme | null;
    if (["aurora", "ocean", "verdant", "sunrise"].includes(saved ?? "")) {
      setTheme(saved as CockpitTheme);
    }
  }, []);

  const handleThemeChange = (nextTheme: CockpitTheme) => {
    setTheme(nextTheme);
    window.localStorage.setItem("cockpit-theme", nextTheme);
  };

  return (
    <div data-theme={theme} className={`theme-root flex h-screen overflow-hidden ${isEnergy ? "bg-slate-100" : "bg-slate-950"}`}>
      {/* Background Grid Effect - only for dark pages */}
      {!isEnergy && !isCockpit && (
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

      {/* Sidebar - ????????? */}
      {!isCockpit && <AppSidebar collapsed={sidebarCollapsed} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppHeader
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          theme={theme}
          onThemeChange={handleThemeChange}
        />
        <main className={`flex-1 min-h-0 relative ${isCockpit ? "overflow-hidden" : "overflow-y-auto p-6"} ${isEnergy ? "energy-theme" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
