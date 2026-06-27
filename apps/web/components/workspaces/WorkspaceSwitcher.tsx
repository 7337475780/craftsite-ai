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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
      >
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
          {activeWorkspaceId ? <Users className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className="text-sm font-medium text-white truncate max-w-[120px]">
          {activeWorkspaceId ? activeWorkspace?.name || "Workspace" : "Personal"}
        </span>
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 p-1 rounded-xl bg-zinc-900 border border-white/10 shadow-xl z-50">
          <div className="px-2 py-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Workspaces
          </div>
          
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors ${
              activeWorkspaceId === null ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="w-6 h-6 rounded-md bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            Personal
          </button>

          {workspaces.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left transition-colors mt-1 ${
                activeWorkspaceId === ws.id ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">{ws.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 truncate">{ws.name}</div>
              <div className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 capitalize">
                {ws.currentUserRole}
              </div>
            </button>
          ))}

          <div className="h-px bg-white/10 my-1 mx-2" />
          
          <button
            onClick={() => {
              setIsOpen(false);
              router.push("/workspaces");
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-left text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
          >
            <div className="w-6 h-6 rounded-md border border-dashed border-white/20 flex items-center justify-center shrink-0">
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
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
