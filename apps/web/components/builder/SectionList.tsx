import React, { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderNode, BuilderSection } from "@craftsite/shared";
import { ChevronDown, ChevronRight, Eye, EyeOff, Trash2, Box, LayoutTemplate, Type } from "lucide-react";
import { Button } from "../ui/button";

const getNodeIcon = (type: string) => {
  switch (type) {
    case "section": return <LayoutTemplate className="w-3.5 h-3.5" />;
    case "component": return <Box className="w-3.5 h-3.5" />;
    case "element": return <Type className="w-3.5 h-3.5" />;
    default: return <Box className="w-3.5 h-3.5" />;
  }
};

function LayerNode({ node, depth = 0 }: { node: BuilderNode; depth?: number }) {
  const { selectedNodeId, selectNode, hoveredNodeId, setHoveredNode, removeNode } = useBuilderStore();
  const [expanded, setExpanded] = useState(true);

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col">
      <div 
        className={`group flex items-center justify-between p-1.5 rounded cursor-pointer border ${isSelected ? 'bg-violet-500/20 border-violet-500/50' : isHovered ? 'bg-zinc-800/50 border-transparent' : 'border-transparent hover:bg-zinc-800/30'} transition-all`}
        style={{ paddingLeft: `${(depth * 12) + 8}px` }}
        onClick={(e) => { e.stopPropagation(); selectNode(node.id); }}
        onMouseEnter={(e) => { e.stopPropagation(); setHoveredNode(node.id); }}
        onMouseLeave={() => setHoveredNode(null)}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {hasChildren ? (
            <div 
              className="p-0.5 hover:bg-zinc-700 rounded text-zinc-400" 
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            >
              {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </div>
          ) : (
            <div className="w-4" /> // Spacing for leaf nodes
          )}
          
          <div className={`${isSelected ? 'text-violet-400' : 'text-zinc-500'}`}>
            {getNodeIcon(node.type)}
          </div>
          
          <span className={`text-xs truncate ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
            {node.name}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="flex flex-col">
          {node.children.map(child => (
            <LayerNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// Legacy support for Phase 27 Sections
function LegacySectionItem({ section }: { section: BuilderSection }) {
  const { selectedSectionId, selectSection, removeSection } = useBuilderStore();
  const isSelected = selectedSectionId === section.id;
  
  return (
    <div 
      className={`group flex items-center justify-between p-1.5 rounded cursor-pointer border ${isSelected ? 'bg-violet-500/20 border-violet-500/50' : 'border-transparent hover:bg-zinc-800/30'}`}
      onClick={() => selectSection(section.id)}
    >
      <div className="flex items-center gap-1.5">
        <LayoutTemplate className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-xs text-zinc-300 capitalize">{section.type}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}>
        <Trash2 className="w-3 h-3" />
      </Button>
    </div>
  );
}

export default function SectionList() {
  const { builderData, activePageId } = useBuilderStore();
  
  if (!builderData) return null;

  const activePage = builderData.pages?.find(p => p.id === activePageId);
  const nodes = activePage?.nodes || [];
  const sections = activePage?.sections || builderData.sections || [];

  return (
    <div className="flex flex-col gap-0.5">
      {nodes.length > 0 ? (
        nodes.map(node => <LayerNode key={node.id} node={node} />)
      ) : (
        sections.map(section => <LegacySectionItem key={section.id} section={section} />)
      )}
      
      {nodes.length === 0 && sections.length === 0 && (
        <div className="text-xs text-zinc-500 text-center py-4">
          No layers found on this page.
        </div>
      )}
    </div>
  );
}
