"use client";

import { useMemo } from "react";
import styles from "./building-priority-scatter.module.css";

export interface BuildingPriorityDatum {
  id: string;
  name: string;
  carbonIntensity: number;
  targetGapPct: number;
  emission: number;
  level: "danger" | "warning" | "normal";
}

interface PreparedDatum extends BuildingPriorityDatum {
  anchorX: number;
  anchorY: number;
  label: string;
  x: number;
  y: number;
  radius: number;
}

const WIDTH = 330;
const HEIGHT = 260;
const MARGIN = { top: 12, right: 8, bottom: 32, left: 36 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const BUBBLE_GAP = 2.5;

const LEVEL_COLORS = {
  danger: { fill: "rgba(233,111,131,.62)", stroke: "#ffabb8" },
  warning: { fill: "rgba(240,185,79,.56)", stroke: "#f6d286" },
  normal: { fill: "rgba(53,212,228,.48)", stroke: "#8cecf1" },
} as const;

function paddedDomain(values: number[], minimumPadding: number): [number, number] {
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const padding = Math.max((maximum - minimum) * 0.18, minimumPadding);
  return [minimum - padding, maximum + padding];
}

function scale(value: number, domain: [number, number], range: [number, number]) {
  if (domain[0] === domain[1]) return (range[0] + range[1]) / 2;
  return range[0] + ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]);
}

function shortName(name: string) {
  const explicitShortNames: Array<[RegExp, string]> = [
    [/^学生宿舍(\d+)号楼$/, "宿$1"],
    [/^研究生宿舍楼$/, "研宿"],
    [/^行政办公楼$/, "行政楼"],
    [/^鸿博园食堂$/, "食堂"],
    [/^屋顶光伏电站$/, "光伏站"],
  ];

  for (const [pattern, replacement] of explicitShortNames) {
    if (pattern.test(name)) return name.replace(pattern, replacement);
  }

  const compact = name
    .replace(/材料科学楼$/, "材料楼")
    .replace(/机电信息楼$/, "机电楼")
    .replace(/冶金生态楼$/, "冶金楼")
    .replace(/土木与资源楼$/, "土木楼")
    .replace(/学院楼$/, "")
    .replace(/中心楼$/, "中心")
    .replace(/号楼$/, "号")
    .replace(/大楼$/, "楼");

  return compact.length > 3 ? compact.slice(0, 3) : compact;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function resolveCollisions(points: PreparedDatum[]) {
  const resolved = points.map((point) => ({ ...point }));

  for (let iteration = 0; iteration < 36; iteration += 1) {
    let moved = false;

    for (let index = 0; index < resolved.length; index += 1) {
      for (let comparisonIndex = index + 1; comparisonIndex < resolved.length; comparisonIndex += 1) {
        const first = resolved[index];
        const second = resolved[comparisonIndex];
        let deltaX = second.x - first.x;
        let deltaY = second.y - first.y;
        let distance = Math.hypot(deltaX, deltaY);
        const minimumDistance = first.radius + second.radius + BUBBLE_GAP;

        if (distance >= minimumDistance) continue;

        if (distance < 0.01) {
          const angle = ((index + 1) * 1.7 + (comparisonIndex + 1) * 2.3) % (Math.PI * 2);
          deltaX = Math.cos(angle);
          deltaY = Math.sin(angle);
          distance = 1;
        }

        const offset = (minimumDistance - distance) / 2;
        const unitX = deltaX / distance;
        const unitY = deltaY / distance;
        first.x -= unitX * offset;
        first.y -= unitY * offset;
        second.x += unitX * offset;
        second.y += unitY * offset;
        moved = true;
      }
    }

    resolved.forEach((point) => {
      point.x += (point.anchorX - point.x) * 0.045;
      point.y += (point.anchorY - point.y) * 0.045;
      point.x = clamp(point.x, MARGIN.left + point.radius, MARGIN.left + PLOT_WIDTH - point.radius);
      point.y = clamp(point.y, MARGIN.top + point.radius, MARGIN.top + PLOT_HEIGHT - point.radius);
    });

    if (!moved) break;
  }

  return resolved;
}

export function BuildingPriorityScatter({ data }: { data: BuildingPriorityDatum[] }) {
  const prepared = useMemo(() => {
    const valid = data.filter((item) =>
      Number.isFinite(item.carbonIntensity) &&
      Number.isFinite(item.targetGapPct) &&
      Number.isFinite(item.emission),
    );
    if (!valid.length) return null;

    const xDomain = paddedDomain(valid.map((item) => item.carbonIntensity), 4);
    const yDomain = paddedDomain(valid.map((item) => item.targetGapPct), 2);
    const emissions = valid.map((item) => Math.max(item.emission, 0));
    const emissionDomain: [number, number] = [Math.min(...emissions), Math.max(...emissions)];
    const xThreshold = clamp(Math.max(85, xDomain[0] + (xDomain[1] - xDomain[0]) * 0.58), xDomain[0], xDomain[1]);
    const yThreshold = clamp(Math.max(10, yDomain[0] + (yDomain[1] - yDomain[0]) * 0.55), yDomain[0], yDomain[1]);
    const densityScale = clamp(Math.sqrt(10 / valid.length), 0.72, 1);

    const points = resolveCollisions(valid.map((item) => {
      const anchorX = scale(item.carbonIntensity, xDomain, [MARGIN.left, MARGIN.left + PLOT_WIDTH]);
      const anchorY = scale(item.targetGapPct, yDomain, [MARGIN.top + PLOT_HEIGHT, MARGIN.top]);
      return {
        ...item,
        anchorX,
        anchorY,
        label: shortName(item.name),
        x: anchorX,
        y: anchorY,
        radius: scale(
          Math.sqrt(Math.max(item.emission, 0)),
          [Math.sqrt(emissionDomain[0]), Math.sqrt(emissionDomain[1])],
          [14 * densityScale, 23 * densityScale],
        ),
      };
    }));

    return {
      points,
      xDomain,
      yDomain,
      xThreshold,
      yThreshold,
      thresholdX: scale(xThreshold, xDomain, [MARGIN.left, MARGIN.left + PLOT_WIDTH]),
      thresholdY: scale(yThreshold, yDomain, [MARGIN.top + PLOT_HEIGHT, MARGIN.top]),
    };
  }, [data]);

  if (!prepared) return <div className="cockpit-empty">暂无建筑治理优先级数据</div>;

  const xTicks = [0, 0.5, 1].map((ratio) => prepared.xDomain[0] + (prepared.xDomain[1] - prepared.xDomain[0]) * ratio);
  const yTicks = [0, 0.5, 1].map((ratio) => prepared.yDomain[0] + (prepared.yDomain[1] - prepared.yDomain[0]) * ratio);

  return (
    <div className={styles.root}>
      <svg
        className={styles.plot}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="建筑治理优先级气泡图，横轴为预测碳排强度，纵轴为年度目标偏差，气泡大小为本年累计排放"
      >
        <rect
          className={styles["priority-zone"]}
          x={prepared.thresholdX}
          y={MARGIN.top}
          width={MARGIN.left + PLOT_WIDTH - prepared.thresholdX}
          height={prepared.thresholdY - MARGIN.top}
        />
        <text className={styles["zone-label"]} x={MARGIN.left + PLOT_WIDTH - 4} y={MARGIN.top + 10} textAnchor="end">优先治理区</text>

        {[0, 0.5, 1].map((ratio) => {
          const x = MARGIN.left + PLOT_WIDTH * ratio;
          const y = MARGIN.top + PLOT_HEIGHT * ratio;
          return (
            <g key={ratio}>
              <line className={styles["grid-line"]} x1={x} x2={x} y1={MARGIN.top} y2={MARGIN.top + PLOT_HEIGHT} />
              <line className={styles["grid-line"]} x1={MARGIN.left} x2={MARGIN.left + PLOT_WIDTH} y1={y} y2={y} />
            </g>
          );
        })}

        <line className={styles["threshold-line"]} x1={prepared.thresholdX} x2={prepared.thresholdX} y1={MARGIN.top} y2={MARGIN.top + PLOT_HEIGHT} />
        <line className={styles["threshold-line"]} x1={MARGIN.left} x2={MARGIN.left + PLOT_WIDTH} y1={prepared.thresholdY} y2={prepared.thresholdY} />
        <line className={styles["axis-line"]} x1={MARGIN.left} x2={MARGIN.left} y1={MARGIN.top} y2={MARGIN.top + PLOT_HEIGHT} />
        <line className={styles["axis-line"]} x1={MARGIN.left} x2={MARGIN.left + PLOT_WIDTH} y1={MARGIN.top + PLOT_HEIGHT} y2={MARGIN.top + PLOT_HEIGHT} />

        {xTicks.map((value, index) => (
          <text className={styles["axis-text"]} key={`x-${value}`} x={MARGIN.left + PLOT_WIDTH * (index / 2)} y={HEIGHT - 16} textAnchor={index === 0 ? "start" : index === 2 ? "end" : "middle"}>{Math.round(value)}</text>
        ))}
        {yTicks.map((value, index) => (
          <text className={styles["axis-text"]} key={`y-${value}`} x={MARGIN.left - 5} y={MARGIN.top + PLOT_HEIGHT * (1 - index / 2) + 3} textAnchor="end">{value.toFixed(0)}%</text>
        ))}
        <text className={styles["axis-title"]} x={MARGIN.left + PLOT_WIDTH} y={HEIGHT - 3} textAnchor="end">预测碳排强度 kgCO₂e/㎡ →</text>
        <text className={styles["axis-title"]} x={9} y={MARGIN.top + PLOT_HEIGHT / 2} textAnchor="middle" transform={`rotate(-90 9 ${MARGIN.top + PLOT_HEIGHT / 2})`}>年度目标偏差</text>

        {[...prepared.points]
          .sort((first, second) => {
            const levelOrder = { normal: 0, warning: 1, danger: 2 } as const;
            return levelOrder[first.level] - levelOrder[second.level] || first.emission - second.emission;
          })
          .map((item) => {
          const colors = LEVEL_COLORS[item.level];
          const displacement = Math.hypot(item.x - item.anchorX, item.y - item.anchorY);
          return (
            <g
              className={styles.bubble}
              key={item.id}
              tabIndex={0}
              aria-label={`${item.name}，预测碳排强度 ${item.carbonIntensity.toFixed(1)} 千克二氧化碳当量每平方米，目标偏差 ${item.targetGapPct.toFixed(1)}%，本年累计排放 ${item.emission.toLocaleString("zh-CN")} 吨二氧化碳当量`}
            >
              <title>{`${item.name}：预测碳排强度 ${item.carbonIntensity.toFixed(1)} kgCO₂e/㎡，目标偏差 ${item.targetGapPct.toFixed(1)}%，本年累计 ${item.emission.toLocaleString("zh-CN")} tCO₂e`}</title>
              {displacement > 4.5 ? (
                <>
                  <line className={styles["bubble-leader"]} x1={item.anchorX} y1={item.anchorY} x2={item.x} y2={item.y} />
                  <circle className={styles["bubble-anchor"]} cx={item.anchorX} cy={item.anchorY} r={1.5} />
                </>
              ) : null}
              <circle className={styles["bubble-circle"]} cx={item.x} cy={item.y} r={item.radius} fill={colors.fill} stroke={colors.stroke} />
              <text className={styles["bubble-label"]} x={item.x} y={item.y + 3.4}>{item.label}</text>
            </g>
          );
        })}
      </svg>
      <div className={styles.legend}>
        <div className={styles["legend-items"]} aria-label="风险图例">
          <span className={styles["legend-item"]}><i style={{ background: "#e96f83" }} />优先</span>
          <span className={styles["legend-item"]}><i style={{ background: "#f0b94f" }} />关注</span>
          <span className={styles["legend-item"]}><i style={{ background: "#35d4e4" }} />常规</span>
        </div>
        <span className={styles["legend-hint"]}>气泡大小 = 本年累计排放</span>
      </div>
    </div>
  );
}
