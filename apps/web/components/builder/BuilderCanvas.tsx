import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderNode, BuilderSection } from "@craftsite/shared";
import { useDroppable } from "@dnd-kit/core";
import { Trash2, Edit2, Copy } from "lucide-react";
import { Button } from "../ui/button";

function CanvasNode({ node, depth = 0 }: { node: BuilderNode; depth?: number }) {
  const { previewMode, selectedNodeId, selectNode, hoveredNodeId, setHoveredNode, removeNode } = useBuilderStore();
  
  const { setNodeRef, isOver } = useDroppable({
    id: node.id,
    data: { type: node.type, acceptsChildren: true }
  });

  const isSelected = selectedNodeId === node.id;
  const isHovered = hoveredNodeId === node.id;

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewMode) selectNode(node.id);
  };

  const handleHoverEnter = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewMode) setHoveredNode(node.id);
  };

  const handleHoverLeave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!previewMode && hoveredNodeId === node.id) setHoveredNode(null);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleSelect}
      onMouseEnter={handleHoverEnter}
      onMouseLeave={handleHoverLeave}
      className={`relative min-h-[50px] p-4 transition-all ${!previewMode ? 'border border-dashed border-zinc-200/20' : ''} ${isOver && !previewMode ? 'bg-violet-500/10 border-violet-500' : ''} ${isSelected && !previewMode ? 'ring-2 ring-violet-500 z-20 bg-violet-500/5' : isHovered && !previewMode ? 'ring-1 ring-violet-400 z-10' : ''}`}
    >
      {!previewMode && (isSelected || isHovered) && (
        <div className="absolute -top-3 left-0 bg-violet-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm z-30 flex items-center gap-1">
          <span className="uppercase">{node.name}</span>
        </div>
      )}

      {!previewMode && isSelected && (
        <div className="absolute -top-3 right-0 bg-zinc-900 text-white rounded shadow-sm z-30 flex items-center">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white"><Copy className="w-3 h-3" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-red-400" onClick={(e) => { e.stopPropagation(); removeNode(node.id); }}><Trash2 className="w-3 h-3" /></Button>
        </div>
      )}

      {/* Render component content */}
      <div className="relative z-0">
        <RenderNodeContent node={node}>
          {node.children.map(child => (
            <CanvasNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </RenderNodeContent>
      </div>
    </div>
  );
}

function RenderNodeContent({ node, children }: { node: BuilderNode, children: React.ReactNode }) {
  const { updateNodeProps, previewMode } = useBuilderStore();
  
  const handleInput = (key: string, e: React.FormEvent<HTMLElement>) => {
    if (!previewMode) {
      updateNodeProps(node.id, { [key]: e.currentTarget.innerText });
    }
  };

  const p = node.props || {};

  switch (node.name) {
    case 'heading':
      return (
        <h1 
          className="text-4xl font-extrabold tracking-tight outline-none empty:before:content-['Empty_Heading'] empty:before:text-zinc-400"
          contentEditable={!previewMode}
          suppressContentEditableWarning
          onBlur={(e) => handleInput('text', e)}
        >
          {p.text || ''}
        </h1>
      );
    case 'text':
      return (
        <p 
          className="text-lg text-zinc-500 outline-none empty:before:content-['Empty_Text_Block'] empty:before:text-zinc-400"
          contentEditable={!previewMode}
          suppressContentEditableWarning
          onBlur={(e) => handleInput('text', e)}
        >
          {p.text || ''}
        </p>
      );
    case 'button':
      return (
        <button 
          className="px-6 py-2.5 rounded bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors outline-none empty:before:content-['Button'] empty:before:text-zinc-200"
          contentEditable={!previewMode}
          suppressContentEditableWarning
          onBlur={(e) => handleInput('label', e)}
        >
          {p.label || ''}
        </button>
      );
    case 'image':
      return (
        <div className="bg-zinc-200 aspect-video rounded flex items-center justify-center border-2 border-dashed border-zinc-300">
          <span className="text-zinc-500">Image Placeholder</span>
        </div>
      );
    case 'columns':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full min-h-[100px]">
          {children || <span className="text-zinc-400 italic text-center w-full col-span-2">Drop components into columns</span>}
        </div>
      );
    case 'hero':
      return (
        <section className="py-24 px-4 flex flex-col items-center justify-center text-center w-full min-h-[300px]">
          {children || <span className="text-zinc-400 italic">Drop Hero content here</span>}
        </section>
      );
    case 'section':
    case 'navbar':
    case 'footer':
    case 'features':
    case 'pricing':
    case 'contact':
    case 'faq':
    case 'gallery':
    case 'testimonials':
      return (
        <section className="py-16 px-4 w-full min-h-[100px] flex flex-col">
          {children || <span className="text-zinc-400 italic text-center">Drop {node.name} content here</span>}
        </section>
      );
    case 'card':
      return (
        <div className="p-6 rounded-lg border border-zinc-200 shadow-sm bg-white min-h-[100px] flex flex-col">
          {children || <span className="text-zinc-400 italic text-center">Drop Card content here</span>}
        </div>
      );
    default:
      return (
        <div className="min-h-[50px] flex flex-col">
          {children || (
            <div className="text-zinc-500 text-sm text-center italic py-2">
              Empty {node.name}
            </div>
          )}
        </div>
      );
  }
}

// Legacy renderer for Phase 27 backward compatibility
function LegacySectionPreview({ section, theme }: { section: BuilderSection; theme: any }) {
  const { previewMode, selectedSectionId, selectSection } = useBuilderStore();
  const isSelected = selectedSectionId === section.id;
  
  let html = `<div class="p-8 border-dashed border-2 m-4 text-center text-gray-500">Section placeholder: ${section.type}</div>`;
  // (Simplified fallback HTML - actual HTML rendering will be migrated to Nodes)
  if (section.type === "hero") {
    html = `<section class="py-24 px-4 flex flex-col items-center text-center"><h1 class="text-4xl font-extrabold mb-6">${section.props.heading || 'Hero'}</h1><p class="mb-8">${section.props.description || ''}</p></section>`;
  }

  return (
    <div 
      onClick={(e) => { e.stopPropagation(); if (!previewMode) selectSection(section.id); }}
      className={`relative group ${!previewMode && isSelected ? 'ring-2 ring-violet-500 z-10' : ''} ${!previewMode ? 'hover:ring-2 hover:ring-violet-500/50 cursor-pointer' : ''}`}
    >
      {!previewMode && isSelected && (
        <div className="absolute top-0 left-0 bg-violet-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-br z-20">
          {section.type}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default function BuilderCanvas() {
  const { builderData, viewport, activePageId, selectNode, selectSection } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: "canvas-root", data: { acceptsChildren: true } });

  if (!builderData) return null;

  const widthMap = {
    desktop: "max-w-[1440px]",
    tablet: "max-w-[768px]",
    mobile: "max-w-[390px]",
    full: "w-full",
  };

  const themeClasses = `bg-[${builderData.theme.backgroundColor}] text-[${builderData.theme.textColor}] font-sans`;

  let sectionsToRender: BuilderSection[] = [];
  let nodesToRender: BuilderNode[] = [];
  
  if (activePageId && builderData.pages && builderData.pages.length > 0) {
    const activePage = builderData.pages.find(p => p.id === activePageId);
    if (activePage) {
      sectionsToRender = activePage.sections;
      nodesToRender = activePage.nodes || [];
    }
  } else {
    sectionsToRender = builderData.sections;
  }

  return (
    <div 
      className="h-full w-full flex items-start justify-center overflow-auto py-8 transition-all duration-300"
      onClick={() => { selectNode(null); selectSection(null); }}
    >
      <div 
        ref={setNodeRef}
        className={`relative w-full ${widthMap[viewport]} bg-white min-h-[800px] shadow-2xl rounded-sm overflow-hidden ring-1 ring-zinc-800 transition-all duration-300 ${themeClasses} ${isOver ? 'ring-2 ring-violet-500' : ''}`}
      >
        {nodesToRender.length > 0 ? (
          nodesToRender.map(node => <CanvasNode key={node.id} node={node} />)
        ) : sectionsToRender.length > 0 ? (
          sectionsToRender.filter(s => s.visible).sort((a,b) => a.order - b.order).map(section => (
            <LegacySectionPreview key={section.id} section={section} theme={builderData.theme} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full min-h-[800px] text-zinc-500 font-medium">
            Drag and drop components here
          </div>
        )}
      </div>
    </div>
  );
}
