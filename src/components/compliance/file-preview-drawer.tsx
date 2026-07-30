"use client";

import { useState, useMemo, useCallback } from "react";
import {
  X, Download, RotateCcw, History, Send, Trash2,
  ZoomIn, ZoomOut, RotateCw, Maximize2, ChevronLeft, ChevronRight,
  FileText, Image, FileSpreadsheet,
} from "lucide-react";
import { formatFileSize, getStatusLabel, getStatusColor } from "@/lib/compliance-db";
import type { MaterialRecord } from "@/types/compliance";

interface FilePreviewDrawerProps {
  open: boolean;
  onClose: () => void;
  material: MaterialRecord;
  onDownload: (material: MaterialRecord) => void;
  onReplace: (material: MaterialRecord) => void;
  onDelete: (material: MaterialRecord) => void;
  onViewVersions: (material: MaterialRecord) => void;
  onSubmitReview: (material: MaterialRecord) => void;
}

export function FilePreviewDrawer({
  open,
  onClose,
  material,
  onDownload,
  onReplace,
  onDelete,
  onViewVersions,
  onSubmitReview,
}: FilePreviewDrawerProps) {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const objectUrl = useMemo(() => {
    if (material.fileData) {
      return URL.createObjectURL(new Blob([material.fileData], { type: material.fileType }));
    }
    return null;
  }, [material.fileData, material.fileType]);

  const isImage = material.fileType?.startsWith("image/");
  const isPdf = material.fileType === "application/pdf";
  const isDoc = material.fileType?.includes("word") || material.fileType?.includes("document");
  const isExcel = material.fileType?.includes("excel") || material.fileType?.includes("spreadsheet");

  const canPreview = isImage || isPdf;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 25, 25));
  const handleRotate = () => setRotation((r) => r + 90);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <div className="relative w-[900px] h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col">
        {/* 头部 */}
        <div className="shrink-0 border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-semibold text-white">{material.fileName || material.name}</h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-white/40">{material.fileType}</span>
                  <span className="text-xs text-white/20">·</span>
                  <span className="text-xs text-white/40">{material.fileSize ? formatFileSize(material.fileSize) : "-"}</span>
                  <span className="text-xs text-white/20">·</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getStatusColor(material.status)}`}>
                    {getStatusLabel(material.status)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canPreview && (
                <>
                  <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40" title="缩小">
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-white/40 w-10 text-center">{zoom}%</span>
                  <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40" title="放大">
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button onClick={handleRotate} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40" title="旋转">
                    <RotateCw className="w-4 h-4" />
                  </button>
                </>
              )}
              <div className="w-px h-5 bg-white/10 mx-1" />
              <button onClick={() => onDownload(material)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-blue-400" title="下载">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => onReplace(material)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-amber-400" title="替换">
                <RotateCcw className="w-4 h-4" />
              </button>
              <button onClick={() => onViewVersions(material)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-purple-400" title="历史版本">
                <History className="w-4 h-4" />
              </button>
              <button onClick={() => onSubmitReview(material)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-emerald-400" title="提交审核">
                <Send className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400" title="删除">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* 信息栏 */}
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span>上传时间：{material.uploadedAt ? new Date(material.uploadedAt).toLocaleString("zh-CN") : "-"}</span>
            <span>上传人员：{material.uploadedBy || "-"}</span>
            <span>版本：V{material.version || 1}.0</span>
            {material.validTo && <span>有效期至：{material.validTo}</span>}
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 预览区 */}
          <div className="flex-1 flex items-center justify-center bg-slate-950/50 p-4 overflow-auto">
            {canPreview ? (
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s",
                }}
              >
                {isImage && objectUrl && (
                  <img src={objectUrl} alt={material.fileName} className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" />
                )}
                {isPdf && objectUrl && (
                  <iframe
                    src={objectUrl}
                    className="w-[700px] h-[80vh] rounded-lg shadow-2xl bg-white"
                    title={material.fileName || "PDF 预览"}
                  />
                )}
              </div>
            ) : (
              <div className="text-center">
                {isDoc && <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />}
                {isExcel && <FileSpreadsheet className="w-16 h-16 text-white/20 mx-auto mb-4" />}
                {!isDoc && !isExcel && <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />}
                <div className="text-white/50 text-sm mb-2">该文件暂不支持在线预览</div>
                <div className="text-white/30 text-xs mb-4">{material.fileName}</div>
                <button
                  onClick={() => onDownload(material)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors"
                >
                  <Download className="w-4 h-4" /> 下载文件
                </button>
              </div>
            )}
          </div>

          {/* 右侧属性栏 */}
          <div className="w-64 shrink-0 border-l border-white/10 p-4 overflow-y-auto space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">材料属性</h4>
              <div className="space-y-2">
                <AttrRow label="对应指标" value={material.indicatorId || "-"} />
                <AttrRow label="发证机构" value={material.issuer || "-"} />
                <AttrRow label="材料编号" value={material.materialCode || "-"} />
                <AttrRow label="有效期" value={material.validTo || (material.isPermanent ? "长期有效" : "-")} />
                <AttrRow label="保密等级" value={material.securityLevel === "confidential" ? "机密" : material.securityLevel === "internal" ? "内部" : "公开"} />
                <AttrRow label="备注" value={material.notes || "-"} />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">审核信息</h4>
              <div className="space-y-2">
                <AttrRow label="审核状态" value={getStatusLabel(material.reviewStatus || material.status)} />
                {material.reviewComment && <AttrRow label="审核意见" value={material.reviewComment} />}
                <AttrRow label="审核人员" value={material.reviewedBy || "-"} />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">版本信息</h4>
              <div className="space-y-2">
                <AttrRow label="当前版本" value={`V${material.version || 1}.0`} />
                <button
                  onClick={() => onViewVersions(material)}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  查看历史版本 →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-[400px] shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">确认删除</h3>
            <p className="text-sm text-white/50 mb-1">
              确定要删除材料「{material.fileName || material.name}」吗？
            </p>
            <p className="text-xs text-red-400 mb-6">此操作不可撤销，文件及所有历史版本将被永久删除。</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => { onDelete(material); setShowDeleteConfirm(false); }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AttrRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] text-white/30">{label}</div>
      <div className="text-xs text-white/70 mt-0.5 break-all">{value}</div>
    </div>
  );
}
