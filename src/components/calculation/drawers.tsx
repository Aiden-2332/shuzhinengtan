'use client';

import React, { useCallback, useMemo } from 'react';
import { useCalculationStore, type FilterConditions } from '@/stores/calculation-store';
import type { DataSourceRecord, DataSourceStatus, AuditStatus, EvidenceStatus } from '@/types';
import { STANDARD_META } from '@/data/calculation-data';
import {
  X, Search, RotateCcw, Download, Eye, Pencil, Trash2, PlusCircle,
  Upload, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronUp, ChevronDown, Filter, FileText, CheckCircle2,
} from 'lucide-react';

// ========== 筛选抽屉 ==========
export function FilterDrawer() {
  const { showFilterDrawer, setShowFilterDrawer, filters, setFilters, resetFilters, activeFilterCount, records } = useCalculationStore();

  if (!showFilterDrawer) return null;

  const updateFilter = (key: keyof FilterConditions, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const dataClassifications = [...new Set(records.map((r) => r.dataClassification).filter(Boolean))] as string[];
  const campuses = ['主校区', '东校区'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterDrawer(false)} />
      <div className="relative w-full max-w-md bg-slate-900 border-l border-blue-700 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
          <h3 className="font-bold flex items-center gap-2">
            <Filter className="w-5 h-5 text-cyan-400" />
            筛选条件
            {activeFilterCount > 0 && (
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full text-xs">{activeFilterCount}</span>
            )}
          </h3>
          <button onClick={() => setShowFilterDrawer(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">数据源名称</label>
            <input value={filters.sourceName} onChange={(e) => updateFilter('sourceName', e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="输入名称关键词" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">排放范围</label>
            <select value={filters.emissionScope} onChange={(e) => updateFilter('emissionScope', e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              <option value="scope1">范围一（直接排放）</option>
              <option value="scope2">范围二（外购电热）</option>
              <option value="scope3">范围三（其他间接）</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">数据分类</label>
            <select value={filters.dataClassification} onChange={(e) => updateFilter('dataClassification', e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              {dataClassifications.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">校区</label>
            <select value={filters.campus} onChange={(e) => updateFilter('campus', e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              {campuses.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">统计月份</label>
            <input type="month" value={filters.period} onChange={(e) => updateFilter('period', e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">数据状态</label>
            <select value={filters.status} onChange={(e) => updateFilter('status', e.target.value as DataSourceStatus | '')} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              <option value="normal">正常</option>
              <option value="missing">缺失</option>
              <option value="abnormal">异常</option>
              <option value="pending_review">待复核</option>
              <option value="locked">已锁定</option>
              <option value="approved">已通过</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">凭证状态</label>
            <select value={filters.evidenceStatus} onChange={(e) => updateFilter('evidenceStatus', e.target.value as EvidenceStatus | '')} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              <option value="complete">完整</option>
              <option value="incomplete">不完整</option>
              <option value="missing">缺失</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">审核状态</label>
            <select value={filters.auditStatus} onChange={(e) => updateFilter('auditStatus', e.target.value as AuditStatus | '')} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">全部</option>
              <option value="pending">待审核</option>
              <option value="approved">已通过</option>
              <option value="rejected">已退回</option>
            </select>
          </div>
        </div>
        <div className="p-4 border-t border-blue-900/30 flex gap-3">
          <button onClick={resetFilters} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
            <RotateCcw className="w-4 h-4" /> 重置
          </button>
          <button onClick={() => setShowFilterDrawer(false)} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">
            应用筛选
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== 详情抽屉 ==========
export function DetailDrawer() {
  const { showDetailDrawer, setShowDetailDrawer, detailRecordId, getRecordById } = useCalculationStore();
  const record = detailRecordId ? getRecordById(detailRecordId) : undefined;

  if (!showDetailDrawer || !record) return null;

  const detailItems = [
    { label: '数据源编码', value: record.sourceCode },
    { label: '数据源名称', value: record.sourceName },
    { label: '排放范围', value: record.emissionScope ? `范围${record.emissionScope === 'scope1' ? '一' : record.emissionScope === 'scope2' ? '二' : '三'}` : '-' },
    { label: '数据分类', value: record.dataClassification ?? '-' },
    { label: '校区', value: record.campus ?? '-' },
    { label: '建筑/部门', value: record.buildingName ?? record.department ?? '-' },
    { label: '统计月份', value: record.period },
    { label: '原始活动数据', value: record.value !== undefined ? `${record.value} ${record.unit}` : '-' },
    { label: '数据来源', value: { meter: '仪表采集', bill: '账单录入', manual: '手动填报', import: '批量导入' }[record.source] },
    { label: '排放因子', value: record.emissionFactor ? `${record.emissionFactor}` : '-' },
    { label: '因子来源与版本', value: record.emissionFactorSource ? `${record.emissionFactorSource} (${record.emissionFactorVersion})` : '-' },
    { label: '计算公式', value: record.calculationFormula ?? '-' },
    { label: '计算结果', value: record.emissionValue !== undefined ? `${record.emissionValue} tCO₂` : '-' },
    { label: '关联凭证', value: record.relatedEvidences?.length ? record.relatedEvidences.join('、') : '无' },
    { label: '凭证状态', value: { complete: '完整', incomplete: '不完整', missing: '缺失' }[record.evidenceStatus ?? 'missing'] },
    { label: '审核状态', value: { pending: '待审核', approved: '已通过', rejected: '已退回' }[record.auditStatus ?? 'pending'] },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowDetailDrawer(false)} />
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-blue-700 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
          <h3 className="font-bold flex items-center gap-2"><Eye className="w-5 h-5 text-cyan-400" /> 数据源详情</h3>
          <button onClick={() => setShowDetailDrawer(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 space-y-3">
          {detailItems.map((item, i) => (
            <div key={i} className="flex justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className="text-sm text-right max-w-[60%]">{item.value}</span>
            </div>
          ))}

          {/* 修改记录 */}
          {record.modifyRecords && record.modifyRecords.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">修改记录</h4>
              {record.modifyRecords.map((m, i) => (
                <div key={i} className="p-2 bg-slate-800/30 rounded text-xs mb-1">
                  <span className="text-slate-400">{m.time}</span> <span className="text-cyan-400">{m.operator}</span> 修改 <span className="text-yellow-400">{m.field}</span>: <span className="text-red-400">{m.oldValue}</span> → <span className="text-green-400">{m.newValue}</span>
                </div>
              ))}
            </div>
          )}

          {/* 审核记录 */}
          {record.auditRecords && record.auditRecords.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">审核记录</h4>
              {record.auditRecords.map((a, i) => (
                <div key={i} className="p-2 bg-slate-800/30 rounded text-xs mb-1">
                  <span className="text-slate-400">{a.time}</span> <span className="text-cyan-400">{a.operator}</span> <span className="text-green-400">{a.action}</span> {a.remark && <span className="text-slate-500">- {a.remark}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ========== 批量复核抽屉 ==========
export function BatchReviewDrawer() {
  const { showBatchReviewDrawer, setShowBatchReviewDrawer, selectedIds, batchApprove, batchReject, records, clearSelection } = useCalculationStore();
  const [rejectReason, setRejectReason] = React.useState('');
  const [showRejectForm, setShowRejectForm] = React.useState(false);

  const selectedRecords = records.filter((r) => selectedIds.includes(r.id));

  const handleApprove = useCallback(() => {
    batchApprove(selectedIds);
    setShowBatchReviewDrawer(false);
  }, [selectedIds, batchApprove, setShowBatchReviewDrawer]);

  const handleReject = useCallback(() => {
    if (!rejectReason.trim()) return;
    batchReject(selectedIds, rejectReason);
    setShowBatchReviewDrawer(false);
    setRejectReason('');
    setShowRejectForm(false);
  }, [selectedIds, rejectReason, batchReject, setShowBatchReviewDrawer]);

  if (!showBatchReviewDrawer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowBatchReviewDrawer(false)} />
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-blue-700 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
          <h3 className="font-bold">批量复核 ({selectedRecords.length} 项)</h3>
          <button onClick={() => { setShowBatchReviewDrawer(false); clearSelection(); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {selectedRecords.map((r) => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="text-sm">{r.sourceName}</div>
                  <div className="text-xs text-slate-500">{r.sourceCode} · {r.period}</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  r.auditStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                  r.auditStatus === 'rejected' ? 'bg-red-500/20 text-red-300' :
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {r.auditStatus === 'approved' ? '已通过' : r.auditStatus === 'rejected' ? '已退回' : '待审核'}
                </span>
              </div>
            ))}
          </div>

          {showRejectForm && (
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-2">退回原因 <span className="text-red-400">*</span></label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 h-20 resize-none" placeholder="请填写退回原因..." />
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => { setShowRejectForm(false); handleApprove(); }} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-all">复核通过</button>
            {!showRejectForm ? (
              <button onClick={() => setShowRejectForm(true)} className="flex-1 px-4 py-2 bg-red-600/80 hover:bg-red-500 rounded-lg text-sm font-medium transition-all">退回修改</button>
            ) : (
              <button onClick={handleReject} disabled={!rejectReason.trim()} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50">确认退回</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 报告配置弹窗 ==========
export function ReportConfigModal() {
  const { showReportConfigModal, setShowReportConfigModal, reportConfig, setReportConfig, standard, period, setReportGenerating, setShowReportProgress, setShowReportPreview, setReportGenerated } = useCalculationStore();

  const chapters = ['基础信息', '排放汇总', '分项明细', '可再生能源', '附件清单', '数据质量报告'];

  const handleGenerate = useCallback(() => {
    setShowReportConfigModal(false);
    setReportGenerating(true);
    setShowReportProgress(true);
    setTimeout(() => {
      setReportGenerating(false);
      setShowReportProgress(false);
      setReportGenerated(true);
      setShowReportPreview(true);
    }, 2500);
  }, [setShowReportConfigModal, setReportGenerating, setShowReportProgress, setShowReportPreview, setReportGenerated]);

  if (!showReportConfigModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">生成合规报告</h3>
          <button onClick={() => setShowReportConfigModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">报告名称</label>
            <input value={reportConfig.name} onChange={(e) => setReportConfig({ name: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">报告周期</label>
              <input type="month" value={reportConfig.period} onChange={(e) => setReportConfig({ period: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">核算标准</label>
              <select value={reportConfig.standard} onChange={(e) => setReportConfig({ standard: e.target.value as 'JST303' | 'EnergyStat' | 'ISO14064' | 'GHGProtocol' })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="JST303">JS/T 303-2026</option>
                <option value="EnergyStat">能源资源统计制度</option>
                <option value="ISO14064">ISO 14064-1</option>
                <option value="GHGProtocol">GHG Protocol</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">组织范围</label>
            <select value={reportConfig.scope} onChange={(e) => setReportConfig({ scope: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="全校区">全校区</option>
              <option value="主校区">主校区</option>
              <option value="东校区">东校区</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">报告章节</label>
            <div className="grid grid-cols-2 gap-2">
              {chapters.map((ch) => (
                <label key={ch} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" checked={reportConfig.chapters.includes(ch)} onChange={(e) => {
                    const newChapters = e.target.checked
                      ? [...reportConfig.chapters, ch]
                      : reportConfig.chapters.filter((c) => c !== ch);
                    setReportConfig({ chapters: newChapters });
                  }} className="rounded" />
                  <span className="text-sm">{ch}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">文件格式</label>
            <div className="flex gap-3">
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                reportConfig.format === 'pdf' ? 'border-cyan-500 bg-cyan-900/20 text-cyan-300' : 'border-blue-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
                <input type="radio" name="format" value="pdf" checked={reportConfig.format === 'pdf'} onChange={() => setReportConfig({ format: 'pdf' })} className="hidden" />
                <FileText className="w-4 h-4" /> PDF
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                reportConfig.format === 'excel' ? 'border-cyan-500 bg-cyan-900/20 text-cyan-300' : 'border-blue-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}>
                <input type="radio" name="format" value="excel" checked={reportConfig.format === 'excel'} onChange={() => setReportConfig({ format: 'excel' })} className="hidden" />
                <Download className="w-4 h-4" /> Excel
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowReportConfigModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button onClick={handleGenerate} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">生成报告</button>
        </div>
      </div>
    </div>
  );
}

// ========== 报告进度弹窗 ==========
export function ReportProgressModal() {
  const { showReportProgress } = useCalculationStore();

  if (!showReportProgress) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-sm text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
        <h3 className="text-lg font-bold mb-2">报告生成中</h3>
        <p className="text-sm text-slate-400">正在生成合规报告，请稍候...</p>
      </div>
    </div>
  );
}

// ========== 报告预览抽屉 ==========
export function ReportPreviewDrawer() {
  const { showReportPreview, setShowReportPreview, reportConfig, calculationResult, setReportGenerated } = useCalculationStore();

  const handleDownload = useCallback(() => {
    // 生成真实可下载的 CSV 文件
    const result = calculationResult;
    const lines = [
      `碳排放核算报告 - ${reportConfig.name}`,
      `核算标准,${reportConfig.standard}`,
      `报告周期,${reportConfig.period}`,
      `组织范围,${reportConfig.scope}`,
      '',
      '排放汇总,tCO₂',
      result ? `总排放量,${result.totalEmission}` : '总排放量,N/A',
      result ? `范围一,${result.scope1Emission}` : '范围一,N/A',
      result ? `范围二,${result.scope2Emission}` : '范围二,N/A',
      result ? `范围三,${result.scope3Emission ?? 'N/A'}` : '范围三,N/A',
      '',
      '排放强度',
      result ? `单位面积,${result.intensityPerArea} kgCO₂/m²` : '单位面积,N/A',
      result ? `人均,${result.intensityPerCapita} tCO₂/人` : '人均,N/A',
      '',
      `生成时间,${new Date().toLocaleString('zh-CN')}`,
      'Demo 模拟数据 仅课题演示',
    ];
    const csvContent = '\uFEFF' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportConfig.name}_${reportConfig.period}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [calculationResult, reportConfig]);

  const handleRegenerate = useCallback(() => {
    setShowReportPreview(false);
    setReportGenerated(false);
  }, [setShowReportPreview, setReportGenerated]);

  if (!showReportPreview) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={() => setShowReportPreview(false)} />
      <div className="relative w-full max-w-lg bg-slate-900 border-l border-blue-700 h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
          <h3 className="font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-cyan-400" /> 报告预览</h3>
          <button onClick={() => setShowReportPreview(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          <div className="bg-slate-800/50 border border-blue-700/30 rounded-xl p-6 mb-4">
            <div className="text-center mb-4">
              <div className="w-16 h-20 mx-auto bg-gradient-to-b from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 rounded-lg flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-cyan-400" />
              </div>
              <div className="font-medium">{reportConfig.name}</div>
              <div className="text-xs text-slate-400">{reportConfig.period} · {reportConfig.format.toUpperCase()}</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2 bg-slate-700/30 rounded">
                <span className="text-slate-400">核算标准</span>
                <span>{reportConfig.standard}</span>
              </div>
              <div className="flex justify-between p-2 bg-slate-700/30 rounded">
                <span className="text-slate-400">组织范围</span>
                <span>{reportConfig.scope}</span>
              </div>
              {calculationResult && (
                <>
                  <div className="flex justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-400">总排放量</span>
                    <span className="text-cyan-400 font-bold">{calculationResult.totalEmission} tCO₂</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-400">范围一</span>
                    <span>{calculationResult.scope1Emission} tCO₂</span>
                  </div>
                  <div className="flex justify-between p-2 bg-slate-700/30 rounded">
                    <span className="text-slate-400">范围二</span>
                    <span>{calculationResult.scope2Emission} tCO₂</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <button onClick={handleDownload} className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all">
              <Download className="w-4 h-4" /> 下载报告
            </button>
            <button onClick={handleRegenerate} className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
              <RotateCcw className="w-4 h-4" /> 重新生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== 新增数据源表单弹窗 ==========
export function AddRecordModal() {
  const { showAddModal, setShowAddModal, addRecord } = useCalculationStore();
  const [form, setForm] = React.useState({
    sourceCode: 'S-A04',
    sourceName: '',
    category: 'energy' as DataSourceRecord['category'],
    emissionScope: 'scope2' as DataSourceRecord['emissionScope'],
    dataClassification: '外购电力',
    campus: '主校区' as DataSourceRecord['campus'],
    period: '2026-06',
    value: '',
    unit: 'kWh',
    source: 'manual' as DataSourceRecord['source'],
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!showAddModal) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.sourceName.trim()) errs.sourceName = '请输入数据源名称';
    if (!form.value || isNaN(Number(form.value))) errs.value = '请输入有效数值';
    if (!form.period) errs.period = '请选择月份';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const newRecord: DataSourceRecord = {
      id: `ds-${Date.now()}`,
      sourceCode: form.sourceCode as DataSourceRecord['sourceCode'],
      sourceName: form.sourceName,
      category: form.category,
      emissionScope: form.emissionScope,
      dataClassification: form.dataClassification,
      campus: form.campus,
      period: form.period,
      value: Number(form.value),
      unit: form.unit,
      source: form.source,
      status: 'normal',
      auditStatus: 'pending',
      evidenceStatus: 'missing',
      attachmentCount: 0,
      relatedEvidences: [],
      modifyRecords: [],
      auditRecords: [{ time: new Date().toLocaleString('zh-CN'), operator: '当前用户', action: '新增', remark: '手动录入' }],
      updatedAt: new Date().toISOString().split('T')[0],
      updatedBy: '当前用户',
    };
    addRecord(newRecord);
    setShowAddModal(false);
    setForm({ sourceCode: 'S-A04', sourceName: '', category: 'energy', emissionScope: 'scope2', dataClassification: '外购电力', campus: '主校区', period: '2026-06', value: '', unit: 'kWh', source: 'manual' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">新增数据源</h3>
          <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">数据源名称 <span className="text-red-400">*</span></label>
              <input value={form.sourceName} onChange={(e) => setForm({ ...form, sourceName: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              {errors.sourceName && <p className="text-xs text-red-400 mt-1">{errors.sourceName}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">编码</label>
              <select value={form.sourceCode} onChange={(e) => setForm({ ...form, sourceCode: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="S-A04">S-A04 外购电力</option>
                <option value="S-A05">S-A05 外购热力</option>
                <option value="S-A06">S-A06 天然气</option>
                <option value="S-A07">S-A07 燃油</option>
                <option value="S-A11">S-A11 用水</option>
                <option value="S-A12">S-A12 制冷剂</option>
                <option value="S-A15">S-A15 通勤</option>
                <option value="S-A16">S-A16 废弃物</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">数值 <span className="text-red-400">*</span></label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">单位</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="kWh">kWh</option>
                <option value="m³">m³</option>
                <option value="GJ">GJ</option>
                <option value="L">L</option>
                <option value="kg">kg</option>
                <option value="t">t</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">排放范围</label>
              <select value={form.emissionScope} onChange={(e) => setForm({ ...form, emissionScope: e.target.value as DataSourceRecord['emissionScope'] })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="scope1">范围一</option>
                <option value="scope2">范围二</option>
                <option value="scope3">范围三</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">校区</label>
              <select value={form.campus} onChange={(e) => setForm({ ...form, campus: e.target.value as DataSourceRecord['campus'] })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="主校区">主校区</option>
                <option value="东校区">东校区</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">月份 <span className="text-red-400">*</span></label>
              <input type="month" value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              {errors.period && <p className="text-xs text-red-400 mt-1">{errors.period}</p>}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">数据来源</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as DataSourceRecord['source'] })} className="w-full bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                <option value="manual">手动填报</option>
                <option value="bill">账单录入</option>
                <option value="meter">仪表采集</option>
                <option value="import">批量导入</option>
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button onClick={handleSubmit} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">保存</button>
        </div>
      </div>
    </div>
  );
}

// ========== 编辑数据源弹窗 ==========
export function EditRecordModal() {
  const { showEditModal, setShowEditModal, editRecordId, getRecordById, updateRecord, batchLocked } = useCalculationStore();
  const record = editRecordId ? getRecordById(editRecordId) : undefined;
  const [value, setValue] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (record) setValue(String(record.value ?? ''));
  }, [record]);

  if (!showEditModal || !record) return null;

  const handleSubmit = () => {
    if (batchLocked) return;
    const errs: Record<string, string> = {};
    if (!value || isNaN(Number(value))) errs.value = '请输入有效数值';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateRecord(record.id, {
      value: Number(value),
      modifyRecords: [
        ...(record.modifyRecords ?? []),
        { time: new Date().toLocaleString('zh-CN'), operator: '当前用户', field: 'value', oldValue: String(record.value ?? ''), newValue: value },
      ],
    });
    setShowEditModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">编辑数据源</h3>
          <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div className="p-3 bg-slate-800/50 rounded-lg">
            <div className="text-sm text-slate-400">数据源</div>
            <div className="font-medium">{record.sourceName}</div>
            <div className="text-xs text-slate-500">{record.sourceCode} · {record.period} · {record.unit}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">活动数据值 <span className="text-red-400">*</span></label>
            <div className="flex gap-2">
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} disabled={batchLocked} className="flex-1 bg-slate-800 border border-blue-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50" />
              <span className="flex items-center text-sm text-slate-400">{record.unit}</span>
            </div>
            {errors.value && <p className="text-xs text-red-400 mt-1">{errors.value}</p>}
          </div>
          {batchLocked && <p className="text-xs text-red-400">当前批次已锁定，无法编辑</p>}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">取消</button>
          <button onClick={handleSubmit} disabled={batchLocked} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  );
}

// ========== 批量导入弹窗 ==========
export function ImportModal() {
  const { showImportModal, setShowImportModal, addRecord } = useCalculationStore();
  const [step, setStep] = React.useState<'upload' | 'mapping' | 'validating' | 'result'>('upload');
  const [fileName, setFileName] = React.useState('');
  const [importResult, setImportResult] = React.useState({ success: 0, failed: 0, total: 0 });

  if (!showImportModal) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setStep('mapping');
    }
  };

  const handleStartImport = () => {
    setStep('validating');
    setTimeout(() => {
      // 模拟导入结果
      const successCount = 5;
      const failCount = 1;
      setImportResult({ success: successCount, failed: failCount, total: successCount + failCount });
      // 模拟添加导入的记录
      for (let i = 0; i < successCount; i++) {
        addRecord({
          id: `ds-import-${Date.now()}-${i}`,
          sourceCode: 'S-A04',
          sourceName: `导入数据源 ${i + 1}`,
          category: 'energy',
          emissionScope: 'scope2',
          dataClassification: '外购电力',
          campus: '主校区',
          period: '2026-06',
          value: 10000 * (i + 1),
          unit: 'kWh',
          source: 'import',
          status: 'normal',
          auditStatus: 'pending',
          evidenceStatus: 'missing',
          attachmentCount: 0,
          relatedEvidences: [],
          modifyRecords: [],
          auditRecords: [{ time: new Date().toLocaleString('zh-CN'), operator: '当前用户', action: '导入', remark: '批量导入' }],
          updatedAt: new Date().toISOString().split('T')[0],
          updatedBy: '当前用户',
        });
      }
      setStep('result');
    }, 2000);
  };

  const handleClose = () => {
    setShowImportModal(false);
    setStep('upload');
    setFileName('');
  };

  const downloadTemplate = () => {
    const template = '数据源编码,数据源名称,排放范围,数据分类,校区,月份,数值,单位,数据来源\nS-A04,示例用电,scope2,外购电力,主校区,2026-06,100000,kWh,meter';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '数据源导入模板.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-700 rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">批量导入</h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2 mb-6">
          {['上传文件', '字段映射', '数据校验', '导入结果'].map((s, i) => {
            const stepKeys = ['upload', 'mapping', 'validating', 'result'];
            const idx = stepKeys.indexOf(step);
            return (
              <React.Fragment key={i}>
                <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                  i <= idx ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'
                }`}>{i + 1}</div>
                {i < 3 && <div className={`flex-1 h-0.5 ${i < idx ? 'bg-cyan-500/30' : 'bg-slate-700'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {step === 'upload' && (
          <div className="space-y-4">
            <button onClick={downloadTemplate} className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm flex items-center justify-center gap-2 transition-all">
              <Download className="w-4 h-4" /> 下载导入模板
            </button>
            <div className="border-2 border-dashed border-blue-700 rounded-xl p-8 text-center">
              <Upload className="w-10 h-10 mx-auto mb-3 text-slate-500" />
              <p className="text-sm text-slate-400 mb-3">点击选择或拖拽文件到此处</p>
              <label className="inline-flex px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium cursor-pointer transition-all">
                选择文件
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileSelect} className="hidden" />
              </label>
              <p className="text-xs text-slate-500 mt-2">支持 CSV、Excel 格式</p>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-800/50 rounded-lg flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-sm">{fileName}</span>
            </div>
            <div className="text-sm text-slate-300 mb-2">字段映射预览：</div>
            <div className="space-y-2 text-sm">
              {['数据源编码→sourceCode', '数据源名称→sourceName', '排放范围→emissionScope', '数值→value', '单位→unit', '月份→period'].map((m) => (
                <div key={m} className="flex items-center gap-2 p-2 bg-slate-800/30 rounded">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400">{m.split('→')[0]}</span>
                  <span className="text-slate-600">→</span>
                  <span className="text-cyan-400">{m.split('→')[1]}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('upload')} className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-sm transition-all">上一步</button>
              <button onClick={handleStartImport} className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">开始导入</button>
            </div>
          </div>
        )}

        {step === 'validating' && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-slate-400">正在校验和导入数据...</p>
          </div>
        )}

        {step === 'result' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="font-medium">导入完成</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                <div className="text-lg font-bold">{importResult.total}</div>
                <div className="text-xs text-slate-400">总计</div>
              </div>
              <div className="p-3 bg-green-900/20 rounded-lg text-center">
                <div className="text-lg font-bold text-green-400">{importResult.success}</div>
                <div className="text-xs text-slate-400">成功</div>
              </div>
              <div className="p-3 bg-red-900/20 rounded-lg text-center">
                <div className="text-lg font-bold text-red-400">{importResult.failed}</div>
                <div className="text-xs text-slate-400">失败</div>
              </div>
            </div>
            <button onClick={handleClose} className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg text-sm font-medium transition-all">完成</button>
          </div>
        )}
      </div>
    </div>
  );
}
