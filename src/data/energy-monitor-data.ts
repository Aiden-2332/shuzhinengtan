export interface SankeyNode {
  name: string;
  color: string;
  depth: number;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export type DeviceStatus = "正常" | "预警" | "离线" | "检修";
export type DeviceCategory =
  | "电力计量"
  | "暖通空调"
  | "燃气"
  | "燃油"
  | "可再生"
  | "水务"
  | "照明"
  | "实验科研"
  | "消防安全";

export interface DeviceDetail {
  id: string;
  name: string;
  code: string;
  category: DeviceCategory;
  location: string;
  status: DeviceStatus;
  params: string;
  realtimePower: number;
  todayEnergy: number;
  temperature: number;
  loadRate: number;
  runtime: number;
  installDate: string;
  ratedParams: string;
  lastMaintenance: string;
  nextMaintenance: string;
  responsiblePerson: string;
  meterPointCode: string;
  lastAlarmTime: string;
  alarmHistory: AlarmRecord[];
  trend7d: number[];
  trend30d: number[];
}

export interface AlarmRecord {
  type: "danger" | "warning" | "info";
  description: string;
  time: string;
  status: "pending" | "processing" | "closed";
}

export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  location: string;
  status: "正常" | "预警" | "离线" | "检修";
  power: number;
  energy: number;
  co2: number;
  lastUpdate: string;
}

export interface MonitorMetric {
  label: string;
  value: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  status: "normal" | "warning" | "danger";
}

export const SankeyFlowData: SankeyData = {
  nodes: [
    { name: "天然气", color: "#EF4444", depth: 0 },
    { name: "地热", color: "#10B981", depth: 0 },
    { name: "汽油", color: "#9CA3AF", depth: 0 },
    { name: "柴油", color: "#9CA3AF", depth: 0 },
    { name: "外购电力", color: "#8B5CF6", depth: 0 },
    { name: "其他能源", color: "#F59E0B", depth: 0 },
    { name: "供暖", color: "#F87171", depth: 1 },
    { name: "间接能耗", color: "#6EE7B7", depth: 1 },
    { name: "总耗电量", color: "#34D399", depth: 1 },
    { name: "直接能耗", color: "#93C5FD", depth: 1 },
    { name: "食堂燃气", color: "#FCD34D", depth: 1 },
    { name: "水", color: "#FB923C", depth: 1 },
    { name: "食物", color: "#A78BFA", depth: 1 },
    { name: "纸张", color: "#F87171", depth: 1 },
    { name: "垃圾与废弃物", color: "#60A5FA", depth: 1 },
    { name: "校园交通", color: "#FB923C", depth: 1 },
    { name: "校园建筑维修", color: "#6EE7B7", depth: 2 },
    { name: "外购水源", color: "#F9A8D4", depth: 2 },
    { name: "绿化维护", color: "#86EFAC", depth: 2 },
    { name: "废排水处理", color: "#FDE68A", depth: 2 },
    { name: "用餐行为", color: "#C084FC", depth: 2 },
    { name: "一次性餐具", color: "#D8B4FE", depth: 2 },
    { name: "办公学习用纸", color: "#93C5FD", depth: 2 },
    { name: "书籍", color: "#86EFAC", depth: 2 },
    { name: "卫生用品", color: "#F9A8D4", depth: 2 },
    { name: "纸张回收", color: "#FCA5A5", depth: 2 },
    { name: "快递包装", color: "#FDBA74", depth: 2 },
    { name: "厨余垃圾", color: "#86EFAC", depth: 2 },
    { name: "生活垃圾", color: "#F9A8D4", depth: 2 },
    { name: "科研废弃物", color: "#D8B4FE", depth: 2 },
    { name: "校内机动车", color: "#93C5FD", depth: 2 },
    { name: "校园班车", color: "#86EFAC", depth: 2 },
    { name: "公务车油耗", color: "#FDE68A", depth: 2 },
    { name: "师生通勤", color: "#C084FC", depth: 2 },
    { name: "教职工差旅", color: "#FDE68A", depth: 2 },
    { name: "直接排放(Scope1)", color: "#3B82F6", depth: 3 },
    { name: "间接排放(Scope2)", color: "#8B5CF6", depth: 3 },
    { name: "其他间接排放(Scope3)", color: "#EC4899", depth: 3 },
  ],
  links: [
    { source: 0, target: 6, value: 42 },
    { source: 1, target: 7, value: 15 },
    { source: 1, target: 11, value: 5 },
    { source: 2, target: 11, value: 8 },
    { source: 3, target: 11, value: 6 },
    { source: 4, target: 7, value: 55 },
    { source: 5, target: 7, value: 12 },
    { source: 5, target: 11, value: 18 },
    { source: 6, target: 9, value: 42 },
    { source: 7, target: 8, value: 87 },
    { source: 4, target: 7, value: 55 },
    { source: 5, target: 7, value: 12 },
    { source: 9, target: 33, value: 42 },
    { source: 8, target: 34, value: 87 },
    { source: 10, target: 33, value: 8 },
    { source: 11, target: 12, value: 8 },
    { source: 11, target: 13, value: 6 },
    { source: 11, target: 14, value: 4 },
    { source: 11, target: 15, value: 5 },
    { source: 11, target: 16, value: 7 },
    { source: 11, target: 17, value: 3 },
    { source: 11, target: 18, value: 4 },
    { source: 11, target: 19, value: 3 },
    { source: 11, target: 20, value: 2 },
    { source: 11, target: 21, value: 3 },
    { source: 11, target: 22, value: 4 },
    { source: 11, target: 23, value: 3 },
    { source: 11, target: 24, value: 2 },
    { source: 11, target: 25, value: 5 },
    { source: 11, target: 26, value: 3 },
    { source: 11, target: 27, value: 2 },
    { source: 11, target: 28, value: 4 },
    { source: 11, target: 29, value: 3 },
    { source: 11, target: 30, value: 2 },
    { source: 11, target: 31, value: 3 },
    { source: 11, target: 32, value: 2 },
    { source: 12, target: 35, value: 8 },
    { source: 13, target: 35, value: 6 },
    { source: 14, target: 35, value: 4 },
    { source: 15, target: 35, value: 5 },
    { source: 16, target: 35, value: 7 },
    { source: 17, target: 35, value: 3 },
    { source: 18, target: 35, value: 4 },
    { source: 19, target: 35, value: 3 },
    { source: 20, target: 35, value: 2 },
    { source: 21, target: 35, value: 3 },
    { source: 22, target: 35, value: 4 },
    { source: 23, target: 35, value: 3 },
    { source: 24, target: 35, value: 2 },
    { source: 25, target: 35, value: 5 },
    { source: 26, target: 35, value: 3 },
    { source: 27, target: 35, value: 2 },
    { source: 28, target: 35, value: 4 },
    { source: 29, target: 35, value: 3 },
    { source: 30, target: 35, value: 2 },
    { source: 31, target: 35, value: 3 },
    { source: 32, target: 35, value: 2 },
  ],
};

export const getSankeyDataByCategory = (_category: string): SankeyData => {
  return SankeyFlowData;
};

export const MonitorMetrics: MonitorMetric[] = [
  { label: "实时总功率", value: 2846, unit: "kW", trend: "up", change: 3.2, status: "normal" },
  { label: "日累计用电", value: 68.3, unit: "MWh", trend: "up", change: 5.1, status: "warning" },
  { label: "实时碳排放", value: 1.42, unit: "tCO₂/h", trend: "down", change: 2.8, status: "normal" },
  { label: "设备在线率", value: 97.8, unit: "%", trend: "stable", change: 0, status: "normal" },
  { label: "异常告警数", value: 3, unit: "条", trend: "up", change: 1, status: "danger" },
  { label: "系统能效比", value: 3.42, unit: "COP", trend: "down", change: 0.15, status: "warning" },
];

export const DeviceList: DeviceInfo[] = [
  { id: "AC-001", name: "中央空调机组#1", type: "空调系统", location: "1号教学楼-地下一层", status: "正常", power: 380, energy: 4560, co2: 2.85, lastUpdate: "2026-07-22 11:30" },
  { id: "AC-002", name: "中央空调机组#2", type: "空调系统", location: "2号实验楼-地下一层", status: "正常", power: 420, energy: 5040, co2: 3.15, lastUpdate: "2026-07-22 11:30" },
  { id: "LT-001", name: "LED照明总控", type: "照明系统", location: "全校-配电中心", status: "正常", power: 280, energy: 3360, co2: 2.10, lastUpdate: "2026-07-22 11:28" },
  { id: "BL-001", name: "燃气锅炉#1", type: "锅炉/供热", location: "锅炉房-东区", status: "正常", power: 560, energy: 6720, co2: 4.20, lastUpdate: "2026-07-22 11:25" },
  { id: "BL-002", name: "燃气锅炉#2", type: "锅炉/供热", location: "锅炉房-西区", status: "预警", power: 530, energy: 6360, co2: 3.98, lastUpdate: "2026-07-22 11:20" },
  { id: "PV-001", name: "光伏阵列-教学楼屋顶", type: "新能源", location: "1号教学楼-屋顶", status: "正常", power: -120, energy: -1440, co2: -0.90, lastUpdate: "2026-07-22 11:30" },
  { id: "PV-002", name: "光伏阵列-实验楼屋顶", type: "新能源", location: "2号实验楼-屋顶", status: "正常", power: -80, energy: -960, co2: -0.60, lastUpdate: "2026-07-22 11:30" },
  { id: "PM-001", name: "配电柜-教学楼", type: "配电系统", location: "1号教学楼-配电室", status: "正常", power: 0, energy: 0, co2: 0, lastUpdate: "2026-07-22 11:29" },
  { id: "PM-002", name: "配电柜-实验楼", type: "配电系统", location: "2号实验楼-配电室", status: "离线", power: 0, energy: 0, co2: 0, lastUpdate: "2026-07-22 10:15" },
  { id: "WP-001", name: "水泵变频控制柜", type: "动力系统", location: "水泵房-东区", status: "正常", power: 75, energy: 900, co2: 0.56, lastUpdate: "2026-07-22 11:28" },
  { id: "WP-002", name: "水泵变频控制柜", type: "动力系统", location: "水泵房-西区", status: "检修", power: 0, energy: 0, co2: 0, lastUpdate: "2026-07-22 08:00" },
  { id: "EV-001", name: "电梯群控系统", type: "动力系统", location: "全校-各楼栋", status: "正常", power: 45, energy: 540, co2: 0.34, lastUpdate: "2026-07-22 11:27" },
  { id: "AHU-001", name: "新风机组#1", type: "空调系统", location: "1号教学楼-三层", status: "正常", power: 55, energy: 660, co2: 0.41, lastUpdate: "2026-07-22 11:26" },
  { id: "AHU-002", name: "新风机组#2", type: "空调系统", location: "2号实验楼-五层", status: "预警", power: 60, energy: 720, co2: 0.45, lastUpdate: "2026-07-22 11:22" },
];

export const CategoryOptions = [
  { label: "总碳排", value: "总碳排" },
  { label: "直接排放", value: "scope1" },
  { label: "间接排放", value: "scope2" },
  { label: "其他间接", value: "scope3" },
  { label: "能源结构", value: "energy" },
];

// ========== 35台完整设备数据 ==========

export const AllDevices: DeviceDetail[] = [
  // ===== 电力计量设备（10台）=====
  {
    id: "EM-MAIN-001", name: "全校进线总电表", code: "EM-MAIN-001", category: "电力计量",
    location: "主配电房", status: "正常", params: "10kV/2000kVA",
    realtimePower: 1850, todayEnergy: 12450, temperature: 32, loadRate: 62, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/2000kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [1840, 1860, 1820, 1880, 1850, 1830, 1850],
    trend30d: Array.from({ length: 30 }, (_, i) => 1800 + ((i * 7) % 200)),
  },
  {
    id: "EM-TEACH-001", name: "教学楼区分项电表", code: "EM-TEACH-001", category: "电力计量",
    location: "教学楼A~D总进线", status: "正常", params: "10kV/500kVA",
    realtimePower: 420, todayEnergy: 2850, temperature: 30, loadRate: 55, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/500kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [410, 425, 418, 430, 420, 415, 420],
    trend30d: Array.from({ length: 30 }, (_, i) => 400 + ((i * 5) % 60)),
  },
  {
    id: "EM-DORM-001", name: "宿舍区分项电表", code: "EM-DORM-001", category: "电力计量",
    location: "宿舍1~6号楼总进线", status: "正常", params: "10kV/400kVA",
    realtimePower: 380, todayEnergy: 2450, temperature: 31, loadRate: 48, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/400kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-003",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [375, 382, 378, 385, 380, 372, 380],
    trend30d: Array.from({ length: 30 }, (_, i) => 360 + ((i * 4) % 50)),
  },
  {
    id: "EM-LAB-001", name: "实验楼分项电表", code: "EM-LAB-001", category: "电力计量",
    location: "综合实验楼1~2", status: "预警", params: "10kV/300kVA",
    realtimePower: 350, todayEnergy: 2280, temperature: 38, loadRate: 85, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/300kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-004",
    lastAlarmTime: "2026-07-21 14:32",
    alarmHistory: [
      { type: "danger", description: "负荷率达85%，超过预警阈值", time: "2026-07-21 14:32", status: "pending" },
      { type: "warning", description: "负荷率持续偏高", time: "2026-07-20 10:15", status: "processing" },
    ],
    trend7d: [340, 345, 338, 350, 342, 348, 350],
    trend30d: Array.from({ length: 30 }, (_, i) => 320 + ((i * 3) % 40)),
  },
  {
    id: "EM-CANTEEN-001", name: "食堂分项电表", code: "EM-CANTEEN-001", category: "电力计量",
    location: "食堂1~2座", status: "正常", params: "10kV/200kVA",
    realtimePower: 180, todayEnergy: 1280, temperature: 33, loadRate: 42, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/200kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-005",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [175, 182, 178, 185, 180, 176, 180],
    trend30d: Array.from({ length: 30 }, (_, i) => 160 + ((i * 6) % 50)),
  },
  {
    id: "EM-ADMIN-001", name: "行政楼分项电表", code: "EM-ADMIN-001", category: "电力计量",
    location: "行政楼", status: "正常", params: "10kV/100kVA",
    realtimePower: 85, todayEnergy: 620, temperature: 30, loadRate: 38, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/100kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-006",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [82, 88, 84, 86, 85, 83, 85],
    trend30d: Array.from({ length: 30 }, (_, i) => 75 + ((i * 3) % 25)),
  },
  {
    id: "EM-GYM-001", name: "体育馆分项电表", code: "EM-GYM-001", category: "电力计量",
    location: "体育馆", status: "正常", params: "10kV/150kVA",
    realtimePower: 120, todayEnergy: 860, temperature: 31, loadRate: 35, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "10kV/150kVA", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-007",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [118, 122, 119, 121, 120, 117, 120],
    trend30d: Array.from({ length: 30 }, (_, i) => 110 + ((i * 4) % 30)),
  },
  {
    id: "EM-DC-001", name: "数据中心/机房电表", code: "EM-DC-001", category: "电力计量",
    location: "行政楼B1层机房", status: "预警", params: "380V/80kVA",
    realtimePower: 72, todayEnergy: 520, temperature: 42, loadRate: 78, runtime: 8760,
    installDate: "2019-06-20", ratedParams: "380V/80kVA", lastMaintenance: "2026-05-15", nextMaintenance: "2026-11-15",
    responsiblePerson: "李主管", meterPointCode: "MP-EM-008",
    lastAlarmTime: "2026-07-21 13:15",
    alarmHistory: [
      { type: "warning", description: "UPS负载率持续偏高", time: "2026-07-21 13:15", status: "pending" },
    ],
    trend7d: [70, 73, 71, 74, 72, 70, 72],
    trend30d: Array.from({ length: 30 }, (_, i) => 65 + ((i * 2) % 15)),
  },
  {
    id: "EM-DORM-F-001", name: "宿舍楼层电表", code: "EM-DORM-F-001", category: "电力计量",
    location: "宿舍各楼层", status: "正常", params: "380V/50A/层",
    realtimePower: 45, todayEnergy: 320, temperature: 29, loadRate: 32, runtime: 8760,
    installDate: "2018-03-15", ratedParams: "380V/50A/层", lastMaintenance: "2026-06-10", nextMaintenance: "2026-12-10",
    responsiblePerson: "张工程师", meterPointCode: "MP-EM-009",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [44, 46, 45, 47, 45, 44, 45],
    trend30d: Array.from({ length: 30 }, (_, i) => 40 + ((i * 3) % 15)),
  },
  {
    id: "EM-EV-001", name: "充电桩电表", code: "EM-EV-001", category: "电力计量",
    location: "校园充电桩区域", status: "正常", params: "380V/120kW",
    realtimePower: 65, todayEnergy: 480, temperature: 35, loadRate: 28, runtime: 8760,
    installDate: "2022-09-01", ratedParams: "380V/120kW", lastMaintenance: "2026-04-20", nextMaintenance: "2026-10-20",
    responsiblePerson: "王科员", meterPointCode: "MP-EM-010",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [62, 66, 64, 68, 65, 63, 65],
    trend30d: Array.from({ length: 30 }, (_, i) => 55 + ((i * 5) % 30)),
  },

  // ===== 暖通空调设备（8台）=====
  {
    id: "HVAC-TEACH-001", name: "中央空调机组-教学区", code: "HVAC-TEACH-001", category: "暖通空调",
    location: "教学楼A冷冻站", status: "正常", params: "制冷量1200kW×2",
    realtimePower: 850, todayEnergy: 6120, temperature: 7, loadRate: 72, runtime: 5840,
    installDate: "2016-05-10", ratedParams: "制冷量1200kW×2", lastMaintenance: "2026-05-20", nextMaintenance: "2026-11-20",
    responsiblePerson: "赵技师", meterPointCode: "MP-HVAC-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [840, 860, 845, 855, 850, 842, 850],
    trend30d: Array.from({ length: 30 }, (_, i) => 800 + ((i * 7) % 120)),
  },
  {
    id: "HVAC-DORM-001", name: "中央空调机组-宿舍区", code: "HVAC-DORM-001", category: "暖通空调",
    location: "宿舍区机房", status: "正常", params: "制冷量800kW×2",
    realtimePower: 580, todayEnergy: 4180, temperature: 6, loadRate: 65, runtime: 5840,
    installDate: "2016-05-10", ratedParams: "制冷量800kW×2", lastMaintenance: "2026-05-20", nextMaintenance: "2026-11-20",
    responsiblePerson: "赵技师", meterPointCode: "MP-HVAC-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [575, 585, 578, 582, 580, 576, 580],
    trend30d: Array.from({ length: 30 }, (_, i) => 550 + ((i * 5) % 80)),
  },
  {
    id: "HVAC-ADMIN-001", name: "中央空调机组-行政区", code: "HVAC-ADMIN-001", category: "暖通空调",
    location: "行政楼机房", status: "检修", params: "制冷量400kW×1",
    realtimePower: 0, todayEnergy: 0, temperature: 25, loadRate: 0, runtime: 5840,
    installDate: "2016-05-10", ratedParams: "制冷量400kW×1", lastMaintenance: "2026-07-20", nextMaintenance: "2026-07-22",
    responsiblePerson: "赵技师", meterPointCode: "MP-HVAC-003",
    lastAlarmTime: "2026-07-21 09:00",
    alarmHistory: [
      { type: "info", description: "进入检修模式", time: "2026-07-21 09:00", status: "processing" },
    ],
    trend7d: [280, 275, 270, 260, 250, 100, 0],
    trend30d: Array.from({ length: 30 }, (_, i) => i >= 27 ? 0 : 250 + ((i * 4) % 50)),
  },
  {
    id: "HVAC-LIB-001", name: "中央空调机组-图书馆", code: "HVAC-LIB-001", category: "暖通空调",
    location: "图书馆冷冻站", status: "正常", params: "制冷量600kW×1",
    realtimePower: 420, todayEnergy: 3020, temperature: 7, loadRate: 58, runtime: 5840,
    installDate: "2016-05-10", ratedParams: "制冷量600kW×1", lastMaintenance: "2026-05-20", nextMaintenance: "2026-11-20",
    responsiblePerson: "赵技师", meterPointCode: "MP-HVAC-004",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [415, 425, 418, 422, 420, 416, 420],
    trend30d: Array.from({ length: 30 }, (_, i) => 390 + ((i * 6) % 70)),
  },
  {
    id: "BLR-EAST-001", name: "东区燃气锅炉", code: "BLR-EAST-001", category: "暖通空调",
    location: "东校区锅炉房", status: "正常", params: "蒸汽量10t/h",
    realtimePower: 680, todayEnergy: 4890, temperature: 180, loadRate: 75, runtime: 4320,
    installDate: "2015-10-15", ratedParams: "蒸汽量10t/h", lastMaintenance: "2026-04-10", nextMaintenance: "2026-10-10",
    responsiblePerson: "钱工", meterPointCode: "MP-BLR-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [670, 685, 675, 682, 680, 672, 680],
    trend30d: Array.from({ length: 30 }, (_, i) => 620 + ((i * 8) % 140)),
  },
  {
    id: "BLR-WEST-001", name: "西区燃气锅炉", code: "BLR-WEST-001", category: "暖通空调",
    location: "西校区锅炉房", status: "预警", params: "蒸汽量8t/h",
    realtimePower: 520, todayEnergy: 3740, temperature: 195, loadRate: 82, runtime: 4320,
    installDate: "2015-10-15", ratedParams: "蒸汽量8t/h", lastMaintenance: "2026-04-10", nextMaintenance: "2026-10-10",
    responsiblePerson: "钱工", meterPointCode: "MP-BLR-002",
    lastAlarmTime: "2026-07-21 11:48",
    alarmHistory: [
      { type: "warning", description: "排烟温度偏高", time: "2026-07-21 11:48", status: "pending" },
    ],
    trend7d: [510, 525, 515, 522, 520, 512, 520],
    trend30d: Array.from({ length: 30 }, (_, i) => 480 + ((i * 6) % 100)),
  },
  {
    id: "HEX-MAIN-001", name: "换热站设备", code: "HEX-MAIN-001", category: "暖通空调",
    location: "主校区换热站", status: "正常", params: "换热量5MW",
    realtimePower: 120, todayEnergy: 860, temperature: 85, loadRate: 52, runtime: 4320,
    installDate: "2015-10-15", ratedParams: "换热量5MW", lastMaintenance: "2026-04-10", nextMaintenance: "2026-10-10",
    responsiblePerson: "钱工", meterPointCode: "MP-HEX-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [118, 122, 119, 121, 120, 117, 120],
    trend30d: Array.from({ length: 30 }, (_, i) => 110 + ((i * 4) % 30)),
  },
  {
    id: "GSHP-001", name: "地源热泵机组", code: "GSHP-001", category: "暖通空调",
    location: "实验楼2旁能源站", status: "离线", params: "制热量500kW",
    realtimePower: 0, todayEnergy: 0, temperature: 25, loadRate: 0, runtime: 4320,
    installDate: "2020-06-01", ratedParams: "制热量500kW", lastMaintenance: "2026-03-15", nextMaintenance: "2026-09-15",
    responsiblePerson: "钱工", meterPointCode: "MP-GSHP-001",
    lastAlarmTime: "2026-07-21 08:22",
    alarmHistory: [
      { type: "info", description: "通信模块离线", time: "2026-07-21 08:22", status: "pending" },
    ],
    trend7d: [320, 310, 280, 200, 120, 0, 0],
    trend30d: Array.from({ length: 30 }, (_, i) => i >= 25 ? 0 : 300 + ((i * 5) % 60)),
  },

  // ===== 燃气设备（4台）=====
  {
    id: "GAS-MAIN-001", name: "燃气计量总表", code: "GAS-MAIN-001", category: "燃气",
    location: "校园燃气调压站", status: "正常", params: "DN150/低压",
    realtimePower: 0, todayEnergy: 0, temperature: 28, loadRate: 0, runtime: 8760,
    installDate: "2015-01-10", ratedParams: "DN150/低压", lastMaintenance: "2026-06-01", nextMaintenance: "2026-12-01",
    responsiblePerson: "孙技师", meterPointCode: "MP-GAS-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "GAS-CANTEEN-001", name: "食堂燃气灶具计量表", code: "GAS-CANTEEN-001", category: "燃气",
    location: "食堂1~2座厨房", status: "正常", params: "DN80",
    realtimePower: 0, todayEnergy: 0, temperature: 30, loadRate: 0, runtime: 8760,
    installDate: "2015-01-10", ratedParams: "DN80", lastMaintenance: "2026-06-01", nextMaintenance: "2026-12-01",
    responsiblePerson: "孙技师", meterPointCode: "MP-GAS-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "GAS-LAB-001", name: "实验室燃气计量表", code: "GAS-LAB-001", category: "燃气",
    location: "综合实验楼1", status: "正常", params: "DN50",
    realtimePower: 0, todayEnergy: 0, temperature: 29, loadRate: 0, runtime: 8760,
    installDate: "2015-01-10", ratedParams: "DN50", lastMaintenance: "2026-06-01", nextMaintenance: "2026-12-01",
    responsiblePerson: "孙技师", meterPointCode: "MP-GAS-003",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "GAS-HW-001", name: "热水锅炉燃气表", code: "GAS-HW-001", category: "燃气",
    location: "宿舍区热水间", status: "离线", params: "DN65",
    realtimePower: 0, todayEnergy: 0, temperature: 25, loadRate: 0, runtime: 8760,
    installDate: "2015-01-10", ratedParams: "DN65", lastMaintenance: "2026-06-01", nextMaintenance: "2026-12-01",
    responsiblePerson: "孙技师", meterPointCode: "MP-GAS-004",
    lastAlarmTime: "2026-07-15 16:30",
    alarmHistory: [
      { type: "warning", description: "通信中断超过48小时", time: "2026-07-15 16:30", status: "processing" },
    ],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },

  // ===== 燃油设备（2台）=====
  {
    id: "DG-001", name: "备用柴油发电机", code: "DG-001", category: "燃油",
    location: "主配电房旁", status: "正常", params: "500kW",
    realtimePower: 0, todayEnergy: 0, temperature: 30, loadRate: 0, runtime: 120,
    installDate: "2016-08-20", ratedParams: "500kW", lastMaintenance: "2026-05-15", nextMaintenance: "2026-11-15",
    responsiblePerson: "周工", meterPointCode: "MP-FUEL-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "FUEL-VEH-001", name: "校车加油记录终端", code: "FUEL-VEH-001", category: "燃油",
    location: "后勤车队", status: "正常", params: "月度汇总",
    realtimePower: 0, todayEnergy: 0, temperature: 25, loadRate: 0, runtime: 8760,
    installDate: "2016-08-20", ratedParams: "月度汇总", lastMaintenance: "2026-05-15", nextMaintenance: "2026-11-15",
    responsiblePerson: "周工", meterPointCode: "MP-FUEL-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },

  // ===== 可再生能源设备（4台）=====
  {
    id: "PV-TEACH-001", name: "屋顶光伏阵列-教学楼", code: "PV-TEACH-001", category: "可再生",
    location: "教学楼A~D楼顶", status: "正常", params: "200kWp",
    realtimePower: -180, todayEnergy: -1280, temperature: 45, loadRate: 72, runtime: 4380,
    installDate: "2021-03-20", ratedParams: "200kWp", lastMaintenance: "2026-06-15", nextMaintenance: "2026-12-15",
    responsiblePerson: "吴技师", meterPointCode: "MP-PV-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [-175, -185, -178, -182, -180, -176, -180],
    trend30d: Array.from({ length: 30 }, (_, i) => -(160 + ((i * 5) % 40))),
  },
  {
    id: "PV-ADMIN-001", name: "屋顶光伏阵列-行政楼", code: "PV-ADMIN-001", category: "可再生",
    location: "行政楼楼顶", status: "正常", params: "80kWp",
    realtimePower: -72, todayEnergy: -520, temperature: 44, loadRate: 68, runtime: 4380,
    installDate: "2021-03-20", ratedParams: "80kWp", lastMaintenance: "2026-06-15", nextMaintenance: "2026-12-15",
    responsiblePerson: "吴技师", meterPointCode: "MP-PV-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [-70, -74, -71, -73, -72, -69, -72],
    trend30d: Array.from({ length: 30 }, (_, i) => -(60 + ((i * 3) % 20))),
  },
  {
    id: "PV-INV-001", name: "光伏逆变器组", code: "PV-INV-001", category: "可再生",
    location: "各光伏并网柜", status: "检修", params: "100kW×3",
    realtimePower: 0, todayEnergy: 0, temperature: 35, loadRate: 0, runtime: 4380,
    installDate: "2021-03-20", ratedParams: "100kW×3", lastMaintenance: "2026-07-18", nextMaintenance: "2026-07-25",
    responsiblePerson: "吴技师", meterPointCode: "MP-PV-003",
    lastAlarmTime: "2026-07-18 08:00",
    alarmHistory: [
      { type: "info", description: "计划检修中", time: "2026-07-18 08:00", status: "processing" },
    ],
    trend7d: [-250, -240, -220, -180, -100, 0, 0],
    trend30d: Array.from({ length: 30 }, (_, i) => i >= 25 ? 0 : -(220 + ((i * 4) % 50))),
  },
  {
    id: "ESS-001", name: "光储充一体化设备", code: "ESS-001", category: "可再生",
    location: "充电桩区域", status: "正常", params: "储能200kWh",
    realtimePower: -45, todayEnergy: -320, temperature: 38, loadRate: 55, runtime: 8760,
    installDate: "2023-06-01", ratedParams: "储能200kWh", lastMaintenance: "2026-04-10", nextMaintenance: "2026-10-10",
    responsiblePerson: "吴技师", meterPointCode: "MP-ESS-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [-42, -48, -44, -46, -45, -43, -45],
    trend30d: Array.from({ length: 30 }, (_, i) => -(35 + ((i * 4) % 25))),
  },

  // ===== 水务设备（4台）=====
  {
    id: "WATER-MAIN-001", name: "自来水总表", code: "WATER-MAIN-001", category: "水务",
    location: "校园进水总阀", status: "正常", params: "DN200",
    realtimePower: 0, todayEnergy: 0, temperature: 22, loadRate: 0, runtime: 8760,
    installDate: "2014-05-10", ratedParams: "DN200", lastMaintenance: "2026-03-20", nextMaintenance: "2026-09-20",
    responsiblePerson: "郑技师", meterPointCode: "MP-WATER-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "WATER-REC-001", name: "中水回用处理设备", code: "WATER-REC-001", category: "水务",
    location: "后勤污水处理站", status: "正常", params: "50t/d",
    realtimePower: 15, todayEnergy: 108, temperature: 26, loadRate: 45, runtime: 5840,
    installDate: "2019-08-15", ratedParams: "50t/d", lastMaintenance: "2026-05-10", nextMaintenance: "2026-11-10",
    responsiblePerson: "郑技师", meterPointCode: "MP-WATER-002",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [14, 16, 15, 17, 15, 14, 15],
    trend30d: Array.from({ length: 30 }, (_, i) => 12 + ((i * 2) % 8)),
  },
  {
    id: "WATER-RAIN-001", name: "雨水收集系统", code: "WATER-RAIN-001", category: "水务",
    location: "教学楼区域地下", status: "离线", params: "200m³",
    realtimePower: 0, todayEnergy: 0, temperature: 24, loadRate: 0, runtime: 8760,
    installDate: "2020-04-10", ratedParams: "200m³", lastMaintenance: "2026-02-15", nextMaintenance: "2026-08-15",
    responsiblePerson: "郑技师", meterPointCode: "MP-WATER-003",
    lastAlarmTime: "2026-07-10 09:00",
    alarmHistory: [
      { type: "warning", description: "液位传感器故障", time: "2026-07-10 09:00", status: "pending" },
    ],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },
  {
    id: "WATER-EFF-001", name: "污水排放计量表", code: "WATER-EFF-001", category: "水务",
    location: "校园总排口", status: "正常", params: "DN150",
    realtimePower: 0, todayEnergy: 0, temperature: 23, loadRate: 0, runtime: 8760,
    installDate: "2014-05-10", ratedParams: "DN150", lastMaintenance: "2026-03-20", nextMaintenance: "2026-09-20",
    responsiblePerson: "郑技师", meterPointCode: "MP-WATER-004",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    trend30d: Array.from({ length: 30 }, () => 0),
  },

  // ===== 照明设备（1台）=====
  {
    id: "LED-CTRL-001", name: "LED照明总控系统", code: "LED-CTRL-001", category: "照明",
    location: "全校公共区域", status: "预警", params: "总功率45kW",
    realtimePower: 38, todayEnergy: 274, temperature: 32, loadRate: 84, runtime: 4380,
    installDate: "2022-01-10", ratedParams: "总功率45kW", lastMaintenance: "2026-04-05", nextMaintenance: "2026-10-05",
    responsiblePerson: "冯技师", meterPointCode: "MP-LED-001",
    lastAlarmTime: "2026-07-20 22:30",
    alarmHistory: [
      { type: "warning", description: "部分区域照度传感器异常", time: "2026-07-20 22:30", status: "processing" },
    ],
    trend7d: [36, 39, 37, 40, 38, 36, 38],
    trend30d: Array.from({ length: 30 }, (_, i) => 32 + ((i * 3) % 12)),
  },

  // ===== 实验/科研设备（1台）=====
  {
    id: "LAB-EQ-001", name: "大型科研仪器集群", code: "LAB-EQ-001", category: "实验科研",
    location: "综合实验楼1~2", status: "检修", params: "总功率120kW",
    realtimePower: 0, todayEnergy: 0, temperature: 28, loadRate: 0, runtime: 3200,
    installDate: "2017-09-01", ratedParams: "总功率120kW", lastMaintenance: "2026-07-19", nextMaintenance: "2026-07-26",
    responsiblePerson: "陈教授", meterPointCode: "MP-LAB-001",
    lastAlarmTime: "2026-07-19 07:00",
    alarmHistory: [
      { type: "info", description: "年度校准维护", time: "2026-07-19 07:00", status: "processing" },
    ],
    trend7d: [85, 82, 78, 70, 50, 0, 0],
    trend30d: Array.from({ length: 30 }, (_, i) => i >= 25 ? 0 : 80 + ((i * 3) % 20)),
  },

  // ===== 消防/安全设备（1台）=====
  {
    id: "FIRE-GAS-001", name: "消防气体灭火系统总控", code: "FIRE-GAS-001", category: "消防安全",
    location: "全校", status: "正常", params: "七氟丙烷/IG541",
    realtimePower: 2, todayEnergy: 14, temperature: 27, loadRate: 5, runtime: 8760,
    installDate: "2018-11-01", ratedParams: "七氟丙烷/IG541", lastMaintenance: "2026-06-01", nextMaintenance: "2026-12-01",
    responsiblePerson: "安保处", meterPointCode: "MP-FIRE-001",
    lastAlarmTime: "—",
    alarmHistory: [],
    trend7d: [2, 2, 2, 2, 2, 2, 2],
    trend30d: Array.from({ length: 30 }, () => 2),
  },
];

export const DeviceCategories: DeviceCategory[] = [
  "电力计量", "暖通空调", "燃气", "燃油", "可再生", "水务", "照明", "实验科研", "消防安全",
];

export const BuildingOptions = [
  "教学楼A", "教学楼B", "教学楼C", "教学楼D",
  "宿舍1号楼", "宿舍2号楼", "宿舍3号楼", "宿舍4号楼", "宿舍5号楼", "宿舍6号楼",
  "综合实验楼1", "综合实验楼2",
  "食堂1座", "食堂2座",
  "行政楼", "体育馆", "主配电房",
];

export const SortOptions = [
  { label: "名称", value: "name" },
  { label: "状态优先级（预警优先）", value: "status" },
  { label: "楼栋", value: "location" },
  { label: "最近告警时间", value: "alarm" },
];

export const DeviceStatusOrder: Record<DeviceStatus, number> = {
  "预警": 0,
  "离线": 1,
  "检修": 2,
  "正常": 3,
};
