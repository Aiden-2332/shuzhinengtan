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

// ===== 模块1：预测性分析 =====

export function getMockPredictionCurve(period: '30d' | '60d' | '90d'): PredictionCurve {
  const days = period === '30d' ? 30 : period === '60d' ? 60 : 90;
  const historical: { date: string; emission: number }[] = [];
  const forecast: { date: string; predicted: number; upper95: number; lower95: number }[] = [];

  const baseEmission = 45;
  for (let i = days; i > 0; i--) {
    const d = new Date(2026, 5, 30 - i);
    const dateStr = d.toISOString().slice(0, 10);
    const seasonal = Math.sin((i / days) * Math.PI * 2) * 8;
    const weekday = d.getDay() >= 1 && d.getDay() <= 5 ? 5 : -3;
    const noise = ((i * 7) % 10 - 5) * 0.4;
    historical.push({ date: dateStr, emission: Math.round((baseEmission + seasonal + weekday + noise) * 10) / 10 });
  }

  for (let i = 1; i <= days; i++) {
    const d = new Date(2026, 5, 30 + i);
    const dateStr = d.toISOString().slice(0, 10);
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
      { date: '2026-07-15', event: '暑假开始', impactFactor: -0.6 },
      { date: '2026-09-01', event: '秋季开学', impactFactor: 0.5 },
      { date: '2026-10-01', event: '国庆假期', impactFactor: -0.3 },
    ],
  };
}

export function getMockHolidayPlans(): HolidayPlan[] {
  return [
    {
      id: 'hp-1',
      holidayName: '2026年暑假',
      startDate: '2026-07-15',
      endDate: '2026-08-31',
      daysBeforeEvent: 20,
      estimatedSaving: { energy: 850, carbon: 485, cost: 680000 },
      actions: ['空调关闭', '照明减半', '实验室最小供电', '宿舍楼集中管理'],
      status: 'auto_generated',
    },
    {
      id: 'hp-2',
      holidayName: '2026年国庆假期',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      daysBeforeEvent: 95,
      estimatedSaving: { energy: 120, carbon: 68, cost: 96000 },
      actions: ['空调关闭', '照明减半'],
      status: 'auto_generated',
    },
  ];
}

export function getMockRiskCalendar(): RiskCalendarDay[] {
  const days: RiskCalendarDay[] = [];
  const now = new Date(2026, 6, 1);
  for (let i = 0; i < 31; i++) {
    const d = new Date(2026, 6, 1 + i);
    const dateStr = d.toISOString().slice(0, 10);
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

export function getMockScenarioResults(configs: ScenarioConfig[]): ScenarioResult[] {
  return configs.map((config) => {
    const days = 30;
    const curve: { date: string; emission: number }[] = [];
    const reductionFactor = config.id === 'sc-1' ? 0.08 : config.id === 'sc-2' ? 0.12 : 0.05;
    for (let i = 1; i <= days; i++) {
      const d = new Date(2026, 6, i);
      const dateStr = d.toISOString().slice(0, 10);
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

export function getMockRealtimeStream(): RealtimeDataStream {
  return {
    timestamp: new Date().toISOString(),
    totalPower: 2850 + Math.round(Math.sin(Date.now() / 10000) * 200),
    totalWater: 45.2 + Math.round(Math.sin(Date.now() / 12000) * 5 * 10) / 10,
    totalHeat: 12.8 + Math.round(Math.sin(Date.now() / 8000) * 2 * 10) / 10,
    totalCarbon: 28.5 + Math.round(Math.sin(Date.now() / 15000) * 3 * 10) / 10,
    anomalyCount: 3,
  };
}

export function getMockAnomalies(): AIAnomalyCard[] {
  return [
    {
      id: 'anom-001',
      pattern: 'spike',
      patternLabel: '用电突增',
      severity: 'blocking',
      buildingId: 'b01',
      buildingName: '主教学楼',
      deviceName: '中央空调机组#3',
      detectedAt: '2026-07-12T14:32:00Z',
      duration: '2h 15min',
      aiConfidence: 0.92,
      aiRootCause: '空调系统夜间未关闭，叠加室外温度异常升高至38°C，导致冷负荷急剧增加',
      aiEvidence: [
        { type: 'data', description: '该楼栋过去7天夜间能耗均值偏高240%' },
        { type: 'weather', description: '当日室外温度38°C，高于季节均值6°C' },
        { type: 'pattern', description: '负荷曲线与同类建筑教学楼B偏差超过3σ' },
      ],
      impact: { extraEmission: 2.8, extraCost: 2240, affectedArea: '主教学楼 全楼', affectedPeople: 3500 },
      suggestedActions: [
        { action: '立即关闭非教学区域空调', linkToModule: 'reduction' },
        { action: '转工单处理', linkToModule: 'l3' },
      ],
      status: 'new',
    },
    {
      id: 'anom-002',
      pattern: 'idle_run',
      patternLabel: '空载运行',
      severity: 'severe',
      buildingId: 'b05',
      buildingName: '信息学院楼',
      deviceName: '实验室排风系统',
      detectedAt: '2026-07-12T08:15:00Z',
      duration: '6h 40min',
      aiConfidence: 0.85,
      aiRootCause: '实验室排风系统在无人时段持续运行，定时策略未覆盖暑期特殊作息',
      aiEvidence: [
        { type: 'calendar', description: '当前为暑期，实验室使用率<10%' },
        { type: 'data', description: '排风系统功率稳定在额定值85%，无调节迹象' },
      ],
      impact: { extraEmission: 1.5, extraCost: 1200, affectedArea: '信息学院楼 3-5层实验室' },
      suggestedActions: [
        { action: '调整排风系统定时策略', linkToModule: 'reduction' },
      ],
      status: 'new',
    },
    {
      id: 'anom-003',
      pattern: 'over_limit',
      patternLabel: '超标排放',
      severity: 'severe',
      buildingId: 'b13',
      buildingName: '1号宿舍楼',
      detectedAt: '2026-07-11T22:00:00Z',
      duration: '14h 30min',
      aiConfidence: 0.78,
      aiRootCause: '宿舍楼夜间用电超限，疑似学生使用大功率电器+空调整夜运行',
      aiEvidence: [
        { type: 'data', description: '夜间22:00-06:00功率超出日间均值30%' },
        { type: 'pattern', description: '功率波动模式匹配大功率电器使用特征' },
      ],
      impact: { extraEmission: 3.2, extraCost: 2560, affectedArea: '1号宿舍楼 全楼', affectedPeople: 1200 },
      suggestedActions: [
        { action: '加强宿舍用电管理', linkToModule: 'reduction' },
        { action: '转工单处理', linkToModule: 'l3' },
      ],
      status: 'acknowledged',
    },
    {
      id: 'anom-004',
      pattern: 'drift',
      patternLabel: '数据偏移',
      severity: 'normal',
      buildingId: 'b10',
      buildingName: '图书馆',
      deviceName: '智能电表#LIB-03',
      detectedAt: '2026-07-10T06:00:00Z',
      duration: '2天',
      aiConfidence: 0.65,
      aiRootCause: '图书馆电表读数出现系统性偏移，可能为传感器故障或校准漂移',
      aiEvidence: [
        { type: 'data', description: '电表读数较相邻表计偏高12%，但实际负荷无明显变化' },
        { type: 'pattern', description: '偏移量为恒定值，符合传感器漂移特征' },
      ],
      impact: { extraEmission: 0.3, extraCost: 240, affectedArea: '图书馆 全楼' },
      suggestedActions: [
        { action: '安排电表校准', linkToModule: 'l3' },
      ],
      status: 'new',
    },
    {
      id: 'anom-005',
      pattern: 'spike',
      patternLabel: '用电突增',
      severity: 'normal',
      buildingId: 'b08',
      buildingName: '能源学院楼',
      detectedAt: '2026-07-12T10:00:00Z',
      duration: '1h 30min',
      aiConfidence: 0.71,
      aiRootCause: '实验设备集中启动导致短时功率突增，属于正常实验活动',
      aiEvidence: [
        { type: 'calendar', description: '该时段有预约实验记录' },
        { type: 'data', description: '功率在1.5小时后恢复正常水平' },
      ],
      impact: { extraEmission: 0.5, extraCost: 400, affectedArea: '能源学院楼 实验室' },
      suggestedActions: [
        { action: '确认实验计划后忽略', linkToModule: 'reduction' },
      ],
      status: 'new',
    },
    {
      id: 'anom-006',
      pattern: 'idle_run',
      patternLabel: '空载运行',
      severity: 'info',
      buildingId: 'b11',
      buildingName: '行政办公楼',
      deviceName: '新风系统',
      detectedAt: '2026-07-12T12:00:00Z',
      duration: '30min',
      aiConfidence: 0.58,
      aiRootCause: '午休时段新风系统低效运行，可优化启停策略',
      aiEvidence: [
        { type: 'data', description: '午休时段CO2浓度低于阈值，新风需求低' },
      ],
      impact: { extraEmission: 0.1, extraCost: 80, affectedArea: '行政办公楼 1-3层' },
      suggestedActions: [
        { action: '优化新风系统午休策略', linkToModule: 'reduction' },
      ],
      status: 'new',
    },
  ];
}

export function getMockAnomalyTimeline(anomalyId: string): AnomalyTimelineEvent[] {
  const baseTime = new Date('2026-07-12T14:32:00Z');
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
      detail: '后勤值班人员确认异常属实，初步判断为空调系统问题',
    },
    {
      id: `tl-${anomalyId}-3`,
      anomalyId,
      timestamp: new Date(baseTime.getTime() - 1800000).toISOString(),
      phase: 'dispatched',
      phaseLabel: '已派单',
      actor: '系统自动',
      detail: '自动生成维修工单WO-2026-0712-003，指派至暖通维修组',
    },
    {
      id: `tl-${anomalyId}-4`,
      anomalyId,
      timestamp: baseTime.toISOString(),
      phase: 'processing',
      phaseLabel: '处理中',
      actor: '李师傅(暖通组)',
      detail: '维修人员到达现场，检查空调控制面板与定时设置',
    },
  ];
}

export function getMockNotifications(): AlertNotification[] {
  return [
    { id: 'notif-1', anomalyId: 'anom-001', title: '用电突增告警', message: '主教学楼中央空调机组#3 用电突增，超出基线240%', channel: 'in_app', sentAt: '2026-07-12T14:33:00Z', read: false, targetPerson: '张工' },
    { id: 'notif-2', anomalyId: 'anom-002', title: '空载运行告警', message: '信息学院楼实验室排风系统空载运行超过6小时', channel: 'in_app', sentAt: '2026-07-12T08:16:00Z', read: false, targetPerson: '张工' },
    { id: 'notif-3', anomalyId: 'anom-003', title: '超标排放告警', message: '1号宿舍楼夜间用电超限，已持续14小时', channel: 'in_app', sentAt: '2026-07-11T22:05:00Z', read: false, targetPerson: '王主管' },
    { id: 'notif-4', anomalyId: 'anom-001', title: '工单已派发', message: '工单WO-2026-0712-003已派发至暖通维修组', channel: 'in_app', sentAt: '2026-07-12T14:50:00Z', read: true, targetPerson: '张工' },
    { id: 'notif-5', anomalyId: 'anom-004', title: '数据偏移提醒', message: '图书馆电表#LIB-03出现系统性偏移，建议校准', channel: 'in_app', sentAt: '2026-07-10T06:30:00Z', read: true, targetPerson: '王主管' },
    { id: 'notif-6', anomalyId: 'anom-001', title: '短信通知', message: '【碳管理平台】主教学楼用电异常，请及时处理', channel: 'sms', sentAt: '2026-07-12T14:35:00Z', read: true, targetPerson: '张工' },
    { id: 'notif-7', anomalyId: 'anom-001', title: '邮件通知', message: '主教学楼用电异常详情报告已发送至您的邮箱', channel: 'email', sentAt: '2026-07-12T14:36:00Z', read: true, targetPerson: '张工' },
  ];
}

// ===== 模块3：减排路径优化 =====

export function getMockReductionBubbles(): ReductionBubble[] {
  const buildings = [
    { id: 'b01', name: '主教学楼', cat: 'teaching', area: 32000, issues: ['空调COP偏低', '照明功率密度超标'], reduction: 85 },
    { id: 'b02', name: '第一教学楼', cat: 'teaching', area: 26000, issues: ['空调定时不合理'], reduction: 62 },
    { id: 'b03', name: '第二教学楼', cat: 'teaching', area: 22000, issues: ['照明系统老旧'], reduction: 48 },
    { id: 'b04', name: '第三教学楼', cat: 'teaching', area: 19000, issues: ['围护结构保温差'], reduction: 55 },
    { id: 'b05', name: '信息学院楼', cat: 'lab', area: 24000, issues: ['实验室排风过量', '设备待机功耗高'], reduction: 72 },
    { id: 'b06', name: '机械学院楼', cat: 'lab', area: 24000, issues: ['空压机效率低'], reduction: 58 },
    { id: 'b07', name: '材料学院楼', cat: 'lab', area: 20000, issues: ['高温炉余热未回收'], reduction: 45 },
    { id: 'b08', name: '能源学院楼', cat: 'lab', area: 20000, issues: ['实验设备能效低'], reduction: 40 },
    { id: 'b09', name: '经管学院楼', cat: 'lab', area: 18000, issues: ['空调分区不合理'], reduction: 35 },
    { id: 'b10', name: '图书馆', cat: 'library', area: 40000, issues: ['照明时长超标', '空调覆盖过大'], reduction: 90 },
    { id: 'b11', name: '行政办公楼', cat: 'admin', area: 24000, issues: ['新风系统低效'], reduction: 30 },
    { id: 'b12', name: '大礼堂', cat: 'admin', area: 28000, issues: ['间歇使用能耗高'], reduction: 25 },
    { id: 'b13', name: '1号宿舍楼', cat: 'dorm', area: 15000, issues: ['夜间用电超限', '热水系统低效'], reduction: 55 },
    { id: 'b14', name: '2号宿舍楼', cat: 'dorm', area: 15000, issues: ['空调能效低'], reduction: 42 },
    { id: 'b15', name: '3号宿舍楼', cat: 'dorm', area: 15000, issues: ['照明常开'], reduction: 38 },
    { id: 'b16', name: '第一食堂', cat: 'canteen', area: 8000, issues: ['炊具能效低', '排烟系统能耗高'], reduction: 50 },
    { id: 'b17', name: '第二食堂', cat: 'canteen', area: 7000, issues: ['冷藏设备老旧'], reduction: 35 },
    { id: 'b18', name: '体育馆', cat: 'gym', area: 15000, issues: ['空调覆盖过大', '照明功率高'], reduction: 45 },
  ];

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
  { id: 'q5', category: 'accounting', question: '教学楼A的排放核算用了哪个因子？', icon: '🔢' },
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
    answer: '**DB11/T 1785-2020**《高等学校碳排放核算指南》主要变化：\n\n### 相比旧版的主要更新\n1. **核算范围扩大**：新增Scope 3（其他间接排放），包括**通勤、废弃物、采购**等\n2. **排放因子更新**：电力排放因子调整为 **0.5703 tCO₂/MWh**（2025年版）\n3. **数据质量要求**：新增数据质量评级体系（A/B/C/D四级）\n4. **报告模板统一**：采用新版标准化报告模板\n5. **MRV强化**：增加监测、报告、核查（MRV）全流程要求\n\n### 过渡安排\n- 2026年为过渡期，允许新旧标准并行\n- 2027年起全面执行新标准',
    sources: [
      { title: 'DB11/T 1785-2020 全文', type: 'standard', refId: 'DB11-1785' },
      { title: '北京市生态环境局关于执行新标准的通知', type: 'policy', refId: 'BJ-EE-2025-12' },
    ],
    confidence: 0.88,
  },
  '排放因子': {
    answer: '**教学楼A（主教学楼）**当前使用的排放因子如下：\n\n| 能源类型 | 排放因子 | 单位 | 来源 |\n|----------|----------|------|------|\n| 电力 | 0.5703 | tCO₂/MWh | DB11/T 1785-2020 |\n| 天然气 | 2.1622 | tCO₂/万Nm³ | 北京市2025年版 |\n| 热力 | 0.1100 | tCO₂/GJ | 北京市2025年版 |\n\n> 以上因子为2026年度有效版本，下次更新时间为2027年1月。',
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
