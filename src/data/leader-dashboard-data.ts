/**
 * 领导组驾驶舱 - 专用数据
 *
 * 涵盖：顶部KPI、经济控制分区、排放源构成、风险预警、
 *       近12个月月度趋势、资源消耗分析、三类组成、排放TOP 5
 */

import {
  getCampusDateParts,
} from "@/lib/campus-realtime";
import {
  CAMPUS_CARBON_TARGET,
  getCampusOperationalSnapshot,
  getSystemAnomalySnapshots,
  getSystemBuildingRanking,
  getSystemRollingMonthlyCarbon,
} from "@/data/campus-system-data";

// ============================================================
// 顶部 KPI
// ============================================================

export interface LeaderKPI {
  label: string;
  value: string;
  unit: string;
  sub?: string;
}

export const leaderKPIs: LeaderKPI[] = [
  { label: "年度碳排放", value: "12,680", unit: "tCO₂", sub: "同比 ↓3.2%" },
  { label: "配额消耗", value: "86", unit: "%", sub: "已用 10,340 / 12,000" },
  { label: "剩余配额", value: "1,660", unit: "tCO₂", sub: "可用至年底" },
  { label: "排放强度", value: "12.8", unit: "kgCO₂/㎡", sub: "低于行业均值" },
  { label: "数据完整率", value: "96.5", unit: "%", sub: "在线 175/186 台" },
];

// ============================================================
// 经济控制分区
// ============================================================

export interface EconomicZoneData {
  totalQuota: number;
  usedQuota: number;
  riskLevel: "normal" | "warning" | "critical";
  riskLabel: string;
  quotaCompliance: { label: string; value: number; max: number }[];
  costControl: { label: string; value: number; max: number }[];
}

export const economicZoneData: EconomicZoneData = {
  totalQuota: 12000,
  usedQuota: 10340,
  riskLevel: "warning",
  riskLabel: "超配风险",
  quotaCompliance: [
    { label: "配额使用率", value: 86, max: 100 },
    { label: "月度进度", value: 72, max: 100 },
    { label: "履约进度", value: 68, max: 100 },
  ],
  costControl: [
    { label: "碳价波动风险", value: 45, max: 100 },
    { label: "减排成本效率", value: 78, max: 100 },
    { label: "碳资产收益率", value: 62, max: 100 },
  ],
};

// ============================================================
// 排放源构成 (环形图)
// ============================================================

export interface EmissionSourceItem {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

export const emissionSourceData: EmissionSourceItem[] = [
  { name: "空调系统", value: 5199, color: "#3B82F6", percentage: 41 },
  { name: "照明系统", value: 2409, color: "#F59E0B", percentage: 19 },
  { name: "锅炉/供热", value: 1775, color: "#EF4444", percentage: 14 },
  { name: "动力系统", value: 1522, color: "#8B5CF6", percentage: 12 },
  { name: "其他", value: 1775, color: "#6B7280", percentage: 14 },
];

// ============================================================
// 风险预警
// ============================================================

export interface RiskWarning {
  label: string;
  value: string;
  status: "danger" | "warning" | "normal";
  desc: string;
}

export const riskWarnings: RiskWarning[] = [
  { label: "配额缺口预估", value: "+400 tCO₂", status: "danger", desc: "按当前趋势年底将超配额" },
  { label: "剩余配额月度分配", value: "415 tCO₂/月", status: "warning", desc: "剩余4个月，月均可用配额" },
  { label: "异常建筑", value: "3 栋", status: "warning", desc: "信息学院楼、第一食堂、综合实验中心" },
  { label: "超标建筑", value: "0 栋", status: "normal", desc: "所有建筑排放均在合理范围" },
];

// ============================================================
// 月度累计趋势 (折线图)
// ============================================================

export interface MonthlyTrendPoint {
  month: string;
  monthKey: string;
  actual: number;
  target: number;
  forecast: number;
}

export function getMonthlyTrendData(now: Date): MonthlyTrendPoint[] {
  return getSystemRollingMonthlyCarbon(now);
}

// ============================================================
// 资源消耗分析
// ============================================================

export interface ResourceConsumptionItem {
  label: string;
  totalValue: string;
  totalUnit: string;
  perCapitaValue: string;
  perCapitaUnit: string;
  yoy: number;    // 同比 %
  mom: number;    // 环比 %
  yoyLabel: string;
  momLabel: string;
}

export const resourceConsumptionData: ResourceConsumptionItem[] = [
  { label: "碳排放", totalValue: "12,680", totalUnit: "tCO₂", perCapitaValue: "0.58", perCapitaUnit: "tCO₂/人", yoy: -8.6, mom: 2.3, yoyLabel: "同比 ↓8.6%", momLabel: "环比 ↑2.3%" },
  { label: "能源消耗", totalValue: "26,450", totalUnit: "MWh", perCapitaValue: "1.21", perCapitaUnit: "MWh/人", yoy: -6.2, mom: 1.8, yoyLabel: "同比 ↓6.2%", momLabel: "环比 ↑1.8%" },
  { label: "水消耗", totalValue: "128,600", totalUnit: "m³", perCapitaValue: "5.9", perCapitaUnit: "m³/人", yoy: -4.1, mom: 3.2, yoyLabel: "同比 ↓4.1%", momLabel: "环比 ↑3.2%" },
];

// ============================================================
// 三类组成环形图
// ============================================================

export interface CompositionItem {
  name: string;
  value: number;
  color: string;
}

export const carbonCompositionData: CompositionItem[] = [
  { name: "实验楼", value: 34, color: "#3B82F6" },
  { name: "宿舍", value: 27, color: "#F59E0B" },
  { name: "教学楼", value: 20, color: "#EF4444" },
  { name: "食堂", value: 11, color: "#8B5CF6" },
  { name: "体育馆", value: 8, color: "#10B981" },
];

export const energyCompositionData: CompositionItem[] = [
  { name: "实验楼", value: 31, color: "#3B82F6" },
  { name: "宿舍", value: 28, color: "#F59E0B" },
  { name: "教学楼", value: 21, color: "#EF4444" },
  { name: "食堂", value: 11, color: "#8B5CF6" },
  { name: "体育馆", value: 9, color: "#10B981" },
];

export const waterCompositionData: CompositionItem[] = [
  { name: "宿舍", value: 36, color: "#F59E0B" },
  { name: "教学楼", value: 25, color: "#3B82F6" },
  { name: "实验楼", value: 18, color: "#EF4444" },
  { name: "食堂", value: 13, color: "#8B5CF6" },
  { name: "体育馆", value: 8, color: "#10B981" },
];

// ============================================================
// 排放 TOP 5
// ============================================================

export interface EmissionRankingItem {
  name: string;
  value: number;
  unit: string;
  color: string;
}

export const emissionRankingData: EmissionRankingItem[] = [
  { name: "材料测试楼", value: 1850, unit: "tCO₂", color: "#EF4444" },
  { name: "机电信息楼", value: 1720, unit: "tCO₂", color: "#F97316" },
  { name: "图书馆", value: 1580, unit: "tCO₂", color: "#F59E0B" },
  { name: "实验楼", value: 1540, unit: "tCO₂", color: "#EAB308" },
  { name: "鼎新楼", value: 1510, unit: "tCO₂", color: "#84CC16" },
];

export function getLeaderKPIs(now = new Date()): LeaderKPI[] {
  const snapshot = getCampusOperationalSnapshot(now);
  return [
    { label: "本年累计碳排放", value: snapshot.annualCarbon.toLocaleString("zh-CN"), unit: "tCO₂e", sub: `同比 ${snapshot.yoy}%` },
    { label: "年度配额使用率", value: snapshot.quotaUseRate.toFixed(1), unit: "%", sub: `已用 ${snapshot.annualCarbon.toLocaleString("zh-CN")} / ${snapshot.annualQuota.toLocaleString("zh-CN")}` },
    { label: "剩余配额", value: snapshot.remainingQuota.toLocaleString("zh-CN"), unit: "tCO₂e", sub: `年末预测缺口 ${Math.max(0, snapshot.annualForecast - snapshot.annualQuota).toLocaleString("zh-CN")}` },
    { label: "年末排放预测", value: snapshot.annualForecast.toLocaleString("zh-CN"), unit: "tCO₂e", sub: `较年度目标 +${(snapshot.annualForecast - CAMPUS_CARBON_TARGET).toLocaleString("zh-CN")}` },
    { label: "数据完整率", value: snapshot.dataCompletenessRate.toFixed(1), unit: "%", sub: "仪表在线 175/186 台" },
  ];
}

export interface BuildingPriorityItem {
  id: string;
  name: string;
  carbonIntensity: number;
  targetGapPct: number;
  emission: number;
  level: "danger" | "warning" | "normal";
}

export function getEconomicZoneData(now = new Date()): EconomicZoneData {
  const snapshot = getCampusOperationalSnapshot(now);
  const { month } = getCampusDateParts(now);
  const forecastGap = snapshot.annualForecast - snapshot.annualQuota;
  return {
    totalQuota: snapshot.annualQuota,
    usedQuota: snapshot.annualCarbon,
    riskLevel: forecastGap > 0 ? "critical" : snapshot.quotaUseRate > 85 ? "warning" : "normal",
    riskLabel: forecastGap > 0 ? "预计超配" : "配额可控",
    quotaCompliance: [
      { label: "配额使用率", value: snapshot.quotaUseRate, max: 100 },
      { label: "年度时间进度", value: Math.round(month / 12 * 100), max: 100 },
      { label: "数据完整率", value: snapshot.dataCompletenessRate, max: 100 },
    ],
    costControl: [
      { label: "碳价波动风险", value: 45, max: 100 },
      { label: "减排计划完成率", value: 38, max: 100 },
      { label: "异常闭环率", value: 54, max: 100 },
    ],
  };
}

export function getEmissionSourceData(now = new Date()): EmissionSourceItem[] {
  const total = getCampusOperationalSnapshot(now).annualCarbon;
  const shares = [
    { name: "空调系统", percentage: 39, color: "#3B82F6" },
    { name: "照明系统", percentage: 18, color: "#F59E0B" },
    { name: "供热与燃气", percentage: 16, color: "#EF4444" },
    { name: "实验与动力设备", percentage: 17, color: "#8B5CF6" },
    { name: "其他", percentage: 10, color: "#6B7280" },
  ];
  return shares.map((item) => ({ ...item, value: Math.round(total * item.percentage / 100) }));
}

export function getRiskWarnings(now = new Date()): RiskWarning[] {
  const snapshot = getCampusOperationalSnapshot(now);
  const anomalies = getSystemAnomalySnapshots(now).filter((item) => item.status !== "resolved");
  const abnormalBuildings = [...new Set(anomalies.map((item) => item.buildingName))];
  const forecastGap = snapshot.annualForecast - snapshot.annualQuota;
  return [
    { label: "年末配额缺口预估", value: `+${forecastGap.toLocaleString("zh-CN")} tCO₂e`, status: "danger", desc: "按当前负荷与季节模型预测，年末将超过年度配额" },
    { label: "重点异常楼宇", value: `${abnormalBuildings.length} 栋`, status: "danger", desc: abnormalBuildings.slice(0, 4).join("、") },
    { label: "待闭环异常", value: `${anomalies.length} 项`, status: "warning", desc: "包含能耗、设备、环境与数据质量四类问题" },
    { label: "数据完整率", value: `${snapshot.dataCompletenessRate}%`, status: "warning", desc: "3斋水表离线导致最新分项数据需要估算补齐" },
  ];
}

export function getResourceConsumptionData(now = new Date()): ResourceConsumptionItem[] {
  const snapshot = getCampusOperationalSnapshot(now);
  const { month } = getCampusDateParts(now);
  const calendarProgress = month / 12;
  const population = 26_800;
  const electricityMwh = Math.round(28_600 * calendarProgress);
  const water = Math.round(1_420_000 * calendarProgress);
  return [
    { label: "碳排放", totalValue: snapshot.annualCarbon.toLocaleString("zh-CN"), totalUnit: "tCO₂e", perCapitaValue: (snapshot.annualCarbon / population).toFixed(2), perCapitaUnit: "tCO₂e/人", yoy: snapshot.yoy, mom: 3.4, yoyLabel: `同比 ${snapshot.yoy}%`, momLabel: "环比 +3.4%" },
    { label: "外购电力", totalValue: electricityMwh.toLocaleString("zh-CN"), totalUnit: "MWh", perCapitaValue: (electricityMwh / population).toFixed(2), perCapitaUnit: "MWh/人", yoy: -1.9, mom: 4.8, yoyLabel: "同比 -1.9%", momLabel: "环比 +4.8%" },
    { label: "水消耗", totalValue: water.toLocaleString("zh-CN"), totalUnit: "m³", perCapitaValue: (water / population).toFixed(1), perCapitaUnit: "m³/人", yoy: 2.6, mom: 5.1, yoyLabel: "同比 +2.6%", momLabel: "环比 +5.1%" },
  ];
}

export function getEmissionRankingData(now = new Date()): EmissionRankingItem[] {
  const colors = ["#EF4444", "#F97316", "#F59E0B", "#EAB308", "#84CC16"];
  return getSystemBuildingRanking(now, 5).map((building, index) => ({
    name: building.name,
    value: building.currentYearEmission,
    unit: "tCO₂e",
    color: colors[index],
  }));
}

export function getBuildingPriorityData(now = new Date()): BuildingPriorityItem[] {
  return getSystemBuildingRanking(now, 10).map((building) => {
    const carbonIntensity = building.area > 0
      ? building.annualEmissionForecast * 1000 / building.area
      : 0;
    const level = building.overTargetPct >= 15 || carbonIntensity >= 95
      ? "danger"
      : building.overTargetPct >= 10 || carbonIntensity >= 75
        ? "warning"
        : "normal";

    return {
      id: building.id,
      name: building.name,
      carbonIntensity: Math.round(carbonIntensity * 10) / 10,
      targetGapPct: building.overTargetPct,
      emission: building.currentYearEmission,
      level,
    };
  });
}
