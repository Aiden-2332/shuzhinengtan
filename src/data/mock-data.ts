// 高校智慧碳管理平台 - 模拟数据
import type { 
  Campus, Building, BuildingType, EnergyType, 
  EmissionFactor, KPIData, TrendPoint, BuildingRanking,
  Anomaly, CalculationBatch, QuotaAccount, ComplianceEvent,
  Measure, AISuggestion, QuotaTransaction
} from '@/types';

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
  // 主校区
  { id: 'bldg-ta', name: '教学楼A', code: 'TA', campusId: 'campus-main', type: 'teaching', area: 12000, floors: 6, yearBuilt: 2005, status: 'active' },
  { id: 'bldg-tb', name: '教学楼B', code: 'TB', campusId: 'campus-main', type: 'teaching', area: 9500, floors: 5, yearBuilt: 2008, status: 'active' },
  { id: 'bldg-lab', name: '实验楼', code: 'LAB', campusId: 'campus-main', type: 'laboratory', area: 18000, floors: 8, yearBuilt: 2010, status: 'active' },
  { id: 'bldg-lib', name: '图书馆', code: 'LIB', campusId: 'campus-main', type: 'library', area: 25000, floors: 10, yearBuilt: 2012, status: 'active' },
  { id: 'bldg-dorm1', name: '学生宿舍1号楼', code: 'D1', campusId: 'campus-main', type: 'dormitory', area: 8500, floors: 7, yearBuilt: 2003, status: 'active' },
  { id: 'bldg-dorm2', name: '学生宿舍2号楼', code: 'D2', campusId: 'campus-main', type: 'dormitory', area: 9200, floors: 7, yearBuilt: 2005, status: 'active' },
  { id: 'bldg-dining', name: '第一食堂', code: 'DIN1', campusId: 'campus-main', type: 'dining', area: 4500, floors: 3, yearBuilt: 2002, status: 'active' },
  { id: 'bldg-gym', name: '体育馆', code: 'GYM', campusId: 'campus-main', type: 'gymnasium', area: 15000, floors: 2, yearBuilt: 2008, status: 'active' },
  { id: 'bldg-admin', name: '行政楼', code: 'ADM', campusId: 'campus-main', type: 'administrative', area: 6000, floors: 5, yearBuilt: 1998, status: 'active' },
  // 东校区
  { id: 'bldg-tc', name: '教学楼C', code: 'TC', campusId: 'campus-east', type: 'teaching', area: 8000, floors: 4, yearBuilt: 2015, status: 'active' },
  { id: 'bldg-dorm3', name: '学生宿舍3号楼', code: 'D3', campusId: 'campus-east', type: 'dormitory', area: 7200, floors: 6, yearBuilt: 2016, status: 'active' },
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
    'bldg-lab': { emission: 2850, area: 18000 },
    'bldg-lib': { emission: 2400, area: 25000 },
    'bldg-ta': { emission: 1850, area: 12000 },
    'bldg-gym': { emission: 1650, area: 15000 },
    'bldg-tb': { emission: 1420, area: 9500 },
    'bldg-dining': { emission: 1280, area: 4500 },
    'bldg-dorm1': { emission: 980, area: 8500 },
    'bldg-dorm2': { emission: 1050, area: 9200 },
    'bldg-admin': { emission: 720, area: 6000 },
    'bldg-tc': { emission: 980, area: 8000 },
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
  const anomalies: Anomaly[] = [
    {
      id: 'anom-001',
      buildingId: 'bldg-ta',
      buildingName: '教学楼A',
      type: 'baseline_deviation',
      severity: 'warning',
      period: '2026-06',
      impactValue: 2850,
      impactCost: 2280,
      status: 'pending',
      rule: '夜间基载异常：连续7天22:00-06:00时段负荷较同类建筑基线高28%',
      evidence: ['hourly_load_chart_202606.png', 'comparison_with_similar_buildings.png'],
      responsiblePerson: '张工程师',
      dueDate: '2026-07-15',
      createdAt: '2026-06-22'
    },
    {
      id: 'anom-002',
      buildingId: 'bldg-lab',
      buildingName: '实验楼',
      type: 'consumption_spike',
      severity: 'warning',
      period: '2026-05',
      impactValue: 1200,
      impactCost: 960,
      status: 'assigned',
      rule: '月度环比增长超过20%',
      evidence: ['monthly_comparison_chart.png'],
      responsiblePerson: '李主管',
      dueDate: '2026-07-20',
      createdAt: '2026-06-01'
    },
    {
      id: 'anom-003',
      buildingId: 'bldg-dorm1',
      buildingName: '学生宿舍1号楼',
      type: 'data_missing',
      severity: 'blocked',
      period: '2026-06',
      impactValue: 0,
      impactCost: 0,
      status: 'processing',
      rule: '缺失超过10%的数据点',
      evidence: ['data_gap_report.pdf'],
      responsiblePerson: '王科员',
      dueDate: '2026-07-10',
      createdAt: '2026-06-25'
    }
  ];
  
  if (status) {
    return anomalies.filter(a => a.status === status);
  }
  return anomalies;
}

// ========== 核算批次数据 ==========
export function getCalculationBatch(period: string): CalculationBatch {
  return {
    id: `batch-${period}`,
    period,
    campusId: 'all',
    status: 'reviewing',
    totalEmission: 16850,
    emissionBreakdown: {
      electricity: 11500,
      natural_gas: 3050,
      heat: 2020,
      solar: 280,
      green_electricity: 0
    },
    dataCompleteness: 96.5,
    blockingIssues: 1,
    createdAt: '2026-07-01',
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
  return {
    id: 'suggestion-001',
    anomalyId,
    buildingId: 'bldg-ta',
    evidence: [
      '教学楼A在2026年6月15-21日期间，夜间(22:00-06:00)平均负荷为85kW',
      '同类建筑(教学楼B、C)同期夜间平均负荷为65kW',
      '较基线偏离28%，折算额外用电量约2850kWh',
      '该时段电价约为0.8元/kWh，额外费用约2280元',
      '空调系统为主要负载，占比约70%'
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
        estimatedSavings: { energy: 12000, emission: 7.26, cost: 9600 },
        investment: 15000,
        paybackPeriod: 1.6
      },
      {
        measureId: 'measure-3',
        name: '夜间基载治理',
        applicability: 'high',
        estimatedSavings: { energy: 8550, emission: 5.17, cost: 6840 },
        investment: 5000,
        paybackPeriod: 0.7
      }
    ],
    estimatedSavings: { energy: 20550, emission: 12.43, cost: 16440 },
    investment: 20000,
    paybackPeriod: 1.2,
    status: 'pending',
    createdAt: '2026-06-23'
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
      if (buildingId === 'bldg-ta' && isNight && day >= 0 && day <= 2) {
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