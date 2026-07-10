import React, { useState, useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "../ui/button";
import { Plus, FileText, Home, MoreVertical, Trash2, Edit } from "lucide-react";
import { BuilderPage } from "@craftsite/shared";
import NavigationEditor from "./NavigationEditor";
import PageSettingsModal from "./PageSettingsModal";

export default function PageManager() {
  const { projectId, activePageId, setActivePageId } = useBuilderStore();
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<BuilderPage | null>(null);

  useEffect(() => {
    if (!projectId) return;
    fetchPages();
  }, [projectId]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/pages`);
      const pages = await res.json();
      if (Array.isArray(pages)) {
        setPages(pages);
        if (pages.length > 0 && !activePageId) {
          setActivePageId(pages[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch pages", e);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async () => {
    const title = prompt("Enter page title:");
    if (!title) return;
    const slug = prompt("Enter page slug (e.g. /about):", `/${title.toLowerCase().replace(/\s+/g, "-")}`);
    if (!slug) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          isHomepage: pages.length === 0,
        }),
      });
      const newPage = await res.json();
      if (newPage && newPage.id) {
        setPages([...pages, newPage]);
      }
    } catch (e) {
      console.error("Failed to create page", e);
    }
  };

  const deletePage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this page?")) return;
    
    try {
      await fetch(`/api/projects/${projectId}/pages/${id}`, { method: "DELETE" });
      setPages(pages.filter(p => p.id !== id));
      if (activePageId === id) setActivePageId(pages[0]?.id || null);
    } catch (e) {
      console.error("Failed to delete page", e);
    }
  };

  const updatePage = async (id: string, updates: Partial<BuilderPage>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updatedPage = await res.json();
      if (updatedPage && updatedPage.id) {
        setPages(pages.map(p => p.id === id ? updatedPage : p));
        setEditingPage(null);
      }
    } catch (e) {
      console.error("Failed to update page", e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">Pages</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={createPage}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-4">Loading pages...</div>
        ) : pages.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-4">No pages yet.</div>
        ) : (
          pages.map(page => (
            <div 
              key={page.id} 
              onClick={() => setActivePageId(page.id)}
              className={`flex items-center justify-between group p-2 rounded-md cursor-pointer text-sm transition-colors ${activePageId === page.id ? 'bg-violet-500/20 text-violet-200' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
            >
              <div className="flex items-center gap-2 truncate">
                {page.isHomepage ? <Home className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                <span className="truncate">{page.title}</span>
                <span className="text-[10px] text-zinc-600 truncate ml-1">{page.slug}</span>
              </div>
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-white" onClick={(e) => { e.stopPropagation(); setEditingPage(page); }}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-red-400" onClick={(e) => deletePage(page.id, e)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <NavigationEditor />
      
      {editingPage && (
        <PageSettingsModal 
          page={editingPage} 
          onClose={() => setEditingPage(null)} 
          onSave={(updates) => updatePage(editingPage.id, updates)} 
        />
      )}
    </div>
  );
}
