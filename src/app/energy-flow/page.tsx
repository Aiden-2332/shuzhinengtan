"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactECharts from "echarts-for-react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BellRing,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  Download,
  Expand,
  Eye,
  EyeOff,
  FileImage,
  FileSpreadsheet,
  FileText,
  Focus,
  Gauge,
  GitBranch,
  Info,
  Layers3,
  Leaf,
  ListChecks,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Minus,
  PanelRight,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnergyFlowSankey, type FlowMetric } from "@/components/energy-flow/energy-flow-sankey";
import {
  BALANCE_ROWS,
  CAMPUS_BUILDINGS,
  ENERGY_ANOMALIES,
  ENERGY_FLOW_LINKS,
  ENERGY_FLOW_NODES,
  ENERGY_META,
  ENERGY_SUGGESTIONS,
  KEY_FINDINGS,
  RANKING_ROWS,
  STATUS_META,
  TREND_DATA,
  type EnergyFlowLink,
  type EnergyFlowNode,
  type EnergyType,
  type FlowStatus,
} from "@/data/energy-flow-data";
import { cn } from "@/lib/utils";

type PageState = "normal" | "partial" | "empty" | "error" | "timeout" | "forbidden";
type RightTab = "findings" | "focused" | "anomalies" | "suggestions" | "efficiency";
type BottomTab = "balance" | "trend" | "ranking";
type LevelMode = "campus" | "region" | "building" | "device";
type DisplayMode = "flow" | "carbon" | "cost" | "loss";

interface FlowFilters {
  timeRange: string;
  granularity: string;
  campus: string;
  buildingType: string;
  building: string;
  energy: EnergyType;
  metric: "energy" | "standardCoal" | "carbon" | "cost";
  compare: string;
  showAnomaly: boolean;
  start: string;
  end: string;
}

interface SavedView {
  id: string;
  name: string;
  notes: string;
  filters: FlowFilters;
  levelMode: LevelMode;
  displayMode: DisplayMode;
  createdAt: string;
}

interface DiagnosisTask {
  id: string;
  name: string;
  nodeId: string;
  nodeName: string;
  problem: string;
  owner: string;
  deadline: string;
  priority: string;
  description: string;
  createdAt: string;
}

const DEFAULT_FILTERS: FlowFilters = {
  timeRange: "today",
  granularity: "hour",
  campus: "all",
  buildingType: "all",
  building: "all",
  energy: "combined",
  metric: "standardCoal",
  compare: "mom",
  showAnomaly: true,
  start: "2026-07-29T00:00",
  end: "2026-07-29T23:59",
};

const RESET_FILTERS: FlowFilters = { ...DEFAULT_FILTERS, compare: "none" };
const STORAGE_FILTERS = "energy-flow-filters-v1";
const STORAGE_FOCUS = "energy-flow-focus-v1";
const STORAGE_VIEWS = "energy-flow-views-v1";
const STORAGE_TASKS = "energy-flow-tasks-v1";

const timeOptions: [string, string][] = [
  ["realtime", "实时"], ["today", "今日"], ["yesterday", "昨日"], ["week", "本周"],
  ["month", "本月"], ["year", "本年"], ["custom", "自定义时间"],
];
const granularityOptions: [string, string][] = [["15m", "15分钟"], ["hour", "小时"], ["day", "日"], ["month", "月"]];
const campusOptions: [string, string][] = [["all", "全校"], ["main", "主校区"], ["east", "东校区"], ["west", "西校区"]];
const buildingTypeOptions: [string, string][] = [
  ["all", "全部建筑"], ["teaching", "教学建筑"], ["laboratory", "实验建筑"], ["office", "办公建筑"],
  ["dormitory", "学生宿舍"], ["canteen", "食堂"], ["library", "图书馆"], ["sports", "体育场馆"], ["other", "其他建筑"],
];
const energyOptions: [EnergyType, string][] = [
  ["combined", "综合能源"], ["electricity", "电力"], ["water", "水"], ["gas", "天然气"],
  ["heat", "热力"], ["solar", "光伏"], ["storage", "储能"],
];
const metricOptions: [string, string][] = [["energy", "能源量"], ["standardCoal", "折标煤"], ["carbon", "碳排放"], ["cost", "能源费用"]];
const compareOptions: [string, string][] = [["none", "不对比"], ["yoy", "同比"], ["mom", "环比"], ["baseline", "与基准期对比"]];

const selectClass = "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const inputClass = "h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const cardClass = "rounded-xl border border-slate-200 bg-white shadow-sm";

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function formatNow() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date()).replaceAll("/", "-");
}

function formatSigned(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function statusClass(status: FlowStatus) {
  if (status === "normal") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (status === "attention") return "bg-amber-50 text-amber-700 border-amber-200";
  if (status === "warning") return "bg-orange-50 text-orange-700 border-orange-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function StatusBadge({ status }: { status: FlowStatus }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]", statusClass(status))}>{STATUS_META[status].label}</span>;
}

function SelectField({ label, value, options, onChange, disabled = false }: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <label className="min-w-0 space-y-1">
      <span className="block text-[11px] font-medium text-slate-500">{label}</span>
      <select className={selectClass} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
      </select>
    </label>
  );
}

function MetricCard({ title, value, unit, lines, icon, color, selected, onClick, tooltip }: {
  title: string;
  value: string;
  unit: string;
  lines: React.ReactNode;
  icon: React.ReactNode;
  color: string;
  selected: boolean;
  onClick: () => void;
  tooltip: string;
}) {
  return (
    <button
      type="button"
      title={tooltip}
      onClick={onClick}
      className={cn(
        cardClass,
        "group min-w-0 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-blue-500 ring-2 ring-blue-100" : "hover:border-blue-200",
      )}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <span className="rounded-lg p-2" style={{ color, backgroundColor: `${color}12` }}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tabular-nums text-slate-900">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
      <div className="mt-2 min-h-8 text-[11px] leading-5 text-slate-500">{lines}</div>
    </button>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
      <span className={cn("relative h-5 w-9 rounded-full transition", checked ? "bg-blue-600" : "bg-slate-300")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition", checked ? "left-[18px]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-label="正在加载能源流向数据">
      <div className="h-20 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-5 gap-3">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-32 rounded-xl bg-slate-200" />)}</div>
      <div className="grid grid-cols-[minmax(0,7fr)_minmax(300px,3fr)] gap-4">
        <div className="relative h-[610px] overflow-hidden rounded-xl bg-white">
          {Array.from({ length: 16 }, (_, index) => <span key={index} className="absolute h-10 w-4 rounded bg-slate-200" style={{ left: `${8 + (index % 4) * 27}%`, top: `${8 + Math.floor(index / 4) * 23}%` }} />)}
          {Array.from({ length: 10 }, (_, index) => <span key={index} className="absolute h-2 w-40 rotate-6 rounded-full bg-blue-100" style={{ left: `${12 + (index % 3) * 27}%`, top: `${12 + index * 7}%` }} />)}
        </div>
        <div className="h-[610px] rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

function EmptyState({ state, onReset, onRetry, onQuality }: { state: PageState; onReset: () => void; onRetry: () => void; onQuality: () => void }) {
  const messages: Record<Exclude<PageState, "normal" | "partial">, { title: string; detail: string; icon: React.ReactNode }> = {
    empty: { title: "当前筛选条件下暂无能源流向数据", detail: "可调整筛选范围，或查看最近有数据的日期。", icon: <Search className="h-9 w-9" /> },
    error: { title: "能源流向数据加载失败", detail: "数据源返回异常，请重新加载或查看数据源状态。", icon: <AlertCircle className="h-9 w-9" /> },
    timeout: { title: "接口响应超时", detail: "网络或数据计算耗时过长，可稍后重试。", icon: <LoaderCircle className="h-9 w-9" /> },
    forbidden: { title: "暂无该范围的数据权限", detail: "请联系系统管理员开通对应校区或建筑权限。", icon: <ShieldCheck className="h-9 w-9" /> },
  };
  if (state === "normal" || state === "partial") return null;
  const message = messages[state];
  return (
    <div className={cn(cardClass, "flex min-h-[480px] flex-col items-center justify-center px-6 text-center text-slate-400")}>
      {message.icon}
      <h3 className="mt-4 text-base font-semibold text-slate-800">{message.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message.detail}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button size="sm" onClick={onRetry}><RefreshCw />重新加载</Button>
        <Button size="sm" variant="outline" onClick={onReset}><RotateCcw />重置筛选</Button>
        {state === "empty" ? <Button size="sm" variant="outline" onClick={onReset}><ChevronLeft />返回全校视图</Button> : <Button size="sm" variant="outline" onClick={onQuality}><Database />查看数据源状态</Button>}
      </div>
      {state === "empty" && <button type="button" className="mt-3 text-xs text-blue-600 hover:underline" onClick={onReset}>查看最近有数据日期：2026-07-29</button>}
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function createSimplePdf(title: string, lines: string[]) {
  const sanitize = (value: string) => value.replace(/[()\\]/g, " ").replace(/[^\x20-\x7E]/g, "?");
  const content = ["BT", "/F1 16 Tf", "48 790 Td", `(${sanitize(title)}) Tj`, "/F1 10 Tf", ...lines.flatMap((line) => ["0 -22 Td", `(${sanitize(line)}) Tj`]), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets[index + 1] = pdf.length; pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

export default function EnergyFlowPage() {
  const router = useRouter();
  const sankeyCardRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReactECharts>(null);
  const [hydrated, setHydrated] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FlowFilters>(DEFAULT_FILTERS);
  const [filters, setFilters] = useState<FlowFilters>(DEFAULT_FILTERS);
  const [updatedAt, setUpdatedAt] = useState("2026-07-29 15:42:37");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSeed, setRefreshSeed] = useState(0);
  const [pageState, setPageState] = useState<PageState>("normal");
  const [rightTab, setRightTab] = useState<RightTab>("findings");
  const [bottomTab, setBottomTab] = useState<BottomTab>("balance");
  const [selectedCard, setSelectedCard] = useState("input");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [nodeDrawerOpen, setNodeDrawerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskSuggestionId, setTaskSuggestionId] = useState<string | null>(null);
  const [focusedLinks, setFocusedLinks] = useState<string[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [tasks, setTasks] = useState<DiagnosisTask[]>([]);
  const [viewName, setViewName] = useState("");
  const [viewNotes, setViewNotes] = useState("");
  const [levelMode, setLevelMode] = useState<LevelMode>("campus");
  const [displayMode, setDisplayMode] = useState<DisplayMode>("flow");
  const [showLoss, setShowLoss] = useState(false);
  const [showValues, setShowValues] = useState(true);
  const [showPercent, setShowPercent] = useState(false);
  const [expandDevices, setExpandDevices] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [hiddenEnergy, setHiddenEnergy] = useState<EnergyType[]>([]);
  const [drillPath, setDrillPath] = useState<{ id: string; name: string }[]>([{ id: "all", name: "全校" }]);
  const [dateError, setDateError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportItems, setExportItems] = useState({ png: true, pdf: false, flow: false, balance: false });

  useEffect(() => {
    const stored = readStorage<FlowFilters>(STORAGE_FILTERS, DEFAULT_FILTERS);
    const params = new URLSearchParams(window.location.search);
    const restored: FlowFilters = {
      ...stored,
      timeRange: params.get("time") ?? stored.timeRange,
      campus: params.get("campus") ?? stored.campus,
      building: params.get("building") ?? stored.building,
      energy: (params.get("energy") as EnergyType | null) ?? stored.energy,
      metric: (params.get("metric") as FlowFilters["metric"] | null) ?? stored.metric,
    };
    setDraftFilters(restored);
    setFilters(restored);
    setFocusedLinks(readStorage<string[]>(STORAGE_FOCUS, ["grid-distribution", "distribution-lab-a"]));
    setSavedViews(readStorage<SavedView[]>(STORAGE_VIEWS, []));
    setTasks(readStorage<DiagnosisTask[]>(STORAGE_TASKS, []));
    const loadingTimer = window.setTimeout(() => setHydrated(true), 520);
    const fullscreenListener = () => setIsFullscreen(document.fullscreenElement === sankeyCardRef.current);
    document.addEventListener("fullscreenchange", fullscreenListener);
    return () => {
      window.clearTimeout(loadingTimer);
      document.removeEventListener("fullscreenchange", fullscreenListener);
    };
  }, []);

  const buildingOptions = useMemo(() => {
    const options = CAMPUS_BUILDINGS.filter((building) =>
      (draftFilters.campus === "all" || building.campus === draftFilters.campus)
      && (draftFilters.buildingType === "all" || building.type === draftFilters.buildingType),
    ).map((building) => [building.id, building.name] as [string, string]);
    return [["all", "全部建筑"], ...options] as [string, string][];
  }, [draftFilters.buildingType, draftFilters.campus]);

  const updateDraft = <K extends keyof FlowFilters>(key: K, value: FlowFilters[K]) => {
    setDraftFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "campus" || key === "buildingType") next.building = "all";
      if (key === "energy" && value !== "combined" && current.metric === "standardCoal") next.metric = "energy";
      if (key === "energy" && value === "combined" && current.metric === "energy") next.metric = "standardCoal";
      return next;
    });
  };

  const persistFilters = useCallback((next: FlowFilters) => {
    window.localStorage.setItem(STORAGE_FILTERS, JSON.stringify(next));
    const params = new URLSearchParams();
    params.set("time", next.timeRange);
    params.set("campus", next.campus);
    params.set("building", next.building);
    params.set("energy", next.energy);
    params.set("metric", next.metric);
    router.replace(`/energy-flow?${params.toString()}`, { scroll: false });
  }, [router]);

  const applyFilters = () => {
    if (draftFilters.timeRange === "custom" && draftFilters.end <= draftFilters.start) {
      setDateError("结束时间必须晚于开始时间");
      return;
    }
    setDateError("");
    setFilters(draftFilters);
    persistFilters(draftFilters);
    setSelectedNodeId(null);
    setDrillPath([{ id: "all", name: "全校" }]);
    setPageState(draftFilters.building === "public-area" && draftFilters.energy === "heat" ? "empty" : draftFilters.showAnomaly ? "normal" : "normal");
    setUpdatedAt(formatNow());
  };

  const resetFilters = () => {
    setDraftFilters(RESET_FILTERS);
    setFilters(RESET_FILTERS);
    persistFilters(RESET_FILTERS);
    setDateError("");
    setPageState("normal");
    setSelectedNodeId(null);
    setHiddenEnergy([]);
    setDrillPath([{ id: "all", name: "全校" }]);
  };

  const refreshAll = () => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRefreshSeed((current) => current + 1);
      setUpdatedAt(formatNow());
      setPageState("normal");
      setRefreshing(false);
    }, 900);
  };

  const scale = useMemo(() => {
    const timeScale: Record<string, number> = { realtime: 0.045, today: 1, yesterday: 0.965, week: 6.72, month: 28.4, year: 342, custom: 2.35 };
    const campusScale: Record<string, number> = { all: 1, main: 0.58, east: 0.24, west: 0.18 };
    const typeScale: Record<string, number> = { all: 1, teaching: 0.15, laboratory: 0.31, office: 0.08, dormitory: 0.24, canteen: 0.12, library: 0.07, sports: 0.05, other: 0.04 };
    const buildingScale = filters.building === "all" ? 1 : Math.max(0.045, (ENERGY_FLOW_NODES.find((node) => node.id === filters.building)?.standardCoal ?? 10) / 189.6);
    return (timeScale[filters.timeRange] ?? 1)
      * (campusScale[filters.campus] ?? 1)
      * (typeScale[filters.buildingType] ?? 1)
      * buildingScale
      * (1 + refreshSeed * 0.002);
  }, [filters, refreshSeed]);

  const graphData = useMemo(() => {
    let links = ENERGY_FLOW_LINKS.filter((link) => filters.energy === "combined" || link.energyType === filters.energy);
    if (!filters.showAnomaly) links = links.filter((link) => link.status !== "critical" && link.status !== "warning");
    links = links.filter((link) => !hiddenEnergy.includes(link.energyType));

    const nodeTypeById = new Map(ENERGY_FLOW_NODES.map((node) => [node.id, node]));
    if (levelMode !== "device") {
      links = links.filter((link) => nodeTypeById.get(link.source)?.type !== "device" && nodeTypeById.get(link.target)?.type !== "device");
    } else if (!expandDevices) {
      const lowFlowDevices = new Set(["lighting-loop-1", "kitchen-stove-1", "pump-1", "other-devices"]);
      links = links.filter((link) => !lowFlowDevices.has(link.source) && !lowFlowDevices.has(link.target));
    }
    if (levelMode === "region") {
      links = links.filter((link) => (nodeTypeById.get(link.source)?.level ?? 0) <= 2 && (nodeTypeById.get(link.target)?.level ?? 0) <= 2);
    }

    const allowedBuildings = new Set(CAMPUS_BUILDINGS.filter((building) =>
      (filters.campus === "all" || building.campus === filters.campus)
      && (filters.buildingType === "all" || building.type === filters.buildingType)
      && (filters.building === "all" || building.id === filters.building),
    ).map((building) => building.id));
    if (filters.campus !== "all" || filters.buildingType !== "all" || filters.building !== "all") {
      links = links.filter((link) => {
        const source = ENERGY_FLOW_NODES.find((node) => node.id === link.source);
        const target = ENERGY_FLOW_NODES.find((node) => node.id === link.target);
        if (source?.type === "building" && !allowedBuildings.has(source.id)) return false;
        if (target?.type === "building" && !allowedBuildings.has(target.id)) return false;
        return true;
      });
    }
    if (!showLoss) {
      const lossIds = new Set(ENERGY_FLOW_NODES.filter((node) => node.type === "result").map((node) => node.id));
      links = links.filter((link) => !lossIds.has(link.source) && !lossIds.has(link.target));
    }
    if (displayMode === "loss") links = links.filter((link) => link.lossRate >= 3 || link.status !== "normal" || link.target.includes("loss") || link.target === "unmetered");

    const nodeIds = new Set(links.flatMap((link) => [link.source, link.target]));
    let nodes = ENERGY_FLOW_NODES.filter((node) => nodeIds.has(node.id));
    const factor = scale;
    nodes = nodes.map((node) => ({
      ...node,
      value: node.value * factor,
      standardCoal: node.standardCoal * factor,
      carbonEmission: node.carbonEmission * factor,
      cost: node.cost * factor,
      peakValue: node.peakValue ? node.peakValue * factor : undefined,
    }));
    links = links.map((link) => ({
      ...link,
      value: link.value * factor,
      standardCoal: link.standardCoal * factor,
      carbonEmission: link.carbonEmission * factor,
      cost: link.cost * factor,
    }));
    return { nodes, links };
  }, [displayMode, expandDevices, filters, hiddenEnergy, levelMode, scale, showLoss]);

  const chartMetric: FlowMetric = displayMode === "carbon" || filters.metric === "carbon"
    ? "carbon"
    : displayMode === "cost" || filters.metric === "cost"
      ? "cost"
      : filters.metric === "energy" && filters.energy !== "combined" ? "energy" : "standardCoal";

  const chartUnit = chartMetric === "carbon" ? "tCO₂e" : chartMetric === "cost" ? "万元" : chartMetric === "energy" ? ENERGY_META[filters.energy].unit : "tce";
  const selectedNode = graphData.nodes.find((node) => node.id === selectedNodeId) ?? ENERGY_FLOW_NODES.find((node) => node.id === selectedNodeId) ?? null;
  const selectedLink = graphData.links.find((link) => link.id === selectedLinkId) ?? ENERGY_FLOW_LINKS.find((link) => link.id === selectedLinkId) ?? null;

  const kpis = useMemo(() => {
    const energyFactor = filters.energy === "combined" ? 1 : ({ electricity: 0.57, water: 0.047, gas: 0.27, heat: 0.23, solar: 0.082, storage: 0.029, other: 0.038 } as Record<EnergyType, number>)[filters.energy];
    const input = 189.6 * scale * energyFactor;
    const efficiency = 87.4 - (filters.campus === "west" ? 2.2 : 0) + (filters.energy === "solar" ? 4.1 : 0);
    const effective = input * efficiency / 100;
    const loss = input - effective;
    const carbon = 428.5 * scale * energyFactor;
    return { input, effective, loss, efficiency, carbon };
  }, [filters.campus, filters.energy, scale]);

  const displayedKpis = useMemo(() => {
    let input = kpis.input;
    if (chartMetric === "energy" && filters.energy !== "combined") {
      input = ENERGY_FLOW_NODES
        .filter((node) => node.type === "input" && node.energyType === filters.energy)
        .reduce((sum, node) => sum + node.value * scale, 0);
    } else if (chartMetric === "carbon") {
      input = kpis.carbon;
    } else if (chartMetric === "cost") {
      input = ENERGY_FLOW_NODES
        .filter((node) => node.type === "input" && (filters.energy === "combined" || node.energyType === filters.energy))
        .reduce((sum, node) => sum + node.cost * scale, 0);
    }
    const effective = input * kpis.efficiency / 100;
    return { input, effective, loss: input - effective };
  }, [chartMetric, filters.energy, kpis.carbon, kpis.efficiency, kpis.input, scale]);

  const locateNode = (nodeId: string, openDrawer = true) => {
    setSelectedNodeId(nodeId);
    if (openDrawer) setNodeDrawerOpen(true);
    window.setTimeout(() => {
      const instance = chartRef.current?.getEchartsInstance();
      instance?.dispatchAction({ type: "highlight", seriesIndex: 0, name: nodeId });
    }, 80);
  };

  const drillInto = (nodeId: string) => {
    const node = ENERGY_FLOW_NODES.find((item) => item.id === nodeId);
    if (!node?.canDrillDown) return;
    setSelectedNodeId(nodeId);
    setNodeDrawerOpen(false);
    setDrillPath((current) => {
      if (current.some((item) => item.id === nodeId)) return current;
      return [...current, { id: node.id, name: node.name }].slice(0, 5);
    });
    if (node.type === "building") {
      const next = { ...filters, building: node.id };
      setFilters(next);
      setDraftFilters(next);
      persistFilters(next);
      setLevelMode("device");
    } else if (node.level === 0) {
      const next = { ...filters, energy: node.energyType, metric: filters.metric === "standardCoal" ? "energy" : filters.metric };
      setFilters(next);
      setDraftFilters(next);
      persistFilters(next);
      setLevelMode("region");
    }
    setUpdatedAt(formatNow());
  };

  const returnToBreadcrumb = (index: number) => {
    const nextPath = drillPath.slice(0, index + 1);
    setDrillPath(nextPath);
    if (index === 0) {
      const next = { ...filters, campus: "all", buildingType: "all", building: "all", energy: "combined" as EnergyType, metric: "standardCoal" as const };
      setFilters(next);
      setDraftFilters(next);
      persistFilters(next);
      setSelectedNodeId(null);
      setLevelMode("campus");
    } else {
      setSelectedNodeId(nextPath[nextPath.length - 1]?.id ?? null);
    }
    setUpdatedAt(formatNow());
  };

  const toggleFocus = (linkId: string) => {
    setFocusedLinks((current) => {
      const next = current.includes(linkId) ? current.filter((id) => id !== linkId) : [...current, linkId];
      window.localStorage.setItem(STORAGE_FOCUS, JSON.stringify(next));
      return next;
    });
  };

  const restoreView = () => {
    setSelectedNodeId(null);
    setHiddenEnergy([]);
    setZoom(1);
    setShowLoss(false);
    setShowValues(true);
    setShowPercent(false);
    setExpandDevices(false);
    setDisplayMode("flow");
    setLevelMode("campus");
    setDrillPath([{ id: "all", name: "全校" }]);
    chartRef.current?.getEchartsInstance().dispatchAction({ type: "downplay", seriesIndex: 0 });
  };

  const toggleFullscreen = async () => {
    if (!sankeyCardRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await sankeyCardRef.current.requestFullscreen();
  };

  const saveCurrentView = () => {
    if (!viewName.trim()) return;
    const view: SavedView = {
      id: `view-${Date.now()}`,
      name: viewName.trim(),
      notes: viewNotes.trim(),
      filters,
      levelMode,
      displayMode,
      createdAt: formatNow(),
    };
    const next = [view, ...savedViews];
    setSavedViews(next);
    window.localStorage.setItem(STORAGE_VIEWS, JSON.stringify(next));
    setViewName("");
    setViewNotes("");
    setSaveViewOpen(false);
    setViewsOpen(true);
  };

  const loadView = (view: SavedView) => {
    setFilters(view.filters);
    setDraftFilters(view.filters);
    setLevelMode(view.levelMode);
    setDisplayMode(view.displayMode);
    persistFilters(view.filters);
    setViewsOpen(false);
  };

  const deleteView = (viewId: string) => {
    const next = savedViews.filter((view) => view.id !== viewId);
    setSavedViews(next);
    window.localStorage.setItem(STORAGE_VIEWS, JSON.stringify(next));
  };

  const renameView = (viewId: string) => {
    const name = window.prompt("请输入新的视图名称");
    if (!name?.trim()) return;
    const next = savedViews.map((view) => view.id === viewId ? { ...view, name: name.trim() } : view);
    setSavedViews(next);
    window.localStorage.setItem(STORAGE_VIEWS, JSON.stringify(next));
  };

  const runExport = async () => {
    const date = new Date().toISOString().slice(0, 10);
    if (exportItems.png) {
      const dataUrl = chartRef.current?.getEchartsInstance().getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#ffffff" });
      if (dataUrl) {
        const imageBlob = await fetch(dataUrl).then((response) => response.blob());
        downloadBlob(imageBlob, `能源流向桑基图_${date}.png`);
      }
    }
    if (exportItems.pdf) {
      downloadBlob(createSimplePdf("Campus Energy Flow Analysis", [
        `Updated: ${updatedAt}`, `Scope: ${filters.campus}`, `Energy: ${filters.energy}`, `Input: ${kpis.input.toFixed(2)} tce`, `Efficiency: ${kpis.efficiency.toFixed(1)}%`,
      ]), `能源流向分析_${date}.pdf`);
    }
    if (exportItems.flow) {
      const rows = ["起点\t终点\t能源类型\t能源量\t折标煤(tce)\t碳排放(tCO2e)\t费用(万元)\t损耗率", ...graphData.links.map((link) => {
        const source = ENERGY_FLOW_NODES.find((node) => node.id === link.source)?.name ?? link.source;
        const target = ENERGY_FLOW_NODES.find((node) => node.id === link.target)?.name ?? link.target;
        return [source, target, ENERGY_META[link.energyType].label, link.value.toFixed(2), link.standardCoal.toFixed(2), link.carbonEmission.toFixed(2), link.cost.toFixed(2), `${link.lossRate}%`].join("\t");
      })].join("\n");
      downloadBlob(new Blob(["\uFEFF", rows], { type: "application/vnd.ms-excel;charset=utf-8" }), `能源流向明细_${date}.xls`);
    }
    if (exportItems.balance) {
      const rows = ["能源类型\t输入量\t输出量\t损耗量\t平衡差\t平衡率\t数据完整率", ...BALANCE_ROWS.map((row) => [ENERGY_META[row.energyType].label, row.input, row.output, row.loss, row.difference, `${row.rate}%`, `${row.quality}%`].join("\t"))].join("\n");
      downloadBlob(new Blob(["\uFEFF", rows], { type: "application/vnd.ms-excel;charset=utf-8" }), `能源平衡数据_${date}.xls`);
    }
    setExportOpen(false);
  };

  const openDiagnosis = (node: EnergyFlowNode | null) => {
    const params = new URLSearchParams({
      source: "energy-flow",
      node: node?.id ?? "all",
      nodeName: node?.name ?? "全校",
      energy: filters.energy,
      time: filters.timeRange,
      campus: filters.campus,
    });
    window.location.assign(`/energy-diagnosis?${params.toString()}`);
  };

  const suggestionForTask = ENERGY_SUGGESTIONS.find((suggestion) => suggestion.id === taskSuggestionId) ?? ENERGY_SUGGESTIONS[0];
  const createTask = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const node = ENERGY_FLOW_NODES.find((item) => item.id === suggestionForTask.nodeId);
    const task: DiagnosisTask = {
      id: `task-${Date.now()}`,
      name: String(data.get("name") ?? suggestionForTask.title),
      nodeId: suggestionForTask.nodeId,
      nodeName: node?.name ?? suggestionForTask.nodeId,
      problem: String(data.get("problem") ?? suggestionForTask.problem),
      owner: String(data.get("owner") ?? "能源管理员"),
      deadline: String(data.get("deadline") ?? "2026-08-05"),
      priority: String(data.get("priority") ?? suggestionForTask.priority),
      description: String(data.get("description") ?? ""),
      createdAt: formatNow(),
    };
    const next = [task, ...tasks];
    setTasks(next);
    window.localStorage.setItem(STORAGE_TASKS, JSON.stringify(next));
    setTaskOpen(false);
    setRightTab("suggestions");
  };

  if (!hydrated) return <LoadingSkeleton />;

  return (
    <div className="mx-auto max-w-[1800px] space-y-4 text-slate-900">
      <section className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">能源流向分析</h1>
            {drillPath.length > 1 && <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">当前范围：{drillPath[drillPath.length - 1]?.name}</span>}
          </div>
          <p className="mt-1 text-sm text-slate-500">全景展示能源输入、转换、输配和终端消耗，识别重点用能环节及能源损耗节点。</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button type="button" onClick={() => setQualityOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs shadow-sm hover:border-blue-300">
            <Database className="h-4 w-4 text-blue-600" />
            <span><b className="block text-slate-700">数据质量 96.8分</b><span className="text-slate-400">完整率97.6%</span></span>
          </button>
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-[11px] shadow-sm">
            <div className="text-slate-500">数据更新时间：{updatedAt}</div>
            <div className="mt-0.5 inline-flex items-center gap-1 text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />实时数据正常</div>
          </div>
          <Button variant="outline" size="sm" onClick={refreshAll} disabled={refreshing}><RefreshCw className={cn(refreshing && "animate-spin")} />刷新</Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}><Maximize2 />全屏</Button>
          <Button size="sm" onClick={() => setExportOpen(true)}><Download />导出</Button>
        </div>
      </section>

      <section className={cn(cardClass, "p-4")}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 xl:grid-cols-10">
          <SelectField label="时间范围" value={draftFilters.timeRange} options={timeOptions} onChange={(value) => updateDraft("timeRange", value)} />
          <SelectField label="统计粒度" value={draftFilters.granularity} options={granularityOptions} onChange={(value) => updateDraft("granularity", value)} />
          <SelectField label="校区" value={draftFilters.campus} options={campusOptions} onChange={(value) => updateDraft("campus", value)} />
          <SelectField label="建筑类型" value={draftFilters.buildingType} options={buildingTypeOptions} onChange={(value) => updateDraft("buildingType", value)} />
          <SelectField label="具体建筑" value={draftFilters.building} options={buildingOptions} onChange={(value) => updateDraft("building", value)} />
          <SelectField label="能源类型" value={draftFilters.energy} options={energyOptions} onChange={(value) => updateDraft("energy", value as EnergyType)} />
          <SelectField label="展示指标" value={draftFilters.metric} options={metricOptions} onChange={(value) => updateDraft("metric", value as FlowFilters["metric"])} />
          <SelectField label="对比方式" value={draftFilters.compare} options={compareOptions} onChange={(value) => updateDraft("compare", value)} />
          <div className="space-y-1">
            <span className="block text-[11px] font-medium text-slate-500">异常节点</span>
            <div className="flex h-9 items-center rounded-md border border-slate-200 px-2"><Toggle checked={draftFilters.showAnomaly} onChange={(value) => updateDraft("showAnomaly", value)} label={draftFilters.showAnomaly ? "开启" : "关闭"} /></div>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={resetFilters}><RotateCcw />重置</Button>
            <Button size="sm" className="flex-1" onClick={applyFilters}><Check />应用</Button>
          </div>
        </div>
        {draftFilters.timeRange === "custom" && (
          <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-3">
            <label className="space-y-1"><span className="block text-[11px] text-slate-500">开始时间</span><input type="datetime-local" className={inputClass} value={draftFilters.start} onChange={(event) => updateDraft("start", event.target.value)} /></label>
            <span className="pb-2 text-slate-400">至</span>
            <label className="space-y-1"><span className="block text-[11px] text-slate-500">结束时间</span><input type="datetime-local" className={inputClass} value={draftFilters.end} onChange={(event) => updateDraft("end", event.target.value)} /></label>
            {dateError && <span className="pb-2 text-xs text-red-600"><AlertCircle className="mr-1 inline h-3.5 w-3.5" />{dateError}</span>}
          </div>
        )}
        <div className="mt-3 flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 text-xs text-slate-500">
          {drillPath.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
              <button type="button" onClick={() => returnToBreadcrumb(index)} className={cn("whitespace-nowrap hover:text-blue-600", index === drillPath.length - 1 && "font-medium text-blue-700")}>{item.name}</button>
            </div>
          ))}
          {drillPath.length > 1 && <Button variant="ghost" size="sm" className="ml-auto h-7 text-xs" onClick={() => returnToBreadcrumb(0)}><ChevronLeft />一键返回全校</Button>}
        </div>
      </section>

      {pageState === "normal" || pageState === "partial" ? (
        <>
          {pageState === "partial" && <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800"><span><AlertTriangle className="mr-2 inline h-4 w-4" />部分计量点数据缺失，图中虚线节点为估算值，缺失值未按0处理。</span><button type="button" className="font-medium hover:underline" onClick={() => setQualityOpen(true)}>查看详情</button></div>}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricCard title="综合能源输入" value={displayedKpis.input.toFixed(displayedKpis.input >= 1000 ? 0 : 1)} unit={chartUnit} color="#2563eb" icon={<Zap className="h-5 w-5" />} selected={selectedCard === "input"} onClick={() => { setSelectedCard("input"); const node = graphData.nodes.find((item) => item.type === "input"); if (node) locateNode(node.id, false); }} tooltip="定义：各类能源经折标后汇总。口径：综合能源统一折算为吨标准煤；单一能源显示原始单位。来源：一级能源计量表。" lines={<><span className="text-emerald-600"><TrendingDown className="mr-0.5 inline h-3 w-3" />同比 -3.2%</span><span className="ml-2 text-orange-600">环比 +2.4%</span></>} />
            <MetricCard title="终端有效用能" value={displayedKpis.effective.toFixed(displayedKpis.effective >= 1000 ? 0 : 1)} unit={chartUnit} color="#06b6d4" icon={<Target className="h-5 w-5" />} selected={selectedCard === "effective"} onClick={() => { setSelectedCard("effective"); locateNode("effective", false); setShowLoss(true); }} tooltip="定义：实际用于教学、科研、办公和生活等终端场景的能源。来源：末端计量与能源平衡计算。" lines={<>占输入能源 <b className="text-slate-700">{kpis.efficiency.toFixed(1)}%</b></>} />
            <MetricCard title="转换与输配损耗" value={displayedKpis.loss.toFixed(displayedKpis.loss >= 1000 ? 0 : 1)} unit={chartUnit} color="#f97316" icon={<TrendingDown className="h-5 w-5" />} selected={selectedCard === "loss"} onClick={() => { setSelectedCard("loss"); setShowLoss(true); setDisplayMode("loss"); locateNode("distribution-loss", false); }} tooltip="定义：转换设备、输配网络和未计量差额形成的损耗。来源：输入输出能源平衡计算。" lines={<>损耗率 <b>{(100 - kpis.efficiency).toFixed(1)}%</b><br /><span className="text-orange-600">较基准期高1.3个百分点</span></>} />
            <MetricCard title="综合能源利用率" value={kpis.efficiency.toFixed(1)} unit="%" color="#8b5cf6" icon={<Gauge className="h-5 w-5" />} selected={selectedCard === "efficiency"} onClick={() => { setSelectedCard("efficiency"); setRightTab("efficiency"); }} tooltip="计算口径：终端有效用能 ÷ 综合能源输入 × 100%。目标值来源：年度能源绩效目标。" lines={<>目标值≥90%<br /><span className="text-orange-600">状态：待提升</span></>} />
            <MetricCard title="能源碳排放" value={kpis.carbon.toFixed(1)} unit="tCO₂e" color="#16a34a" icon={<Leaf className="h-5 w-5" />} selected={selectedCard === "carbon"} onClick={() => { setSelectedCard("carbon"); setDisplayMode("carbon"); }} tooltip="定义：能源活动数据乘以对应排放因子。来源：能源计量与碳核算因子库。" lines={<><span className="text-emerald-600">同比 -5.6%</span><br />年度碳预算使用率61.2%</>} />
          </section>

          <section className="grid items-stretch gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(330px,3fr)]">
            <div ref={sankeyCardRef} className={cn(cardClass, "relative flex min-h-[650px] min-w-0 flex-col overflow-hidden", isFullscreen && "h-screen rounded-none border-0")}>
              <div className="border-b border-slate-100 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><GitBranch className="h-5 w-5 text-blue-600" /><h2 className="font-semibold">校园能源流向全景</h2><span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">{chartUnit} / {timeOptions.find(([id]) => id === filters.timeRange)?.[1]} / {campusOptions.find(([id]) => id === filters.campus)?.[1]}</span></div>
                    <p className="mt-1 text-[11px] text-slate-400">流线宽度代表能源量 · 点击节点查看上下游 · 双击节点下钻</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs" value={levelMode} onChange={(event) => { const mode = event.target.value as LevelMode; setLevelMode(mode); if (mode !== "device") setExpandDevices(false); }} aria-label="层级切换"><option value="campus">校园级</option><option value="region">区域级</option><option value="building">建筑级</option><option value="device">设备级</option></select>
                    <select className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs" value={displayMode} onChange={(event) => { const mode = event.target.value as DisplayMode; setDisplayMode(mode); if (mode === "loss") setShowLoss(true); }} aria-label="展示模式"><option value="flow">能源流向</option><option value="carbon">碳流向</option><option value="cost">费用流向</option><option value="loss">损耗流向</option></select>
                    <Button variant="outline" size="sm" onClick={restoreView}><RotateCcw />一键还原</Button>
                    <Button variant="outline" size="sm" onClick={() => setSaveViewOpen(true)}><Save />保存视图</Button>
                    <Button variant="outline" size="sm" onClick={() => setViewsOpen(true)}><Layers3 />我的视图{savedViews.length ? `(${savedViews.length})` : ""}</Button>
                    <Button variant="outline" size="icon-sm" onClick={toggleFullscreen} aria-label={isFullscreen ? "退出全屏" : "全屏"}>{isFullscreen ? <Minimize2 /> : <Maximize2 />}</Button>
                  </div>
                </div>
                {isFullscreen && (
                  <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-xs">
                    <div><span className="text-slate-400">能源输入</span><b className="ml-2 text-blue-700">{displayedKpis.input.toFixed(displayedKpis.input >= 1000 ? 0 : 1)} {chartUnit}</b></div>
                    <div><span className="text-slate-400">有效用能</span><b className="ml-2 text-emerald-700">{displayedKpis.effective.toFixed(displayedKpis.effective >= 1000 ? 0 : 1)} {chartUnit}</b></div>
                    <div><span className="text-slate-400">综合利用率</span><b className="ml-2 text-violet-700">{kpis.efficiency.toFixed(1)}%</b></div>
                  </div>
                )}
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <div className="flex flex-wrap items-center gap-3">
                    {energyOptions.filter(([id]) => id !== "combined").map(([id, label]) => {
                      const hidden = hiddenEnergy.includes(id);
                      return <button key={id} type="button" onClick={() => setHiddenEnergy((current) => hidden ? current.filter((item) => item !== id) : [...current, id])} className={cn("flex items-center gap-1 text-[11px]", hidden && "opacity-35 line-through")}><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ENERGY_META[id].color }} />{label}</button>;
                    })}
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" />异常</span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500"><span className="h-2.5 w-2.5 rounded-sm bg-slate-400" />未计量</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Toggle checked={showLoss} onChange={setShowLoss} label="显示损耗" />
                    <Toggle checked={filters.showAnomaly} onChange={(checked) => { const next = { ...filters, showAnomaly: checked }; setFilters(next); setDraftFilters(next); persistFilters(next); }} label="显示异常" />
                    <Toggle checked={showValues} onChange={setShowValues} label="显示数值" />
                    <Toggle checked={showPercent} onChange={setShowPercent} label="显示占比" />
                    {levelMode === "device" && <button type="button" onClick={() => setExpandDevices((current) => !current)} className="rounded-md border border-blue-200 px-2 py-1 text-[11px] text-blue-700 hover:bg-blue-50">{expandDevices ? "聚合低流量设备" : "展开其他设备"}</button>}
                    <div className="flex items-center rounded-md border border-slate-200">
                      <button type="button" className="p-1.5 hover:bg-slate-50" onClick={() => setZoom((value) => Math.max(0.7, value - 0.1))} aria-label="缩小"><Minus className="h-3.5 w-3.5" /></button>
                      <button type="button" className="border-x border-slate-200 px-2 py-1 text-[10px] hover:bg-slate-50" onClick={() => setZoom(1)}>适配 {Math.round(zoom * 100)}%</button>
                      <button type="button" className="p-1.5 hover:bg-slate-50" onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))} aria-label="放大"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 min-h-0 p-2">
                {refreshing && <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/75 backdrop-blur-[1px]"><div className="rounded-lg border border-blue-100 bg-white px-4 py-3 text-sm text-blue-700 shadow"><LoaderCircle className="mr-2 inline h-4 w-4 animate-spin" />正在重新计算能源流向…</div></div>}
                {graphData.nodes.length ? (
                  <EnergyFlowSankey nodes={graphData.nodes} links={graphData.links} metric={chartMetric} unit={chartUnit} selectedNodeId={selectedNodeId} showValues={showValues} showPercent={showPercent} zoom={zoom} chartRef={chartRef} onNodeClick={(nodeId) => locateNode(nodeId)} onNodeDoubleClick={drillInto} onLinkClick={(linkId) => { setSelectedLinkId(linkId); setLinkDialogOpen(true); }} />
                ) : <EmptyState state="empty" onReset={resetFilters} onRetry={refreshAll} onQuality={() => setQualityOpen(true)} />}
              </div>
              {selectedNode && <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full border border-blue-200 bg-white/95 px-4 py-2 text-xs shadow-lg"><Focus className="h-4 w-4 text-blue-600" /><b>{selectedNode.name}</b><span className="text-slate-400">上下游路径已高亮</span><button type="button" className="text-blue-600 hover:underline" onClick={() => setNodeDrawerOpen(true)}>查看详情</button><button type="button" onClick={() => setSelectedNodeId(null)}><X className="h-3.5 w-3.5" /></button></div>}
            </div>

            <aside className={cn(cardClass, "flex min-h-[650px] min-w-0 flex-col overflow-hidden")}>
              <Tabs value={rightTab} onValueChange={(value) => setRightTab(value as RightTab)} className="h-full gap-0">
                <TabsList className="h-auto w-full justify-start rounded-none border-b border-slate-100 bg-white p-2">
                  <TabsTrigger className="text-xs" value="findings">关键发现</TabsTrigger>
                  <TabsTrigger className="text-xs" value="focused">重点流向 <span className="rounded-full bg-blue-100 px-1.5 text-[10px] text-blue-700">{focusedLinks.length}</span></TabsTrigger>
                  <TabsTrigger className="text-xs" value="anomalies">异常节点 <span className="rounded-full bg-red-100 px-1.5 text-[10px] text-red-700">{ENERGY_ANOMALIES.length}</span></TabsTrigger>
                  <TabsTrigger className="text-xs" value="suggestions">节能建议</TabsTrigger>
                </TabsList>
                <TabsContent value="findings" className="m-0 max-h-[600px] space-y-2 overflow-y-auto p-3">
                  <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold">自动分析结论</h3><p className="text-[11px] text-slate-400">根据当前筛选数据动态生成</p></div><Sparkles className="h-4 w-4 text-blue-600" /></div>
                  {KEY_FINDINGS.map((finding, index) => (
                    <div key={finding.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 hover:border-blue-200">
                      <div className="flex items-start gap-2"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">{index + 1}</span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h4 className="text-xs font-semibold leading-5">{finding.title}</h4><StatusBadge status={finding.severity} /></div><p className="mt-1 text-[11px] leading-5 text-slate-500">{finding.detail}</p><div className="mt-2 flex items-center justify-between"><span className="text-[11px] text-slate-400">影响能源量 <b className="text-slate-600">{(finding.impact * scale).toFixed(1)} tce</b></span><div className="flex gap-1"><button type="button" className="text-[11px] text-blue-600 hover:underline" onClick={() => locateNode(finding.nodeId)}>定位节点</button><span className="text-slate-300">·</span><button type="button" className="text-[11px] text-blue-600 hover:underline" onClick={() => locateNode(finding.nodeId)}>查看详情</button></div></div></div></div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="focused" className="m-0 max-h-[600px] space-y-2 overflow-y-auto p-3">
                  <div className="mb-3"><h3 className="text-sm font-semibold">我的重点流向</h3><p className="text-[11px] text-slate-400">关注状态已保存在本地，刷新后仍保留</p></div>
                  {focusedLinks.length === 0 ? <div className="py-16 text-center text-xs text-slate-400"><EyeOff className="mx-auto mb-2 h-7 w-7" />暂未关注任何流向<br />点击桑基图连线后可设为重点关注</div> : focusedLinks.map((id) => {
                    const link = ENERGY_FLOW_LINKS.find((item) => item.id === id);
                    if (!link) return null;
                    const source = ENERGY_FLOW_NODES.find((node) => node.id === link.source)?.name;
                    const target = ENERGY_FLOW_NODES.find((node) => node.id === link.target)?.name;
                    return <div key={id} className="rounded-lg border border-blue-100 bg-blue-50/40 p-3"><div className="flex items-start justify-between gap-2"><div><div className="text-xs font-semibold">{source} → {target}</div><div className="mt-1 text-lg font-bold text-blue-700">{(link.standardCoal * scale).toFixed(1)} <span className="text-[11px] font-normal">tce</span></div></div><StatusBadge status={link.status} /></div><div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-slate-500">同比 {formatSigned(link.yearOnYear)} · 环比 {formatSigned(link.monthOnMonth)}</span><span className="flex gap-2"><button type="button" className="text-slate-500 hover:text-red-600" onClick={() => toggleFocus(id)}>取消关注</button><button type="button" className="text-blue-600 hover:underline" onClick={() => { setSelectedLinkId(id); setLinkDialogOpen(true); }}>查看详情</button></span></div></div>;
                  })}
                </TabsContent>
                <TabsContent value="anomalies" className="m-0 max-h-[600px] space-y-2 overflow-y-auto p-3">
                  <div className="mb-3"><h3 className="text-sm font-semibold">异常节点</h3><p className="text-[11px] text-slate-400">按严重程度与发生时间排序</p></div>
                  {ENERGY_ANOMALIES.map((anomaly) => <button key={anomaly.id} type="button" onClick={() => locateNode(anomaly.nodeId)} className="w-full rounded-lg border border-slate-100 p-3 text-left hover:border-red-200 hover:bg-red-50/30"><div className="flex items-center justify-between"><b className="text-xs">{anomaly.name}</b><StatusBadge status={anomaly.severity} /></div><div className="mt-2 grid grid-cols-2 gap-1 text-[11px] text-slate-500"><span>异常类型：{anomaly.type}</span><span>处理状态：{anomaly.state}</span><span>当前/基准：{anomaly.current}/{anomaly.baseline}</span><span className="text-red-600">偏差 {formatSigned(anomaly.deviation)}</span><span className="col-span-2">发生时间：{anomaly.time}</span></div></button>)}
                </TabsContent>
                <TabsContent value="suggestions" className="m-0 max-h-[600px] space-y-2 overflow-y-auto p-3">
                  <div className="mb-3 flex items-center justify-between"><div><h3 className="text-sm font-semibold">可执行节能建议</h3><p className="text-[11px] text-slate-400">按节能潜力与实施难度排序</p></div><LightbulbIcon /></div>
                  {ENERGY_SUGGESTIONS.map((suggestion) => {
                    const nodeName = ENERGY_FLOW_NODES.find((node) => node.id === suggestion.nodeId)?.name;
                    return <div key={suggestion.id} className="rounded-lg border border-slate-100 p-3"><div className="flex items-start justify-between gap-2"><div><h4 className="text-xs font-semibold leading-5">{suggestion.title}</h4><p className="text-[11px] text-slate-400">关联节点：{nodeName}</p></div><span className={cn("rounded-full px-2 py-0.5 text-[10px]", suggestion.priority === "高" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700")}>{suggestion.priority}优先级</span></div><div className="mt-2 grid grid-cols-3 gap-1 rounded-md bg-slate-50 p-2 text-center"><span className="text-[10px] text-slate-400">预计节能<b className="block text-xs text-slate-700">{suggestion.saving} tce</b></span><span className="text-[10px] text-slate-400">预计减碳<b className="block text-xs text-emerald-700">{suggestion.carbon} t</b></span><span className="text-[10px] text-slate-400">节省费用<b className="block text-xs text-blue-700">{suggestion.cost} 万</b></span></div><div className="mt-2 flex items-center justify-between text-[11px]"><span className="text-slate-500">实施难度：{suggestion.difficulty}</span><div className="flex gap-2"><button type="button" className="text-blue-600 hover:underline" onClick={() => locateNode(suggestion.nodeId)}>查看详情</button><button type="button" className="font-medium text-blue-600 hover:underline" onClick={() => { setTaskSuggestionId(suggestion.id); setTaskOpen(true); }}>生成诊断任务</button></div></div></div>;
                  })}
                  {tasks.length > 0 && <div className="mt-4 border-t border-slate-100 pt-3"><h4 className="mb-2 flex items-center gap-1 text-xs font-semibold"><ListChecks className="h-4 w-4 text-blue-600" />诊断任务列表 ({tasks.length})</h4>{tasks.map((task) => <div key={task.id} className="mb-2 rounded-lg bg-blue-50/60 p-2 text-[11px]"><div className="flex justify-between gap-2"><b>{task.name}</b><span className="text-blue-700">{task.priority}优先级</span></div><div className="mt-1 text-slate-500">{task.nodeName} · {task.owner} · 截止 {task.deadline}</div></div>)}</div>}
                </TabsContent>
                <TabsContent value="efficiency" className="m-0 p-4"><div className="rounded-xl bg-gradient-to-br from-violet-50 to-blue-50 p-4"><Gauge className="h-7 w-7 text-violet-600" /><h3 className="mt-3 font-semibold">效率分析</h3><div className="mt-2 text-3xl font-bold text-violet-700">{kpis.efficiency.toFixed(1)}%</div><p className="mt-2 text-xs leading-5 text-slate-600">当前综合能源利用率距年度目标仍差 {(90 - kpis.efficiency).toFixed(1)} 个百分点。主要改善空间来自变配电损耗、空调部分负荷运行和夜间待机。</p><Button size="sm" className="mt-4" onClick={() => openDiagnosis(selectedNode)}><Wrench />进入能源诊断</Button></div></TabsContent>
              </Tabs>
            </aside>
          </section>

          <BottomAnalysis tab={bottomTab} onTabChange={setBottomTab} scale={scale} compare={filters.compare} onEnergy={(energy) => { const next = { ...filters, energy, metric: filters.metric === "standardCoal" ? "energy" : filters.metric }; setFilters(next); setDraftFilters(next); persistFilters(next); setSelectedNodeId(graphData.nodes.find((node) => node.energyType === energy)?.id ?? null); window.scrollTo({ top: 420, behavior: "smooth" }); }} onLocate={(nodeId) => { locateNode(nodeId); window.scrollTo({ top: 420, behavior: "smooth" }); }} onTrendPoint={(nodeId) => { setUpdatedAt("2026-07-29 23:00:00"); locateNode(nodeId); window.scrollTo({ top: 420, behavior: "smooth" }); }} />
        </>
      ) : <EmptyState state={pageState} onReset={resetFilters} onRetry={refreshAll} onQuality={() => setQualityOpen(true)} />}

      <NodeDetailsSheet open={nodeDrawerOpen} onOpenChange={setNodeDrawerOpen} node={selectedNode} links={graphData.links} scale={scale} onDrill={drillInto} onDiagnosis={openDiagnosis} onDevice={() => setDeviceDialogOpen(true)} />
      <LinkDetailsDialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen} link={selectedLink} scale={scale} focused={selectedLink ? focusedLinks.includes(selectedLink.id) : false} onFocus={() => selectedLink && toggleFocus(selectedLink.id)} onDiagnosis={() => openDiagnosis(selectedLink ? ENERGY_FLOW_NODES.find((node) => node.id === selectedLink.target) ?? null : null)} />
      <DeviceDialog open={deviceDialogOpen} onOpenChange={setDeviceDialogOpen} node={selectedNode} />
      <DataQualitySheet open={qualityOpen} onOpenChange={setQualityOpen} pageState={pageState} onStateChange={(state) => { setPageState(state); setQualityOpen(false); }} />

      <Dialog open={exportOpen} onOpenChange={setExportOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>导出能源流向分析</DialogTitle><DialogDescription>选择一个或多个导出内容。文件由当前筛选后的页面数据即时生成。</DialogDescription></DialogHeader>
          <div className="space-y-2">{([
            ["png", "当前桑基图 PNG 图片", FileImage, "适合汇报和看板截图"],
            ["pdf", "当前页面 PDF", FileText, "包含筛选口径与关键指标"],
            ["flow", "能源流向明细 Excel", FileSpreadsheet, "包含每条流向及损耗数据"],
            ["balance", "能源平衡数据 Excel", FileSpreadsheet, "包含分能源平衡明细"],
          ] as const).map(([key, label, Icon, detail]) => <label key={key} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-3 hover:border-blue-300"><input type="checkbox" checked={exportItems[key]} onChange={(event) => setExportItems((current) => ({ ...current, [key]: event.target.checked }))} /><Icon className="h-5 w-5 text-blue-600" /><span><b className="block text-sm">{label}</b><span className="text-xs text-slate-400">{detail}</span></span></label>)}</div>
          <DialogFooter><Button variant="outline" onClick={() => setExportOpen(false)}>取消</Button><Button onClick={() => void runExport()} disabled={!Object.values(exportItems).some(Boolean)}><Download />生成并下载</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent><DialogHeader><DialogTitle>保存当前视图</DialogTitle><DialogDescription>筛选条件、层级和展示口径会保存在当前浏览器。</DialogDescription></DialogHeader><label className="space-y-1"><span className="text-xs font-medium">视图名称</span><input className={inputClass} value={viewName} onChange={(event) => setViewName(event.target.value)} placeholder="例如：主校区电力损耗月报" /></label><label className="space-y-1"><span className="text-xs font-medium">备注</span><textarea className="min-h-24 w-full rounded-md border border-slate-200 p-2 text-sm outline-none focus:border-blue-500" value={viewNotes} onChange={(event) => setViewNotes(event.target.value)} placeholder="可选，说明该视图的用途" /></label><DialogFooter><Button variant="outline" onClick={() => setSaveViewOpen(false)}>取消</Button><Button onClick={saveCurrentView} disabled={!viewName.trim()}><Save />保存视图</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={viewsOpen} onOpenChange={setViewsOpen}>
        <DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>我的视图</DialogTitle><DialogDescription>可加载、重命名或删除已保存的分析配置。</DialogDescription></DialogHeader><div className="max-h-[420px] space-y-2 overflow-y-auto">{savedViews.length === 0 ? <div className="py-12 text-center text-sm text-slate-400"><Layers3 className="mx-auto mb-2 h-8 w-8" />尚未保存视图</div> : savedViews.map((view) => <div key={view.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"><div className="min-w-0 flex-1"><b className="text-sm">{view.name}</b><p className="truncate text-xs text-slate-400">{view.notes || "无备注"} · {view.createdAt}</p><div className="mt-1 text-[11px] text-slate-500">{ENERGY_META[view.filters.energy].label} / {campusOptions.find(([id]) => id === view.filters.campus)?.[1]} / {metricOptions.find(([id]) => id === view.filters.metric)?.[1]}</div></div><Button size="sm" onClick={() => loadView(view)}>加载</Button><Button size="icon-sm" variant="outline" onClick={() => renameView(view.id)} aria-label="重命名"><Settings2 /></Button><Button size="icon-sm" variant="outline" onClick={() => deleteView(view.id)} aria-label="删除"><Trash2 className="text-red-600" /></Button></div>)}</div></DialogContent>
      </Dialog>

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>创建能源诊断任务</DialogTitle><DialogDescription>保存后任务会进入本页诊断任务列表，并保留在当前浏览器。</DialogDescription></DialogHeader><form id="diagnosis-task-form" className="grid grid-cols-2 gap-3" onSubmit={(event) => { event.preventDefault(); createTask(event.currentTarget); }}><label className="col-span-2 space-y-1"><span className="text-xs">任务名称</span><input name="name" className={inputClass} defaultValue={suggestionForTask.title} required /></label><label className="space-y-1"><span className="text-xs">关联节点</span><input className={inputClass} value={ENERGY_FLOW_NODES.find((node) => node.id === suggestionForTask.nodeId)?.name ?? suggestionForTask.nodeId} readOnly /></label><label className="space-y-1"><span className="text-xs">负责人</span><select name="owner" className={selectClass}><option>能源管理员</option><option>设备主管</option><option>后勤运维组</option></select></label><label className="col-span-2 space-y-1"><span className="text-xs">异常问题</span><input name="problem" className={inputClass} defaultValue={suggestionForTask.problem} /></label><label className="space-y-1"><span className="text-xs">截止时间</span><input name="deadline" type="date" min="2026-07-30" defaultValue="2026-08-05" className={inputClass} /></label><label className="space-y-1"><span className="text-xs">优先级</span><select name="priority" defaultValue={suggestionForTask.priority} className={selectClass}><option>高</option><option>中</option><option>低</option></select></label><label className="col-span-2 space-y-1"><span className="text-xs">任务说明</span><textarea name="description" className="min-h-20 w-full rounded-md border border-slate-200 p-2 text-sm" defaultValue={`请核查${suggestionForTask.problem}，输出原因分析和处置建议。`} /></label></form><DialogFooter><Button variant="outline" onClick={() => setTaskOpen(false)}>取消</Button><Button type="submit" form="diagnosis-task-form"><ListChecks />保存任务</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}

function LightbulbIcon() {
  return <span className="rounded-lg bg-amber-50 p-2 text-amber-600"><Sparkles className="h-4 w-4" /></span>;
}

function NodeDetailsSheet({ open, onOpenChange, node, links, scale, onDrill, onDiagnosis, onDevice }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: EnergyFlowNode | null;
  links: EnergyFlowLink[];
  scale: number;
  onDrill: (nodeId: string) => void;
  onDiagnosis: (node: EnergyFlowNode | null) => void;
  onDevice: () => void;
}) {
  const upstream = node ? links.filter((link) => link.target === node.id) : [];
  const downstream = node ? links.filter((link) => link.source === node.id) : [];
  const sevenDays = Array.from({ length: 7 }, (_, index) => ({
    day: `${7 + 23 + index}日`,
    value: Number(((node?.standardCoal ?? 12) * scale * (0.88 + index * 0.035)).toFixed(2)),
  }));
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[560px] max-w-[94vw] gap-0 overflow-hidden bg-white sm:max-w-[560px]">
        <SheetHeader className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="rounded-lg bg-blue-50 p-2 text-blue-600"><GitBranch className="h-5 w-5" /></span>
            <div><SheetTitle>{node?.name ?? "节点详情"}</SheetTitle><SheetDescription>节点详情 · 上下游构成 · 趋势与诊断建议</SheetDescription></div>
          </div>
        </SheetHeader>
        {node && <div className="flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3"><div><span className="text-[11px] text-slate-400">节点类型</span><div className="text-sm font-medium">{{ input: "能源输入端", conversion: "转换与输配系统", building: "校园建筑", enduse: "终端用能场景", device: "重点设备", result: "能源结果" }[node.type]}</div></div><StatusBadge status={node.status} /></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              ["当前能源量", `${(node.standardCoal * scale).toFixed(2)} tce`],
              ["峰值能源量", `${((node.peakValue ?? node.standardCoal) * scale).toFixed(2)} tce`],
              ["峰值发生时间", node.peakTime ?? "15:00"],
              ["同比 / 环比", `${formatSigned(node.yearOnYear)} / ${formatSigned(node.monthOnMonth)}`],
              ["能源费用", `${(node.cost * scale).toFixed(2)} 万元`],
              ["碳排放", `${(node.carbonEmission * scale).toFixed(2)} tCO₂e`],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><span className="text-[10px] text-slate-400">{label}</span><b className="mt-1 block text-xs text-slate-700">{value}</b></div>)}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Composition title="上游来源构成" links={upstream} side="source" scale={scale} />
            <Composition title="下游去向构成" links={downstream} side="target" scale={scale} />
          </div>

          <section className="rounded-lg border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-semibold">最近24小时趋势</h4><span className="text-[10px] text-slate-400">小时 · tce</span></div>
            <div className="h-150px h-[150px]">
              <ResponsiveContainer width="100%" height="100%"><AreaChart data={TREND_DATA.map((item) => ({ ...item, value: item.input * Math.max(0.08, node.standardCoal / 189.6) * scale }))}><defs><linearGradient id="nodeTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="time" tick={{ fontSize: 9 }} interval={5} /><YAxis tick={{ fontSize: 9 }} width={34} /><Tooltip /><Area type="monotone" dataKey="value" name="能源量" stroke="#2563eb" fill="url(#nodeTrend)" /></AreaChart></ResponsiveContainer>
            </div>
          </section>
          <section className="rounded-lg border border-slate-100 p-3">
            <div className="mb-2 flex items-center justify-between"><h4 className="text-xs font-semibold">最近7天趋势</h4><span className="text-[10px] text-slate-400">日 · tce</span></div>
            <div className="h-[130px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={sevenDays}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="day" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} width={34} /><Tooltip /><Line type="monotone" dataKey="value" name="能源量" stroke="#06b6d4" strokeWidth={2} dot={{ r: 2 }} /></LineChart></ResponsiveContainer></div>
          </section>

          <section className="rounded-lg border border-slate-100 p-3 text-xs">
            <h4 className="mb-2 font-semibold">运行与数据</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-500"><span>数据完整率 <b className={cn("float-right", node.dataQuality < 90 ? "text-amber-600" : "text-emerald-600")}>{node.dataQuality.toFixed(1)}%</b></span><span>数据质量 <b className="float-right text-slate-700">{node.isEstimated ? "估算值" : "实测值"}</b></span><span>关联计量表 <b className="float-right text-slate-700">{Math.max(1, upstream.length + downstream.length)}个</b></span><span>关联设备 <b className="float-right text-slate-700">{node.type === "building" ? "12台" : "3台"}</b></span></div>
          </section>

          {(node.status !== "normal" || node.isEstimated) && <section className="rounded-lg border border-orange-200 bg-orange-50 p-3"><div className="flex items-start gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" /><div><h4 className="text-xs font-semibold text-orange-900">异常事件记录</h4><p className="mt-1 text-[11px] leading-5 text-orange-800">07-29 15:20 检测到{node.status === "critical" ? "严重流量偏差" : node.isEstimated ? "计量数据缺失，已启用估算" : "损耗率高于基准"}，当前处于待核查状态。</p></div></div></section>}
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><div className="flex items-start gap-2"><Leaf className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /><div><h4 className="text-xs font-semibold text-emerald-900">节能建议</h4><p className="mt-1 text-[11px] leading-5 text-emerald-800">建议结合分时负荷检查运行策略与计量边界，优先排查高峰时段异常增量，预计可降低3%—8%的无效能耗。</p></div></div></section>
        </div>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-white p-4">
          {node?.canDrillDown && <Button variant="outline" size="sm" onClick={() => onDrill(node.id)}><Layers3 />进入下一级</Button>}
          <Button variant="outline" size="sm" onClick={onDevice}><Wrench />查看设备详情</Button>
          <Button size="sm" onClick={() => onDiagnosis(node)}><Activity />进入能源诊断</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Composition({ title, links, side, scale }: { title: string; links: EnergyFlowLink[]; side: "source" | "target"; scale: number }) {
  const total = links.reduce((sum, link) => sum + link.standardCoal, 0);
  return (
    <section className="rounded-lg border border-slate-100 p-3">
      <h4 className="mb-2 text-xs font-semibold">{title}</h4>
      {links.length === 0 ? <p className="py-4 text-center text-[11px] text-slate-400">暂无{side === "source" ? "上游" : "下游"}节点</p> : <div className="space-y-2">{links.slice(0, 5).map((link) => {
        const targetId = link[side];
        const name = ENERGY_FLOW_NODES.find((node) => node.id === targetId)?.name ?? targetId;
        const percent = total ? link.standardCoal / total * 100 : 0;
        return <div key={link.id}><div className="flex justify-between text-[10px]"><span className="truncate">{name}</span><span>{(link.standardCoal * scale).toFixed(1)} tce · {percent.toFixed(0)}%</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${Math.max(4, percent)}%`, backgroundColor: ENERGY_META[link.energyType].color }} /></div></div>;
      })}</div>}
    </section>
  );
}

function LinkDetailsDialog({ open, onOpenChange, link, scale, focused, onFocus, onDiagnosis }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: EnergyFlowLink | null;
  scale: number;
  focused: boolean;
  onFocus: () => void;
  onDiagnosis: () => void;
}) {
  const source = ENERGY_FLOW_NODES.find((node) => node.id === link?.source);
  const target = ENERGY_FLOW_NODES.find((node) => node.id === link?.target);
  const values = link ? TREND_DATA.map((item) => ({ ...item, value: item.input * Math.max(0.04, link.standardCoal / 189.6) * scale })) : [];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>能源流向详情</DialogTitle><DialogDescription>{source?.name ?? "上游节点"} → {target?.name ?? "下游节点"}</DialogDescription></DialogHeader>
        {link && <>
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full" style={{ backgroundColor: ENERGY_META[link.energyType].color }} /><b className="text-sm">{ENERGY_META[link.energyType].label}流向</b></div><StatusBadge status={link.status} /></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["当前流量", `${(link.standardCoal * scale).toFixed(2)} tce`], ["历史平均流量", `${(link.standardCoal * scale * 0.93).toFixed(2)} tce`],
              ["最大流量", `${(link.standardCoal * scale * 1.22).toFixed(2)} tce`], ["最小流量", `${(link.standardCoal * scale * 0.61).toFixed(2)} tce`],
              ["输配损耗率", `${link.lossRate.toFixed(1)}%`], ["费用", `${(link.cost * scale).toFixed(2)} 万元`],
              ["碳排放", `${(link.carbonEmission * scale).toFixed(2)} tCO₂e`], ["同比 / 环比", `${formatSigned(link.yearOnYear)} / ${formatSigned(link.monthOnMonth)}`],
            ].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3"><span className="text-[10px] text-slate-400">{label}</span><b className="mt-1 block text-xs">{value}</b></div>)}
          </div>
          <section className="rounded-lg border border-slate-100 p-3"><div className="mb-2 flex justify-between"><h4 className="text-xs font-semibold">24小时趋势</h4><span className="text-[10px] text-slate-400">点击异常时段可在主图定位</span></div><div className="h-[190px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={values}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="time" tick={{ fontSize: 9 }} interval={3} /><YAxis tick={{ fontSize: 9 }} width={38} /><Tooltip /><Line type="monotone" dataKey="value" name="流量" stroke={ENERGY_META[link.energyType].color} strokeWidth={2} dot={(props: { cx?: number; cy?: number; payload?: { abnormal?: boolean } }) => <circle cx={props.cx} cy={props.cy} r={props.payload?.abnormal ? 5 : 2} fill={props.payload?.abnormal ? "#ef4444" : ENERGY_META[link.energyType].color} /> } /></LineChart></ResponsiveContainer></div></section>
          <div className="grid gap-3 sm:grid-cols-2"><section className="rounded-lg border border-red-100 bg-red-50/40 p-3"><h4 className="text-xs font-semibold">异常时段</h4><div className="mt-2 flex items-center justify-between text-[11px]"><span>23:00—00:30 流量偏高</span><span className="text-red-600">+16.5%</span></div></section><section className="rounded-lg border border-slate-100 p-3"><h4 className="text-xs font-semibold">关联计量点与数据来源</h4><p className="mt-2 text-[11px] text-slate-500">{link.meterIds.join("、")} · 智能计量网关 / 15分钟采集</p></section></div>
        </>}
        <DialogFooter><Button variant="outline" onClick={onFocus}>{focused ? <><EyeOff />取消重点关注</> : <><Eye />设为重点关注</>}</Button><Button onClick={onDiagnosis}><Activity />查看诊断建议</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeviceDialog({ open, onOpenChange, node }: { open: boolean; onOpenChange: (open: boolean) => void; node: EnergyFlowNode | null }) {
  const data = TREND_DATA.map((item) => ({ time: item.time, power: Number((item.input * 41.6).toFixed(1)) }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>设备详情</DialogTitle><DialogDescription>{node?.name ?? "当前节点"} · 关联重点设备</DialogDescription></DialogHeader><div className="rounded-lg border border-slate-100 p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="rounded-lg bg-blue-50 p-2 text-blue-600"><Wrench className="h-5 w-5" /></span><div><b className="text-sm">{node?.type === "building" ? "中央空调冷水机组1号" : `${node?.name ?? "能源"}主设备`}</b><p className="text-xs text-slate-400">设备编码：EQ-AC-001</p></div></div><StatusBadge status={node?.status ?? "normal"} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-md bg-slate-50 p-2 text-[10px] text-slate-400">实时功率<b className="block text-sm text-slate-800">326.8 kW</b></div><div className="rounded-md bg-slate-50 p-2 text-[10px] text-slate-400">今日运行时长<b className="block text-sm text-slate-800">9.6 h</b></div><div className="rounded-md bg-slate-50 p-2 text-[10px] text-slate-400">未处理告警<b className="block text-sm text-orange-600">1 条</b></div></div></div><div className="h-[210px] rounded-lg border border-slate-100 p-3"><h4 className="mb-2 text-xs font-semibold">历史功率趋势</h4><ResponsiveContainer width="100%" height="90%"><AreaChart data={data}><defs><linearGradient id="deviceArea" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} /><stop offset="95%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="time" tick={{ fontSize: 9 }} interval={4} /><YAxis tick={{ fontSize: 9 }} /><Tooltip /><Area dataKey="power" name="功率" stroke="#2563eb" fill="url(#deviceArea)" /></AreaChart></ResponsiveContainer></div></DialogContent>
    </Dialog>
  );
}

function DataQualitySheet({ open, onOpenChange, pageState, onStateChange }: { open: boolean; onOpenChange: (open: boolean) => void; pageState: PageState; onStateChange: (state: PageState) => void }) {
  const energies: [EnergyType, number][] = [["electricity", 98.7], ["water", 96.4], ["gas", 98.2], ["heat", 97.5], ["solar", 93.6], ["storage", 91.2]];
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] max-w-[94vw] bg-white sm:max-w-[480px]"><SheetHeader><SheetTitle>数据质量</SheetTitle><SheetDescription>计量点接入、完整性、及时性和异常修复情况</SheetDescription></SheetHeader><div className="flex-1 space-y-4 overflow-y-auto px-4 pb-5"><div className="grid grid-cols-3 gap-2">{[["接入计量点", "286"], ["在线计量点", "278"], ["离线计量点", "8"], ["数据完整率", "97.6%"], ["数据及时率", "98.9%"], ["异常数据", "12"], ["缺失数据", "37"], ["自动修复", "29"], ["质量评分", "96.8"]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-100 p-3 text-center"><span className="text-[10px] text-slate-400">{label}</span><b className="mt-1 block text-lg text-slate-800">{value}</b></div>)}</div><div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-800"><Database className="mr-2 inline h-4 w-4" />最近一次数据同步：2026-07-29 15:42:37</div><section className="rounded-lg border border-slate-100 p-3"><h4 className="mb-3 text-xs font-semibold">各能源数据质量评分</h4><div className="space-y-3">{energies.map(([energy, score]) => <div key={energy}><div className="flex justify-between text-[11px]"><span>{ENERGY_META[energy].label}</span><b>{score}分</b></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${score}%`, backgroundColor: score >= 95 ? "#16a34a" : "#f59e0b" }} /></div></div>)}</div></section><section className="rounded-lg border border-amber-200 bg-amber-50 p-3"><h4 className="text-xs font-semibold text-amber-900">缺失与估算规则</h4><p className="mt-1 text-[11px] leading-5 text-amber-800">8个离线点不直接按0计入。可修复数据使用相邻时段与同类设备模型估算，并在节点上显示虚线边框和“估算值”标签。</p></section><section className="rounded-lg border border-slate-200 p-3"><h4 className="text-xs font-semibold">页面状态预览</h4><p className="mt-1 text-[11px] text-slate-400">用于验证加载失败、无数据、部分缺失、超时与无权限状态的完整交互。</p><div className="mt-3 flex flex-wrap gap-2">{(["normal", "partial", "empty", "error", "timeout", "forbidden"] as PageState[]).map((state) => <button key={state} type="button" onClick={() => onStateChange(state)} className={cn("rounded-md border px-2.5 py-1 text-[11px]", pageState === state ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-500")}>{({ normal: "正常", partial: "部分缺失", empty: "无数据", error: "加载失败", timeout: "接口超时", forbidden: "无权限" } as Record<PageState, string>)[state]}</button>)}</div></section></div></SheetContent>
    </Sheet>
  );
}

function BottomAnalysis({ tab, onTabChange, scale, compare, onEnergy, onLocate, onTrendPoint }: {
  tab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
  scale: number;
  compare: string;
  onEnergy: (energy: EnergyType) => void;
  onLocate: (nodeId: string) => void;
  onTrendPoint: (nodeId: string) => void;
}) {
  const [trendGranularity, setTrendGranularity] = useState("hour");
  const [rankingDimension, setRankingDimension] = useState("building");
  const balanceCards = [
    ["总输入", 189.6, "text-blue-700"], ["有效用能", 165.8, "text-emerald-700"], ["转换损耗", 8.7, "text-orange-700"],
    ["输配损耗", 9.1, "text-orange-700"], ["异常损耗", 2.1, "text-red-700"], ["未计量能源", 1.3, "text-slate-600"],
    ["平衡差", 2.6, "text-amber-700"],
  ] as const;
  const trend = TREND_DATA.map((item) => ({ ...item, input: item.input * scale, effective: item.effective * scale, loss: item.loss * scale, comparison: item.comparison * scale }));
  return (
    <section className={cn(cardClass, "overflow-hidden")}>
      <Tabs value={tab} onValueChange={(value) => onTabChange(value as BottomTab)} className="gap-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3"><TabsList><TabsTrigger value="balance"><ScaleIcon />能源平衡</TabsTrigger><TabsTrigger value="trend"><TrendingUp />趋势分析</TabsTrigger><TabsTrigger value="ranking"><BarChart3 />重点能耗排名</TabsTrigger></TabsList><p className="text-[11px] text-slate-400">分析结果已与当前筛选、层级和桑基图状态同步</p></div>
        <TabsContent value="balance" className="m-0 p-4">
          <div className="grid grid-cols-4 gap-2 lg:grid-cols-8">{balanceCards.map(([label, value, color]) => <div key={label} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3"><span className="text-[10px] text-slate-400">{label}</span><div className={cn("mt-1 text-lg font-bold", color)}>{(value * scale).toFixed(1)} <span className="text-[10px] font-normal text-slate-400">tce</span></div></div>)}<div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3"><span className="text-[10px] text-emerald-700">平衡率</span><div className="mt-1 text-lg font-bold text-emerald-700">98.6%</div><span className="text-[10px] text-emerald-600">状态正常</span></div></div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-slate-100"><table className="w-full min-w-[850px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{["能源类型", "输入量", "输出量", "损耗量", "平衡差", "平衡率", "数据完整率", "状态", "操作"].map((header) => <th key={header} className="px-3 py-2.5 font-medium">{header}</th>)}</tr></thead><tbody>{BALANCE_ROWS.map((row) => {
            const status: FlowStatus = row.rate >= 98 ? "normal" : row.rate >= 95 ? "attention" : row.rate >= 90 ? "warning" : "critical";
            return <tr key={row.energyType} className="border-t border-slate-100"><td className="px-3 py-2.5"><span className="mr-2 inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: ENERGY_META[row.energyType].color }} />{ENERGY_META[row.energyType].label}</td><td className="px-3 py-2.5 tabular-nums">{(row.input * scale).toFixed(1)}</td><td className="px-3 py-2.5 tabular-nums">{(row.output * scale).toFixed(1)}</td><td className="px-3 py-2.5 tabular-nums">{(row.loss * scale).toFixed(1)}</td><td className="px-3 py-2.5 tabular-nums">{(row.difference * scale).toFixed(1)}</td><td className="px-3 py-2.5">{row.rate}%</td><td className="px-3 py-2.5">{row.quality}%</td><td className="px-3 py-2.5"><StatusBadge status={status} /></td><td className="px-3 py-2.5"><button type="button" className="text-blue-600 hover:underline" onClick={() => onEnergy(row.energyType)}>查看流向</button></td></tr>;
          })}</tbody></table></div><div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[11px] text-blue-800"><Info className="h-4 w-4" /><b>平衡关系：</b>能源输入 = 终端有效用能 + 转换损耗 + 输配损耗 + 异常损耗 + 未计量能源。综合能源均已折标，未直接相加原始单位。</div>
        </TabsContent>
        <TabsContent value="trend" className="m-0 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">能源趋势对比</h3><p className="text-[11px] text-slate-400">点击红色异常点可切换时段并定位异常节点</p></div><div className="flex rounded-md border border-slate-200 p-0.5">{[["hour", "小时"], ["day", "日"], ["week", "周"], ["month", "月"]].map(([id, label]) => <button key={id} type="button" onClick={() => setTrendGranularity(id)} className={cn("rounded px-3 py-1 text-xs", trendGranularity === id ? "bg-blue-600 text-white" : "text-slate-500")}>{label}</button>)}</div></div><div className="h-[310px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} onClick={(state) => { const payload = state?.activePayload?.[0]?.payload as { abnormal?: boolean; nodeId?: string } | undefined; if (payload?.abnormal && payload.nodeId) onTrendPoint(payload.nodeId); }}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="time" tick={{ fontSize: 10 }} interval={1} /><YAxis yAxisId="energy" tick={{ fontSize: 10 }} unit=" tce" width={55} /><YAxis yAxisId="rate" orientation="right" domain={[70, 100]} tick={{ fontSize: 10 }} unit="%" width={45} /><Tooltip /><Legend /><Line yAxisId="energy" type="monotone" dataKey="input" name="能源输入" stroke="#2563eb" strokeWidth={2} dot={false} /><Line yAxisId="energy" type="monotone" dataKey="effective" name="终端用能" stroke="#16a34a" strokeWidth={2} dot={false} /><Line yAxisId="energy" type="monotone" dataKey="loss" name="损耗" stroke="#f97316" strokeWidth={2} dot={(props: { cx?: number; cy?: number; payload?: { abnormal?: boolean } }) => <circle cx={props.cx} cy={props.cy} r={props.payload?.abnormal ? 5 : 1.5} fill={props.payload?.abnormal ? "#dc2626" : "#f97316"} />} />{compare !== "none" && <Line yAxisId="energy" type="monotone" dataKey="comparison" name={compare === "yoy" ? "同期" : compare === "mom" ? "上期" : "基准期"} stroke="#94a3b8" strokeDasharray="5 5" dot={false} />}<Line yAxisId="rate" type="monotone" dataKey="efficiency" name="综合利用率" stroke="#8b5cf6" dot={false} /></LineChart></ResponsiveContainer></div></TabsContent>
        <TabsContent value="ranking" className="m-0 p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">重点能耗对象排名</h3><p className="text-[11px] text-slate-400">按当前口径的能源量从高到低排序</p></div><select className="h-8 rounded-md border border-slate-200 px-2 text-xs" value={rankingDimension} onChange={(event) => setRankingDimension(event.target.value)}><option value="building">建筑</option><option value="system">系统</option><option value="device">设备</option><option value="scene">用能场景</option></select></div><div className="overflow-x-auto rounded-lg border border-slate-100"><table className="w-full min-w-[1000px] text-left text-xs"><thead className="bg-slate-50 text-slate-500"><tr>{["排名", "对象名称", "维度", "能源量", "占比", "同比", "环比", "单位面积能耗", "碳排放", "状态", "操作"].map((header) => <th key={header} className="px-3 py-2.5 font-medium">{header}</th>)}</tr></thead><tbody>{RANKING_ROWS.map((row, index) => <tr key={row.id} className="border-t border-slate-100 hover:bg-blue-50/30"><td className="px-3 py-2.5"><span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold", index < 3 ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500")}>{index + 1}</span></td><td className="px-3 py-2.5 font-medium">{row.name}</td><td className="px-3 py-2.5 text-slate-500">{rankingDimension === "building" ? row.type : ({ system: "系统", device: "设备", scene: "用能场景" } as Record<string, string>)[rankingDimension]}</td><td className="px-3 py-2.5 font-semibold">{(row.value * scale).toFixed(1)} tce</td><td className="px-3 py-2.5">{row.share}%</td><td className={cn("px-3 py-2.5", row.yoy > 0 ? "text-red-600" : "text-emerald-600")}>{formatSigned(row.yoy)}</td><td className={cn("px-3 py-2.5", row.mom > 0 ? "text-orange-600" : "text-emerald-600")}>{formatSigned(row.mom)}</td><td className="px-3 py-2.5">{row.intensity} kgce/㎡</td><td className="px-3 py-2.5">{(row.carbon * scale).toFixed(1)} t</td><td className="px-3 py-2.5"><StatusBadge status={row.status} /></td><td className="px-3 py-2.5"><button type="button" className="text-blue-600 hover:underline" onClick={() => onLocate(row.id)}>查看流向</button></td></tr>)}</tbody></table></div></TabsContent>
      </Tabs>
    </section>
  );
}

function ScaleIcon() {
  return <Activity className="h-4 w-4" />;
}
