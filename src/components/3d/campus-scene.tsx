"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  CAMPUS_DATA,
  getEmissionColor,
  getEnergyColorByValue,
  type BuildingData,
  type EmissionLevel,
  type CampusData,
} from "@/data/campus-data";
import { getAnomalies } from "@/data/mock-data";

// ============================================================
// Props 接口
// ============================================================

interface CampusScene3DProps {
  level?: "L1" | "L2" | "L3" | "L4";
  selectedBuilding?: string | null;
  onBuildingClick?: (buildingId: string) => void;
  filterType?: string | null;
  /** 着色模式: carbon=碳排放热力, energy=能耗强度绿→红梯度 */
  colorMode?: "carbon" | "energy";
  /** 夜景模式: 暗色背景+暖窗光 */
  nightMode?: boolean;
}

// ============================================================
// 常量
// ============================================================

const SHADOW_MAP_SIZE = 4096;
const MAX_POLAR_ANGLE = Math.PI / 2.05;
const TREE_COUNT = CAMPUS_DATA.trees.length;
const LIGHT_COUNT = CAMPUS_DATA.streetLights.length;

// LOD 距离阈值
const LOD_HIGH_DIST = 60;
const LOD_MID_DIST = 120;

// ============================================================
// 材质工厂 - PBR 材质系统
// ============================================================

class MaterialFactory {
  private cache = new Map<string, THREE.Material>();

  getBuildingWall(color: string): THREE.MeshStandardMaterial {
    const key = `wall-${color}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color,
        roughness: 0.75,
        metalness: 0.05,
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  getBuildingRoof(): THREE.MeshStandardMaterial {
    if (!this.cache.has("roof")) {
      this.cache.set("roof", new THREE.MeshStandardMaterial({
        color: "#6b5b4f",
        roughness: 0.7,
        metalness: 0.1,
      }));
    }
    return this.cache.get("roof") as THREE.MeshStandardMaterial;
  }

  getWindowFrame(): THREE.MeshStandardMaterial {
    if (!this.cache.has("win-frame")) {
      this.cache.set("win-frame", new THREE.MeshStandardMaterial({
        color: "#3b4252",
        roughness: 0.3,
        metalness: 0.6,
      }));
    }
    return this.cache.get("win-frame") as THREE.MeshStandardMaterial;
  }

  getWindowGlass(): THREE.MeshPhysicalMaterial {
    if (!this.cache.has("win-glass")) {
      this.cache.set("win-glass", new THREE.MeshPhysicalMaterial({
        color: "#a8d4e6",
        roughness: 0.05,
        metalness: 0.9,
        transmission: 0.2,
        transparent: true,
        opacity: 0.8,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      }));
    }
    return this.cache.get("win-glass") as THREE.MeshPhysicalMaterial;
  }

  getGround(): THREE.MeshStandardMaterial {
    if (!this.cache.has("ground")) {
      this.cache.set("ground", new THREE.MeshStandardMaterial({
        color: "#5a7247",
        roughness: 0.95,
      }));
    }
    return this.cache.get("ground") as THREE.MeshStandardMaterial;
  }

  getRoad(type: string): THREE.MeshStandardMaterial {
    const key = `road-${type}`;
    if (!this.cache.has(key)) {
      const colors: Record<string, string> = {
        main: "#374151",
        secondary: "#4b5563",
        sidewalk: "#9ca3af",
        path: "#a8a29e",
      };
      this.cache.set(key, new THREE.MeshStandardMaterial({
        color: colors[type] || "#374151",
        roughness: 0.95,
      }));
    }
    return this.cache.get(key) as THREE.MeshStandardMaterial;
  }

  getEmissionGlow(level: EmissionLevel): THREE.MeshBasicMaterial {
    const color = getEmissionColor(level);
    const key = `glow-${level}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
      }));
    }
    return this.cache.get(key) as THREE.MeshBasicMaterial;
  }

  dispose(): void {
    this.cache.forEach((mat) => mat.dispose());
    this.cache.clear();
  }
}

// ============================================================
// 建筑工厂 - 6种建筑原型
// ============================================================

class BuildingFactory {
  private matFactory: MaterialFactory;

  constructor(matFactory: MaterialFactory) {
    this.matFactory = matFactory;
  }

  createBuilding(data: BuildingData, lodLevel: "high" | "mid" | "low"): THREE.Group {
    const group = new THREE.Group();
    group.userData = { ...data };

    switch (data.type) {
      case "teaching":
        this.createTeaching(group, data, lodLevel);
        break;
      case "lab":
        this.createLab(group, data, lodLevel);
        break;
      case "library":
        this.createLibrary(group, data, lodLevel);
        break;
      case "dorm":
        this.createDormitory(group, data, lodLevel);
        break;
      case "dining":
        this.createDining(group, data, lodLevel);
        break;
      case "gym":
        this.createGym(group, data, lodLevel);
        break;
      case "admin":
        this.createAdmin(group, data, lodLevel);
        break;
      case "auditorium":
        this.createAuditorium(group, data, lodLevel);
        break;
      case "solar":
        this.createSolar(group, data, lodLevel);
        break;
      default:
        this.createGenericBox(group, data, lodLevel);
    }

    // 碳排热力发光层
    this.addEmissionGlow(group, data);

    // 定位
    group.position.set(data.x, 0, data.z);
    if (data.rotation) group.rotation.y = data.rotation;

    return group;
  }

  /** 教学楼原型: 对称长条体量 + 门廊 + 竖向条窗 */
  private createTeaching(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    // 主楼
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    // 屋顶女儿墙
    this.addParapet(group, width, depth, height, data.color);
    // 翼楼
    if (data.wings) {
      for (const w of data.wings) {
        this.addBox(group, w.width, w.height, w.depth, data.color, w.offsetX, w.height / 2, w.offsetZ, true);
        this.addParapet(group, w.width, w.depth, w.height, data.color);
      }
    }
    // 门廊
    if (lod !== "low" && height > 10) {
      this.addEntranceCanopy(group, width, depth, height, 2.5, 3.5);
    }
    // 窗户
    if (lod === "high") {
      this.addWindows(group, width, depth, height, floors, 1.8, 2.4);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 实验楼原型: 主体 + 侧翼设备间 + 较大窗户 */
  private createLab(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    this.addParapet(group, width, depth, height, data.color);
    // 翼楼
    if (data.wings) {
      for (const w of data.wings) {
        this.addBox(group, w.width, w.height, w.depth, data.color, w.offsetX, w.height / 2, w.offsetZ, true);
        this.addParapet(group, w.width, w.depth, w.height, data.color);
      }
    }
    if (lod !== "low" && height > 10) {
      this.addEntranceCanopy(group, width, depth, height, 2, 3);
    }
    if (lod === "high") {
      this.addWindows(group, width, depth, height, floors, 2.0, 2.8);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 图书馆原型: 中心大体量 + 两翼 + 挑高大堂 */
  private createLibrary(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    // 中心塔楼
    const towerW = width * 0.55;
    const towerD = depth * 0.6;
    this.addBox(group, towerW, height, towerD, data.color, 0, height / 2, 0, true);
    this.addParapet(group, towerW, towerD, height, data.color);
    // 两翼
    if (data.wings) {
      for (const w of data.wings) {
        this.addBox(group, w.width, w.height, w.depth, data.color, w.offsetX, w.height / 2, w.offsetZ, true);
        this.addParapet(group, w.width, w.depth, w.height, data.color);
      }
    }
    // 大台阶
    if (lod !== "low") {
      const stepGeo = new THREE.BoxGeometry(width * 0.6, 1.2, 4);
      const stepMat = this.matFactory.getBuildingWall("#9ca3af");
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(0, 0.6, depth / 2 + 2);
      step.castShadow = true;
      step.receiveShadow = true;
      group.add(step);
    }
    if (lod === "high") {
      this.addWindows(group, towerW, towerD, height, floors, 2.2, 3.2);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 宿舍楼原型: 简洁板楼 + 阳台条纹 */
  private createDormitory(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    this.addParapet(group, width, depth, height, data.color);
    // 阳台条纹
    if (lod !== "low") {
      const floorH = height / floors;
      for (let i = 1; i < floors; i++) {
        const balGeo = new THREE.BoxGeometry(width + 0.4, 0.15, 0.8);
        const balMat = this.matFactory.getBuildingWall("#8b7355");
        const bal = new THREE.Mesh(balGeo, balMat);
        bal.position.set(0, i * floorH, depth / 2 + 0.4);
        bal.castShadow = true;
        group.add(bal);
      }
    }
    if (lod === "high") {
      this.addWindows(group, width, depth, height, floors, 1.4, 1.8);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 食堂原型: 矮胖体量 + 大玻璃幕墙 + 排烟口 */
  private createDining(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    // 斜屋顶
    const roofGeo = new THREE.BoxGeometry(width + 1, 0.3, depth + 1);
    const roofMat = this.matFactory.getBuildingRoof();
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = height + 0.15;
    roof.castShadow = true;
    group.add(roof);
    // 排烟口
    if (lod !== "low") {
      const chimneyGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
      const chimneyMat = this.matFactory.getBuildingWall("#6b7280");
      const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
      chimney.position.set(width / 4, height + 1, depth / 4);
      chimney.castShadow = true;
      group.add(chimney);
    }
    if (lod === "high") {
      // 大玻璃幕墙
      const glassGeo = new THREE.PlaneGeometry(width * 0.8, height * 0.6);
      const glassMat = this.matFactory.getWindowGlass();
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(0, height * 0.45, depth / 2 + 0.05);
      group.add(glass);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 体育馆原型: 大跨度弧顶 + 金属质感 */
  private createGym(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height } = data;
    // 主体
    this.addBox(group, width, height * 0.7, depth, data.color, 0, height * 0.35, 0, true);
    // 弧顶
    const arcGeo = new THREE.CylinderGeometry(
      Math.max(0.1, width / 2),
      Math.max(0.1, width / 2),
      depth,
      16, 1, true, 0, Math.PI
    );
    const arcMat = new THREE.MeshStandardMaterial({
      color: "#a0b0c0",
      roughness: 0.3,
      metalness: 0.7,
      side: THREE.DoubleSide,
    });
    const arc = new THREE.Mesh(arcGeo, arcMat);
    arc.rotation.z = Math.PI / 2;
    arc.rotation.y = Math.PI / 2;
    arc.position.set(0, height * 0.7, 0);
    arc.castShadow = true;
    group.add(arc);
    if (lod !== "low") {
      // 入口
      this.addEntranceCanopy(group, width * 0.5, depth, height * 0.7, 4, 3);
    }
  }

  /** 行政楼原型: 庄重对称 + 柱廊 */
  private createAdmin(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    this.addParapet(group, width, depth, height, data.color);
    // 柱廊
    if (lod !== "low") {
      const pillarCount = 5;
      const spacing = width / (pillarCount + 1);
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, height * 0.5, 8);
      const pillarMat = this.matFactory.getBuildingWall("#d4c5b0");
      for (let i = 0; i < pillarCount; i++) {
        const pillar = new THREE.Mesh(pillarGeo, pillarMat);
        pillar.position.set(-width / 2 + spacing * (i + 1), height * 0.25, depth / 2 + 1.5);
        pillar.castShadow = true;
        group.add(pillar);
      }
      // 柱廊顶
      const porchGeo = new THREE.BoxGeometry(width + 1, 0.3, 3.5);
      const porchMat = this.matFactory.getBuildingRoof();
      const porch = new THREE.Mesh(porchGeo, porchMat);
      porch.position.set(0, height * 0.5, depth / 2 + 1.75);
      porch.castShadow = true;
      group.add(porch);
    }
    if (lod === "high") {
      this.addWindows(group, width, depth, height, floors, 1.8, 2.4);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  /** 大礼堂原型: 椭圆体量 + 拱顶 */
  private createAuditorium(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height } = data;
    // 主体
    this.addBox(group, width, height * 0.6, depth, data.color, 0, height * 0.3, 0, true);
    // 拱顶
    const domeRadius = Math.max(0.1, Math.min(width, depth) / 2);
    const domeGeo = new THREE.SphereGeometry(domeRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({
      color: "#b8a088",
      roughness: 0.5,
      metalness: 0.3,
    });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.set(0, height * 0.6, 0);
    dome.scale.set(width / (domeRadius * 2), (height * 0.4) / domeRadius, depth / (domeRadius * 2));
    dome.castShadow = true;
    group.add(dome);
    // 门廊台阶
    if (lod !== "low") {
      const stepGeo = new THREE.BoxGeometry(width * 0.4, 1.5, 5);
      const stepMat = this.matFactory.getBuildingWall("#9ca3af");
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(0, 0.75, depth / 2 + 2.5);
      step.castShadow = true;
      group.add(step);
    }
  }

  /** 光伏配电房原型: 矮平顶 + 太阳能板 */
  private createSolar(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    // 太阳能板
    if (lod !== "low") {
      const panelGeo = new THREE.BoxGeometry(width * 0.9, 0.15, depth * 0.9);
      const panelMat = new THREE.MeshStandardMaterial({
        color: "#1a3a5c",
        roughness: 0.1,
        metalness: 0.9,
      });
      const panel = new THREE.Mesh(panelGeo, panelMat);
      panel.position.set(0, height + 1, 0);
      panel.rotation.x = -0.3;
      panel.castShadow = true;
      group.add(panel);
    }
  }

  /** 通用盒子建筑 */
  private createGenericBox(group: THREE.Group, data: BuildingData, lod: string): void {
    const { width, depth, height, floors } = data;
    this.addBox(group, width, height, depth, data.color, 0, height / 2, 0, true);
    this.addParapet(group, width, depth, height, data.color);
    if (lod === "high") {
      this.addWindows(group, width, depth, height, floors, 1.8, 2.4);
    } else if (lod === "mid") {
      this.addWindowsSimple(group, width, depth, height, floors);
    }
  }

  // ── 通用零件 ──

  private addBox(
    group: THREE.Group,
    w: number, h: number, d: number,
    color: string,
    x: number, y: number, z: number,
    shadow: boolean
  ): void {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = this.matFactory.getBuildingWall(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  private addParapet(group: THREE.Group, w: number, d: number, h: number, color: string): void {
    const pH = 0.5;
    const pT = 0.15;
    const roofH = 0.3;
    const baseY = h + roofH + pH / 2;
    // 前后
    const fbGeo = new THREE.BoxGeometry(w + 0.4, pH, pT);
    const mat = this.matFactory.getBuildingWall(color);
    const front = new THREE.Mesh(fbGeo, mat);
    front.position.set(0, baseY, d / 2 + 0.2);
    group.add(front);
    const back = new THREE.Mesh(fbGeo, mat);
    back.position.set(0, baseY, -d / 2 - 0.2);
    group.add(back);
    // 左右
    const lrGeo = new THREE.BoxGeometry(pT, pH, d + 0.4);
    const left = new THREE.Mesh(lrGeo, mat);
    left.position.set(-w / 2 - 0.2, baseY, 0);
    group.add(left);
    const right = new THREE.Mesh(lrGeo, mat);
    right.position.set(w / 2 + 0.2, baseY, 0);
    group.add(right);
    // 屋顶
    const roofGeo = new THREE.BoxGeometry(w + 0.6, roofH, d + 0.6);
    const roofMat = this.matFactory.getBuildingRoof();
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = h + roofH / 2;
    roof.castShadow = true;
    group.add(roof);
  }

  private addEntranceCanopy(
    group: THREE.Group,
    bw: number, bd: number, bh: number,
    cw: number, ch: number
  ): void {
    const doorGeo = new THREE.BoxGeometry(cw, ch, 2);
    const doorMat = this.matFactory.getBuildingWall("#374151");
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(0, ch / 2, bd / 2 + 1);
    door.castShadow = true;
    group.add(door);
    // 顶
    const topGeo = new THREE.BoxGeometry(cw + 1, 0.2, 3);
    const topMat = this.matFactory.getBuildingWall("#6b7280");
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.set(0, ch, bd / 2 + 1.5);
    top.castShadow = true;
    group.add(top);
    // 柱
    const pillarGeo = new THREE.CylinderGeometry(0.15, 0.15, ch, 8);
    const pillarMat = this.matFactory.getBuildingWall("#9ca3af");
    const p1 = new THREE.Mesh(pillarGeo, pillarMat);
    p1.position.set(-cw / 2, ch / 2, bd / 2 + 2);
    p1.castShadow = true;
    group.add(p1);
    const p2 = new THREE.Mesh(pillarGeo, pillarMat);
    p2.position.set(cw / 2, ch / 2, bd / 2 + 2);
    p2.castShadow = true;
    group.add(p2);
  }

  /** 高LOD窗户 - 带窗框和玻璃 */
  private addWindows(
    group: THREE.Group,
    w: number, d: number, h: number,
    floors: number,
    winW: number, winH: number
  ): void {
    const floorH = h / floors;
    const frameMat = this.matFactory.getWindowFrame();
    const glassMat = this.matFactory.getWindowGlass();

    // 前后面窗户
    const colsFront = Math.max(1, Math.floor(w / (winW + 0.6)));
    const spacingFront = w / (colsFront + 0.5);

    for (let row = 0; row < floors; row++) {
      for (let col = 0; col < colsFront; col++) {
        const px = -w / 2 + spacingFront * (col + 0.75);
        const py = floorH * 0.55 + row * floorH;

        // 前面
        const frame = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.06), frameMat);
        frame.position.set(px, py, d / 2 + 0.03);
        group.add(frame);
        const glass = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.12, winH - 0.12, 0.04), glassMat);
        glass.position.set(px, py, d / 2 + 0.05);
        group.add(glass);

        // 后面
        const frameB = new THREE.Mesh(new THREE.BoxGeometry(winW, winH, 0.06), frameMat);
        frameB.position.set(px, py, -d / 2 - 0.03);
        group.add(frameB);
        const glassB = new THREE.Mesh(new THREE.BoxGeometry(winW - 0.12, winH - 0.12, 0.04), glassMat);
        glassB.position.set(px, py, -d / 2 - 0.05);
        group.add(glassB);
      }
    }

    // 侧面窗户
    const colsSide = Math.max(1, Math.floor(d / (winW + 0.6)));
    const spacingSide = d / (colsSide + 0.5);

    for (let row = 0; row < floors; row++) {
      for (let col = 0; col < colsSide; col++) {
        const pz = -d / 2 + spacingSide * (col + 0.75);
        const py = floorH * 0.55 + row * floorH;

        // 右
        const frameR = new THREE.Mesh(new THREE.BoxGeometry(0.06, winH, winW), frameMat);
        frameR.position.set(w / 2 + 0.03, py, pz);
        group.add(frameR);
        const glassR = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH - 0.12, winW - 0.12), glassMat);
        glassR.position.set(w / 2 + 0.05, py, pz);
        group.add(glassR);

        // 左
        const frameL = new THREE.Mesh(new THREE.BoxGeometry(0.06, winH, winW), frameMat);
        frameL.position.set(-w / 2 - 0.03, py, pz);
        group.add(frameL);
        const glassL = new THREE.Mesh(new THREE.BoxGeometry(0.04, winH - 0.12, winW - 0.12), glassMat);
        glassL.position.set(-w / 2 - 0.05, py, pz);
        group.add(glassL);
      }
    }
  }

  /** 中LOD窗户 - 简化纹理条 */
  private addWindowsSimple(
    group: THREE.Group,
    w: number, d: number, h: number,
    floors: number
  ): void {
    const floorH = h / floors;
    const glassMat = new THREE.MeshStandardMaterial({
      color: "#7baac4",
      roughness: 0.2,
      metalness: 0.5,
      transparent: true,
      opacity: 0.6,
    });

    for (let row = 0; row < floors; row++) {
      const y = floorH * 0.55 + row * floorH;
      const stripH = floorH * 0.45;

      // 前后
      const stripFGeo = new THREE.PlaneGeometry(w * 0.85, stripH);
      const stripF = new THREE.Mesh(stripFGeo, glassMat);
      stripF.position.set(0, y, d / 2 + 0.05);
      group.add(stripF);
      const stripB = new THREE.Mesh(stripFGeo, glassMat);
      stripB.position.set(0, y, -d / 2 - 0.05);
      stripB.rotation.y = Math.PI;
      group.add(stripB);

      // 左右
      const stripSGeo = new THREE.PlaneGeometry(d * 0.85, stripH);
      const stripR = new THREE.Mesh(stripSGeo, glassMat);
      stripR.position.set(w / 2 + 0.05, y, 0);
      stripR.rotation.y = -Math.PI / 2;
      group.add(stripR);
      const stripL = new THREE.Mesh(stripSGeo, glassMat);
      stripL.position.set(-w / 2 - 0.05, y, 0);
      stripL.rotation.y = Math.PI / 2;
      group.add(stripL);
    }
  }

  /** 碳排热力发光层 */
  private addEmissionGlow(group: THREE.Group, data: BuildingData): void {
    const maxDim = Math.max(data.width, data.depth, data.height);
    const glowSize = maxDim * 1.15;
    const glowGeo = new THREE.BoxGeometry(glowSize, data.height * 1.1, glowSize);
    const glowMat = this.matFactory.getEmissionGlow(data.emissionLevel);
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = data.height / 2;
    glow.name = "emission-glow";
    group.add(glow);
  }
}

// ============================================================
// 环境系统 - InstancedMesh 树木/路灯 + 道路/绿地/水系
// ============================================================

class EnvironmentSystem {
  private matFactory: MaterialFactory;

  constructor(matFactory: MaterialFactory) {
    this.matFactory = matFactory;
  }

  /** 创建 InstancedMesh 树木 */
  createTrees(data: CampusData): THREE.InstancedMesh {
    // 共享几何体 - 多变体通过缩放实现
    const trunkGeo = new THREE.CylinderGeometry(0.12, 0.2, 2.5, 6);
    const crownGeo = new THREE.SphereGeometry(1.8, 8, 6);

    // 合并为一个几何体
    const treeGeo = new THREE.Group();
    const trunkMesh = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: "#5c4033", roughness: 0.9 }));
    trunkMesh.position.y = 1.25;
    treeGeo.add(trunkMesh);

    const crownColors = ["#2d5016", "#3d6b1f", "#4a7c28"];
    for (let i = 0; i < 3; i++) {
      const crown = new THREE.Mesh(
        new THREE.SphereGeometry(1.8 - i * 0.3, 8, 6),
        new THREE.MeshStandardMaterial({ color: crownColors[i], roughness: 0.85 })
      );
      crown.position.y = 3 + i * 0.5;
      treeGeo.add(crown);
    }

    // 使用简单的树形 InstancedMesh: 树干+树冠合并
    // 简化方案: 一个圆柱+球体的 InstancedMesh
    const mergedTreeGeo = new THREE.BufferGeometry();
    
    // 树干
    const tGeo = new THREE.CylinderGeometry(0.12, 0.2, 2.5, 6);
    tGeo.translate(0, 1.25, 0);
    
    // 树冠 - 3层
    const c1 = new THREE.SphereGeometry(1.8, 8, 6);
    c1.translate(0, 3.5, 0);
    const c2 = new THREE.SphereGeometry(1.5, 8, 6);
    c2.translate(0, 4.2, 0);
    const c3 = new THREE.SphereGeometry(1.1, 8, 6);
    c3.translate(0, 4.8, 0);

    // 合并几何体
    const geometries = [tGeo, c1, c2, c3];
    const merged = mergeGeometries(geometries);
    
    const treeMat = new THREE.MeshStandardMaterial({
      color: "#3d6b1f",
      roughness: 0.85,
    });

    const instancedMesh = new THREE.InstancedMesh(merged, treeMat, TREE_COUNT);
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    data.trees.forEach((tree, i) => {
      dummy.position.set(tree.x, 0, tree.z);
      dummy.scale.set(tree.scale, tree.scale, tree.scale);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;

    return instancedMesh;
  }

  /** 创建 InstancedMesh 路灯 */
  createStreetLights(data: CampusData): THREE.InstancedMesh {
    // 灯杆几何体
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4, 6);
    poleGeo.translate(0, 2, 0);
    const headGeo = new THREE.BoxGeometry(0.8, 0.2, 0.4);
    headGeo.translate(0, 4.1, 0);

    const merged = mergeGeometries([poleGeo, headGeo]);
    const lightMat = new THREE.MeshStandardMaterial({
      color: "#6b7280",
      roughness: 0.4,
      metalness: 0.6,
      emissive: "#fbbf24",
      emissiveIntensity: 0.15,
    });

    const instancedMesh = new THREE.InstancedMesh(merged, lightMat, LIGHT_COUNT);
    instancedMesh.castShadow = true;

    const dummy = new THREE.Object3D();
    data.streetLights.forEach((light, i) => {
      dummy.position.set(light.x, 0, light.z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    instancedMesh.instanceMatrix.needsUpdate = true;

    return instancedMesh;
  }

  /** 创建道路 */
  createRoads(data: CampusData): THREE.Group {
    const roadsGroup = new THREE.Group();

    for (const road of data.roads) {
      if (road.points.length < 2) continue;

      // 将折线点转换为路段
      for (let i = 0; i < road.points.length - 1; i++) {
        const p1 = road.points[i];
        const p2 = road.points[i + 1];
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);

        const roadGeo = new THREE.PlaneGeometry(road.width, length);
        const roadMat = this.matFactory.getRoad(road.type);
        const roadMesh = new THREE.Mesh(roadGeo, roadMat);
        roadMesh.rotation.x = -Math.PI / 2;
        roadMesh.rotation.z = -angle;
        roadMesh.position.set(
          (p1.x + p2.x) / 2,
          0.02,
          (p1.z + p2.z) / 2
        );
        roadMesh.receiveShadow = true;
        roadsGroup.add(roadMesh);
      }

      // 主干道中心线
      if (road.type === "main" && road.points.length >= 2) {
        for (let i = 0; i < road.points.length - 1; i++) {
          const p1 = road.points[i];
          const p2 = road.points[i + 1];
          const dx = p2.x - p1.x;
          const dz = p2.z - p1.z;
          const length = Math.sqrt(dx * dx + dz * dz);
          const angle = Math.atan2(dx, dz);

          const lineGeo = new THREE.PlaneGeometry(0.15, length);
          const lineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
          const lineMesh = new THREE.Mesh(lineGeo, lineMat);
          lineMesh.rotation.x = -Math.PI / 2;
          lineMesh.rotation.z = -angle;
          lineMesh.position.set(
            (p1.x + p2.x) / 2,
            0.03,
            (p1.z + p2.z) / 2
          );
          roadsGroup.add(lineMesh);
        }
      }
    }

    return roadsGroup;
  }

  /** 创建绿地 */
  createGreenSpaces(data: CampusData): THREE.Group {
    const greenGroup = new THREE.Group();

    for (const gs of data.greenSpaces) {
      const geo = new THREE.PlaneGeometry(gs.width, gs.depth);
      const colors: Record<string, string> = {
        lawn: "#5a7247",
        flowerbed: "#6b8e4e",
        hedge: "#3d5c2e",
      };
      const mat = new THREE.MeshStandardMaterial({
        color: colors[gs.type] || "#5a7247",
        roughness: 0.95,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(gs.x, 0.005, gs.z);
      if (gs.rotation) mesh.rotation.z = gs.rotation;
      mesh.receiveShadow = true;
      greenGroup.add(mesh);
    }

    return greenGroup;
  }

  /** 创建水系 */
  createWaterBodies(data: CampusData): THREE.Group {
    const waterGroup = new THREE.Group();

    for (const wb of data.waterBodies) {
      const geo = new THREE.CircleGeometry(1, 32);
      const mat = new THREE.MeshPhysicalMaterial({
        color: "#1e4d6b",
        roughness: 0.05,
        metalness: 0.3,
        transmission: 0.1,
        clearcoat: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(wb.x, 0.02, wb.z);
      mesh.scale.set(wb.radiusX, wb.radiusZ, 1);
      mesh.receiveShadow = true;
      waterGroup.add(mesh);
    }

    return waterGroup;
  }

  /** 创建运动场 */
  createSportsFields(data: CampusData): THREE.Group {
    const sportsGroup = new THREE.Group();

    for (const sf of data.sportsFields) {
      const fieldGroup = new THREE.Group();

      if (sf.type === "track") {
        // 跑道
        const trackGeo = new THREE.PlaneGeometry(sf.width, sf.depth);
        const trackMat = new THREE.MeshStandardMaterial({ color: "#c45c3d", roughness: 0.9 });
        const track = new THREE.Mesh(trackGeo, trackMat);
        track.rotation.x = -Math.PI / 2;
        track.position.y = 0.02;
        track.receiveShadow = true;
        fieldGroup.add(track);

        // 草坪
        const fieldGeo = new THREE.PlaneGeometry(sf.width * 0.55, sf.depth * 0.55);
        const fieldMat = new THREE.MeshStandardMaterial({ color: "#4a7c59", roughness: 0.9 });
        const field = new THREE.Mesh(fieldGeo, fieldMat);
        field.rotation.x = -Math.PI / 2;
        field.position.y = 0.03;
        field.receiveShadow = true;
        fieldGroup.add(field);

        // 跑道线
        for (let i = 0; i < 4; i++) {
          const lineGeo = new THREE.PlaneGeometry(sf.width * (0.95 - i * 0.1), 0.12);
          const lineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
          const line = new THREE.Mesh(lineGeo, lineMat);
          line.rotation.x = -Math.PI / 2;
          line.position.y = 0.04;
          line.position.z = -sf.depth * 0.35 + i * sf.depth * 0.23;
          fieldGroup.add(line);
        }
      } else if (sf.type === "basketball") {
        const courtGeo = new THREE.PlaneGeometry(sf.width, sf.depth);
        const courtMat = new THREE.MeshStandardMaterial({ color: "#c47a3d", roughness: 0.9 });
        const court = new THREE.Mesh(courtGeo, courtMat);
        court.rotation.x = -Math.PI / 2;
        court.position.y = 0.02;
        court.receiveShadow = true;
        fieldGroup.add(court);
      } else if (sf.type === "tennis") {
        const courtGeo = new THREE.PlaneGeometry(sf.width, sf.depth);
        const courtMat = new THREE.MeshStandardMaterial({ color: "#2d6b3e", roughness: 0.9 });
        const court = new THREE.Mesh(courtGeo, courtMat);
        court.rotation.x = -Math.PI / 2;
        court.position.y = 0.02;
        court.receiveShadow = true;
        fieldGroup.add(court);
      }

      fieldGroup.position.set(sf.x, 0, sf.z);
      if (sf.rotation) fieldGroup.rotation.y = sf.rotation;
      sportsGroup.add(fieldGroup);
    }

    return sportsGroup;
  }

  /** 创建停车场 */
  createParkingLots(data: CampusData): THREE.Group {
    const parkingGroup = new THREE.Group();

    for (const pl of data.parkingLots) {
      const lotGroup = new THREE.Group();
      const groundGeo = new THREE.PlaneGeometry(pl.width, pl.depth);
      const groundMat = new THREE.MeshStandardMaterial({ color: "#4b5563", roughness: 0.95 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = 0.015;
      ground.receiveShadow = true;
      lotGroup.add(ground);

      // 停车位线
      const spotCount = Math.floor(pl.width / 2.5);
      for (let i = 0; i < spotCount; i++) {
        const lineGeo = new THREE.PlaneGeometry(0.1, pl.depth * 0.8);
        const lineMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
        const line = new THREE.Mesh(lineGeo, lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-pl.width / 2 + 1.25 + i * 2.5, 0.02, 0);
        lotGroup.add(line);
      }

      lotGroup.position.set(pl.x, 0, pl.z);
      parkingGroup.add(lotGroup);
    }

    return parkingGroup;
  }

  /** 创建地面 */
  createGround(): THREE.Mesh {
    const groundGeo = new THREE.PlaneGeometry(250, 200);
    const groundMat = this.matFactory.getGround();
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    return ground;
  }
}

// ============================================================
// 几何体合并工具
// ============================================================

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  let vertexOffset = 0;

  for (const geo of geometries) {
    const posAttr = geo.getAttribute("position");
    const normAttr = geo.getAttribute("normal");
    const idxAttr = geo.getIndex();

    for (let i = 0; i < posAttr.count; i++) {
      positions.push(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
      if (normAttr) {
        normals.push(normAttr.getX(i), normAttr.getY(i), normAttr.getZ(i));
      }
    }

    if (idxAttr) {
      for (let i = 0; i < idxAttr.count; i++) {
        indices.push(idxAttr.getX(i) + vertexOffset);
      }
    }

    vertexOffset += posAttr.count;
  }

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length > 0) {
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  }
  if (indices.length > 0) {
    merged.setIndex(indices);
  }

  return merged;
}

// ============================================================
// LOD 管理器
// ============================================================

class LODManager {
  private camera: THREE.PerspectiveCamera;
  private buildingGroups: Map<string, THREE.LOD> = new Map();
  private buildingFactory: BuildingFactory;
  private matFactory: MaterialFactory;

  constructor(camera: THREE.PerspectiveCamera, matFactory: MaterialFactory) {
    this.camera = camera;
    this.matFactory = matFactory;
    this.buildingFactory = new BuildingFactory(matFactory);
  }

  addBuilding(data: BuildingData): THREE.LOD {
    const lod = new THREE.LOD();

    // 高精度模型
    const highModel = this.buildingFactory.createBuilding(data, "high");
    lod.addLevel(highModel, 0);

    // 中精度模型
    const midModel = this.buildingFactory.createBuilding(data, "mid");
    lod.addLevel(midModel, LOD_HIGH_DIST);

    // 低精度模型
    const lowModel = this.buildingFactory.createBuilding(data, "low");
    lod.addLevel(lowModel, LOD_MID_DIST);

    this.buildingGroups.set(data.buildingId, lod);
    return lod;
  }

  update(): void {
    this.buildingGroups.forEach((lod) => {
      lod.update(this.camera);
    });
  }

  getBuildingGroup(buildingId: string): THREE.Group | null {
    const lod = this.buildingGroups.get(buildingId);
    if (!lod) return null;
    // 获取当前可见级别
    return lod.levels[0]?.object as THREE.Group;
  }
}

// ============================================================
// 交互管理器
// ============================================================

class InteractionManager {
  private container: HTMLDivElement;
  private camera: THREE.PerspectiveCamera;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private buildingMeshes: Map<string, THREE.LOD>;
  private onBuildingClick: ((id: string) => void) | undefined;
  private hoveredBuildingId: string | null = null;
  private previousHovered: THREE.Mesh | null = null;
  private onHover: ((id: string | null, x: number, y: number, data: BuildingData | null) => void) | undefined;
  private allBuildingObjects: THREE.Object3D[] = [];

  constructor(
    container: HTMLDivElement,
    camera: THREE.PerspectiveCamera,
    buildingMeshes: Map<string, THREE.LOD>,
    onBuildingClick: ((id: string) => void) | undefined,
    onHover: ((id: string | null, x: number, y: number, data: BuildingData | null) => void) | undefined,
  ) {
    this.container = container;
    this.camera = camera;
    this.buildingMeshes = buildingMeshes;
    this.onBuildingClick = onBuildingClick;
    this.onHover = onHover;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // 收集所有建筑子对象用于射线检测
    this.buildingMeshes.forEach((lod) => {
      lod.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.allBuildingObjects.push(child);
        }
      });
    });

    this.container.addEventListener("mousemove", this.handleMouseMove);
    this.container.addEventListener("click", this.handleClick);
  }

  private handleMouseMove = (event: MouseEvent): void => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.allBuildingObjects, false);

    // 重置之前的悬停
    if (this.previousHovered) {
      this.previousHovered = null;
    }

    if (intersects.length > 0) {
      let target = intersects[0].object;
      // 向上查找到 LOD 中的 Group
      while (target.parent && !target.userData.buildingId) {
        target = target.parent;
      }
      if (target.userData.buildingId) {
        this.hoveredBuildingId = target.userData.buildingId;
        this.container.style.cursor = "pointer";
        if (this.onHover) {
          this.onHover(
            target.userData.buildingId,
            event.clientX - rect.left,
            event.clientY - rect.top,
            target.userData as BuildingData,
          );
        }
        return;
      }
    }

    this.hoveredBuildingId = null;
    this.container.style.cursor = "default";
    if (this.onHover) {
      this.onHover(null, 0, 0, null);
    }
  };

  private handleClick = (): void => {
    if (this.hoveredBuildingId && this.onBuildingClick) {
      this.onBuildingClick(this.hoveredBuildingId);
    }
  };

  getHoveredBuildingId(): string | null {
    return this.hoveredBuildingId;
  }

  updateBuildingCollection(buildingMeshes: Map<string, THREE.LOD>): void {
    this.buildingMeshes = buildingMeshes;
    this.allBuildingObjects = [];
    this.buildingMeshes.forEach((lod) => {
      lod.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          this.allBuildingObjects.push(child);
        }
      });
    });
  }

  dispose(): void {
    this.container.removeEventListener("mousemove", this.handleMouseMove);
    this.container.removeEventListener("click", this.handleClick);
  }
}

// ============================================================
// 碳排动态变色管理器
// ============================================================

class EmissionColorManager {
  private buildingMeshes: Map<string, THREE.LOD>;
  private colorMode: "carbon" | "energy";

  constructor(buildingMeshes: Map<string, THREE.LOD>, colorMode: "carbon" | "energy" = "carbon") {
    this.buildingMeshes = buildingMeshes;
    this.colorMode = colorMode;
  }

  setColorMode(mode: "carbon" | "energy"): void {
    this.colorMode = mode;
  }

  /** 更新建筑发光层颜色 */
  updateEmissionColors(emissionMap: Map<string, EmissionLevel>): void {
    this.buildingMeshes.forEach((lod, buildingId) => {
      const level = emissionMap.get(buildingId);
      if (!level) return;

      lod.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === "emission-glow") {
          const color = getEmissionColor(level);
          if (child.material instanceof THREE.MeshBasicMaterial) {
            child.material.color.set(color);
          }
        }
      });
    });
  }

  /** 更新建筑发光层颜色 - 能耗模式 */
  updateEnergyColors(): void {
    this.buildingMeshes.forEach((lod, buildingId) => {
      const bData = CAMPUS_DATA.buildings.find((b) => b.buildingId === buildingId);
      if (!bData) return;

      lod.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === "emission-glow") {
          const color = getEnergyColorByValue(bData.energyIntensity);
          if (child.material instanceof THREE.MeshBasicMaterial) {
            child.material.color.set(color);
            child.material.opacity = 0.15;
          }
        }
      });
    });
  }

  /** 刷新所有发光层 (根据当前 colorMode) */
  refreshAll(): void {
    if (this.colorMode === "energy") {
      this.updateEnergyColors();
    } else {
      const emissionMap = new Map<string, EmissionLevel>();
      CAMPUS_DATA.buildings.forEach((b) => emissionMap.set(b.buildingId, b.emissionLevel));
      this.updateEmissionColors(emissionMap);
    }
  }

  /** 设置建筑高亮状态 */
  setHighlight(buildingId: string, isHighlighted: boolean): void {
    const lod = this.buildingMeshes.get(buildingId);
    if (!lod) return;

    lod.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === "emission-glow") {
        if (child.material instanceof THREE.MeshBasicMaterial) {
          child.material.opacity = isHighlighted ? 0.25 : 0.08;
        }
      }
    });
  }

  /** 设置建筑过滤可见性 */
  setFilterVisibility(visibleIds: Set<string> | null): void {
    this.buildingMeshes.forEach((lod, id) => {
      if (visibleIds === null) {
        lod.visible = true;
        lod.traverse((child) => {
          if (child instanceof THREE.Mesh && child.name === "emission-glow") {
            if (child.material instanceof THREE.MeshBasicMaterial) {
              child.material.opacity = 0.08;
            }
          }
        });
      } else {
        lod.visible = visibleIds.has(id);
        if (lod.visible) {
          lod.traverse((child) => {
            if (child instanceof THREE.Mesh && child.name === "emission-glow") {
              if (child.material instanceof THREE.MeshBasicMaterial) {
                child.material.opacity = 0.15;
              }
            }
          });
        }
      }
    });
  }
}

// ============================================================
// 相机聚焦动画
// ============================================================

function focusOnBuilding(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  building: BuildingData,
  duration: number = 800
): void {
  const targetPos = new THREE.Vector3(building.x, building.height / 2, building.z);
  const cameraOffset = new THREE.Vector3(
    building.x + building.width * 0.8,
    building.height * 1.5 + 15,
    building.z + building.depth * 0.8,
  );

  const startPos = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = performance.now();

  function animate(): void {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const ease = 1 - Math.pow(1 - t, 3);

    camera.position.lerpVectors(startPos, cameraOffset, ease);
    controls.target.lerpVectors(startTarget, targetPos, ease);
    controls.update();

    if (t < 1) {
      requestAnimationFrame(animate);
    }
  }
  animate();
}

// ============================================================
// React 组件
// ============================================================

export function CampusScene3D({
  level = "L1",
  selectedBuilding,
  onBuildingClick,
  filterType,
  colorMode = "carbon",
  nightMode = false,
}: CampusScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    building: BuildingData;
  } | null>(null);

  // 计算总排放量（排除光伏等负值）
  const totalEmission = useMemo(
    () => CAMPUS_DATA.buildings.filter((b) => b.emission > 0).reduce((sum, b) => sum + b.emission, 0),
    []
  );

  // 获取异常数据
  const anomalies = useMemo(() => getAnomalies(), []);

  // 使用 ref 保存引擎实例，避免 re-render 重建
  const engineRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    lodManager: LODManager;
    interactionManager: InteractionManager;
    emissionManager: EmissionColorManager;
    matFactory: MaterialFactory;
    animationId: number;
    buildingMeshes: Map<string, THREE.LOD>;
  } | null>(null);

  // 悬停提示回调（需 useCallback 避免 effect 重复触发）
  const handleHover = useCallback(
    (id: string | null, x: number, y: number, data: BuildingData | null) => {
      if (id && data) {
        setTooltip({ x, y, building: data });
      } else {
        setTooltip(null);
      }
    },
    []
  );

  // ── 初始化场景 ──
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 场景
    const scene = new THREE.Scene();
    if (nightMode) {
      scene.background = new THREE.Color("#0a1628");
      scene.fog = new THREE.FogExp2("#0a1628", 0.0025);
    } else {
      scene.background = new THREE.Color("#87ceeb");
      scene.fog = new THREE.FogExp2("#c8dce8", 0.004);
    }

    // 相机
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.5, 800);
    camera.position.set(80, 65, 80);
    camera.lookAt(0, 0, 0);

    // 渲染器
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

    // 控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = MAX_POLAR_ANGLE;
    controls.minDistance = 25;
    controls.maxDistance = 200;
    controls.target.set(0, 0, 0);

    // ── 光照 ──
    if (nightMode) {
      // 夜景: 低环境光 + 暖色窗光
      const ambientLight = new THREE.AmbientLight("#1a2a4a", 0.3);
      scene.add(ambientLight);
      const hemiLight = new THREE.HemisphereLight("#1a2a4a", "#0a1628", 0.15);
      scene.add(hemiLight);
      // 月光
      const moonLight = new THREE.DirectionalLight("#4a6fa5", 0.6);
      moonLight.position.set(30, 50, 30);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
      moonLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
      moonLight.shadow.camera.near = 0.5;
      moonLight.shadow.camera.far = 250;
      moonLight.shadow.camera.left = -100;
      moonLight.shadow.camera.right = 100;
      moonLight.shadow.camera.top = 100;
      moonLight.shadow.camera.bottom = -100;
      moonLight.shadow.bias = -0.0001;
      scene.add(moonLight);
    } else {
      // 日景: 标准光照
      const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);
      scene.add(ambientLight);
      const hemiLight = new THREE.HemisphereLight("#b0d4f1", "#5a7247", 0.3);
      scene.add(hemiLight);
      const sunLight = new THREE.DirectionalLight("#fff8e7", 1.8);
      sunLight.position.set(50, 60, 50);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
      sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 250;
      sunLight.shadow.camera.left = -100;
      sunLight.shadow.camera.right = 100;
      sunLight.shadow.camera.top = 100;
      sunLight.shadow.camera.bottom = -100;
      sunLight.shadow.bias = -0.0001;
      sunLight.shadow.normalBias = 0.02;
      scene.add(sunLight);
      const fillLight = new THREE.DirectionalLight("#b0d4f1", 0.4);
      fillLight.position.set(-40, 30, -40);
      scene.add(fillLight);
    }

    // ── 材质工厂 ──
    const matFactory = new MaterialFactory();

    // ── 环境 ──
    const envSystem = new EnvironmentSystem(matFactory);

    // 地面
    scene.add(envSystem.createGround());

    // 道路
    scene.add(envSystem.createRoads(CAMPUS_DATA));

    // 绿地
    scene.add(envSystem.createGreenSpaces(CAMPUS_DATA));

    // 水系
    scene.add(envSystem.createWaterBodies(CAMPUS_DATA));

    // 运动场
    scene.add(envSystem.createSportsFields(CAMPUS_DATA));

    // 停车场
    scene.add(envSystem.createParkingLots(CAMPUS_DATA));

    // 树木 (InstancedMesh)
    const treeMesh = envSystem.createTrees(CAMPUS_DATA);
    scene.add(treeMesh);

    // 路灯 (InstancedMesh)
    const lightMesh = envSystem.createStreetLights(CAMPUS_DATA);
    scene.add(lightMesh);

    // ── 建筑 (LOD) ──
    const lodManager = new LODManager(camera, matFactory);
    const buildingMeshes = new Map<string, THREE.LOD>();

    for (const bData of CAMPUS_DATA.buildings) {
      const lod = lodManager.addBuilding(bData);
      scene.add(lod);
      buildingMeshes.set(bData.buildingId, lod);
    }

    // ── 交互 ──
    const interactionManager = new InteractionManager(
      container, camera, buildingMeshes, onBuildingClick, handleHover
    );

    // ── 碳排/能耗变色 ──
    const emissionManager = new EmissionColorManager(buildingMeshes, colorMode);
    emissionManager.refreshAll();

    // ── 动画循环 ──
    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      lodManager.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── 窗口大小调整 ──
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 保存引擎引用
    engineRef.current = {
      renderer, scene, camera, controls,
      lodManager, interactionManager, emissionManager,
      matFactory, animationId, buildingMeshes,
    };

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      interactionManager.dispose();
      matFactory.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  // 只在挂载时初始化
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 层级切换 ──
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const { camera, controls } = engine;

    switch (level) {
      case "L1":
        camera.position.set(80, 65, 80);
        controls.minDistance = 35;
        break;
      case "L2":
        camera.position.set(55, 45, 55);
        controls.minDistance = 25;
        break;
      case "L3":
        camera.position.set(35, 28, 35);
        controls.minDistance = 15;
        break;
      case "L4":
        camera.position.set(65, 50, 65);
        controls.minDistance = 30;
        break;
    }
    controls.target.set(0, 0, 0);
    controls.update();
  }, [level]);

  // ── 选中建筑 ──
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    // 清除之前的高亮
    engine.emissionManager.setFilterVisibility(null);

    // 高亮选中
    engine.buildingMeshes.forEach((_, id) => {
      engine.emissionManager.setHighlight(id, id === selectedBuilding);
    });

    // 相机聚焦
    if (selectedBuilding) {
      const bData = CAMPUS_DATA.buildings.find((b) => b.buildingId === selectedBuilding);
      if (bData) {
        focusOnBuilding(engine.camera, engine.controls, bData);
      }
    }
  }, [selectedBuilding]);

  // ── 过滤类型 ──
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    if (!filterType) {
      engine.emissionManager.setFilterVisibility(null);
    } else {
      const typeMap: Record<string, string[]> = {
        "教学楼": ["teaching"],
        "实验楼": ["lab"],
        "图书馆": ["library"],
        "宿舍": ["dorm"],
        "食堂": ["dining"],
        "体育馆": ["gym"],
        "行政楼": ["admin"],
        "大礼堂": ["auditorium"],
        "光伏": ["solar"],
      };
      const types = typeMap[filterType] || [filterType];
      const visibleIds = new Set(
        CAMPUS_DATA.buildings
          .filter((b) => types.includes(b.type))
          .map((b) => b.buildingId)
      );
      engine.emissionManager.setFilterVisibility(visibleIds);
    }
  }, [filterType]);

  // ── 着色模式切换 ──
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.emissionManager.setColorMode(colorMode);
    engine.emissionManager.refreshAll();
  }, [colorMode]);

  // ── 夜景模式切换 ──
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (nightMode) {
      engine.scene.background = new THREE.Color("#0a1628");
      engine.scene.fog = new THREE.FogExp2("#0a1628", 0.0025);
      engine.renderer.toneMappingExposure = 0.8;
    } else {
      engine.scene.background = new THREE.Color("#87ceeb");
      engine.scene.fog = new THREE.FogExp2("#c8dce8", 0.004);
      engine.renderer.toneMappingExposure = 1.1;
    }
  }, [nightMode]);

  // ── 建筑标签位置 (3D→2D投影) ──
  const [buildingLabels, setBuildingLabels] = useState<Array<{
    buildingId: string;
    name: string;
    energyIntensity: number;
    color: string;
    value: number;
    x: number;
    y: number;
    visible: boolean;
  }>>([]);

  // 在动画循环中更新标签位置
  useEffect(() => {
    if (!colorMode || colorMode !== "energy") {
      setBuildingLabels([]);
      return;
    }
    const engine = engineRef.current;
    if (!engine) return;

    let lastUpdate = 0;
    const UPDATE_INTERVAL = 200; // 5fps for labels

    const updateLabels = () => {
      const now = performance.now();
      if (now - lastUpdate < UPDATE_INTERVAL) return;
      lastUpdate = now;

      const { camera, buildingMeshes } = engine;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      const labels: Array<{
        buildingId: string;
        name: string;
        energyIntensity: number;
        color: string;
        value: number;
        x: number;
        y: number;
        visible: boolean;
      }> = [];

      buildingMeshes.forEach((lod, buildingId) => {
        if (!lod.visible) return;
        const bData = CAMPUS_DATA.buildings.find((b) => b.buildingId === buildingId);
        if (!bData) return;

        // 3D world position → 2D screen
        const worldPos = new THREE.Vector3(bData.x, bData.height + 3, bData.z);
        const screenPos = worldPos.clone().project(camera);

        const x = (screenPos.x * 0.5 + 0.5) * rect.width;
        const y = (-screenPos.y * 0.5 + 0.5) * rect.height;
        const behindCamera = screenPos.z > 1;

        const energyColor = getEnergyColorByValue(bData.energyIntensity);

        labels.push({
          buildingId,
          name: bData.name,
          energyIntensity: bData.energyIntensity,
          color: energyColor,
          value: bData.energyIntensity,
          x,
          y,
          visible: !behindCamera && x > 0 && x < rect.width && y > 0 && y < rect.height,
        });
      });

      setBuildingLabels(labels);
    };

    // 在现有动画循环中插入标签更新
    const originalAnimate = engine.animationId;
    // 使用独立 interval 而非修改动画循环，避免破坏现有逻辑
    const intervalId = setInterval(updateLabels, UPDATE_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [colorMode]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: "500px" }}>
      <div ref={containerRef} className="w-full h-full" />

      {/* 能耗模式 - 建筑标签 */}
      {colorMode === "energy" && buildingLabels.map((label) => (
        <div
          key={label.buildingId}
          className="absolute pointer-events-none transition-opacity duration-300"
          style={{
            left: label.x,
            top: label.y,
            transform: "translate(-50%, -50%)",
            opacity: label.visible ? 1 : 0,
            zIndex: 10,
          }}
        >
          <div
            className="rounded-lg px-2.5 py-1 text-center whitespace-nowrap"
            style={{
              background: "rgba(10, 22, 40, 0.85)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div className="text-xs font-medium text-white leading-tight">{label.name}</div>
            <div className="text-xs font-mono font-bold leading-tight" style={{ color: getEnergyColorByValue(label.energyIntensity) }}>
              {label.energyIntensity.toFixed(1)} kWh/m²
            </div>
          </div>
        </div>
      ))}

      {/* 悬浮提示 */}
      {tooltip && (() => {
        const b = tooltip.building;
        const emissionProportion = b.emission > 0
          ? ((b.emission / totalEmission) * 100).toFixed(1)
          : "0";
        const targetRatio = b.targetEmission > 0
          ? ((b.emission / b.targetEmission) * 100).toFixed(0)
          : "—";
        const targetRatioNum = b.targetEmission > 0 ? b.emission / b.targetEmission : 0;
        const buildingAnomalies = anomalies.filter((a) => a.buildingId === b.buildingId);
        const hasAnomaly = buildingAnomalies.length > 0;

        // 定位：确保不超出容器
        const tooltipLeft = Math.min(tooltip.x + 15, (containerRef.current?.clientWidth ?? 800) - 260);
        const tooltipTop = Math.max(tooltip.y - 10, 10);

        const severityColorMap: Record<string, string> = {
          blocked: "#DC2626",
          serious: "#DC2626",
          warning: "#F59E0B",
          info: "#0099CC",
        };

        const statusLabelMap: Record<string, string> = {
          pending: "待处理",
          assigned: "已分配",
          processing: "处理中",
          reviewing: "审核中",
          closed: "已关闭",
          false_positive: "误报",
        };

        const severityLabelMap: Record<string, string> = {
          blocked: "阻断",
          serious: "严重",
          warning: "警告",
          info: "提示",
        };

        return (
          <div
            className="absolute pointer-events-none z-50"
            style={{
              left: tooltipLeft,
              top: tooltipTop,
              minWidth: 220,
              maxWidth: 280,
            }}
          >
            {/* 主面板 */}
            <div
              className="rounded-xl shadow-2xl backdrop-blur-md overflow-hidden"
              style={{
                background: "rgba(10, 22, 40, 0.92)",
                border: `1px solid ${hasAnomaly ? "rgba(245, 158, 11, 0.4)" : "rgba(52, 136, 255, 0.3)"}`,
              }}
            >
              {/* 标题区：建筑名 + 状态色点 */}
              <div
                className="px-4 py-2.5 flex items-center justify-between"
                style={{
                  background: "rgba(20, 40, 70, 0.6)",
                  borderBottom: "1px solid rgba(52, 136, 255, 0.15)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ background: getEmissionColor(b.emissionLevel) }}
                  />
                  <span className="text-sm font-semibold text-white">{b.name}</span>
                </div>
                <span className="text-xs text-gray-400">{b.dept}</span>
              </div>

              {/* 数据区 */}
              <div className="px-4 py-3 space-y-2.5">
                {/* 碳排放 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">碳排放</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-mono font-bold text-blue-400">
                      {b.emission > 0 ? b.emission.toLocaleString() : b.emission}
                    </span>
                    <span className="text-xs text-gray-500">tCO₂</span>
                  </div>
                </div>

                {/* 排放占比 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">占总排放</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-cyan-400">{emissionProportion}%</span>
                    {/* 占比条 */}
                    <div className="w-16 h-1.5 rounded-full bg-gray-700/60 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(parseFloat(emissionProportion), 100)}%`,
                          background: getEmissionColor(b.emissionLevel),
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 目标比值 */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">目标比值</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-mono font-bold"
                      style={{
                        color: targetRatioNum <= 100 ? "#16A34A"
                          : targetRatioNum <= 130 ? "#F59E0B"
                          : "#DC2626",
                      }}
                    >
                      {targetRatio}%
                    </span>
                    {b.targetEmission > 0 && (
                      <span className="text-xs text-gray-500">
                        ({b.targetEmission.toLocaleString()} tCO₂ 目标)
                      </span>
                    )}
                  </div>
                </div>

                {/* 目标比值进度条 */}
                {b.targetEmission > 0 && (
                  <div className="w-full h-2 rounded-full bg-gray-700/60 overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(targetRatioNum * 100 / 200, 100)}%`,
                        background: targetRatioNum <= 1
                          ? "linear-gradient(90deg, #16A34A, #22C55E)"
                          : targetRatioNum <= 1.3
                          ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                          : "linear-gradient(90deg, #DC2626, #EF4444)",
                      }}
                    />
                    {/* 100%标记线 */}
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/60"
                      style={{ left: "50%" }}
                    />
                  </div>
                )}
              </div>

              {/* 异常信息区 */}
              {hasAnomaly && (
                <div
                  className="px-4 py-3"
                  style={{
                    borderTop: "1px solid rgba(245, 158, 11, 0.2)",
                    background: "rgba(245, 158, 11, 0.05)",
                  }}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "#F59E0B" }}>
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                    <span className="text-xs font-semibold text-yellow-400">异常预警</span>
                  </div>
                  {buildingAnomalies.map((anomaly) => (
                    <div key={anomaly.id} className="space-y-1.5">
                      {/* 异常类型 + 严重程度 */}
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: severityColorMap[anomaly.severity] + "20",
                            color: severityColorMap[anomaly.severity],
                          }}
                        >
                          {severityLabelMap[anomaly.severity] || anomaly.severity}
                        </span>
                        <span className="text-xs text-gray-300 line-clamp-2">{anomaly.rule}</span>
                      </div>
                      {/* 处理状态 */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">处理状态</span>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                          style={{
                            background: anomaly.status === "closed" || anomaly.status === "false_positive"
                              ? "rgba(16, 163, 74, 0.15)"
                              : anomaly.status === "processing"
                              ? "rgba(0, 153, 204, 0.15)"
                              : anomaly.status === "assigned"
                              ? "rgba(52, 136, 255, 0.15)"
                              : "rgba(245, 158, 11, 0.15)",
                            color: anomaly.status === "closed" || anomaly.status === "false_positive"
                              ? "#16A34A"
                              : anomaly.status === "processing"
                              ? "#0099CC"
                              : anomaly.status === "assigned"
                              ? "#3488ff"
                              : "#F59E0B",
                          }}
                        >
                          {statusLabelMap[anomaly.status] || anomaly.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 建筑类型标签 */}
            <div
              className="mt-1 px-3 py-1 rounded-md text-center text-[10px]"
              style={{
                background: "rgba(10, 22, 40, 0.7)",
                color: "#64748b",
              }}
            >
              {b.type === "teaching" ? "教学楼" : b.type === "lab" ? "实验楼" : b.type === "library" ? "图书馆"
                : b.type === "dorm" ? "宿舍楼" : b.type === "dining" ? "食堂" : b.type === "gym" ? "体育馆"
                : b.type === "admin" ? "行政楼" : b.type === "auditorium" ? "大礼堂" : b.type === "solar" ? "光伏设施" : "建筑"}
              · {b.floors}F · 点击查看详情
            </div>
          </div>
        );
      })()}

      {/* 层级标识 */}
      <div
        className="absolute top-4 left-4 px-3 py-1.5 rounded-md text-xs font-medium"
        style={{
          background: "rgba(10, 22, 40, 0.9)",
          border: "1px solid rgba(52, 136, 255, 0.3)",
          color: "#3488ff",
        }}
      >
        {level === "L1" && "领导组驾驶舱 - 全局视角"}
        {level === "L2" && "院系业务视图 - 院系聚焦"}
        {level === "L3" && "后勤组驾驶舱 - 楼层级"}
        {level === "L4" && "合规与披露 - 数据完整度"}
      </div>

      {/* 操作提示 */}
      <div
        className="absolute bottom-4 right-4 px-3 py-1.5 rounded-md text-xs"
        style={{
          background: "rgba(10, 22, 40, 0.9)",
          border: "1px solid rgba(52, 136, 255, 0.2)",
          color: "#64748b",
        }}
      >
        鼠标拖拽旋转 | 滚轮缩放 | 点击建筑查看详情
      </div>

      {/* 校园名称水印 */}
      <div
        className="absolute bottom-4 left-4 text-xs"
        style={{ color: "#94A3B8", opacity: 0.6 }}
      >
        {CAMPUS_DATA.info.name} · {CAMPUS_DATA.info.dataSource}
      </div>

      {/* 能耗图例 (colorMode="energy" 时显示) */}
      {colorMode === "energy" && (
        <div
          className="absolute top-4 left-4 px-4 py-3 rounded-lg text-xs"
          style={{
            background: "rgba(10, 22, 40, 0.92)",
            border: "1px solid rgba(52, 136, 255, 0.25)",
            color: "#cbd5e1",
            minWidth: "180px",
          }}
        >
          <div className="font-semibold mb-2 text-sm" style={{ color: "#e2e8f0" }}>
            校园楼宇能耗分布
          </div>
          <div className="text-xs mb-2" style={{ color: "#94a3b8" }}>
            单位：kWh/m²·月
          </div>
          {[
            { label: "> 25", color: "#DC2626" },
            { label: "15 - 25", color: "#F97316" },
            { label: "8 - 15", color: "#EAB308" },
            { label: "3 - 8", color: "#22C55E" },
            { label: "≤ 3", color: "#06B6D4" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 mb-1">
              <span
                className="inline-block w-4 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: item.color }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* 建筑浮动标签 (colorMode="energy" 时显示) */}
      {colorMode === "energy" && buildingLabels.length > 0 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {buildingLabels.map((label) => (
            <div
              key={label.buildingId}
              className="absolute px-2 py-1 rounded text-center text-xs font-medium whitespace-nowrap"
              style={{
                left: `${label.x}px`,
                top: `${label.y}px`,
                transform: "translate(-50%, -100%)",
                background: "rgba(10, 22, 40, 0.88)",
                border: `1px solid ${label.color}40`,
                color: "#e2e8f0",
                boxShadow: `0 0 12px ${label.color}20`,
              }}
            >
              <div style={{ color: label.color, fontWeight: 700 }}>
                {label.value.toFixed(1)}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "10px" }}>
                {label.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


