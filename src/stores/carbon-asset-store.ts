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
} from "@/data/carbon-asset-mock";
import {
  getQuotaLedger,
  simulateGap,
  getComplianceTasks,
  getTradeRecords,
  getCarbonAssetValue,
  getPolicyChanges,
  getSelfCheckList,
  getMRVChain,
  getAuditChecklist,
  getMissingDocs,
} from "@/data/carbon-asset-mock";

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
  complianceTasks: ComplianceTask[];
  expandedTaskId: string | null;

  // 交易记录
  tradeRecords: TradeRecord[];

  // 碳资产增值
  assetValue: CarbonAssetValue | null;

  // 合规雷达
  policyChanges: PolicyChange[];
  selfCheckList: SelfCheckItem[];

  // 核查准备
  mrvChain: MRVNode | null;
  auditChecklist: AuditCheckItem[];
  missingDocs: MissingDoc[];
  auditMrvExpandedIds: string[];

  // 底部Tab
  activeBottomTab: string;

  // Actions
  setYear: (year: number) => void;
  setCampus: (campus: string) => void;
  setRealTimeEstimate: (enabled: boolean) => void;
  updateCarbonPrice: (price: number) => void;
  updateForecastEmission: (emission: number) => void;
  selectStrategy: (id: string | null) => void;
  updateTaskStatus: (taskId: string, status: ComplianceTask["status"]) => void;
  setExpandedTaskId: (id: string | null) => void;
  setActiveBottomTab: (tab: string) => void;
  toggleMrvExpanded: (id: string) => void;
  initializeData: () => void;
  runSimulation: () => void;
}

export const useCarbonAssetStore = create<CarbonAssetStore>((set, get) => ({
  selectedYear: 2026,
  selectedCampus: "主校区+东校区",
  realTimeEstimate: true,

  quotaLedger: null,

  gapEngine: null,
  carbonPriceInput: 85,
  forecastEmissionInput: 21500,
  activeStrategy: null,

  complianceTasks: [],
  expandedTaskId: null,

  tradeRecords: [],

  assetValue: null,

  policyChanges: [],
  selfCheckList: [],

  mrvChain: null,
  auditChecklist: [],
  missingDocs: [],
  auditMrvExpandedIds: ["mrv1", "mrv2", "mrv3"],

  activeBottomTab: "emission-vs-quota",

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
    set((state) => ({
      complianceTasks: state.complianceTasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
    })),

  setExpandedTaskId: (id) => set({ expandedTaskId: id }),

  setActiveBottomTab: (tab) => set({ activeBottomTab: tab }),

  toggleMrvExpanded: (id) =>
    set((state) => ({
      auditMrvExpandedIds: state.auditMrvExpandedIds.includes(id)
        ? state.auditMrvExpandedIds.filter((x) => x !== id)
        : [...state.auditMrvExpandedIds, id],
    })),

  initializeData: () => {
    set({
      quotaLedger: getQuotaLedger(),
      complianceTasks: getComplianceTasks(),
      tradeRecords: getTradeRecords(),
      assetValue: getCarbonAssetValue(),
      policyChanges: getPolicyChanges(),
      selfCheckList: getSelfCheckList(),
      mrvChain: getMRVChain(),
      auditChecklist: getAuditChecklist(),
      missingDocs: getMissingDocs(),
    });
    get().runSimulation();
  },

  runSimulation: () => {
    const { carbonPriceInput, forecastEmissionInput } = get();
    const result = simulateGap(carbonPriceInput, forecastEmissionInput);
    set({ gapEngine: result });
  },
}));
