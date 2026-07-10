import React, { useState, useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "../ui/button";
import { Plus, Database, List, Trash2 } from "lucide-react";
import { BuilderCollection } from "@craftsite/shared";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function CMSManager() {
  const { projectId } = useBuilderStore();
  const [collections, setCollections] = useState<BuilderCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<BuilderCollection | null>(null);
  const [collectionToDelete, setCollectionToDelete] = useState<string | null>(null);

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

  const deleteCollection = async () => {
    if (!collectionToDelete) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/cms/collections/${collectionToDelete}`, { method: "DELETE" });
      if (res.ok) {
        setCollections(collections.filter(c => c.id !== collectionToDelete));
        if (selectedCollection?.id === collectionToDelete) setSelectedCollection(null);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCollectionToDelete(null);
    }
  };

  const createItem = async () => {
    if (!selectedCollection) return;
    const title = prompt("Enter item title:");
    if (!title) return;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await fetch(`/api/projects/${projectId}/cms/collections/${selectedCollection.id}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug, status: "published" }),
      });
      const json = await res.json();
      if (json.success) {
        const updated = { ...selectedCollection, items: [...(selectedCollection.items || []), json.data] };
        setSelectedCollection(updated);
        setCollections(collections.map(c => c.id === updated.id ? updated : c));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteItem = async (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    if (!selectedCollection) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/cms/collections/${selectedCollection.id}/items/${itemId}`, { method: "DELETE" });
      if (res.ok) {
        const updatedItems = selectedCollection.items?.filter(i => i.id !== itemId) || [];
        const updated = { ...selectedCollection, items: updatedItems };
        setSelectedCollection(updated);
        setCollections(collections.map(c => c.id === updated.id ? updated : c));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-full mt-6 pt-6 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">
          {selectedCollection ? (
            <div className="flex items-center gap-2 cursor-pointer hover:text-white" onClick={() => setSelectedCollection(null)}>
              <span className="text-zinc-500">&larr;</span> {selectedCollection.name}
            </div>
          ) : "CMS Collections"}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-zinc-400 hover:text-white" 
          onClick={selectedCollection ? createItem : createCollection}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-4">Loading CMS...</div>
        ) : selectedCollection ? (
          selectedCollection.items?.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-4">No items yet.</div>
          ) : (
            selectedCollection.items?.map((item: any) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between group p-2 rounded-md border border-zinc-800/50 bg-zinc-900/30 text-sm transition-colors text-zinc-300 hover:bg-zinc-800/80"
              >
                <div className="flex flex-col overflow-hidden">
                  <span className="truncate text-xs font-medium text-zinc-200">{item.title}</span>
                  <span className="truncate text-[10px] text-zinc-500">/{item.slug}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-red-400" onClick={(e) => deleteItem(e, item.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )
        ) : collections.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4">No collections.</div>
        ) : (
          collections.map(collection => (
            <div 
              key={collection.id} 
              className="flex items-center justify-between group p-2 rounded-md cursor-pointer text-sm transition-colors text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent hover:border-zinc-700/50"
              onClick={() => setSelectedCollection(collection)}
            >
              <div className="flex items-center gap-2 truncate">
                <Database className="w-3.5 h-3.5" />
                <span className="truncate text-xs">{collection.name}</span>
                <span className="text-[10px] text-zinc-600 truncate ml-1">{collection.slug}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-red-400" onClick={(e) => { e.stopPropagation(); setCollectionToDelete(collection.id); }}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        isOpen={!!collectionToDelete}
        title="Delete Collection"
        message="Delete this collection and all its items? This action cannot be undone."
        confirmText="Delete"
        onConfirm={deleteCollection}
        onCancel={() => setCollectionToDelete(null)}
      />
    </div>
  );
}
