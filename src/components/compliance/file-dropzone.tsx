"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { Upload, X, FileText } from "lucide-react";
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE, formatFileSize } from "@/lib/compliance-db";

interface SelectedFile {
  file: File;
  previewUrl?: string;
}

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  currentFile?: SelectedFile | null;
  onRemove?: () => void;
}

export function FileDropzone({
  onFileSelect,
  accept = ALLOWED_EXTENSIONS,
  maxSize = MAX_FILE_SIZE,
  currentFile,
  onRemove,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      const ext = "." + file.name.split(".").pop()?.toLowerCase();
      const allowedExts = accept.split(",").map((e) => e.trim().toLowerCase());
      if (!allowedExts.includes(ext)) {
        return `不支持的文件类型：${ext}，仅支持 ${accept}`;
      }
      if (file.size > maxSize) {
        return `文件大小超过限制（最大 ${formatFileSize(maxSize)}）`;
      }
      if (file.size === 0) {
        return "文件为空，请重新选择";
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const err = validateFile(file);
      if (err) {
        setError(err);
        return;
      }
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (currentFile) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/80 truncate">{currentFile.file.name}</div>
            <div className="text-xs text-white/40 mt-0.5">
              {currentFile.file.type || "未知类型"} · {formatFileSize(currentFile.file.size)}
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
            title="移除文件"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-blue-400/60 bg-blue-500/5"
            : "border-white/15 hover:border-white/30 hover:bg-white/[0.02]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
        <div className="text-sm text-white/60">
          点击选择文件，或将文件拖拽到此处
        </div>
        <div className="text-xs text-white/30 mt-1">
          支持 {accept}，单文件不超过 {formatFileSize(maxSize)}
        </div>
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
