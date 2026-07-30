"use client";

import { getStatusLabel, getStatusColor } from "@/lib/compliance-db";
import type { MaterialStatus } from "@/types/compliance";

export function MaterialStatusTag({ status }: { status: MaterialStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${getStatusColor(status)}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}
