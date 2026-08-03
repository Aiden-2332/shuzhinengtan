"use client";

import {
  type KeyboardEvent,
  type SyntheticEvent,
  useId,
  useMemo,
  useState,
} from "react";
import { Building2, Leaf, Search, Tags, X } from "lucide-react";

import type { CampusMapBuilding } from "@/data/campus-map-buildings";

export interface CampusMapOverlayControlsProps {
  buildings: CampusMapBuilding[];
  selectedBuildingId: string | null;
  showLabels: boolean;
  onShowLabelsChange: (show: boolean) => void;
  onBuildingSelect: (id: string) => void;
}

function stopMapInteraction(event: SyntheticEvent): void {
  event.stopPropagation();
}

export function CampusMapOverlayControls({
  buildings,
  selectedBuildingId,
  showLabels,
  onShowLabelsChange,
  onBuildingSelect,
}: CampusMapOverlayControlsProps) {
  const resultsId = useId();
  const [query, setQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredBuildings = useMemo(() => {
    if (!normalizedQuery) return [];

    return buildings
      .filter((building) => {
        const name = building.name.toLocaleLowerCase("zh-CN");
        const category = building.category.toLocaleLowerCase("zh-CN");
        return (
          name.includes(normalizedQuery) ||
          category.includes(normalizedQuery)
        );
      })
      .slice(0, 12);
  }, [buildings, normalizedQuery]);

  const selectedBuilding = useMemo(
    () =>
      buildings.find((building) => building.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  const selectBuilding = (building: CampusMapBuilding): void => {
    setQuery(building.name);
    setIsResultsOpen(false);
    onBuildingSelect(building.id);
  };

  const handleSearchKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "Enter" && filteredBuildings.length > 0) {
      event.preventDefault();
      selectBuilding(filteredBuildings[0]);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsResultsOpen(false);
      event.currentTarget.blur();
    }
  };

  const showResults = isResultsOpen && normalizedQuery.length > 0;

  return (
    <section
      aria-label="建筑搜索与标签开关"
      onPointerDown={stopMapInteraction}
      onClick={stopMapInteraction}
      onDoubleClick={stopMapInteraction}
      onWheel={stopMapInteraction}
      className="w-[min(360px,calc(100vw-88px))] rounded-lg border border-cyan-300/20 bg-[rgba(7,21,47,.9)] p-2.5 shadow-[0_12px_32px_rgba(0,0,0,.28)] backdrop-blur-md"
    >
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-cyan-100/50"
          />
          <input
            type="search"
            value={query}
            placeholder="搜索建筑名称并查看碳数据"
            aria-label="搜索建筑名称并查看碳数据"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showResults}
            aria-controls={showResults ? resultsId : undefined}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsResultsOpen(true);
            }}
            onFocus={() => {
              if (normalizedQuery) setIsResultsOpen(true);
            }}
            onKeyDown={handleSearchKeyDown}
            className="h-9 w-full appearance-none rounded-md border border-white/15 bg-white/[0.06] pl-9 pr-8 text-xs text-white outline-none transition-colors placeholder:text-white/35 focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/30 [&::-webkit-search-cancel-button]:hidden"
          />
          {query ? (
            <button
              type="button"
              aria-label="清除建筑搜索"
              onClick={() => {
                setQuery("");
                setIsResultsOpen(false);
              }}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          ) : null}

          {showResults ? (
            <div
              id={resultsId}
              role="listbox"
              aria-label="建筑搜索结果"
              className="absolute left-0 right-0 top-[42px] z-50 max-h-60 overflow-y-auto rounded-md border border-cyan-300/20 bg-[#07152f]/98 py-1 shadow-xl backdrop-blur-md"
            >
              {filteredBuildings.length > 0 ? (
                filteredBuildings.map((building) => (
                  <button
                    key={building.id}
                    type="button"
                    role="option"
                    aria-selected={building.id === selectedBuildingId}
                    onClick={() => selectBuilding(building)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[#3366ff]/25 focus:bg-[#3366ff]/25 focus:outline-none"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Building2
                        aria-hidden="true"
                        className="h-3.5 w-3.5 shrink-0 text-cyan-200/55"
                      />
                      <span className="truncate text-xs text-white/90">
                        {building.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] text-cyan-100/45">
                      {building.category}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-center text-xs text-white/40">
                  未找到匹配建筑
                </p>
              )}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={showLabels}
          aria-label="显示建筑标签"
          title={showLabels ? "隐藏建筑标签" : "显示建筑标签"}
          onClick={() => onShowLabelsChange(!showLabels)}
          className={`flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
            showLabels
              ? "border-[#5d83ff] bg-[#3366ff] text-white"
              : "border-white/15 bg-white/[0.06] text-white/55"
          }`}
        >
          <Tags aria-hidden="true" className="h-3.5 w-3.5" />
          <span>标签</span>
        </button>
      </div>

      {selectedBuilding ? (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-2">
          <Leaf
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-emerald-300"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="truncate text-xs font-medium text-white">
                {selectedBuilding.name}
              </span>
              <span className="shrink-0 text-[10px] text-white/35">
                {selectedBuilding.carbon?.sourceLabel ?? "未接入"}
              </span>
            </div>
            {selectedBuilding.carbon ? (
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-white/60">
                <span>
                  年碳排放{" "}
                  <strong className="font-semibold text-emerald-200">
                    {selectedBuilding.carbon.annualEmission} tCO₂
                  </strong>
                </span>
                <span>
                  单位面积能耗{" "}
                  <strong className="font-semibold text-cyan-100">
                    {selectedBuilding.carbon.energyIntensity} kWh/m²·月
                  </strong>
                </span>
              </div>
            ) : (
              <p className="mt-0.5 text-[11px] text-white/45">暂无碳数据</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
