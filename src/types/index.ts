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
export interface CalculationBatch {
  id: string;
  period: string;
  campusId: string;
  status: 'draft' | 'calculating' | 'reviewing' | 'locked' | 'verified' | 'confirmed';
  totalEmission: number;
  emissionBreakdown: Record<EnergyType, number>;
  dataCompleteness: number;
  blockingIssues: number;
  createdAt: string;
  lockedAt?: string;
  lockedBy?: string;
}

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
  energyType?: EnergyType;
}