"use client";

import React, { useState } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "@/components/ui/button";
import BuilderCanvas from "./BuilderCanvas";
import SectionList from "./SectionList";
import ThemePanel from "./ThemePanel";
import AddSectionPanel from "./AddSectionPanel";
import ViewportSwitcher from "./ViewportSwitcher";
import PageManager from "./PageManager";
import CMSManager from "./CMSManager";
import { Undo, Redo, Save, Eye, Code, ChevronLeft, Download, Globe, Loader2 } from "lucide-react";
import { exportProjectAsZip } from "@/lib/export-project";

export default function VisualBuilder() {
  const { dirty, saving, lastSavedAt, undo, redo, previewMode, setPreviewMode, projectId, builderData } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<"pages" | "layers" | "add" | "cms">("pages");
  const [exporting, setExporting] = useState(false);

  const handleSave = async () => {
    const { builderData, projectId, setSaving, markSaved } = useBuilderStore.getState();
    if (!builderData || !projectId) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/builder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderData })
      });
      if (res.ok) {
        markSaved();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!projectId || !builderData) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/builder/export`);
      const json = await res.json();
      if (json.success && json.data) {
        await exportProjectAsZip({
          title: "My CraftSite Project",
          files: json.data
        });
      }
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Toolbar */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur flex items-center justify-between px-4 z-50 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={() => window.history.back()}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={undo}><Undo className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={redo}><Redo className="w-4 h-4" /></Button>
          </div>
          <span className="text-xs text-zinc-500">
            {saving ? "Saving..." : dirty ? "Unsaved changes" : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ViewportSwitcher />
        </div>

        <div className="flex items-center gap-2">
          <Button variant={previewMode ? "secondary" : "ghost"} size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button variant="ghost" size="sm">
            <Code className="w-4 h-4 mr-2" /> Code
          </Button>
          <div className="h-4 w-px bg-zinc-800 mx-2" />
          <Button variant="default" size="sm" onClick={handleSave} disabled={!dirty || saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />} 
            {exporting ? "Exporting..." : "Export"}
          </Button>
          <Button variant="default" size="sm" className="bg-violet-600 hover:bg-violet-500 text-white">
            <Globe className="w-4 h-4 mr-2" /> Publish
          </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        {!previewMode && (
          <aside className="w-72 border-r border-zinc-800 bg-zinc-900/30 flex flex-col shrink-0">
            <div className="flex border-b border-zinc-800 p-2 gap-1 overflow-x-auto">
              <Button 
                variant={activeTab === "pages" ? "secondary" : "ghost"} 
                className="flex-shrink-0 justify-center text-xs px-2" 
                size="sm"
                onClick={() => setActiveTab("pages")}
              >
                Pages
              </Button>
              <Button 
                variant={activeTab === "layers" ? "secondary" : "ghost"} 
                className="flex-shrink-0 justify-center text-xs px-2" 
                size="sm"
                onClick={() => setActiveTab("layers")}
              >
                Layers
              </Button>
              <Button 
                variant={activeTab === "add" ? "secondary" : "ghost"} 
                className="flex-shrink-0 justify-center text-xs px-2" 
                size="sm"
                onClick={() => setActiveTab("add")}
              >
                Add
              </Button>
              <Button 
                variant={activeTab === "cms" ? "secondary" : "ghost"} 
                className="flex-shrink-0 justify-center text-xs px-2" 
                size="sm"
                onClick={() => setActiveTab("cms")}
              >
                CMS
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {activeTab === "pages" && <PageManager />}
              {activeTab === "layers" && <SectionList />}
              {activeTab === "add" && <AddSectionPanel />}
              {activeTab === "cms" && <CMSManager />}
            </div>
          </aside>
        )}

        {/* Center Canvas */}
        <section className="flex-1 bg-zinc-950 relative overflow-hidden flex items-center justify-center p-4">
          <BuilderCanvas />
        </section>

        {/* Right Sidebar */}
        {!previewMode && (
          <aside className="w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col overflow-y-auto shrink-0">
            <ThemePanel />
          </aside>
        )}
      </main>
    </div>
  );
}
