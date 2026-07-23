// ============================================================
// 能源管理三页面 — 共享 TypeScript 类型定义
// ============================================================

export type EnergyType = 'electricity' | 'water' | 'gas' | 'heat';
export type TimeGranularity = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
export type CampusId = 'main_campus' | 'east_campus' | 'south_campus';
export type AlertLevel = 'info' | 'warning' | 'critical' | 'emergency';
export type AlertCategory = 'energy' | 'device' | 'environment' | 'data';
export type AlertStatus = 'pending' | 'acknowledged' | 'processing' | 'resolved';
export type DeviceStatus = 'online' | 'offline' | 'fault' | 'maintenance';
export type BuildingType =
  | 'teaching'
  | 'dormitory'
  | 'laboratory'
  | 'library'
  | 'administrative'
  | 'canteen';

/** 标煤折算 & 碳排放因子 */
export interface ConversionFactors {
  electricity: { coalEquivalent: number; carbonFactor: number };
  water: { coalEquivalent: number; carbonFactor: number };
  gas: { coalEquivalent: number; carbonFactor: number };
  heat: { coalEquivalent: number; carbonFactor: number };
  updatedAt: string;
}

// ============================================================
// 页面1：能源监控中心
// ============================================================

export interface EnergyOverview {
  energyType: EnergyType;
  campus: CampusId;
  timestamp: string;
  currentPower: number;           // kW / m³/h / GJ/h
  todayCumulative: number;
  monthCumulative: number;
  yearCumulative: number;
  yoyChange: number;              // %
  momChange: number;              // %
  carbonIntensity: number;        // kgCO₂/m²·d
  byBuilding: BuildingEnergySnapshot[];
}

export interface BuildingEnergySnapshot {
  buildingId: string;
  buildingName: string;
  buildingType: BuildingType;
  currentPower: number;
  todayCumulative: number;
  floorCount: number;
  area: number;                   // m²
  intensity: number;              // 单位面积用能
}

export interface LoadCurvePoint {
  timestamp: string;
  electricity: number;            // kW
  water: number;                  // m³/h
  gas: number;                    // m³/h
  heat: number;                   // GJ/h
}

export interface LoadCurveSeries {
  buildingId: string;
  buildingName: string;
  color: string;
  data: LoadCurvePoint[];
}

export interface EnergyAlert {
  id: string;
  alertTime: string;
  category: AlertCategory;
  level: AlertLevel;
  title: string;
  description: string;
  buildingId?: string;
  buildingName?: string;
  deviceName?: string;
  energyType?: EnergyType;
  metric: string;
  metricValue: number;
  threshold: number;
  unit: string;
  status: AlertStatus;
  assignee?: string;
  resolvedTime?: string;
  workOrderId?: string;
}

export interface DeviceStatusPanel {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  faultCount: number;
  maintenanceCount: number;
  devices: DeviceItem[];
}

export interface DeviceItem {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  energyType: EnergyType;
  buildingId: string;
  buildingName: string;
  status: DeviceStatus;
  lastHeartbeat: string;
  currentValue: number;
  unit: string;
  batteryLevel?: number;
}

// ============================================================
// 页面2：能源诊断中心
// ============================================================

export interface DiagnosisSummary {
  efficiencyScore: number;         // 0-100
  overStandardBuildings: number;
  totalOverStandard: number;       // %
  estimatedSavingPotential: {
    electricity: number;           // kWh
    water: number;                 // m³
    gas: number;                   // m³
    heat: number;                  // GJ
    totalCostSaving: number;       // 元
    totalCarbonSaving: number;     // tCO₂
  };
}

export interface SankeyNode {
  id: string;
  name: string;
  category: 'source' | 'conversion' | 'enduse' | 'loss';
  energyType: EnergyType;
  value: number;                   // tce
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;                   // tce
  energyType: EnergyType;
  lossRate?: number;               // %
}

export interface EnergyFlowSankey {
  period: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
  totalInput: number;              // tce
  totalLoss: number;               // tce
  overallEfficiency: number;       // %
}

export interface BenchmarkComparison {
  buildingType: BuildingType;
  buildingTypeName: string;
  buildings: BenchmarkBuildingItem[];
  benchmarks: BenchmarkLine[];
}

export interface BenchmarkBuildingItem {
  buildingId: string;
  buildingName: string;
  intensity: number;               // kgce/m²·a
  perCapita: number;               // kgce/人·a
  isOverStandard: boolean;
  overStandardPercent: number;     // %
}

export interface BenchmarkLine {
  name: string;
  value: number;                   // kgce/m²·a
  color: string;
  lineStyle: 'solid' | 'dashed';
}

export interface AIRootCauseAnalysis {
  anomalyId: string;
  anomalyDescription: string;
  rootCauses: RootCauseItem[];
  confidence: number;              // 0-1
  dataEvidence: EvidenceItem[];
}

export interface RootCauseItem {
  id: string;
  cause: string;
  probability: number;             // 0-1
  impactLevel: 'high' | 'medium' | 'low';
  evidence: string[];
  suggestedAction: string;
  estimatedSaving?: number;
  savingUnit?: string;
}

export interface EvidenceItem {
  type: 'chart' | 'table' | 'metric';
  title: string;
  description: string;
  data: Record<string, unknown>;
}

export interface EnergySavingAdvice {
  id: string;
  category: 'equipment' | 'behavior' | 'schedule' | 'retrofit';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetBuilding?: string;
  targetEnergyType?: EnergyType;
  estimatedSaving: number;
  savingUnit: string;
  estimatedCostSaving: number;     // 元/年
  paybackMonths?: number;
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  status: 'suggested' | 'accepted' | 'in_progress' | 'completed';
}

export interface TrendSeries {
  buildingId: string;
  buildingName: string;
  data: { date: string; value: number }[];
}

export interface EnergyTrendComparison {
  buildings: string[];
  energyType: EnergyType;
  startDate: string;
  endDate: string;
  series: TrendSeries[];
  yoyData: { currentYear: number[]; lastYear: number[]; changeRate: number[] };
  momData: { currentMonth: number[]; lastMonth: number[]; changeRate: number[] };
}

// ============================================================
// 页面3：用能日历
// ============================================================

export interface MonthlyEnergySummary {
  month: string;
  totalUsage: {
    electricity: number;
    water: number;
    gas: number;
    heat: number;
    totalTce: number;
  };
  abnormalDays: number;
  savingComplianceDays: number;
  totalDays: number;
}

export interface CalendarHeatmapDay {
  date: string;                    // YYYY-MM-DD
  totalTce: number;
  electricity: number;
  water: number;
  gas: number;
  heat: number;
  intensity: number;               // kgce/m²·d
  level: 'high' | 'normal' | 'low' | 'abnormal_high' | 'abnormal_low' | 'holiday' | 'weekend';
  isAbnormal: boolean;
  hasAlert: boolean;
  alertCount?: number;
}

export interface EnergyProfile {
  workdayPattern: LoadCurvePoint[];
  weekendPattern: LoadCurvePoint[];
  holidayPattern: LoadCurvePoint[];
  seasonalPattern: SeasonalData[];
  peakHours: string[];
  valleyHours: string[];
  peakValleyRatio: number;
}

export interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  avgDaily: number;
  peakDemand: number;
  dominantEnergy: EnergyType;
}

export interface DayDetail {
  date: string;
  hourlyCurve: LoadCurvePoint[];
  peakValleyAnalysis: PeakValleyResult;
  hourlyBreakdown: HourlyBreakdown[];
}

export interface PeakValleyResult {
  peakHours: { start: string; end: string; duration: number; consumption: number }[];
  valleyHours: { start: string; end: string; duration: number; consumption: number }[];
  flatHours: { start: string; end: string; duration: number; consumption: number }[];
  peakRatio: number;
  valleyRatio: number;
  flatRatio: number;
}

export interface HourlyBreakdown {
  period: string;
  electricity: number;
  water: number;
  gas: number;
  heat: number;
  total: number;
  percentage: number;
}

export interface TypicalDayComparison {
  days: {
    label: string;
    date: string;
    energyType: EnergyType;
    data: LoadCurvePoint[];
  }[];
}

export interface SemesterComparison {
  semesters: {
    name: string;
    startDate: string;
    endDate: string;
    totalTce: number;
    avgDailyTce: number;
    electricity: number;
    water: number;
    gas: number;
    heat: number;
    peakDemandDay: string;
    peakDemandValue: number;
  }[];
}

export interface TimeOfUseAdvice {
  id: string;
  timePeriod: string;
  periodType: 'peak' | 'flat' | 'valley';
  advice: string;
  targetEnergyType: EnergyType;
  estimatedSaving: number;
  savingUnit: string;
  priority: 'high' | 'medium' | 'low';
}
