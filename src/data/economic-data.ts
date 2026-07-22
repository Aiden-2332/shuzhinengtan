// 碳经济控制分区模拟数据

export interface MonthlyTrend {
  month: string;
  emission: number;   // tCO₂
  cumulative: number; // tCO₂ 累计
  cost: number;       // 万元 能源支出
  perCapita: number;  // kgCO₂/人
}

export interface EmissionBreakdown {
  name: string;
  value: number;      // tCO₂
  color: string;
}

export interface CostItem {
  category: string;
  budget: number;     // 万元
  actual: number;     // 万元
  type: "income" | "expenditure";
}

export interface RetrofitProject {
  name: string;
  investment: number;  // 万元
  roi: number;         // 年回报率 %
  paybackPeriod: number; // 年
  annualSaving: number;  // 万元/年
}

// 年度配额常量
export const ANNUAL_QUOTA = 12000; // tCO₂
export const CARBON_PRICE = 98;    // 元/tCO₂

// 月度累计趋势数据
export function getMonthlyTrends(): MonthlyTrend[] {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const values = [580, 620, 750, 820, 890, 960, 1050, 1100, 920, 880, 790, 680];
  let cumulative = 0;
  return months.map((month, i) => {
    cumulative += values[i];
    return {
      month,
      emission: values[i],
      cumulative,
      cost: Math.round(values[i] * 0.85 * 10) / 10,
      perCapita: Math.round((values[i] * 1000 / 25000) * 10) / 10,
    };
  });
}

// 碳排放分项构成（按排放源分类）
export function getEmissionBreakdown(): EmissionBreakdown[] {
  return [
    { name: "空调系统", value: 4120, color: "#3B82F6" },
    { name: "照明系统", value: 1860, color: "#10B981" },
    { name: "锅炉/供热", value: 1420, color: "#F59E0B" },
    { name: "动力系统", value: 1160, color: "#8B5CF6" },
    { name: "办公设备", value: 640, color: "#EC4899" },
    { name: "数据中心", value: 520, color: "#06B6D4" },
    { name: "其他", value: 240, color: "#6B7280" },
  ];
}

// 碳排放分项按人均
export function getPerCapitaBreakdown(): EmissionBreakdown[] {
  return getEmissionBreakdown().map((item) => ({
    ...item,
    value: Math.round((item.value * 1000 / 25000) * 10) / 10, // kgCO₂/人
  }));
}

// 碳相关收支结构
export function getCostStructure() {
  return {
    expenditure: [
      { category: "碳配额购买", value: 588, color: "#EF4444" },
      { category: "电力采购", value: 1260, color: "#F59E0B" },
      { category: "天然气采购", value: 420, color: "#3B82F6" },
      { category: "热力采购", value: 340, color: "#8B5CF6" },
      { category: "设备运维", value: 180, color: "#6B7280" },
    ],
    income: [
      { category: "财政补贴", value: 320, color: "#10B981" },
      { category: "碳配额出售", value: 120, color: "#34D399" },
      { category: "绿证交易", value: 85, color: "#6EE7B7" },
      { category: "节能奖励", value: 45, color: "#A7F3D0" },
    ],
  };
}

// 月度双轴联动数据
export function getMonthlyDualAxis() {
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
  const emissions = [580, 620, 750, 820, 890, 960, 1050, 1100, 920, 880, 790, 680];
  const costs = [493, 527, 638, 697, 757, 816, 893, 935, 782, 748, 672, 578];
  return months.map((month, i) => ({
    month,
    emission: emissions[i],
    cost: costs[i],
  }));
}

// 节能改造项目投入回报
export function getRetrofitProjects(): RetrofitProject[] {
  return [
    { name: "光伏发电", investment: 480, roi: 14.5, paybackPeriod: 6.9, annualSaving: 69.6 },
    { name: "LED照明改造", investment: 160, roi: 38.2, paybackPeriod: 2.6, annualSaving: 61.1 },
    { name: "空调智能控制", investment: 280, roi: 22.8, paybackPeriod: 4.4, annualSaving: 63.8 },
    { name: "楼宇能耗监测", investment: 95, roi: 45.6, paybackPeriod: 2.2, annualSaving: 43.3 },
    { name: "供热管网改造", investment: 350, roi: 18.5, paybackPeriod: 5.4, annualSaving: 64.8 },
    { name: "雨水回收系统", investment: 120, roi: 12.3, paybackPeriod: 8.1, annualSaving: 14.8 },
  ];
}

// 配额缺口预估
export function getQuotaGap() {
  const used = 10340;
  const quota = ANNUAL_QUOTA;
  const remaining = quota - used;
  const projectedYearEnd = 12400;
  const gap = projectedYearEnd - quota;
  return {
    used,
    quota,
    remaining,
    projectedYearEnd,
    gap: gap > 0 ? gap : 0,
    remainingMonths: 4,
    monthlyAvgLeft: Math.round(remaining / 4),
    monthlyAvgNeeded: gap > 0 ? Math.round(gap / 4) : 0,
  };
}

// 预算状态
export function getBudgetStatus() {
  return {
    totalBudget: 2800,    // 万元 年度碳预算总额
    totalSpent: 2460,     // 万元 已支出
    remaining: 340,       // 万元 剩余
    spendingRate: 87.9,   // % 支出率
    isOverBudget: false,
    projectedOverspend: 120, // 万元 预计超支
    warningMonths: 3,       // 剩余月份
  };
}