import React, { useState } from 'react';
import { useEditorStore, GraphNodeData } from '../../store/editorStore';
import { Network, Tag, Calendar, DollarSign, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function KnowledgeGraph() {
  const { graphNodes, graphEdges } = useEditorStore();
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);

  // Custom node styling and icon configuration
  const getNodeColor = (type: GraphNodeData['type']) => {
    switch (type) {
      case 'Person': return '#3b82f6'; // Blue
      case 'Org': return '#10b981'; // Emerald
      case 'Date': return '#f59e0b'; // Amber
      case 'Amount': return '#ec4899'; // Pink
      case 'Law': return '#8b5cf6'; // Violet
      case 'Risk': return '#ef4444'; // Red
      default: return '#9ca3af';
    }
  };

  const getNodeIcon = (type: GraphNodeData['type']) => {
    const size = 14;
    switch (type) {
      case 'Person': return <Tag size={size} className="text-blue-500" />;
      case 'Org': return <Network size={size} className="text-emerald-500" />;
      case 'Date': return <Calendar size={size} className="text-amber-500" />;
      case 'Amount': return <DollarSign size={size} className="text-pink-500" />;
      case 'Law': return <ShieldCheck size={size} className="text-violet-500" />;
      case 'Risk': return <AlertTriangle size={size} className="text-red-500" />;
    }
  };

  // Node position coordinates mapping for a clean layout
  const positions: Record<string, { x: number; y: number }> = {
    n1: { x: 180, y: 150 }, // Main PDF
    n2: { x: 50, y: 80 },   // Landlord
    n3: { x: 300, y: 80 },  // Tenant
    n4: { x: 300, y: 220 }, // Rent
    n5: { x: 60, y: 220 },  // Date Commencement
    n6: { x: 180, y: 270 }, // Indemnification Clause
    n7: { x: 180, y: 350 }, // Unlimited Liability Risk
  };

  return (
    <div className="flex flex-col h-full text-xs">
      <div className="p-3 border-b border-border/40 flex items-center justify-between">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Network size={14} className="text-accent" />
          AI Document Knowledge Graph
        </span>
        <span className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary/80">
          7 nodes
        </span>
      </div>

      <div className="relative flex-1 min-h-[360px] bg-card/40 rounded-b-lg overflow-hidden border border-border/20">
        {/* Interactive SVG Layer */}
        <svg className="w-full h-full min-h-[360px]">
          {/* Defs for arrow heads */}
          <defs>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" className="text-muted-foreground/30" />
            </marker>
          </defs>

          {/* Render Connections */}
          {graphEdges.map((edge) => {
            const from = positions[edge.source];
            const to = positions[edge.target];
            if (!from || !to) return null;

            return (
              <g key={edge.id} className="transition-opacity duration-300">
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-border/80 dark:text-border/30"
                  markerEnd="url(#arrow)"
                />
                {/* Edge Label */}
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 4}
                  fill="currentColor"
                  className="text-[9px] text-muted-foreground/60 font-medium select-none"
                  textAnchor="middle"
                >
                  {edge.relation}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {graphNodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const isSelected = selectedNode?.id === node.id;
            const isMain = node.id === 'n1';

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                <circle
                  r={isMain ? 18 : 12}
                  fill={isMain ? '#6366f1' : 'var(--card)'}
                  stroke={isSelected ? '#6366f1' : isMain ? 'transparent' : getNodeColor(node.type)}
                  strokeWidth={isSelected ? 3 : 2}
                  className="shadow-sm transition-all duration-200 group-hover:scale-110"
                />
                
                {/* Embedded Node Icon (Except Main Document Node) */}
                {!isMain && (
                  <g transform="translate(-7, -7)">
                    {getNodeIcon(node.type)}
                  </g>
                )}

                {/* Node Title Label */}
                <text
                  y={isMain ? 28 : 22}
                  fill="currentColor"
                  textAnchor="middle"
                  className={`text-[9px] font-medium transition-all select-none ${
                    isSelected ? 'font-semibold text-accent' : 'text-foreground'
                  }`}
                >
                  {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Entity Card Detail Popover (Glassmorphic) */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-lg glass-card text-foreground flex flex-col gap-1 border border-border/40 animate-in fade-in-20 slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-accent uppercase tracking-wider text-[8px] flex items-center gap-1">
                {getNodeIcon(selectedNode.type)}
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-bold"
              >
                ×
              </button>
            </div>
            <span className="font-medium text-foreground text-xs leading-tight">
              {selectedNode.label}
            </span>
            {selectedNode.details && (
              <span className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                {selectedNode.details}
              </span>
            )}
            <span className="text-[9px] text-accent/80 font-medium flex items-center gap-0.5 mt-1.5">
              Jump to Page {selectedNode.page + 1} <ChevronRight size={10} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
