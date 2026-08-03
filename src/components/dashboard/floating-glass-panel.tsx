"use client";

import { useEffect, useState, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, Grip } from "lucide-react";

export type PanelPriority = "critical" | "standard" | "secondary";

export interface FloatingPanelSpec {
  id: string;
  label: string;
  content: ReactNode;
  priority?: PanelPriority;
  defaultCollapsed?: boolean;
  className?: string;
}

export function FloatingGlassPanel({
  id,
  label,
  content,
  priority = "standard",
  defaultCollapsed = false,
  className = "",
}: FloatingPanelSpec) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (priority !== "secondary") return;
    const compactAspect = window.matchMedia("(max-aspect-ratio: 4/3)");
    const collapseForCompactAspect = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setCollapsed(true);
    };
    collapseForCompactAspect(compactAspect);
    compactAspect.addEventListener("change", collapseForCompactAspect);
    return () => compactAspect.removeEventListener("change", collapseForCompactAspect);
  }, [priority]);

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--glass-pointer-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--glass-pointer-y", `${event.clientY - rect.top}px`);
  };

  return (
    <motion.section
      layout={!reduceMotion}
      id={`panel-${id}`}
      data-panel-priority={priority}
      data-collapsed={collapsed ? "true" : "false"}
      className={`floating-glass-panel cockpit-glass ${className}`}
      onPointerMove={handlePointerMove}
      transition={{ layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="floating-glass-panel__refraction" aria-hidden="true" />
      <div className="floating-glass-panel__shine" aria-hidden="true" />
      <button
        type="button"
        className="floating-glass-panel__toggle"
        onClick={() => setCollapsed((current) => !current)}
        aria-expanded={!collapsed}
        aria-controls={`panel-content-${id}`}
        title={collapsed ? `展开${label}` : `收起${label}`}
      >
        <Grip className="floating-glass-panel__grip" aria-hidden="true" />
        <span className="floating-glass-panel__collapsed-label">{label}</span>
        <ChevronDown className="floating-glass-panel__chevron" aria-hidden="true" />
      </button>

      <AnimatePresence initial={false}>
        {collapsed ? null : (
          <motion.div
            id={`panel-content-${id}`}
            key="content"
            initial={reduceMotion ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="floating-glass-panel__content"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
