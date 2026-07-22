---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 920728846233689_0/project_7664630038792257838-files/AI智能分析中心_Coding_Prompt.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 920728846233689#1784705461024
    ReservedCode2: ""
---
# AI 智能分析中心 — Coding Prompt

> 直接喂给前端开发/AI编程工具的完整页面实现规格。
> 四个模块：预测性分析 / 实时监控异常报警 / AI减排路径优化 / 政策咨询AI助手

---

## 页面定位

路由：`/ai-center`
组件名：`<AICenter />`
用户：全体管理层（院长/后勤/能源/碳管理员）
核心任务：AI驱动预测预警、异常归因、减排决策、政策合规

---

## 全局约束（与四层控制塔共享）

| 约束项 | 值 |
|---|---|
| 背景色 | `#081028`（深蓝） |
| 主色 | `#3488ff`（浅蓝） |
| 告警色 | `#ff7b25`（橙） |
| 达标色 | `#36d968`（绿） |
| 危险色 | `#ff3333`（红） |
| 辅助紫色 | `#9b6bff` |
| 字体 | Noto Sans SC，数字加粗放大，辅助文字 `#8c8c8c` |
| 水印 | 全页面「Demo模拟数据 仅课题演示」半透明 |
| 布局 | 双栏式：左32% + 右68%（无3D场景，全宽数据面板） |
| 图表 | ECharts 5 |
| UI框架 | Ant Design 5.x + Tailwind CSS |
| 状态管理 | Zustand |
| 动画库 | framer-motion（模块切换/面板展开/数据流动） |
| 最低分辨率 | 1366×768 |

---

## 页面整体结构

```
┌──────────────────────────────────────────────────────────────────┐
│ 顶部 60px 模块Tab切换栏（横贯全宽，毛玻璃底）                       │
│ [🔮 预测性分析] [🚨 异常监控] [🌿 减排路径] [🤖 政策助手]          │
├────────────────────────────────┬─────────────────────────────────┤
│ 左侧 32%                       │ 右侧 68%                        │
│ ┌──────────────────────────┐   │ ┌─────────────────────────────┐ │
│ │ 模块专属左侧面板(随Tab切换) │   │  模块专属右侧主面板(随Tab切换)  │ │
│ │                            │   │                               │ │
│ │ 预测：预测曲线+校历标注     │   │  预测：情景模拟器+对比图        │ │
│ │ 监控：AI异常归因卡片列表    │   │  监控：事件时间线+影响评估       │ │
│ │ 减排：减排潜力量化排名      │   │  减排：路径甘特图+成本对比       │ │
│ │ 政策：对话窗口              │   │  政策：合规矩阵+政策变更         │ │
│ └──────────────────────────┘   │ └─────────────────────────────┘ │
├────────────────────────────────┴─────────────────────────────────┤
│ 底部 72px 操作按钮栏（随Tab切换按钮组）                             │
└──────────────────────────────────────────────────────────────────┘
```

**设计理念**：AI分析中心是纯数据智能页面，不使用3D场景。左栏放摘要/列表/对话等紧凑信息，右栏放大型图表/模拟器/甘特图等需要展示空间的内容。双栏布局让图表有充分宽度，视觉效果更专业。

### 模块切换交互

```typescript
// Tab切换动画：左右面板同步 slideLeft + fade
const MODULE_TABS = [
  { key: 'prediction', label: '预测性分析', icon: '🔮', color: '#3488ff' },
  { key: 'monitoring', label: '异常监控', icon: '🚨', color: '#ff7b25' },
  { key: 'reduction', label: '减排路径', icon: '🌿', color: '#36d968' },
  { key: 'policy', label: '政策助手', icon: '🤖', color: '#9b6bff' },
] as const;

type AIModule = typeof MODULE_TABS[number]['key'];
```

- Tab切换使用 framer-motion `AnimatePresence` + `type: 'spring', stiffness: 300, damping: 30`
- 左侧面板切换：旧面板向左滑出 `x: -20, opacity: 0`，新面板从右滑入 `x: 20 → 0, opacity: 0 → 1`
- 右侧主面板同步切换，使用相同的 slideLeft 动画
- Tab激活态：底部指示条（对应模块颜色）+ 文字高亮

---

## 模块1：预测性分析

### 左侧面板

#### 区域1.1：排放趋势预测

```typescript
interface PredictionCurve {
  period: '30d' | '60d' | '90d';
  historical: {
    date: string;          // YYYY-MM-DD
    emission: number;      // tCO₂
  }[];
  forecast: {
    date: string;
    predicted: number;     // 预测值
    upper95: number;       // 95%置信区间上界
    lower95: number;       // 95%置信区间下界
  }[];
  calendarEvents: {
    date: string;
    event: string;         // "寒假" | "国庆" | "考试周" ...
    impactFactor: number;  // 预计影响系数
  }[];
}
```

- ECharts折线图：历史实线 `#3488ff`，预测虚线 `#3488ff dashed`，置信区间半透明填充 `rgba(52, 136, 255, 0.15)`
- 校历事件用竖线标注 + 底部标签
- 顶部标注「AI 预测，仅供参考」水印文字
- 周期切换：30天/60天/90天 toggle，切换时图表 `animation.duration: 800ms`
- API：`GET /api/ai/prediction?period=30d|60d|90d`

#### 区域1.2：节假日调控预案卡片

```typescript
interface HolidayPlan {
  id: string;
  holidayName: string;       // "2026年暑假"
  startDate: string;
  endDate: string;
  daysBeforeEvent: number;   // 距假期天数
  estimatedSaving: {
    energy: number;          // 预计节能 tce
    carbon: number;          // 预计减排 tCO₂
    cost: number;            // 预计节省费用(元)
  };
  actions: string[];         // ["空调关闭", "照明减半", "实验室最小供电"]
  status: 'auto_generated' | 'edited' | 'confirmed';
}
```

- 卡片列表，每张卡片展示假期名+倒计时+预计节能量
- 卡片右侧操作：编辑参数 | 确认预案 | 查看详情
- 距假期<30天自动高亮边框 `border: 1px solid #ff7b25`
- API：`GET /api/ai/holiday-plans?upcoming=true`

#### 区域1.3：超标预警热力日历

```typescript
interface RiskCalendarDay {
  date: string;
  riskLevel: 'safe' | 'watch' | 'warning' | 'danger';
  predictedEmission: number;
  targetRemaining: number;   // 剩余配额
  triggerReason?: string;    // "预计用电高峰+高温" 
}
```

- 热力日历（类GitHub贡献图），每格颜色按riskLevel映射
- 点击某天 → 右侧展开详情面板
- API：`GET /api/ai/risk-calendar?month=YYYY-MM`

#### 区域1.4：情景模拟器

```typescript
interface ScenarioConfig {
  id: string;
  name: string;              // "空调调高1°C" | "夜间断电扩大"
  color: string;             // 曲线颜色
  params: {
    key: string;             // "ac_temp_offset" | "night_power_cutoff_ratio"
    value: number;
    unit: string;
    min: number;
    max: number;
    step: number;
  }[];
}

interface ScenarioResult {
  scenarioId: string;
  predictedCurve: { date: string; emission: number }[];
  totalSaving: number;       // 总减排量 tCO₂
  totalCostImpact: number;   // 费用影响(元)
}
```

- 底部滑动条调整参数，曲线实时刷新（debounce 300ms）
- 支持同时开启2-3种情景对比（多曲线叠加）
- 每条曲线使用不同颜色+标签
- API：`POST /api/ai/scenario-simulate`（body: ScenarioConfig[]）→ ScenarioResult[]

### 右侧主面板（预测模式）

- **情景模拟器大面板**：占据右侧主区域，包含参数调节区（滑动条组）+ 多策略对比曲线图（ECharts，宽幅）
- **预测详情弹窗**：点击高风险日历格子 → 弹出Modal展示预测排放量、主要驱动因素、建议措施
- **预案对比视图**：节假日预案卡片可并排对比（最多3个），展示节能/减排/费用差异柱状图

---

## 模块2：实时监控异常报警

### 左侧面板

#### 区域2.1：实时数据流大屏

```typescript
interface RealtimeDataStream {
  timestamp: string;         // ISO8601
  totalPower: number;        // kW
  totalWater: number;        // t/h
  totalHeat: number;         // GJ/h
  totalCarbon: number;       // tCO₂/h
  anomalyCount: number;      // 当前异常数
}

// WebSocket推送，5s间隔
```

- 4个数字翻牌器（Power/PushAnim风格），数字变化时平滑滚动
- 异常数用红色大数字 + 脉动动画（`animation: pulse 1.5s infinite`）
- 数据通过 WebSocket 实时更新

#### 区域2.2：AI异常归因卡片

```typescript
type AnomalyPattern = 'spike' | 'idle_run' | 'over_limit' | 'drift';
type SeverityLevel = 'blocking' | 'severe' | 'normal' | 'info';

interface AIAnomalyCard {
  id: string;
  pattern: AnomalyPattern;
  patternLabel: string;       // "用电突增" | "空载运行" | "超标排放" | "数据偏移"
  severity: SeverityLevel;
  buildingId: string;
  buildingName: string;
  deviceId?: string;
  deviceName?: string;
  detectedAt: string;        // ISO8601
  duration: string;          // "2h 15min"
  
  // AI归因分析
  aiConfidence: number;      // 0~1 AI识别置信度
  aiRootCause: string;       // "空调系统夜间未关闭，叠加室外温度异常升高"
  aiEvidence: {
    type: 'data' | 'calendar' | 'weather' | 'pattern';
    description: string;     // "该楼栋过去7天夜间能耗均值偏高240%"
  }[];
  
  // 影响量化
  impact: {
    extraEmission: number;   // 预计额外排放 tCO₂
    extraCost: number;       // 预计额外费用(元)
    affectedArea: string;    // "教学楼A 全楼"
    affectedPeople?: number;
  };
  
  // 建议动作
  suggestedActions: {
    action: string;          // "立即关闭非教学区域空调"
    linkToModule: 'reduction' | 'l3'; // 跳转目标
  }[];
  
  status: 'new' | 'acknowledged' | 'processing' | 'resolved';
}
```

- 卡片按 severity 排序：blocking→severe→normal→info
- 每张卡片展开后显示AI归因（可折叠）
- severity颜色映射：
  - blocking: `#ff3333` 红色背景条
  - severe: `#ff7b25` 橙色背景条
  - normal: `#ffc107` 黄色背景条
  - info: `#3488ff` 蓝色背景条
- AI置信度用环形小图展示（<60%灰色，60-80%黄色，>80%绿色）
- 卡片操作按钮：确认 | 转工单(→L3) | 转减排建议(→模块3) | 忽略
- API：`GET /api/ai/anomalies?severity=&status=`

#### 区域2.3：异常事件时间线

```typescript
interface AnomalyTimelineEvent {
  id: string;
  anomalyId: string;
  timestamp: string;
  phase: 'detected' | 'confirmed' | 'dispatched' | 'processing' | 'resolved' | 'closed';
  phaseLabel: string;        // "AI识别" | "人工确认" | "已派单" | "处理中" | "已解决" | "已关闭"
  actor: string;             // "AI系统" | "张三(后勤)" | "系统自动"
  detail: string;
}
```

- 垂直时间线，左侧圆点+连线，右侧事件内容
- 圆点颜色按phase：检测=蓝, 确认=橙, 派单=紫, 处理=黄, 解决=绿, 关闭=灰
- 支持按 anomalyId 筛选
- 点击事件 → 展开AI识别依据详情
- API：`GET /api/ai/anomaly-timeline/:anomalyId`

#### 区域2.4：告警推送中心

```typescript
interface AlertNotification {
  id: string;
  anomalyId: string;
  title: string;
  message: string;
  channel: 'in_app' | 'sms' | 'email';
  sentAt: string;
  read: boolean;
  targetPerson: string;
}
```

- 站内消息列表，未读加粗 + 蓝色圆点
- 支持标记已读/全部已读
- 短信/邮件推送标注「P2阶段实现」灰色标签
- API：`GET /api/ai/notifications?read=false`

### 右侧主面板（监控模式）

- **异常事件时间线大视图**：占据右侧主区域，垂直时间线 + 每条异常展开详情（AI归因、证据链、影响量化）
- **异常详情抽屉**：点击异常卡片 → 右侧滑出Drawer，展示完整时间线 + AI识别依据 + 影响范围
- **异常统计大屏**：顶部4个指标卡（今日异常数/未处理/平均响应时间/已解决率）+ 异常趋势折线图（近7天）
- 点击左侧异常卡片 → 右侧时间线自动滚动定位到对应事件

### 与L3双向联动

```typescript
// AI中心 → L3：告警同步
interface AlarmSyncPayload {
  source: 'ai_center';
  anomalyId: string;
  category: 'energy' | 'equipment' | 'environment' | 'data';
  severity: SeverityLevel;
  buildingId: string;
  description: string;
  suggestedAction: string;
}

// L3 → AI中心：手动录入异常同步
// 通过 Zustand store + WebSocket 实现双向同步
```

---

## 模块3：AI减排空间与路径优化

### 左侧面板

#### 区域3.1：减排潜力量化排名（气泡图）

```typescript
interface ReductionBubble {
  buildingId: string;
  buildingName: string;
  x: number;                 // 当前排放强度 kgCO₂/m²
  y: number;                 // 减排潜力 %（基准线差距）
  size: number;              // 建筑面积（气泡大小）
  category: 'teaching' | 'dorm' | 'lab' | 'canteen' | 'admin' | 'gym';
  topIssues: string[];       // ["空调COP偏低", "照明功率密度超标"]
  estimatedReduction: number; // 预估年减排 tCO₂
}
```

- ECharts气泡图：X轴=排放强度，Y轴=减排潜力，气泡大小=面积
- 颜色按category分类（6色）
- 悬浮显示：建筑名+TOP问题+预估减排量
- 点击气泡 → 右侧弹出措施详情Drawer
- 维度切换：建筑/院系/能源类型 toggle
- API：`GET /api/ai/reduction-potential?dimension=building|department|energy_type`

#### 区域3.2：减排路径优化（甘特图）

```typescript
interface ReductionMeasure {
  id: string;
  name: string;              // "空调系统变频改造" | "LED照明替换"
  category: 'equipment' | 'operation' | 'technology' | 'behavior';
  buildingId?: string;
  
  // 实施参数
  investment: number;        // 投资(万元)
  paybackMonths: number;     // 回收期(月)
  annualReduction: number;   // 年减排量 tCO₂
  difficulty: 'easy' | 'medium' | 'hard';
  durationMonths: number;    // 实施周期(月)
  
  // 约束
  prerequisites: string[];   // ["完成空调检修"]
  risks: string[];           // ["施工期间影响教学"]
  
  // MRV
  mrvMethod: string;         // "电表差值法"
  baseline: string;          // "改造前12个月均值"
}

interface OptimizationPath {
  measures: (ReductionMeasure & {
    startMonth: number;      // 第N月开始
    endMonth: number;        // 第N月结束
    priority: number;        // 排序优先级
  })[];
  totalInvestment: number;
  totalReduction: number;
  avgPaybackMonths: number;
  budgetConstraint: number;  // 用户设置的预算上限
}
```

- 甘特图展示推荐实施顺序（ECharts自定义系列 或 专用Gantt组件）
- 每个measure条颜色按category
- 用户可拖动约束条件滑动条（预算上限、最短回收期），系统重新计算 → 甘特图动画重排
- 底部汇总：总投资/总减排/平均回收期
- API：`POST /api/ai/reduction-optimize`（body: { constraints: { budget, minPayback } })

#### 区域3.3：碳配额成本对比

```typescript
interface CarbonCostScenario {
  name: string;              // "先减排后采购" | "直接采购配额"
  emissionReduction: number; // 减排量 tCO₂
  quotaPurchase: number;     // 配额购买量 tCO₂
  offsetPurchase: number;    // CCER抵销量 tCO₂
  totalCost: number;         // 总成本(万元)
  costBreakdown: {
    item: string;            // "减排投资" | "配额购买" | "CCER购买" | "核查费用"
    cost: number;
  }[];
}
```

- 双柱对比图 + 堆叠成本分解
- 两个方案卡片并排，高亮推荐方案（绿色边框）
- API：`GET /api/ai/carbon-cost-compare?year=2026`

#### 区域3.4：措施详情面板（点击展开）

```typescript
interface MeasureDetail {
  measure: ReductionMeasure;
  implementationSteps: {
    step: number;
    title: string;
    duration: string;
    responsible: string;
  }[];
  historicalCases?: {
    university: string;
    result: string;
    reductionAchieved: number;
  }[];
}
```

- 右侧抽屉面板（Drawer），点击气泡或甘特图条目触发
- 实施步骤用带图标的步骤条展示
- 历史案例用卡片列表

### 右侧主面板（减排模式）

- **路径甘特图大视图**：占据右侧主区域，横轴=月份，纵轴=措施，每条bar颜色按category分类，支持缩放/拖拽
- **成本对比视图**：甘特图下方并排双方案对比柱状图（先减排后采购 vs 直接采购），堆叠成本分解
- **投资-减排曲线**：右上角悬浮面板展示投资-减排Pareto前沿曲线，标注当前方案位置
- 点击气泡图 → 右侧Drawer滑出该楼栋措施列表 + 预期效果对比

---

## 模块4：政策咨询与合规AI助手

### 左侧面板

#### 区域4.1：对话式交互窗口

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;           // Markdown格式
  timestamp: string;
  sources?: {                // AI回答的引用来源
    title: string;           // "DB11/T 1785-2020 第4.2条"
    type: 'policy' | 'standard' | 'config' | 'data';
    refId: string;           // 可跳转的文档/条款ID
  }[];
  confidence?: number;       // AI回答置信度
}

interface QuickQuestion {
  id: string;
  category: 'report' | 'accounting' | 'compliance' | 'standard';
  question: string;          // "月度报告截止日期"
  icon: string;
}
```

- 聊天气泡UI：用户右侧蓝色气泡，AI左侧深色气泡
- AI回答支持Markdown渲染（表格/列表/代码块/粗体）
- 每条AI回答底部显示引用来源标签（可点击查看原文）
- 打字机效果：AI回答逐字显示，`typingSpeed: 30ms/char`
- 底部输入框 + 发送按钮，支持Enter发送
- 快捷问题模板：顶部横排标签，点击自动填入输入框并发送
- 系统提示：对话顶部显示「AI 回答仅供参考，请以正式政策文件为准」

预设快捷问题（Demo数据）：

```typescript
const QUICK_QUESTIONS: QuickQuestion[] = [
  { id: 'q1', category: 'report', question: '本月月度报告截止日期是什么时候？', icon: '📅' },
  { id: 'q2', category: 'accounting', question: '绿电凭证怎么核算？', icon: '📊' },
  { id: 'q3', category: 'compliance', question: '配额清缴流程是什么？', icon: '📋' },
  { id: 'q4', category: 'standard', question: 'DB11/T 1785-2020 主要变化有哪些？', icon: '📖' },
  { id: 'q5', category: 'accounting', question: '教学楼A的排放核算用了哪个因子？', icon: '🔢' },
  { id: 'q6', category: 'compliance', question: '当前碳排放是否超标？', icon: '⚠️' },
];
```

API：
- 发送消息：`POST /api/ai/chat/send`（body: { message, conversationId, context })
- 获取历史：`GET /api/ai/chat/history?conversationId=xxx`
- Demo模式：预设20-30条QA匹配，未匹配时返回通用回复 + "建议查阅正式政策文件"

#### 区域4.2：合规检查红绿灯矩阵

```typescript
interface ComplianceCheckItem {
  id: string;
  category: 'report' | 'accounting' | 'quota' | 'disclosure';
  categoryLabel: string;     // "报告报送" | "核算方法" | "配额管理" | "信息披露"
  item: string;              // "月度排放报告按时提交"
  status: 'compliant' | 'at_risk' | 'non_compliant';
  statusLabel: string;       // "合规" | "存在风险" | "不合规"
  dueDate?: string;
  issueDetail?: string;      // 不合规时的说明
  fixAction?: string;        // 修复建议
  fixLink?: string;          // 跳转至修复页面路由
}
```

- 矩阵表格：行=合规项，列=状态（红绿灯图标）
- 合规 🟢 `#36d968` / 风险 🟡 `#ffc107` / 不合规 🔴 `#ff3333`
- 点击不合规项 → 弹出修复建议 + 一键跳转至对应模块
- API：`GET /api/ai/compliance-check?year=2026`

#### 区域4.3：政策变更提醒

```typescript
interface PolicyChangeAlert {
  id: string;
  policyName: string;        // "北京市碳排放权交易管理办法(2026修订)"
  effectiveDate: string;
  impactAreas: {
    area: string;            // "配额分配" | "MRV要求" | "报告格式"
    impact: string;          // "需重新核算Scope1排放"
    affectedModule: string;  // 受影响的系统模块
    actionRequired: string;  // "更新核算因子配置"
  }[];
  daysUntilEffective: number;
}
```

- 卡片列表，每张卡片展示政策名+生效倒计时+影响列表
- 距生效<90天高亮橙色边框
- 点击影响项 → 跳转至受影响模块
- API：`GET /api/ai/policy-changes?upcoming=true`

### 右侧主面板（政策模式）

- **合规红绿灯矩阵大视图**：占据右侧主区域，矩阵表格（行=合规项，列=状态），支持展开每条目的详情+修复建议
- **政策时间线**：合规矩阵下方展示政策变更历史 + 未来生效倒计时
- **AI对话增强**：对话窗口在左侧，右侧实时展示对话中引用的政策原文片段（联动高亮）
- 点击不合规项 → 右侧弹出修复操作面板 + 一键跳转对应模块

---

## 全局状态（Zustand Store）

```typescript
interface AICenterStore {
  // 当前模块
  activeModule: AIModule;

  // ===== 模块1：预测 =====
  predictionPeriod: '30d' | '60d' | '90d';
  predictionCurve: PredictionCurve | null;
  holidayPlans: HolidayPlan[];
  riskCalendar: RiskCalendarDay[];
  scenarios: { configs: ScenarioConfig[]; results: ScenarioResult[] };

  // ===== 模块2：监控 =====
  realtimeStream: RealtimeDataStream;
  anomalies: AIAnomalyCard[];
  anomalyTimelines: Record<string, AnomalyTimelineEvent[]>;
  notifications: AlertNotification[];
  wsConnection: WebSocket | null;

  // ===== 模块3：减排 =====
  reductionBubbles: ReductionBubble[];
  reductionPath: OptimizationPath | null;
  costScenarios: CarbonCostScenario[];
  selectedMeasure: ReductionMeasure | null;
  optimizationConstraints: { budget: number; minPayback: number };

  // ===== 模块4：政策 =====
  chatMessages: ChatMessage[];
  conversationId: string | null;
  complianceChecks: ComplianceCheckItem[];
  policyChanges: PolicyChangeAlert[];
  isTyping: boolean;

  // ===== 右侧面板状态 =====
  rightPanelDrawer: { type: string; data: any } | null; // 右侧Drawer内容

  // ===== Actions =====
  switchModule: (module: AIModule) => void;
  
  // 模块1
  fetchPrediction: (period: '30d' | '60d' | '90d') => void;
  runScenario: (configs: ScenarioConfig[]) => void;
  
  // 模块2
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  acknowledgeAnomaly: (id: string) => void;
  convertToWorkOrder: (anomalyId: string) => void;
  
  // 模块3
  fetchReductionPotential: (dimension: string) => void;
  optimizePath: (constraints: { budget: number; minPayback: number }) => void;
  selectMeasure: (measure: ReductionMeasure | null) => void;
  
  // 模块4
  sendChatMessage: (message: string) => void;
  fetchComplianceChecks: () => void;
  
  // 右侧面板
  openDrawer: (type: string, data: any) => void;
  closeDrawer: () => void;
}
```

---

## 组件树

```
<AICenter>
├── <TopTabBar>                           // 顶部模块Tab切换
│   ├── <TabItem />                       // 每个Tab（×4）
│   └── <ActiveIndicator />              // 底部滑动指示条
│
├── <LeftPanel>                           // 左侧26%
│   ├── <AnimatePresence mode="wait">    // 模块切换动画容器
│   │
│   │   {/* 模块1 */}
│   │   <PredictionPanel key="prediction">
│   │   │   ├── <PredictionCurveChart />     // 排放趋势预测
│   │   │   ├── <HolidayPlanList />          // 节假日预案卡片
│   │   │   │   └── <HolidayPlanCard />
│   │   │   ├── <RiskHeatCalendar />         // 超标预警热力日历
│   │   │   └── <ScenarioSimulator />        // 情景模拟器
│   │   │       ├── <ScenarioToggle />       // 情景开关
│   │   │       ├── <ParamSlider />          // 参数滑动条
│   │   │       └── <CompareChart />         // 对比曲线图
│   │   │
│   │   │   {/* 模块2 */}
│   │   │   <MonitoringPanel key="monitoring">
│   │   │   │   ├── <RealtimeStreamDisplay />    // 实时数据翻牌器
│   │   │   │   │   └── <FlipNumber />           // 数字翻牌动画
│   │   │   │   ├── <AnomalyCardList />          // AI异常归因卡片
│   │   │   │   │   └── <AnomalyCard>            // 每张卡片
│   │   │   │   │       ├── <SeverityBar />
│   │   │   │   │       ├── <AIRootCause />      // 可折叠AI归因
│   │   │   │   │       ├── <ImpactSummary />
│   │   │   │   │       └── <ActionButtons />    // 确认/转工单/转建议/忽略
│   │   │   │   ├── <AnomalyTimeline />          // 事件时间线
│   │   │   │   │   └── <TimelineEvent />
│   │   │   │   └── <NotificationList />         // 告警推送中心
│   │   │   │
│   │   │   │   {/* 模块3 */}
│   │   │   │   <ReductionPanel key="reduction">
│   │   │   │   │   ├── <ReductionBubbleChart />    // 减排潜力气泡图
│   │   │   │   │   ├── <ReductionGantt />          // 路径甘特图
│   │   │   │   │   │   └── <GanttBar />
│   │   │   │   │   ├── <ConstraintSliders />       // 约束条件调节
│   │   │   │   │   ├── <CostCompareChart />        // 碳配额成本对比
│   │   │   │   │   └── <MeasureDrawer />           // 措施详情抽屉
│   │   │   │   │
│   │   │   │   │   {/* 模块4 */}
│   │   │   │   │   <PolicyPanel key="policy">
│   │   │   │   │   │   ├── <ChatWindow>                // 对话窗口
│   │   │   │   │   │   │   ├── <QuickQuestions />      // 快捷问题标签
│   │   │   │   │   │   │   ├── <MessageList>           // 消息列表
│   │   │   │   │   │   │   │   ├── <UserBubble />
│   │   │   │   │   │   │   │   └── <AssistantBubble>
│   │   │   │   │   │   │   │       ├── <MarkdownRenderer />
│   │   │   │   │   │   │   │       └── <SourceTags />  // 引用来源标签
│   │   │   │   │   │   │   └── <ChatInput />           // 输入框+发送
│   │   │   │   │   │   ├── <ComplianceMatrix />        // 合规红绿灯矩阵
│   │   │   │   │   │   │   └── <ComplianceRow />
│   │   │   │   │   │   └── <PolicyChangeList />        // 政策变更提醒
│   │   │   │   │   │       └── <PolicyChangeCard />
│   │   │
│   ├── </AnimatePresence>
│
├── <RightPanel>                          // 右侧68%主面板
│   └── <AnimatePresence mode="wait">
│       ├── <PredictionRight key="prediction">
│       │   ├── <ScenarioSimulatorPanel />     // 情景模拟器大面板
│       │   ├── <CompareChart />               // 多策略对比曲线
│       │   └── <PlanComparisonView />         // 预案对比视图
│       │
│       ├── <MonitoringRight key="monitoring">
│       │   ├── <AnomalyStatsBar />            // 顶部4指标卡+趋势图
│       │   ├── <AnomalyTimelineView />        // 事件时间线大视图
│       │   └── <AnomalyDetailDrawer />        // 异常详情抽屉
│       │
│       ├── <ReductionRight key="reduction">
│       │   ├── <ReductionGantt />             // 路径甘特图
│       │   ├── <CostCompareChart />           // 成本对比柱状图
│       │   ├── <ParetoFrontCurve />           // 投资-减排前沿曲线
│       │   └── <MeasureDrawer />              // 措施详情抽屉
│       │
│       └── <PolicyRight key="policy">
│           ├── <ComplianceMatrixFull />       // 合规矩阵大视图
│           ├── <PolicyTimeline />             // 政策时间线
│           └── <PolicyRefHighlight />         // 引用原文联动高亮
│
├── <BottomBar>                           // 底部72px
│   ├── {/* 预测模式 */}
│   │   <PeriodToggle />                  // 30/60/90天
│   │   <ScenarioQuickSwitch />
│   │
│   ├── {/* 监控模式 */}
│   │   <SeverityFilter />                // 严重级别筛选
│   │   <StatusFilter />                  // 状态筛选
│   │   <BulkAcknowledgeButton />
│   │
│   ├── {/* 减排模式 */}
│   │   <DimensionToggle />               // 建筑/院系/能源
│   │   <BudgetSlider />
│   │   <ExportReportButton />
│   │
│   └── {/* 政策模式 */}
│       <NewChatButton />
│       <ExportComplianceReportButton />
│
└── <Watermark />                          // 全页面水印
```

---

## API端点汇总

### 模块1：预测性分析

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/ai/prediction` | GET | 获取排放预测曲线 `?period=30d\|60d\|90d` |
| `/api/ai/holiday-plans` | GET | 获取节假日预案 `?upcoming=true` |
| `/api/ai/holiday-plans/:id` | PUT | 修改预案参数并重新生成 |
| `/api/ai/risk-calendar` | GET | 获取超标预警日历 `?month=YYYY-MM` |
| `/api/ai/scenario-simulate` | POST | 情景模拟 `body: ScenarioConfig[]` |

### 模块2：实时监控异常报警

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/ai/anomalies` | GET | 获取异常列表 `?severity=&status=` |
| `/api/ai/anomalies/:id` | GET | 获取异常详情（含AI归因） |
| `/api/ai/anomalies/:id/acknowledge` | PUT | 确认异常 |
| `/api/ai/anomalies/:id/convert` | POST | 转工单(→L3) |
| `/api/ai/anomaly-timeline/:anomalyId` | GET | 获取事件时间线 |
| `/api/ai/notifications` | GET | 获取推送通知 `?read=false` |
| `/api/ai/notifications/read-all` | PUT | 全部标记已读 |
| `/ws/ai/realtime-stream` | WebSocket | 实时数据流推送（5s间隔） |

### 模块3：减排路径优化

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/ai/reduction-potential` | GET | 减排潜力数据 `?dimension=building\|department\|energy_type` |
| `/api/ai/reduction-optimize` | POST | 路径优化计算 `body: { constraints }` |
| `/api/ai/carbon-cost-compare` | GET | 碳配额成本对比 `?year=2026` |
| `/api/ai/measures/:id` | GET | 措施详情 |
| `/api/ai/measures/:id/steps` | GET | 实施步骤 |

### 模块4：政策咨询AI助手

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/ai/chat/send` | POST | 发送消息 `body: { message, conversationId }` |
| `/api/ai/chat/history` | GET | 获取对话历史 `?conversationId=` |
| `/api/ai/chat/new` | POST | 新建对话 |
| `/api/ai/compliance-check` | GET | 合规检查清单 `?year=2026` |
| `/api/ai/policy-changes` | GET | 政策变更提醒 `?upcoming=true` |

---

## Mock数据要点（Demo演示）

### 模块1 Mock
- 预测曲线：90天历史 + 90天预测，含校历事件（寒假1.15-2.20、考试周、国庆）
- 节假日预案：2条（暑假预案+国庆预案）
- 热力日历：当月30天，其中3天warning、1天danger
- 情景模拟：预设3种（空调调高1°C/夜间断电扩大/照明减半小时）

### 模块2 Mock
- 实时数据流：WebSocket模拟，5s刷新
- 异常卡片：8条（spike×2/idle_run×2/over_limit×2/drift×2）
- 时间线：每条异常4-6个事件节点
- 推送通知：12条（未读5条）

### 模块3 Mock
- 气泡图：23栋建筑，每栋有减排潜力数据
- 路径优化：预设8-12条标准措施库
- 成本对比：2个方案数据
- 标准措施库（预定义）：
  1. 空调系统变频改造
  2. LED照明全面替换
  3. 智能照明控制系统
  4. 建筑外窗隔热改造
  5. 屋顶光伏扩容
  6. 空气源热泵替换老旧锅炉
  7. 夜间定时断电策略
  8. 暑假集中维保
  9. 实验室空调温控优化
  10. 食堂炊具能效升级
  11. 中水回用系统
  12. 用电分项计量完善
  13. 行为节能宣传（人走灯灭）
  14. 电梯能量回收
  15. 绿化碳汇扩展

### 模块4 Mock
- 预设25条QA对，覆盖四类问题
- 合规检查：12项（8合规/2风险/2不合规）
- 政策变更：2条（1条距生效60天，1条距生效120天）
- 对话Demo：进入页面时自动发送欢迎消息 + 当前合规状态摘要

---

## 交互流畅度要求

| 交互类型 | 目标 | 实现方式 |
|---|---|---|
| Tab模块切换 | ≤ 300ms感觉流畅 | framer-motion spring动画 + 数据预加载 |
| 数据面板展开/折叠 | ≤ 400ms | AnimatePresence + height动画 |
| 图表数据更新 | ≤ 800ms | ECharts `animation.duration: 600` |
| 聊天气泡打字机 | 30ms/字 | requestAnimationFrame逐字渲染 |
| 数字翻牌器 | ≤ 500ms | CSS transform + transition |
| 异常卡片出现 | ≤ 300ms | 从左侧slideIn + fade |
| 气泡图点击 | ≤ 200ms | scale动画 + Drawer滑出 |
| 甘特图重排 | ≤ 800ms | layoutId动画过渡 |
| Drawer滑出 | ≤ 400ms | Ant Design Drawer + spring easing |

---

## 页面高级感设计要点

### 视觉层次
- **毛玻璃效果**：Tab栏 `backdrop-filter: blur(20px); background: rgba(8, 16, 40, 0.85)`
- **卡片微光边框**：`border: 1px solid rgba(52, 136, 255, 0.15)` + hover时 `border-color: rgba(52, 136, 255, 0.4)`
- **深度阴影**：卡片 `box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3)`
- **渐变强调**：重要数字使用 `linear-gradient(135deg, #3488ff, #9b6bff)` 渐变文字

### 动效设计
- **数据加载**：骨架屏 → 数据填充（非loading转圈）
- **模块切换**：左右面板同步淡出淡入，右侧图表区域使用 layoutId 平滑过渡
- **异常出现**：从左侧滑入 + 轻微弹跳 `type: 'spring', stiffness: 400`
- **图表更新**：曲线平滑变形（非重绘），ECharts setOption 动画
- **背景**：深蓝渐变 `linear-gradient(135deg, #081028, #0d1b3d)` + 微弱网格纹理

### 信息密度
- 左侧面板可折叠（每区域右上角折叠按钮）
- 卡片hover展开更多信息（如异常卡片hover显示AI置信度）
- Tab切换时预加载下一模块数据（后台静默请求）

### 无障碍
- 所有交互元素可Tab聚焦
- 告警颜色不仅靠色觉，同时用图标+文字区分
- 动画支持 `prefers-reduced-motion` 媒体查询

---

## 性能要求

| 指标 | 目标 |
|---|---|
| 首屏加载 | ≤ 2.5s |
| Tab切换体感 | ≤ 300ms |
| 图表交互(缩放/拖拽) | ≥ 30fps |
| WebSocket延迟 | ≤ 3s |
| 图表渲染 | ≤ 800ms |
| 聊天消息发送→AI回复 | ≤ 3s（Demo模拟） |
| 气泡图交互 | ≤ 200ms |
| 甘特图重排 | ≤ 800ms |
| 内存占用 | ≤ 150MB（无3D场景，更轻量） |

---

## 路由与跨模块联动

| 来源 | 跳转方式 | 参数 |
|---|---|---|
| L3告警 → AI中心模块2 | `navigate('/ai-center?module=monitoring&buildingId=xxx')` | 自动筛选该楼栋异常 |
| AI中心模块2 → L3工单 | `navigate('/tower/l3?from=ai-center&anomalyId=xxx')` | 携带异常ID创建工单 |
| AI中心模块2 → 模块3 | `setState({ activeModule: 'reduction', focusBuilding: buildingId })` | Tab切换+聚焦 |
| AI中心模块4 → L4合规 | `navigate('/tower/l4?tab=compliance')` | 跳转合规视图 |
| AI中心 → L1风险 | 自动推送 | AI识别异常同步至L1风险板块 |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
