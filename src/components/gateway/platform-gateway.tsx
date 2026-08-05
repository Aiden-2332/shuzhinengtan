"use client";

import Link from "next/link";
import {
  Boxes,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Leaf,
  Network,
  RadioTower,
  Wrench,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import "./platform-gateway.css";

type GatewayItem = {
  name: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
  status?: string;
  external?: boolean;
};

const gatewayItems: GatewayItem[] = [
  {
    name: "凌电中心",
    subtitle: "ELECTRIC CENTER",
    href: "http://192.168.111.90:8083/#/auxiliaryTransactions/marketAnalysis/marketMenu",
    icon: Zap,
    status: "已接入",
    external: true,
  },
  {
    name: "凌网中心",
    subtitle: "NETWORK CENTER",
    href: "http://192.168.111.90:8089/#/home/index",
    icon: Network,
    status: "已接入",
    external: true,
  },
  { name: "领导驾驶舱", subtitle: "LEADERSHIP COCKPIT", href: "/", icon: Headphones },
  { name: "后勤驾驶舱", subtitle: "LOGISTICS COCKPIT", href: "/operations", icon: Boxes },
  { name: "智慧碳行中心", subtitle: "SMART CARBON CENTER", href: "/portal", icon: Leaf },
  {
    name: "凌源运维中心",
    subtitle: "OPERATION CENTER",
    href: "http://192.168.111.90:8086/#/home/index",
    icon: Wrench,
    status: "已接入",
    external: true,
  },
];

export function PlatformGateway() {
  const [activeIndex, setActiveIndex] = useState(2);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  const selectCard = useCallback((index: number) => {
    const nextIndex = Math.max(0, Math.min(gatewayItems.length - 1, index));
    setActiveIndex(nextIndex);
    cardRefs.current[nextIndex]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => selectCard(2), 120);
    return () => window.clearTimeout(timer);
  }, [selectCard]);

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    event.currentTarget.scrollLeft += event.deltaY;
  };

  return (
    <main
      className="gateway-shell"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") selectCard(activeIndex - 1);
        if (event.key === "ArrowRight") selectCard(activeIndex + 1);
      }}
    >
      <div className="gateway-backdrop" aria-hidden="true" />
      <div className="gateway-cabin" aria-hidden="true">
        <span className="gateway-wall gateway-wall-left" />
        <span className="gateway-wall gateway-wall-right" />
        <span className="gateway-rib gateway-rib-left" />
        <span className="gateway-rib gateway-rib-right" />
        <span className="gateway-center-beam" />
      </div>
      <header className="gateway-header">
        <div className="gateway-meta gateway-meta-left">
          <RadioTower size={14} />
          <span>北京市 · 海淀区</span>
          <i />
          <span>系统运行正常</span>
        </div>
        <div className="gateway-title-frame">
          <span className="gateway-title-wing gateway-title-wing-left" />
          <div>
            <h1>高校智慧碳管理平台</h1>
            <p>SMART CAMPUS CARBON MANAGEMENT PLATFORM</p>
          </div>
          <span className="gateway-title-wing gateway-title-wing-right" />
        </div>
        <div className="gateway-meta gateway-meta-right">
          <span>统一门户</span>
          <span className="gateway-online-dot" />
          <span>服务在线</span>
        </div>
      </header>

      <section className="gateway-stage" aria-label="平台中心导航">
        <div className="gateway-stage-halo" aria-hidden="true" />
        <div className="gateway-guide" aria-hidden="true"><ChevronRight /></div>
        <p className="gateway-eyebrow">PLATFORM MATRIX · 平台矩阵</p>
        <h2>选择要进入的业务中心</h2>
        <div className="gateway-stage-platform" aria-hidden="true">
          <span className="gateway-platform-surface" />
          <span className="gateway-platform-core" />
          <span className="gateway-platform-front" />
        </div>

        <button
          type="button"
          className="gateway-arrow gateway-arrow-left"
          onClick={() => selectCard(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label="上一个中心"
        >
          <ChevronLeft />
        </button>

        <div className="gateway-viewport">
          <div ref={trackRef} className="gateway-track" onWheel={handleWheel}>
            {gatewayItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  ref={(node) => { cardRefs.current[index] = node; }}
                  key={item.name}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  prefetch={item.external ? false : undefined}
                  className={`gateway-card${index === activeIndex ? " is-active" : ""}`}
                  onFocus={() => selectCard(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <span className="gateway-card-corners" aria-hidden="true" />
                  {item.status && <span className="gateway-card-status">{item.status}</span>}
                  <span className="gateway-icon-orbit" aria-hidden="true">
                    <span className="gateway-icon-core"><Icon /></span>
                  </span>
                  <span className="gateway-card-name">{item.name}</span>
                  <span className="gateway-card-subtitle">{item.subtitle}</span>
                  <span className="gateway-enter">点击进入 <ChevronRight /></span>
                </Link>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="gateway-arrow gateway-arrow-right"
          onClick={() => selectCard(activeIndex + 1)}
          disabled={activeIndex === gatewayItems.length - 1}
          aria-label="下一个中心"
        >
          <ChevronRight />
        </button>

        <div className="gateway-dots" aria-label="当前中心">
          {gatewayItems.map((item, index) => (
            <button
              type="button"
              key={item.name}
              className={index === activeIndex ? "is-active" : ""}
              onClick={() => selectCard(index)}
              aria-label={`查看${item.name}`}
            />
          ))}
        </div>
      </section>

      <footer className="gateway-footer">
        <span>统一身份认证</span><i />
        <span>六大中心协同</span><i />
        <span>低碳校园数字底座</span>
        <small>Demo 模拟数据，仅用于演示</small>
      </footer>
    </main>
  );
}
