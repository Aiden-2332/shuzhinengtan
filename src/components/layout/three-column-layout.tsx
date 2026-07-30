"use client";

import { CampusScene3D } from "@/components/3d/campus-scene";

interface ThreeColumnLayoutProps {
  children?: React.ReactNode;
  level: "L1" | "L2" | "L3" | "L4";
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  colorMode?: "carbon" | "energy";
  year?: number;
  campus?: string;
  bottomPanel?: React.ReactNode;
  centerBottomPanel?: React.ReactNode;
  topPanel?: React.ReactNode;
}

export function ThreeColumnLayout({
  children,
  level,
  leftPanel,
  rightPanel,
  selectedBuilding,
  onBuildingClick,
  filterType,
  colorMode,
  year = 2026,
  campus = "主校区",
  bottomPanel,
  centerBottomPanel,
  topPanel,
}: ThreeColumnLayoutProps) {
  if (topPanel) {
    return (
      <div className="relative isolate h-full min-h-[700px] overflow-hidden bg-[#03101f] p-3 text-slate-100">
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_38%,rgba(11,87,123,.08),transparent_38%),linear-gradient(90deg,rgba(1,8,19,.5),transparent_30%,transparent_70%,rgba(1,8,19,.5))]" />
        <div
          className="relative z-10 grid h-full min-h-0 gap-2.5"
          style={{
            gridTemplateRows: "84px minmax(0, 1fr)",
            "--cockpit-side-panel-width": "clamp(190px, 21.5vw, 390px)",
          } as React.CSSProperties}
        >
          <section className="min-h-0">{topPanel}</section>
          <div
            className="grid min-h-0 gap-2.5"
            style={{
              gridTemplateColumns:
                "var(--cockpit-side-panel-width) minmax(0, 1fr) var(--cockpit-side-panel-width)",
            }}
          >
            <aside className="min-h-0 overflow-hidden">{leftPanel}</aside>
            <main
              className="grid min-h-0 gap-2.5"
              style={{ gridTemplateRows: "minmax(0, 1fr) 214px" }}
            >
              <section className="relative min-h-0 overflow-hidden border border-cyan-400/35 bg-[#041526]/40">
                {children}
              </section>
              {centerBottomPanel ? (
                <section className="cockpit-tech-panel min-h-0 overflow-hidden border">
                  {centerBottomPanel}
                </section>
              ) : null}
            </main>
            <aside className="min-h-0 overflow-hidden">{rightPanel}</aside>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-1 right-2 z-20 select-none text-[10px] text-slate-300/35">
          Demo 模拟数据，不用于申报
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative isolate h-full min-h-[700px] overflow-hidden bg-[#0E1624] text-slate-100"
      style={{
        "--cockpit-side-panel-width": "clamp(300px, 21vw, 380px)",
        "--cockpit-top-panel-height": topPanel ? "94px" : "0px",
      } as React.CSSProperties}
    >
      {/* 地图保持为独立的全屏底图；不在此组件中介入地图逻辑。 */}
      <div className="absolute inset-0 z-0">
        {children || (
          <CampusScene3D
            level={level}
            selectedBuilding={selectedBuilding || null}
            onBuildingClick={onBuildingClick || (() => {})}
            filterType={filterType || null}
            colorMode={colorMode || "carbon"}
          />
        )}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(7,16,28,0.34),transparent_28%,transparent_72%,rgba(7,16,28,0.34))]" />

      {topPanel && (
        <section className="absolute left-4 right-4 top-3 z-20 h-[82px]">
          {topPanel}
        </section>
      )}

      {/* 三面悬浮数据板：左、右、底；中央地图始终保持为视觉主体。 */}
      <aside className="cockpit-tech-panel absolute bottom-4 left-4 z-10 w-[var(--cockpit-side-panel-width)] overflow-hidden border backdrop-blur-xl" style={{ top: "calc(var(--cockpit-top-panel-height) + 0.75rem)" }}>
        <div className="h-full overflow-hidden">{leftPanel}</div>
      </aside>

      <aside className="cockpit-tech-panel absolute bottom-4 right-4 z-10 w-[var(--cockpit-side-panel-width)] overflow-hidden border backdrop-blur-xl" style={{ top: "calc(var(--cockpit-top-panel-height) + 0.75rem)" }}>
        <div className="h-full overflow-hidden">{rightPanel}</div>
      </aside>

      {centerBottomPanel && (
        <section className="cockpit-tech-panel absolute bottom-4 z-10 h-[clamp(185px,22vh,235px)] overflow-hidden border backdrop-blur-xl" style={{ left: "calc(var(--cockpit-side-panel-width) + 2rem)", right: "calc(var(--cockpit-side-panel-width) + 2rem)" }}>
          <div className="h-full overflow-hidden">{centerBottomPanel}</div>
        </section>
      )}

      {bottomPanel && (
        <section className="absolute bottom-4 left-4 right-4 z-20 overflow-hidden border border-[#6F9BC8]/30 bg-[#141F30]/[0.84] p-3 shadow-[0_18px_48px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          {bottomPanel}
        </section>
      )}

      {/* 水印 */}
      <div className="absolute bottom-1 right-2 z-20 select-none text-[10px] text-slate-300/45 pointer-events-none">
        Demo 模拟数据，不用于申报
      </div>
    </div>
  );
}
