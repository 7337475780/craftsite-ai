import React, { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderSectionType } from "@craftsite/shared";
import { ChevronDown, ChevronRight, GripHorizontal } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const categories = [
  { 
    id: "layout", 
    label: "Layout", 
    items: [
      { id: "section", label: "Section", type: "section" },
      { id: "columns", label: "Columns", type: "component" }
    ]
  },
  {
    id: "sections",
    label: "Sections",
    items: [
      { id: "hero", label: "Hero", type: "section" },
      { id: "navbar", label: "Navbar", type: "section" },
      { id: "footer", label: "Footer", type: "section" },
      { id: "features", label: "Features", type: "section" },
      { id: "pricing", label: "Pricing", type: "section" },
      { id: "testimonials", label: "Testimonials", type: "section" },
      { id: "faq", label: "FAQ", type: "section" },
      { id: "contact", label: "Contact", type: "section" },
      { id: "gallery", label: "Gallery", type: "section" }
    ]
  },
  {
    id: "components",
    label: "Basic Components",
    items: [
      { id: "heading", label: "Heading", type: "element" },
      { id: "text", label: "Text", type: "element" },
      { id: "button", label: "Button", type: "element" },
      { id: "image", label: "Image", type: "element" },
      { id: "card", label: "Card", type: "component" }
    ]
  }
];

function DraggableComponentItem({ item }: { item: any }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `new-${item.id}`,
    data: { isNew: true, type: item.type, templateId: item.id }
  });

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-800 hover:border-violet-500 rounded cursor-grab active:cursor-grabbing group transition-all"
    >
      <GripHorizontal className="w-4 h-4 text-zinc-500 group-hover:text-violet-400" />
      <span className="text-sm text-zinc-300 group-hover:text-white">{item.label}</span>
    </div>
  );
}

export default function AddSectionPanel() {
  const [expandedCats, setExpandedCats] = useState<string[]>(["sections", "components", "layout"]);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {categories.map(cat => (
        <div key={cat.id} className="flex flex-col">
          <div 
            className="flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded cursor-pointer group"
            onClick={() => toggleCat(cat.id)}
          >
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 group-hover:text-white transition-colors">{cat.label}</h3>
            {expandedCats.includes(cat.id) ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
          </div>
          
          {expandedCats.includes(cat.id) && (
            <div className="grid grid-cols-2 gap-2 mt-2 px-1">
              {cat.items.map(item => (
                <DraggableComponentItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
