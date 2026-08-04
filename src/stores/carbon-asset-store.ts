import { create } from "zustand";
import type {
  QuotaLedger,
  StrategyCard,
  ComplianceTask,
  CarbonAssetValue,
  TradeRecord,
  PolicyChange,
  SelfCheckItem,
  MRVNode,
  AuditCheckItem,
  MissingDoc,
  ComplianceCalendar,
  ComplianceRadar,
  AuditPreparation,
} from "@/data/carbon-asset-mock";
import {
  getQuotaLedger,
  simulateGap as calcGap,
  getComplianceTasks,
  getTradeRecords,
  getCarbonAssetValue,
  getPolicyChanges,
  getSelfCheckList,
  getMRVChain,
  getAuditChecklist,
  getMissingDocs,
} from "@/data/carbon-asset-mock";
import { CAMPUS_CARBON_FORECAST } from "@/data/campus-system-data";

interface GapEngineResult {
  simulator: {
    carbonPrice: number;
    forecastEmission: number;
    quotaGap: number;
    fundingExposure: number;
  };
  strategies: StrategyCard[];
  recommendation: {
    strategyId: string;
    reason: string;
    confidence: number;
    savings: number;
  };
}

interface CarbonAssetStore {
  // 全局筛选
  selectedYear: number;
  selectedCampus: string;
  realTimeEstimate: boolean;

  // 配额台账
  quotaLedger: QuotaLedger | null;

  // 缺口决策引擎
  gapEngine: GapEngineResult | null;
  carbonPriceInput: number;
  forecastEmissionInput: number;
  activeStrategy: string | null;

  // 履约任务
  complianceCalendar: ComplianceCalendar | null;
  expandedTaskId: string | null;

  // 交易记录
  tradeRecords: TradeRecord[];
  tradePage: number;
  tradeTotal: number;

  // 碳资产增值
  assetValue: CarbonAssetValue | null;

  // 合规雷达
  complianceRadar: ComplianceRadar | null;

  // 核查准备
  auditPrep: AuditPreparation | null;
  auditMrvExpandedId: string | null;

  // Actions
  setYear: (year: number) => void;
  setCampus: (campus: string) => void;
  setRealTimeEstimate: (enabled: boolean) => void;
  updateCarbonPrice: (price: number) => void;
  updateForecastEmission: (emission: number) => void;
  selectStrategy: (id: string | null) => void;
  updateTaskStatus: (taskId: string, status: ComplianceTask["status"]) => void;
  setExpandedTaskId: (id: string | null) => void;
  setAuditMrvExpandedId: (id: string | null) => void;

  // Async fetch actions
  fetchQuotaLedger: () => void;
  fetchComplianceTasks: () => void;
  fetchAssetValue: () => void;
  fetchTradeRecords: (page: number) => void;
  fetchComplianceRadar: () => void;
  fetchAuditPreparation: () => void;
  simulateGap: (price: number, emission: number) => void;
}

export const useCarbonAssetStore = create<CarbonAssetStore>((set, get) => ({
  selectedYear: 2026,
  selectedCampus: "全部校区",
  realTimeEstimate: true,

  quotaLedger: null,

  gapEngine: null,
  carbonPriceInput: 85,
  forecastEmissionInput: CAMPUS_CARBON_FORECAST,
  activeStrategy: null,

  complianceCalendar: null,
  expandedTaskId: null,

  tradeRecords: [],
  tradePage: 1,
  tradeTotal: 0,

  assetValue: null,

  complianceRadar: null,

  auditPrep: null,
  auditMrvExpandedId: null,

  setYear: (year) => set({ selectedYear: year }),
  setCampus: (campus) => set({ selectedCampus: campus }),
  setRealTimeEstimate: (enabled) => set({ realTimeEstimate: enabled }),

  updateCarbonPrice: (price) => {
    set({ carbonPriceInput: price });
  },

  updateForecastEmission: (emission) => {
    set({ forecastEmissionInput: emission });
  },

  selectStrategy: (id) => set({ activeStrategy: id }),

  updateTaskStatus: (taskId, status) =>
    set((state) => {
      if (!state.complianceCalendar) return state;
      const updatedTasks = state.complianceCalendar.tasks.map((t) =>
        t.id === taskId ? { ...t, status, completionProgress: status === "completed" ? 100 : t.completionProgress } : t
      );
      const completedTasks = updatedTasks.filter((t) => t.status === "completed").length;
      return {
        complianceCalendar: {
          ...state.complianceCalendar,
          tasks: updatedTasks,
          completedTasks,
        },
      };
    }),

  setExpandedTaskId: (id) => set({ expandedTaskId: id }),
  setAuditMrvExpandedId: (id) => set({ auditMrvExpandedId: id }),

  fetchQuotaLedger: () => {
    set({ quotaLedger: getQuotaLedger() });
  },

  fetchComplianceTasks: () => {
    const tasks = getComplianceTasks();
    set({
      complianceCalendar: {
        year: 2026,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "completed").length,
        overdueTasks: tasks.filter((t) => t.status === "overdue").length,
        atRiskTasks: tasks.filter((t) => t.status === "at_risk").length,
        tasks,
      },
    });
  },

  fetchAssetValue: () => {
    set({ assetValue: getCarbonAssetValue() });
  },

  fetchTradeRecords: (page) => {
    const records = getTradeRecords();
    set({
      tradeRecords: records,
      tradePage: page,
      tradeTotal: records.length,
    });
  },

  fetchComplianceRadar: () => {
    set({
      complianceRadar: {
        policyChanges: getPolicyChanges(),
        selfCheckList: getSelfCheckList(),
        complianceScore: 78,
        riskLevel: "medium",
      },
    });
  },

  fetchAuditPreparation: () => {
    set({
      auditPrep: {
        mrvChain: getMRVChain(),
        auditChecklist: getAuditChecklist(),
        missingDocuments: getMissingDocs(),
        readinessScore: 65,
      },
    });
  },

  simulateGap: (price, emission) => {
    const result = calcGap(price, emission);
    set({ gapEngine: result });
  },
}));
