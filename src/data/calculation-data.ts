// 碳核算工作台 - 模拟数据
import type {
  CalculationStandard,
  DataSourceCategory,
  DataSourceSubCategory,
  DataSourceRecord,
  DataSourceDefinition,
  CalculationBatch,
  EmissionFactorRecord,
  CalculationResult,
  DashboardOverview,
  EnergyStructureData,
  ExtendedEmissionData,
  ComplianceEvidenceData,
  DataQualityMetrics,
  MRVAuditRecord,
} from '@/types';

// ========== 数据源定义（S-A01~S-A19）==========
export const dataSourceDefinitions: DataSourceDefinition[] = [
  // 边界基础类
  { code: 'S-A01', name: '组织空间台账', category: 'boundary', subCategory: 'S-A01', description: '校区、楼宇、院系、场馆', unit: '项', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A02', name: '面积台账', category: 'boundary', subCategory: 'S-A02', description: '教学/科研/宿舍/食堂分项建筑面积', unit: 'm²', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A03', name: '人员规模', category: 'boundary', subCategory: 'S-A03', description: '在校生、住宿生、教职工、访客基数', unit: '人', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  // 核心能源类
  { code: 'S-A04', name: '外购电力', category: 'energy', subCategory: 'S-A04', description: '全校外购电力消耗', unit: 'kWh', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A05', name: '外购热力/冷量', category: 'energy', subCategory: 'S-A05', description: '集中供热/供冷', unit: 'GJ', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A06', name: '天然气', category: 'energy', subCategory: 'S-A06', description: '天然气消耗', unit: 'm³', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A07', name: '汽柴油移动燃料', category: 'energy', subCategory: 'S-A07', description: '校车、公务车燃油', unit: 'L', required: true, applicableStandards: ['JST303'] },
  { code: 'S-A08', name: '其他燃料', category: 'energy', subCategory: 'S-A08', description: '煤/液化石油气等', unit: 'kg', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A09', name: '校内光伏/储能', category: 'energy', subCategory: 'S-A09', description: '自发绿电', unit: 'kWh', required: false, applicableStandards: ['JST303'] },
  // 扩展排放类
  { code: 'S-A10', name: '外购绿电/绿证', category: 'extended', subCategory: 'S-A10', description: '绿色电力证书', unit: 'MWh', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A11', name: '水资源与中水', category: 'extended', subCategory: 'S-A11', description: '用水量统计', unit: 'm³', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A12', name: '制冷剂/实验气体', category: 'extended', subCategory: 'S-A12', description: '温室气体逸散', unit: 'kg', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A13', name: '科研实验运行', category: 'extended', subCategory: 'S-A13', description: '大型设备能耗', unit: 'kWh', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A14', name: '学生生活消耗', category: 'extended', subCategory: 'S-A14', description: '生活用能统计', unit: '项', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A15', name: '校车/通勤交通', category: 'extended', subCategory: 'S-A15', description: '交通碳排放', unit: 'tCO₂', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A16', name: '垃圾/危废', category: 'extended', subCategory: 'S-A16', description: '固废处理排放', unit: 't', required: false, applicableStandards: ['JST303'] },
  // 核算支撑类
  { code: 'S-A17', name: '排放因子参数库', category: 'support', subCategory: 'S-A17', description: '官方排放因子', unit: '项', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A18', name: '凭证档案', category: 'support', subCategory: 'S-A18', description: '账单/计量/处置凭证', unit: '份', required: true, applicableStandards: ['JST303', 'EnergyStat'] },
  { code: 'S-A19', name: '校历/气象数据', category: 'support', subCategory: 'S-A19', description: '采暖制冷天数', unit: '天', required: false, applicableStandards: ['JST303'] },
];

// ========== 数据源记录 ==========
export function getDataSourceRecords(category?: DataSourceCategory, period?: string): DataSourceRecord[] {
  const records: DataSourceRecord[] = [
    // 边界基础类
    { id: 'ds-001', sourceCode: 'S-A01', sourceName: '主校区空间台账', category: 'boundary', period: '2026-01', value: 1, unit: '项', source: 'manual', status: 'locked', reviewer: '张三', reviewedAt: '2026-01-15', batchId: 'batch-2026-01', attachmentCount: 2, updatedAt: '2026-01-10', updatedBy: '王五' },
    { id: 'ds-002', sourceCode: 'S-A02', sourceName: '教学楼面积统计', category: 'boundary', period: '2026-01', value: 45000, unit: 'm²', source: 'manual', status: 'locked', reviewer: '张三', reviewedAt: '2026-01-15', batchId: 'batch-2026-01', attachmentCount: 1, updatedAt: '2026-01-10', updatedBy: '王五' },
    { id: 'ds-003', sourceCode: 'S-A03', sourceName: '在校生人数', category: 'boundary', period: '2026-01', value: 28500, unit: '人', source: 'manual', status: 'locked', batchId: 'batch-2026-01', attachmentCount: 0, updatedAt: '2026-01-08', updatedBy: '学工处' },
    // 核心能源类
    { id: 'ds-004', sourceCode: 'S-A04', sourceName: '教学楼A用电', category: 'energy', buildingId: 'b1', buildingName: '教学楼A', department: '计算机学院', period: '2026-06', value: 85000, unit: 'kWh', emissionValue: 48.2, source: 'meter', status: 'normal', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-005', sourceCode: 'S-A04', sourceName: '实验楼A用电', category: 'energy', buildingId: 'b11', buildingName: '实验楼A', department: '化学学院', period: '2026-06', value: 125000, unit: 'kWh', emissionValue: 70.9, source: 'meter', status: 'abnormal', attachmentCount: 0, updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-006', sourceCode: 'S-A04', sourceName: '宿舍1号楼用电', category: 'energy', buildingId: 'b5', buildingName: '宿舍1号楼', department: '宿舍管理中心', period: '2026-06', value: 45000, unit: 'kWh', emissionValue: 25.5, source: 'meter', status: 'normal', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-007', sourceCode: 'S-A06', sourceName: '全校天然气', category: 'energy', period: '2026-06', value: 35000, unit: 'm³', emissionValue: 75.6, source: 'bill', status: 'normal', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, updatedAt: '2026-07-02', updatedBy: '财务部' },
    { id: 'ds-008', sourceCode: 'S-A05', sourceName: '集中供热', category: 'energy', period: '2026-01', value: 12000, unit: 'GJ', emissionValue: 280.5, source: 'bill', status: 'locked', reviewer: '李四', reviewedAt: '2026-02-05', batchId: 'batch-2026-01', attachmentCount: 1, updatedAt: '2026-02-01', updatedBy: '后勤' },
    { id: 'ds-009', sourceCode: 'S-A09', sourceName: '光伏发电', category: 'energy', period: '2026-06', value: 28000, unit: 'kWh', emissionValue: -15.9, source: 'meter', status: 'normal', attachmentCount: 1, updatedAt: '2026-07-01', updatedBy: '系统' },
    // 扩展排放类
    { id: 'ds-010', sourceCode: 'S-A11', sourceName: '全校用水量', category: 'extended', period: '2026-06', value: 18500, unit: 'm³', source: 'meter', status: 'normal', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-011', sourceCode: 'S-A12', sourceName: '实验室制冷剂', category: 'extended', department: '化学学院', period: '2026-06', value: 15, unit: 'kg', emissionValue: 25.5, source: 'manual', status: 'pending_review', attachmentCount: 0, updatedAt: '2026-07-03', updatedBy: '化学学院' },
    { id: 'ds-012', sourceCode: 'S-A15', sourceName: '校车燃油', category: 'extended', period: '2026-06', value: 3200, unit: 'L', emissionValue: 8.5, source: 'bill', status: 'normal', attachmentCount: 1, updatedAt: '2026-07-02', updatedBy: '后勤' },
    { id: 'ds-013', sourceCode: 'S-A16', sourceName: '生活垃圾', category: 'extended', period: '2026-06', value: 85, unit: 't', emissionValue: 12.8, source: 'manual', status: 'missing', attachmentCount: 0, updatedAt: '2026-06-30', updatedBy: '系统' },
    // 核算支撑类
    { id: 'ds-014', sourceCode: 'S-A17', sourceName: '2026年排放因子', category: 'support', period: '2026', value: 1, unit: '套', source: 'import', status: 'locked', attachmentCount: 1, updatedAt: '2026-01-05', updatedBy: '碳管理员' },
    { id: 'ds-015', sourceCode: 'S-A18', sourceName: '电费账单归档', category: 'support', period: '2026-06', value: 18, unit: '份', source: 'manual', status: 'normal', attachmentCount: 18, updatedAt: '2026-07-05', updatedBy: '财务部' },
  ];

  if (category) return records.filter(r => r.category === category);
  if (period) return records.filter(r => r.period === period);
  return records;
}

// ========== 核算批次 ==========
export function getCalculationBatches(year?: number): CalculationBatch[] {
  const batches: CalculationBatch[] = [
    { id: 'batch-2026-06', name: '2026年6月核算', standard: 'JST303', year: 2026, period: '2026-06', status: 'reviewed', createdAt: '2026-07-01', createdBy: '碳管理员', totalEmission: 2850, scope1Emission: 980, scope2Emission: 1870, dataCompleteness: 92, qualityScore: 88 },
    { id: 'batch-2026-06-b', name: '2026年6月能源统计', standard: 'EnergyStat', year: 2026, period: '2026-06', status: 'reviewed', createdAt: '2026-07-01', createdBy: '碳管理员', dataCompleteness: 95, qualityScore: 91 },
    { id: 'batch-2026-05', name: '2026年5月核算', standard: 'JST303', year: 2026, period: '2026-05', status: 'locked', createdAt: '2026-06-01', createdBy: '碳管理员', lockedAt: '2026-06-15', lockedBy: '主管', totalEmission: 2680, scope1Emission: 920, scope2Emission: 1760, dataCompleteness: 98, qualityScore: 94 },
    { id: 'batch-2026-annual', name: '2026年度碳盘查', standard: 'JST303', year: 2026, status: 'trial', createdAt: '2026-07-10', createdBy: '碳管理员', totalEmission: 15800, scope1Emission: 5400, scope2Emission: 10400, dataCompleteness: 78, qualityScore: 82 },
  ];
  if (year) return batches.filter(b => b.year === year);
  return batches;
}

// ========== 排放因子 ==========
export function getEmissionFactors(): EmissionFactorRecord[] {
  return [
    { id: 'ef-001', energyType: 'electricity', name: '华北电网排放因子', value: 0.5672, unit: 'tCO₂/MWh', year: 2026, source: '生态环境部2025', effectiveDate: '2026-01-01' },
    { id: 'ef-002', energyType: 'natural_gas', name: '天然气排放因子', value: 2.1620, unit: 'tCO₂/万m³', year: 2026, source: 'JS/T 303-2026', effectiveDate: '2026-01-01' },
    { id: 'ef-003', energyType: 'heat', name: '集中供热排放因子', value: 0.1100, unit: 'tCO₂/GJ', year: 2026, source: 'JS/T 303-2026', effectiveDate: '2026-01-01' },
    { id: 'ef-004', energyType: 'natural_gas', name: '柴油排放因子', value: 3.0959, unit: 'tCO₂/t', year: 2026, source: 'JS/T 303-2026', effectiveDate: '2026-01-01' },
    { id: 'ef-005', energyType: 'electricity', name: '华北电网排放因子(2025)', value: 0.5810, unit: 'tCO₂/MWh', year: 2025, source: '生态环境部2024', effectiveDate: '2025-01-01', expiryDate: '2025-12-31' },
  ];
}

// ========== 核算结果 ==========
export function getCalculationResult(batchId: string): CalculationResult | null {
  const results: Record<string, CalculationResult> = {
    'batch-2026-06': {
      batchId: 'batch-2026-06',
      standard: 'JST303',
      period: '2026-06',
      totalEmission: 2850,
      scope1Emission: 980,
      scope2Emission: 1870,
      emissionByEnergyType: {
        electricity: 1520,
        natural_gas: 756,
        heat: 280,
        diesel: 125,
        gasoline: 68,
        steam: 0,
        coal: 0,
        solar: -16,
        green_electricity: -8,
        water: 12,
        refrigerant: 31,
        other: 0,
      },
      buildingEmissions: [
        { buildingId: 'b11', buildingName: '实验楼A', totalEmission: 520, scope1: 280, scope2: 240 },
        { buildingId: 'b1', buildingName: '教学楼A', totalEmission: 450, scope1: 180, scope2: 270 },
      ],
      intensityPerArea: 0.032,
      intensityPerCapita: 0.10,
      dataCompleteness: 92,
      blockingIssues: 2,
      generatedAt: '2026-07-05',
    },
    'batch-2026-annual': {
      batchId: 'batch-2026-annual',
      standard: 'JST303',
      period: '2026',
      totalEmission: 15800,
      scope1Emission: 5400,
      scope2Emission: 10400,
      emissionByEnergyType: {
        electricity: 8500,
        natural_gas: 4200,
        heat: 1500,
        diesel: 680,
        gasoline: 380,
        steam: 0,
        coal: 0,
        solar: -95,
        green_electricity: -45,
        water: 75,
        refrigerant: 140,
        other: 0,
      },
      buildingEmissions: [
        { buildingId: 'b11', buildingName: '实验楼A', totalEmission: 2850, scope1: 1520, scope2: 1330 },
        { buildingId: 'b1', buildingName: '教学楼A', totalEmission: 2450, scope1: 980, scope2: 1470 },
      ],
      intensityPerArea: 0.178,
      intensityPerCapita: 0.55,
      dataCompleteness: 88,
      blockingIssues: 5,
      generatedAt: '2026-07-15',
    },
  };
  return results[batchId] || null;
}

// ========== 看板数据 ==========
export function getDashboardOverview(year: number = 2026): DashboardOverview {
  return {
    totalSources: 156,
    collectedSources: 138,
    completenessRate: 88.5,
    energyCompletionRate: 95.2,
    extendedCompletionRate: 72.8,
    jst303CompletionRate: 89.1,
    energyStatCompletionRate: 94.5,
    categoryProgress: {
      boundary: 98,
      energy: 95,
      extended: 73,
      support: 85,
    },
    riskBuildings: [
      { name: '实验楼A', riskLevel: 'high', issueCount: 3 },
      { name: '宿舍3号楼', riskLevel: 'medium', issueCount: 2 },
      { name: '食堂B', riskLevel: 'medium', issueCount: 1 },
    ],
    monthlyTrend: [
      { month: '1月', rate: 91 },
      { month: '2月', rate: 88 },
      { month: '3月', rate: 93 },
      { month: '4月', rate: 90 },
      { month: '5月', rate: 95 },
      { month: '6月', rate: 88 },
    ],
    qualityMetrics: {
      overallScore: 88,
      completeness: 92,
      timeliness: 85,
      accuracy: 90,
      consistency: 86,
    },
  };
}

export function getEnergyStructureData(year: number = 2026): EnergyStructureData {
  return {
    totalElectricity: 8500000,
    totalGas: 420000,
    totalHeat: 85000,
    totalSolar: 180000,
    scope1Emission: 5400,
    scope2Emission: 10400,
    buildingRanking: [
      { buildingId: 'b11', buildingName: '实验楼A', emission: 520, intensity: 28.9, trend: 'up' },
      { buildingId: 'b12', buildingName: '实验楼B', emission: 480, intensity: 32.0, trend: 'stable' },
      { buildingId: 'b1', buildingName: '教学楼A', emission: 450, intensity: 37.5, trend: 'down' },
      { buildingId: 'b14', buildingName: '食堂A', emission: 350, intensity: 77.8, trend: 'up' },
      { buildingId: 'b2', buildingName: '宿舍1号楼', emission: 280, intensity: 32.9, trend: 'stable' },
    ],
    solarReduction: 95,
    yoyComparison: {
      current: 2850,
      previous: 2980,
      change: -4.4,
    },
    intensityTrend: [
      { month: '1月', perArea: 0.18, perCapita: 0.55 },
      { month: '2月', perArea: 0.17, perCapita: 0.52 },
      { month: '3月', perArea: 0.16, perCapita: 0.49 },
      { month: '4月', perArea: 0.15, perCapita: 0.46 },
      { month: '5月', perArea: 0.16, perCapita: 0.49 },
      { month: '6月', perArea: 0.17, perCapita: 0.52 },
    ],
  };
}

export function getExtendedEmissionData(year: number = 2026): ExtendedEmissionData {
  return {
    completionRate: 72.8,
    monthlyGasTrend: [
      { month: '1月', value: 2.5 },
      { month: '2月', value: 2.8 },
      { month: '3月', value: 2.2 },
      { month: '4月', value: 1.8 },
      { month: '5月', value: 2.1 },
      { month: '6月', value: 2.6 },
    ],
    commuteEmission: { main: 68, east: 22 },
    wasteEmission: { main: 65, east: 15 },
    greenCertReduction: 45,
    carbonSinkReduction: 18,
    extendedRatioTrend: [
      { month: '1月', ratio: 1.8 },
      { month: '2月', ratio: 1.6 },
      { month: '3月', ratio: 1.7 },
      { month: '4月', ratio: 1.5 },
      { month: '5月', ratio: 1.9 },
      { month: '6月', ratio: 1.6 },
    ],
  };
}

export function getComplianceEvidenceData(year: number = 2026): ComplianceEvidenceData {
  return {
    qualityScore: 88,
    anomalyStatus: { pending: 5, processing: 3, closed: 28 },
    evidenceCount: { electricity: 72, waste: 12, greenCert: 6, other: 18 },
    factorChanges: [
      { date: '2026-01-01', factor: '电力排放因子', change: '0.5810 → 0.5672' },
      { date: '2025-01-01', factor: '天然气排放因子', change: '2.1622 → 2.1620' },
    ],
    batchProgress: { draft: 2, trial: 1, reviewed: 3, locked: 6 },
  };
}

export function getDataQualityMetrics(): DataQualityMetrics {
  return {
    completeness: 88.5,
    timeliness: 92.3,
    accuracy: 94.1,
    consistency: 91.8,
    overallScore: 89.2,
  };
}

// ========== MRV 审计记录 ==========
export function getMRVAuditRecords(dataSourceId?: string): MRVAuditRecord[] {
  const records: MRVAuditRecord[] = [
    { id: 'mrv-001', dataSourceId: 'ds-004', action: 'create', operator: '系统', timestamp: '2026-07-01 00:15', remark: '自动采集' },
    { id: 'mrv-002', dataSourceId: 'ds-004', action: 'review', operator: '李四', timestamp: '2026-07-05 14:30', remark: '数据核实通过' },
    { id: 'mrv-003', dataSourceId: 'ds-005', action: 'update', operator: '系统', timestamp: '2026-07-01 00:15', oldValue: '118000', newValue: '125000', remark: '表计校准修正' },
    { id: 'mrv-004', dataSourceId: 'ds-005', action: 'review', operator: '待复核', timestamp: '', remark: '异常标记：负荷偏高' },
    { id: 'mrv-005', dataSourceId: 'ds-007', action: 'create', operator: '财务部', timestamp: '2026-07-02 10:00', remark: '账单录入' },
    { id: 'mrv-006', dataSourceId: 'ds-007', action: 'review', operator: '李四', timestamp: '2026-07-05 15:20', remark: '与账单核对一致' },
  ];
  if (dataSourceId) return records.filter(r => r.dataSourceId === dataSourceId);
  return records;
}

// ========== 报告模板 ==========
export function getReportTemplates(standard: CalculationStandard) {
  if (standard === 'JST303') {
    return {
      main: [
        { id: 'rpt-jst-01', name: '公共机构基础信息表', fileName: '基础信息表.xlsx' },
        { id: 'rpt-jst-02', name: 'Scope1/2温室气体排放汇总表', fileName: '排放汇总表.xlsx' },
        { id: 'rpt-jst-03', name: '分校区/楼宇碳排放明细表', fileName: '楼宇明细表.xlsx' },
        { id: 'rpt-jst-04', name: '可再生能源/碳抵消附表', fileName: '可再生能源附表.xlsx' },
      ],
      attachments: [
        { id: 'att-01', name: '电费燃气账单', count: 72, checked: true },
        { id: 'att-02', name: '光伏并网材料', count: 2, checked: true },
        { id: 'att-03', name: '绿色电力证书', count: 6, checked: true },
        { id: 'att-04', name: '建筑面积台账', count: 1, checked: true },
        { id: 'att-05', name: '核算追溯审计PDF', count: 1, checked: true },
        { id: 'att-06', name: '异常说明文档', count: 3, checked: false },
      ],
    };
  }
  return {
    main: [
      { id: 'rpt-energy-01', name: '机构基础信息表', fileName: '基础信息表.xlsx' },
      { id: 'rpt-energy-02', name: '能源资源消耗总表', fileName: '能耗总表.xlsx' },
      { id: 'rpt-energy-03', name: '分功能建筑能耗明细表', fileName: '功能明细表.xlsx' },
    ],
    attachments: [
      { id: 'att-e01', name: '能源缴费凭证', count: 72, checked: true },
      { id: 'att-e02', name: '分项计量抄表台账', count: 18, checked: true },
    ],
  };
}

// ========== 看板数据函数 ==========

// 概览看板数据
export function getOverviewDashboardData(period: string): DashboardOverview {
  return {
    totalSources: 156,
    collectedSources: 138,
    completenessRate: 88.5,
    energyCompletionRate: 95.2,
    extendedCompletionRate: 72.8,
    jst303CompletionRate: 89.1,
    energyStatCompletionRate: 92.3,
    categoryProgress: {
      boundary: 98,
      energy: 95,
      extended: 73,
      support: 85,
    },
    riskBuildings: [
      { name: '实验楼A', riskLevel: 'high', issueCount: 5 },
      { name: '食堂A', riskLevel: 'medium', issueCount: 3 },
      { name: '宿舍5号楼', riskLevel: 'low', issueCount: 1 },
    ],
    monthlyTrend: [
      { month: '2025-07', rate: 82 },
      { month: '2025-08', rate: 85 },
      { month: '2025-09', rate: 83 },
      { month: '2025-10', rate: 86 },
      { month: '2025-11', rate: 88 },
      { month: '2025-12', rate: 87 },
      { month: '2026-01', rate: 89 },
      { month: '2026-02', rate: 88 },
      { month: '2026-03', rate: 90 },
      { month: '2026-04', rate: 89 },
      { month: '2026-05', rate: 91 },
      { month: '2026-06', rate: 88.5 },
    ],
    qualityMetrics: {
      overallScore: 88,
      completeness: 92,
      timeliness: 85,
      accuracy: 90,
      consistency: 86,
    },
  };
}

// 能源结构看板数据
export function getEnergyDashboardData(period: string, campus: string): EnergyStructureData {
  return {
    totalElectricity: 1250000,
    totalGas: 350000,
    totalHeat: 120000,
    totalSolar: 280000,
    scope1Emission: 5400,
    scope2Emission: 10400,
    buildingRanking: [
      { buildingId: 'b11', buildingName: '实验楼A', emission: 285, intensity: 4.2, trend: 'up' },
      { buildingId: 'b1', buildingName: '教学楼A', emission: 185, intensity: 2.1, trend: 'down' },
      { buildingId: 'b8', buildingName: '食堂A', emission: 165, intensity: 3.5, trend: 'up' },
      { buildingId: 'b5', buildingName: '宿舍1号楼', emission: 125, intensity: 1.2, trend: 'stable' },
      { buildingId: 'b12', buildingName: '实验楼B', emission: 115, intensity: 2.8, trend: 'down' },
    ],
    solarReduction: 159.5,
    yoyComparison: {
      current: 15800,
      previous: 16500,
      change: -4.2,
    },
    intensityTrend: [
      { month: '2025-07', perArea: 2.8, perCapita: 0.52 },
      { month: '2025-08', perArea: 2.6, perCapita: 0.48 },
      { month: '2025-09', perArea: 2.9, perCapita: 0.54 },
      { month: '2025-10', perArea: 2.7, perCapita: 0.50 },
      { month: '2025-11', perArea: 3.1, perCapita: 0.58 },
      { month: '2025-12', perArea: 3.5, perCapita: 0.65 },
      { month: '2026-01', perArea: 3.8, perCapita: 0.70 },
      { month: '2026-02', perArea: 3.2, perCapita: 0.60 },
      { month: '2026-03', perArea: 2.8, perCapita: 0.52 },
      { month: '2026-04', perArea: 2.5, perCapita: 0.46 },
      { month: '2026-05', perArea: 2.6, perCapita: 0.48 },
      { month: '2026-06', perArea: 2.9, perCapita: 0.54 },
    ],
  };
}

// 扩展排放看板数据
export function getExtendedDashboardData(period: string): ExtendedEmissionData {
  return {
    completionRate: 72.8,
    monthlyGasTrend: [
      { month: '2025-07', value: 12 },
      { month: '2025-08', value: 10 },
      { month: '2025-09', value: 14 },
      { month: '2025-10', value: 11 },
      { month: '2025-11', value: 13 },
      { month: '2025-12', value: 15 },
      { month: '2026-01', value: 16 },
      { month: '2026-02', value: 14 },
      { month: '2026-03', value: 13 },
      { month: '2026-04', value: 12 },
      { month: '2026-05', value: 14 },
      { month: '2026-06', value: 15 },
    ],
    commuteEmission: { main: 45, east: 28 },
    wasteEmission: { main: 35, east: 22 },
    greenCertReduction: 85.5,
    carbonSinkReduction: 12.8,
    extendedRatioTrend: [
      { month: '2025-07', ratio: 8.2 },
      { month: '2025-08', ratio: 7.8 },
      { month: '2025-09', ratio: 8.5 },
      { month: '2025-10', ratio: 8.1 },
      { month: '2025-11', ratio: 8.8 },
      { month: '2025-12', ratio: 9.2 },
      { month: '2026-01', ratio: 9.5 },
      { month: '2026-02', ratio: 9.1 },
      { month: '2026-03', ratio: 8.8 },
      { month: '2026-04', ratio: 8.5 },
      { month: '2026-05', ratio: 8.6 },
      { month: '2026-06', ratio: 8.9 },
    ],
  };
}

// 合规凭证看板数据
export function getComplianceDashboardData(period: string): ComplianceEvidenceData {
  return {
    qualityScore: 88,
    anomalyStatus: { pending: 8, processing: 5, closed: 42 },
    evidenceCount: { electricity: 72, waste: 18, greenCert: 6, other: 24 },
    factorChanges: [
      { date: '2026-01-01', factor: '电力排放因子', change: '0.5810 → 0.5672 tCO₂/MWh' },
      { date: '2025-07-01', factor: '天然气排放因子', change: '2.1622 → 2.1620 tCO₂/万m³' },
    ],
    batchProgress: { draft: 2, trial: 1, reviewed: 3, locked: 8 },
  };
}

// 核算引擎
export function calculateEmissions(standard: CalculationStandard, period: string): CalculationResult {
  if (standard === 'JST303') {
    return {
      batchId: `batch-${period}`,
      standard: 'JST303',
      period,
      totalEmission: 15800,
      scope1Emission: 5400,
      scope2Emission: 10400,
      scope3Emission: 285,
      emissionByEnergyType: {
        electricity: 10400,
        natural_gas: 3850,
        heat: 1550,
        diesel: 0,
        gasoline: 0,
        steam: 0,
        coal: 0,
        solar: -159.5,
        green_electricity: -85.5,
        water: 0,
        refrigerant: 25.5,
        other: 0,
      },
      buildingEmissions: [
        { buildingId: 'b1', buildingName: '教学楼A', totalEmission: 185, scope1: 45, scope2: 140 },
        { buildingId: 'b11', buildingName: '实验楼A', totalEmission: 285, scope1: 125, scope2: 160 },
        { buildingId: 'b8', buildingName: '食堂A', totalEmission: 165, scope1: 95, scope2: 70 },
      ],
      intensityPerArea: 2.9,
      intensityPerCapita: 0.54,
      dataCompleteness: 88.5,
      blockingIssues: 3,
      generatedAt: new Date().toISOString().split('T')[0],
    };
  }
  // 能源统计标准
  return {
    batchId: `batch-energy-${period}`,
    standard: 'EnergyStat',
    period,
    totalEmission: 0,
    scope1Emission: 0,
    scope2Emission: 0,
    emissionByEnergyType: {
      electricity: 1250000,
      natural_gas: 350000,
      heat: 120000,
      diesel: 0,
      gasoline: 0,
      steam: 0,
      coal: 0,
      solar: 280000,
      green_electricity: 0,
      water: 18500,
      refrigerant: 0,
      other: 0,
    },
    buildingEmissions: [],
    intensityPerArea: 0,
    intensityPerCapita: 0,
    dataCompleteness: 92.3,
    blockingIssues: 0,
    generatedAt: new Date().toISOString().split('T')[0],
  };
}
