---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 920728846233689_0/project_7664630038792257838-files/能源管理三页面_Coding_Prompt.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 920728846233689#1784787209961
    ReservedCode2: ""
---
# 能源管理三页面 — Coding Prompt

> 直接喂给前端开发/AI编程工具的完整页面实现规格。
> 三大模块：能源监控中心 / 能源诊断中心 / 用能日历
> 覆盖能源类型：电 / 水 / 气 / 热（四维分项，禁止仅展示电）

---

## 1. 页面概览

| 页面 | 路由 | 组件名 | 用户角色 | 核心任务 | 回答的问题 |
|---|---|---|---|---|---|
| 能源监控中心 | `/energy-monitor` | `<EnergyMonitorCenter />` | 能源管理员、后勤值班、校领导 | 实时用能态势感知、异常告警统一收口、设备运行监控 | "现在怎么样？有没有异常？" |
| 能源诊断中心 | `/energy-diagnosis` | `<EnergyDiagnosisCenter />` | 能源管理员、节能办、校领导 | 能效对标分析、AI根因定位、节能优化建议 | "哪里浪费了？跟别人比怎么样？怎么改？" |
| 用能日历 | `/energy-calendar` | `<EnergyCalendarView />` | 能源管理员、节能办 | 时间维度用能规律洞察、负荷画像、异常日回溯 | "用能有什么规律？什么时候是高峰？什么时候有异常日？" |

**三页面闭环逻辑**：日历发现异常 → 监控看实时 → 诊断找根因

---

## 2. 全局约束（与项目其他页面共享）

| 约束项 | 值 |
|---|---|
| 背景色 | `#081028`（深蓝） |
| 主色 | `#3488ff`（浅蓝） |
| 告警色 | `#ff7b25`（橙） |
| 达标色 | `#36d968`（绿） |
| 危险色 | `#ff3333`（红） |
| 辅助紫色 | `#9b6bff` |
| 盈余色 | `#00d4aa`（青绿） |
| 字体 | Noto Sans SC，数字加粗放大，辅助文字 `#8c8c8c` |
| 水印 | 全页面「Demo模拟数据 仅课题演示」半透明 |
| 图表 | ECharts 5 |
| UI框架 | Ant Design 5.x + Tailwind CSS |
| 状态管理 | Zustand |
| 动画库 | framer-motion |
| 最低分辨率 | 1366×768 |

### 能源类型色彩编码（四维统一）

| 能源类型 | 主色 | 图标 | 单位 |
|---|---|---|---|
| 电 | `#3488ff`（蓝） | ⚡ | kWh |
| 水 | `#00d4aa`（青绿） | 💧 | m³ |
| 气 | `#ff7b25`（橙） | 🔥 | m³ |
| 热 | `#ff3333`（红） | 🌡️ | GJ |

---

## 3. 共享 TypeScript 接口（`src/types/energy.ts`）

```typescript
// ============================================================
// 通用枚举与基础类型
// ============================================================

type EnergyType = 'electricity' | 'water' | 'gas' | 'heat';
type TimeGranularity = 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly';
type CampusId = 'main_campus' | 'east_campus' | 'south_campus';
type AlertLevel = 'info' | 'warning' | 'critical' | 'emergency';
type AlertCategory = 'energy' | 'device' | 'environment' | 'data';
type AlertStatus = 'pending' | 'acknowledged' | 'processing' | 'resolved';
type DeviceStatus = 'online' | 'offline' | 'fault' | 'maintenance';
type BuildingType =
  | 'teaching'        // 教学楼
  | 'dormitory'       // 学生公寓
  | 'laboratory'      // 实验楼
  | 'library'         // 图书馆
  | 'administrative'  // 行政楼
  | 'canteen';        // 食堂

// 标煤折算 & 碳排放因子（禁止硬编码，从后台配置读取）
interface ConversionFactors {
  electricity: {
    coalEquivalent: number;   // kgce/kWh 电力折标煤系数
    carbonFactor: number;     // tCO₂/MWh 电网排放因子
  };
  water: {
    coalEquivalent: number;   // kgce/m³ 水折标煤系数（供水能耗）
    carbonFactor: number;     // tCO₂/m³
  };
  gas: {
    coalEquivalent: number;   // kgce/m³ 天然气折标煤系数
    carbonFactor: number;     // tCO₂/m³
  };
  heat: {
    coalEquivalent: number;   // kgce/GJ 热力折标煤系数
    carbonFactor: number;     // tCO₂/GJ
  };
  updatedAt: string;          // 因子最近更新时间 RFC3339
}

// ============================================================
// 页面1：能源监控中心
// ============================================================

// 实时用能总览
interface EnergyOverview {
  energyType: EnergyType;
  campus: CampusId;
  timestamp: string;                     // RFC3339 数据时间戳
  currentPower: number;                  // 当前总功率（kW / m³/h / GJ/h）
  todayCumulative: number;              // 今日累计用量
  monthCumulative: number;              // 本月累计用量
  yearCumulative: number;               // 本年累计用量
  yoyChange: number;                    // 同比变化率 %
  momChange: number;                    // 环比变化率 %
  carbonIntensity: number;              // 碳排强度 kgCO₂/m²·d
  byBuilding: BuildingEnergySnapshot[]; // 各建筑分项快照
}

interface BuildingEnergySnapshot {
  buildingId: string;
  buildingName: string;
  buildingType: BuildingType;
  currentPower: number;
  todayCumulative: number;
  floorCount: number;
  area: number;                         // m²
  intensity: number;                    // 单位面积用能
}

// 实时负荷曲线数据点
interface LoadCurvePoint {
  timestamp: string;                    // RFC3339
  electricity: number;                  // kW
  water: number;                        // m³/h
  gas: number;                          // m³/h
  heat: number;                         // GJ/h
}

// 多区域叠加负荷曲线
interface LoadCurveSeries {
  buildingId: string;
  buildingName: string;
  color: string;                        // 前端渲染颜色
  data: LoadCurvePoint[];
}

// 异常告警
interface EnergyAlert {
  id: string;
  alertTime: string;                    // RFC3339
  category: AlertCategory;              // 能源异常/设备异常/环境异常/数据异常
  level: AlertLevel;
  title: string;
  description: string;
  buildingId?: string;
  buildingName?: string;
  deviceName?: string;
  energyType?: EnergyType;
  metric: string;                       // 触发指标名
  metricValue: number;                  // 实际值
  threshold: number;                    // 阈值
  unit: string;
  status: AlertStatus;
  assignee?: string;                    // 处理人
  resolvedTime?: string;
  workOrderId?: string;                 // 自动派单工单号
}

// 设备运行状态
interface DeviceStatusPanel {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  faultCount: number;
  maintenanceCount: number;
  devices: DeviceItem[];
}

interface DeviceItem {
  deviceId: string;
  deviceName: string;
  deviceType: string;                   // "智能电表" | "水表" | "气表" | "热量表" | "传感器"
  energyType: EnergyType;
  buildingId: string;
  buildingName: string;
  status: DeviceStatus;
  lastHeartbeat: string;                // RFC3339
  currentValue: number;                 // 当前读数
  unit: string;
  batteryLevel?: number;                // 无线设备电量 %
}

// ============================================================
// 页面2：能源诊断中心
// ============================================================

// 诊断摘要
interface DiagnosisSummary {
  efficiencyScore: number;              // 能效评分 0-100
  overStandardBuildings: number;        // 超标建筑数
  totalOverStandard: number;            // 超标比例 %
  estimatedSavingPotential: {
    electricity: number;                // kWh 预估节电量
    water: number;                      // m³
    gas: number;                        // m³
    heat: number;                       // GJ
    totalCostSaving: number;            // 元 预估费用节约
    totalCarbonSaving: number;          // tCO₂ 预估碳减排
  };
}

// 碳排桑基图（能流分析）
interface SankeyNode {
  id: string;
  name: string;
  category: 'source' | 'conversion' | 'enduse' | 'loss';
  energyType: EnergyType;
  value: number;                        // tce（吨标煤）
}

interface SankeyLink {
  source: string;                       // node id
  target: string;                       // node id
  value: number;                        // tce
  energyType: EnergyType;
  lossRate?: number;                    // 损耗率 %
}

interface EnergyFlowSankey {
  period: string;                       // "2026-07"
  nodes: SankeyNode[];
  links: SankeyLink[];
  totalInput: number;                   // 总能源输入 tce
  totalLoss: number;                    // 总损耗 tce
  overallEfficiency: number;            // 系统总能效 %
}

// 能效基准对标
interface BenchmarkComparison {
  buildingType: BuildingType;
  buildingTypeName: string;
  buildings: BenchmarkBuildingItem[];
  benchmarks: BenchmarkLine[];
}

interface BenchmarkBuildingItem {
  buildingId: string;
  buildingName: string;
  intensity: number;                    // 单位面积能耗 kgce/m²·a
  perCapita: number;                    // 人均能耗 kgce/人·a
  isOverStandard: boolean;
  overStandardPercent: number;          // 超出国标比例 %
}

interface BenchmarkLine {
  name: string;                         // "同类高校均值" | "国家标准GB50189" | "历史最优"
  value: number;                        // kgce/m²·a
  color: string;
  lineStyle: 'solid' | 'dashed';
}

// AI 根因分析
interface AIRootCauseAnalysis {
  anomalyId: string;                    // 关联的异常告警ID
  anomalyDescription: string;
  rootCauses: RootCauseItem[];
  confidence: number;                   // 0-1 整体分析置信度
  dataEvidence: EvidenceItem[];
}

interface RootCauseItem {
  id: string;
  cause: string;                        // 根因描述
  probability: number;                  // 0-1 该原因概率
  impactLevel: 'high' | 'medium' | 'low';
  evidence: string[];                   // 证据链文字描述
  suggestedAction: string;              // 建议措施
  estimatedSaving?: number;             // 预估节能量
  savingUnit?: string;
}

interface EvidenceItem {
  type: 'chart' | 'table' | 'metric';
  title: string;
  description: string;
  data: Record<string, any>;
}

// 节能优化建议
interface EnergySavingAdvice {
  id: string;
  category: 'equipment' | 'behavior' | 'schedule' | 'retrofit';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetBuilding?: string;
  targetEnergyType?: EnergyType;
  estimatedSaving: number;              // 预估年节能量
  savingUnit: string;
  estimatedCostSaving: number;          // 元/年
  paybackMonths?: number;               // 回收期（月）
  implementationDifficulty: 'easy' | 'medium' | 'hard';
  status: 'suggested' | 'accepted' | 'in_progress' | 'completed';
}

// 能耗趋势对比
interface EnergyTrendComparison {
  buildings: string[];                  // 建筑ID列表
  energyType: EnergyType;
  startDate: string;
  endDate: string;
  series: TrendSeries[];
  yoyData: TrendYoyData;
  momData: TrendMomData;
}

interface TrendSeries {
  buildingId: string;
  buildingName: string;
  data: { date: string; value: number }[];
}

interface TrendYoyData {
  currentYear: number[];                // 月度值
  lastYear: number[];
  changeRate: number[];                 // 各月同比 %
}

interface TrendMomData {
  currentMonth: number[];               // 日值
  lastMonth: number[];
  changeRate: number[];
}

// ============================================================
// 页面3：用能日历
// ============================================================

// 月度摘要
interface MonthlyEnergySummary {
  month: string;                        // "2026-07"
  totalUsage: {
    electricity: number;                // kWh
    water: number;                      // m³
    gas: number;                        // m³
    heat: number;                       // GJ
    totalTce: number;                   // tce 总标煤
  };
  abnormalDays: number;
  savingComplianceDays: number;         // 节能达标天数
  totalDays: number;
}

// 日历热力图数据
interface CalendarHeatmapDay {
  date: string;                         // YYYY-MM-DD
  totalTce: number;                     // 当日总用能 tce
  electricity: number;
  water: number;
  gas: number;
  heat: number;
  intensity: number;                    // kgce/m²·d 用能强度
  level: 'high' | 'normal' | 'low' | 'abnormal_high' | 'abnormal_low' | 'holiday' | 'weekend';
  isAbnormal: boolean;
  hasAlert: boolean;
  alertCount?: number;
}

// 用能画像
interface EnergyProfile {
  workdayPattern: LoadCurvePoint[];     // 工作日典型24h曲线
  weekendPattern: LoadCurvePoint[];     // 周末典型24h曲线
  holidayPattern: LoadCurvePoint[];     // 假期典型24h曲线
  seasonalPattern: SeasonalData[];      // 季节规律
  peakHours: string[];                  // 高峰时段 ["08:00-11:00", "14:00-17:00"]
  valleyHours: string[];                // 低谷时段
  peakValleyRatio: number;              // 峰谷比
}

interface SeasonalData {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  avgDaily: number;                     // 日均 tce
  peakDemand: number;                   // 峰值需求
  dominantEnergy: EnergyType;           // 主导能源类型
}

// 选中日详情
interface DayDetail {
  date: string;
  hourlyCurve: LoadCurvePoint[];        // 24h负荷曲线（四维）
  peakValleyAnalysis: PeakValleyResult;
  hourlyBreakdown: HourlyBreakdown[];   // 分时能耗占比
}

interface PeakValleyResult {
  peakHours: { start: string; end: string; duration: number; consumption: number }[];
  valleyHours: { start: string; end: string; duration: number; consumption: number }[];
  flatHours: { start: string; end: string; duration: number; consumption: number }[];
  peakRatio: number;                    // 峰时占比 %
  valleyRatio: number;                  // 谷时占比 %
  flatRatio: number;                    // 平时占比 %
}

interface HourlyBreakdown {
  period: string;                       // "峰时 08:00-11:00"
  electricity: number;
  water: number;
  gas: number;
  heat: number;
  total: number;
  percentage: number;                   // 占当日总用能 %
}

// 典型日对比
interface TypicalDayComparison {
  days: {
    label: string;                      // "夏季工作日" | "冬季工作日" | "周末" | "寒暑假"
    date: string;
    energyType: EnergyType;
    data: LoadCurvePoint[];
  }[];
}

// 学期对比
interface SemesterComparison {
  semesters: {
    name: string;                       // "2025-2026第二学期" | "2026暑假" | "2026-2027第一学期"
    startDate: string;
    endDate: string;
    totalTce: number;
    avgDailyTce: number;
    electricity: number;
    water: number;
    gas: number;
    heat: number;
    peakDemandDay: string;              // 峰值日
    peakDemandValue: number;
  }[];
}

// 分时策略建议
interface TimeOfUseAdvice {
  id: string;
  timePeriod: string;                   // "08:00-11:00"
  periodType: 'peak' | 'flat' | 'valley';
  advice: string;
  targetEnergyType: EnergyType;
  estimatedSaving: number;
  savingUnit: string;
  priority: 'high' | 'medium' | 'low';
}
```

---

## 4. API 端点（`src/api/energy.ts`）

```typescript
const EnergyAPI = {
  // ====== 通用 ======
  'GET /api/energy/factors':                                  () => ConversionFactors,

  // ====== 页面1：能源监控中心 ======
  'GET /api/energy/monitor/overview':                         (energyType, campus) => EnergyOverview,
  'GET /api/energy/monitor/load-curve':                       (campus, granularity, buildings?, hours?) => LoadCurveSeries[],
  'GET /api/energy/monitor/alerts':                           (campus, status?, category?, level?, page, size) => { alerts: EnergyAlert[], total: number },
  'PATCH /api/energy/monitor/alerts/:id':                     (partial: Partial<EnergyAlert>) => EnergyAlert,
  'POST /api/energy/monitor/alerts/:id/dispatch':             (assignee: string) => EnergyAlert,
  'GET /api/energy/monitor/devices':                          (campus, energyType?, status?) => DeviceStatusPanel,
  'GET /api/energy/monitor/devices/:id':                      () => DeviceItem,

  // ====== 页面2：能源诊断中心 ======
  'GET /api/energy/diagnosis/summary':                        (campus) => DiagnosisSummary,
  'GET /api/energy/diagnosis/sankey':                         (campus, energyType, period) => EnergyFlowSankey,
  'GET /api/energy/diagnosis/benchmark':                      (campus, buildingType?) => BenchmarkComparison[],
  'GET /api/energy/diagnosis/trend':                          (campus, buildings[], energyType, startDate, endDate) => EnergyTrendComparison,
  'POST /api/energy/diagnosis/root-cause':                    (anomalyId: string) => AIRootCauseAnalysis,
  'GET /api/energy/diagnosis/advice':                         (campus) => EnergySavingAdvice[],
  'PATCH /api/energy/diagnosis/advice/:id':                   (status: EnergySavingAdvice['status']) => EnergySavingAdvice,

  // ====== 页面3：用能日历 ======
  'GET /api/energy/calendar/monthly-summary':                 (year, month, campus) => MonthlyEnergySummary,
  'GET /api/energy/calendar/heatmap':                         (year, month, campus, energyType?) => CalendarHeatmapDay[],
  'GET /api/energy/calendar/profile':                         (campus, energyType) => EnergyProfile,
  'GET /api/energy/calendar/day-detail':                      (date, campus, energyType?) => DayDetail,
  'GET /api/energy/calendar/typical-days':                    (campus, energyType) => TypicalDayComparison,
  'GET /api/energy/calendar/semester-compare':                (campus) => SemesterComparison,
  'GET /api/energy/calendar/tou-advice':                      (campus) => TimeOfUseAdvice[],
};
```

---

## 5. 共享 Zustand Store（`src/store/energy.ts`）

```typescript
interface EnergyStore {
  // ====== 全局筛选 ======
  selectedCampus: CampusId;
  selectedEnergyType: EnergyType | 'all';    // 'all' 表示综合
  selectedTimeGranularity: TimeGranularity;
  conversionFactors: ConversionFactors | null;

  // ====== 页面1 ======
  energyOverview: EnergyOverview | null;
  loadCurveSeries: LoadCurveSeries[];
  alerts: EnergyAlert[];
  alertTotal: number;
  alertPage: number;
  alertFilter: { status?: AlertStatus; category?: AlertCategory; level?: AlertLevel };
  devicePanel: DeviceStatusPanel | null;
  monitorLoading: boolean;

  // ====== 页面2 ======
  diagnosisSummary: DiagnosisSummary | null;
  sankeyData: EnergyFlowSankey | null;
  benchmarkData: BenchmarkComparison[] | null;
  rootCauseResult: AIRootCauseAnalysis | null;
  savingAdvice: EnergySavingAdvice[];
  trendData: EnergyTrendComparison | null;
  diagnosisLoading: boolean;
  selectedAnomalyId: string | null;          // 从告警跳转来的异常ID

  // ====== 页面3 ======
  monthlySummary: MonthlyEnergySummary | null;
  heatmapData: CalendarHeatmapDay[];
  energyProfile: EnergyProfile | null;
  dayDetail: DayDetail | null;
  typicalDays: TypicalDayComparison | null;
  semesterComparison: SemesterComparison | null;
  touAdvice: TimeOfUseAdvice[];
  selectedDate: string | null;
  calendarLoading: boolean;

  // ====== Actions ======
  setCampus: (campus: CampusId) => void;
  setEnergyType: (type: EnergyType | 'all') => void;
  setTimeGranularity: (g: TimeGranularity) => void;
  fetchFactors: () => Promise<void>;

  // 页面1 Actions
  fetchOverview: () => Promise<void>;
  fetchLoadCurve: (buildings?: string[], hours?: number) => Promise<void>;
  fetchAlerts: (page?: number) => Promise<void>;
  updateAlertStatus: (id: string, status: AlertStatus) => Promise<void>;
  dispatchAlert: (id: string, assignee: string) => Promise<void>;
  fetchDevices: (energyType?: EnergyType, status?: DeviceStatus) => Promise<void>;
  setAlertFilter: (filter: Partial<EnergyStore['alertFilter']>) => void;

  // 页面2 Actions
  fetchDiagnosisSummary: () => Promise<void>;
  fetchSankey: (period?: string) => Promise<void>;
  fetchBenchmark: (buildingType?: BuildingType) => Promise<void>;
  runRootCauseAnalysis: (anomalyId: string) => Promise<void>;
  fetchSavingAdvice: () => Promise<void>;
  updateAdviceStatus: (id: string, status: EnergySavingAdvice['status']) => Promise<void>;
  fetchTrendComparison: (buildings: string[], startDate: string, endDate: string) => Promise<void>;
  setSelectedAnomaly: (id: string | null) => void;

  // 页面3 Actions
  fetchMonthlySummary: () => Promise<void>;
  fetchHeatmap: (year?: number, month?: number) => Promise<void>;
  fetchEnergyProfile: () => Promise<void>;
  fetchDayDetail: (date: string) => Promise<void>;
  fetchTypicalDays: () => Promise<void>;
  fetchSemesterComparison: () => Promise<void>;
  fetchTouAdvice: () => Promise<void>;
  setSelectedDate: (date: string | null) => void;
}

const useEnergyStore = create<EnergyStore>((set, get) => ({
  // ====== 初始化 ======
  selectedCampus: 'main_campus',
  selectedEnergyType: 'all',
  selectedTimeGranularity: 'realtime',
  conversionFactors: null,

  // ====== 页面1 初始状态 ======
  energyOverview: null,
  loadCurveSeries: [],
  alerts: [],
  alertTotal: 0,
  alertPage: 1,
  alertFilter: {},
  devicePanel: null,
  monitorLoading: false,

  // ====== 页面2 初始状态 ======
  diagnosisSummary: null,
  sankeyData: null,
  benchmarkData: null,
  rootCauseResult: null,
  savingAdvice: [],
  trendData: null,
  diagnosisLoading: false,
  selectedAnomalyId: null,

  // ====== 页面3 初始状态 ======
  monthlySummary: null,
  heatmapData: [],
  energyProfile: null,
  dayDetail: null,
  typicalDays: null,
  semesterComparison: null,
  touAdvice: [],
  selectedDate: null,
  calendarLoading: false,

  // ====== Actions 实现 ======
  setCampus: (campus) => set({ selectedCampus: campus }),
  setEnergyType: (type) => set({ selectedEnergyType: type }),
  setTimeGranularity: (g) => set({ selectedTimeGranularity: g }),

  fetchFactors: async () => {
    const factors = await api.get('/api/energy/factors');
    set({ conversionFactors: factors });
  },

  // 页面1
  fetchOverview: async () => {
    set({ monitorLoading: true });
    const { selectedEnergyType, selectedCampus } = get();
    const data = await api.get('/api/energy/monitor/overview', {
      energyType: selectedEnergyType === 'all' ? undefined : selectedEnergyType,
      campus: selectedCampus,
    });
    set({ energyOverview: data, monitorLoading: false });
  },

  fetchLoadCurve: async (buildings?, hours?) => {
    const { selectedCampus, selectedTimeGranularity } = get();
    const data = await api.get('/api/energy/monitor/load-curve', {
      campus: selectedCampus,
      granularity: selectedTimeGranularity,
      buildings: buildings?.join(','),
      hours: hours ?? 24,
    });
    set({ loadCurveSeries: data });
  },

  fetchAlerts: async (page = 1) => {
    const { selectedCampus, alertFilter } = get();
    const data = await api.get('/api/energy/monitor/alerts', {
      campus: selectedCampus,
      ...alertFilter,
      page,
      size: 10,
    });
    set({ alerts: data.alerts, alertTotal: data.total, alertPage: page });
  },

  updateAlertStatus: async (id, status) => {
    const updated = await api.patch(`/api/energy/monitor/alerts/${id}`, { status });
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? updated : a)),
    }));
  },

  dispatchAlert: async (id, assignee) => {
    const updated = await api.post(`/api/energy/monitor/alerts/${id}/dispatch`, { assignee });
    set((s) => ({
      alerts: s.alerts.map((a) => (a.id === id ? updated : a)),
    }));
  },

  fetchDevices: async (energyType?, status?) => {
    const { selectedCampus } = get();
    const data = await api.get('/api/energy/monitor/devices', {
      campus: selectedCampus,
      energyType,
      status,
    });
    set({ devicePanel: data });
  },

  setAlertFilter: (filter) => {
    set((s) => ({ alertFilter: { ...s.alertFilter, ...filter } }));
  },

  // 页面2
  fetchDiagnosisSummary: async () => {
    set({ diagnosisLoading: true });
    const data = await api.get('/api/energy/diagnosis/summary', { campus: get().selectedCampus });
    set({ diagnosisSummary: data, diagnosisLoading: false });
  },

  fetchSankey: async (period?) => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/diagnosis/sankey', {
      campus: selectedCampus,
      energyType: selectedEnergyType === 'all' ? 'electricity' : selectedEnergyType,
      period: period ?? '2026-07',
    });
    set({ sankeyData: data });
  },

  fetchBenchmark: async (buildingType?) => {
    const data = await api.get('/api/energy/diagnosis/benchmark', {
      campus: get().selectedCampus,
      buildingType,
    });
    set({ benchmarkData: data });
  },

  runRootCauseAnalysis: async (anomalyId) => {
    set({ diagnosisLoading: true, selectedAnomalyId: anomalyId });
    const data = await api.post('/api/energy/diagnosis/root-cause', { anomalyId });
    set({ rootCauseResult: data, diagnosisLoading: false });
  },

  fetchSavingAdvice: async () => {
    const data = await api.get('/api/energy/diagnosis/advice', { campus: get().selectedCampus });
    set({ savingAdvice: data });
  },

  updateAdviceStatus: async (id, status) => {
    const updated = await api.patch(`/api/energy/diagnosis/advice/${id}`, { status });
    set((s) => ({
      savingAdvice: s.savingAdvice.map((a) => (a.id === id ? updated : a)),
    }));
  },

  fetchTrendComparison: async (buildings, startDate, endDate) => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/diagnosis/trend', {
      campus: selectedCampus,
      buildings: buildings.join(','),
      energyType: selectedEnergyType === 'all' ? 'electricity' : selectedEnergyType,
      startDate,
      endDate,
    });
    set({ trendData: data });
  },

  setSelectedAnomaly: (id) => set({ selectedAnomalyId: id }),

  // 页面3
  fetchMonthlySummary: async () => {
    set({ calendarLoading: true });
    const now = new Date();
    const data = await api.get('/api/energy/calendar/monthly-summary', {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      campus: get().selectedCampus,
    });
    set({ monthlySummary: data, calendarLoading: false });
  },

  fetchHeatmap: async (year?, month?) => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/calendar/heatmap', {
      year: year ?? new Date().getFullYear(),
      month: month ?? new Date().getMonth() + 1,
      campus: selectedCampus,
      energyType: selectedEnergyType === 'all' ? undefined : selectedEnergyType,
    });
    set({ heatmapData: data });
  },

  fetchEnergyProfile: async () => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/calendar/profile', {
      campus: selectedCampus,
      energyType: selectedEnergyType === 'all' ? 'electricity' : selectedEnergyType,
    });
    set({ energyProfile: data });
  },

  fetchDayDetail: async (date) => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/calendar/day-detail', {
      date,
      campus: selectedCampus,
      energyType: selectedEnergyType === 'all' ? undefined : selectedEnergyType,
    });
    set({ dayDetail: data, selectedDate: date });
  },

  fetchTypicalDays: async () => {
    const { selectedCampus, selectedEnergyType } = get();
    const data = await api.get('/api/energy/calendar/typical-days', {
      campus: selectedCampus,
      energyType: selectedEnergyType === 'all' ? 'electricity' : selectedEnergyType,
    });
    set({ typicalDays: data });
  },

  fetchSemesterComparison: async () => {
    const data = await api.get('/api/energy/calendar/semester-compare', { campus: get().selectedCampus });
    set({ semesterComparison: data });
  },

  fetchTouAdvice: async () => {
    const data = await api.get('/api/energy/calendar/tou-advice', { campus: get().selectedCampus });
    set({ touAdvice: data });
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
}));
```

---


## 6. 页面1：能源监控中心

### 6.1 页面布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 顶部 56px 导航栏（毛玻璃 backdrop-blur-xl bg-[#081028]/80）                │
│ [⚡电 💧水 🔥气 🌡️热 📊综合] [校区▼] [实时|日|周|月]         [导出] [设置] │
├──────────────────────────────────────────────────────────────────────────┤
│ KPI 卡片行 120px                                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│ │当日总用能  │ │实时总功率 │ │本月累计   │ │碳排强度   │ │同比/环比  │        │
│ │12,580kWh │ │2,450 kW  │ │385,200kWh│ │3.2 kg/m²│ │↑8.5% ↓3%│        │
│ │⚡💧🔥🌡️分项│ │按能源类型 │ │按能源类型 │ │↓0.3 vs昨 │ │          │        │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├──────────────────────────────────┬───────────────────────────────────────┤
│                                  │                                       │
│  中间左 60% — 实时负荷曲线         │  中间右 40% — 设备运行状态面板         │
│                                  │                                       │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ ECharts 多区域叠加曲线      │  │  │ 设备状态概览                     │  │
│  │                            │  │  │ ● 在线 342  ● 离线 8           │  │
│  │ ── 图书馆 ⚡ 180kW         │  │  │ ● 故障 3    ● 维保 5           │  │
│  │ ── 实验楼A ⚡ 450kW        │  │  ├────────────────────────────────┤  │
│  │ ── 教学楼B ⚡ 320kW        │  │  │ [全部|电表|水表|气表|热表]       │  │
│  │ ── 学生公寓 ⚡ 210kW       │  │  │                                │  │
│  │ ── 食堂 ⚡ 380kW          │  │  │ ┌─ 设备列表（滚动）─────────┐   │  │
│  │                            │  │  │ │ #E-001 图书馆1层电表      │   │  │
│  │ X轴: 00:00 → 当前时间      │  │  │ │ ●在线 45.2kW  ♥100%    │   │  │
│  │ Y轴: kW / m³/h / GJ/h    │  │  │ │ #W-012 教学楼水表         │   │  │
│  │                            │  │  │ │ ●在线 2.3m³/h           │   │  │
│  │ [建筑多选 ▼] [⚡💧🔥🌡️切换]  │  │  │ │ #G-005 食堂气表         │   │  │
│  │                            │  │  │ │ ●故障 0m³/h ⚠️离线30min│   │  │
│  └────────────────────────────┘  │  │ │ #H-003 实验楼热量表      │   │  │
│                                  │  │ │ ●在线 12.5GJ/h          │   │  │
│                                  │  │ └────────────────────────────┘   │  │
│                                  │  └────────────────────────────────┘  │
├──────────────────────────────────┴───────────────────────────────────────┤
│ 下半区 320px — 异常告警中心                                                │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ [🔔能源异常 12] [⚙️设备异常 5] [🌡️环境异常 3] [📡数据异常 2]          │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ 告警列表（Ant Design Table）                                        │ │
│ │ ┌────────┬──────┬──────┬──────────────┬──────┬──────┬────────┐     │ │
│ │ │ 时间    │ 级别  │ 类别  │ 描述          │ 位置  │ 状态  │ 操作   │     │ │
│ │ ├────────┼──────┼──────┼──────────────┼──────┼──────┼────────┤     │ │
│ │ │14:32   │🔴紧急│能源  │实验楼A用电超   │实验楼A│待确认│[确认]   │     │ │
│ │ │        │      │      │限120%        │      │      │[派单]   │     │ │
│ │ │14:15   │🟠警告│设备  │食堂#G-005气表 │食堂   │处理中│[查看]   │     │ │
│ │ │        │      │      │离线>30min    │      │      │        │     │ │
│ │ │13:50   │🟠警告│能源  │图书馆用水量突 │图书馆│已确认│[派单]   │     │ │
│ │ │        │      │      │增200%       │      │      │        │     │ │
│ │ │12:30   │🔵提示│数据  │教学楼B电表数据│教学楼B│已解决│[归档]   │     │ │
│ │ │        │      │      │缺失15min     │      │      │        │     │ │
│ │ └────────┴──────┴──────┴──────────────┴──────┴──────┴────────┘     │ │
│ │                                              [刷新] [全部确认] [导出]│ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 组件树

```
<EnergyMonitorCenter />
├── <TopFilterBar />                        // 顶部筛选栏
│   ├── <EnergyTypeTabBar />                // ⚡电 💧水 🔥气 🌡️热 📊综合
│   ├── <CampusSelector />
│   ├── <TimeGranularitySwitch />           // 实时|日|周|月
│   └── <ExportButton />
│
├── <KPICardRow />                          // KPI 卡片行
│   ├── <KPICard title="当日总用能" icon="⚡💧🔥🌡️" />
│   │   └── <EnergyTypeBreakdown />         // 四维分项小字展示
│   ├── <KPICard title="实时总功率" />
│   ├── <KPICard title="本月累计" />
│   ├── <KPICard title="碳排强度" unit="kgCO₂/m²·d" />
│   └── <KPICard title="同比/环比" trend="up|down" />
│
├── <MainContentArea />                     // 中间主区域
│   ├── <LoadCurvePanel />                  // 左60% 实时负荷曲线
│   │   ├── <EChartsLineChart />            // ECharts 多系列叠加
│   │   ├── <BuildingMultiSelect />         // 建筑多选下拉
│   │   └── <EnergyTypeToggle />            // 电/水/气/热 切换
│   │
│   └── <DeviceStatusPanel />               // 右40% 设备运行状态
│       ├── <DeviceOverviewCards />         // 在线/离线/故障/维保 数字
│       ├── <DeviceTypeFilter />            // 全部|电表|水表|气表|热表
│       └── <DeviceList />
│           └── <DeviceListItem /> × N      // 单设备卡片
│               ├── <StatusDot />           // 状态指示灯
│               ├── <DeviceName />
│               ├── <CurrentValue />
│               └── <BatteryLevel />        // 无线设备电量
│
├── <AlertCenterPanel />                    // 下半区 异常告警中心
│   ├── <AlertCategoryTabs />               // 能源/设备/环境/数据 四类Tab
│   │   └── <AlertTabBadge /> × 4           // 带数字角标
│   ├── <AlertTable />                      // Ant Design Table
│   │   ├── <AlertLevelBadge />             // 紧急/警告/提示
│   │   ├── <AlertStatusTag />              // 待确认/处理中/已解决
│   │   └── <AlertActionButtons />          // [确认] [派单] [查看] [归档]
│   ├── <AlertPagination />
│   └── <AlertToolbar />                    // [刷新] [全部确认] [导出]
│
└── <DispatchModal />                       // 派单弹窗（Ant Design Modal）
    ├── <AssigneeSelect />                  // 处理人选择
    └── <DispatchForm />                    // 工单描述
```

### 6.3 交互联动

| 交互 | 触发 | 效果 |
|---|---|---|
| 能源类型Tab切换 | 点击⚡电/💧水/🔥气/🌡️热/📊综合 | 重新请求 `fetchOverview` + `fetchLoadCurve`，KPI卡片数字滚动更新，负荷曲线Y轴单位切换 |
| 校区切换 | 下拉选择 | 全页面数据刷新，`fetchOverview` + `fetchAlerts` + `fetchDevices` |
| 时间粒度切换 | 实时/日/周/月 | `fetchLoadCurve` 参数变化，X轴时间跨度更新 |
| 建筑多选 | 勾选/取消 | `fetchLoadCurve(buildings)` 重新渲染叠加曲线 |
| 告警Tab切换 | 点击类别Tab | `setAlertFilter({category})` → `fetchAlerts()` |
| 告警确认 | 点击[确认] | `updateAlertStatus(id, 'acknowledged')` 行内状态更新 |
| 告警派单 | 点击[派单] | 打开 `DispatchModal` → `dispatchAlert(id, assignee)` |
| 设备状态筛选 | 点击类型筛选 | `fetchDevices(energyType)` 过滤设备列表 |
| KPI卡片hover | 鼠标移入 | tooltip显示四维分项明细（电/水/气/热各多少） |

### 6.4 动画规范

| 元素 | 动画 | 参数 |
|---|---|---|
| KPI数字 | 数字滚动 | `framer-motion type:'tween', duration:1.2, ease:'easeOut'` |
| 负荷曲线加载 | 渐入 | `staggerChildren: 0.1` |
| 告警新条目 | 左侧滑入 + 高亮闪烁2s | `animate: {x:[-20,0], opacity:[0,1]}` |
| 设备状态灯 | 在线呼吸 | `animate-pulse` CSS |
| 告警确认 | 勾选划入 | `framer-motion pathLength` |

---

## 7. 页面2：能源诊断中心

### 7.1 页面布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 顶部 56px 导航栏                                                          │
│ [⚡电 💧水 🔥气 🌡️热 📊综合] [校区▼] [时间范围选择]        [导出] [设置]    │
├──────────────────────────────────────────────────────────────────────────┤
│ 诊断摘要三卡片 120px                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐          │
│ │ 能效评分       │ │ 超标建筑数    │ │ 预估节能潜力               │          │
│ │  72/100       │ │  4 / 28      │ │ ⚡12万kWh 💧800m³        │          │
│ │  ▂▅▇▅▃ 趋势   │ │  14.3%      │ │ 🔥2000m³ 🌡️350GJ        │          │
│ │               │ │  🔴标红高亮   │ │ 💰年省¥85万 ↓碳排120tCO₂│          │
│ └──────────────┘ └──────────────┘ └──────────────────────────┘          │
├──────────────────────────────────────────────────────────────────────────┤
│ 中间 — 碳排溯源桑基图（全宽 400px高度）                                      │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │                    碳排溯源能流分析                                    │ │
│ │                                                                      │ │
│ │  能源输入          系统转换          终端消耗          损耗             │ │
│ │  ┌─────┐          ┌─────┐          ┌─────┐          ┌─────┐        │ │
│ │  │电网  │────────→│变压器 │────────→│照明  │          │线损  │        │ │
│ │  │燃气  │────────→│锅炉  │────────→│空调  │────────→│管损  │        │ │
│ │  │自来水│────────→│水泵  │────────→│动力  │          │漏损  │        │ │
│ │  │热力  │────────→│换热站 │────────→│特殊  │          │散热  │        │ │
│ │  └─────┘          └─────┘          │餐饮  │          └─────┘        │ │
│ │                                     │其他  │                        │ │
│ │  总值: 1,250 tce   转换效率: 92%     └─────┘   总损耗: 100 tce (8%)   │ │
│ │  [⚡电] [💧水] [🔥气] [🌡️热] [切换能源类型]                           │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────┬───────────────────────────────────────┤
│                                  │                                       │
│  下半区左 50% — 能效基准对标        │  下半区右 50% — AI根因分析面板        │
│                                  │                                       │
│  ┌────────────────────────────┐  │  ┌────────────────────────────────┐  │
│  │ 按建筑类型分组对标           │  │  │ AI 根因分析                     │  │
│  │                            │  │  │                                │  │
│  │ 教学楼 [6栋]                │  │  │ 异常: 实验楼A夜间基础负荷偏高   │  │
│  │ ▓▓▓▓▓▓▓░░ 15.2 kgce/m²·a │  │  │                                │  │
│  │ ── 国标 18.0               │  │  │ ┌─ 根因1 (概率85%) ────────┐  │  │
│  │ ── 同类均值 14.5           │  │  │ │ HVAC夜间未切换低功耗模式   │  │  │
│  │ ── 历史最优 12.8           │  │  │ │ 证据: 22:00-06:00负荷曲线  │  │  │
│  │                            │  │  │ │       与工作日白昼差异<15%  │  │  │
│  │ 实验楼 [4栋]  🔴超标        │  │  │ │ 建议: 设置夜间VAV最低风量  │  │  │
│  │ ▓▓▓▓▓▓▓▓▓▓ 28.5 🔴       │  │  │ │       预估节能: 8,500kWh/月│  │  │
│  │                            │  │  │ └────────────────────────────┘  │  │
│  │ 学生公寓 [8栋]              │  │  │                                │  │
│  │ ▓▓▓▓▓░░░░ 8.2             │  │  │ ┌─ 根因2 (概率60%) ────────┐  │  │
│  │                            │  │  │ │ 实验设备待机能耗            │  │  │
│  │ 图书馆 [1栋]                │  │  │ │ 证据: 周末负荷仍维持65%基载│  │  │
│  │ ▓▓▓▓▓▓░░░ 11.3            │  │  │ │ 建议: 加装智能插座定时断电  │  │  │
│  │                            │  │  │ └────────────────────────────┘  │  │
│  │ 行政楼 [2栋]                │  │  │                                │  │
│  │ ▓▓▓▓░░░░░ 9.8             │  │  │ ┌─ 根因3 (概率35%) ────────┐  │  │
│  │                            │  │  │ │ 照明系统夜间未关闭          │  │  │
│  │ 食堂 [3栋]                  │  │  │ │ 证据: 23:00后照明功率仍有  │  │  │
│  │ ▓▓▓▓▓▓▓▓░ 18.1            │  │  │ │       15kW基础负荷         │  │  │
│  │                            │  │  │ │ 建议: 接入智能照明控制系统  │  │  │
│  └────────────────────────────┘  │  │ └────────────────────────────┘  │  │
│                                  │  │                                │  │
│                                  │  │ [🔄重新分析] [导出证据链]       │  │
│                                  │  └────────────────────────────────┘  │
├──────────────────────────────────┴───────────────────────────────────────┤
│ 底部Tab 280px                                                             │
│ [💡 节能优化建议] [📊 多维度对比] [📈 能耗预测]                             │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │                                                                      │ │
│ │  (内容随Tab切换，见7.4底部模块)                                        │ │
│ │                                                                      │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.2 组件树

```
<EnergyDiagnosisCenter />
├── <TopFilterBar />
│   ├── <EnergyTypeTabBar />
│   ├── <CampusSelector />
│   ├── <DateRangePicker />                // 时间范围选择
│   └── <ExportButton />
│
├── <DiagnosisSummaryCards />              // 诊断摘要三卡片
│   ├── <EfficiencyScoreCard />            // 能效评分 + 迷你趋势图
│   ├── <OverStandardCard />               // 超标建筑数
│   └── <SavingPotentialCard />            // 预估节能潜力（四维分项）
│
├── <SankeyDiagramPanel />                 // 碳排溯源桑基图（全宽）
│   ├── <EChartsSankeyChart />             // ECharts sankey 图
│   ├── <SankeyEnergyTypeToggle />         // 电/水/气/热 切换
│   ├── <SankeyLegend />                   // 能源输入/转换/终端/损耗 图例
│   └── <SankeySummaryBar />              // 总值/转换效率/总损耗
│
├── <LowerContentArea />                   // 下半区
│   ├── <BenchmarkPanel />                 // 左50% 能效基准对标
│   │   ├── <BuildingTypeGroup /> × 6      // 按6种建筑类型分组
│   │   │   ├── <BenchmarkBar />           // 横向柱状图
│   │   │   ├── <BenchmarkLines />         // 三条基准线（国标/同类均值/历史最优）
│   │   │   └── <OverStandardBadge />      // 超标红标
│   │   └── <BenchmarkFilter />            // 建筑类型筛选
│   │
│   └── <RootCausePanel />                 // 右50% AI根因分析
│       ├── <AnomalySummary />             // 异常描述
│       ├── <RootCauseList />
│       │   └── <RootCauseCard /> × N      // 每个根因一张卡片
│       │       ├── <ProbabilityIndicator /> // 概率环
│       │       ├── <EvidenceChain />       // 证据链
│       │       └── <SuggestedAction />     // 建议措施 + 预估节能
│       └── <AnalysisActions />            // [重新分析] [导出证据链]
│
├── <BottomTabPanel />                     // 底部Tab
│   ├── <BottomTabBar />
│   │   ├── Tab: "💡 节能优化建议"
│   │   ├── Tab: "📊 多维度对比"
│   │   └── Tab: "📈 能耗预测"
│   │
│   └── <BottomTabContent />               // AnimatePresence 切换
│       ├── <SavingAdviceList />            // 节能建议卡片列表
│       │   └── <AdviceCard /> × N
│       │       ├── <PriorityBadge />
│       │       ├── <SavingEstimate />
│       │       └── <StatusAction />       // [采纳] [执行中] [已完成]
│       │
│       ├── <TrendComparisonChart />        // 多维度对比
│       │   ├── <BuildingSelector />        // 多建筑选择
│       │   ├── <EChartsMultiLineChart />   // 同比/环比/多建筑叠加
│       │   └── <YoyMomSummary />           // 同比环比汇总数据
│       │
│       └── <EnergyForecastChart />         // 能耗预测
│           ├── <ForecastPeriodSelect />    // 预测周期（7天/30天/季度）
│           ├── <EChartsForecastChart />    // 历史+预测虚线
│           └── <ForecastSummary />         // 预测值+置信区间
```

### 7.3 交互联动

| 交互 | 触发 | 效果 |
|---|---|---|
| 能源类型Tab切换 | 点击 | 桑基图 + 对标面板 + 根因分析全部按新能源类型刷新 |
| 桑基图节点hover | 鼠标移入 | tooltip显示该节点能源量、占比、损耗率 |
| 桑基图节点点击 | 点击 | 右侧联动显示该终端设备的对标数据 |
| 对标面板建筑类型切换 | 点击类型 | `fetchBenchmark(buildingType)` 刷新对标数据 |
| 对标超标建筑点击 | 点击红色建筑 | 自动跳转至监控中心查看该建筑实时数据 |
| 根因分析触发 | 从告警/对标跳转 | `runRootCauseAnalysis(anomalyId)` 展示AI分析结果 |
| 根因卡片展开 | 点击 | 展开证据链详情（图表+数据表） |
| 节能建议采纳 | 点击[采纳] | `updateAdviceStatus(id, 'accepted')` |
| 底部Tab切换 | 点击 | AnimatePresence 左右滑动切换 |

### 7.4 底部Tab模块详述

#### 7.4.1 节能优化建议

```
┌─────────────────────────────────────────────────────────────┐
│ 💡 节能优化建议                                    共12条建议  │
│ ─────────────────────────────────────────────────────────── │
│ ┌────────────────────────────┬────────────────────────────┐ │
│ │ 🔴 高优先 │ 实验楼A HVAC夜间优化  │ 🔵 中优先 │ 公寓热水定时│ │
│ │ 预估节能 8,500kWh/月       │ 预估节能 200m³/月         │ │
│ │ 年省 ¥62,000              │ 年省 ¥8,400               │ │
│ │ 难度: 简单                 │ 难度: 中等                 │ │
│ │ [采纳]                    │ [采纳]                    │ │
│ ├────────────────────────────┼────────────────────────────┤ │
│ │ 🔴 高优先 │ 食堂燃气灶具改造    │ 🟢 低优先 │ 行政楼照明  │ │
│ │ 预估节能 500m³/月          │ 预估节能 3,200kWh/月     │ │
│ │ 投资 ¥180,000 回收14月     │ 投资 ¥45,000 回收8月      │ │
│ │ 难度: 中等                 │ 难度: 简单                 │ │
│ │ [采纳]                    │ [采纳]                    │ │
│ └────────────────────────────┴────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

- 建议卡片双列瀑布流布局
- 优先级色标：🔴高→红底、🔵中→蓝底、🟢低→灰底
- 投资类建议额外显示回收期

#### 7.4.2 多维度对比

- ECharts 多系列折线图
- 支持选择多建筑叠加对比
- 支持同比（去年同期）/环比（上月同期）
- 底部汇总：各建筑同比变化率、环比变化率
- 能源类型跟随顶部Tab

#### 7.4.3 能耗预测

- ECharts 折线图（历史实线 + 预测虚线 + 置信区间阴影）
- 预测周期可选：7天 / 30天 / 季度
- 预测值+置信区间（80%/95%）
- 底部汇总：预测总用量、预测峰值、与目标差距

---

## 8. 页面3：用能日历

### 8.1 页面布局

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 顶部 56px 导航栏                                                          │
│ [⚡电 💧水 🔥气 🌡️热 📊综合] [校区▼] [◀ 2026年7月 ▶]      [导出] [设置]  │
├──────────────────────────────────────────────────────────────────────────┤
│ 月度摘要三卡片 120px                                                       │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                      │
│ │ 本月用能       │ │ 异常天数      │ │ 节能达标天数  │                      │
│ │ 1,058 tce    │ │ 5 天          │ │ 22 天         │                      │
│ │ ⚡285,000kWh │ │ 🔴 标红显示   │ │ ✅ 73.3%      │                      │
│ │ 💧12,500m³  │ │ 环比↑2天     │ │               │                      │
│ │ 🔥3,800m³   │ │              │ │               │                      │
│ │ 🌡️180GJ     │ │              │ │               │                      │
│ └──────────────┘ └──────────────┘ └──────────────┘                      │
├────────────────────────────────┬─────────────────────────────────────────┤
│                                │                                         │
│  中间左 60% — 日历热力图         │  中间右 40% — 用能画像面板              │
│                                │                                         │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────────┐  │
│  │      2026年7月            │  │  │ 用能画像                         │  │
│  │ ┌──┬──┬──┬──┬──┬──┬──┐  │  │  │                                  │  │
│  │ │一│二│三│四│五│六│日│  │  │  │  ── 工作日典型曲线                  │  │
│  │ ├──┼──┼──┼──┼──┼──┼──┤  │  │  │  ── 周末典型曲线                   │  │
│  │ │  │  │ 1│ 2│ 3│ 4│ 5│  │  │  │  ── 假期典型曲线                   │  │
│  │ │  │  │🟢│🟢│🟡│🟢│🔴│  │  │  │                                  │  │
│  │ ├──┼──┼──┼──┼──┼──┼──┤  │  │  │   24h负荷曲线叠加对比              │  │
│  │ │ 6│ 7│ 8│ 9│10│11│12│  │  │  │                                  │  │
│  │ │🟢│🟢│🟢│🟢│🟢│🔵│🔵│  │  │  │  季节规律                         │  │
│  │ ├──┼──┼──┼──┼──┼──┼──┤  │  │  │  ┌────┬────┬────┬────┐          │  │
│  │ │13│14│15│16│17│18│19│  │  │  │  │ 春 │ 夏 │ 秋 │ 冬 │          │  │
│  │ │🔵│🟢│🟢│🟢│🟢│🔴│🔴│  │  │  │  │32  │45  │28  │38  │          │  │
│  │ ├──┼──┼──┼──┼──┼──┼──┤  │  │  │  │tce │tce │tce │tce │          │  │
│  │ │20│21│22│23│24│25│26│  │  │  │  └────┴────┴────┴────┘          │  │
│  │ │🔵│🟢│🟢│🟢│⚠️│🔴│🔴│  │  │  │                                  │  │
│  │ ├──┼──┼──┼──┼──┼──┼──┤  │  │  │  高峰时段: 08-11, 14-17          │  │
│  │ │27│28│29│30│31│  │  │  │  │  │  低谷时段: 23-06                  │  │
│  │ │🔵│🟢│🟢│🟢│🟡│  │  │  │  │  │  峰谷比: 3.2:1                   │  │
│  │ └──┴──┴──┴──┴──┴──┴──┘  │  │  │                                  │  │
│  │                            │  │  │  [查看详情 →]                    │  │
│  │ 图例: 🟢正常 🔴偏高 🔵偏低  │  │  └──────────────────────────────────┘  │
│  │       ⚠️异常日              │  │                                         │
│  │       🟡假期               │  │                                         │
│  └──────────────────────────┘  │                                         │
├────────────────────────────────┴─────────────────────────────────────────┤
│ 选中日详情 280px（点击日历某天展开）                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ 2026年7月24日 周五 ⚠️异常日（用电超标15%）                 [→查看告警] │ │
│ │ ─────────────────────────────────────────────────────────────────── │ │
│ │ ┌─ 24h负荷曲线（四维）─────────────┐ ┌─ 峰谷分析 ────────────────┐   │ │
│ │ │                                  │ │                            │   │ │
│ │ │  ECharts 面积图                   │ │  峰时 45% ████████░░      │   │ │
│ │ │  ⚡电 ── 💧水 ── 🔥气 ── 🌡️热   │ │  谷时 25% █████░░░░░      │   │ │
│ │ │                                  │ │  平时 30% ██████░░░░      │   │ │
│ │ │  00  03  06  09  12  15  18  21  │ │                            │   │ │
│ │ └──────────────────────────────────┘ │  ┌─ 分时能耗占比 ────────┐ │   │ │
│ │ ┌─ 分时能耗占比饼图 ─────────────┐   │ │  ⚡ 65%  💧 15%        │ │   │ │
│ │ │  ⚡ 电力 65%                   │   │ │  🔥 12%  🌡️ 8%        │ │   │ │
│ │ │  💧 水 15%                     │   │ └────────────────────────┘ │   │ │
│ │ │  🔥 气 12%                     │   │                            │   │ │
│ │ │  🌡️ 热 8%                      │   │                            │   │ │
│ │ └──────────────────────────────────┘   │                            │   │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ 底部Tab 280px                                                             │
│ [📊 峰谷分析] [⏰ 分时策略建议] [📚 学期对比]                                │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │                                                                      │ │
│ │  (内容随Tab切换，见8.4底部模块)                                        │ │
│ │                                                                      │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.2 组件树

```
<EnergyCalendarView />
├── <TopFilterBar />
│   ├── <EnergyTypeTabBar />
│   ├── <CampusSelector />
│   ├── <MonthNavigator />                    // ◀ 2026年7月 ▶
│   └── <ExportButton />
│
├── <MonthlySummaryCards />                   // 月度摘要三卡片
│   ├── <MonthUsageCard />                    // 本月用能（四维分项）
│   ├── <AbnormalDaysCard />                  // 异常天数 + 环比
│   └── <ComplianceDaysCard />                // 节能达标天数 + 达标率
│
├── <CalendarMainArea />                      // 中间主区域
│   ├── <CalendarHeatmapPanel />              // 左60% 日历热力图
│   │   ├── <MonthGrid />                     // 7列×5/6行 日期网格
│   │   │   └── <DayCell /> × 28~31           // 单个日期色块
│   │   │       ├── <DayNumber />             // 日期数字
│   │   │       ├── <IntensityValue />        // 用能强度值
│   │   │       ├── <AlertDot />              // 异常标记点
│   │   │       └── <WeekendBadge />          // 周末/假期标记
│   │   ├── <HeatmapLegend />                 // 色阶图例（红→绿→蓝）
│   │   └── <DayClickHandler />               // 点击事件 → fetchDayDetail
│   │
│   └── <EnergyProfilePanel />                // 右40% 用能画像
│       ├── <PatternCurveChart />             // 工作日/周末/假期 三曲线叠加
│       ├── <SeasonalSummary />               // 四季用能对比柱状图
│       ├── <PeakValleySummary />             // 高峰/低谷时段汇总
│       └── <ProfileDetailLink />             // [查看详情 →]
│
├── <DayDetailPanel />                        // 选中日详情（条件渲染）
│   ├── <DayHeader />                         // 日期 + 异常标记 + [→查看告警]
│   ├── <HourlyLoadChart />                   // 24h四维负荷曲线
│   ├── <PeakValleyAnalysis />                // 峰谷分析条形图
│   └── <HourlyBreakdownPie />                // 分时能耗占比饼图
│
├── <BottomTabPanel />                        // 底部Tab
│   ├── <BottomTabBar />
│   │   ├── Tab: "📊 峰谷分析"
│   │   ├── Tab: "⏰ 分时策略建议"
│   │   └── Tab: "📚 学期对比"
│   │
│   └── <BottomTabContent />                  // AnimatePresence 切换
│       ├── <PeakValleyTrendChart />          // 月度峰谷趋势
│       │   ├── <EChartsStackedAreaChart />   // 峰/平/谷堆叠面积图
│       │   └── <MonthlyPeakValleyTable />    // 月度峰谷数据表
│       │
│       ├── <TouAdvicePanel />                // 分时策略建议
│       │   └── <TouAdviceCard /> × N         // 每条建议一张卡片
│       │       ├── <TimePeriodBadge />        // 时段标签
│       │       ├── <AdviceContent />
│       │       └── <SavingEstimate />
│       │
│       └── <SemesterComparisonPanel />       // 学期对比
│           ├── <SemesterBarChart />          // ECharts 分组柱状图
│           └── <SemesterDetailTable />       // 学期数据明细表
```

### 8.3 交互联动

| 交互 | 触发 | 效果 |
|---|---|---|
| 月份切换 | ◀ ▶ | `fetchHeatmap(year, month)` + `fetchMonthlySummary()` 全页面刷新 |
| 日期色块点击 | 点击某天 | `fetchDayDetail(date)` 展开下方日详情面板，日期高亮 |
| 异常日点击 | 点击⚠️标记日 | 展开日详情 + 显示"→查看告警"按钮 |
| 查看告警跳转 | 点击[→查看告警] | 跳转 `/energy-monitor?alertDate=YYYY-MM-DD` 查看当日告警 |
| 能源类型切换 | 点击Tab | 热力图色块颜色重算 + 画像曲线切换 + 日详情四维数据更新 |
| 画像曲线hover | 鼠标移入 | tooltip显示该时刻各模式的具体值 |
| 底部Tab切换 | 点击 | AnimatePresence 左右滑动切换 |
| 学期选择 | 点击学期柱 | 联动显示该学期详细数据 |

### 8.4 底部Tab模块详述

#### 8.4.1 峰谷分析

- ECharts 堆叠面积图（全宽）
  - 红色区域：峰时用量
  - 蓝色区域：平时用量
  - 绿色区域：谷时用量
- X轴：月度（1月-12月）
- 下方数据表：各月峰谷电量/峰谷比/峰谷差

#### 8.4.2 分时策略建议

```
┌──────────────────────────────────────────────────────┐
│ ⏰ 分时策略建议                              共8条     │
│ ──────────────────────────────────────────────────── │
│ ┌───────────────────────┬──────────────────────────┐ │
│ │ 08:00-11:00 峰时       │ 23:00-06:00 谷时        │ │
│ │ 🔴 高优先              │ 🟢 低优先                │ │
│ │ 建议将洗衣机等可调节    │ 建议利用谷时电价优惠     │ │
│ │ 负荷转移至谷时          │ 预冷/预热建筑            │ │
│ │ 预估节能: 5,000kWh/月  │ 预估节能: 15,000kWh/月  │ │
│ ├───────────────────────┼──────────────────────────┤ │
│ │ 14:00-17:00 峰时       │ 11:00-14:00 平时        │ │
│ │ 🔵 中优先              │ 🔵 中优先                │ │
│ │ 建议空调温度上调1°C     │ 建议优化食堂排风系统     │ │
│ │ 预估节能: 3,200kWh/月  │ 预估节能: 1,500kWh/月   │ │
│ └───────────────────────┴──────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

#### 8.4.3 学期对比

- ECharts 分组柱状图
- 按学期分组：每学期4根柱（电/水/气/热）
- 学期列表：2025-2026第一学期 / 寒假 / 第二学期 / 暑假
- 点击学期柱联动显示详细数据

---

## 9. 跨页面联动逻辑

### 9.1 日历异常日 → 监控中心

```
用户路径: 用能日历 → 发现异常日 → 点击"→查看告警" → 能源监控中心
```

| 步骤 | 动作 | 数据传递 |
|---|---|---|
| 1 | 用户在日历点击异常日 | `selectedDate = '2026-07-24'` |
| 2 | 日详情面板展开 | `fetchDayDetail('2026-07-24')` |
| 3 | 点击[→查看告警] | 路由跳转 `/energy-monitor?date=2026-07-24&alertFilter=energy` |
| 4 | 监控中心接收参数 | 自动设置 `alertFilter = { category: 'energy' }` 并加载该日期附近告警 |
| 5 | 告警列表过滤 | 显示当日及前后1天的能源异常告警 |

### 9.2 监控中心告警 → 诊断中心根因分析

```
用户路径: 能源监控中心 → 发现告警 → 点击"根因分析" → 能源诊断中心
```

| 步骤 | 动作 | 数据传递 |
|---|---|---|
| 1 | 用户在告警列表发现异常 | 告警ID `ALT-20260724-001` |
| 2 | 点击[根因分析] | 路由跳转 `/energy-diagnosis?anomalyId=ALT-20260724-001` |
| 3 | 诊断中心接收参数 | `setSelectedAnomaly('ALT-20260724-001')` |
| 4 | 自动触发AI分析 | `runRootCauseAnalysis('ALT-20260724-001')` |
| 5 | 展示分析结果 | 右侧根因面板展开，显示归因+证据链+建议 |

### 9.3 诊断中心对标超标 → 监控中心

```
用户路径: 能源诊断中心 → 发现超标建筑 → 点击"查看实时" → 能源监控中心
```

| 步骤 | 动作 | 数据传递 |
|---|---|---|
| 1 | 用户在对标面板发现超标建筑 | 建筑ID `BLD-LAB-A` |
| 2 | 点击超标建筑名称 | 路由跳转 `/energy-monitor?building=BLD-LAB-A` |
| 3 | 监控中心接收参数 | 负荷曲线自动选中该建筑 + 高亮 |

### 9.4 全局状态同步

```typescript
// 跨页面状态通过 Zustand persist + URL query params 同步
// 共享状态：selectedCampus, selectedEnergyType
// 页面间传参：通过 URL searchParams
// 示例:
const navigate = useNavigate();
navigate(`/energy-diagnosis?anomalyId=${alert.id}`);

// 目标页面 useEffect 中解析参数
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const anomalyId = params.get('anomalyId');
  if (anomalyId) {
    runRootCauseAnalysis(anomalyId);
  }
}, [location.search]);
```

---

## 10. Mock 数据规格

### 10.1 通用 Mock 设定

| 设定项 | 值 | 说明 |
|---|---|---|
| 年度 | 2026 | 禁止硬编码 |
| 校区 | 主校区（main_campus） | 虚拟高校：华东智慧大学 |
| 建筑总数 | 28栋 | 教学楼6/实验楼4/公寓8/图书馆1/行政楼2/食堂3/其他4 |
| 设备总数 | 358台 | 电表156/水表82/气表45/热量表52/传感器23 |
| 总面积 | 325,000 m² | — |

### 10.2 标煤折算 & 碳排放因子（后台配置，禁止硬编码）

```typescript
const mockConversionFactors: ConversionFactors = {
  electricity: { coalEquivalent: 0.1229, carbonFactor: 0.5810 },
  water:       { coalEquivalent: 0.0857, carbonFactor: 0.0120 },
  gas:         { coalEquivalent: 1.2143, carbonFactor: 2.1620 },
  heat:        { coalEquivalent: 0.0341, carbonFactor: 0.1100 },
  updatedAt: '2026-01-01T00:00:00+08:00',
};
// 说明:
//   电力折标煤: 0.1229 kgce/kWh（当量值）
//   电力碳排放: 0.5810 tCO₂/MWh（华东电网2025年度排放因子）
//   天然气折标煤: 1.2143 kgce/m³
//   天然气碳排放: 2.1620 kgCO₂/m³
//   水折标煤: 0.0857 kgce/m³（供水系统能耗折算）
//   热力折标煤: 0.0341 kgce/GJ
```

### 10.3 页面1 Mock 数据

#### 10.3.1 实时用能总览

```typescript
const mockEnergyOverview: EnergyOverview = {
  energyType: 'electricity',
  campus: 'main_campus',
  timestamp: '2026-07-24T14:32:00+08:00',
  currentPower: 8542,                     // kW
  todayCumulative: 125800,                // kWh
  monthCumulative: 3852000,               // kWh
  yearCumulative: 21580000,               // kWh
  yoyChange: 8.5,                         // 同比 +8.5%
  momChange: -3.2,                        // 环比 -3.2%
  carbonIntensity: 3.18,                  // kgCO₂/m²·d
  byBuilding: [
    { buildingId: 'BLD-TEACH-01', buildingName: '教学楼A', buildingType: 'teaching', currentPower: 850, todayCumulative: 7200, floorCount: 6, area: 12000, intensity: 0.60 },
    { buildingId: 'BLD-TEACH-02', buildingName: '教学楼B', buildingType: 'teaching', currentPower: 780, todayCumulative: 6800, floorCount: 5, area: 10500, intensity: 0.65 },
    { buildingId: 'BLD-LAB-01', buildingName: '实验楼A', buildingType: 'laboratory', currentPower: 1520, todayCumulative: 18500, floorCount: 8, area: 15000, intensity: 1.23 },
    { buildingId: 'BLD-LAB-02', buildingName: '实验楼B', buildingType: 'laboratory', currentPower: 1380, todayCumulative: 16200, floorCount: 6, area: 12000, intensity: 1.35 },
    { buildingId: 'BLD-DORM-01', buildingName: '学生公寓1区', buildingType: 'dormitory', currentPower: 680, todayCumulative: 9800, floorCount: 7, area: 18000, intensity: 0.54 },
    { buildingId: 'BLD-LIB-01', buildingName: '图书馆', buildingType: 'library', currentPower: 920, todayCumulative: 11500, floorCount: 5, area: 22000, intensity: 0.52 },
    { buildingId: 'BLD-CANTEEN-01', buildingName: '第一食堂', buildingType: 'canteen', currentPower: 1250, todayCumulative: 14200, floorCount: 3, area: 5500, intensity: 2.58 },
    { buildingId: 'BLD-ADMIN-01', buildingName: '行政楼', buildingType: 'administrative', currentPower: 420, todayCumulative: 4800, floorCount: 8, area: 8000, intensity: 0.60 },
  ],
};
```

#### 10.3.2 水/气/热 分项总览（同结构，不同数值）

```typescript
const mockWaterOverview: Partial<EnergyOverview> = {
  energyType: 'water',
  currentPower: 285,                      // m³/h
  todayCumulative: 4580,                  // m³
  monthCumulative: 125000,
  yearCumulative: 856000,
  yoyChange: 5.2,
  momChange: -1.8,
  carbonIntensity: 0.42,
};

const mockGasOverview: Partial<EnergyOverview> = {
  energyType: 'gas',
  currentPower: 120,                      // m³/h
  todayCumulative: 1850,                  // m³
  monthCumulative: 38000,
  yearCumulative: 285000,
  yoyChange: -2.1,                        // 燃气同比减少（电气化改造效果）
  momChange: -8.5,                        // 夏季燃气用量低
  carbonIntensity: 1.25,
};

const mockHeatOverview: Partial<EnergyOverview> = {
  energyType: 'heat',
  currentPower: 35,                       // GJ/h（夏季供冷模式）
  todayCumulative: 520,                   // GJ
  monthCumulative: 15800,
  yearCumulative: 125000,
  yoyChange: 3.8,
  momChange: 12.5,                        // 7月供冷高峰
  carbonIntensity: 0.85,
};
```

#### 10.3.3 负荷曲线数据（24h四维）

```typescript
const mockLoadCurveData: LoadCurvePoint[] = [
  { timestamp: '2026-07-24T00:00:00+08:00', electricity: 1200, water: 45, gas: 30, heat: 15 },
  { timestamp: '2026-07-24T01:00:00+08:00', electricity: 1050, water: 32, gas: 25, heat: 12 },
  { timestamp: '2026-07-24T02:00:00+08:00', electricity: 980,  water: 28, gas: 22, heat: 10 },
  { timestamp: '2026-07-24T03:00:00+08:00', electricity: 950,  water: 25, gas: 20, heat: 10 },
  { timestamp: '2026-07-24T04:00:00+08:00', electricity: 920,  water: 22, gas: 18, heat: 8  },
  { timestamp: '2026-07-24T05:00:00+08:00', electricity: 1100, water: 35, gas: 25, heat: 12 },
  { timestamp: '2026-07-24T06:00:00+08:00', electricity: 2800, water: 120, gas: 55, heat: 20 },
  { timestamp: '2026-07-24T07:00:00+08:00', electricity: 5200, water: 210, gas: 85, heat: 28 },
  { timestamp: '2026-07-24T08:00:00+08:00', electricity: 7500, water: 265, gas: 110, heat: 32 },
  { timestamp: '2026-07-24T09:00:00+08:00', electricity: 8200, water: 280, gas: 115, heat: 35 },
  { timestamp: '2026-07-24T10:00:00+08:00', electricity: 8500, water: 275, gas: 118, heat: 35 },
  { timestamp: '2026-07-24T11:00:00+08:00', electricity: 8300, water: 260, gas: 125, heat: 33 },
  { timestamp: '2026-07-24T12:00:00+08:00', electricity: 7800, water: 240, gas: 145, heat: 30 },
  { timestamp: '2026-07-24T13:00:00+08:00', electricity: 7200, water: 220, gas: 130, heat: 28 },
  { timestamp: '2026-07-24T14:00:00+08:00', electricity: 8100, water: 260, gas: 115, heat: 33 },
  { timestamp: '2026-07-24T15:00:00+08:00', electricity: 8400, water: 270, gas: 112, heat: 34 },
  { timestamp: '2026-07-24T16:00:00+08:00', electricity: 8200, water: 255, gas: 108, heat: 32 },
  { timestamp: '2026-07-24T17:00:00+08:00', electricity: 7000, water: 200, gas: 95,  heat: 28 },
  { timestamp: '2026-07-24T18:00:00+08:00', electricity: 5500, water: 180, gas: 135, heat: 22 },
  { timestamp: '2026-07-24T19:00:00+08:00', electricity: 4800, water: 160, gas: 110, heat: 20 },
  { timestamp: '2026-07-24T20:00:00+08:00', electricity: 3800, water: 130, gas: 75,  heat: 18 },
  { timestamp: '2026-07-24T21:00:00+08:00', electricity: 2800, water: 95,  gas: 55,  heat: 16 },
  { timestamp: '2026-07-24T22:00:00+08:00', electricity: 1800, water: 65,  gas: 40,  heat: 15 },
  { timestamp: '2026-07-24T23:00:00+08:00', electricity: 1400, water: 50,  gas: 32,  heat: 14 },
];
```

#### 10.3.4 异常告警数据

```typescript
const mockAlerts: EnergyAlert[] = [
  {
    id: 'ALT-20260724-001',
    alertTime: '2026-07-24T14:32:00+08:00',
    category: 'energy',
    level: 'critical',
    title: '实验楼A用电功率超限',
    description: '实验楼A当前用电功率1520kW，超过设定阈值1200kW的126.7%',
    buildingId: 'BLD-LAB-01', buildingName: '实验楼A',
    energyType: 'electricity',
    metric: 'currentPower', metricValue: 1520, threshold: 1200, unit: 'kW',
    status: 'pending',
  },
  {
    id: 'ALT-20260724-002',
    alertTime: '2026-07-24T14:15:00+08:00',
    category: 'device',
    level: 'warning',
    title: '食堂气表离线',
    description: '第一食堂#G-005气表已离线超过30分钟',
    buildingId: 'BLD-CANTEEN-01', buildingName: '第一食堂',
    deviceName: '#G-005', energyType: 'gas',
    metric: 'offline_duration', metricValue: 35, threshold: 30, unit: 'min',
    status: 'processing', assignee: '李工', workOrderId: 'WO-20260724-015',
  },
  {
    id: 'ALT-20260724-003',
    alertTime: '2026-07-24T13:50:00+08:00',
    category: 'energy',
    level: 'warning',
    title: '图书馆用水量突变',
    description: '图书馆过去1小时用水量12.5m³，为同时段均值的3倍',
    buildingId: 'BLD-LIB-01', buildingName: '图书馆',
    energyType: 'water',
    metric: 'hourly_water', metricValue: 12.5, threshold: 4.2, unit: 'm³/h',
    status: 'acknowledged', assignee: '张工',
  },
  {
    id: 'ALT-20260724-004',
    alertTime: '2026-07-24T12:30:00+08:00',
    category: 'data',
    level: 'info',
    title: '教学楼B电表数据缺失',
    description: '教学楼B层#E-045电表数据缺失15分钟，已自动插值补全',
    buildingId: 'BLD-TEACH-02', buildingName: '教学楼B',
    deviceName: '#E-045', energyType: 'electricity',
    metric: 'data_gap', metricValue: 15, threshold: 5, unit: 'min',
    status: 'resolved', resolvedTime: '2026-07-24T12:45:00+08:00',
  },
  {
    id: 'ALT-20260724-005',
    alertTime: '2026-07-24T11:20:00+08:00',
    category: 'environment',
    level: 'warning',
    title: '实验楼B温度异常',
    description: '实验楼B 3层精密仪器室温度28.5°C，超过阈值26°C',
    buildingId: 'BLD-LAB-02', buildingName: '实验楼B',
    energyType: 'electricity',
    metric: 'temperature', metricValue: 28.5, threshold: 26, unit: '°C',
    status: 'acknowledged',
  },
  {
    id: 'ALT-20260724-006',
    alertTime: '2026-07-24T10:05:00+08:00',
    category: 'energy',
    level: 'warning',
    title: '行政楼夜间基础负荷偏高',
    description: '行政楼00:00-06:00平均功率420kW，为白昼均值的65%',
    buildingId: 'BLD-ADMIN-01', buildingName: '行政楼',
    energyType: 'electricity',
    metric: 'night_base_load', metricValue: 420, threshold: 250, unit: 'kW',
    status: 'pending',
  },
];
```

#### 10.3.5 设备状态数据

```typescript
const mockDevicePanel: DeviceStatusPanel = {
  totalDevices: 358,
  onlineCount: 342,
  offlineCount: 8,
  faultCount: 3,
  maintenanceCount: 5,
  devices: [
    { deviceId: 'DEV-E-001', deviceName: '图书馆1层智能电表', deviceType: '智能电表', energyType: 'electricity', buildingId: 'BLD-LIB-01', buildingName: '图书馆', status: 'online', lastHeartbeat: '2026-07-24T14:32:00+08:00', currentValue: 45.2, unit: 'kW', batteryLevel: 100 },
    { deviceId: 'DEV-W-012', deviceName: '教学楼B水表', deviceType: '水表', energyType: 'water', buildingId: 'BLD-TEACH-02', buildingName: '教学楼B', status: 'online', lastHeartbeat: '2026-07-24T14:32:00+08:00', currentValue: 2.3, unit: 'm³/h' },
    { deviceId: 'DEV-G-005', deviceName: '第一食堂气表', deviceType: '气表', energyType: 'gas', buildingId: 'BLD-CANTEEN-01', buildingName: '第一食堂', status: 'fault', lastHeartbeat: '2026-07-24T13:45:00+08:00', currentValue: 0, unit: 'm³/h' },
    { deviceId: 'DEV-H-003', deviceName: '实验楼A热量表', deviceType: '热量表', energyType: 'heat', buildingId: 'BLD-LAB-01', buildingName: '实验楼A', status: 'online', lastHeartbeat: '2026-07-24T14:32:00+08:00', currentValue: 12.5, unit: 'GJ/h' },
    { deviceId: 'DEV-E-088', deviceName: '学生公寓3区电表', deviceType: '智能电表', energyType: 'electricity', buildingId: 'BLD-DORM-03', buildingName: '学生公寓3区', status: 'offline', lastHeartbeat: '2026-07-24T08:15:00+08:00', currentValue: 0, unit: 'kW', batteryLevel: 12 },
    { deviceId: 'DEV-H-018', deviceName: '行政楼热量表', deviceType: '热量表', energyType: 'heat', buildingId: 'BLD-ADMIN-01', buildingName: '行政楼', status: 'maintenance', lastHeartbeat: '2026-07-23T16:00:00+08:00', currentValue: 0, unit: 'GJ/h' },
  ],
};
```

### 10.4 页面2 Mock 数据

#### 10.4.1 诊断摘要

```typescript
const mockDiagnosisSummary: DiagnosisSummary = {
  efficiencyScore: 72,
  overStandardBuildings: 4,
  totalOverStandard: 14.3,
  estimatedSavingPotential: {
    electricity: 120000,                    // kWh/年
    water: 800,                             // m³/年
    gas: 2000,                              // m³/年
    heat: 350,                              // GJ/年
    totalCostSaving: 850000,                // 元/年
    totalCarbonSaving: 120,                 // tCO₂/年
  },
};
```

#### 10.4.2 碳排桑基图数据

```typescript
const mockSankeyData: EnergyFlowSankey = {
  period: '2026-07',
  nodes: [
    { id: 'src_elec', name: '电网输入', category: 'source', energyType: 'electricity', value: 520 },
    { id: 'src_gas', name: '天然气输入', category: 'source', energyType: 'gas', value: 185 },
    { id: 'src_water', name: '自来水输入', category: 'source', energyType: 'water', value: 65 },
    { id: 'src_heat', name: '集中热力输入', category: 'source', energyType: 'heat', value: 95 },
    { id: 'conv_transformer', name: '变配电系统', category: 'conversion', energyType: 'electricity', value: 520 },
    { id: 'conv_boiler', name: '燃气锅炉', category: 'conversion', energyType: 'gas', value: 185 },
    { id: 'conv_pump', name: '供水泵站', category: 'conversion', energyType: 'water', value: 65 },
    { id: 'conv_exstation', name: '换热站', category: 'conversion', energyType: 'heat', value: 95 },
    { id: 'end_hvac', name: '暖通空调', category: 'enduse', energyType: 'electricity', value: 280 },
    { id: 'end_light', name: '照明系统', category: 'enduse', energyType: 'electricity', value: 95 },
    { id: 'end_power', name: '动力设备', category: 'enduse', energyType: 'electricity', value: 65 },
    { id: 'end_special', name: '特殊用能(实验)', category: 'enduse', energyType: 'electricity', value: 55 },
    { id: 'end_cooking', name: '餐饮用能', category: 'enduse', energyType: 'gas', value: 145 },
    { id: 'end_dhw', name: '生活热水', category: 'enduse', energyType: 'gas', value: 28 },
    { id: 'end_domestic', name: '生活用水', category: 'enduse', energyType: 'water', value: 52 },
    { id: 'end_heating', name: '采暖/供冷', category: 'enduse', energyType: 'heat', value: 78 },
    { id: 'end_other', name: '其他', category: 'enduse', energyType: 'electricity', value: 18 },
    { id: 'loss_transformer', name: '变配电损耗', category: 'loss', energyType: 'electricity', value: 25 },
    { id: 'loss_pipe', name: '管网热损', category: 'loss', energyType: 'heat', value: 12 },
    { id: 'loss_leak', name: '水管漏损', category: 'loss', energyType: 'water', value: 13 },
    { id: 'loss_flue', name: '烟气余热损失', category: 'loss', energyType: 'gas', value: 12 },
  ],
  links: [
    { source: 'src_elec', target: 'conv_transformer', value: 520, energyType: 'electricity' },
    { source: 'src_gas', target: 'conv_boiler', value: 185, energyType: 'gas' },
    { source: 'src_water', target: 'conv_pump', value: 65, energyType: 'water' },
    { source: 'src_heat', target: 'conv_exstation', value: 95, energyType: 'heat' },
    { source: 'conv_transformer', target: 'end_hvac', value: 280, energyType: 'electricity' },
    { source: 'conv_transformer', target: 'end_light', value: 95, energyType: 'electricity' },
    { source: 'conv_transformer', target: 'end_power', value: 65, energyType: 'electricity' },
    { source: 'conv_transformer', target: 'end_special', value: 55, energyType: 'electricity' },
    { source: 'conv_transformer', target: 'end_other', value: 18, energyType: 'electricity' },
    { source: 'conv_transformer', target: 'loss_transformer', value: 25, energyType: 'electricity', lossRate: 4.8 },
    { source: 'conv_boiler', target: 'end_cooking', value: 145, energyType: 'gas' },
    { source: 'conv_boiler', target: 'end_dhw', value: 28, energyType: 'gas' },
    { source: 'conv_boiler', target: 'loss_flue', value: 12, energyType: 'gas', lossRate: 6.5 },
    { source: 'conv_pump', target: 'end_domestic', value: 52, energyType: 'water' },
    { source: 'conv_pump', target: 'loss_leak', value: 13, energyType: 'water', lossRate: 20.0 },
    { source: 'conv_exstation', target: 'end_heating', value: 78, energyType: 'heat' },
    { source: 'conv_exstation', target: 'loss_pipe', value: 12, energyType: 'heat', lossRate: 12.6 },
  ],
  totalInput: 865,
  totalLoss: 62,
  overallEfficiency: 92.8,
};
```

#### 10.4.3 AI根因分析数据

```typescript
const mockRootCause: AIRootCauseAnalysis = {
  anomalyId: 'ALT-20260724-001',
  anomalyDescription: '实验楼A用电功率超限1520kW（阈值1200kW）',
  rootCauses: [
    {
      id: 'RC-001',
      cause: 'HVAC夜间未切换低功耗模式',
      probability: 0.85,
      impactLevel: 'high',
      evidence: [
        '22:00-06:00负荷曲线与工作日白昼差异仅15%，正常应<40%',
        '空调主机夜间运行功率维持在680kW，与白昼750kW接近',
        'VAV末端夜间风量设定值与白昼相同，未启用夜间purge模式',
      ],
      suggestedAction: '设置夜间VAV最低风量为白昼的30%，启用经济器purge模式',
      estimatedSaving: 8500,
      savingUnit: 'kWh/月',
    },
    {
      id: 'RC-002',
      cause: '实验设备待机能耗偏高',
      probability: 0.60,
      impactLevel: 'medium',
      evidence: [
        '周末（无人实验）负荷仍维持白昼基载的65%',
        '3台大型离心机24h运行，周末无实验任务',
        '分析仪器待机功率占总功率18%',
      ],
      suggestedAction: '加装智能插座，非实验时段自动切断设备电源',
      estimatedSaving: 3200,
      savingUnit: 'kWh/月',
    },
    {
      id: 'RC-003',
      cause: '照明系统夜间未关闭',
      probability: 0.35,
      impactLevel: 'low',
      evidence: [
        '23:00后照明功率仍有15kW基础负荷',
        '走廊/卫生间区域24h照明，无人感控制',
      ],
      suggestedAction: '公共区域加装人体感应器，设置22:00后自动关闭主照明',
      estimatedSaving: 1800,
      savingUnit: 'kWh/月',
    },
  ],
  confidence: 0.78,
  dataEvidence: [
    { type: 'chart', title: '24h负荷曲线对比', description: '工作日vs周末vs夜间', data: {} },
    { type: 'table', title: '各系统能耗占比', description: '空调42%/照明18%/动力25%/实验15%', data: {} },
    { type: 'metric', title: '夜间基础负荷率', description: '夜间/白昼 = 68%，国标建议<35%', data: {} },
  ],
};
```

#### 10.4.4 节能优化建议

```typescript
const mockSavingAdvice: EnergySavingAdvice[] = [
  { id: 'ADV-001', category: 'schedule', title: '实验楼A HVAC夜间优化', description: '设置夜间低功耗模式，VAV最低风量降至30%', priority: 'high', targetBuilding: '实验楼A', targetEnergyType: 'electricity', estimatedSaving: 102000, savingUnit: 'kWh/年', estimatedCostSaving: 74500, implementationDifficulty: 'easy', status: 'suggested' },
  { id: 'ADV-002', category: 'retrofit', title: '食堂燃气灶具改造', description: '更换高效节能灶具，加装余热回收装置', priority: 'high', targetBuilding: '第一食堂', targetEnergyType: 'gas', estimatedSaving: 6000, savingUnit: 'm³/年', estimatedCostSaving: 22800, paybackMonths: 14, implementationDifficulty: 'medium', status: 'suggested' },
  { id: 'ADV-003', category: 'equipment', title: '公寓热水定时加热', description: '学生公寓热水系统分时段加热，避免全天恒温', priority: 'medium', targetBuilding: '学生公寓1区', targetEnergyType: 'gas', estimatedSaving: 2400, savingUnit: 'm³/年', estimatedCostSaving: 9100, implementationDifficulty: 'easy', status: 'suggested' },
  { id: 'ADV-004', category: 'retrofit', title: '行政楼智能照明改造', description: '公共区域加装人体感应+光感控制', priority: 'low', targetBuilding: '行政楼', targetEnergyType: 'electricity', estimatedSaving: 38400, savingUnit: 'kWh/年', estimatedCostSaving: 28000, paybackMonths: 8, implementationDifficulty: 'easy', status: 'suggested' },
];
```

### 10.5 页面3 Mock 数据

#### 10.5.1 月度摘要

```typescript
const mockMonthlySummary: MonthlyEnergySummary = {
  month: '2026-07',
  totalUsage: {
    electricity: 2850000,                   // kWh
    water: 125000,                          // m³
    gas: 38000,                             // m³
    heat: 158000,                           // GJ
    totalTce: 1058,                         // tce
  },
  abnormalDays: 5,
  savingComplianceDays: 22,
  totalDays: 30,
};
```

#### 10.5.2 日历热力图数据（部分示例）

```typescript
const mockHeatmapData: CalendarHeatmapDay[] = [
  { date: '2026-07-01', totalTce: 32.5, electricity: 88000, water: 3800, gas: 1200, heat: 4800, intensity: 3.08, level: 'normal', isAbnormal: false, hasAlert: false },
  { date: '2026-07-02', totalTce: 33.2, electricity: 90200, water: 3950, gas: 1150, heat: 5000, intensity: 3.14, level: 'normal', isAbnormal: false, hasAlert: false },
  { date: '2026-07-03', totalTce: 28.5, electricity: 76000, water: 3200, gas: 1100, heat: 4500, intensity: 2.70, level: 'low', isAbnormal: false, hasAlert: false },
  { date: '2026-07-04', totalTce: 22.1, electricity: 58000, water: 2800, gas: 900, heat: 3800, intensity: 2.10, level: 'weekend', isAbnormal: false, hasAlert: false },
  { date: '2026-07-05', totalTce: 21.8, electricity: 56500, water: 2700, gas: 880, heat: 3700, intensity: 2.06, level: 'weekend', isAbnormal: false, hasAlert: false },
  { date: '2026-07-06', totalTce: 33.8, electricity: 91500, water: 4050, gas: 1250, heat: 5100, intensity: 3.20, level: 'normal', isAbnormal: false, hasAlert: false },
  { date: '2026-07-07', totalTce: 34.5, electricity: 93800, water: 4100, gas: 1280, heat: 5200, intensity: 3.26, level: 'normal', isAbnormal: false, hasAlert: false },
  // ... 中间省略 ...
  { date: '2026-07-20', totalTce: 24.2, electricity: 64000, water: 2900, gas: 950, heat: 4000, intensity: 2.29, level: 'holiday', isAbnormal: false, hasAlert: false },
  { date: '2026-07-21', totalTce: 33.0, electricity: 89000, water: 3900, gas: 1200, heat: 4900, intensity: 3.12, level: 'normal', isAbnormal: false, hasAlert: false },
  { date: '2026-07-22', totalTce: 35.8, electricity: 97200, water: 4200, gas: 1350, heat: 5400, intensity: 3.39, level: 'high', isAbnormal: false, hasAlert: false },
  { date: '2026-07-23', totalTce: 36.2, electricity: 98500, water: 4250, gas: 1380, heat: 5450, intensity: 3.43, level: 'high', isAbnormal: false, hasAlert: false },
  { date: '2026-07-24', totalTce: 39.5, electricity: 108000, water: 4800, gas: 1500, heat: 5800, intensity: 3.74, level: 'abnormal_high', isAbnormal: true, hasAlert: true, alertCount: 3 },
  { date: '2026-07-25', totalTce: 23.5, electricity: 62000, water: 2800, gas: 920, heat: 3900, intensity: 2.23, level: 'weekend', isAbnormal: false, hasAlert: false },
  { date: '2026-07-26', totalTce: 22.8, electricity: 59800, water: 2750, gas: 900, heat: 3800, intensity: 2.16, level: 'weekend', isAbnormal: false, hasAlert: false },
];
```

#### 10.5.3 用能画像

```typescript
const mockEnergyProfile: EnergyProfile = {
  workdayPattern: [
    { timestamp: '2026-07-21T00:00:00+08:00', electricity: 1200, water: 45, gas: 30, heat: 15 },
    { timestamp: '2026-07-21T06:00:00+08:00', electricity: 2800, water: 120, gas: 55, heat: 20 },
    { timestamp: '2026-07-21T08:00:00+08:00', electricity: 7500, water: 265, gas: 110, heat: 32 },
    { timestamp: '2026-07-21T10:00:00+08:00', electricity: 8500, water: 275, gas: 118, heat: 35 },
    { timestamp: '2026-07-21T12:00:00+08:00', electricity: 7800, water: 240, gas: 145, heat: 30 },
    { timestamp: '2026-07-21T14:00:00+08:00', electricity: 8100, water: 260, gas: 115, heat: 33 },
    { timestamp: '2026-07-21T18:00:00+08:00', electricity: 5500, water: 180, gas: 135, heat: 22 },
    { timestamp: '2026-07-21T22:00:00+08:00', electricity: 1800, water: 65, gas: 40, heat: 15 },
  ],
  weekendPattern: [
    { timestamp: '2026-07-25T00:00:00+08:00', electricity: 950, water: 35, gas: 25, heat: 12 },
    { timestamp: '2026-07-25T06:00:00+08:00', electricity: 1200, water: 55, gas: 30, heat: 14 },
    { timestamp: '2026-07-25T08:00:00+08:00', electricity: 2800, water: 120, gas: 55, heat: 18 },
    { timestamp: '2026-07-25T10:00:00+08:00', electricity: 3500, water: 145, gas: 65, heat: 20 },
    { timestamp: '2026-07-25T12:00:00+08:00', electricity: 3800, water: 155, gas: 95, heat: 22 },
    { timestamp: '2026-07-25T14:00:00+08:00', electricity: 3600, water: 140, gas: 70, heat: 21 },
    { timestamp: '2026-07-25T18:00:00+08:00', electricity: 2200, water: 95, gas: 85, heat: 16 },
    { timestamp: '2026-07-25T22:00:00+08:00', electricity: 1100, water: 45, gas: 30, heat: 13 },
  ],
  holidayPattern: [
    { timestamp: '2026-07-20T00:00:00+08:00', electricity: 650, water: 25, gas: 20, heat: 10 },
    { timestamp: '2026-07-20T06:00:00+08:00', electricity: 800, water: 35, gas: 22, heat: 12 },
    { timestamp: '2026-07-20T08:00:00+08:00', electricity: 1200, water: 65, gas: 35, heat: 15 },
    { timestamp: '2026-07-20T10:00:00+08:00', electricity: 1500, water: 75, gas: 40, heat: 16 },
    { timestamp: '2026-07-20T12:00:00+08:00', electricity: 1600, water: 80, gas: 55, heat: 18 },
    { timestamp: '2026-07-20T14:00:00+08:00', electricity: 1450, water: 70, gas: 38, heat: 17 },
    { timestamp: '2026-07-20T18:00:00+08:00', electricity: 900, water: 45, gas: 35, heat: 13 },
    { timestamp: '2026-07-20T22:00:00+08:00', electricity: 700, water: 30, gas: 22, heat: 11 },
  ],
  seasonalPattern: [
    { season: 'spring', avgDaily: 28.5, peakDemand: 8200, dominantEnergy: 'electricity' },
    { season: 'summer', avgDaily: 45.2, peakDemand: 12500, dominantEnergy: 'electricity' },
    { season: 'autumn', avgDaily: 30.8, peakDemand: 9000, dominantEnergy: 'electricity' },
    { season: 'winter', avgDaily: 38.5, peakDemand: 10800, dominantEnergy: 'heat' },
  ],
  peakHours: ['08:00-11:00', '14:00-17:00'],
  valleyHours: ['23:00-06:00'],
  peakValleyRatio: 3.2,
};
```

#### 10.5.4 选中日详情

```typescript
const mockDayDetail: DayDetail = {
  date: '2026-07-24',
  hourlyCurve: mockLoadCurveData,          // 复用24h负荷曲线数据
  peakValleyAnalysis: {
    peakHours: [
      { start: '08:00', end: '11:00', duration: 3, consumption: 25000 },
      { start: '14:00', end: '17:00', duration: 3, consumption: 24700 },
    ],
    valleyHours: [
      { start: '23:00', end: '06:00', duration: 7, consumption: 15800 },
    ],
    flatHours: [
      { start: '06:00', end: '08:00', duration: 2, consumption: 8000 },
      { start: '11:00', end: '14:00', duration: 3, consumption: 22800 },
      { start: '17:00', end: '23:00', duration: 6, consumption: 29500 },
    ],
    peakRatio: 45.0,
    valleyRatio: 25.0,
    flatRatio: 30.0,
  },
  hourlyBreakdown: [
    { period: '峰时 08:00-11:00', electricity: 21000, water: 805, gas: 343, heat: 100, total: 25000, percentage: 25.1 },
    { period: '峰时 14:00-17:00', electricity: 20500, water: 785, gas: 335, heat: 99, total: 24700, percentage: 24.8 },
    { period: '谷时 23:00-06:00', electricity: 11200, water: 310, gas: 185, heat: 77, total: 15800, percentage: 15.9 },
    { period: '平时 06:00-08:00', electricity: 6500, water: 330, gas: 110, heat: 40, total: 8000, percentage: 8.0 },
    { period: '平时 11:00-14:00', electricity: 18800, water: 700, gas: 405, heat: 88, total: 22800, percentage: 22.9 },
    { period: '平时 17:00-23:00', electricity: 23500, water: 830, gas: 510, heat: 105, total: 29500, percentage: 29.6 },
  ],
};
```

#### 10.5.5 学期对比

```typescript
const mockSemesterComparison: SemesterComparison = {
  semesters: [
    { name: '2025-2026第一学期', startDate: '2025-09-01', endDate: '2026-01-15', totalTce: 5850, avgDailyTce: 40.2, electricity: 15800000, water: 680000, gas: 225000, heat: 850000, peakDemandDay: '2025-12-18', peakDemandValue: 12800 },
    { name: '2026寒假', startDate: '2026-01-16', endDate: '2026-02-28', totalTce: 1850, avgDailyTce: 28.5, electricity: 4950000, water: 215000, gas: 85000, heat: 280000, peakDemandDay: '2026-01-20', peakDemandValue: 5200 },
    { name: '2025-2026第二学期', startDate: '2026-03-01', endDate: '2026-07-10', totalTce: 5620, avgDailyTce: 38.2, electricity: 15200000, water: 650000, gas: 198000, heat: 780000, peakDemandDay: '2026-06-25', peakDemandValue: 12500 },
    { name: '2026暑假', startDate: '2026-07-11', endDate: '2026-08-31', totalTce: 2200, avgDailyTce: 41.5, electricity: 6200000, water: 265000, gas: 95000, heat: 350000, peakDemandDay: '2026-07-24', peakDemandValue: 6800 },
  ],
};
```

---

## 11. 验收标准

### 11.1 页面1：能源监控中心

| 编号 | 验收标准 |
|---|---|
| EM-01 | **Given** 页面加载 **When** 首次进入 `/energy-monitor` **Then** 5个KPI卡片正确显示当日总用能/实时功率/本月累计/碳排强度/同比环比，数字有滚动动画 |
| EM-02 | **Given** 能源类型Tab **When** 从⚡电切换到💧水 **Then** 负荷曲线Y轴单位从kW切换为m³/h，KPI卡片数字滚动更新，数据来自水维度 |
| EM-03 | **Given** 负荷曲线 **When** 多选3栋以上建筑 **Then** 叠加曲线正确渲染各建筑线条，颜色与建筑对应，hover显示建筑名+具体值 |
| EM-04 | **Given** 告警中心 **When** 存在紧急级别告警 **Then** 🔴红色标记+行背景红色闪烁+排在列表首位 |
| EM-05 | **Given** 告警列表 **When** 点击[确认]按钮 **Then** 状态变为"已确认"，颜色从红变橙，动画过渡200ms |
| EM-06 | **Given** 告警派单 **When** 点击[派单]选择处理人 **Then** 弹窗关闭，告警状态变为"处理中"，显示处理人名称+工单号 |
| EM-07 | **Given** 设备面板 **When** 存在离线/故障设备 **Then** 🔴红色标记+设备行背景红色+离线时长显示 |
| EM-08 | **Given** 设备筛选 **When** 选择"水表" **Then** 仅显示water类型设备，数字统计同步更新 |
| EM-09 | **Given** 四维分项 **When** hover KPI"当日总用能"卡片 **Then** tooltip展示电/水/气/热四项具体值 |
| EM-10 | **Given** 校区切换 **When** 切换至东校区 **Then** 全页面数据刷新，建筑列表更新为东校区建筑 |

### 11.2 页面2：能源诊断中心

| 编号 | 验收标准 |
|---|---|
| ED-01 | **Given** 诊断摘要 **When** 页面加载 **Then** 能效评分显示72分+迷你趋势图，超标建筑4栋红色高亮，节能潜力四维分项展示 |
| ED-02 | **Given** 桑基图 **When** 渲染完成 **Then** 能流从"能源输入→系统转换→终端消耗→损耗"四列正确连接，线宽与value成正比 |
| ED-03 | **Given** 桑基图 **When** hover节点 **Then** tooltip显示该节点能源量(tce)+占比(%) +损耗率(如有) |
| ED-04 | **Given** 桑基图 **When** 切换能源类型为💧水 **Then** 桑基图重新渲染水的能流路径，损耗节点显示水管漏损 |
| ED-05 | **Given** 对标面板 **When** 实验楼超标 **Then** 实验楼组标红色+超标百分比显示（35.7%）+三条基准线正确绘制 |
| ED-06 | **Given** AI根因分析 **When** 从告警跳转触发 **Then** 右侧面板自动展开，显示根因列表（概率排序）+证据链+建议措施 |
| ED-07 | **Given** 节能建议 **When** 点击[采纳] **Then** 状态变为accepted，卡片标记为已采纳，其他建议可见 |
| ED-08 | **Given** 多维度对比 **When** 选择3栋建筑+同比模式 **Then** 折线图正确叠加3栋建筑曲线+去年同期虚线对比 |
| ED-09 | **Given** 能耗预测 **When** 选择30天周期 **Then** 历史实线+预测虚线+95%置信区间阴影正确渲染 |
| ED-10 | **Given** 底部Tab **When** 切换三个Tab **Then** AnimatePresence滑动切换，动画≤200ms |

### 11.3 页面3：用能日历

| 编号 | 验收标准 |
|---|---|
| EC-01 | **Given** 日历热力图 **When** 7月渲染完成 **Then** 31天日期色块正确排列，颜色编码：偏高红/正常绿/偏低蓝/假期黄/周末蓝灰 |
| EC-02 | **Given** 异常日 **When** 7月24日有告警 **Then** 色块显示⚠️标记+点击展开日详情+显示"→查看告警"按钮 |
| EC-03 | **Given** 日期点击 **When** 点击7月24日 **Then** 下方展开日详情面板，显示24h四维负荷曲线+峰谷分析+分时占比饼图 |
| EC-04 | **Given** 用能画像 **When** 面板渲染 **Then** 三条曲线（工作日/周末/假期）正确叠加+季节规律柱状图显示四季数据 |
| EC-05 | **Given** 月份切换 **When** 切换到6月 **Then** 热力图重新渲染6月数据+月度摘要数字更新 |
| EC-06 | **Given** 查看告警跳转 **When** 点击[→查看告警] **Then** 路由跳转`/energy-monitor?date=2026-07-24&alertFilter=energy` |
| EC-07 | **Given** 峰谷分析Tab **When** 展开 **Then** 堆叠面积图12个月峰/平/谷分区+数据表各月峰谷比 |
| EC-08 | **Given** 学期对比Tab **When** 展开 **Then** 分组柱状图显示4个学期×4种能源（电/水/气/热） |
| EC-09 | **Given** 分时策略建议 **When** 展开 **Then** 卡片按优先级排序，显示时段+建议+预估节能量 |
| EC-10 | **Given** 能源类型切换 **When** 切换到🔥气 **Then** 热力图重新计算气维度色块+画像曲线切换为气流量 |

---

## 12. 开发顺序建议

```
Phase 1（基础层 — 3天）
├── Day 1: src/types/energy.ts 全部接口定义 + src/store/energy.ts 骨架
├── Day 2: src/api/energy.ts Mock Server（全部端点）
└── Day 3: 共享组件（TopFilterBar / EnergyTypeTabBar / CampusSelector / KPI通用卡片）

Phase 2（页面1 — 4天）
├── Day 4: KPI卡片行 + 实时负荷曲线（ECharts多区域叠加）
├── Day 5: 设备运行状态面板 + 设备筛选
├── Day 6: 异常告警中心（Tab分类 + Table + 状态流转）
└── Day 7: 派单弹窗 + 联调 + 动画

Phase 3（页面2 — 4天）
├── Day 8: 诊断摘要卡片 + 桑基图（ECharts sankey）
├── Day 9: 能效基准对标面板（横向柱状图+基准线）
├── Day 10: AI根因分析面板 + 节能建议卡片
└── Day 11: 底部三Tab（趋势对比/能耗预测）+ 联调

Phase 4（页面3 — 4天）
├── Day 12: 月度摘要卡片 + 日历热力图（自定义Grid组件）
├── Day 13: 用能画像面板 + 选中日详情面板
├── Day 14: 底部三Tab（峰谷分析/分时建议/学期对比）
└── Day 15: 联调 + 动画

Phase 5（跨页面联动 — 2天）
├── Day 16: 日历→监控中心 跳转 + URL参数传递
├── Day 17: 监控中心→诊断中心 跳转 + 自动触发AI分析 + 回归测试

Phase 6（打磨 — 2天）
├── Day 18: 全局动画统一 + 性能优化（懒加载/虚拟滚动）
└── Day 19: 1366×768最低分辨率适配 + 水印 + 验收标准逐条过
```

**总预估：19个工作日（约4周）**

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
