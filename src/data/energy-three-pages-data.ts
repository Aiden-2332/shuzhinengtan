// ============================================================
// 能源管理三页面 — 完整 Mock 数据
// ============================================================
import type {
  EnergyType, CampusId, AlertLevel, AlertCategory, AlertStatus,
  DeviceStatus, BuildingType, EnergyOverview, BuildingEnergySnapshot,
  LoadCurvePoint, LoadCurveSeries, EnergyAlert, DeviceStatusPanel,
  DeviceItem, DiagnosisSummary, SankeyNode, SankeyLink, EnergyFlowSankey,
  BenchmarkComparison, BenchmarkBuildingItem, BenchmarkLine,
  AIRootCauseAnalysis, RootCauseItem, EvidenceItem, EnergySavingAdvice,
  TrendSeries, EnergyTrendComparison, MonthlyEnergySummary,
  CalendarHeatmapDay, EnergyProfile, SeasonalData, DayDetail,
  PeakValleyResult, HourlyBreakdown, TypicalDayComparison,
  SemesterComparison, TimeOfUseAdvice, ConversionFactors
} from '@/types/energy';

// ============================================================
// 全局常量 & 折算因子
// ============================================================

export const CONVERSION_FACTORS: ConversionFactors = {
  electricity: { coalEquivalent: 0.1229, carbonFactor: 0.5839 },
  water: { coalEquivalent: 0.0002571, carbonFactor: 0.00091 },
  gas: { coalEquivalent: 1.2143, carbonFactor: 2.1622 },
  heat: { coalEquivalent: 0.03412, carbonFactor: 0.11 },
  updatedAt: '2026-01-15',
};

export const ENERGY_TYPE_LABELS: Record<EnergyType, string> = {
  electricity: '电力',
  water: '水',
  gas: '天然气',
  heat: '热力',
};

export const CAMPUS_LABELS: Record<CampusId, string> = {
  main_campus: '主校区',
  east_campus: '东校区',
  south_campus: '南校区',
};

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  teaching: '教学楼',
  dormitory: '宿舍楼',
  laboratory: '实验楼',
  library: '图书馆',
  administrative: '行政楼',
  canteen: '食堂',
};

export const ALERT_LEVEL_CONFIG: Record<AlertLevel, { label: string; color: string; bgColor: string }> = {
  info: { label: '提示', color: '#06B6D4', bgColor: '#06B6D420' },
  warning: { label: '警告', color: '#F59E0B', bgColor: '#F59E0B20' },
  critical: { label: '严重', color: '#EF4444', bgColor: '#EF444420' },
  emergency: { label: '紧急', color: '#DC2626', bgColor: '#DC262630' },
};

export const ALERT_CATEGORY_CONFIG: Record<AlertCategory, { label: string; icon: string }> = {
  energy: { label: '能源异常', icon: '⚡' },
  device: { label: '设备异常', icon: '🔧' },
  environment: { label: '环境异常', icon: '🌡️' },
  data: { label: '数据异常', icon: '📡' },
};

// ============================================================
// 页面1：能源监控中心 — Mock 数据
// ============================================================

function generateHourlyPoints(base: number, variance: number, peakHours: number[], count: number): LoadCurvePoint[] {
  const points: LoadCurvePoint[] = [];
  for (let i = 0; i < count; i++) {
    const hour = i % 24;
    const isPeak = peakHours.includes(hour);
    const factor = isPeak ? 1.4 : (hour >= 22 || hour <= 5 ? 0.35 : 0.85);
    const noise = (Math.sin(i * 0.7) * 0.08 + Math.cos(i * 1.3) * 0.05);
    const val = base * factor * (1 + noise) * (1 + variance * ((i % 17 - 8) / 100));
    points.push({
      timestamp: `${String(Math.floor(i / 24)).padStart(2, '0')}:${String(hour).padStart(2, '0')}:00`,
      electricity: Math.round(val * 10) / 10,
      water: Math.round(val * 0.15 * 10) / 10,
      gas: Math.round(val * 0.05 * 100) / 100,
      heat: Math.round(val * 0.02 * 100) / 100,
    });
  }
  return points;
}

const PEAK_HOURS = [9, 10, 11, 14, 15, 16, 19, 20];

export function getEnergyOverview(): EnergyOverview {
  return {
    energyType: 'electricity',
    campus: 'main_campus',
    timestamp: new Date().toISOString(),
    currentPower: 4826,
    todayCumulative: 38420,
    monthCumulative: 1152600,
    yearCumulative: 13831200,
    yoyChange: -3.2,
    momChange: 1.8,
    carbonIntensity: 0.42,
    byBuilding: [
      { buildingId: 'b01', buildingName: '教学楼A', buildingType: 'teaching', currentPower: 520, todayCumulative: 4160, floorCount: 6, area: 12000, intensity: 0.35 },
      { buildingId: 'b04', buildingName: '实验楼A', buildingType: 'laboratory', currentPower: 680, todayCumulative: 5440, floorCount: 8, area: 15000, intensity: 0.45 },
      { buildingId: 'b07', buildingName: '图书馆', buildingType: 'library', currentPower: 380, todayCumulative: 3040, floorCount: 5, area: 20000, intensity: 0.19 },
      { buildingId: 'b09', buildingName: '学生宿舍1', buildingType: 'dormitory', currentPower: 290, todayCumulative: 2320, floorCount: 6, area: 8000, intensity: 0.36 },
      { buildingId: 'b13', buildingName: '食堂', buildingType: 'canteen', currentPower: 450, todayCumulative: 3600, floorCount: 3, area: 5000, intensity: 0.90 },
      { buildingId: 'b18', buildingName: '体育馆', buildingType: 'teaching', currentPower: 180, todayCumulative: 1440, floorCount: 3, area: 8000, intensity: 0.23 },
    ],
  };
}

export function getLoadCurveData(buildingId?: string): LoadCurveSeries[] {
  if (!buildingId) {
    return [
      { buildingId: 'all', buildingName: '全校总负荷', color: '#0099FF', data: generateHourlyPoints(4800, 0.3, PEAK_HOURS, 72) },
    ];
  }
  return [
    { buildingId, buildingName: `建筑${buildingId}`, color: '#0099FF', data: generateHourlyPoints(500, 0.25, PEAK_HOURS, 72) },
  ];
}

export function getEnergyAlerts(category?: AlertCategory): EnergyAlert[] {
  const allAlerts: EnergyAlert[] = [
    { id: 'a001', alertTime: '2026-07-23T14:32:00', category: 'energy', level: 'critical', title: '实验楼A用电突增异常', description: '当前功率较昨日同期高出45%，疑似空调系统故障或新增大功率设备', buildingId: 'b04', buildingName: '实验楼A', deviceName: '主配电柜', energyType: 'electricity', metric: '实时功率', metricValue: 1240, threshold: 850, unit: 'kW', status: 'pending', assignee: '张工' },
    { id: 'a002', alertTime: '2026-07-23T13:15:00', category: 'device', level: 'warning', title: '食堂燃气表通讯中断', description: '燃气计量仪表连续30分钟无数据上报，请检查现场设备状态', buildingId: 'b13', buildingName: '食堂', deviceName: '燃气流量计', energyType: 'gas', metric: '心跳间隔', metricValue: 3600, threshold: 300, unit: 's', status: 'acknowledged', assignee: '李工' },
    { id: 'a003', alertTime: '2026-07-23T12:40:00', category: 'environment', level: 'warning', title: '图书馆温度超标', description: '室内温度持续高于28°C超过2小时，建议检查空调运行参数', buildingId: 'b07', buildingName: '图书馆', energyType: 'heat', metric: '室内温度', metricValue: 29.2, threshold: 27, unit: '°C', status: 'processing', assignee: '王工' },
    { id: 'a004', alertTime: '2026-07-23T11:20:00', category: 'data', level: 'info', title: '宿舍区部分水表数据延迟', description: '学生宿舍3#、4#共12个采集点数据延迟超过5分钟', buildingId: 'b11', buildingName: '学生宿舍3', energyType: 'water', metric: '数据延迟', metricValue: 320, threshold: 300, unit: 's', status: 'resolved', resolvedTime: '2026-07-23T11:35:00' },
    { id: 'a005', alertTime: '2026-07-23T10:50:00', category: 'energy', level: 'warning', title: '教学楼A夜间用水异常', description: '凌晨2:00-4:00期间用水量超出正常值3倍，可能存在管道泄漏', buildingId: 'b01', buildingName: '教学楼A', energyType: 'water', metric: '小时用水量', metricValue: 85, threshold: 25, unit: 'm³/h', status: 'pending', workOrderId: 'WO-2026072301' },
    { id: 'a006', alertTime: '2026-07-23T09:30:00', category: 'device', level: 'critical', title: '体育馆照明回路跳闸', description: '主馆照明C相断路器跳闸，影响约40%照明区域', buildingId: 'b18', buildingName: '体育馆', deviceName: '照明配电箱', energyType: 'electricity', metric: '电流', metricValue: 0, threshold: 80, unit: 'A', status: 'processing', assignee: '赵工' },
    { id: 'a007', alertTime: '2026-07-23T08:15:00', category: 'environment', level: 'critical', title: '实验室CO₂浓度超限', description: '化学实验楼A区CO₂浓度达到1200ppm，已触发通风系统联动', buildingId: 'b04', buildingName: '实验楼A', energyType: 'electricity', metric: 'CO₂浓度', metricValue: 1200, threshold: 1000, unit: 'ppm', status: 'resolved', resolvedTime: '2026-07-23T08:45:00' },
    { id: 'a008', alertTime: '2026-07-22T22:10:00', category: 'energy', level: 'info', title: '行政楼夜间待机能耗偏高', description: '非工作时间仍有约120kW待机负载，建议排查未关闭的办公设备', buildingId: 'b21', buildingName: '行政办公楼', energyType: 'electricity', metric: '夜间基载', metricValue: 120, threshold: 50, unit: 'kW', status: 'pending' },
  ];
  return category ? allAlerts.filter(a => a.category === category) : allAlerts;
}

export function getDeviceStatusData(): DeviceStatusPanel {
  return {
    totalDevices: 156,
    onlineCount: 147,
    offlineCount: 5,
    faultCount: 3,
    maintenanceCount: 1,
    devices: [
      { deviceId: 'dev001', deviceName: '教学楼A主电表', deviceType: '智能电表', energyType: 'electricity', buildingId: 'b01', buildingName: '教学楼A', status: 'online', lastHeartbeat: '2026-07-23T14:55:00', currentValue: 520, unit: 'kW' },
      { deviceId: 'dev002', deviceName: '实验楼A主电表', deviceType: '智能电表', energyType: 'electricity', buildingId: 'b04', buildingName: '实验楼A', status: 'online', lastHeartbeat: '2026-07-23T14:54:30', currentValue: 1240, unit: 'kW' },
      { deviceId: 'dev003', deviceName: '图书馆主电表', deviceType: '智能电表', energyType: 'electricity', buildingId: 'b07', buildingName: '图书馆', status: 'online', lastHeartbeat: '2026-07-23T14:53:00', currentValue: 380, unit: 'kW' },
      { deviceId: 'dev004', deviceName: '食堂燃气表', deviceType: '气体流量计', energyType: 'gas', buildingId: 'b13', buildingName: '食堂', status: 'fault', lastHeartbeat: '2026-07-23T13:15:00', currentValue: 0, unit: 'm³/h' },
      { deviceId: 'dev005', deviceName: '宿舍1冷水表', deviceType: '超声波水表', energyType: 'water', buildingId: 'b09', buildingName: '学生宿舍1', status: 'offline', lastHeartbeat: '2026-07-23T13:20:00', currentValue: 0, unit: 'm³/h' },
      { deviceId: 'dev006', deviceName: '体育馆照明控制器', deviceType: '智能照明控制', energyType: 'electricity', buildingId: 'b18', buildingName: '体育馆', status: 'maintenance', lastHeartbeat: '2026-07-23T09:30:00', currentValue: 0, unit: 'kW' },
      { deviceId: 'dev007', deviceName: '热力站出口热量表', deviceType: '超声波热量表', energyType: 'heat', buildingId: 'b25', buildingName: '热力站', status: 'online', lastHeartbeat: '2026-07-23T14:56:00', currentValue: 2.8, unit: 'GJ/h' },
      { deviceId: 'dev008', deviceName: '光伏逆变器#1', deviceType: '光伏并网逆变', energyType: 'electricity', buildingId: 'b29', buildingName: '光伏房', status: 'online', lastHeartbeat: '2026-07-23T14:57:00', currentValue: 86, unit: 'kW' },
    ],
  };
}

// ============================================================
// 页面2：能源诊断中心 — Mock 数据
// ============================================================

export function getDiagnosisSummary(): DiagnosisSummary {
  return {
    efficiencyScore: 78,
    overStandardBuildings: 6,
    totalOverStandard: 20.7,
    estimatedSavingPotential: {
      electricity: 125600,
      water: 18500,
      gas: 3200,
      heat: 850,
      totalCostSaving: 892000,
      totalCarbonSaving: 168.5,
    },
  };
}

export function getSankeyFlowData(): EnergyFlowSankey {
  return {
    period: '2026年7月',
    nodes: [
      // 能源来源层
      { id: 'grid', name: '外购电力', category: 'source', energyType: 'electricity', value: 13831 },
      { id: 'gas_in', name: '天然气输入', category: 'source', energyType: 'gas', value: 1820 },
      { id: 'solar', name: '光伏发电', category: 'source', energyType: 'electricity', value: 245 },
      { id: 'heat_input', name: '市政供热', category: 'source', energyType: 'heat', value: 680 },

      // 转换层
      { id: 'boiler', name: '锅炉房', category: 'conversion', energyType: 'gas', value: 1650 },
      { id: 'chiller', name: '冷站', category: 'conversion', energyType: 'electricity', value: 2800 },
      { id: 'transformer', name: '变压器损耗', category: 'loss', energyType: 'electricity', value: 210 },

      // 终端用能层
      { id: 'hvac', name: '暖通空调', category: 'enduse', energyType: 'electricity', value: 4200 },
      { id: 'lighting', name: '照明', category: 'enduse', energyType: 'electricity', value: 1850 },
      { id: 'equipment', name: '动力/插座', category: 'enduse', energyType: 'electricity', value: 3100 },
      { id: 'lab', name: '科研实验', category: 'enduse', energyType: 'electricity', value: 1650 },
      { id: 'domestic_water', name: '生活热水', category: 'enduse', energyType: 'heat', value: 420 },
      { id: 'heating', name: '供暖', category: 'enduse', energyType: 'heat', value: 240 },
      { id: 'catering', name: '餐饮烹饪', category: 'enduse', energyType: 'gas', value: 170 },

      // 损耗层
      { id: 'pipe_loss', name: '管网热损', category: 'loss', energyType: 'heat', value: 20 },
      { id: 'line_loss', name: '线路损耗', category: 'loss', energyType: 'electricity', value: 95 },
    ],
    links: [
      { source: 'grid', target: 'chiller', value: 2800, energyType: 'electricity' },
      { source: 'grid', target: 'hvac', value: 1400, energyType: 'electricity' },
      { source: 'grid', target: 'lighting', value: 1850, energyType: 'electricity' },
      { source: 'grid', target: 'equipment', value: 3100, energyType: 'electricity' },
      { source: 'grid', target: 'lab', value: 1650, energyType: 'electricity' },
      { source: 'grid', target: 'transformer', value: 210, energyType: 'electricity' },
      { source: 'grid', target: 'line_loss', value: 95, energyType: 'electricity' },
      { source: 'solar', target: 'hvac', value: 120, energyType: 'electricity' },
      { source: 'solar', target: 'equipment', value: 90, energyType: 'electricity' },
      { source: 'solar', target: 'lighting', value: 35, energyType: 'electricity' },
      { source: 'gas_in', target: 'boiler', value: 1700, energyType: 'gas' },
      { source: 'gas_in', target: 'catering', value: 120, energyType: 'gas' },
      { source: 'boiler', target: 'heating', value: 1500, energyType: 'heat', lossRate: 9.1 },
      { source: 'boiler', target: 'domestic_water', value: 130, energyType: 'heat', lossRate: 7.7 },
      { source: 'boiler', target: 'pipe_loss', value: 20, energyType: 'heat' },
      { source: 'chiller', target: 'hvac', value: 2550, energyType: 'electricity', lossRate: 8.9 },
      { source: 'heat_input', target: 'heating', value: 240, energyType: 'heat' },
      { source: 'heat_input', target: 'domestic_water', value: 290, energyType: 'heat' },
      { source: 'heat_input', target: 'pipe_loss', value: 150, energyType: 'heat' },
    ],
    totalInput: 16576,
    totalLoss: 475,
    overallEfficiency: 97.1,
  };
}

export function getBenchmarkData(): BenchmarkComparison[] {
  return [
    {
      buildingType: 'teaching',
      buildingTypeName: '教学楼',
      buildings: [
        { buildingId: 'b01', buildingName: '教学楼A', intensity: 18.2, perCapita: 142, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b02', buildingName: '教学楼B', intensity: 22.5, perCapita: 175, isOverStandard: true, overStandardPercent: 12.5 },
        { buildingId: 'b03', buildingName: '教学楼C', intensity: 16.8, perCapita: 131, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '国标限值', value: 20.0, color: '#DC2626', lineStyle: 'solid' as const },
        { name: '北京地标', value: 18.0, color: '#F97316', lineStyle: 'dashed' as const },
        { name: '行业先进', value: 14.0, color: '#22C55E', lineStyle: 'dashed' as const },
      ],
    },
    {
      buildingType: 'dormitory',
      buildingTypeName: '宿舍楼',
      buildings: [
        { buildingId: 'b09', buildingName: '学生宿舍1', intensity: 8.5, perCapita: 68, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b10', buildingName: '学生宿舍2', intensity: 11.2, perCapita: 90, isOverStandard: true, overStandardPercent: 12.0 },
        { buildingId: 'b11', buildingName: '学生宿舍3', intensity: 9.8, perCapita: 78, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '国标限值', value: 10.0, color: '#DC2626', lineStyle: 'solid' as const },
        { name: '北京地标', value: 9.0, color: '#F97316', lineStyle: 'dashed' as const },
        { name: '行业先进', value: 7.0, color: '#22C55E', lineStyle: 'dashed' as const },
      ],
    },
    {
      buildingType: 'laboratory',
      buildingTypeName: '实验楼',
      buildings: [
        { buildingId: 'b04', buildingName: '实验楼A', intensity: 52.3, perCapita: 418, isOverStandard: true, overStandardPercent: 16.2 },
        { buildingId: 'b05', buildingName: '实验楼B', intensity: 45.8, perCapita: 366, isOverStandard: true, overStandardPercent: 7.9 },
        { buildingId: 'b06', buildingName: '实验楼C', intensity: 41.2, perCapita: 330, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '国标限值', value: 45.0, color: '#DC2626', lineStyle: 'solid' as const },
        { name: '北京地标', value: 42.0, color: '#F97316', lineStyle: 'dashed' as const },
        { name: '行业先进', value: 35.0, color: '#22C55E', lineStyle: 'dashed' as const },
      ],
    },
  ];
}

export function getAIRootCause(anomalyId: string): AIRootCauseAnalysis | null {
  if (anomalyId !== 'anomaly_001') return null;
  return {
    anomalyId,
    anomalyDescription: '实验楼A近期电力消耗显著偏高，同比上升18.5%',
    rootCauses: [
      {
        id: 'rc1',
        cause: '空调系统运行效率偏低（COP=2.8，设计值4.2）',
        probability: 0.65,
        impactLevel: 'high',
        evidence: ['冷机出水温度偏高至12°C', '冷冻水泵频率长期满载'],
        suggestedAction: '检查冷却塔填料是否堵塞，清洗换热器',
        estimatedSaving: 125600,
        savingUnit: 'kWh/年',
      },
      {
        id: 'rc2',
        cause: '夜间及周末实验设备未及时关闭',
        probability: 0.45,
        impactLevel: 'medium',
        evidence: ['凌晨2-5点基载功率仍达350kW', '周六日负荷与工作日差异不足15%'],
        suggestedAction: '推广智能插座+定时关断策略',
        estimatedSaving: 45200,
        savingUnit: 'kWh/年',
      },
      {
        id: 'rc3',
        cause: '照明系统存在长明灯现象',
        probability: 0.30,
        impactLevel: 'low',
        evidence: ['走廊照明全天候开启', '公共区域照度传感器失灵'],
        suggestedAction: '修复照度感应开关，启用分时段调光',
        estimatedSaving: 12800,
        savingUnit: 'kWh/年',
      },
    ],
    confidence: 0.82,
    dataEvidence: [
      { type: 'chart', title: '逐时负荷曲线对比', description: '本月 vs 去年同月逐时负荷曲线', data: {} },
      { type: 'metric', title: '关键指标偏离度', description: 'COP、基载功率等指标与基准值的偏差', data: {} },
    ],
  };
}

export function getSavingAdviceList(): EnergySavingAdvice[] {
  return [
    {
      id: 'sa1', category: 'equipment', title: '更换高效冷水机组', description: '现有螺杆机组COP仅2.8，更换为磁悬浮离心机组后预计COP可达5.8',
      priority: 'high', targetBuilding: '实验楼A', targetEnergyType: 'electricity',
      estimatedSaving: 125600, savingUnit: 'kWh/年', estimatedCostSaving: 87920, paybackMonths: 36,
      implementationDifficulty: 'hard', status: 'suggested',
    },
    {
      id: 'sa2', category: 'behavior', title: '推行"人走灯灭"智能管控', description: '在走廊、卫生间安装人体感应开关，公共区域采用雷达感应调光',
      priority: 'medium', targetEnergyType: 'electricity',
      estimatedSaving: 25600, savingUnit: 'kWh/年', estimatedCostSaving: 17920, paybackMonths: 8,
      implementationDifficulty: 'easy', status: 'accepted',
    },
    {
      id: 'sa3', category: 'schedule', title: '优化空调启停时间表', description: '根据实际人员到岗规律调整空调提前开机和延后关机时间',
      priority: 'medium', targetBuilding: '教学楼A', targetEnergyType: 'electricity',
      estimatedSaving: 18400, savingUnit: 'kWh/年', estimatedCostSaving: 12880, paybackMonths: 0,
      implementationDifficulty: 'easy', status: 'in_progress',
    },
    {
      id: 'sa4', category: 'retrofit', title: 'LED全量替换计划', description: '将剩余的荧光灯全部替换为LED灯具，含应急照明改造',
      priority: 'low', targetEnergyType: 'electricity',
      estimatedSaving: 31200, savingUnit: 'kWh/年', estimatedCostSaving: 21840, paybackMonths: 18,
      implementationDifficulty: 'medium', status: 'suggested',
    },
    {
      id: 'sa5', category: 'behavior', title: '实验室设备定时关断', description: '为实验台配备智能插座，支持远程批量关机和预约启动',
      priority: 'high', targetBuilding: '实验楼A', targetEnergyType: 'electricity',
      estimatedSaving: 45200, savingUnit: 'kWh/年', estimatedCostSaving: 31640, paybackMonths: 6,
      implementationDifficulty: 'easy', status: 'suggested',
    },
    {
      id: 'sa6', category: 'retrofit', title: '锅炉烟气余热回收改造', description: '在锅炉排烟口加装板式换热器回收烟气余热用于预热生活热水',
      priority: 'medium', targetEnergyType: 'gas',
      estimatedSaving: 185000, savingUnit: 'm³/年', estimatedCostSaving: 55500, paybackMonths: 24,
      implementationDifficulty: 'hard', status: 'suggested',
    },
  ];
}

export function getEnergyTrendData(): EnergyTrendComparison {
  const months = ['1月','2月','3月','4月','5月','6月','7月'];
  return {
    buildings: ['全校', '教学楼A', '实验楼A', '图书馆'],
    energyType: 'electricity',
    startDate: '2026-01-01',
    endDate: '2026-07-31',
    series: [
      { buildingId: 'all', buildingName: '全校', data: months.map((m,i) => ({ date: m, value: 115 + Math.sin(i*0.8)*15 + (i>4?i*3:0) })) },
      { buildingId: 'b01', buildingName: '教学楼A', data: months.map((m,i) => ({ date: m, value: 18 + Math.cos(i*0.6)*3 + (i>4?i*0.5:0) })) },
      { buildingId: 'b04', buildingName: '实验楼A', data: months.map((m,i) => ({ date: m, value: 28 + Math.sin(i*1)*5 + (i>4?i*1.2:0) })) },
      { buildingId: 'b07', buildingName: '图书馆', data: months.map((m,i) => ({ date: m, value: 12 + Math.cos(i*0.4)*2 + (i>4?i*0.3:0) })) },
    ],
    yoyData: {
      currentYear: [115,108,118,112,125,138,148],
      lastYear: [119,115,122,118,128,135,142],
      changeRate: [-3.4,-6.1,-3.3,-5.1,-2.3,2.2,4.2],
    },
    momData: {
      currentMonth: [148],
      lastMonth: [138],
      changeRate: [7.2],
    },
  };
}

// ============================================================
// 页面3：用能日历 — Mock 数据
// ============================================================

function generateCalendarDays(year: number, month: number): CalendarHeatmapDay[] {
  const days: CalendarHeatmapDay[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayOfWeek = new Date(year, month - 1, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = (month === 1 && (d >= 1 && d <= 3)) || (month === 2 && d >= 9 && d <= 15);

    let baseIntensity = 12;
    if (isHoliday) baseIntensity = 3;
    else if (isWeekend) baseIntensity = 6;
    else if (dayOfWeek >= 1 && dayOfWeek <= 5) baseIntensity = 15;

    const noise = (Math.sin(d * 1.7) * 2 + Math.cos(d * 0.9) * 1.5);
    const intensity = Math.max(1, baseIntensity + noise + (d > 20 ? 3 : 0));
    const tce = intensity * 0.85;

    let level: CalendarHeatmapDay['level'] = 'normal';
    if (isHoliday) level = 'holiday';
    else if (isWeekend) level = 'weekend';
    else if (intensity > 20) level = 'abnormal_high';
    else if (intensity > 16) level = 'high';
    else if (intensity < 5) level = 'abnormal_low';
    else if (intensity < 8) level = 'low';

    const isAbnormal = level.startsWith('abnormal');
    const hasAlert = isAbnormal || (d % 7 === 0 && !isWeekend);

    days.push({
      date: dateStr,
      totalTce: Math.round(tce * 100) / 100,
      electricity: Math.round(tce * 0.65 * 100) / 100,
      water: Math.round(tce * 0.18 * 100) / 100,
      gas: Math.round(tce * 0.12 * 100) / 100,
      heat: Math.round(tce * 0.05 * 100) / 100,
      intensity: Math.round(intensity * 100) / 100,
      level,
      isAbnormal,
      hasAlert,
      alertCount: hasAlert ? (isAbnormal ? 2 : 1) : undefined,
    });
  }
  return days;
}

export function getCalendarData(year: number, month: number): CalendarHeatmapDay[] {
  return generateCalendarDays(year, month);
}

export function getMonthlySummary(month: string): MonthlyEnergySummary {
  return {
    month,
    totalUsage: { electricity: 384200, water: 106300, gas: 70800, heat: 29500, totalTce: 49820 },
    abnormalDays: 4,
    savingComplianceDays: 22,
    totalDays: 31,
  };
}

export function getEnergyProfile(): EnergyProfile {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2,'0')}:00`);
  const workdayBase = [120, 110, 105, 102, 100, 115, 250, 420, 580, 620, 610, 590, 570, 580, 610, 630, 580, 480, 380, 340, 300, 270, 220, 160];
  const weekendBase = [130, 120, 115, 108, 100, 105, 150, 200, 250, 280, 290, 285, 280, 285, 295, 300, 280, 240, 200, 180, 160, 145, 130, 125];
  const holidayBase = [110, 105, 100, 98, 95, 98, 120, 150, 180, 190, 195, 190, 188, 192, 198, 200, 185, 160, 140, 130, 120, 115, 110, 108];

  return {
    workdayPattern: hours.map((t, i) => ({
      timestamp: t,
      electricity: workdayBase[i] + (Math.random() - 0.5) * 20,
      water: workdayBase[i] * 0.12 + (Math.random() - 0.5) * 3,
      gas: workdayBase[i] * 0.04 + (Math.random() - 0.5) * 1,
      heat: workdayBase[i] * 0.015 + (Math.random() - 0.5) * 0.5,
    })),
    weekendPattern: hours.map((t, i) => ({
      timestamp: t,
      electricity: weekendBase[i] + (Math.random() - 0.5) * 15,
      water: weekendBase[i] * 0.15 + (Math.random() - 0.5) * 4,
      gas: weekendBase[i] * 0.06 + (Math.random() - 0.5) * 2,
      heat: weekendBase[i] * 0.02 + (Math.random() - 0.5) * 0.5,
    })),
    holidayPattern: hours.map((t, i) => ({
      timestamp: t,
      electricity: holidayBase[i] + (Math.random() - 0.5) * 10,
      water: holidayBase[i] * 0.1 + (Math.random() - 0.5) * 2,
      gas: holidayBase[i] * 0.03 + (Math.random() - 0.5) * 1,
      heat: holidayBase[i] * 0.01 + (Math.random() - 0.5) * 0.3,
    })),
    seasonalPattern: [
      { season: 'spring', avgDaily: 1580, peakDemand: 5200, dominantEnergy: 'electricity' },
      { season: 'summer', avgDaily: 2150, peakDemand: 6800, dominantEnergy: 'electricity' },
      { season: 'autumn', avgDaily: 1720, peakDemand: 5500, dominantEnergy: 'electricity' },
      { season: 'winter', avgDaily: 2280, peakDemand: 6200, dominantEnergy: 'heat' },
    ] as SeasonalData[],
    peakHours: ['09:00-11:00', '14:00-16:00', '19:00-21:00'],
    valleyHours: ['00:00-05:00'],
    peakValleyRatio: 6.2,
  };
}

export function getDayDetail(date: string): DayDetail {
  const hours = Array.from({ length: 24 }, (_, i) => ({
    start: `${String(i).padStart(2,'0')}:00`, end: `${String((i+1)%24).padStart(2,'0')}:00`,
    duration: 1, consumption: 0,
  }));
  const profile = getEnergyProfile();
  const hourlyCurve = profile.workdayPattern;

  hours.forEach((h, i) => {
    h.consumption = hourlyCurve[i].electricity;
  });

  const peakThreshold = 500;
  const valleyThreshold = 150;

  const peakHours = hours.filter(h => h.consumption >= peakThreshold).map(h => ({ ...h }));
  const valleyHours = hours.filter(h => h.consumption <= valleyThreshold).map(h => ({ ...h }));
  const flatHours = hours.filter(h => h.consumption > valleyThreshold && h.consumption < peakThreshold).map(h => ({ ...h }));

  const total = hours.reduce((s, h) => s + h.consumption, 0);

  return {
    date,
    hourlyCurve,
    peakValleyAnalysis: {
      peakHours: peakHours.map(h => ({ ...h, duration: h.duration, consumption: h.consumption })),
      valleyHours: valleyHours.map(h => ({ ...h, duration: h.duration, consumption: h.consumption })),
      flatHours: flatHours.map(h => ({ ...h, duration: h.duration, consumption: h.consumption })),
      peakRatio: Math.round(peakHours.reduce((s,h)=>s+h.consumption,0)/total*1000)/10,
      valleyRatio: Math.round(valleyHours.reduce((s,h)=>s+h.consumption,0)/total*1000)/10,
      flatRatio: Math.round(flatHours.reduce((s,h)=>s+h.consumption,0)/total*1000)/10,
    } as PeakValleyResult,
    hourlyBreakdown: hourlyCurve.map(p => ({
      period: p.timestamp.replace(':00',''),
      electricity: Math.round(p.electricity),
      water: Math.round(p.water * 10) / 10,
      gas: Math.round(p.gas * 100) / 100,
      heat: Math.round(p.heat * 100) / 100,
      total: Math.round((p.electricity + p.water + p.gas + p.heat) * 100) / 100,
      percentage: 0,
    })).map(h => ({ ...h, percentage: Math.round(h.total / total * 1000) / 10 })) as HourlyBreakdown[],
  };
}

export function getTypicalDayComparison(): TypicalDayComparison {
  const profile = getEnergyProfile();
  return {
    days: [
      { label: '工作日典型', date: '2026-07-15', energyType: 'electricity', data: profile.workdayPattern },
      { label: '周末典型', date: '2026-07-13', energyType: 'electricity', data: profile.weekendPattern },
      { label: '假期典型', date: '2026-02-12', energyType: 'electricity', data: profile.holidayPattern },
    ],
  };
}

export function getSemesterComparison(): SemesterComparison {
  return {
    semesters: [
      { name: '2025秋季学期', startDate: '2025-09-01', endDate: '2026-01-15', totalTce: 158400, avgDailyTce: 1165, electricity: 103000, water: 28500, gas: 18900, heat: 8000, peakDemandDay: '2025-12-20', peakDemandValue: 7200 },
      { name: '2026春季学期', startDate: '2026-02-17', endDate: '2026-06-30', totalTce: 136800, avgDailyTce: 1095, electricity: 88900, water: 24600, gas: 16400, heat: 6900, peakDemandDay: '2026-06-28', peakDemandValue: 6500 },
      { name: '2026夏季学期(当前)', startDate: '2026-07-01', endDate: '2026-07-23', totalTce: 11480, avgDailyTce: 499, electricity: 8840, water: 2450, gas: 1630, heat: 560, peakDemandDay: '2026-07-22', peakDemandValue: 5800 },
    ],
  };
}

export function getTimeOfUseAdvice(): TimeOfUseAdvice[] {
  return [
    { id: 'tou1', timePeriod: '峰时段 08:00-11:00, 17:00-21:00', periodType: 'peak', advice: '错峰使用大功率设备，将可转移负荷移至平谷时段', targetEnergyType: 'electricity', estimatedSaving: 8.5, savingUnit: '%', priority: 'high' },
    { id: 'tou2', timePeriod: '平时段 11:00-17:00, 21:00-23:00', periodType: 'flat', advice: '平时段电价适中，适合安排常规教学和办公活动', targetEnergyType: 'electricity', estimatedSaving: 0, savingUnit: '', priority: 'low' },
    { id: 'tou3', timePeriod: '谷时段 23:00-次日08:00', periodType: 'valley', advice: '利用谷时段进行蓄冷/蓄热，降低白天高峰制冷/供暖负荷', targetEnergyType: 'electricity', estimatedSaving: 12, savingUnit: '%', priority: 'high' },
    { id: 'tou4', timePeriod: '午间低谷 12:00-14:00', periodType: 'valley', advice: '午间为自然用能低谷，可安排设备检修和维护', targetEnergyType: 'electricity', estimatedSaving: 3, savingUnit: '%', priority: 'medium' },
  ];
}
