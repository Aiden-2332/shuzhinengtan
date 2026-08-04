'use client';

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useCalculationStore, type TabType } from '@/stores/calculation-store';
import { STANDARD_META } from '@/data/calculation-data';
import type { CalculationStandard } from '@/types';

// 子组件
import { TrialCalcModal, TrialCalcProgress, AnomalyModal, LockConfirmModal, UnlockModal, DeleteConfirmModal } from '@/components/calculation/dialogs';
import { FilterDrawer, DetailDrawer, BatchReviewDrawer, AddRecordModal, EditRecordModal, ImportModal } from '@/components/calculation/drawers';
import { OverviewTab, EnergyStructureTab, ExtendedEmissionTab } from '@/components/calculation/tabs';
import { DataSourceTable } from '@/components/calculation/data-table';
import { ComplianceReportButton } from '@/components/calculation/ComplianceReportButton';

import {
  Calculator, CheckCircle2, TrendingDown,
  Shield, Database, Zap, BarChart3,
  Building2, ChevronRight, Activity, RotateCcw,
  Lock, UnlockKeyhole,
} from 'lucide-react';

export default function CalculationPage() {
  const store = useCalculationStore();

  const standardMeta = STANDARD_META[store.standard];

  // 月份选项生成
  const monthOptions = React.useMemo(() => {
    const options = [];
    for (let y = 2026; y >= 2025; y--) {
      for (let m = 12; m >= 1; m--) {
        const val = `${y}-${String(m).padStart(2, '0')}`;
        options.push(val);
      }
    }
    return options;
  }, []);

  // 一键试算
  const handleTrialCalc = useCallback(() => {
    store.setShowTrialModal(true);
  }, [store]);

  // 批量复核
  const handleBatchReview = useCallback(() => {
    if (store.selectedIds.length === 0) return;
    store.setShowBatchReviewDrawer(true);
  }, [store]);

  // 锁定/解锁
  const handleLock = useCallback(() => {
    if (store.batchLocked) {
      store.setShowUnlockModal(true);
    } else {
      store.setShowLockConfirm(true);
    }
  }, [store]);

  // 恢复演示数据
  const handleResetDemo = useCallback(() => {
    if (confirm('确认恢复为演示数据？当前所有操作将丢失。')) {
      store.resetToDemo();
    }
  }, [store]);

  const tabs: { key: TabType; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: '数据源概览', icon: Database },
    { key: 'energy', label: '能源结构分析', icon: Zap },
    { key: 'extended', label: '扩展排放', icon: BarChart3 },
  ];

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
                value={store.standard}
                onChange={(e) => store.setStandard(e.target.value as CalculationStandard)}
                className="bg-slate-800 border border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {Object.entries(STANDARD_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.label}</option>
                ))}
              </select>
              <input
                type="month"
                value={store.period}
                onChange={(e) => store.setPeriod(e.target.value)}
                className="bg-slate-800 border border-blue-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetDemo}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs text-slate-400 transition-all"
                title="恢复演示数据"
              >
                <RotateCcw className="w-3 h-3" /> 恢复数据
              </button>
              <Link
                href="/leader"
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
            <button
              onClick={handleTrialCalc}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Calculator className="w-4 h-4" />
              一键试算
            </button>
            <button
              onClick={handleBatchReview}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all ${
                store.selectedIds.length === 0 ? 'opacity-50' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              批量复核
              {store.selectedIds.length > 0 && (
                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-300 rounded text-xs">{store.selectedIds.length}</span>
              )}
            </button>
            <button
              onClick={handleLock}
              className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all ${
                store.batchLocked ? 'border-yellow-700/50' : ''
              }`}
            >
              {store.batchLocked ? (
                <>
                  <UnlockKeyhole className="w-4 h-4 text-yellow-400" />
                  申请解锁
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-yellow-400" />
                  锁定批次
                </>
              )}
            </button>
            <ComplianceReportButton />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Activity className="w-4 h-4" />
              当前标准：{standardMeta.label}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{standardMeta.scopeNote}</div>
            {store.batchLocked && (
              <div className="flex items-center gap-1 text-xs text-yellow-400 mt-1">
                <Lock className="w-3 h-3" /> 批次已锁定
              </div>
            )}
            {store.calculationResult && (
              <div className="text-xs text-cyan-400 mt-1">
                核算结果：{store.calculationResult.totalEmission} tCO₂
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 看板标签切换（3个标签页，删除"合规凭证"） */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 bg-slate-900/50 p-1 rounded-lg border border-blue-900/30 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => store.setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                store.activeTab === tab.key
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
        {store.activeTab === 'overview' && <OverviewTab />}
        {store.activeTab === 'energy' && <EnergyStructureTab />}
        {store.activeTab === 'extended' && <ExtendedEmissionTab />}
      </div>

      {/* 数据源明细列表 */}
      <div className="px-6 py-4 pb-16">
        <DataSourceTable />
      </div>

      {/* 所有弹窗与抽屉 */}
      <TrialCalcModal />
      <TrialCalcProgress />
      <AnomalyModal />
      <LockConfirmModal />
      <UnlockModal />
      <DeleteConfirmModal />
      <FilterDrawer />
      <DetailDrawer />
      <BatchReviewDrawer />
      <AddRecordModal />
      <EditRecordModal />
      <ImportModal />

      {/* 水印 */}
      <div className="fixed bottom-2 right-2 text-xs text-slate-600 opacity-50">
        Demo 模拟数据 仅课题演示
      </div>
    </div>
  );
}
