"use client";

import { useMemo, useState } from "react";
import type { SankeyData } from "@/data/energy-monitor-data";

interface SankeyFlowProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

interface LayoutNode {
  name: string;
  color: string;
  depth: number;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  totalValue: number;
}

interface LayoutLink {
  source: LayoutNode;
  target: LayoutNode;
  value: number;
  sourceY: number;
  sourceY2: number;
  targetY: number;
  targetY2: number;
}

const NODE_WIDTH = 14;
const NODE_PADDING = 8;
const TOP_PADDING = 16;
const BOTTOM_PADDING = 16;

function getNodeColor(node: { depth: number; color?: string }): string {
  return node.color || "#94A3B8";
}

export default function SankeyFlow({ data, width = 680, height = 520 }: SankeyFlowProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const { nodes, links, depthLabels } = useMemo(() => {
    if (!data.nodes.length) return { nodes: [], links: [], depthLabels: [] as string[] };

    const depths = [...new Set(data.nodes.map((n) => n.depth))].sort();
    const depthCount = depths.length;
    const usableWidth = width - 40;
    const spacingX = depthCount > 1 ? usableWidth / (depthCount - 1) : usableWidth / 2;

    // Group nodes by depth
    const nodesByDepth: SankeyData["nodes"][] = [];
    data.nodes.forEach((node) => {
      if (!nodesByDepth[node.depth]) nodesByDepth[node.depth] = [];
      nodesByDepth[node.depth].push(node);
    });

    // Calculate total value for each node (max of in/out)
    const nodeTotalValue = data.nodes.map((node, idx) => {
      const outVal = data.links.filter((l) => l.source === idx).reduce((s, l) => s + l.value, 0);
      const inVal = data.links.filter((l) => l.target === idx).reduce((s, l) => s + l.value, 0);
      return Math.max(outVal, inVal, 1);
    });

    // Calculate total value per depth
    const depthTotalValues = depths.map((d) => {
      const nodesInDepth = nodesByDepth[d] || [];
      return nodesInDepth.reduce((sum, n) => {
        const idx = data.nodes.indexOf(n);
        return sum + nodeTotalValue[idx];
      }, 0);
    });

    const maxDepthTotal = Math.max(...depthTotalValues);
    const availableHeight = height - TOP_PADDING - BOTTOM_PADDING;
    const scaleY = availableHeight / (maxDepthTotal || 1);

    // Layout nodes
    const layoutNodes: LayoutNode[] = data.nodes.map((node, idx) => {
      const d = node.depth;
      const depthNodes = nodesByDepth[d] || [];
      const nodeIdxInDepth = depthNodes.indexOf(node);
      const totalDepthVal = depthTotalValues[d] || 1;

      // Calculate Y position
      let yOffset = TOP_PADDING;
      for (let i = 0; i < nodeIdxInDepth; i++) {
        const prevNode = depthNodes[i];
        const prevIdx = data.nodes.indexOf(prevNode);
        const prevVal = nodeTotalValue[prevIdx];
        yOffset += prevVal * scaleY + NODE_PADDING;
      }

      // Center the column vertically if it's smaller than available height
      const columnHeight = depthNodes.reduce((sum, n) => {
        const nIdx = data.nodes.indexOf(n);
        return sum + nodeTotalValue[nIdx] * scaleY + NODE_PADDING;
      }, 0);
      const columnOffset = Math.max(0, (availableHeight - columnHeight) / 2);

      const x = 20 + d * spacingX;
      const y = yOffset + columnOffset;
      const h = Math.max(nodeTotalValue[idx] * scaleY, 3);

      return {
        ...node,
        index: idx,
        x,
        y,
        width: NODE_WIDTH,
        height: h,
        totalValue: nodeTotalValue[idx],
      };
    });

    // Layout links with proper ordering
    const layoutLinks: LayoutLink[] = data.links.map((link) => {
      const source = layoutNodes[link.source];
      const target = layoutNodes[link.target];

      const sourceOutLinks = data.links.filter((l) => l.source === link.source);
      const targetInLinks = data.links.filter((l) => l.target === link.target);

      const sourceTotalOut = sourceOutLinks.reduce((s, l) => s + l.value, 0);
      const targetTotalIn = targetInLinks.reduce((s, l) => s + l.value, 0);

      // Calculate order within source outputs
      let sourcePrevOut = 0;
      for (const l of sourceOutLinks) {
        if (l.target === link.target) break;
        sourcePrevOut += l.value;
      }

      // Calculate order within target inputs
      let targetPrevIn = 0;
      for (const l of targetInLinks) {
        if (l.source === link.source) break;
        targetPrevIn += l.value;
      }

      const scaleSource = source.height / (sourceTotalOut || 1);
      const scaleTarget = target.height / (targetTotalIn || 1);

      return {
        source,
        target,
        value: link.value,
        sourceY: source.y + sourcePrevOut * scaleSource,
        sourceY2: source.y + (sourcePrevOut + link.value) * scaleSource,
        targetY: target.y + targetPrevIn * scaleTarget,
        targetY2: target.y + (targetPrevIn + link.value) * scaleTarget,
      };
    });

    // Depth labels
    const depthLabelMap: Record<number, string> = {
      0: "能源来源",
      1: "消耗环节",
      2: "细分活动",
      3: "核算范围",
    };
    const depthLabels = depths.map((d) => depthLabelMap[d] || `层级${d}`);

    return { nodes: layoutNodes, links: layoutLinks, depthLabels };
  }, [data, width, height]);

  const isHighlighted = (nodeIdx: number) => {
    if (hoveredNode === null) return true;
    if (nodeIdx === hoveredNode) return true;
    return links.some(
      (l) =>
        (l.source.index === hoveredNode && l.target.index === nodeIdx) ||
        (l.target.index === hoveredNode && l.source.index === nodeIdx)
    );
  };

  const getNodeTotalValue = (idx: number) => {
    const inVal = links.filter((l) => l.target.index === idx).reduce((s, l) => s + l.value, 0);
    const outVal = links.filter((l) => l.source.index === idx).reduce((s, l) => s + l.value, 0);
    return Math.max(inVal, outVal);
  };

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Depth labels */}
      {depthLabels.map((label, i) => {
        const depthNodes = nodes.filter((n) => n.depth === i);
        if (!depthNodes.length) return null;
        const centerX = depthNodes[0].x;
        return (
          <text
            key={i}
            x={centerX + NODE_WIDTH / 2}
            y={12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="#64748B"
            className="select-none"
          >
            {label}
          </text>
        );
      })}

      {/* Links */}
      {links.map((link, i) => {
        const highlighted = isHighlighted(link.source.index) && isHighlighted(link.target.index);
        const isHoveredLink =
          hoveredNode !== null &&
          (link.source.index === hoveredNode || link.target.index === hoveredNode);

        const path = `M ${link.source.x + link.source.width} ${link.sourceY}
          C ${link.source.x + link.source.width + 40} ${link.sourceY},
            ${link.target.x - 40} ${link.targetY},
            ${link.target.x} ${link.targetY}
          L ${link.target.x} ${link.targetY2}
          C ${link.target.x - 40} ${link.targetY2},
            ${link.source.x + link.source.width + 40} ${link.sourceY2},
            ${link.source.x + link.source.width} ${link.sourceY2} Z`;

        const linkColor = getNodeColor(link.source);

        return (
          <g key={i}>
            <path
              d={path}
              fill={linkColor}
              opacity={highlighted ? (isHoveredLink ? 0.8 : 0.3) : 0.06}
              className="transition-all duration-200"
            />
            <path
              d={path}
              fill="transparent"
              stroke="transparent"
              strokeWidth={8}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(link.source.index)}
              onMouseLeave={() => setHoveredNode(null)}
            />
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((node, i) => {
        const highlighted = isHighlighted(i);
        const isHovered = hoveredNode === i;
        const displayValue = getNodeTotalValue(i);

        return (
          <g
            key={i}
            onMouseEnter={() => setHoveredNode(i)}
            onMouseLeave={() => setHoveredNode(null)}
            className="cursor-pointer"
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.width}
              height={node.height}
              fill={getNodeColor(node)}
              rx={2}
              opacity={highlighted ? 1 : 0.12}
              className="transition-all duration-200"
            />
            {/* Node label - position depends on depth */}
            <text
              x={node.depth < 2 ? node.x + node.width + 5 : node.x - 5}
              y={node.y + node.height / 2 + 4}
              fontSize={node.height < 12 ? 9 : 10}
              fill={highlighted ? "#1E293B" : "#CBD5E1"}
              className="transition-all duration-200 select-none"
              dominantBaseline="middle"
              textAnchor={node.depth < 2 ? "start" : "end"}
            >
              {node.name}
            </text>
            {isHovered && (
              <text
                x={node.depth < 2 ? node.x + node.width + 5 : node.x - 5}
                y={node.y + node.height / 2 + (node.height < 12 ? 12 : 14)}
                fontSize={9}
                fill="#64748B"
                dominantBaseline="middle"
                textAnchor={node.depth < 2 ? "start" : "end"}
                className="select-none"
              >
                {displayValue.toFixed(0)} tCO₂
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}