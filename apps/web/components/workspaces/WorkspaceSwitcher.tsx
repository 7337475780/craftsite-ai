"use client";

import { useState } from "react";
import { ChevronDown, Plus, User, Users } from "lucide-react";
import { useWorkspace } from "../providers/WorkspaceProvider";
import { useRouter } from "next/navigation";

export function WorkspaceSwitcher() {
  const { workspaces, activeWorkspaceId, activeWorkspace, setActiveWorkspaceId } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSelect = (id: string | null) => {
    setActiveWorkspaceId(id);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/10 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 transition-colors max-w-full"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
          {activeWorkspaceId ? <Users className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm font-medium text-slate-900 dark:text-white truncate flex-1 min-w-0 text-left">
          {activeWorkspaceId ? activeWorkspace?.name || "Workspace" : "Personal"}
        </span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-slate-500 dark:text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 p-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-900/10 dark:border-white/10 shadow-xl z-50">
          <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            Workspaces
          </div>
          
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors ${
              activeWorkspaceId === null 
                ? "bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white" 
                : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-slate-100 border border-slate-900/10 dark:bg-zinc-800 dark:border-white/10 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            </div>
            Personal
          </button>

          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors mt-1 ${
                activeWorkspaceId === ws.id 
                  ? "bg-slate-900/10 text-slate-900 dark:bg-white/10 dark:text-white" 
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{ws.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 truncate text-slate-900 dark:text-white">{ws.name}</div>
              <div className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/5 text-slate-600 dark:bg-white/10 dark:text-zinc-400 capitalize">
                {ws.currentUserRole}
              </div>
            </button>
          ))}

          <div className="h-px bg-slate-900/10 dark:bg-white/10 my-1 mx-2" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              router.push("/workspaces");
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-md border border-dashed border-slate-900/25 dark:border-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
            </div>
            Manage Workspaces
          </button>
        </div>
      )}
      
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
