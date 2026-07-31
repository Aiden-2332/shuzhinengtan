/**
 * 领导组驾驶舱 - 专用数据
 *
 * 涵盖：顶部KPI、经济控制分区、排放源构成、风险预警、
 *       月度累计趋势、资源消耗分析、三类组成、排放TOP 5
 */

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
  actual: number;
  target: number;
  forecast: number;
}

// 三年月度累计数据：2024/2025 全年，2026 仅到 7 月
export const monthlyTrendData2024: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1380, target: 1500, forecast: 1350 },
  { month: "2月", actual: 2100, target: 2300, forecast: 2050 },
  { month: "3月", actual: 2950, target: 3200, forecast: 2880 },
  { month: "4月", actual: 3850, target: 4200, forecast: 3750 },
  { month: "5月", actual: 4950, target: 5400, forecast: 4820 },
  { month: "6月", actual: 6280, target: 6800, forecast: 6100 },
  { month: "7月", actual: 7620, target: 8200, forecast: 7380 },
  { month: "8月", actual: 8750, target: 9400, forecast: 8480 },
  { month: "9月", actual: 9980, target: 10600, forecast: 9650 },
  { month: "10月", actual: 11100, target: 11800, forecast: 10700 },
  { month: "11月", actual: 11850, target: 12600, forecast: 11300 },
  { month: "12月", actual: 12420, target: 14000, forecast: 11600 },
];

export const monthlyTrendData2025: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1400, target: 1520, forecast: 1360 },
  { month: "2月", actual: 2150, target: 2350, forecast: 2080 },
  { month: "3月", actual: 2980, target: 3250, forecast: 2900 },
  { month: "4月", actual: 3920, target: 4250, forecast: 3800 },
  { month: "5月", actual: 5050, target: 5450, forecast: 4900 },
  { month: "6月", actual: 6380, target: 6850, forecast: 6180 },
  { month: "7月", actual: 7750, target: 8250, forecast: 7480 },
  { month: "8月", actual: 8880, target: 9450, forecast: 8580 },
  { month: "9月", actual: 10100, target: 10700, forecast: 9750 },
  { month: "10月", actual: 11250, target: 11900, forecast: 10800 },
  { month: "11月", actual: 11980, target: 12700, forecast: 11400 },
  { month: "12月", actual: 12580, target: 14100, forecast: 11700 },
];

export const monthlyTrendData2026: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1420, target: 1550, forecast: 1380 },
  { month: "2月", actual: 2180, target: 2400, forecast: 2100 },
  { month: "3月", actual: 3020, target: 3300, forecast: 2950 },
  { month: "4月", actual: 3980, target: 4300, forecast: 3850 },
  { month: "5月", actual: 5120, target: 5500, forecast: 4980 },
  { month: "6月", actual: 6480, target: 6900, forecast: 6250 },
  { month: "7月", actual: 7850, target: 8300, forecast: 7580 },
];

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
  { name: "科研楼A", value: 2850, unit: "tCO₂", color: "#EF4444" },
  { name: "主教学楼", value: 2400, unit: "tCO₂", color: "#F97316" },
  { name: "机械学院楼", value: 2200, unit: "tCO₂", color: "#F59E0B" },
  { name: "第一教学楼", value: 1850, unit: "tCO₂", color: "#EAB308" },
  { name: "信息学院", value: 1650, unit: "tCO₂", color: "#84CC16" },
];
