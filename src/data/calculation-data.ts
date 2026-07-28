// 碳核算工作台 - 模拟数据（含 localStorage 持久化）
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
  DataQualityMetrics,
  MRVAuditRecord,
} from '@/types';

const STORAGE_KEY = 'calculation-data-v2';

// ========== 核算标准元数据 ==========
export const STANDARD_META: Record<CalculationStandard, { label: string; description: string; scopeNote: string }> = {
  JST303: {
    label: 'JS/T 303-2026 碳核算指南',
    description: '北京市公共机构碳排放核算和报告指南，覆盖范围一、二、三排放',
    scopeNote: '范围一(直接排放) + 范围二(外购电力热力) + 范围三(通勤差旅等)',
  },
  EnergyStat: {
    label: '公共机构能源资源统计制度',
    description: '国家机关事务管理局能源资源消耗统计制度，侧重能源消耗量',
    scopeNote: '电力、天然气、热力、水资源等能源资源消耗统计',
  },
  ISO14064: {
    label: 'ISO 14064-1',
    description: '国际标准化组织温室气体量化与报告标准，分类报告直接与间接排放',
    scopeNote: 'Category 1(直接) + Category 2(外购能源) + Category 3-6(其他间接)',
  },
  GHGProtocol: {
    label: 'GHG Protocol',
    description: '世界资源研究所温室气体协议体系，企业级碳核算国际通用框架',
    scopeNote: 'Scope 1(直接) + Scope 2(外购电热) + Scope 3(价值链)',
  },
};

// ========== 数据源定义（S-A01~S-A19）==========
export const dataSourceDefinitions: DataSourceDefinition[] = [
  // 边界基础类
  { code: 'S-A01', name: '组织空间台账', category: 'boundary', subCategory: 'S-A01', description: '校区、楼宇、院系、场馆', unit: '项', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A02', name: '面积台账', category: 'boundary', subCategory: 'S-A02', description: '教学/科研/宿舍/食堂分项建筑面积', unit: 'm²', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A03', name: '人员规模', category: 'boundary', subCategory: 'S-A03', description: '在校生、住宿生、教职工、访客基数', unit: '人', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  // 核心能源类
  { code: 'S-A04', name: '外购电力', category: 'energy', subCategory: 'S-A04', description: '全校外购电力消耗', unit: 'kWh', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A05', name: '外购热力/冷量', category: 'energy', subCategory: 'S-A05', description: '集中供热/供冷', unit: 'GJ', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A06', name: '天然气', category: 'energy', subCategory: 'S-A06', description: '天然气消耗', unit: 'm³', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A07', name: '汽柴油移动燃料', category: 'energy', subCategory: 'S-A07', description: '校车、公务车燃油', unit: 'L', required: true, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A08', name: '其他燃料', category: 'energy', subCategory: 'S-A08', description: '煤/液化石油气等', unit: 'kg', required: false, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A09', name: '校内光伏/储能', category: 'energy', subCategory: 'S-A09', description: '自发绿电', unit: 'kWh', required: false, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  // 扩展排放类
  { code: 'S-A10', name: '外购绿电/绿证', category: 'extended', subCategory: 'S-A10', description: '绿色电力证书', unit: 'MWh', required: false, applicableStandards: ['JST303', 'GHGProtocol'] },
  { code: 'S-A11', name: '水资源与中水', category: 'extended', subCategory: 'S-A11', description: '用水量统计', unit: 'm³', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064'] },
  { code: 'S-A12', name: '制冷剂/实验气体', category: 'extended', subCategory: 'S-A12', description: '温室气体逸散', unit: 'kg', required: false, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A13', name: '科研实验运行', category: 'extended', subCategory: 'S-A13', description: '大型设备能耗', unit: 'kWh', required: false, applicableStandards: ['JST303', 'ISO14064'] },
  { code: 'S-A14', name: '学生生活消耗', category: 'extended', subCategory: 'S-A14', description: '生活用能统计', unit: '项', required: false, applicableStandards: ['JST303'] },
  { code: 'S-A15', name: '校车/通勤交通', category: 'extended', subCategory: 'S-A15', description: '交通碳排放', unit: 'L', required: false, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A16', name: '垃圾/危废', category: 'extended', subCategory: 'S-A16', description: '固废处理排放', unit: 't', required: false, applicableStandards: ['JST303', 'ISO14064', 'GHGProtocol'] },
  // 核算支撑类
  { code: 'S-A17', name: '排放因子参数库', category: 'support', subCategory: 'S-A17', description: '官方排放因子', unit: '项', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A18', name: '凭证档案', category: 'support', subCategory: 'S-A18', description: '账单/计量/处置凭证', unit: '份', required: true, applicableStandards: ['JST303', 'EnergyStat', 'ISO14064', 'GHGProtocol'] },
  { code: 'S-A19', name: '校历/气象数据', category: 'support', subCategory: 'S-A19', description: '采暖制冷天数', unit: '天', required: false, applicableStandards: ['JST303', 'EnergyStat'] },
];

// ========== 默认数据源记录（20+条）==========
function createDefaultRecords(): DataSourceRecord[] {
  return [
    // 边界基础类
    { id: 'ds-001', sourceCode: 'S-A01', sourceName: '主校区空间台账', category: 'boundary', emissionScope: 'scope1', dataClassification: '组织边界', campus: '主校区', period: '2026-06', value: 1, unit: '项', source: 'manual', status: 'locked', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0, emissionFactorSource: '-', emissionFactorVersion: '-', calculationFormula: '-', reviewer: '张三', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 2, relatedEvidences: ['空间台账-主校区.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 14:00', operator: '张三', action: '审核通过', remark: '数据完整' }], updatedAt: '2026-07-01', updatedBy: '王五' },
    { id: 'ds-002', sourceCode: 'S-A02', sourceName: '教学楼面积统计', category: 'boundary', emissionScope: 'scope1', dataClassification: '组织边界', campus: '主校区', period: '2026-06', value: 45000, unit: 'm²', source: 'manual', status: 'locked', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0, emissionFactorSource: '-', emissionFactorVersion: '-', calculationFormula: '-', reviewer: '张三', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['面积台账.xlsx'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 14:10', operator: '张三', action: '审核通过', remark: '与房产系统一致' }], updatedAt: '2026-07-01', updatedBy: '王五' },
    { id: 'ds-003', sourceCode: 'S-A03', sourceName: '在校生人数', category: 'boundary', emissionScope: 'scope1', dataClassification: '组织边界', campus: '主校区', period: '2026-06', value: 28500, unit: '人', source: 'manual', status: 'locked', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0, emissionFactorSource: '-', emissionFactorVersion: '-', calculationFormula: '-', batchId: 'batch-2026-06', attachmentCount: 0, relatedEvidences: [], modifyRecords: [], auditRecords: [{ time: '2026-07-05 14:20', operator: '张三', action: '审核通过', remark: '与学工系统一致' }], updatedAt: '2026-07-01', updatedBy: '学工处' },
    // 核心能源类 - 电力
    { id: 'ds-004', sourceCode: 'S-A04', sourceName: '教学楼A用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', buildingId: 'b1', buildingName: '教学楼A', department: '计算机学院', period: '2026-06', value: 85000, unit: 'kWh', emissionValue: 48.2, source: 'meter', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '85000 kWh × 0.5672 tCO₂/MWh = 48.2 tCO₂', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['电费账单-教学楼A-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 14:30', operator: '李四', action: '审核通过', remark: '数据核实通过' }], updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-005', sourceCode: 'S-A04', sourceName: '实验楼A用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', buildingId: 'b11', buildingName: '实验楼A', department: '化学学院', period: '2026-06', value: 125000, unit: 'kWh', emissionValue: 70.9, source: 'meter', status: 'abnormal', auditStatus: 'pending', evidenceStatus: 'incomplete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '125000 kWh × 0.5672 tCO₂/MWh = 70.9 tCO₂', attachmentCount: 0, relatedEvidences: [], modifyRecords: [{ time: '2026-07-01 00:15', operator: '系统', field: 'value', oldValue: '118000', newValue: '125000' }], auditRecords: [], updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-006', sourceCode: 'S-A04', sourceName: '宿舍1号楼用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', buildingId: 'b5', buildingName: '宿舍1号楼', department: '宿舍管理中心', period: '2026-06', value: 45000, unit: 'kWh', emissionValue: 25.5, source: 'meter', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '45000 kWh × 0.5672 tCO₂/MWh = 25.5 tCO₂', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['电费账单-宿舍1-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 15:00', operator: '李四', action: '审核通过', remark: '数据核实通过' }], updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-007', sourceCode: 'S-A04', sourceName: '图书馆用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', buildingId: 'b3', buildingName: '图书馆', department: '图书馆', period: '2026-06', value: 62000, unit: 'kWh', emissionValue: 35.2, source: 'meter', status: 'normal', auditStatus: 'pending', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '62000 kWh × 0.5672 tCO₂/MWh = 35.2 tCO₂', attachmentCount: 1, relatedEvidences: ['电费账单-图书馆-202606.pdf'], modifyRecords: [], auditRecords: [], updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-008', sourceCode: 'S-A04', sourceName: '行政楼用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', buildingId: 'b7', buildingName: '行政楼', department: '校办', period: '2026-06', value: 38000, unit: 'kWh', emissionValue: 21.6, source: 'bill', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '38000 kWh × 0.5672 tCO₂/MWh = 21.6 tCO₂', reviewer: '李四', reviewedAt: '2026-07-06', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['电费账单-行政楼-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 09:00', operator: '李四', action: '审核通过', remark: '与账单一致' }], updatedAt: '2026-07-02', updatedBy: '财务部' },
    // 核心能源类 - 天然气/热力
    { id: 'ds-009', sourceCode: 'S-A06', sourceName: '全校天然气', category: 'energy', emissionScope: 'scope1', dataClassification: '天然气', campus: '主校区', period: '2026-06', value: 35000, unit: 'm³', emissionValue: 75.6, source: 'bill', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 2.162, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '35000 m³ × 2.162 tCO₂/万m³ / 10000 = 75.6 tCO₂', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['燃气账单-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 15:20', operator: '李四', action: '审核通过', remark: '与账单核对一致' }], updatedAt: '2026-07-02', updatedBy: '财务部' },
    { id: 'ds-010', sourceCode: 'S-A05', sourceName: '集中供热', category: 'energy', emissionScope: 'scope2', dataClassification: '外购热力', campus: '主校区', period: '2026-01', value: 12000, unit: 'GJ', emissionValue: 280.5, source: 'bill', status: 'locked', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.11, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '12000 GJ × 0.11 tCO₂/GJ = 1320 tCO₂', reviewer: '李四', reviewedAt: '2026-02-05', batchId: 'batch-2026-01', attachmentCount: 1, relatedEvidences: ['供热账单-202601.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-02-05 10:00', operator: '李四', action: '审核通过', remark: '数据完整' }], updatedAt: '2026-02-01', updatedBy: '后勤' },
    // 核心能源类 - 燃油/光伏
    { id: 'ds-011', sourceCode: 'S-A07', sourceName: '公务车汽油', category: 'energy', emissionScope: 'scope1', dataClassification: '车辆燃油', campus: '主校区', period: '2026-06', value: 2800, unit: 'L', emissionValue: 6.4, source: 'bill', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 2.293, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '2800 L × 0.725 kg/L × 2.293 kgCO₂/kg = 6.4 tCO₂', reviewer: '李四', reviewedAt: '2026-07-06', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['加油记录-202606.xlsx'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 10:00', operator: '李四', action: '审核通过', remark: '核实通过' }], updatedAt: '2026-07-03', updatedBy: '车队' },
    { id: 'ds-012', sourceCode: 'S-A07', sourceName: '校车柴油', category: 'energy', emissionScope: 'scope1', dataClassification: '车辆燃油', campus: '主校区', period: '2026-06', value: 1200, unit: 'L', emissionValue: 3.2, source: 'bill', status: 'normal', auditStatus: 'pending', evidenceStatus: 'complete', emissionFactor: 2.698, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '1200 L × 0.835 kg/L × 2.698 kgCO₂/kg = 3.2 tCO₂', attachmentCount: 1, relatedEvidences: ['柴油发票-202606.pdf'], modifyRecords: [], auditRecords: [], updatedAt: '2026-07-02', updatedBy: '车队' },
    { id: 'ds-013', sourceCode: 'S-A09', sourceName: '光伏发电', category: 'energy', emissionScope: 'scope2', dataClassification: '可再生能源', campus: '主校区', period: '2026-06', value: 28000, unit: 'kWh', emissionValue: -15.9, source: 'meter', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '28000 kWh × 0.5672 tCO₂/MWh = -15.9 tCO₂（抵扣）', attachmentCount: 1, relatedEvidences: ['光伏并网记录-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 09:30', operator: '李四', action: '审核通过', remark: '与并网记录一致' }], updatedAt: '2026-07-01', updatedBy: '系统' },
    // 扩展排放类
    { id: 'ds-014', sourceCode: 'S-A10', sourceName: '绿电证书', category: 'extended', emissionScope: 'scope2', dataClassification: '外购绿电', campus: '主校区', period: '2026-06', value: 150, unit: 'MWh', emissionValue: -8.5, source: 'manual', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '150 MWh × 0.5672 tCO₂/MWh = -8.5 tCO₂（抵扣）', attachmentCount: 2, relatedEvidences: ['绿电证书-202606-01.pdf', '绿电证书-202606-02.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 10:30', operator: '李四', action: '审核通过', remark: '证书真实有效' }], updatedAt: '2026-07-03', updatedBy: '碳管理员' },
    { id: 'ds-015', sourceCode: 'S-A11', sourceName: '全校用水量', category: 'extended', emissionScope: 'scope3', dataClassification: '用水', campus: '主校区', period: '2026-06', value: 18500, unit: 'm³', source: 'meter', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.00091, emissionFactorSource: '北京市水务局', emissionFactorVersion: '2026v1', calculationFormula: '18500 m³ × 0.00091 tCO₂/m³ = 16.8 tCO₂（间接）', reviewer: '李四', reviewedAt: '2026-07-05', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['水费账单-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 16:00', operator: '李四', action: '审核通过', remark: '核实通过' }], updatedAt: '2026-07-01', updatedBy: '系统' },
    { id: 'ds-016', sourceCode: 'S-A12', sourceName: '实验室制冷剂', category: 'extended', emissionScope: 'scope1', dataClassification: '制冷剂', campus: '主校区', department: '化学学院', period: '2026-06', value: 15, unit: 'kg', emissionValue: 25.5, source: 'manual', status: 'pending_review', auditStatus: 'pending', evidenceStatus: 'incomplete', emissionFactor: 1700, emissionFactorSource: 'IPCC AR6', emissionFactorVersion: '2021v1', calculationFormula: '15 kg × 1700 GWP = 25.5 tCO₂e', attachmentCount: 0, relatedEvidences: [], modifyRecords: [], auditRecords: [], updatedAt: '2026-07-03', updatedBy: '化学学院' },
    { id: 'ds-017', sourceCode: 'S-A15', sourceName: '师生通勤', category: 'extended', emissionScope: 'scope3', dataClassification: '通勤', campus: '主校区', period: '2026-06', value: 4500, unit: 'L', emissionValue: 10.3, source: 'manual', status: 'normal', auditStatus: 'pending', evidenceStatus: 'complete', emissionFactor: 2.293, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '4500 L × 0.725 kg/L × 2.293 kgCO₂/kg = 10.3 tCO₂', attachmentCount: 1, relatedEvidences: ['通勤调查-202606.xlsx'], modifyRecords: [], auditRecords: [], updatedAt: '2026-07-02', updatedBy: '碳管理员' },
    { id: 'ds-018', sourceCode: 'S-A15', sourceName: '公务差旅', category: 'extended', emissionScope: 'scope3', dataClassification: '差旅', campus: '主校区', period: '2026-06', value: 8500, unit: 'km', emissionValue: 2.1, source: 'manual', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.255, emissionFactorSource: 'GHG Protocol', emissionFactorVersion: '2024v1', calculationFormula: '8500 km × 0.255 kgCO₂/km = 2.1 tCO₂', reviewer: '李四', reviewedAt: '2026-07-06', batchId: 'batch-2026-06', attachmentCount: 2, relatedEvidences: ['差旅记录-202606.xlsx', '机票记录-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 11:00', operator: '李四', action: '审核通过', remark: '差旅记录完整' }], updatedAt: '2026-07-04', updatedBy: '财务部' },
    { id: 'ds-019', sourceCode: 'S-A16', sourceName: '生活垃圾处理', category: 'extended', emissionScope: 'scope3', dataClassification: '废弃物', campus: '主校区', period: '2026-06', value: 85, unit: 't', emissionValue: 12.8, source: 'manual', status: 'missing', auditStatus: 'pending', evidenceStatus: 'missing', emissionFactor: 0.1506, emissionFactorSource: 'IPCC AR6', emissionFactorVersion: '2021v1', calculationFormula: '85 t × 0.1506 tCO₂/t = 12.8 tCO₂', attachmentCount: 0, relatedEvidences: [], modifyRecords: [], auditRecords: [], updatedAt: '2026-06-30', updatedBy: '系统' },
    { id: 'ds-020', sourceCode: 'S-A16', sourceName: '危废处置', category: 'extended', emissionScope: 'scope3', dataClassification: '废弃物', campus: '东校区', period: '2026-06', value: 3.5, unit: 't', emissionValue: 5.2, source: 'manual', status: 'abnormal', auditStatus: 'pending', evidenceStatus: 'incomplete', emissionFactor: 1.4857, emissionFactorSource: 'IPCC AR6', emissionFactorVersion: '2021v1', calculationFormula: '3.5 t × 1.4857 tCO₂/t = 5.2 tCO₂', attachmentCount: 0, relatedEvidences: [], modifyRecords: [{ time: '2026-07-01 10:00', operator: '碳管理员', field: 'value', oldValue: '2.8', newValue: '3.5' }], auditRecords: [], updatedAt: '2026-07-01', updatedBy: '碳管理员' },
    // 核算支撑类
    { id: 'ds-021', sourceCode: 'S-A17', sourceName: '2026年排放因子', category: 'support', emissionScope: 'scope1', dataClassification: '排放因子', campus: '主校区', period: '2026', value: 1, unit: '套', source: 'import', status: 'locked', auditStatus: 'approved', evidenceStatus: 'complete', attachmentCount: 1, relatedEvidences: ['排放因子库-2026.xlsx'], modifyRecords: [], auditRecords: [{ time: '2026-01-05 09:00', operator: '碳管理员', action: '审核通过', remark: '官方因子库已更新' }], updatedAt: '2026-01-05', updatedBy: '碳管理员' },
    { id: 'ds-022', sourceCode: 'S-A18', sourceName: '电费账单归档', category: 'support', emissionScope: 'scope1', dataClassification: '凭证', campus: '主校区', period: '2026-06', value: 18, unit: '份', source: 'manual', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', attachmentCount: 18, relatedEvidences: ['电费账单-202606-批次1.pdf', '电费账单-202606-批次2.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-05 16:30', operator: '李四', action: '审核通过', remark: '全部归档' }], updatedAt: '2026-07-05', updatedBy: '财务部' },
    { id: 'ds-023', sourceCode: 'S-A04', sourceName: '东校区用电', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '东校区', period: '2026-06', value: 320000, unit: 'kWh', emissionValue: 181.5, source: 'meter', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 0.5672, emissionFactorSource: '生态环境部2025', emissionFactorVersion: '2026v1', calculationFormula: '320000 kWh × 0.5672 tCO₂/MWh = 181.5 tCO₂', reviewer: '李四', reviewedAt: '2026-07-06', batchId: 'batch-2026-06', attachmentCount: 1, relatedEvidences: ['电费账单-东校区-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 09:00', operator: '李四', action: '审核通过', remark: '核实通过' }], updatedAt: '2026-07-02', updatedBy: '系统' },
    { id: 'ds-024', sourceCode: 'S-A06', sourceName: '东校区天然气', category: 'energy', emissionScope: 'scope1', dataClassification: '天然气', campus: '东校区', period: '2026-06', value: 12000, unit: 'm³', emissionValue: 25.9, source: 'bill', status: 'pending_review', auditStatus: 'pending', evidenceStatus: 'complete', emissionFactor: 2.162, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '12000 m³ × 2.162 tCO₂/万m³ / 10000 = 25.9 tCO₂', attachmentCount: 1, relatedEvidences: ['燃气账单-东校区-202606.pdf'], modifyRecords: [], auditRecords: [], updatedAt: '2026-07-03', updatedBy: '财务部' },
    { id: 'ds-025', sourceCode: 'S-A08', sourceName: '实验用液化气', category: 'energy', emissionScope: 'scope1', dataClassification: '其他燃料', campus: '主校区', department: '材料学院', period: '2026-06', value: 500, unit: 'kg', emissionValue: 1.5, source: 'manual', status: 'normal', auditStatus: 'approved', evidenceStatus: 'complete', emissionFactor: 3.014, emissionFactorSource: 'JS/T 303-2026', emissionFactorVersion: '2026v1', calculationFormula: '500 kg × 3.014 tCO₂/t / 1000 = 1.5 tCO₂', reviewer: '李四', reviewedAt: '2026-07-06', attachmentCount: 1, relatedEvidences: ['液化气采购单-202606.pdf'], modifyRecords: [], auditRecords: [{ time: '2026-07-06 11:30', operator: '李四', action: '审核通过', remark: '采购单核实' }], updatedAt: '2026-07-04', updatedBy: '材料学院' },
  ];
}

// ========== 核算批次 ==========
function createDefaultBatches(): CalculationBatch[] {
  return [
    { id: 'batch-2026-06', name: '2026年6月核算', standard: 'JST303', year: 2026, period: '2026-06', status: 'reviewed', createdAt: '2026-07-01', createdBy: '碳管理员', totalEmission: 2850, scope1Emission: 980, scope2Emission: 1870, dataCompleteness: 92, qualityScore: 88 },
    { id: 'batch-2026-06-b', name: '2026年6月能源统计', standard: 'EnergyStat', year: 2026, period: '2026-06', status: 'reviewed', createdAt: '2026-07-01', createdBy: '碳管理员', dataCompleteness: 95, qualityScore: 91 },
    { id: 'batch-2026-05', name: '2026年5月核算', standard: 'JST303', year: 2026, period: '2026-05', status: 'locked', createdAt: '2026-06-01', createdBy: '碳管理员', lockedAt: '2026-06-15', lockedBy: '主管', totalEmission: 2680, scope1Emission: 920, scope2Emission: 1760, dataCompleteness: 98, qualityScore: 94 },
    { id: 'batch-2026-annual', name: '2026年度碳盘查', standard: 'JST303', year: 2026, status: 'trial', createdAt: '2026-07-10', createdBy: '碳管理员', totalEmission: 15800, scope1Emission: 5400, scope2Emission: 10400, dataCompleteness: 78, qualityScore: 82 },
  ];
}

// ========== localStorage 持久化 ==========
interface CalculationPersistedData {
  records: DataSourceRecord[];
  batches: CalculationBatch[];
  batchLocked: boolean;
  calculationResult: CalculationResult | null;
}

export function loadPersistedData(): CalculationPersistedData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function persistData(data: CalculationPersistedData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function clearPersistedData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function getInitialRecords(): DataSourceRecord[] {
  const persisted = loadPersistedData();
  return persisted?.records ?? createDefaultRecords();
}

export function getInitialBatches(): CalculationBatch[] {
  const persisted = loadPersistedData();
  return persisted?.batches ?? createDefaultBatches();
}

export function getInitialBatchLocked(): boolean {
  const persisted = loadPersistedData();
  return persisted?.batchLocked ?? false;
}

export function getInitialCalculationResult(): CalculationResult | null {
  const persisted = loadPersistedData();
  return persisted?.calculationResult ?? null;
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

// ========== 核算引擎 ==========
export function calculateEmissions(standard: CalculationStandard, period: string, records: DataSourceRecord[]): CalculationResult {
  const energyRecords = records.filter(r => r.category === 'energy' && r.period === period);
  const extendedRecords = records.filter(r => r.category === 'extended' && r.period === period);

  const scope1 = energyRecords
    .filter(r => r.emissionScope === 'scope1' && r.emissionValue)
    .reduce((sum, r) => sum + (r.emissionValue ?? 0), 0)
    + extendedRecords
    .filter(r => r.emissionScope === 'scope1' && r.emissionValue)
    .reduce((sum, r) => sum + (r.emissionValue ?? 0), 0);

  const scope2 = energyRecords
    .filter(r => r.emissionScope === 'scope2' && r.emissionValue)
    .reduce((sum, r) => sum + (r.emissionValue ?? 0), 0);

  const scope3 = extendedRecords
    .filter(r => r.emissionScope === 'scope3' && r.emissionValue)
    .reduce((sum, r) => sum + (r.emissionValue ?? 0), 0);

  const totalEmission = scope1 + scope2 + scope3;

  // Calculate by energy type
  const electricityRecords = records.filter(r => r.dataClassification === '外购电力' && r.emissionValue);
  const gasRecords = records.filter(r => r.dataClassification === '天然气' && r.emissionValue);
  const heatRecords = records.filter(r => r.dataClassification === '外购热力' && r.emissionValue);
  const fuelRecords = records.filter(r => r.dataClassification === '车辆燃油' && r.emissionValue);
  const solarRecords = records.filter(r => r.dataClassification === '可再生能源' && r.emissionValue);
  const greenRecords = records.filter(r => r.dataClassification === '外购绿电' && r.emissionValue);
  const refrigerantRecords = records.filter(r => r.dataClassification === '制冷剂' && r.emissionValue);
  const waterRecords = records.filter(r => r.dataClassification === '用水' && r.emissionValue);
  const wasteRecords = records.filter(r => r.dataClassification === '废弃物' && r.emissionValue);
  const otherFuelRecords = records.filter(r => r.dataClassification === '其他燃料' && r.emissionValue);

  return {
    batchId: `batch-${period}`,
    standard,
    period,
    totalEmission: Math.round(totalEmission * 10) / 10,
    scope1Emission: Math.round(scope1 * 10) / 10,
    scope2Emission: Math.round(scope2 * 10) / 10,
    scope3Emission: Math.round(scope3 * 10) / 10,
    emissionByEnergyType: {
      electricity: electricityRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      natural_gas: gasRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      heat: heatRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      diesel: fuelRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      gasoline: 0,
      steam: 0,
      coal: 0,
      solar: solarRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      green_electricity: greenRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      water: waterRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      refrigerant: refrigerantRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
      other: otherFuelRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0) + wasteRecords.reduce((s, r) => s + (r.emissionValue ?? 0), 0),
    },
    buildingEmissions: [
      { buildingId: 'b11', buildingName: '实验楼A', totalEmission: 70.9, scope1: 25.5, scope2: 45.4 },
      { buildingId: 'b1', buildingName: '教学楼A', totalEmission: 48.2, scope1: 0, scope2: 48.2 },
    ],
    intensityPerArea: 0.032,
    intensityPerCapita: 0.10,
    dataCompleteness: 88.5,
    blockingIssues: records.filter(r => r.status === 'missing' || r.status === 'abnormal').length,
    generatedAt: new Date().toISOString().split('T')[0],
  };
}

// ========== 看板数据 ==========
export function getOverviewDashboardData(period: string): DashboardOverview {
  return {
    totalSources: 25,
    collectedSources: 20,
    completenessRate: 80.0,
    energyCompletionRate: 95.2,
    extendedCompletionRate: 72.8,
    jst303CompletionRate: 89.1,
    energyStatCompletionRate: 92.3,
    categoryProgress: {
      boundary: 100,
      energy: 92,
      extended: 65,
      support: 85,
    },
    riskBuildings: [
      { name: '实验楼A', riskLevel: 'high', issueCount: 5 },
      { name: '食堂A', riskLevel: 'medium', issueCount: 3 },
      { name: '宿舍5号楼', riskLevel: 'low', issueCount: 1 },
    ],
    monthlyTrend: [
      { month: '1月', rate: 91 },
      { month: '2月', rate: 88 },
      { month: '3月', rate: 93 },
      { month: '4月', rate: 90 },
      { month: '5月', rate: 95 },
      { month: '6月', rate: 80 },
    ],
    qualityMetrics: {
      overallScore: 88,
      completeness: 80,
      timeliness: 85,
      accuracy: 90,
      consistency: 86,
    },
  };
}

export function getEnergyStructureData(year: number = 2026): EnergyStructureData {
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
      { month: '1月', value: 12 },
      { month: '2月', value: 10 },
      { month: '3月', value: 14 },
      { month: '4月', value: 11 },
      { month: '5月', value: 13 },
      { month: '6月', value: 15 },
    ],
    commuteEmission: { main: 45, east: 28 },
    wasteEmission: { main: 35, east: 22 },
    greenCertReduction: 85.5,
    carbonSinkReduction: 12.8,
    extendedRatioTrend: [
      { month: '1月', ratio: 8.2 },
      { month: '2月', ratio: 7.8 },
      { month: '3月', ratio: 8.5 },
      { month: '4月', ratio: 8.1 },
      { month: '5月', ratio: 8.6 },
      { month: '6月', ratio: 8.9 },
    ],
  };
}

// ========== MRV 审计记录 ==========
export function getMRVAuditRecords(dataSourceId?: string): MRVAuditRecord[] {
  const records: MRVAuditRecord[] = [
    { id: 'mrv-001', dataSourceId: 'ds-004', action: 'create', operator: '系统', timestamp: '2026-07-01 00:15', remark: '自动采集' },
    { id: 'mrv-002', dataSourceId: 'ds-004', action: 'review', operator: '李四', timestamp: '2026-07-05 14:30', remark: '数据核实通过' },
    { id: 'mrv-003', dataSourceId: 'ds-005', action: 'update', operator: '系统', timestamp: '2026-07-01 00:15', oldValue: '118000', newValue: '125000', remark: '表计校准修正' },
    { id: 'mrv-004', dataSourceId: 'ds-009', action: 'create', operator: '财务部', timestamp: '2026-07-02 10:00', remark: '账单录入' },
    { id: 'mrv-005', dataSourceId: 'ds-009', action: 'review', operator: '李四', timestamp: '2026-07-05 15:20', remark: '与账单核对一致' },
  ];
  if (dataSourceId) return records.filter(r => r.dataSourceId === dataSourceId);
  return records;
}

// ========== 报告模板 ==========
export function getReportTemplates(standard: CalculationStandard) {
  if (standard === 'JST303' || standard === 'ISO14064' || standard === 'GHGProtocol') {
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

// ========== 数据质量 ==========
export function getDataQualityMetrics(): DataQualityMetrics {
  return {
    completeness: 80.0,
    timeliness: 92.3,
    accuracy: 94.1,
    consistency: 91.8,
    overallScore: 89.2,
  };
}
