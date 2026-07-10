import React from "react";
import { useBuilderStore } from "@/stores/builder-store";

export default function BuilderCanvas() {
  const { builderData, viewport, previewMode, selectedSectionId, selectSection } = useBuilderStore();

  if (!builderData) return null;

  const widthMap = {
    desktop: "max-w-[1440px]",
    tablet: "max-w-[768px]",
    mobile: "max-w-[390px]",
    full: "w-full",
  };

  const themeClasses = `bg-[${builderData.theme.backgroundColor}] text-[${builderData.theme.textColor}] font-sans`;

  return (
    <div className={`h-full w-full flex items-start justify-center overflow-auto py-8 transition-all duration-300`}>
      <div 
        className={`relative w-full ${widthMap[viewport]} bg-white min-h-[800px] shadow-2xl rounded-sm overflow-hidden ring-1 ring-zinc-800 transition-all duration-300 ${themeClasses}`}
      >
        {builderData.sections.filter(s => s.visible).sort((a,b) => a.order - b.order).map(section => (
          <div 
            key={section.id}
            onClick={(e) => {
              e.stopPropagation();
              if (!previewMode) selectSection(section.id);
            }}
            className={`relative group ${!previewMode && selectedSectionId === section.id ? 'ring-2 ring-violet-500 z-10' : ''} ${!previewMode ? 'hover:ring-2 hover:ring-violet-500/50 cursor-pointer' : ''}`}
          >
            {/* Outline label */}
            {!previewMode && selectedSectionId === section.id && (
              <div className="absolute top-0 left-0 bg-violet-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-br z-20">
                {section.type}
              </div>
            )}
            
            {/* Render HTML content (mocked compiler for now) */}
            <div dangerouslySetInnerHTML={{ __html: renderSectionPreview(section, builderData.theme) }} />
          </div>
        ))}
        
        {!previewMode && (
          <div 
            className="absolute inset-0 z-0 pointer-events-none" 
            onClick={() => selectSection(null)} 
          />
        )}
      </div>
    </div>
  );
}

// Temporary client-side mock render matching the backend compiler for instant preview
// In a real app we might use real React components to render the sections dynamically
function renderSectionPreview(section: any, theme: any) {
  // Similar logic to the backend compiler but simpler for instant visual preview
  switch (section.type) {
    case "hero":
      return `<section class="py-24 px-4 flex flex-col items-center justify-center text-center">
        ${section.props.badge ? `<div class="mb-6 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">${section.props.badge}</div>` : ""}
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">${section.props.heading || 'Hero'}</h1>
        <p class="text-lg md:text-xl text-[${theme.mutedTextColor}] mb-8 max-w-2xl">${section.props.description || ''}</p>
        <div class="flex gap-4">
          <button class="px-8 py-3 rounded bg-[${theme.primaryColor}] text-white font-medium">${section.props.primaryCta || 'Click Me'}</button>
        </div>
      </section>`;
    case "features":
      return `<section class="py-24 bg-[${theme.secondaryColor}] px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">${section.props.title || 'Features'}</h2>
        <p class="text-lg text-[${theme.mutedTextColor}] mb-16">${section.props.description || ''}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          ${(section.props.items || []).map((i: any) => `
            <div class="bg-[${theme.backgroundColor}] p-6 rounded border">
              <h3 class="text-xl font-bold mb-2">${i.title}</h3>
              <p class="text-[${theme.mutedTextColor}]">${i.description}</p>
            </div>
          `).join('')}
        </div>
      </section>`;
    case "navbar":
      return `<nav class="border-b bg-[${theme.backgroundColor}]/80 px-4 h-16 flex items-center justify-between">
        <div class="font-bold text-xl">${section.props.logoText || 'Brand'}</div>
        <div class="flex gap-4">
           ${(section.props.links || []).map((l: any) => `<a href="#" class="text-sm">${l.label}</a>`).join('')}
        </div>
      </nav>`;
    case "footer":
      return `<footer class="py-12 border-t bg-[${theme.backgroundColor}] px-4 text-center">
        <div class="font-bold text-xl mb-4">${section.props.brand || 'Brand'}</div>
        <p class="text-[${theme.mutedTextColor}]">${section.props.copyright || ''}</p>
      </footer>`;
    case "pricing":
      return `<section class="py-24 px-4 text-center">
        <h2 class="text-3xl font-bold mb-16">${section.props.title || 'Pricing'}</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          ${(section.props.plans || []).map((p: any) => `
            <div class="p-8 rounded border ${p.popular ? `border-[${theme.primaryColor}] scale-105` : ''}">
              <h3 class="text-2xl font-bold mb-2">${p.name}</h3>
              <div class="text-4xl font-extrabold mb-6">${p.price}</div>
              <button class="w-full py-2 rounded ${p.popular ? `bg-[${theme.primaryColor}] text-white` : `border text-[${theme.textColor}]`}">${p.features?.length} Features</button>
            </div>
          `).join('')}
        </div>
      </section>`;
    case "cta":
      return `<section class="py-24 bg-[${theme.primaryColor}] text-white px-4 text-center">
        <h2 class="text-4xl font-bold mb-6">${section.props.title || 'Ready?'}</h2>
        <button class="px-8 py-3 rounded bg-white text-[${theme.primaryColor}] font-medium">${section.props.buttonText || 'Go'}</button>
      </section>`;
    default:
      return `<div class="p-8 border-dashed border-2 m-4 text-center text-gray-500">Section placeholder: ${section.type}</div>`;
  }
}
