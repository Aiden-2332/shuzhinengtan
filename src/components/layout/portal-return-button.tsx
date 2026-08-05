"use client";

import Link from "next/link";
import { LayoutGrid, MoveLeft } from "lucide-react";

export function PortalReturnButton({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/gateway"
      className={`portal-return-button${compact ? " portal-return-button--compact" : ""}`}
      aria-label="返回统一门户"
      title="返回统一门户"
    >
      <MoveLeft className="portal-return-arrow" aria-hidden="true" />
      <LayoutGrid className="portal-return-grid" aria-hidden="true" />
      <span>返回门户</span>
    </Link>
  );
}
