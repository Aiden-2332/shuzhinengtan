export type EnergyType =
  | "combined"
  | "electricity"
  | "water"
  | "gas"
  | "heat"
  | "solar"
  | "storage"
  | "other";

export type FlowStatus = "normal" | "attention" | "warning" | "critical";
export type FlowNodeType = "input" | "conversion" | "building" | "enduse" | "device" | "result";

export interface EnergyFlowNode {
  id: string;
  name: string;
  type: FlowNodeType;
  level: number;
  energyType: EnergyType;
  value: number;
  rawUnit: string;
  standardCoal: number;
  carbonEmission: number;
  cost: number;
  status: FlowStatus;
  dataQuality: number;
  campusId?: "main" | "east" | "west";
  buildingType?: string;
  buildingId?: string;
  parentId?: string;
  canDrillDown: boolean;
  isEstimated?: boolean;
  peakValue?: number;
  peakTime?: string;
  yearOnYear: number;
  monthOnMonth: number;
}

export interface EnergyFlowLink {
  id: string;
  source: string;
  target: string;
  value: number;
  energyType: Exclude<EnergyType, "combined">;
  lossRate: number;
  standardCoal: number;
  carbonEmission: number;
  cost: number;
  yearOnYear: number;
  monthOnMonth: number;
  status: FlowStatus;
  meterIds: string[];
}

export const ENERGY_META: Record<EnergyType, { label: string; color: string; unit: string }> = {
  combined: { label: "综合能源", color: "#2563eb", unit: "tce" },
  electricity: { label: "电力", color: "#2563eb", unit: "kWh" },
  water: { label: "水", color: "#06b6d4", unit: "m³" },
  gas: { label: "天然气", color: "#f59e0b", unit: "m³" },
  heat: { label: "热力", color: "#ef4444", unit: "GJ" },
  solar: { label: "光伏", color: "#22c55e", unit: "kWh" },
  storage: { label: "储能", color: "#8b5cf6", unit: "kWh" },
  other: { label: "其他能源", color: "#64748b", unit: "tce" },
};

export const STATUS_META: Record<FlowStatus, { label: string; color: string }> = {
  normal: { label: "正常", color: "#16a34a" },
  attention: { label: "关注", color: "#f59e0b" },
  warning: { label: "预警", color: "#f97316" },
  critical: { label: "严重异常", color: "#dc2626" },
};

const input = (
  id: string,
  name: string,
  energyType: Exclude<EnergyType, "combined">,
  value: number,
  standardCoal: number,
  carbonEmission: number,
  cost: number,
  overrides: Partial<EnergyFlowNode> = {},
): EnergyFlowNode => ({
  id,
  name,
  type: "input",
  level: 0,
  energyType,
  value,
  rawUnit: ENERGY_META[energyType].unit,
  standardCoal,
  carbonEmission,
  cost,
  status: "normal",
  dataQuality: 99.2,
  canDrillDown: true,
  peakValue: value * 1.16,
  peakTime: "2026-07-29 14:15",
  yearOnYear: -3.2,
  monthOnMonth: 2.4,
  ...overrides,
});

const processNode = (
  id: string,
  name: string,
  type: FlowNodeType,
  level: number,
  energyType: EnergyType,
  standardCoal: number,
  overrides: Partial<EnergyFlowNode> = {},
): EnergyFlowNode => ({
  id,
  name,
  type,
  level,
  energyType,
  value: standardCoal,
  rawUnit: energyType === "combined" ? "tce" : ENERGY_META[energyType].unit,
  standardCoal,
  carbonEmission: standardCoal * 2.26,
  cost: standardCoal * 0.34,
  status: "normal",
  dataQuality: 97.8,
  canDrillDown: type !== "result",
  peakValue: standardCoal * 1.22,
  peakTime: "2026-07-29 15:00",
  yearOnYear: -1.8,
  monthOnMonth: 2.1,
  ...overrides,
});

export const ENERGY_FLOW_NODES: EnergyFlowNode[] = [
  input("grid", "市政电网", "electricity", 890000, 109.4, 365.3, 61.4),
  input("solar", "光伏发电", "solar", 126000, 15.5, 0, 5.1, { yearOnYear: 12.8 }),
  input("gas", "天然气", "gas", 38600, 51.7, 83.6, 14.2, { status: "attention" }),
  input("heat", "市政热力", "heat", 3580, 42.8, 96.4, 18.7),
  input("water", "自来水", "water", 12600, 8.9, 11.4, 4.8),
  input("storage-discharge", "储能放电", "storage", 24300, 3.0, 8.2, 1.6, { monthOnMonth: 8.6 }),
  input("other-input", "其他能源", "other", 7.2, 7.2, 15.8, 2.6, { dataQuality: 72, isEstimated: true }),

  processNode("distribution", "变配电系统", "conversion", 1, "electricity", 118.6, {
    status: "warning",
    yearOnYear: 4.8,
    dataQuality: 96.1,
  }),
  processNode("solar-storage", "光储系统", "conversion", 1, "solar", 17.9),
  processNode("boiler", "锅炉系统", "conversion", 1, "gas", 31.2, { status: "attention" }),
  processNode("heat-station", "换热站", "conversion", 1, "heat", 39.6),
  processNode("central-ac", "中央空调系统", "conversion", 1, "electricity", 44.8, { status: "attention" }),
  processNode("water-system", "给水系统", "conversion", 1, "water", 8.4),
  processNode("hot-water", "热水系统", "conversion", 1, "gas", 15.1),
  processNode("storage-system", "储能系统", "conversion", 1, "storage", 5.4),
  processNode("distribution-loss", "输配损耗", "conversion", 1, "electricity", 9.1, {
    status: "warning",
    yearOnYear: 7.6,
    dataQuality: 91.8,
  }),
  processNode("conversion-loss", "转换损耗", "conversion", 1, "combined", 8.7, { status: "attention" }),

  processNode("teaching", "主教学楼", "building", 2, "combined", 19.8, {
    campusId: "main", buildingId: "teaching", buildingType: "teaching",
  }),
  processNode("lab-a", "综合实验楼A", "building", 2, "combined", 35.3, {
    campusId: "main", buildingId: "lab-a", buildingType: "laboratory", status: "attention", yearOnYear: 6.8,
  }),
  processNode("lab-b", "综合实验楼B", "building", 2, "combined", 24.6, {
    campusId: "east", buildingId: "lab-b", buildingType: "laboratory",
  }),
  processNode("library", "图书馆", "building", 2, "combined", 14.8, {
    campusId: "main", buildingId: "library", buildingType: "library",
  }),
  processNode("canteen-1", "第一食堂", "building", 2, "combined", 15.2, {
    campusId: "main", buildingId: "canteen-1", buildingType: "canteen", status: "warning", yearOnYear: 12.6,
  }),
  processNode("canteen-2", "第二食堂", "building", 2, "combined", 9.6, {
    campusId: "east", buildingId: "canteen-2", buildingType: "canteen",
  }),
  processNode("dorm-1", "学生宿舍1号楼", "building", 2, "combined", 11.8, {
    campusId: "main", buildingId: "dorm-1", buildingType: "dormitory",
  }),
  processNode("dorm-2", "学生宿舍2号楼", "building", 2, "combined", 12.1, {
    campusId: "east", buildingId: "dorm-2", buildingType: "dormitory",
  }),
  processNode("dorm-3", "学生宿舍3号楼", "building", 2, "combined", 13.4, {
    campusId: "west", buildingId: "dorm-3", buildingType: "dormitory", status: "critical", yearOnYear: 16.5,
  }),
  processNode("office", "行政办公楼", "building", 2, "combined", 10.2, {
    campusId: "main", buildingId: "office", buildingType: "office",
  }),
  processNode("gym", "体育馆", "building", 2, "combined", 8.8, {
    campusId: "west", buildingId: "gym", buildingType: "sports", dataQuality: 84.2, isEstimated: true,
  }),
  processNode("public-area", "公共区域", "building", 2, "combined", 7.5, {
    campusId: "main", buildingId: "public-area", buildingType: "other", dataQuality: 68.5, isEstimated: true,
  }),

  processNode("cooling", "空调制冷", "enduse", 3, "electricity", 38.6, { status: "attention" }),
  processNode("heating", "采暖", "enduse", 3, "heat", 31.4),
  processNode("lighting", "照明", "enduse", 3, "electricity", 19.1),
  processNode("lab-equipment", "实验设备", "enduse", 3, "electricity", 27.8, { status: "attention" }),
  processNode("teaching-equipment", "教学设备", "enduse", 3, "electricity", 13.6),
  processNode("office-equipment", "办公设备", "enduse", 3, "electricity", 9.4),
  processNode("elevator", "电梯", "enduse", 3, "electricity", 5.3),
  processNode("cooking", "炊事", "enduse", 3, "gas", 17.6, { status: "warning" }),
  processNode("domestic-hot-water", "生活热水", "enduse", 3, "gas", 12.2),
  processNode("data-room", "数据机房", "enduse", 3, "electricity", 11.8),
  processNode("charging", "充电设施", "enduse", 3, "electricity", 7.6),
  processNode("water-equipment", "给排水设备", "enduse", 3, "water", 7.9),
  processNode("other-power", "其他动力设备", "enduse", 3, "other", 8.3, { dataQuality: 78.2, isEstimated: true }),

  processNode("chiller-1", "冷水机组1号", "device", 4, "electricity", 15.8, { status: "attention", canDrillDown: false }),
  processNode("lab-device-group", "大型实验设备组", "device", 4, "electricity", 13.2, { canDrillDown: false }),
  processNode("lighting-loop-1", "照明回路1组", "device", 4, "electricity", 7.4, { canDrillDown: false }),
  processNode("kitchen-stove-1", "燃气灶具1组", "device", 4, "gas", 8.6, { status: "warning", canDrillDown: false }),
  processNode("pump-1", "给水泵1号", "device", 4, "water", 3.7, { canDrillDown: false }),
  processNode("other-devices", "其他设备（聚合）", "device", 4, "other", 6.2, { dataQuality: 78.2, isEstimated: true, canDrillDown: false }),

  processNode("effective", "有效用能", "result", 5, "combined", 165.8),
  processNode("result-conversion-loss", "转换损耗结果", "result", 5, "combined", 8.7, { status: "attention" }),
  processNode("result-distribution-loss", "输配损耗结果", "result", 5, "electricity", 9.1, { status: "warning" }),
  processNode("standby-loss", "待机损耗", "result", 5, "electricity", 2.6, { status: "attention" }),
  processNode("abnormal-loss", "异常损耗", "result", 5, "combined", 2.1, { status: "critical" }),
  processNode("unmetered", "未计量能源", "result", 5, "other", 1.3, { dataQuality: 62, isEstimated: true, status: "warning" }),
];

const flow = (
  id: string,
  source: string,
  target: string,
  standardCoal: number,
  energyType: Exclude<EnergyType, "combined">,
  overrides: Partial<EnergyFlowLink> = {},
): EnergyFlowLink => ({
  id,
  source,
  target,
  value: standardCoal / Math.max(0.0001, energyType === "water" ? 0.00071 : energyType === "gas" ? 0.00133 : energyType === "heat" ? 0.03412 : 0.0001229),
  energyType,
  lossRate: 1.8,
  standardCoal,
  carbonEmission: standardCoal * (energyType === "solar" ? 0.08 : 2.26),
  cost: standardCoal * 0.34,
  yearOnYear: -2.1,
  monthOnMonth: 1.8,
  status: "normal",
  meterIds: [`M-${id.toUpperCase().slice(0, 8)}`],
  ...overrides,
});

export const ENERGY_FLOW_LINKS: EnergyFlowLink[] = [
  flow("grid-distribution", "grid", "distribution", 109.4, "electricity", { lossRate: 0.8 }),
  flow("solar-solar-storage", "solar", "solar-storage", 15.5, "solar", { yearOnYear: 12.8 }),
  flow("solar-storage-distribution", "solar-storage", "distribution", 12.1, "solar", { lossRate: 1.2 }),
  flow("storage-discharge-system", "storage-discharge", "storage-system", 3.0, "storage"),
  flow("storage-system-distribution", "storage-system", "distribution", 2.8, "storage", { lossRate: 3.7 }),
  flow("gas-boiler", "gas", "boiler", 31.2, "gas", { lossRate: 2.4 }),
  flow("gas-hot-water", "gas", "hot-water", 12.8, "gas"),
  flow("gas-canteen", "gas", "canteen-1", 7.7, "gas", { status: "warning", yearOnYear: 12.6 }),
  flow("heat-heat-station", "heat", "heat-station", 42.8, "heat", { lossRate: 1.9 }),
  flow("water-water-system", "water", "water-system", 8.9, "water", { lossRate: 1.1 }),
  flow("other-public", "other-input", "public-area", 7.2, "other", { status: "attention" }),

  flow("distribution-teaching", "distribution", "teaching", 16.8, "electricity"),
  flow("distribution-lab-a", "distribution", "lab-a", 28.6, "electricity", { status: "attention", yearOnYear: 6.8 }),
  flow("distribution-lab-b", "distribution", "lab-b", 20.4, "electricity"),
  flow("distribution-library", "distribution", "library", 11.4, "electricity"),
  flow("distribution-canteen-1", "distribution", "canteen-1", 6.3, "electricity"),
  flow("distribution-canteen-2", "distribution", "canteen-2", 5.7, "electricity"),
  flow("distribution-dorm-1", "distribution", "dorm-1", 7.8, "electricity"),
  flow("distribution-dorm-2", "distribution", "dorm-2", 8.1, "electricity"),
  flow("distribution-dorm-3", "distribution", "dorm-3", 9.4, "electricity", { status: "critical", yearOnYear: 16.5 }),
  flow("distribution-office", "distribution", "office", 8.6, "electricity"),
  flow("distribution-gym", "distribution", "gym", 6.8, "electricity"),
  flow("distribution-public", "distribution", "public-area", 5.1, "electricity"),
  flow("distribution-loss-link", "distribution", "distribution-loss", 9.1, "electricity", { lossRate: 4.8, status: "warning", yearOnYear: 7.6 }),
  flow("boiler-dorm-1", "boiler", "dorm-1", 4.0, "gas"),
  flow("boiler-dorm-2", "boiler", "dorm-2", 4.1, "gas"),
  flow("boiler-dorm-3", "boiler", "dorm-3", 4.0, "gas", { status: "attention" }),
  flow("heat-station-library", "heat-station", "library", 3.4, "heat"),
  flow("heat-station-dorm-1", "heat-station", "dorm-1", 5.2, "heat"),
  flow("heat-station-dorm-2", "heat-station", "dorm-2", 5.1, "heat"),
  flow("heat-station-dorm-3", "heat-station", "dorm-3", 5.0, "heat"),
  flow("water-system-teaching", "water-system", "teaching", 1.6, "water"),
  flow("water-system-lab-a", "water-system", "lab-a", 2.1, "water"),
  flow("water-system-lab-b", "water-system", "lab-b", 1.8, "water"),
  flow("water-system-dorm", "water-system", "dorm-3", 1.7, "water", { status: "attention" }),

  flow("lab-a-cooling", "lab-a", "cooling", 13.8, "electricity", { status: "attention" }),
  flow("lab-a-lab-equipment", "lab-a", "lab-equipment", 14.6, "electricity"),
  flow("lab-b-cooling", "lab-b", "cooling", 8.4, "electricity"),
  flow("lab-b-lab-equipment", "lab-b", "lab-equipment", 10.1, "electricity"),
  flow("teaching-lighting", "teaching", "lighting", 7.8, "electricity"),
  flow("teaching-equipment-link", "teaching", "teaching-equipment", 8.2, "electricity"),
  flow("library-cooling", "library", "cooling", 5.3, "electricity"),
  flow("library-lighting", "library", "lighting", 5.1, "electricity"),
  flow("canteen-cooking", "canteen-1", "cooking", 11.2, "gas", { status: "warning", yearOnYear: 12.6 }),
  flow("canteen-lighting", "canteen-1", "lighting", 3.8, "electricity"),
  flow("dorm3-hot-water", "dorm-3", "domestic-hot-water", 5.4, "gas"),
  flow("dorm3-lighting", "dorm-3", "lighting", 4.2, "electricity", { status: "critical", yearOnYear: 16.5 }),
  flow("office-office-equipment", "office", "office-equipment", 5.1, "electricity"),
  flow("office-cooling", "office", "cooling", 4.4, "electricity"),
  flow("gym-heating", "gym", "heating", 5.6, "heat"),
  flow("public-charging", "public-area", "charging", 3.7, "electricity"),
  flow("public-water", "public-area", "water-equipment", 2.6, "water"),
  flow("public-other", "public-area", "other-power", 3.1, "other", { status: "attention" }),

  flow("cooling-chiller-1", "cooling", "chiller-1", 15.8, "electricity", { status: "attention" }),
  flow("lab-equipment-device-group", "lab-equipment", "lab-device-group", 13.2, "electricity"),
  flow("lighting-loop", "lighting", "lighting-loop-1", 7.4, "electricity"),
  flow("cooking-stove", "cooking", "kitchen-stove-1", 8.6, "gas", { status: "warning" }),
  flow("water-pump", "water-equipment", "pump-1", 3.7, "water"),
  flow("other-devices-link", "other-power", "other-devices", 6.2, "other", { status: "attention" }),

  flow("cooling-effective", "cooling", "effective", 35.1, "electricity"),
  flow("heating-effective", "heating", "effective", 29.6, "heat"),
  flow("lighting-effective", "lighting", "effective", 18.2, "electricity"),
  flow("lab-equipment-effective", "lab-equipment", "effective", 26.8, "electricity"),
  flow("teaching-equipment-effective", "teaching-equipment", "effective", 13.1, "electricity"),
  flow("office-equipment-effective", "office-equipment", "effective", 8.9, "electricity"),
  flow("cooking-effective", "cooking", "effective", 16.2, "gas"),
  flow("hot-water-effective", "domestic-hot-water", "effective", 11.3, "gas"),
  flow("water-equipment-effective", "water-equipment", "effective", 7.4, "water"),
  flow("distribution-loss-result", "distribution-loss", "result-distribution-loss", 9.1, "electricity", { status: "warning", lossRate: 4.8 }),
  flow("conversion-loss-result", "conversion-loss", "result-conversion-loss", 8.7, "other", { status: "attention" }),
  flow("cooling-standby", "cooling", "standby-loss", 2.6, "electricity", { status: "attention" }),
  flow("dorm3-abnormal", "dorm-3", "abnormal-loss", 2.1, "electricity", { status: "critical", yearOnYear: 16.5 }),
  flow("public-unmetered", "public-area", "unmetered", 1.3, "other", { status: "warning" }),
];

export const CAMPUS_BUILDINGS = [
  { id: "teaching", name: "主教学楼", campus: "main", type: "teaching" },
  { id: "lab-a", name: "综合实验楼A", campus: "main", type: "laboratory" },
  { id: "lab-b", name: "综合实验楼B", campus: "east", type: "laboratory" },
  { id: "library", name: "图书馆", campus: "main", type: "library" },
  { id: "canteen-1", name: "第一食堂", campus: "main", type: "canteen" },
  { id: "canteen-2", name: "第二食堂", campus: "east", type: "canteen" },
  { id: "dorm-1", name: "学生宿舍1号楼", campus: "main", type: "dormitory" },
  { id: "dorm-2", name: "学生宿舍2号楼", campus: "east", type: "dormitory" },
  { id: "dorm-3", name: "学生宿舍3号楼", campus: "west", type: "dormitory" },
  { id: "office", name: "行政办公楼", campus: "main", type: "office" },
  { id: "gym", name: "体育馆", campus: "west", type: "sports" },
  { id: "public-area", name: "公共区域", campus: "main", type: "other" },
];

export const KEY_FINDINGS = [
  { id: "f1", nodeId: "lab-a", title: "综合实验楼A为最大用能建筑", detail: "占全校综合能耗18.6%，实验设备与空调制冷贡献最高。", severity: "attention" as FlowStatus, impact: 35.3 },
  { id: "f2", nodeId: "cooling", title: "中央空调系统为最大终端用能系统", detail: "占终端有效用能31.2%，工作日下午负荷集中。", severity: "attention" as FlowStatus, impact: 38.6 },
  { id: "f3", nodeId: "distribution-loss", title: "变配电系统损耗率偏高", detail: "当前损耗率4.8%，高于基准值1.2个百分点。", severity: "warning" as FlowStatus, impact: 9.1 },
  { id: "f4", nodeId: "dorm-3", title: "学生宿舍3号楼夜间负荷异常", detail: "夜间用电同比增长16.5%，主要集中在23:00—01:00。", severity: "critical" as FlowStatus, impact: 2.1 },
  { id: "f5", nodeId: "solar-storage", title: "光伏自用率仍有提升空间", detail: "当前自用率78.3%，午间存在可转移清洁电力。", severity: "attention" as FlowStatus, impact: 3.4 },
  { id: "f6", nodeId: "canteen-1", title: "第一食堂天然气单耗偏高", detail: "高于同类食堂平均值12.6%，建议开展燃气设备能效检测。", severity: "warning" as FlowStatus, impact: 7.7 },
];

export const ENERGY_ANOMALIES = [
  { id: "a1", nodeId: "dorm-3", name: "学生宿舍3号楼", type: "夜间高耗能", current: 486, baseline: 417, deviation: 16.5, time: "07-29 23:15", severity: "critical" as FlowStatus, state: "待处理" },
  { id: "a2", nodeId: "distribution-loss", name: "变配电系统", type: "损耗率过高", current: 4.8, baseline: 3.6, deviation: 33.3, time: "07-29 15:20", severity: "warning" as FlowStatus, state: "分析中" },
  { id: "a3", nodeId: "canteen-1", name: "第一食堂", type: "设备低效率运行", current: 1.26, baseline: 1.0, deviation: 26, time: "07-29 12:10", severity: "warning" as FlowStatus, state: "待处理" },
  { id: "a4", nodeId: "solar-storage", name: "光储系统", type: "光伏出力异常", current: 78.3, baseline: 85, deviation: -7.9, time: "07-29 13:35", severity: "attention" as FlowStatus, state: "已确认" },
];

export const ENERGY_SUGGESTIONS = [
  { id: "s1", nodeId: "lab-a", title: "优化综合实验楼A空调运行时间", problem: "非教学时段空调延迟停机", saving: 12.6, carbon: 28.4, cost: 9.7, difficulty: "低", priority: "高" },
  { id: "s2", nodeId: "distribution-loss", title: "排查变配电系统线路损耗", problem: "输配损耗率高于基准", saving: 8.9, carbon: 20.1, cost: 6.8, difficulty: "中", priority: "高" },
  { id: "s3", nodeId: "solar-storage", title: "提升光伏自发自用比例", problem: "午间光伏消纳不足", saving: 5.8, carbon: 13.1, cost: 4.2, difficulty: "中", priority: "中" },
  { id: "s4", nodeId: "storage-system", title: "调整储能峰谷充放电策略", problem: "峰段放电响应不充分", saving: 4.6, carbon: 7.8, cost: 5.5, difficulty: "中", priority: "中" },
  { id: "s5", nodeId: "dorm-3", title: "排查宿舍3号楼夜间异常负荷", problem: "夜间基线同比增长16.5%", saving: 6.4, carbon: 14.5, cost: 4.9, difficulty: "低", priority: "高" },
  { id: "s6", nodeId: "canteen-1", title: "开展第一食堂燃气设备能效检测", problem: "燃气单耗高于同类均值", saving: 3.9, carbon: 8.8, cost: 3.1, difficulty: "低", priority: "中" },
];

export const TREND_DATA = Array.from({ length: 24 }, (_, index) => {
  const inputValue = 5.6 + Math.sin((index - 7) / 3) * 1.2 + (index > 8 && index < 20 ? 2.4 : 0);
  const abnormal = index === 23;
  return {
    time: `${String(index).padStart(2, "0")}:00`,
    input: Number(inputValue.toFixed(2)),
    effective: Number((inputValue * (abnormal ? 0.76 : 0.874)).toFixed(2)),
    loss: Number((inputValue * (abnormal ? 0.24 : 0.126)).toFixed(2)),
    efficiency: abnormal ? 76 : Number((86.8 + Math.sin(index / 4) * 1.8).toFixed(1)),
    comparison: Number((inputValue * 0.976).toFixed(2)),
    abnormal,
    nodeId: abnormal ? "dorm-3" : undefined,
  };
});

export const BALANCE_ROWS = [
  { energyType: "electricity" as EnergyType, input: 127.9, output: 111.8, loss: 14.3, difference: 1.8, rate: 98.6, quality: 99.1 },
  { energyType: "water" as EnergyType, input: 8.9, output: 8.2, loss: 0.5, difference: 0.2, rate: 97.8, quality: 96.4 },
  { energyType: "gas" as EnergyType, input: 51.7, output: 45.1, loss: 5.4, difference: 1.2, rate: 97.7, quality: 98.2 },
  { energyType: "heat" as EnergyType, input: 42.8, output: 38.9, loss: 3.2, difference: 0.7, rate: 98.4, quality: 97.5 },
  { energyType: "solar" as EnergyType, input: 15.5, output: 12.1, loss: 1.2, difference: 2.2, rate: 85.8, quality: 93.6 },
  { energyType: "storage" as EnergyType, input: 5.4, output: 4.9, loss: 0.2, difference: 0.3, rate: 94.4, quality: 91.2 },
];

export const RANKING_ROWS = [
  { id: "lab-a", name: "综合实验楼A", type: "建筑", value: 35.3, share: 18.6, yoy: 6.8, mom: 3.2, intensity: 18.9, carbon: 79.8, status: "attention" as FlowStatus },
  { id: "lab-b", name: "综合实验楼B", type: "建筑", value: 24.6, share: 13.0, yoy: -2.4, mom: 1.1, intensity: 16.2, carbon: 55.6, status: "normal" as FlowStatus },
  { id: "teaching", name: "主教学楼", type: "建筑", value: 19.8, share: 10.4, yoy: -3.1, mom: 0.8, intensity: 12.8, carbon: 44.7, status: "normal" as FlowStatus },
  { id: "canteen-1", name: "第一食堂", type: "建筑", value: 15.2, share: 8.0, yoy: 12.6, mom: 5.4, intensity: 21.6, carbon: 34.4, status: "warning" as FlowStatus },
  { id: "library", name: "图书馆", type: "建筑", value: 14.8, share: 7.8, yoy: -1.6, mom: 1.9, intensity: 10.7, carbon: 33.4, status: "normal" as FlowStatus },
  { id: "dorm-3", name: "学生宿舍3号楼", type: "建筑", value: 13.4, share: 7.1, yoy: 16.5, mom: 7.8, intensity: 14.2, carbon: 30.3, status: "critical" as FlowStatus },
];
