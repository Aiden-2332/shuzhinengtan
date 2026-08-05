// 高校智慧碳管理平台 - 模拟数据
import type { 
  Campus, Building, BuildingType, EnergyType, 
  EmissionFactor, KPIData, TrendPoint, BuildingRanking,
  Anomaly, CalculationBatch, QuotaAccount, ComplianceEvent,
  Measure, AISuggestion, QuotaTransaction
} from '@/types';
import { getPreviousCampusMonthKey, getSystemAnomalySnapshots } from '@/data/campus-system-data';
import { getCampusDateParts } from '@/lib/campus-realtime';

// ========== 基础配置 ==========
export const CURRENT_YEAR = 2026;
export const UNIVERSITY_NAME = '某大学';
export const UNIVERSITY_CODE = 'DX-2026-001';

// ========== 校区数据 ==========
export const campuses: Campus[] = [
  {
    id: 'campus-main',
    name: '主校区',
    code: 'MAIN',
    address: '北京市海淀区学院路100号',
    area: 850000,
    status: 'active'
  },
  {
    id: 'campus-east',
    name: '东校区',
    code: 'EAST',
    address: '北京市海淀区清华东路10号',
    area: 320000,
    status: 'active'
  }
];

// ========== 建筑数据 ==========
export const buildings: Building[] = [
  // 主校区 - 与 campus-data.ts 建筑ID保持一致
  { id: 'b01', name: '主教学楼', code: 'T1', campusId: 'campus-main', type: 'teaching', area: 32000, floors: 10, yearBuilt: 2005, status: 'active' },
  { id: 'b02', name: '第一教学楼', code: 'T2', campusId: 'campus-main', type: 'teaching', area: 26000, floors: 9, yearBuilt: 2008, status: 'active' },
  { id: 'b03', name: '第二教学楼', code: 'T3', campusId: 'campus-main', type: 'teaching', area: 22000, floors: 8, yearBuilt: 2010, status: 'active' },
  { id: 'b04', name: '第三教学楼', code: 'T4', campusId: 'campus-main', type: 'teaching', area: 19000, floors: 7, yearBuilt: 2012, status: 'active' },
  { id: 'b05', name: '信息学院楼', code: 'SI', campusId: 'campus-main', type: 'laboratory', area: 24000, floors: 8, yearBuilt: 2010, status: 'active' },
  { id: 'b06', name: '机械学院楼', code: 'ME', campusId: 'campus-main', type: 'laboratory', area: 24000, floors: 8, yearBuilt: 2010, status: 'active' },
  { id: 'b07', name: '材料学院楼', code: 'MA', campusId: 'campus-main', type: 'laboratory', area: 20000, floors: 7, yearBuilt: 2012, status: 'active' },
  { id: 'b08', name: '能源学院楼', code: 'EN', campusId: 'campus-main', type: 'laboratory', area: 20000, floors: 7, yearBuilt: 2012, status: 'active' },
  { id: 'b09', name: '经管学院楼', code: 'EM', campusId: 'campus-main', type: 'laboratory', area: 18000, floors: 6, yearBuilt: 2015, status: 'active' },
  { id: 'b10', name: '图书馆', code: 'LIB', campusId: 'campus-main', type: 'library', area: 40000, floors: 8, yearBuilt: 2012, status: 'active' },
  { id: 'b11', name: '行政办公楼', code: 'ADM', campusId: 'campus-main', type: 'administrative', area: 24000, floors: 7, yearBuilt: 1998, status: 'active' },
  { id: 'b12', name: '大礼堂', code: 'AUD', campusId: 'campus-main', type: 'administrative', area: 28000, floors: 3, yearBuilt: 2000, status: 'active' },
  { id: 'b13', name: '1号宿舍楼', code: 'D1', campusId: 'campus-main', type: 'dormitory', area: 15000, floors: 10, yearBuilt: 2003, status: 'active' },
  { id: 'b14', name: '2号宿舍楼', code: 'D2', campusId: 'campus-main', type: 'dormitory', area: 15000, floors: 10, yearBuilt: 2005, status: 'active' },
  { id: 'b15', name: '3号宿舍楼', code: 'D3', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2006, status: 'active' },
  { id: 'b16', name: '4号宿舍楼', code: 'D4', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2008, status: 'active' },
  { id: 'b17', name: '5号宿舍楼', code: 'D5', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2008, status: 'active' },
  { id: 'b18', name: '6号宿舍楼', code: 'D6', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2010, status: 'active' },
  { id: 'b19', name: '7号宿舍楼', code: 'D7', campusId: 'campus-main', type: 'dormitory', area: 15000, floors: 10, yearBuilt: 2010, status: 'active' },
  { id: 'b20', name: '8号宿舍楼', code: 'D8', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2012, status: 'active' },
  { id: 'b21', name: '9号宿舍楼', code: 'D9', campusId: 'campus-main', type: 'dormitory', area: 14000, floors: 9, yearBuilt: 2012, status: 'active' },
  { id: 'b22', name: '10号宿舍楼', code: 'D10', campusId: 'campus-main', type: 'dormitory', area: 13000, floors: 8, yearBuilt: 2015, status: 'active' },
  { id: 'b23', name: '第一食堂', code: 'C1', campusId: 'campus-main', type: 'dining', area: 12000, floors: 3, yearBuilt: 2002, status: 'active' },
  { id: 'b24', name: '第二食堂', code: 'C2', campusId: 'campus-main', type: 'dining', area: 12000, floors: 3, yearBuilt: 2005, status: 'active' },
  { id: 'b25', name: '综合体育馆', code: 'GYM', campusId: 'campus-main', type: 'gymnasium', area: 35000, floors: 3, yearBuilt: 2008, status: 'active' },
  { id: 'b26', name: '游泳馆', code: 'SWIM', campusId: 'campus-main', type: 'gymnasium', area: 22000, floors: 2, yearBuilt: 2010, status: 'active' },
  { id: 'b27', name: '科研楼A', code: 'R1', campusId: 'campus-main', type: 'laboratory', area: 24000, floors: 9, yearBuilt: 2010, status: 'active' },
  { id: 'b28', name: '科研楼B', code: 'R2', campusId: 'campus-main', type: 'laboratory', area: 24000, floors: 9, yearBuilt: 2010, status: 'active' },
  { id: 'b29', name: '光伏配电房', code: 'SOL', campusId: 'campus-main', type: 'teaching', area: 5000, floors: 1, yearBuilt: 2020, status: 'active' },
];

// ========== 排放因子 ==========
export const emissionFactors: EmissionFactor[] = [
  { id: 'ef-elec-2026', energyType: 'electricity', value: 0.6048, unit: 'tCO2/MWh', source: '北京市电网平均排放因子2026', effectiveDate: '2026-01-01', version: 'v2026.1' },
  { id: 'ef-gas-2026', energyType: 'natural_gas', value: 2.1622, unit: 'tCO2/万m³', source: '天然气燃烧排放因子', effectiveDate: '2026-01-01', version: 'v2026.1' },
  { id: 'ef-heat-2026', energyType: 'heat', value: 0.0873, unit: 'tCO2/GJ', source: '外购热力排放因子', effectiveDate: '2026-01-01', version: 'v2026.1' },
  { id: 'ef-solar-2026', energyType: 'solar', value: 0, unit: 'tCO2/MWh', source: '光伏发电零排放', effectiveDate: '2026-01-01', version: 'v2026.1' },
  { id: 'ef-green-2026', energyType: 'green_electricity', value: 0, unit: 'tCO2/MWh', source: '绿电凭证零排放', effectiveDate: '2026-01-01', version: 'v2026.1' },
];

// ========== KPI 数据 ==========
export function getKPIData(year: number, campusId?: string): KPIData {
  // 基础数据模拟
  const baseEmission = campusId === 'campus-east' ? 4500 : (campusId === 'campus-main' ? 12500 : 17000);
  
  return {
    totalEmission: baseEmission,
    emissionChange: campusId ? 3.2 : 2.8,
    targetDeviation: campusId ? -1.5 : 2.3,
    intensityPerArea: 12.8,
    intensityPerCapita: 0.85,
    forecastEmission: baseEmission * 1.05,
    quotaBalance: campusId ? 0 : 850, // 正数表示缺口
    dataCompleteness: 96.5,
    riskLevel: campusId ? 'low' : 'medium'
  };
}

// ========== 趋势数据 ==========
export function getTrendData(year: number): TrendPoint[] {
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const baseValue = 1400;
  
  // 使用确定性的月度偏差（基于月份索引）
  return months.map((month, index) => {
    const seasonalFactor = index < 2 || index > 9 ? 1.3 : (index > 4 && index < 8 ? 0.8 : 1.0);
    // 确定性偏差：基于月份产生固定的随机偏差
    const deviationFactor = 1 + ((index * 7 % 11) - 5) * 0.01; // -5% 到 +5% 的确定性偏差
    const actual = Math.round(baseValue * seasonalFactor * deviationFactor);
    const target = Math.round(baseValue * seasonalFactor * 0.95);
    
    return {
      period: `${year}-${month}`,
      actual,
      target,
      forecast: index >= 6 ? Math.round(baseValue * 1.05 * seasonalFactor) : undefined
    };
  });
}

// ========== 建筑排名数据 ==========
export function getBuildingRanking(year: number, metric: 'emission' | 'intensity' = 'emission'): BuildingRanking[] {
  const emissionData: Record<string, { emission: number; area: number }> = {
    'b27': { emission: 2850, area: 24000 },
    'b01': { emission: 2400, area: 32000 },
    'b06': { emission: 2200, area: 24000 },
    'b02': { emission: 1850, area: 26000 },
    'b05': { emission: 1650, area: 24000 },
    'b23': { emission: 1280, area: 12000 },
    'b13': { emission: 980, area: 15000 },
    'b10': { emission: 1050, area: 40000 },
    'b11': { emission: 720, area: 24000 },
    'b03': { emission: 980, area: 22000 },
  };
  
  return Object.entries(emissionData)
    .map(([buildingId, data], index) => {
      // 确定性偏差：基于建筑索引
      const changeValue = ((index * 3 % 7) - 3) * 2.5; // -7.5 到 +7.5
      return {
        buildingId,
        buildingName: buildings.find(b => b.id === buildingId)?.name || buildingId,
        emission: data.emission,
        intensity: Math.round(data.emission / data.area * 1000), // kgCO2/m2
        change: Math.round(changeValue * 10) / 10,
        rank: index + 1
      };
    })
    .sort((a, b) => metric === 'emission' ? b.emission - a.emission : b.intensity - a.intensity)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

// ========== 能源结构数据 ==========
export function getEnergyStructure(year: number) {
  return [
    { type: 'electricity' as EnergyType, name: '电力', value: 68, color: '#0099FF' },
    { type: 'natural_gas' as EnergyType, name: '天然气', value: 18, color: '#F59E0B' },
    { type: 'heat' as EnergyType, name: '热力', value: 12, color: '#EF4444' },
    { type: 'solar' as EnergyType, name: '光伏', value: 2, color: '#EAB308' },
  ];
}

// ========== 校区排放贡献 ==========
export function getCampusContribution(year: number) {
  return [
    { campusId: 'campus-main', name: '主校区', value: 74.5 },
    { campusId: 'campus-east', name: '东校区', value: 25.5 },
  ];
}

// ========== 异常数据 ==========
export function getAnomalies(status?: string): Anomaly[] {
  const now = new Date();
  const due = new Date(now.getTime() + 7 * 86_400_000);
  const dueParts = getCampusDateParts(due);
  const dueDate = `${dueParts.year}-${String(dueParts.month).padStart(2, '0')}-${String(dueParts.day).padStart(2, '0')}`;
  const anomalies: Anomaly[] = getSystemAnomalySnapshots(now).map((anomaly) => ({
    id: anomaly.id,
    buildingId: anomaly.buildingId,
    buildingName: anomaly.buildingName,
    type: anomaly.category === 'data'
      ? 'data_missing'
      : anomaly.title.includes('夜间') || anomaly.title.includes('空载')
        ? 'baseline_deviation'
        : 'consumption_spike',
    severity: anomaly.severity === 'emergency' ? 'blocked' : anomaly.severity === 'critical' ? 'serious' : anomaly.severity,
    period: getPreviousCampusMonthKey(now),
    impactValue: Math.round(anomaly.extraEmission * 1_000),
    impactCost: anomaly.extraCost,
    status: anomaly.status === 'acknowledged' ? 'assigned' : anomaly.status === 'resolved' ? 'closed' : anomaly.status,
    rule: `${anomaly.description} 阈值：${anomaly.threshold}${anomaly.unit}`,
    evidence: anomaly.evidence,
    responsiblePerson: anomaly.assignee ?? '碳管理员',
    dueDate,
    createdAt: anomaly.detectedAt.slice(0, 10),
  }));
  
  if (status) {
    return anomalies.filter(a => a.status === status);
  }
  return anomalies;
}

// ========== 核算批次数据 ==========
export function getCalculationBatch(period: string): CalculationBatch {
  return {
    id: `batch-${period}`,
    name: `${period}核算批次`,
    standard: 'JST303',
    year: 2026,
    period,
    status: 'reviewed',
    createdAt: '2026-07-01',
    createdBy: '碳管理员',
    totalEmission: 16850,
    scope1Emission: 5800,
    scope2Emission: 11050,
    dataCompleteness: 96.5,
    qualityScore: 92,
  };
}

// ========== 配额账户数据 ==========
export function getQuotaAccount(year: number): QuotaAccount {
  return {
    year,
    initialQuota: 16500,
    allocatedQuota: 16500,
    purchasedQuota: 0,
    soldQuota: 0,
    usedOffset: 0,
    surrenderedQuota: 0,
    balance: -350 // 负数表示缺口
  };
}

// ========== 履约日历数据 ==========
export function getComplianceEvents(year: number): ComplianceEvent[] {
  return [
    { id: 'evt-1', name: '2025年度排放报告', type: 'annual_report', dueDate: `${year}-03-31`, status: 'completed', completedAt: `${year}-03-28`, responsiblePerson: '碳管理员' },
    { id: 'evt-2', name: '第三方核查报告', type: 'verification', dueDate: `${year}-04-30`, status: 'completed', completedAt: `${year}-04-25`, responsiblePerson: '碳管理员' },
    { id: 'evt-3', name: '排放量确认', type: 'confirmation', dueDate: `${year}-07-31`, status: 'pending', responsiblePerson: '碳管理员' },
    { id: 'evt-4', name: '抵销申请', type: 'offset_application', dueDate: `${year}-09-30`, status: 'pending', responsiblePerson: '碳管理员' },
    { id: 'evt-5', name: '配额清缴', type: 'surrender', dueDate: `${year}-10-31`, status: 'pending', responsiblePerson: '财务处' },
    { id: 'evt-6', name: '1月数据上报', type: 'monthly_report', dueDate: `${year}-02-20`, status: 'completed', completedAt: `${year}-02-18`, responsiblePerson: '数据填报员' },
    { id: 'evt-7', name: '6月数据上报', type: 'monthly_report', dueDate: `${year}-07-20`, status: 'pending', responsiblePerson: '数据填报员' },
  ];
}

// ========== 配额交易流水 ==========
export function getQuotaTransactions(year: number): QuotaTransaction[] {
  return [
    { id: 'txn-1', type: 'allocation', year, quantity: 16500, date: `${year}-07-01`, reference: '北京市生态环境局核定发放' },
    { id: 'txn-2', type: 'purchase', year, quantity: 500, price: 85, date: `${year}-09-15`, reference: '碳市场交易' },
  ];
}

// ========== 措施库数据 ==========
export const measures: Measure[] = [
  {
    id: 'measure-1',
    name: '空调运行策略优化',
    category: '运行优化',
    applicableBuildingTypes: ['teaching', 'administrative', 'library'],
    baselineReduction: 15,
    investmentRange: [5000, 20000],
    paybackRange: [0.5, 1.5],
    risks: ['舒适度影响', '临时活动冲突'],
    prerequisites: ['中央空调系统', '楼控系统']
  },
  {
    id: 'measure-2',
    name: 'LED照明改造',
    category: '设备更新',
    applicableBuildingTypes: ['teaching', 'dormitory', 'library', 'administrative'],
    baselineReduction: 20,
    investmentRange: [10, 50], // 元/m2
    paybackRange: [2, 4],
    risks: ['照度不达标风险'],
    prerequisites: ['灯具寿命到期']
  },
  {
    id: 'measure-3',
    name: '夜间基载治理',
    category: '运行优化',
    applicableBuildingTypes: ['teaching', 'laboratory'],
    baselineReduction: 25,
    investmentRange: [2000, 10000],
    paybackRange: [0.3, 1],
    risks: ['科研设备误停'],
    prerequisites: ['夜间设备清单确认']
  },
  {
    id: 'measure-4',
    name: '屋顶光伏建设',
    category: '新能源',
    applicableBuildingTypes: ['teaching', 'dormitory', 'gymnasium', 'dining'],
    baselineReduction: 30,
    investmentRange: [500000, 2000000],
    paybackRange: [5, 8],
    risks: ['屋面承重', '并网审批', '消纳能力'],
    prerequisites: ['屋面资源评估', '电网接入方案']
  },
  {
    id: 'measure-5',
    name: '绿电采购',
    category: '能源采购',
    applicableBuildingTypes: ['teaching', 'laboratory', 'library', 'administrative', 'dormitory', 'dining', 'gymnasium'],
    baselineReduction: 100,
    investmentRange: [0, 0],
    paybackRange: [0, 0],
    risks: ['价格波动', '凭证合规'],
    prerequisites: ['预算审批']
  }
];

// ========== AI 建议数据 ==========
export function getAISuggestion(anomalyId: string): AISuggestion {
  const now = new Date();
  const anomaly = getSystemAnomalySnapshots(now).find((item) => item.id === anomalyId)
    ?? getSystemAnomalySnapshots(now)[0];
  return {
    id: 'suggestion-001',
    anomalyId,
    buildingId: anomaly.buildingId,
    evidence: [
      ...anomaly.evidence,
      `检测指标：${anomaly.metricValue}${anomaly.unit}，阈值${anomaly.threshold}${anomaly.unit}`,
      `根因判断：${anomaly.rootCause}`,
    ],
    causes: [
      { name: '空调未按时关闭', confidence: 0.85 },
      { name: '自习室照明常开', confidence: 0.45 },
      { name: '设备待机功耗', confidence: 0.30 }
    ],
    measures: [
      {
        measureId: 'measure-1',
        name: '空调运行策略优化',
        applicability: 'high',
        estimatedSavings: { energy: 12000, emission: 6.81, cost: 9600 },
        investment: 15000,
        paybackPeriod: 1.6
      },
      {
        measureId: 'measure-3',
        name: '夜间基载治理',
        applicability: 'high',
        estimatedSavings: { energy: 8550, emission: 4.85, cost: 6840 },
        investment: 5000,
        paybackPeriod: 0.7
      }
    ],
    estimatedSavings: { energy: 20550, emission: 11.66, cost: 16440 },
    investment: 20000,
    paybackPeriod: 1.2,
    status: 'pending',
    createdAt: now.toISOString().slice(0, 10)
  };
}

// ========== 小时负荷数据（热力图用）==========
export function getHourlyLoadData(buildingId: string, startDate: string, endDate: string): number[][] {
  // 生成7天 x 24小时的负载数据矩阵
  const data: number[][] = [];
  // 确定性的基础负载值
  const baseLoad = 70; // 固定基础负载
  
  for (let day = 0; day < 7; day++) {
    const dayData: number[] = [];
    for (let hour = 0; hour < 24; hour++) {
      // 工作时间负荷高，夜间负荷低
      const isWorking = hour >= 8 && hour <= 20;
      const isNight = hour >= 22 || hour <= 5;
      
      let load = baseLoad;
      if (isWorking) {
        // 确定性偏差：基于小时和天数
        const hourFactor = 1.5 + ((hour + day) % 5) * 0.1;
        load = baseLoad * hourFactor;
      } else if (isNight) {
        load = baseLoad * 0.3;
      } else {
        load = baseLoad * 0.8;
      }
      
      // 周末负荷降低
      if (day >= 5) {
        load *= 0.6;
      }
      
      // 教学楼A异常：夜间负荷偏高
      if (buildingId === 'b01' && isNight && day >= 0 && day <= 2) {
        load = baseLoad * 0.8; // 异常高
      }
      
      dayData.push(Math.round(load));
    }
    data.push(dayData);
  }
  
  return data;
}

// ========== 辅助函数 ==========
export function getBuildingName(buildingId: string): string {
  return buildings.find(b => b.id === buildingId)?.name || buildingId;
}

export function getCampusName(campusId: string): string {
  return campuses.find(c => c.id === campusId)?.name || campusId;
}

export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('zh-CN', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

export function formatEmission(value: number): string {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)}万`;
  }
  return formatNumber(value);
}
// ========== 四层控制塔数据 ==========

// L2 院系排名数据
export function getDepartmentRanking(year: number = CURRENT_YEAR) {
  return [
    { id: 'dept-cs', name: '计算机学院', type: 'college', emission: 2850, target: 2600, progress: 78 },
    { id: 'dept-me', name: '机械工程学院', type: 'college', emission: 3200, target: 3000, progress: 65 },
    { id: 'dept-chem', name: '化学学院', type: 'college', emission: 4100, target: 3800, progress: 52 },
    { id: 'dept-lib', name: '图书馆', type: 'facility', emission: 1250, target: 1200, progress: 88 },
    { id: 'dept-dorm', name: '宿舍管理中心', type: 'facility', emission: 2800, target: 2700, progress: 72 },
    { id: 'dept-dining', name: '餐饮服务中心', type: 'facility', emission: 1900, target: 1800, progress: 81 },
  ];
}

// L2 部门 KPI 数据
export function getDepartmentKPI(deptId: string) {
  return {
    emission: 2850,
    target: 2600,
    progress: 78,
    ranking: 3,
    totalDepts: 6,
    yearOverYear: -5.2,
  };
}

// L3 实时监测数据
export function getRealtimeMonitoring(buildingId?: string) {
  return {
    electricity: 1250.5,
    gas: 320.8,
    heat: 180.2,
    water: 450.0,
    timestamp: new Date().toISOString(),
  };
}

// L4 报告进度数据
export function getReportProgress(year: number = CURRENT_YEAR) {
  return [
    { id: 'rpt-annual', name: '市级公共机构能耗年报', framework: 'municipal', progress: 85, status: 'in-progress' },
    { id: 'rpt-green', name: '节约校园自评', framework: 'green-campus', progress: 92, status: 'in-progress' },
    { id: 'rpt-esg', name: 'ESG 报告', framework: 'esg', progress: 68, status: 'in-progress' },
    { id: 'rpt-iso', name: 'ISO 碳中和申报', framework: 'iso', progress: 45, status: 'pending' },
    { id: 'rpt-ghg', name: 'GHG 碳盘查报告', framework: 'ghg', progress: 78, status: 'in-progress' },
  ];
}

// L4 数据质量指标
export function getQualityMetrics() {
  return {
    score: 92,
    completeness: 95,
    timeliness: 88,
    accuracy: 94,
    consistency: 91,
    traceability: 93,
  };
}

// L4 审计轨迹数据
export function getAuditTrail(dataId?: string) {
  return [
    { id: 'audit-001', action: '数据填报', user: '张三', time: '2026-07-15 10:30', source: '表计读数' },
    { id: 'audit-002', action: '质量校验', user: '系统', time: '2026-07-15 10:31', source: '自动校验' },
    { id: 'audit-003', action: '数据复核', user: '李四', time: '2026-07-15 14:20', source: '人工复核' },
    { id: 'audit-004', action: '核算计算', user: '系统', time: '2026-07-15 14:25', source: '核算引擎' },
    { id: 'audit-005', action: '报告生成', user: '王五', time: '2026-07-15 16:00', source: '报告模板' },
  ];
}

// ========== 3D 场景建筑数据 ==========
export interface Building3DData {
  id: string;
  name: string;
  type: string;
  dept: string;
  emission: number;
  targetEmission: number;
  area: number;
  floors: number;
  status: "normal" | "warning" | "danger";
  trend: number;
}

export function getBuilding3DData(): Building3DData[] {
  // 建筑ID与 campus-data.ts 保持一致 (b01-b29)
  return [
    { id: "b01", name: "主教学楼", type: "teaching", dept: "综合教学", emission: 950, targetEmission: 720, area: 32000, floors: 10, status: "danger", trend: 5.2 },
    { id: "b02", name: "第一教学楼", type: "teaching", dept: "综合教学", emission: 820, targetEmission: 650, area: 26000, floors: 9, status: "warning", trend: 3.8 },
    { id: "b03", name: "第二教学楼", type: "teaching", dept: "综合教学", emission: 750, targetEmission: 600, area: 22000, floors: 8, status: "warning", trend: -2.1 },
    { id: "b04", name: "第三教学楼", type: "teaching", dept: "综合教学", emission: 680, targetEmission: 550, area: 19000, floors: 7, status: "normal", trend: -3.5 },
    { id: "b05", name: "信息学院楼", type: "lab", dept: "信息学院", emission: 780, targetEmission: 620, area: 24000, floors: 8, status: "warning", trend: 4.1 },
    { id: "b06", name: "机械学院楼", type: "lab", dept: "机械学院", emission: 820, targetEmission: 650, area: 24000, floors: 8, status: "danger", trend: 8.3 },
    { id: "b07", name: "材料学院楼", type: "lab", dept: "材料学院", emission: 720, targetEmission: 580, area: 20000, floors: 7, status: "warning", trend: 3.5 },
    { id: "b08", name: "能源学院楼", type: "lab", dept: "能源学院", emission: 680, targetEmission: 560, area: 20000, floors: 7, status: "normal", trend: -1.8 },
    { id: "b09", name: "经管学院楼", type: "lab", dept: "经管学院", emission: 620, targetEmission: 500, area: 18000, floors: 6, status: "normal", trend: -2.5 },
    { id: "b10", name: "图书馆", type: "library", dept: "图书馆", emission: 480, targetEmission: 420, area: 40000, floors: 8, status: "normal", trend: -3.8 },
    { id: "b11", name: "行政办公楼", type: "admin", dept: "行政部门", emission: 420, targetEmission: 350, area: 24000, floors: 7, status: "normal", trend: -8.2 },
    { id: "b12", name: "大礼堂", type: "admin", dept: "校办", emission: 350, targetEmission: 300, area: 28000, floors: 3, status: "normal", trend: -1.2 },
    { id: "b13", name: "1号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 520, targetEmission: 430, area: 15000, floors: 10, status: "normal", trend: -4.2 },
    { id: "b14", name: "2号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 500, targetEmission: 420, area: 15000, floors: 10, status: "normal", trend: -2.8 },
    { id: "b15", name: "3号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 480, targetEmission: 400, area: 14000, floors: 9, status: "normal", trend: -5.1 },
    { id: "b16", name: "4号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 460, targetEmission: 380, area: 14000, floors: 9, status: "normal", trend: -3.3 },
    { id: "b17", name: "5号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 440, targetEmission: 370, area: 14000, floors: 9, status: "normal", trend: -6.0 },
    { id: "b18", name: "6号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 420, targetEmission: 360, area: 14000, floors: 9, status: "normal", trend: -4.5 },
    { id: "b19", name: "7号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 400, targetEmission: 340, area: 15000, floors: 10, status: "normal", trend: -3.8 },
    { id: "b20", name: "8号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 380, targetEmission: 330, area: 14000, floors: 9, status: "normal", trend: -2.1 },
    { id: "b21", name: "9号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 360, targetEmission: 310, area: 14000, floors: 9, status: "normal", trend: -5.5 },
    { id: "b22", name: "10号宿舍楼", type: "dorm", dept: "宿舍管理中心", emission: 340, targetEmission: 290, area: 13000, floors: 8, status: "normal", trend: -4.8 },
    { id: "b23", name: "第一食堂", type: "dining", dept: "餐饮服务中心", emission: 580, targetEmission: 480, area: 12000, floors: 3, status: "warning", trend: 2.1 },
    { id: "b24", name: "第二食堂", type: "dining", dept: "餐饮服务中心", emission: 520, targetEmission: 430, area: 12000, floors: 3, status: "normal", trend: -1.2 },
    { id: "b25", name: "综合体育馆", type: "gym", dept: "体育部", emission: 380, targetEmission: 320, area: 35000, floors: 3, status: "normal", trend: -5.5 },
    { id: "b26", name: "游泳馆", type: "gym", dept: "体育部", emission: 320, targetEmission: 280, area: 22000, floors: 2, status: "normal", trend: -3.2 },
    { id: "b27", name: "科研楼A", type: "lab", dept: "科研院", emission: 880, targetEmission: 700, area: 24000, floors: 9, status: "danger", trend: 6.8 },
    { id: "b28", name: "科研楼B", type: "lab", dept: "科研院", emission: 820, targetEmission: 650, area: 24000, floors: 9, status: "warning", trend: 3.2 },
    { id: "b29", name: "光伏配电房", type: "solar", dept: "后勤能源", emission: -150, targetEmission: 0, area: 5000, floors: 1, status: "normal", trend: -15.0 },
  ];
}

// 获取建筑详情
export function getBuildingDetail(buildingId: string) {
  const buildings = getBuilding3DData();
  return buildings.find((b) => b.id === buildingId) || null;
}

// 获取楼层排放数据
export function getFloorEmissionData(buildingId: string) {
  const building = getBuildingDetail(buildingId);
  if (!building) return [];
  
  const floors = building.floors;
  return Array.from({ length: floors }, (_, i) => ({
    floor: i + 1,
    emission: Math.round((building.emission / floors) * (1 + (i * 0.05))),
    usage: i === 0 ? "大厅/设备" : i === floors ? "顶层/机房" : "办公/教学",
  }));
}

// 获取异常建筑列表
export function getAnomalyBuildings() {
  const buildings = getBuilding3DData();
  return buildings.filter((b) => b.status === "danger" || b.status === "warning");
}
