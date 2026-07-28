'use client';

import React, { useMemo } from 'react';
import { useCalculationStore, type SortField } from '@/stores/calculation-store';
import type { DataSourceRecord, DataSourceStatus, AuditStatus, EvidenceStatus } from '@/types';
import {
  Download, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

// SortHeader - defined outside the component to avoid React Compiler issues
function SortHeaderInner({ field, children, currentSortField, currentSortOrder, onSort }: { field: SortField; children: React.ReactNode; currentSortField: SortField; currentSortOrder: string; onSort: (f: SortField) => void }) {
  return (
    <th className="px-4 py-3 text-xs font-medium text-slate-400 cursor-pointer hover:text-cyan-400 select-none" onClick={() => onSort(field)}>
      <div className="flex items-center gap-1">
        {children}
        {currentSortField === field && (currentSortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </div>
    </th>
  );
}

export function DataSourceTable() {
  const {
    getFilteredRecords, currentPage, pageSize, setCurrentPage, setPageSize,
    sortField, sortOrder, setSortField,
    selectedIds, toggleSelectId, selectAllVisible, clearSelection,
    setShowDetailDrawer, setDetailRecordId,
    setShowEditModal, setEditRecordId,
    setShowDeleteConfirm, setDeleteRecordId,
    setShowAddModal, setShowImportModal, setShowFilterDrawer,
    activeFilterCount, batchLocked,
    records, period,
  } = useCalculationStore();

  const filteredRecords = useMemo(() => getFilteredRecords(), [getFilteredRecords, records, period]);

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pagedRecords = filteredRecords.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // 全选状态
  const allSelected = pagedRecords.length > 0 && pagedRecords.every((r) => selectedIds.includes(r.id));
  const someSelected = pagedRecords.some((r) => selectedIds.includes(r.id)) && !allSelected;

  // CSV导出
  const handleExport = () => {
    const headers = ['编码', '数据源名称', '分类', '排放范围', '校区', '月份', '数值', '单位', '排放值(tCO₂)', '数据来源', '数据状态', '审核状态', '凭证状态'];
    const rows = filteredRecords.map((r) => [
      r.sourceCode, r.sourceName, r.dataClassification ?? '', r.emissionScope ?? '', r.campus ?? '',
      r.period, String(r.value ?? ''), r.unit, String(r.emissionValue ?? ''),
      r.source, r.status, r.auditStatus ?? '', r.evidenceStatus ?? '',
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `数据源明细_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusLabel = (status: DataSourceStatus) => {
    const map: Record<DataSourceStatus, { label: string; cls: string }> = {
      normal: { label: '正常', cls: 'bg-green-500/20 text-green-300' },
      missing: { label: '缺失', cls: 'bg-red-500/20 text-red-300' },
      abnormal: { label: '异常', cls: 'bg-orange-500/20 text-orange-300' },
      pending_review: { label: '待复核', cls: 'bg-yellow-500/20 text-yellow-300' },
      locked: { label: '已锁定', cls: 'bg-slate-500/20 text-slate-300' },
      approved: { label: '已通过', cls: 'bg-green-500/20 text-green-300' },
    };
    return map[status] ?? { label: status, cls: 'bg-slate-700 text-slate-300' };
  };

  const getAuditLabel = (status?: AuditStatus) => {
    const map: Record<AuditStatus, { label: string; cls: string }> = {
      pending: { label: '待审核', cls: 'bg-yellow-500/20 text-yellow-300' },
      approved: { label: '已通过', cls: 'bg-green-500/20 text-green-300' },
      rejected: { label: '已退回', cls: 'bg-red-500/20 text-red-300' },
    };
    return status ? (map[status] ?? { label: '-', cls: 'bg-slate-700 text-slate-300' }) : { label: '-', cls: 'bg-slate-700 text-slate-300' };
  };

  const getEvidenceLabel = (status?: EvidenceStatus) => {
    const map: Record<EvidenceStatus, { label: string; cls: string }> = {
      complete: { label: '完整', cls: 'bg-green-500/20 text-green-300' },
      incomplete: { label: '不完整', cls: 'bg-yellow-500/20 text-yellow-300' },
      missing: { label: '缺失', cls: 'bg-red-500/20 text-red-300' },
    };
    return status ? (map[status] ?? { label: '-', cls: 'bg-slate-700 text-slate-300' }) : { label: '-', cls: 'bg-slate-700 text-slate-300' };
  };

  return (
    <div className="bg-slate-900/60 border border-blue-900/30 rounded-xl overflow-hidden">
      {/* 表格头部 */}
      <div className="px-4 py-3 border-b border-blue-900/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">数据源明细列表</span>
          <span className="text-xs text-slate-500">共 {filteredRecords.length} 条</span>
          {selectedIds.length > 0 && (
            <span className="text-xs text-cyan-400">已选 {selectedIds.length} 条</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)} disabled={batchLocked} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/30 rounded-lg text-xs text-cyan-300 transition-all disabled:opacity-50">
            + 新增
          </button>
          <button onClick={() => setShowImportModal(true)} disabled={batchLocked} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs transition-all disabled:opacity-50">
            批量导入
          </button>
          <button onClick={() => setShowFilterDrawer(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs transition-all relative">
            筛选 {activeFilterCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-white rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>}
          </button>
          <button onClick={handleExport} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-blue-700 rounded-lg text-xs transition-all">
            <Download className="w-3 h-3" /> 导出
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50 text-left">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} ref={(el) => { if (el) el.indeterminate = someSelected; }} onChange={() => allSelected ? clearSelection() : selectAllVisible(pagedRecords.map((r) => r.id))} className="rounded" />
              </th>
              <SortHeaderInner field="sourceCode" currentSortField={sortField} currentSortOrder={sortOrder} onSort={setSortField}>编码</SortHeaderInner>
              <SortHeaderInner field="sourceName" currentSortField={sortField} currentSortOrder={sortOrder} onSort={setSortField}>数据源名称</SortHeaderInner>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">分类</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">范围</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">校区</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">月份</th>
              <SortHeaderInner field="value" currentSortField={sortField} currentSortOrder={sortOrder} onSort={setSortField}>数值</SortHeaderInner>
              <SortHeaderInner field="emissionValue" currentSortField={sortField} currentSortOrder={sortOrder} onSort={setSortField}>排放值</SortHeaderInner>
              <SortHeaderInner field="status" currentSortField={sortField} currentSortOrder={sortOrder} onSort={setSortField}>数据状态</SortHeaderInner>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">审核</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">凭证</th>
              <th className="px-4 py-3 text-xs font-medium text-slate-400">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-900/20">
            {pagedRecords.map((item) => {
              const statusInfo = getStatusLabel(item.status);
              const auditInfo = getAuditLabel(item.auditStatus);
              const evidenceInfo = getEvidenceLabel(item.evidenceStatus);
              return (
                <tr key={item.id} className={`hover:bg-slate-800/30 transition-colors ${selectedIds.includes(item.id) ? 'bg-cyan-900/10' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelectId(item.id)} className="rounded" />
                  </td>
                  <td className="px-4 py-3 text-sm text-cyan-400 font-mono">{item.sourceCode}</td>
                  <td className="px-4 py-3 text-sm">{item.sourceName}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-300">{item.dataClassification ?? '-'}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">
                    {item.emissionScope === 'scope1' ? '范围一' : item.emissionScope === 'scope2' ? '范围二' : item.emissionScope === 'scope3' ? '范围三' : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-400">{item.campus ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-slate-400">{item.period}</td>
                  <td className="px-4 py-3 text-sm font-mono">{item.value !== undefined ? item.value.toLocaleString() : '-'} <span className="text-slate-500 text-xs">{item.unit}</span></td>
                  <td className="px-4 py-3 text-sm font-mono">{item.emissionValue !== undefined ? `${item.emissionValue}` : '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusInfo.cls}`}>{statusInfo.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${auditInfo.cls}`}>{auditInfo.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${evidenceInfo.cls}`}>{evidenceInfo.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setDetailRecordId(item.id); setShowDetailDrawer(true); }} className="p-1 hover:bg-slate-700 rounded transition-colors" title="查看详情">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => { setEditRecordId(item.id); setShowEditModal(true); }} disabled={batchLocked || item.status === 'locked'} className="p-1 hover:bg-slate-700 rounded transition-colors disabled:opacity-30" title="编辑">
                        <Pencil className="w-4 h-4 text-slate-400" />
                      </button>
                      <button onClick={() => { setDeleteRecordId(item.id); setShowDeleteConfirm(true); }} disabled={batchLocked || item.status === 'locked'} className="p-1 hover:bg-slate-700 rounded transition-colors disabled:opacity-30" title="删除">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {pagedRecords.length === 0 && (
              <tr>
                <td colSpan={13} className="px-4 py-12 text-center text-slate-500">暂无匹配数据</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="px-4 py-3 border-t border-blue-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          每页
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="bg-slate-800 border border-blue-700 rounded px-2 py-1 text-xs">
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          条
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>第 {safeCurrentPage}/{totalPages} 页</span>
          <button onClick={() => setCurrentPage(1)} disabled={safeCurrentPage <= 1} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))} disabled={safeCurrentPage <= 1} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))} disabled={safeCurrentPage >= totalPages} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setCurrentPage(totalPages)} disabled={safeCurrentPage >= totalPages} className="p-1 hover:bg-slate-700 rounded disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
