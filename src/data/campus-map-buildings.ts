import { CAMPUS_DATA } from "./campus-data";
import rawOverlayData from "./ustb-building-overlays.json";

export type CampusMapKind = "2d" | "2_5d";
export type ImagePoint = [number, number];

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
    carbon: building.name === "主楼"
      ? {
          annualEmission: 3210,
          targetEmission: 2450,
          energyIntensity: 62.4,
          department: "学校办公室",
          sourceLabel: "驾驶舱演示数据",
        }
      : getCarbonData(building.name),
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
