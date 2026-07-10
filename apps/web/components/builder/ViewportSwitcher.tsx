import React from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Monitor, Smartphone, Tablet, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ViewportSwitcher() {
  const { viewport, setViewport } = useBuilderStore();

  return (
    <div className="flex bg-zinc-950 p-1 rounded-md border border-zinc-800">
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-7 px-2 text-zinc-400 hover:text-white ${viewport === 'desktop' ? 'bg-zinc-800 text-white' : ''}`}
        onClick={() => setViewport('desktop')}
        title="Desktop (1440px)"
      >
        <Monitor className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-7 px-2 text-zinc-400 hover:text-white ${viewport === 'tablet' ? 'bg-zinc-800 text-white' : ''}`}
        onClick={() => setViewport('tablet')}
        title="Tablet (768px)"
      >
        <Tablet className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-7 px-2 text-zinc-400 hover:text-white ${viewport === 'mobile' ? 'bg-zinc-800 text-white' : ''}`}
        onClick={() => setViewport('mobile')}
        title="Mobile (390px)"
      >
        <Smartphone className="w-4 h-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`h-7 px-2 text-zinc-400 hover:text-white ${viewport === 'full' ? 'bg-zinc-800 text-white' : ''}`}
        onClick={() => setViewport('full')}
        title="Full Width"
      >
        <Maximize className="w-4 h-4" />
      </Button>
    </div>
  );
}
