"use client";

import { useId, useMemo, type ReactNode } from "react";
import {
  Area,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const COCKPIT_PALETTE = [
  "#35d4e4",
  "#f0b94f",
  "#8297f4",
  "#4cc9a4",
  "#e98a9b",
] as const;

export const COCKPIT_TONES = {
  live: "#35d4e4",
  healthy: "#4cc9a4",
  warning: "#f0b94f",
  danger: "#e96f83",
  forecast: "#8297f4",
  neutral: "#91a7ae",
} as const;

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

export function formatMeasure(value: number, maximumFractionDigits = 1): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-CN", { maximumFractionDigits }).format(value);
}

export function PanelHeading({
  icon,
  title,
  meta,
  tone = "live",
}: {
  icon?: ReactNode;
  title: string;
  meta?: ReactNode;
  tone?: "live" | "risk" | "neutral";
}) {
  return (
    <header className="cockpit-section-heading" data-tone={tone}>
      <span className="cockpit-section-heading__icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      {meta ? <div className="cockpit-section-heading__meta">{meta}</div> : null}
    </header>
  );
}

export function EmptyVisualization({ label = "暂无可显示数据" }: { label?: string }) {
  return (
    <div className="cockpit-empty" role="status">
      <span className="cockpit-empty__line" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export interface RibbonMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  detail?: string;
}

export function KpiRibbon({ metrics, liveLabel = "数据同步" }: { metrics: RibbonMetric[]; liveLabel?: string }) {
  if (!metrics.length) return null;
  return (
    <section className="cockpit-kpi-ribbon" aria-label="关键指标摘要">
      <div className="cockpit-kpi-ribbon__metrics">
        {metrics.map((metric) => (
          <div className="cockpit-kpi-ribbon__metric" key={metric.id}>
            <span>{metric.label}</span>
            <strong>{metric.value}{metric.unit ? <small>{metric.unit}</small> : null}</strong>
            {metric.detail ? <em>{metric.detail}</em> : null}
          </div>
        ))}
      </div>
      <div className="cockpit-kpi-ribbon__live"><i aria-hidden="true" />{liveLabel}</div>
    </section>
  );
}

export interface GaugeDatum {
  id: string;
  label: string;
  value: number;
  max?: number;
  unit?: string;
  detail?: string;
  color?: string;
}

function gaugeColor(value: number): string {
  if (value < 70) return COCKPIT_TONES.danger;
  if (value < 85) return COCKPIT_TONES.warning;
  return COCKPIT_TONES.live;
}

export function GaugeDial({ data, variant = "arc" }: { data: GaugeDatum; variant?: "arc" | "ring" }) {
  const max = data.max && data.max > 0 ? data.max : 100;
  const percent = clampPercent((data.value / max) * 100);
  const color = data.color ?? gaugeColor(percent);

  if (variant === "ring") {
    const radius = 36;
    return (
      <div className="cockpit-ring-gauge" role="img" aria-label={`${data.label} ${formatMeasure(data.value)}${data.unit ?? ""}`}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle className="cockpit-ring-gauge__track" cx="50" cy="50" r={radius} />
          <circle
            className="cockpit-ring-gauge__value"
            cx="50"
            cy="50"
            r={radius}
            pathLength="100"
            stroke={color}
            strokeDasharray={`${percent} 100`}
          />
          <circle className="cockpit-ring-gauge__core" cx="50" cy="50" r="24" />
        </svg>
        <div className="cockpit-ring-gauge__reading"><strong>{formatMeasure(data.value)}</strong><small>{data.unit}</small></div>
        <span className="cockpit-ring-gauge__label">{data.label}</span>
        {data.detail ? <em>{data.detail}</em> : null}
      </div>
    );
  }

  return (
    <div className="cockpit-arc-gauge" role="img" aria-label={`${data.label} ${formatMeasure(data.value)}${data.unit ?? ""}`}>
      <svg viewBox="0 0 180 104" aria-hidden="true">
        <path className="cockpit-arc-gauge__track" d="M 22 88 A 68 68 0 0 1 158 88" pathLength="100" />
        <path
          className="cockpit-arc-gauge__value"
          d="M 22 88 A 68 68 0 0 1 158 88"
          pathLength="100"
          stroke={color}
          strokeDasharray={`${percent} 100`}
        />
        {Array.from({ length: 11 }, (_, index) => {
          const angle = Math.PI - (index / 10) * Math.PI;
          const x1 = 90 + Math.cos(angle) * 76;
          const y1 = 88 - Math.sin(angle) * 76;
          const x2 = 90 + Math.cos(angle) * 82;
          const y2 = 88 - Math.sin(angle) * 82;
          return <line key={index} className="cockpit-arc-gauge__tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
        })}
      </svg>
      <div className="cockpit-arc-gauge__reading"><strong>{formatMeasure(data.value)}</strong><small>{data.unit}</small></div>
      <span>{data.label}</span>
      {data.detail ? <em>{data.detail}</em> : null}
    </div>
  );
}

export function GaugeGrid({ data }: { data: GaugeDatum[] }) {
  const prepared = data.filter((item) => Number.isFinite(item.value));
  if (!prepared.length) return <EmptyVisualization />;
  return <div className="cockpit-gauge-grid">{prepared.map((item) => <GaugeDial key={item.id} data={item} variant="ring" />)}</div>;
}

export interface ShareDatum {
  id: string;
  label: string;
  value: number;
  displayValue?: string;
  color?: string;
}

interface PreparedShareDatum extends ShareDatum {
  color: string;
  share: number;
}

function usePreparedShares(data: ShareDatum[]): PreparedShareDatum[] {
  return useMemo(() => {
    const safe = data.filter((item) => Number.isFinite(item.value) && item.value >= 0);
    const total = safe.reduce((sum, item) => sum + item.value, 0);
    return safe.map((item, index) => ({
      ...item,
      color: item.color ?? COCKPIT_PALETTE[index % COCKPIT_PALETTE.length],
      share: total > 0 ? (item.value / total) * 100 : 0,
    }));
  }, [data]);
}

export function DonutBreakdown({ data, unit, centerLabel = "合计" }: { data: ShareDatum[]; unit?: string; centerLabel?: string }) {
  const prepared = usePreparedShares(data);
  const total = prepared.reduce((sum, item) => sum + item.value, 0);
  if (!prepared.length) return <EmptyVisualization />;

  return (
    <div className="cockpit-donut" role="img" aria-label={`${centerLabel} ${formatMeasure(total)}${unit ?? ""}`}>
      <div className="cockpit-donut__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={prepared}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="67%"
              outerRadius="88%"
              paddingAngle={2}
              cornerRadius={2}
              stroke="rgba(5, 19, 26, .92)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {prepared.map((item) => <Cell key={item.id} fill={item.color} />)}
            </Pie>
            <Tooltip
              contentStyle={{ background: "rgba(6,23,31,.97)", border: "1px solid var(--theme-border)", borderRadius: 8, fontSize: 10 }}
              formatter={(value) => [`${formatMeasure(Number(value))}${unit ? ` ${unit}` : ""}`]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="cockpit-donut__center"><span>{centerLabel}</span><strong>{formatMeasure(total, total >= 100 ? 0 : 1)}</strong><small>{unit}</small></div>
      </div>
      <div className="cockpit-donut__legend">
        {prepared.map((item) => (
          <div className="cockpit-donut__legend-row" key={item.id}>
            <i style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span title={item.label}>{item.label}</span>
            <strong>{item.displayValue ?? formatMeasure(item.value)}{unit ? <small>{unit}</small> : null}</strong>
            <em>{formatMeasure(item.share)}%</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface RadarDatum {
  label: string;
  value: number;
  max?: number;
}

export function RadarProfile({ data, height = 142 }: { data: RadarDatum[]; height?: number }) {
  const prepared = useMemo(() => data
    .filter((item) => Number.isFinite(item.value))
    .map((item) => ({ ...item, score: clampPercent(item.max && item.max > 0 ? (item.value / item.max) * 100 : item.value) })), [data]);
  if (prepared.length < 3) return <EmptyVisualization label="指标不足，无法生成能力雷达" />;

  return (
    <div className="cockpit-radar" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={prepared} outerRadius="64%">
          <PolarGrid stroke="rgba(145,167,174,.24)" radialLines={false} />
          <PolarAngleAxis dataKey="label" tick={{ fill: "var(--theme-muted)", fontSize: 8 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="score" stroke={COCKPIT_TONES.live} fill={COCKPIT_TONES.live} fillOpacity={0.16} strokeWidth={1.8} dot={{ r: 2, fill: COCKPIT_TONES.live }} isAnimationActive={false} />
          <Tooltip
            contentStyle={{ background: "rgba(6,23,31,.97)", border: "1px solid var(--theme-border)", borderRadius: 8, fontSize: 10 }}
            formatter={(value) => [`${formatMeasure(Number(value))}%`, "评分"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompositionWaffle({ data, unit }: { data: ShareDatum[]; unit?: string }) {
  const prepared = usePreparedShares(data);
  const cells = useMemo(() => {
    const allocations = prepared.map((item) => ({
      id: item.id,
      color: item.color,
      whole: Math.floor(item.share),
      remainder: item.share - Math.floor(item.share),
    }));
    let remaining = 100 - allocations.reduce((sum, item) => sum + item.whole, 0);
    const byRemainder = allocations.toSorted((a, b) => b.remainder - a.remainder);
    for (let index = 0; remaining > 0 && byRemainder.length; index += 1, remaining -= 1) {
      byRemainder[index % byRemainder.length].whole += 1;
    }
    return allocations.flatMap((item) => Array.from({ length: item.whole }, (_, index) => ({ id: `${item.id}-${index}`, color: item.color })));
  }, [prepared]);
  if (!prepared.length) return <EmptyVisualization />;

  return (
    <div className="cockpit-waffle" role="img" aria-label="分类构成百分比矩阵">
      <div className="cockpit-waffle__grid" aria-hidden="true">
        {cells.map((cell) => <i key={cell.id} style={{ backgroundColor: cell.color }} />)}
      </div>
      <div className="cockpit-waffle__legend">
        {prepared.map((item) => (
          <div key={item.id}>
            <i style={{ backgroundColor: item.color }} aria-hidden="true" />
            <span>{item.label}</span>
            <strong>{formatMeasure(item.value)}{unit ? <small>{unit}</small> : null}</strong>
            <em>{formatMeasure(item.share)}%</em>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface RankDatum {
  id: string;
  label: string;
  value: number;
  unit?: string;
  color?: string;
}

export function LollipopRanking({ data }: { data: RankDatum[] }) {
  const prepared = useMemo(() => data
    .filter((item) => Number.isFinite(item.value))
    .toSorted((a, b) => b.value - a.value), [data]);
  const maximum = Math.max(...prepared.map((item) => Math.abs(item.value)), 0);
  if (!prepared.length) return <EmptyVisualization />;

  return (
    <div className="cockpit-lollipop" role="list" aria-label="指标排名">
      {prepared.map((item, index) => {
        const percent = maximum > 0 ? (Math.abs(item.value) / maximum) * 100 : 0;
        const color = item.color ?? (index === 0 ? COCKPIT_TONES.warning : COCKPIT_TONES.live);
        return (
          <div className="cockpit-lollipop__row" key={item.id} role="listitem">
            <span className="cockpit-lollipop__rank">{String(index + 1).padStart(2, "0")}</span>
            <span className="cockpit-lollipop__label" title={item.label}>{item.label}</span>
            <span className="cockpit-lollipop__plot" aria-hidden="true">
              <i style={{ width: `${percent}%`, borderColor: color }} />
              <b style={{ left: `${percent}%`, backgroundColor: color }} />
            </span>
            <strong>{formatMeasure(item.value)}<small>{item.unit}</small></strong>
          </div>
        );
      })}
      <div className="cockpit-lollipop__axis" aria-hidden="true"><span>0</span><span>{formatMeasure(maximum / 2, 0)}</span><span>{formatMeasure(maximum, 0)}</span></div>
    </div>
  );
}

export interface MatrixDatum {
  id: string;
  label: string;
  value?: string;
  detail?: string;
  level: "danger" | "warning" | "normal" | "neutral";
}

export function StatusMatrix({ data, emptyLabel = "当前没有异常状态" }: { data: MatrixDatum[]; emptyLabel?: string }) {
  if (!data.length) return <EmptyVisualization label={emptyLabel} />;
  return (
    <div className="cockpit-matrix" role="list">
      {data.map((item) => (
        <div className="cockpit-matrix__cell" data-level={item.level} key={item.id} role="listitem">
          <span>{item.label}</span>
          {item.value ? <strong>{item.value}</strong> : null}
          {item.detail ? <em>{item.detail}</em> : null}
        </div>
      ))}
    </div>
  );
}

export interface TrendDatum {
  label: string;
  [key: string]: string | number | null | undefined;
}

export interface TrendSeries {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

type TrendSeriesRole = "actual" | "benchmark" | "forecast" | "comparison";

interface StyledTrendSeries extends TrendSeries {
  displayColor: string;
  role: TrendSeriesRole;
  strokeDasharray?: string;
  strokeWidth: number;
}

function styleTrendSeries(item: TrendSeries, areaKey?: string): StyledTrendSeries {
  const key = item.key.toLowerCase();
  const isArea = item.key === areaKey;
  const isForecast = key.includes("forecast") || key.includes("predict");
  const isBenchmark = key.includes("target") || key.includes("yesterday") || key.includes("limit");

  if (isArea) {
    return {
      ...item,
      displayColor: item.color,
      role: "actual",
      strokeWidth: 3,
    };
  }

  if (isForecast) {
    return {
      ...item,
      displayColor: "#ff7a68",
      role: "forecast",
      strokeDasharray: "9 4 2 4",
      strokeWidth: 2.7,
    };
  }

  if (isBenchmark) {
    return {
      ...item,
      displayColor: "#f6c85f",
      role: "benchmark",
      strokeDasharray: "14 6",
      strokeWidth: 2.6,
    };
  }

  return {
    ...item,
    displayColor: item.color,
    role: "comparison",
    strokeDasharray: item.dashed ? "7 5" : undefined,
    strokeWidth: item.dashed ? 2.3 : 2.6,
  };
}

function trendLayer(role: TrendSeriesRole): number {
  if (role === "forecast") return 0;
  if (role === "benchmark") return 1;
  if (role === "comparison") return 2;
  return 3;
}

export function AdaptiveTrendChart({
  data,
  series,
  unit,
  height = 190,
  areaKey,
}: {
  data: TrendDatum[];
  series: TrendSeries[];
  unit?: string;
  height?: number;
  areaKey?: string;
}) {
  const gradientId = useId().replaceAll(":", "");
  const validSeries = useMemo(
    () => series.filter((item) => data.some((point) => typeof point[item.key] === "number")),
    [data, series],
  );

  if (!data.length || !validSeries.length) return <EmptyVisualization label="当前时间范围暂无趋势数据" />;
  const styledSeries = validSeries.map((item) => styleTrendSeries(item, areaKey));
  const renderedSeries = styledSeries.toSorted((a, b) => trendLayer(a.role) - trendLayer(b.role));
  const areaSeries = areaKey ? styledSeries.find((item) => item.key === areaKey) : undefined;

  return (
    <div className="cockpit-trend" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          {areaSeries ? (
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={areaSeries.displayColor} stopOpacity={0.44} />
                <stop offset="52%" stopColor={areaSeries.displayColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={areaSeries.displayColor} stopOpacity={0.04} />
              </linearGradient>
            </defs>
          ) : null}
          <CartesianGrid vertical={false} stroke="rgba(167,189,194,.16)" strokeDasharray="2 5" />
          <XAxis dataKey="label" axisLine={false} tickLine={false} minTickGap={24} interval="preserveStartEnd" tick={{ fill: "var(--theme-subtle)", fontSize: 10 }} />
          <YAxis axisLine={false} tickLine={false} width={46} domain={["auto", "auto"]} tick={{ fill: "var(--theme-subtle)", fontSize: 10 }} tickFormatter={(value: number) => formatMeasure(value, 0)} />
          <Tooltip
            cursor={{ stroke: "var(--theme-border)", strokeWidth: 1 }}
            contentStyle={{ background: "rgba(6,23,31,.96)", border: "1px solid var(--theme-border)", borderRadius: 8, color: "var(--theme-text)", fontSize: 11 }}
            formatter={(value) => [`${formatMeasure(Number(value))}${unit ? ` ${unit}` : ""}`]}
          />
          <Legend
            content={() => (
              <div className="cockpit-trend__legend" aria-label="趋势图例">
                {styledSeries.map((item) => (
                  <span key={item.key}>
                    <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
                      <line
                        x1="1"
                        y1="5"
                        x2="21"
                        y2="5"
                        stroke={item.displayColor}
                        strokeWidth={item.role === "actual" ? 3 : 2.4}
                        strokeDasharray={item.strokeDasharray}
                        strokeLinecap="round"
                      />
                      {item.role === "benchmark" ? (
                        <circle cx="11" cy="5" r="2.2" fill="rgba(6,23,31,.98)" stroke={item.displayColor} strokeWidth="1.3" />
                      ) : null}
                      {item.role === "forecast" ? (
                        <rect x="9.2" y="3.2" width="3.6" height="3.6" rx="0.6" fill={item.displayColor} transform="rotate(45 11 5)" />
                      ) : null}
                    </svg>
                    {item.label}
                  </span>
                ))}
              </div>
            )}
            wrapperStyle={{ color: "var(--theme-muted)", fontSize: 10, paddingTop: 4 }}
          />
          {areaSeries ? (
            <Area
              type="monotone"
              dataKey={areaSeries.key}
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              stroke="none"
              baseValue="dataMin"
              legendType="none"
              tooltipType="none"
              isAnimationActive={false}
            />
          ) : null}
          {renderedSeries.map((item) => (
            <Line
              key={`${item.key}-halo`}
              type="monotone"
              dataKey={item.key}
              stroke={item.displayColor}
              strokeWidth={item.strokeWidth + 5}
              strokeDasharray={item.strokeDasharray}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={item.role === "actual" ? 0.16 : 0.13}
              dot={false}
              activeDot={false}
              legendType="none"
              tooltipType="none"
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
          {renderedSeries.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.label}
              stroke={item.displayColor}
              strokeWidth={item.strokeWidth}
              strokeDasharray={item.strokeDasharray}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={
                data.length === 1
                  ? { r: 3, fill: item.displayColor, strokeWidth: 0 }
                  : data.length <= 16 && item.role === "benchmark"
                    ? { r: 2.2, fill: "rgba(6,23,31,.98)", stroke: item.displayColor, strokeWidth: 1.3 }
                    : data.length <= 16 && item.role === "forecast"
                      ? { r: 2.1, fill: item.displayColor, stroke: "rgba(6,23,31,.98)", strokeWidth: 1 }
                      : false
              }
              activeDot={{ r: 4.5, fill: item.displayColor, stroke: "rgba(6,23,31,.98)", strokeWidth: 2 }}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
