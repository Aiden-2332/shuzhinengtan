---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 920728846233689_0/project_7664630038792257838-files/碳资产管理_Coding_Prompt.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 920728846233689#1784774241317
    ReservedCode2: ""
---
# 碳资产管理页面 — Coding Prompt

> 直接喂给前端开发/AI编程工具的完整页面实现规格。
> 六大模块：配额台账 / 缺口决策引擎 / 履约任务看板 / 碳资产增值看板 / 合规雷达 / 核查准备中心

---

## 页面定位

路由：`/carbon-asset`
组件名：`<CarbonAssetManagement />`
用户：碳管理员（节能办）、校领导、审计处、核查人员
核心任务：配额全生命周期管理、缺口决策、履约追踪、碳资产增值

---

## 全局约束（与项目其他页面共享）

| 约束项 | 值 |
|---|---|
| 背景色 | `#081028`（深蓝） |
| 主色 | `#3488ff`（浅蓝） |
| 告警色 | `#ff7b25`（橙） |
| 达标色 | `#36d968`（绿） |
| 危险色 | `#ff3333`（红） |
| 辅助紫色 | `#9b6bff` |
| 盈余色 | `#00d4aa`（青绿，用于碳资产增值） |
| 字体 | Noto Sans SC，数字加粗放大，辅助文字 `#8c8c8c` |
| 水印 | 全页面「Demo模拟数据 仅课题演示」半透明 |
| 布局 | 三栏式：左25% + 中50% + 右25%，底部通栏 |
| 图表 | ECharts 5 |
| UI框架 | Ant Design 5.x + Tailwind CSS |
| 状态管理 | Zustand |
| 动画库 | framer-motion（面板展开/数字滚动/滑块联动） |
| 最低分辨率 | 1366×768 |

---

## 页面整体布局

```
┌──────────────────────────────────────────────────────────────────────┐
│ 顶部 56px 全局导航栏（毛玻璃底 backdrop-blur-xl bg-[#081028]/80）      │
│ [年度选择器 ▼] [校区筛选 ▼] [实时估算开关]            [导出按钮] [设置]  │
├────────────────┬───────────────────────────┬─────────────────────────┤
│                │                           │                         │
│  左侧 25%       │   中间 50%                │   右侧 25%               │
│  配额台账        │   缺口决策引擎（主面板）     │   履约任务看板            │
│                │                           │                         │
│  ┌────────────┐│  ┌─────────────────────┐  │  ┌─────────────────────┐│
│  │ 三大指标卡   ││  │ 情景模拟器            │  │  │ 年度履约进度条       ││
│  │ 总配额      ││  │ ·碳价滑块 60-150元/t  │  │  │ 3/6 已完成          ││
│  │ 已消耗      ││  │ ·预测排放量滑块       │  │  ├─────────────────────┤│
│  │ 剩余(盈/亏) ││  │                      │  │  │ 任务卡片列表         ││
│  ├────────────┤│  │ 三策略对比卡片         │  │  │                     ││
│  │ 月度消耗趋势││  │ ┌──────┬──────┬────┐ │  │  │ ·配额清缴报告       ││
│  │ 柱状图     ││  │ │买配额 │买CCER│做减排│ │  │  │  截止:2026-10-31   ││
│  │            ││  │ │154万 │3.8万 │80万 │ │  │  │  ⏰剩余99天        ││
│  ├────────────┤│  │ │     │推荐✓│    │ │  │  │  责任人:张老师      ││
│  │ 配额来源   ││  │ └──────┴──────┴────┘ │  │  │  [查看详情]         ││
│  │ 饼图       ││  ├─────────────────────┤  │  ├─────────────────────┤│
│  │            ││  │ 最优策略推荐          │  │  │ ·月度数据上报        ││
│  ├────────────┤│  │ "建议采用策略B..."    │  │  │  截止:2026-07-31   ││
│  │ TOP5楼栋   ││  │ [执行CCER采购 →]     │  │  │  ⏰剩余8天 ⚠️       ││
│  │ 消耗排名   ││  └─────────────────────┘  │  │  责任人:李工          ││
│  │            ││                           │  │  [完成] [转派]        ││
│  └────────────┘│                           │  └─────────────────────┘│
├────────────────┴───────────────────────────┴─────────────────────────┤
│ 底部 280px 通栏（Tab切换）                                              │
│ [📊 月度排放vs配额] [💰 交易记录] [📈 碳资产增值] [🔍 合规雷达] [📋 核查] │
└──────────────────────────────────────────────────────────────────────┘
```

**设计理念**：碳资产管理页是高校碳管理员的"作战室"。三栏布局让核心信息一屏可见：左侧看配额家底（有多少），中间做缺口决策（怎么办），右侧追履约进度（什么时候交）。底部通栏放辅助模块，Tab切换展开，不占主空间。

---

## TypeScript 核心接口

```typescript
// ============================================================
// 配额台账
// ============================================================

interface QuotaLedger {
  year: number;
  campus: string;
  totalQuota: number;           // tCO₂ 年度总配额
  consumedQuota: number;        // tCO₂ 已消耗配额（截至当前）
  remainingQuota: number;       // tCO₂ 剩余配额 = total - consumed
  quotaStatus: 'surplus' | 'balanced' | 'deficit';
  monthlyConsumption: MonthlyEmission[];
  quotaSources: QuotaSource[];
  topBuildings: BuildingConsumption[];
}

interface MonthlyEmission {
  month: string;                // "2026-01"
  quota: number;               // 当月配额
  actualEmission: number;      // 实际排放 tCO₂
  diff: number;                // 差值 = quota - actual
}

interface QuotaSource {
  type: 'free_allocation' | 'paid_purchase' | 'ccer_offset' | 'transfer_in';
  label: string;
  amount: number;              // tCO₂
  percentage: number;          // 占比
}

interface BuildingConsumption {
  buildingId: string;
  buildingName: string;
  consumption: number;         // tCO₂ 本年度累计消耗
  percentage: number;          // 占全校比例
  trend: 'up' | 'down' | 'stable';
}

// ============================================================
// 缺口决策引擎
// ============================================================

interface GapDecisionEngine {
  // 模拟器输入
  simulator: {
    carbonPrice: number;       // 元/tCO₂ 当前碳价（滑块60-150）
    forecastEmission: number;  // tCO₂ 预测全年排放量
    quotaGap: number;          // tCO₂ 配额缺口 = forecast - remaining（正=缺口，负=盈余）
    fundingExposure: number;   // 元 资金敞口 = gap × carbonPrice
  };
  // 三策略输出
  strategies: StrategyCard[];
  // 最优推荐
  recommendation: {
    strategyId: string;
    reason: string;
    confidence: number;        // 0-1 推荐置信度
    savings: number;           // 相比最贵策略节省金额
  };
}

interface StrategyCard {
  id: 'buy_quota' | 'buy_ccer' | 'implement_reduction';
  label: string;               // "直接买配额" | "买CCER抵销" | "实施减排项目"
  icon: string;                // emoji
  totalCost: number;           // 元 总成本
  detail: string;              // 计算明细说明
  pros: string[];              // 优势列表
  cons: string[];              // 劣势列表
  executionUrl?: string;       // 一键执行跳转链接
  // CCER特有
  ccerLimit?: number;          // 最大可抵销量（不超过配额5%）
  ccerUnitPrice?: number;      // CCER单价
  // 减排特有
  investmentAmount?: number;   // 投资金额
  paybackMonths?: number;      // 回收期（月）
  annualReduction?: number;    // 年减排量 tCO₂
  isRecommended?: boolean;     // 是否推荐
}

// ============================================================
// 履约任务看板
// ============================================================

interface ComplianceTask {
  id: string;
  taskName: string;
  deadline: string;            // YYYY-MM-DD
  daysRemaining: number;       // 计算得出
  responsiblePerson: string;   // 责任人
  status: 'not_started' | 'in_progress' | 'completed' | 'overdue' | 'at_risk';
  priority: 'high' | 'medium' | 'low';
  description: string;
  relatedDocs: string[];       // 关联文档路径
  completionProgress: number;  // 0-100
}

interface ComplianceCalendar {
  year: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  atRiskTasks: number;         // 剩余<15天且未完成
  tasks: ComplianceTask[];
}

// ============================================================
// 碳资产增值看板
// ============================================================

interface CarbonAssetValue {
  surplusQuota: number;        // tCO₂ 盈余配额
  currentCarbonPrice: number;  // 元/tCO₂
  estimatedValue: number;      // 元 估值 = surplus × price
  priceTrend: 'rising' | 'stable' | 'declining';
  priceChange: number;         // 近30天涨跌幅 %
  sellingAdvice: {
    timing: string;            // "建议Q4出售"
    reason: string;
    expectedPrice: number;     // 预期碳价
    expectedGain: number;      // 预期收益
  };
  financialTools: FinancialTool[];
}

interface FinancialTool {
  id: string;
  name: string;                // "碳配额质押融资" | "CCER项目开发"
  description: string;
  estimatedAmount?: number;    // 预估额度
  status: 'available' | 'applied' | 'completed';
  actionUrl: string;
}

// ============================================================
// 交易记录
// ============================================================

interface TradeRecord {
  id: string;
  tradeDate: string;
  tradeType: 'buy' | 'sell';
  tradeProduct: 'CEA' | 'CCER';
  quantity: number;            // tCO₂
  unitPrice: number;           // 元/tCO₂
  totalAmount: number;         // 元
  counterparty: string;        // 交易对手
  status: 'pending' | 'settled' | 'cancelled';
}

// ============================================================
// 合规雷达
// ============================================================

interface ComplianceRadar {
  policyChanges: PolicyChange[];
  selfCheckList: SelfCheckItem[];
  complianceScore: number;     // 0-100
  riskLevel: 'low' | 'medium' | 'high';
}

interface PolicyChange {
  id: string;
  publishDate: string;
  policyName: string;
  issuer: string;              // 发文单位
  effectiveDate: string;
  impactScope: string[];       // 受影响的管理流程
  summary: string;
  actionRequired: string;      // 需要执行的操作
  url: string;                 // 原文链接
}

interface SelfCheckItem {
  id: string;
  category: string;            // "计量器具" | "核算方法" | "数据报送" | "配额管理"
  checkItem: string;
  status: 'pass' | 'fail' | 'warning' | 'not_checked';
  lastChecked: string;
  fixUrl?: string;             // 一键修复跳转
}

// ============================================================
// 核查准备中心
// ============================================================

interface AuditPreparation {
  mrvChain: MRVNode[];
  auditChecklist: AuditCheckItem[];
  missingDocuments: MissingDoc[];
  readinessScore: number;      // 0-100 核查准备度
}

interface MRVNode {
  id: string;
  level: 'emission' | 'activity_data' | 'meter' | 'source_doc';
  title: string;
  data: string;                // 数据值
  source: string;              // 数据来源
  verified: boolean;
  children: MRVNode[];         // 溯源子节点
}

interface AuditCheckItem {
  id: string;
  category: string;
  checkContent: string;
  status: 'pass' | 'fail' | 'not_checked';
  evidence?: string;           // 证据描述
}

interface MissingDoc {
  id: string;
  docName: string;
  requiredBy: string;          // 核查要求
  relatedBuilding?: string;
  severity: 'critical' | 'major' | 'minor';
}
```

---

## API 端点

```typescript
const API = {
  // 配额台账
  'GET /api/carbon/quota/ledger':            (year, campus) => QuotaLedger,
  'GET /api/carbon/quota/monthly':           (year) => MonthlyEmission[],
  'GET /api/carbon/quota/buildings':         (year, topN) => BuildingConsumption[],

  // 缺口决策引擎
  'POST /api/carbon/gap/simulate':           (carbonPrice, forecastEmission) => GapDecisionEngine,
  'GET /api/carbon/gap/current':             (year) => GapDecisionEngine,
  'GET /api/carbon/price/realtime':          () => { price: number, trend: string, change: number },

  // 履约任务
  'GET /api/carbon/compliance/tasks':        (year) => ComplianceCalendar,
  'PATCH /api/carbon/compliance/tasks/:id':  (partial: Partial<ComplianceTask>) => ComplianceTask,

  // 碳资产增值
  'GET /api/carbon/asset/value':             (year) => CarbonAssetValue,
  'GET /api/carbon/asset/tools':             () => FinancialTool[],

  // 交易记录
  'GET /api/carbon/trades':                  (year, type?, page) => { records: TradeRecord[], total: number },

  // 合规雷达
  'GET /api/carbon/compliance/radar':        () => ComplianceRadar,
  'PATCH /api/carbon/compliance/check/:id':  (status) => SelfCheckItem,

  // 核查准备
  'GET /api/carbon/audit/preparation':       (year) => AuditPreparation,
  'POST /api/carbon/audit/export':           (format: 'pdf' | 'excel') => Blob,
};
```

---

## Zustand Store

```typescript
interface CarbonAssetStore {
  // 全局筛选
  selectedYear: number;
  selectedCampus: string;
  realTimeEstimate: boolean;

  // 配额台账
  quotaLedger: QuotaLedger | null;
  quotaLoading: boolean;

  // 缺口决策引擎
  gapEngine: GapDecisionEngine | null;
  carbonPriceInput: number;       // 滑块值
  forecastEmissionInput: number;  // 滑块值
  gapLoading: boolean;
  activeStrategy: string | null;  // 当前展开的策略详情

  // 履约任务
  complianceCalendar: ComplianceCalendar | null;
  expandedTaskId: string | null;

  // 碳资产增值
  assetValue: CarbonAssetValue | null;

  // 交易记录
  tradeRecords: TradeRecord[];
  tradePage: number;
  tradeTotal: number;

  // 合规雷达
  complianceRadar: ComplianceRadar | null;

  // 核查准备
  auditPrep: AuditPreparation | null;
  auditMrvExpandedId: string | null;

  // Actions
  setYear: (year: number) => void;
  setCampus: (campus: string) => void;
  setRealTimeEstimate: (enabled: boolean) => void;
  fetchQuotaLedger: () => Promise<void>;
  simulateGap: (price: number, emission: number) => Promise<void>;
  updateCarbonPrice: (price: number) => void;
  updateForecastEmission: (emission: number) => void;
  selectStrategy: (id: string | null) => void;
  fetchComplianceTasks: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: ComplianceTask['status']) => Promise<void>;
  fetchAssetValue: () => Promise<void>;
  fetchTradeRecords: (page: number) => Promise<void>;
  fetchComplianceRadar: () => Promise<void>;
  fetchAuditPreparation: () => Promise<void>;
  exportAuditPackage: (format: 'pdf' | 'excel') => Promise<void>;
}

const useCarbonAssetStore = create<CarbonAssetStore>((set, get) => ({
  // ... 实现各 action
  // simulateGap 示例：
  simulateGap: async (price, emission) => {
    set({ gapLoading: true });
    const result = await api.post('/api/carbon/gap/simulate', { carbonPrice: price, forecastEmission: emission });
    set({ gapEngine: result, gapLoading: false });
  },
}));
```

---

## 组件树

```
<CarbonAssetManagement />
├── <TopNavBar />                    // 年度/校区选择 + 实时估算 + 导出
│   ├── <YearSelector />
│   ├── <CampusSelector />
│   ├── <RealTimeToggle />
│   └── <ExportButton />
│
├── <ThreeColumnLayout />
│   ├── <LeftColumn />              // 25%
│   │   ├── <QuotaLedgerCard />     // 三大指标
│   │   │   ├── <QuotaNumber label="总配额" value={totalQuota} />
│   │   │   ├── <QuotaNumber label="已消耗" value={consumedQuota} />
│   │   │   └── <QuotaNumber label="剩余" value={remainingQuota} status={quotaStatus} />
│   │   │       // status: surplus→青绿, balanced→蓝, deficit→红
│   │   │
│   │   ├── <MonthlyTrendChart />   // 月度消耗趋势柱状图
│   │   │
│   │   ├── <QuotaSourcePie />      // 配额来源饼图
│   │   │
│   │   └── <TopBuildingsRank />    // TOP5楼栋消耗排名
│   │       └── <BuildingRankItem /> × 5
│   │
│   ├── <CenterColumn />            // 50%
│   │   ├── <GapSimulator />        // 情景模拟器
│   │   │   ├── <CarbonPriceSlider />
│   │   │   ├── <EmissionForecastSlider />
│   │   │   └── <SimulatorResult /> // 缺口量 + 资金敞口
│   │   │
│   │   ├── <StrategyComparison />  // 三策略对比
│   │   │   └── <StrategyCard /> × 3
│   │   │       ├── <CostDisplay />
│   │   │       ├── <ProsConsList />
│   │   │       └── <ExecuteButton />
│   │   │
│   │   └── <RecommendationBanner /> // 最优策略推荐
│   │       ├── <RecommendReason />
│   │       └── <ExecuteAction />   // "执行CCER采购 →"
│   │
│   └── <RightColumn />             // 25%
│       ├── <ComplianceProgress />  // 年度履约进度条
│       │   └── <ProgressBar completed={3} total={6} />
│       │
│       └── <TaskCardList />        // 任务卡片列表
│           └── <TaskCard /> × N
│               ├── <TaskHeader />  // 任务名 + 状态标签
│               ├── <TaskCountdown /> // 倒计时 + 天数
│               ├── <TaskPerson />  // 责任人
│               └── <TaskActions /> // [完成] [转派] [查看详情]
│
├── <BottomPanel />                 // 280px 底部通栏 Tab
│   ├── <BottomTabBar />
│   │   ├── Tab: "📊 月度排放vs配额"
│   │   ├── Tab: "💰 交易记录"
│   │   ├── Tab: "📈 碳资产增值"
│   │   ├── Tab: "🔍 合规雷达"
│   │   └── Tab: "📋 核查准备"
│   │
│   └── <BottomTabContent />        // AnimatePresence 切换
│       ├── <EmissionVsQuotaChart />  // 月度排放vs配额柱状图
│       ├── <TradeRecordTable />      // 交易记录表格
│       ├── <AssetValuePanel />       // 碳资产增值详情
│       ├── <ComplianceRadarPanel />  // 合规雷达面板
│       └── <AuditPrepPanel />        // 核查准备面板
```

---

## 模块1：配额台账（左侧栏）

### 1.1 三大指标卡

```
┌─────────────────────────┐
│ 配额台账 2026年度          │
│ ┌───────┬───────┬───────┐│
│ │总配额  │已消耗  │剩余    ││
│ │21,500 │16,850 │-350   ││
│ │tCO₂  │tCO₂   │tCO₂   ││
│ │       │       │⚠️亏损  ││
│ └───────┴───────┴───────┘│
└─────────────────────────┘
```

- 三个数字横向排列，等宽
- 数字使用 `text-3xl font-bold`，数字变化时有 framer-motion `animate` 滚动效果
- 剩余配额状态：
  - `surplus`（盈余）→ 青绿色 `#00d4aa`
  - `balanced`（刚好）→ 主色蓝 `#3488ff`
  - `deficit`（亏损）→ 红色 `#ff3333` + 脉冲动画 `animate-pulse`
- 卡片底色：毛玻璃 `bg-white/5 backdrop-blur-md border border-white/10 rounded-xl`
- 数字滚动动画：`framer-motion` + `type: 'tween', duration: 1.2, ease: 'easeOut'`

### 1.2 月度消耗趋势

- ECharts 柱状图（双系列）
  - 蓝色柱 `#3488ff`：月度配额
  - 灰色柱 `rgba(255,255,255,0.3)`：月度实际排放
  - 差值用颜色区分：排放<配额→底部绿色填充，排放>配额→顶部红色填充
- X轴：1月-12月
- hover tooltip 显示：配额/排放/差值
- 当前月份柱有右侧竖线标记「本月」
- API: `GET /api/carbon/quota/monthly?year=2026`

### 1.3 配额来源饼图

- ECharts 环形饼图
- 四类来源配色：
  - 免费分配：`#3488ff`
  - 有偿购买：`#ff7b25`
  - CCER抵销：`#36d968`
  - 转入：`#9b6bff`
- 中心数字：总配额量
- 点击扇区展开明细

### 1.4 TOP5楼栋消耗排名

```
┌─────────────────────────┐
│ 消耗排名 TOP5              │
│ ─────────────────────────│
│ 1 图书馆    3,200t  ↑12% │
│ ████████████░░░░  14.9%  │
│                            │
│ 2 实验楼A   2,850t  ↓3%  │
│ ██████████░░░░░░  13.3%  │
│                            │
│ 3 教学楼B   2,100t  ↑8%  │
│ ███████░░░░░░░░░   9.8%  │
│                            │
│ 4 学生公寓   1,800t  →    │
│ ██████░░░░░░░░░░   8.4%  │
│                            │
│ 5 行政楼     1,200t  ↑5%  │
│ ████░░░░░░░░░░░░   5.6%  │
└─────────────────────────┘
```

- 进度条颜色：`up` → 橙色（警告上升），`down` → 绿色，`stable` → 蓝色
- 百分比数字右对齐
- 点击楼栋名可跳转至该楼栋详情页

---

## 模块2：缺口决策引擎（中间主面板）

这是页面核心模块，占50%宽度，视觉重心。

### 2.1 情景模拟器

```
┌─────────────────────────────────────────────────┐
│ 🔧 情景模拟器                                      │
│                                                   │
│ 碳价（元/tCO₂）                                   │
│ ├───────●────────────────────────────┤            │
│ 60      85                        150             │
│ 当前市场价: 85元/t（来源：全国碳市场 2026-07-22）   │
│                                                   │
│ 预测全年排放量（tCO₂）                              │
│ ├───────────────●────────────────────┤            │
│ 15,000      21,500            30,000              │
│ 基于历史趋势预测: 21,500 tCO₂                      │
│                                                   │
│ ┌──────────────────┬──────────────────┐          │
│ │ 配额缺口           │ 资金敞口           │          │
│ │ 12,850 tCO₂       │ 1,092,250 元      │          │
│ │ ⚠️ 高风险          │ 💰 超百万          │          │
│ └──────────────────┴──────────────────┘          │
└─────────────────────────────────────────────────┘
```

- 两个滑块，framer-motion 控制，拖动时实时触发 `simulateGap` API（debounce 300ms）
- 碳价滑块：范围 60-150 元/t，步进 1 元
- 排放量滑块：范围 15,000-30,000 tCO₂，步进 100 t
- 缺口和资金敞口数字实时更新，带数字滚动动画
- 风险等级自动判断：
  - 缺口 > 10,000t → 红色高风险
  - 缺口 5,000-10,000t → 橙色中风险
  - 缺口 < 5,000t → 蓝色低风险
  - 盈余 → 青绿色

### 2.2 三策略对比卡片

```
┌───────────────┬───────────────┬───────────────┐
│ 💰 直接买配额   │ 🌿 买CCER抵销  │ 🔧 实施减排    │
│               │    ✅推荐      │               │
│ ───────────── │ ───────────── │ ───────────── │
│ 总成本         │ 总成本         │ 总投资         │
│ ¥1,092,250   │ ¥38,500      │ ¥800,000      │
│               │               │               │
│ 优势           │ 优势           │ 优势           │
│ ✓ 即刻补足     │ ✓ 成本最低     │ ✓ 长期收益     │
│ ✓ 操作简单     │ ✓ 政策鼓励     │ ✓ 减碳实质     │
│ ✓ 无方法学限制  │ ✓ 可抵消5%配额 │ ✓ 提升评级     │
│               │               │               │
│ 劣势           │ 劣势           │ 劣势           │
│ ✗ 成本高       │ ✗ 有5%上限     │ ✗ 回收周期长   │
│ ✗ 无减排贡献   │ ✗ 需方法学匹配  │ ✗ 需前期投入   │
│ ✗ 依赖碳价     │ ✗ 市场供应有限  │ ✗ 实施风险     │
│               │               │               │
│ [执行采购 →]   │ [执行采购 →]   │ [查看详情 →]   │
└───────────────┴───────────────┴───────────────┘
```

- 三张卡片横向排列，等宽
- 推荐卡片有绿色边框 `border-2 border-[#36d968]` + 顶部 ✅推荐 标签
- 推荐卡片背景微微发光 `shadow-[0_0_20px_rgba(54,217,104,0.2)]`
- 非推荐卡片 `border border-white/10 bg-white/5`
- 成本数字使用大字号 `text-2xl font-bold`，对比鲜明
- 点击"执行"按钮：
  - 买配额 → 弹出交易确认弹窗（模拟）
  - 买CCER → 弹出CCER采购弹窗（模拟）
  - 实施减排 → 跳转 AI 减排路径页面 `/ai-center?tab=reduction`
- 卡片 hover 时微微上浮 `y: -4, transition: spring, stiffness: 300`

### 2.3 最优策略推荐 Banner

```
┌─────────────────────────────────────────────────┐
│ 💡 推荐策略：买CCER抵销                             │
│                                                   │
│ 相比直接购买配额，采用CCER抵销可节省 ¥1,053,750      │
│ （降幅 96.5%），但需注意CCER抵销不超过配额的5%上限。  │
│                                                   │
│ [执行CCER采购 →]    [查看计算过程]                   │
└─────────────────────────────────────────────────┘
```

- 固定在策略卡片下方
- 绿色渐变背景 `bg-gradient-to-r from-[#36d968]/20 to-transparent`
- 节省金额用大字号 + 绿色高亮
- "查看计算过程"点击展开详细计算面板

---

## 模块3：履约任务看板（右侧栏）

### 3.1 年度履约进度

```
┌─────────────────────────┐
│ 年度履约进度               │
│ ████████░░░░░░ 3/6       │
│ 已完成 3  进行中 1  待开始 2 │
└─────────────────────────┘
```

- 进度条：已完成部分绿色 `#36d968`，未完成灰色
- 下方三个小数字：已完成（绿）/ 进行中（蓝）/ 待开始（灰）

### 3.2 任务卡片列表

```
┌─────────────────────────┐
│ ⚠️ 月度数据上报            │
│ 截止: 2026-07-31          │
│ ⏰ 剩余 8 天              │
│ 责任人: 李工               │
│ ████████░░ 80%            │
│ [完成] [转派]              │
├─────────────────────────┤
│ ✅ 配额清缴报告            │
│ 截止: 2026-10-31          │
│ ⏰ 剩余 99 天             │
│ 责任人: 张老师             │
│ ██████░░░░ 60%            │
│ [查看详情]                 │
├─────────────────────────┤
│ 🔴 年度核查准备            │
│ 截止: 2026-06-30          │
│ ⏰ 已逾期 23 天！          │
│ 责任人: 王主任             │
│ ██████████ 100%           │
│ [处理逾期]                 │
└─────────────────────────┘
```

- 任务卡片按截止日期排序（最紧迫的在上面）
- 状态标签颜色：
  - 已完成：绿色 `#36d968`
  - 进行中：蓝色 `#3488ff`
  - 待开始：灰色
  - 逾期：红色 `#ff3333` + 脉冲动画
  - 风险（<15天未完成）：橙色 `#ff7b25`
- 进度条在卡片底部，细线样式
- 点击任务展开详情弹窗
- "完成"按钮点击后状态切换，卡片有完成动画（勾号划入）
- "转派"按钮弹出人员选择下拉

---

## 模块4：底部通栏模块（Tab切换）

### 4.1 月度排放vs配额

- ECharts 柱状图（占满底部宽度）
- 蓝色柱：配额，灰色柱：排放
- 差额用红色/绿色小箭头标注
- 年度汇总行：总配额/总排放/年度差值
- 支持切换视图：月度/季度

### 4.2 交易记录

- Ant Design Table 组件
- 列：日期 | 类型(买/卖) | 产品(CEA/CCER) | 数量 | 单价 | 总额 | 对手方 | 状态
- 买入红色 ↑，卖出绿色 ↓
- 支持分页（每页10条）
- 总计行：年度买入总量/卖出总量/净交易成本
- API: `GET /api/carbon/trades?year=2026&page=1`

### 4.3 碳资产增值

```
┌─────────────────────────────────────────────────────────┐
│ 碳资产增值速览                                              │
│                                                           │
│ 盈余配额: 2,150 tCO₂     当前估值: ¥182,750               │
│ 碳价趋势: ↑ 近30天+12%                                     │
│                                                           │
│ ┌─────────────────┐  ┌──────────────────┐               │
│ │ 💡 出售时机建议    │  │ 🏦 碳金融工具      │               │
│ │                   │  │                   │               │
│ │ 建议Q4出售        │  │ ·碳配额质押融资    │               │
│ │ 预期碳价: 105元/t │  │  预估额度: ¥50万   │               │
│ │ 预期收益: ¥225,750│  │                   │               │
│ │                   │  │ ·CCER项目开发     │               │
│ │ [查看详情]        │  │  预估额度: ¥30万   │               │
│ └─────────────────┘  │                   │               │
│                       │ [申请融资]         │               │
│                       └──────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

- 估值数字实时更新（跟随碳价变化）
- 碳价趋势用迷你折线图显示近30天走势
- 金融工具卡片点击进入申请流程（模拟）

### 4.4 合规雷达

```
┌─────────────────────────────────────────────────────────┐
│ 合规雷达                                        合规评分: 78/100 │
│                                                           │
│ ┌─政策变更时间线──────────────────────────────────┐       │
│ │ 📋 2026-04  江苏省公共建筑碳排放限额指南(试行)    │       │
│ │    影响: 学校建筑限额管理                        │       │
│ │    操作: 更新限额参数 →                         │       │
│ │                                                 │       │
│ │ 📋 2026-01  上海碳市场深化改行动方案(2026-2030)  │       │
│ │    影响: 2028年起高校纳入配额管理                │       │
│ │    操作: 查看影响分析 →                         │       │
│ └─────────────────────────────────────────────────┘       │
│                                                           │
│ ┌─合规自检清单──────────────────────────────────┐         │
│ │ ✅ 计量器具合规    ✅ 核算方法合规               │         │
│ │ ✅ 数据报送及时    ⚠️ 配额管理报告待提交          │         │
│ │ ❌ 年度核查未完成   ✅ 碳排放因子已更新           │         │
│ │ [修复不合规项 →]                                │         │
│ └─────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

- 政策时间线：垂直时间轴，新政策在上
- 自检清单：红绿灯样式（✅绿/⚠️橙/❌红）
- 合规评分：环形进度图
- "修复不合规项"点击跳转对应页面

### 4.5 核查准备中心

```
┌─────────────────────────────────────────────────────────┐
│ 核查准备中心                                   准备度: 65/100 │
│                                                           │
│ ┌─MRV数据溯源链────────────────────────────────┐         │
│ │ 📊 全校年度排放: 21,500 tCO₂                   │         │
│ │  └── 📋 活动数据: 用电量 27,388,000 kWh         │         │
│ │      └── 🔌 计量器具: 智能电表 #E-001~#E-156   │         │
│ │          └── 📄 原始凭证: 电费账单 2026-01~12  │         │
│ │ 状态: ✅ 已验证 (156/156 电表)                  │         │
│ └────────────────────────────────────────────────┘         │
│                                                           │
│ ┌─核查清单自检─────────────────────────────────┐         │
│ │ ✅ 排放源清单完整    ✅ 活动数据齐全             │         │
│ │ ✅ 排放因子正确      ⚠️ 3栋楼缺失原始凭证       │         │
│ │ [下载缺失清单] [一键生成核查包]                  │         │
│ └────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

- MRV溯源链：树形结构，可逐级展开/折叠
- 每个节点显示验证状态
- 核查清单：与合规雷达自检清单共享数据源
- "一键生成核查包"导出 PDF/Excel（模拟）
- API: `POST /api/carbon/audit/export?format=pdf`

---

## 交互规范

### 全局交互

| 交互 | 触发 | 动画 |
|---|---|---|
| 页面加载 | 首次进入 | 骨架屏 → 数据淡入，`staggerChildren: 0.1` |
| 年度切换 | 选择器变化 | 全页面数据刷新，数字滚动动画 |
| 碳价滑块 | 拖动 | 三策略卡片实时重算，成本数字滚动 |
| 策略卡片 hover | 鼠标移入 | 卡片上浮 `y: -4`，阴影加深 |
| 任务完成 | 点击"完成" | 勾号动画 → 卡片状态变绿 → 进度条更新 |
| 底部Tab切换 | 点击Tab | AnimatePresence 左右滑动切换 |

### 性能要求

| 指标 | 目标值 |
|---|---|
| 首屏加载 | ≤ 2.5s |
| 滑块响应 | ≤ 100ms（本地计算），API debounce 300ms |
| Tab切换 | ≤ 200ms |
| 数字滚动 | 1.2s easeOut |
| 图表渲染 | ≤ 500ms |
| 内存占用 | ≤ 150MB |

---

## Mock 数据规格

| 数据项 | 值 | 说明 |
|---|---|---|
| 年度 | 2026 | 后台配置，禁止硬编码 |
| 总配额 | 21,500 tCO₂ | 基于历史强度法分配 |
| 已消耗 | 16,850 tCO₂ | 截至7月，实时从碳核算引擎同步 |
| 剩余 | -350 tCO₂ | 亏损状态 |
| 碳价 | 85 元/tCO₂ | 全国碳市场最新价（配置更新） |
| 预测排放 | 21,500 tCO₂ | AI预测全年排放 |
| 缺口 | 12,850 tCO₂ | 预测排放 - (总配额-已消耗) |
| CCER价格 | 60 元/tCO₂ | 低于配额价 |
| CCER抵销上限 | 642.5 tCO₂ | 配额×5% |
| 减排项目投资 | 800,000 元 | 光伏+节能改造综合方案 |
| 减排回收期 | 38 个月 | — |
| 年减排量 | 500 tCO₂ | — |
| 履约任务数 | 6 | 3完成/1进行中/2待开始 |

---

## 与其他页面联动

| 联动页面 | 数据流 | 跳转方式 |
|---|---|---|
| 碳核算工作台（页面3） | 核算结果 → 配额消耗数据 | 自动同步 |
| AI智能分析中心 → 减排路径 | 策略C详情 → 减排措施清单 | 点击"查看详情"跳转 `/ai-center?tab=reduction` |
| 合规与披露视图（页面1D） | 合规自检清单共享 | 双向同步 |
| 领导组驾驶舱（页面1A） | 配额执行率 → 校级宏观 | 自下而上汇总 |
| 能源监测（页面2A） | 实时能耗 → 排放预测 | 数据源共享 |

---

## 验收标准

| 编号 | 验收标准 |
|---|---|
| CA-01 | **Given** 配额台账 **When** 页面加载 **Then** 总配额/已消耗/剩余三个数字正确显示，剩余为负时红色+脉冲动画 |
| CA-02 | **Given** 碳价滑块 **When** 用户拖动 **Then** 三策略成本实时重算，推荐策略高亮，数字滚动动画流畅 |
| CA-03 | **Given** 三策略对比 **When** 展开任一策略 **Then** 显示详细计算过程 + 执行按钮 |
| CA-04 | **Given** 履约任务 **When** 点击"完成" **Then** 状态切换为已完成，进度条更新，卡片有完成动画 |
| CA-05 | **Given** 逾期任务 **When** 存在逾期 **Then** 红色高亮+脉冲动画+逾期天数显示 |
| CA-06 | **Given** 碳资产增值 **When** 碳价变化 **Then** 估值数字实时更新，出售建议同步变化 |
| CA-07 | **Given** 合规雷达 **When** 存在不合规项 **Then** 红色标记+修复跳转链接可用 |
| CA-08 | **Given** 核查准备 **When** 展开MRV链 **Then** 树形结构正确展开，每级节点显示验证状态 |
| CA-09 | **Given** 年度切换 **When** 切换到不同年度 **Then** 全页面数据刷新，数字滚动过渡 |
| CA-10 | **Given** 底部Tab **When** 切换模块 **Then** 内容左右滑动切换，动画流畅≤200ms |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
