"use client";

import { useEffect, useState } from "react";
import { getLogsByMaterial } from "@/lib/compliance-db";
import type { OperationLog } from "@/types/compliance";

const ACTION_LABELS: Record<string, string> = {
  created: "文件创建",
  uploaded: "文件上传",
  replaced: "文件替换",
  submitted_review: "提交审核",
  approved: "审核通过",
  rejected: "审核退回",
  downloaded: "文件下载",
  exported: "文件导出",
  validity_changed: "有效期修改",
  deleted: "材料删除",
  version_restored: "版本恢复",
};

export function AuditTimeline({ materialId }: { materialId: string }) {
  const [logs, setLogs] = useState<OperationLog[]>([]);

  useEffect(() => {
    getLogsByMaterial(materialId).then(setLogs);
  }, [materialId]);

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-white/30 text-sm">暂无操作记录</div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* 时间轴线 */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/10" />

      <div className="space-y-4">
        {logs.map((log, idx) => (
          <div key={log.id} className="relative">
            {/* 圆点 */}
            <div
              className={`absolute -left-[23px] top-1.5 w-3 h-3 rounded-full border-2 ${
                idx === 0
                  ? "bg-blue-500 border-blue-500/30"
                  : "bg-slate-700 border-white/10"
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/80 font-medium">
                  {ACTION_LABELS[log.action] || log.action}
                </span>
                {log.version && (
                  <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">
                    V{log.version}.0
                  </span>
                )}
              </div>
              <div className="text-xs text-white/40 mt-0.5">{log.description}</div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-white/30">
                <span>{log.operator}</span>
                <span>{new Date(log.operatedAt).toLocaleString("zh-CN")}</span>
                {log.ip && <span>{log.ip}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
