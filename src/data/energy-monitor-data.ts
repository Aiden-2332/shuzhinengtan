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
    { name: "总碳排放", color: "#F472B6", depth: 0 },
    { name: "1号教学楼", color: "#93C5FD", depth: 1 },
    { name: "2号实验楼", color: "#93C5FD", depth: 1 },
    { name: "3号宿舍楼", color: "#93C5FD", depth: 1 },
    { name: "4号食堂", color: "#93C5FD", depth: 1 },
    { name: "5号行政楼", color: "#93C5FD", depth: 1 },
    { name: "教学区", color: "#60A5FA", depth: 2 },
    { name: "实验区", color: "#60A5FA", depth: 2 },
    { name: "生活区", color: "#60A5FA", depth: 2 },
    { name: "公共区", color: "#60A5FA", depth: 2 },
    { name: "空调系统", color: "#818CF8", depth: 3 },
    { name: "照明系统", color: "#818CF8", depth: 3 },
    { name: "动力设备", color: "#818CF8", depth: 3 },
    { name: "办公设备", color: "#818CF8", depth: 3 },
    { name: "锅炉/供热", color: "#818CF8", depth: 3 },
  ],
  links: [
    { source: 0, target: 1, value: 4960 },
    { source: 0, target: 2, value: 2800 },
    { source: 0, target: 3, value: 1380 },
    { source: 0, target: 4, value: 670 },
    { source: 0, target: 5, value: 180 },
    { source: 1, target: 6, value: 2480 },
    { source: 1, target: 9, value: 2480 },
    { source: 2, target: 7, value: 2800 },
    { source: 3, target: 8, value: 1380 },
    { source: 4, target: 8, value: 670 },
    { source: 5, target: 9, value: 180 },
    { source: 6, target: 10, value: 1240 },
    { source: 6, target: 11, value: 620 },
    { source: 6, target: 12, value: 620 },
    { source: 7, target: 10, value: 1120 },
    { source: 7, target: 12, value: 840 },
    { source: 7, target: 14, value: 840 },
    { source: 8, target: 10, value: 820 },
    { source: 8, target: 11, value: 410 },
    { source: 8, target: 13, value: 410 },
    { source: 8, target: 14, value: 410 },
    { source: 9, target: 10, value: 1330 },
    { source: 9, target: 11, value: 665 },
    { source: 9, target: 13, value: 665 },
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
  { label: "集中供冷", value: "cooling" },
  { label: "集中供热", value: "heating" },
  { label: "电", value: "electricity" },
  { label: "煤气", value: "gas" },
  { label: "天然气", value: "natural_gas" },
];