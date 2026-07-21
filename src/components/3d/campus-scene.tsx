"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 参考智慧校园可视化大屏的建筑布局
const BUILDINGS = [
  // 教学区（北部 - 红砖色）
  { id: "b1", name: "主教学楼", type: "teaching", x: -12, z: -18, width: 10, depth: 5, height: 5, emission: 950, dept: "综合教学", floors: 10, color: "#c4956a" },
  { id: "b2", name: "第一教学楼", type: "teaching", x: 0, z: -20, width: 8, depth: 4.5, height: 4.5, emission: 820, dept: "综合教学", floors: 9, color: "#c4956a" },
  { id: "b3", name: "第二教学楼", type: "teaching", x: 10, z: -18, width: 8, depth: 4.5, height: 4.5, emission: 750, dept: "综合教学", floors: 9, color: "#c4956a" },
  { id: "b4", name: "第三教学楼", type: "teaching", x: 18, z: -15, width: 7, depth: 4, height: 4, emission: 680, dept: "综合教学", floors: 8, color: "#c4956a" },

  // 院系楼（中部 - 米白色）
  { id: "b5", name: "信息学院楼", type: "lab", x: -18, z: -8, width: 7, depth: 5, height: 4.5, emission: 780, dept: "信息学院", floors: 9, color: "#e8dcc8" },
  { id: "b6", name: "机械学院楼", type: "lab", x: -10, z: -10, width: 7, depth: 5, height: 4.5, emission: 820, dept: "机械学院", floors: 9, color: "#e8dcc8" },
  { id: "b7", name: "材料学院楼", type: "lab", x: -2, z: -8, width: 6.5, depth: 4.5, height: 4, emission: 720, dept: "材料学院", floors: 8, color: "#e8dcc8" },
  { id: "b8", name: "能源学院楼", type: "lab", x: 6, z: -10, width: 6.5, depth: 4.5, height: 4, emission: 680, dept: "能源学院", floors: 8, color: "#e8dcc8" },
  { id: "b9", name: "经管学院楼", type: "lab", x: 14, z: -8, width: 6.5, depth: 4.5, height: 4, emission: 620, dept: "经管学院", floors: 8, color: "#e8dcc8" },

  // 图书馆（中心 - 标志性建筑）
  { id: "b10", name: "图书馆", type: "library", x: -5, z: -2, width: 9, depth: 7, height: 5, emission: 480, dept: "图书馆", floors: 10, color: "#d4c5b0" },

  // 行政楼（中部偏东）
  { id: "b11", name: "行政办公楼", type: "admin", x: 10, z: -2, width: 7, depth: 5, height: 4, emission: 420, dept: "行政部门", floors: 8, color: "#c4956a" },

  // 宿舍区（南部 - 红砖色）
  { id: "b12", name: "1 号宿舍楼", type: "dorm", x: -20, z: 10, width: 5, depth: 4, height: 5, emission: 520, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b13", name: "2 号宿舍楼", type: "dorm", x: -13, z: 10, width: 5, depth: 4, height: 5, emission: 500, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b14", name: "3 号宿舍楼", type: "dorm", x: -6, z: 10, width: 5, depth: 4, height: 5, emission: 480, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b15", name: "4 号宿舍楼", type: "dorm", x: 1, z: 10, width: 5, depth: 4, height: 5, emission: 460, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b16", name: "5 号宿舍楼", type: "dorm", x: 8, z: 10, width: 5, depth: 4, height: 5, emission: 440, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b17", name: "6 号宿舍楼", type: "dorm", x: 15, z: 10, width: 5, depth: 4, height: 5, emission: 420, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b18", name: "7 号宿舍楼", type: "dorm", x: -16, z: 18, width: 5, depth: 4, height: 5, emission: 400, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b19", name: "8 号宿舍楼", type: "dorm", x: -9, z: 18, width: 5, depth: 4, height: 5, emission: 380, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b20", name: "9 号宿舍楼", type: "dorm", x: -2, z: 18, width: 5, depth: 4, height: 5, emission: 360, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },
  { id: "b21", name: "10 号宿舍楼", type: "dorm", x: 5, z: 18, width: 5, depth: 4, height: 5, emission: 340, dept: "宿舍管理中心", floors: 10, color: "#c4956a" },

  // 食堂区
  { id: "b22", name: "第一食堂", type: "dining", x: -12, z: 3, width: 6, depth: 5, height: 3, emission: 580, dept: "餐饮服务中心", floors: 3, color: "#d4a574" },
  { id: "b23", name: "第二食堂", type: "dining", x: 12, z: 3, width: 6, depth: 5, height: 3, emission: 520, dept: "餐饮服务中心", floors: 3, color: "#d4a574" },

  // 体育设施（东部）
  { id: "b24", name: "综合体育馆", type: "gym", x: 22, z: -5, width: 10, depth: 8, height: 4, emission: 380, dept: "体育部", floors: 4, color: "#c0c8d4" },
  { id: "b25", name: "游泳馆", type: "gym", x: 25, z: 8, width: 8, depth: 6, height: 3.5, emission: 320, dept: "体育部", floors: 3, color: "#c0c8d4" },

  // 运动场
  { id: "b26", name: "东操场", type: "field", x: 20, z: 18, width: 12, depth: 8, height: 0.1, emission: 60, dept: "体育部", floors: 1, color: "#4a7c59" },

  // 科研楼（西部）
  { id: "b27", name: "科研楼 A", type: "lab", x: -22, z: -2, width: 7, depth: 5, height: 5, emission: 880, dept: "科研院", floors: 10, color: "#e8dcc8" },
  { id: "b28", name: "科研楼 B", type: "lab", x: -22, z: 8, width: 7, depth: 5, height: 5, emission: 820, dept: "科研院", floors: 10, color: "#e8dcc8" },

  // 光伏配电房
  { id: "b29", name: "光伏配电房", type: "solar", x: 25, z: 20, width: 4, depth: 3, height: 2.5, emission: -150, dept: "后勤能源", floors: 1, color: "#8b7355" },
];

// 热力配色规则
function getEmissionColor(emission: number): string {
  if (emission < 0) return "#36d968";
  if (emission < 200) return "#3488ff";
  if (emission < 400) return "#a855f7";
  if (emission < 600) return "#ff7b25";
  return "#ef4444";
}

// 创建写实建筑模型 - 参考智慧校园大屏风格
function createRealisticBuilding(building: typeof BUILDINGS[0], emissionColor: string): THREE.Group {
  const group = new THREE.Group();

  // 建筑主体
  const bodyGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: building.color || "#f5f5f0",
    roughness: 0.75,
    metalness: 0.05,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = building.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 屋顶 - 平顶带女儿墙
  const roofHeight = 0.4;
  const roofGeometry = new THREE.BoxGeometry(building.width + 0.4, roofHeight, building.depth + 0.4);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.7,
    metalness: 0.1,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = building.height + roofHeight / 2;
  roof.castShadow = true;
  group.add(roof);

  // 女儿墙
  const parapetHeight = 0.6;
  const parapetThickness = 0.12;
  const parapetMaterial = new THREE.MeshStandardMaterial({
    color: building.color || "#c4956a",
    roughness: 0.7,
  });

  const parapetFront = new THREE.Mesh(
    new THREE.BoxGeometry(building.width + 0.4, parapetHeight, parapetThickness),
    parapetMaterial
  );
  parapetFront.position.set(0, building.height + roofHeight + parapetHeight / 2, building.depth / 2 + 0.2);
  group.add(parapetFront);

  const parapetBack = parapetFront.clone();
  parapetBack.position.z = -building.depth / 2 - 0.2;
  group.add(parapetBack);

  const parapetLeft = new THREE.Mesh(
    new THREE.BoxGeometry(parapetThickness, parapetHeight, building.depth + 0.4),
    parapetMaterial
  );
  parapetLeft.position.set(-building.width / 2 - 0.2, building.height + roofHeight + parapetHeight / 2, 0);
  group.add(parapetLeft);

  const parapetRight = parapetLeft.clone();
  parapetRight.position.x = building.width / 2 + 0.2;
  group.add(parapetRight);

  // 窗户系统 - 更密集的窗户排列
  const floorHeight = building.height / building.floors;
  const windowRows = building.floors;
  const windowCols = Math.floor(building.width / 0.7);

  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      // 窗框
      const frameGeometry = new THREE.BoxGeometry(0.45, 0.65, 0.06);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: "#4b5563",
        roughness: 0.3,
        metalness: 0.6,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(
        -building.width / 2 + 0.5 + col * 0.7,
        0.6 + row * floorHeight,
        building.depth / 2 + 0.03
      );
      group.add(frame);

      // 玻璃 - 使用物理材质实现真实反射
      const glassGeometry = new THREE.BoxGeometry(0.38, 0.58, 0.04);
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#a8d4e6",
        roughness: 0.05,
        metalness: 0.9,
        transmission: 0.2,
        transparent: true,
        opacity: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(
        -building.width / 2 + 0.5 + col * 0.7,
        0.6 + row * floorHeight,
        building.depth / 2 + 0.05
      );
      group.add(glass);

      // 背面窗户
      const frameBack = frame.clone();
      frameBack.position.z = -building.depth / 2 - 0.03;
      group.add(frameBack);

      const glassBack = glass.clone();
      glassBack.position.z = -building.depth / 2 - 0.05;
      group.add(glassBack);
    }
  }

  // 侧面窗户
  const sideWindowCols = Math.floor(building.depth / 0.7);
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < sideWindowCols; col++) {
      const frameGeometry = new THREE.BoxGeometry(0.06, 0.65, 0.45);
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: "#4b5563",
        roughness: 0.3,
        metalness: 0.6,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.set(
        building.width / 2 + 0.03,
        0.6 + row * floorHeight,
        -building.depth / 2 + 0.5 + col * 0.7
      );
      group.add(frame);

      const glassGeometry = new THREE.BoxGeometry(0.04, 0.58, 0.38);
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#a8d4e6",
        roughness: 0.05,
        metalness: 0.9,
        transmission: 0.2,
        transparent: true,
        opacity: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.set(
        building.width / 2 + 0.05,
        0.6 + row * floorHeight,
        -building.depth / 2 + 0.5 + col * 0.7
      );
      group.add(glass);

      const frameLeft = frame.clone();
      frameLeft.position.x = -building.width / 2 - 0.03;
      group.add(frameLeft);

      const glassLeft = glass.clone();
      glassLeft.position.x = -building.width / 2 - 0.05;
      group.add(glassLeft);
    }
  }

  // 入口门廊
  if (building.height > 3) {
    const doorGeometry = new THREE.BoxGeometry(2.5, 3, 1.8);
    const doorMaterial = new THREE.MeshStandardMaterial({
      color: "#374151",
      roughness: 0.4,
      metalness: 0.3,
    });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.5, building.depth / 2 + 0.9);
    door.castShadow = true;
    group.add(door);

    // 门廊顶
    const canopyGeometry = new THREE.BoxGeometry(3, 0.2, 2.5);
    const canopyMaterial = new THREE.MeshStandardMaterial({
      color: "#6b7280",
      roughness: 0.5,
      metalness: 0.2,
    });
    const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
    canopy.position.set(0, 3, building.depth / 2 + 1.25);
    canopy.castShadow = true;
    group.add(canopy);

    // 门廊柱子
    const pillarGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 8);
    const pillarMaterial = new THREE.MeshStandardMaterial({
      color: "#9ca3af",
      roughness: 0.4,
      metalness: 0.3,
    });
    const pillar1 = new THREE.Mesh(pillarGeometry, pillarMaterial);
    pillar1.position.set(-1.2, 1.5, building.depth / 2 + 1.8);
    pillar1.castShadow = true;
    group.add(pillar1);

    const pillar2 = pillar1.clone();
    pillar2.position.x = 1.2;
    group.add(pillar2);
  }

  // 热力发光效果
  const glowGeometry = new THREE.BoxGeometry(building.width + 1.5, building.height + 1.5, building.depth + 1.5);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: emissionColor,
    transparent: true,
    opacity: 0.06,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = building.height / 2;
  group.add(glow);

  group.userData = building;

  return group;
}

// 创建写实树木 - 更接近真实校园绿化
function createTree(x: number, z: number, scale: number = 1): THREE.Group {
  const tree = new THREE.Group();

  // 树干
  const trunkGeometry = new THREE.CylinderGeometry(0.12 * scale, 0.2 * scale, 2.5 * scale, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: "#5c4033",
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1.25 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  // 树冠 - 多层球体模拟真实树冠
  const crownColors = ["#2d5016", "#3d6b1f", "#4a7c28", "#5a8c38"];
  for (let i = 0; i < 4; i++) {
    const crownGeometry = new THREE.SphereGeometry((1.5 - i * 0.25) * scale, 8, 8);
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: crownColors[i],
      roughness: 0.85,
    });
    const crown = new THREE.Mesh(crownGeometry, crownMaterial);
    crown.position.y = (3 + i * 0.6) * scale;
    crown.position.x = (Math.random() - 0.5) * 0.4 * scale;
    crown.position.z = (Math.random() - 0.5) * 0.4 * scale;
    crown.castShadow = true;
    tree.add(crown);
  }

  tree.position.set(x, 0, z);
  return tree;
}

// 创建环形道路
function createCircularRoad(radius: number, width: number): THREE.Mesh {
  const geometry = new THREE.RingGeometry(radius - width / 2, radius + width / 2, 64);
  const material = new THREE.MeshStandardMaterial({
    color: "#374151",
    roughness: 0.95,
  });
  const road = new THREE.Mesh(geometry, material);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0.01;
  road.receiveShadow = true;
  return road;
}

// 创建直线道路
function createRoad(x: number, z: number, width: number, depth: number, rotation: number = 0): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({
    color: "#374151",
    roughness: 0.95,
  });
  const road = new THREE.Mesh(geometry, material);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotation;
  road.position.set(x, 0.01, z);
  road.receiveShadow = true;
  return road;
}

// 创建运动场
function createSportsField(x: number, z: number, width: number, depth: number): THREE.Group {
  const field = new THREE.Group();

  // 跑道
  const trackGeometry = new THREE.PlaneGeometry(width, depth);
  const trackMaterial = new THREE.MeshStandardMaterial({
    color: "#c45c3d",
    roughness: 0.9,
  });
  const track = new THREE.Mesh(trackGeometry, trackMaterial);
  track.rotation.x = -Math.PI / 2;
  track.position.y = 0.02;
  track.receiveShadow = true;
  field.add(track);

  // 足球场
  const fieldGeometry = new THREE.PlaneGeometry(width * 0.6, depth * 0.6);
  const fieldMaterial = new THREE.MeshStandardMaterial({
    color: "#4a7c59",
    roughness: 0.9,
  });
  const fieldMesh = new THREE.Mesh(fieldGeometry, fieldMaterial);
  fieldMesh.rotation.x = -Math.PI / 2;
  fieldMesh.position.y = 0.03;
  fieldMesh.receiveShadow = true;
  field.add(fieldMesh);

  // 跑道线
  const lineGeometry = new THREE.PlaneGeometry(width * 0.95, 0.15);
  const lineMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
  line1.rotation.x = -Math.PI / 2;
  line1.position.y = 0.04;
  line1.position.z = -depth * 0.3;
  field.add(line1);

  const line2 = line1.clone();
  line2.position.z = depth * 0.3;
  field.add(line2);

  field.position.set(x, 0, z);
  return field;
}

// 创建停车场
function createParkingLot(x: number, z: number, width: number, depth: number): THREE.Group {
  const lot = new THREE.Group();

  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({
    color: "#4b5563",
    roughness: 0.95,
  });
  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.015;
  ground.receiveShadow = true;
  lot.add(ground);

  // 停车位线
  for (let i = 0; i < Math.floor(width / 2.5); i++) {
    const lineGeometry = new THREE.PlaneGeometry(0.12, depth * 0.8);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const line = new THREE.Mesh(lineGeometry, lineMaterial);
    line.rotation.x = -Math.PI / 2;
    line.position.set(-width / 2 + 1.25 + i * 2.5, 0.02, 0);
    lot.add(line);
  }

  lot.position.set(x, 0, z);
  return lot;
}

// 创建湖泊/水景
function createLake(x: number, z: number, radius: number): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(radius, 32);
  const material = new THREE.MeshStandardMaterial({
    color: "#1e4d6b",
    roughness: 0.1,
    metalness: 0.3,
  });
  const lake = new THREE.Mesh(geometry, material);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(x, 0.02, z);
  lake.receiveShadow = true;
  return lake;
}

// 创建路灯
function createStreetLight(x: number, z: number): THREE.Group {
  const light = new THREE.Group();

  // 灯杆
  const poleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 4, 8);
  const poleMaterial = new THREE.MeshStandardMaterial({
    color: "#6b7280",
    roughness: 0.4,
    metalness: 0.6,
  });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.y = 2;
  pole.castShadow = true;
  light.add(pole);

  // 灯头
  const headGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.4);
  const headMaterial = new THREE.MeshStandardMaterial({
    color: "#fbbf24",
    roughness: 0.3,
    emissive: "#fbbf24",
    emissiveIntensity: 0.3,
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 4;
  light.add(head);

  light.position.set(x, 0, z);
  return light;
}

interface CampusScene3DProps {
  level?: "L1" | "L2" | "L3" | "L4";
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
}

export function CampusScene3D({ level = "L1", selectedBuilding, onBuildingClick, filterType }: CampusScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const buildingMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; building: typeof BUILDINGS[0] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 场景 - 天空蓝背景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#87ceeb");
    scene.fog = new THREE.Fog("#87ceeb", 60, 180);
    sceneRef.current = scene;

    // 相机 - 鸟瞰视角
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(45, 35, 45);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 渲染器 - 高质量设置
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.minDistance = 20;
    controls.maxDistance = 120;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 环境光
    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
    scene.add(ambientLight);

    // 主光源（模拟太阳）
    const sunLight = new THREE.DirectionalLight("#fff8e7", 1.6);
    sunLight.position.set(35, 45, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // 补光
    const fillLight = new THREE.DirectionalLight("#b0d4f1", 0.4);
    fillLight.position.set(-25, 25, -25);
    scene.add(fillLight);

    // 地面 - 草地
    const groundGeometry = new THREE.PlaneGeometry(150, 150);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "#5a7247",
      roughness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // 环形道路系统 - 参考智慧校园大屏
    const circularRoad1 = createCircularRoad(25, 8);
    scene.add(circularRoad1);
    const circularRoad2 = createCircularRoad(15, 6);
    scene.add(circularRoad2);

    // 放射状道路
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const roadLength = 35;
      const roadGeometry = new THREE.PlaneGeometry(5, roadLength);
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: "#374151",
        roughness: 0.95,
      });
      const road = new THREE.Mesh(roadGeometry, roadMaterial);
      road.rotation.x = -Math.PI / 2;
      road.rotation.z = angle;
      road.position.set(Math.cos(angle) * roadLength / 2, 0.01, Math.sin(angle) * roadLength / 2);
      road.receiveShadow = true;
      scene.add(road);
    }

    // 道路标线
    const lineGeometry = new THREE.PlaneGeometry(0.15, 70);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.02;
    scene.add(centerLine);

    // 人行道
    const sidewalkGeometry = new THREE.PlaneGeometry(1.5, 70);
    const sidewalkMaterial = new THREE.MeshStandardMaterial({
      color: "#9ca3af",
      roughness: 0.9,
    });
    const sidewalk1 = new THREE.Mesh(sidewalkGeometry, sidewalkMaterial);
    sidewalk1.rotation.x = -Math.PI / 2;
    sidewalk1.position.set(3.5, 0.015, 0);
    scene.add(sidewalk1);

    const sidewalk2 = sidewalk1.clone();
    sidewalk2.position.x = -3.5;
    scene.add(sidewalk2);

    // 创建建筑
    BUILDINGS.forEach((building) => {
      const emissionColor = getEmissionColor(building.emission);
      const buildingGroup = createRealisticBuilding(building, emissionColor);
      buildingGroup.position.set(building.x, 0, building.z);
      scene.add(buildingGroup);
      buildingMeshesRef.current.set(building.id, buildingGroup);
    });

    // 运动场
    scene.add(createSportsField(20, 18, 12, 8));

    // 停车场
    scene.add(createParkingLot(-28, 15, 10, 8));
    scene.add(createParkingLot(28, -15, 8, 6));

    // 湖泊/水景
    scene.add(createLake(-8, 22, 5));

    // 树木 - 密集绿化
    const treePositions = [
      // 环形道路两侧
      [-30, -20], [-30, -10], [-30, 0], [-30, 10], [-30, 20],
      [30, -20], [30, -10], [30, 0], [30, 10], [30, 20],
      [-20, -30], [-10, -30], [0, -30], [10, -30], [20, -30],
      [-20, 30], [-10, 30], [0, 30], [10, 30], [20, 30],
      // 建筑间绿化
      [-15, -15], [-10, -15], [-5, -15], [0, -15], [5, -15], [10, -15], [15, -15],
      [-15, 0], [-10, 0], [10, 0], [15, 0],
      [-20, 12], [-15, 12], [-10, 12], [-5, 12], [0, 12], [5, 12], [10, 12], [15, 12], [20, 12],
      [-25, 5], [-25, 10], [-25, 15],
      [25, 5], [25, 10], [25, 15],
    ];
    treePositions.forEach(([x, z]) => {
      const scale = 0.9 + Math.random() * 0.5;
      scene.add(createTree(x, z, scale));
    });

    // 路灯
    const streetLightPositions = [
      [-20, -20], [-20, -10], [-20, 0], [-20, 10], [-20, 20],
      [20, -20], [20, -10], [20, 0], [20, 10], [20, 20],
      [-10, -25], [0, -25], [10, -25],
      [-10, 25], [0, 25], [10, 25],
    ];
    streetLightPositions.forEach(([x, z]) => {
      scene.add(createStreetLight(x, z));
    });

    // 动画循环
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 窗口大小调整
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    // 鼠标交互
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = Array.from(buildingMeshesRef.current.values());
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && !target.userData.id) {
          target = target.parent;
        }
        if (target.userData.id) {
          const building = target.userData as typeof BUILDINGS[0];
          setHoveredBuilding(building.id);
          setTooltip({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            building,
          });
          container.style.cursor = "pointer";
        }
      } else {
        setHoveredBuilding(null);
        setTooltip(null);
        container.style.cursor = "default";
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (hoveredBuilding && onBuildingClick) {
        onBuildingClick(hoveredBuilding);
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("click", handleClick);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("click", handleClick);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onBuildingClick, hoveredBuilding]);

  // 根据层级调整视角
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    switch (level) {
      case "L1":
        camera.position.set(55, 45, 55);
        controls.minDistance = 35;
        break;
      case "L2":
        camera.position.set(40, 30, 40);
        controls.minDistance = 25;
        break;
      case "L3":
        camera.position.set(30, 22, 30);
        controls.minDistance = 15;
        break;
      case "L4":
        camera.position.set(45, 35, 45);
        controls.minDistance = 30;
        break;
    }
    controls.update();
  }, [level]);

  // 选中建筑高亮
  useEffect(() => {
    buildingMeshesRef.current.forEach((group, id) => {
      const isHovered = id === hoveredBuilding;
      const isSelected = id === selectedBuilding;

      group.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
          if (isHovered || isSelected) {
            child.material.opacity = 0.25;
          } else {
            child.material.opacity = 0.06;
          }
        }
      });
    });
  }, [hoveredBuilding, selectedBuilding]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* 悬浮提示 */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
            background: "rgba(10, 22, 40, 0.95)",
            border: "1px solid rgba(52, 136, 255, 0.3)",
          }}
        >
          <div className="text-sm font-medium text-white">{tooltip.building.name}</div>
          <div className="text-xs text-gray-400 mt-1">{tooltip.building.dept}</div>
          <div className="text-xs text-blue-400 mt-1">
            碳排放：{tooltip.building.emission} tCO₂
          </div>
        </div>
      )}

      {/* 层级标识 */}
      <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-medium"
        style={{
          background: "rgba(10, 22, 40, 0.9)",
          border: "1px solid rgba(52, 136, 255, 0.3)",
          color: "#3488ff",
        }}
      >
        {level === "L1" && "L1 校领导碳控制塔 - 全局视角"}
        {level === "L2" && "L2 院系业务视图 - 院系聚焦"}
        {level === "L3" && "L3 后勤运营明细 - 楼层级"}
        {level === "L4" && "L4 合规与披露 - 数据完整度"}
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md text-xs"
        style={{
          background: "rgba(10, 22, 40, 0.9)",
          border: "1px solid rgba(52, 136, 255, 0.2)",
          color: "#64748b",
        }}
      >
        鼠标拖拽旋转 | 滚轮缩放 | 点击建筑查看详情
      </div>
    </div>
  );
}
