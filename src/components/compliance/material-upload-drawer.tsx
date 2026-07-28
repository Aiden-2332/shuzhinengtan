"use client";

import { useState, useCallback, useRef } from "react";
import { X, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { FileDropzone } from "./file-dropzone";
import {
  generateId,
  formatFileSize,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/compliance-db";
import type { MaterialRecord } from "@/types/compliance";

interface UploadDrawerProps {
  open: boolean;
  onClose: () => void;
  material: MaterialRecord;
  onUploadComplete: (record: MaterialRecord) => void;
}

interface FormErrors {
  [key: string]: string;
}

export function MaterialUploadDrawer({ open, onClose, material, onUploadComplete }: UploadDrawerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    materialCode: material.materialCode || "",
    issuer: material.issuer || "",
    issueDate: material.issueDate || "",
    validFrom: material.validFrom || "",
    validTo: material.validTo || "",
    isPermanent: material.isPermanent || false,
    year: material.year || new Date().getFullYear().toString(),
    securityLevel: (material.securityLevel || "internal") as "public" | "internal" | "confidential",
    notes: material.notes || "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!selectedFile) {
      newErrors.file = "请选择要上传的文件";
    }

    if (!formData.materialCode.trim()) {
      newErrors.materialCode = "请输入材料编号";
    }
    if (!formData.issuer.trim()) {
      newErrors.issuer = "请输入发证机构";
    }
    if (!formData.issueDate) {
      newErrors.issueDate = "请选择签发日期";
    }
    if (!formData.validFrom) {
      newErrors.validFrom = "请选择有效期开始日期";
    }
    if (!formData.isPermanent && !formData.validTo) {
      newErrors.validTo = "请选择有效期结束日期";
    }
    if (
      formData.validFrom &&
      formData.validTo &&
      !formData.isPermanent &&
      new Date(formData.validTo) < new Date(formData.validFrom)
    ) {
      newErrors.validTo = "结束日期不能早于开始日期";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = useCallback(async () => {
    if (!validate() || !selectedFile) return;

    setUploading(true);
    setProgress(0);

    // 模拟真实上传进度
    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      // 读取文件为 ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();

      // 完成进度
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setProgress(100);

      const now = new Date().toISOString();
      const updatedRecord: MaterialRecord = {
        ...material,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileData: arrayBuffer,
        status: "uploaded",
        materialCode: formData.materialCode,
        issuer: formData.issuer,
        issueDate: formData.issueDate,
        validFrom: formData.validFrom,
        validTo: formData.isPermanent ? undefined : formData.validTo,
        isPermanent: formData.isPermanent,
        year: formData.year,
        securityLevel: formData.securityLevel,
        notes: formData.notes,
        uploadedAt: now,
        uploadedBy: "当前用户",
        version: (material.version || 0) + 1,
        updatedAt: now,
      };

      // 短暂延迟让用户看到 100%
      await new Promise((r) => setTimeout(r, 400));
      onUploadComplete(updatedRecord);
      onClose();
    } catch {
      setErrors({ file: "上传失败，请重试" });
    } finally {
      setUploading(false);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    }
  }, [selectedFile, formData, material, onUploadComplete, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* 抽屉 */}
      <div className="relative w-[560px] h-full bg-slate-900 border-l border-white/10 shadow-2xl overflow-y-auto">
        {/* 头部 */}
        <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">上传材料</h2>
            <p className="text-sm text-white/50 mt-0.5">{material.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* 文件选择区 */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              选择文件 <span className="text-red-400">*</span>
            </label>
            <FileDropzone
              onFileSelect={handleFileSelect}
              currentFile={selectedFile ? { file: selectedFile } : null}
              onRemove={handleRemoveFile}
            />
            {errors.file && (
              <div className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {errors.file}
              </div>
            )}
          </div>

          {/* 材料信息 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">
              材料信息
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">
                  材料编号 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.materialCode}
                  onChange={(e) => updateField("materialCode", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    errors.materialCode ? "border-red-500/50" : "border-white/10"
                  }`}
                  placeholder="如：ZL-2026-001"
                />
                {errors.materialCode && (
                  <div className="mt-1 text-xs text-red-400">{errors.materialCode}</div>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">
                  发证机构 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.issuer}
                  onChange={(e) => updateField("issuer", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    errors.issuer ? "border-red-500/50" : "border-white/10"
                  }`}
                  placeholder="如：北京市教育委员会"
                />
                {errors.issuer && (
                  <div className="mt-1 text-xs text-red-400">{errors.issuer}</div>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">
                  签发日期 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => updateField("issueDate", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    errors.issueDate ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                {errors.issueDate && (
                  <div className="mt-1 text-xs text-red-400">{errors.issueDate}</div>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">材料年度</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => updateField("year", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="如：2026"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">
                  有效期开始 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => updateField("validFrom", e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                    errors.validFrom ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                {errors.validFrom && (
                  <div className="mt-1 text-xs text-red-400">{errors.validFrom}</div>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">
                  有效期结束 {!formData.isPermanent && <span className="text-red-400">*</span>}
                </label>
                <input
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => updateField("validTo", e.target.value)}
                  disabled={formData.isPermanent}
                  className={`w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-30 ${
                    errors.validTo ? "border-red-500/50" : "border-white/10"
                  }`}
                />
                {errors.validTo && (
                  <div className="mt-1 text-xs text-red-400">{errors.validTo}</div>
                )}
              </div>

              <div className="col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPermanent}
                    onChange={(e) => updateField("isPermanent", e.target.checked)}
                    className="rounded border-white/20 bg-white/5"
                  />
                  <span className="text-sm text-white/60">长期有效</span>
                </label>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">保密等级</label>
                <select
                  value={formData.securityLevel}
                  onChange={(e) => updateField("securityLevel", e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="public">公开</option>
                  <option value="internal">内部</option>
                  <option value="confidential">机密</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-white/50 mb-1">备注</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
                  placeholder="补充说明..."
                />
              </div>
            </div>
          </div>

          {/* 上传进度 */}
          {uploading && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">
                  {progress >= 100 ? "上传完成" : "正在上传..."}
                </span>
                <span className="text-sm text-white/50">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 底部按钮 */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  上传中...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  确认上传
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
