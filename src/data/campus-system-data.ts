import {
  deterministicNoise,
  getCampusDateAt,
  getCampusDateParts,
  getCampusLoadKw,
  getCampusMonthDays,
  minutesAgo,
} from "@/lib/campus-realtime";

export type SystemBuildingCategory =
  | "teaching"
  | "laboratory"
  | "library"
  | "dormitory"
  | "administrative"
  | "service";

export interface SystemBuildingProfile {
  id: string;
  name: string;
  category: SystemBuildingCategory;
  area: number;
  floorCount: number;
  department: string;
  baselinePowerKw: number;
  annualEmissionForecast: number;
  annualEmissionTarget: number;
  energyIntensity: number;
}

const SYSTEM_BUILDING_SEEDS: SystemBuildingProfile[] = [
  { id: "10621", name: "主楼", category: "teaching", area: 28_600, floorCount: 12, department: "教务处", baselinePowerKw: 360, annualEmissionForecast: 1_460, annualEmissionTarget: 1_310, energyIntensity: 82 },
  { id: "10629", name: "机电信息楼", category: "laboratory", area: 25_400, floorCount: 10, department: "机电与信息工程学院", baselinePowerKw: 520, annualEmissionForecast: 1_720, annualEmissionTarget: 1_500, energyIntensity: 108 },
  { id: "10627", name: "材料测试楼", category: "laboratory", area: 18_600, floorCount: 8, department: "材料科学与工程学院", baselinePowerKw: 590, annualEmissionForecast: 1_850, annualEmissionTarget: 1_580, energyIntensity: 126 },
  { id: "10622", name: "理化楼", category: "laboratory", area: 16_400, floorCount: 7, department: "数理学院", baselinePowerKw: 420, annualEmissionForecast: 1_280, annualEmissionTarget: 1_140, energyIntensity: 112 },
  { id: "10714", name: "图书馆", category: "library", area: 40_200, floorCount: 6, department: "图书馆", baselinePowerKw: 410, annualEmissionForecast: 1_580, annualEmissionTarget: 1_400, energyIntensity: 76 },
  { id: "10623", name: "办公楼", category: "administrative", area: 17_800, floorCount: 9, department: "学校办公室", baselinePowerKw: 210, annualEmissionForecast: 760, annualEmissionTarget: 690, energyIntensity: 68 },
  { id: "10697", name: "体育馆", category: "service", area: 15_600, floorCount: 3, department: "体育部", baselinePowerKw: 290, annualEmissionForecast: 980, annualEmissionTarget: 850, energyIntensity: 91 },
  { id: "10724", name: "1斋", category: "dormitory", area: 14_800, floorCount: 7, department: "学生公寓管理中心", baselinePowerKw: 230, annualEmissionForecast: 820, annualEmissionTarget: 730, energyIntensity: 74 },
  { id: "10726", name: "3斋", category: "dormitory", area: 14_500, floorCount: 7, department: "学生公寓管理中心", baselinePowerKw: 218, annualEmissionForecast: 790, annualEmissionTarget: 720, energyIntensity: 72 },
  { id: "10732", name: "学生活动中心", category: "service", area: 12_200, floorCount: 4, department: "后勤服务集团", baselinePowerKw: 305, annualEmissionForecast: 1_060, annualEmissionTarget: 900, energyIntensity: 119 },
  { id: "10716", name: "冶金生态楼", category: "laboratory", area: 21_300, floorCount: 9, department: "冶金与生态工程学院", baselinePowerKw: 430, annualEmissionForecast: 1_310, annualEmissionTarget: 1_170, energyIntensity: 103 },
  { id: "10722", name: "化生楼", category: "laboratory", area: 19_500, floorCount: 8, department: "化学与生物工程学院", baselinePowerKw: 445, annualEmissionForecast: 1_360, annualEmissionTarget: 1_210, energyIntensity: 107 },
  { id: "10633", name: "经济管理楼", category: "teaching", area: 18_100, floorCount: 8, department: "经济管理学院", baselinePowerKw: 240, annualEmissionForecast: 840, annualEmissionTarget: 770, energyIntensity: 71 },
  { id: "10635", name: "工程训练中心（东区）", category: "laboratory", area: 16_800, floorCount: 5, department: "工程训练中心", baselinePowerKw: 390, annualEmissionForecast: 1_170, annualEmissionTarget: 1_030, energyIntensity: 101 },
  { id: "10634", name: "鼎新楼", category: "laboratory", area: 22_600, floorCount: 10, department: "科研管理中心", baselinePowerKw: 470, annualEmissionForecast: 1_510, annualEmissionTarget: 1_350, energyIntensity: 105 },
  { id: "10774", name: "教学楼", category: "teaching", area: 24_200, floorCount: 8, department: "教务处", baselinePowerKw: 285, annualEmissionForecast: 1_020, annualEmissionTarget: 920, energyIntensity: 75 },
  { id: "10779", name: "实验楼", category: "laboratory", area: 20_300, floorCount: 8, department: "实验室与设备管理处", baselinePowerKw: 480, annualEmissionForecast: 1_540, annualEmissionTarget: 1_360, energyIntensity: 110 },
  { id: "10675", name: "铭德楼", category: "administrative", area: 12_800, floorCount: 6, department: "行政管理部门", baselinePowerKw: 155, annualEmissionForecast: 560, annualEmissionTarget: 520, energyIntensity: 64 },
  { id: "10636", name: "逸夫楼", category: "teaching", area: 17_200, floorCount: 7, department: "教务处", baselinePowerKw: 220, annualEmissionForecast: 760, annualEmissionTarget: 700, energyIntensity: 69 },
  { id: "10637", name: "科技楼", category: "laboratory", area: 18_900, floorCount: 8, department: "科研管理中心", baselinePowerKw: 350, annualEmissionForecast: 1_090, annualEmissionTarget: 990, energyIntensity: 94 },
  { id: "10628", name: "土木环境楼", category: "laboratory", area: 20_100, floorCount: 8, department: "土木与资源工程学院", baselinePowerKw: 365, annualEmissionForecast: 1_120, annualEmissionTarget: 1_010, energyIntensity: 96 },
  { id: "10711", name: "外语楼", category: "teaching", area: 13_900, floorCount: 6, department: "外国语学院", baselinePowerKw: 165, annualEmissionForecast: 610, annualEmissionTarget: 560, energyIntensity: 66 },
  { id: "10738", name: "12斋", category: "dormitory", area: 15_200, floorCount: 8, department: "学生公寓管理中心", baselinePowerKw: 225, annualEmissionForecast: 805, annualEmissionTarget: 735, energyIntensity: 73 },
  { id: "10739", name: "11斋", category: "dormitory", area: 15_000, floorCount: 8, department: "学生公寓管理中心", baselinePowerKw: 220, annualEmissionForecast: 790, annualEmissionTarget: 725, energyIntensity: 72 },
  { id: "10741", name: "10斋", category: "dormitory", area: 14_900, floorCount: 8, department: "学生公寓管理中心", baselinePowerKw: 215, annualEmissionForecast: 775, annualEmissionTarget: 710, energyIntensity: 71 },
  { id: "10750", name: "16斋", category: "dormitory", area: 16_100, floorCount: 9, department: "学生公寓管理中心", baselinePowerKw: 235, annualEmissionForecast: 835, annualEmissionTarget: 760, energyIntensity: 74 },
  { id: "10744", name: "博士后公寓南楼", category: "dormitory", area: 12_600, floorCount: 10, department: "公寓管理中心", baselinePowerKw: 185, annualEmissionForecast: 665, annualEmissionTarget: 610, energyIntensity: 70 },
  { id: "10745", name: "博士后公寓北楼", category: "dormitory", area: 12_600, floorCount: 10, department: "公寓管理中心", baselinePowerKw: 180, annualEmissionForecast: 650, annualEmissionTarget: 600, energyIntensity: 69 },
  { id: "10746", name: "研究生院楼", category: "dormitory", area: 13_800, floorCount: 9, department: "研究生院", baselinePowerKw: 195, annualEmissionForecast: 700, annualEmissionTarget: 640, energyIntensity: 70 },
];

const CAMPUS_OVERLAY_BUILDING_IDS: Record<string, string> = {
  "主楼": "10621",
  "机电信息楼": "10627",
  "材料测试楼": "10736",
  "理化楼": "10622",
  "图书馆": "10638",
  "办公楼": "10642",
  "体育馆": "10679",
  "1斋": "10651",
  "3斋": "10652",
  "学生活动中心": "10742",
  "冶金生态楼": "10647",
  "化生楼": "10733",
  "经济管理楼": "10631",
  "工程训练中心（东区）": "10632",
  "鼎新楼": "10629",
  "教学楼": "10637",
  "实验楼": "10636",
  "铭德楼": "10709",
  "逸夫楼": "10630",
  "科技楼": "10634",
  "土木环境楼": "10626",
  "外语楼": "10640",
  "12斋": "10661",
  "11斋": "10659",
  "10斋": "10658",
  "16斋": "10716",
  "博士后公寓南楼": "10670",
  "博士后公寓北楼": "10672",
  "研究生院楼": "10671",
};

export const SYSTEM_BUILDINGS: SystemBuildingProfile[] = SYSTEM_BUILDING_SEEDS.map((building) => ({
  ...building,
  id: CAMPUS_OVERLAY_BUILDING_IDS[building.name] ?? building.id,
}));

export const SYSTEM_BUILDINGS_BY_ID = new Map(SYSTEM_BUILDINGS.map((building) => [building.id, building]));
export const SYSTEM_BUILDINGS_BY_NAME = new Map(SYSTEM_BUILDINGS.map((building) => [building.name, building]));

const LEGACY_SYSTEM_BUILDING_NAMES_BY_ID = new Map(
  SYSTEM_BUILDING_SEEDS.map((building) => [building.id, building.name]),
);

function canonicalSystemBuildingId(legacyId: string): string {
  const buildingName = LEGACY_SYSTEM_BUILDING_NAMES_BY_ID.get(legacyId);
  return buildingName ? (CAMPUS_OVERLAY_BUILDING_IDS[buildingName] ?? legacyId) : legacyId;
}

export const SYSTEM_BUILDING_NAME_ALIASES: Record<string, string> = {
  主教学楼: "主楼",
  第一教学楼: "教学楼",
  第二教学楼: "理学楼",
  第三教学楼: "外语楼",
  教学楼A: "主楼",
  教学楼B: "教学楼",
  教学楼C: "理学楼",
  信息学院楼: "机电信息楼",
  信息学院: "机电信息楼",
  机械学院楼: "工程训练中心（东区）",
  材料学院楼: "材料测试楼",
  材料科学楼: "材料测试楼",
  材料实验楼: "材料测试楼",
  能源学院楼: "冶金生态楼",
  经管学院楼: "经济管理楼",
  行政楼: "办公楼",
  行政办公楼: "办公楼",
  综合实验楼A: "材料测试楼",
  综合实验楼B: "化生楼",
  实验楼A: "材料测试楼",
  实验楼B: "实验楼",
  综合实验中心: "实验楼",
  科研楼A: "材料测试楼",
  数据中心: "鼎新楼",
  信息中心: "机电信息楼",
  大礼堂: "逸夫科技馆",
  体育馆: "体育馆",
  学生宿舍1号楼: "1斋",
  学生宿舍2号楼: "2斋",
  学生宿舍3号楼: "3斋",
  宿舍1号楼: "1斋",
  宿舍2号楼: "2斋",
  宿舍3号楼: "3斋",
  "1号宿舍楼": "1斋",
  "2号宿舍楼": "2斋",
  "3号宿舍楼": "3斋",
  "宿舍1栋": "1斋",
  "宿舍3栋": "3斋",
  第一食堂: "学生活动中心",
  第二食堂: "综合楼",
  食堂A: "学生活动中心",
  食堂1号: "学生活动中心",
};

export function canonicalBuildingName(name: string): string {
  return SYSTEM_BUILDING_NAME_ALIASES[name] ?? name;
}

const ANNUAL_WEIGHTS = [0.12, 0.105, 0.09, 0.075, 0.07, 0.085, 0.1, 0.105, 0.085, 0.065, 0.05, 0.05];

export const CAMPUS_CARBON_QUOTA = 21_500;
export const CAMPUS_CARBON_TARGET = 20_400;
export const CAMPUS_CARBON_FORECAST = 22_180;
export const CAMPUS_ELECTRICITY_FACTOR = 0.5672;

function currentYearProgress(now: Date): number {
  const { year, month, day, hour, minute } = getCampusDateParts(now);
  const completed = ANNUAL_WEIGHTS.slice(0, month - 1).reduce((sum, value) => sum + value, 0);
  const monthProgress = (day - 1 + (hour + minute / 60) / 24) / getCampusMonthDays(year, month);
  return completed + ANNUAL_WEIGHTS[month - 1] * monthProgress;
}

function currentDayElectricity(now: Date): number {
  const parts = getCampusDateParts(now);
  let total = 0;
  for (let hour = 0; hour < parts.hour; hour++) {
    total += getCampusLoadKw(getCampusDateAt(parts.year, parts.month, parts.day, hour, 30), 31);
  }
  total += getCampusLoadKw(now, 31) * (parts.minute / 60);
  return Math.round(total);
}

export interface CampusOperationalSnapshot {
  year: number;
  annualCarbon: number;
  annualTarget: number;
  yearToDateTarget: number;
  annualForecast: number;
  annualQuota: number;
  remainingQuota: number;
  quotaUseRate: number;
  yoy: number;
  todayCarbon: number;
  todayElectricity: number;
  todayWater: number;
  todayGas: number;
  todayHeat: number;
  comprehensiveEnergyTce: number;
  dataCompletenessRate: number;
  instrumentOnlineRate: number;
}

export function getCampusOperationalSnapshot(now = new Date()): CampusOperationalSnapshot {
  const parts = getCampusDateParts(now);
  const dayProgress = (parts.hour + parts.minute / 60) / 24;
  const yearProgress = currentYearProgress(now);
  const monthlyCarbon = getSystemMonthlyCarbon(now);
  const annualCarbon = monthlyCarbon.at(-1)?.actual ?? 0;
  const todayElectricity = currentDayElectricity(now);
  const todayWater = Math.round(5_200 * dayProgress);
  const mealPeak = Math.exp(-Math.pow((parts.hour - 12) / 2.2, 2)) + Math.exp(-Math.pow((parts.hour - 18) / 2.4, 2));
  const todayGas = Math.round((310 * dayProgress + mealPeak * 18) * 10) / 10;
  const isHeatingSeason = [11, 12, 1, 2, 3].includes(parts.month);
  const todayHeat = isHeatingSeason ? Math.round(1_420 * dayProgress) : 0;
  const todayCarbon = Math.round((todayElectricity / 1000 * CAMPUS_ELECTRICITY_FACTOR + todayGas / 10_000 * 2.1622 + todayHeat * 0.11) * 10) / 10;
  const comprehensiveEnergyTce = Math.round((todayElectricity * 0.0001229 + todayGas * 0.0012143 + todayHeat * 0.0341) * 10) / 10;

  return {
    year: parts.year,
    annualCarbon,
    annualTarget: CAMPUS_CARBON_TARGET,
    yearToDateTarget: Math.round(CAMPUS_CARBON_TARGET * yearProgress),
    annualForecast: CAMPUS_CARBON_FORECAST,
    annualQuota: CAMPUS_CARBON_QUOTA,
    remainingQuota: CAMPUS_CARBON_QUOTA - annualCarbon,
    quotaUseRate: Math.round(annualCarbon / CAMPUS_CARBON_QUOTA * 1000) / 10,
    yoy: -2.8,
    todayCarbon,
    todayElectricity,
    todayWater,
    todayGas,
    todayHeat,
    comprehensiveEnergyTce,
    dataCompletenessRate: 96.8,
    instrumentOnlineRate: Math.round(175 / 186 * 1000) / 10,
  };
}

export function getSystemMonthlyCarbon(now = new Date()) {
  const { year, month: currentMonth, day, hour, minute } = getCampusDateParts(now);
  let actual = 0;
  let target = 0;
  let forecast = 0;
  return ANNUAL_WEIGHTS.slice(0, currentMonth).map((weight, index) => {
    const month = index + 1;
    const elapsed = month === currentMonth
      ? Math.min(1, (day - 1 + (hour + minute / 60) / 24) / getCampusMonthDays(year, month))
      : 1;
    const seed = getCampusDateAt(year, month, 1).getTime();
    const actualFactor = 0.985 + deterministicNoise(seed, 41) * 0.025;
    actual += CAMPUS_CARBON_FORECAST * weight * actualFactor * elapsed;
    target += CAMPUS_CARBON_TARGET * weight * elapsed;
    forecast += CAMPUS_CARBON_FORECAST * weight * elapsed;
    return {
      month: `${month}月`,
      monthKey: `${year}-${String(month).padStart(2, "0")}`,
      actual: Math.round(actual),
      target: Math.round(target),
      forecast: Math.round(forecast),
    };
  });
}

export type SystemDeviceStatus = "online" | "offline" | "fault" | "maintenance";
export type SystemEnergyType = "electricity" | "water" | "gas" | "heat";

export interface SystemDeviceDefinition {
  id: string;
  name: string;
  type: string;
  energyType: SystemEnergyType;
  buildingId: string;
  status: SystemDeviceStatus;
  baseValue: number;
  unit: string;
  heartbeatMinutes: number;
  batteryLevel?: number;
}

const SYSTEM_DEVICE_SEEDS: SystemDeviceDefinition[] = [
  { id: "DEV-EL-001", name: "主楼高压进线柜", type: "进线柜", energyType: "electricity", buildingId: "10621", status: "online", baseValue: 286, unit: "kW", heartbeatMinutes: 1, batteryLevel: 96 },
  { id: "DEV-HVAC-001", name: "主楼3层空调机组", type: "空调机组", energyType: "electricity", buildingId: "10621", status: "online", baseValue: 92, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-LT-001", name: "主楼照明控制柜", type: "照明控制", energyType: "electricity", buildingId: "10621", status: "online", baseValue: 46, unit: "kW", heartbeatMinutes: 2 },
  { id: "DEV-TR-002", name: "材料测试楼2号变压器", type: "变压器", energyType: "electricity", buildingId: "10627", status: "fault", baseValue: 315, unit: "kW", heartbeatMinutes: 6 },
  { id: "DEV-EX-002", name: "材料测试楼东区排风机组", type: "实验排风", energyType: "electricity", buildingId: "10627", status: "maintenance", baseValue: 68, unit: "kW", heartbeatMinutes: 46 },
  { id: "DEV-MT-002", name: "材料测试楼总电表", type: "智能电表", energyType: "electricity", buildingId: "10627", status: "online", baseValue: 438, unit: "kW", heartbeatMinutes: 1, batteryLevel: 91 },
  { id: "DEV-HVAC-003", name: "图书馆冷水机组1号", type: "冷水机组", energyType: "electricity", buildingId: "10714", status: "online", baseValue: 178, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-MT-004", name: "图书馆总电表", type: "智能电表", energyType: "electricity", buildingId: "10714", status: "online", baseValue: 326, unit: "kW", heartbeatMinutes: 1, batteryLevel: 88 },
  { id: "DEV-HVAC-004", name: "图书馆新风机组", type: "新风机组", energyType: "electricity", buildingId: "10714", status: "online", baseValue: 54, unit: "kW", heartbeatMinutes: 2 },
  { id: "DEV-WT-001", name: "1斋总水表", type: "智能水表", energyType: "water", buildingId: "10724", status: "offline", baseValue: 0, unit: "m³/h", heartbeatMinutes: 142, batteryLevel: 12 },
  { id: "DEV-WT-002", name: "1斋3层分区水表", type: "智能水表", energyType: "water", buildingId: "10724", status: "online", baseValue: 4.8, unit: "m³/h", heartbeatMinutes: 2, batteryLevel: 68 },
  { id: "DEV-HT-001", name: "1斋生活热水表", type: "热量表", energyType: "heat", buildingId: "10724", status: "online", baseValue: 1.6, unit: "GJ/h", heartbeatMinutes: 2, batteryLevel: 74 },
  { id: "DEV-WT-003", name: "3斋东区水表", type: "智能水表", energyType: "water", buildingId: "10726", status: "offline", baseValue: 0, unit: "m³/h", heartbeatMinutes: 163, batteryLevel: 9 },
  { id: "DEV-MT-005", name: "3斋总电表", type: "智能电表", energyType: "electricity", buildingId: "10726", status: "online", baseValue: 172, unit: "kW", heartbeatMinutes: 1, batteryLevel: 83 },
  { id: "DEV-GT-001", name: "学生活动中心餐饮区燃气表", type: "燃气表", energyType: "gas", buildingId: "10732", status: "online", baseValue: 18.5, unit: "m³/h", heartbeatMinutes: 1, batteryLevel: 72 },
  { id: "DEV-EX-003", name: "学生活动中心餐饮排风机", type: "排风机", energyType: "electricity", buildingId: "10732", status: "online", baseValue: 62, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-WP-001", name: "学生活动中心供水泵", type: "水泵", energyType: "water", buildingId: "10732", status: "online", baseValue: 5.6, unit: "m³/h", heartbeatMinutes: 2 },
  { id: "DEV-HVAC-006", name: "体育馆冷水机组2号", type: "冷水机组", energyType: "electricity", buildingId: "10697", status: "maintenance", baseValue: 148, unit: "kW", heartbeatMinutes: 38 },
  { id: "DEV-LT-006", name: "体育馆场地照明柜", type: "照明控制", energyType: "electricity", buildingId: "10697", status: "online", baseValue: 86, unit: "kW", heartbeatMinutes: 2 },
  { id: "DEV-LT-007", name: "办公楼照明控制柜", type: "照明控制", energyType: "electricity", buildingId: "10623", status: "online", baseValue: 38, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-HVAC-007", name: "办公楼新风机组", type: "新风机组", energyType: "electricity", buildingId: "10623", status: "online", baseValue: 44, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-UPS-001", name: "机电信息楼UPS-A", type: "UPS", energyType: "electricity", buildingId: "10629", status: "online", baseValue: 196, unit: "kW", heartbeatMinutes: 1, batteryLevel: 89 },
  { id: "DEV-EX-008", name: "机电信息楼实验排风系统", type: "实验排风", energyType: "electricity", buildingId: "10629", status: "online", baseValue: 96, unit: "kW", heartbeatMinutes: 2 },
  { id: "DEV-MT-008", name: "机电信息楼总电表", type: "智能电表", energyType: "electricity", buildingId: "10629", status: "online", baseValue: 412, unit: "kW", heartbeatMinutes: 1, batteryLevel: 93 },
  { id: "DEV-AC-009", name: "理化楼空气压缩机", type: "空压机", energyType: "electricity", buildingId: "10622", status: "online", baseValue: 112, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-GT-009", name: "理化楼实验气体总表", type: "燃气表", energyType: "gas", buildingId: "10622", status: "online", baseValue: 3.8, unit: "m³/h", heartbeatMinutes: 2, batteryLevel: 76 },
  { id: "DEV-MT-010", name: "冶金生态楼高压进线柜", type: "进线柜", energyType: "electricity", buildingId: "10716", status: "online", baseValue: 338, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-CS-011", name: "化生楼低温冷藏系统", type: "冷藏系统", energyType: "electricity", buildingId: "10722", status: "online", baseValue: 138, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-HVAC-012", name: "经济管理楼空调主机", type: "空调主机", energyType: "electricity", buildingId: "10633", status: "online", baseValue: 108, unit: "kW", heartbeatMinutes: 2 },
  { id: "DEV-PQ-013", name: "工程训练中心电能质量表", type: "电能质量表", energyType: "electricity", buildingId: "10635", status: "online", baseValue: 302, unit: "kW", heartbeatMinutes: 1, batteryLevel: 86 },
  { id: "DEV-UPS-014", name: "鼎新楼机房UPS", type: "UPS", energyType: "electricity", buildingId: "10634", status: "online", baseValue: 238, unit: "kW", heartbeatMinutes: 1, batteryLevel: 94 },
  { id: "DEV-MT-015", name: "教学楼总电表", type: "智能电表", energyType: "electricity", buildingId: "10774", status: "online", baseValue: 224, unit: "kW", heartbeatMinutes: 1, batteryLevel: 92 },
  { id: "DEV-TR-016", name: "实验楼1号变压器", type: "变压器", energyType: "electricity", buildingId: "10779", status: "online", baseValue: 376, unit: "kW", heartbeatMinutes: 1 },
  { id: "DEV-MT-017", name: "铭德楼智能电表", type: "智能电表", energyType: "electricity", buildingId: "10675", status: "online", baseValue: 122, unit: "kW", heartbeatMinutes: 2, batteryLevel: 87 },
  { id: "DEV-PV-001", name: "逸夫楼屋顶光伏逆变器", type: "光伏逆变器", energyType: "electricity", buildingId: "10636", status: "online", baseValue: -86, unit: "kW", heartbeatMinutes: 1 },
];

export const SYSTEM_DEVICE_DEFINITIONS: SystemDeviceDefinition[] = SYSTEM_DEVICE_SEEDS.map((device) => ({
  ...device,
  buildingId: canonicalSystemBuildingId(device.buildingId),
}));

export interface SystemDeviceSnapshot extends SystemDeviceDefinition {
  buildingName: string;
  currentValue: number;
  lastHeartbeat: string;
}

export function getSystemDeviceSnapshots(now = new Date()): SystemDeviceSnapshot[] {
  const parts = getCampusDateParts(now);
  const campusLoadFactor = getCampusLoadKw(now, 17) / 5_200;
  const mealFactor = 0.25 + Math.exp(-Math.pow((parts.hour - 12) / 1.8, 2)) + Math.exp(-Math.pow((parts.hour - 18) / 2, 2));
  const occupancyFactor = parts.weekday === 0 || parts.weekday === 6 ? 0.72 : 1;
  return SYSTEM_DEVICE_DEFINITIONS.map((device, index) => {
    const building = SYSTEM_BUILDINGS_BY_ID.get(device.buildingId);
    let factor = campusLoadFactor * occupancyFactor;
    if (device.energyType === "water") factor = 0.55 + occupancyFactor * 0.45;
    if (device.energyType === "gas") factor = mealFactor;
    if (device.energyType === "heat") factor = [11, 12, 1, 2, 3].includes(parts.month) ? 1 : 0;
    const noise = 1 + deterministicNoise(now.getTime(), index + 71) * 0.035;
    const value = device.status === "offline" ? 0 : device.baseValue * factor * noise;
    return {
      ...device,
      buildingName: building?.name ?? "未知楼宇",
      currentValue: Math.round(value * 10) / 10,
      lastHeartbeat: minutesAgo(now, device.heartbeatMinutes).toISOString(),
    };
  });
}

export type SystemAnomalyCategory = "energy" | "device" | "environment" | "data";
export type SystemAnomalySeverity = "info" | "warning" | "critical" | "emergency";

export interface SystemAnomalyDefinition {
  id: string;
  buildingId: string;
  deviceId?: string;
  title: string;
  category: SystemAnomalyCategory;
  severity: SystemAnomalySeverity;
  status: "pending" | "acknowledged" | "processing" | "resolved";
  detectedMinutesAgo: number;
  duration: string;
  description: string;
  metric: string;
  metricValue: number;
  threshold: number;
  unit: string;
  rootCause: string;
  evidence: string[];
  suggestions: string[];
  extraEmission: number;
  extraCost: number;
  assignee?: string;
}

const SYSTEM_ANOMALY_SEEDS: SystemAnomalyDefinition[] = [
  { id: "ANOM-001", buildingId: "10621", deviceId: "DEV-HVAC-001", title: "夜间空调基载偏高", category: "energy", severity: "critical", status: "processing", detectedMinutesAgo: 18, duration: "持续3小时18分", description: "主楼3层空调机组在非教学时段仍保持高负荷，功率较同类时段基线高38%。", metric: "功率", metricValue: 92, threshold: 67, unit: "kW", rootCause: "课程表联动策略未下发，局部风阀保持全开，机组未切换夜间低负荷模式。", evidence: ["当前功率92kW，夜间基线67kW", "相邻楼层机组已降至41kW", "控制器存在1条策略下发失败记录"], suggestions: ["补发夜间时控策略", "检查3层风阀执行器", "核对临时课程与活动预约"], extraEmission: 0.34, extraCost: 486, assignee: "张工" },
  { id: "ANOM-002", buildingId: "10627", deviceId: "DEV-TR-002", title: "变压器温升异常", category: "device", severity: "emergency", status: "processing", detectedMinutesAgo: 8, duration: "持续42分钟", description: "材料测试楼2号变压器绕组温度达到92℃，超过85℃告警阈值。", metric: "绕组温度", metricValue: 92, threshold: 85, unit: "℃", rootCause: "三相负载不平衡叠加散热风机效率下降，B相电流高于平均值17%。", evidence: ["绕组温度92℃", "B相电流偏差17%", "散热风机转速较额定值低22%"], suggestions: ["降低非必要实验设备负荷", "检查散热风机与滤网", "复核三相负载分配"], extraEmission: 0.62, extraCost: 920, assignee: "李工" },
  { id: "ANOM-003", buildingId: "10627", deviceId: "DEV-EX-002", title: "实验排风超时运行", category: "energy", severity: "warning", status: "acknowledged", detectedMinutesAgo: 64, duration: "持续6小时12分", description: "材料测试楼东区排风机组在实验预约结束后仍满频运行。", metric: "空载运行功率", metricValue: 68, threshold: 32, unit: "kW", rootCause: "实验室预约系统已结束，但就地控制箱处于手动强制状态。", evidence: ["预约系统显示无人使用", "变频器保持50Hz", "门禁连续4小时无人员进入"], suggestions: ["解除手动强制状态", "恢复预约系统联动", "增加超时运行二次确认"], extraEmission: 0.23, extraCost: 326, assignee: "周工" },
  { id: "ANOM-004", buildingId: "10714", deviceId: "DEV-HVAC-004", title: "阅览区CO₂浓度偏高", category: "environment", severity: "warning", status: "pending", detectedMinutesAgo: 31, duration: "持续55分钟", description: "图书馆五层阅览区CO₂浓度达到1,260ppm，超过1,000ppm控制阈值。", metric: "CO₂浓度", metricValue: 1260, threshold: 1000, unit: "ppm", rootCause: "午后人员密度上升，新风阀开度仅35%，需求控制通风响应滞后。", evidence: ["区域人数约420人", "新风阀开度35%", "回风CO₂连续55分钟上升"], suggestions: ["将新风阀开度提高至60%", "校验人数与CO₂联动逻辑", "优化高峰时段预启动策略"], extraEmission: 0.08, extraCost: 116, assignee: "王工" },
  { id: "ANOM-005", buildingId: "10714", deviceId: "DEV-MT-004", title: "总电表读数漂移", category: "data", severity: "warning", status: "pending", detectedMinutesAgo: 47, duration: "连续4个采集周期", description: "图书馆总电表读数较支路汇总持续偏高11.8%，超出3%平衡误差范围。", metric: "计量平衡偏差", metricValue: 11.8, threshold: 3, unit: "%", rootCause: "总表互感器变比配置可能偏移，实际设备负荷曲线未出现对应上升。", evidence: ["总表与支路差值11.8%", "相邻表计趋势稳定", "最近一次校准已超过12个月"], suggestions: ["安排总表现场校准", "核对互感器变比参数", "校准前将数据标记为待复核"], extraEmission: 0.0, extraCost: 0, assignee: "赵工" },
  { id: "ANOM-006", buildingId: "10724", deviceId: "DEV-WT-002", title: "夜间持续用水异常", category: "energy", severity: "critical", status: "processing", detectedMinutesAgo: 39, duration: "连续3晚", description: "1斋凌晨最小流量达到4.8m³/h，较历史基线高71%。", metric: "最小夜流", metricValue: 4.8, threshold: 2.8, unit: "m³/h", rootCause: "地下给水支管存在疑似暗漏，三层公共卫生间另有两处冲洗阀关闭不严。", evidence: ["夜间流量连续3晚不回零", "三层分区表贡献42%", "关闭用水点后总表仍有2.1m³/h流量"], suggestions: ["开展分区停水测漏", "维修三层冲洗阀", "核算漏损量并跟踪修复后基线"], extraEmission: 0.02, extraCost: 378, assignee: "陈工" },
  { id: "ANOM-007", buildingId: "10726", deviceId: "DEV-WT-003", title: "水表通讯中断", category: "data", severity: "critical", status: "pending", detectedMinutesAgo: 163, duration: "持续2小时43分", description: "3斋东区水表连续11个采集周期未上报，当前分项完整率下降。", metric: "心跳", metricValue: 0, threshold: 1, unit: "次/15min", rootCause: "表计电池电量低且地下管井LoRa信号弱，网关重试未成功。", evidence: ["最后心跳已过去163分钟", "设备电量9%", "同区域网关信号强度-116dBm"], suggestions: ["更换表计电池", "调整LoRa中继位置", "缺失时段按相邻日同周期估算并标记"], extraEmission: 0, extraCost: 0, assignee: "赵工" },
  { id: "ANOM-008", buildingId: "10732", deviceId: "DEV-GT-001", title: "餐饮燃气单耗偏高", category: "energy", severity: "warning", status: "pending", detectedMinutesAgo: 52, duration: "连续5个营业日", description: "学生活动中心餐饮区单位供餐燃气消耗较历史同期高16.4%。", metric: "燃气单耗", metricValue: 0.118, threshold: 0.101, unit: "m³/份", rootCause: "两台蒸箱门封老化，叠加灶具风气比偏大，排烟温度持续偏高。", evidence: ["单位供餐燃气0.118m³/份", "蒸箱门缝温度异常", "排烟氧含量9.2%"], suggestions: ["更换蒸箱门封", "校准灶具风气比", "按供餐量建立日单耗看板"], extraEmission: 0.19, extraCost: 642, assignee: "刘工" },
  { id: "ANOM-009", buildingId: "10697", deviceId: "DEV-HVAC-006", title: "冷水机组COP偏低", category: "device", severity: "critical", status: "acknowledged", detectedMinutesAgo: 76, duration: "持续1小时28分", description: "体育馆2号冷水机组COP降至3.15，低于4.20运行目标。", metric: "COP", metricValue: 3.15, threshold: 4.2, unit: "", rootCause: "冷凝器进出水温差缩小，换热面结垢导致冷凝压力偏高。", evidence: ["COP从4.31降至3.15", "冷凝器温差仅2.1℃", "冷凝压力较基线高18%"], suggestions: ["切换备用机组", "安排冷凝器清洗", "复核冷却塔补水与水质"], extraEmission: 0.41, extraCost: 586, assignee: "李工" },
  { id: "ANOM-010", buildingId: "10623", deviceId: "DEV-LT-007", title: "夜间照明空载率偏高", category: "energy", severity: "warning", status: "pending", detectedMinutesAgo: 88, duration: "连续7日", description: "办公楼22:00后照明负荷仍占日间峰值31%，高于10%控制目标。", metric: "夜间空载率", metricValue: 31, threshold: 10, unit: "%", rootCause: "三层和七层存在长明区域，部分人体感应器被切换为常开模式。", evidence: ["夜间负荷38kW", "三层支路贡献12kW", "7只感应器处于旁路状态"], suggestions: ["恢复感应控制", "设置22:30统一关灯策略", "保留值班区白名单"], extraEmission: 0.27, extraCost: 392, assignee: "孙工" },
  { id: "ANOM-011", buildingId: "10629", deviceId: "DEV-UPS-001", title: "UPS谐波畸变偏高", category: "device", severity: "warning", status: "processing", detectedMinutesAgo: 103, duration: "持续2小时05分", description: "机电信息楼UPS-A输入电流总谐波畸变率达到12.6%。", metric: "THDi", metricValue: 12.6, threshold: 8, unit: "%", rootCause: "新增服务器电源负载集中接入A路，输入滤波模块容量不足。", evidence: ["THDi 12.6%", "A路负载率82%", "B路负载率49%"], suggestions: ["迁移部分服务器至B路", "检查输入滤波模块", "开展配电系统谐波复测"], extraEmission: 0.11, extraCost: 158, assignee: "周工" },
  { id: "ANOM-012", buildingId: "10622", deviceId: "DEV-AC-009", title: "空压机卸载运行过长", category: "energy", severity: "warning", status: "pending", detectedMinutesAgo: 126, duration: "持续4小时30分", description: "理化楼空气压缩机卸载运行占比达到46%，明显高于20%合理区间。", metric: "卸载运行占比", metricValue: 46, threshold: 20, unit: "%", rootCause: "末端用气需求下降但管网压力设定未调整，设备频繁卸载保压。", evidence: ["卸载占比46%", "平均供气需求下降28%", "管网压力设定仍为0.82MPa"], suggestions: ["下调压力设定至0.72MPa", "启用变频小机优先策略", "检查管网微漏点"], extraEmission: 0.21, extraCost: 305, assignee: "张工" },
  { id: "ANOM-013", buildingId: "10635", deviceId: "DEV-PQ-013", title: "功率因数偏低", category: "energy", severity: "warning", status: "resolved", detectedMinutesAgo: 248, duration: "持续58分钟", description: "工程训练中心（东区）加工设备集中启动时功率因数降至0.78。", metric: "功率因数", metricValue: 0.78, threshold: 0.9, unit: "", rootCause: "无功补偿柜一组电容器未投入，冲压设备集中启动造成短时无功需求上升。", evidence: ["功率因数0.78", "补偿柜C3回路未投入", "峰值发生于实训课集中开机时段"], suggestions: ["检修C3补偿回路", "错峰启动大功率设备", "设置功率因数低于0.88联动告警"], extraEmission: 0.06, extraCost: 96, assignee: "李工" },
];

export const SYSTEM_ANOMALY_DEFINITIONS: SystemAnomalyDefinition[] = SYSTEM_ANOMALY_SEEDS.map((anomaly) => ({
  ...anomaly,
  buildingId: canonicalSystemBuildingId(anomaly.buildingId),
}));

export interface SystemAnomalySnapshot extends SystemAnomalyDefinition {
  buildingName: string;
  deviceName?: string;
  detectedAt: string;
}

export function getSystemAnomalySnapshots(now = new Date()): SystemAnomalySnapshot[] {
  const devices = new Map(SYSTEM_DEVICE_DEFINITIONS.map((device) => [device.id, device]));
  return SYSTEM_ANOMALY_DEFINITIONS.map((anomaly) => ({
    ...anomaly,
    buildingName: SYSTEM_BUILDINGS_BY_ID.get(anomaly.buildingId)?.name ?? "未知楼宇",
    deviceName: anomaly.deviceId ? devices.get(anomaly.deviceId)?.name : undefined,
    detectedAt: minutesAgo(now, anomaly.detectedMinutesAgo).toISOString(),
  }));
}

export function getSystemBuildingRanking(now = new Date(), limit = 10) {
  const progress = currentYearProgress(now);
  return SYSTEM_BUILDINGS
    .map((building) => ({
      ...building,
      currentYearEmission: Math.round(building.annualEmissionForecast * progress),
      overTargetPct: Math.round((building.annualEmissionForecast / building.annualEmissionTarget - 1) * 1000) / 10,
    }))
    .toSorted((a, b) => b.currentYearEmission - a.currentYearEmission)
    .slice(0, limit);
}

export function getPreviousCampusMonthKey(now = new Date()): string {
  const { year, month } = getCampusDateParts(now);
  const previousMonth = month === 1 ? 12 : month - 1;
  const previousYear = month === 1 ? year - 1 : year;
  return `${previousYear}-${String(previousMonth).padStart(2, "0")}`;
}
