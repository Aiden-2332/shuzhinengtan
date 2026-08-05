// AI 智能分析中心 - Mock 数据
import type {
  PredictionCurve,
  HolidayPlan,
  RiskCalendarDay,
  ScenarioConfig,
  ScenarioResult,
  AIAnomalyCard,
  AnomalyTimelineEvent,
  AlertNotification,
  ReductionBubble,
  ReductionMeasure,
  OptimizationPath,
  CarbonCostScenario,
  ChatMessage,
  ComplianceCheckItem,
  PolicyChangeAlert,
  RealtimeDataStream,
  QuickQuestion,
} from '@/stores/ai-center-store';
import { getCampusOperationalSnapshot, getSystemAnomalySnapshots, SYSTEM_BUILDINGS } from '@/data/campus-system-data';
import { getCampusDateAt, getCampusDateParts, getCampusLoadKw } from '@/lib/campus-realtime';

function campusDateKey(date: Date): string {
  const { year, month, day } = getCampusDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function addCampusDays(date: Date, days: number): Date {
  const parts = getCampusDateParts(date);
  return getCampusDateAt(parts.year, parts.month, parts.day + days, 12);
}

// ===== 模块1：预测性分析 =====

export function getMockPredictionCurve(period: '30d' | '60d' | '90d', now = new Date()): PredictionCurve {
  const days = period === '30d' ? 30 : period === '60d' ? 60 : 90;
  const historical: { date: string; emission: number }[] = [];
  const forecast: { date: string; predicted: number; upper95: number; lower95: number }[] = [];

  const baseEmission = 45;
  for (let i = days; i > 0; i--) {
    const d = addCampusDays(now, -i);
    const dateStr = campusDateKey(d);
    const seasonal = Math.sin((i / days) * Math.PI * 2) * 8;
    const weekday = d.getDay() >= 1 && d.getDay() <= 5 ? 5 : -3;
    const noise = ((i * 7) % 10 - 5) * 0.4;
    historical.push({ date: dateStr, emission: Math.round((baseEmission + seasonal + weekday + noise) * 10) / 10 });
  }

  for (let i = 1; i <= days; i++) {
    const d = addCampusDays(now, i);
    const dateStr = campusDateKey(d);
    const seasonal = Math.sin(((i + days) / (days * 2)) * Math.PI * 2) * 8;
    const weekday = d.getDay() >= 1 && d.getDay() <= 5 ? 5 : -3;
    const trend = i * 0.03;
    const predicted = Math.round((baseEmission + seasonal + weekday + trend) * 10) / 10;
    forecast.push({
      date: dateStr,
      predicted,
      upper95: Math.round((predicted + 6) * 10) / 10,
      lower95: Math.round((predicted - 6) * 10) / 10,
    });
  }

  return {
    period,
    historical,
    forecast,
    calendarEvents: [
      { date: campusDateKey(addCampusDays(now, 7)), event: '设备检修窗口', impactFactor: -0.18 },
      { date: campusDateKey(addCampusDays(now, 30)), event: '教学负荷切换', impactFactor: 0.35 },
      { date: campusDateKey(addCampusDays(now, 60)), event: '校历低负荷日', impactFactor: -0.3 },
    ],
  };
}

export function getMockHolidayPlans(now = new Date()): HolidayPlan[] {
  const current = getCampusDateParts(now);
  const summerYear = current.month <= 8 ? current.year : current.year + 1;
  const nationalDayYear = current.month < 10 || (current.month === 10 && current.day <= 7) ? current.year : current.year + 1;
  const summerStart = getCampusDateAt(summerYear, 7, 15, 0);
  const summerEnd = getCampusDateAt(summerYear, 8, 31, 23, 59);
  const nationalDayStart = getCampusDateAt(nationalDayYear, 10, 1, 0);
  const nationalDayEnd = getCampusDateAt(nationalDayYear, 10, 7, 23, 59);
  const daysUntil = (date: Date) => Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
  return [
    {
      id: 'hp-1',
      holidayName: `${summerYear}年暑假`,
      startDate: campusDateKey(summerStart),
      endDate: campusDateKey(summerEnd),
      daysBeforeEvent: daysUntil(summerStart),
      estimatedSaving: { energy: 850, carbon: 485, cost: 680000 },
      actions: ['空调关闭', '照明减半', '实验室最小供电', '宿舍楼集中管理'],
      status: 'auto_generated',
    },
    {
      id: 'hp-2',
      holidayName: `${nationalDayYear}年国庆假期`,
      startDate: campusDateKey(nationalDayStart),
      endDate: campusDateKey(nationalDayEnd),
      daysBeforeEvent: daysUntil(nationalDayStart),
      estimatedSaving: { energy: 120, carbon: 68, cost: 96000 },
      actions: ['空调关闭', '照明减半'],
      status: 'auto_generated',
    },
  ];
}

export function getMockRiskCalendar(now = new Date()): RiskCalendarDay[] {
  const days: RiskCalendarDay[] = [];
  for (let i = 0; i < 31; i++) {
    const d = addCampusDays(now, i);
    const dateStr = campusDateKey(d);
    const emission = 40 + ((i * 7 + 3) % 15);
    const target = 48;
    let riskLevel: RiskCalendarDay['riskLevel'] = 'safe';
    let triggerReason: string | undefined;

    if (emission > 52) {
      riskLevel = 'danger';
      triggerReason = '预计用电高峰+高温';
    } else if (emission > 48) {
      riskLevel = 'warning';
      triggerReason = '接近配额上限';
    } else if (emission > 44) {
      riskLevel = 'watch';
    }

    days.push({
      date: dateStr,
      riskLevel,
      predictedEmission: emission,
      targetRemaining: target - emission,
      triggerReason,
    });
  }
  return days;
}

export function getMockScenarioConfigs(): ScenarioConfig[] {
  return [
    {
      id: 'sc-1',
      name: '空调调高1°C',
      color: '#3488ff',
      params: [{ key: 'ac_temp_offset', value: 1, unit: '°C', min: 0.5, max: 3, step: 0.5 }],
    },
    {
      id: 'sc-2',
      name: '夜间断电扩大',
      color: '#36d968',
      params: [{ key: 'night_power_cutoff_ratio', value: 0.3, unit: '%', min: 0.1, max: 0.8, step: 0.1 }],
    },
    {
      id: 'sc-3',
      name: '照明减半小时',
      color: '#9b6bff',
      params: [{ key: 'lighting_cut_minutes', value: 30, unit: 'min', min: 10, max: 120, step: 10 }],
    },
  ];
}

export function getMockScenarioResults(configs: ScenarioConfig[], now = new Date()): ScenarioResult[] {
  return configs.map((config) => {
    const days = 30;
    const curve: { date: string; emission: number }[] = [];
    const reductionFactor = config.id === 'sc-1' ? 0.08 : config.id === 'sc-2' ? 0.12 : 0.05;
    for (let i = 1; i <= days; i++) {
      const d = addCampusDays(now, i);
      const dateStr = campusDateKey(d);
      const base = 45 + Math.sin((i / days) * Math.PI * 2) * 8;
      curve.push({ date: dateStr, emission: Math.round(base * (1 - reductionFactor) * 10) / 10 });
    }
    const totalSaving = Math.round(reductionFactor * 45 * days * 10) / 10;
    return {
      scenarioId: config.id,
      predictedCurve: curve,
      totalSaving,
      totalCostImpact: Math.round(totalSaving * 800),
    };
  });
}

// ===== 模块2：实时监控异常报警 =====

export function getMockRealtimeStream(now = new Date()): RealtimeDataStream {
  const currentPower = Math.round(getCampusLoadKw(now, 31));
  const hour = getCampusDateParts(now).hour;
  const waterFlow = 38 + Math.exp(-Math.pow((hour - 12) / 2.2, 2)) * 13 + Math.exp(-Math.pow((hour - 19) / 2.4, 2)) * 16;
  return {
    timestamp: now.toISOString(),
    totalPower: currentPower,
    totalWater: Math.round(waterFlow * 10) / 10,
    totalHeat: [11, 12, 1, 2, 3].includes(getCampusDateParts(now).month) ? 12.8 : 0,
    totalCarbon: Math.round(currentPower * 0.5672 / 100) / 10,
    anomalyCount: getSystemAnomalySnapshots(now).filter((anomaly) => anomaly.status !== 'resolved').length,
  };
}

export function getMockAnomalies(now = new Date()): AIAnomalyCard[] {
  const patternFor = (title: string, category: string): AIAnomalyCard['pattern'] => {
    if (category === 'data') return 'drift';
    if (title.includes('空载') || title.includes('超时') || title.includes('夜间')) return 'idle_run';
    if (title.includes('偏高') || title.includes('异常') || title.includes('超限')) return 'over_limit';
    return 'spike';
  };
  return getSystemAnomalySnapshots(now).map((anomaly, index) => ({
    id: anomaly.id,
    pattern: patternFor(anomaly.title, anomaly.category),
    patternLabel: anomaly.title,
    severity: anomaly.severity === 'emergency' ? 'blocking' : anomaly.severity === 'critical' ? 'severe' : anomaly.severity === 'warning' ? 'normal' : 'info',
    buildingId: anomaly.buildingId,
    buildingName: anomaly.buildingName,
    deviceId: anomaly.deviceId,
    deviceName: anomaly.deviceName,
    detectedAt: anomaly.detectedAt,
    duration: anomaly.duration,
    aiConfidence: Math.min(0.96, 0.82 + (index % 5) * 0.03),
    aiRootCause: anomaly.rootCause,
    aiEvidence: anomaly.evidence.map((description, evidenceIndex) => ({
      type: evidenceIndex === 0 ? 'data' : evidenceIndex === 1 ? 'pattern' : 'context',
      description,
    })),
    impact: {
      extraEmission: anomaly.extraEmission,
      extraCost: anomaly.extraCost,
      affectedArea: `${anomaly.buildingName} ${anomaly.deviceName ? '设备区域' : '相关区域'}`,
    },
    suggestedActions: anomaly.suggestions.map((action, actionIndex) => ({
      action,
      linkToModule: actionIndex === 0 ? 'reduction' : 'l3',
    })),
    status: anomaly.status === 'pending' ? 'new' : anomaly.status,
  }));
}

export function getMockAnomalyTimeline(anomalyId: string, now = new Date()): AnomalyTimelineEvent[] {
  const anomaly = getSystemAnomalySnapshots(now).find((item) => item.id === anomalyId);
  const baseTime = anomaly ? new Date(anomaly.detectedAt) : now;
  return [
    {
      id: `tl-${anomalyId}-1`,
      anomalyId,
      timestamp: new Date(baseTime.getTime() - 3600000).toISOString(),
      phase: 'detected',
      phaseLabel: 'AI识别',
      actor: 'AI系统',
      detail: '智能监测算法检测到能耗异常模式，自动触发告警',
    },
    {
      id: `tl-${anomalyId}-2`,
      anomalyId,
      timestamp: new Date(baseTime.getTime() - 3000000).toISOString(),
      phase: 'confirmed',
      phaseLabel: '人工确认',
      actor: '张工(后勤)',
      detail: anomaly ? `后勤值班人员确认异常属实：${anomaly.title}` : '后勤值班人员确认异常属实并开始复核',
    },
    {
      id: `tl-${anomalyId}-3`,
      anomalyId,
      timestamp: new Date(baseTime.getTime() - 1800000).toISOString(),
      phase: 'dispatched',
      phaseLabel: '已派单',
      actor: '系统自动',
      detail: `自动生成维修工单并指派至${anomaly?.category === 'data' ? '数据运维组' : '能源管理组'}`,
    },
    {
      id: `tl-${anomalyId}-4`,
      anomalyId,
      timestamp: baseTime.toISOString(),
      phase: 'processing',
      phaseLabel: '处理中',
      actor: '李师傅(暖通组)',
      detail: anomaly?.suggestions[0] ?? '维修人员到达现场并按处置建议开始排查',
    },
  ];
}

export function getMockNotifications(now = new Date()): AlertNotification[] {
  return getSystemAnomalySnapshots(now).slice(0, 9).map((anomaly, index) => ({
    id: `notif-${index + 1}`,
    anomalyId: anomaly.id,
    title: anomaly.title,
    message: `${anomaly.buildingName}${anomaly.deviceName ? ` · ${anomaly.deviceName}` : ''}：${anomaly.description}`,
    channel: index < 7 ? 'in_app' : index === 7 ? 'sms' : 'email',
    sentAt: anomaly.detectedAt,
    read: anomaly.status === 'resolved' || anomaly.status === 'acknowledged',
    targetPerson: anomaly.assignee ?? '能源值班员',
  }));
}

// ===== 模块3：减排路径优化 =====

export function getMockReductionBubbles(): ReductionBubble[] {
  const anomalyMap = new Map<string, string[]>();
  getSystemAnomalySnapshots(new Date()).forEach((anomaly) => {
    anomalyMap.set(anomaly.buildingId, [...(anomalyMap.get(anomaly.buildingId) ?? []), anomaly.title]);
  });
  const buildings = SYSTEM_BUILDINGS.slice(0, 18).map((building) => ({
    id: building.id,
    name: building.name,
    cat: building.category,
    area: building.area,
    issues: anomalyMap.get(building.id) ?? ['运行策略仍有优化空间'],
    reduction: Math.round(Math.max(24, building.annualEmissionForecast - building.annualEmissionTarget) * 0.42),
  }));

  return buildings.map((b) => ({
    buildingId: b.id,
    buildingName: b.name,
    x: 30 + ((b.area / 1000) * 0.5) + ((b.issues.length * 3) % 15),
    y: 15 + (b.reduction / 5) + ((b.area % 7) * 2),
    size: b.area,
    category: b.cat,
    topIssues: b.issues,
    estimatedReduction: b.reduction,
  }));
}

export function getMockReductionMeasures(): ReductionMeasure[] {
  return [
    { id: 'rm-1', name: '空调系统变频改造', category: 'equipment', investment: 120, paybackMonths: 18, annualReduction: 320, difficulty: 'medium', durationMonths: 4, prerequisites: ['完成空调检修'], risks: ['施工期间影响教学'], mrvMethod: '电表差值法', baseline: '改造前12个月均值' },
    { id: 'rm-2', name: 'LED照明全面替换', category: 'equipment', investment: 80, paybackMonths: 12, annualReduction: 180, difficulty: 'easy', durationMonths: 2, prerequisites: [], risks: [], mrvMethod: '电表差值法', baseline: '改造前6个月均值' },
    { id: 'rm-3', name: '智能照明控制系统', category: 'technology', investment: 45, paybackMonths: 10, annualReduction: 95, difficulty: 'easy', durationMonths: 1, prerequisites: [], risks: [], mrvMethod: '电表差值法', baseline: '改造前3个月均值' },
    { id: 'rm-4', name: '建筑外窗隔热改造', category: 'equipment', investment: 200, paybackMonths: 36, annualReduction: 150, difficulty: 'hard', durationMonths: 6, prerequisites: ['建筑结构评估'], risks: ['施工周期长', '影响正常使用'], mrvMethod: '能耗模拟+实测', baseline: '改造前12个月均值' },
    { id: 'rm-5', name: '屋顶光伏扩容', category: 'technology', investment: 350, paybackMonths: 48, annualReduction: 500, difficulty: 'hard', durationMonths: 8, prerequisites: ['屋顶承重评估', '并网审批'], risks: ['审批周期不确定'], mrvMethod: '光伏表计', baseline: '新增发电量' },
    { id: 'rm-6', name: '空气源热泵替换', category: 'equipment', investment: 180, paybackMonths: 24, annualReduction: 280, difficulty: 'medium', durationMonths: 3, prerequisites: ['热负荷计算'], risks: ['冬季效率需验证'], mrvMethod: '热泵表计', baseline: '替换前锅炉能耗' },
    { id: 'rm-7', name: '夜间定时断电策略', category: 'operation', investment: 5, paybackMonths: 1, annualReduction: 60, difficulty: 'easy', durationMonths: 0.5, prerequisites: [], risks: ['需与师生沟通'], mrvMethod: '电表差值法', baseline: '实施前1个月' },
    { id: 'rm-8', name: '暑假集中维保', category: 'operation', investment: 15, paybackMonths: 3, annualReduction: 40, difficulty: 'easy', durationMonths: 1, prerequisites: [], risks: [], mrvMethod: '电表差值法', baseline: '去年同期' },
    { id: 'rm-9', name: '实验室空调温控优化', category: 'operation', investment: 8, paybackMonths: 2, annualReduction: 35, difficulty: 'easy', durationMonths: 0.5, prerequisites: [], risks: [], mrvMethod: '电表差值法', baseline: '优化前1个月' },
    { id: 'rm-10', name: '食堂炊具能效升级', category: 'equipment', investment: 60, paybackMonths: 15, annualReduction: 85, difficulty: 'medium', durationMonths: 2, prerequisites: [], risks: ['施工期间影响供餐'], mrvMethod: '燃气表差值', baseline: '升级前6个月' },
    { id: 'rm-11', name: '中水回用系统', category: 'technology', investment: 120, paybackMonths: 30, annualReduction: 45, difficulty: 'medium', durationMonths: 5, prerequisites: ['管网改造评估'], risks: ['施工影响大'], mrvMethod: '水表差值', baseline: '改造前12个月' },
    { id: 'rm-12', name: '用电分项计量完善', category: 'technology', investment: 40, paybackMonths: 8, annualReduction: 25, difficulty: 'easy', durationMonths: 1, prerequisites: [], risks: [], mrvMethod: '分项电表', baseline: '新增计量点' },
  ];
}

export function getMockOptimizationPath(budget: number): OptimizationPath {
  const allMeasures = getMockReductionMeasures();
  const sorted = [...allMeasures].sort((a, b) => a.paybackMonths - b.paybackMonths);
  let totalInv = 0;
  const selected: (ReductionMeasure & { startMonth: number; endMonth: number; priority: number })[] = [];
  let currentMonth = 0;

  for (let i = 0; i < sorted.length; i++) {
    if (totalInv + sorted[i].investment <= budget) {
      totalInv += sorted[i].investment;
      selected.push({
        ...sorted[i],
        startMonth: currentMonth,
        endMonth: currentMonth + sorted[i].durationMonths,
        priority: i + 1,
      });
      currentMonth += sorted[i].durationMonths * 0.4;
    }
  }

  return {
    measures: selected,
    totalInvestment: totalInv,
    totalReduction: selected.reduce((s, m) => s + m.annualReduction, 0),
    avgPaybackMonths: Math.round(selected.reduce((s, m) => s + m.paybackMonths, 0) / selected.length),
    budgetConstraint: budget,
  };
}

export function getMockCostScenarios(): CarbonCostScenario[] {
  return [
    {
      name: '先减排后采购',
      emissionReduction: 1200,
      quotaPurchase: 800,
      offsetPurchase: 200,
      totalCost: 480,
      costBreakdown: [
        { item: '减排投资', cost: 320 },
        { item: '配额购买', cost: 120 },
        { item: 'CCER购买', cost: 30 },
        { item: '核查费用', cost: 10 },
      ],
    },
    {
      name: '直接采购配额',
      emissionReduction: 200,
      quotaPurchase: 1800,
      offsetPurchase: 200,
      totalCost: 650,
      costBreakdown: [
        { item: '减排投资', cost: 50 },
        { item: '配额购买', cost: 540 },
        { item: 'CCER购买', cost: 30 },
        { item: '核查费用', cost: 30 },
      ],
    },
  ];
}

// ===== 模块4：政策咨询AI助手 =====

export const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: 'q1', category: 'report', question: '本月月度报告截止日期是什么时候？', icon: '📅' },
  { id: 'q2', category: 'accounting', question: '绿电凭证怎么核算？', icon: '📊' },
  { id: 'q3', category: 'compliance', question: '配额清缴流程是什么？', icon: '📋' },
  { id: 'q4', category: 'standard', question: 'DB11/T 1785-2020 主要变化有哪些？', icon: '📖' },
  { id: 'q5', category: 'accounting', question: '主楼的排放核算用了哪个因子？', icon: '🔢' },
  { id: 'q6', category: 'compliance', question: '当前碳排放是否超标？', icon: '⚠️' },
];

const QA_PAIRS: Record<string, { answer: string; sources: { title: string; type: string; refId: string }[]; confidence: number }> = {
  '月度报告': {
    answer: '根据北京市碳排放权交易管理办法，**月度排放报告**需在次月**10个工作日**内提交。\n\n当前月份（2026年7月）的报告截止日期为 **2026年8月14日**。\n\n### 提交要求\n| 项目 | 要求 |\n|------|------|\n| 格式 | 电子版+纸质盖章版 |\n| 内容 | 月度能耗数据+排放核算 |\n| 审核 | 需经碳管理员审核确认 |\n\n> 建议提前3个工作日完成数据汇总，预留审核时间。',
    sources: [{ title: '北京市碳排放权交易管理办法 第18条', type: 'policy', refId: 'BJ-ETS-2024-18' }],
    confidence: 0.95,
  },
  '绿电凭证': {
    answer: '**绿电凭证**（绿色电力证书）的核算方法如下：\n\n### 核算原则\n1. 绿电消费对应的排放因子为 **0 tCO₂/MWh**\n2. 需提供国家可再生能源信息管理中心颁发的**绿色电力证书**作为凭证\n3. 绿证需在**报告年度内**有效\n\n### 核算步骤\n1. 统计绿电消费量（MWh）\n2. 匹配对应绿证编号\n3. 在排放核算表中单独列示\n4. 从总电力消费中扣除绿电部分\n\n> 注意：绿证不得重复使用，且需与用电周期匹配。',
    sources: [
      { title: 'DB11/T 1785-2020 第5.3条', type: 'standard', refId: 'DB11-1785-5.3' },
      { title: '绿色电力证书核发规则', type: 'policy', refId: 'GEC-2024' },
    ],
    confidence: 0.90,
  },
  '配额清缴': {
    answer: '**配额清缴流程**如下：\n\n### 四步流程\n1. **核算确认**（1-3月）：完成上年度排放核算，经核查机构确认\n2. **配额分配**（4-5月）：市生态环境局下达年度配额\n3. **配额清缴**（6月30日前）：通过交易系统提交足额配额\n4. **结果公示**（7月）：主管部门公示清缴结果\n\n### 清缴方式\n- 配额充足：直接提交配额清缴\n- 配额不足：需先通过碳市场购买配额或使用CCER抵销（不超过5%）\n\n> 2026年度清缴截止日期为 **2026年6月30日**，请提前规划。',
    sources: [
      { title: '北京市碳排放权交易管理办法 第22-25条', type: 'policy', refId: 'BJ-ETS-2024-22' },
    ],
    confidence: 0.93,
  },
  'DB11/T 1785': {
    answer: '**DB11/T 1785-2020**《高等学校碳排放核算指南》主要变化：\n\n### 相比旧版的主要更新\n1. **核算范围扩大**：新增Scope 3（其他间接排放），包括**通勤、废弃物、采购**等\n2. **排放因子更新**：系统当前电力排放因子为 **0.5672 tCO₂/MWh**\n3. **数据质量要求**：新增数据质量评级体系（A/B/C/D四级）\n4. **报告模板统一**：采用新版标准化报告模板\n5. **MRV强化**：增加监测、报告、核查（MRV）全流程要求\n\n### 过渡安排\n- 2026年为过渡期，允许新旧标准并行\n- 2027年起全面执行新标准',
    sources: [
      { title: 'DB11/T 1785-2020 全文', type: 'standard', refId: 'DB11-1785' },
      { title: '北京市生态环境局关于执行新标准的通知', type: 'policy', refId: 'BJ-EE-2025-12' },
    ],
    confidence: 0.88,
  },
  '排放因子': {
    answer: '**主楼**当前使用的排放因子如下：\n\n| 能源类型 | 排放因子 | 单位 | 来源 |\n|----------|----------|------|------|\n| 电力 | 0.5672 | tCO₂/MWh | 生态环境部2025 |\n| 天然气 | 2.1620 | tCO₂/万Nm³ | JS/T 303-2026 |\n| 热力 | 0.1100 | tCO₂/GJ | JS/T 303-2026 |\n\n> 该口径与碳核算工作台的已锁定因子版本一致。',
    sources: [
      { title: '北京市2025年排放因子目录', type: 'config', refId: 'BJ-EF-2025' },
    ],
    confidence: 0.97,
  },
  '超标': {
    answer: '### 当前碳排放状态分析\n\n根据最新数据（2026年7月12日）：\n\n| 指标 | 当前值 | 目标值 | 状态 |\n|------|--------|--------|------|\n| 累计排放 | 8,520 tCO₂ | 8,200 tCO₂ | ⚠️ 超出3.9% |\n| 排放强度 | 42.5 kgCO₂/m² | 40.0 kgCO₂/m² | ⚠️ 超出6.3% |\n| 月度趋势 | ↑ +2.1% | - | 📈 上升中 |\n\n### 风险提示\n- 当前超出配额约 **320 tCO₂**\n- 按当前趋势，年底缺口预计 **850-1200 tCO₂**\n- 建议尽快启动减排措施，避免高价购买配额\n\n### 建议行动\n1. 立即排查主教学楼空调异常\n2. 启动暑期节能预案\n3. 评估CCER抵销可行性',
    sources: [
      { title: '系统实时核算数据', type: 'data', refId: 'SYS-CALC-202607' },
      { title: '北京市碳配额分配方案2026', type: 'policy', refId: 'BJ-QUOTA-2026' },
    ],
    confidence: 0.91,
  },
};

export function getMockChatResponse(userMessage: string): { answer: string; sources: { title: string; type: string; refId: string }[]; confidence: number } {
  if (userMessage.includes('超标')) {
    const now = new Date();
    const snapshot = getCampusOperationalSnapshot(now);
    const date = campusDateKey(now);
    const quotaGap = snapshot.annualForecast - snapshot.annualQuota;
    const targetGap = snapshot.annualForecast - snapshot.annualTarget;
    return {
      answer: `### 当前碳排放状态\n\n数据截至 **${date}**：\n\n| 指标 | 当前值 | 参考值 | 状态 |\n|------|--------|--------|------|\n| 年累计排放 | ${snapshot.annualCarbon.toLocaleString()} tCO₂e | 年度配额 ${snapshot.annualQuota.toLocaleString()} tCO₂e | 配额使用${snapshot.quotaUseRate}% |\n| 年底预测 | ${snapshot.annualForecast.toLocaleString()} tCO₂e | 年度目标 ${snapshot.annualTarget.toLocaleString()} tCO₂e | 预测超目标${targetGap.toLocaleString()} t |\n\n### 风险提示\n- 按当前趋势，年底较固定配额缺口约 **${quotaGap.toLocaleString()} tCO₂e**\n- 材料测试楼、图书馆、1斋等楼宇存在不同类型异常\n- 建议先完成数据补录和设备处置，再进入正式核算与履约决策`,
      sources: [{ title: '系统实时核算数据', type: 'data', refId: `SYS-CALC-${date.replaceAll('-', '')}` }],
      confidence: 0.94,
    };
  }
  for (const [keyword, response] of Object.entries(QA_PAIRS)) {
    if (userMessage.includes(keyword)) {
      return response;
    }
  }
  return {
    answer: `关于「${userMessage.slice(0, 30)}${userMessage.length > 30 ? '...' : ''}」的问题，建议您：\n\n1. 查阅 **DB11/T 1785-2020**《高等学校碳排放核算指南》相关条款\n2. 参考 **北京市碳排放权交易管理办法** 最新修订版\n3. 联系平台碳管理专员获取详细指导\n\n> AI回答仅供参考，请以正式政策文件为准。如需更详细解答，请尝试更具体地描述您的问题。`,
    sources: [{ title: 'AI建议查阅正式政策文件', type: 'policy', refId: 'REF-GENERAL' }],
    confidence: 0.45,
  };
}

export function getMockWelcomeMessage(): ChatMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: '您好！我是**碳管理AI助手**，可以帮您解答以下问题：\n\n- 📅 报告截止日期与提交流程\n- 📊 碳排放核算方法与排放因子\n- 📋 配额管理与清缴流程\n- 📖 政策标准解读（DB11/T 1785等）\n- ⚠️ 合规风险与超标预警\n\n请直接输入您的问题，或点击下方快捷问题开始。',
    timestamp: new Date().toISOString(),
    confidence: 1,
  };
}

export function getMockComplianceChecks(): ComplianceCheckItem[] {
  return [
    { id: 'cc-1', category: 'report', categoryLabel: '报告报送', item: '月度排放报告按时提交', status: 'compliant', statusLabel: '合规', dueDate: '2026-08-14' },
    { id: 'cc-2', category: 'report', categoryLabel: '报告报送', item: '年度排放报告编制', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-3', category: 'accounting', categoryLabel: '核算方法', item: '排放因子使用正确性', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-4', category: 'accounting', categoryLabel: '核算方法', item: 'Scope 3排放核算完整性', status: 'at_risk', statusLabel: '存在风险', issueDetail: '通勤排放数据缺失，废弃物数据不完整', fixAction: '补充通勤调查数据与废弃物台账', fixLink: '/calculation' },
    { id: 'cc-5', category: 'accounting', categoryLabel: '核算方法', item: '绿电凭证核销', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-6', category: 'quota', categoryLabel: '配额管理', item: '配额足额持有', status: 'at_risk', statusLabel: '存在风险', issueDetail: '当前配额缺口约320 tCO₂', fixAction: '启动减排措施或购买配额', fixLink: '/asset' },
    { id: 'cc-7', category: 'quota', categoryLabel: '配额管理', item: 'CCER抵销比例合规', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-8', category: 'disclosure', categoryLabel: '信息披露', item: '碳排放信息公开', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-9', category: 'disclosure', categoryLabel: '信息披露', item: '核查报告存档', status: 'non_compliant', statusLabel: '不合规', issueDetail: '2025年度核查报告未归档', fixAction: '联系核查机构获取正式报告并归档', fixLink: '/calculation' },
    { id: 'cc-10', category: 'report', categoryLabel: '报告报送', item: '数据质量评级达标', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-11', category: 'quota', categoryLabel: '配额管理', item: '配额交易记录完整', status: 'compliant', statusLabel: '合规' },
    { id: 'cc-12', category: 'disclosure', categoryLabel: '信息披露', item: '减排项目进展披露', status: 'non_compliant', statusLabel: '不合规', issueDetail: '2026年Q2减排项目进展未披露', fixAction: '编制Q2进展报告并提交披露', fixLink: '/ai-suggestion' },
  ];
}

export function getMockPolicyChanges(): PolicyChangeAlert[] {
  return [
    {
      id: 'pc-1',
      policyName: '北京市碳排放权交易管理办法(2026修订)',
      effectiveDate: '2026-09-01',
      impactAreas: [
        { area: '配额分配', impact: '配额分配方法从历史法调整为基准法', affectedModule: '碳资产管理', actionRequired: '更新配额预测模型' },
        { area: 'MRV要求', impact: '新增月度数据自动上报要求', affectedModule: '碳核算工作台', actionRequired: '对接自动上报接口' },
        { area: '报告格式', impact: '报告模板更新为2026版', affectedModule: '碳核算工作台', actionRequired: '更新报告模板' },
      ],
      daysUntilEffective: 50,
    },
    {
      id: 'pc-2',
      policyName: '高等学校绿色校园评价标准(征求意见稿)',
      effectiveDate: '2027-01-01',
      impactAreas: [
        { area: '评价指标', impact: '新增碳管理数字化水平评价指标', affectedModule: '全平台', actionRequired: '完善碳管理数字化功能' },
        { area: '数据要求', impact: '要求公开连续3年碳排放数据', affectedModule: '信息披露', actionRequired: '整理历史数据' },
      ],
      daysUntilEffective: 172,
    },
  ];
}
