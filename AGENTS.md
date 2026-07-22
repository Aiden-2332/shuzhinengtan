# 高校智慧碳管理平台

## 项目概述

面向北京市重点碳排放单位中的高校，覆盖数据采集→数据质量管理→碳排放核算→排放分析→减排路径→碳管理→碳资产管理→监督考核→示范创建全链条的碳管理数字化平台。

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **图表库**: Recharts

## 目录结构

```
├── public/                     # 静态资源
├── src/
│   ├── app/                    # 页面路由
│   │   ├── page.tsx            # 首页（领导驾驶舱）
│   │   ├── energy/             # 能源分析
│   │   │   └── calendar/       # 用电日历
│   │   ├── energy-monitor/     # 能源监测（设备管理面板）
│   │   ├── calculation/        # 碳核算工作台
│   │   ├── ai-suggestion/      # AI减排建议
│   │   └── asset/              # 碳资产管理
│   ├── components/
│   │   ├── ui/                 # Shadcn UI 组件库
│   │   ├── layout/             # 布局组件（侧边栏、头部）
│   │   └── dashboard/          # 仪表盘组件（KPI卡片、图表）
│   ├── data/
│   │   └── mock-data.ts        # 模拟数据
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
| 领导驾驶舱 | `/` | 核心KPI、趋势图、风险预警、建筑排名 |
| 能源监测 | `/energy-monitor` | 碳排全链条溯源图、35台设备管理面板（筛选/详情/批量操作） |
| 能源分析 | `/energy` | 建筑排名、小时负荷热力图、异常详情 |
| 用电日历 | `/energy/calendar` | 月历热力图、逐时负荷曲线、TOP10排名、告警中心 |
| 碳核算工作台 | `/calculation` | 五步核算流程、数据追溯、质量检查 |
| AI减排建议 | `/ai-suggestion` | 证据汇总、措施匹配、效益试算 |
| 碳资产管理 | `/asset` | 配额台账、缺口预测、履约日历 |

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