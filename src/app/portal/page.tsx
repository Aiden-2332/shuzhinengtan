"use client";

import { useRouter } from "next/navigation";
import {
  BarChart3,
  Calculator,
  Brain,
  Cpu,
  Wallet,
  Map,
  LayoutDashboard,
  Factory,
  ArrowRight,
  Zap,
  TrendingDown,
  Sparkles,
  Bot,
  Trees,
  Leaf,
  Flame,
  Droplets,
  Sun,
  ThermometerSun,
  Activity,
  MonitorSmartphone,
  GitBranch,
} from "lucide-react";

interface PortalCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  borderColor: string;
  color: string;
  items: PortalItem[];
}

interface PortalItem {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

const categories: PortalCategory[] = [
  {
    id: "monitor",
    title: "能源监测",
    description: "设备实时监控与运行管理",
    icon: MonitorSmartphone,
    gradient: "from-emerald-500/20 to-green-600/10",
    borderColor: "border-emerald-500/30",
    color: "text-emerald-400",
    items: [
      {
        title: "能源监测",
        description: "碳排溯源图、35台设备管理面板",
        href: "/energy-monitor",
        icon: Activity,
        color: "text-emerald-400",
        badge: "核心",
      },
      {
        title: "能源流向分析",
        description: "校园能源输入、转换、输配与终端流向全景",
        href: "/energy-flow",
        icon: GitBranch,
        color: "text-blue-400",
        badge: "新增",
      },
    ],
  },
  {
    id: "carbon",
    title: "碳核算与管理",
    description: "碳排放核算、减排路径与资产管理",
    icon: Calculator,
    gradient: "from-amber-500/20 to-orange-600/10",
    borderColor: "border-amber-500/30",
    color: "text-amber-400",
    items: [
      {
        title: "碳核算工作台",
        description: "五步核算流程、数据追溯、质量检查",
        href: "/calculation",
        icon: Calculator,
        color: "text-amber-400",
        badge: "核心",
      },
      {
        title: "AI减排建议",
        description: "证据汇总、措施匹配、效益试算",
        href: "/ai-suggestion",
        icon: TrendingDown,
        color: "text-orange-400",
      },
      {
        title: "碳资产管理",
        description: "配额台账、缺口预测、履约日历",
        href: "/asset",
        icon: Wallet,
        color: "text-yellow-500",
      },
    ],
  },
  {
    id: "ai",
    title: "AI 智能分析",
    description: "预测分析与智能决策支持",
    icon: Brain,
    gradient: "from-violet-500/20 to-purple-600/10",
    borderColor: "border-violet-500/30",
    color: "text-violet-400",
    items: [
      {
        title: "AI智能分析中心",
        description: "预测分析、实时监控、减排优化、政策助手",
        href: "/ai-center",
        icon: Cpu,
        color: "text-violet-400",
        badge: "核心",
      },
    ],
  },
  {
    id: "spatial",
    title: "空间可视化",
    description: "校园地理空间数据展示",
    icon: Map,
    gradient: "from-teal-500/20 to-cyan-600/10",
    borderColor: "border-teal-500/30",
    color: "text-teal-400",
    items: [
      {
        title: "校园碳地图",
        description: "3D/2.5D校园建筑碳排放可视化",
        href: "/campus-map",
        icon: Map,
        color: "text-teal-400",
      },
    ],
  },
];

export default function PortalPage() {
  const router = useRouter();

  return (
    <div className="min-h-full bg-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-20 right-32 w-96 h-96 bg-blue-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-48 bg-violet-500/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative px-8 pt-8 pb-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">功能中心</h1>
                <p className="text-sm text-gray-400">选择功能模块开始工作</p>
              </div>
            </div>

            {/* Quick Links to Cockpits */}
            <div className="mt-5 flex gap-4">
              <button
                onClick={() => router.push("/")}
                className="group flex-1 flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-600/10 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0">
                  <LayoutDashboard className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-base font-semibold text-white">领导组驾驶舱</div>
                  <div className="text-xs text-gray-400 mt-0.5">全局KPI · 风险预警 · 决策支持</div>
                </div>
                <ArrowRight className="w-5 h-5 text-cyan-400/50 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => router.push("/operations")}
                className="group flex-1 flex items-center gap-4 px-5 py-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-600/10 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
                  <Factory className="w-6 h-6 text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="text-base font-semibold text-white">后勤组驾驶舱</div>
                  <div className="text-xs text-gray-400 mt-0.5">能源监控 · 异常处置 · 效率优化</div>
                </div>
                <ArrowRight className="w-5 h-5 text-orange-400/50 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="px-8 pb-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div
                  key={cat.id}
                  className={`rounded-xl bg-gradient-to-br ${cat.gradient} border ${cat.borderColor} p-5 hover:shadow-lg transition-all duration-300`}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.gradient} border ${cat.borderColor} flex items-center justify-center`}>
                      <CatIcon className={`w-4.5 h-4.5 ${cat.color}`} />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">{cat.title}</h2>
                      <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                  </div>

                  {/* Items Grid */}
                  <div className="space-y-2.5">
                    {cat.items.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <button
                          key={item.href}
                          onClick={() => router.push(item.href)}
                          className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/60 border border-gray-800/50 hover:border-gray-700 hover:bg-slate-800/60 transition-all duration-200 text-left"
                        >
                          <div className={`w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center shrink-0 ${item.color}`}>
                            <ItemIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-medium">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">{item.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-600/60 pointer-events-none select-none">
        Demo模拟数据 仅课题演示
      </div>
    </div>
  );
}
