// ==================== 合规凭证模块类型定义 ====================

/** 材料状态 */
export type MaterialStatus =
  | "not_uploaded"
  | "uploading"
  | "uploaded"
  | "pending_review"
  | "approved"
  | "rejected"
  | "expiring_soon"
  | "expired";

/** 审核状态 */
export type ReviewStatus = "pending" | "approved" | "rejected";

/** 材料记录（IndexedDB 存储） */
export interface MaterialRecord {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: MaterialStatus;
  /** 关联的评价体系 */
  titleType: string;
  /** 关联的指标 ID */
  indicatorId?: string;
  /** 关联的评价分项 ID */
  itemId?: string;
  /** 材料编号 */
  materialCode?: string;
  /** 发证机构 */
  issuer?: string;
  /** 签发日期 */
  issueDate?: string;
  /** 有效期开始 */
  validFrom?: string;
  /** 有效期结束 */
  validTo?: string;
  /** 是否长期有效 */
  isPermanent?: boolean;
  /** 材料年度 */
  year?: string;
  /** 保密等级 */
  securityLevel?: "public" | "internal" | "confidential";
  /** 备注 */
  notes?: string;
  /** 文件信息 */
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  fileData?: ArrayBuffer;
  /** 上传时间 */
  uploadedAt?: string;
  /** 上传人员 */
  uploadedBy?: string;
  /** 审核信息 */
  reviewStatus?: ReviewStatus;
  reviewComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** 当前版本号 */
  version?: number;
  createdAt: string;
  updatedAt: string;
}

/** 文件版本记录 */
export interface FileVersion {
  id: string;
  materialId: string;
  version: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: ArrayBuffer;
  changeNote: string;
  uploadedBy: string;
  uploadedAt: string;
  isCurrent: boolean;
}

/** 操作日志 */
export interface OperationLog {
  id: string;
  materialId: string;
  action: string;
  description: string;
  operator: string;
  operatedAt: string;
  version?: number;
  ip?: string;
}

/** 导出记录 */
export interface ExportRecord {
  id: string;
  exportedAt: string;
  exportedBy: string;
  exportType: string;
  year: string;
  fileCount: number;
  fileSize: string;
  status: "generating" | "completed" | "failed";
  validUntil: string;
  titleType: string;
  schoolName: string;
  includeHistory: boolean;
  includeReview: boolean;
  includeCatalog: boolean;
  includeScore: boolean;
  includeMissing: boolean;
  zipData?: ArrayBuffer;
}

/** 到期预警配置 */
export interface ExpiryConfig {
  materialId: string;
  remind90: boolean;
  remind60: boolean;
  remind30: boolean;
  remind7: boolean;
  remindOnDay: boolean;
}
