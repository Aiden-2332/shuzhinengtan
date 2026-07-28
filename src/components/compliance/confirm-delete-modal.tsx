"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  warning?: string;
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, title, description, warning }: ConfirmDeleteModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-[420px] shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/50 mt-1">{description}</p>
          </div>
        </div>
        {warning && (
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2 mb-4">
            <p className="text-xs text-red-400">{warning}</p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-colors"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  );
}
