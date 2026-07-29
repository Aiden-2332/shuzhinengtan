"""核心生成引擎 - 排放计算 + Word 生成 + HTML 预览 + 数据校验

遵循 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》附录C
"""

from __future__ import annotations

import io
import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from schemas import (
    ActivityData,
    DEFAULT_EMISSION_FACTORS,
    EmissionCalculation,
    EmissionFactor,
    EmissionFactorQuery,
    EmissionScope,
    EmissionSummary,
    EnergyType,
    EnterpriseInfo,
    ReportFormat,
    ValidateRequest,
    ValidationResult,
)


# ============================================================
# 排放计算引擎
# ============================================================

def calculate_emissions(
    activity_data: list[ActivityData],
    emission_factors: Optional[list[EmissionFactor]] = None,
) -> list[EmissionCalculation]:
    """根据活动水平数据和排放因子计算 CO₂ 排放量"""
    if emission_factors is None:
        ef_map: dict[EnergyType, EmissionFactor] = DEFAULT_EMISSION_FACTORS
    else:
        ef_map = {ef.energy_type: ef for ef in emission_factors}

    results: list[EmissionCalculation] = []
    total = 0.0

    for ad in activity_data:
        ef = ef_map.get(ad.energy_type)
        if ef is None:
            continue

        co2 = ad.activity_value * ef.factor_value * (ef.oxidation_rate or 1.0)

        scope = (
            EmissionScope.SCOPE1
            if ad.energy_type != EnergyType.ELECTRICITY
            else EmissionScope.SCOPE2
        )

        results.append(
            EmissionCalculation(
                source_id=ad.source_id,
                source_name=ad.source_name,
                energy_type=ad.energy_type,
                scope=scope,
                activity_value=ad.activity_value,
                activity_unit=ad.unit,
                emission_factor=ef.factor_value,
                emission_factor_unit=ef.factor_unit,
                co2_emission=round(co2, 4),
                co2_emission_pct=0.0,
            )
        )
        total += co2

    # 计算占比
    for r in results:
        r.co2_emission_pct = round((r.co2_emission / total * 100) if total > 0 else 0, 2)

    return results


def build_emission_summary(
    enterprise: EnterpriseInfo,
    calculations: list[EmissionCalculation],
) -> EmissionSummary:
    """构建排放汇总"""
    total = sum(c.co2_emission for c in calculations)
    scope1 = sum(c.co2_emission for c in calculations if c.scope == EmissionScope.SCOPE1)
    scope2 = sum(c.co2_emission for c in calculations if c.scope == EmissionScope.SCOPE2)

    intensity_area = None
    if enterprise.campus_area and enterprise.campus_area > 0:
        intensity_area = round(total / enterprise.campus_area, 4)

    total_population = (enterprise.student_count or 0) + (enterprise.staff_count or 0)
    intensity_capita = None
    if total_population > 0:
        intensity_capita = round(total / total_population, 4)

    return EmissionSummary(
        total_emission=round(total, 4),
        scope1_emission=round(scope1, 4),
        scope2_emission=round(scope2, 4),
        emission_by_source=calculations,
        emission_intensity_per_area=intensity_area,
        emission_intensity_per_capita=intensity_capita,
    )


# ============================================================
# Word 报告生成器 (python-docx)
# ============================================================

def _add_table_c1(doc, enterprise: EnterpriseInfo) -> None:
    """表 C.1 企业基本信息"""
    from docx.shared import Cm, Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT

    doc.add_heading("表C.1 企业基本信息", level=3)
    table = doc.add_table(rows=9, cols=2, style="Table Grid")
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    fields = [
        ("企业名称", enterprise.name),
        ("统一社会信用代码", enterprise.unified_code),
        ("企业地址", enterprise.address),
        ("法定代表人", enterprise.legal_representative),
        ("联系人", enterprise.contact_person),
        ("联系电话", enterprise.contact_phone),
        ("行业分类", enterprise.industry_category),
        ("报告年度", str(enterprise.reporting_year)),
        ("报告期", enterprise.reporting_period),
    ]

    for i, (label, value) in enumerate(fields):
        row = table.rows[i]
        cell_label = row.cells[0]
        cell_label.text = label
        for p in cell_label.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(10)
        row.cells[1].text = value
        for p in row.cells[1].paragraphs:
            for run in p.runs:
                run.font.size = Pt(10)


def _add_table_calculations(doc, calculations: list[EmissionCalculation], summary: EmissionSummary) -> None:
    """表 C.15 排放量计算汇总"""
    from docx.shared import Pt, Cm
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_TABLE_ALIGNMENT

    doc.add_heading("表C.15 二氧化碳排放量计算汇总", level=3)
    headers = ["排放源编号", "排放源名称", "能源类型", "活动水平", "单位",
               "排放因子", "排放因子单位", "CO₂排放量(tCO₂)", "占比(%)"]
    table = doc.add_table(rows=len(calculations) + 2, cols=9, style="Table Grid")
    table.alignment = WD_TABLE_ALIGNMENT.CENTER

    # 表头
    for j, h in enumerate(headers):
        cell = table.rows[0].cells[j]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(8)

    # 数据行
    for i, c in enumerate(calculations):
        row = table.rows[i + 1]
        values = [
            c.source_id, c.source_name, c.energy_type.value,
            str(c.activity_value), c.activity_unit,
            str(c.emission_factor), c.emission_factor_unit,
            str(c.co2_emission), str(c.co2_emission_pct),
        ]
        for j, v in enumerate(values):
            cell = row.cells[j]
            cell.text = v
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(8)

    # 汇总行
    total_row = table.rows[-1]
    total_row.cells[0].text = "合计"
    total_row.cells[7].text = str(summary.total_emission)
    total_row.cells[8].text = "100.00"
    for cell in total_row.cells:
        for p in cell.paragraphs:
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(8)


def generate_word_report(
    enterprise: EnterpriseInfo,
    calculations: list[EmissionCalculation],
    summary: EmissionSummary,
    activity_data: list[ActivityData],
    emission_factors: Optional[list[EmissionFactor]] = None,
) -> bytes:
    """生成 Word (.docx) 格式合规报告"""
    try:
        from docx import Document
        from docx.shared import Pt, Cm, RGBColor
        from docx.enum.text import WD_ALIGN_PARAGRAPH
    except ImportError:
        raise RuntimeError("python-docx 未安装，请运行: pip install python-docx")

    doc = Document()

    # 页面设置
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)

    # ---- 封面 ----
    title = doc.add_heading("二氧化碳排放核算报告", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle = doc.add_paragraph(
        f"（{enterprise.reporting_year}年度）\n依据 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》编制"
    )
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER

    doc.add_paragraph(f"企业名称：{enterprise.name}")
    doc.add_paragraph(f"报告日期：{datetime.now().strftime('%Y年%m月%d日')}")
    doc.add_page_break()

    # ---- 第一章 企业基本情况 ----
    doc.add_heading("一、企业基本情况", level=1)
    doc.add_paragraph(f"本报告覆盖{enterprise.name}（统一社会信用代码：{enterprise.unified_code}）"
                      f"{enterprise.reporting_year}年度的二氧化碳排放情况。")
    doc.add_paragraph(f"企业地址：{enterprise.address}")
    doc.add_paragraph(f"行业分类：{enterprise.industry_category}")
    if enterprise.campus_area:
        doc.add_paragraph(f"校园面积：{enterprise.campus_area} 万㎡")
    if enterprise.student_count:
        doc.add_paragraph(f"在校学生数：{enterprise.student_count} 人")
    if enterprise.staff_count:
        doc.add_paragraph(f"教职工数：{enterprise.staff_count} 人")
    _add_table_c1(doc, enterprise)

    # ---- 第二章 二氧化碳排放 ----
    doc.add_heading("二、二氧化碳排放", level=1)
    doc.add_paragraph(
        f"经核算，{enterprise.reporting_year}年度{enterprise.name}二氧化碳排放总量为 "
        f"{summary.total_emission:,.2f} tCO₂。"
    )
    doc.add_paragraph(f"  其中直接排放（Scope 1）：{summary.scope1_emission:,.2f} tCO₂")
    doc.add_paragraph(f"  间接排放（Scope 2）：{summary.scope2_emission:,.2f} tCO₂")

    if summary.emission_intensity_per_area:
        doc.add_paragraph(f"单位面积排放强度：{summary.emission_intensity_per_area:.4f} tCO₂/万㎡")
    if summary.emission_intensity_per_capita:
        doc.add_paragraph(f"人均排放强度：{summary.emission_intensity_per_capita:.4f} tCO₂/人")

    _add_table_calculations(doc, calculations, summary)

    # ---- 第三章 活动水平数据 ----
    doc.add_heading("三、活动水平数据", level=1)
    doc.add_paragraph(f"报告年度共涉及 {len(activity_data)} 个排放源，活动水平数据来源包括计量表读数、"
                      "能源采购结算单和加油记录台账等。")

    from docx.enum.table import WD_TABLE_ALIGNMENT
    ad_headers = ["排放源编号", "排放源名称", "能源类型", "活动水平", "单位", "数据来源"]
    ad_table = doc.add_table(rows=len(activity_data) + 1, cols=6, style="Table Grid")
    ad_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(ad_headers):
        cell = ad_table.rows[0].cells[j]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(9)
    for i, ad in enumerate(activity_data):
        values = [ad.source_id, ad.source_name, ad.energy_type.value,
                  str(ad.activity_value), ad.unit, ad.data_source]
        for j, v in enumerate(values):
            cell = ad_table.rows[i + 1].cells[j]
            cell.text = v
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9)

    # ---- 第四章 排放因子数据 ----
    doc.add_heading("四、排放因子数据", level=1)
    doc.add_paragraph("本报告采用的排放因子依据 DB11/T 1785-2020 附录B 及北京市生态环境局发布的年度排放因子。")

    ef_actual = emission_factors or list(DEFAULT_EMISSION_FACTORS.values())
    ef_headers = ["排放源编号", "能源类型", "排放因子名称", "排放因子值", "单位", "来源"]
    ef_table = doc.add_table(rows=len(ef_actual) + 1, cols=6, style="Table Grid")
    ef_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for j, h in enumerate(ef_headers):
        cell = ef_table.rows[0].cells[j]
        cell.text = h
        for p in cell.paragraphs:
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in p.runs:
                run.bold = True
                run.font.size = Pt(9)
    for i, ef in enumerate(ef_actual):
        values = [ef.source_id, ef.energy_type.value, ef.factor_name,
                  str(ef.factor_value), ef.factor_unit, ef.factor_source]
        for j, v in enumerate(values):
            cell = ef_table.rows[i + 1].cells[j]
            cell.text = v
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(9)

    # ---- 真实性声明 ----
    doc.add_page_break()
    doc.add_heading("真实性声明", level=1)
    doc.add_paragraph(
        "本企业承诺本报告中所涉及的数据、资料真实、完整、有效，"
        "不存在虚假记载、误导性陈述或重大遗漏。"
    )
    doc.add_paragraph("")
    doc.add_paragraph(f"法定代表人（签字）：{' ' * 10}")
    doc.add_paragraph(f"企业（盖章）：{' ' * 10}")
    doc.add_paragraph(f"日期：{' ' * 15}")

    # 保存到 BytesIO
    buffer = io.BytesIO()
    doc.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


# ============================================================
# HTML 预览生成器
# ============================================================

def generate_html_preview(
    enterprise: EnterpriseInfo,
    calculations: list[EmissionCalculation],
    summary: EmissionSummary,
    activity_data: list[ActivityData],
    emission_factors: Optional[list[EmissionFactor]] = None,
) -> str:
    """生成 HTML 格式报告预览"""
    ef_actual = emission_factors or list(DEFAULT_EMISSION_FACTORS.values())

    calc_rows = "".join(
        f"""<tr>
            <td>{c.source_id}</td><td>{c.source_name}</td>
            <td>{c.energy_type.value}</td><td>{c.activity_value}</td>
            <td>{c.activity_unit}</td><td>{c.emission_factor}</td>
            <td>{c.emission_factor_unit}</td>
            <td class="num">{c.co2_emission:,.2f}</td>
            <td class="num">{c.co2_emission_pct:.2f}%</td>
        </tr>"""
        for c in calculations
    )

    ef_rows = "".join(
        f"""<tr>
            <td>{ef.source_id}</td><td>{ef.energy_type.value}</td>
            <td>{ef.factor_name}</td><td>{ef.factor_value}</td>
            <td>{ef.factor_unit}</td><td>{ef.factor_source}</td>
        </tr>"""
        for ef in ef_actual
    )

    ad_rows = "".join(
        f"""<tr>
            <td>{ad.source_id}</td><td>{ad.source_name}</td>
            <td>{ad.energy_type.value}</td>
            <td>{ad.activity_value}</td><td>{ad.unit}</td>
            <td>{ad.data_source}</td>
        </tr>"""
        for ad in activity_data
    )

    return f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>二氧化碳排放核算报告 - {enterprise.name}（{enterprise.reporting_year}年度）</title>
<style>
  body {{ font-family: "SimSun", "宋体", serif; font-size: 12pt; line-height: 1.8; max-width: 210mm; margin: 0 auto; padding: 20px; color: #333; }}
  h1 {{ text-align: center; font-size: 18pt; border-bottom: 2px solid #1a5276; padding-bottom: 10px; }}
  h2 {{ font-size: 14pt; margin-top: 24px; color: #1a5276; }}
  h3 {{ font-size: 12pt; margin-top: 16px; }}
  table {{ width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; }}
  th, td {{ border: 1px solid #666; padding: 4px 6px; text-align: center; }}
  th {{ background: #1a5276; color: #fff; }}
  .num {{ text-align: right; font-family: "Consolas", monospace; }}
  .cover {{ text-align: center; padding: 80px 0; }}
  .cover h1 {{ font-size: 22pt; border: none; }}
  .declaration {{ margin-top: 60px; }}
  .summary-box {{ background: #eaf2f8; border-radius: 8px; padding: 16px; margin: 12px 0; }}
  .summary-box p {{ margin: 4px 0; }}
  @media print {{ body {{ padding: 0; }} }}
</style>
</head>
<body>
<div class="cover">
  <h1>二氧化碳排放核算报告</h1>
  <p style="font-size:14pt">（{enterprise.reporting_year}年度）</p>
  <p>依据 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》编制</p>
  <p style="margin-top:40px">企业名称：{enterprise.name}</p>
  <p>报告日期：{datetime.now().strftime('%Y年%m月%d日')}</p>
</div>

<h1>一、企业基本情况</h1>
<p>本报告覆盖<b>{enterprise.name}</b>（统一社会信用代码：{enterprise.unified_code}）{enterprise.reporting_year}年度的二氧化碳排放情况。</p>
<p>企业地址：{enterprise.address} | 行业分类：{enterprise.industry_category}</p>
{"<p>校园面积：" + str(enterprise.campus_area) + " 万㎡</p>" if enterprise.campus_area else ""}
{"<p>在校学生数：" + str(enterprise.student_count) + " 人</p>" if enterprise.student_count else ""}
{"<p>教职工数：" + str(enterprise.staff_count) + " 人</p>" if enterprise.staff_count else ""}

<h3>表C.1 企业基本信息</h3>
<table>
  <tr><th>企业名称</th><td>{enterprise.name}</td></tr>
  <tr><th>统一社会信用代码</th><td>{enterprise.unified_code}</td></tr>
  <tr><th>企业地址</th><td>{enterprise.address}</td></tr>
  <tr><th>法定代表人</th><td>{enterprise.legal_representative}</td></tr>
  <tr><th>联系人</th><td>{enterprise.contact_person}</td></tr>
  <tr><th>联系电话</th><td>{enterprise.contact_phone}</td></tr>
  <tr><th>行业分类</th><td>{enterprise.industry_category}</td></tr>
  <tr><th>报告年度</th><td>{enterprise.reporting_year}</td></tr>
  <tr><th>报告期</th><td>{enterprise.reporting_period}</td></tr>
</table>

<h1>二、二氧化碳排放</h1>
<div class="summary-box">
  <p><b>排放总量：{summary.total_emission:,.2f} tCO₂</b></p>
  <p>  直接排放（Scope 1）：{summary.scope1_emission:,.2f} tCO₂</p>
  <p>  间接排放（Scope 2）：{summary.scope2_emission:,.2f} tCO₂</p>
  {"<p>单位面积排放强度：" + f"{summary.emission_intensity_per_area:.4f}" + " tCO₂/万㎡</p>" if summary.emission_intensity_per_area else ""}
  {"<p>人均排放强度：" + f"{summary.emission_intensity_per_capita:.4f}" + " tCO₂/人</p>" if summary.emission_intensity_per_capita else ""}
</div>

<h3>表C.15 二氧化碳排放量计算汇总</h3>
<table>
  <tr><th>编号</th><th>排放源名称</th><th>能源类型</th><th>活动水平</th><th>单位</th><th>排放因子</th><th>因子单位</th><th>CO₂(tCO₂)</th><th>占比</th></tr>
  {calc_rows}
  <tr style="font-weight:bold;background:#eaf2f8">
    <td colspan="7">合计</td>
    <td class="num">{summary.total_emission:,.2f}</td>
    <td class="num">100.00%</td>
  </tr>
</table>

<h1>三、活动水平数据</h1>
<table>
  <tr><th>编号</th><th>排放源名称</th><th>能源类型</th><th>活动水平</th><th>单位</th><th>数据来源</th></tr>
  {ad_rows}
</table>

<h1>四、排放因子数据</h1>
<p>本报告采用的排放因子依据 DB11/T 1785-2020 附录B 及北京市生态环境局发布的年度排放因子。</p>
<table>
  <tr><th>编号</th><th>能源类型</th><th>排放因子名称</th><th>因子值</th><th>单位</th><th>来源</th></tr>
  {ef_rows}
</table>

<div class="declaration">
<h1>真实性声明</h1>
<p>本企业承诺本报告中所涉及的数据、资料真实、完整、有效，不存在虚假记载、误导性陈述或重大遗漏。</p>
<p style="margin-top:40px">法定代表人（签字）：{' ' * 20}</p>
<p>企业（盖章）：{' ' * 20}</p>
<p>日期：{' ' * 20}</p>
</div>

</body>
</html>"""


# ============================================================
# 数据校验
# ============================================================

def validate_report_data(
    enterprise: EnterpriseInfo,
    activity_data: list[ActivityData],
) -> ValidationResult:
    """校验报告数据完整性和合理性"""
    errors: list[str] = []
    warnings: list[str] = []
    suggestions: list[str] = []

    # 企业信息校验
    if not enterprise.unified_code or len(enterprise.unified_code) != 18:
        errors.append("统一社会信用代码必须为18位")
    if not enterprise.contact_phone:
        errors.append("联系电话不能为空")
    if enterprise.reporting_year < 2020 or enterprise.reporting_year > datetime.now().year:
        errors.append(f"报告年度 {enterprise.reporting_year} 不在有效范围内")

    # 活动数据校验
    if not activity_data:
        errors.append("活动水平数据不能为空")
        return ValidationResult(is_valid=False, errors=errors, warnings=warnings, suggestions=suggestions)

    for ad in activity_data:
        if ad.activity_value < 0:
            errors.append(f"排放源 {ad.source_id} 活动水平不能为负值: {ad.activity_value}")
        if ad.activity_value == 0:
            warnings.append(f"排放源 {ad.source_id} 活动水平为0，请确认数据完整性")
        if ad.activity_value > 1_000_000:
            warnings.append(f"排放源 {ad.source_id} 活动水平异常偏高: {ad.activity_value}，请核实")

    # 合理性建议
    electric_sources = [ad for ad in activity_data if ad.energy_type == EnergyType.ELECTRICITY]
    if not electric_sources:
        suggestions.append("建议添加外购电力排放源数据（Scope 2 排放）")

    total_energy = sum(ad.activity_value for ad in activity_data)
    if total_energy == 0:
        errors.append("所有排放源活动水平总和为0")

    is_valid = len(errors) == 0
    return ValidationResult(
        is_valid=is_valid,
        errors=errors,
        warnings=warnings,
        suggestions=suggestions,
    )


# ============================================================
# 排放因子查询
# ============================================================

def get_emission_factors() -> EmissionFactorQuery:
    """获取默认排放因子列表"""
    return EmissionFactorQuery(
        factors=list(DEFAULT_EMISSION_FACTORS.values()),
        last_updated="2024-12-01",
        authority="北京市生态环境局",
    )


# ============================================================
# 报告生成主流程
# ============================================================

def generate_report(
    enterprise: EnterpriseInfo,
    activity_data: list[ActivityData],
    emission_factors: Optional[list[EmissionFactor]] = None,
    report_format: ReportFormat = ReportFormat.WORD,
    include_html_preview: bool = False,
) -> tuple[bytes, str | None, EmissionSummary]:
    """生成合规报告主流程

    Returns:
        (file_bytes, html_preview, emission_summary)
    """
    # Step 1: 计算排放量
    calculations = calculate_emissions(activity_data, emission_factors)

    # Step 2: 构建汇总
    summary = build_emission_summary(enterprise, calculations)

    # Step 3: 生成报告文件
    if report_format == ReportFormat.WORD:
        file_bytes = generate_word_report(enterprise, calculations, summary, activity_data, emission_factors)
    else:
        # PDF / HTML 暂用 Word 替代（PDF 需要额外依赖）
        file_bytes = generate_word_report(enterprise, calculations, summary, activity_data, emission_factors)

    # Step 4: HTML 预览（可选）
    html_preview = None
    if include_html_preview:
        html_preview = generate_html_preview(enterprise, calculations, summary, activity_data, emission_factors)

    return file_bytes, html_preview, summary
