import React, { useState } from "react";
import { BuilderPage } from "@craftsite/shared";
import { Button } from "../ui/button";

interface PageSettingsModalProps {
  page: BuilderPage;
  onClose: () => void;
  onSave: (updates: Partial<BuilderPage>) => void;
}

export default function PageSettingsModal({ page, onClose, onSave }: PageSettingsModalProps) {
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [seoTitle, setSeoTitle] = useState(page.seoMetadata?.title || "");
  const [seoDescription, setSeoDescription] = useState(page.seoMetadata?.description || "");

  const handleSave = () => {
    onSave({
      title,
      slug,
      seoMetadata: {
        ...(page.seoMetadata || {}),
        title: seoTitle,
        description: seoDescription,
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-white">Page Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full hover:bg-zinc-800">
            <span className="text-zinc-400">×</span>
          </Button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="text-zinc-300 mb-1 block text-sm">Page Title</label>
            <input 
              type="text"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="w-full bg-zinc-950 border border-zinc-800 text-white h-10 px-3 rounded-md focus:outline-none focus:border-zinc-600" 
            />
          </div>
          <div>
            <label className="text-zinc-300 mb-1 block text-sm">URL Slug</label>
            <input 
              type="text"
              value={slug} 
              onChange={e => setSlug(e.target.value)} 
              disabled={page.isHome}
              className="w-full bg-zinc-950 border border-zinc-800 text-white h-10 px-3 rounded-md disabled:opacity-50 focus:outline-none focus:border-zinc-600" 
            />
            {page.isHome && <p className="text-xs text-zinc-500 mt-1">The home page slug cannot be changed.</p>}
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h3 className="font-medium text-sm text-zinc-300 mb-3">SEO Metadata</h3>
            <div className="space-y-4">
              <div>
                <label className="text-zinc-400 mb-1 block text-xs">Meta Title</label>
                <input 
                  type="text"
                  value={seoTitle} 
                  onChange={e => setSeoTitle(e.target.value)} 
                  placeholder={title}
                  className="w-full bg-zinc-950 border border-zinc-800 text-white h-8 px-2 text-sm rounded-md focus:outline-none focus:border-zinc-600" 
                />
              </div>
              <div>
                <label className="text-zinc-400 mb-1 block text-xs">Meta Description</label>
                <textarea 
                  value={seoDescription} 
                  onChange={e => setSeoDescription(e.target.value)} 
                  className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-md p-2 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-zinc-600"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-500 text-white">Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
