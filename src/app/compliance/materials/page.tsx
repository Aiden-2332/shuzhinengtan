"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Filter, Download, Upload, Eye, Trash2, History,
  FileText, ChevronDown, CheckSquare, Square, MoreHorizontal,
  ArrowUpDown, X, AlertTriangle, Package, FileBarChart
} from "lucide-react";
import { getAllMaterials, deleteMaterial, formatFileSize } from "@/lib/compliance-db";
import { MaterialStatusTag } from "@/components/compliance/material-status-tag";
import { ConfirmDeleteModal } from "@/components/compliance/confirm-delete-modal";
import { FilePreviewDrawer } from "@/components/compliance/file-preview-drawer";
import { MaterialUploadDrawer } from "@/components/compliance/material-upload-drawer";
import type { MaterialRecord } from "@/types/compliance";

const TITLE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "全部标准" },
  { value: "gb29117", label: "GB/T 29117-2025" },
  { value: "gb51356", label: "GB/T 51356-2019" },
  { value: "db111404", label: "DB11/T 1404-2025" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "全部状态" },
  { value: "uploaded", label: "已上传" },
  { value: "pending_review", label: "待审核" },
  { value: "approved", label: "审核通过" },
  { value: "rejected", label: "审核退回" },
  { value: "expiring_soon", label: "即将到期" },
  { value: "expired", label: "已过期" },
];

export default function MaterialsArchivePage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [filtered, setFiltered] = useState<MaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [titleFilter, setTitleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [previewMaterial, setPreviewMaterial] = useState<MaterialRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MaterialRecord | null>(null);
  const [replaceMaterial, setReplaceMaterial] = useState<MaterialRecord | null>(null);
  const [sortField, setSortField] = useState<"name" | "fileName" | "fileSize" | "uploadedAt">("uploadedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllMaterials();
      setMaterials(all);
    } catch (e) {
      console.error("Failed to load materials:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  useEffect(() => {
    let result = [...materials];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(m =>
        m.name.toLowerCase().includes(s) ||
        (m.fileName && m.fileName.toLowerCase().includes(s)) ||
        (m.materialCode && m.materialCode.toLowerCase().includes(s))
      );
    }
    if (titleFilter !== "all") {
      result = result.filter(m => m.titleType === titleFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter(m => m.status === statusFilter);
    }
    result.sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      const cmp = String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    setFiltered(result);
  }, [materials, search, titleFilter, statusFilter, sortField, sortDir]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(m => m.id)));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMaterial(deleteTarget.id);
    setDeleteTarget(null);
    loadMaterials();
  };

  const handleBatchDownload = async () => {
    const selected = materials.filter(m => selectedIds.has(m.id));
    if (selected.length === 0) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const m of selected) {
      if (m.fileData) {
        zip.file(m.fileName || `material-${m.id}`, m.fileData);
      }
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `合规材料批量导出_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: materials.length,
    uploaded: materials.filter(m => m.status === "uploaded" || m.status === "approved").length,
    pendingReview: materials.filter(m => m.status === "pending_review").length,
    expiringSoon: materials.filter(m => m.status === "expiring_soon").length,
    expired: materials.filter(m => m.status === "expired").length,
    missing: 0,
  };

  const handleDownload = (m: MaterialRecord) => {
    if (!m.fileData) return;
    const blob = new Blob([m.fileData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = m.fileName || `material-${m.id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReplace = (m: MaterialRecord) => { setReplaceMaterial(m); };
  const handleViewVersions = (m: MaterialRecord) => { router.push(`/compliance/materials/${m.id}`); };
  const handleSubmitReview = (m: MaterialRecord) => { router.push(`/compliance/materials/${m.id}`); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.push("/compliance")} className="text-sm text-slate-400 hover:text-slate-200 mb-1 flex items-center gap-1">
              ← 返回合规凭证看板
            </button>
            <h1 className="text-2xl font-bold text-white">材料档案库</h1>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button onClick={handleBatchDownload} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> 批量下载 ({selectedIds.size})
              </button>
            )}
            <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showFilters ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
              <Filter className="w-4 h-4" /> 筛选
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-3 mb-6">
          {[
            { label: "材料总数", value: stats.total, color: "text-blue-400" },
            { label: "已上传", value: stats.uploaded, color: "text-emerald-400" },
            { label: "待审核", value: stats.pendingReview, color: "text-sky-400" },
            { label: "即将到期", value: stats.expiringSoon, color: "text-amber-400" },
            { label: "已过期", value: stats.expired, color: "text-red-400" },
            { label: "缺失", value: stats.missing, color: "text-slate-400" },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="text-xs text-slate-400 mb-1">{s.label}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="搜索材料名称、编号、文件名..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <select value={titleFilter} onChange={e => setTitleFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500">
              {TITLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500">
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {(search || titleFilter !== "all" || statusFilter !== "all") && (
              <button onClick={() => { setSearch(""); setTitleFilter("all"); setStatusFilter("all"); }} className="flex items-center gap-1 px-3 py-2 text-sm text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" /> 清除筛选
              </button>
            )}
          </div>
        )}

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">暂无材料记录</p>
              <p className="text-sm text-slate-500 mt-1">上传材料后将在此处显示</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="w-10 px-4 py-3">
                      <button onClick={toggleAll} className="text-slate-500 hover:text-slate-300">
                        {selectedIds.size === filtered.length && filtered.length > 0 ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    {[
                      { key: "name" as const, label: "材料名称" },
                      { key: "fileName" as const, label: "文件名称" },
                      { key: "fileSize" as const, label: "大小" },
                      { key: "uploadedAt" as const, label: "上传时间" },
                    ].map(col => (
                      <th key={col.key} className="px-4 py-3 text-left">
                        <button onClick={() => { if (sortField === col.key) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(col.key); setSortDir("desc"); } }} className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 uppercase tracking-wider">
                          {col.label} <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">状态</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">有效期</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(m => (
                    <tr key={m.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${selectedIds.has(m.id) ? "bg-blue-900/20" : ""}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleSelect(m.id)} className="text-slate-500 hover:text-slate-300">
                          {selectedIds.has(m.id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => router.push(`/compliance/materials/${m.id}`)} className="text-left hover:text-blue-400 transition-colors">
                          <div className="text-sm font-medium text-slate-200">{m.name}</div>
                          <div className="text-xs text-slate-500">{m.materialCode || m.titleType}</div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-300">{m.fileName || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">{m.fileSize != null ? formatFileSize(m.fileSize) : "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-400">{m.uploadedAt ? new Date(m.uploadedAt).toLocaleDateString("zh-CN") : "—"}</td>
                      <td className="px-4 py-3"><MaterialStatusTag status={m.status} /></td>
                      <td className="px-4 py-3 text-sm text-slate-400">{m.validTo ? new Date(m.validTo).toLocaleDateString("zh-CN") : "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {m.fileData && (
                            <>
                              <button onClick={() => setPreviewMaterial(m)} className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors" title="预览">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDownload(m)} className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded transition-colors" title="下载">
                                <Download className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => setReplaceMaterial(m)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition-colors" title="替换">
                            <Upload className="w-4 h-4" />
                          </button>
                          <button onClick={() => router.push(`/compliance/materials/${m.id}`)} className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-700 rounded transition-colors" title="详情">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          <button onClick={() => setDeleteTarget(m)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors" title="删除">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Preview Drawer */}
      {previewMaterial && (
        <FilePreviewDrawer
          open={true}
          onClose={() => setPreviewMaterial(null)}
          material={previewMaterial}
          onDownload={handleDownload}
          onReplace={handleReplace}
          onDelete={(m) => setDeleteTarget(m)}
          onViewVersions={handleViewVersions}
          onSubmitReview={handleSubmitReview}
        />
      )}

      {/* Replace Drawer */}
      {replaceMaterial && (
        <MaterialUploadDrawer
          open={true}
          onClose={() => setReplaceMaterial(null)}
          material={replaceMaterial}
          onUploadComplete={() => { setReplaceMaterial(null); loadMaterials(); }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="确认删除材料"
          description={`确定要删除材料「${deleteTarget.name}」吗？此操作不可撤销，关联的版本记录和操作日志也将一并删除。`}
          warning="删除后数据无法恢复，请谨慎操作。"
        />
      )}
    </div>
  );
}
