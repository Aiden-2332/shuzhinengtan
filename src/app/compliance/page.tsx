"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getQualityMetrics, getAuditTrail, getReportProgress } from "@/data/mock-data";
import { FileText, Shield, CheckCircle, Clock, Lock, AlertTriangle, BarChart3, Search, Database } from "lucide-react";

export default function L4ComplianceView() {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);

  const building3DData = useMemo(() => getBuilding3DData(), []);
  const qualityMetrics = useMemo(() => getQualityMetrics(), []);
  const auditTrail = useMemo(() => getAuditTrail(), []);
  const reports = useMemo(() => getReportProgress(), []);

  const handleBuildingClick = useCallback((buildingId: string) => {
    setSelectedBuilding(buildingId);
  }, []);

  const selectedBuildingData = useMemo(() => {
    if (!selectedBuilding) return null;
    return getBuildingDetail(selectedBuilding);
  }, [selectedBuilding]);

  // 计算数据锁定状态
  const lockedData = useMemo(() => {
    return building3DData.filter((b) => b.status !== "danger").length;
  }, [building3DData]);

  // 左侧指标面板 - 数据质量 + 数据锁定 + 合规状态
  const leftPanel = (
    <div className="space-y-3">
      {/* 数据质量 */}
      <IndicatorGroup title="数据质量">
        <div className="p-3 rounded-lg bg-gray-900/60 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-xs">综合质量评分</span>
            <span className={`text-sm font-mono font-bold ${
              qualityMetrics.score >= 90 ? "text-emerald-400" : qualityMetrics.score >= 80 ? "text-amber-400" : "text-red-400"
            }`}>{qualityMetrics.score}</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              qualityMetrics.score >= 90 ? "bg-gradient-to-r from-emerald-500 to-green-400" : qualityMetrics.score >= 80 ? "bg-gradient-to-r from-amber-500 to-orange-400" : "bg-gradient-to-r from-red-500 to-rose-400"
            }`} style={{ width: `${qualityMetrics.score}%` }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <IndicatorCard
            title="完整度"
            value={qualityMetrics.completeness}
            unit="%"
            compact
            status={qualityMetrics.completeness >= 95 ? "success" : "warning"}
          />
          <IndicatorCard
            title="及时率"
            value={qualityMetrics.timeliness}
            unit="%"
            compact
            status={qualityMetrics.timeliness >= 85 ? "success" : "warning"}
            icon={<Clock className="w-4 h-4" />}
          />
        </div>
        <IndicatorCard
          title="准确率"
          value={qualityMetrics.accuracy}
          unit="%"
          status={qualityMetrics.accuracy >= 90 ? "success" : "warning"}
        />
      </IndicatorGroup>

      {/* 数据锁定 */}
      <IndicatorGroup title="数据锁定状态">
        <div className="grid grid-cols-2 gap-2">
          <IndicatorCard
            title="已锁定"
            value={lockedData}
            unit={`/ ${building3DData.length} 栋`}
            compact
            status="success"
            icon={<Lock className="w-4 h-4" />}
          />
          <IndicatorCard
            title="待锁定"
            value={building3DData.length - lockedData}
            unit="栋"
            compact
            status={building3DData.length - lockedData > 0 ? "warning" : "success"}
          />
        </div>
        <div className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">锁定时间</span>
            <span className="text-emerald-400 font-mono">2026-07-15</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-400">锁定人员</span>
            <span className="text-gray-300">张三</span>
          </div>
        </div>
      </IndicatorGroup>

      {/* 合规状态 */}
      <IndicatorGroup title="合规状态">
        <div className="grid grid-cols-2 gap-2">
          <IndicatorCard
            title="年度核查"
            value="进行中"
            status="warning"
            compact
            icon={<FileText className="w-4 h-4" />}
          />
          <IndicatorCard
            title="MRV 报告"
            value="已提交"
            status="success"
            compact
            icon={<CheckCircle className="w-4 h-4" />}
          />
        </div>
        <IndicatorCard
          title="异常数据"
          value={building3DData.filter((b) => b.status === "danger").length}
          unit="条"
          status={building3DData.some((b) => b.status === "danger") ? "danger" : "success"}
          icon={<AlertTriangle className="w-4 h-4" />}
        />
      </IndicatorGroup>
    </div>
  );

  // 右侧指标面板 - 报告进度 + 审计轨迹 + 数据追溯
  const rightPanel = (
    <div className="space-y-3">
      {/* 报告进度 */}
      <IndicatorGroup title="报告进度">
        {reports.map((report: { id: string; name: string; status: string; progress: number }) => (
          <div key={report.id} className="p-2.5 rounded-lg bg-gray-900/50 border border-gray-700/30">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-gray-300 text-sm font-medium">{report.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                report.status === "completed" ? "bg-green-500/20 text-green-400" :
                report.status === "in-progress" ? "bg-cyan-500/20 text-cyan-400" :
                "bg-gray-700/50 text-gray-400"
              }`}>
                {report.status === "completed" ? "已完成" : report.status === "in-progress" ? "进行中" : "待开始"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all"
                  style={{ width: `${report.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 font-mono">{report.progress}%</span>
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 选中建筑数据追溯 */}
      {selectedBuildingData ? (
        <IndicatorGroup title="数据追溯">
          <IndicatorCard
            title={selectedBuildingData.name}
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status === "danger" ? "danger" : selectedBuildingData.status === "warning" ? "warning" : "normal"}
          />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">数据来源</div>
              <div className="text-gray-300 text-xs font-mono mt-0.5">智能电表</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">采集频率</div>
              <div className="text-gray-300 text-xs font-mono mt-0.5">15 分钟/次</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">最后更新</div>
              <div className="text-gray-300 text-xs font-mono mt-0.5">2026-07-15 14:30</div>
            </div>
            <div className="p-2 rounded-lg bg-gray-900/40 border border-gray-700/30">
              <div className="text-gray-500 text-[10px]">核查状态</div>
              <div className="text-green-400 text-xs font-mono mt-0.5 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> 已核查
              </div>
            </div>
          </div>
        </IndicatorGroup>
      ) : (
        <IndicatorGroup title="提示">
          <div className="p-4 rounded-lg bg-gray-900/40 border border-gray-700/30 text-center">
            <Database className="w-8 h-8 mx-auto text-gray-600 mb-2" />
            <p className="text-gray-500 text-xs">点击场景中的建筑查看数据追溯</p>
          </div>
        </IndicatorGroup>
      )}

      {/* 审计轨迹 */}
      <IndicatorGroup title="审计轨迹">
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {auditTrail.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-start gap-2 p-2 rounded-lg bg-gray-900/30 border border-gray-700/20 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 truncate">{item.action}</span>
                  <span className="text-gray-500 text-[10px] flex-shrink-0 ml-2">{item.time.split(" ")[1]}</span>
                </div>
                <div className="text-gray-500 text-[10px] mt-0.5">{item.user} · {item.source}</div>
              </div>
            </div>
          ))}
        </div>
        {auditTrail.length > 8 && (
          <div className="text-center text-gray-500 text-[10px] mt-1">+{auditTrail.length - 8} 条记录</div>
        )}
      </IndicatorGroup>

      {/* 排放因子版本 */}
      <IndicatorGroup title="排放因子">
        <div className="space-y-1.5">
          {[
            { type: "电力", factor: "0.5368", version: "2026 v2", year: 2026 },
            { type: "天然气", factor: "2.1840", version: "2026 v1", year: 2026 },
            { type: "热力", factor: "0.1100", version: "2026 v1", year: 2026 },
          ].map((item) => (
            <div key={item.type} className="flex items-center justify-between p-2 rounded-lg bg-gray-900/40 border border-gray-700/20 text-xs">
              <span className="text-gray-400">{item.type}</span>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-mono">{item.factor}</span>
                <span className="text-gray-500 text-[10px]">kgCO₂/kWh</span>
              </div>
            </div>
          ))}
        </div>
      </IndicatorGroup>
    </div>
  );

  return (
    <ThreeColumnLayout
      level="L4"
      leftPanel={leftPanel}
      rightPanel={rightPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
    />
  );
}