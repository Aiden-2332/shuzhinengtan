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
// 年度履约进度
// ============================================================

export interface ComplianceProgressData {
  year: number;
  overallProgress: number; // 0-100
  quotaProgress: { used: number; total: number; pct: number };
  tasks: {
    completed: number;
    inProgress: number;
    atRisk: number;
    overdue: number;
    total: number;
  };
  monthlyProgress: { month: string; progress: number }[];
  keyMilestones: { label: string; deadline: string; status: "completed" | "on_track" | "at_risk" | "overdue"; progress: number }[];
}

export const complianceProgressData: ComplianceProgressData = {
  year: 2026,
  overallProgress: 68,
  quotaProgress: { used: 16850, total: 21500, pct: 78 },
  tasks: { completed: 2, inProgress: 2, atRisk: 1, overdue: 1, total: 6 },
  monthlyProgress: [
    { month: "1月", progress: 95 },
    { month: "2月", progress: 92 },
    { month: "3月", progress: 88 },
    { month: "4月", progress: 85 },
    { month: "5月", progress: 82 },
    { month: "6月", progress: 78 },
    { month: "7月", progress: 72 },
    { month: "8月", progress: 65 },
    { month: "9月", progress: 55 },
    { month: "10月", progress: 40 },
    { month: "11月", progress: 25 },
    { month: "12月", progress: 10 },
  ],
  keyMilestones: [
    { label: "年度核查准备", deadline: "06-30", status: "completed", progress: 100 },
    { label: "碳市场账户年检", deadline: "03-31", status: "completed", progress: 100 },
    { label: "月度数据上报", deadline: "07-31", status: "at_risk", progress: 80 },
    { label: "CCER抵销备案", deadline: "09-30", status: "on_track", progress: 40 },
    { label: "配额清缴报告", deadline: "10-31", status: "on_track", progress: 60 },
    { label: "碳排放年度报告", deadline: "12-31", status: "on_track", progress: 0 },
  ],
};

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
// 逐年递减体现碳减排成效，2024 最高，2026 最低
export const monthlyTrendData2024: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1680, target: 1800, forecast: 1650 },
  { month: "2月", actual: 2600, target: 2800, forecast: 2550 },
  { month: "3月", actual: 3750, target: 4000, forecast: 3680 },
  { month: "4月", actual: 5050, target: 5400, forecast: 4950 },
  { month: "5月", actual: 6550, target: 7000, forecast: 6420 },
  { month: "6月", actual: 8280, target: 8800, forecast: 8100 },
  { month: "7月", actual: 10020, target: 10600, forecast: 9780 },
  { month: "8月", actual: 11550, target: 12200, forecast: 11280 },
  { month: "9月", actual: 12980, target: 13600, forecast: 12650 },
  { month: "10月", actual: 14300, target: 15000, forecast: 13900 },
  { month: "11月", actual: 15450, target: 16200, forecast: 15000 },
  { month: "12月", actual: 16420, target: 17200, forecast: 15900 },
];

export const monthlyTrendData2025: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1480, target: 1600, forecast: 1450 },
  { month: "2月", actual: 2300, target: 2500, forecast: 2250 },
  { month: "3月", actual: 3280, target: 3500, forecast: 3200 },
  { month: "4月", actual: 4420, target: 4700, forecast: 4320 },
  { month: "5月", actual: 5750, target: 6100, forecast: 5620 },
  { month: "6月", actual: 7280, target: 7700, forecast: 7100 },
  { month: "7月", actual: 8850, target: 9300, forecast: 8620 },
  { month: "8月", actual: 10180, target: 10700, forecast: 9920 },
  { month: "9月", actual: 11500, target: 12000, forecast: 11200 },
  { month: "10月", actual: 12650, target: 13200, forecast: 12300 },
  { month: "11月", actual: 13680, target: 14300, forecast: 13300 },
  { month: "12月", actual: 14580, target: 15200, forecast: 14100 },
];

export const monthlyTrendData2026: MonthlyTrendPoint[] = [
  { month: "1月", actual: 1280, target: 1400, forecast: 1250 },
  { month: "2月", actual: 2000, target: 2200, forecast: 1950 },
  { month: "3月", actual: 2820, target: 3050, forecast: 2750 },
  { month: "4月", actual: 3780, target: 4050, forecast: 3680 },
  { month: "5月", actual: 4920, target: 5250, forecast: 4800 },
  { month: "6月", actual: 6280, target: 6650, forecast: 6100 },
  { month: "7月", actual: 7650, target: 8050, forecast: 7420 },
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
