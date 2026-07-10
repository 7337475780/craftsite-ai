import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { sectionTemplates } from "@/lib/builder/section-templates";
import { BuilderSectionType } from "@craftsite/shared";
import { Button } from "@/components/ui/button";

export default function AddSectionPanel() {
  const { addSection } = useBuilderStore();

  const categories: { label: string, types: BuilderSectionType[] }[] = [
    { label: "Navigation", types: ["navbar", "footer"] },
    { label: "Content", types: ["hero", "features"] },
    { label: "Conversion", types: ["pricing", "cta"] }
  ];

  return (
    <div className="flex flex-col gap-6">
      {categories.map(cat => (
        <div key={cat.label}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">{cat.label}</h3>
          <div className="grid grid-cols-2 gap-2">
            {cat.types.map(type => {
              const templates = sectionTemplates[type];
              if (!templates || templates.length === 0) return null;
              
              return (
                <div 
                  key={type}
                  onClick={() => addSection(templates[0])}
                  className="aspect-video bg-zinc-900 border border-zinc-800 hover:border-violet-500 rounded flex items-center justify-center cursor-pointer transition-colors group relative"
                >
                  <span className="text-xs text-zinc-400 group-hover:text-white capitalize">
                    {type}
                  </span>
                  <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
