/**
 * 校园三维场景数据定义
 * 
 * 基于 DGN/CAD 总平面图解析结果构建的虚拟高校数据
 * 坐标系：局部米制坐标系，原点为校园中心
 * 
 * 数据层次：
 * 1. 校园全局信息 (CampusInfo)
 * 2. 建筑数据 (BuildingData) - 从CAD解析+人工补充
 * 3. 道路数据 (RoadData) - 从CAD解析
 * 4. 绿地数据 (GreenSpaceData) - 从CAD解析
 * 5. 水系数据 (WaterBodyData) - 从CAD解析
 * 6. 运动场数据 (SportsFieldData) - 从CAD解析
 * 7. 停车场数据 (ParkingLotData) - 从CAD解析
 * 8. 环境装饰数据 (树木/路灯位置) - 程序化+人工补充
 */

// ============================================================
// 类型定义
// ============================================================

export type BuildingType =
  | "teaching"     // 教学楼
  | "lab"          // 实验楼
  | "library"      // 图书馆
  | "dorm"         // 宿舍
  | "dining"       // 食堂
  | "gym"          // 体育馆
  | "admin"        // 行政楼
  | "auditorium"   // 大礼堂
  | "solar";       // 光伏配电房

export type EmissionLevel = "low" | "medium" | "high" | "critical";

export interface BuildingData {
  buildingId: string;
  name: string;
  type: BuildingType;
  /** 建筑底部中心 X 坐标 (米) */
  x: number;
  /** 建筑底部中心 Z 坐标 (米) */
  z: number;
  /** 建筑宽度 (米) - 沿 X 轴 */
  width: number;
  /** 建筑深度 (米) - 沿 Z 轴 */
  depth: number;
  /** 建筑高度 (米) */
  height: number;
  /** 楼层数 */
  floors: number;
  /** 层高 (米) */
  floorHeight: number;
  /** 建筑旋转角度 (弧度, 绕 Y 轴) */
  rotation: number;
  /** 管理部门 */
  dept: string;
  /** 碳排放量 tCO₂/年 */
  emission: number;
  /** 碳排等级 */
  emissionLevel: EmissionLevel;
  /** 主色 */
  color: string;
  /** 建筑翼 (L形/T形等附加体量) */
  wings?: Array<{
    offsetX: number;
    offsetZ: number;
    width: number;
    depth: number;
    height: number;
  }>;
}

export interface RoadData {
  id: string;
  /** 道路中心线路点 (米) */
  points: Array<{ x: number; z: number }>;
  /** 道路宽度 (米) */
  width: number;
  /** 道路类型 */
  type: "main" | "secondary" | "sidewalk" | "path";
}

export interface GreenSpaceData {
  id: string;
  type: "lawn" | "flowerbed" | "hedge";
  /** 中心坐标 */
  x: number;
  z: number;
  /** 尺寸 (矩形近似) */
  width: number;
  depth: number;
  rotation?: number;
}

export interface WaterBodyData {
  id: string;
  name: string;
  x: number;
  z: number;
  /** 湖泊用半径, 河流用宽度 */
  radiusX: number;
  radiusZ: number;
  type: "lake" | "pond" | "stream";
}

export interface SportsFieldData {
  id: string;
  name: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  type: "track" | "basketball" | "tennis";
  rotation?: number;
}

export interface ParkingLotData {
  id: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  capacity: number;
}

export interface TreePlacement {
  x: number;
  z: number;
  scale: number;
  variant: number; // 0-3 树木变体
}

export interface StreetLightPlacement {
  x: number;
  z: number;
}

export interface CampusData {
  info: CampusInfo;
  buildings: BuildingData[];
  roads: RoadData[];
  greenSpaces: GreenSpaceData[];
  waterBodies: WaterBodyData[];
  sportsFields: SportsFieldData[];
  parkingLots: ParkingLotData[];
  trees: TreePlacement[];
  streetLights: StreetLightPlacement[];
}

export interface CampusInfo {
  name: string;
  /** 校园总面积 (m²) */
  totalArea: number;
  /** 建筑总面积 (m²) */
  buildingArea: number;
  /** 在校人数 */
  population: number;
  /** 校区数量 */
  campusCount: number;
  /** 坐标系说明 */
  coordinateSystem: string;
  /** 数据来源 */
  dataSource: string;
  /** 解析时间戳 */
  parsedAt: string;
}

// ============================================================
// 虚拟高校数据 - 基于 CAD 总平面图解析
// ============================================================

const CAMPUS_INFO: CampusInfo = {
  name: "华清大学",
  totalArea: 480000,
  buildingArea: 185000,
  population: 22000,
  campusCount: 2,
  coordinateSystem: "局部米制坐标系，原点=校园中心广场",
  dataSource: "DGN总平面图解析 + 人工校验",
  parsedAt: "2026-07-23T10:00:00Z",
};

// ============================================================
// 建筑数据 - 29栋建筑
// 布局参考：主校区对称式布局
// 北部 = 教学区, 中部 = 科研/行政, 南部 = 生活区, 东部 = 体育区
// ============================================================

const BUILDINGS: BuildingData[] = [
  // ── 教学区（北部） ──
  {
    buildingId: "b01", name: "主教学楼", type: "teaching",
    x: -25, z: -55, width: 32, depth: 14, height: 30, floors: 10, floorHeight: 3,
    rotation: 0, dept: "综合教学", emission: 950, emissionLevel: "high",
    color: "#c4956a",
    wings: [{ offsetX: 0, offsetZ: 10, width: 12, depth: 8, height: 24 }],
  },
  {
    buildingId: "b02", name: "第一教学楼", type: "teaching",
    x: 15, z: -55, width: 26, depth: 13, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "综合教学", emission: 820, emissionLevel: "high",
    color: "#c4956a",
  },
  {
    buildingId: "b03", name: "第二教学楼", type: "teaching",
    x: 50, z: -50, width: 24, depth: 12, height: 24, floors: 8, floorHeight: 3,
    rotation: 0, dept: "综合教学", emission: 750, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b04", name: "第三教学楼", type: "teaching",
    x: -55, z: -40, width: 22, depth: 12, height: 21, floors: 7, floorHeight: 3,
    rotation: Math.PI / 6, dept: "综合教学", emission: 680, emissionLevel: "medium",
    color: "#c4956a",
  },

  // ── 院系实验区（中北部） ──
  {
    buildingId: "b05", name: "信息学院楼", type: "lab",
    x: -55, z: -15, width: 22, depth: 15, height: 24, floors: 8, floorHeight: 3,
    rotation: 0, dept: "信息学院", emission: 780, emissionLevel: "high",
    color: "#e8dcc8",
    wings: [{ offsetX: 14, offsetZ: 0, width: 10, depth: 10, height: 18 }],
  },
  {
    buildingId: "b06", name: "机械学院楼", type: "lab",
    x: -30, z: -20, width: 22, depth: 14, height: 24, floors: 8, floorHeight: 3,
    rotation: 0, dept: "机械学院", emission: 820, emissionLevel: "high",
    color: "#e8dcc8",
  },
  {
    buildingId: "b07", name: "材料学院楼", type: "lab",
    x: -5, z: -22, width: 20, depth: 13, height: 21, floors: 7, floorHeight: 3,
    rotation: 0, dept: "材料学院", emission: 720, emissionLevel: "medium",
    color: "#e8dcc8",
  },
  {
    buildingId: "b08", name: "能源学院楼", type: "lab",
    x: 20, z: -20, width: 20, depth: 13, height: 21, floors: 7, floorHeight: 3,
    rotation: 0, dept: "能源学院", emission: 680, emissionLevel: "medium",
    color: "#e8dcc8",
  },
  {
    buildingId: "b09", name: "经管学院楼", type: "lab",
    x: 45, z: -18, width: 20, depth: 12, height: 18, floors: 6, floorHeight: 3,
    rotation: 0, dept: "经管学院", emission: 620, emissionLevel: "medium",
    color: "#e8dcc8",
  },

  // ── 中心区 ──
  {
    buildingId: "b10", name: "图书馆", type: "library",
    x: -15, z: -5, width: 28, depth: 22, height: 30, floors: 8, floorHeight: 3.5,
    rotation: 0, dept: "图书馆", emission: 480, emissionLevel: "medium",
    color: "#d4c5b0",
    wings: [
      { offsetX: -18, offsetZ: 0, width: 8, depth: 16, height: 24 },
      { offsetX: 18, offsetZ: 0, width: 8, depth: 16, height: 24 },
    ],
  },
  {
    buildingId: "b11", name: "行政办公楼", type: "admin",
    x: 30, z: -5, width: 22, depth: 15, height: 21, floors: 7, floorHeight: 3,
    rotation: 0, dept: "行政部门", emission: 420, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b12", name: "大礼堂", type: "auditorium",
    x: 55, z: 0, width: 30, depth: 25, height: 18, floors: 3, floorHeight: 5,
    rotation: 0, dept: "校办", emission: 350, emissionLevel: "low",
    color: "#b8a088",
  },

  // ── 生活区（南部） ──
  {
    buildingId: "b13", name: "1号宿舍楼", type: "dorm",
    x: -60, z: 25, width: 16, depth: 12, height: 30, floors: 10, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 520, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b14", name: "2号宿舍楼", type: "dorm",
    x: -40, z: 25, width: 16, depth: 12, height: 30, floors: 10, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 500, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b15", name: "3号宿舍楼", type: "dorm",
    x: -20, z: 25, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 480, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b16", name: "4号宿舍楼", type: "dorm",
    x: 0, z: 25, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 460, emissionLevel: "medium",
    color: "#c4956a",
  },
  {
    buildingId: "b17", name: "5号宿舍楼", type: "dorm",
    x: 20, z: 25, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 440, emissionLevel: "low",
    color: "#c4956a",
  },
  {
    buildingId: "b18", name: "6号宿舍楼", type: "dorm",
    x: 40, z: 25, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 420, emissionLevel: "low",
    color: "#c4956a",
  },
  {
    buildingId: "b19", name: "7号宿舍楼", type: "dorm",
    x: -50, z: 45, width: 16, depth: 12, height: 30, floors: 10, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 400, emissionLevel: "low",
    color: "#c4956a",
  },
  {
    buildingId: "b20", name: "8号宿舍楼", type: "dorm",
    x: -30, z: 45, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 380, emissionLevel: "low",
    color: "#c4956a",
  },
  {
    buildingId: "b21", name: "9号宿舍楼", type: "dorm",
    x: -10, z: 45, width: 16, depth: 12, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 360, emissionLevel: "low",
    color: "#c4956a",
  },
  {
    buildingId: "b22", name: "10号宿舍楼", type: "dorm",
    x: 10, z: 45, width: 16, depth: 12, height: 24, floors: 8, floorHeight: 3,
    rotation: 0, dept: "宿舍管理中心", emission: 340, emissionLevel: "low",
    color: "#c4956a",
  },

  // ── 食堂区 ──
  {
    buildingId: "b23", name: "第一食堂", type: "dining",
    x: -35, z: 8, width: 20, depth: 15, height: 12, floors: 3, floorHeight: 4,
    rotation: 0, dept: "餐饮服务中心", emission: 580, emissionLevel: "high",
    color: "#d4a574",
  },
  {
    buildingId: "b24", name: "第二食堂", type: "dining",
    x: 35, z: 12, width: 20, depth: 15, height: 12, floors: 3, floorHeight: 4,
    rotation: 0, dept: "餐饮服务中心", emission: 520, emissionLevel: "high",
    color: "#d4a574",
  },

  // ── 体育区（东部） ──
  {
    buildingId: "b25", name: "综合体育馆", type: "gym",
    x: 70, z: -15, width: 35, depth: 28, height: 16, floors: 3, floorHeight: 5,
    rotation: 0, dept: "体育部", emission: 380, emissionLevel: "low",
    color: "#c0c8d4",
  },
  {
    buildingId: "b26", name: "游泳馆", type: "gym",
    x: 70, z: 25, width: 28, depth: 22, height: 12, floors: 2, floorHeight: 6,
    rotation: 0, dept: "体育部", emission: 320, emissionLevel: "low",
    color: "#a8c4d4",
  },

  // ── 科研区（西部） ──
  {
    buildingId: "b27", name: "科研楼A", type: "lab",
    x: -70, z: -5, width: 22, depth: 15, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "科研院", emission: 880, emissionLevel: "high",
    color: "#e8dcc8",
  },
  {
    buildingId: "b28", name: "科研楼B", type: "lab",
    x: -70, z: 20, width: 22, depth: 15, height: 27, floors: 9, floorHeight: 3,
    rotation: 0, dept: "科研院", emission: 820, emissionLevel: "high",
    color: "#e8dcc8",
  },

  // ── 能源设施 ──
  {
    buildingId: "b29", name: "光伏配电房", type: "solar",
    x: 70, z: 55, width: 14, depth: 10, height: 6, floors: 1, floorHeight: 6,
    rotation: 0, dept: "后勤能源", emission: -150, emissionLevel: "low",
    color: "#8b7355",
  },
];

// ============================================================
// 道路数据 - 主干道 + 环路 + 支路
// ============================================================

const ROADS: RoadData[] = [
  // 东西主干道 (校园大道)
  {
    id: "road-main-ew",
    points: [
      { x: -90, z: -35 }, { x: -50, z: -35 }, { x: 0, z: -35 },
      { x: 50, z: -35 }, { x: 90, z: -35 },
    ],
    width: 10, type: "main",
  },
  // 南北主干道
  {
    id: "road-main-ns",
    points: [
      { x: -45, z: -80 }, { x: -45, z: -40 }, { x: -45, z: 0 },
      { x: -45, z: 40 }, { x: -45, z: 70 },
    ],
    width: 10, type: "main",
  },
  // 中心环路 - 北段
  {
    id: "road-ring-n",
    points: [
      { x: -80, z: -35 }, { x: -60, z: -45 }, { x: -30, z: -48 },
      { x: 0, z: -48 }, { x: 30, z: -45 }, { x: 60, z: -35 },
    ],
    width: 8, type: "main",
  },
  // 中心环路 - 南段
  {
    id: "road-ring-s",
    points: [
      { x: -80, z: 35 }, { x: -60, z: 38 }, { x: -30, z: 38 },
      { x: 0, z: 38 }, { x: 30, z: 38 }, { x: 60, z: 35 },
    ],
    width: 8, type: "main",
  },
  // 中心环路 - 西段
  {
    id: "road-ring-w",
    points: [
      { x: -80, z: -35 }, { x: -82, z: 0 }, { x: -80, z: 35 },
    ],
    width: 8, type: "main",
  },
  // 中心环路 - 东段
  {
    id: "road-ring-e",
    points: [
      { x: 60, z: -35 }, { x: 58, z: 0 }, { x: 60, z: 35 },
    ],
    width: 8, type: "main",
  },
  // 生活区横路
  {
    id: "road-dorm-1",
    points: [
      { x: -65, z: 15 }, { x: -40, z: 15 }, { x: -20, z: 15 },
      { x: 0, z: 15 }, { x: 25, z: 15 },
    ],
    width: 6, type: "secondary",
  },
  // 科研区纵路
  {
    id: "road-sci",
    points: [
      { x: -58, z: -45 }, { x: -58, z: -20 }, { x: -58, z: 0 },
      { x: -58, z: 15 }, { x: -58, z: 35 },
    ],
    width: 6, type: "secondary",
  },
  // 食堂支路
  {
    id: "road-dining",
    points: [
      { x: -35, z: -5 }, { x: -35, z: 8 }, { x: -35, z: 15 },
    ],
    width: 5, type: "secondary",
  },
  // 体育区道路
  {
    id: "road-sports",
    points: [
      { x: 58, z: -15 }, { x: 70, z: -15 },
    ],
    width: 6, type: "secondary",
  },
  // 中心广场步行道
  {
    id: "road-plaza-ns",
    points: [
      { x: 0, z: -35 }, { x: 0, z: -20 }, { x: 0, z: -5 },
      { x: 0, z: 10 }, { x: 0, z: 15 },
    ],
    width: 4, type: "sidewalk",
  },
  {
    id: "road-plaza-ew",
    points: [
      { x: -45, z: -5 }, { x: -20, z: -5 }, { x: 0, z: -5 },
      { x: 20, z: -5 }, { x: 40, z: -5 },
    ],
    width: 4, type: "sidewalk",
  },
];

// ============================================================
// 绿地数据
// ============================================================

const GREEN_SPACES: GreenSpaceData[] = [
  // 中心广场绿地
  { id: "green-plaza", type: "lawn", x: 0, z: -5, width: 25, depth: 20 },
  // 教学区前绿地
  { id: "green-teach", type: "lawn", x: -25, z: -42, width: 30, depth: 6 },
  { id: "green-teach2", type: "lawn", x: 15, z: -42, width: 25, depth: 6 },
  // 宿舍区绿地
  { id: "green-dorm", type: "lawn", x: -30, z: 35, width: 60, depth: 8 },
  // 湖滨绿地
  { id: "green-lake", type: "lawn", x: 20, z: 55, width: 40, depth: 15 },
  // 花坛
  { id: "green-flower1", type: "flowerbed", x: -15, z: -15, width: 8, depth: 4 },
  { id: "green-flower2", type: "flowerbed", x: 15, z: -15, width: 8, depth: 4 },
  // 绿篱
  { id: "green-hedge1", type: "hedge", x: -45, z: -25, width: 30, depth: 1.5 },
  { id: "green-hedge2", type: "hedge", x: -45, z: 10, width: 30, depth: 1.5 },
];

// ============================================================
// 水系数据
// ============================================================

const WATER_BODIES: WaterBodyData[] = [
  {
    id: "water-lake",
    name: "未名湖",
    x: 20, z: 55,
    radiusX: 25, radiusZ: 18,
    type: "lake",
  },
  {
    id: "water-pond",
    name: "中心喷泉",
    x: 0, z: -5,
    radiusX: 4, radiusZ: 4,
    type: "pond",
  },
];

// ============================================================
// 运动场数据
// ============================================================

const SPORTS_FIELDS: SportsFieldData[] = [
  {
    id: "sport-track",
    name: "东操场",
    x: 70, z: 55, width: 40, depth: 28,
    type: "track",
  },
  {
    id: "sport-basketball1",
    name: "篮球场",
    x: 55, z: 35, width: 15, depth: 10,
    type: "basketball",
  },
  {
    id: "sport-tennis",
    name: "网球场",
    x: 45, z: 35, width: 10, depth: 8,
    type: "tennis",
  },
];

// ============================================================
// 停车场数据
// ============================================================

const PARKING_LOTS: ParkingLotData[] = [
  { id: "park-north", x: -85, z: -35, width: 18, depth: 12, capacity: 60 },
  { id: "park-east", x: 85, z: 0, width: 14, depth: 10, capacity: 40 },
  { id: "park-south", x: 40, z: 60, width: 16, depth: 10, capacity: 50 },
];

// ============================================================
// 树木位置 - 程序化生成 (确定性, 无 Math.random)
// ============================================================

function generateTreePositions(): TreePlacement[] {
  const trees: TreePlacement[] = [];
  
  // 使用确定性伪随机
  const seed = 42;
  let s = seed;
  const nextRand = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return (s % 1000) / 1000;
  };

  // 主干道两侧行道树
  for (let x = -85; x <= 85; x += 8) {
    trees.push({ x, z: -32, scale: 0.9 + nextRand() * 0.3, variant: Math.floor(nextRand() * 4) });
    trees.push({ x, z: -38, scale: 0.9 + nextRand() * 0.3, variant: Math.floor(nextRand() * 4) });
  }

  // 南北主干道两侧
  for (let z = -75; z <= 65; z += 8) {
    trees.push({ x: -42, z, scale: 0.9 + nextRand() * 0.3, variant: Math.floor(nextRand() * 4) });
    trees.push({ x: -48, z, scale: 0.9 + nextRand() * 0.3, variant: Math.floor(nextRand() * 4) });
  }

  // 环路内侧
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
    const r = 72 + nextRand() * 5;
    trees.push({
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r * 0.6,
      scale: 0.85 + nextRand() * 0.35,
      variant: Math.floor(nextRand() * 4),
    });
  }

  // 建筑周边绿化
  const buildingOffsets = [
    { cx: -25, cz: -48, r: 22 },
    { cx: 15, cz: -48, r: 18 },
    { cx: -15, cz: 2, r: 20 },
    { cx: 30, cz: 2, r: 16 },
    { cx: -35, cz: 15, r: 14 },
    { cx: 35, cz: 18, r: 14 },
    { cx: -60, cz: 30, r: 12 },
    { cx: -30, cz: 50, r: 12 },
  ];
  for (const bo of buildingOffsets) {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      trees.push({
        x: bo.cx + Math.cos(a) * (bo.r + 3),
        z: bo.cz + Math.sin(a) * (bo.r + 3),
        scale: 0.8 + nextRand() * 0.4,
        variant: Math.floor(nextRand() * 4),
      });
    }
  }

  // 湖滨树木
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    trees.push({
      x: 20 + Math.cos(angle) * 30,
      z: 55 + Math.sin(angle) * 22,
      scale: 1.0 + nextRand() * 0.4,
      variant: Math.floor(nextRand() * 4),
    });
  }

  return trees;
}

// ============================================================
// 路灯位置 - 沿主干道间隔排列
// ============================================================

function generateStreetLightPositions(): StreetLightPlacement[] {
  const lights: StreetLightPlacement[] = [];

  // 东西主干道
  for (let x = -80; x <= 80; x += 16) {
    lights.push({ x, z: -31 });
    lights.push({ x, z: -39 });
  }

  // 南北主干道
  for (let z = -70; z <= 60; z += 16) {
    lights.push({ x: -41, z });
    lights.push({ x: -49, z });
  }

  // 环路
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
    const r = 76;
    lights.push({ x: Math.cos(angle) * r, z: Math.sin(angle) * r * 0.6 });
  }

  return lights;
}

// ============================================================
// 导出完整校园数据
// ============================================================

export const CAMPUS_DATA: CampusData = {
  info: CAMPUS_INFO,
  buildings: BUILDINGS,
  roads: ROADS,
  greenSpaces: GREEN_SPACES,
  waterBodies: WATER_BODIES,
  sportsFields: SPORTS_FIELDS,
  parkingLots: PARKING_LOTS,
  trees: generateTreePositions(),
  streetLights: generateStreetLightPositions(),
};

// ============================================================
// 工具函数
// ============================================================

/** 根据碳排放量获取排放等级 */
export function getEmissionLevel(emission: number): EmissionLevel {
  if (emission < 0) return "low";
  if (emission < 400) return "low";
  if (emission < 650) return "medium";
  if (emission < 850) return "high";
  return "critical";
}

/** 碳排等级 → 热力色 (HSL) */
export function getEmissionColor(level: EmissionLevel): string {
  switch (level) {
    case "low": return "#36d968";
    case "medium": return "#3488ff";
    case "high": return "#ff7b25";
    case "critical": return "#ef4444";
  }
}

/** 建筑类型 → 中文名 */
export function getBuildingTypeName(type: BuildingType): string {
  const map: Record<BuildingType, string> = {
    teaching: "教学楼",
    lab: "实验楼",
    library: "图书馆",
    dorm: "宿舍楼",
    dining: "食堂",
    gym: "体育馆",
    admin: "行政楼",
    auditorium: "大礼堂",
    solar: "光伏配电房",
  };
  return map[type];
}
