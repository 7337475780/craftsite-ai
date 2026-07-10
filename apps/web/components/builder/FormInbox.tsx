"use client";

import React, { useState, useEffect } from "react";
import { useBuilderStore } from "@/stores/builder-store";
import { Button } from "../ui/button";
import { Mail, Trash2, Eye, Archive, RotateCcw, Clock } from "lucide-react";

type Submission = {
  id: string;
  formId: string;
  data: Record<string, any>;
  visitorIp: string | null;
  userAgent: string | null;
  status: "new" | "read" | "archived";
  createdAt: string;
};

const statusConfig = {
  new: { label: "New", color: "text-violet-400 bg-violet-500/10 border-violet-500/30" },
  read: { label: "Read", color: "text-zinc-400 bg-zinc-800 border-zinc-700" },
  archived: { label: "Archived", color: "text-zinc-600 bg-zinc-900 border-zinc-800" },
};

function timeAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function FormInbox() {
  const { projectId } = useBuilderStore();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "archived">("all");

  useEffect(() => {
    if (!projectId) return;
    fetchSubmissions();
  }, [projectId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/forms`);
      const json = await res.json();
      if (json.success) setSubmissions(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/forms/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? json.data : s)));
        if (selected?.id === id) setSelected(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Delete this submission permanently?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openSubmission = (s: Submission) => {
    setSelected(s);
    if (s.status === "new") updateStatus(s.id, "read");
  };

  const filtered = submissions.filter((s) => filter === "all" || s.status === filter);
  const newCount = submissions.filter((s) => s.status === "new").length;

  if (selected) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white px-2" onClick={() => setSelected(null)}>
            ← Back
          </Button>
          <span className="text-xs text-zinc-500 truncate">Form: {selected.formId}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-[10px] text-zinc-500">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {timeAgo(selected.createdAt)}</span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] ${statusConfig[selected.status].color}`}>
              {statusConfig[selected.status].label}
            </span>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
            {Object.entries(selected.data as Record<string, any>).map(([key, val]) => (
              <div key={key}>
                <label className="text-[10px] uppercase tracking-wider text-zinc-500">{key}</label>
                <p className="text-xs text-zinc-200 mt-0.5 break-words">{String(val)}</p>
              </div>
            ))}
          </div>

          {selected.visitorIp && (
            <p className="text-[10px] text-zinc-600">IP: {selected.visitorIp}</p>
          )}
        </div>

        <div className="flex gap-2 pt-4 border-t border-zinc-800 mt-4">
          {selected.status !== "archived" && (
            <Button variant="outline" size="sm" className="flex-1 text-xs border-zinc-700 gap-1.5" onClick={() => updateStatus(selected.id, "archived")}>
              <Archive className="w-3 h-3" /> Archive
            </Button>
          )}
          {selected.status === "archived" && (
            <Button variant="outline" size="sm" className="flex-1 text-xs border-zinc-700 gap-1.5" onClick={() => updateStatus(selected.id, "read")}>
              <RotateCcw className="w-3 h-3" /> Restore
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 gap-1.5" onClick={() => deleteSubmission(selected.id)}>
            <Trash2 className="w-3 h-3" /> Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
          Form Inbox
          {newCount > 0 && (
            <span className="bg-violet-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{newCount}</span>
          )}
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-white" onClick={fetchSubmissions}>
          <RotateCcw className="w-3 h-3" />
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3 bg-zinc-900/50 p-1 rounded-lg">
        {(["all", "new", "read", "archived"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 text-[10px] py-1 rounded capitalize transition-colors ${
              filter === f ? "bg-zinc-700 text-white font-semibold" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5">
        {loading ? (
          <div className="text-xs text-zinc-500 text-center py-8">Loading submissions…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-600 border-2 border-dashed border-zinc-800 rounded-lg">
            <Mail className="w-8 h-8" />
            <p className="text-xs text-center">No submissions yet.<br />Form responses will appear here.</p>
          </div>
        ) : (
          filtered.map((s) => (
            <div
              key={s.id}
              className={`group flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                s.status === "new"
                  ? "border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10"
                  : "border-zinc-800/60 bg-zinc-900/20 hover:bg-zinc-800/30"
              }`}
              onClick={() => openSubmission(s)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  {s.status === "new" && <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />}
                  <span className="text-xs font-medium text-zinc-200 truncate">Form: {s.formId.slice(0, 20)}</span>
                </div>
                <p className="text-[10px] text-zinc-500 truncate">
                  {Object.values(s.data as any).slice(0, 2).join(" · ")}
                </p>
                <p className="text-[10px] text-zinc-700 mt-0.5">{timeAgo(s.createdAt)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); deleteSubmission(s.id); }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
