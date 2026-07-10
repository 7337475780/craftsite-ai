import React, { useState, useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, Trash2 } from "lucide-react";
import { BuilderNavigation } from "@craftsite/shared";

export default function NavigationEditor() {
  const { projectId } = useBuilderStore();
  const [navigations, setNavigations] = useState<BuilderNavigation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchNavigations();
  }, [projectId]);

  const fetchNavigations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/navigation`);
      const json = await res.json();
      if (json.success) {
        setNavigations(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch navigations", e);
    } finally {
      setLoading(false);
    }
  };

  const createNavigation = async () => {
    const name = prompt("Enter menu name (e.g. Main Menu):", "Main Menu");
    if (!name) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/navigation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.success) {
        setNavigations([...navigations, json.data]);
      }
    } catch (e) {
      console.error("Failed to create navigation", e);
    }
  };

  return (
    <div className="flex flex-col h-full mt-6 pt-6 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">Menus</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={createNavigation}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-4">Loading menus...</div>
        ) : navigations.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4">No menus.</div>
        ) : (
          navigations.map(nav => (
            <div 
              key={nav.id} 
              className="flex items-center justify-between group p-2 rounded-md cursor-pointer text-sm transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              <div className="flex items-center gap-2 truncate">
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="truncate">{nav.name}</span>
                <span className="text-[10px] text-zinc-600 truncate ml-1">{nav.items?.length || 0} items</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
