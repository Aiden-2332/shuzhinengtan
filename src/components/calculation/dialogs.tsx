'use client';

import React, { useCallback } from 'react';
import { useCalculationStore } from '@/stores/calculation-store';
import { STANDARD_META } from '@/data/calculation-data';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

// ========== 一键试算确认弹窗 ==========
export function TrialCalcModal() {
  const { showTrialModal, setShowTrialModal, standard, period, records, setShowTrialProgress, setTrialStep, runCalculation, setShowAnomalyModal } = useCalculationStore();

  const periodRecords = records.filter((r) => r.period === period);
  const missingRecords = periodRecords.filter((r) => r.status === 'missing' || r.status === 'abnormal');
  const standardMeta = STANDARD_META[standard];

  const handleConfirm = useCallback(() => {
    setShowTrialModal(false);
    const missing = records.filter((r) => r.period === period && (r.status === 'missing' || r.status === 'abnormal'));
    if (missing.length > 0) {
      setShowAnomalyModal(true);
      return;
    }
    setShowTrialProgress(true);
    setTrialStep(0);
    const steps = [
      () => setTrialStep(1),
      () => setTrialStep(2),
      () => setTrialStep(3),
      () => {
        setTrialStep(4);
        runCalculation();
        setTimeout(() => {
          setShowTrialProgress(false);
          setTrialStep(0);
        }, 500);
      },
    ];
    steps.forEach((fn, i) => setTimeout(fn, (i + 1) * 500));
  }, [records, period, setShowTrialModal, setShowTrialProgress, setTrialStep, runCalculation, setShowAnomalyModal]);

  if (!showTrialModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">确认一键试算</h3>
          <button onClick={() => setShowTrialModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-3 mb-6">
          <div className="p-3 bg-slate-800/50 rounded-lg flex justify-between">
            <span className="text-slate-400 text-sm">核算标准</span>
            <span className="text-sm font-medium">{standardMeta.label}</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg flex justify-between">
            <span className="text-slate-400 text-sm">核算月份</span>
            <span className="text-sm font-medium">{period}</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg flex justify-between">
            <span className="text-slate-400 text-sm">数据源数量</span>
            <span className="text-sm font-medium">{periodRecords.length} 项</span>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg flex justify-between">
            <span className="text-slate-400 text-sm">预计计算项目数</span>
            <span className="text-sm font-medium">{periodRecords.filter((r) => r.emissionValue !== undefined).length} 项</span>
          </div>
          {missingRecords.length > 0 && (
            <div className="p-3 bg-orange-900/30 border border-orange-700/50 rounded-lg">
              <div className="flex items-center gap-2 text-orange-400 text-sm font-medium mb-1">
                <AlertTriangle className="w-4 h-4" />
                存在 {missingRecords.length} 项缺失/异常数据
              </div>
              <div className="text-xs text-orange-300/70">
                {missingRecords.map((r) => r.sourceName).join('、')}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowTrialModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button onClick={handleConfirm} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">确认试算</button>
        </div>
      </div>
    </div>
  );
}

// ========== 试算进度弹窗 ==========
export function TrialCalcProgress() {
  const { showTrialProgress, trialStep } = useCalculationStore();

  if (!showTrialProgress) return null;

  const steps = [
    { label: '校验活动数据', icon: '1' },
    { label: '匹配排放因子', icon: '2' },
    { label: '计算排放量', icon: '3' },
    { label: '汇总核算结果', icon: '4' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold mb-6">核算计算中...</h3>
        <div className="space-y-4">
          {steps.map((step, i) => {
            const stepNum = i + 1;
            const isActive = trialStep === stepNum;
            const isDone = trialStep > stepNum;
            return (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isActive ? 'bg-cyan-900/30 border border-cyan-500/30' :
                isDone ? 'bg-green-900/20' : 'bg-slate-800/50'
              }`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                  isDone ? 'bg-green-500/20 text-green-400' :
                  isActive ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-slate-700 text-slate-500'
                }`}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : isActive ? <Loader2 className="w-5 h-5 animate-spin" /> : step.icon}
                </div>
                <span className={`text-sm ${isDone ? 'text-green-400' : isActive ? 'text-cyan-300' : 'text-slate-500'}`}>{step.label}</span>
                {isActive && <span className="ml-auto text-xs text-cyan-400">处理中...</span>}
                {isDone && <span className="ml-auto text-xs text-green-400">完成</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== 异常清单弹窗 ==========
export function AnomalyModal() {
  const { showAnomalyModal, setShowAnomalyModal, records, period } = useCalculationStore();

  if (!showAnomalyModal) return null;

  const anomalyRecords = records.filter((r) => r.period === period && (r.status === 'missing' || r.status === 'abnormal'));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-orange-700/50 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-orange-400">数据异常清单</h3>
          <button onClick={() => setShowAnomalyModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <p className="text-sm text-slate-400 mb-4">以下数据源存在问题，请补录或确认后再试算：</p>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
          {anomalyRecords.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-sm font-medium">{r.sourceName}</div>
                <div className="text-xs text-slate-500">{r.sourceCode} · {r.period}</div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                r.status === 'missing' ? 'bg-red-500/20 text-red-300' : 'bg-orange-500/20 text-orange-300'
              }`}>
                {r.status === 'missing' ? '缺失' : '异常'}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAnomalyModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">稍后处理</button>
          <button onClick={() => setShowAnomalyModal(false)} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">前往补录</button>
        </div>
      </div>
    </div>
  );
}

// ========== 锁定确认弹窗 ==========
export function LockConfirmModal() {
  const { showLockConfirm, setShowLockConfirm, lockBatch, period } = useCalculationStore();

  if (!showLockConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-yellow-700/50 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-yellow-500/20">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">确认锁定批次</h3>
            <p className="text-xs text-slate-400">{period} 核算数据</p>
          </div>
        </div>
        <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg mb-4 text-sm text-yellow-300/80">
          锁定后，当前月份的数据将不可直接编辑或删除。如需修改，需申请解锁并经审批后方可操作。
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLockConfirm(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button onClick={() => { lockBatch(); setShowLockConfirm(false); }} className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-all">确认锁定</button>
        </div>
      </div>
    </div>
  );
}

// ========== 解锁申请弹窗 ==========
export function UnlockModal() {
  const { showUnlockModal, setShowUnlockModal, unlockBatch } = useCalculationStore();
  const [reason, setReason] = React.useState('');

  if (!showUnlockModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">申请解锁</h3>
          <button onClick={() => setShowUnlockModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-slate-400 mb-2">解锁原因 <span className="text-red-400">*</span></label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 h-24 resize-none"
            placeholder="请填写解锁原因..."
          />
          {!reason.trim() && <p className="text-xs text-red-400 mt-1">请填写解锁原因</p>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setShowUnlockModal(false); setReason(''); }} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button
            onClick={() => {
              if (!reason.trim()) return;
              unlockBatch(reason);
              setShowUnlockModal(false);
              setReason('');
            }}
            disabled={!reason.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交申请
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== 删除确认弹窗 ==========
export function DeleteConfirmModal() {
  const { showDeleteConfirm, setShowDeleteConfirm, deleteRecordId, setDeleteRecordId, deleteRecord, batchLocked } = useCalculationStore();

  if (!showDeleteConfirm) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-red-700/50 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/20">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-red-400">确认删除</h3>
        </div>
        <p className="text-sm text-slate-300 mb-4">
          确定要删除此数据源记录吗？此操作不可撤销。
        </p>
        <div className="flex gap-3">
          <button onClick={() => { setShowDeleteConfirm(false); setDeleteRecordId(null); }} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button
            onClick={() => {
              if (deleteRecordId && !batchLocked) {
                deleteRecord(deleteRecordId);
              }
              setShowDeleteConfirm(false);
              setDeleteRecordId(null);
            }}
            disabled={batchLocked}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
