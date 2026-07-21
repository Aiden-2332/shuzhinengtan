"use client";

import { useState, useMemo, useCallback } from "react";
import { ThreeColumnLayout } from "@/components/layout/three-column-layout";
import { IndicatorCard, IndicatorGroup } from "@/components/dashboard/indicator-card";
import { getBuilding3DData, getBuildingDetail, getQualityMetrics, getAuditTrail, getReportProgress } from "@/data/mock-data";
import { FileText, Shield, CheckCircle, Clock, Lock, AlertTriangle } from "lucide-react";

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

  // 左侧指标面板
  const leftPanel = (
    <div className="space-y-4">
      {/* 数据质量 */}
      <IndicatorGroup title="数据质量">
        <IndicatorCard
          title="综合质量评分"
          value={qualityMetrics.score}
          unit="分"
          status={qualityMetrics.score >= 90 ? "success" : qualityMetrics.score >= 80 ? "warning" : "danger"}
          icon={<Shield className="w-4 h-4" />}
        />
        <IndicatorCard
          title="数据完整度"
          value={qualityMetrics.completeness}
          unit="%"
          status={qualityMetrics.completeness >= 95 ? "success" : "warning"}
        />
        <IndicatorCard
          title="数据及时率"
          value={qualityMetrics.timeliness}
          unit="%"
          status={qualityMetrics.timeliness >= 85 ? "success" : "warning"}
          icon={<Clock className="w-4 h-4" />}
        />
        <IndicatorCard
          title="数据准确率"
          value={qualityMetrics.accuracy}
          unit="%"
          status={qualityMetrics.accuracy >= 90 ? "success" : "warning"}
        />
      </IndicatorGroup>

      {/* 数据锁定 */}
      <IndicatorGroup title="数据锁定">
        <IndicatorCard
          title="已锁定建筑"
          value={lockedData}
          unit={`/ ${building3DData.length} 栋`}
          status="success"
          icon={<Lock className="w-4 h-4" />}
        />
        <IndicatorCard
          title="待锁定"
          value={building3DData.length - lockedData}
          unit="栋"
          status={building3DData.length - lockedData > 0 ? "warning" : "success"}
        />
        <IndicatorCard
          title="锁定时间"
          value="2026-07-15"
          status="normal"
          icon={<Clock className="w-4 h-4" />}
        />
      </IndicatorGroup>

      {/* 报告进度 */}
      <IndicatorGroup title="报告进度">
        {reports.map((report: { id: string; name: string; status: string; progress: number }) => (
          <div key={report.id} className="p-2 rounded bg-gray-800/40 border border-gray-700/30">
            <div className="flex items-center justify-between mb-1">
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
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                  style={{ width: `${report.progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{report.progress}%</span>
            </div>
          </div>
        ))}
      </IndicatorGroup>

      {/* 审计轨迹 */}
      <IndicatorGroup title="审计轨迹">
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {auditTrail.map((item) => (
            <div key={item.id} className="flex items-center gap-2 p-1.5 rounded bg-gray-800/30 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 truncate">{item.action}</span>
                  <span className="text-gray-500 text-[10px]">{item.time.split(" ")[1]}</span>
                </div>
                <div className="text-gray-500 text-[10px]">{item.user} · {item.source}</div>
              </div>
            </div>
          ))}
        </div>
      </IndicatorGroup>

      {/* 选中建筑数据追溯 */}
      {selectedBuildingData && (
        <IndicatorGroup title="数据追溯">
          <IndicatorCard
            title={selectedBuildingData.name}
            value={selectedBuildingData.emission}
            unit="tCO₂"
            status={selectedBuildingData.status}
          />
          <div className="p-2 rounded bg-gray-800/40 border border-gray-700/30 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">数据来源</span>
              <span className="text-gray-300">智能电表 + 燃气表</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">采集频率</span>
              <span className="text-gray-300">15 分钟/次</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">最后更新</span>
              <span className="text-gray-300">2026-07-15 14:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">核查状态</span>
              <span className="text-green-400 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                已核查
              </span>
            </div>
          </div>
        </IndicatorGroup>
      )}

      {/* 合规状态 */}
      <IndicatorGroup title="合规状态">
        <IndicatorCard
          title="年度核查"
          value="进行中"
          status="warning"
          icon={<FileText className="w-4 h-4" />}
        />
        <IndicatorCard
          title="MRV 报告"
          value="已提交"
          status="success"
          icon={<CheckCircle className="w-4 h-4" />}
        />
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

  return (
    <ThreeColumnLayout
      level="L4"
      leftPanel={leftPanel}
      selectedBuilding={selectedBuilding}
      onBuildingClick={handleBuildingClick}
    />
  );
}
