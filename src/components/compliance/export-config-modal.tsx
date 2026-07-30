"use client";

import { X, Package, Loader2, CheckCircle, Download } from "lucide-react";
import { useState, useCallback } from "react";

interface ExportConfigModalProps {
  open: boolean;
  onClose: () => void;
  titleType: string;
  onExport: (config: ExportConfig) => void;
}

export interface ExportConfig {
  year: string;
  schoolName: string;
  includeHistory: boolean;
  includeReview: boolean;
  includeCatalog: boolean;
  includeScore: boolean;
  includeMissing: boolean;
}

export function ExportConfigModal({ open, onClose, titleType, onExport }: ExportConfigModalProps) {
  const [config, setConfig] = useState<ExportConfig>({
    year: new Date().getFullYear().toString(),
    schoolName: "北京XX大学",
    includeHistory: false,
    includeReview: true,
    includeCatalog: true,
    includeScore: true,
    includeMissing: true,
  });
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const updateConfig = (key: keyof ExportConfig, value: string | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = useCallback(async () => {
    setGenerating(true);
    setProgress(0);

    // 模拟打包进度
    const steps = [
      { label: "正在整理准入前置材料...", pct: 15 },
      { label: "正在整理指标材料...", pct: 35 },
      { label: "正在生成自评打分表...", pct: 55 },
      { label: "正在生成材料目录清单...", pct: 75 },
      { label: "正在打包压缩...", pct: 90 },
      { label: "生成完成", pct: 100 },
    ];

    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500));
      setProgress(step.pct);
    }

    setCompleted(true);
    setGenerating(false);
    onExport(config);
  }, [config, onExport]);

  const handleClose = () => {
    setGenerating(false);
    setProgress(0);
    setCompleted(false);
    onClose();
  };

  if (!open) return null;

  const titleLabels: Record<string, string> = {
    "green-school": "GB/T 29117-2025 绿色学校",
    "green-campus": "GB/T 51356-2019 绿色校园",
    "low-carbon-campus": "DB11/T 1404-2025 北京低碳校园",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-[520px] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">导出申报归档包</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!generating && !completed && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1">申报体系</label>
                  <input
                    type="text"
                    value={titleLabels[titleType] || titleType}
                    disabled
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/60"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">申报年度</label>
                  <input
                    type="text"
                    value={config.year}
                    onChange={(e) => updateConfig("year", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-white/50 mb-1">学校名称</label>
                  <input
                    type="text"
                    value={config.schoolName}
                    onChange={(e) => updateConfig("schoolName", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider">导出选项</h4>
                <Checkbox label="包含历史版本" checked={config.includeHistory} onChange={(v) => updateConfig("includeHistory", v)} />
                <Checkbox label="包含审核意见" checked={config.includeReview} onChange={(v) => updateConfig("includeReview", v)} />
                <Checkbox label="包含材料目录" checked={config.includeCatalog} onChange={(v) => updateConfig("includeCatalog", v)} />
                <Checkbox label="包含自评打分表" checked={config.includeScore} onChange={(v) => updateConfig("includeScore", v)} />
                <Checkbox label="包含缺失材料说明" checked={config.includeMissing} onChange={(v) => updateConfig("includeMissing", v)} />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors"
              >
                <Package className="w-4 h-4" /> 生成归档包
              </button>
            </>
          )}

          {generating && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <span className="text-sm text-white/70">正在生成归档包...</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-white/40 text-right">{progress}%</div>
            </div>
          )}

          {completed && (
            <div className="space-y-4 py-4 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <div>
                <div className="text-base font-semibold text-white">归档包生成完成</div>
                <div className="text-sm text-white/40 mt-1">
                  {titleLabels[titleType] || titleType}_{config.schoolName}_{config.year}年度.zip
                </div>
              </div>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500 transition-colors"
              >
                <Download className="w-4 h-4" /> 立即下载
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-white/20 bg-white/5"
      />
      <span className="text-sm text-white/60">{label}</span>
    </label>
  );
}
