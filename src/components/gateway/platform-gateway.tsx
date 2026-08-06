"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Boxes,
  ChevronRight,
  Headphones,
  Leaf,
  Network,
  RadioTower,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import "./platform-gateway.css";

type GatewayItem = {
  name: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  status?: string;
  external?: boolean;
  featured?: boolean;
  tone: "electric" | "network" | "leader" | "operations" | "carbon" | "service";
};

const gatewayItems: GatewayItem[] = [
  {
    name: "凌电中心",
    subtitle: "ELECTRIC CENTER",
    href: "http://192.168.111.90:8083/#/auxiliaryTransactions/marketAnalysis/marketMenu",
    icon: Zap,
    status: "已接入",
    external: true,
    tone: "electric",
  },
  {
    name: "凌网中心",
    subtitle: "NETWORK CENTER",
    href: "http://192.168.111.90:8089/#/home/index",
    icon: Network,
    status: "已接入",
    external: true,
    tone: "network",
  },
  {
    name: "领导驾驶舱",
    subtitle: "LEADERSHIP COCKPIT",
    href: "/leader",
    icon: Headphones,
    featured: true,
    tone: "leader",
  },
  {
    name: "后勤驾驶舱",
    subtitle: "LOGISTICS COCKPIT",
    href: "/operations",
    icon: Boxes,
    tone: "operations",
  },
  {
    name: "智慧碳行中心",
    subtitle: "SMART CARBON CENTER",
    href: "/portal",
    icon: Leaf,
    tone: "carbon",
  },
  {
    name: "凌源运维中心",
    subtitle: "OPERATION CENTER",
    href: "http://192.168.111.90:8086/#/home/index",
    icon: Wrench,
    status: "已接入",
    external: true,
    tone: "service",
  },
];

function GatewayArchitecture() {
  return (
    <div className="gateway-architecture" aria-hidden="true">
      <svg className="gateway-campus-line" viewBox="0 0 1600 520" preserveAspectRatio="none" focusable="false">
        <path className="gateway-drawing-quiet" d="M0 406H1600M0 442H1600" />
        <path d="M86 406V323H171V406M109 323V286H148V323M202 406V252H358V406M233 252V218H327V252M387 406V301H465V406M495 406V238H655V406M526 238V190H624V238M684 406V276H766V406M795 406V218H961V406M830 218V172H926V218M990 406V292H1076V406M1107 406V244H1268V406M1140 244V204H1234V244M1298 406V310H1378V406M1407 406V266H1520V406M1438 266V229H1490V266" />
        <path className="gateway-drawing-quiet" d="M229 282H331M524 275H628M826 258H931M1137 280H1238M1435 302H1493" />
        <path className="gateway-conduit" d="M0 122H122V164H307V126H505M1095 126H1284V164H1478V122H1600" />
        <path className="gateway-conduit gateway-conduit-warm" d="M0 180H76V214H244M1358 214H1524V180H1600" />
        <circle cx="307" cy="126" r="5" /><circle cx="1284" cy="164" r="5" />
      </svg>
      <span className="gateway-wall-seam gateway-wall-seam-one" />
      <span className="gateway-wall-seam gateway-wall-seam-two" />
      <span className="gateway-wall-seam gateway-wall-seam-three" />
    </div>
  );
}

export function PlatformGateway() {
  const gatewayRowRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const row = gatewayRowRef.current;
    if (!row) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches) return;

    const copyCount = gatewayItems.length;
    const autoScrollSpeed = 28;
    let frame = 0;
    let lastTime = performance.now();
    let setDistance = 0;
    let scrollAccumulator = row.scrollLeft;
    let lastRenderedScroll = row.scrollLeft;
    let paused = false;
    let resumeTimer: number | undefined;

    const getSetDistance = () => {
      const first = row.children.item(0) as HTMLElement | null;
      const secondCopy = row.children.item(copyCount) as HTMLElement | null;
      if (!first || !secondCopy) return 0;
      return secondCopy.offsetLeft - first.offsetLeft;
    };

    const updateSetDistance = () => {
      setDistance = getSetDistance();
    };

    const normalizeScrollPosition = () => {
      const distance = setDistance;
      if (!distance) return;

      if (scrollAccumulator >= distance) {
        scrollAccumulator -= distance;
        row.scrollLeft = scrollAccumulator;
        lastRenderedScroll = row.scrollLeft;
      } else if (scrollAccumulator < 0) {
        scrollAccumulator += distance;
        row.scrollLeft = scrollAccumulator;
        lastRenderedScroll = row.scrollLeft;
      }
    };

    const syncScrollAccumulator = () => {
      if (Math.abs(row.scrollLeft - lastRenderedScroll) > 2) {
        scrollAccumulator = row.scrollLeft;
        lastRenderedScroll = row.scrollLeft;
      }
      normalizeScrollPosition();
    };

    const pauseOnInteraction = () => {
      paused = true;
      if (resumeTimer !== undefined) window.clearTimeout(resumeTimer);
    };

    const resumeAfterInteraction = () => {
      if (resumeTimer !== undefined) window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
      }, 2200);
    };

    updateSetDistance();

    const tick = (time: number) => {
      const delta = Math.min(64, Math.max(0, time - lastTime));
      lastTime = time;

      if (!paused && row.scrollWidth > row.clientWidth + 4) {
        const actualScroll = row.scrollLeft;
        if (Math.abs(actualScroll - lastRenderedScroll) > 2) {
          scrollAccumulator = actualScroll;
        }

        scrollAccumulator += (delta / 1000) * autoScrollSpeed;
        row.scrollLeft = scrollAccumulator;
        lastRenderedScroll = row.scrollLeft;
        normalizeScrollPosition();
      }

      frame = window.requestAnimationFrame(tick);
    };

    row.addEventListener("pointerdown", pauseOnInteraction);
    row.addEventListener("pointerup", resumeAfterInteraction);
    row.addEventListener("pointercancel", resumeAfterInteraction);
    row.addEventListener("focusin", pauseOnInteraction);
    row.addEventListener("focusout", resumeAfterInteraction);
    row.addEventListener("touchstart", pauseOnInteraction, { passive: true });
    row.addEventListener("touchend", resumeAfterInteraction, { passive: true });
    row.addEventListener("wheel", pauseOnInteraction, { passive: true });
    row.addEventListener("wheel", resumeAfterInteraction, { passive: true });
    row.addEventListener("scroll", syncScrollAccumulator, { passive: true });
    window.addEventListener("resize", updateSetDistance, { passive: true });
    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      if (resumeTimer !== undefined) window.clearTimeout(resumeTimer);
      row.removeEventListener("pointerdown", pauseOnInteraction);
      row.removeEventListener("pointerup", resumeAfterInteraction);
      row.removeEventListener("pointercancel", resumeAfterInteraction);
      row.removeEventListener("focusin", pauseOnInteraction);
      row.removeEventListener("focusout", resumeAfterInteraction);
      row.removeEventListener("touchstart", pauseOnInteraction);
      row.removeEventListener("touchend", resumeAfterInteraction);
      row.removeEventListener("wheel", pauseOnInteraction);
      row.removeEventListener("wheel", resumeAfterInteraction);
      row.removeEventListener("scroll", syncScrollAccumulator);
      window.removeEventListener("resize", updateSetDistance);
    };
  }, []);

  const renderGatewayDoor = (item: GatewayItem, index: number, copy: number) => {
    const Icon = item.icon;
    const number = String(index + 1).padStart(2, "0");
    const isClone = copy > 0;

    return (
      <Link
        key={`${item.name}-${copy}`}
        href={item.href}
        target={item.external ? "_blank" : undefined}
        rel={item.external ? "noopener noreferrer" : undefined}
        prefetch={item.external ? false : undefined}
        tabIndex={isClone ? -1 : undefined}
        aria-hidden={isClone ? true : undefined}
        data-gateway-copy={copy}
        className={`gateway-door gateway-door-${item.tone}${item.featured ? " is-featured" : ""}`}
        aria-label={isClone ? undefined : `进入${item.name}${item.external ? "，在新窗口打开" : ""}`}
      >
        <span className="gateway-door-canopy">
          <span className="gateway-door-number">{number}</span>
          <span className="gateway-door-sign">
            <strong>{item.name}</strong>
            <small>{item.subtitle}</small>
          </span>
          {item.external ? <ArrowUpRight className="gateway-external-icon" aria-hidden="true" /> : null}
        </span>

        <span className="gateway-door-frame" aria-hidden="true">
          <span className="gateway-transom">
            <span>{item.status ?? "校内入口"}</span>
          </span>
          <span className="gateway-door-light" />
            <span className="gateway-door-seal" aria-hidden="true">
              <span className="gateway-door-seal-ring">
                <Icon />
              </span>
              <span className="gateway-door-seal-mark" />
              <span className="gateway-door-seal-node gateway-door-seal-node-top" />
              <span className="gateway-door-seal-node gateway-door-seal-node-right" />
              <span className="gateway-door-seal-node gateway-door-seal-node-bottom" />
              <span className="gateway-door-seal-node gateway-door-seal-node-left" />
            </span>
          <span className="gateway-door-leaf gateway-door-leaf-left">
            <span className="gateway-door-window" />
            <span className="gateway-door-lower-panel" />
          </span>
          <span className="gateway-door-leaf gateway-door-leaf-right">
            <span className="gateway-door-window" />
            <span className="gateway-door-lower-panel" />
          </span>
          <span className="gateway-door-handle gateway-door-handle-left" />
          <span className="gateway-door-handle gateway-door-handle-right" />
          <span className="gateway-door-entry">
            <span>进入</span>
            <ChevronRight />
          </span>
        </span>

        <span className="gateway-door-threshold" aria-hidden="true" />
        <span className="gateway-door-shadow" aria-hidden="true" />
      </Link>
    );
  };

  return (
    <main className="gateway-shell">
      {/*
        THESIS: A university service hall of real doors, refusing the floating sci-fi card carousel.
        OWN-WORLD: Deep navy architecture, cyan wayfinding, smoked glass and restrained brass hardware.
        STORY: See all six centers, recognize each entrance immediately, and enter with one click.
        FIRST VIEWPORT: Compact brand header above a low-set row of six tall doors grounded on a guided floor.
        FORM: Architectural service-hall section, selected from the operate surface roll (seed 6d9fa00e).
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}
      <div className="gateway-backdrop" aria-hidden="true" />
      <GatewayArchitecture />

      <header className="gateway-header">
        <div className="gateway-meta gateway-meta-left">
          <RadioTower aria-hidden="true" />
          <span>北京市 · 海淀区</span>
          <i />
          <span>系统运行正常</span>
        </div>

        <div className="gateway-title-frame">
          <Image
            className="gateway-brand-logo"
            src="/brand/timeloit-gateway-wordmark.png"
            alt="时代凌宇 Timeloit"
            width={3090}
            height={484}
            sizes="(max-width: 760px) 108px, 172px"
            priority
          />
          <span className="gateway-title-divider" aria-hidden="true" />
          <div className="gateway-title-copy">
            <h1>高校智慧碳管理平台</h1>
            <p>SMART CAMPUS CARBON MANAGEMENT PLATFORM</p>
          </div>
        </div>

        <div className="gateway-meta gateway-meta-right">
          <span>统一门户</span>
          <span className="gateway-online-dot" />
          <span>服务在线</span>
        </div>
      </header>

      <section className="gateway-stage" aria-labelledby="gateway-heading">
        <div className="gateway-stage-heading">
          <span aria-hidden="true" />
          <h2 id="gateway-heading">选择要进入的业务中心</h2>
          <span aria-hidden="true" />
        </div>

        <div className="gateway-hall">
          <div className="gateway-floor" aria-hidden="true">
            <span className="gateway-floor-route gateway-floor-route-left" />
            <span className="gateway-floor-route gateway-floor-route-center" />
            <span className="gateway-floor-route gateway-floor-route-right" />
          </div>

          <nav ref={gatewayRowRef} className="gateway-door-row" aria-label="业务中心入口">
            {gatewayItems.map((item, index) => renderGatewayDoor(item, index, 0))}
            {gatewayItems.map((item, index) => renderGatewayDoor(item, index, 1))}
          </nav>
        </div>
      </section>

      <footer className="gateway-footer">
        <span>统一身份认证</span><i />
        <span>六大中心协同</span><i />
        <span>低碳校园数字底座</span>
        <small>Demo 模拟数据，不用于申报</small>
      </footer>
    </main>
  );
}
