// ============================================================
// 能源管理三页面 — 完整 Mock 数据
// ============================================================

import type {
  EnergyOverview,
  BuildingEnergySnapshot,
  LoadCurvePoint,
  LoadCurveSeries,
  EnergyAlert,
  DeviceStatusPanel,
  DeviceItem,
  DiagnosisSummary,
  EnergyFlowSankey,
  BenchmarkComparison,
  AIRootCauseAnalysis,
  EnergySavingAdvice,
  MonthlyEnergySummary,
  CalendarHeatmapDay,
  EnergyProfile,
  DayDetail,
  TypicalDayComparison,
  SemesterComparison,
  TimeOfUseAdvice,
  ConversionFactors,
} from '@/types/energy';
import {
  addDays,
  addHours,
  deterministicNoise,
  formatCampusDateKey,
  getCampusDateAt,
  getCampusDateParts,
  getCampusLoadKw,
  getCampusMonthDays,
  minutesAgo,
  startOfCampusHour,
} from '@/lib/campus-realtime';
import {
  getCampusOperationalSnapshot,
  getSystemAnomalySnapshots,
  getSystemBuildingRanking,
  getSystemDeviceSnapshots,
  SYSTEM_BUILDINGS,
} from '@/data/campus-system-data';

// ============================================================
// 标煤折算 & 碳排放因子
// ============================================================
export const conversionFactors: ConversionFactors = {
  electricity: { coalEquivalent: 0.1229, carbonFactor: 0.5810 },
  water: { coalEquivalent: 0.0857, carbonFactor: 0.1680 },
  gas: { coalEquivalent: 1.2143, carbonFactor: 2.1622 },
  heat: { coalEquivalent: 0.0341, carbonFactor: 0.1100 },
  updatedAt: '2026-07-23T10:00:00',
};

// ============================================================
// 建筑基础信息
// ============================================================
const buildings: BuildingEnergySnapshot[] = SYSTEM_BUILDINGS.map((building) => ({
  buildingId: building.id,
  buildingName: building.name,
  buildingType: building.category === 'service' ? 'administrative' : building.category,
  currentPower: building.baselinePowerKw,
  todayCumulative: building.baselinePowerKw * 12,
  floorCount: building.floorCount,
  area: building.area,
  intensity: building.energyIntensity,
}));

// ============================================================
// 页面1：能源监控中心
// ============================================================

export function getEnergyOverview(now = new Date()): EnergyOverview[] {
  const parts = getCampusDateParts(now);
  const dayFraction = (parts.hour + parts.minute / 60) / 24;
  const monthFraction = (parts.day - 1 + dayFraction) / getCampusMonthDays(parts.year, parts.month);
  const yearFraction = (parts.month - 1 + monthFraction) / 12;
  const campus = getCampusOperationalSnapshot(now);
  const currentPower = getCampusLoadKw(now, 5);
  const buildingScale = currentPower / 2345.6;
  const currentBuildings = buildings.map((building) => ({
    ...building,
    currentPower: Math.round(building.currentPower * buildingScale * 10) / 10,
    todayCumulative: Math.round(building.todayCumulative * Math.max(dayFraction, 0.02) * 10) / 10,
  }));
  return [
    {
      energyType: 'electricity', campus: 'main_campus', timestamp: now.toISOString(),
      currentPower, todayCumulative: campus.todayElectricity, monthCumulative: Math.round(2_420_000 * monthFraction), yearCumulative: Math.round(28_600_000 * yearFraction),
      yoyChange: campus.yoy, momChange: 4.6, carbonIntensity: 0.48,
      byBuilding: currentBuildings,
    },
    {
      energyType: 'water', campus: 'main_campus', timestamp: now.toISOString(),
      currentPower: Math.round(currentPower * 0.019 * 10) / 10, todayCumulative: campus.todayWater, monthCumulative: Math.round(124_000 * monthFraction), yearCumulative: Math.round(1_420_000 * yearFraction),
      yoyChange: -5.1, momChange: 2.3, carbonIntensity: 0.06,
      byBuilding: currentBuildings.map(b => ({ ...b, currentPower: b.currentPower * 0.019, todayCumulative: b.todayCumulative * 0.019 })),
    },
    {
      energyType: 'gas', campus: 'main_campus', timestamp: now.toISOString(),
      currentPower: Math.round(currentPower * 0.0055 * 10) / 10, todayCumulative: campus.todayGas, monthCumulative: Math.round(51_000 * monthFraction), yearCumulative: Math.round(585_000 * yearFraction),
      yoyChange: -8.5, momChange: -12.3, carbonIntensity: 0.15,
      byBuilding: currentBuildings.map(b => ({ ...b, currentPower: b.currentPower * 0.0055, todayCumulative: b.todayCumulative * 0.0055 })),
    },
    {
      energyType: 'heat', campus: 'main_campus', timestamp: now.toISOString(),
      currentPower: campus.todayHeat > 0 ? Math.round(campus.todayHeat / Math.max(parts.hour, 1) * 10) / 10 : 0, todayCumulative: campus.todayHeat, monthCumulative: campus.todayHeat > 0 ? Math.round(42_000 * monthFraction) : 0, yearCumulative: Math.round(185_000 * yearFraction),
      yoyChange: -2.8, momChange: 0, carbonIntensity: 0,
      byBuilding: currentBuildings.map(b => ({ ...b, currentPower: 0, todayCumulative: 0 })),
    },
  ];
}

function generateHourlyCurve(multiplier = 1, anchor = new Date()): LoadCurvePoint[] {
  const end = startOfCampusHour(anchor);
  return Array.from({ length: 24 }, (_, index) => {
    const timestamp = addHours(end, index - 23);
    const val = getCampusLoadKw(timestamp, Math.round(multiplier * 100));
    return {
      timestamp: timestamp.toISOString(),
      electricity: val * multiplier,
      water: val * 0.018 * multiplier,
      gas: val * 0.004 * multiplier,
      heat: 0,
    };
  });
}

export function getLoadCurveSeries(now = new Date()): LoadCurveSeries[] {
  return [
    { buildingId: 'all', buildingName: '全校总计', color: '#3B82F6', data: generateHourlyCurve(1, now) },
    { buildingId: '10736', buildingName: '材料测试楼', color: '#F59E0B', data: generateHourlyCurve(0.11, now) },
    { buildingId: '10627', buildingName: '机电信息楼', color: '#10B981', data: generateHourlyCurve(0.10, now) },
    { buildingId: '10638', buildingName: '图书馆', color: '#EF4444', data: generateHourlyCurve(0.08, now) },
    { buildingId: '10651', buildingName: '1斋', color: '#8B5CF6', data: generateHourlyCurve(0.055, now) },
  ];
}

export function getEnergyAlerts(now = new Date()): EnergyAlert[] {
  const workOrderDate = formatCampusDateKey(now).replaceAll('-', '');
  return getSystemAnomalySnapshots(now).map((anomaly, index) => {
    const energyType = anomaly.unit.includes('m³')
      ? (anomaly.title.includes('燃气') ? 'gas' : 'water')
      : 'electricity';
    return {
      id: anomaly.id,
      alertTime: anomaly.detectedAt,
      category: anomaly.category,
      level: anomaly.severity,
      title: anomaly.title,
      description: anomaly.description,
      buildingId: anomaly.buildingId,
      buildingName: anomaly.buildingName,
      deviceName: anomaly.deviceName,
      energyType,
      metric: anomaly.metric,
      metricValue: anomaly.metricValue,
      threshold: anomaly.threshold,
      unit: anomaly.unit,
      status: anomaly.status,
      assignee: anomaly.assignee,
      resolvedTime: anomaly.status === 'resolved' ? minutesAgo(now, 92).toISOString() : undefined,
      workOrderId: anomaly.status === 'processing' ? `WO-${workOrderDate}-${String(index + 1).padStart(3, '0')}` : undefined,
    };
  });
}

export function getDeviceStatusPanel(now = new Date()): DeviceStatusPanel {
  const devices: DeviceItem[] = getSystemDeviceSnapshots(now).map((device) => ({
    deviceId: device.id,
    deviceName: device.name,
    deviceType: device.type,
    energyType: device.energyType,
    buildingId: device.buildingId,
    buildingName: device.buildingName,
    status: device.status,
    lastHeartbeat: device.lastHeartbeat,
    currentValue: device.currentValue,
    unit: device.unit,
    batteryLevel: device.batteryLevel,
  }));
  return {
    totalDevices: devices.length,
    onlineCount: devices.filter((device) => device.status === 'online').length,
    offlineCount: devices.filter((device) => device.status === 'offline').length,
    faultCount: devices.filter((device) => device.status === 'fault').length,
    maintenanceCount: devices.filter((device) => device.status === 'maintenance').length,
    devices,
  };
}

// ============================================================
// 页面2：能源诊断中心
// ============================================================

export function getDiagnosisSummary(): DiagnosisSummary {
  return {
    efficiencyScore: 71.8,
    overStandardBuildings: 9,
    totalOverStandard: 14.2,
    estimatedSavingPotential: {
      electricity: 425000,
      water: 18500,
      gas: 4200,
      heat: 1250,
      totalCostSaving: 523000,
      totalCarbonSaving: 312,
    },
  };
}

export function getEnergyFlowSankey(now = new Date()): EnergyFlowSankey {
  const { year, month } = getCampusDateParts(now);
  return {
    period: `${year}年${month}月`,
    nodes: [
      { id: 'src-elec', name: '外购电力', category: 'source', energyType: 'electricity', value: 3546 },
      { id: 'src-gas', name: '天然气', category: 'source', energyType: 'gas', value: 2356 },
      { id: 'src-heat', name: '市政热力', category: 'source', energyType: 'heat', value: 629 },
      { id: 'src-water', name: '市政供水', category: 'source', energyType: 'water', value: 585 },
      { id: 'src-solar', name: '光伏发电', category: 'source', energyType: 'electricity', value: 89 },
      { id: 'conv-boiler', name: '锅炉转换', category: 'conversion', energyType: 'gas', value: 1987 },
      { id: 'conv-chiller', name: '制冷转换', category: 'conversion', energyType: 'electricity', value: 1420 },
      { id: 'conv-trans', name: '变配电', category: 'conversion', energyType: 'electricity', value: 3457 },
      { id: 'end-ac', name: '空调系统', category: 'enduse', energyType: 'electricity', value: 1850 },
      { id: 'end-light', name: '照明系统', category: 'enduse', energyType: 'electricity', value: 820 },
      { id: 'end-equip', name: '动力设备', category: 'enduse', energyType: 'electricity', value: 650 },
      { id: 'end-heat', name: '供暖系统', category: 'enduse', energyType: 'heat', value: 1987 },
      { id: 'end-water', name: '给排水', category: 'enduse', energyType: 'water', value: 585 },
      { id: 'end-other', name: '其他用电', category: 'enduse', energyType: 'electricity', value: 226 },
      { id: 'loss-trans', name: '输配损耗', category: 'loss', energyType: 'electricity', value: 178 },
      { id: 'loss-heat', name: '热力损耗', category: 'loss', energyType: 'heat', value: 145 },
      { id: 'loss-water', name: '管网漏损', category: 'loss', energyType: 'water', value: 52 },
    ],
    links: [
      { source: 'src-elec', target: 'conv-trans', value: 3546, energyType: 'electricity' },
      { source: 'src-solar', target: 'conv-trans', value: 89, energyType: 'electricity' },
      { source: 'src-gas', target: 'conv-boiler', value: 1987, energyType: 'gas' },
      { source: 'src-gas', target: 'end-other', value: 369, energyType: 'gas' },
      { source: 'src-heat', target: 'end-heat', value: 629, energyType: 'heat' },
      { source: 'src-water', target: 'end-water', value: 585, energyType: 'water' },
      { source: 'conv-trans', target: 'conv-chiller', value: 1420, energyType: 'electricity' },
      { source: 'conv-trans', target: 'end-ac', value: 430, energyType: 'electricity' },
      { source: 'conv-trans', target: 'end-light', value: 820, energyType: 'electricity' },
      { source: 'conv-trans', target: 'end-equip', value: 650, energyType: 'electricity' },
      { source: 'conv-trans', target: 'end-other', value: 137, energyType: 'electricity' },
      { source: 'conv-trans', target: 'loss-trans', value: 178, energyType: 'electricity', lossRate: 4.9 },
      { source: 'conv-boiler', target: 'end-heat', value: 1842, energyType: 'gas' },
      { source: 'conv-boiler', target: 'loss-heat', value: 145, energyType: 'gas', lossRate: 7.3 },
      { source: 'conv-chiller', target: 'end-ac', value: 1420, energyType: 'electricity' },
      { source: 'end-water', target: 'loss-water', value: 52, energyType: 'water', lossRate: 8.9 },
    ],
    totalInput: 7205,
    totalLoss: 375,
    overallEfficiency: 94.8,
  };
}

export function getBenchmarkComparison(): BenchmarkComparison[] {
  return [
    {
      buildingType: 'teaching', buildingTypeName: '教学楼',
      buildings: [
        { buildingId: '10621', buildingName: '主楼', intensity: 15.2, perCapita: 0.42, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10637', buildingName: '教学楼', intensity: 14.8, perCapita: 0.41, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10896', buildingName: '理学楼', intensity: 15.0, perCapita: 0.42, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10640', buildingName: '外语楼', intensity: 17.2, perCapita: 0.48, isOverStandard: true, overStandardPercent: 7.5 },
        { buildingId: '10631', buildingName: '经济管理楼', intensity: 13.9, perCapita: 0.38, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '引导值', value: 12, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 16, color: '#F59E0B', lineStyle: 'solid' },
        { name: '北京市平均', value: 14.5, color: '#3B82F6', lineStyle: 'dashed' },
      ],
    },
    {
      buildingType: 'dormitory', buildingTypeName: '宿舍楼',
      buildings: [
        { buildingId: '10651', buildingName: '1斋', intensity: 16.8, perCapita: 0.47, isOverStandard: true, overStandardPercent: 12.0 },
        { buildingId: '10650', buildingName: '2斋', intensity: 13.8, perCapita: 0.38, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10652', buildingName: '3斋', intensity: 14.2, perCapita: 0.39, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10661', buildingName: '12斋', intensity: 15.7, perCapita: 0.44, isOverStandard: true, overStandardPercent: 4.7 },
        { buildingId: '10659', buildingName: '11斋', intensity: 13.5, perCapita: 0.38, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '引导值', value: 11, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 15, color: '#F59E0B', lineStyle: 'solid' },
      ],
    },
    {
      buildingType: 'laboratory', buildingTypeName: '实验楼',
      buildings: [
        { buildingId: '10736', buildingName: '材料测试楼', intensity: 32.5, perCapita: 0.90, isOverStandard: true, overStandardPercent: 30 },
        { buildingId: '10733', buildingName: '化生楼', intensity: 25.1, perCapita: 0.70, isOverStandard: true, overStandardPercent: 0.4 },
        { buildingId: '10627', buildingName: '机电信息楼', intensity: 28.7, perCapita: 0.80, isOverStandard: true, overStandardPercent: 14.8 },
        { buildingId: '10636', buildingName: '实验楼', intensity: 26.8, perCapita: 0.74, isOverStandard: true, overStandardPercent: 7.2 },
      ],
      benchmarks: [
        { name: '引导值', value: 20, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 25, color: '#F59E0B', lineStyle: 'solid' },
      ],
    },
    {
      buildingType: 'canteen', buildingTypeName: '餐饮服务',
      buildings: [
        { buildingId: '10742', buildingName: '学生活动中心', intensity: 48.5, perCapita: 1.35, isOverStandard: true, overStandardPercent: 21.3 },
        { buildingId: '10641', buildingName: '综合楼', intensity: 38.1, perCapita: 1.06, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: '10639', buildingName: '校史馆', intensity: 31.3, perCapita: 0.87, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '引导值', value: 35, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 40, color: '#F59E0B', lineStyle: 'solid' },
      ],
    },
  ];
}

export function getAIRootCauseAnalysis(): AIRootCauseAnalysis {
  return {
    anomalyId: 'ANOM-002',
    anomalyDescription: '材料测试楼用电负荷较同类实验楼基线高14.8%，且2号变压器出现温升异常',
    rootCauses: [
      {
        id: 'rc-001', cause: '新增实验设备导致基础负荷上升', probability: 0.72, impactLevel: 'high',
        evidence: ['本月新增3台高温炉（总功率45kW）', '设备运行日志显示日均运行12小时'],
        suggestedAction: '评估设备能效等级，考虑错峰运行方案',
        estimatedSaving: 28000, savingUnit: 'kWh/月',
      },
      {
        id: 'rc-002', cause: '空调系统制冷效率下降', probability: 0.58, impactLevel: 'medium',
        evidence: ['COP从3.8降至3.1', '冷凝器进出水温差缩小'],
        suggestedAction: '安排空调系统清洗维护，检查制冷剂充注量',
        estimatedSaving: 15000, savingUnit: 'kWh/月',
      },
      {
        id: 'rc-003', cause: '夜间待机能耗管理不到位', probability: 0.45, impactLevel: 'low',
        evidence: ['凌晨2:00-5:00仍有约15kW基础负荷', '部分实验室通宵运行'],
        suggestedAction: '制定实验室夜间用电管理制度',
        estimatedSaving: 5000, savingUnit: 'kWh/月',
      },
    ],
    confidence: 0.85,
    dataEvidence: [
      { type: 'chart', title: '材料测试楼逐时负荷对比', description: '本月 vs 上月逐时负荷曲线对比', data: {} },
      { type: 'metric', title: '关键指标变化', description: '月用电量: +18.5%, 最大负荷: +12.3%, 负荷率: -5.2%', data: {} },
    ],
  };
}

export function getEnergySavingAdvices(): EnergySavingAdvice[] {
  return [
    { id: 'adv-001', category: 'equipment', title: '变压器负载治理', description: '材料测试楼2号变压器温升异常，建议先平衡三相负载并检修散热风机，再评估更换高效变压器', priority: 'high', targetBuilding: '材料测试楼', targetEnergyType: 'electricity', estimatedSaving: 45000, savingUnit: 'kWh/年', estimatedCostSaving: 36000, paybackMonths: 18, implementationDifficulty: 'hard', status: 'suggested' },
    { id: 'adv-002', category: 'schedule', title: '优化空调运行时段', description: '将图书馆空调提前1小时降低功率运行，利用建筑热惰性维持舒适度', priority: 'medium', targetBuilding: '图书馆', targetEnergyType: 'electricity', estimatedSaving: 22000, savingUnit: 'kWh/年', estimatedCostSaving: 17600, paybackMonths: 0, implementationDifficulty: 'easy', status: 'suggested' },
    { id: 'adv-003', category: 'behavior', title: '宿舍夜间用能管理', description: '在1斋和3斋建立夜间用水、照明分区基线，异常后自动推送楼管复核', priority: 'medium', targetBuilding: '1斋、3斋', targetEnergyType: 'electricity', estimatedSaving: 18000, savingUnit: 'kWh/年', estimatedCostSaving: 14400, paybackMonths: 6, implementationDifficulty: 'easy', status: 'accepted' },
    { id: 'adv-004', category: 'retrofit', title: '餐饮灶具节能改造', description: '更换学生活动中心餐饮区蒸箱门封并校准灶具风气比，预计节气16%', priority: 'high', targetBuilding: '学生活动中心', targetEnergyType: 'gas', estimatedSaving: 8500, savingUnit: 'm³/年', estimatedCostSaving: 34000, paybackMonths: 12, implementationDifficulty: 'medium', status: 'suggested' },
    { id: 'adv-005', category: 'equipment', title: '冷水机组换热治理', description: '体育馆冷凝器清洗并优化冷却塔补水控制，将COP恢复至4.2以上', priority: 'medium', targetBuilding: '体育馆', targetEnergyType: 'electricity', estimatedSaving: 12000, savingUnit: 'kWh/年', estimatedCostSaving: 9600, paybackMonths: 15, implementationDifficulty: 'medium', status: 'in_progress' },
    { id: 'adv-006', category: 'behavior', title: '实验室设备待机管理', description: '对材料测试楼与机电信息楼制定实验设备关机检查清单，减少非必要待机能耗', priority: 'low', targetBuilding: '材料测试楼、机电信息楼', targetEnergyType: 'electricity', estimatedSaving: 8000, savingUnit: 'kWh/年', estimatedCostSaving: 6400, paybackMonths: 0, implementationDifficulty: 'easy', status: 'suggested' },
    { id: 'adv-007', category: 'retrofit', title: '光伏扩容', description: '在图书馆屋顶新增200kW光伏板，预计年发电22万kWh', priority: 'high', targetBuilding: '图书馆', targetEnergyType: 'electricity', estimatedSaving: 220000, savingUnit: 'kWh/年', estimatedCostSaving: 176000, paybackMonths: 48, implementationDifficulty: 'hard', status: 'suggested' },
    { id: 'adv-008', category: 'schedule', title: '错峰用电方案', description: '将高能耗实验设备运行时段调整至谷电时段（23:00-7:00）', priority: 'medium', targetBuilding: '材料测试楼', targetEnergyType: 'electricity', estimatedSaving: 0, savingUnit: 'kWh/年', estimatedCostSaving: 25000, paybackMonths: 0, implementationDifficulty: 'medium', status: 'suggested' },
  ];
}

// ============================================================
// 页面3：用能日历
// ============================================================

export function getMonthlyEnergySummary(now = new Date()): MonthlyEnergySummary {
  const parts = getCampusDateParts(now);
  const monthPrefix = `${parts.year}-${String(parts.month).padStart(2, '0')}`;
  const days = getCalendarHeatmapDays(now).filter((day) => day.date.startsWith(monthPrefix));
  return {
    month: monthPrefix,
    totalUsage: {
      electricity: Math.round(days.reduce((sum, day) => sum + day.electricity, 0)),
      water: Math.round(days.reduce((sum, day) => sum + day.water, 0)),
      gas: Math.round(days.reduce((sum, day) => sum + day.gas, 0)),
      heat: Math.round(days.reduce((sum, day) => sum + day.heat, 0)),
      totalTce: Math.round(days.reduce((sum, day) => sum + day.totalTce, 0) * 100) / 100,
    },
    abnormalDays: days.filter((day) => day.isAbnormal).length,
    savingComplianceDays: days.filter((day) => day.level === 'low' || day.level === 'normal').length,
    totalDays: getCampusMonthDays(parts.year, parts.month),
  };
}

export function getCalendarHeatmapDays(now = new Date()): CalendarHeatmapDay[] {
  const parts = getCampusDateParts(now);
  const days: CalendarHeatmapDay[] = [];
  const baseTce = 2.4;
  for (let month = 1; month <= parts.month; month++) {
    const lastDay = month === parts.month ? parts.day : getCampusMonthDays(parts.year, month);
    for (let day = 1; day <= lastDay; day++) {
      const anchor = getCampusDateAt(parts.year, month, day, 12);
      const dayParts = getCampusDateParts(anchor);
      const isWeekend = dayParts.weekday === 0 || dayParts.weekday === 6;
      const seasonalFactor = [6, 7, 8, 9].includes(month) ? 1.13 : [11, 12, 1, 2].includes(month) ? 1.08 : 0.94;
      const noise = deterministicNoise(anchor.getTime(), 7) * 0.28;
      const elapsedFraction = month === parts.month && day === parts.day
        ? Math.max(0.02, (parts.hour + parts.minute / 60) / 24)
        : 1;
      const rawTce = (isWeekend ? baseTce * 0.68 : baseTce) * seasonalFactor + noise;
      const tce = Math.max(0.05, rawTce * elapsedFraction);
      const anomalySignal = deterministicNoise(anchor.getTime(), 19);
      const isAbnormal = elapsedFraction === 1 && anomalySignal > 0.76;
      const alertCount = isAbnormal ? 1 + Math.floor(Math.abs(anomalySignal) * 3) : 0;
      days.push({
        date: formatCampusDateKey(anchor),
        totalTce: Math.round(tce * 100) / 100,
        electricity: Math.round(tce * 7500),
        water: Math.round(tce * 145),
        gas: Math.round(tce * 41),
        heat: [11, 12, 1, 2].includes(month) ? Math.round(tce * 22) : 0,
        intensity: Math.round(tce * 100 / 2.4) / 100,
        level: isAbnormal ? 'abnormal_high' : isWeekend ? 'weekend' : rawTce > 2.6 ? 'high' : rawTce < 2.2 ? 'low' : 'normal',
        isAbnormal,
        hasAlert: isAbnormal,
        alertCount,
      });
    }
  }
  return days;
}

export function getEnergyProfile(now = new Date()): EnergyProfile {
  const workdayPattern = generateHourlyCurve(1, now);
  const weekendPattern = generateHourlyCurve(0.65, now);
  const holidayPattern = generateHourlyCurve(0.35, now);
  return {
    workdayPattern, weekendPattern, holidayPattern,
    seasonalPattern: [
      { season: 'spring', avgDaily: 2.15, peakDemand: 2850, dominantEnergy: 'electricity' },
      { season: 'summer', avgDaily: 2.48, peakDemand: 3420, dominantEnergy: 'electricity' },
      { season: 'autumn', avgDaily: 2.08, peakDemand: 2650, dominantEnergy: 'electricity' },
      { season: 'winter', avgDaily: 2.92, peakDemand: 3850, dominantEnergy: 'gas' },
    ],
    peakHours: ['09:00-11:00', '14:00-16:00'],
    valleyHours: ['00:00-06:00', '22:00-24:00'],
    peakValleyRatio: 2.85,
  };
}

export function getDayDetail(date: string): DayDetail {
  const [year, month, day] = date.split('-').map(Number);
  const anchor = getCampusDateAt(year, month, day, 23);
  const curve = generateHourlyCurve(1, anchor);
  return {
    date,
    hourlyCurve: curve,
    peakValleyAnalysis: {
      peakHours: [{ start: '09:00', end: '11:00', duration: 2, consumption: 2450 }, { start: '14:00', end: '16:00', duration: 2, consumption: 2380 }],
      valleyHours: [{ start: '00:00', end: '06:00', duration: 6, consumption: 4200 }, { start: '22:00', end: '24:00', duration: 2, consumption: 1350 }],
      flatHours: [{ start: '06:00', end: '09:00', duration: 3, consumption: 2100 }, { start: '11:00', end: '14:00', duration: 3, consumption: 2150 }, { start: '16:00', end: '22:00', duration: 6, consumption: 4680 }],
      peakRatio: 28.5, valleyRatio: 32.8, flatRatio: 38.7,
    },
    hourlyBreakdown: curve.map((p, i) => ({
      period: `${String(i).padStart(2, '0')}:00-${String(i + 1).padStart(2, '0')}:00`,
      electricity: p.electricity, water: p.water, gas: p.gas, heat: p.heat,
      total: p.electricity + p.water * 10 + p.gas * 30,
      percentage: 100 / 24,
    })),
  };
}

export function getTypicalDayComparison(now = new Date()): TypicalDayComparison {
  const parts = getCampusDateParts(now);
  const lastMonthDay = Math.min(parts.day, getCampusMonthDays(parts.month === 1 ? parts.year - 1 : parts.year, parts.month === 1 ? 12 : parts.month - 1));
  const lastMonth = getCampusDateAt(parts.month === 1 ? parts.year - 1 : parts.year, parts.month === 1 ? 12 : parts.month - 1, lastMonthDay, parts.hour, parts.minute);
  const yesterday = addDays(now, -1);
  const lastWeek = addDays(now, -7);
  return {
    days: [
      { label: '今日', date: formatCampusDateKey(now), energyType: 'electricity', data: generateHourlyCurve(1, now) },
      { label: '昨日', date: formatCampusDateKey(yesterday), energyType: 'electricity', data: generateHourlyCurve(0.95, yesterday) },
      { label: '上周同期', date: formatCampusDateKey(lastWeek), energyType: 'electricity', data: generateHourlyCurve(0.88, lastWeek) },
      { label: '上月同期', date: formatCampusDateKey(lastMonth), energyType: 'electricity', data: generateHourlyCurve(0.72, lastMonth) },
    ],
  };
}

export function getSemesterComparison(): SemesterComparison {
  return {
    semesters: [
      { name: '2025-2026春季学期', startDate: '2026-02-15', endDate: '2026-07-10', totalTce: 2145, avgDailyTce: 14.6, electricity: 16520000, water: 318000, gas: 90500, heat: 52000, peakDemandDay: '2026-06-22', peakDemandValue: 3850 },
      { name: '2025-2026秋季学期', startDate: '2025-09-01', endDate: '2026-01-15', totalTce: 2350, avgDailyTce: 17.2, electricity: 18200000, water: 345000, gas: 128000, heat: 185000, peakDemandDay: '2025-12-28', peakDemandValue: 4250 },
      { name: '2024-2025春季学期', startDate: '2025-02-15', endDate: '2025-07-10', totalTce: 2080, avgDailyTce: 14.2, electricity: 16050000, water: 310000, gas: 88000, heat: 48000, peakDemandDay: '2025-06-20', peakDemandValue: 3720 },
    ],
  };
}

export function getTimeOfUseAdvices(): TimeOfUseAdvice[] {
  return [
    { id: 'tou-001', timePeriod: '09:00-11:00', periodType: 'peak', advice: '将非必要实验设备运行调整至平段或谷段', targetEnergyType: 'electricity', estimatedSaving: 12000, savingUnit: 'kWh/月', priority: 'high' },
    { id: 'tou-002', timePeriod: '14:00-16:00', periodType: 'peak', advice: '空调设定温度上调1°C，减少制冷负荷', targetEnergyType: 'electricity', estimatedSaving: 8500, savingUnit: 'kWh/月', priority: 'medium' },
    { id: 'tou-003', timePeriod: '00:00-06:00', periodType: 'valley', advice: '充分利用谷电时段运行高能耗设备（高温炉、充电桩等）', targetEnergyType: 'electricity', estimatedSaving: 0, savingUnit: 'kWh/月', priority: 'medium' },
    { id: 'tou-004', timePeriod: '06:00-09:00', periodType: 'flat', advice: '食堂早餐时段优化排风系统运行策略', targetEnergyType: 'electricity', estimatedSaving: 3200, savingUnit: 'kWh/月', priority: 'low' },
  ];
}
