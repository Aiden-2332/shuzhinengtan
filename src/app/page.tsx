import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "登录｜高校智慧碳管理平台",
  description: "高校智慧碳管理平台登录与演示入口",
};

export default function LoginPage() {
  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-[#06141d] text-white">
      <section
        aria-label="校园数字孪生预览"
        className="relative hidden min-h-screen w-[58%] overflow-hidden border-r border-white/10 lg:block"
      >
        <Image
          src="/campus-map/outer/2_5d-expanded.webp"
          alt="北京科技大学校园空间示意图"
          fill
          priority
          sizes="58vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#031018]/38" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,16,24,.18)_0%,rgba(3,16,24,.05)_52%,rgba(3,16,24,.82)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,16,24,.72)_0%,transparent_34%,rgba(3,16,24,.82)_100%)]" />

        <div className="absolute left-10 top-9 flex items-center gap-4 xl:left-14 xl:top-12">
          <Image
            src="/brand/timeloit-login-wordmark.png"
            alt="Timeloit 时代凌宇"
            width={3022}
            height={1345}
            sizes="128px"
            priority
            className="h-auto w-28 object-contain xl:w-32"
          />
          <span className="h-9 w-px bg-cyan-100/30" aria-hidden="true" />
          <div>
            <div className="text-base font-semibold tracking-[-0.02em]">高校智慧碳管理平台</div>
            <div className="mt-0.5 text-xs text-cyan-100/75">Smart Carbon Management Platform</div>
          </div>
        </div>

        <div className="absolute bottom-12 left-10 max-w-xl xl:bottom-16 xl:left-14">
          <h2 className="max-w-[13ch] text-balance text-[clamp(2.25rem,4vw,4.75rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-white">
            让校园空间成为碳治理的共同坐标
          </h2>
          <p className="mt-5 max-w-[50ch] text-sm leading-7 text-slate-200/90 xl:text-base">
            汇集建筑、能源、排放、设备与治理任务，为管理决策和日常运营提供统一入口。
          </p>
        </div>
      </section>

      <main className="relative flex min-h-screen flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:px-[clamp(3rem,5vw,6.5rem)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_12%,rgba(53,212,228,.1),transparent_30%)]" />

        <div className="relative w-full">
          <div className="mb-12 flex items-center gap-3 lg:hidden">
            <Image
              src="/brand/timeloit-login-wordmark.png"
              alt="Timeloit 时代凌宇"
              width={3022}
              height={1345}
              sizes="104px"
              priority
              className="h-auto w-24 object-contain sm:w-28"
            />
            <span className="h-8 w-px bg-cyan-100/25" aria-hidden="true" />
            <div>
              <div className="text-sm font-semibold">高校智慧碳管理平台</div>
              <div className="mt-0.5 text-[11px] text-cyan-100/70">Smart Carbon Management Platform</div>
            </div>
          </div>

          <LoginForm />

          <p className="mt-12 text-center text-xs text-slate-500 lg:text-left">
            Demo 模拟数据，不用于申报
          </p>
        </div>
      </main>
    </div>
  );
}
