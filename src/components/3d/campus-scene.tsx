"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 虚拟校园建筑数据
const BUILDINGS = [
  { id: "b1", name: "教学楼 A", type: "teaching", x: -8, z: -5, width: 4, depth: 3, height: 2.5, emission: 450, dept: "计算机学院", floors: 4 },
  { id: "b2", name: "教学楼 B", type: "teaching", x: -3, z: -5, width: 4, depth: 3, height: 2.5, emission: 380, dept: "机械学院", floors: 4 },
  { id: "b3", name: "教学楼 C", type: "teaching", x: 2, z: -5, width: 4, depth: 3, height: 2.5, emission: 320, dept: "化学学院", floors: 3 },
  { id: "b4", name: "教学楼 D", type: "teaching", x: 7, z: -5, width: 4, depth: 3, height: 2.5, emission: 290, dept: "文学院", floors: 3 },
  { id: "b5", name: "宿舍 1 号楼", type: "dorm", x: -8, z: 2, width: 3, depth: 2.5, height: 3, emission: 280, dept: "宿舍管理中心", floors: 6 },
  { id: "b6", name: "宿舍 2 号楼", type: "dorm", x: -4, z: 2, width: 3, depth: 2.5, height: 3, emission: 260, dept: "宿舍管理中心", floors: 6 },
  { id: "b7", name: "宿舍 3 号楼", type: "dorm", x: 0, z: 2, width: 3, depth: 2.5, height: 3, emission: 240, dept: "宿舍管理中心", floors: 6 },
  { id: "b8", name: "宿舍 4 号楼", type: "dorm", x: 4, z: 2, width: 3, depth: 2.5, height: 3, emission: 220, dept: "宿舍管理中心", floors: 6 },
  { id: "b9", name: "宿舍 5 号楼", type: "dorm", x: 8, z: 2, width: 3, depth: 2.5, height: 3, emission: 200, dept: "宿舍管理中心", floors: 6 },
  { id: "b10", name: "宿舍 6 号楼", type: "dorm", x: 12, z: 2, width: 3, depth: 2.5, height: 3, emission: 180, dept: "宿舍管理中心", floors: 6 },
  { id: "b11", name: "实验楼 A", type: "lab", x: -6, z: 8, width: 3.5, depth: 3, height: 2, emission: 520, dept: "化学学院", floors: 3 },
  { id: "b12", name: "实验楼 B", type: "lab", x: -2, z: 8, width: 3.5, depth: 3, height: 2, emission: 480, dept: "机械学院", floors: 3 },
  { id: "b13", name: "食堂 A", type: "dining", x: 3, z: 8, width: 3, depth: 2.5, height: 1.8, emission: 350, dept: "餐饮服务中心", floors: 2 },
  { id: "b14", name: "食堂 B", type: "dining", x: 7, z: 8, width: 3, depth: 2.5, height: 1.8, emission: 320, dept: "餐饮服务中心", floors: 2 },
  { id: "b15", name: "行政楼", type: "admin", x: 0, z: -12, width: 5, depth: 4, height: 2.2, emission: 180, dept: "行政部门", floors: 4 },
  { id: "b16", name: "体育馆", type: "gym", x: 10, z: -12, width: 4, depth: 3.5, height: 2, emission: 150, dept: "体育部", floors: 2 },
  { id: "b17", name: "图书馆", type: "library", x: -10, z: -12, width: 4, depth: 3.5, height: 2.5, emission: 220, dept: "图书馆", floors: 4 },
  { id: "b18", name: "光伏配电房", type: "solar", x: 12, z: 12, width: 2, depth: 2, height: 1.5, emission: -80, dept: "后勤能源", floors: 1 },
];

// 热力配色规则
function getEmissionColor(emission: number): string {
  if (emission < 0) return "#36d968";
  if (emission < 200) return "#3488ff";
  if (emission < 350) return "#a855f7";
  if (emission < 450) return "#ff7b25";
  return "#ef4444";
}

// 创建真实感建筑模型
function createRealisticBuilding(building: typeof BUILDINGS[0], emissionColor: string): THREE.Group {
  const group = new THREE.Group();

  // 建筑主体
  const bodyGeometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: "#f5f5f0",
    roughness: 0.8,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = building.height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // 屋顶
  const roofGeometry = new THREE.BoxGeometry(building.width + 0.2, 0.15, building.depth + 0.2);
  const roofMaterial = new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.6,
    metalness: 0.2,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.y = building.height + 0.075;
  roof.castShadow = true;
  group.add(roof);

  // 窗户（每层）
  const floorHeight = building.height / building.floors;
  const windowRows = building.floors;
  const windowCols = Math.floor(building.width / 0.6);

  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < windowCols; col++) {
      // 正面窗户
      const windowGeometry = new THREE.BoxGeometry(0.35, 0.5, 0.05);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: "#87ceeb",
        roughness: 0.1,
        metalness: 0.8,
        emissive: "#87ceeb",
        emissiveIntensity: 0.1,
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(
        -building.width / 2 + 0.4 + col * 0.6,
        0.5 + row * floorHeight,
        building.depth / 2 + 0.025
      );
      group.add(window);

      // 背面窗户
      const windowBack = window.clone();
      windowBack.position.z = -building.depth / 2 - 0.025;
      group.add(windowBack);
    }
  }

  // 侧面窗户
  const sideWindowCols = Math.floor(building.depth / 0.6);
  for (let row = 0; row < windowRows; row++) {
    for (let col = 0; col < sideWindowCols; col++) {
      const windowGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.35);
      const windowMaterial = new THREE.MeshStandardMaterial({
        color: "#87ceeb",
        roughness: 0.1,
        metalness: 0.8,
        emissive: "#87ceeb",
        emissiveIntensity: 0.1,
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(
        building.width / 2 + 0.025,
        0.5 + row * floorHeight,
        -building.depth / 2 + 0.4 + col * 0.6
      );
      group.add(window);

      const windowLeft = window.clone();
      windowLeft.position.x = -building.width / 2 - 0.025;
      group.add(windowLeft);
    }
  }

  // 入口门廊
  const doorGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.8);
  const doorMaterial = new THREE.MeshStandardMaterial({
    color: "#4a5568",
    roughness: 0.5,
    metalness: 0.3,
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(0, 0.75, building.depth / 2 + 0.4);
  group.add(door);

  // 热力发光效果
  const glowGeometry = new THREE.BoxGeometry(building.width + 0.5, building.height + 0.5, building.depth + 0.5);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: emissionColor,
    transparent: true,
    opacity: 0.15,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  glow.position.y = building.height / 2;
  group.add(glow);

  // 存储建筑数据
  group.userData = building;

  return group;
}

// 创建树木
function createTree(x: number, z: number): THREE.Group {
  const tree = new THREE.Group();

  // 树干
  const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({
    color: "#8b4513",
    roughness: 0.9,
  });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.75;
  trunk.castShadow = true;
  tree.add(trunk);

  // 树冠
  const crownGeometry = new THREE.SphereGeometry(0.8, 8, 8);
  const crownMaterial = new THREE.MeshStandardMaterial({
    color: "#228b22",
    roughness: 0.8,
  });
  const crown = new THREE.Mesh(crownGeometry, crownMaterial);
  crown.position.y = 2;
  crown.castShadow = true;
  tree.add(crown);

  tree.position.set(x, 0, z);
  return tree;
}

// 创建道路
function createRoad(x: number, z: number, width: number, depth: number, rotation: number = 0): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(width, depth);
  const material = new THREE.MeshStandardMaterial({
    color: "#2d3748",
    roughness: 0.9,
  });
  const road = new THREE.Mesh(geometry, material);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = rotation;
  road.position.set(x, 0.01, z);
  road.receiveShadow = true;
  return road;
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

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0a1628");
    scene.fog = new THREE.Fog("#0a1628", 30, 80);
    sceneRef.current = scene;

    // 相机 - 等距视角
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(25, 20, 25);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 环境光
    const ambientLight = new THREE.AmbientLight("#4a90e2", 0.5);
    scene.add(ambientLight);

    // 主光源（模拟太阳）
    const sunLight = new THREE.DirectionalLight("#fff5e6", 1.2);
    sunLight.position.set(20, 30, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 4096;
    sunLight.shadow.mapSize.height = 4096;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -30;
    sunLight.shadow.camera.right = 30;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -30;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);

    // 补光
    const fillLight = new THREE.DirectionalLight("#87ceeb", 0.4);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);

    // 地面
    const groundGeometry = new THREE.PlaneGeometry(60, 60);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: "#1a4d2e",
      roughness: 0.95,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    // 道路系统
    const mainRoad = createRoad(0, 0, 60, 4, 0);
    scene.add(mainRoad);
    const crossRoad = createRoad(0, 0, 4, 60, 0);
    scene.add(crossRoad);

    // 道路标线
    const lineGeometry = new THREE.PlaneGeometry(0.2, 60);
    const lineMaterial = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.y = 0.02;
    scene.add(centerLine);

    // 创建建筑
    BUILDINGS.forEach((building) => {
      const emissionColor = getEmissionColor(building.emission);
      const buildingGroup = createRealisticBuilding(building, emissionColor);
      buildingGroup.position.set(building.x, 0, building.z);
      scene.add(buildingGroup);
      buildingMeshesRef.current.set(building.id, buildingGroup);
    });

    // 添加树木
    const treePositions = [
      [-12, -8], [-12, -3], [-12, 2], [-12, 7],
      [12, -8], [12, -3], [12, 2], [12, 7],
      [-6, -15], [-2, -15], [2, -15], [6, -15],
      [-6, 15], [-2, 15], [2, 15], [6, 15],
    ];
    treePositions.forEach(([x, z]) => {
      scene.add(createTree(x, z));
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
        camera.position.set(30, 25, 30);
        controls.minDistance = 20;
        break;
      case "L2":
        camera.position.set(20, 15, 20);
        controls.minDistance = 12;
        break;
      case "L3":
        camera.position.set(15, 10, 15);
        controls.minDistance = 5;
        break;
      case "L4":
        camera.position.set(25, 20, 25);
        controls.minDistance = 15;
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
            child.material.opacity = 0.4;
          } else {
            child.material.opacity = 0.15;
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
            background: "rgba(10, 22, 40, 0.9)",
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
          background: "rgba(10, 22, 40, 0.8)",
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
          background: "rgba(10, 22, 40, 0.8)",
          border: "1px solid rgba(52, 136, 255, 0.2)",
          color: "#64748b",
        }}
      >
        鼠标拖拽旋转 | 滚轮缩放 | 点击建筑查看详情
      </div>
    </div>
  );
}
