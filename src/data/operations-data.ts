/**
 * 后勤组驾驶舱 - 专用数据
 * 
 * 涵盖：能源四分类、碳排放总览、四类告警、设备警告、
 *       重点系统效率、仪表在线率、楼宇能耗分布、实时负荷
 */

import {
  addHours,
  formatCampusTime,
  getCampusLoadKw,
  startOfCampusHour,
} from "@/lib/campus-realtime";
import {
  getCampusForecastLoadKw,
  getCampusOperationalSnapshot,
  getSystemAnomalySnapshots,
  getSystemBuildingRanking,
  getSystemMonthlyCarbon,
} from "@/data/campus-system-data";

// ============================================================
// 类型定义
// ============================================================

export type AlertCategory = "energy" | "equipment" | "environment" | "data";
export type AlertSeverity = "critical" | "warning" | "info";
export type WorkOrderStatus = "pending" | "processing" | "overdue" | "completed";

export interface EnergyCategoryData {
  type: string;        // 水/电/热/综合
  icon: string;        // 图标标识
  todayValue: number;  // 今日消耗
  unit: string;
  monthValue: number;  // 本月累计
  yearValue: number;   // 本年累计
  trend: number;       // 同比变化 %
  budgetRatio: number; // 预算执行率 %
}

export interface CarbonOverviewData {
  totalEmission: number;    // 年度总排放 tCO₂
  monthEmission: number;    // 本月排放
  todayEmission: number;    // 今日排放
  scope1: number;           // 范围1
  scope2: number;           // 范围2
  scope3: number;           // 范围3
  yearTrend: number;        // 同比 %
  quotaRemain: number;      // 配额余量 %
}

export interface AlertRecord {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  location: string;
  buildingId: string;
  duration: string;         // 持续时长
  timestamp: string;        // 触发时间
  description: string;
  assignedTo?: string;      // 派发人员
  autoDispatched: boolean;  // 是否自动派发
}

export interface EquipmentWarning {
  id: string;
  equipmentName: string;
  location: string;
  buildingId: string;
  issue: string;
  duration: string;
  severity: AlertSeverity;
}

export interface WorkOrderStats {
  pendingCount: number;
  overdueCount: number;
  processingCount: number;
  todayCompleted: number;
}

export interface SystemEfficiency {
  name: string;             // 空调与冷站 / 供热与锅炉 / 照明与动力
  efficiency: number;       // 运行效率 %
  lowEfficiencyCount: number; // 低效运行数量
  totalUnits: number;       // 总设备数
  runningUnits: number;     // 运行中
  alarmCount: number;       // 告警数
}

export interface MeterStats {
  onlineRate: number;       // 仪表在线率 %
  dataCompleteness: number; // 数据完整率 %
  totalMeters: number;      // 总仪表数
  onlineMeters: number;     // 在线仪表数
  offlineMeters: number;    // 离线仪表数
  missingDataMeters: number;// 数据缺失仪表数
}

export interface BuildingEnergyItem {
  buildingId: string;
  name: string;
  energyValue: number;      // 单位面积能耗 kWh/m²
  color: string;            // 绿→红梯度
}

export interface BuildingSystemDetail {
  name: string;             // 空调与冷站 / 供热与锅炉 / 照明与动力
  efficiency: number;       // 运行效率 %
  energyConsumption: number; // 能耗 kWh
  runningUnits: number;     // 运行中设备数
  totalUnits: number;       // 总设备数
  alarmCount: number;       // 告警数
  lowEfficiencyCount: number; // 低效运行数量
}

export interface BuildingDetailData {
  buildingId: string;
  name: string;
  todayOccupancy: number;   // 当日楼宇人数
  maxOccupancy: number;     // 最大容纳人数
  systems: BuildingSystemDetail[]; // 三大系统数据
  todayElectricity: number; // 今日用电 kWh
  todayHeat: number;        // 今日用热 MJ
  todayWater: number;       // 今日用水 m³
  todayGas: number;         // 今日用气 m³
  carbonEmission: number;   // 今日碳排放 tCO₂
}

export interface LoadDataPoint {
  hour: number;
  realtime: number;         // 实时 kW
  yesterday: number;        // 昨日同时
  forecast: number;         // 预测
}

// ============================================================
// 能源四分类数据
// ============================================================

export const energyCategories: EnergyCategoryData[] = [
  {
    type: "电力",
    icon: "zap",
    todayValue: 38520,
    unit: "kWh",
    monthValue: 986500,
    yearValue: 9865000,
    trend: 3.2,
    budgetRatio: 68,
  },
  {
    type: "水",
    icon: "droplets",
    todayValue: 1280,
    unit: "m³",
    monthValue: 35600,
    yearValue: 385000,
    trend: -2.1,
    budgetRatio: 55,
  },
  {
    type: "热力",
    icon: "flame",
    todayValue: 15600,
    unit: "MJ",
    monthValue: 428000,
    yearValue: 4250000,
    trend: 5.8,
    budgetRatio: 72,
  },
  {
    type: "综合能耗",
    icon: "bar-chart-3",
    todayValue: 156.8,
    unit: "tce",
    monthValue: 4120,
    yearValue: 42300,
    trend: 1.6,
    budgetRatio: 63,
  },
];

// ============================================================
// 碳排放总览
// ============================================================

export const carbonOverview: CarbonOverviewData = {
  totalEmission: 12680,
  monthEmission: 1120,
  todayEmission: 38.5,
  scope1: 3200,
  scope2: 8450,
  scope3: 1030,
  yearTrend: -3.2,
  quotaRemain: 32,
};

// ============================================================
// 四类告警记录
// ============================================================

export const alertRecords: AlertRecord[] = [
  // 能源异常
  {
    id: "a01", category: "energy", severity: "critical",
    title: "用电突增", location: "信息学院楼 3层", buildingId: "b05",
    duration: "2h35m", timestamp: "14:25",
    description: "3层实验室用电量较均值突增280%，疑似设备异常运行",
    assignedTo: "张工", autoDispatched: true,
  },
  {
    id: "a02", category: "energy", severity: "warning",
    title: "用水连续异常", location: "1号宿舍楼", buildingId: "b13",
    duration: "6h10m", timestamp: "08:15",
    description: "凌晨时段用水量持续偏高，疑似管道泄漏",
    assignedTo: "李工", autoDispatched: true,
  },
  {
    id: "a03", category: "energy", severity: "warning",
    title: "天然气消耗偏高", location: "第一食堂", buildingId: "b23",
    duration: "1d3h", timestamp: "昨日 11:00",
    description: "日耗气量超出历史同期35%",
    autoDispatched: false,
  },
  // 设备异常
  {
    id: "a04", category: "equipment", severity: "critical",
    title: "冷机组故障", location: "中央冷站", buildingId: "b01",
    duration: "4h20m", timestamp: "12:40",
    description: "2号冷机组压缩机异常停机，冷却水温超标",
    assignedTo: "王工", autoDispatched: true,
  },
  {
    id: "a05", category: "equipment", severity: "warning",
    title: "锅炉燃烧效率低", location: "供热站", buildingId: "b01",
    duration: "2d8h", timestamp: "前日 06:00",
    description: "1号锅炉排烟温度偏高，热效率降至78%",
    autoDispatched: false,
  },
  {
    id: "a06", category: "equipment", severity: "warning",
    title: "循环泵振动超标", location: "供热站", buildingId: "b01",
    duration: "12h", timestamp: "02:30",
    description: "A区循环泵轴承振动值超限",
    assignedTo: "赵工", autoDispatched: true,
  },
  // 环境异常
  {
    id: "a07", category: "environment", severity: "warning",
    title: "CO₂浓度超标", location: "图书馆 5层", buildingId: "b10",
    duration: "1h45m", timestamp: "15:10",
    description: "5层自习区CO₂浓度达1200ppm，超出标准值",
    assignedTo: "孙工", autoDispatched: true,
  },
  {
    id: "a08", category: "environment", severity: "warning",
    title: "温度超限", location: "3号宿舍楼", buildingId: "b15",
    duration: "3h", timestamp: "13:00",
    description: "3层室内温度31°C，超出夏季舒适上限",
    autoDispatched: false,
  },
  {
    id: "a09", category: "environment", severity: "info",
    title: "湿度偏低", location: "大礼堂", buildingId: "b12",
    duration: "5h", timestamp: "09:00",
    description: "室内湿度28%，低于下限30%",
    autoDispatched: false,
  },
  // 数据异常
  {
    id: "a10", category: "data", severity: "critical",
    title: "仪表离线", location: "机械学院楼", buildingId: "b06",
    duration: "8h", timestamp: "06:00",
    description: "B1层电力仪表离线，数据采集中断",
    assignedTo: "刘工", autoDispatched: true,
  },
  {
    id: "a11", category: "data", severity: "warning",
    title: "数据缺失", location: "2号宿舍楼", buildingId: "b14",
    duration: "3d", timestamp: "3天前",
    description: "热水流量计近3天无数据上报",
    autoDispatched: false,
  },
  {
    id: "a12", category: "data", severity: "warning",
    title: "采集延迟", location: "5号宿舍楼", buildingId: "b17",
    duration: "1h20m", timestamp: "14:00",
    description: "数据采集延迟>30min，影响实时监测",
    assignedTo: "陈工", autoDispatched: true,
  },
];

// ============================================================
// 设备警告
// ============================================================

export const equipmentWarnings: EquipmentWarning[] = [
  { id: "ew01", equipmentName: "2号冷机组", location: "中央冷站", buildingId: "b01", issue: "压缩机异常停机", duration: "4h20m", severity: "critical" },
  { id: "ew02", equipmentName: "1号锅炉", location: "供热站", buildingId: "b01", issue: "燃烧效率低", duration: "2d8h", severity: "warning" },
  { id: "ew03", equipmentName: "A区循环泵", location: "供热站", buildingId: "b01", issue: "振动超标", duration: "12h", severity: "warning" },
  { id: "ew04", equipmentName: "3层空调机组", location: "主教学楼", buildingId: "b01", issue: "送风温度异常", duration: "6h", severity: "warning" },
  { id: "ew05", equipmentName: "B1电力仪表", location: "机械学院楼", buildingId: "b06", issue: "仪表离线", duration: "8h", severity: "critical" },
];

// ============================================================
// 工单统计
// ============================================================

export const workOrderStats: WorkOrderStats = {
  pendingCount: 5,
  overdueCount: 2,
  processingCount: 3,
  todayCompleted: 7,
};

// ============================================================
// 重点系统运行效率
// ============================================================

export const systemEfficiencies: SystemEfficiency[] = [
  {
    name: "空调与冷站",
    efficiency: 82,
    lowEfficiencyCount: 3,
    totalUnits: 24,
    runningUnits: 18,
    alarmCount: 2,
  },
  {
    name: "供热与锅炉",
    efficiency: 78,
    lowEfficiencyCount: 2,
    totalUnits: 12,
    runningUnits: 8,
    alarmCount: 3,
  },
  {
    name: "照明与动力",
    efficiency: 91,
    lowEfficiencyCount: 1,
    totalUnits: 56,
    runningUnits: 52,
    alarmCount: 1,
  },
];

// ============================================================
// 仪表在线率及数据完整率
// ============================================================

export const meterStats: MeterStats = {
  onlineRate: 94.2,
  dataCompleteness: 96.8,
  totalMeters: 186,
  onlineMeters: 175,
  offlineMeters: 11,
  missingDataMeters: 6,
};

// ============================================================
// 校园楼宇能耗分布
// ============================================================

function getEnergyColor(value: number): string {
  // 绿→黄→红 梯度: <30绿, 30-60黄绿, 60-90橙, >90红
  if (value < 30) return "#22C55E";
  if (value < 50) return "#84CC16";
  if (value < 70) return "#EAB308";
  if (value < 90) return "#F97316";
  return "#EF4444";
}

export const buildingEnergyDistribution: BuildingEnergyItem[] = [
  { buildingId: "b01", name: "主教学楼", energyValue: 95, color: getEnergyColor(95) },
  { buildingId: "b02", name: "第一教学楼", energyValue: 62, color: getEnergyColor(62) },
  { buildingId: "b03", name: "第二教学楼", energyValue: 48, color: getEnergyColor(48) },
  { buildingId: "b04", name: "第三教学楼", energyValue: 38, color: getEnergyColor(38) },
  { buildingId: "b05", name: "信息学院楼", energyValue: 88, color: getEnergyColor(88) },
  { buildingId: "b06", name: "机械学院楼", energyValue: 72, color: getEnergyColor(72) },
  { buildingId: "b07", name: "材料学院楼", energyValue: 55, color: getEnergyColor(55) },
  { buildingId: "b08", name: "能源学院楼", energyValue: 68, color: getEnergyColor(68) },
  { buildingId: "b09", name: "经管学院楼", energyValue: 32, color: getEnergyColor(32) },
  { buildingId: "b10", name: "图书馆", energyValue: 78, color: getEnergyColor(78) },
  { buildingId: "b11", name: "行政办公楼", energyValue: 42, color: getEnergyColor(42) },
  { buildingId: "b12", name: "大礼堂", energyValue: 25, color: getEnergyColor(25) },
  { buildingId: "b13", name: "1号宿舍楼", energyValue: 52, color: getEnergyColor(52) },
  { buildingId: "b14", name: "2号宿舍楼", energyValue: 45, color: getEnergyColor(45) },
  { buildingId: "b15", name: "3号宿舍楼", energyValue: 58, color: getEnergyColor(58) },
  { buildingId: "b16", name: "4号宿舍楼", energyValue: 41, color: getEnergyColor(41) },
  { buildingId: "b17", name: "5号宿舍楼", energyValue: 35, color: getEnergyColor(35) },
  { buildingId: "b18", name: "6号宿舍楼", energyValue: 28, color: getEnergyColor(28) },
  { buildingId: "b19", name: "7号宿舍楼", energyValue: 30, color: getEnergyColor(30) },
  { buildingId: "b20", name: "8号宿舍楼", energyValue: 22, color: getEnergyColor(22) },
  { buildingId: "b21", name: "9号宿舍楼", energyValue: 27, color: getEnergyColor(27) },
  { buildingId: "b22", name: "10号宿舍楼", energyValue: 20, color: getEnergyColor(20) },
  { buildingId: "b23", name: "第一食堂", energyValue: 82, color: getEnergyColor(82) },
  { buildingId: "b24", name: "第二食堂", energyValue: 75, color: getEnergyColor(75) },
  { buildingId: "b25", name: "体育馆", energyValue: 60, color: getEnergyColor(60) },
  { buildingId: "b26", name: "综合实验中心", energyValue: 98, color: getEnergyColor(98) },
  { buildingId: "b27", name: "数据中心", energyValue: 100, color: getEnergyColor(100) },
  { buildingId: "b28", name: "光伏配电房", energyValue: 8, color: getEnergyColor(8) },
  { buildingId: "b29", name: "校医院", energyValue: 46, color: getEnergyColor(46) },
];

// ============================================================
// 实时负荷数据 (24h)
// ============================================================

function generateLoadData(): LoadDataPoint[] {
  const data: LoadDataPoint[] = [];
  const currentHour = 14; // 模拟当前14:00

  for (let h = 0; h < 24; h++) {
    // 昨日基准负荷曲线 (教学日典型曲线)
    const baseY = h < 5 ? 1800 : h < 7 ? 2800 + (h - 5) * 600 : h < 12 ? 5800 + (h - 7) * 400 : h < 14 ? 8200 - (h - 12) * 300 : h < 18 ? 7600 + (h - 14) * 500 : h < 21 ? 9100 - (h - 18) * 600 : 6100 - (h - 21) * 800;
    const yesterday = baseY + ((h * 37 + 120) % 200) - 100;

    // 今日实时 (含偏差)
    const deviation = ((h * 53 + 87) % 300) - 150;
    const realtime = h <= currentHour ? baseY + deviation : 0;

    // 预测 (平滑曲线)
    const forecast = h >= currentHour ? baseY + ((h * 41 + 55) % 200) - 100 : 0;

    data.push({
      hour: h,
      realtime,
      yesterday,
      forecast,
    });
  }
  return data;
}

export const realtimeLoadData = generateLoadData();

// ============================================================
// 辅助函数
// ============================================================

export function getAlertsByCategory(category: AlertCategory): AlertRecord[] {
  return alertRecords.filter((a) => a.category === category);
}

export function getAlertCountByCategory(category: AlertCategory): number {
  return alertRecords.filter((a) => a.category === category).length;
}

export function getCriticalAlertCount(): number {
  return alertRecords.filter((a) => a.severity === "critical").length;
}

export const alertCategoryLabels: Record<AlertCategory, { label: string; color: string; icon: string }> = {
  energy: { label: "能源异常", color: "#F59E0B", icon: "zap" },
  equipment: { label: "设备异常", color: "#EF4444", icon: "wrench" },
  environment: { label: "环境异常", color: "#3B82F6", icon: "thermometer" },
  data: { label: "数据异常", color: "#8B5CF6", icon: "wifi-off" },
};

// ============================================================
// 楼宇级别详细数据（每栋楼独立的空调与冷站、供热与锅炉、照明与动力数据 + 当日人数）
// ============================================================

export const buildingDetails: BuildingDetailData[] = [
  {
    buildingId: "b01", name: "主教学楼",
    todayOccupancy: 2850, maxOccupancy: 3200,
    todayElectricity: 4280, todayHeat: 3520, todayWater: 85, todayGas: 12,
    carbonEmission: 3.85,
    systems: [
      { name: "空调与冷站", efficiency: 78, energyConsumption: 1920, runningUnits: 6, totalUnits: 8, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "供热与锅炉", efficiency: 82, energyConsumption: 1450, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 88, energyConsumption: 910, runningUnits: 12, totalUnits: 14, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b02", name: "第一教学楼",
    todayOccupancy: 1620, maxOccupancy: 2000,
    todayElectricity: 2180, todayHeat: 1680, todayWater: 52, todayGas: 8,
    carbonEmission: 2.12,
    systems: [
      { name: "空调与冷站", efficiency: 85, energyConsumption: 980, runningUnits: 4, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 80, energyConsumption: 720, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 92, energyConsumption: 480, runningUnits: 8, totalUnits: 8, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b03", name: "第二教学楼",
    todayOccupancy: 1380, maxOccupancy: 1800,
    todayElectricity: 1850, todayHeat: 1420, todayWater: 45, todayGas: 6,
    carbonEmission: 1.78,
    systems: [
      { name: "空调与冷站", efficiency: 87, energyConsumption: 830, runningUnits: 3, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 79, energyConsumption: 610, runningUnits: 2, totalUnits: 2, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 90, energyConsumption: 410, runningUnits: 7, totalUnits: 8, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b04", name: "第三教学楼",
    todayOccupancy: 1050, maxOccupancy: 1500,
    todayElectricity: 1420, todayHeat: 1100, todayWater: 38, todayGas: 5,
    carbonEmission: 1.35,
    systems: [
      { name: "空调与冷站", efficiency: 90, energyConsumption: 640, runningUnits: 3, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 83, energyConsumption: 470, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 93, energyConsumption: 310, runningUnits: 6, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b05", name: "信息学院楼",
    todayOccupancy: 920, maxOccupancy: 1200,
    todayElectricity: 3680, todayHeat: 2100, todayWater: 42, todayGas: 7,
    carbonEmission: 3.42,
    systems: [
      { name: "空调与冷站", efficiency: 72, energyConsumption: 1680, runningUnits: 5, totalUnits: 6, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "供热与锅炉", efficiency: 76, energyConsumption: 900, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 85, energyConsumption: 1100, runningUnits: 10, totalUnits: 12, alarmCount: 1, lowEfficiencyCount: 1 },
    ],
  },
  {
    buildingId: "b06", name: "机械学院楼",
    todayOccupancy: 780, maxOccupancy: 1000,
    todayElectricity: 2950, todayHeat: 2800, todayWater: 55, todayGas: 18,
    carbonEmission: 3.15,
    systems: [
      { name: "空调与冷站", efficiency: 68, energyConsumption: 1200, runningUnits: 4, totalUnits: 6, alarmCount: 3, lowEfficiencyCount: 3 },
      { name: "供热与锅炉", efficiency: 74, energyConsumption: 1100, runningUnits: 3, totalUnits: 4, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "照明与动力", efficiency: 82, energyConsumption: 650, runningUnits: 8, totalUnits: 10, alarmCount: 1, lowEfficiencyCount: 1 },
    ],
  },
  {
    buildingId: "b07", name: "材料学院楼",
    todayOccupancy: 650, maxOccupancy: 900,
    todayElectricity: 2350, todayHeat: 1900, todayWater: 48, todayGas: 15,
    carbonEmission: 2.45,
    systems: [
      { name: "空调与冷站", efficiency: 80, energyConsumption: 1050, runningUnits: 3, totalUnits: 4, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 78, energyConsumption: 820, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 88, energyConsumption: 480, runningUnits: 7, totalUnits: 8, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b08", name: "能源学院楼",
    todayOccupancy: 580, maxOccupancy: 800,
    todayElectricity: 2780, todayHeat: 2200, todayWater: 40, todayGas: 12,
    carbonEmission: 2.78,
    systems: [
      { name: "空调与冷站", efficiency: 84, energyConsumption: 1250, runningUnits: 4, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 81, energyConsumption: 950, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 86, energyConsumption: 580, runningUnits: 8, totalUnits: 10, alarmCount: 0, lowEfficiencyCount: 1 },
    ],
  },
  {
    buildingId: "b09", name: "经管学院楼",
    todayOccupancy: 720, maxOccupancy: 950,
    todayElectricity: 1280, todayHeat: 980, todayWater: 35, todayGas: 4,
    carbonEmission: 1.22,
    systems: [
      { name: "空调与冷站", efficiency: 89, energyConsumption: 580, runningUnits: 3, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 85, energyConsumption: 420, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 94, energyConsumption: 280, runningUnits: 5, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b10", name: "图书馆",
    todayOccupancy: 3200, maxOccupancy: 3500,
    todayElectricity: 3150, todayHeat: 2400, todayWater: 65, todayGas: 3,
    carbonEmission: 2.95,
    systems: [
      { name: "空调与冷站", efficiency: 83, energyConsumption: 1420, runningUnits: 5, totalUnits: 6, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 80, energyConsumption: 1030, runningUnits: 2, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 90, energyConsumption: 700, runningUnits: 12, totalUnits: 14, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b11", name: "行政办公楼",
    todayOccupancy: 480, maxOccupancy: 600,
    todayElectricity: 1580, todayHeat: 1200, todayWater: 32, todayGas: 5,
    carbonEmission: 1.48,
    systems: [
      { name: "空调与冷站", efficiency: 86, energyConsumption: 710, runningUnits: 3, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 82, energyConsumption: 520, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 91, energyConsumption: 350, runningUnits: 6, totalUnits: 7, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b12", name: "大礼堂",
    todayOccupancy: 350, maxOccupancy: 1500,
    todayElectricity: 920, todayHeat: 680, todayWater: 18, todayGas: 2,
    carbonEmission: 0.82,
    systems: [
      { name: "空调与冷站", efficiency: 75, energyConsumption: 420, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 78, energyConsumption: 290, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 88, energyConsumption: 210, runningUnits: 5, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b13", name: "1号宿舍楼",
    todayOccupancy: 920, maxOccupancy: 1000,
    todayElectricity: 1950, todayHeat: 1800, todayWater: 95, todayGas: 20,
    carbonEmission: 2.05,
    systems: [
      { name: "空调与冷站", efficiency: 76, energyConsumption: 880, runningUnits: 3, totalUnits: 4, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "供热与锅炉", efficiency: 80, energyConsumption: 770, runningUnits: 2, totalUnits: 2, alarmCount: 1, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 89, energyConsumption: 300, runningUnits: 5, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b14", name: "2号宿舍楼",
    todayOccupancy: 880, maxOccupancy: 1000,
    todayElectricity: 1780, todayHeat: 1650, todayWater: 88, todayGas: 18,
    carbonEmission: 1.88,
    systems: [
      { name: "空调与冷站", efficiency: 82, energyConsumption: 800, runningUnits: 3, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 81, energyConsumption: 710, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 90, energyConsumption: 270, runningUnits: 5, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b15", name: "3号宿舍楼",
    todayOccupancy: 850, maxOccupancy: 1000,
    todayElectricity: 2100, todayHeat: 1750, todayWater: 92, todayGas: 22,
    carbonEmission: 2.18,
    systems: [
      { name: "空调与冷站", efficiency: 70, energyConsumption: 950, runningUnits: 3, totalUnits: 4, alarmCount: 2, lowEfficiencyCount: 3 },
      { name: "供热与锅炉", efficiency: 77, energyConsumption: 750, runningUnits: 2, totalUnits: 2, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 87, energyConsumption: 400, runningUnits: 5, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b16", name: "4号宿舍楼",
    todayOccupancy: 780, maxOccupancy: 950,
    todayElectricity: 1580, todayHeat: 1400, todayWater: 72, todayGas: 15,
    carbonEmission: 1.65,
    systems: [
      { name: "空调与冷站", efficiency: 84, energyConsumption: 710, runningUnits: 3, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 82, energyConsumption: 600, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 91, energyConsumption: 270, runningUnits: 5, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b17", name: "5号宿舍楼",
    todayOccupancy: 720, maxOccupancy: 900,
    todayElectricity: 1350, todayHeat: 1200, todayWater: 65, todayGas: 12,
    carbonEmission: 1.42,
    systems: [
      { name: "空调与冷站", efficiency: 86, energyConsumption: 610, runningUnits: 3, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 83, energyConsumption: 520, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 92, energyConsumption: 220, runningUnits: 4, totalUnits: 5, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b18", name: "6号宿舍楼",
    todayOccupancy: 680, maxOccupancy: 900,
    todayElectricity: 1120, todayHeat: 1050, todayWater: 58, todayGas: 10,
    carbonEmission: 1.18,
    systems: [
      { name: "空调与冷站", efficiency: 88, energyConsumption: 500, runningUnits: 2, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 84, energyConsumption: 450, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 93, energyConsumption: 170, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b19", name: "7号宿舍楼",
    todayOccupancy: 650, maxOccupancy: 850,
    todayElectricity: 1080, todayHeat: 980, todayWater: 55, todayGas: 9,
    carbonEmission: 1.12,
    systems: [
      { name: "空调与冷站", efficiency: 87, energyConsumption: 490, runningUnits: 2, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 83, energyConsumption: 420, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 91, energyConsumption: 170, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b20", name: "8号宿舍楼",
    todayOccupancy: 620, maxOccupancy: 850,
    todayElectricity: 850, todayHeat: 780, todayWater: 42, todayGas: 7,
    carbonEmission: 0.88,
    systems: [
      { name: "空调与冷站", efficiency: 90, energyConsumption: 380, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 86, energyConsumption: 340, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 94, energyConsumption: 130, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b21", name: "9号宿舍楼",
    todayOccupancy: 600, maxOccupancy: 800,
    todayElectricity: 980, todayHeat: 900, todayWater: 48, todayGas: 8,
    carbonEmission: 1.02,
    systems: [
      { name: "空调与冷站", efficiency: 88, energyConsumption: 440, runningUnits: 2, totalUnits: 3, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 84, energyConsumption: 390, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 92, energyConsumption: 150, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b22", name: "10号宿舍楼",
    todayOccupancy: 550, maxOccupancy: 800,
    todayElectricity: 750, todayHeat: 680, todayWater: 38, todayGas: 6,
    carbonEmission: 0.78,
    systems: [
      { name: "空调与冷站", efficiency: 91, energyConsumption: 340, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 87, energyConsumption: 290, runningUnits: 1, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 95, energyConsumption: 120, runningUnits: 3, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b23", name: "第一食堂",
    todayOccupancy: 4500, maxOccupancy: 5000,
    todayElectricity: 3420, todayHeat: 3200, todayWater: 180, todayGas: 85,
    carbonEmission: 3.65,
    systems: [
      { name: "空调与冷站", efficiency: 79, energyConsumption: 1540, runningUnits: 4, totalUnits: 5, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 72, energyConsumption: 1380, runningUnits: 3, totalUnits: 4, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "照明与动力", efficiency: 86, energyConsumption: 500, runningUnits: 8, totalUnits: 10, alarmCount: 0, lowEfficiencyCount: 1 },
    ],
  },
  {
    buildingId: "b24", name: "第二食堂",
    todayOccupancy: 3800, maxOccupancy: 4500,
    todayElectricity: 2950, todayHeat: 2800, todayWater: 150, todayGas: 72,
    carbonEmission: 3.12,
    systems: [
      { name: "空调与冷站", efficiency: 81, energyConsumption: 1330, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 75, energyConsumption: 1200, runningUnits: 2, totalUnits: 3, alarmCount: 1, lowEfficiencyCount: 2 },
      { name: "照明与动力", efficiency: 88, energyConsumption: 420, runningUnits: 7, totalUnits: 8, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b25", name: "体育馆",
    todayOccupancy: 280, maxOccupancy: 3000,
    todayElectricity: 2400, todayHeat: 1800, todayWater: 120, todayGas: 5,
    carbonEmission: 2.28,
    systems: [
      { name: "空调与冷站", efficiency: 77, energyConsumption: 1080, runningUnits: 3, totalUnits: 4, alarmCount: 1, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 80, energyConsumption: 780, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "照明与动力", efficiency: 85, energyConsumption: 540, runningUnits: 8, totalUnits: 10, alarmCount: 0, lowEfficiencyCount: 1 },
    ],
  },
  {
    buildingId: "b26", name: "综合实验中心",
    todayOccupancy: 420, maxOccupancy: 600,
    todayElectricity: 4200, todayHeat: 3500, todayWater: 80, todayGas: 25,
    carbonEmission: 4.25,
    systems: [
      { name: "空调与冷站", efficiency: 65, energyConsumption: 1900, runningUnits: 5, totalUnits: 7, alarmCount: 3, lowEfficiencyCount: 3 },
      { name: "供热与锅炉", efficiency: 70, energyConsumption: 1500, runningUnits: 3, totalUnits: 4, alarmCount: 2, lowEfficiencyCount: 2 },
      { name: "照明与动力", efficiency: 80, energyConsumption: 800, runningUnits: 10, totalUnits: 14, alarmCount: 1, lowEfficiencyCount: 2 },
    ],
  },
  {
    buildingId: "b27", name: "数据中心",
    todayOccupancy: 15, maxOccupancy: 30,
    todayElectricity: 5800, todayHeat: 500, todayWater: 8, todayGas: 0,
    carbonEmission: 5.15,
    systems: [
      { name: "空调与冷站", efficiency: 92, energyConsumption: 4200, runningUnits: 6, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 95, energyConsumption: 50, runningUnits: 1, totalUnits: 1, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 96, energyConsumption: 1550, runningUnits: 4, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b28", name: "光伏配电房",
    todayOccupancy: 5, maxOccupancy: 10,
    todayElectricity: -320, todayHeat: 0, todayWater: 2, todayGas: 0,
    carbonEmission: -0.28,
    systems: [
      { name: "空调与冷站", efficiency: 0, energyConsumption: 0, runningUnits: 0, totalUnits: 0, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "供热与锅炉", efficiency: 0, energyConsumption: 0, runningUnits: 0, totalUnits: 0, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 98, energyConsumption: -320, runningUnits: 1, totalUnits: 1, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
  {
    buildingId: "b29", name: "校医院",
    todayOccupancy: 320, maxOccupancy: 500,
    todayElectricity: 1650, todayHeat: 1400, todayWater: 65, todayGas: 10,
    carbonEmission: 1.72,
    systems: [
      { name: "空调与冷站", efficiency: 83, energyConsumption: 740, runningUnits: 3, totalUnits: 4, alarmCount: 0, lowEfficiencyCount: 1 },
      { name: "供热与锅炉", efficiency: 80, energyConsumption: 600, runningUnits: 2, totalUnits: 2, alarmCount: 0, lowEfficiencyCount: 0 },
      { name: "照明与动力", efficiency: 89, energyConsumption: 310, runningUnits: 5, totalUnits: 6, alarmCount: 0, lowEfficiencyCount: 0 },
    ],
  },
];

export function getBuildingDetail(buildingId: string): BuildingDetailData | undefined {
  return buildingDetails.find((b) => b.buildingId === buildingId);
}

// ============================================================
// 新驾驶舱页面所需类型与数据
// ============================================================

export interface OperationsKPI {
  type: string;
  label: string;
  value: string;
  unit: string;
  yoy: number;
  budgetProgress: number;
}

export interface CarbonOverview {
  annual: number;
  monthly: number;
  today: number;
  yoy: number;
  scope1: number;
  scope1Pct: number;
  scope2: number;
  scope2Pct: number;
  scope3: number;
  scope3Pct: number;
}

export interface AlertItem {
  title: string;
  location: string;
  level: "emergency" | "important" | "minor";
  time: string;
  category: string;
}

export interface DeviceWarningItem {
  device: string;
  issue: string;
  level: "emergency" | "important" | "minor";
  time: string;
}

export interface SystemEfficiencyItem {
  name: string;
  efficiency: number;
  runningUnits: number;
  totalUnits: number;
  lowEfficiencyCount: number;
}

export interface InstrumentStatus {
  onlineRate: number;
  onlineCount: number;
  offlineCount: number;
  totalCount: number;
  completenessRate: number;
  completeCount: number;
  missingCount: number;
}

export interface BuildingEnergyRankItem {
  name: string;
  value: number;
}

export interface LoadCurvePoint {
  time: string;
  realtime: number;
  yesterday: number;
  forecast: number;
}

export function getOperationsKPIs(now = new Date()): OperationsKPI[] {
  const snapshot = getCampusOperationalSnapshot(now);
  return [
    { type: "electricity", label: "今日用电", value: snapshot.todayElectricity.toLocaleString("zh-CN"), unit: "kWh", yoy: -1.9, budgetProgress: Math.min(100, Math.round(snapshot.todayElectricity / 98_000 * 100)) },
    { type: "water", label: "今日用水", value: snapshot.todayWater.toLocaleString("zh-CN"), unit: "m³", yoy: 2.6, budgetProgress: Math.min(100, Math.round(snapshot.todayWater / 5_000 * 100)) },
    { type: "heat", label: "今日热力", value: snapshot.todayHeat.toLocaleString("zh-CN"), unit: "GJ", yoy: -4.1, budgetProgress: snapshot.todayHeat > 0 ? Math.min(100, Math.round(snapshot.todayHeat / 1_350 * 100)) : 0 },
    { type: "energy", label: "今日综合能耗", value: snapshot.comprehensiveEnergyTce.toFixed(1), unit: "tce", yoy: 1.4, budgetProgress: Math.min(100, Math.round(snapshot.comprehensiveEnergyTce / 13.5 * 100)) },
  ];
}

export function getCarbonOverview(now = new Date()): CarbonOverview {
  const snapshot = getCampusOperationalSnapshot(now);
  const monthly = getSystemMonthlyCarbon(now);
  const latestMonth = monthly.at(-1)?.actual ?? 0;
  const previousMonth = monthly.at(-2)?.actual ?? 0;
  const scope1 = Math.round(snapshot.annualCarbon * 0.18);
  const scope2 = Math.round(snapshot.annualCarbon * 0.74);
  const scope3 = snapshot.annualCarbon - scope1 - scope2;
  return {
    annual: snapshot.annualCarbon,
    monthly: latestMonth - previousMonth,
    today: snapshot.todayCarbon,
    yoy: snapshot.yoy,
    scope1,
    scope1Pct: 18,
    scope2,
    scope2Pct: 74,
    scope3,
    scope3Pct: 8,
  };
}

export function getAlertsData(now = new Date()): AlertItem[] {
  const categoryLabels = { energy: "能耗", device: "设备", environment: "环境", data: "数据" } as const;
  return getSystemAnomalySnapshots(now)
    .filter((anomaly) => anomaly.status !== "resolved")
    .slice(0, 8)
    .map((anomaly) => ({
      title: anomaly.title,
      location: anomaly.buildingName,
      level: anomaly.severity === "emergency" || anomaly.severity === "critical" ? "emergency" : anomaly.severity === "warning" ? "important" : "minor",
      time: formatCampusTime(new Date(anomaly.detectedAt)),
      category: categoryLabels[anomaly.category],
    }));
}

export function getDeviceWarnings(now = new Date()): DeviceWarningItem[] {
  return getSystemAnomalySnapshots(now)
    .filter((anomaly) => anomaly.deviceName && anomaly.status !== "resolved")
    .slice(0, 7)
    .map((anomaly) => ({
      device: anomaly.deviceName ?? anomaly.title,
      issue: anomaly.title,
      level: anomaly.severity === "emergency" || anomaly.severity === "critical" ? "emergency" : anomaly.severity === "warning" ? "important" : "minor",
      time: formatCampusTime(new Date(anomaly.detectedAt)),
    }));
}

export function getSystemEfficiency(): SystemEfficiencyItem[] {
  return [
    { name: "空调与冷站", efficiency: 73, runningUnits: 18, totalUnits: 24, lowEfficiencyCount: 4 },
    { name: "实验与动力", efficiency: 78, runningUnits: 21, totalUnits: 26, lowEfficiencyCount: 3 },
    { name: "照明系统", efficiency: 86, runningUnits: 48, totalUnits: 56, lowEfficiencyCount: 2 },
    { name: "给排水系统", efficiency: 69, runningUnits: 13, totalUnits: 16, lowEfficiencyCount: 3 },
  ];
}

export function getInstrumentStatus(): InstrumentStatus {
  return {
    onlineRate: 94.1,
    onlineCount: 175,
    offlineCount: 11,
    totalCount: 186,
    completenessRate: 96.8,
    completeCount: 180,
    missingCount: 6,
  };
}

export function getBuildingEnergyRanking(now = new Date()): BuildingEnergyRankItem[] {
  return getSystemBuildingRanking(now, 9).map((building) => ({ name: building.name, value: building.energyIntensity }));
}

export function getRealtimeLoadData(now = new Date()): LoadCurvePoint[] {
  const end = startOfCampusHour(now);
  return Array.from({ length: 24 }, (_, index) => {
    const pointTime = addHours(end, index - 23);
    const yesterdayTime = addHours(pointTime, -24);
    return {
      time: formatCampusTime(pointTime),
      realtime: getCampusLoadKw(pointTime, 1),
      yesterday: getCampusLoadKw(yesterdayTime, 2),
      forecast: getCampusForecastLoadKw(pointTime),
    };
  });
}
