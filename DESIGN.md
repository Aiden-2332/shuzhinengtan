# DESIGN.md - 高校智慧碳管理平台设计规范

## 气质与意象

**关键词**：专业、数据驱动、科技环保、可信赖

**具象场景**：
- 清晨的大学校园，阳光透过玻璃幕墙洒在数据大屏上
- 后勤能源管理中心，蓝色光晕映照着实时跳动的能耗曲线
- 校领导办公室，简洁的驾驶舱界面呈现关键决策指标
- 碳管理员核对年度报告，追溯链条清晰可查

## 视觉策略

### 摄影与图像
- 偏好：真实建筑摄影、简洁数据可视化、专业仪表盘界面
- 避免：过于卡通化的图标、复杂的背景纹理

### 图形语言
- 几何简洁：圆角卡片、清晰的网格布局
- 数据优先：图表配色高对比度，信息层级分明
- 状态明确：颜色编码承载业务含义（正常/警告/阻断）

## Design Tokens

### 色彩

#### 主色系（品牌色）
```css
--primary: 210 100% 50%;        /* #0099FF - 科技蓝 */
--primary-foreground: 0 0% 100%;
```

#### 功能色
```css
/* 成功/低碳/环保 */
--success: 142 76% 36%;         /* #16A34A - 环保绿 */

/* 警告/需关注 */
--warning: 38 92% 50%;          /* #F59E0B - 警示橙 */

/* 危险/阻断/超标 */
--danger: 0 84% 60%;            /* #DC2626 - 风险红 */

/* 信息/中性 */
--info: 200 100% 45%;           /* #0099CC - 信息蓝 */
```

#### 数据可视化配色
```css
/* 能源类型 */
--energy-electricity: 210 100% 50%;    /* 电力 - 蓝色 */
--energy-gas: 38 92% 50%;              /* 天然气 - 橙色 */
--energy-heat: 0 70% 55%;              /* 热力 - 红色 */
--energy-solar: 48 96% 53%;            /* 光伏 - 金色 */
--energy-green: 142 76% 36%;           /* 绿电 - 绿色 */

/* 图表系列色 */
--chart-1: 210 100% 50%;
--chart-2: 142 76% 36%;
--chart-3: 38 92% 50%;
--chart-4: 280 65% 60%;
--chart-5: 0 70% 55%;
```

#### 背景与表面
```css
--background: 0 0% 98%;         /* #FAFAFA - 浅灰背景 */
--foreground: 222 47% 11%;      /* #0F172A - 深色文字 */

--card: 0 0% 100%;              /* 纯白卡片 */
--card-foreground: 222 47% 11%;

--muted: 210 40% 96%;           /* 浅灰底色 */
--muted-foreground: 215 16% 47%;

--border: 214 32% 91%;          /* 边框灰 */
```

### 字体

```css
/* 主字体 - 思源黑体（中文） / Inter（英文） */
--font-sans: "Source Han Sans SC", "Noto Sans SC", Inter, system-ui, sans-serif;

/* 数据字体 - 等宽数字 */
--font-mono: "JetBrains Mono", "Roboto Mono", ui-monospace, monospace;
```

#### 字体大小
```css
--text-xs: 0.75rem;      /* 12px - 辅助说明 */
--text-sm: 0.875rem;     /* 14px - 正文、表格 */
--text-base: 1rem;       /* 16px - 默认 */
--text-lg: 1.125rem;     /* 18px - 小标题 */
--text-xl: 1.25rem;      /* 20px - 卡片标题 */
--text-2xl: 1.5rem;      /* 24px - 区块标题 */
--text-3xl: 1.875rem;    /* 30px - 页面标题 */
--text-4xl: 2.25rem;     /* 36px - 大数字 */
--text-5xl: 3rem;        /* 48px - KPI 数字 */
```

### 间距与圆角

```css
/* 间距 */
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */

/* 圆角 */
--radius-sm: 0.25rem;    /* 4px - 按钮、小卡片 */
--radius-md: 0.5rem;     /* 8px - 卡片 */
--radius-lg: 0.75rem;    /* 12px - 大卡片 */
--radius-xl: 1rem;       /* 16px - 模态框 */
```

### 阴影

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
```

## 布局与响应式

### 页面布局
- **侧边栏导航**：固定 240px，可收起为 64px 图标模式
- **顶部栏**：64px 高度，包含筛选器、用户信息
- **内容区**：自适应宽度，最小 1024px
- **卡片网格**：12 列栅格系统

### 响应式断点
```css
--breakpoint-sm: 640px;   /* 手机横屏 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小屏笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
--breakpoint-2xl: 1536px; /* 大屏 */
```

## 组件规范

### KPI 卡片
- 高度：120px
- 结构：图标 + 数值 + 标签 + 趋势标签
- 数据字号：32px (text-4xl)
- 趋势色：正数为红（增长/超标），负数为绿（下降/改善）

### 图表卡片
- 最小高度：320px
- 标题字号：18px (text-lg)
- 图例位置：图表下方或右侧
- 交互：悬停显示数值，点击可下钻

### 数据表格
- 表头：浅灰背景 (#F5F5F5)，字号 14px
- 行高：48px
- 斑马纹：奇数行白色，偶数行 #FAFAFA
- 操作列：固定在右侧

### 状态标签
- 正常/合规：绿色徽章
- 警告/待处理：橙色徽章
- 阻断/超标：红色徽章
- 已完成/已锁定：灰色徽章

## 交互与状态

### 动效
- 过渡时间：150ms (快速响应感)
- 缓动函数：ease-out
- 页面切换：淡入淡出，不使用复杂动画

### 悬停状态
- 卡片：轻微上浮 + 阴影加深
- 按钮：背景色加深 10%
- 表格行：背景色变深

### 加载状态
- 骨架屏：浅灰色脉冲动画
- 不阻塞全页操作

### 空状态
- 显示友好提示文案
- 提供操作入口（如"导入数据"）

## 设计禁忌

- ❌ 禁止使用紫色渐变、科技蓝+紫色的组合
- ❌ 禁止使用过于卡通的图标风格
- ❌ 禁止在数据区域使用装饰性插图
- ❌ 禁止预测值与实绩混同展示
- ❌ 禁止在无数据时显示误导性的 0
- ❌ 禁止隐藏"Demo 模拟数据"水印
- ❌ 禁止使用纯黑 (#000) 作为文字颜色
- ❌ 禁止表格行高低于 40px

## 水印规范

所有页面需在底部固定位置显示：
```
Demo 模拟数据，不用于申报
```
字号 12px，颜色 #94A3B8，透明度 80%

## Gateway Service Hall

The gateway is an Operate-surface entrance, not a marketing hero or a card carousel. Its visual world is a deep-navy university service hall with cyan wayfinding, smoked-glass panels, and restrained brass hardware. The page must present all six business centers as physical entrances in one desktop viewport.

### Composition and materials

- Six tall, low-set doors form the primary first-viewport signal. Every door has a lintel sign, number plaque, deep jamb, transom, paired leaves, two pull handles, lower panels, threshold, and grounded shadow.
- The campus elevation, service conduits, wall seams, and perspective floor are code-drawn SVG/CSS architecture. The floor grid is a wayfinding and measurement surface, so its grid lines are intentional rather than generic background decoration.
- Cyan identifies navigation and live system direction. Brass is reserved for hardware and the center route. Smoked panes and dark metal keep the hall legible without becoming a dashboard card stack.

### Interaction contract

- Each doorway is a real `Link` and navigates on the first click. Internal cockpits stay in the platform; external systems open in a new tab with `noopener noreferrer`.
- Hover and keyboard focus part the two leaves slightly and reveal an entry plate, while reduced-motion users receive the same affordance without transition movement.
- Desktop shows all six entrances. At 820px and below, the row becomes a horizontal scroll-snap rail so each tall door remains inspectable and actionable.
- The footer always exposes the required disclosure: `Demo 模拟数据，不用于申报`.

### Typography decision

The gateway uses the approved system stack for this Operate surface: `Bahnschrift`, `DIN Alternate`, `Noto Sans SC`, and `Microsoft YaHei` fallbacks. The first two provide a condensed architectural voice when available; the Chinese fallbacks preserve reliable local rendering because this repository has no font asset to self-host. Do not replace this stack with a decorative display face without a product-approved font asset and a corresponding token update.
