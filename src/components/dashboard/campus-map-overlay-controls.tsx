"use client";

import {
  type KeyboardEvent,
  type SyntheticEvent,
  useId,
  useMemo,
  useState,
} from "react";
import {
  BedDouble,
  Building2,
  Coffee,
  FlaskConical,
  GraduationCap,
  Landmark,
  Leaf,
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

export const CAMPUS_MAP_HEADER_SLOT_ID = "campus-map-header-toolbar";

export interface CampusMapOverlayControlsProps {
  buildings: CampusMapBuilding[];
  selectedBuildingId: string | null;
  showLabels: boolean;
  activeLayer: CampusLayerFilter;
  onShowLabelsChange: (show: boolean) => void;
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

export function CampusMapOverlayControls({
  buildings,
  selectedBuildingId,
  showLabels,
  activeLayer,
  onShowLabelsChange,
  onLayerChange,
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
      className="flex h-10 w-full min-w-0 items-center gap-1.5 rounded-[11px] border border-white/10 bg-white/[0.045] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,.08),0_8px_24px_rgba(2,12,24,.24)] backdrop-blur-xl"
    >
      <div className="relative min-w-[180px] max-w-[260px] flex-[1_1_230px]">
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
          className="h-8 w-full appearance-none rounded-lg border border-white/10 bg-slate-950/45 pl-8 pr-8 text-xs font-medium text-white outline-none transition-[border-color,box-shadow,background-color] placeholder:text-white/32 hover:bg-slate-950/60 focus:border-[rgba(var(--theme-primary-rgb),.58)] focus:bg-slate-950/75 focus:shadow-[0_0_0_3px_rgba(var(--theme-primary-rgb),.12),0_0_14px_rgba(var(--theme-primary-rgb),.15)] [&::-webkit-search-cancel-button]:hidden"
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
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-72 overflow-y-auto rounded-xl border border-[rgba(var(--theme-primary-rgb),.25)] bg-[color-mix(in_srgb,var(--theme-surface-strong)_96%,black)] py-1.5 shadow-[0_18px_45px_rgba(0,0,0,.45),0_0_24px_rgba(var(--theme-primary-rgb),.10)] backdrop-blur-xl"
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

      <div
        role="radiogroup"
        aria-label="建筑分类图层"
        className="flex min-w-0 flex-[2_1_auto] items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {LAYER_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isActive = activeLayer === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              title={`${option.label}（${layerCounts[option.value]}）`}
              onClick={() => onLayerChange(option.value)}
              className={`group relative flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-200 active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
                isActive
                  ? "border-[rgba(var(--theme-primary-rgb),.58)] bg-[rgba(var(--theme-primary-rgb),.18)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.10),0_0_16px_rgba(var(--theme-primary-rgb),.22)]"
                  : "border-transparent bg-transparent text-white/48 hover:border-white/10 hover:bg-white/[0.07] hover:text-white/85"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full transition-[background-color,box-shadow] ${
                  isActive
                    ? "bg-[var(--theme-primary)] shadow-[0_0_9px_2px_rgba(var(--theme-primary-rgb),.65)]"
                    : "bg-white/25 group-hover:bg-white/55"
                }`}
              />
              <Icon
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${
                  isActive
                    ? "text-[var(--theme-primary)] drop-shadow-[0_0_6px_rgba(var(--theme-primary-rgb),.72)]"
                    : "text-white/40 group-hover:text-white/75"
                }`}
              />
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {selectedBuilding ? (
        <div
          title={
            selectedBuilding.carbon
              ? `${selectedBuilding.name} · ${selectedBuilding.carbon.annualEmission} tCO₂/年`
              : `${selectedBuilding.name} · 暂无碳数据`
          }
          className="hidden max-w-[170px] shrink-0 items-center gap-1.5 border-l border-white/10 pl-2 2xl:flex"
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
        aria-checked={showLabels}
        aria-label="显示建筑标签"
        title={showLabels ? "隐藏建筑标签" : "显示建筑标签"}
        onClick={() => onShowLabelsChange(!showLabels)}
        className={`flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold outline-none transition-[color,background-color,border-color,box-shadow,transform] active:scale-[.97] focus-visible:ring-2 focus-visible:ring-[var(--theme-primary)] ${
          showLabels
            ? "border-[rgba(var(--theme-primary-rgb),.52)] bg-[rgba(var(--theme-primary-rgb),.16)] text-white shadow-[0_0_14px_rgba(var(--theme-primary-rgb),.18)]"
            : "border-white/10 bg-white/[0.04] text-white/45"
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
        <span>标签</span>
      </button>
    </section>
  );
}
