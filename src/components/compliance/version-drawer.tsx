"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, Eye, RotateCcw, CheckCircle, AlertTriangle } from "lucide-react";
import { getVersionsByMaterial, setCurrentVersion, formatFileSize } from "@/lib/compliance-db";
import type { FileVersion } from "@/types/compliance";

interface VersionDrawerProps {
  open: boolean;
  onClose: () => void;
  materialId: string;
  onRestore: (version: FileVersion) => void;
  onPreview: (version: FileVersion) => void;
  onDownload: (version: FileVersion) => void;
}

export function VersionDrawer({
  open,
  onClose,
  materialId,
  onRestore,
  onPreview,
  onDownload,
}: VersionDrawerProps) {
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      getVersionsByMaterial(materialId).then(setVersions);
    }
  }, [open, materialId]);

  const handleRestore = useCallback(
    async (version: FileVersion) => {
      setRestoringId(version.id);
      await setCurrentVersion(materialId, version.id);
      onRestore(version);
      setRestoringId(null);
      setConfirmRestore(null);
      // 刷新列表
      getVersionsByMaterial(materialId).then(setVersions);
    },
    [materialId, onRestore]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-[560px] h-full bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">历史版本</h2>
            <p className="text-sm text-white/40 mt-0.5">共 {versions.length} 个版本</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`bg-white/5 border rounded-xl p-4 transition-all ${
                version.isCurrent ? "border-blue-500/30 bg-blue-500/5" : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">V{version.version}.0</span>
                  {version.isCurrent && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/15 text-blue-400 border border-blue-500/30">
                      当前版本
                    </span>
                  )}
                </div>
                <span className="text-xs text-white/30">
                  {new Date(version.uploadedAt).toLocaleString("zh-CN")}
                </span>
              </div>

              <div className="space-y-1 mb-3">
                <div className="text-sm text-white/70">{version.fileName}</div>
                <div className="text-xs text-white/40">
                  {version.fileType} · {formatFileSize(version.fileSize)}
                </div>
                {version.changeNote && (
                  <div className="text-xs text-white/50 mt-1">变更说明：{version.changeNote}</div>
                )}
                <div className="text-xs text-white/30">上传人员：{version.uploadedBy}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPreview(version)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
                >
                  <Eye className="w-3 h-3" /> 预览
                </button>
                <button
                  onClick={() => onDownload(version)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3 h-3" /> 下载
                </button>
                {!version.isCurrent && (
                  confirmRestore === version.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleRestore(version)}
                        disabled={restoringId === version.id}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-600/20 text-amber-400 text-xs hover:bg-amber-600/30 transition-colors"
                      >
                        {restoringId === version.id ? "恢复中..." : "确认恢复"}
                      </button>
                      <button
                        onClick={() => setConfirmRestore(null)}
                        className="px-2 py-1 text-xs text-white/30 hover:text-white/50"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRestore(version.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> 恢复
                    </button>
                  )
                )}
              </div>
            </div>
          ))}

          {versions.length === 0 && (
            <div className="text-center py-12 text-white/30 text-sm">暂无历史版本</div>
          )}
        </div>
      </div>
    </div>
  );
}
