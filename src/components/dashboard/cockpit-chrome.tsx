"use client";

import { Building2, Grid3X3, LayoutDashboard } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

const cockpitEntries = [
  { href: "/", label: "领导驾驶舱", icon: LayoutDashboard },
  { href: "/operations", label: "后勤组驾驶舱", icon: Building2 },
  { href: "/portal", label: "功能中心", icon: Grid3X3 },
] as const;

export function CockpitChrome() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden="false">
      <div className="cockpit-command-title" role="banner">
        <span className="cockpit-command-wing cockpit-command-wing-left" />
        <div>
          <h1>高校智慧碳管理平台</h1>
          <p>SMART CAMPUS CARBON MANAGEMENT PLATFORM</p>
        </div>
        <span className="cockpit-command-wing cockpit-command-wing-right" />
      </div>

      <nav className="cockpit-command-nav" aria-label="驾驶舱页面切换">
        {cockpitEntries.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              type="button"
              aria-current={active ? "page" : undefined}
              className={active ? "is-active" : ""}
              onClick={() => router.push(href)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
