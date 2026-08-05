"use client";

import { useState } from "react";
import Link from "next/link";
import { LockKeyhole, UserRound } from "lucide-react";

const DEMO_LINKS = [
  { href: "/leader", label: "领导舱演示" },
  { href: "/operations", label: "后勤舱演示" },
  { href: "/portal", label: "PC端演示" },
] as const;

export function LoginForm() {
  const [notice, setNotice] = useState("");

  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-9">
        <h1 className="text-balance text-[clamp(2rem,3vw,2.75rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white">
          登录智慧碳管理平台
        </h1>
        <p className="mt-4 max-w-[38ch] text-sm leading-6 text-slate-300">
          请输入账号和密码，或使用演示入口直接体验系统。
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          setNotice("账号登录功能暂未接入，请使用下方演示入口。 ");
        }}
      >
        <div>
          <label htmlFor="account" className="mb-2 block text-sm font-medium text-slate-100">
            账户
          </label>
          <div className="relative">
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
            />
            <input
              id="account"
              name="account"
              type="text"
              autoComplete="username"
              placeholder="请输入账户"
              className="h-12 w-full rounded-xl border border-slate-600/80 bg-slate-900/55 pl-11 pr-4 text-[15px] text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-slate-500 hover:border-slate-500 focus:border-cyan-400 focus:bg-slate-900/80 focus:shadow-[0_0_0_3px_rgba(53,212,228,.14)]"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-100">
            密码
          </label>
          <div className="relative">
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
            />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="请输入密码"
              className="h-12 w-full rounded-xl border border-slate-600/80 bg-slate-900/55 pl-11 pr-4 text-[15px] text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-slate-500 hover:border-slate-500 focus:border-cyan-400 focus:bg-slate-900/80 focus:shadow-[0_0_0_3px_rgba(53,212,228,.14)]"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-1 flex h-12 w-full items-center justify-center rounded-xl bg-cyan-400 px-5 text-[15px] font-semibold text-cyan-950 shadow-[0_10px_28px_rgba(34,211,238,.2)] transition-[background-color,box-shadow,transform] hover:bg-cyan-300 hover:shadow-[0_14px_34px_rgba(34,211,238,.28)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06141d]"
        >
          登录系统
        </button>

        <p aria-live="polite" className="min-h-5 text-center text-xs leading-5 text-slate-400">
          {notice}
        </p>
      </form>

      <div className="mt-5 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-700" />
        <span className="text-xs text-slate-500">演示入口</span>
        <span className="h-px flex-1 bg-slate-700" />
      </div>

      <nav aria-label="系统演示入口" className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {DEMO_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-[13px] font-medium text-sky-300 underline decoration-sky-400/55 underline-offset-4 transition-colors hover:text-sky-200 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
