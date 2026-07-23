/**
 * 合规凭证看板 - Mock 数据
 * 围绕 MRV（监测 Measurement、报告 Reporting、核查 Verification）管理体系
 */

// ── 类型定义 ──────────────────────────────────────────────

export type SeverityLevel = "info" | "warning" | "critical";
export type DataStatus = "completed" | "pending" | "reviewing" | "locked" | "exception";
export type AuditStatus = "passed" | "pending" | "rejected" | "in_progress";
export type CompletenessStatus = "complete" | "partial" | "missing";
export type IssueStatus = "unassigned" | "processing" | "pending_review" | "closed" | "overdue";

export interface KpiCardData {
  id: string;
  label: string;
  value: number;
  unit: string;
  change: number;
  changeLabel: string;
  status: "good" | "warning" | "danger" | "normal";
  icon: string;
}

export interface MrvNode {
  id: string;
  name: string;
  status: DataStatus;
  dataCount: number;
  completeness: number;
  anomalyCount: number;
  description: string;
}

export interface TraceDetail {
  id: string;
  emissionSource: string;
  campus: string;
  building: string;
  meterId: string;
  collectTime: string;
  rawReading: string;
  monthlyUsage: string;
  invoiceNo: string;
  settlementNo: string;
  hasTransferPower: boolean;
  dataCorrection: string;
  emissionFactor: string;
  factorSource: string;
  factorYear: string;
  formula: string;
  result: string;
  reporter: string;
  reviewer: string;
  approver: string;
  version: string;
}

export interface QualityDimension {
  name: string;
  score: number;
  maxScore: number;
  label: string;
}

export interface QualityIssue {
  id: string;
  type: string;
  count: number;
  severity: SeverityLevel;
}

export interface VoucherItem {
  id: string;
  name: string;
  type: string;
  dataItem: string;
  campus: string;
  building: string;
  period: string;
  voucherNo: string;
  uploader: string;
  uploadTime: string;
  validUntil: string;
  auditStatus: AuditStatus;
  completeness: CompletenessStatus;
  version: string;
  isExpiring: boolean;
  isExpired: boolean;
}

export interface RectificationIssue {
  id: string;
  type: string;
  severity: SeverityLevel;
  relatedData: string;
  impactEmission: number;
  impactUnit: string;
  department: string;
  responsible: string;
  foundTime: string;
  deadline: string;
  status: IssueStatus;
  progress: number;
  detail?: {
    reason: string;
    originalData: string;
    fixDescription: string;
    supplementaryVoucher: string;
    recalcResult: string;
    auditOpinion: string;
  };
}

export interface DataVersion {
  id: string;
  version: string;
  dataItem: string;
  beforeValue: string;
  afterValue: string;
  reason: string;
  modifier: string;
  modifyTime: string;
  reviewer: string;
  emissionImpact: string;
  isLocked: boolean;
}

// ── 核心指标卡 ──────────────────────────────────────────────

export const KPI_CARDS: KpiCardData[] = [
  {
    id: "quality-score",
    label: "数据质量综合评分",
    value: 92,
    unit: "分",
    change: 2.3,
    changeLabel: "较上月",
    status: "good",
    icon: "shield-check",
  },
  {
    id: "mrv-coverage",
    label: "MRV溯源覆盖率",
    value: 96.8,
    unit: "%",
    change: 1.5,
    changeLabel: "较上月",
    status: "good",
    icon: "link",
  },
  {
    id: "voucher-completeness",
    label: "原始凭证完整率",
    value: 94.5,
    unit: "%",
    change: -0.8,
    changeLabel: "较上月",
    status: "warning",
    icon: "file-check",
  },
  {
    id: "auto-collection",
    label: "自动采集率",
    value: 82.4,
    unit: "%",
    change: 3.1,
    changeLabel: "较上月",
    status: "normal",
    icon: "cpu",
  },
  {
    id: "estimate-ratio",
    label: "估算数据占比",
    value: 6.7,
    unit: "%",
    change: -1.2,
    changeLabel: "较上月",
    status: "good",
    icon: "calculator",
  },
  {
    id: "pending-audit",
    label: "待审核数据",
    value: 18,
    unit: "条",
    change: 5,
    changeLabel: "较上月",
    status: "warning",
    icon: "clock",
  },
  {
    id: "anomaly-count",
    label: "异常数据",
    value: 7,
    unit: "条",
    change: -3,
    changeLabel: "较上月",
    status: "danger",
    icon: "alert-triangle",
  },
  {
    id: "issue-closure",
    label: "问题闭环率",
    value: 88.6,
    unit: "%",
    change: 4.2,
    changeLabel: "较上月",
    status: "normal",
    icon: "check-circle",
  },
];

// ── MRV 溯源链路节点 ────────────────────────────────────────

export const MRV_NODES: MrvNode[] = [
  {
    id: "emission-source",
    name: "排放源",
    status: "completed",
    dataCount: 12,
    completeness: 100,
    anomalyCount: 0,
    description: "外购电力、天然气、热力、汽油、柴油等排放源清单",
  },
  {
    id: "meter-device",
    name: "计量设备/业务系统",
    status: "completed",
    dataCount: 35,
    completeness: 97.1,
    anomalyCount: 1,
    description: "智能电表、燃气表、热力表及能源管理平台",
  },
  {
    id: "activity-data",
    name: "活动数据",
    status: "completed",
    dataCount: 48,
    completeness: 95.8,
    anomalyCount: 2,
    description: "月度用电量、用气量、用热量等原始活动水平数据",
  },
  {
    id: "voucher",
    name: "原始凭证",
    status: "pending",
    dataCount: 42,
    completeness: 87.5,
    anomalyCount: 3,
    description: "电费发票、结算单、合同、检定证书等原始凭证",
  },
  {
    id: "data-processing",
    name: "数据处理规则",
    status: "completed",
    dataCount: 8,
    completeness: 100,
    anomalyCount: 0,
    description: "缺失值处理、异常值剔除、单位换算、折算规则",
  },
  {
    id: "emission-factor",
    name: "排放因子",
    status: "completed",
    dataCount: 6,
    completeness: 100,
    anomalyCount: 0,
    description: "电力排放因子、天然气排放因子等及来源版本",
  },
  {
    id: "formula",
    name: "计算公式",
    status: "completed",
    dataCount: 12,
    completeness: 100,
    anomalyCount: 0,
    description: "碳排放量 = 活动数据 × 排放因子 × GWP",
  },
  {
    id: "emission-result",
    name: "排放结果",
    status: "reviewing",
    dataCount: 12,
    completeness: 100,
    anomalyCount: 1,
    description: "各排放源碳排放量及汇总结果",
  },
  {
    id: "audit-confirm",
    name: "审核确认",
    status: "pending",
    dataCount: 8,
    completeness: 66.7,
    anomalyCount: 0,
    description: "填报人自查 → 复核人复核 → 审批人审批",
  },
];

// ── 溯源详情（外购电力） ────────────────────────────────────

export const TRACE_DETAIL_SAMPLE: TraceDetail = {
  id: "trace-elec-001",
  emissionSource: "外购电力碳排放",
  campus: "主校区",
  building: "教学楼A座",
  meterId: "DL-A-001",
  collectTime: "2026-06-30 23:59:59",
  rawReading: "起始: 1,258,430 kWh → 终止: 1,385,280 kWh",
  monthlyUsage: "126,850 kWh",
  invoiceNo: "FP-2026-06-0182",
  settlementNo: "JS-2026-06-0056",
  hasTransferPower: false,
  dataCorrection: "无修正（自动采集数据，未触发异常规则）",
  emissionFactor: "0.604 kgCO₂/kWh",
  factorSource: "北京市电力排放因子（2025年版）",
  factorYear: "2025",
  formula: "碳排放量(tCO₂) = 用电量(MWh) × 电力排放因子(tCO₂/MWh) = 126.85 × 0.604",
  result: "76.62 tCO₂",
  reporter: "张明（能源管理员）",
  reviewer: "李华（碳核算主管）",
  approver: "王建国（后勤处长）",
  version: "V1.2",
};

// ── 数据质量 ────────────────────────────────────────────────

export const QUALITY_DIMENSIONS: QualityDimension[] = [
  { name: "完整性", score: 94, maxScore: 100, label: "优秀" },
  { name: "准确性", score: 91, maxScore: 100, label: "优秀" },
  { name: "一致性", score: 88, maxScore: 100, label: "良好" },
  { name: "及时性", score: 85, maxScore: 100, label: "良好" },
  { name: "可追溯性", score: 97, maxScore: 100, label: "优秀" },
];

export const QUALITY_ISSUES: QualityIssue[] = [
  { id: "qi-1", type: "缺失数据", count: 5, severity: "warning" },
  { id: "qi-2", type: "异常波动", count: 3, severity: "critical" },
  { id: "qi-3", type: "账表不一致", count: 2, severity: "critical" },
  { id: "qi-4", type: "单位错误", count: 1, severity: "warning" },
  { id: "qi-5", type: "重复数据", count: 2, severity: "info" },
  { id: "qi-6", type: "缺少凭证", count: 4, severity: "warning" },
  { id: "qi-7", type: "因子版本过期", count: 1, severity: "critical" },
  { id: "qi-8", type: "超期未审核", count: 3, severity: "warning" },
];

// ── 凭证数据 ────────────────────────────────────────────────

export const VOUCHER_TABS = [
  { id: "metering", label: "计量凭证", count: 35 },
  { id: "invoice", label: "发票与结算单", count: 24 },
  { id: "contract", label: "合同与基础资料", count: 18 },
  { id: "certificate", label: "计量检定证书", count: 12 },
  { id: "basis", label: "核算依据", count: 15 },
  { id: "audit", label: "审核与报告材料", count: 9 },
];

export const VOUCHERS: VoucherItem[] = [
  {
    id: "v-001",
    name: "2026年6月电费结算单",
    type: "发票与结算单",
    dataItem: "外购电力-教学楼A座",
    campus: "主校区",
    building: "教学楼A座",
    period: "2026-06",
    voucherNo: "FP-2026-06-0182",
    uploader: "张明",
    uploadTime: "2026-07-02 09:15",
    validUntil: "—",
    auditStatus: "passed",
    completeness: "complete",
    version: "V1.0",
    isExpiring: false,
    isExpired: false,
  },
  {
    id: "v-002",
    name: "DL-A-001电表检定证书",
    type: "计量检定证书",
    dataItem: "计量设备-电表DL-A-001",
    campus: "主校区",
    building: "教学楼A座",
    period: "2025-07 ~ 2026-07",
    voucherNo: "JD-2025-0731",
    uploader: "王磊",
    uploadTime: "2025-07-15 14:30",
    validUntil: "2026-07-14",
    auditStatus: "passed",
    completeness: "complete",
    version: "V1.0",
    isExpiring: true,
    isExpired: false,
  },
  {
    id: "v-003",
    name: "供电合同（2024-2027）",
    type: "合同与基础资料",
    dataItem: "外购电力-全校",
    campus: "主校区",
    building: "全校",
    period: "2024-01 ~ 2027-12",
    voucherNo: "HT-2024-0012",
    uploader: "李华",
    uploadTime: "2024-01-10 10:00",
    validUntil: "2027-12-31",
    auditStatus: "passed",
    completeness: "complete",
    version: "V1.0",
    isExpiring: false,
    isExpired: false,
  },
  {
    id: "v-004",
    name: "2026年5月燃气费发票",
    type: "发票与结算单",
    dataItem: "天然气-食堂",
    campus: "主校区",
    building: "第一食堂",
    period: "2026-05",
    voucherNo: "FP-2026-05-0091",
    uploader: "张明",
    uploadTime: "2026-06-03 11:20",
    validUntil: "—",
    auditStatus: "pending",
    completeness: "partial",
    version: "V1.0",
    isExpiring: false,
    isExpired: false,
  },
  {
    id: "v-005",
    name: "热力表RL-B-003检定证书",
    type: "计量检定证书",
    dataItem: "计量设备-热力表RL-B-003",
    campus: "主校区",
    building: "图书馆",
    period: "2024-08 ~ 2025-08",
    voucherNo: "JD-2024-0821",
    uploader: "王磊",
    uploadTime: "2024-08-20 16:00",
    validUntil: "2025-08-19",
    auditStatus: "passed",
    completeness: "complete",
    version: "V1.0",
    isExpiring: false,
    isExpired: true,
  },
  {
    id: "v-006",
    name: "北京市电力排放因子（2025版）",
    type: "核算依据",
    dataItem: "排放因子-电力",
    campus: "全校",
    building: "全校",
    period: "2025全年",
    voucherNo: "YZ-2025-DL",
    uploader: "李华",
    uploadTime: "2025-03-01 08:30",
    validUntil: "—",
    auditStatus: "passed",
    completeness: "complete",
    version: "V1.0",
    isExpiring: false,
    isExpired: false,
  },
  {
    id: "v-007",
    name: "2026年Q2能源统计台账",
    type: "计量凭证",
    dataItem: "全能源品种-主校区",
    campus: "主校区",
    building: "全部建筑",
    period: "2026-Q2",
    voucherNo: "TZ-2026-Q2-001",
    uploader: "张明",
    uploadTime: "2026-07-05 15:45",
    validUntil: "—",
    auditStatus: "in_progress",
    completeness: "complete",
    version: "V1.1",
    isExpiring: false,
    isExpired: false,
  },
  {
    id: "v-008",
    name: "2026年碳排放核查报告（内部）",
    type: "审核与报告材料",
    dataItem: "全排放源-2026上半年",
    campus: "主校区+东校区",
    building: "全部建筑",
    period: "2026-H1",
    voucherNo: "BG-2026-H1-001",
    uploader: "李华",
    uploadTime: "2026-07-10 09:00",
    validUntil: "—",
    auditStatus: "pending",
    completeness: "complete",
    version: "V1.0",
    isExpiring: false,
    isExpired: false,
  },
];

// ── 异常整改 ────────────────────────────────────────────────

export const RECTIFICATION_ISSUES: RectificationIssue[] = [
  {
    id: "RI-2026-001",
    type: "异常波动",
    severity: "critical",
    relatedData: "外购电力-教学楼A座-2026年6月",
    impactEmission: 12.5,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "张明",
    foundTime: "2026-07-01 08:30",
    deadline: "2026-07-15",
    status: "processing",
    progress: 60,
    detail: {
      reason: "6月15日-20日空调系统异常高负荷运行，用电量较历史同期偏高约18%",
      originalData: "126,850 kWh（异常月份）vs 107,500 kWh（正常月份均值）",
      fixDescription: "已核实空调系统运行记录，确认异常原因为冷却塔故障导致制冷效率下降，已修复。补充了设备维修记录和运行日志作为支撑材料。",
      supplementaryVoucher: "空调系统维修记录（WX-2026-06-003）、6月空调运行日志",
      recalcResult: "修正后碳排放量：76.62 tCO₂（原异常计算值：89.12 tCO₂）",
      auditOpinion: "待复核人确认修正逻辑和支撑材料",
    },
  },
  {
    id: "RI-2026-002",
    type: "账表不一致",
    severity: "critical",
    relatedData: "天然气-食堂-2026年5月",
    impactEmission: 3.8,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "张明",
    foundTime: "2026-06-05 14:00",
    deadline: "2026-06-20",
    status: "pending_review",
    progress: 85,
    detail: {
      reason: "燃气公司结算单用量与校内燃气表读数存在差异，差额约850m³",
      originalData: "燃气公司结算: 8,200 m³；校内表计: 7,350 m³",
      fixDescription: "经核实为燃气公司估抄导致，已联系燃气公司出具更正结算单。补充了校内燃气表照片和更正后的结算单。",
      supplementaryVoucher: "更正后的燃气结算单（FP-2026-05-0091-R1）、校内燃气表读数照片",
      recalcResult: "修正后碳排放量：15.87 tCO₂（原值：19.67 tCO₂）",
      auditOpinion: "修正合理，支撑材料齐全，建议通过",
    },
  },
  {
    id: "RI-2026-003",
    type: "因子版本过期",
    severity: "critical",
    relatedData: "外购电力-全校-2026年Q1",
    impactEmission: 45.2,
    impactUnit: "tCO₂",
    department: "碳管理办公室",
    responsible: "李华",
    foundTime: "2026-04-01 09:00",
    deadline: "2026-04-10",
    status: "closed",
    progress: 100,
    detail: {
      reason: "2026年Q1核算仍使用2024版北京市电力排放因子（0.556 kgCO₂/kWh），应更新为2025版（0.604 kgCO₂/kWh）",
      originalData: "使用因子: 0.556 kgCO₂/kWh（2024版）",
      fixDescription: "已更新为2025版北京市电力排放因子，重新计算Q1排放量。补充了因子更新说明和版本对比表。",
      supplementaryVoucher: "北京市电力排放因子（2025版）发布通知、因子版本对比表",
      recalcResult: "修正后Q1碳排放量：1,245.8 tCO₂（原值：1,146.6 tCO₂，差异+99.2 tCO₂）",
      auditOpinion: "因子更新及时，计算正确，已通过",
    },
  },
  {
    id: "RI-2026-004",
    type: "缺少凭证",
    severity: "warning",
    relatedData: "热力-图书馆-2026年3月",
    impactEmission: 2.1,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "王磊",
    foundTime: "2026-04-05 10:00",
    deadline: "2026-04-20",
    status: "overdue",
    progress: 30,
  },
  {
    id: "RI-2026-005",
    type: "超期未审核",
    severity: "warning",
    relatedData: "汽油-公务车-2026年4月",
    impactEmission: 0.8,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "张明",
    foundTime: "2026-05-10 11:00",
    deadline: "2026-05-25",
    status: "unassigned",
    progress: 0,
  },
];

// ── 版本管理 ────────────────────────────────────────────────

export const DATA_VERSIONS: DataVersion[] = [
  {
    id: "ver-001",
    version: "V1.2",
    dataItem: "外购电力-教学楼A座-2026年6月",
    beforeValue: "89.12 tCO₂",
    afterValue: "76.62 tCO₂",
    reason: "空调系统异常数据修正",
    modifier: "张明",
    modifyTime: "2026-07-02 14:30",
    reviewer: "李华",
    emissionImpact: "-12.50 tCO₂",
    isLocked: false,
  },
  {
    id: "ver-002",
    version: "V1.1",
    dataItem: "天然气-食堂-2026年5月",
    beforeValue: "19.67 tCO₂",
    afterValue: "15.87 tCO₂",
    reason: "燃气公司结算单更正",
    modifier: "张明",
    modifyTime: "2026-06-08 10:15",
    reviewer: "李华",
    emissionImpact: "-3.80 tCO₂",
    isLocked: false,
  },
  {
    id: "ver-003",
    version: "V1.1",
    dataItem: "外购电力-全校-2026年Q1",
    beforeValue: "1,146.6 tCO₂",
    afterValue: "1,245.8 tCO₂",
    reason: "排放因子版本更新（2024版→2025版）",
    modifier: "李华",
    modifyTime: "2026-04-03 16:00",
    reviewer: "王建国",
    emissionImpact: "+99.2 tCO₂",
    isLocked: true,
  },
];

// ── 筛选选项 ────────────────────────────────────────────────

export const FILTER_OPTIONS = {
  orgTypes: ["学校", "医院"],
  orgNames: ["北京科技大学", "北京大学", "清华大学", "北京协和医院"],
  campuses: ["主校区", "东校区", "西校区"],
  years: ["2024", "2025", "2026"],
  months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  scopes: ["范围一（直接排放）", "范围二（间接排放）", "范围三（其他间接排放）"],
  energyTypes: ["电力", "天然气", "热力", "汽油", "柴油", "光伏"],
  dataStatuses: ["已完成", "待补充", "待审核", "已锁定", "存在异常"],
  auditStatuses: ["已通过", "待审核", "已驳回", "审核中"],
};
