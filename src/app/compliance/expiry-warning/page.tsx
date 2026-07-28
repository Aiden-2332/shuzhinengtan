"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Clock, Calendar, Bell, BellOff, Eye, Download,
  Upload, CheckCircle, X, Filter, Search
} from "lucide-react";
import { getAllMaterials, formatFileSize } from "@/lib/compliance-db";
import { MaterialStatusTag } from "@/components/compliance/material-status-tag";
import { FilePreviewDrawer } from "@/components/compliance/file-preview-drawer";
import { MaterialUploadDrawer } from "@/components/compliance/material-upload-drawer";
import type { MaterialRecord } from "@/types/compliance";

type AlertRange = "30" | "60" | "90" | "all";

export default function ExpiryWarningPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertRange, setAlertRange] = useState<AlertRange>("30");
  const [search, setSearch] = useState("");
  const [previewMaterial, setPreviewMaterial] = useState<MaterialRecord | null>(null);
  const [replaceMaterial, setReplaceMaterial] = useState<MaterialRecord | null>(null);

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllMaterials();
      setMaterials(all);
    } catch (e) {
      console.error("Failed to load materials:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMaterials(); }, [loadMaterials]);

  const now = new Date();
  const getDaysUntilExpiry = (m: MaterialRecord): number | null => {
    if (!m.validTo || m.isPermanent) return null;
    const expiry = new Date(m.validTo);
    return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getExpiryCategory = (days: number | null): { label: string; color: string; bg: string } => {
    if (days === null) return { label: "长期有效", color: "text-emerald-400", bg: "bg-emerald-500/10" };
    if (days < 0) return { label: "已过期", color: "text-red-400", bg: "bg-red-500/10" };
    if (days <= 30) return { label: "30天内到期", color: "text-red-400", bg: "bg-red-500/10" };
    if (days <= 60) return { label: "60天内到期", color: "text-amber-400", bg: "bg-amber-500/10" };
    if (days <= 90) return { label: "90天内到期", color: "text-yellow-400", bg: "bg-yellow-500/10" };
    return { label: "正常", color: "text-slate-400", bg: "bg-slate-500/10" };
  };

  const filtered = materials.filter(m => {
    const days = getDaysUntilExpiry(m);
    if (days === null) return alertRange === "all";
    if (alertRange === "30") return days <= 30;
    if (alertRange === "60") return days <= 60;
    if (alertRange === "90") return days <= 90;
    return true;
  }).filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.name.toLowerCase().includes(s) || (m.fileName && m.fileName.toLowerCase().includes(s));
  }).sort((a, b) => {
    const da = getDaysUntilExpiry(a) ?? 9999;
    const db = getDaysUntilExpiry(b) ?? 9999;
    return da - db;
  });

  const stats = {
    expired: materials.filter(m => { const d = getDaysUntilExpiry(m); return d !== null && d < 0; }).length,
    within30: materials.filter(m => { const d = getDaysUntilExpiry(m); return d !== null && d >= 0 && d <= 30; }).length,
    within60: materials.filter(m => { const d = getDaysUntilExpiry(m); return d !== null && d > 30 && d <= 60; }).length,
    within90: materials.filter(m => { const d = getDaysUntilExpiry(m); return d !== null && d > 60 && d <= 90; }).length,
    permanent: materials.filter(m => m.isPermanent || !m.validTo).length,
  };

  const handleDownload = (m: MaterialRecord) => {
    if (!m.fileData) return;
    const blob = new Blob([m.fileData]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = m.fileName || `material-${m.id}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReplace = (m: MaterialRecord) => { setReplaceMaterial(m); };
  const handleViewVersions = (m: MaterialRecord) => { router.push(`/compliance/materials/${m.id}`); };
  const handleSubmitReview = (m: MaterialRecord) => { router.push(`/compliance/materials/${m.id}`); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => router.push("/compliance")} className="text-sm text-slate-400 hover:text-slate-200 mb-1 flex items-center gap-1">
              ← 返回合规凭证看板
            </button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400" /> 材料到期预警
            </h1>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            { label: "已过期", value: stats.expired, color: "text-red-400", icon: AlertTriangle },
            { label: "30天内到期", value: stats.within30, color: "text-red-400", icon: Clock },
            { label: "60天内到期", value: stats.within60, color: "text-amber-400", icon: Clock },
            { label: "90天内到期", value: stats.within90, color: "text-yellow-400", icon: Clock },
            { label: "长期有效", value: stats.permanent, color: "text-emerald-400", icon: CheckCircle },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Alert Range Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {[
            { value: "30" as AlertRange, label: "30天内到期" },
            { value: "60" as AlertRange, label: "60天内到期" },
            { value: "90" as AlertRange, label: "90天内到期" },
            { value: "all" as AlertRange, label: "全部" },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setAlertRange(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${alertRange === tab.value ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="搜索材料名称..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
        </div>

        {/* Warning List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">加载中...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <p className="text-slate-400">暂无到期预警材料</p>
              <p className="text-sm text-slate-500 mt-1">所有材料均在有效期内</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filtered.map(m => {
                const days = getDaysUntilExpiry(m);
                const cat = getExpiryCategory(days);
                return (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-800/30 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${cat.bg}`}>
                      <div className={`w-2 h-2 rounded-full ${cat.color.replace("text-", "bg-")}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200">{m.name}</span>
                        <MaterialStatusTag status={m.status} />
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{m.fileName || "未上传"}</span>
                        {m.validTo && <span>有效期至 {new Date(m.validTo).toLocaleDateString("zh-CN")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${cat.color}`}>
                        {days !== null ? (days < 0 ? `已过期 ${Math.abs(days)} 天` : `剩余 ${days} 天`) : cat.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {m.fileData && (
                        <>
                          <button onClick={() => setPreviewMaterial(m)} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded transition-colors" title="预览">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDownload(m)} className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded transition-colors" title="下载">
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setReplaceMaterial(m)} className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded transition-colors" title="更新材料">
                        <Upload className="w-4 h-4" />
                      </button>
                      <button onClick={() => router.push(`/compliance/materials/${m.id}`)} className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors">
                        查看详情
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {previewMaterial && (
        <FilePreviewDrawer
          open={true}
          onClose={() => setPreviewMaterial(null)}
          material={previewMaterial}
          onDownload={handleDownload}
          onReplace={handleReplace}
          onDelete={() => {}}
          onViewVersions={handleViewVersions}
          onSubmitReview={handleSubmitReview}
        />
      )}
      {replaceMaterial && (
        <MaterialUploadDrawer
          open={true}
          onClose={() => setReplaceMaterial(null)}
          material={replaceMaterial}
          onUploadComplete={() => { setReplaceMaterial(null); loadMaterials(); }}
        />
      )}
    </div>
  );
}
