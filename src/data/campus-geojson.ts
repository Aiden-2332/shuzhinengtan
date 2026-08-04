/**
 * 北京科技大学（USTB）校园建筑 GeoJSON 数据
 * 中心坐标：116.3498, 39.9906
 * 建筑数据为演示用途，位置和形状为近似模拟
 */

import type { FeatureCollection, Polygon, Feature, FeatureCollection as GeoFC } from "geojson";
import { SYSTEM_BUILDINGS_BY_NAME } from "@/data/campus-system-data";

export interface BuildingProperties {
  id: string;
  name: string;
  type: "教学楼" | "实验楼" | "图书馆" | "宿舍" | "食堂" | "体育馆" | "行政楼" | "其他";
  floors: number;
  area: number; // 建筑面积 m²
  energyConsumption: number; // 年能耗 kWh
  carbonEmission: number; // 年碳排放 tCO₂
  status: "正常" | "预警" | "超标";
  energyLevel: "A" | "B" | "C" | "D"; // 能效等级
  photoUrl?: string; // 建筑实景照片
}

export type CampusGeoJSON = FeatureCollection<Polygon, BuildingProperties>;

/**
 * 校园建筑轮廓坐标
 * 每个建筑为 [longitude, latitude] 坐标环
 * 基于北京科技大学校园真实布局近似生成
 */
const rawCampusBuildings: CampusGeoJSON = {
  type: "FeatureCollection",
  features: [
    // ===== 主教学楼群 =====
    {
      type: "Feature",
      properties: {
        id: "b1",
        name: "机电信息楼",
        type: "教学楼",
        floors: 7,
        area: 12000,
        energyConsumption: 960000,
        carbonEmission: 547,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3475, 39.9928],
            [116.3482, 39.9928],
            [116.3482, 39.9920],
            [116.3475, 39.9920],
            [116.3475, 39.9928],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "b2",
        name: "材料科学楼",
        type: "实验楼",
        floors: 6,
        area: 9500,
        energyConsumption: 1140000,
        carbonEmission: 650,
        status: "预警",
        energyLevel: "C",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3485, 39.9928],
            [116.3492, 39.9928],
            [116.3492, 39.9920],
            [116.3485, 39.9920],
            [116.3485, 39.9928],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "b3",
        name: "冶金生态楼",
        type: "实验楼",
        floors: 5,
        area: 8000,
        energyConsumption: 1280000,
        carbonEmission: 730,
        status: "超标",
        energyLevel: "D",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3495, 39.9928],
            [116.3502, 39.9928],
            [116.3502, 39.9920],
            [116.3495, 39.9920],
            [116.3495, 39.9928],
          ],
        ],
      },
    },
    // ===== 图书馆 =====
    {
      type: "Feature",
      properties: {
        id: "b4",
        name: "图书馆",
        type: "图书馆",
        floors: 5,
        area: 15000,
        energyConsumption: 720000,
        carbonEmission: 410,
        status: "正常",
        energyLevel: "A",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3505, 39.9925],
            [116.3513, 39.9925],
            [116.3513, 39.9917],
            [116.3505, 39.9917],
            [116.3505, 39.9925],
          ],
        ],
      },
    },
    // ===== 行政楼 =====
    {
      type: "Feature",
      properties: {
        id: "b5",
        name: "行政办公楼",
        type: "行政楼",
        floors: 6,
        area: 6000,
        energyConsumption: 360000,
        carbonEmission: 205,
        status: "正常",
        energyLevel: "A",
        photoUrl: "/images/buildings/admin-building.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3465, 39.9918],
            [116.3472, 39.9918],
            [116.3472, 39.9911],
            [116.3465, 39.9911],
            [116.3465, 39.9918],
          ],
        ],
      },
    },
    // ===== 宿舍群 =====
    {
      type: "Feature",
      properties: {
        id: "b6",
        name: "学生宿舍1号楼",
        type: "宿舍",
        floors: 7,
        area: 5500,
        energyConsumption: 275000,
        carbonEmission: 157,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/dormitory.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3515, 39.9915],
            [116.3520, 39.9915],
            [116.3520, 39.9908],
            [116.3515, 39.9908],
            [116.3515, 39.9915],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "b7",
        name: "学生宿舍2号楼",
        type: "宿舍",
        floors: 7,
        area: 5500,
        energyConsumption: 286000,
        carbonEmission: 163,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/dormitory.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3522, 39.9915],
            [116.3527, 39.9915],
            [116.3527, 39.9908],
            [116.3522, 39.9908],
            [116.3522, 39.9915],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "b8",
        name: "学生宿舍3号楼",
        type: "宿舍",
        floors: 7,
        area: 5500,
        energyConsumption: 302500,
        carbonEmission: 172,
        status: "预警",
        energyLevel: "C",
        photoUrl: "/images/buildings/dormitory.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3515, 39.9905],
            [116.3520, 39.9905],
            [116.3520, 39.9898],
            [116.3515, 39.9898],
            [116.3515, 39.9905],
          ],
        ],
      },
    },
    // ===== 食堂 =====
    {
      type: "Feature",
      properties: {
        id: "b9",
        name: "鸿博园食堂",
        type: "食堂",
        floors: 3,
        area: 4500,
        energyConsumption: 495000,
        carbonEmission: 282,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3505, 39.9910],
            [116.3512, 39.9910],
            [116.3512, 39.9904],
            [116.3505, 39.9904],
            [116.3505, 39.9910],
          ],
        ],
      },
    },
    // ===== 体育馆 =====
    {
      type: "Feature",
      properties: {
        id: "b10",
        name: "体育馆",
        type: "体育馆",
        floors: 2,
        area: 8000,
        energyConsumption: 400000,
        carbonEmission: 228,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3525, 39.9900],
            [116.3533, 39.9900],
            [116.3533, 39.9893],
            [116.3525, 39.9893],
            [116.3525, 39.9900],
          ],
        ],
      },
    },
    // ===== 计算机学院楼 =====
    {
      type: "Feature",
      properties: {
        id: "b11",
        name: "计算机学院楼",
        type: "教学楼",
        floors: 5,
        area: 7000,
        energyConsumption: 840000,
        carbonEmission: 479,
        status: "预警",
        energyLevel: "C",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3475, 39.9918],
            [116.3482, 39.9918],
            [116.3482, 39.9911],
            [116.3475, 39.9911],
            [116.3475, 39.9918],
          ],
        ],
      },
    },
    // ===== 自动化学院楼 =====
    {
      type: "Feature",
      properties: {
        id: "b12",
        name: "自动化学院楼",
        type: "实验楼",
        floors: 5,
        area: 6500,
        energyConsumption: 780000,
        carbonEmission: 445,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3485, 39.9918],
            [116.3492, 39.9918],
            [116.3492, 39.9911],
            [116.3485, 39.9911],
            [116.3485, 39.9918],
          ],
        ],
      },
    },
    // ===== 土木楼 =====
    {
      type: "Feature",
      properties: {
        id: "b13",
        name: "土木与资源楼",
        type: "教学楼",
        floors: 6,
        area: 8500,
        energyConsumption: 680000,
        carbonEmission: 388,
        status: "正常",
        energyLevel: "B",
        photoUrl: "/images/buildings/model.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3495, 39.9918],
            [116.3502, 39.9918],
            [116.3502, 39.9911],
            [116.3495, 39.9911],
            [116.3495, 39.9918],
          ],
        ],
      },
    },
    // ===== 研究生宿舍 =====
    {
      type: "Feature",
      properties: {
        id: "b14",
        name: "研究生宿舍楼",
        type: "宿舍",
        floors: 12,
        area: 10000,
        energyConsumption: 500000,
        carbonEmission: 285,
        status: "正常",
        energyLevel: "A",
        photoUrl: "/images/buildings/swimming-hall.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3522, 39.9905],
            [116.3527, 39.9905],
            [116.3527, 39.9898],
            [116.3522, 39.9898],
            [116.3522, 39.9905],
          ],
        ],
      },
    },
    // ===== 光伏电站（屋顶） =====
    {
      type: "Feature",
      properties: {
        id: "b15",
        name: "屋顶光伏电站",
        type: "其他",
        floors: 1,
        area: 3000,
        energyConsumption: -180000, // 负值表示发电
        carbonEmission: -103,
        status: "正常",
        energyLevel: "A",
        photoUrl: "/images/buildings/auditorium.jpg",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3508, 39.9898],
            [116.3518, 39.9898],
            [116.3518, 39.9892],
            [116.3508, 39.9892],
            [116.3508, 39.9898],
          ],
        ],
      },
    },
  ],
};

const GEO_CANONICAL_NAMES: Record<string, string> = {
  "机电信息楼": "机电信息楼",
  "材料科学楼": "材料测试楼",
  "冶金生态楼": "冶金生态楼",
  "图书馆": "图书馆",
  "行政办公楼": "办公楼",
  "学生宿舍1号楼": "1斋",
  "学生宿舍2号楼": "2斋",
  "学生宿舍3号楼": "3斋",
  "鸿博园食堂": "学生活动中心",
  "体育馆": "体育馆",
  "计算机学院楼": "鼎新楼",
  "自动化学院楼": "化生楼",
  "土木与资源楼": "土木环境楼",
  "研究生宿舍楼": "研究生院楼",
  "屋顶光伏电站": "逸夫楼",
};

const GEO_FALLBACK_IDS: Record<string, string> = {
  "2斋": "10650",
};

export const campusBuildings: CampusGeoJSON = {
  ...rawCampusBuildings,
  features: rawCampusBuildings.features.map((feature) => {
    const canonicalName = GEO_CANONICAL_NAMES[feature.properties.name] ?? feature.properties.name;
    const building = SYSTEM_BUILDINGS_BY_NAME.get(canonicalName);
    if (!building) {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          id: GEO_FALLBACK_IDS[canonicalName] ?? feature.properties.id,
          name: canonicalName,
        },
      };
    }

    const overTargetRate = building.annualEmissionForecast / building.annualEmissionTarget;
    const status: BuildingProperties["status"] = overTargetRate > 1.15 ? "超标" : overTargetRate > 1 ? "预警" : "正常";
    const energyLevel: BuildingProperties["energyLevel"] = building.energyIntensity > 115
      ? "D"
      : building.energyIntensity > 95
        ? "C"
        : building.energyIntensity > 72
          ? "B"
          : "A";
    return {
      ...feature,
      properties: {
        ...feature.properties,
        id: building.id,
        name: building.name,
        floors: building.floorCount,
        area: building.area,
        energyConsumption: Math.round(building.annualEmissionForecast / 0.5672 * 1_000),
        carbonEmission: building.annualEmissionForecast,
        status,
        energyLevel,
      },
    };
  }),
};

/**
 * 校园边界线（简化）
 */
export const campusBoundary: GeoFC = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { name: "北京科技大学", type: "boundary" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [116.3460, 39.9932],
            [116.3540, 39.9932],
            [116.3540, 39.9888],
            [116.3460, 39.9888],
            [116.3460, 39.9932],
          ],
        ],
      },
    },
  ],
};

/** 地图中心点 */
export const CAMPUS_CENTER: [number, number] = [116.3500, 39.9910];

/** 默认缩放 */
export const DEFAULT_ZOOM = 15.5;

/** 3D 视角参数 */
export const CAMPUS_3D_PITCH = 55;
export const CAMPUS_3D_BEARING = -20;

/** 2.5D 视角参数 */
export const CAMPUS_25D_PITCH = 45;
export const CAMPUS_25D_BEARING = 0;
