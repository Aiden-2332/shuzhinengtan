// 高校智慧碳管理平台 - 数据类型定义

// ========== 组织与建筑 ==========
export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
  area: number; // 平方米
  status: 'active' | 'inactive';
}

export interface Building {
  id: string;
  name: string;
  code: string;
  campusId: string;
  type: BuildingType;
  area: number; // 平方米
  floors: number;
  yearBuilt: number;
  status: 'active' | 'inactive';
}

export type BuildingType = 
  | 'teaching' // 教学楼
  | 'laboratory' // 实验楼
  | 'library' // 图书馆
  | 'dormitory' // 宿舍
  | 'dining' // 食堂
  | 'gymnasium' // 体育馆
  | 'administrative' // 行政楼
  | 'other'; // 其他

// ========== 能源与排放 ==========
export type EnergyType = 'electricity' | 'natural_gas' | 'heat' | 'solar' | 'green_electricity';

export interface EnergyData {
  timestamp: string;
  buildingId: string;
  energyType: EnergyType;
  value: number;
  unit: string;
  source: 'meter' | 'bill' | 'manual';
  quality: 'valid' | 'warning' | 'blocked';
}

export interface EmissionFactor {
  id: string;
  energyType: EnergyType;
  value: number; // tCO2/unit
  unit: string;
  source: string;
  effectiveDate: string;
  version: string;
}

export interface EmissionRecord {
  id: string;
  period: string; // YYYY-MM
  buildingId: string;
  energyType: EnergyType;
  activityData: number;
  emissionFactor: EmissionFactor;
  emission: number; // tCO2
  status: 'draft' | 'submitted' | 'reviewed' | 'locked';
  traceId: string;
}

// ========== KPI 指标 ==========
export interface KPIData {
  totalEmission: number; // tCO2
  emissionChange: number; // %
  targetDeviation: number; // %
  intensityPerArea: number; // kgCO2/m2
  intensityPerCapita: number; // tCO2/人
  forecastEmission: number; // tCO2
  quotaBalance: number; // tCO2 (正数=缺口)
  dataCompleteness: number; // %
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface TrendPoint {
  period: string;
  actual: number;
  target: number;
  forecast?: number;
}

export interface BuildingRanking {
  buildingId: string;
  buildingName: string;
  emission: number;
  intensity: number;
  change: number;
  rank: number;
}

// ========== 异常与工单 ==========
export interface Anomaly {
  id: string;
  buildingId: string;
  buildingName: string;
  type: 'consumption_spike' | 'baseline_deviation' | 'data_missing' | 'consistency_issue';
  severity: 'blocked' | 'serious' | 'warning' | 'info';
  period: string;
  impactValue: number; // kWh or tCO2
  impactCost: number; // 元
  status: 'pending' | 'assigned' | 'processing' | 'reviewing' | 'closed' | 'false_positive';
  rule: string;
  evidence: string[];
  responsiblePerson: string;
  dueDate: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  anomalyId: string;
  title: string;
  status: 'pending' | 'assigned' | 'processing' | 'closed';
  assignee: string;
  createdAt: string;
  closedAt?: string;
}

// ========== 核算与报告 ==========
export interface Report {
  id: string;
  batchId: string;
  version: string;
  status: 'draft' | 'reviewing' | 'locked' | 'verified' | 'confirmed';
  generatedAt: string;
}

// ========== 减排与项目 ==========
export interface Measure {
  id: string;
  name: string;
  category: string;
  applicableBuildingTypes: BuildingType[];
  baselineReduction: number; // %
  investmentRange: [number, number];
  paybackRange: [number, number]; // 年
  risks: string[];
  prerequisites: string[];
}

export interface Project {
  id: string;
  name: string;
  measureId: string;
  buildingIds: string[];
  status: 'proposed' | 'evaluating' | 'approved' | 'implementing' | 'completed' | 'archived';
  baselineEmission: number;
  targetReduction: number;
  actualReduction?: number;
  investment: number;
  paybackPeriod: number;
  startDate: string;
  endDate?: string;
}

export interface AISuggestion {
  id: string;
  anomalyId?: string;
  buildingId: string;
  evidence: string[];
  causes: { name: string; confidence: number }[];
  measures: MeasureSuggestion[];
  estimatedSavings: {
    energy: number; // kWh
    emission: number; // tCO2
    cost: number; // 元
  };
  investment: number;
  paybackPeriod: number; // 年
  status: 'pending' | 'adopted' | 'rejected';
  createdAt: string;
}

export interface MeasureSuggestion {
  measureId: string;
  name: string;
  applicability: 'high' | 'medium' | 'low';
  estimatedSavings: {
    energy: number;
    emission: number;
    cost: number;
  };
  investment: number;
  paybackPeriod: number;
}

// ========== 碳资产 ==========
export interface QuotaAccount {
  year: number;
  initialQuota: number;
  allocatedQuota: number;
  purchasedQuota: number;
  soldQuota: number;
  usedOffset: number;
  surrenderedQuota: number;
  balance: number;
}

export interface QuotaTransaction {
  id: string;
  type: 'allocation' | 'purchase' | 'sale' | 'offset' | 'surrender';
  year: number;
  quantity: number;
  price?: number;
  date: string;
  reference?: string;
}

export interface ComplianceCalendar {
  year: number;
  events: ComplianceEvent[];
}

export interface ComplianceEvent {
  id: string;
  name: string;
  type: 'monthly_report' | 'annual_report' | 'verification' | 'confirmation' | 'offset_application' | 'surrender';
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: string;
  responsiblePerson: string;
}

export interface ScenarioAnalysis {
  emissionScenario: number; // tCO2
  priceScenario: number; // 元/tCO2
  gap: number; // tCO2
  exposure: number; // 元
}

// ========== 用户与权限 ==========
export type UserRole = 'leader' | 'energy_manager' | 'carbon_manager' | 'data_entry' | 'finance' | 'auditor' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  email: string;
}

// ========== 筛选与查询 ==========
export interface FilterState {
  year: number;
  campusId: string;
  period: string;
  buildingType?: BuildingType;
}

// ========== 碳核算工作台类型定义 ==========

// 核算标准
export type CalculationStandard = 'JST303' | 'EnergyStat'; // JS/T 303-2026 | 能源统计制度

// 数据源分类
export type DataSourceCategory = 'boundary' | 'energy' | 'extended' | 'support';

// 数据源子分类
export type DataSourceSubCategory = 
  | 'S-A01' | 'S-A02' | 'S-A03'  // 边界基础类
  | 'S-A04' | 'S-A05' | 'S-A06' | 'S-A07' | 'S-A08' | 'S-A09'  // 核心能源类
  | 'S-A10' | 'S-A11' | 'S-A12' | 'S-A13' | 'S-A14' | 'S-A15' | 'S-A16'  // 扩展排放类
  | 'S-A17' | 'S-A18' | 'S-A19';  // 核算支撑类

// 数据源状态
export type DataSourceStatus = 'normal' | 'missing' | 'abnormal' | 'pending_review' | 'locked';

// 核算批次状态
export type BatchStatus = 'draft' | 'trial' | 'reviewed' | 'locked';

// 数据源定义
export interface DataSourceDefinition {
  code: string;
  name: string;
  category: DataSourceCategory;
  subCategory: DataSourceSubCategory;
  description: string;
  unit: string;
  required: boolean;
  applicableStandards: CalculationStandard[];
}

// 数据源记录
export interface DataSourceRecord {
  id: string;
  sourceCode: DataSourceSubCategory;
  sourceName: string;
  category: DataSourceCategory;
  buildingId?: string;
  buildingName?: string;
  department?: string;
  period: string; // YYYY-MM
  value?: number;
  unit: string;
  emissionValue?: number; // tCO2
  source: 'meter' | 'bill' | 'manual' | 'import';
  status: DataSourceStatus;
  reviewer?: string;
  reviewedAt?: string;
  batchId?: string;
  attachmentCount: number;
  updatedAt: string;
  updatedBy: string;
}

// 核算批次
export interface CalculationBatch {
  id: string;
  name: string;
  standard: CalculationStandard;
  year: number;
  period?: string; // 月度核算时使用
  status: BatchStatus;
  createdAt: string;
  createdBy: string;
  lockedAt?: string;
  lockedBy?: string;
  totalEmission?: number;
  scope1Emission?: number;
  scope2Emission?: number;
  scope3Emission?: number;
  dataCompleteness: number;
  qualityScore: number;
}

// 排放因子
export interface EmissionFactorRecord {
  id: string;
  energyType: EnergyType;
  name: string;
  value: number;
  unit: string;
  year: number;
  source: string;
  effectiveDate: string;
  expiryDate?: string;
}

// 核算结果
export interface CalculationResult {
  batchId: string;
  standard: CalculationStandard;
  period: string;
  totalEmission: number;
  scope1Emission: number;
  scope2Emission: number;
  scope3Emission?: number;
  emissionByEnergyType: {
    electricity: number;
    natural_gas: number;
    heat: number;
    diesel: number;
    gasoline: number;
    steam: number;
    coal: number;
    solar: number;
    green_electricity: number;
    water: number;
    refrigerant: number;
    other: number;
  };
  buildingEmissions: Array<{
    buildingId: string;
    buildingName: string;
    totalEmission: number;
    scope1: number;
    scope2: number;
  }>;
  intensityPerArea: number;
  intensityPerCapita: number;
  dataCompleteness: number;
  blockingIssues: number;
  generatedAt: string;
}

// 报告模板
export interface ReportTemplate {
  id: string;
  name: string;
  standard: CalculationStandard;
  type: 'main' | 'attachment';
  description: string;
  fileName: string;
}

// MRV 审计记录
export interface MRVAuditRecord {
  id: string;
  dataSourceId: string;
  action: 'create' | 'update' | 'review' | 'lock' | 'unlock' | 'export';
  operator: string;
  timestamp: string;
  oldValue?: string;
  newValue?: string;
  remark?: string;
  batchId?: string;
}

// 数据质量指标
export interface DataQualityMetrics {
  completeness: number; // 完整率
  timeliness: number; // 及时率
  accuracy: number; // 准确率
  consistency: number; // 一致性
  overallScore: number; // 综合得分
}

// 看板数据
export interface DashboardOverview {
  totalSources: number;
  collectedSources: number;
  completenessRate: number;
  energyCompletionRate: number;
  extendedCompletionRate: number;
  jst303CompletionRate: number;
  energyStatCompletionRate: number;
  categoryProgress: {
    boundary: number;
    energy: number;
    extended: number;
    support: number;
  };
  riskBuildings: Array<{ name: string; riskLevel: string; issueCount: number }>;
  monthlyTrend: Array<{ month: string; rate: number }>;
  qualityMetrics: DataQualityMetrics;
}

// 能源结构分析数据
export interface EnergyStructureData {
  totalElectricity: number;
  totalGas: number;
  totalHeat: number;
  totalSolar: number;
  scope1Emission: number;
  scope2Emission: number;
  buildingRanking: Array<{ buildingId: string; buildingName: string; emission: number; intensity: number; trend: string }>;
  solarReduction: number;
  yoyComparison: { current: number; previous: number; change: number };
  intensityTrend: Array<{ month: string; perArea: number; perCapita: number }>;
}

// 扩展排放数据
export interface ExtendedEmissionData {
  completionRate: number;
  monthlyGasTrend: Array<{ month: string; value: number }>;
  commuteEmission: { main: number; east: number };
  wasteEmission: { main: number; east: number };
  greenCertReduction: number;
  carbonSinkReduction: number;
  extendedRatioTrend: Array<{ month: string; ratio: number }>;
}

// 合规凭证数据
export interface ComplianceEvidenceData {
  qualityScore: number;
  anomalyStatus: { pending: number; processing: number; closed: number };
  evidenceCount: { electricity: number; waste: number; greenCert: number; other: number };
  factorChanges: Array<{ date: string; factor: string; change: string }>;
  batchProgress: { draft: number; trial: number; reviewed: number; locked: number };
}