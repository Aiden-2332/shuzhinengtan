"""FastAPI 后端服务 - 合规碳排放报告生成

提供 5 个 API 端点：
- POST /api/report/generate      — 生成 Word/PDF 报告
- POST /api/report/preview       — HTML 预览
- GET  /api/report/emission-factors — 查询排放因子
- POST /api/report/validate      — 数据校验
- GET  /api/report/health        — 健康检查
"""

from __future__ import annotations

import io
import json
import logging
import os
import sys
import traceback
import uuid
from pathlib import Path
from typing import Optional

# 添加当前目录到 sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse, Response, StreamingResponse

from report_engine import (
    calculate_emissions,
    build_emission_summary,
    generate_report,
    generate_html_preview,
    get_emission_factors,
    validate_report_data,
)
from schemas import (
    EmissionFactor,
    EmissionFactorQuery,
    EnterpriseInfo,
    ActivityData,
    ReportFormat,
    ReportGenerateRequest,
    ReportGenerateResponse,
    ReportPreviewRequest,
    ReportPreviewResponse,
    ValidateRequest,
    ValidationResult,
)

# ============================================================
# 配置
# ============================================================

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("report-api")

REPORT_PORT = int(os.environ.get("REPORT_PORT", "8001"))
REPORT_DIR = Path(__file__).resolve().parent / "generated"
REPORT_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="合规碳排放报告生成服务",
    description="遵循 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》附录C",
    version="1.0.0",
)

# CORS
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

def _load_mock_data() -> dict:
    """加载测试数据"""
    mock_path = Path(__file__).resolve().parent / "mock_report_data.json"
    if not mock_path.exists():
        raise FileNotFoundError(f"测试数据文件不存在: {mock_path}")
    with open(mock_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _dict_to_enterprise(data: dict) -> EnterpriseInfo:
    """将 dict 转换为 EnterpriseInfo"""
    return EnterpriseInfo(**data)


def _dict_to_activity_data(data: list[dict]) -> list[ActivityData]:
    """将 dict 列表转换为 ActivityData 列表"""
    return [ActivityData(**item) for item in data]


def _dict_to_emission_factors(data: list[dict]) -> list[EmissionFactor]:
    """将 dict 列表转换为 EmissionFactor 列表"""
    return [EmissionFactor(**item) for item in data]


# ============================================================
# API 端点
# ============================================================

@app.get("/api/report/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "service": "合规碳排放报告生成服务", "version": "1.0.0"}


@app.get("/api/report/emission-factors", response_model=EmissionFactorQuery)
async def query_emission_factors():
    """查询默认排放因子"""
    try:
        return get_emission_factors()
    except Exception as e:
        logger.error(f"查询排放因子失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report/validate", response_model=ValidationResult)
async def validate_data(request: ValidateRequest):
    """数据校验"""
    try:
        return validate_report_data(request.enterprise, request.activity_data)
    except Exception as e:
        logger.error(f"数据校验失败: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report/preview", response_model=ReportPreviewResponse)
async def preview_report(request: ReportPreviewRequest):
    """HTML 预览"""
    try:
        calculations = calculate_emissions(request.activity_data, request.emission_factors)
        summary = build_emission_summary(request.enterprise, calculations)
        html = generate_html_preview(
            request.enterprise, calculations, summary,
            request.activity_data, request.emission_factors,
        )
        return ReportPreviewResponse(success=True, html=html, summary=summary, message="预览生成成功")
    except Exception as e:
        logger.error(f"预览生成失败: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/report/generate", response_model=ReportGenerateResponse)
async def generate_report_endpoint(request: ReportGenerateRequest):
    """生成 Word/PDF 报告"""
    try:
        report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"
        file_bytes, html_preview, summary = generate_report(
            request.enterprise,
            request.activity_data,
            request.emission_factors,
            request.report_format,
            request.include_html_preview,
        )

        # 保存文件
        ext = "docx" if request.report_format == ReportFormat.WORD else "pdf"
        filename = f"{report_id}.{ext}"
        filepath = REPORT_DIR / filename
        with open(filepath, "wb") as f:
            f.write(file_bytes)

        logger.info(f"报告生成成功: {filename} ({len(file_bytes):,} bytes)")

        return ReportGenerateResponse(
            success=True,
            report_id=report_id,
            format=request.report_format,
            file_size_bytes=len(file_bytes),
            download_url=f"/api/report/download/{filename}",
            html_preview=html_preview,
            summary=summary,
            message="报告生成成功",
        )
    except Exception as e:
        logger.error(f"报告生成失败: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/report/download/{filename}")
async def download_report(filename: str):
    """下载生成的报告文件"""
    filepath = REPORT_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="文件不存在或已过期")

    media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    if filename.endswith(".pdf"):
        media_type = "application/pdf"

    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type=media_type,
    )


@app.post("/api/report/test")
async def test_with_mock_data():
    """使用测试数据快速生成报告"""
    try:
        data = _load_mock_data()
        enterprise = _dict_to_enterprise(data["enterprise"])
        activity_data = _dict_to_activity_data(data["activity_data"])
        emission_factors = _dict_to_emission_factors(data["emission_factors"])

        request = ReportGenerateRequest(
            enterprise=enterprise,
            activity_data=activity_data,
            emission_factors=emission_factors,
            report_format=ReportFormat.WORD,
            include_html_preview=True,
        )

        return await generate_report_endpoint(request)
    except Exception as e:
        logger.error(f"测试报告生成失败: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 启动入口
# ============================================================

if __name__ == "__main__":
    import uvicorn
    logger.info(f"启动合规碳排放报告生成服务，端口: {REPORT_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=REPORT_PORT, log_level="info")
