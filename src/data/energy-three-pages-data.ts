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
const buildings: BuildingEnergySnapshot[] = [
  { buildingId: 'b01', buildingName: '主教学楼', buildingType: 'teaching', currentPower: 156.2, todayCumulative: 1874, floorCount: 6, area: 18500, intensity: 8.43 },
  { buildingId: 'b02', buildingName: '第二教学楼', buildingType: 'teaching', currentPower: 98.7, todayCumulative: 1184, floorCount: 5, area: 12000, intensity: 8.22 },
  { buildingId: 'b03', buildingName: '第三教学楼', buildingType: 'teaching', currentPower: 112.3, todayCumulative: 1348, floorCount: 5, area: 13500, intensity: 8.31 },
  { buildingId: 'b04', buildingName: '第四教学楼', buildingType: 'teaching', currentPower: 87.5, todayCumulative: 1050, floorCount: 4, area: 9800, intensity: 8.93 },
  { buildingId: 'b05', buildingName: '综合实验楼A', buildingType: 'laboratory', currentPower: 234.8, todayCumulative: 2818, floorCount: 8, area: 22000, intensity: 10.67 },
  { buildingId: 'b06', buildingName: '综合实验楼B', buildingType: 'laboratory', currentPower: 198.3, todayCumulative: 2380, floorCount: 6, area: 16500, intensity: 10.02 },
  { buildingId: 'b07', buildingName: '材料实验楼', buildingType: 'laboratory', currentPower: 267.1, todayCumulative: 3205, floorCount: 5, area: 14000, intensity: 15.89 },
  { buildingId: 'b08', buildingName: '图书馆', buildingType: 'library', currentPower: 178.6, todayCumulative: 2143, floorCount: 5, area: 28000, intensity: 6.37 },
  { buildingId: 'b09', buildingName: '行政办公楼', buildingType: 'administrative', currentPower: 67.2, todayCumulative: 806, floorCount: 8, area: 15000, intensity: 4.48 },
  { buildingId: 'b10', buildingName: '学生宿舍1号楼', buildingType: 'dormitory', currentPower: 89.4, todayCumulative: 1073, floorCount: 7, area: 12000, intensity: 7.45 },
  { buildingId: 'b11', buildingName: '学生宿舍2号楼', buildingType: 'dormitory', currentPower: 92.1, todayCumulative: 1105, floorCount: 7, area: 12000, intensity: 7.68 },
  { buildingId: 'b12', buildingName: '学生宿舍3号楼', buildingType: 'dormitory', currentPower: 78.6, todayCumulative: 943, floorCount: 6, area: 10000, intensity: 7.86 },
  { buildingId: 'b13', buildingName: '学生宿舍4号楼', buildingType: 'dormitory', currentPower: 85.3, todayCumulative: 1024, floorCount: 6, area: 10500, intensity: 8.12 },
  { buildingId: 'b14', buildingName: '学生宿舍5号楼', buildingType: 'dormitory', currentPower: 71.2, todayCumulative: 854, floorCount: 6, area: 9500, intensity: 7.49 },
  { buildingId: 'b15', buildingName: '第一食堂', buildingType: 'canteen', currentPower: 145.6, todayCumulative: 1747, floorCount: 2, area: 4500, intensity: 26.96 },
  { buildingId: 'b16', buildingName: '第二食堂', buildingType: 'canteen', currentPower: 128.3, todayCumulative: 1540, floorCount: 2, area: 4000, intensity: 26.73 },
  { buildingId: 'b17', buildingName: '体育馆', buildingType: 'administrative', currentPower: 56.8, todayCumulative: 682, floorCount: 2, area: 8000, intensity: 5.92 },
  { buildingId: 'b18', buildingName: '游泳馆', buildingType: 'administrative', currentPower: 89.2, todayCumulative: 1070, floorCount: 1, area: 5000, intensity: 14.87 },
  { buildingId: 'b19', buildingName: '校医院', buildingType: 'administrative', currentPower: 42.3, todayCumulative: 508, floorCount: 3, area: 3500, intensity: 10.07 },
  { buildingId: 'b20', buildingName: '信息中心', buildingType: 'laboratory', currentPower: 312.5, todayCumulative: 3750, floorCount: 4, area: 6000, intensity: 43.40 },
  { buildingId: 'b21', buildingName: '留学生公寓', buildingType: 'dormitory', currentPower: 65.8, todayCumulative: 790, floorCount: 8, area: 9000, intensity: 6.09 },
  { buildingId: 'b22', buildingName: '青年教师公寓', buildingType: 'dormitory', currentPower: 58.4, todayCumulative: 701, floorCount: 10, area: 11000, intensity: 4.42 },
  { buildingId: 'b23', buildingName: '东校区教学楼', buildingType: 'teaching', currentPower: 72.3, todayCumulative: 868, floorCount: 5, area: 10000, intensity: 6.03 },
  { buildingId: 'b24', buildingName: '东校区实验楼', buildingType: 'laboratory', currentPower: 156.7, todayCumulative: 1880, floorCount: 6, area: 12000, intensity: 10.89 },
  { buildingId: 'b25', buildingName: '东校区宿舍楼', buildingType: 'dormitory', currentPower: 67.2, todayCumulative: 806, floorCount: 7, area: 10000, intensity: 5.60 },
  { buildingId: 'b26', buildingName: '东校区食堂', buildingType: 'canteen', currentPower: 78.5, todayCumulative: 942, floorCount: 2, area: 3000, intensity: 21.81 },
  { buildingId: 'b27', buildingName: '南校区综合楼', buildingType: 'teaching', currentPower: 95.6, todayCumulative: 1147, floorCount: 6, area: 14000, intensity: 5.69 },
  { buildingId: 'b28', buildingName: '南校区宿舍楼', buildingType: 'dormitory', currentPower: 54.3, todayCumulative: 652, floorCount: 6, area: 8000, intensity: 5.66 },
  { buildingId: 'b29', buildingName: '光伏发电站', buildingType: 'administrative', currentPower: -45.2, todayCumulative: -542, floorCount: 1, area: 2000, intensity: -18.83 },
];

// ============================================================
// 页面1：能源监控中心
// ============================================================

export function getEnergyOverview(): EnergyOverview[] {
  return [
    {
      energyType: 'electricity', campus: 'main_campus', timestamp: new Date().toISOString(),
      currentPower: 2345.6, todayCumulative: 28147, monthCumulative: 591087, yearCumulative: 3546522,
      yoyChange: -3.2, momChange: 5.8, carbonIntensity: 0.48,
      byBuilding: buildings,
    },
    {
      energyType: 'water', campus: 'main_campus', timestamp: new Date().toISOString(),
      currentPower: 45.2, todayCumulative: 542, monthCumulative: 11382, yearCumulative: 68292,
      yoyChange: -5.1, momChange: 2.3, carbonIntensity: 0.06,
      byBuilding: buildings.map(b => ({ ...b, currentPower: b.currentPower * 0.019, todayCumulative: b.todayCumulative * 0.019 })),
    },
    {
      energyType: 'gas', campus: 'main_campus', timestamp: new Date().toISOString(),
      currentPower: 12.8, todayCumulative: 154, monthCumulative: 3234, yearCumulative: 19404,
      yoyChange: -8.5, momChange: -12.3, carbonIntensity: 0.15,
      byBuilding: buildings.map(b => ({ ...b, currentPower: b.currentPower * 0.0055, todayCumulative: b.todayCumulative * 0.0055 })),
    },
    {
      energyType: 'heat', campus: 'main_campus', timestamp: new Date().toISOString(),
      currentPower: 0, todayCumulative: 0, monthCumulative: 0, yearCumulative: 18450,
      yoyChange: -2.8, momChange: 0, carbonIntensity: 0,
      byBuilding: buildings.map(b => ({ ...b, currentPower: 0, todayCumulative: 0 })),
    },
  ];
}

function generateHourlyCurve(multiplier = 1): LoadCurvePoint[] {
  const points: LoadCurvePoint[] = [];
  for (let h = 0; h < 24; h++) {
    const base = 800 + 400 * Math.sin((h - 6) * Math.PI / 12);
    const noise = (Math.sin(h * 1.7) * 80 + Math.cos(h * 3.1) * 60);
    const val = Math.max(200, base + noise);
    points.push({
      timestamp: `2026-07-23T${String(h).padStart(2, '0')}:00:00`,
      electricity: val * multiplier,
      water: (val * 0.018) * multiplier,
      gas: (val * 0.004) * multiplier,
      heat: 0,
    });
  }
  return points;
}

export function getLoadCurveSeries(): LoadCurveSeries[] {
  return [
    { buildingId: 'all', buildingName: '全校总计', color: '#3B82F6', data: generateHourlyCurve(1) },
    { buildingId: 'b01', buildingName: '主教学楼', color: '#10B981', data: generateHourlyCurve(0.15) },
    { buildingId: 'b05', buildingName: '综合实验楼A', color: '#F59E0B', data: generateHourlyCurve(0.18) },
    { buildingId: 'b15', buildingName: '第一食堂', color: '#EF4444', data: generateHourlyCurve(0.12) },
    { buildingId: 'b10', buildingName: '学生宿舍1号楼', color: '#8B5CF6', data: generateHourlyCurve(0.10) },
  ];
}

export function getEnergyAlerts(): EnergyAlert[] {
  return [
    { id: 'alt-001', alertTime: '2026-07-23T09:15:00', category: 'energy', level: 'warning', title: '用电突增告警', description: '主教学楼当前用电功率超出基准值35%', buildingId: 'b01', buildingName: '主教学楼', energyType: 'electricity', metric: 'currentPower', metricValue: 156.2, threshold: 115, unit: 'kW', status: 'pending', assignee: '张工' },
    { id: 'alt-002', alertTime: '2026-07-23T08:30:00', category: 'device', level: 'critical', title: '变压器温度过高', description: '综合实验楼A 2#变压器温度达92°C，超过安全阈值', buildingId: 'b05', buildingName: '综合实验楼A', deviceName: '2#变压器', energyType: 'electricity', metric: 'temperature', metricValue: 92, threshold: 85, unit: '°C', status: 'processing', assignee: '李工', workOrderId: 'WO-20260723-001' },
    { id: 'alt-003', alertTime: '2026-07-23T07:45:00', category: 'environment', level: 'warning', title: 'CO₂浓度超限', description: '图书馆3层阅览室CO₂浓度达1200ppm', buildingId: 'b08', buildingName: '图书馆', metric: 'co2', metricValue: 1200, threshold: 1000, unit: 'ppm', status: 'acknowledged', assignee: '王工' },
    { id: 'alt-004', alertTime: '2026-07-23T06:20:00', category: 'data', level: 'info', title: '仪表离线', description: '学生宿舍3号楼水表离线超过2小时', buildingId: 'b12', buildingName: '学生宿舍3号楼', deviceName: '水表-3F', energyType: 'water', metric: 'heartbeat', metricValue: 0, threshold: 1, unit: '次', status: 'pending' },
    { id: 'alt-005', alertTime: '2026-07-23T05:10:00', category: 'energy', level: 'critical', title: '用水连续异常', description: '游泳馆用水量连续3天超基准值50%', buildingId: 'b18', buildingName: '游泳馆', energyType: 'water', metric: 'dailyUsage', metricValue: 85, threshold: 55, unit: 'm³', status: 'processing', assignee: '赵工', workOrderId: 'WO-20260723-002' },
    { id: 'alt-006', alertTime: '2026-07-23T04:00:00', category: 'data', level: 'warning', title: '数据采集延迟', description: '信息中心电力数据采集延迟超过15分钟', buildingId: 'b20', buildingName: '信息中心', energyType: 'electricity', metric: 'delay', metricValue: 18, threshold: 5, unit: 'min', status: 'pending' },
    { id: 'alt-007', alertTime: '2026-07-22T22:30:00', category: 'device', level: 'warning', title: '水泵运行异常', description: '第一食堂供水泵振动值超标', buildingId: 'b15', buildingName: '第一食堂', deviceName: '供水泵A', energyType: 'water', metric: 'vibration', metricValue: 7.8, threshold: 5, unit: 'mm/s', status: 'resolved', resolvedTime: '2026-07-23T01:00:00', assignee: '李工' },
    { id: 'alt-008', alertTime: '2026-07-22T20:00:00', category: 'environment', level: 'info', title: '温度异常', description: '体育馆室内温度28°C，超出舒适范围', buildingId: 'b17', buildingName: '体育馆', metric: 'temperature', metricValue: 28, threshold: 26, unit: '°C', status: 'resolved', resolvedTime: '2026-07-22T22:00:00' },
  ];
}

export function getDeviceStatusPanel(): DeviceStatusPanel {
  const devices: DeviceItem[] = [
    { deviceId: 'dev-001', deviceName: '主教学楼进线柜', deviceType: '进线柜', energyType: 'electricity', buildingId: 'b01', buildingName: '主教学楼', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 156.2, unit: 'kW', batteryLevel: 95 },
    { deviceId: 'dev-002', deviceName: '综合实验楼A 2#变压器', deviceType: '变压器', energyType: 'electricity', buildingId: 'b05', buildingName: '综合实验楼A', status: 'fault', lastHeartbeat: '2026-07-23T09:55:00', currentValue: 234.8, unit: 'kW' },
    { deviceId: 'dev-003', deviceName: '图书馆空调主机', deviceType: '空调主机', energyType: 'electricity', buildingId: 'b08', buildingName: '图书馆', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 78.6, unit: 'kW' },
    { deviceId: 'dev-004', deviceName: '第一食堂燃气表', deviceType: '燃气表', energyType: 'gas', buildingId: 'b15', buildingName: '第一食堂', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 6.5, unit: 'm³/h', batteryLevel: 72 },
    { deviceId: 'dev-005', deviceName: '学生宿舍3号楼水表-3F', deviceType: '水表', energyType: 'water', buildingId: 'b12', buildingName: '学生宿舍3号楼', status: 'offline', lastHeartbeat: '2026-07-23T07:30:00', currentValue: 0, unit: 'm³/h', batteryLevel: 15 },
    { deviceId: 'dev-006', deviceName: '信息中心UPS', deviceType: 'UPS', energyType: 'electricity', buildingId: 'b20', buildingName: '信息中心', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 312.5, unit: 'kW', batteryLevel: 88 },
    { deviceId: 'dev-007', deviceName: '材料实验楼排风系统', deviceType: '排风系统', energyType: 'electricity', buildingId: 'b07', buildingName: '材料实验楼', status: 'maintenance', lastHeartbeat: '2026-07-23T08:00:00', currentValue: 45.2, unit: 'kW' },
    { deviceId: 'dev-008', deviceName: '游泳馆热泵机组', deviceType: '热泵', energyType: 'heat', buildingId: 'b18', buildingName: '游泳馆', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 2.8, unit: 'GJ/h' },
    { deviceId: 'dev-009', deviceName: '第一食堂供水泵A', deviceType: '水泵', energyType: 'water', buildingId: 'b15', buildingName: '第一食堂', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 3.2, unit: 'm³/h' },
    { deviceId: 'dev-010', deviceName: '东校区教学楼进线柜', deviceType: '进线柜', energyType: 'electricity', buildingId: 'b23', buildingName: '东校区教学楼', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 72.3, unit: 'kW', batteryLevel: 91 },
    { deviceId: 'dev-011', deviceName: '光伏逆变器1#', deviceType: '逆变器', energyType: 'electricity', buildingId: 'b29', buildingName: '光伏发电站', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: -45.2, unit: 'kW' },
    { deviceId: 'dev-012', deviceName: '行政办公楼电梯', deviceType: '电梯', energyType: 'electricity', buildingId: 'b09', buildingName: '行政办公楼', status: 'online', lastHeartbeat: '2026-07-23T10:00:00', currentValue: 12.5, unit: 'kW' },
  ];
  return {
    totalDevices: 35,
    onlineCount: 30,
    offlineCount: 2,
    faultCount: 1,
    maintenanceCount: 2,
    devices,
  };
}

// ============================================================
// 页面2：能源诊断中心
// ============================================================

export function getDiagnosisSummary(): DiagnosisSummary {
  return {
    efficiencyScore: 72.5,
    overStandardBuildings: 8,
    totalOverStandard: 27.6,
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

export function getEnergyFlowSankey(): EnergyFlowSankey {
  return {
    period: '2026年7月',
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
        { buildingId: 'b01', buildingName: '主教学楼', intensity: 15.2, perCapita: 0.42, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b02', buildingName: '第二教学楼', intensity: 14.8, perCapita: 0.41, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b03', buildingName: '第三教学楼', intensity: 15.0, perCapita: 0.42, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b04', buildingName: '第四教学楼', intensity: 19.2, perCapita: 0.53, isOverStandard: true, overStandardPercent: 20 },
        { buildingId: 'b23', buildingName: '东校区教学楼', intensity: 10.9, perCapita: 0.30, isOverStandard: false, overStandardPercent: 0 },
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
        { buildingId: 'b10', buildingName: '学生宿舍1号楼', intensity: 13.4, perCapita: 0.37, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b11', buildingName: '学生宿舍2号楼', intensity: 13.8, perCapita: 0.38, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b12', buildingName: '学生宿舍3号楼', intensity: 14.2, perCapita: 0.39, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b13', buildingName: '学生宿舍4号楼', intensity: 17.5, perCapita: 0.49, isOverStandard: true, overStandardPercent: 16.7 },
        { buildingId: 'b14', buildingName: '学生宿舍5号楼', intensity: 13.5, perCapita: 0.38, isOverStandard: false, overStandardPercent: 0 },
      ],
      benchmarks: [
        { name: '引导值', value: 11, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 15, color: '#F59E0B', lineStyle: 'solid' },
      ],
    },
    {
      buildingType: 'laboratory', buildingTypeName: '实验楼',
      buildings: [
        { buildingId: 'b05', buildingName: '综合实验楼A', intensity: 28.7, perCapita: 0.80, isOverStandard: true, overStandardPercent: 14.8 },
        { buildingId: 'b06', buildingName: '综合实验楼B', intensity: 25.1, perCapita: 0.70, isOverStandard: false, overStandardPercent: 0 },
        { buildingId: 'b07', buildingName: '材料实验楼', intensity: 32.5, perCapita: 0.90, isOverStandard: true, overStandardPercent: 30 },
        { buildingId: 'b20', buildingName: '信息中心', intensity: 48.2, perCapita: 1.34, isOverStandard: true, overStandardPercent: 92.8 },
      ],
      benchmarks: [
        { name: '引导值', value: 20, color: '#22C55E', lineStyle: 'dashed' },
        { name: '约束值', value: 25, color: '#F59E0B', lineStyle: 'solid' },
      ],
    },
    {
      buildingType: 'canteen', buildingTypeName: '食堂',
      buildings: [
        { buildingId: 'b15', buildingName: '第一食堂', intensity: 48.5, perCapita: 1.35, isOverStandard: true, overStandardPercent: 21.3 },
        { buildingId: 'b16', buildingName: '第二食堂', intensity: 48.1, perCapita: 1.34, isOverStandard: true, overStandardPercent: 20.3 },
        { buildingId: 'b26', buildingName: '东校区食堂', intensity: 39.3, perCapita: 1.09, isOverStandard: false, overStandardPercent: 0 },
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
    anomalyId: 'anomaly-20260723-001',
    anomalyDescription: '综合实验楼A 2026年7月用电量同比上升18.5%，超出正常波动范围',
    rootCauses: [
      {
        id: 'rc-001', cause: '新增实验设备导致基础负荷上升', probability: 0.72, impactLevel: 'high',
        evidence: ['7月新增3台高温炉（总功率45kW）', '设备运行日志显示日均运行12小时'],
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
      { type: 'chart', title: '综合实验楼A 逐时负荷对比', description: '7月 vs 6月 逐时负荷曲线对比', data: {} },
      { type: 'metric', title: '关键指标变化', description: '月用电量: +18.5%, 最大负荷: +12.3%, 负荷率: -5.2%', data: {} },
    ],
  };
}

export function getEnergySavingAdvices(): EnergySavingAdvice[] {
  return [
    { id: 'adv-001', category: 'equipment', title: '更换高效变压器', description: '综合实验楼A 2#变压器负载率偏低且温升异常，建议更换为SCB13型高效变压器', priority: 'high', targetBuilding: '综合实验楼A', targetEnergyType: 'electricity', estimatedSaving: 45000, savingUnit: 'kWh/年', estimatedCostSaving: 36000, paybackMonths: 18, implementationDifficulty: 'hard', status: 'suggested' },
    { id: 'adv-002', category: 'schedule', title: '优化空调运行时段', description: '将图书馆空调提前1小时降低功率运行，利用建筑热惰性维持舒适度', priority: 'medium', targetBuilding: '图书馆', targetEnergyType: 'electricity', estimatedSaving: 22000, savingUnit: 'kWh/年', estimatedCostSaving: 17600, paybackMonths: 0, implementationDifficulty: 'easy', status: 'suggested' },
    { id: 'adv-003', category: 'behavior', title: '推行"人走灯灭"制度', description: '在宿舍楼安装人体感应开关，减少长明灯现象', priority: 'medium', targetBuilding: '学生宿舍1-5号楼', targetEnergyType: 'electricity', estimatedSaving: 18000, savingUnit: 'kWh/年', estimatedCostSaving: 14400, paybackMonths: 6, implementationDifficulty: 'easy', status: 'accepted' },
    { id: 'adv-004', category: 'retrofit', title: '食堂灶具节能改造', description: '将第一食堂传统灶具更换为高效节能灶具，预计节气25%', priority: 'high', targetBuilding: '第一食堂', targetEnergyType: 'gas', estimatedSaving: 8500, savingUnit: 'm³/年', estimatedCostSaving: 34000, paybackMonths: 12, implementationDifficulty: 'medium', status: 'suggested' },
    { id: 'adv-005', category: 'equipment', title: '水泵变频改造', description: '游泳馆循环水泵加装变频器，根据负荷自动调节转速', priority: 'medium', targetBuilding: '游泳馆', targetEnergyType: 'electricity', estimatedSaving: 12000, savingUnit: 'kWh/年', estimatedCostSaving: 9600, paybackMonths: 15, implementationDifficulty: 'medium', status: 'in_progress' },
    { id: 'adv-006', category: 'behavior', title: '实验室设备待机管理', description: '制定实验室设备关机检查清单，杜绝非必要待机能耗', priority: 'low', targetBuilding: '综合实验楼A/B', targetEnergyType: 'electricity', estimatedSaving: 8000, savingUnit: 'kWh/年', estimatedCostSaving: 6400, paybackMonths: 0, implementationDifficulty: 'easy', status: 'suggested' },
    { id: 'adv-007', category: 'retrofit', title: '光伏扩容', description: '在图书馆屋顶新增200kW光伏板，预计年发电22万kWh', priority: 'high', targetBuilding: '图书馆', targetEnergyType: 'electricity', estimatedSaving: 220000, savingUnit: 'kWh/年', estimatedCostSaving: 176000, paybackMonths: 48, implementationDifficulty: 'hard', status: 'suggested' },
    { id: 'adv-008', category: 'schedule', title: '错峰用电方案', description: '将高能耗实验设备运行时段调整至谷电时段（23:00-7:00）', priority: 'medium', targetBuilding: '材料实验楼', targetEnergyType: 'electricity', estimatedSaving: 0, savingUnit: 'kWh/年', estimatedCostSaving: 25000, paybackMonths: 0, implementationDifficulty: 'medium', status: 'suggested' },
  ];
}

// ============================================================
// 页面3：用能日历
// ============================================================

export function getMonthlyEnergySummary(): MonthlyEnergySummary {
  return {
    month: '2026-07',
    totalUsage: { electricity: 591087, water: 11382, gas: 3234, heat: 0, totalTce: 76.8 },
    abnormalDays: 5,
    savingComplianceDays: 18,
    totalDays: 31,
  };
}

export function getCalendarHeatmapDays(): CalendarHeatmapDay[] {
  const days: CalendarHeatmapDay[] = [];
  const baseTce = 2.4;
  for (let d = 1; d <= 31; d++) {
    const dayOfWeek = new Date(2026, 6, d).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const noise = (Math.sin(d * 0.7) * 0.3 + Math.cos(d * 1.1) * 0.2);
    const tce = isWeekend ? baseTce * 0.65 + noise * 0.3 : baseTce + noise;
    const isAbnormal = [3, 11, 18, 24, 29].includes(d);
    days.push({
      date: `2026-07-${String(d).padStart(2, '0')}`,
      totalTce: Math.round(tce * 100) / 100,
      electricity: Math.round(tce * 7500),
      water: Math.round(tce * 145),
      gas: Math.round(tce * 41),
      heat: 0,
      intensity: Math.round(tce * 100 / 2.4) / 100,
      level: isAbnormal ? 'abnormal_high' : isWeekend ? 'weekend' : tce > 2.6 ? 'high' : tce < 2.2 ? 'low' : 'normal',
      isAbnormal,
      hasAlert: isAbnormal,
      alertCount: isAbnormal ? 1 + Math.floor(Math.random() * 3) : 0,
    });
  }
  return days;
}

export function getEnergyProfile(): EnergyProfile {
  const workdayPattern = generateHourlyCurve(1);
  const weekendPattern = generateHourlyCurve(0.65);
  const holidayPattern = generateHourlyCurve(0.35);
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
  const curve = generateHourlyCurve(1);
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

export function getTypicalDayComparison(): TypicalDayComparison {
  return {
    days: [
      { label: '今日', date: '2026-07-23', energyType: 'electricity', data: generateHourlyCurve(1) },
      { label: '昨日', date: '2026-07-22', energyType: 'electricity', data: generateHourlyCurve(0.95) },
      { label: '上周同期', date: '2026-07-16', energyType: 'electricity', data: generateHourlyCurve(0.88) },
      { label: '上月同期', date: '2026-06-23', energyType: 'electricity', data: generateHourlyCurve(0.72) },
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
