import React, { useState, useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "../ui/button";
import { Plus, Database, List, Trash2 } from "lucide-react";
import { BuilderCollection } from "@craftsite/shared";

export default function CMSManager() {
  const { projectId } = useBuilderStore();
  const [collections, setCollections] = useState<BuilderCollection[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    fetchCollections();
  }, [projectId]);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/cms/collections`);
      const json = await res.json();
      if (json.success) {
        setCollections(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch collections", e);
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    const name = prompt("Enter collection name (e.g. Blog Posts):");
    if (!name) return;
    const slug = prompt("Enter collection slug (e.g. /blog):", `/${name.toLowerCase().replace(/\s+/g, "-")}`);
    if (!slug) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/cms/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          schema: { fields: [] }
        }),
      });
      const json = await res.json();
      if (json.success) {
        setCollections([...collections, json.data]);
      }
    } catch (e) {
      console.error("Failed to create collection", e);
    }
  };

  return (
    <div className="flex flex-col h-full mt-6 pt-6 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">CMS Collections</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={createCollection}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-4">Loading CMS...</div>
        ) : collections.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4">No collections.</div>
        ) : (
          collections.map(collection => (
            <div 
              key={collection.id} 
              className="flex items-center justify-between group p-2 rounded-md cursor-pointer text-sm transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              <div className="flex items-center gap-2 truncate">
                <Database className="w-3.5 h-3.5" />
                <span className="truncate">{collection.name}</span>
                <span className="text-[10px] text-zinc-600 truncate ml-1">{collection.slug}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
