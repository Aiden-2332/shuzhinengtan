export type CampusMetricMode = "carbon" | "energy";
export type CampusEmissionLevel = "low" | "medium" | "high" | "critical";

export interface CampusBuildingOverlay {
  id: string;
  name: string;
  type: "library" | "auditorium" | "teaching" | "admin" | "lab" | "dorm";
  carbonValue: number;
  energyValue: number;
  /** Coordinates use the 2048 × 1152 source image coordinate system. */
  path: string;
  markerPosition: { x: number; y: number };
  renewable?: boolean;
}

export const CAMPUS_MAP_VIEWBOX = { width: 2048, height: 1152 } as const;

export const CAMPUS_METRICS = {
  carbon: {
    title: "校园建筑碳排放强度",
    shortName: "碳排放强度",
    unit: "kgCO₂e/m²·年",
    thresholds: { low: 15, medium: 30, high: 50 },
  },
  energy: {
    title: "校园楼宇能耗分布",
    shortName: "综合能耗强度",
    unit: "kWh/m²·月",
    // 能耗数据不做碳排换算，阈值按当前项目既有月度能耗口径集中维护。
    thresholds: { low: 35, medium: 55, high: 80 },
  },
} as const;

export const CAMPUS_LEVELS: Record<
  CampusEmissionLevel,
  { label: string; color: string }
> = {
  low: { label: "低排放", color: "#6bd88f" },
  medium: { label: "中等排放", color: "#f6ca4d" },
  high: { label: "中高排放", color: "#ff963f" },
  critical: { label: "高排放", color: "#ff5e62" },
};

/**
 * TODO(api): values currently reuse the deterministic dashboard mock data.
 * Replace carbonValue / energyValue only when the building intensity API is connected.
 */
export const CAMPUS_BUILDINGS: CampusBuildingOverlay[] = [
  {
    id: "library",
    name: "图书馆",
    type: "library",
    carbonValue: 12.6,
    energyValue: 36.9,
    path: "M726 337 L774 318 L836 340 L836 363 L821 368 L821 390 L782 408 L724 387 L724 360 L714 356 L714 346 Z",
    markerPosition: { x: 777, y: 306 },
    renewable: true,
  },
  {
    id: "auditorium",
    name: "大礼堂",
    type: "auditorium",
    carbonValue: 56.2,
    energyValue: 112.3,
    path: "M1196 285 L1285 248 L1373 286 L1368 333 L1351 340 L1347 367 L1285 406 L1194 365 L1198 322 L1209 317 Z",
    markerPosition: { x: 1286, y: 235 },
  },
  {
    id: "west-teaching",
    name: "西区教学楼",
    type: "teaching",
    carbonValue: 24.3,
    energyValue: 48.6,
    path: "M471 366 L520 348 L520 337 L547 327 L616 351 L616 375 L605 380 L605 411 L548 437 L472 409 L472 386 L459 381 L459 372 Z",
    markerPosition: { x: 544, y: 316 },
  },
  {
    id: "administration",
    name: "行政办公楼",
    type: "admin",
    carbonValue: 13.8,
    energyValue: 28.5,
    path: "M393 526 L459 499 L489 507 L501 502 L557 522 L557 548 L547 552 L547 577 L482 605 L389 573 L389 548 L378 544 L378 533 Z",
    markerPosition: { x: 474, y: 486 },
  },
  {
    id: "lab-center",
    name: "综合实验中心",
    type: "lab",
    carbonValue: 51.7,
    energyValue: 98.7,
    path: "M810 627 L850 610 L850 592 L887 578 L978 610 L978 641 L966 646 L966 685 L904 715 L793 675 L793 647 Z",
    markerPosition: { x: 886, y: 564 },
  },
  {
    id: "east-dorm-1",
    name: "东区宿舍一组",
    type: "dorm",
    carbonValue: 38.4,
    energyValue: 71.8,
    path: "M1103 454 L1153 435 L1153 427 L1171 421 L1239 445 L1239 471 L1230 475 L1230 507 L1180 529 L1102 501 Z",
    markerPosition: { x: 1171, y: 410 },
  },
  {
    id: "east-dorm-2",
    name: "东区宿舍二组",
    type: "dorm",
    carbonValue: 34.6,
    energyValue: 68.4,
    path: "M1223 497 L1273 478 L1273 468 L1294 460 L1363 486 L1363 513 L1354 517 L1354 555 L1298 580 L1222 552 Z",
    markerPosition: { x: 1294, y: 448 },
  },
];

export function getCampusBuildingValue(
  building: CampusBuildingOverlay,
  mode: CampusMetricMode,
) {
  return mode === "carbon" ? building.carbonValue : building.energyValue;
}

export function getCampusEmissionLevel(
  value: number,
  mode: CampusMetricMode,
): CampusEmissionLevel {
  const thresholds = CAMPUS_METRICS[mode].thresholds;
  if (value < thresholds.low) return "low";
  if (value < thresholds.medium) return "medium";
  if (value <= thresholds.high) return "high";
  return "critical";
}
