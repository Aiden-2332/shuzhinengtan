"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 虚拟校园建筑数据
const BUILDINGS = [
  { id: "b1", name: "教学楼 A", type: "teaching", x: -8, z: -5, width: 4, depth: 3, height: 2.5, emission: 450, dept: "计算机学院" },
  { id: "b2", name: "教学楼 B", type: "teaching", x: -3, z: -5, width: 4, depth: 3, height: 2.5, emission: 380, dept: "机械学院" },
  { id: "b3", name: "教学楼 C", type: "teaching", x: 2, z: -5, width: 4, depth: 3, height: 2.5, emission: 320, dept: "化学学院" },
  { id: "b4", name: "教学楼 D", type: "teaching", x: 7, z: -5, width: 4, depth: 3, height: 2.5, emission: 290, dept: "文学院" },
  { id: "b5", name: "宿舍 1 号楼", type: "dorm", x: -8, z: 2, width: 3, depth: 2.5, height: 3, emission: 280, dept: "宿舍管理中心" },
  { id: "b6", name: "宿舍 2 号楼", type: "dorm", x: -4, z: 2, width: 3, depth: 2.5, height: 3, emission: 260, dept: "宿舍管理中心" },
  { id: "b7", name: "宿舍 3 号楼", type: "dorm", x: 0, z: 2, width: 3, depth: 2.5, height: 3, emission: 240, dept: "宿舍管理中心" },
  { id: "b8", name: "宿舍 4 号楼", type: "dorm", x: 4, z: 2, width: 3, depth: 2.5, height: 3, emission: 220, dept: "宿舍管理中心" },
  { id: "b9", name: "宿舍 5 号楼", type: "dorm", x: 8, z: 2, width: 3, depth: 2.5, height: 3, emission: 200, dept: "宿舍管理中心" },
  { id: "b10", name: "宿舍 6 号楼", type: "dorm", x: 12, z: 2, width: 3, depth: 2.5, height: 3, emission: 180, dept: "宿舍管理中心" },
  { id: "b11", name: "实验楼 A", type: "lab", x: -6, z: 8, width: 3.5, depth: 3, height: 2, emission: 520, dept: "化学学院" },
  { id: "b12", name: "实验楼 B", type: "lab", x: -2, z: 8, width: 3.5, depth: 3, height: 2, emission: 480, dept: "机械学院" },
  { id: "b13", name: "食堂 A", type: "dining", x: 3, z: 8, width: 3, depth: 2.5, height: 1.8, emission: 350, dept: "餐饮服务中心" },
  { id: "b14", name: "食堂 B", type: "dining", x: 7, z: 8, width: 3, depth: 2.5, height: 1.8, emission: 320, dept: "餐饮服务中心" },
  { id: "b15", name: "行政楼", type: "admin", x: 0, z: -12, width: 5, depth: 4, height: 2.2, emission: 180, dept: "行政部门" },
  { id: "b16", name: "体育馆", type: "gym", x: 10, z: -12, width: 4, depth: 3.5, height: 2, emission: 150, dept: "体育部" },
  { id: "b17", name: "图书馆", type: "library", x: -10, z: -12, width: 4, depth: 3.5, height: 2.5, emission: 220, dept: "图书馆" },
  { id: "b18", name: "光伏配电房", type: "solar", x: 12, z: 12, width: 2, depth: 2, height: 1.5, emission: -80, dept: "后勤能源" },
];

// 热力配色规则
function getEmissionColor(emission: number): string {
  if (emission < 0) return "#36d968"; // 绿色（光伏减排）
  if (emission < 200) return "#3488ff"; // 浅蓝（低排放）
  if (emission < 350) return "#a855f7"; // 紫色（中等）
  if (emission < 450) return "#ff7b25"; // 橙色（高排放）
  return "#ef4444"; // 红色（超标）
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
  const buildingMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; building: typeof BUILDINGS[0] } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#081028");
    scene.fog = new THREE.Fog("#081028", 20, 60);
    sceneRef.current = scene;

    // 相机
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 15, 20);
    cameraRef.current = camera;

    // 渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controlsRef.current = controls;

    // 灯光
    const ambientLight = new THREE.AmbientLight("#3488ff", 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight("#ffffff", 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight("#3488ff", 0.5, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // 地面网格
    const gridHelper = new THREE.GridHelper(40, 40, "#1e3a5f", "#0a1929");
    scene.add(gridHelper);

    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshPhongMaterial({
      color: "#0a1929",
      transparent: true,
      opacity: 0.8,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.1;
    ground.receiveShadow = true;
    scene.add(ground);

    // 创建建筑
    BUILDINGS.forEach((building) => {
      const geometry = new THREE.BoxGeometry(building.width, building.height, building.depth);
      const color = getEmissionColor(building.emission);
      const material = new THREE.MeshPhongMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
        emissive: color,
        emissiveIntensity: 0.2,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(building.x, building.height / 2, building.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = building;
      scene.add(mesh);
      buildingMeshesRef.current.set(building.id, mesh);

      // 建筑边框
      const edges = new THREE.EdgesGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: "#3488ff", transparent: true, opacity: 0.5 });
      const wireframe = new THREE.LineSegments(edges, lineMaterial);
      mesh.add(wireframe);
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
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const building = intersects[0].object.userData as typeof BUILDINGS[0];
        setHoveredBuilding(building.id);
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          building,
        });
        container.style.cursor = "pointer";
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
        camera.position.set(0, 20, 30);
        controls.minDistance = 15;
        break;
      case "L2":
        camera.position.set(0, 12, 18);
        controls.minDistance = 8;
        break;
      case "L3":
        camera.position.set(0, 8, 12);
        controls.minDistance = 3;
        break;
      case "L4":
        camera.position.set(0, 15, 25);
        controls.minDistance = 10;
        break;
    }
    controls.update();
  }, [level]);

  // 选中建筑高亮
  useEffect(() => {
    buildingMeshesRef.current.forEach((mesh, id) => {
      const material = mesh.material as THREE.MeshPhongMaterial;
      if (id === selectedBuilding) {
        material.emissiveIntensity = 0.6;
        material.opacity = 1;
      } else if (id === hoveredBuilding) {
        material.emissiveIntensity = 0.4;
        material.opacity = 0.95;
      } else {
        material.emissiveIntensity = 0.2;
        material.opacity = 0.85;
      }
    });
  }, [selectedBuilding, hoveredBuilding]);

  // 筛选建筑类型
  useEffect(() => {
    buildingMeshesRef.current.forEach((mesh, id) => {
      const building = mesh.userData;
      if (filterType && building.type !== filterType) {
        mesh.visible = false;
      } else {
        mesh.visible = true;
      }
    });
  }, [filterType]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* 悬浮提示框 */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-gray-900/95 border border-cyan-500/50 rounded-lg p-3 shadow-lg backdrop-blur-sm"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="text-cyan-400 font-bold text-sm">{tooltip.building.name}</div>
          <div className="text-gray-300 text-xs mt-1">类型：{tooltip.building.type}</div>
          <div className="text-gray-300 text-xs">院系：{tooltip.building.dept}</div>
          <div className="text-orange-400 text-xs mt-1">碳排放：{tooltip.building.emission} tCO₂</div>
        </div>
      )}

      {/* 水印 */}
      <div className="absolute bottom-4 right-4 text-gray-500/60 text-xs pointer-events-none">
        Demo 模拟数据 仅课题演示
      </div>
    </div>
  );
}
