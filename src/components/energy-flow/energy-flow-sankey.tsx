"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

import {
  ENERGY_META,
  STATUS_META,
  type EnergyFlowLink,
  type EnergyFlowNode,
} from "@/data/energy-flow-data";

export type FlowMetric = "energy" | "standardCoal" | "carbon" | "cost";

interface ChartClickParams {
  dataType?: "node" | "edge";
  data?: { id?: string; name?: string; linkId?: string };
}

interface TooltipParams {
  dataType?: "node" | "edge";
  data?: { id?: string; name?: string; linkId?: string };
}

interface EnergyFlowSankeyProps {
  nodes: EnergyFlowNode[];
  links: EnergyFlowLink[];
  metric: FlowMetric;
  unit: string;
  selectedNodeId: string | null;
  showValues: boolean;
  showPercent: boolean;
  zoom: number;
  chartRef: React.RefObject<ReactECharts | null>;
  onNodeClick: (nodeId: string) => void;
  onNodeDoubleClick: (nodeId: string) => void;
  onLinkClick: (linkId: string) => void;
}

const valueForNode = (node: EnergyFlowNode, metric: FlowMetric) => {
  if (metric === "carbon") return node.carbonEmission;
  if (metric === "cost") return node.cost;
  if (metric === "energy") {
    const factors = { combined: 1, electricity: 0.0001229, water: 0.00071, gas: 0.00133, heat: 0.03412, solar: 0.0001229, storage: 0.0001229, other: 1 };
    return node.energyType === "combined" ? node.standardCoal : node.standardCoal / factors[node.energyType];
  }
  return node.standardCoal;
};

const valueForLink = (link: EnergyFlowLink, metric: FlowMetric) => {
  if (metric === "carbon") return link.carbonEmission;
  if (metric === "cost") return link.cost;
  if (metric === "energy") return link.value;
  return link.standardCoal;
};

const signed = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

export function EnergyFlowSankey({
  nodes,
  links,
  metric,
  unit,
  selectedNodeId,
  showValues,
  showPercent,
  zoom,
  chartRef,
  onNodeClick,
  onNodeDoubleClick,
  onLinkClick,
}: EnergyFlowSankeyProps) {
  const connectedIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>([selectedNodeId]);
    let changed = true;
    while (changed) {
      changed = false;
      links.forEach((link) => {
        if (connected.has(link.source) && !connected.has(link.target)) {
          connected.add(link.target);
          changed = true;
        }
        if (connected.has(link.target) && !connected.has(link.source)) {
          connected.add(link.source);
          changed = true;
        }
      });
    }
    return connected;
  }, [links, selectedNodeId]);

  const totalInput = useMemo(
    () => nodes.filter((node) => node.level === 0).reduce((sum, node) => sum + valueForNode(node, metric), 0),
    [metric, nodes],
  );

  const option = useMemo<EChartsOption>(() => {
    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    const linksById = new Map(links.map((link) => [link.id, link]));

    return {
      animationDuration: 420,
      animationDurationUpdate: 280,
      tooltip: {
        trigger: "item",
        confine: true,
        backgroundColor: "rgba(15, 23, 42, 0.97)",
        borderColor: "#334155",
        textStyle: { color: "#f8fafc", fontSize: 12 },
        extraCssText: "border-radius:10px;box-shadow:0 12px 28px rgba(15,23,42,.2);max-width:330px",
        formatter: (raw: unknown) => {
          const params = raw as TooltipParams;
          if (params.dataType === "edge") {
            const link = params.data?.linkId ? linksById.get(params.data.linkId) : undefined;
            if (!link) return "";
            const source = nodesById.get(link.source);
            const target = nodesById.get(link.target);
            const sourceOutput = links
              .filter((item) => item.source === link.source)
              .reduce((sum, item) => sum + valueForLink(item, metric), 0);
            const targetInput = links
              .filter((item) => item.target === link.target)
              .reduce((sum, item) => sum + valueForLink(item, metric), 0);
            return [
              `<b>${source?.name ?? link.source} → ${target?.name ?? link.target}</b>`,
              `能源类型：${ENERGY_META[link.energyType].label}`,
              `当前流量：${valueForLink(link, metric).toFixed(2)} ${unit}`,
              `占起点输出：${sourceOutput ? ((valueForLink(link, metric) / sourceOutput) * 100).toFixed(1) : "0.0"}%`,
              `占终点输入：${targetInput ? ((valueForLink(link, metric) / targetInput) * 100).toFixed(1) : "0.0"}%`,
              `流向损耗：${link.lossRate.toFixed(1)}%　同比：${signed(link.yearOnYear)}`,
              `环比：${signed(link.monthOnMonth)}　状态：${STATUS_META[link.status].label}`,
              `<span style="color:#94a3b8">点击查看完整流向详情</span>`,
            ].join("<br/>");
          }

          const nodeId = params.data?.id ?? params.data?.name;
          const node = nodeId ? nodesById.get(nodeId) : undefined;
          if (!node) return "";
          return [
            `<b>${node.name}${node.isEstimated ? "　<span style='color:#f59e0b'>估算值</span>" : ""}</b>`,
            `节点类型：${({ input: "能源输入", conversion: "转换输配", building: "建筑区域", enduse: "终端场景", device: "设备", result: "能源结果" } as const)[node.type]}`,
            `当前能源量：${valueForNode(node, "energy").toLocaleString(undefined, { maximumFractionDigits: 1 })} ${node.rawUnit}`,
            `折标煤：${node.standardCoal.toFixed(2)} tce`,
            `碳排放：${node.carbonEmission.toFixed(2)} tCO₂e`,
            `能源费用：${node.cost.toFixed(2)} 万元`,
            `占总输入：${totalInput ? ((valueForNode(node, metric) / totalInput) * 100).toFixed(1) : "0.0"}%`,
            `同比：${signed(node.yearOnYear)}　环比：${signed(node.monthOnMonth)}`,
            `数据完整率：${node.dataQuality.toFixed(1)}%`,
            `更新时间：2026-07-29 15:42:37`,
            `状态：<span style="color:${STATUS_META[node.status].color}">${STATUS_META[node.status].label}</span>`,
            `<span style="color:#94a3b8">点击查看详情 · 双击下钻</span>`,
          ].join("<br/>");
        },
      },
      series: [
        {
          type: "sankey",
          left: 22,
          right: 28,
          top: 18,
          bottom: 24,
          nodeAlign: "justify",
          nodeGap: 13,
          nodeWidth: 15,
          draggable: true,
          layoutIterations: 48,
          emphasis: { focus: "adjacency" },
          blur: { itemStyle: { opacity: 0.17 }, lineStyle: { opacity: 0.06 } },
          label: {
            color: "#d9edf0",
            fontSize: 11,
            distance: 5,
            formatter: (raw: unknown) => {
              const params = raw as { data?: { id?: string; name?: string; displayName?: string; displayValue?: number } };
              const name = params.data?.displayName ?? params.data?.name ?? "";
              const shortName = name.length > 9 ? `${name.slice(0, 8)}…` : name;
              const value = params.data?.displayValue ?? 0;
              const valueLabel = showValues ? `\n${value.toFixed(value >= 1000 ? 0 : 1)} ${unit}` : "";
              const percentLabel = showPercent && totalInput ? ` · ${((value / totalInput) * 100).toFixed(1)}%` : "";
              return `${shortName}${valueLabel}${percentLabel}`;
            },
          },
          lineStyle: { color: "source", curveness: 0.5, opacity: 0.34 },
          data: nodes.map((node) => {
            const isDimmed = selectedNodeId !== null && !connectedIds.has(node.id);
            const qualityColor = node.dataQuality < 70 ? "#94a3b8" : ENERGY_META[node.energyType].color;
            const isException = node.status === "critical" || node.status === "warning";
            return {
              id: node.id,
              name: node.id,
              displayName: node.name,
              displayValue: valueForNode(node, metric),
              value: Math.max(valueForNode(node, metric), 0.01),
              depth: node.level,
              itemStyle: {
                color: qualityColor,
                opacity: isDimmed ? 0.18 : 1,
                borderColor: isException ? STATUS_META[node.status].color : node.dataQuality < 90 ? "#647d86" : "#6fa6ad",
                borderWidth: selectedNodeId === node.id ? 3 : isException ? 2 : 1,
                borderType: node.dataQuality < 90 ? "dashed" : "solid",
                shadowBlur: selectedNodeId === node.id || node.id === "building-lab-a" ? 10 : 0,
                shadowColor: ENERGY_META[node.energyType].color,
              },
              label: { opacity: isDimmed ? 0.28 : 1 },
            };
          }),
          links: links.map((link) => {
            const connected = !selectedNodeId || (connectedIds.has(link.source) && connectedIds.has(link.target));
            const color = link.status === "critical" || link.status === "warning"
              ? "#ef4444"
              : ENERGY_META[link.energyType].color;
            return {
              linkId: link.id,
              source: link.source,
              target: link.target,
              value: Math.max(valueForLink(link, metric), 0.01),
              lineStyle: {
                color,
                opacity: connected ? (link.status === "critical" ? 0.75 : 0.38) : 0.045,
                curveness: 0.5,
              },
            };
          }),
        },
      ],
    };
  }, [connectedIds, links, metric, nodes, selectedNodeId, showPercent, showValues, totalInput, unit]);

  const onEvents = useMemo(
    () => ({
      click: (params: ChartClickParams) => {
        if (params.dataType === "edge" && params.data?.linkId) onLinkClick(params.data.linkId);
        if (params.dataType === "node") {
          const nodeId = params.data?.id ?? params.data?.name;
          if (nodeId) onNodeClick(nodeId);
        }
      },
      dblclick: (params: ChartClickParams) => {
        if (params.dataType === "node") {
          const nodeId = params.data?.id ?? params.data?.name;
          if (nodeId) onNodeDoubleClick(nodeId);
        }
      },
    }),
    [onLinkClick, onNodeClick, onNodeDoubleClick],
  );

  return (
    <div className="energy-flow-sankey h-full min-h-[500px] overflow-auto rounded-lg bg-[#0b1d29]">
      <div
        className="h-full min-h-[500px] min-w-[900px] origin-center transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        <ReactECharts
          ref={chartRef}
          option={option}
          notMerge
          lazyUpdate
          onEvents={onEvents}
          style={{ height: "100%", minHeight: 500, width: "100%" }}
        />
      </div>
    </div>
  );
}
