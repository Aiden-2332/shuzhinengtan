# 高校智慧碳管理平台

## 项目概述

面向北京市重点碳排放单位中的高校，覆盖数据采集→数据质量管理→碳排放核算→排放分析→减排路径→碳管理→碳资产管理→监督考核→示范创建全链条的碳管理数字化平台。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图表库**: Recharts, ECharts 5
- **地图库**: MapLibre GL JS (3D/2.5D 校园碳地图)
- **状态管理**: Zustand
- **动画库**: framer-motion

## 目录结构

```
├── public/                     # 静态资源
├── src/
│   ├── app/                    # 页面路由
│   │   ├── page.tsx            # 首页（领导驾驶舱，全屏大屏）
│   │   ├── portal/             # 功能目录页（图形化卡片入口）
│   │   ├── alarms/             # 告警中心全量页面（详细信息+解决建议）
│   │   ├── energy/             # 能源分析
│   │   │   └── calendar/       # 用电日历
│   │   ├── energy-monitor/     # 能源监测（设备管理面板）
│   │   ├── calculation/        # 碳核算工作台
│   │   ├── ai-suggestion/      # AI减排建议
│   │   ├── ai-center/          # AI智能分析中心（四模块）
│   │   ├── asset/              # 碳资产管理（六大模块：配额台账/缺口决策/履约看板/碳资产增值/合规雷达/核查准备）
│   │   └── campus-map/         # 校园碳地图（3D/2.5D MapLibre GL）
│   ├── components/
│   │   ├── ui/                 # Shadcn UI 组件库
│   │   ├── layout/             # 布局组件（侧边栏、头部）
│   │   ├── dashboard/          # 仪表盘组件（KPI卡片、图表、校园地图）
│   │   │   ├── campus-map.tsx  # 校园碳地图组件（MapLibre GL 3D/2.5D）
│   │   │   └── ...             # 其他仪表盘组件
│   │   ├── calculation/        # 碳核算组件（弹窗/抽屉/标签页/数据表）
│   │   │   ├── dialogs.tsx     # 一键试算/进度/异常/锁定/解锁/删除弹窗
│   │   │   ├── drawers.tsx     # 批量复核/报告配置/报告预览抽屉
│   │   │   ├── tabs.tsx        # 数据源概览/能源结构分析/扩展排放标签页
│   │   │   └── data-table.tsx  # 数据源明细表（筛选/导出/分页/排序/多选）
│   │   └── ai-center/          # AI中心组件（16个模块组件）
│   ├── stores/
│   │   ├── ai-center-store.ts  # AI中心 Zustand 状态管理
│   │   ├── carbon-asset-store.ts # 碳资产管理 Zustand 状态管理
│   │   └── calculation-store.ts # 碳核算工作台 Zustand 状态管理
│   ├── data/
│   │   ├── mock-data.ts        # 模拟数据
│   │   ├── alarm-data.ts       # 告警中心数据（告警列表、解决建议）
│   │   ├── ai-center-mock.ts   # AI中心 Mock 数据
│   │   ├── calculation-data.ts # 碳核算 Mock 数据（25条数据源+localStorage持久化）
│   │   ├── campus-geojson.ts   # 校园建筑 GeoJSON 数据（北京科技大学）
│   │   └── carbon-asset-mock.ts # 碳资产管理 Mock 数据（配额/缺口/履约/交易/合规/核查）
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   └── lib/
│       └── utils.ts            # 工具函数
├── DESIGN.md                   # 设计规范
├── next.config.ts              # Next.js 配置
├── package.json                # 依赖管理
└── tsconfig.json               # TypeScript 配置
```

## 核心页面

| 页面 | 路由 | 功能描述 |
|------|------|----------|
| 领导驾驶舱 | `/` | 核心KPI、趋势图、风险预警、建筑排名（全屏大屏） |
| 功能目录页 | `/portal` | 图形化卡片展示所有功能模块入口 |
| 告警中心 | `/alarms` | 全量告警列表、详细信息、建议解决方法 |
| 能源监测 | `/energy-monitor` | 碳排全链条溯源图、35台设备管理面板（筛选/详情/批量操作） |
| 能源分析 | `/energy` | 建筑排名、小时负荷热力图、异常详情 |
| 用电日历 | `/energy/calendar` | 月历热力图、逐时负荷曲线、TOP10排名、告警中心 |
| 碳核算工作台 | `/calculation` | 五步核算流程、数据追溯、质量检查、完整交互（试算/复核/锁定/报告/筛选/导出/CRUD） |
| AI减排建议 | `/ai-suggestion` | 证据汇总、措施匹配、效益试算 |
| AI智能分析中心 | `/ai-center` | 预测性分析、实时监控异常报警、AI减排路径优化、政策咨询AI助手 |
| 碳资产管理 | `/asset` | 六大模块：配额台账/缺口决策引擎/履约任务看板/碳资产增值/合规雷达/核查准备中心 |
| 校园碳地图 | `/campus-map` | 北京科技大学3D/2.5D/2D校园建筑碳排放可视化地图 |

## 用户角色

- **校领导**: 查看全局KPI、风险状态、审批项目
- **后勤能源管理员**: 监测能耗、定位异常、推动节能
- **碳管理员**: 核算、报告、核查、配额与履约
- **数据填报员**: 按责任范围填报并上传材料

## 模拟数据说明

- 所有数据为虚拟高校演示数据
- 包含：主校区 + 东校区
- 建筑类型：教学楼、实验楼、图书馆、宿舍、食堂、体育馆、行政楼
- 能源类型：电力、天然气、热力、光伏
- 演示异常场景：教学楼A夜间空调负荷异常

## 开发命令

```bash
# 安装依赖
pnpm install

# 开发模式（端口5000）
pnpm run dev

# 构建生产版本
pnpm run build

# 运行生产版本
pnpm run start

# TypeScript 类型检查
pnpm ts-check
```

## 编码规范

- 使用 TypeScript strict 模式
- 禁止隐式 `any` 和 `as any`
- 所有模拟数据使用确定性的偏差值（避免 `Math.random()` 导致的 hydration 问题）
- 组件使用 `useMemo` 缓存计算结果
- 遵循 shadcn/ui 组件风格

## 注意事项

- 本 Demo 为虚拟数据演示，不用于真实申报
- 所有预测、AI、价格数据均有"模拟"标签
- 遵循北京市碳排放权交易相关政策规范