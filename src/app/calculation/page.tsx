'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calculator, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown,
  Zap,
  Building2,
  BarChart3,
  Download,
  Eye,
  Filter,
  Calendar,
  ChevronRight,
  Activity,
  Shield,
  Database
} from 'lucide-react';

// 简化的数据类型
interface OverviewData {
  totalSources: number;
  collectedSources: number;
  completenessRate: number;
  riskBuildings: { name: string; count: number; level: string }[];
}

interface EnergyData {
  scope1Emission: number;
  scope2Emission: number;
  buildingRanking: { name: string; emission: number; intensity: number }[];
  solarReduction: number;
}

export default function CalculationPage() {
  const [standard, setStandard] = useState<'JST303' | 'EnergyStat'>('JST303');
  const [period, setPeriod] = useState('2026-06');
  const [activeTab, setActiveTab] = useState<'overview' | 'energy' | 'extended' | 'compliance'>('overview');
  const [showReportModal, setShowReportModal] = useState(false);

  // 模拟数据
  const overviewData: OverviewData = {
    totalSources: 156,
    collectedSources: 138,
    completenessRate: 88.5,
    riskBuildings: [
      { name: '实验楼A', count: 3, level: 'high' },
      { name: '宿舍3号楼', count: 2, level: 'medium' },
      { name: '食堂B', count: 1, level: 'medium' },
    ],
  };

  const energyData: EnergyData = {
    scope1Emission: 5400,
    scope2Emission: 10400,
    buildingRanking: [
      { name: '实验楼A', emission: 520, intensity: 28.9 },
      { name: '实验楼B', emission: 480, intensity: 32.0 },
      { name: '教学楼A', emission: 450, intensity: 37.5 },
      { name: '食堂A', emission: 350, intensity: 77.8 },
      { name: '宿舍1号楼', emission: 280, intensity: 32.9 },
    ],
    solarReduction: 95,
  };

  const standardLabel = standard === 'JST303' ? 'JS/T 303-2026 碳核算' : '能源资源统计制度';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 text-white">
      {/* 顶部筛选栏 */}
      <div className="border-b border-blue-900/50 bg-slate-900/80 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calculator className="w-6 h-6 text-cyan-400" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  碳核算工作台
                </h1>
              </div>
              <div className="h-6 w-px bg-blue-800"></div>
              <select
                value={standard}
                onChange={(e) => setStandard(e.target.value as 'JST303' | 'EnergyStat')}
                className="bg-slate-800 border border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="JST303">JS/T 303-2026 碳核算指南</option>
                <option value="EnergyStat">公共机构能源资源统计制度</option>
              </select>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-slate-800 border border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="2026-06">2026年6月</option>
                <option value="2026-05">2026年5月</option>
                <option value="2026-04">2026年4月</option>
                <option value="2026-Q2">2026年Q2</option>
                <option value="2026">2026年度</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 rounded-lg text-sm transition-all"
              >
                <Building2 className="w-4 h-4" />
                3D 碳控制塔
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 核算操作功能区 */}
      <div className="px-6 py-4 border-b border-blue-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all">
              <Calculator className="w-4 h-4" />
              一键试算
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              批量复核
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">
              <Shield className="w-4 h-4 text-yellow-400" />
              锁定批次
            </button>
            <button 
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg text-sm font-medium shadow-lg shadow-purple-500/20 transition-all"
            >
              <FileText className="w-4 h-4" />
              生成合规报告
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Activity className="w-4 h-4" />
            当前标准：{standardLabel}
          </div>
        </div>
      </div>

      {/* 看板标签切换 */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-blue-900/30 w-fit">
          {[
            { key: 'overview', label: '数据源概览', icon: Database },
            { key: 'energy', label: '能源结构分析', icon: Zap },
            { key: 'extended', label: '扩展排放', icon: BarChart3 },
            { key: 'compliance', label: '合规凭证', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 看板内容区 */}
      <div className="px-6 py-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 核心指标卡片 */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <Database className="w-4 h-4" />
                  应采集数据源
                </div>
                <div className="text-2xl font-bold text-white">{overviewData.totalSources}</div>
                <div className="text-xs text-slate-500 mt-1">项</div>
              </div>
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  已录入数量
                </div>
                <div className="text-2xl font-bold text-green-400">{overviewData.collectedSources}</div>
                <div className="text-xs text-slate-500 mt-1">项</div>
              </div>
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <BarChart3 className="w-4 h-4" />
                  数据完整率
                </div>
                <div className="text-2xl font-bold text-cyan-400">{overviewData.completenessRate}%</div>
                <div className="text-xs text-slate-500 mt-1">较上月 +2.3%</div>
              </div>
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  风险预警
                </div>
                <div className="text-2xl font-bold text-orange-400">{overviewData.riskBuildings.length}</div>
                <div className="text-xs text-slate-500 mt-1">个楼栋</div>
              </div>
            </div>

            {/* 风险预警卡片 */}
            <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <span className="font-medium">风险预警 TOP3</span>
              </div>
              <div className="space-y-3">
                {overviewData.riskBuildings.map((building, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        building.level === 'high' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                      }`}></div>
                      <span className="text-sm">{building.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{building.count} 项异常</span>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'energy' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* 排放指标 */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <Zap className="w-4 h-4 text-orange-400" />
                  Scope1 排放
                </div>
                <div className="text-2xl font-bold text-orange-400">{energyData.scope1Emission}</div>
                <div className="text-xs text-slate-500 mt-1">tCO₂</div>
              </div>
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  Scope2 排放
                </div>
                <div className="text-2xl font-bold text-blue-400">{energyData.scope2Emission}</div>
                <div className="text-xs text-slate-500 mt-1">tCO₂</div>
              </div>
              <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  光伏减排
                </div>
                <div className="text-2xl font-bold text-green-400">{energyData.solarReduction}</div>
                <div className="text-xs text-slate-500 mt-1">tCO₂</div>
              </div>
            </div>

            {/* 建筑排名 */}
            <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <span className="font-medium">建筑碳排排名</span>
              </div>
              <div className="space-y-3">
                {energyData.buildingRanking.map((building, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        index === 0 ? 'bg-red-500/20 text-red-400' :
                        index === 1 ? 'bg-orange-500/20 text-orange-400' :
                        index === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="text-sm">{building.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{building.emission} t</div>
                      <div className="text-xs text-slate-500">{building.intensity} kg/m²</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'extended' && (
          <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-6">
            <div className="text-center text-slate-400 py-12">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>扩展排放数据看板</p>
              <p className="text-sm mt-2">包含 Scope3、实验逸散、绿电碳汇等数据</p>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl p-6">
            <div className="text-center text-slate-400 py-12">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>合规凭证看板</p>
              <p className="text-sm mt-2">MRV 溯源、数据质量、凭证管理</p>
            </div>
          </div>
        )}
      </div>

      {/* 数据源明细列表 */}
      <div className="px-6 py-4">
        <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-blue-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="font-medium">数据源明细列表</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs transition-all">
                <Filter className="w-3 h-3" />
                筛选
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs transition-all">
                <Download className="w-3 h-3" />
                导出
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">编码</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">数据源名称</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">分类</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">统计期</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">数值</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">状态</th>
                  <th className="px-4 py-3 text-xs font-medium text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {[
                  { code: 'S-A04', name: '外购电力', category: '核心能源', period: '2026-06', value: '1,420,000 kWh', status: 'normal' },
                  { code: 'S-A06', name: '天然气', category: '核心能源', period: '2026-06', value: '72,000 m³', status: 'normal' },
                  { code: 'S-A05', name: '外购热力', category: '核心能源', period: '2026-06', value: '15,000 GJ', status: 'warning' },
                  { code: 'S-A09', name: '光伏自发绿电', category: '核心能源', period: '2026-06', value: '180,000 kWh', status: 'normal' },
                  { code: 'S-A12', name: '制冷剂消耗', category: '扩展排放', period: '2026-06', value: '-', status: 'missing' },
                ].map((item, index) => (
                  <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-cyan-400">{item.code}</td>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.category === '核心能源' ? 'bg-blue-500/20 text-blue-300' :
                        item.category === '扩展排放' ? 'bg-purple-500/20 text-purple-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">{item.period}</td>
                    <td className="px-4 py-3 text-sm font-mono">{item.value}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.status === 'normal' ? 'bg-green-500/20 text-green-300' :
                        item.status === 'warning' ? 'bg-orange-500/20 text-orange-300' :
                        item.status === 'missing' ? 'bg-red-500/20 text-red-300' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {item.status === 'normal' ? '正常' : item.status === 'warning' ? '待复核' : '缺失'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-700 rounded transition-colors">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 报告导出弹窗 */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">生成合规上报材料</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-sm text-slate-400">核算标准</div>
                <div className="font-medium">{standardLabel}</div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-sm text-slate-400">核算期间</div>
                <div className="font-medium">{period}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-slate-400">报告文件</div>
                <label className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">主表 Excel</span>
                </label>
                <label className="flex items-center gap-2 p-2 hover:bg-slate-800/50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className="text-sm">佐证附件压缩包</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all"
              >
                取消
              </button>
              <button 
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all"
              >
                <Download className="w-4 h-4 inline mr-2" />
                下载
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 水印 */}
      <div className="fixed bottom-2 right-2 text-xs text-slate-600 opacity-50">
        Demo 模拟数据 仅课题演示
      </div>
    </div>
  );
}
