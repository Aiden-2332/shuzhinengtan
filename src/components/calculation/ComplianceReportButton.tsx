"use client";

import { useState, useCallback, useMemo } from "react";
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
import { cn } from "@/lib/utils";

// ============================================================
// API 请求类型（匹配后端 schemas.py）
// ============================================================

interface EnterpriseData {
  name: string;
  unified_code: string;
  address: string;
  legal_representative: string;
  contact_person: string;
  contact_phone: string;
  industry_category: string;
  reporting_year: number;
  reporting_period?: string;
  campus_area?: number;
  student_count?: number;
  staff_count?: number;
}

interface ActivityItem {
  source_id: string;
  source_name: string;
  energy_type: string;
  activity_value: number;
  unit: string;
  data_source: string;
  meter_id?: string | null;
}

interface EmissionSourceItem {
  source_id: string;
  source_name: string;
  energy_type: string;
  scope: string;
  unit: string;
}

interface EmissionFactorItem {
  source_id: string;
  energy_type: string;
  factor_name: string;
  factor_value: number;
  factor_unit: string;
  factor_source: string;
  oxidation_rate?: number;
}

interface ReportPreviewResponse {
  success: boolean;
  html: string;
  summary?: {
    total_emission: number;
    scope1_emission: number;
    scope2_emission: number;
  };
  message?: string;
}

// ============================================================
// Mock 数据（与后端 mock_report_data.json 一致）
// ============================================================

const MOCK_ENTERPRISE: EnterpriseData = {
  name: "北京科技大学",
  unified_code: "91110108400012345X",
  address: "北京市海淀区学院路30号",
  legal_representative: "杨仁树",
  contact_person: "张能源",
  contact_phone: "010-62331234",
  industry_category: "高等教育（服务业）",
  reporting_year: 2026,
  reporting_period: "1月1日-12月31日",
  campus_area: 80.5,
  student_count: 28000,
  staff_count: 3500,
};

const MOCK_ACTIVITY_DATA: ActivityItem[] = [
  { source_id: "C-01", source_name: "外购电力", energy_type: "electricity", activity_value: 26450, unit: "MWh", data_source: "电力公司结算单", meter_id: "EM-001~EM-035" },
  { source_id: "C-02", source_name: "天然气（锅炉）", energy_type: "natural_gas", activity_value: 180.5, unit: "万Nm³", data_source: "燃气公司结算单", meter_id: "GM-001~GM-003" },
  { source_id: "C-03", source_name: "外购热力", energy_type: "heat", activity_value: 85000, unit: "GJ", data_source: "热力公司结算单", meter_id: "HM-001~HM-002" },
  { source_id: "C-04", source_name: "公务车汽油", energy_type: "gasoline", activity_value: 15.2, unit: "t", data_source: "加油记录台账", meter_id: null },
  { source_id: "C-05", source_name: "公务车柴油", energy_type: "diesel", activity_value: 3.8, unit: "t", data_source: "加油记录台账", meter_id: null },
];

const MOCK_EMISSION_SOURCES: EmissionSourceItem[] = [
  { source_id: "C-01", source_name: "外购电力", energy_type: "electricity", scope: "scope2", unit: "MWh" },
  { source_id: "C-02", source_name: "天然气（锅炉）", energy_type: "natural_gas", scope: "scope1", unit: "万Nm³" },
  { source_id: "C-03", source_name: "外购热力", energy_type: "heat", scope: "scope2", unit: "GJ" },
  { source_id: "C-04", source_name: "公务车汽油", energy_type: "gasoline", scope: "scope1", unit: "t" },
  { source_id: "C-05", source_name: "公务车柴油", energy_type: "diesel", scope: "scope1", unit: "t" },
];

const MOCK_EMISSION_FACTORS: EmissionFactorItem[] = [
  { source_id: "C-01", energy_type: "electricity", factor_name: "电力排放因子", factor_value: 0.604, factor_unit: "tCO₂/MWh", factor_source: "北京市生态环境局 2024年度", oxidation_rate: 1.0 },
  { source_id: "C-02", energy_type: "natural_gas", factor_name: "天然气排放因子", factor_value: 2.1622, factor_unit: "tCO₂/万Nm³", factor_source: "DB11/T 1785-2020 附录B", oxidation_rate: 0.99 },
  { source_id: "C-03", energy_type: "heat", factor_name: "热力排放因子", factor_value: 0.11, factor_unit: "tCO₂/GJ", factor_source: "DB11/T 1785-2020 附录B", oxidation_rate: 1.0 },
  { source_id: "C-04", energy_type: "gasoline", factor_name: "汽油排放因子", factor_value: 2.9251, factor_unit: "tCO₂/t", factor_source: "DB11/T 1785-2020 附录B", oxidation_rate: 0.98 },
  { source_id: "C-05", energy_type: "diesel", factor_name: "柴油排放因子", factor_value: 3.0959, factor_unit: "tCO₂/t", factor_source: "DB11/T 1785-2020 附录B", oxidation_rate: 0.98 },
];

// ============================================================
// Constants
// ============================================================

const API_BASE = "/api/report";

// ============================================================
// Sub-components
// ============================================================

function StepIndicator({ step, current, errorStep }: { step: number; current: number; errorStep: boolean }) {
  const isCompleted = step < current;
  const isActive = step === current;
  const isError = errorStep && isActive;

  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
        isCompleted && "bg-emerald-500 text-white",
        isError && "bg-red-500 text-white",
        isActive && !isError && "bg-blue-500 text-white",
        !isCompleted && !isActive && "bg-white/5 text-slate-500 border border-white/10"
      )}
    >
      {isCompleted ? <CheckCircle className="w-4 h-4" /> : step}
    </div>
  );
}

// ============================================================
// Main Component
// ============================================================

export function ComplianceReportButton() {
  // Dialog state
  const [open, setOpen] = useState(false);

  // Step tracking: 1=config, 2=generating, 3=complete
  const [step, setStep] = useState(1);

  // Config
  const [reportNumber, setReportNumber] = useState("BJUST-2026-001");
  const [outputFormat, setOutputFormat] = useState<"word" | "pdf">("word");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // ============================================================
  // Build request body
  // ============================================================

  const requestBody = useMemo(() => ({
    enterprise: MOCK_ENTERPRISE,
    activity_data: MOCK_ACTIVITY_DATA,
    emission_sources: MOCK_EMISSION_SOURCES,
    emission_factors: MOCK_EMISSION_FACTORS,
    report_number: reportNumber,
    report_format: outputFormat,
  }), [reportNumber, outputFormat]);

  // ============================================================
  // API Calls
  // ============================================================

  const generateReport = useCallback(async () => {
    setStep(2);
    setGenerating(true);
    setProgress(0);
    setError(null);
    setDownloadUrl(null);

    // Simulate progress
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 12, 85));
    }, 400);

    try {
      const response = await fetch(`${API_BASE}/generate?format=${outputFormat}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      clearInterval(progressTimer);

      if (!response.ok) {
        let errMsg = `服务器错误 (HTTP ${response.status})`;
        try {
          const errData = await response.json();
          errMsg = typeof errData.detail === "string"
            ? errData.detail
            : JSON.stringify(errData.detail || errData.message || errData);
        } catch { /* ignore parse errors */ }
        throw new Error(errMsg);
      }

      // For file download, get as blob
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success && data.download_url) {
          setDownloadUrl(data.download_url);
        }
      } else {
        // Direct file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        setDownloadUrl(url);
        const ext = outputFormat === "pdf" ? "pdf" : "docx";
        const link = document.createElement("a");
        link.href = url;
        link.download = `碳排放报告_${MOCK_ENTERPRISE.name}_${MOCK_ENTERPRISE.reporting_year}.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setProgress(100);
      setStep(3);
    } catch (err) {
      clearInterval(progressTimer);
      const message = err instanceof Error ? err.message : "报告生成失败";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }, [requestBody, outputFormat]);

  const previewReport = useCallback(async () => {
    setPreviewLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enterprise: requestBody.enterprise,
          activity_data: requestBody.activity_data,
          emission_sources: requestBody.emission_sources,
          emission_factors: requestBody.emission_factors,
          report_number: requestBody.report_number,
        }),
      });

      if (!response.ok) {
        let errMsg = `预览失败 (HTTP ${response.status})`;
        try {
          const errData = await response.json();
          errMsg = typeof errData.detail === "string"
            ? errData.detail
            : JSON.stringify(errData);
        } catch { /* ignore */ }
        throw new Error(errMsg);
      }

      const data: ReportPreviewResponse = await response.json();
      if (data.html) {
        setPreviewHtml(data.html);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "预览生成失败";
      setError(message);
    } finally {
      setPreviewLoading(false);
    }
  }, [requestBody]);

  const handleReset = useCallback(() => {
    setStep(1);
    setProgress(0);
    setError(null);
    setPreviewHtml(null);
    setDownloadUrl(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (downloadUrl) {
      const ext = outputFormat === "pdf" ? "pdf" : "docx";
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `碳排放报告_${MOCK_ENTERPRISE.name}_${MOCK_ENTERPRISE.reporting_year}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [downloadUrl, outputFormat]);

  // ============================================================
  // Render: Step 1 - Configuration
  // ============================================================

  const renderConfig = () => (
    <div className="space-y-5">
      {/* Report Number */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">报告编号</Label>
        <input
          type="text"
          value={reportNumber}
          onChange={(e) => setReportNumber(e.target.value)}
          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-colors"
          placeholder="输入报告编号"
        />
      </div>

      {/* Output Format */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">输出格式</Label>
        <RadioGroup
          value={outputFormat}
          onValueChange={(v) => setOutputFormat(v as "word" | "pdf")}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5">
            <RadioGroupItem value="word" id="fmt-word" />
            <span className="text-sm text-slate-300">Word (.docx)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border border-white/10 hover:border-blue-500/30 transition-colors has-[:checked]:border-blue-500/50 has-[:checked]:bg-blue-500/5">
            <RadioGroupItem value="pdf" id="fmt-pdf" />
            <span className="text-sm text-slate-300">PDF</span>
          </label>
        </RadioGroup>
      </div>

      {/* Standard Info */}
      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10 space-y-1">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">遵循标准</span>
        </div>
        <p className="text-xs text-slate-400">DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》附录C</p>
        <p className="text-xs text-slate-500">电力排放因子：0.604 tCO₂/MWh | 数据来源：北京科技大学（Demo）</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={previewReport}
          disabled={previewLoading}
          className="flex-1 border-white/10 text-slate-300 hover:text-white hover:border-white/20"
        >
          {previewLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
          预览
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
  // Render: Step 2 - Generating
  // ============================================================

  const renderGenerating = () => (
    <div className="py-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
        <h3 className="text-base font-semibold text-white">正在生成合规报告</h3>
        <p className="text-xs text-slate-400">
          遵循 DB11/T 1785-2020 标准，生成{outputFormat === "pdf" ? "PDF" : "Word"}格式报告
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>生成进度</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );

  // ============================================================
  // Render: Step 3 - Complete
  // ============================================================

  const renderComplete = () => (
    <div className="py-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-base font-semibold text-white">报告生成完成</h3>
        <p className="text-xs text-slate-400">
          {`碳排放报告_${MOCK_ENTERPRISE.name}_${MOCK_ENTERPRISE.reporting_year}.${outputFormat === "pdf" ? "pdf" : "docx"}`}
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
  // Render: Error
  // ============================================================

  const renderError = () => (
    <div className="py-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-base font-semibold text-white">报告生成失败</h3>
        <p className="text-sm text-red-400 text-center max-w-xs break-words">{error}</p>
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
          重试
        </Button>
      </div>
    </div>
  );

  // ============================================================
  // Render: Preview
  // ============================================================

  const renderPreview = () => (
    <div className="space-y-3">
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
        className="max-h-[60vh] overflow-y-auto rounded-lg border border-white/10 bg-white p-4"
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

      <DialogContent className="sm:max-w-[500px] bg-[#0B1120] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            碳排放合规报告生成
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            遵循 DB11/T 1785-2020 标准，生成符合规范的碳排放核查报告
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 py-2">
          <StepIndicator step={1} current={step} errorStep={!!error && step === 2} />
          <div className={cn("w-8 h-0.5", step > 1 ? "bg-emerald-500" : "bg-white/10")} />
          <StepIndicator step={2} current={step} errorStep={!!error && step === 2} />
          <div className={cn("w-8 h-0.5", step > 2 ? "bg-emerald-500" : "bg-white/10")} />
          <StepIndicator step={3} current={step} errorStep={false} />
        </div>
        <div className="flex justify-center gap-8 text-[10px] text-slate-500 mb-2">
          <span className={step >= 1 ? "text-blue-400" : ""}>配置</span>
          <span className={step >= 2 ? (error ? "text-red-400" : "text-blue-400") : ""}>生成</span>
          <span className={step === 3 ? "text-emerald-400" : ""}>完成</span>
        </div>

        {/* Content */}
        {previewHtml ? renderPreview() : (
          <>
            {error && renderError()}
            {!error && step === 1 && renderConfig()}
            {!error && step === 2 && renderGenerating()}
            {!error && step === 3 && renderComplete()}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
