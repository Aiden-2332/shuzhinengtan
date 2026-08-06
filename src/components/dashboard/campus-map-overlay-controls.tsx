"use client";

import {
  memo,
  type KeyboardEvent,
  type SyntheticEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BedDouble,
  Building2,
  ChevronDown,
  Coffee,
  FlaskConical,
  GraduationCap,
  Landmark,
  Leaf,
  ScanLine,
  Search,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  getCampusBuildingLayer,
  type CampusLayerFilter,
  type CampusMapBuilding,
} from "@/data/campus-map-buildings";

export interface CampusMapOverlayControlsProps {
  buildings: CampusMapBuilding[];
  selectedBuildingId: string | null;
  showLabels: boolean;
  showBuildingFrames: boolean;
  activeLayer: CampusLayerFilter;
  onShowLabelsChange: (show: boolean) => void;
  onShowBuildingFramesChange: (show: boolean) => void;
  onLayerChange: (layer: CampusLayerFilter) => void;
  onBuildingSelect: (id: string) => void;
}

interface LayerOption {
  value: CampusLayerFilter;
  label: string;
  icon: LucideIcon;
}

const LAYER_OPTIONS: LayerOption[] = [
  { value: "all", label: "全部", icon: Landmark },
  { value: "teaching", label: "教学", icon: GraduationCap },
  { value: "dormitory", label: "宿舍", icon: BedDouble },
  { value: "laboratory", label: "实验", icon: FlaskConical },
  { value: "services", label: "生活服务", icon: Coffee },
];

function stopMapInteraction(event: SyntheticEvent): void {
  event.stopPropagation();
}

function getLayerIcon(building: CampusMapBuilding): LucideIcon {
  const layer = getCampusBuildingLayer(building);
  return LAYER_OPTIONS.find((option) => option.value === layer)?.icon ?? Building2;
}

export const CampusMapOverlayControls = memo(function CampusMapOverlayControls({
  buildings,
  selectedBuildingId,
  showLabels,
  showBuildingFrames,
  activeLayer,
  onShowLabelsChange,
  onShowBuildingFramesChange,
  onLayerChange,
  onBuildingSelect,
}: CampusMapOverlayControlsProps) {
  const resultsId = useId();
  const filtersId = useId();
  const filtersRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const normalizedQuery = query.trim().toLocaleLowerCase("zh-CN");
  const filteredBuildings = useMemo(() => {
    if (!normalizedQuery) return [];

    return buildings
      .filter((building) => {
        const name = building.name.toLocaleLowerCase("zh-CN");
        const category = building.category.toLocaleLowerCase("zh-CN");
        return name.includes(normalizedQuery) || category.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [buildings, normalizedQuery]);

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  const layerCounts = useMemo(() => {
    const counts: Record<CampusLayerFilter, number> = {
      all: buildings.length,
      teaching: 0,
      dormitory: 0,
      laboratory: 0,
      services: 0,
    };
    buildings.forEach((building) => {
      counts[getCampusBuildingLayer(building)] += 1;
    });
    return counts;
  }, [buildings]);

  const activeLayerOption =
    LAYER_OPTIONS.find((option) => option.value === activeLayer) ?? LAYER_OPTIONS[0];
  const ActiveLayerIcon = activeLayerOption.icon;

  useEffect(() => {
    const closeFilters = (event: PointerEvent): void => {
      if (!filtersRef.current?.contains(event.target as Node)) {
        setIsFiltersOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeFilters);
    return () => document.removeEventListener("pointerdown", closeFilters);
  }, []);

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
      aria-label="建筑搜索与标签图层"
      onPointerDown={stopMapInteraction}
      onClick={stopMapInteraction}
      onDoubleClick={stopMapInteraction}
      onWheel={stopMapInteraction}
      className="flex h-10 w-full max-w-[760px] min-w-0 items-center gap-1 rounded-xl bg-[#10262c]/92 p-1 shadow-[0_8px_24px_rgba(2,12,24,.24)] ring-1 ring-inset ring-white/10"
    >
      <div className="relative min-w-[180px] flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--theme-primary)] drop-shadow-[0_0_7px_rgba(var(--theme-primary-rgb),.72)]"
        />
        <input
          type="search"
          value={query}
          placeholder="搜索建筑或类型"
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
          className="h-8 w-full appearance-none rounded-lg bg-slate-950/45 pl-8 pr-8 text-xs font-medium text-white outline-none ring-1 ring-inset ring-white/10 transition-[box-shadow,background-color] placeholder:text-white/40 hover:bg-slate-950/60 focus:bg-slate-950/75 focus:ring-2 focus:ring-inset focus:ring-[rgba(var(--theme-primary-rgb),.72)] [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="清除建筑搜索"
            onClick={() => {
              setQuery("");
              setIsResultsOpen(false);
            }}
            className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md text-white/45 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)]"
          >
            <X aria-hidden="true" className="h-3 w-3" />
          </button>
        ) : null}

        {showResults ? (
          <div
            id={resultsId}
            role="listbox"
            aria-label="建筑搜索结果"
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-[rgba(var(--theme-primary-rgb),.25)] bg-[color-mix(in_srgb,var(--theme-surface-strong)_96%,black)] py-1.5 shadow-[0_18px_45px_rgba(0,0,0,.45),0_0_24px_rgba(var(--theme-primary-rgb),.10)]"
          >
            {filteredBuildings.length > 0 ? (
              filteredBuildings.map((building) => {
                const ResultIcon = getLayerIcon(building);
                return (
                  <button
                    key={building.id}
                    type="button"
                    role="option"
                    aria-selected={building.id === selectedBuildingId}
                    onClick={() => selectBuilding(building)}
                    className="group flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(var(--theme-primary-rgb),.13)] focus:bg-[rgba(var(--theme-primary-rgb),.13)] focus:outline-none"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(var(--theme-primary-rgb),.20)] bg-[rgba(var(--theme-primary-rgb),.10)] text-[var(--theme-primary)] transition-shadow group-hover:shadow-[0_0_14px_rgba(var(--theme-primary-rgb),.28)]">
                        <ResultIcon aria-hidden="true" className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-xs font-semibold text-white/90">
                        {building.name}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] text-white/38">
                      {building.category}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-5 text-center text-xs text-white/40">
                未找到匹配建筑
              </p>
            )}
          </div>
        ) : null}
      </div>

      <div ref={filtersRef} className="relative shrink-0">
        <button
          type="button"
          aria-expanded={isFiltersOpen}
          aria-controls={filtersId}
          aria-haspopup="true"
          onClick={() => setIsFiltersOpen((open) => !open)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setIsFiltersOpen(false);
          }}
          className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold outline-none ring-1 ring-inset transition-[color,background-color,box-shadow,transform] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
            isFiltersOpen || activeLayer !== "all"
              ? "bg-[rgba(var(--theme-primary-rgb),.17)] text-white ring-[rgba(var(--theme-primary-rgb),.5)]"
              : "bg-white/[0.04] text-white/72 ring-white/10 hover:bg-white/[0.08] hover:text-white"
          }`}
        >
          <ActiveLayerIcon aria-hidden="true" className="h-3.5 w-3.5 text-[var(--theme-primary)]" />
          <span>{activeLayerOption.label}</span>
          <span className="font-mono text-[9px] font-normal text-white/45">
            {layerCounts[activeLayer]}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-3 w-3 text-white/45 transition-transform duration-200 ${isFiltersOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isFiltersOpen ? (
          <div
            id={filtersId}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[292px] rounded-xl bg-[color-mix(in_srgb,var(--theme-surface-strong)_97%,black)] p-2 shadow-[0_18px_45px_rgba(0,0,0,.45)] ring-1 ring-inset ring-[rgba(var(--theme-primary-rgb),.24)]"
          >
            <div className="flex items-center justify-between px-1 pb-2 pt-0.5">
              <span className="text-[11px] font-semibold text-white/84">建筑分类</span>
              <span className="text-[10px] text-white/42">选择地图中显示的建筑</span>
            </div>
            <div role="radiogroup" aria-label="建筑分类图层" className="grid grid-cols-2 gap-1">
              {LAYER_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = activeLayer === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => {
                      onLayerChange(option.value);
                      setIsFiltersOpen(false);
                    }}
                    className={`group flex h-9 items-center gap-2 rounded-lg px-2.5 text-left text-[11px] font-semibold outline-none transition-[color,background-color,box-shadow,transform] active:scale-[.98] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
                      isActive
                        ? "bg-[rgba(var(--theme-primary-rgb),.17)] text-white ring-1 ring-inset ring-[rgba(var(--theme-primary-rgb),.45)]"
                        : "text-white/58 hover:bg-white/[0.07] hover:text-white/90"
                    } ${option.value === "services" ? "col-span-2" : ""}`}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[var(--theme-primary)]" : "text-white/40 group-hover:text-white/70"}`}
                    />
                    <span className="flex-1">{option.label}</span>
                    <span className="font-mono text-[9px] font-normal text-white/36">
                      {layerCounts[option.value]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {selectedBuilding ? (
        <div
          title={
            selectedBuilding.carbon
              ? `${selectedBuilding.name} · ${selectedBuilding.carbon.annualEmission} tCO₂/年`
              : `${selectedBuilding.name} · 暂无碳数据`
          }
          className="hidden max-w-[150px] shrink-0 items-center gap-1.5 border-l border-white/10 px-2 min-[1700px]:flex"
        >
          <Leaf className="h-3.5 w-3.5 shrink-0 text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,.55)]" />
          <span className="truncate text-[11px] font-semibold text-white/80">
            {selectedBuilding.name}
          </span>
          {selectedBuilding.carbon ? (
            <span className="shrink-0 font-mono text-[10px] text-emerald-200/75">
              {selectedBuilding.carbon.annualEmission}t
            </span>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        role="switch"
        aria-checked={showBuildingFrames}
        aria-label="显示全部楼宇框"
        title={showBuildingFrames ? "隐藏全部楼宇框" : "显示全部楼宇框"}
        onClick={() => onShowBuildingFramesChange(!showBuildingFrames)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg outline-none ring-1 ring-inset transition-[color,background-color,box-shadow,transform] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
          showBuildingFrames
            ? "bg-[rgba(var(--theme-primary-rgb),.16)] text-white ring-[rgba(var(--theme-primary-rgb),.48)]"
            : "bg-white/[0.04] text-white/45 ring-white/10 hover:bg-white/[0.08] hover:text-white/75"
        }`}
      >
        <ScanLine
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            showBuildingFrames
              ? "text-[var(--theme-primary)] drop-shadow-[0_0_6px_rgba(var(--theme-primary-rgb),.7)]"
              : ""
          }`}
        />
        <span className="sr-only">楼宇框</span>
      </button>

      <button
        type="button"
        role="switch"
        aria-checked={showLabels}
        aria-label="显示建筑标签"
        title={showLabels ? "隐藏建筑标签" : "显示建筑标签"}
        onClick={() => onShowLabelsChange(!showLabels)}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg outline-none ring-1 ring-inset transition-[color,background-color,box-shadow,transform] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
          showLabels
            ? "bg-[rgba(var(--theme-primary-rgb),.16)] text-white ring-[rgba(var(--theme-primary-rgb),.48)]"
            : "bg-white/[0.04] text-white/45 ring-white/10 hover:bg-white/[0.08] hover:text-white/75"
        }`}
      >
        <Tags
          aria-hidden="true"
          className={`h-3.5 w-3.5 ${
            showLabels
              ? "text-[var(--theme-primary)] drop-shadow-[0_0_6px_rgba(var(--theme-primary-rgb),.7)]"
              : ""
          }`}
        />
        <span className="sr-only">标签</span>
      </button>
    </section>
  );
});
