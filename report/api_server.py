"""合规碳排放报告 - FastAPI 后端服务

API 端点：
- GET  /api/report/health           — 健康检查
- GET  /api/report/emission-factors — 查询排放因子
- POST /api/report/validate         — 数据校验
- POST /api/report/preview          — HTML 预览
- POST /api/report/generate         — 生成报告（Word）
"""

import io
import json
from typing import Optional
from urllib.parse import quote

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from schemas import (
    EnterpriseInfo,
    ActivityData,
    EmissionSource,
    EmissionFactor,
    EmissionCalculation,
    EmissionSummary,
    EnergyType,
    ReportGenerateRequest,
    ReportGenerateResponse,
    ReportPreviewRequest,
    ReportPreviewResponse,
    ValidateRequest,
    ValidateResponse,
    ValidationResult,
    EmissionFactorsResponse,
    HealthResponse,
)
from report_engine import (
    calculate_emissions,
    build_emission_summary,
    generate_html_preview,
    generate_report,
    get_emission_factors,
    validate_report_data,
)


# ============================================================
# FastAPI 应用
# ============================================================

app = FastAPI(
    title="合规碳排放报告生成服务",
    description="遵循 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》附录C",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# 辅助函数
# ============================================================

def _build_factor_dict(factors: list[EmissionFactor]) -> dict[str, float]:
    """将排放因子列表转换为 {energy_type_value: factor_value} 字典"""
    return {f.energy_type.value: f.factor_value for f in factors}


def _activity_to_emission_sources(
    activity_data: list[ActivityData],
    calcs: list[EmissionCalculation],
) -> list[EmissionSource]:
    """从活动水平数据和计算结果生成排放源列表"""
    return [
        EmissionSource(
            source_id=a.source_id,
            source_name=a.source_name,
            energy_type=a.energy_type,
            scope="scope2" if a.energy_type == EnergyType.ELECTRICITY else "scope1",
            unit=a.unit,
        )
        for a, c in zip(activity_data, calcs)
    ]


def _make_emission_summary(raw: dict) -> EmissionSummary:
    """将 report_engine 返回的 dict 转为 EmissionSummary"""
    return EmissionSummary(
        total_emission=raw.get("total", 0),
        scope1_emission=raw.get("scope1", 0),
        scope2_emission=raw.get("scope2", 0),
    )


# ============================================================
# API 端点
# ============================================================

@app.get("/api/report/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="ok",
        service="合规碳排放报告生成服务",
        version="2.0.0",
    )


@app.get("/api/report/emission-factors", response_model=EmissionFactorsResponse)
async def get_factors():
    factors = get_emission_factors()
    return EmissionFactorsResponse(
        factors=factors,
        last_updated="2024-12-31",
        authority="北京市生态环境局",
    )


@app.post("/api/report/validate", response_model=ValidateResponse)
async def validate(request: ValidateRequest):
    try:
        data = request.model_dump()
        result = validate_report_data(data)
        return ValidateResponse(
            is_valid=result.get("is_valid", True),
            errors=[],
            warnings=result.get("warnings", []),
            suggestions=result.get("suggestions", []),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"数据校验失败: {str(e)}")


@app.post("/api/report/preview", response_model=ReportPreviewResponse)
async def preview(request: ReportPreviewRequest):
    try:
        # 转换数据
        enterprise = EnterpriseInfo(**request.enterprise.model_dump())
        activity = [ActivityData(**a.model_dump()) for a in request.activity_data]
        sources = request.emission_sources or _activity_to_emission_sources(activity, [])
        factor_dict = _build_factor_dict(request.emission_factors) if request.emission_factors else None

        # 计算排放
        calcs = calculate_emissions(activity, factor_dict)
        summary_raw = build_emission_summary(calcs)

        # 若用户未传 emission_sources，根据计算结果补充
        if not request.emission_sources:
            sources = _activity_to_emission_sources(activity, calcs)

        # 生成 HTML
        html = generate_html_preview(
            enterprise, activity, sources, calcs, summary_raw,
            request.report_number,
        )

        return ReportPreviewResponse(
            success=True,
            html=html,
            summary=_make_emission_summary(summary_raw),
            calculations=[c.model_dump() for c in calcs],
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"预览生成失败: {str(e)}")


@app.post("/api/report/generate")
async def generate(
    request: ReportGenerateRequest,
    format: str = Query("word", description="输出格式: word"),
):
    try:
        # 转换数据
        enterprise = EnterpriseInfo(**request.enterprise.model_dump())
        activity = [ActivityData(**a.model_dump()) for a in request.activity_data]
        sources = request.emission_sources or _activity_to_emission_sources(activity, [])
        factor_dict = _build_factor_dict(request.emission_factors) if request.emission_factors else None

        # 计算排放
        calcs = calculate_emissions(activity, factor_dict)
        summary_raw = build_emission_summary(calcs)

        if not request.emission_sources:
            sources = _activity_to_emission_sources(activity, calcs)

        # 生成报告
        report_bytes = generate_report(
            enterprise, activity, sources, calcs, summary_raw,
            request.report_number,
        )

        filename = f"碳排放报告_{enterprise.name}_{enterprise.reporting_year}.docx"
        encoded_filename = quote(filename)
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"

        return StreamingResponse(
            io.BytesIO(report_bytes.getvalue() if hasattr(report_bytes, 'getvalue') else report_bytes),
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"},
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"报告生成失败: {str(e)}")


# ============================================================
# 启动入口
# ============================================================

if __name__ == "__main__":
    import uvicorn
    import logging
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    logging.getLogger("report_engine").info("启动合规碳排放报告生成服务，端口: 8001")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
