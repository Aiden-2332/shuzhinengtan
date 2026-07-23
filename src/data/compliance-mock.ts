// 合规凭证看板 Mock 数据
// GB/T 29117-2025 绿色学校评价导则 - MRV 管理体系

// ==================== 类型定义 ====================

export interface KpiCardData {
  id: string;
  label: string;
  value: string;
  unit: string;
  change: number; // 环比变化百分比，正数为上升
  changeLabel: string;
  status: "normal" | "warning" | "danger" | "info";
  statusLabel: string;
}

export interface MrvNodeData {
  id: string;
  name: string;
  status: "completed" | "pending" | "reviewing" | "abnormal" | "locked";
  statusLabel: string;
  dataCount: number;
  completeness: number; // 0-100
  abnormalCount: number;
}

export interface TraceDetailData {
  id: string;
  emissionSource: string;
  campus: string;
  building: string;
  meterId: string;
  collectTime: string;
  rawReading: number;
  monthlyConsumption: number;
  unit: string;
  invoiceNo: string;
  settlementNo: string;
  hasTransferPower: boolean;
  dataCorrection: string | null;
  emissionFactor: number;
  factorSource: string;
  factorYear: string;
  factorVersion: string;
  formula: string;
  result: number;
  resultUnit: string;
  reporter: string;
  reviewer: string;
  approver: string;
  dataVersion: string;
  versions: DataVersion[];
}

export interface DataVersion {
  version: string;
  beforeValue: string;
  afterValue: string;
  reason: string;
  modifier: string;
  modifyTime: string;
  reviewer: string;
  impact: string;
}

export interface QualityDimension {
  name: string;
  score: number; // 0-100
  label: string;
}

export interface QualityIssue {
  id: string;
  type: string;
  count: number;
  severity: "high" | "medium" | "low";
  severityLabel: string;
}

export interface VoucherItem {
  id: string;
  name: string;
  type: string;
  category: string;
  dataItem: string;
  campus: string;
  building: string;
  period: string;
  voucherNo: string;
  uploader: string;
  uploadTime: string;
  validUntil: string;
  auditStatus: "passed" | "pending" | "rejected" | "expired";
  auditStatusLabel: string;
  completeness: "complete" | "partial" | "missing";
  completenessLabel: string;
  dataVersion: string;
  expired: boolean;
  expiringSoon: boolean;
}

export interface RectificationIssue {
  id: string;
  issueNo: string;
  type: string;
  severity: "critical" | "major" | "minor";
  severityLabel: string;
  relatedData: string;
  impactEmission: number;
  impactUnit: string;
  department: string;
  responsible: string;
  foundTime: string;
  deadline: string;
  status: "unassigned" | "processing" | "reviewing" | "closed" | "overdue";
  statusLabel: string;
  progress: number; // 0-100
  detail?: RectificationDetail;
}

export interface RectificationDetail {
  abnormalReason: string;
  originalData: string;
  rectificationNote: string;
  supplementaryVoucher: string;
  recalculatedResult: string;
  auditOpinion: string;
}

// ==================== KPI 指标卡数据 ====================

export const kpiCards: KpiCardData[] = [
  {
    id: "quality-score",
    label: "数据质量综合评分",
    value: "92",
    unit: "分",
    change: 2.3,
    changeLabel: "较上月 +2.3%",
    status: "normal",
    statusLabel: "优秀",
  },
  {
    id: "mrv-coverage",
    label: "MRV溯源覆盖率",
    value: "96.8",
    unit: "%",
    change: 1.2,
    changeLabel: "较上月 +1.2%",
    status: "normal",
    statusLabel: "良好",
  },
  {
    id: "voucher-completeness",
    label: "原始凭证完整率",
    value: "94.5",
    unit: "%",
    change: -0.8,
    changeLabel: "较上月 -0.8%",
    status: "warning",
    statusLabel: "需关注",
  },
  {
    id: "auto-collection",
    label: "自动采集率",
    value: "82.4",
    unit: "%",
    change: 3.6,
    changeLabel: "较上月 +3.6%",
    status: "info",
    statusLabel: "提升中",
  },
  {
    id: "estimated-ratio",
    label: "估算数据占比",
    value: "6.7",
    unit: "%",
    change: -1.5,
    changeLabel: "较上月 -1.5%",
    status: "warning",
    statusLabel: "偏高",
  },
  {
    id: "pending-audit",
    label: "待审核数据",
    value: "18",
    unit: "条",
    change: 5,
    changeLabel: "较上月 +5条",
    status: "warning",
    statusLabel: "待处理",
  },
  {
    id: "abnormal-data",
    label: "异常数据",
    value: "7",
    unit: "条",
    change: -3,
    changeLabel: "较上月 -3条",
    status: "danger",
    statusLabel: "需整改",
  },
  {
    id: "closure-rate",
    label: "问题闭环率",
    value: "88.6",
    unit: "%",
    change: 4.2,
    changeLabel: "较上月 +4.2%",
    status: "normal",
    statusLabel: "良好",
  },
];

// ==================== MRV 溯源节点数据 ====================

export const mrvNodes: MrvNodeData[] = [
  {
    id: "emission-source",
    name: "排放源",
    status: "completed",
    statusLabel: "已完成",
    dataCount: 12,
    completeness: 100,
    abnormalCount: 0,
  },
  {
    id: "meter-device",
    name: "计量设备",
    status: "completed",
    statusLabel: "已完成",
    dataCount: 35,
    completeness: 97.1,
    abnormalCount: 1,
  },
  {
    id: "activity-data",
    name: "活动数据",
    status: "completed",
    statusLabel: "已完成",
    dataCount: 48,
    completeness: 95.8,
    abnormalCount: 2,
  },
  {
    id: "original-voucher",
    name: "原始凭证",
    status: "abnormal",
    statusLabel: "存在异常",
    dataCount: 52,
    completeness: 94.5,
    abnormalCount: 3,
  },
  {
    id: "data-rule",
    name: "数据处理规则",
    status: "completed",
    statusLabel: "已完成",
    dataCount: 8,
    completeness: 100,
    abnormalCount: 0,
  },
  {
    id: "emission-factor",
    name: "排放因子",
    status: "reviewing",
    statusLabel: "待审核",
    dataCount: 6,
    completeness: 100,
    abnormalCount: 0,
  },
  {
    id: "formula",
    name: "计算公式",
    status: "locked",
    statusLabel: "已锁定",
    dataCount: 12,
    completeness: 100,
    abnormalCount: 0,
  },
  {
    id: "emission-result",
    name: "排放结果",
    status: "completed",
    statusLabel: "已完成",
    dataCount: 24,
    completeness: 98.2,
    abnormalCount: 1,
  },
  {
    id: "audit-confirm",
    name: "审核确认",
    status: "reviewing",
    statusLabel: "待审核",
    dataCount: 18,
    completeness: 88.9,
    abnormalCount: 2,
  },
];

// ==================== 溯源详情数据 ====================

export const traceDetail: TraceDetailData = {
  id: "td-001",
  emissionSource: "外购电力碳排放",
  campus: "主校区",
  building: "教学楼A座",
  meterId: "DL-A-001",
  collectTime: "2026-06-30 23:59:00",
  rawReading: 1285630,
  monthlyConsumption: 126850,
  unit: "kWh",
  invoiceNo: "BJ-DL-2026-06-00158",
  settlementNo: "JS-2026-06-A001",
  hasTransferPower: false,
  dataCorrection: null,
  emissionFactor: 0.604,
  factorSource: "北京市生态环境局",
  factorYear: "2025",
  factorVersion: "V3.2",
  formula: "CO₂排放量 = 月度用电量 × 电力排放因子 = 126,850 × 0.604",
  result: 76.62,
  resultUnit: "tCO₂",
  reporter: "张明",
  reviewer: "李华",
  approver: "王建国",
  dataVersion: "V1.2",
  versions: [
    {
      version: "V1.2",
      beforeValue: "76.62 tCO₂",
      afterValue: "76.62 tCO₂",
      reason: "更新排放因子至2025年版本V3.2",
      modifier: "张明",
      modifyTime: "2026-07-02 14:30:00",
      reviewer: "李华",
      impact: "排放量无变化（因子值未变）",
    },
    {
      version: "V1.1",
      beforeValue: "126,500 kWh",
      afterValue: "126,850 kWh",
      reason: "补充6月30日末班读数，修正月度电量",
      modifier: "张明",
      modifyTime: "2026-07-01 09:15:00",
      reviewer: "李华",
      impact: "排放量增加 0.21 tCO₂",
    },
    {
      version: "V1.0",
      beforeValue: "-",
      afterValue: "126,500 kWh",
      reason: "初始录入6月活动数据",
      modifier: "张明",
      modifyTime: "2026-07-01 08:00:00",
      reviewer: "-",
      impact: "初始版本",
    },
  ],
};

// ==================== 数据质量维度 ====================

export const qualityDimensions: QualityDimension[] = [
  { name: "完整性", score: 94, label: "优秀" },
  { name: "准确性", score: 91, label: "优秀" },
  { name: "一致性", score: 88, label: "良好" },
  { name: "及时性", score: 85, label: "良好" },
  { name: "可追溯性", score: 96, label: "优秀" },
];

export const qualityIssues: QualityIssue[] = [
  { id: "qi-1", type: "缺失数据", count: 5, severity: "high", severityLabel: "高" },
  { id: "qi-2", type: "异常波动", count: 3, severity: "high", severityLabel: "高" },
  { id: "qi-3", type: "账表不一致", count: 2, severity: "medium", severityLabel: "中" },
  { id: "qi-4", type: "单位错误", count: 1, severity: "low", severityLabel: "低" },
  { id: "qi-5", type: "重复数据", count: 2, severity: "low", severityLabel: "低" },
  { id: "qi-6", type: "缺少凭证", count: 4, severity: "high", severityLabel: "高" },
  { id: "qi-7", type: "因子版本过期", count: 1, severity: "medium", severityLabel: "中" },
  { id: "qi-8", type: "超期未审核", count: 3, severity: "medium", severityLabel: "中" },
];

// ==================== 凭证数据 ====================

export const voucherCategories = [
  "计量凭证",
  "发票与结算单",
  "合同与基础资料",
  "计量检定证书",
  "核算依据",
  "审核与报告材料",
];

export const voucherItems: VoucherItem[] = [
  {
    id: "v-001",
    name: "教学楼A座6月电表读数记录",
    type: "计量凭证",
    category: "计量凭证",
    dataItem: "外购电力-教学楼A座",
    campus: "主校区",
    building: "教学楼A座",
    period: "2026-06",
    voucherNo: "JL-2026-06-DL-A001",
    uploader: "张明",
    uploadTime: "2026-07-01 08:00",
    validUntil: "2026-12-31",
    auditStatus: "passed",
    auditStatusLabel: "已审核",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V1.2",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-002",
    name: "2026年6月电费结算单",
    type: "发票与结算单",
    category: "发票与结算单",
    dataItem: "外购电力-全校区",
    campus: "主校区",
    building: "全校",
    period: "2026-06",
    voucherNo: "FP-2026-06-DL-001",
    uploader: "张明",
    uploadTime: "2026-07-05 10:30",
    validUntil: "2026-12-31",
    auditStatus: "passed",
    auditStatusLabel: "已审核",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V1.0",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-003",
    name: "教学楼A座电表DL-A-001检定证书",
    type: "计量检定证书",
    category: "计量检定证书",
    dataItem: "计量设备DL-A-001",
    campus: "主校区",
    building: "教学楼A座",
    period: "2025-2026",
    voucherNo: "JD-2025-DL-A001",
    uploader: "王磊",
    uploadTime: "2025-06-15 14:00",
    validUntil: "2026-08-15",
    auditStatus: "passed",
    auditStatusLabel: "已审核",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V1.0",
    expired: false,
    expiringSoon: true,
  },
  {
    id: "v-004",
    name: "供电合同-主校区2025-2027",
    type: "合同与基础资料",
    category: "合同与基础资料",
    dataItem: "外购电力-主校区",
    campus: "主校区",
    building: "全校",
    period: "2025-2027",
    voucherNo: "HT-2025-GD-001",
    uploader: "李华",
    uploadTime: "2025-01-10 09:00",
    validUntil: "2027-12-31",
    auditStatus: "passed",
    auditStatusLabel: "已审核",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V1.0",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-005",
    name: "北京市电力排放因子说明(2025版)",
    type: "核算依据",
    category: "核算依据",
    dataItem: "电力排放因子",
    campus: "主校区",
    building: "全校",
    period: "2025",
    voucherNo: "HS-2025-DLYS-001",
    uploader: "张明",
    uploadTime: "2026-01-05 11:00",
    validUntil: "2026-12-31",
    auditStatus: "passed",
    auditStatusLabel: "已审核",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V3.2",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-006",
    name: "食堂天然气6月抄表记录",
    type: "计量凭证",
    category: "计量凭证",
    dataItem: "天然气-食堂",
    campus: "主校区",
    building: "学生食堂",
    period: "2026-06",
    voucherNo: "JL-2026-06-TRQ-001",
    uploader: "赵强",
    uploadTime: "2026-07-02 09:00",
    validUntil: "2026-12-31",
    auditStatus: "pending",
    auditStatusLabel: "待审核",
    completeness: "partial",
    completenessLabel: "部分缺失",
    dataVersion: "V1.0",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-007",
    name: "锅炉房天然气结算单-6月",
    type: "发票与结算单",
    category: "发票与结算单",
    dataItem: "天然气-锅炉房",
    campus: "主校区",
    building: "锅炉房",
    period: "2026-06",
    voucherNo: "FP-2026-06-TRQ-002",
    uploader: "赵强",
    uploadTime: "2026-07-06 16:00",
    validUntil: "2026-12-31",
    auditStatus: "rejected",
    auditStatusLabel: "审核退回",
    completeness: "partial",
    completenessLabel: "部分缺失",
    dataVersion: "V1.0",
    expired: false,
    expiringSoon: false,
  },
  {
    id: "v-008",
    name: "燃气表检定证书-TRQ-B01",
    type: "计量检定证书",
    category: "计量检定证书",
    dataItem: "计量设备TRQ-B01",
    campus: "主校区",
    building: "锅炉房",
    period: "2024-2025",
    voucherNo: "JD-2024-TRQ-B01",
    uploader: "王磊",
    uploadTime: "2024-07-20 10:00",
    validUntil: "2025-07-20",
    auditStatus: "expired",
    auditStatusLabel: "已过期",
    completeness: "complete",
    completenessLabel: "完整",
    dataVersion: "V1.0",
    expired: true,
    expiringSoon: false,
  },
];

// ==================== 异常整改数据 ====================

export const rectificationIssues: RectificationIssue[] = [
  {
    id: "ri-001",
    issueNo: "ISSUE-2026-0018",
    type: "缺失数据",
    severity: "critical",
    severityLabel: "严重",
    relatedData: "外购电力-实验楼B座-6月",
    impactEmission: 12.5,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "赵强",
    foundTime: "2026-07-03 10:00",
    deadline: "2026-07-10",
    status: "processing",
    statusLabel: "处理中",
    progress: 60,
    detail: {
      abnormalReason: "实验楼B座智能电表DL-B-003在6月25日-28日期间通信故障，导致4天数据缺失，系统自动使用前30日均值估算",
      originalData: "估算值: 8,420 kWh (基于前30日均值)",
      rectificationNote: "已联系电表厂商修复通信模块，需补充人工抄表数据替换估算值",
      supplementaryVoucher: "待上传: 6月25-28日人工抄表记录",
      recalculatedResult: "待重新计算",
      auditOpinion: "",
    },
  },
  {
    id: "ri-002",
    issueNo: "ISSUE-2026-0017",
    type: "异常波动",
    severity: "major",
    severityLabel: "重要",
    relatedData: "天然气-锅炉房-6月",
    impactEmission: 8.3,
    impactUnit: "tCO₂",
    department: "后勤管理处",
    responsible: "赵强",
    foundTime: "2026-07-04 08:30",
    deadline: "2026-07-12",
    status: "reviewing",
    statusLabel: "待复核",
    progress: 80,
    detail: {
      abnormalReason: "锅炉房6月天然气用量较去年同期增长45%，经排查为新增一台热水锅炉用于学生浴室扩容",
      originalData: "6月用量: 18,500 m³ (去年同期: 12,760 m³)",
      rectificationNote: "已确认新增设备为计划内改造项目，用量增长合理，已在备注中说明",
      supplementaryVoucher: "已上传: 学生浴室改造项目批复文件",
      recalculatedResult: "18,500 m³ → 39.96 tCO₂ (确认无误)",
      auditOpinion: "待审核确认",
    },
  },
  {
    id: "ri-003",
    issueNo: "ISSUE-2026-0016",
    type: "缺少凭证",
    severity: "critical",
    severityLabel: "严重",
    relatedData: "外购电力-图书馆-6月",
    impactEmission: 5.8,
    impactUnit: "tCO₂",
    department: "图书馆",
    responsible: "周文",
    foundTime: "2026-07-02 14:00",
    deadline: "2026-07-08",
    status: "overdue",
    statusLabel: "已逾期",
    progress: 30,
    detail: {
      abnormalReason: "图书馆6月电费结算单尚未上传，无法核实月度用电量",
      originalData: "电表读数: 45,200 kWh",
      rectificationNote: "需联系供电公司获取6月结算单电子版",
      supplementaryVoucher: "缺失: 6月电费结算单",
      recalculatedResult: "待凭证补充后确认",
      auditOpinion: "",
    },
  },
  {
    id: "ri-004",
    issueNo: "ISSUE-2026-0015",
    type: "账表不一致",
    severity: "major",
    severityLabel: "重要",
    relatedData: "热力-体育馆-6月",
    impactEmission: 3.2,
    impactUnit: "tCO₂",
    department: "体育部",
    responsible: "陈刚",
    foundTime: "2026-07-01 16:00",
    deadline: "2026-07-15",
    status: "closed",
    statusLabel: "已关闭",
    progress: 100,
    detail: {
      abnormalReason: "体育馆热力表读数与热力公司结算单存在2.8%偏差",
      originalData: "热力表: 8,560 GJ / 结算单: 8,800 GJ",
      rectificationNote: "经核实为热力表零点漂移，已校准并采用结算单数据",
      supplementaryVoucher: "已上传: 热力表校准记录、热力公司结算单",
      recalculatedResult: "8,800 GJ → 96.8 tCO₂",
      auditOpinion: "整改完成，数据采用结算单数值，审核通过",
    },
  },
  {
    id: "ri-005",
    issueNo: "ISSUE-2026-0014",
    type: "因子版本过期",
    severity: "minor",
    severityLabel: "一般",
    relatedData: "天然气排放因子-全校",
    impactEmission: 1.5,
    impactUnit: "tCO₂",
    department: "碳管理办公室",
    responsible: "张明",
    foundTime: "2026-06-28 09:00",
    deadline: "2026-07-05",
    status: "closed",
    statusLabel: "已关闭",
    progress: 100,
    detail: {
      abnormalReason: "天然气排放因子仍使用2024年版本，需更新至2025年版本",
      originalData: "因子: 1.956 kgCO₂/m³ (2024版)",
      rectificationNote: "已更新至2025年版本",
      supplementaryVoucher: "已上传: 2025年天然气排放因子文件",
      recalculatedResult: "因子更新为 1.956 kgCO₂/m³ (2025版，数值未变)",
      auditOpinion: "因子版本已更新，审核通过",
    },
  },
];

// ==================== 筛选选项 ====================

export const filterOptions = {
  orgTypes: ["学校", "医院"],
  orgNames: ["北京市某高校", "北京大学", "清华大学", "北京科技大学"],
  campuses: ["主校区", "东校区", "西校区"],
  years: ["2026", "2025", "2024"],
  months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  emissionScopes: ["范围一", "范围二", "范围一+范围二"],
  energyTypes: ["电力", "天然气", "热力", "汽油", "柴油", "光伏"],
  dataStatuses: ["已完成", "待补充", "待审核", "存在异常", "已锁定"],
  auditStatuses: ["已审核", "待审核", "审核退回", "无需审核"],
};
