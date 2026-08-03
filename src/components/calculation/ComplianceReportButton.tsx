"use client";

import { useMemo, useState } from 'react';
import { saveAs } from 'file-saver';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCalculationStore } from '@/stores/calculation-store';
import {
  buildCarbonReportModel,
  CARBON_REPORT_STANDARD,
  CARBON_REPORT_STANDARD_NAME,
  getReviewSummary,
  type CarbonReportConfig,
  type CarbonReportReview,
} from '@/lib/carbon-report';
import {
  buildCarbonReportDocx,
  createCarbonReportFilename,
} from '@/lib/carbon-report-docx';

type Stage = 'config' | 'review' | 'generating' | 'complete' | 'error';

const today = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).replaceAll('/', '-');

const defaultConfig: CarbonReportConfig = {
  reportName: '二氧化碳排放报告（服务业）',
  year: '2026',
  scope: '全校区',
  entityName: '北京科技大学',
  creditCode: '12100000400000682R',
  industryName: '普通高等教育',
  industryCode: 'P8341',
  registeredAddress: '北京市海淀区学院路30号',
  officeAddress: '北京市海淀区学院路30号',
  legalRepresentative: '待复核',
  reportOwner: '能源与碳管理负责人',
  preparedBy: '碳核算管理员',
  contactName: '碳核算管理员',
  contactPhone: '010-00000000',
  reportDate: today,
  boundaryDescription: '以学校法人组织控制范围为边界，纳入主校区、东校区内教学、科研、办公、宿舍、食堂及公共服务设施的能源活动和相关排放源。',
  boundaryChange: '本报告期核算边界无重大变化；如后续新增校区、托管设施或运营主体，将在下一版报告中补充披露。',
};

const defaultReview: CarbonReportReview = {
  reviewer: '碳核算管理员',
  reviewedAt: today,
  note: '',
  boundaryConfirmed: false,
  dataConfirmed: false,
  warningsAccepted: false,
};

function ReviewStatusIcon({ status }: { status: 'passed' | 'warning' | 'blocking' }) {
  if (status === 'passed') return <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />;
  if (status === 'warning') return <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />;
  return <XCircle className="h-4 w-4 shrink-0 text-red-400" />;
}

function ReportPreview({ report }: { report: ReturnType<typeof buildCarbonReportModel> }) {
  return (
    <div className="mx-auto w-full max-w-[760px] space-y-8 bg-white px-8 py-10 text-slate-900 shadow-2xl sm:px-12">
      <section className="flex min-h-[560px] flex-col justify-between border border-slate-200 px-10 py-14 text-center">
        <div />
        <div>
          <p className="mb-3 text-xl font-semibold">{report.config.entityName}</p>
          <h2 className="text-3xl font-black tracking-wide">二氧化碳排放报告</h2>
          <p className="mt-3 text-2xl font-bold">服务业</p>
        </div>
        <div className="space-y-2 text-left text-sm leading-7">
          <p>报告主体（盖章）：{report.config.entityName}</p>
          <p>报告期：{report.config.year} 年（数据覆盖：{report.coveragePeriod}）</p>
          <p>编制日期：{report.config.reportDate}</p>
          <p className="text-xs text-slate-500">依据：{report.template.code} {report.template.name}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">一、企业（单位）基本情况</h3>
        <p className="mb-2 text-center text-sm font-semibold">表C.1 基本信息表</p>
        <table className="w-full border-collapse text-xs">
          <tbody>
            {[
              ['企业名称', report.config.entityName],
              ['所属行业 / 代码', `${report.config.industryName} / ${report.config.industryCode || '待补充'}`],
              ['统一社会信用代码', report.config.creditCode || '待补充'],
              ['注册地址', report.config.registeredAddress || '待补充'],
              ['办公地址', report.config.officeAddress || '待补充'],
              ['核算和报告边界', report.config.boundaryDescription],
              ['边界变化', report.config.boundaryChange],
            ].map(([label, value]) => (
              <tr key={label}>
                <th className="w-44 border border-slate-400 bg-slate-100 px-3 py-2 text-center font-medium">{label}</th>
                <td className="border border-slate-400 px-3 py-2 leading-5">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">二、二氧化碳排放</h3>
        <p className="mb-2 text-center text-sm font-semibold">表C.2 二氧化碳排放量汇总表</p>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-400 px-3 py-2 text-left">排放明细</th>
              <th className="border border-slate-400 px-3 py-2 text-right">排放量（tCO₂）</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['排放总量', report.totals.total],
              ['范围一', report.totals.scope1],
              ['范围二', report.totals.scope2],
              ['范围三（补充披露）', report.totals.scope3],
              ['其中：化石燃料', report.totals.fossilFuel],
              ['其中：外购电力', report.totals.electricity],
              ['其中：外购热力', report.totals.heat],
            ].map(([label, value]) => (
              <tr key={String(label)}>
                <td className="border border-slate-400 px-3 py-2">{label}</td>
                <td className="border border-slate-400 px-3 py-2 text-right font-mono">{Number(value).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">三、活动水平与排放因子</h3>
        <p className="mb-2 text-center text-sm font-semibold">表C.3-C.9 分能源核算与活动数据</p>
        <div className="overflow-hidden border border-slate-400">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-100">
                <th className="border-b border-r border-slate-400 px-2 py-2 text-left">数据源</th>
                <th className="border-b border-r border-slate-400 px-2 py-2 text-left">类型</th>
                <th className="border-b border-r border-slate-400 px-2 py-2 text-right">活动水平</th>
                <th className="border-b border-r border-slate-400 px-2 py-2 text-right">排放量</th>
                <th className="border-b border-slate-400 px-2 py-2 text-center">状态</th>
              </tr>
            </thead>
            <tbody>
              {report.sourceRows.length > 0 ? report.sourceRows.map((row) => (
                <tr key={row.id}>
                  <td className="border-r border-t border-slate-300 px-2 py-2">{row.sourceName}</td>
                  <td className="border-r border-t border-slate-300 px-2 py-2">{row.classification}</td>
                  <td className="border-r border-t border-slate-300 px-2 py-2 text-right">{row.activityValue}</td>
                  <td className="border-r border-t border-slate-300 px-2 py-2 text-right">{row.emissionValue === null ? '暂无数据' : `${row.emissionValue} tCO₂`}</td>
                  <td className="border-t border-slate-300 px-2 py-2 text-center">{row.status}</td>
                </tr>
              )) : (
                <tr><td className="px-3 py-8 text-center text-slate-500" colSpan={5}>当前年度与校区范围内暂无核算数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-bold">四、数据质量与复核</h3>
        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          {[
            ['活动数据完整率', `${report.quality.completeness}%`],
            ['凭证完整率', `${report.quality.evidenceCompleteness}%`],
            ['复核通过率', `${report.quality.approvalRate}%`],
            ['因子可追溯率', `${report.quality.factorTraceability}%`],
          ].map(([label, value]) => (
            <div key={label} className="border border-slate-300 p-3 text-center">
              <p className="text-slate-500">{label}</p>
              <p className="mt-1 text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-600">下载版还将包含月度活动数据、排放因子版本、校区补充信息、适用性判定、完整复核清单、凭证索引和真实性声明。</p>
      </section>

      <section className="border border-slate-400 px-6 py-8 text-sm leading-7">
        <h3 className="mb-4 text-center text-lg font-bold">表C.15 报告真实性声明</h3>
        <p>本排放报告完整和真实。报告中的信息与实际情况不符的，本单位愿负相应的法律责任，并承担由此产生的一切后果。特此声明。</p>
        <p className="mt-8 text-right">法人代表（或授权代表）：________________　（签章）</p>
        <p className="mt-6 text-right">{report.config.entityName}（公章）　{report.config.reportDate}</p>
      </section>
    </div>
  );
}

export function ComplianceReportButton() {
  const { records, calculationResult, period } = useCalculationStore();
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>('config');
  const [config, setConfig] = useState<CarbonReportConfig>({
    ...defaultConfig,
    year: period.slice(0, 4),
  });
  const [review, setReview] = useState<CarbonReportReview>(defaultReview);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [downloadedFile, setDownloadedFile] = useState('');

  const report = useMemo(
    () => buildCarbonReportModel(records, calculationResult, config, review),
    [records, calculationResult, config, review],
  );
  const reviewSummary = useMemo(() => getReviewSummary(report), [report]);
  const canDownload = review.reviewer.trim().length > 0
    && review.boundaryConfirmed
    && review.dataConfirmed
    && (!reviewSummary.requiresWarningAcceptance || review.warningsAccepted);

  const updateConfig = <K extends keyof CarbonReportConfig>(key: K, value: CarbonReportConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
  };

  const updateReview = <K extends keyof CarbonReportReview>(key: K, value: CarbonReportReview[K]) => {
    setReview((current) => ({ ...current, [key]: value }));
  };

  const resetFlow = () => {
    setStage('config');
    setReview(defaultReview);
    setProgress(0);
    setError('');
    setDownloadedFile('');
  };

  const handleDownload = async () => {
    if (!canDownload) return;
    setStage('generating');
    setProgress(18);
    setError('');
    try {
      setProgress(42);
      const reviewedReport = buildCarbonReportModel(records, calculationResult, config, {
        ...review,
        reviewedAt: new Date().toLocaleString('zh-CN'),
      });
      const blob = await buildCarbonReportDocx(reviewedReport);
      setProgress(88);
      const filename = createCarbonReportFilename(reviewedReport);
      saveAs(blob, filename);
      setDownloadedFile(filename);
      setProgress(100);
      setStage('complete');
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : '报告生成失败');
      setStage('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      setOpen(value);
      if (!value) resetFlow();
    }}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-purple-500/20 transition-all hover:from-purple-500 hover:to-pink-500">
          <FileText className="h-4 w-4" />
          生成合规报告
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[92vh] max-w-[1180px] overflow-hidden border-white/10 bg-[#0B1120] p-0 text-white">
        <DialogHeader className="border-b border-white/10 px-6 py-4">
          <DialogTitle className="flex items-center gap-2 text-white">
            <FileCheck2 className="h-5 w-5 text-cyan-400" />
            碳核算报告预览与复核
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            关联 {CARBON_REPORT_STANDARD} {CARBON_REPORT_STANDARD_NAME} 附录C服务业报告样式，生成真实 Word 文件。
          </DialogDescription>
        </DialogHeader>

        {stage === 'config' && (
          <div className="max-h-[calc(92vh-90px)] overflow-y-auto px-6 py-5">
            <div className="mb-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <FileText className="mb-2 h-5 w-5 text-cyan-400" />
                <p className="text-sm font-medium">标准模板已关联</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">封面、C.1-C.15适用表、复核清单、凭证索引与真实性声明。</p>
              </div>
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <Database className="mb-2 h-5 w-5 text-blue-400" />
                <p className="text-sm font-medium">当前纳入 {report.quality.sourceCount} 条数据</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">按年度、校区、数据状态和排放范围重新汇总，不直接复用静态数字。</p>
              </div>
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <ShieldCheck className="mb-2 h-5 w-5 text-emerald-400" />
                <p className="text-sm font-medium">下载前必须复核</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">系统先检查边界、完整率、凭证、因子来源和复核状态，再开放下载。</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5 text-xs text-slate-400">
                报告名称
                <input value={config.reportName} onChange={(event) => updateConfig('reportName', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                报告主体
                <input value={config.entityName} onChange={(event) => updateConfig('entityName', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                报告年度
                <select value={config.year} onChange={(event) => updateConfig('year', event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60">
                  <option value="2026">2026 年</option>
                  <option value="2025">2025 年</option>
                  <option value="2024">2024 年</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                核算范围
                <select value={config.scope} onChange={(event) => updateConfig('scope', event.target.value as CarbonReportConfig['scope'])} className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60">
                  <option value="全校区">全校区</option>
                  <option value="主校区">主校区</option>
                  <option value="东校区">东校区</option>
                </select>
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                统一社会信用代码
                <input value={config.creditCode} onChange={(event) => updateConfig('creditCode', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                行业名称 / 代码
                <div className="grid grid-cols-[1fr_120px] gap-2">
                  <input value={config.industryName} onChange={(event) => updateConfig('industryName', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
                  <input value={config.industryCode} onChange={(event) => updateConfig('industryCode', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
                </div>
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                注册地址
                <input value={config.registeredAddress} onChange={(event) => updateConfig('registeredAddress', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-400">
                法定代表人
                <input value={config.legalRepresentative} onChange={(event) => updateConfig('legalRepresentative', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="space-y-1.5 text-xs text-slate-400 md:col-span-2">
                核算和报告边界
                <textarea value={config.boundaryDescription} onChange={(event) => updateConfig('boundaryDescription', event.target.value)} rows={3} className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm leading-6 text-white outline-none focus:border-cyan-500/60" />
              </label>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-slate-400">
              <span>输出格式：Word（.docx） · 中文宋体/黑体 · A4纵向 · 标准表格真实可编辑</span>
              <span>数据覆盖：{report.coveragePeriod}</span>
            </div>

            <div className="mt-5 flex justify-end">
              <Button onClick={() => setStage('review')} className="bg-cyan-600 text-white hover:bg-cyan-500">
                <Eye className="mr-2 h-4 w-4" />
                生成预览并复核
              </Button>
            </div>
          </div>
        )}

        {stage === 'review' && (
          <div className="grid h-[calc(92vh-90px)] min-h-0 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_370px]">
            <div className="min-h-0 overflow-y-auto bg-slate-800/60 p-5">
              <button onClick={() => setStage('config')} className="mb-4 flex items-center gap-1 text-xs text-slate-300 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" /> 返回修改报告信息
              </button>
              <ReportPreview report={report} />
            </div>

            <aside className="min-h-0 overflow-y-auto border-l border-white/10 bg-[#0B1120] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold"><ClipboardCheck className="h-4 w-4 text-cyan-400" />报告复核</h3>
                  <p className="mt-1 text-[11px] text-slate-500">通过 {reviewSummary.passed} · 关注 {reviewSummary.warnings} · 待补充 {reviewSummary.blocking}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] ${reviewSummary.ready ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>
                  {reviewSummary.ready ? '可进入人工复核' : '含待补充项'}
                </span>
              </div>

              <div className="space-y-2">
                {report.reviewChecks.map((check) => (
                  <div key={check.id} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-3">
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <ReviewStatusIcon status={check.status} />
                      {check.label}
                    </div>
                    <p className="mt-1 pl-6 text-[11px] leading-5 text-slate-400">{check.detail}</p>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-white/10" />

              <label className="block space-y-1.5 text-xs text-slate-400">
                复核人
                <input value={review.reviewer} onChange={(event) => updateReview('reviewer', event.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/60" />
              </label>
              <label className="mt-3 block space-y-1.5 text-xs text-slate-400">
                复核意见
                <textarea value={review.note} onChange={(event) => updateReview('note', event.target.value)} rows={3} placeholder="可填写需要后续补充的凭证、边界或因子说明" className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs leading-5 text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/60" />
              </label>

              <div className="mt-4 space-y-2 text-xs">
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.08] p-3 hover:bg-white/[0.03]">
                  <input type="checkbox" checked={review.boundaryConfirmed} onChange={(event) => updateReview('boundaryConfirmed', event.target.checked)} className="mt-0.5" />
                  <span>我已复核报告主体、组织边界和校区范围。</span>
                </label>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/[0.08] p-3 hover:bg-white/[0.03]">
                  <input type="checkbox" checked={review.dataConfirmed} onChange={(event) => updateReview('dataConfirmed', event.target.checked)} className="mt-0.5" />
                  <span>我已复核活动水平数据、排放因子与汇总结果。</span>
                </label>
                {reviewSummary.requiresWarningAcceptance && (
                  <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
                    <input type="checkbox" checked={review.warningsAccepted} onChange={(event) => updateReview('warningsAccepted', event.target.checked)} className="mt-0.5" />
                    <span className="text-amber-200">我已知悉报告中的关注/待补充项，下载后将在正式报送前完成补正。</span>
                  </label>
                )}
              </div>

              <Button disabled={!canDownload} onClick={handleDownload} className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40">
                <Download className="mr-2 h-4 w-4" />
                确认复核并下载 Word 报告
              </Button>
              {!canDownload && <p className="mt-2 text-center text-[10px] text-slate-500">填写复核人并完成上方确认后可下载</p>}
            </aside>
          </div>
        )}

        {stage === 'generating' && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-8 text-center">
            <Loader2 className="h-14 w-14 animate-spin text-cyan-400" />
            <h3 className="mt-5 text-lg font-semibold">正在生成标准 Word 报告</h3>
            <p className="mt-2 text-sm text-slate-400">写入标准模板、核算表、复核记录和凭证索引</p>
            <div className="mt-6 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-500">{progress}%</p>
          </div>
        )}

        {stage === 'complete' && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">报告已生成并开始下载</h3>
            <p className="mt-2 max-w-xl break-all text-sm text-slate-400">{downloadedFile}</p>
            <p className="mt-3 max-w-lg text-xs leading-5 text-slate-500">文件为真实 .docx，可在 Microsoft Word 中继续编辑、签字盖章。报告保留复核人、复核时间、待补充项和数据追溯信息。</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStage('review')} className="border-white/10 text-slate-300 hover:text-white">
                <Eye className="mr-2 h-4 w-4" />返回复核
              </Button>
              <Button onClick={handleDownload} className="bg-emerald-600 text-white hover:bg-emerald-500">
                <Download className="mr-2 h-4 w-4" />重新下载
              </Button>
            </div>
          </div>
        )}

        {stage === 'error' && (
          <div className="flex min-h-[420px] flex-col items-center justify-center px-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
              <XCircle className="h-9 w-9 text-red-400" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">报告生成失败</h3>
            <p className="mt-2 max-w-lg text-sm text-red-300">{error}</p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStage('review')} className="border-white/10 text-slate-300 hover:text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />返回复核
              </Button>
              <Button onClick={handleDownload} className="bg-blue-600 text-white hover:bg-blue-500">
                <RotateCcw className="mr-2 h-4 w-4" />重新生成
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
