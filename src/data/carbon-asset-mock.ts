/**
 * 碳资产管理 Mock 数据
 * 年度 2026，基于北京科技大学虚拟数据
 */

import {
  CAMPUS_CARBON_QUOTA,
  getCampusOperationalSnapshot,
  getSystemBuildingRanking,
  getSystemMonthlyCarbon,
} from "@/data/campus-system-data";
import { getCampusDateParts } from "@/lib/campus-realtime";

export interface QuotaLedger {
  year: number;
  campus: string;
  totalQuota: number;
  consumedQuota: number;
  remainingQuota: number;
  quotaStatus: "surplus" | "balanced" | "deficit";
  monthlyConsumption: MonthlyEmission[];
  quotaSources: QuotaSource[];
  topBuildings: BuildingConsumption[];
}

export interface MonthlyEmission {
  month: string;
  quota: number;
  actualEmission: number;
  diff: number;
}

export interface QuotaSource {
  type: "free_allocation" | "paid_purchase" | "ccer_offset" | "transfer_in";
  label: string;
  amount: number;
  percentage: number;
}

export interface BuildingConsumption {
  buildingId: string;
  buildingName: string;
  consumption: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

export interface StrategyCard {
  id: "buy_quota" | "buy_ccer" | "implement_reduction";
  label: string;
  icon: string;
  totalCost: number;
  detail: string;
  pros: string[];
  cons: string[];
  isRecommended?: boolean;
  ccerLimit?: number;
  ccerUnitPrice?: number;
  investmentAmount?: number;
  paybackMonths?: number;
  annualReduction?: number;
}

export interface ComplianceTask {
  id: string;
  taskName: string;
  deadline: string;
  daysRemaining: number;
  responsiblePerson: string;
  status: "not_started" | "in_progress" | "completed" | "overdue" | "at_risk";
  priority: "high" | "medium" | "low";
  description: string;
  completionProgress: number;
}

export interface TradeRecord {
  id: string;
  tradeDate: string;
  tradeType: "buy" | "sell";
  tradeProduct: "CEA" | "CCER";
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  counterparty: string;
  status: "pending" | "settled" | "cancelled";
}

export interface CarbonAssetValue {
  surplusQuota: number;
  currentCarbonPrice: number;
  estimatedValue: number;
  priceTrend: "rising" | "stable" | "declining";
  priceChange: number;
  sellingAdvice: {
    timing: string;
    reason: string;
    expectedPrice: number;
    expectedGain: number;
  };
  financialTools: FinancialTool[];
}

export interface FinancialTool {
  id: string;
  name: string;
  description: string;
  estimatedAmount?: number;
  status: "available" | "applied" | "completed";
}

export interface PolicyChange {
  id: string;
  publishDate: string;
  policyName: string;
  issuer: string;
  effectiveDate: string;
  impactScope: string[];
  summary: string;
  actionRequired: string;
}

export interface SelfCheckItem {
  id: string;
  category: string;
  checkItem: string;
  status: "pass" | "fail" | "warning" | "not_checked";
  lastChecked: string;
  fixUrl?: string;
}

export interface MRVNode {
  id: string;
  level: "emission" | "activity_data" | "meter" | "source_doc";
  title: string;
  data: string;
  source: string;
  verified: boolean;
  children: MRVNode[];
}

export interface AuditCheckItem {
  id: string;
  category: string;
  checkContent: string;
  status: "pass" | "fail" | "not_checked";
  evidence?: string;
}

export interface MissingDoc {
  id: string;
  docName: string;
  requiredBy: string;
  relatedBuilding?: string;
  severity: "critical" | "major" | "minor";
}

/* ========== 生成 Mock 数据 ========== */

const SEASONAL_FACTORS = [1.3, 1.25, 1.0, 0.9, 0.8, 0.75, 0.8, 0.85, 1.0, 1.1, 1.2, 1.3];

export function getQuotaLedger(now = new Date()): QuotaLedger {
  const parts = getCampusDateParts(now);
  const carbonSeries = getSystemMonthlyCarbon(now);
  const cumulativeByMonth = new Map(carbonSeries.map((item) => [item.monthKey, item.actual]));
  const factorTotal = SEASONAL_FACTORS.reduce((sum, factor) => sum + factor, 0);
  const monthlyQuotas = SEASONAL_FACTORS.map((factor) => Math.round(CAMPUS_CARBON_QUOTA * factor / factorTotal));
  monthlyQuotas[monthlyQuotas.length - 1] += CAMPUS_CARBON_QUOTA - monthlyQuotas.reduce((sum, quota) => sum + quota, 0);
  const monthlyConsumption: MonthlyEmission[] = SEASONAL_FACTORS.map((factor, i) => {
    const quota = monthlyQuotas[i];
    const monthKey = `${parts.year}-${String(i + 1).padStart(2, "0")}`;
    const cumulative = cumulativeByMonth.get(monthKey);
    const previousKey = `${parts.year}-${String(i).padStart(2, "0")}`;
    const previousCumulative = i === 0 ? 0 : (cumulativeByMonth.get(previousKey) ?? 0);
    const actual = cumulative === undefined ? 0 : Math.max(0, cumulative - previousCumulative);
    return {
      month: monthKey,
      quota,
      actualEmission: actual,
      diff: quota - actual,
    };
  });

  const snapshot = getCampusOperationalSnapshot(now);
  const topBuildings = getSystemBuildingRanking(now, 5).map((building) => ({
    buildingId: building.id,
    buildingName: building.name,
    consumption: building.currentYearEmission,
    percentage: Math.round(building.currentYearEmission / snapshot.annualCarbon * 1000) / 10,
    trend: building.overTargetPct > 10 ? "up" as const : building.overTargetPct > 0 ? "stable" as const : "down" as const,
  }));

  return {
    year: parts.year,
    campus: "全校",
    totalQuota: CAMPUS_CARBON_QUOTA,
    consumedQuota: snapshot.annualCarbon,
    remainingQuota: snapshot.remainingQuota,
    quotaStatus: snapshot.remainingQuota < 0 ? "deficit" : snapshot.quotaUseRate > 85 ? "balanced" : "surplus",
    monthlyConsumption,
    quotaSources: [
      { type: "free_allocation", label: "免费分配", amount: 19350, percentage: 90 },
      { type: "paid_purchase", label: "有偿购买", amount: 1075, percentage: 5 },
      { type: "ccer_offset", label: "CCER抵销", amount: 645, percentage: 3 },
      { type: "transfer_in", label: "转入", amount: 430, percentage: 2 },
    ],
    topBuildings,
  };
}

export function simulateGap(carbonPrice: number, forecastEmission: number) {
  const gap = forecastEmission - CAMPUS_CARBON_QUOTA;
  const fundingExposure = Math.max(0, gap) * carbonPrice;
  const ccerLimit = Math.round(CAMPUS_CARBON_QUOTA * 0.05);
  const ccerPrice = 60;

  const strategies: StrategyCard[] = [
    {
      id: "buy_quota",
      label: "直接买配额",
      icon: "💰",
      totalCost: Math.max(0, gap) * carbonPrice,
      detail: `缺口 ${Math.max(0, gap).toLocaleString()} tCO₂ × 碳价 ${carbonPrice} 元/t`,
      pros: ["即刻补足缺口", "操作简单直接", "无方法学限制"],
      cons: ["成本最高", "无减排贡献", "依赖碳价波动"],
    },
    {
      id: "buy_ccer",
      label: "买CCER抵销",
      icon: "🌿",
      totalCost: Math.min(Math.max(0, gap), ccerLimit) * ccerPrice,
      detail: `可抵销 ${ccerLimit.toLocaleString()} tCO₂ × CCER价 ${ccerPrice} 元/t（不超过配额5%）`,
      pros: ["成本最低", "政策鼓励", "环保形象提升"],
      cons: [`有${ccerLimit.toLocaleString()}t上限`, "需方法学匹配", "市场供应有限"],
      isRecommended: gap > 0,
      ccerLimit,
      ccerUnitPrice: ccerPrice,
    },
    {
      id: "implement_reduction",
      label: "实施减排项目",
      icon: "🔧",
      totalCost: 800000,
      detail: "光伏+节能改造综合方案，投资80万，年减排500tCO₂",
      pros: ["长期收益", "实质减碳", "提升能效评级"],
      cons: ["回收周期38个月", "需前期投入", "实施有风险"],
      investmentAmount: 800000,
      paybackMonths: 38,
      annualReduction: 500,
    },
  ];

  const recommendation = {
    strategyId: "buy_ccer" as const,
    reason: `相比直接购买配额，采用CCER抵销可节省 ¥${((Math.max(0, gap) * carbonPrice - Math.min(Math.max(0, gap), ccerLimit) * ccerPrice)).toLocaleString()}（降幅 ${Math.round((1 - (Math.min(Math.max(0, gap), ccerLimit) * ccerPrice) / Math.max(1, Math.max(0, gap) * carbonPrice)) * 100)}%），但需注意CCER抵销不超过配额的5%上限。`,
    confidence: 0.85,
    savings: Math.max(0, gap) * carbonPrice - Math.min(Math.max(0, gap), ccerLimit) * ccerPrice,
  };

  return {
    simulator: { carbonPrice, forecastEmission, quotaGap: gap, fundingExposure },
    strategies,
    recommendation,
  };
}

export function getComplianceTasks(): ComplianceTask[] {
  return [
    {
      id: "t1",
      taskName: "年度核查准备",
      deadline: "2026-06-30",
      daysRemaining: -23,
      responsiblePerson: "王主任",
      status: "overdue",
      priority: "high",
      description: "完成年度碳排放核查所有资料准备工作",
      completionProgress: 100,
    },
    {
      id: "t2",
      taskName: "月度数据上报",
      deadline: "2026-07-31",
      daysRemaining: 8,
      responsiblePerson: "李工",
      status: "at_risk",
      priority: "high",
      description: "7月能耗与排放数据上报至北京市碳市场管理平台",
      completionProgress: 80,
    },
    {
      id: "t3",
      taskName: "配额清缴报告",
      deadline: "2026-10-31",
      daysRemaining: 99,
      responsiblePerson: "张老师",
      status: "in_progress",
      priority: "medium",
      description: "编制年度配额清缴报告并提交",
      completionProgress: 60,
    },
    {
      id: "t4",
      taskName: "碳排放年度报告",
      deadline: "2026-12-31",
      daysRemaining: 160,
      responsiblePerson: "张老师",
      status: "not_started",
      priority: "medium",
      description: "编制并公示年度碳排放报告",
      completionProgress: 0,
    },
    {
      id: "t5",
      taskName: "CCER抵销备案",
      deadline: "2026-09-30",
      daysRemaining: 69,
      responsiblePerson: "李工",
      status: "in_progress",
      priority: "low",
      description: "完成CCER项目抵销备案申请",
      completionProgress: 40,
    },
    {
      id: "t6",
      taskName: "碳市场账户年检",
      deadline: "2026-03-31",
      daysRemaining: -113,
      responsiblePerson: "王主任",
      status: "completed",
      priority: "low",
      description: "完成碳市场交易账户年度检查",
      completionProgress: 100,
    },
  ];
}

export function getTradeRecords(): TradeRecord[] {
  return [
    { id: "tr1", tradeDate: "2026-07-15", tradeType: "buy", tradeProduct: "CEA", quantity: 500, unitPrice: 85, totalAmount: 42500, counterparty: "北京环境交易所", status: "settled" },
    { id: "tr2", tradeDate: "2026-06-20", tradeType: "buy", tradeProduct: "CCER", quantity: 200, unitPrice: 60, totalAmount: 12000, counterparty: "中碳绿色", status: "settled" },
    { id: "tr3", tradeDate: "2026-05-10", tradeType: "buy", tradeProduct: "CEA", quantity: 300, unitPrice: 82, totalAmount: 24600, counterparty: "华碳资产", status: "settled" },
    { id: "tr4", tradeDate: "2026-04-15", tradeType: "sell", tradeProduct: "CEA", quantity: 100, unitPrice: 88, totalAmount: 8800, counterparty: "绿金所", status: "settled" },
    { id: "tr5", tradeDate: "2026-03-22", tradeType: "buy", tradeProduct: "CCER", quantity: 445, unitPrice: 58, totalAmount: 25810, counterparty: "中碳绿色", status: "settled" },
    { id: "tr6", tradeDate: "2026-02-18", tradeType: "buy", tradeProduct: "CEA", quantity: 275, unitPrice: 79, totalAmount: 21725, counterparty: "北京环境交易所", status: "settled" },
    { id: "tr7", tradeDate: "2026-01-10", tradeType: "buy", tradeProduct: "CEA", quantity: 200, unitPrice: 76, totalAmount: 15200, counterparty: "华碳资产", status: "settled" },
    { id: "tr8", tradeDate: "2025-12-15", tradeType: "sell", tradeProduct: "CEA", quantity: 150, unitPrice: 72, totalAmount: 10800, counterparty: "绿金所", status: "settled" },
    { id: "tr9", tradeDate: "2026-07-20", tradeType: "buy", tradeProduct: "CEA", quantity: 600, unitPrice: 87, totalAmount: 52200, counterparty: "北京环境交易所", status: "pending" },
    { id: "tr10", tradeDate: "2026-07-22", tradeType: "buy", tradeProduct: "CCER", quantity: 300, unitPrice: 62, totalAmount: 18600, counterparty: "中碳绿色", status: "pending" },
  ];
}

export function getCarbonAssetValue(): CarbonAssetValue {
  return {
    surplusQuota: 0,
    currentCarbonPrice: 85,
    estimatedValue: 0,
    priceTrend: "rising",
    priceChange: 12,
    sellingAdvice: {
      timing: "建议Q4出售",
      reason: "历史碳价Q4通常上涨15%-20%，可等待更高价位",
      expectedPrice: 105,
      expectedGain: 225750,
    },
    financialTools: [
      { id: "ft1", name: "碳配额质押融资", description: "以配额作为质押物获得银行授信", estimatedAmount: 500000, status: "available" },
      { id: "ft2", name: "CCER项目开发", description: "开发校园光伏CCER项目", estimatedAmount: 300000, status: "available" },
    ],
  };
}

export function getPolicyChanges(): PolicyChange[] {
  return [
    {
      id: "p1",
      publishDate: "2026-04",
      policyName: "北京市公共建筑碳排放限额指南(试行)",
      issuer: "北京市生态环境局",
      effectiveDate: "2026-07-01",
      impactScope: ["学校建筑限额管理", "配额核算方法"],
      summary: "对公共建筑实施碳排放强度限额管理，超标建筑需额外购买配额",
      actionRequired: "更新限额参数",
    },
    {
      id: "p2",
      publishDate: "2026-01",
      policyName: "上海碳市场深化改革行动方案(2026-2030)",
      issuer: "上海市生态环境局",
      effectiveDate: "2026-03-01",
      impactScope: ["2028年起高校纳入配额管理"],
      summary: "2028年起将高校等公共机构纳入碳市场配额管理",
      actionRequired: "查看影响分析",
    },
    {
      id: "p3",
      publishDate: "2025-11",
      policyName: "全国碳市场CCER交易管理办法修订",
      issuer: "生态环境部",
      effectiveDate: "2026-01-01",
      impactScope: ["CCER抵销比例", "方法学要求"],
      summary: "CCER抵销比例由5%调整至8%，新增光伏方法学",
      actionRequired: "更新CCER抵销策略",
    },
  ];
}

export function getSelfCheckList(): SelfCheckItem[] {
  return [
    { id: "sc1", category: "计量器具", checkItem: "计量器具合规", status: "pass", lastChecked: "2026-07-20" },
    { id: "sc2", category: "核算方法", checkItem: "核算方法合规", status: "pass", lastChecked: "2026-07-20" },
    { id: "sc3", category: "数据报送", checkItem: "数据报送及时", status: "pass", lastChecked: "2026-07-20" },
    { id: "sc4", category: "配额管理", checkItem: "配额管理报告待提交", status: "warning", lastChecked: "2026-07-20" },
    { id: "sc5", category: "年度核查", checkItem: "年度核查未完成", status: "fail", lastChecked: "2026-07-20" },
    { id: "sc6", category: "排放因子", checkItem: "碳排放因子已更新", status: "pass", lastChecked: "2026-07-20" },
  ];
}

export function getMRVChain(now = new Date()): MRVNode {
  const snapshot = getCampusOperationalSnapshot(now);
  const { year, month } = getCampusDateParts(now);
  return {
    id: "mrv1",
    level: "emission",
    title: "全校年度排放",
    data: `${snapshot.annualCarbon.toLocaleString()} tCO₂e（截至${month}月）`,
    source: "碳核算引擎",
    verified: true,
    children: [
      {
        id: "mrv2",
        level: "activity_data",
        title: "活动数据：用电量",
        data: `${Math.round(snapshot.annualCarbon / 0.5672 * 1_000).toLocaleString()} kWh 等价活动数据`,
        source: "能源监测系统",
        verified: true,
        children: [
          {
            id: "mrv3",
            level: "meter",
            title: "重点计量与运行设备",
            data: "35台（在线30、离线2、故障1、维护2）",
            source: "设备台账",
            verified: true,
            children: [
              {
                id: "mrv4",
                level: "source_doc",
                title: "原始凭证：电费账单",
                data: `${year}-01~${String(month).padStart(2, "0")}`,
                source: "财务系统",
                verified: true,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  };
}

export function getAuditChecklist(): AuditCheckItem[] {
  return [
    { id: "ac1", category: "排放源", checkContent: "排放源清单完整", status: "pass", evidence: "已覆盖全部建筑" },
    { id: "ac2", category: "活动数据", checkContent: "重点设备数据齐全", status: "fail", evidence: "35台设备中2台离线、1台故障，已标记估算数据" },
    { id: "ac3", category: "排放因子", checkContent: "排放因子正确", status: "pass", evidence: "已更新至2026年国标" },
    { id: "ac4", category: "原始凭证", checkContent: "3栋楼缺失原始凭证", status: "fail" },
  ];
}

export function getMissingDocs(): MissingDoc[] {
  return [
    { id: "md1", docName: "材料测试楼实验气体抄表记录", requiredBy: "核查要求提供月度抄表记录", relatedBuilding: "材料测试楼", severity: "critical" },
    { id: "md2", docName: "体育馆柴油发票", requiredBy: "备用发电机燃油消耗凭证", relatedBuilding: "体育馆", severity: "major" },
    { id: "md3", docName: "1斋热力结算单", requiredBy: "集中供热费用分摊凭证", relatedBuilding: "1斋", severity: "minor" },
  ];
}

/* ========== 聚合类型 ========== */

export interface ComplianceCalendar {
  year: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  atRiskTasks: number;
  tasks: ComplianceTask[];
}

export function getComplianceCalendar(): ComplianceCalendar {
  const tasks = getComplianceTasks();
  return {
    year: 2026,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
    overdueTasks: tasks.filter((t) => t.status === "overdue").length,
    atRiskTasks: tasks.filter((t) => t.status === "at_risk").length,
    tasks,
  };
}

export interface ComplianceRadar {
  policyChanges: PolicyChange[];
  selfCheckList: SelfCheckItem[];
  complianceScore: number;
  riskLevel: "low" | "medium" | "high";
}

export function getComplianceRadar(): ComplianceRadar {
  const selfCheck = getSelfCheckList();
  const passCount = selfCheck.filter((s) => s.status === "pass").length;
  const score = Math.round((passCount / selfCheck.length) * 100);
  return {
    policyChanges: getPolicyChanges(),
    selfCheckList: selfCheck,
    complianceScore: score,
    riskLevel: score >= 80 ? "low" : score >= 60 ? "medium" : "high",
  };
}

export interface AuditPreparation {
  mrvChain: MRVNode;
  auditChecklist: AuditCheckItem[];
  missingDocuments: MissingDoc[];
  readinessScore: number;
}

export function getAuditPreparation(): AuditPreparation {
  const checklist = getAuditChecklist();
  const passCount = checklist.filter((c) => c.status === "pass").length;
  return {
    mrvChain: getMRVChain(),
    auditChecklist: checklist,
    missingDocuments: getMissingDocs(),
    readinessScore: Math.round((passCount / checklist.length) * 100),
  };
}
