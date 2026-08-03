import type { CalculationResult, DataSourceRecord } from '@/types';

export const CARBON_REPORT_STANDARD = 'DB11/1785-2020';
export const CARBON_REPORT_STANDARD_NAME = '《二氧化碳排放核算和报告要求 服务业》';
export const CARBON_REPORT_TEMPLATE_PATH = '/templates/DB11-1785-2020-service-report.docx';

export interface CarbonReportConfig {
  reportName: string;
  year: string;
  scope: '全校区' | '主校区' | '东校区';
  entityName: string;
  creditCode: string;
  industryName: string;
  industryCode: string;
  registeredAddress: string;
  officeAddress: string;
  legalRepresentative: string;
  reportOwner: string;
  preparedBy: string;
  contactName: string;
  contactPhone: string;
  reportDate: string;
  boundaryDescription: string;
  boundaryChange: string;
}

export interface CarbonReportReview {
  reviewer: string;
  reviewedAt: string;
  note: string;
  boundaryConfirmed: boolean;
  dataConfirmed: boolean;
  warningsAccepted: boolean;
}

export interface CarbonReportSourceRow {
  id: string;
  sourceName: string;
  classification: string;
  campus: string;
  period: string;
  activityValue: string;
  emissionValue: number | null;
  emissionFactor: string;
  factorSource: string;
  formula: string;
  evidence: string;
  status: string;
  auditStatus: string;
}

export interface CarbonReportEmissionRow {
  key: string;
  name: string;
  scope: string;
  activityValue: string;
  factor: string;
  emission: number;
  sourceCount: number;
}

export interface CarbonReportReviewCheck {
  id: string;
  label: string;
  detail: string;
  status: 'passed' | 'warning' | 'blocking';
}

export interface CarbonReportModel {
  config: CarbonReportConfig;
  generatedAt: string;
  coveragePeriod: string;
  reportId: string;
  template: {
    code: string;
    name: string;
    edition: string;
  };
  totals: {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
    fossilFuel: number;
    electricity: number;
    heat: number;
  };
  quality: {
    sourceCount: number;
    valuedCount: number;
    evidenceCompleteCount: number;
    approvedCount: number;
    factorTraceableCount: number;
    formulaTraceableCount: number;
    completeness: number;
    evidenceCompleteness: number;
    approvalRate: number;
    factorTraceability: number;
    formulaTraceability: number;
    issueCount: number;
  };
  emissionRows: CarbonReportEmissionRow[];
  sourceRows: CarbonReportSourceRow[];
  monthlyRows: Array<{
    classification: string;
    unit: string;
    months: string[];
    annualTotal: string;
  }>;
  factorRows: Array<{
    classification: string;
    value: string;
    unit: string;
    source: string;
    version: string;
  }>;
  campusRows: Array<{
    campus: string;
    sourceCount: number;
    scope1: number;
    scope2: number;
    total: number;
  }>;
  reviewChecks: CarbonReportReviewCheck[];
  applicableTables: Array<{ code: string; name: string; status: 'included' | 'not_applicable'; reason: string }>;
  review?: CarbonReportReview;
}

const SOURCE_STATUS_LABELS: Record<string, string> = {
  normal: '正常',
  missing: '缺失',
  abnormal: '异常',
  pending_review: '待复核',
  locked: '已锁定',
  approved: '已通过',
};

const AUDIT_STATUS_LABELS: Record<string, string> = {
  approved: '已复核',
  rejected: '已驳回',
  pending: '待复核',
};

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function percentage(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : round((numerator / denominator) * 100, 1);
}

function safeNumber(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatActivity(record: DataSourceRecord) {
  if (typeof record.value !== 'number' || !Number.isFinite(record.value)) return '暂无数据';
  return `${record.value.toLocaleString('zh-CN', { maximumFractionDigits: 4 })} ${record.unit}`;
}

function filterReportRecords(records: DataSourceRecord[], config: CarbonReportConfig) {
  return records.filter((record) => {
    const isReportData = record.category === 'energy' || record.category === 'extended';
    const matchesYear = record.period.startsWith(config.year);
    const matchesScope = config.scope === '全校区' || record.campus === config.scope;
    return isReportData && matchesYear && matchesScope;
  });
}

function createMonthlyRows(records: DataSourceRecord[]) {
  const groups = new Map<string, DataSourceRecord[]>();
  records.forEach((record) => {
    const key = `${record.dataClassification || record.sourceName}::${record.unit}`;
    groups.set(key, [...(groups.get(key) || []), record]);
  });

  return Array.from(groups.entries())
    .map(([key, rows]) => {
      const [classification, unit] = key.split('::');
      const monthlyValues = Array.from({ length: 12 }, (_, monthIndex) => {
        const suffix = `-${String(monthIndex + 1).padStart(2, '0')}`;
        const values = rows.filter((row) => row.period.endsWith(suffix) && typeof row.value === 'number');
        if (values.length === 0) return '暂无数据';
        return String(round(values.reduce((sum, row) => sum + safeNumber(row.value), 0), 4));
      });
      const annualValues = rows.filter((row) => typeof row.value === 'number');
      const annualTotal = annualValues.length === 0
        ? '暂无数据'
        : String(round(annualValues.reduce((sum, row) => sum + safeNumber(row.value), 0), 4));
      return { classification, unit, months: monthlyValues, annualTotal };
    })
    .sort((a, b) => a.classification.localeCompare(b.classification, 'zh-CN'));
}

function createEmissionRows(records: DataSourceRecord[]): CarbonReportEmissionRow[] {
  const definitions = [
    { key: 'fossil', name: '化石燃料燃烧', scope: '范围一', matches: ['天然气', '车辆燃油', '其他燃料'] },
    { key: 'refrigerant', name: '逸散排放（制冷剂）', scope: '范围一', matches: ['制冷剂'] },
    { key: 'electricity', name: '消耗外购电力', scope: '范围二', matches: ['外购电力'] },
    { key: 'heat', name: '消耗外购热力', scope: '范围二', matches: ['外购热力'] },
    { key: 'other', name: '其他间接排放', scope: '范围三', matches: ['公务用车', '公务出行', '师生通勤', '用水', '废弃物'] },
  ];

  return definitions.map((definition) => {
    const matched = records.filter((record) => definition.matches.includes(record.dataClassification || ''));
    const activity = matched
      .filter((record) => typeof record.value === 'number')
      .map((record) => formatActivity(record))
      .join('；') || '暂无数据';
    const factorValues = Array.from(new Set(matched
      .filter((record) => typeof record.emissionFactor === 'number')
      .map((record) => `${record.emissionFactor} ${record.emissionFactorSource || ''}`.trim())));
    return {
      key: definition.key,
      name: definition.name,
      scope: definition.scope,
      activityValue: activity,
      factor: factorValues.join('；') || '暂无数据',
      emission: round(matched.reduce((sum, record) => sum + safeNumber(record.emissionValue), 0), 2),
      sourceCount: matched.length,
    };
  });
}

function createCampusRows(records: DataSourceRecord[]) {
  return ['主校区', '东校区'].map((campus) => {
    const campusRecords = records.filter((record) => record.campus === campus);
    const scope1 = campusRecords
      .filter((record) => record.emissionScope === 'scope1')
      .reduce((sum, record) => sum + safeNumber(record.emissionValue), 0);
    const scope2 = campusRecords
      .filter((record) => record.emissionScope === 'scope2')
      .reduce((sum, record) => sum + safeNumber(record.emissionValue), 0);
    const total = campusRecords.reduce((sum, record) => sum + safeNumber(record.emissionValue), 0);
    return {
      campus,
      sourceCount: campusRecords.length,
      scope1: round(scope1, 2),
      scope2: round(scope2, 2),
      total: round(total, 2),
    };
  }).filter((row) => row.sourceCount > 0);
}

export function buildCarbonReportModel(
  records: DataSourceRecord[],
  calculationResult: CalculationResult | null,
  config: CarbonReportConfig,
  review?: CarbonReportReview,
): CarbonReportModel {
  const reportRecords = filterReportRecords(records, config);
  const sourceRows: CarbonReportSourceRow[] = reportRecords.map((record) => ({
    id: record.id,
    sourceName: record.sourceName,
    classification: record.dataClassification || '未分类',
    campus: record.campus || '未指定',
    period: record.period,
    activityValue: formatActivity(record),
    emissionValue: typeof record.emissionValue === 'number' ? round(record.emissionValue, 4) : null,
    emissionFactor: typeof record.emissionFactor === 'number'
      ? `${record.emissionFactor}${record.emissionFactorVersion ? `（${record.emissionFactorVersion}）` : ''}`
      : '暂无数据',
    factorSource: record.emissionFactorSource || '暂无数据',
    formula: record.calculationFormula || '暂无数据',
    evidence: record.relatedEvidences?.join('；') || '暂无凭证',
    status: SOURCE_STATUS_LABELS[record.status] || record.status,
    auditStatus: AUDIT_STATUS_LABELS[record.auditStatus || 'pending'] || '待复核',
  }));

  const emissionRows = createEmissionRows(reportRecords);
  const scope1 = round(reportRecords
    .filter((record) => record.emissionScope === 'scope1')
    .reduce((sum, record) => sum + safeNumber(record.emissionValue), 0), 2);
  const scope2 = round(reportRecords
    .filter((record) => record.emissionScope === 'scope2')
    .reduce((sum, record) => sum + safeNumber(record.emissionValue), 0), 2);
  const scope3 = round(reportRecords
    .filter((record) => record.emissionScope === 'scope3')
    .reduce((sum, record) => sum + safeNumber(record.emissionValue), 0), 2);
  const total = round(scope1 + scope2 + scope3, 2);
  const fossilFuel = emissionRows.find((row) => row.key === 'fossil')?.emission || 0;
  const electricity = emissionRows.find((row) => row.key === 'electricity')?.emission || 0;
  const heat = emissionRows.find((row) => row.key === 'heat')?.emission || 0;

  const valuedCount = reportRecords.filter((record) => typeof record.value === 'number').length;
  const evidenceCompleteCount = reportRecords.filter((record) => record.evidenceStatus === 'complete').length;
  const approvedCount = reportRecords.filter((record) => record.auditStatus === 'approved').length;
  const factorRelevant = reportRecords.filter((record) => typeof record.emissionValue === 'number');
  const factorTraceableCount = factorRelevant.filter((record) => record.emissionFactorSource).length;
  const formulaTraceableCount = factorRelevant.filter((record) => record.calculationFormula).length;
  const issueCount = reportRecords.filter((record) => record.status === 'missing' || record.status === 'abnormal').length;

  const quality = {
    sourceCount: reportRecords.length,
    valuedCount,
    evidenceCompleteCount,
    approvedCount,
    factorTraceableCount,
    formulaTraceableCount,
    completeness: percentage(valuedCount, reportRecords.length),
    evidenceCompleteness: percentage(evidenceCompleteCount, reportRecords.length),
    approvalRate: percentage(approvedCount, reportRecords.length),
    factorTraceability: percentage(factorTraceableCount, factorRelevant.length),
    formulaTraceability: percentage(formulaTraceableCount, factorRelevant.length),
    issueCount,
  };

  const boundaryRecordCount = records.filter((record) => record.category === 'boundary' && record.period.startsWith(config.year)).length;
  const reviewChecks: CarbonReportReviewCheck[] = [
    {
      id: 'boundary',
      label: '核算边界已识别',
      detail: boundaryRecordCount > 0
        ? `已关联 ${boundaryRecordCount} 条边界基础数据，并按“${config.scope}”筛选。`
        : '未找到本年度边界基础数据，需人工确认组织边界。',
      status: boundaryRecordCount > 0 ? 'passed' : 'blocking',
    },
    {
      id: 'activity',
      label: '活动水平数据完整性',
      detail: `已填 ${valuedCount}/${reportRecords.length} 条，完整率 ${quality.completeness}%。`,
      status: quality.completeness >= 95 ? 'passed' : quality.completeness >= 80 ? 'warning' : 'blocking',
    },
    {
      id: 'evidence',
      label: '凭证附件完整性',
      detail: `完整凭证 ${evidenceCompleteCount}/${reportRecords.length} 条，完整率 ${quality.evidenceCompleteness}%。`,
      status: quality.evidenceCompleteness >= 90 ? 'passed' : 'warning',
    },
    {
      id: 'factor',
      label: '排放因子可追溯',
      detail: `因子来源可追溯率 ${quality.factorTraceability}%，计算公式可追溯率 ${quality.formulaTraceability}%。`,
      status: quality.factorTraceability === 100 && quality.formulaTraceability === 100 ? 'passed' : 'warning',
    },
    {
      id: 'audit',
      label: '数据复核状态',
      detail: `已复核 ${approvedCount}/${reportRecords.length} 条，当前异常或缺失 ${issueCount} 条。`,
      status: issueCount > 0 ? 'warning' : quality.approvalRate >= 90 ? 'passed' : 'warning',
    },
    {
      id: 'consistency',
      label: '汇总结果一致性',
      detail: calculationResult && calculationResult.period.startsWith(config.year)
        ? `当前工作台结果 ${calculationResult.totalEmission.toFixed(2)} tCO₂；本报告按年度和校区重新汇总为 ${total.toFixed(2)} tCO₂。`
        : `本报告按已纳入的 ${reportRecords.length} 条数据汇总为 ${total.toFixed(2)} tCO₂。`,
      status: 'passed',
    },
  ];

  const factorMap = new Map<string, CarbonReportModel['factorRows'][number]>();
  reportRecords.forEach((record) => {
    if (typeof record.emissionFactor !== 'number') return;
    const key = `${record.dataClassification || record.sourceName}-${record.emissionFactor}-${record.emissionFactorSource || ''}`;
    factorMap.set(key, {
      classification: record.dataClassification || record.sourceName,
      value: String(record.emissionFactor),
      unit: record.emissionFactorVersion || '按源数据单位',
      source: record.emissionFactorSource || '暂无数据',
      version: record.emissionFactorVersion || '未注明',
    });
  });

  const includedTables = [
    { code: '表C.1', name: '基本信息表', status: 'included' as const, reason: '报告主体与核算边界' },
    { code: '表C.2', name: '二氧化碳排放量汇总表', status: 'included' as const, reason: '范围一、二、三汇总' },
    { code: '表C.3-C.5', name: '分能源排放核算表', status: 'included' as const, reason: '燃料、电力与热力明细' },
    { code: '表C.7-C.9', name: '活动水平与能源消费表', status: 'included' as const, reason: '月度活动数据与其他能源' },
    { code: '表C.13', name: '其他类型服务业生产经营信息表', status: 'included' as const, reason: '高校按其他服务业补充披露' },
    { code: '表C.15', name: '报告真实性声明', status: 'included' as const, reason: '签字盖章页' },
    { code: '表C.10', name: '物业管理类补充信息表', status: 'not_applicable' as const, reason: '报告主体非物业管理企业' },
    { code: '表C.11-C.12', name: '数据中心与通信行业补充表', status: 'not_applicable' as const, reason: '报告主体非对应行业；校园数据机房已在源清单披露' },
    { code: '表C.14', name: '供热设施补充数据表', status: heat > 0 ? 'included' as const : 'not_applicable' as const, reason: heat > 0 ? '存在外购热力或供热数据' : '当前筛选范围未纳入供热设施数据' },
  ];

  const generatedAt = new Date().toISOString();
  return {
    config,
    generatedAt,
    coveragePeriod: reportRecords.length > 0
      ? (() => {
        const periods = reportRecords.map((record) => record.period).sort();
        return `${periods[0]} 至 ${periods[periods.length - 1]}`;
      })()
      : `${config.year}-01 至 ${config.year}-12（暂无数据）`,
    reportId: `DB11-${config.year}-${config.scope}-${generatedAt.slice(0, 10).replaceAll('-', '')}`,
    template: {
      code: CARBON_REPORT_STANDARD,
      name: CARBON_REPORT_STANDARD_NAME,
      edition: '北京市地方标准 DB11/1785-2020 附录C 服务业报告样式',
    },
    totals: { total, scope1, scope2, scope3, fossilFuel, electricity, heat },
    quality,
    emissionRows,
    sourceRows,
    monthlyRows: createMonthlyRows(reportRecords),
    factorRows: Array.from(factorMap.values()),
    campusRows: createCampusRows(reportRecords),
    reviewChecks,
    applicableTables: includedTables,
    review,
  };
}

export function getReviewSummary(report: CarbonReportModel) {
  const blocking = report.reviewChecks.filter((check) => check.status === 'blocking').length;
  const warnings = report.reviewChecks.filter((check) => check.status === 'warning').length;
  const passed = report.reviewChecks.filter((check) => check.status === 'passed').length;
  return {
    blocking,
    warnings,
    passed,
    ready: blocking === 0,
    requiresWarningAcceptance: blocking > 0 || warnings > 0,
  };
}
