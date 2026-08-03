import { CAMPUS_DATA } from "./campus-data";
import rawOverlayData from "./ustb-building-overlays.json";

export type CampusMapKind = "2d" | "2_5d";
export type ImagePoint = [number, number];
export type CampusLayerFilter =
  | "all"
  | "teaching"
  | "dormitory"
  | "laboratory"
  | "services";

export interface CampusBuildingCarbonData {
  annualEmission: number;
  targetEmission: number;
  energyIntensity: number;
  department: string;
  sourceLabel: string;
}

export interface CampusMapBuilding {
  id: string;
  name: string;
  category: string;
  sortCode: string;
  polygon: ImagePoint[];
  centroid: ImagePoint;
  anchor: ImagePoint;
  carbon: CampusBuildingCarbonData | null;
}

interface ExtractedBuilding {
  id: string;
  name: string;
  category: string;
  sortCode: string;
  polygon: ImagePoint[];
  centroid: ImagePoint;
  anchor: ImagePoint;
}

interface ExtractedMap {
  id: CampusMapKind;
  width: number;
  height: number;
  cropOrigin: ImagePoint;
  buildings: ExtractedBuilding[];
}

interface ExtractedOverlayData {
  maps: Record<CampusMapKind, ExtractedMap>;
}

const overlayData = rawOverlayData as unknown as ExtractedOverlayData;

const CARBON_NAME_ALIASES: Record<string, string> = {
  主楼: "主教学楼",
  教学楼: "第一教学楼",
  机电信息楼: "信息学院楼",
  材料测试楼: "材料学院楼",
  经济管理楼: "经管学院楼",
  办公楼: "行政办公楼",
  体育馆: "综合体育馆",
};

const carbonBuildingsByName = new Map(
  CAMPUS_DATA.buildings.map((building) => [building.name, building]),
);

function findCarbonBuilding(name: string) {
  const directName = CARBON_NAME_ALIASES[name] ?? name;
  const directMatch = carbonBuildingsByName.get(directName);
  if (directMatch) return directMatch;

  const dormMatch = name.match(/^(\d{1,2})斋$/);
  if (!dormMatch) return null;
  return carbonBuildingsByName.get(`${dormMatch[1]}号宿舍楼`) ?? null;
}

function getCarbonData(name: string): CampusBuildingCarbonData | null {
  const building = findCarbonBuilding(name);
  if (!building) return null;

  return {
    annualEmission: building.emission,
    targetEmission: building.targetEmission,
    energyIntensity: building.energyIntensity,
    department: building.dept,
    sourceLabel: "系统演示数据",
  };
}

function hydrateBuildings(map: CampusMapKind): CampusMapBuilding[] {
  return overlayData.maps[map].buildings.map((building) => ({
    ...building,
    carbon: getCarbonData(building.name),
  }));
}

export const campusMapBuildingsByMap: Record<
  CampusMapKind,
  CampusMapBuilding[]
> = {
  "2d": hydrateBuildings("2d"),
  "2_5d": hydrateBuildings("2_5d"),
};

export function getCampusMapBuildings(
  map: CampusMapKind,
): CampusMapBuilding[] {
  return campusMapBuildingsByMap[map];
}

const DORMITORY_PATTERN = /宿舍|公寓|斋/;
const LABORATORY_PATTERN =
  /实验|科技|材料|机电|冶金|化生|生态|智能|理化|土木|矿业|工程|研究|腐蚀/;

/**
 * Normalizes the source map's broad categories into the layer switches used
 * by the cockpit. Name-based matching keeps laboratories out of the source
 * data's combined "teaching and research" bucket.
 */
export function getCampusBuildingLayer(
  building: CampusMapBuilding,
): Exclude<CampusLayerFilter, "all"> {
  if (
    building.category.includes("学生宿舍") ||
    DORMITORY_PATTERN.test(building.name)
  ) {
    return "dormitory";
  }

  if (LABORATORY_PATTERN.test(building.name)) {
    return "laboratory";
  }

  if (
    building.category.includes("教学科研") ||
    building.name.includes("教学") ||
    building.name.includes("外语")
  ) {
    return "teaching";
  }

  return "services";
}
