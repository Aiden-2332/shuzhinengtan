"""Pydantic v2 数据类型定义 - 合规碳排放报告

遵循 DB11/T 1785-2020《二氧化碳排放核算和报告要求 服务业》附录C
"""

from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ============================================================
# 枚举类型
# ============================================================

class ReportFormat(str, Enum):
    PDF = "pdf"
    WORD = "word"
    HTML = "html"


class EnergyType(str, Enum):
    ELECTRICITY = "electricity"     # 电力
    NATURAL_GAS = "natural_gas"     # 天然气
    HEAT = "heat"                   # 热力
    GASOLINE = "gasoline"           # 汽油
    DIESEL = "diesel"               # 柴油
    COAL = "coal"                   # 煤炭


class EmissionScope(str, Enum):
    SCOPE1 = "scope1"               # 直接排放
    SCOPE2 = "scope2"               # 间接排放


class ReportStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    REJECTED = "rejected"


# ============================================================
# 企业基本信息 (表 C.1)
# ============================================================

class EnterpriseInfo(BaseModel):
    """表 C.1 企业基本信息"""
    name: str = Field(..., description="企业名称")
    unified_code: str = Field(..., description="统一社会信用代码")
    address: str = Field(..., description="企业地址")
    legal_representative: str = Field(..., description="法定代表人")
    contact_person: str = Field(..., description="联系人")
    contact_phone: str = Field(..., description="联系电话")
    industry_category: str = Field(..., description="行业分类（服务业）")
    reporting_year: int = Field(..., ge=2000, le=2100, description="报告年度")
    reporting_period: str = Field(default="1月1日-12月31日", description="报告期")
    campus_area: Optional[float] = Field(None, description="校园面积（万㎡）")
    student_count: Optional[int] = Field(None, description="在校学生数")
    staff_count: Optional[int] = Field(None, description="教职工数")


# ============================================================
# 排放源与活动水平数据
# ============================================================

class EmissionSource(BaseModel):
    """单个排放源定义"""
    source_id: str = Field(..., description="排放源编号（如 C-01）")
    source_name: str = Field(..., description="排放源名称")
    energy_type: EnergyType
    scope: EmissionScope
    unit: str = Field(..., description="活动水平单位（MWh, 万Nm³, GJ, t 等）")
    description: Optional[str] = Field(None, description="排放源描述")


class ActivityData(BaseModel):
    """表 C.5~C.10 活动水平数据"""
    source_id: str = Field(..., description="排放源编号")
    source_name: str = Field(..., description="排放源名称")
    energy_type: EnergyType
    activity_value: float = Field(..., ge=0, description="活动水平数值")
    unit: str = Field(..., description="单位")
    data_source: str = Field(..., description="数据来源（计量表/采购单据/估算）")
    meter_id: Optional[str] = Field(None, description="计量器具编号")


class EmissionFactor(BaseModel):
    """表 C.11~C.14 排放因子数据"""
    source_id: str = Field(..., description="排放源编号")
    energy_type: EnergyType
    factor_name: str = Field(..., description="排放因子名称")
    factor_value: float = Field(..., gt=0, description="排放因子数值")
    factor_unit: str = Field(..., description="排放因子单位（tCO₂/MWh 等）")
    factor_source: str = Field(..., description="排放因子来源")
    oxidation_rate: Optional[float] = Field(default=1.0, description="氧化率")
    gwp: Optional[float] = Field(None, description="全球变暖潜势")


class EmissionCalculation(BaseModel):
    """表 C.15 排放量计算结果"""
    source_id: str
    source_name: str
    energy_type: EnergyType
    scope: EmissionScope
    activity_value: float
    activity_unit: str
    emission_factor: float
    emission_factor_unit: str
    co2_emission: float = Field(..., ge=0, description="CO₂排放量 (tCO₂)")
    co2_emission_pct: float = Field(..., ge=0, le=100, description="占比 (%)")

    @field_validator("co2_emission")
    @classmethod
    def validate_emission(cls, v: float) -> float:
        if v < 0:
            raise ValueError("排放量不能为负值")
        return round(v, 4)


# ============================================================
# 排放因子默认值（DB11/T 1785-2020）
# ============================================================

DEFAULT_EMISSION_FACTORS: dict[EnergyType, EmissionFactor] = {
    EnergyType.ELECTRICITY: EmissionFactor(
        source_id="C-01",
        energy_type=EnergyType.ELECTRICITY,
        factor_name="电力排放因子",
        factor_value=0.604,
        factor_unit="tCO₂/MWh",
        factor_source="北京市生态环境局 2024年度",
        oxidation_rate=1.0,
    ),
    EnergyType.NATURAL_GAS: EmissionFactor(
        source_id="C-02",
        energy_type=EnergyType.NATURAL_GAS,
        factor_name="天然气排放因子",
        factor_value=2.1622,
        factor_unit="tCO₂/万Nm³",
        factor_source="DB11/T 1785-2020 附录B",
        oxidation_rate=0.99,
        gwp=1.0,
    ),
    EnergyType.HEAT: EmissionFactor(
        source_id="C-03",
        energy_type=EnergyType.HEAT,
        factor_name="热力排放因子",
        factor_value=0.11,
        factor_unit="tCO₂/GJ",
        factor_source="DB11/T 1785-2020 附录B",
        oxidation_rate=1.0,
    ),
    EnergyType.GASOLINE: EmissionFactor(
        source_id="C-04",
        energy_type=EnergyType.GASOLINE,
        factor_name="汽油排放因子",
        factor_value=2.9251,
        factor_unit="tCO₂/t",
        factor_source="DB11/T 1785-2020 附录B",
        oxidation_rate=0.98,
    ),
    EnergyType.DIESEL: EmissionFactor(
        source_id="C-05",
        energy_type=EnergyType.DIESEL,
        factor_name="柴油排放因子",
        factor_value=3.0959,
        factor_unit="tCO₂/t",
        factor_source="DB11/T 1785-2020 附录B",
        oxidation_rate=0.98,
    ),
    EnergyType.COAL: EmissionFactor(
        source_id="C-06",
        energy_type=EnergyType.COAL,
        factor_name="煤炭排放因子",
        factor_value=1.9003,
        factor_unit="tCO₂/t",
        factor_source="DB11/T 1785-2020 附录B",
        oxidation_rate=0.93,
    ),
}


# ============================================================
# 请求/响应模型
# ============================================================

class ReportGenerateRequest(BaseModel):
    """生成报告请求"""
    enterprise: EnterpriseInfo
    activity_data: list[ActivityData] = Field(..., min_length=1)
    emission_sources: list[EmissionSource] = Field(default_factory=list)
    emission_factors: Optional[list[EmissionFactor]] = None
    report_number: str = ""
    report_format: ReportFormat = ReportFormat.WORD
    include_html_preview: bool = False
    template_version: str = Field(default="DB11/T 1785-2020")


class ReportGenerateResponse(BaseModel):
    """生成报告响应"""
    success: bool
    report_id: str
    format: ReportFormat
    file_size_bytes: Optional[int] = None
    download_url: Optional[str] = None
    html_preview: Optional[str] = None
    summary: Optional[EmissionSummary] = None
    message: str = ""


class ReportPreviewRequest(BaseModel):
    """HTML 预览请求"""
    enterprise: EnterpriseInfo
    activity_data: list[ActivityData]
    emission_sources: list[EmissionSource] = []
    emission_factors: Optional[list[EmissionFactor]] = None
    report_number: str = ""


class ReportPreviewResponse(BaseModel):
    """HTML 预览响应"""
    success: bool
    html: str = ""
    summary: Optional[EmissionSummary] = None
    calculations: list[dict] = Field(default_factory=list)
    message: str = ""


class EmissionSummary(BaseModel):
    """排放汇总"""
    total_emission: float = Field(..., description="总排放量 (tCO₂)")
    scope1_emission: float = Field(default=0, description="直接排放量 (tCO₂)")
    scope2_emission: float = Field(default=0, description="间接排放量 (tCO₂)")
    emission_by_source: list[EmissionCalculation] = Field(default_factory=list)
    emission_intensity_per_area: Optional[float] = Field(None, description="单位面积排放强度")
    emission_intensity_per_capita: Optional[float] = Field(None, description="人均排放强度")


class ValidateRequest(BaseModel):
    """数据校验请求"""
    enterprise: EnterpriseInfo
    activity_data: list[ActivityData]
    emission_sources: list[EmissionSource] = []
    emission_factors: Optional[list[EmissionFactor]] = None


class ValidationResult(BaseModel):
    """数据校验结果"""
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class ValidateResponse(BaseModel):
    """数据校验响应"""
    is_valid: bool
    errors: list[ValidationResult] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class EmissionFactorQuery(BaseModel):
    """排放因子查询响应"""
    factors: list[EmissionFactor]
    last_updated: str
    authority: str = "北京市生态环境局"


class EmissionFactorsResponse(BaseModel):
    """排放因子查询响应（API 返回）"""
    factors: list[dict] = Field(default_factory=list)
    last_updated: str = ""
    authority: str = "北京市生态环境局"


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    service: str
    version: str
