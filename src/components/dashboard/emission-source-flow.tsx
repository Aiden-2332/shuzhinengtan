"use client";

import { useMemo } from "react";
import styles from "./emission-source-flow.module.css";

export interface EmissionSourceFlowDatum {
  name: string;
  value: number;
  color: string;
}

interface PreparedDatum extends EmissionSourceFlowDatum {
  id: string;
  share: number;
  targetY: number;
  railX: number;
  railWidth: number;
}

const WIDTH = 330;
const HEIGHT = 190;
const SOURCE_X = 84;
const SOURCE_Y = 106;
const TARGET_X = 202;
const RAIL_X = 18;
const RAIL_WIDTH = 294;
const MAX_VISIBLE_SOURCES = 5;

function formatValue(value: number) {
  return Math.round(value).toLocaleString("zh-CN");
}

function prepareData(data: EmissionSourceFlowDatum[]): PreparedDatum[] {
  const safe = data
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .toSorted((first, second) => second.value - first.value);

  if (!safe.length) return [];

  const visible = safe.length <= MAX_VISIBLE_SOURCES
    ? safe
    : [
        ...safe.slice(0, MAX_VISIBLE_SOURCES - 1),
        {
          name: "其他来源",
          value: safe.slice(MAX_VISIBLE_SOURCES - 1).reduce((sum, item) => sum + item.value, 0),
          color: "#6B7280",
        },
      ];
  const total = visible.reduce((sum, item) => sum + item.value, 0);
  const top = 18;
  const bottom = 138;
  const step = visible.length > 1 ? (bottom - top) / (visible.length - 1) : 0;
  let railOffset = 0;

  return visible.map((item, index) => {
    const share = total > 0 ? item.value / total * 100 : 0;
    const railWidth = index === visible.length - 1
      ? RAIL_WIDTH - railOffset
      : RAIL_WIDTH * share / 100;
    const prepared = {
      ...item,
      id: `${item.name}-${index}`,
      share,
      targetY: visible.length === 1 ? (top + bottom) / 2 : top + step * index,
      railX: RAIL_X + railOffset,
      railWidth,
    };
    railOffset += railWidth;
    return prepared;
  });
}

export function EmissionSourceFlow({ data, unit = "tCO₂e" }: { data: EmissionSourceFlowDatum[]; unit?: string }) {
  const prepared = useMemo(() => prepareData(data), [data]);
  const total = prepared.reduce((sum, item) => sum + item.value, 0);

  if (!prepared.length) return <div className="cockpit-empty">当前暂无排放源构成数据</div>;

  return (
    <div
      className={styles.root}
      role="img"
      aria-label={`排放源路径分流图，合计 ${formatValue(total)} ${unit}`}
    >
      <svg className={styles.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <path className={styles.trunk} d={`M ${SOURCE_X - 6} ${SOURCE_Y} H ${SOURCE_X + 18}`} />

        {prepared.map((item, index) => {
          const path = `M ${SOURCE_X} ${SOURCE_Y} C 120 ${SOURCE_Y}, 154 ${item.targetY}, ${TARGET_X} ${item.targetY}`;
          const lineWidth = Math.max(4.2, item.share * 0.34);
          return (
            <g className={styles.flow} key={item.id} tabIndex={0} aria-label={`${item.name}，${formatValue(item.value)} ${unit}，占 ${item.share.toFixed(1)}%`}>
              <title>{`${item.name}：${formatValue(item.value)} ${unit}，占 ${item.share.toFixed(1)}%`}</title>
              <path className={styles.halo} d={path} stroke={item.color} strokeWidth={lineWidth + 5} />
              <path className={styles.band} d={path} stroke={item.color} strokeWidth={lineWidth} />
              <path
                className={styles.pulse}
                d={path}
                stroke={item.color}
                strokeWidth={Math.min(2.2, lineWidth * 0.2)}
                style={{ animationDelay: `${index * -0.42}s` }}
              />
              <circle className={styles["endpoint-halo"]} cx={TARGET_X} cy={item.targetY} r={5.2} stroke={item.color} />
              <circle className={styles.endpoint} cx={TARGET_X} cy={item.targetY} r={2.8} fill={item.color} />
              <text className={styles.label} x={TARGET_X + 11} y={item.targetY - 4}>{item.name}</text>
              <text className={styles.value} x={TARGET_X + 11} y={item.targetY + 11}>{formatValue(item.value)} {unit}</text>
              <text className={styles.share} x={WIDTH - 5} y={item.targetY - 4} textAnchor="end">{item.share.toFixed(0)}%</text>
            </g>
          );
        })}

        <g className={styles["source-node"]} aria-hidden="true">
          <rect x="12" y="64" width="72" height="84" rx="13" />
          <path d="M 20 79 H 35 M 20 133 H 35 M 61 79 H 76 M 61 133 H 76" />
          <text className={styles["source-label"]} x="48" y="86" textAnchor="middle">年度累计</text>
          <text className={styles["source-value"]} x="48" y="113" textAnchor="middle">{formatValue(total)}</text>
          <text className={styles["source-unit"]} x="48" y="130" textAnchor="middle">{unit}</text>
          <circle className={styles["source-signal"]} cx="77" cy="71" r="2.5" />
        </g>

        <g aria-label="排放源百分比总带">
          <rect className={styles["rail-track"]} x={RAIL_X} y="160" width={RAIL_WIDTH} height="9" rx="3" />
          {prepared.map((item, index) => (
            <rect
              className={styles["rail-segment"]}
              key={`${item.id}-rail`}
              x={item.railX}
              y="160"
              width={Math.max(0, item.railWidth)}
              height="9"
              fill={item.color}
              rx={index === 0 || index === prepared.length - 1 ? 3 : 0}
            />
          ))}
          <text className={styles["rail-caption"]} x={RAIL_X} y="183">100% 排放构成</text>
          <text className={styles["rail-caption"]} x={RAIL_X + RAIL_WIDTH} y="183" textAnchor="end">流带粗细 = 来源占比</text>
        </g>
      </svg>
    </div>
  );
}
