"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Download, Upload, Eye, History, Trash2,
  FileText, Calendar, User, Shield, Clock, AlertTriangle,
  CheckCircle, XCircle, RotateCcw, Send
} from "lucide-react";
import { getMaterialById, deleteMaterial, getLogsByMaterial, addLog, formatFileSize } from "@/lib/compliance-db";
import { MaterialStatusTag } from "@/components/compliance/material-status-tag";
import { ConfirmDeleteModal } from "@/components/compliance/confirm-delete-modal";
import { FilePreviewDrawer } from "@/components/compliance/file-preview-drawer";
import { MaterialUploadDrawer } from "@/components/compliance/material-upload-drawer";
import { VersionDrawer } from "@/components/compliance/version-drawer";
import { AuditTimeline } from "@/components/compliance/audit-timeline";
import type { MaterialRecord, OperationLog, FileVersion } from "@/types/compliance";

export default function MaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [material, setMaterial] = useState<MaterialRecord | null>(null);
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [m, l] = await Promise.all([getMaterialById(id), getLogsByMaterial(id)]);
      setMaterial(m ?? null);
      setLogs(l);
    } catch (e) {
      console.error("Failed to load material:", e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async () => {
    if (!material) return;
    await deleteMaterial(material.id);
    await addLog({
      id: crypto.randomUUID(),
      materialId: material.id,
      action: "delete",
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
      description: `删除材料：${material.name}`,
      version: material.version,
    });
    router.push("/compliance/materials");
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

  const handleReplace = (m: MaterialRecord) => { setShowReplace(true); };
  const handleViewVersions = (m: MaterialRecord) => { setShowVersions(true); };
  const handleSubmitReview = async (m: MaterialRecord) => {
    await addLog({
      id: crypto.randomUUID(),
      materialId: m.id,
      action: "submitted_review",
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
      description: `提交审核：${m.name}`,
      version: m.version,
    });
    loadData();
  };

  const handleVersionPreview = (v: FileVersion) => {
    if (!v.fileData) return;
    const blob = new Blob([v.fileData]);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const handleVersionDownload = (v: FileVersion) => {
    if (!v.fileData) return;
    const blob = new Blob([v.fileData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = v.fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleVersionRestore = async (v: FileVersion) => {
    if (!material) return;
    await addLog({
      id: crypto.randomUUID(),
      materialId: material.id,
      action: "restored",
      operator: "当前用户",
      operatedAt: new Date().toISOString(),
      description: `恢复版本 V${v.version}：${v.fileName}`,
      version: v.version,
    });
    setShowVersions(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">材料不存在或已被删除</p>
          <button onClick={() => router.push("/compliance/materials")} className="mt-4 text-blue-400 hover:text-blue-300 text-sm">
            ← 返回材料档案库
          </button>
        </div>
      </div>
    );
  }

  const titleLabel = material.titleType === "gb29117" ? "GB/T 29117-2025" : material.titleType === "gb51356" ? "GB/T 51356-2019" : material.titleType === "db111404" ? "DB11/T 1404-2025" : material.titleType;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/compliance/materials")} className="text-slate-400 hover:text-slate-200 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{material.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <MaterialStatusTag status={material.status} />
                <span className="text-xs text-slate-500">版本 V{material.version ?? 1}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {material.fileData && (
              <>
                <button onClick={() => setShowPreview(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
                  <Eye className="w-4 h-4" /> 预览
                </button>
                <button onClick={() => handleDownload(material)} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" /> 下载
                </button>
              </>
            )}
            <button onClick={() => setShowReplace(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 rounded-lg text-sm font-medium transition-colors">
              <Upload className="w-4 h-4" /> 替换
            </button>
            <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm font-medium transition-colors">
              <Trash2 className="w-4 h-4" /> 删除
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left: Preview Area */}
          <div className="col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden" style={{ minHeight: 500 }}>
              {material.fileData ? (
                material.fileType?.startsWith("image/") ? (
                  <div className="flex items-center justify-center h-full p-8">
                    <img
                      src={URL.createObjectURL(new Blob([material.fileData]))}
                      alt={material.fileName || "预览"}
                      className="max-w-full max-h-[600px] object-contain rounded-lg"
                    />
                  </div>
                ) : material.fileType === "application/pdf" ? (
                  <iframe
                    src={URL.createObjectURL(new Blob([material.fileData], { type: "application/pdf" }))}
                    className="w-full h-full"
                    style={{ minHeight: 600 }}
                    title={material.fileName || "PDF 预览"}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-16">
                    <FileText className="w-16 h-16 text-slate-600 mb-4" />
                    <p className="text-slate-400 mb-2">该文件格式暂不支持在线预览</p>
                    <p className="text-sm text-slate-500 mb-4">{material.fileName} ({material.fileType})</p>
                    <button onClick={() => handleDownload(material)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                      <Download className="w-4 h-4" /> 下载文件
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-16">
                  <FileText className="w-16 h-16 text-slate-600 mb-4" />
                  <p className="text-slate-400">尚未上传文件</p>
                  <button onClick={() => setShowReplace(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                    <Upload className="w-4 h-4" /> 上传文件
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" /> 基础信息
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "材料编号", value: material.materialCode || "—" },
                  { label: "发证机构", value: material.issuer || "—" },
                  { label: "签发日期", value: material.issueDate ? new Date(material.issueDate).toLocaleDateString("zh-CN") : "—" },
                  { label: "所属标准", value: titleLabel },
                  { label: "关联指标", value: material.indicatorId || "—" },
                  { label: "保密等级", value: material.securityLevel === "confidential" ? "机密" : material.securityLevel === "internal" ? "内部" : "公开" },
                  { label: "备注", value: material.notes || "—" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-slate-300 text-right max-w-[180px] truncate">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validity Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> 有效期信息
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "有效期开始", value: material.validFrom ? new Date(material.validFrom).toLocaleDateString("zh-CN") : "—" },
                  { label: "有效期结束", value: material.isPermanent ? "长期有效" : (material.validTo ? new Date(material.validTo).toLocaleDateString("zh-CN") : "—") },
                  { label: "是否长期", value: material.isPermanent ? "是" : "否" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-slate-300">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* File Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4" /> 文件信息
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  { label: "文件名称", value: material.fileName || "—" },
                  { label: "文件类型", value: material.fileType || "—" },
                  { label: "文件大小", value: material.fileSize != null ? formatFileSize(material.fileSize) : "—" },
                  { label: "上传人员", value: material.uploadedBy || "—" },
                  { label: "上传时间", value: material.uploadedAt ? new Date(material.uploadedAt).toLocaleString("zh-CN") : "—" },
                  { label: "当前版本", value: `V${material.version ?? 1}` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-slate-500">{row.label}</span>
                    <span className="text-slate-300 text-right max-w-[180px] truncate">{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setShowVersions(true)} className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors">
                <History className="w-4 h-4" /> 查看历史版本
              </button>
            </div>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="mt-6">
          <AuditTimeline materialId={material.id} />
        </div>
      </div>

      {/* Modals */}
      {showPreview && material && (
        <FilePreviewDrawer
          open={true}
          onClose={() => setShowPreview(false)}
          material={material}
          onDownload={handleDownload}
          onReplace={handleReplace}
          onDelete={(m) => setShowDelete(true)}
          onViewVersions={handleViewVersions}
          onSubmitReview={handleSubmitReview}
        />
      )}
      {showReplace && material && (
        <MaterialUploadDrawer
          open={true}
          onClose={() => setShowReplace(false)}
          material={material}
          onUploadComplete={() => { setShowReplace(false); loadData(); }}
        />
      )}
      {showVersions && material && (
        <VersionDrawer
          open={true}
          onClose={() => setShowVersions(false)}
          materialId={material.id}
          onRestore={handleVersionRestore}
          onPreview={handleVersionPreview}
          onDownload={handleVersionDownload}
        />
      )}
      {showDelete && (
        <ConfirmDeleteModal
          open={true}
          onClose={() => setShowDelete(false)}
          onConfirm={handleDelete}
          title="确认删除材料"
          description={`确定要删除材料「${material.name}」吗？此操作不可撤销，关联的版本记录和操作日志也将一并删除。`}
          warning="删除后数据无法恢复，请谨慎操作。"
        />
      )}
    </div>
  );
}
