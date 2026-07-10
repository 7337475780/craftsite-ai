"use client";

import React, { useState, useEffect, useRef } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "../ui/button";
import { Upload, Trash2, Image as ImageIcon, FileText, Film, Copy, Check } from "lucide-react";

type MediaItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  createdAt: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function getIcon(type: string) {
  if (type.startsWith("image")) return <ImageIcon className="w-4 h-4" />;
  if (type.startsWith("video")) return <Film className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
}

export default function AssetLibrary() {
  const { projectId } = useBuilderStore();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!projectId) return;
    fetchMedia();
  }, [projectId]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/media`);
      const json = await res.json();
      if (json.success) setMedia(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;

    setUploading(true);
    try {
      // Read file as data URL (base64) — suitable for dev/demo
      // In production, swap this for a presigned S3/R2 upload
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch(`/api/projects/${projectId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          url: dataUrl,
          type: file.type || "application/octet-stream",
          size: file.size,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMedia((prev) => [json.data, ...prev]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this asset permanently?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/media/${id}`, { method: "DELETE" });
      if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-100">Asset Library</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-violet-400 hover:text-violet-300 gap-1.5"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-3 h-3" />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-8">Loading assets…</div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg">
            <ImageIcon className="w-8 h-8" />
            <p className="text-xs text-center">No assets yet.<br />Upload images, videos or documents.</p>
          </div>
        ) : (
          media.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 p-2 rounded-lg border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-800/40 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded overflow-hidden bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                {item.type.startsWith("image") ? (
                  <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-zinc-500">{getIcon(item.type)}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-200 truncate">{item.name}</p>
                <p className="text-[10px] text-zinc-600">{formatBytes(item.size)}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-green-400"
                  title="Copy URL"
                  onClick={() => copyUrl(item)}
                >
                  {copiedId === item.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-zinc-400 hover:text-red-400"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
