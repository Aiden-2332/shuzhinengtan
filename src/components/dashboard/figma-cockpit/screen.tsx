"use client";

import { usePathname, useRouter } from "next/navigation";
import { CampusTileBackground } from "@/components/dashboard/campus-tile-background";
import Header from "./header";
import {
  LeaderBottom,
  LeaderKpi,
  LeaderLeft,
  LeaderRight,
} from "./leader-dashboard";
import {
  LogisticsBottom,
  LogisticsKpi,
  LogisticsLeft,
  LogisticsRight,
} from "./logistics-dashboard";
import FunctionCenter from "./function-center";
import "./screen.css";

type Page = "leader" | "logistics" | "function";

const NAV = [
  { key: "leader" as const, href: "/leader", label: "领导驾驶舱", icon: "◈" },
  { key: "logistics" as const, href: "/operations", label: "后勤组驾驶舱", icon: "◉" },
  { key: "function" as const, href: "/portal", label: "功能中心", icon: "◫" },
];

function pageFromPath(pathname: string): Page {
  if (pathname === "/operations") return "logistics";
  if (pathname === "/portal") return "function";
  return "leader";
}

function NavBar({ page }: { page: Page }) {
  const router = useRouter();

  return (
    <div className="figma-nav-list">
      {NAV.map((item) => (
        <button
          key={item.key}
          type="button"
          aria-current={page === item.key ? "page" : undefined}
          className={`figma-nav-tab ${page === item.key ? "active" : ""}`}
          onClick={() => router.push(item.href)}
        >
          <span className="figma-nav-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

function FunctionCenterKpi() {
  const stats = [
    { label: "系统接入设备", value: "3,642", unit: "台", color: "#00d4ff" },
    { label: "本月碳排放量", value: "11,820", unit: "tCO₂", color: "#00d4ff" },
    { label: "数据完整率", value: "98.6", unit: "%", color: "#00e090" },
    { label: "待处理告警", value: "5", unit: "条", color: "#ff8c42" },
  ];

  return (
    <div className="figma-kpi-grid">
      {stats.map((stat) => (
        <div key={stat.label} className="figma-kpi-card">
          <div className="figma-kpi-label">{stat.label}</div>
          <div className="figma-kpi-line">
            <span className="figma-kpi-value" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}80` }}>{stat.value}</span>
            <span className="figma-kpi-unit">{stat.unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FigmaCockpitScreen() {
  const pathname = usePathname();
  const page = pageFromPath(pathname);

  return (
    <div className="figma-cockpit">
      <Header />

      <div className="figma-kpi-strip">
        {page === "leader" ? <LeaderKpi /> : page === "logistics" ? <LogisticsKpi /> : <FunctionCenterKpi />}
      </div>

      {page !== "function" ? (
        <>
          <div className="figma-map-stage">
            <div className="figma-live-map">
              <CampusTileBackground
                map="2_5d"
                tone={page === "leader" ? "leader" : "operations"}
                cockpit
              />
            </div>

            <aside className="figma-side-panel figma-side-left">
              {page === "leader" ? <LeaderLeft /> : <LogisticsLeft />}
            </aside>

            <aside className="figma-side-panel figma-side-right">
              {page === "leader" ? <LeaderRight /> : <LogisticsRight />}
            </aside>

            <div className="figma-map-nav"><NavBar page={page} /></div>
            <div className="figma-bottom-strip">
              {page === "leader" ? <LeaderBottom /> : <LogisticsBottom />}
            </div>
          </div>
        </>
      ) : (
        <div className="figma-function-stage">
          <div className="figma-function-grid-bg" />
          <div className="figma-function-content"><FunctionCenter /></div>
          <div className="figma-function-nav"><NavBar page={page} /></div>
        </div>
      )}
    </div>
  );
}
