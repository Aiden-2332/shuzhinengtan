import JSZip from 'jszip';
import type { CarbonReportModel } from '@/lib/carbon-report';

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const CONTENT_WIDTH = 9520;

type CellValue = string | number | null | undefined;

interface ParagraphOptions {
  align?: 'left' | 'center' | 'right' | 'both';
  bold?: boolean;
  fontSize?: number;
  color?: string;
  before?: number;
  after?: number;
  line?: number;
  keepNext?: boolean;
  indentFirstLine?: number;
  pageBreakBefore?: boolean;
}

interface TableOptions {
  headerRows?: number;
  fontSize?: number;
  headerFill?: string;
  alignments?: Array<'left' | 'center' | 'right'>;
}

function escapeXml(value: CellValue) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function run(text: CellValue, options: Pick<ParagraphOptions, 'bold' | 'fontSize' | 'color'> = {}) {
  const parts = String(text ?? '').split('\n');
  const runProperties = [
    '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:eastAsia="宋体" w:cs="Times New Roman"/>',
    options.bold ? '<w:b/><w:bCs/>' : '',
    `<w:sz w:val="${options.fontSize ?? 21}"/><w:szCs w:val="${options.fontSize ?? 21}"/>`,
    options.color ? `<w:color w:val="${options.color}"/>` : '',
  ].join('');
  return `<w:r><w:rPr>${runProperties}</w:rPr>${parts.map((part, index) => `${index > 0 ? '<w:br/>' : ''}<w:t xml:space="preserve">${escapeXml(part)}</w:t>`).join('')}</w:r>`;
}

function paragraph(text: CellValue, options: ParagraphOptions = {}) {
  const paragraphProperties = [
    `<w:jc w:val="${options.align ?? 'left'}"/>`,
    `<w:spacing w:before="${options.before ?? 0}" w:after="${options.after ?? 100}" w:line="${options.line ?? 360}" w:lineRule="auto"/>`,
    options.keepNext ? '<w:keepNext/>' : '',
    options.pageBreakBefore ? '<w:pageBreakBefore/>' : '',
    options.indentFirstLine ? `<w:ind w:firstLine="${options.indentFirstLine}"/>` : '',
    '<w:widowControl/>',
  ].join('');
  return `<w:p><w:pPr>${paragraphProperties}</w:pPr>${run(text, options)}</w:p>`;
}

function pageBreak() {
  return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
}

function tableCaption(text: string) {
  return paragraph(text, { align: 'center', bold: true, fontSize: 22, before: 180, after: 100, keepNext: true });
}

function sectionTitle(text: string, pageBreakBefore = false) {
  return paragraph(text, {
    bold: true,
    fontSize: 28,
    before: 240,
    after: 140,
    keepNext: true,
    pageBreakBefore,
  });
}

function cell(value: CellValue, width: number, options: { fill?: string; bold?: boolean; align?: 'left' | 'center' | 'right'; fontSize?: number } = {}) {
  const fill = options.fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${options.fill}"/>` : '';
  return `<w:tc><w:tcPr><w:tcW w:w="${width}" w:type="dxa"/>${fill}<w:vAlign w:val="center"/></w:tcPr>${paragraph(value, {
    align: options.align ?? 'center',
    bold: options.bold,
    fontSize: options.fontSize ?? 19,
    before: 40,
    after: 40,
    line: 300,
  })}</w:tc>`;
}

function table(rows: CellValue[][], widths: number[], options: TableOptions = {}) {
  const headerRows = options.headerRows ?? 1;
  const headerFill = options.headerFill ?? 'D9EAF7';
  const grid = widths.map((width) => `<w:gridCol w:w="${width}"/>`).join('');
  const body = rows.map((row, rowIndex) => {
    const isHeader = rowIndex < headerRows;
    const rowProperties = isHeader ? '<w:tblHeader/><w:cantSplit/>' : '<w:cantSplit/>';
    return `<w:tr><w:trPr>${rowProperties}</w:trPr>${row.map((value, columnIndex) => cell(value, widths[columnIndex], {
      fill: isHeader ? headerFill : undefined,
      bold: isHeader,
      align: options.alignments?.[columnIndex] ?? (columnIndex === 0 ? 'left' : 'center'),
      fontSize: options.fontSize ?? 19,
    })).join('')}</w:tr>`;
  }).join('');

  return `<w:tbl><w:tblPr>
    <w:tblW w:w="${widths.reduce((sum, width) => sum + width, 0)}" w:type="dxa"/>
    <w:tblLayout w:type="fixed"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="333333"/>
      <w:left w:val="single" w:sz="8" w:space="0" w:color="333333"/>
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="333333"/>
      <w:right w:val="single" w:sz="8" w:space="0" w:color="333333"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="666666"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="666666"/>
    </w:tblBorders>
    <w:tblCellMar><w:top w:w="80" w:type="dxa"/><w:left w:w="100" w:type="dxa"/><w:bottom w:w="80" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tblCellMar>
  </w:tblPr><w:tblGrid>${grid}</w:tblGrid>${body}</w:tbl>`;
}

function percent(value: number) {
  return `${value.toFixed(1)}%`;
}

function emission(value: number | null | undefined) {
  return typeof value === 'number' ? value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '暂无数据';
}

function buildCover(report: CarbonReportModel) {
  const { config } = report;
  return [
    paragraph('', { after: 1800 }),
    paragraph(config.entityName, { align: 'center', bold: true, fontSize: 38, after: 240 }),
    paragraph('二氧化碳排放报告', { align: 'center', bold: true, fontSize: 56, after: 160 }),
    paragraph('服务业', { align: 'center', bold: true, fontSize: 44, after: 1850 }),
    paragraph(`报告主体（盖章）：${config.entityName}`, { fontSize: 24, before: 100, after: 180 }),
    paragraph(`报告期：${config.year} 年（数据覆盖：${report.coveragePeriod}）`, { fontSize: 24, after: 180 }),
    paragraph(`编制日期：${config.reportDate}`, { fontSize: 24, after: 140 }),
    paragraph(`报告编号：${report.reportId}`, { fontSize: 20, color: '666666', after: 120 }),
    paragraph(`依据：${report.template.code} ${report.template.name}`, { fontSize: 19, color: '666666', after: 0 }),
    pageBreak(),
  ].join('');
}

function buildDeclaration(report: CarbonReportModel) {
  const { config, totals } = report;
  return [
    paragraph(`${config.entityName}核算了 ${config.year} 年度二氧化碳排放量，并填写了本报告相关数据表格。现将有关情况报告如下：`, {
      bold: true,
      fontSize: 24,
      align: 'both',
      indentFirstLine: 480,
      after: 300,
    }),
    paragraph('一、企业（单位）基本情况', { fontSize: 24, after: 180 }),
    paragraph('二、二氧化碳排放', { fontSize: 24, after: 180 }),
    paragraph('三、活动水平数据及来源说明', { fontSize: 24, after: 180 }),
    paragraph('四、排放因子数据及来源说明', { fontSize: 24, after: 240 }),
    paragraph(`本报告按“${config.scope}”组织边界汇总，当前纳入排放量 ${totals.total.toFixed(2)} tCO₂。所有缺失项均以“暂无数据”标识，未按零值处理。`, {
      fontSize: 22,
      align: 'both',
      indentFirstLine: 440,
      after: 220,
    }),
    paragraph('本报告主体对本报告的真实性负责。', { fontSize: 22, after: 1200 }),
    paragraph(`法人代表（签字/签章）：${config.legalRepresentative || '________________'}`, { align: 'right', fontSize: 22, after: 280 }),
    paragraph(`${config.reportDate}`, { align: 'right', fontSize: 22, after: 0 }),
    pageBreak(),
  ].join('');
}

function buildBasicInformation(report: CarbonReportModel) {
  const { config } = report;
  const rows: CellValue[][] = [
    ['项目', '填报内容'],
    ['企业名称', config.entityName],
    ['所属行业 / 行业代码', `${config.industryName} / ${config.industryCode || '待补充'}`],
    ['统一社会信用代码', config.creditCode || '待补充'],
    ['注册地址', config.registeredAddress || '待补充'],
    ['办公地址', config.officeAddress || '待补充'],
    ['法定代表人', config.legalRepresentative || '待补充'],
    ['碳排放管理部门 / 负责人', `后勤与能源管理部门 / ${config.reportOwner || '待补充'}`],
    ['联系人 / 电话', `${config.contactName || '待补充'} / ${config.contactPhone || '待补充'}`],
    ['主要产品或服务', '高等教育、科研、校园公共服务与配套保障'],
    ['核算和报告边界', config.boundaryDescription],
    ['核算和报告边界变化', config.boundaryChange || '本报告期无重大边界变化。'],
  ];
  return [
    sectionTitle('一、企业（单位）基本情况'),
    tableCaption('表C.1  基本信息表'),
    table(rows, [2700, CONTENT_WIDTH - 2700], { alignments: ['center', 'left'], fontSize: 20 }),
    paragraph('注：平台预览中的“待补充”字段应在下载前由报告编制人复核；报告中不以空白或 0 替代未知信息。', { fontSize: 18, color: '666666', before: 100 }),
  ].join('');
}

function buildEmissionSummary(report: CarbonReportModel) {
  const { totals } = report;
  const rows: CellValue[][] = [
    ['二氧化碳排放明细', '二氧化碳排放量\n（tCO₂）', '占总排放比例'],
    ['二氧化碳排放总量', emission(totals.total), '100.0%'],
    ['化石燃料燃烧排放量', emission(totals.fossilFuel), totals.total > 0 ? percent((totals.fossilFuel / totals.total) * 100) : '暂无数据'],
    ['消耗外购电力对应的排放量', emission(totals.electricity), totals.total > 0 ? percent((totals.electricity / totals.total) * 100) : '暂无数据'],
    ['消耗外购热力对应的排放量', emission(totals.heat), totals.total > 0 ? percent((totals.heat / totals.total) * 100) : '暂无数据'],
    ['其他直接与间接排放量', emission(Math.max(0, totals.total - totals.fossilFuel - totals.electricity - totals.heat)), totals.total > 0 ? percent((Math.max(0, totals.total - totals.fossilFuel - totals.electricity - totals.heat) / totals.total) * 100) : '暂无数据'],
  ];
  const scopeRows: CellValue[][] = [
    ['核算范围', '排放量（tCO₂）', '说明'],
    ['范围一', emission(totals.scope1), '固定燃烧、移动燃烧和逸散排放'],
    ['范围二', emission(totals.scope2), '外购电力与外购热力排放'],
    ['范围三（补充披露）', emission(totals.scope3), '通勤、用水、废弃物等其他间接排放'],
  ];
  return [
    sectionTitle('二、二氧化碳排放', true),
    tableCaption('表C.2  二氧化碳排放量汇总表'),
    table(rows, [4800, 2400, 2320], { alignments: ['left', 'right', 'right'], fontSize: 20 }),
    tableCaption('表2-1  按核算范围汇总'),
    table(scopeRows, [2800, 2200, 4520], { alignments: ['center', 'right', 'left'], fontSize: 20 }),
  ].join('');
}

function buildEmissionCalculations(report: CarbonReportModel) {
  const rows: CellValue[][] = [
    ['排放类别', '范围', '活动水平', '排放因子及来源', '排放量（tCO₂）', '数据源数'],
    ...report.emissionRows.map((row) => [row.name, row.scope, row.activityValue, row.factor, emission(row.emission), row.sourceCount]),
  ];
  return [
    sectionTitle('三、分能源排放核算'),
    tableCaption('表C.3-C.5  化石燃料、外购电力与外购热力排放'),
    table(rows, [1750, 1050, 2100, 2350, 1400, 870], {
      alignments: ['left', 'center', 'left', 'left', 'right', 'center'],
      fontSize: 17,
    }),
    paragraph('计算原则：排放量 = 活动水平数据 × 排放因子。因数据源单位不同而需换算时，以平台记录的计算公式和因子版本为追溯依据。', {
      fontSize: 18,
      color: '555555',
      before: 100,
      align: 'both',
    }),
  ].join('');
}

function buildActivityData(report: CarbonReportModel) {
  const sourceRows: CellValue[][] = [
    ['数据源', '能源/活动类型', '校区与周期', '活动水平', '排放量（tCO₂）', '凭证与状态'],
    ...report.sourceRows.map((row) => [
      row.sourceName,
      row.classification,
      `${row.campus}\n${row.period}`,
      row.activityValue,
      emission(row.emissionValue),
      `${row.evidence}\n${row.status} / ${row.auditStatus}`,
    ]),
  ];
  const rows = sourceRows.length > 1 ? sourceRows : [sourceRows[0], ['暂无数据', '暂无数据', '暂无数据', '暂无数据', '暂无数据', '当前筛选范围无可用数据']];
  return [
    sectionTitle('四、活动水平数据及来源说明'),
    tableCaption('表C.7-C.9  活动水平数据与能源消费信息'),
    table(rows, [1700, 1350, 1450, 1500, 1350, 2170], {
      alignments: ['left', 'left', 'center', 'right', 'right', 'left'],
      fontSize: 16,
    }),
  ].join('');
}

function buildMonthlyData(report: CarbonReportModel) {
  const widths = [1100, 600, ...Array.from({ length: 12 }, () => 560), 1100];
  const rows: CellValue[][] = [
    ['能源/活动类型', '单位', ...Array.from({ length: 12 }, (_, index) => `${index + 1}月`), '年累计'],
    ...report.monthlyRows.map((row) => [row.classification, row.unit, ...row.months, row.annualTotal]),
  ];
  const dataRows = rows.length > 1 ? rows : [rows[0], ['暂无数据', '-', ...Array.from({ length: 12 }, () => '暂无数据'), '暂无数据']];
  return [
    tableCaption('表C.7  化石燃料及其他能源月度消耗量'),
    table(dataRows, widths, {
      alignments: ['left', 'center', ...Array.from({ length: 13 }, () => 'right' as const)],
      fontSize: 12,
    }),
  ].join('');
}

function buildFactorData(report: CarbonReportModel) {
  const rows: CellValue[][] = [
    ['排放源/能源类型', '因子值', '单位/版本', '来源', '适用说明'],
    ...report.factorRows.map((row) => [row.classification, row.value, row.unit, row.source, `版本：${row.version}`]),
  ];
  const dataRows = rows.length > 1 ? rows : [rows[0], ['暂无数据', '暂无数据', '暂无数据', '暂无数据', '需补充排放因子来源']];
  return [
    sectionTitle('五、排放因子数据及来源说明'),
    tableCaption('表5-1  排放因子及版本追溯表'),
    table(dataRows, [2000, 1300, 1600, 2800, 1820], {
      alignments: ['left', 'right', 'center', 'left', 'left'],
      fontSize: 18,
    }),
    paragraph('排放因子以平台数据源记录的来源和版本为准。未注明来源或版本的因子已在复核清单中标记，下载报告不会将其自动判定为已核实。', {
      fontSize: 18,
      color: '555555',
      before: 100,
      align: 'both',
    }),
  ].join('');
}

function buildSupplemental(report: CarbonReportModel) {
  const campusRows: CellValue[][] = [
    ['校区', '数据源数', '范围一（tCO₂）', '范围二（tCO₂）', '合计（tCO₂）'],
    ...report.campusRows.map((row) => [row.campus, row.sourceCount, emission(row.scope1), emission(row.scope2), emission(row.total)]),
  ];
  const applicabilityRows: CellValue[][] = [
    ['标准表', '表名', '适用状态', '判定说明'],
    ...report.applicableTables.map((item) => [item.code, item.name, item.status === 'included' ? '已纳入' : '不适用', item.reason]),
  ];
  return [
    sectionTitle('六、服务业生产经营与适用性补充信息'),
    tableCaption('表C.13  其他类型服务业企业的生产经营服务信息表'),
    table([
      ['填写类目', '填写内容', '填写说明'],
      ['所属行业分类代码（四位）', report.config.industryCode || '待补充', '根据 GB/T 4754 行业分类复核'],
      ['行业名称', report.config.industryName, '高校按教育服务业填报'],
      ['主要生产经营服务', '高等教育、科学研究、校园公共服务', '依据组织实际业务范围'],
      ['建筑面积', '暂无数据', '需从建筑面积台账补充，未知值不填 0'],
      ['数据覆盖期', report.coveragePeriod, '由当前筛选范围内的数据源自动确定'],
    ], [2850, 2700, 3970], { alignments: ['left', 'left', 'left'], fontSize: 19 }),
    tableCaption('表6-1  分校区排放补充信息'),
    table(campusRows.length > 1 ? campusRows : [campusRows[0], ['暂无数据', 0, '暂无数据', '暂无数据', '暂无数据']], [2100, 1300, 1900, 1900, 2320], {
      alignments: ['left', 'center', 'right', 'right', 'right'],
      fontSize: 19,
    }),
    tableCaption('表6-2  附录C行业补充表适用性判定'),
    table(applicabilityRows, [1300, 2600, 1400, 4220], { alignments: ['center', 'left', 'center', 'left'], fontSize: 18 }),
  ].join('');
}

function buildQualityReview(report: CarbonReportModel) {
  const { quality } = report;
  const qualityRows: CellValue[][] = [
    ['指标', '结果', '口径'],
    ['数据源数量', quality.sourceCount, '当前年度与校区范围内的能源和扩展排放数据'],
    ['活动数据完整率', percent(quality.completeness), `${quality.valuedCount}/${quality.sourceCount} 条具有数值`],
    ['凭证完整率', percent(quality.evidenceCompleteness), `${quality.evidenceCompleteCount}/${quality.sourceCount} 条凭证完整`],
    ['复核通过率', percent(quality.approvalRate), `${quality.approvedCount}/${quality.sourceCount} 条已复核`],
    ['排放因子可追溯率', percent(quality.factorTraceability), `${quality.factorTraceableCount} 条排放数据可追溯因子来源`],
    ['计算公式可追溯率', percent(quality.formulaTraceability), `${quality.formulaTraceableCount} 条排放数据记录公式`],
    ['异常或缺失项', quality.issueCount, '缺失与异常状态的数据源数量'],
  ];
  const reviewRows: CellValue[][] = [
    ['复核项', '系统结论', '说明'],
    ...report.reviewChecks.map((check) => [check.label, check.status === 'passed' ? '通过' : check.status === 'warning' ? '关注' : '待补充', check.detail]),
  ];
  return [
    sectionTitle('七、数据质量与报告复核'),
    tableCaption('表7-1  数据质量评价'),
    table(qualityRows, [2600, 1900, 5020], { alignments: ['left', 'center', 'left'], fontSize: 19 }),
    tableCaption('表7-2  报告自动复核清单'),
    table(reviewRows, [2600, 1600, 5320], { alignments: ['left', 'center', 'left'], fontSize: 18 }),
    paragraph(`复核人：${report.review?.reviewer || '未填写'}    复核时间：${report.review?.reviewedAt || '未填写'}`, { fontSize: 20, before: 180, after: 100 }),
    paragraph(`复核意见：${report.review?.note || '无'}`, { fontSize: 20, align: 'both', after: 80 }),
    paragraph(`人工确认：核算边界 ${report.review?.boundaryConfirmed ? '已确认' : '未确认'}；活动数据与因子 ${report.review?.dataConfirmed ? '已确认' : '未确认'}；待补充项 ${report.review?.warningsAccepted ? '已知悉' : '未确认'}。`, { fontSize: 18, color: '555555' }),
  ].join('');
}

function buildEvidenceAppendix(report: CarbonReportModel) {
  const rows: CellValue[][] = [
    ['序号', '数据源', '凭证清单', '数据状态', '复核状态'],
    ...report.sourceRows.map((row, index) => [index + 1, row.sourceName, row.evidence, row.status, row.auditStatus]),
  ];
  return [
    sectionTitle('附录A  数据源与凭证索引'),
    table(rows.length > 1 ? rows : [rows[0], [1, '暂无数据', '暂无凭证', '暂无数据', '待复核']], [800, 2200, 3900, 1300, 1320], {
      alignments: ['center', 'left', 'left', 'center', 'center'],
      fontSize: 17,
    }),
  ].join('');
}

function buildAuthenticityStatement(report: CarbonReportModel) {
  return [
    sectionTitle('报告真实性声明', true),
    tableCaption('表C.15  报告真实性声明'),
    table([
      ['声明'],
      [`本排放报告完整和真实。报告中的信息与实际情况不符的，本单位愿负相应的法律责任，并承担由此产生的一切后果。特此声明。\n\n法人代表（或授权代表）：________________        （签章）\n\n${report.config.entityName}（公章）                         ${report.config.reportDate}`],
    ], [CONTENT_WIDTH], { alignments: ['left'], fontSize: 21 }),
    paragraph('本文件由高校智慧碳管理平台依据 DB11/1785-2020 服务业报告样式生成。最终报送前应由报告主体完成签字、盖章及必要的第三方核验。', {
      fontSize: 18,
      color: '666666',
      before: 240,
      align: 'both',
    }),
  ].join('');
}

function buildDocumentXml(report: CarbonReportModel) {
  const body = [
    buildCover(report),
    buildDeclaration(report),
    buildBasicInformation(report),
    buildEmissionSummary(report),
    buildEmissionCalculations(report),
    buildActivityData(report),
    buildMonthlyData(report),
    buildFactorData(report),
    buildSupplemental(report),
    buildQualityReview(report),
    buildEvidenceAppendix(report),
    buildAuthenticityStatement(report),
  ].join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
    mc:Ignorable="w14">
    <w:body>${body}
      <w:sectPr>
        <w:pgSz w:w="11906" w:h="16838"/>
        <w:pgMar w:top="1417" w:right="1063" w:bottom="1134" w:left="1063" w:header="567" w:footer="567" w:gutter="0"/>
        <w:cols w:space="425"/>
        <w:docGrid w:type="lines" w:linePitch="312"/>
      </w:sectPr>
    </w:body>
  </w:document>`;
}

function buildCoreProperties(report: CarbonReportModel) {
  const now = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:dcterms="http://purl.org/dc/terms/"
    xmlns:dcmitype="http://purl.org/dc/dcmitype/"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${escapeXml(report.config.reportName)}</dc:title>
    <dc:subject>${escapeXml(`${report.template.code} ${report.template.name}`)}</dc:subject>
    <dc:creator>高校智慧碳管理平台</dc:creator>
    <cp:lastModifiedBy>${escapeXml(report.review?.reviewer || report.config.preparedBy || '高校智慧碳管理平台')}</cp:lastModifiedBy>
    <cp:keywords>碳核算;DB11/1785-2020;服务业;二氧化碳排放报告</cp:keywords>
    <dc:description>${escapeXml(`${report.config.entityName} ${report.config.year} 年度碳排放报告`)}</dc:description>
    <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
  </cp:coreProperties>`;
}

export async function buildCarbonReportDocxFromTemplate(templateBytes: ArrayBuffer | Uint8Array, report: CarbonReportModel) {
  const zip = await JSZip.loadAsync(templateBytes);
  zip.file('word/document.xml', buildDocumentXml(report));
  zip.file('docProps/core.xml', buildCoreProperties(report));
  return zip.generateAsync({
    type: 'blob',
    mimeType: DOCX_MIME,
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

export async function buildCarbonReportDocx(report: CarbonReportModel) {
  const response = await fetch('/templates/DB11-1785-2020-service-report.docx');
  if (!response.ok) {
    throw new Error(`报告模板加载失败（HTTP ${response.status}）`);
  }
  const templateBytes = await response.arrayBuffer();
  return buildCarbonReportDocxFromTemplate(templateBytes, report);
}

export function createCarbonReportFilename(report: CarbonReportModel) {
  const safeEntity = report.config.entityName.replace(/[\\/:*?"<>|]/g, '_');
  const safeName = report.config.reportName.replace(/[\\/:*?"<>|]/g, '_');
  return `${safeEntity}_${report.config.year}年度_${safeName}_DB11-1785-2020.docx`;
}
