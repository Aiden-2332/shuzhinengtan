// AI 智能分析中心 - Zustand Store
import { create } from 'zustand';

// ---- 类型 ----
export type AIModule = 'prediction' | 'monitoring' | 'reduction' | 'policy';

export interface PredictionCurve {
  period: '30d' | '60d' | '90d';
  historical: { date: string; emission: number }[];
  forecast: { date: string; predicted: number; upper95: number; lower95: number }[];
  calendarEvents: { date: string; event: string; impactFactor: number }[];
}

export interface HolidayPlan {
  id: string;
  holidayName: string;
  startDate: string;
  endDate: string;
  daysBeforeEvent: number;
  estimatedSaving: { energy: number; carbon: number; cost: number };
  actions: string[];
  status: 'auto_generated' | 'edited' | 'confirmed';
}

export interface RiskCalendarDay {
  date: string;
  riskLevel: 'safe' | 'watch' | 'warning' | 'danger';
  predictedEmission: number;
  targetRemaining: number;
  triggerReason?: string;
}

export interface ScenarioConfig {
  id: string;
  name: string;
  color: string;
  params: { key: string; value: number; unit: string; min: number; max: number; step: number }[];
}

export interface ScenarioResult {
  scenarioId: string;
  predictedCurve: { date: string; emission: number }[];
  totalSaving: number;
  totalCostImpact: number;
}

export type AnomalyPattern = 'spike' | 'idle_run' | 'over_limit' | 'drift';
export type SeverityLevel = 'blocking' | 'severe' | 'normal' | 'info';

export interface AIAnomalyCard {
  id: string;
  pattern: AnomalyPattern;
  patternLabel: string;
  severity: SeverityLevel;
  buildingId: string;
  buildingName: string;
  deviceId?: string;
  deviceName?: string;
  detectedAt: string;
  duration: string;
  aiConfidence: number;
  aiRootCause: string;
  aiEvidence: { type: string; description: string }[];
  impact: { extraEmission: number; extraCost: number; affectedArea: string; affectedPeople?: number };
  suggestedActions: { action: string; linkToModule: string }[];
  status: 'new' | 'acknowledged' | 'processing' | 'resolved';
}

export interface AnomalyTimelineEvent {
  id: string;
  anomalyId: string;
  timestamp: string;
  phase: 'detected' | 'confirmed' | 'dispatched' | 'processing' | 'resolved' | 'closed';
  phaseLabel: string;
  actor: string;
  detail: string;
}

export interface AlertNotification {
  id: string;
  anomalyId: string;
  title: string;
  message: string;
  channel: 'in_app' | 'sms' | 'email';
  sentAt: string;
  read: boolean;
  targetPerson: string;
}

export interface ReductionBubble {
  buildingId: string;
  buildingName: string;
  x: number;
  y: number;
  size: number;
  category: string;
  topIssues: string[];
  estimatedReduction: number;
}

export interface ReductionMeasure {
  id: string;
  name: string;
  category: 'equipment' | 'operation' | 'technology' | 'behavior';
  buildingId?: string;
  investment: number;
  paybackMonths: number;
  annualReduction: number;
  difficulty: 'easy' | 'medium' | 'hard';
  durationMonths: number;
  prerequisites: string[];
  risks: string[];
  mrvMethod: string;
  baseline: string;
}

export interface OptimizationPath {
  measures: (ReductionMeasure & { startMonth: number; endMonth: number; priority: number })[];
  totalInvestment: number;
  totalReduction: number;
  avgPaybackMonths: number;
  budgetConstraint: number;
}

export interface CarbonCostScenario {
  name: string;
  emissionReduction: number;
  quotaPurchase: number;
  offsetPurchase: number;
  totalCost: number;
  costBreakdown: { item: string; cost: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: { title: string; type: string; refId: string }[];
  confidence?: number;
}

export interface QuickQuestion {
  id: string;
  category: string;
  question: string;
  icon: string;
}

export interface ComplianceCheckItem {
  id: string;
  category: string;
  categoryLabel: string;
  item: string;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  statusLabel: string;
  dueDate?: string;
  issueDetail?: string;
  fixAction?: string;
  fixLink?: string;
}

export interface PolicyChangeAlert {
  id: string;
  policyName: string;
  effectiveDate: string;
  impactAreas: { area: string; impact: string; affectedModule: string; actionRequired: string }[];
  daysUntilEffective: number;
}

export interface RealtimeDataStream {
  timestamp: string;
  totalPower: number;
  totalWater: number;
  totalHeat: number;
  totalCarbon: number;
  anomalyCount: number;
}

// ---- Store ----
interface AICenterStore {
  activeModule: AIModule;
  // 模块1
  predictionPeriod: '30d' | '60d' | '90d';
  predictionCurve: PredictionCurve | null;
  holidayPlans: HolidayPlan[];
  riskCalendar: RiskCalendarDay[];
  scenarios: { configs: ScenarioConfig[]; results: ScenarioResult[] };
  // 模块2
  realtimeStream: RealtimeDataStream;
  anomalies: AIAnomalyCard[];
  anomalyTimelines: Record<string, AnomalyTimelineEvent[]>;
  notifications: AlertNotification[];
  // 模块3
  reductionBubbles: ReductionBubble[];
  reductionPath: OptimizationPath | null;
  costScenarios: CarbonCostScenario[];
  selectedMeasure: ReductionMeasure | null;
  optimizationConstraints: { budget: number; minPayback: number };
  reductionDimension: 'building' | 'department' | 'energy_type';
  // 模块4
  chatMessages: ChatMessage[];
  conversationId: string | null;
  complianceChecks: ComplianceCheckItem[];
  policyChanges: PolicyChangeAlert[];
  isTyping: boolean;
  // 右侧面板
  rightPanelDrawer: { type: string; data: unknown } | null;

  // Actions
  switchModule: (module: AIModule) => void;
  setPredictionPeriod: (period: '30d' | '60d' | '90d') => void;
  setPredictionCurve: (curve: PredictionCurve) => void;
  setHolidayPlans: (plans: HolidayPlan[]) => void;
  setRiskCalendar: (calendar: RiskCalendarDay[]) => void;
  runScenario: (configs: ScenarioConfig[]) => void;
  setRealtimeStream: (stream: RealtimeDataStream) => void;
  setAnomalies: (anomalies: AIAnomalyCard[]) => void;
  acknowledgeAnomaly: (id: string) => void;
  setAnomalyTimeline: (anomalyId: string, events: AnomalyTimelineEvent[]) => void;
  setNotifications: (notifications: AlertNotification[]) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setReductionBubbles: (bubbles: ReductionBubble[]) => void;
  setReductionPath: (path: OptimizationPath) => void;
  setCostScenarios: (scenarios: CarbonCostScenario[]) => void;
  selectMeasure: (measure: ReductionMeasure | null) => void;
  setOptimizationConstraints: (constraints: { budget: number; minPayback: number }) => void;
  setReductionDimension: (dim: 'building' | 'department' | 'energy_type') => void;
  sendChatMessage: (message: string) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  setIsTyping: (typing: boolean) => void;
  setComplianceChecks: (checks: ComplianceCheckItem[]) => void;
  setPolicyChanges: (changes: PolicyChangeAlert[]) => void;
  openDrawer: (type: string, data: unknown) => void;
  closeDrawer: () => void;
}

export const useAICenterStore = create<AICenterStore>((set, get) => ({
  activeModule: 'prediction',
  predictionPeriod: '30d',
  predictionCurve: null,
  holidayPlans: [],
  riskCalendar: [],
  scenarios: { configs: [], results: [] },
  realtimeStream: { timestamp: '', totalPower: 0, totalWater: 0, totalHeat: 0, totalCarbon: 0, anomalyCount: 0 },
  anomalies: [],
  anomalyTimelines: {},
  notifications: [],
  reductionBubbles: [],
  reductionPath: null,
  costScenarios: [],
  selectedMeasure: null,
  optimizationConstraints: { budget: 500, minPayback: 12 },
  reductionDimension: 'building',
  chatMessages: [],
  conversationId: null,
  complianceChecks: [],
  policyChanges: [],
  isTyping: false,
  rightPanelDrawer: null,

  switchModule: (module) => set({ activeModule: module }),
  setPredictionPeriod: (period) => set({ predictionPeriod: period }),
  setPredictionCurve: (curve) => set({ predictionCurve: curve }),
  setHolidayPlans: (plans) => set({ holidayPlans: plans }),
  setRiskCalendar: (calendar) => set({ riskCalendar: calendar }),
  runScenario: (configs) => set({ scenarios: { ...get().scenarios, configs } }),
  setRealtimeStream: (stream) => set({ realtimeStream: stream }),
  setAnomalies: (anomalies) => set({ anomalies }),
  acknowledgeAnomaly: (id) =>
    set((state) => ({
      anomalies: state.anomalies.map((a) =>
        a.id === id ? { ...a, status: 'acknowledged' as const } : a
      ),
    })),
  setAnomalyTimeline: (anomalyId, events) =>
    set((state) => ({ anomalyTimelines: { ...state.anomalyTimelines, [anomalyId]: events } })),
  setNotifications: (notifications) => set({ notifications }),
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  setReductionBubbles: (bubbles) => set({ reductionBubbles: bubbles }),
  setReductionPath: (path) => set({ reductionPath: path }),
  setCostScenarios: (scenarios) => set({ costScenarios: scenarios }),
  selectMeasure: (measure) => set({ selectedMeasure: measure }),
  setOptimizationConstraints: (constraints) => set({ optimizationConstraints: constraints }),
  setReductionDimension: (dim) => set({ reductionDimension: dim }),
  sendChatMessage: (message) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ chatMessages: [...state.chatMessages, userMsg], isTyping: true }));
  },
  setChatMessages: (messages) => set({ chatMessages: messages }),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setComplianceChecks: (checks) => set({ complianceChecks: checks }),
  setPolicyChanges: (changes) => set({ policyChanges: changes }),
  openDrawer: (type, data) => set({ rightPanelDrawer: { type, data } }),
  closeDrawer: () => set({ rightPanelDrawer: null }),
}));
