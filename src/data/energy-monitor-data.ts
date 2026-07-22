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
    // 层级 0: 能源来源
    { name: "天然气", color: "#EF4444", depth: 0 },
    { name: "地热", color: "#10B981", depth: 0 },
    { name: "汽油", color: "#9CA3AF", depth: 0 },
    { name: "柴油", color: "#9CA3AF", depth: 0 },
    { name: "外购电力", color: "#8B5CF6", depth: 0 },
    { name: "其他能源", color: "#F59E0B", depth: 0 },

    // 层级 1: 中间活动/消耗环节
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

    // 层级 2: 细分活动
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

    // 层级 3: 核算范围
    { name: "直接排放(Scope1)", color: "#3B82F6", depth: 3 },
    { name: "间接排放(Scope2)", color: "#8B5CF6", depth: 3 },
    { name: "其他间接排放(Scope3)", color: "#EC4899", depth: 3 },
  ],
  links: [
    // 能源来源 → 中间活动
    { source: 0, target: 6, value: 42 },
    { source: 1, target: 7, value: 15 },
    { source: 1, target: 11, value: 5 },
    { source: 2, target: 11, value: 8 },
    { source: 3, target: 11, value: 6 },
    { source: 4, target: 7, value: 55 },
    { source: 5, target: 7, value: 12 },
    { source: 5, target: 11, value: 18 },

    // 供暖 → 直接能耗
    { source: 6, target: 9, value: 42 },

    // 间接能耗 → 总耗电量
    { source: 7, target: 8, value: 87 },

    // 外购电力 → 间接能耗
    { source: 4, target: 7, value: 55 },
    { source: 5, target: 7, value: 12 },

    // 直接能耗 → Scope1
    { source: 9, target: 33, value: 42 },

    // 总耗电量 → Scope2
    { source: 8, target: 34, value: 87 },

    // 食堂燃气 → Scope1
    { source: 10, target: 33, value: 8 },

    // 其他 → 水/食物/纸张/垃圾/交通
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

    // 水/食物/纸张/垃圾/交通细分 → Scope3
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

export const getSankeyDataByCategory = (category: string): SankeyData => {
  if (category === "总碳排") return SankeyFlowData;
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