"use client";

import { useMemo, useState } from "react";
import type { SankeyData, SankeyNode } from "@/data/energy-monitor-data";

interface SankeyFlowProps {
  data: SankeyData;
  width?: number;
  height?: number;
}

interface LayoutNode extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
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

const NODE_WIDTH = 16;
const NODE_PADDING = 24;
const TOP_PADDING = 40;
const COLORS = [
  "#93C5FD", "#60A5FA", "#818CF8", "#A78BFA",
  "#F472B6", "#FB923C", "#34D399", "#FBBF24",
];

function getNodeColor(node: { depth: number; color?: string }, index: number): string {
  if (node.color) return node.color;
  return COLORS[index % COLORS.length];
}

export default function SankeyFlow({ data, width = 600, height = 360 }: SankeyFlowProps) {
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

  const { nodes, links } = useMemo(() => {
    const depths = [...new Set(data.nodes.map((n) => n.depth))].sort();
    const depthCount = depths.length;
    const spacingX = (width - NODE_WIDTH - 40) / (depthCount - 1 || 1);

    const nodesByDepth: SankeyNode[][] = [];
    data.nodes.forEach((node) => {
      const d = node.depth;
      if (!nodesByDepth[d]) nodesByDepth[d] = [];
      nodesByDepth[d].push(node);
    });

    const totalValueByDepth = depths.map((d) => {
      return nodesByDepth[d]?.reduce((sum, n) => {
        const idx = data.nodes.indexOf(n);
        const outLinks = data.links.filter((l) => l.source === idx);
        const inLinks = data.links.filter((l) => l.target === idx);
        return sum + Math.max(
          outLinks.reduce((s, l) => s + l.value, 0),
          inLinks.reduce((s, l) => s + l.value, 0),
          1
        );
      }, 0) || 1;
    });

    const maxValue = Math.max(...totalValueByDepth);
    const scaleY = (height - TOP_PADDING - 20) / (maxValue || 1);

    const layoutNodes: LayoutNode[] = data.nodes.map((node, idx) => {
      const d = node.depth;
      const depthIdx = nodesByDepth[d]?.indexOf(node) || 0;
      const depthNodes = nodesByDepth[d] || [];
      const totalDepthValue = totalValueByDepth[d] || 1;

      const nodeTotal = Math.max(
        data.links.filter((l) => l.source === idx).reduce((s, l) => s + l.value, 0),
        data.links.filter((l) => l.target === idx).reduce((s, l) => s + l.value, 0),
        1
      );

      const prevNodesHeight = depthNodes.slice(0, depthIdx).reduce((sum, n) => {
        const nIdx = data.nodes.indexOf(n);
        const nTotal = Math.max(
          data.links.filter((l) => l.source === nIdx).reduce((s, l) => s + l.value, 0),
          data.links.filter((l) => l.target === nIdx).reduce((s, l) => s + l.value, 0),
          1
        );
        return sum + nTotal * scaleY + NODE_PADDING;
      }, 0);

      const x = 20 + d * spacingX;
      const y = TOP_PADDING + prevNodesHeight;
      const h = Math.max(nodeTotal * scaleY, 4);

      return { ...node, index: idx, x, y, width: NODE_WIDTH, height: h };
    });

    const layoutLinks: LayoutLink[] = data.links.map((link) => {
      const source = layoutNodes[link.source];
      const target = layoutNodes[link.target];

      const sourceTotalOut = data.links
        .filter((l) => l.source === link.source)
        .reduce((s, l) => s + l.value, 0);
      const targetTotalIn = data.links
        .filter((l) => l.target === link.target)
        .reduce((s, l) => s + l.value, 0);

      const sourcePrevOut = data.links
        .filter((l) => l.source === link.source && data.nodes.indexOf(data.nodes[l.target]) < data.nodes.indexOf(data.nodes[link.target]))
        .reduce((s, l) => s + l.value, 0);
      const targetPrevIn = data.links
        .filter((l) => l.target === link.target && data.nodes.indexOf(data.nodes[l.source]) < data.nodes.indexOf(data.nodes[link.source]))
        .reduce((s, l) => s + l.value, 0);

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

    return { nodes: layoutNodes, links: layoutLinks };
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

  return (
    <svg width={width} height={height} className="overflow-visible">
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

        return (
          <g key={i}>
            <path
              d={path}
              fill={getNodeColor(link.source, link.source.index)}
              opacity={highlighted ? (isHoveredLink ? 0.85 : 0.4) : 0.08}
              className="transition-all duration-200"
            />
            <path
              d={path}
              fill="transparent"
              stroke="transparent"
              strokeWidth={6}
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

        const inValue = links
          .filter((l) => l.target.index === i)
          .reduce((s, l) => s + l.value, 0);
        const outValue = links
          .filter((l) => l.source.index === i)
          .reduce((s, l) => s + l.value, 0);
        const displayValue = Math.max(inValue, outValue);

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
              fill={getNodeColor(node, i)}
              rx={2}
              opacity={highlighted ? 1 : 0.15}
              className="transition-all duration-200"
            />
            <text
              x={node.x + node.width + 6}
              y={node.y + node.height / 2 + 4}
              fontSize={11}
              fill={highlighted ? "#1E293B" : "#CBD5E1"}
              className="transition-all duration-200"
              dominantBaseline="middle"
            >
              {node.name}
            </text>
            {isHovered && (
              <text
                x={node.x + node.width + 6}
                y={node.y + node.height / 2 + 18}
                fontSize={10}
                fill="#64748B"
                dominantBaseline="middle"
              >
                {displayValue.toLocaleString()} tCO₂
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}