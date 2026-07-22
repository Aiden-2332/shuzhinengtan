---
AIGC:
    Label: "1"
    ContentProducer: 001191110102MACQD9K64018705
    ProduceID: 920728846233689_0/project_7664630038792257838-files/L3_后勤组驾驶舱_Coding_Prompt.md
    ReservedCode1: ""
    ContentPropagator: 001191110102MACQD9K64028705
    PropagateID: 920728846233689#1784702450086
    ReservedCode2: ""
---
# L3 后勤组驾驶舱 — Coding Prompt

> 直接喂给前端开发/AI编程工具的完整页面实现规格。

---

## 页面定位

路由：`/tower/l3`
组件名：`<TowerL3 />`
用户：后勤运维团队
核心任务：能源监控、异常处置、设备管理、效率优化

---

## 全局约束（所有页面共享）

| 约束项 | 值 |
|---|---|
| 背景色 | `#081028`（深蓝） |
| 主色 | `#3488ff`（浅蓝） |
| 告警色 | `#ff7b25`（橙） |
| 达标色 | `#36d968`（绿） |
| 字体 | Noto Sans SC，数字加粗放大，辅助文字浅灰 |
| 水印 | 全页面「Demo模拟数据 仅课题演示」半透明 |
| 布局 | 三栏式：左26% + 中64% + 底80px |
| 3D引擎 | Three.js + @react-three/fiber |
| 图表 | ECharts 5 |
| UI框架 | Ant Design 5.x + Tailwind CSS |
| 状态管理 | Zustand |
| 最低分辨率 | 1366×768 |

---

## 页面结构

```
┌──────────────────────────────────────────────────────────┐
│ 左侧 26%               │ 中间 64%              │        │
│ ┌─────────────────┐    │                       │        │
│ │ 卡片1:能源四分项  │    │   3D 虚拟校园场景      │        │
│ ├─────────────────┤    │   (Three.js Canvas)    │        │
│ │ 卡片2:碳排放总览  │    │                       │        │
│ ├─────────────────┤    │   ┌───────────────┐    │        │
│ │ 卡片3:四类告警    │    │   │实时负荷悬浮面板│    │        │
│ │   +工单状态      │    │   │(左下角覆盖)   │    │        │
│ ├─────────────────┤    │   └───────────────┘    │        │
│ │ 卡片4:系统效率    │    │                       │        │
│ ├─────────────────┤    │   色阶图例(右下角固定)   │        │
│ │ 卡片5:仪表在线率  │    │                       │        │
│ ├─────────────────┤    │                       │        │
│ │ 卡片6:异常楼宇    │    │                       │        │
│ │  +设备警告       │    │                       │        │
│ └─────────────────┘    │                       │        │
├──────────────────────────────────────────────────────────┤
│ 底部 80px 操作按钮栏（横贯全宽）                          │
└──────────────────────────────────────────────────────────┘
```

---

## 左侧指标栏（6大卡片组）

### 卡片1：能源四分项总览

四个子卡片，每个展示：

```typescript
interface EnergySubCard {
  label: string;        // "用水量" | "用电量" | "供热量" | "综合能耗"
  unit: string;         // "t" | "kWh" | "GJ" | "tce"
  today: number;        // 当日值
  monthCumulative: number; // 本月累计
  yoy: number;          // 同比%，↑红(#ff3333) ↓绿(#36d968)
  mom: number;          // 环比%
  trend: 'up' | 'down'; // 趋势方向
}
```

- 综合能耗 = 各类能源 × 标煤折算系数（因子从API获取，禁止硬编码）
- 标煤折算系数API：`GET /api/config/coal-conversion-factors`
- 趋势箭头：↑红色、↓绿色，0.8rem小箭头紧跟数值
- 数据来源API：`GET /api/l3/energy-overview?date=YYYY-MM-DD`

### 卡片2：碳排放总览

```typescript
interface CarbonOverview {
  dailyEmission: number;     // 当日碳排放 tCO₂
  scope1Ratio: number;       // Scope1占比 (0~1)
  scope2Ratio: number;       // Scope2占比 (0~1)
  monthlyCumulative: number; // 本月累计 tCO₂
  annualTarget: number;      // 年度目标 tCO₂
  carbonIntensity: number;   // 碳强度 kgCO₂/m²
}
```

- Scope1/2占比用 ECharts 环形图（`chartType: 'pie', radius: ['60%', '80%']`）
- 年度目标进度条：`monthlyCumulative / annualTarget`，颜色按进度渐变（<70%绿/70-90%黄/>90%红）
- API：`GET /api/l3/carbon-overview?date=YYYY-MM-DD`

### 卡片3：四类告警 + 工单状态

```typescript
type AlarmCategory = 'energy' | 'equipment' | 'environment' | 'data';
type AlarmLevel = 'danger' | 'warning' | 'info';

interface AlarmCategoryCard {
  category: AlarmCategory;
  label: string;           // "能源异常" | "设备异常" | "环境异常" | "数据异常"
  iconColor: string;       // "#3488ff" | "#ff7b25" | "#9b6bff" | "#8c8c8c"
  count: number;           // 该类别告警数
  latestSummary: string;   // 最新一条摘要文本
  level: AlarmLevel;       // 最高级别
}

interface WorkOrderStats {
  pending: number;         // 待处理工单数
  overdue: number;         // 超时工单数（红色高亮显示）
}
```

四类告警的映射规则：

| category | 典型场景 | 自动派单→责任组 |
|---|---|---|
| energy | 用电突增、用水连续异常、燃气泄漏 | 能源管理组 |
| equipment | 设备故障、参数越限、维保到期 | 对应设备维保方 |
| environment | 温度/湿度/CO₂浓度超限 | 楼宇物业 |
| data | 仪表离线、数据缺失、采集延迟 | 信息化运维 |

超时阈值（后台可配置）：

| level | 超时阈值 | 升级动作 |
|---|---|---|
| danger | 30min | → 上级主管 |
| warning | 2h | → 上级主管 |
| info | 8h | → 上级主管 |

- API：`GET /api/l3/alarms?category=&level=`
- 派单API：`POST /api/l3/work-orders/dispatch`（告警触发时自动调用）
- 超时升级：后端定时任务，每5min扫描超时工单并升级

### 卡片4：系统运行效率

```typescript
interface SystemEfficiency {
  system: 'hvac' | 'boiler' | 'lighting';
  label: string;           // "空调与冷站" | "供热与锅炉" | "照明与动力"
  metrics: {
    name: string;          // 指标名
    value: number;         // 当前值
    threshold: number;     // 阈值
    isLow: boolean;        // 是否低效
  }[];
  lowEfficiencyCount: number; // 低效运行设备数
  lowEfficiencyTop5: {
    deviceName: string;
    efficiency: number;    // 效率值
    buildingId: string;
  }[];
}
```

低效判断标准（后台可配置阈值）：

| 系统 | 指标 | 低效条件 |
|---|---|---|
| 空调冷站 | COP | COP < 设计COP × 0.8 |
| 供热锅炉 | 热效率 | 热效率 < 85% 或 排烟温度 > 180℃ |
| 照明动力 | 功率密度/空载率 | 功率密度超标 或 夜间空载率 > 30% |

- 低效设备数量用红色大数字展示
- 点击展开TOP5列表，每项可点击→3D flyTo定位
- API：`GET /api/l3/system-efficiency`

### 卡片5：仪表在线率 + 数据完整率

```typescript
interface MeterStats {
  onlineRate: number;        // 在线率 (0~1)
  dataCompleteness: number;  // 数据完整率 (0~1)
  totalMeters: number;
  onlineMeters: number;
  offlineTop5: {
    meterName: string;
    location: string;        // 位置描述
    offlineDuration: string; // "2h 15min"
  }[];
}
```

- 在线率/完整率各用一个ECharts环形进度图
- 离线清单按离线时长降序
- API：`GET /api/l3/meter-stats`

### 卡片6：异常楼宇 + 设备警告

```typescript
interface AnomalyBuilding {
  buildingId: string;
  buildingName: string;
  anomalyType: string;       // 异常类型
  duration: string;          // 持续时长 "3h 20min"
  level: AlarmLevel;
}

interface DeviceWarning {
  deviceId: string;
  deviceName: string;
  location: string;
  alarmType: AlarmCategory;
  duration: string;
  level: AlarmLevel;
}
```

- 两个列表混排，按持续时长降序
- 每行可点击 → 触发3D flyTo + 弹窗
- API：`GET /api/l3/anomalies?sort=duration_desc`

---

## 中间3D场景

### 校园楼宇能耗着色

建筑模型按单位面积能耗值着色，使用 `mesh.material.color` 设置：

```typescript
function getBuildingColor(intensityRatio: number): string {
  // intensityRatio = 该建筑单位面积能耗 / 同类型建筑均值
  if (intensityRatio < 0.7)  return '#36d968'; // 深绿
  if (intensityRatio < 1.0)  return '#7be898'; // 浅绿
  if (intensityRatio < 1.3)  return '#ffc107'; // 黄
  if (intensityRatio < 1.6)  return '#ff7b25'; // 橙
  return '#ff3333';                              // 红
}
```

- 底部操作栏"能源筛选"按钮切换着色维度（水/电/热/综合），切换时3D场景≤1s渐变过渡
- 色阶图例：固定在3D场景右下角，`position: absolute; right: 16px; bottom: 96px;`，深色半透明底，5级色块+文字标注

### 实时负荷悬浮面板

覆盖在3D场景左下角，`position: absolute; left: calc(26% + 16px); bottom: 96px; width: 320px; height: 200px;`

```typescript
interface LoadCurve {
  realTime: { hour: number; kw: number }[];      // 实线 #3488ff
  yesterday: { hour: number; kw: number }[];     // 虚线 #8c8c8c
  forecast: {
    hour: number;
    kw: number;
    upper: number;  // 置信区间上界
    lower: number;  // 置信区间下界
  }[];                                            // 虚线 #3488ff + 半透明填充
}
```

- 峰谷底色：
  - 峰时 8:00-11:00, 18:00-21:00 → `rgba(255, 59, 48, 0.08)` 浅红底
  - 谷时 23:00-7:00 → `rgba(54, 217, 104, 0.08)` 浅绿底
- 顶部切换：总负荷 / 用电 / 用水 / 供热（切换时3D着色联动）
- 当前功率值：面板顶部大数字 `font-size: 24px; font-weight: bold; color: #3488ff;`
- API：`GET /api/l3/load-curve?date=YYYY-MM-DD&type=total|electric|water|heat`

### 3D场景基础

| 参数 | 值 |
|---|---|
| 默认视角 | 近距离，`camera.position = [0, 40, 50]`，`lookAt(0, 0, 0)` |
| 地面 | 深蓝网格 `#081028` |
| 建筑模型 | Blender低模glb（≤10MB） |
| 设施图标 | 配电房/光伏/锅炉/实验设备 悬浮Icon |
| 异常建筑 | 红色闪烁 `opacity` 0.3↔1.0, 1.5s循环 |
| 交互 | 缩放/旋转/平移，≥30fps |
| 悬浮弹窗 | 点击楼栋 → `浮层：楼栋名/分时能耗/设备负载/夜间空载` |

---

## 底部操作按钮栏

80px高，`position: fixed; bottom: 0; width: 100%;`，深色半透明底，科技圆角按钮。

| 按钮 | 功能 | 实现 |
|---|---|---|
| 能源筛选 | 水/电/热/综合 四个toggle按钮，切换3D着色维度 | `setState({ energyView: 'water' })` → 3D重新着色 |
| 告警筛选 | 能源/设备/环境/数据 四个toggle，筛选左侧告警列表 | `setState({ alarmFilter: 'energy' })` |
| 系统筛选 | 空调冷站/供热锅炉/照明动力，3D flyTo聚焦对应设备区域 | `camera.flyTo(systemPosition)` |
| 工单管理 | 跳转 `/tower/l3/work-orders` | `navigate('/tower/l3/work-orders')` |
| 时间粒度 | 实时/日/周/月 toggle | 刷新所有卡片数据 |
| 下钻L4 | 跳转 `/tower/l4` | `navigate('/tower/l4')` |
| 场景操作 | 重置视角/缩放锁定/旋转 | `resetCamera()` / `lockZoom()` |

---

## 自动派单工作流（后端逻辑）

```
告警触发
  ↓
识别告警类型 (energy/equipment/environment/data)
  ↓
匹配责任组 (查配置表 alarm_dispatch_config)
  ↓
创建工单 (POST /api/work-orders)
  ↓
推送通知给责任人 (WebSocket / 站内信)
  ↓
等待响应
  ├── 已响应 → 状态: 处理中 → 已完成 → 已验证
  └── 超时(30min/2h/8h) → 自动升级至上级主管
```

工单状态机：`待处理 → 处理中 → 已完成 → 已验证`

API端点：

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/l3/alarms` | GET | 查询告警列表 |
| `/api/l3/work-orders` | GET | 查询工单列表 |
| `/api/l3/work-orders/dispatch` | POST | 自动派单 |
| `/api/l3/work-orders/:id/accept` | PUT | 接受工单 |
| `/api/l3/work-orders/:id/complete` | PUT | 完成工单 |
| `/api/l3/work-orders/:id/escalate` | PUT | 升级工单 |
| `/api/config/alarm-thresholds` | GET/PUT | 告警阈值配置 |
| `/api/config/escalation-rules` | GET/PUT | 超时升级规则配置 |

---

## 跨层穿透（路由参数）

| 来源 | 跳转方式 | 参数 |
|---|---|---|
| L2 → L3 | `navigate('/tower/l3?buildingId=xxx')` | 3D自动flyTo该建筑，告警栏筛选该楼栋 |
| L3 → L4 | `navigate('/tower/l4?buildingId=xxx')` | 携带楼栋参数 |
| L3 → 能源分析 | `navigate('/energy/analysis?buildingId=xxx')` | 跳转深度分析 |
| L3告警 → L1 | 自动推送 | 告警同步至L1风险板块 |

---

## 全局状态（Zustand Store）

```typescript
interface L3Store {
  // 筛选状态
  energyView: 'water' | 'electric' | 'heat' | 'comprehensive';
  alarmFilter: AlarmCategory | 'all';
  timeGranularity: 'realtime' | 'day' | 'week' | 'month';
  systemFocus: 'hvac' | 'boiler' | 'lighting' | null;

  // 数据
  energyOverview: EnergySubCard[];
  carbonOverview: CarbonOverview;
  alarms: AlarmCategoryCard[];
  workOrders: WorkOrderStats;
  systemEfficiency: SystemEfficiency[];
  meterStats: MeterStats;
  anomalies: (AnomalyBuilding | DeviceWarning)[];
  loadCurve: LoadCurve;

  // 3D场景
  selectedBuildingId: string | null;
  cameraTarget: [number, number, number];

  // 继承参数（从L2穿透）
  inheritedBuildingId?: string;

  // Actions
  fetchAllData: () => void;
  setEnergyView: (view: EnergySubCard['label']) => void;
  setAlarmFilter: (filter: AlarmCategory | 'all') => void;
  flyToBuilding: (buildingId: string) => void;
}
```

---

## 组件树

```
<TowerL3>
├── <LeftPanel>                    // 左侧26%指标栏
│   ├── <EnergyOverviewCard />     // 卡片1
│   ├── <CarbonOverviewCard />     // 卡片2
│   ├── <AlarmDashboardCard />     // 卡片3
│   │   ├── <AlarmCategoryItem />  // 每类告警
│   │   └── <WorkOrderBadge />     // 待处理+超时
│   ├── <SystemEfficiencyCard />   // 卡片4
│   │   ├── <SystemMetricRow />    // 每个系统
│   │   └── <LowEfficiencyList />  // 低效TOP5
│   ├── <MeterStatsCard />         // 卡片5
│   └── <AnomalyListCard />        // 卡片6
│       ├── <AnomalyBuildingRow />
│       └── <DeviceWarningRow />
├── <Scene3D>                      // 中间64%
│   ├── <CampusModel />            // 校园glb模型
│   ├── <BuildingMeshes />         // 各楼栋（带能耗着色）
│   ├── <FacilityIcons />          // 设施悬浮图标
│   ├── <AnomalyFlash />           // 异常闪烁动画
│   ├── <LoadCurvePanel />         // 实时负荷悬浮面板
│   └── <ColorLegend />            // 色阶图例
├── <BottomBar>                    // 底部80px
│   ├── <EnergyFilterToggle />
│   ├── <AlarmFilterToggle />
│   ├── <SystemFocusButtons />
│   ├── <WorkOrderLink />
│   ├── <TimeGranularityToggle />
│   ├── <DrillDownL4Button />
│   └── <SceneControlButtons />
└── <BuildingPopup />              // 楼栋悬浮弹窗（条件渲染）
```

---

## Mock数据要点（Demo演示）

全部使用虚拟高校模拟数据：
- 23栋建筑（4教学楼+6宿舍+2实验楼+2食堂+1行政楼+1体育馆+3配电房+光伏区+绿化湖+林地碳汇）
- 35台设备（电力计量×10/暖通空调×8/燃气×4/燃油×2/可再生×4/水务×4/照明×1/实验×1/消防×1）
- 告警示例数据至少12条（能源×3/设备×3/环境×3/数据×3）
- 工单示例：待处理5/超时2
- 数据刷新频率：模拟实时5s轮询
- 全页面水印「Demo模拟数据 仅课题演示」

---

## 性能要求

| 指标 | 目标 |
|---|---|
| 首屏加载 | ≤ 3s |
| 3D帧率 | ≥ 30fps |
| 筛选联动 | ≤ 1s |
| flyTo动画 | ≤ 1.5s |
| 数据刷新 | ≤ 2s |
| 弹窗响应 | ≤ 0.5s |
| 告警实时推送 | WebSocket ≤ 3s |

---

> 本内容由 Coze AI 生成，请遵循相关法律法规及《人工智能生成合成内容标识办法》使用与传播。
