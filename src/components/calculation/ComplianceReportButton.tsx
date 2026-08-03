"use client";

import { useState, useCallback } from "react";
import { FileText, Download, Loader2, CheckCircle, AlertCircle, FileDown, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ============================================================
// Types
// ============================================================

interface ReportConfig {
  reportName: string;
  period: string;
  format: "pdf" | "word";
  chapters: string[];
  standard: string;
  scope: string;
}

interface GenerateResponse {
  success: boolean;
  file_id?: string;
  file_name?: string;
  download_url?: string;
  message?: string;
}

interface PreviewResponse {
  success: boolean;
  html?: string;
  message?: string;
}

interface EmissionFactor {
  code: string;
  name: string;
  value: number;
  unit: string;
  source: string;
}

// ============================================================
// Constants
// ============================================================

const API_BASE = "/api/report";

const REPORT_CHAPTERS = [
  { id: "basic", label: "第一章 企业基本情况", default: true },
  { id: "emission", label: "第二章 二氧化碳排放", default: true },
  { id: "activity", label: "第三章 活动水平数据", default: true },
  { id: "factor", label: "第四章 排放因子数据", default: true },
  { id: "declaration", label: "真实性声明", default: true },
];

const REPORT_TABLES = [
  "表C.1 企业基本信息",
  "表C.2 排放源识别",
  "表C.3 化石燃料燃烧排放量",
  "表C.4 电力消耗排放量",
  "表C.5 热力消耗排放量",
  "表C.6 排放量汇总",
  "表C.7 化石燃料活动水平",
  "表C.8 电力活动水平",
  "表C.9 热力活动水平",
  "表C.10 化石燃料排放因子",
  "表C.11 电力排放因子",
  "表C.12 热力排放因子",
  "表C.13 不确定性分析",
  "表C.14 数据质量控制",
  "表C.15 真实性声明",
];

// ============================================================
// Sub-components
// ============================================================

function StepIndicator({ step, current }: { step: number; current: number }) {
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
        step < current
          ? "bg-emerald-500 text-white"
          : step === current
            ? "bg-blue-500 text-white"
            : "bg-white/5 text-slate-500 border border-white/10"
      )}
    >
      {step < current ? <CheckCircle className="w-4 h-4" /> : step}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function ComplianceReportButton() {
  // Dialog state
  const [open, setOpen] = useState(false);

  // Step tracking: 0=config, 1=generating, 2=complete, 3=error
  const [step, setStep] = useState(0);

  // Config
  const [config, setConfig] = useState<ReportConfig>({
    reportName: "碳排放核查报告",
    period: "2026",
    format: "pdf",
    chapters: ["basic", "emission", "activity", "factor", "declaration"],
    standard: "DB11/T 1785-2020",
    scope: "主校区",
  });

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [showFactors, setShowFactors] = useState(false);

  // ============================================================
  // API Calls
  // ============================================================

  const generateReport = useCallback(async () => {
    setStep(1);
    setGenerating(true);
    setProgress(0);
    setError(null);
    setResult(null);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_name: config.reportName,
          period: config.period,
          format: config.format,
          standard: config.standard,
          scope: config.scope,
          chapters: config.chapters,
        }),
      });

      clearInterval(progressTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || `HTTP ${response.status}`);
      }

      const data: GenerateResponse = await response.json();
      setProgress(100);
      setResult(data);
      setStep(2);

      // Auto-download if URL provided
      if (data.download_url) {
        const link = document.createElement("a");
        link.href = data.download_url;
        link.download = data.file_name || `碳排放核查报告.${config.format === "pdf" ? "pdf" : "docx"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      clearInterval(progressTimer);
      const message = err instanceof Error ? err.message : "报告生成失败";
      setError(message);
      setStep(3);
    } finally {
      setGenerating(false);
    }
  }, [config]);

  const previewReport = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_name: config.reportName,
          period: config.period,
          standard: config.standard,
          scope: config.scope,
        }),
      });

      if (!response.ok) throw new Error("预览失败");
      const data: PreviewResponse = await response.json();
      if (data.html) {
        setPreviewHtml(data.html);
      }
    } catch {
      setError("预览生成失败");
    }
  }, [config]);

  const fetchEmissionFactors = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/emission-factors`);
      if (!response.ok) throw new Error("查询失败");
      const data = await response.json();
      setEmissionFactors(data.factors || []);
      setShowFactors(true);
    } catch {
      setError("排放因子查询失败");
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (result?.download_url) {
      const link = document.createElement("a");
      link.href = result.download_url;
      link.download = result.file_name || `碳排放核查报告.${config.format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [result, config.format]);

  const handleReset = useCallback(() => {
    setStep(0);
    setProgress(0);
    setResult(null);
    setError(null);
    setPreviewHtml(null);
  }, []);

  // ============================================================
  // Render: Step 0 - Configuration
  // ============================================================

  const renderConfig = () => (
    <div className="space-y-6">
      {/* Report Name */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">报告名称</Label>
        <input
          type="text"
          value={config.reportName}
          onChange={(e) => setConfig({ ...config, reportName: e.target.value })}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          placeholder="输入报告名称"
        />
      </div>

      {/* Period & Scope */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">报告年度</Label>
          <select
            value={config.period}
            onChange={(e) => setConfig({ ...config, period: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="2026">2026 年</option>
            <option value="2025">2025 年</option>
            <option value="2024">2024 年</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-slate-300">核算范围</Label>
          <select
            value={config.scope}
            onChange={(e) => setConfig({ ...config, scope: e.target.value })}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="主校区">主校区</option>
            <option value="东校区">东校区</option>
            <option value="全校区">全校区</option>
          </select>
        </div>
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">输出格式</Label>
        <RadioGroup
          value={config.format}
          onValueChange={(v) => setConfig({ ...config, format: v as "pdf" | "word" })}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5">
            <RadioGroupItem value="pdf" id="format-pdf" />
            <span className="text-sm text-slate-300">PDF 格式</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5">
            <RadioGroupItem value="word" id="format-word" />
            <span className="text-sm text-slate-300">Word 格式</span>
          </label>
        </RadioGroup>
      </div>

      {/* Standard Info */}
      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">遵循标准</span>
        </div>
        <p className="text-xs text-slate-400">
          {config.standard}《二氧化碳排放核算和报告要求 服务业》附录C
        </p>
        <p className="text-xs text-slate-500 mt-1">电力排放因子：0.604 tCO₂/MWh</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previewReport}
          className="flex-1 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        >
          <Eye className="w-4 h-4 mr-2" />
          预览
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEmissionFactors}
          className="border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        >
          查看排放因子
        </Button>
        <Button
          onClick={generateReport}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          生成报告
        </Button>
      </div>
    </div>
  );

  // ============================================================
  // Render: Step 1 - Generating
  // ============================================================

  const renderGenerating = () => (
    <div className="py-8 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
        <h3 className="text-lg font-semibold text-white">正在生成合规报告</h3>
        <p className="text-sm text-slate-400">
          遵循 {config.standard} 标准，生成{config.format === "pdf" ? "PDF" : "Word"}格式报告
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>生成进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-1.5">
        {REPORT_TABLES.slice(0, 5).map((table, i) => (
          <div key={table} className="flex items-center gap-2 text-xs">
            {progress > i * 20 ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : progress > (i - 1) * 20 ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin shrink-0" />
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border border-white/10 shrink-0" />
            )}
            <span className={progress > i * 20 ? "text-emerald-400" : "text-slate-500"}>
              {table}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ============================================================
  // Render: Step 2 - Complete
  // ============================================================

  const renderComplete = () => (
    <div className="py-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">报告生成完成</h3>
        <p className="text-sm text-slate-400">
          {result?.file_name || `碳排放核查报告.${config.format === "pdf" ? "pdf" : "docx"}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleDownload}
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <FileDown className="w-4 h-4 mr-2" />
          下载报告
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
          className="border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        >
          生成新报告
        </Button>
      </div>
    </div>
  );

  // ============================================================
  // Render: Step 3 - Error
  // ============================================================

  const renderError = () => (
    <div className="py-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">报告生成失败</h3>
        <p className="text-sm text-red-400">{error}</p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        >
          返回配置
        </Button>
        <Button
          onClick={generateReport}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          <Loader2 className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    </div>
  );

  // ============================================================
  // Render: Emission Factors View
  // ============================================================

  const renderEmissionFactors = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">排放因子参考</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFactors(false)}
          className="text-xs text-slate-400 hover:text-white"
        >
          返回
        </Button>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {emissionFactors.length > 0 ? (
          emissionFactors.map((factor) => (
            <div
              key={factor.code}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/[0.04]"
            >
              <div>
                <span className="text-xs font-medium text-slate-300">{factor.name}</span>
                <span className="text-[10px] text-slate-500 ml-2">{factor.code}</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold text-blue-400">{factor.value}</span>
                <span className="text-[10px] text-slate-500 ml-1">{factor.unit}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">暂无排放因子数据</p>
        )}
      </div>
    </div>
  );

  // ============================================================
  // Render: Preview
  // ============================================================

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">报告预览</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setPreviewHtml(null)}
          className="text-xs text-slate-400 hover:text-white"
        >
          关闭预览
        </Button>
      </div>
      <div
        className="max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-4"
        dangerouslySetInnerHTML={{ __html: previewHtml || "<p class='text-slate-400 text-sm'>暂无预览内容</p>" }}
      />
    </div>
  );

  // ============================================================
  // Render: Main
  // ============================================================

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-blue-500/30 text-blue-400 hover:text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/5"
        >
          <FileText className="w-4 h-4" />
          生成合规报告
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[520px] bg-[#0B1120] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            碳排放合规报告生成
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            遵循 {config.standard} 标准，生成符合规范的碳排放核查报告
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-2">
          <StepIndicator step={1} current={step} />
          <div className={cn("w-8 h-0.5", step > 0 ? "bg-emerald-500" : "bg-white/10")} />
          <StepIndicator step={2} current={step} />
          <div className={cn("w-8 h-0.5", step > 1 ? "bg-emerald-500" : "bg-white/10")} />
          <StepIndicator step={3} current={step} />
        </div>
        <div className="flex justify-center gap-8 text-[10px] text-slate-500 mb-2">
          <span className={step >= 0 ? "text-blue-400" : ""}>配置</span>
          <span className={step >= 1 ? (step === 3 ? "text-red-400" : "text-blue-400") : ""}>生成</span>
          <span className={step === 2 ? "text-emerald-400" : ""}>完成</span>
        </div>

        {/* Content by Step */}
        {showFactors && renderEmissionFactors()}
        {previewHtml && !showFactors && renderPreview()}
        {!showFactors && !previewHtml && (
          <>
            {step === 0 && renderConfig()}
            {step === 1 && renderGenerating()}
            {step === 2 && renderComplete()}
            {step === 3 && renderError()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
