"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface AutoScrollListProps<T> {
  items: readonly T[];
  itemKey: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  className?: string;
  gap?: number;
  pixelsPerSecond?: number;
  live?: boolean;
  ariaLabel?: string;
}

export function AutoScrollList<T>({
  items,
  itemKey,
  renderItem,
  className = "",
  gap = 6,
  pixelsPerSecond = 15,
  live = false,
  ariaLabel,
}: AutoScrollListProps<T>) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const previousKeysRef = useRef<Set<string>>(new Set());
  const [distance, setDistance] = useState(0);
  const [canLoop, setCanLoop] = useState(false);
  const [paused, setPaused] = useState(false);
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const viewport = viewportRef.current;
    const group = groupRef.current;
    if (!viewport || !group) return;

    const measure = () => {
      const nextDistance = Math.ceil(group.getBoundingClientRect().height);
      setDistance(nextDistance);
      setCanLoop(nextDistance > viewport.clientHeight + 1 && items.length > 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(group);
    return () => observer.disconnect();
  }, [items.length]);

  useEffect(() => {
    if (!live) return;
    const nextKeys = new Set(items.map(itemKey));
    const isInitialSnapshot = previousKeysRef.current.size === 0;
    const inserted = isInitialSnapshot
      ? []
      : [...nextKeys].filter((key) => !previousKeysRef.current.has(key));
    previousKeysRef.current = nextKeys;
    if (inserted.length === 0) return;

    setHighlighted(new Set(inserted));
    const timer = window.setTimeout(() => setHighlighted(new Set()), 2_000);
    return () => window.clearTimeout(timer);
  }, [itemKey, items, live]);

  const scrollDistance = distance + gap;
  const duration = Math.max(12, scrollDistance / Math.max(8, pixelsPerSecond));
  const animated = canLoop && !reduceMotion;
  const style = {
    "--auto-scroll-distance": `${scrollDistance}px`,
    "--auto-scroll-duration": `${duration}s`,
    "--auto-scroll-gap": `${gap}px`,
  } as CSSProperties;

  const firstGroup = (
    <div ref={groupRef} className="auto-scroll-list__group">
      <AnimatePresence initial={false}>
        {items.map((item, index) => {
          const key = itemKey(item, index);
          return (
            <motion.div
              layout={live ? "position" : false}
              key={key}
              initial={live ? { opacity: 0, y: -12 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={live ? { opacity: 0, y: 8 } : undefined}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={highlighted.has(key) ? "auto-scroll-list__new" : ""}
            >
              {renderItem(item, index)}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <div
      ref={viewportRef}
      className={`auto-scroll-list ${className}`}
      style={style}
      data-looping={animated ? "true" : "false"}
      data-paused={paused ? "true" : "false"}
      onClick={() => setPaused((current) => !current)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setPaused((current) => !current);
        }
      }}
      tabIndex={0}
      role="region"
      aria-label={ariaLabel}
      title={paused ? "点击继续滚动" : "悬停或点击暂停滚动"}
    >
      <div className="auto-scroll-list__track">
        {firstGroup}
        {animated ? (
          <div className="auto-scroll-list__group" aria-hidden="true">
            {items.map((item, index) => (
              <div key={`duplicate-${itemKey(item, index)}`}>
                {renderItem(item, index)}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
