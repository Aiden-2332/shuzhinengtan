// 碳核算工作台 - Zustand 状态管理
import { create } from 'zustand';
import type {
  CalculationStandard,
  DataSourceRecord,
  DataSourceCategory,
  DataSourceStatus,
  AuditStatus,
  EvidenceStatus,
  CalculationBatch,
  CalculationResult,
} from '@/types';
import {
  getInitialRecords,
  getInitialBatches,
  getInitialBatchLocked,
  getInitialCalculationResult,
  persistData,
  calculateEmissions,
  clearPersistedData,
} from '@/data/calculation-data';

// 筛选条件类型
export interface FilterConditions {
  sourceName: string;
  emissionScope: string;
  dataClassification: string;
  campus: string;
  period: string;
  status: DataSourceStatus | '';
  evidenceStatus: EvidenceStatus | '';
  auditStatus: AuditStatus | '';
}

export type TabType = 'overview' | 'energy' | 'extended';
export type SortField = 'sourceCode' | 'sourceName' | 'value' | 'emissionValue' | 'updatedAt' | 'status';
export type SortOrder = 'asc' | 'desc';

interface CalculationStore {
  // 核心状态
  standard: CalculationStandard;
  period: string;
  activeTab: TabType;

  // 数据
  records: DataSourceRecord[];
  batches: CalculationBatch[];
  batchLocked: boolean;
  calculationResult: CalculationResult | null;

  // 表格状态
  selectedIds: string[];
  sortField: SortField;
  sortOrder: SortOrder;
  currentPage: number;
  pageSize: number;
  filters: FilterConditions;
  activeFilterCount: number;

  // UI 状态
  showTrialModal: boolean;
  showTrialProgress: boolean;
  trialStep: number;
  showBatchReviewDrawer: boolean;
  showReportConfigModal: boolean;
  showReportProgress: boolean;
  showReportPreview: boolean;
  showFilterDrawer: boolean;
  showDetailDrawer: boolean;
  detailRecordId: string | null;
  showEditModal: boolean;
  editRecordId: string | null;
  showAddModal: boolean;
  showImportModal: boolean;
  showLockConfirm: boolean;
  showUnlockModal: boolean;
  showAnomalyModal: boolean;
  showDeleteConfirm: boolean;
  deleteRecordId: string | null;

  // 报告配置
  reportConfig: {
    name: string;
    period: string;
    standard: CalculationStandard;
    scope: string;
    chapters: string[];
    format: 'pdf' | 'excel';
  };
  reportGenerating: boolean;
  reportGenerated: boolean;

  // Actions
  setStandard: (s: CalculationStandard) => void;
  setPeriod: (p: string) => void;
  setActiveTab: (t: TabType) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleSelectId: (id: string) => void;
  selectAllVisible: (ids: string[]) => void;
  clearSelection: () => void;
  setSortField: (f: SortField) => void;
  setCurrentPage: (p: number) => void;
  setPageSize: (s: number) => void;
  setFilters: (f: FilterConditions) => void;
  resetFilters: () => void;
  setActiveFilterCount: (n: number) => void;

  // 数据操作
  updateRecord: (id: string, updates: Partial<DataSourceRecord>) => void;
  addRecord: (record: DataSourceRecord) => void;
  deleteRecord: (id: string) => void;
  batchApprove: (ids: string[]) => void;
  batchReject: (ids: string[], reason: string) => void;
  lockBatch: () => void;
  unlockBatch: (reason: string) => void;
  runCalculation: () => void;
  resetToDemo: () => void;

  // UI 操作
  setShowTrialModal: (v: boolean) => void;
  setShowTrialProgress: (v: boolean) => void;
  setTrialStep: (s: number) => void;
  setShowBatchReviewDrawer: (v: boolean) => void;
  setShowReportConfigModal: (v: boolean) => void;
  setShowReportProgress: (v: boolean) => void;
  setShowReportPreview: (v: boolean) => void;
  setShowFilterDrawer: (v: boolean) => void;
  setShowDetailDrawer: (v: boolean) => void;
  setDetailRecordId: (id: string | null) => void;
  setShowEditModal: (v: boolean) => void;
  setEditRecordId: (id: string | null) => void;
  setShowAddModal: (v: boolean) => void;
  setShowImportModal: (v: boolean) => void;
  setShowLockConfirm: (v: boolean) => void;
  setShowUnlockModal: (v: boolean) => void;
  setShowAnomalyModal: (v: boolean) => void;
  setShowDeleteConfirm: (v: boolean) => void;
  setDeleteRecordId: (id: string | null) => void;
  setReportConfig: (c: Partial<CalculationStore['reportConfig']>) => void;
  setReportGenerating: (v: boolean) => void;
  setReportGenerated: (v: boolean) => void;

  // 派生
  getFilteredRecords: () => DataSourceRecord[];
  getRecordById: (id: string) => DataSourceRecord | undefined;
}

const emptyFilters: FilterConditions = {
  sourceName: '',
  emissionScope: '',
  dataClassification: '',
  campus: '',
  period: '',
  status: '',
  evidenceStatus: '',
  auditStatus: '',
};

function saveToStorage(records: DataSourceRecord[], batches: CalculationBatch[], batchLocked: boolean, calculationResult: CalculationResult | null) {
  persistData({ records, batches, batchLocked, calculationResult });
}

export const useCalculationStore = create<CalculationStore>((set, get) => ({
  // 初始值
  standard: 'JST303',
  period: '2026-06',
  activeTab: 'overview',

  records: getInitialRecords(),
  batches: getInitialBatches(),
  batchLocked: getInitialBatchLocked(),
  calculationResult: getInitialCalculationResult(),

  selectedIds: [],
  sortField: 'sourceCode',
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: 10,
  filters: { ...emptyFilters },
  activeFilterCount: 0,

  showTrialModal: false,
  showTrialProgress: false,
  trialStep: 0,
  showBatchReviewDrawer: false,
  showReportConfigModal: false,
  showReportProgress: false,
  showReportPreview: false,
  showFilterDrawer: false,
  showDetailDrawer: false,
  detailRecordId: null,
  showEditModal: false,
  editRecordId: null,
  showAddModal: false,
  showImportModal: false,
  showLockConfirm: false,
  showUnlockModal: false,
  showAnomalyModal: false,
  showDeleteConfirm: false,
  deleteRecordId: null,

  reportConfig: {
    name: '碳排放核算报告',
    period: '2026-06',
    standard: 'JST303',
    scope: '全校区',
    chapters: ['基础信息', '排放汇总', '分项明细', '可再生能源', '附件清单'],
    format: 'excel',
  },
  reportGenerating: false,
  reportGenerated: false,

  // Setters
  setStandard: (s) => set({ standard: s }),
  setPeriod: (p) => set({ period: p, currentPage: 1 }),
  setActiveTab: (t) => set({ activeTab: t }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  toggleSelectId: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter((i) => i !== id)
      : [...state.selectedIds, id],
  })),
  selectAllVisible: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ selectedIds: [] }),
  setSortField: (f) => set((state) => ({
    sortField: f,
    sortOrder: state.sortField === f && state.sortOrder === 'asc' ? 'desc' : 'asc',
    currentPage: 1,
  })),
  setCurrentPage: (p) => set({ currentPage: p }),
  setPageSize: (s) => set({ pageSize: s, currentPage: 1 }),
  setFilters: (f) => set((state) => {
    const count = Object.entries(f).filter(([, v]) => v !== '').length;
    return { filters: f, activeFilterCount: count, currentPage: 1 };
  }),
  resetFilters: () => set({ filters: { ...emptyFilters }, activeFilterCount: 0, currentPage: 1 }),
  setActiveFilterCount: (n) => set({ activeFilterCount: n }),

  // 数据操作
  updateRecord: (id, updates) => set((state) => {
    const records = state.records.map((r) =>
      r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : r
    );
    saveToStorage(records, state.batches, state.batchLocked, state.calculationResult);
    return { records };
  }),

  addRecord: (record) => set((state) => {
    const records = [...state.records, record];
    saveToStorage(records, state.batches, state.batchLocked, state.calculationResult);
    return { records };
  }),

  deleteRecord: (id) => set((state) => {
    const records = state.records.filter((r) => r.id !== id);
    saveToStorage(records, state.batches, state.batchLocked, state.calculationResult);
    return { records, selectedIds: state.selectedIds.filter((i) => i !== id) };
  }),

  batchApprove: (ids) => set((state) => {
    const now = new Date().toISOString().split('T')[0];
    const records = state.records.map((r) =>
      ids.includes(r.id)
        ? {
            ...r,
            status: 'normal' as DataSourceStatus,
            auditStatus: 'approved' as AuditStatus,
            reviewer: '当前用户',
            reviewedAt: now,
            auditRecords: [
              ...(r.auditRecords ?? []),
              { time: new Date().toLocaleString('zh-CN'), operator: '当前用户', action: '复核通过', remark: '批量复核' },
            ],
          }
        : r
    );
    saveToStorage(records, state.batches, state.batchLocked, state.calculationResult);
    return { records, selectedIds: [] };
  }),

  batchReject: (ids, reason) => set((state) => {
    const now = new Date().toISOString().split('T')[0];
    const records = state.records.map((r) =>
      ids.includes(r.id)
        ? {
            ...r,
            status: 'abnormal' as DataSourceStatus,
            auditStatus: 'rejected' as AuditStatus,
            reviewer: '当前用户',
            reviewedAt: now,
            auditRecords: [
              ...(r.auditRecords ?? []),
              { time: new Date().toLocaleString('zh-CN'), operator: '当前用户', action: '退回修改', remark: reason },
            ],
          }
        : r
    );
    saveToStorage(records, state.batches, state.batchLocked, state.calculationResult);
    return { records, selectedIds: [] };
  }),

  lockBatch: () => set((state) => {
    const records = state.records.map((r) =>
      r.period === state.period ? { ...r, status: 'locked' as DataSourceStatus } : r
    );
    const batches = state.batches.map((b) =>
      b.period === state.period ? { ...b, status: 'locked' as const, lockedAt: new Date().toISOString().split('T')[0], lockedBy: '当前用户' } : b
    );
    saveToStorage(records, batches, true, state.calculationResult);
    return { records, batches, batchLocked: true };
  }),

  unlockBatch: (reason) => set((state) => {
    const batches = state.batches.map((b) =>
      b.period === state.period ? { ...b, status: 'reviewed' as const } : b
    );
    saveToStorage(state.records, batches, false, state.calculationResult);
    return { batches, batchLocked: false };
  }),

  runCalculation: () => set((state) => {
    const result = calculateEmissions(state.standard, state.period, state.records);
    saveToStorage(state.records, state.batches, state.batchLocked, result);
    return { calculationResult: result, activeTab: 'energy' };
  }),

  resetToDemo: () => {
    const freshRecords = resetAndReload();
    const freshBatches = reloadBatches();
    set({
      records: freshRecords,
      batches: freshBatches,
      batchLocked: false,
      calculationResult: null,
      selectedIds: [],
      currentPage: 1,
      filters: { ...emptyFilters },
      activeFilterCount: 0,
    });
    saveToStorage(freshRecords, freshBatches, false, null);
  },

  // UI setters
  setShowTrialModal: (v) => set({ showTrialModal: v }),
  setShowTrialProgress: (v) => set({ showTrialProgress: v }),
  setTrialStep: (s) => set({ trialStep: s }),
  setShowBatchReviewDrawer: (v) => set({ showBatchReviewDrawer: v }),
  setShowReportConfigModal: (v) => set({ showReportConfigModal: v }),
  setShowReportProgress: (v) => set({ showReportProgress: v }),
  setShowReportPreview: (v) => set({ showReportPreview: v }),
  setShowFilterDrawer: (v) => set({ showFilterDrawer: v }),
  setShowDetailDrawer: (v) => set({ showDetailDrawer: v }),
  setDetailRecordId: (id) => set({ detailRecordId: id }),
  setShowEditModal: (v) => set({ showEditModal: v }),
  setEditRecordId: (id) => set({ editRecordId: id }),
  setShowAddModal: (v) => set({ showAddModal: v }),
  setShowImportModal: (v) => set({ showImportModal: v }),
  setShowLockConfirm: (v) => set({ showLockConfirm: v }),
  setShowUnlockModal: (v) => set({ showUnlockModal: v }),
  setShowAnomalyModal: (v) => set({ showAnomalyModal: v }),
  setShowDeleteConfirm: (v) => set({ showDeleteConfirm: v }),
  setDeleteRecordId: (id) => set({ deleteRecordId: id }),
  setReportConfig: (c) => set((state) => ({
    reportConfig: { ...state.reportConfig, ...c },
  })),
  setReportGenerating: (v) => set({ reportGenerating: v }),
  setReportGenerated: (v) => set({ reportGenerated: v }),

  // 派生
  getFilteredRecords: () => {
    const { records, filters, sortField, sortOrder } = get();
    let filtered = records;

    if (filters.sourceName) {
      filtered = filtered.filter((r) => r.sourceName.includes(filters.sourceName));
    }
    if (filters.emissionScope) {
      filtered = filtered.filter((r) => r.emissionScope === filters.emissionScope);
    }
    if (filters.dataClassification) {
      filtered = filtered.filter((r) => r.dataClassification === filters.dataClassification);
    }
    if (filters.campus) {
      filtered = filtered.filter((r) => r.campus === filters.campus);
    }
    if (filters.period) {
      filtered = filtered.filter((r) => r.period === filters.period);
    }
    if (filters.status) {
      filtered = filtered.filter((r) => r.status === filters.status);
    }
    if (filters.evidenceStatus) {
      filtered = filtered.filter((r) => r.evidenceStatus === filters.evidenceStatus);
    }
    if (filters.auditStatus) {
      filtered = filtered.filter((r) => r.auditStatus === filters.auditStatus);
    }

    filtered.sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';
      switch (sortField) {
        case 'sourceCode': aVal = a.sourceCode; bVal = b.sourceCode; break;
        case 'sourceName': aVal = a.sourceName; bVal = b.sourceName; break;
        case 'value': aVal = a.value ?? 0; bVal = b.value ?? 0; break;
        case 'emissionValue': aVal = a.emissionValue ?? 0; bVal = b.emissionValue ?? 0; break;
        case 'updatedAt': aVal = a.updatedAt; bVal = b.updatedAt; break;
        case 'status': aVal = a.status; bVal = b.status; break;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  },

  getRecordById: (id) => {
    return get().records.find((r) => r.id === id);
  },
}));

function resetAndReload(): DataSourceRecord[] {
  clearPersistedData();
  return getInitialRecords();
}

function reloadBatches(): CalculationBatch[] {
  return getInitialBatches();
}
