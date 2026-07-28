// ==================== IndexedDB 存储层 ====================
import { openDB, type IDBPDatabase } from "idb";
import type {
  MaterialRecord,
  FileVersion,
  OperationLog,
  ExportRecord,
  ExpiryConfig,
} from "@/types/compliance";

const DB_NAME = "compliance-materials";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("materials")) {
          const store = db.createObjectStore("materials", { keyPath: "id" });
          store.createIndex("status", "status");
          store.createIndex("titleType", "titleType");
          store.createIndex("indicatorId", "indicatorId");
        }
        if (!db.objectStoreNames.contains("versions")) {
          const vStore = db.createObjectStore("versions", { keyPath: "id" });
          vStore.createIndex("materialId", "materialId");
        }
        if (!db.objectStoreNames.contains("logs")) {
          const lStore = db.createObjectStore("logs", { keyPath: "id" });
          lStore.createIndex("materialId", "materialId");
        }
        if (!db.objectStoreNames.contains("exports")) {
          db.createObjectStore("exports", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("expiryConfigs")) {
          db.createObjectStore("expiryConfigs", { keyPath: "materialId" });
        }
      },
    });
  }
  return dbPromise;
}

// ==================== 材料 CRUD ====================

export async function getAllMaterials(): Promise<MaterialRecord[]> {
  const db = await getDB();
  return db.getAll("materials");
}

export async function getMaterialsByTitle(titleType: string): Promise<MaterialRecord[]> {
  const db = await getDB();
  const all = await db.getAll("materials");
  return all.filter((m) => m.titleType === titleType);
}

export async function getMaterialById(id: string): Promise<MaterialRecord | undefined> {
  const db = await getDB();
  return db.get("materials", id);
}

export async function saveMaterial(material: MaterialRecord): Promise<void> {
  const db = await getDB();
  await db.put("materials", { ...material, updatedAt: new Date().toISOString() });
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("materials", id);
  // 级联删除版本和日志
  const versions = await db.getAllFromIndex("versions", "materialId", id);
  for (const v of versions) await db.delete("versions", v.id);
  const logs = await db.getAllFromIndex("logs", "materialId", id);
  for (const l of logs) await db.delete("logs", l.id);
}

export async function getMaterialsByStatus(status: string): Promise<MaterialRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex("materials", "status", status);
}

// ==================== 版本管理 ====================

export async function getVersionsByMaterial(materialId: string): Promise<FileVersion[]> {
  const db = await getDB();
  const versions = await db.getAllFromIndex("versions", "materialId", materialId);
  return versions.sort((a, b) => b.version - a.version);
}

export async function saveVersion(version: FileVersion): Promise<void> {
  const db = await getDB();
  await db.put("versions", version);
}

export async function getCurrentVersion(materialId: string): Promise<FileVersion | undefined> {
  const versions = await getVersionsByMaterial(materialId);
  return versions.find((v) => v.isCurrent);
}

export async function setCurrentVersion(materialId: string, versionId: string): Promise<void> {
  const db = await getDB();
  const versions = await db.getAllFromIndex("versions", "materialId", materialId);
  for (const v of versions) {
    v.isCurrent = v.id === versionId;
    await db.put("versions", v);
  }
}

// ==================== 操作日志 ====================

export async function getLogsByMaterial(materialId: string): Promise<OperationLog[]> {
  const db = await getDB();
  const logs = await db.getAllFromIndex("logs", "materialId", materialId);
  return logs.sort((a, b) => new Date(b.operatedAt).getTime() - new Date(a.operatedAt).getTime());
}

export async function addLog(log: OperationLog): Promise<void> {
  const db = await getDB();
  await db.put("logs", log);
}

// ==================== 导出记录 ====================

export async function getExportRecords(): Promise<ExportRecord[]> {
  const db = await getDB();
  const records = await db.getAll("exports");
  return records.sort((a, b) => new Date(b.exportedAt).getTime() - new Date(a.exportedAt).getTime());
}

export async function saveExportRecord(record: ExportRecord): Promise<void> {
  const db = await getDB();
  await db.put("exports", record);
}

export async function deleteExportRecord(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("exports", id);
}

// ==================== 到期预警配置 ====================

export async function getExpiryConfig(materialId: string): Promise<ExpiryConfig | undefined> {
  const db = await getDB();
  return db.get("expiryConfigs", materialId);
}

export async function saveExpiryConfig(config: ExpiryConfig): Promise<void> {
  const db = await getDB();
  await db.put("expiryConfigs", config);
}

// ==================== 工具函数 ====================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    not_uploaded: "未上传",
    uploading: "上传中",
    uploaded: "已上传",
    pending_review: "待审核",
    approved: "审核通过",
    rejected: "审核退回",
    expiring_soon: "即将到期",
    expired: "已过期",
  };
  return map[status] || status;
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    not_uploaded: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    uploading: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    uploaded: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending_review: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-red-500/15 text-red-400 border-red-500/30",
    expiring_soon: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    expired: "bg-red-500/15 text-red-400 border-red-500/30",
  };
  return map[status] || "bg-slate-500/15 text-slate-400 border-slate-500/30";
}

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const ALLOWED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx";

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
