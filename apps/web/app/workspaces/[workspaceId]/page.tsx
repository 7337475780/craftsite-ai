"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "../../../lib/api-client";
import { Workspace } from "../../../types/workspace";
import { Users, FolderKanban, Activity } from "lucide-react";
import Link from "next/link";

export default function WorkspaceOverview() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchWorkspace() {
      try {
        const data = await apiGet(`/api/workspaces/${workspaceId}`);
        setWorkspace(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchWorkspace();
  }, [workspaceId]);

  if (!workspace) return null;

  return (
    <div className="space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-2">Welcome to {workspace.name}</h2>
        <p className="text-zinc-400 max-w-2xl">
          {workspace.description || "This is your team's shared workspace. Create and collaborate on projects together."}
        </p>
        
        {workspace.currentUserRole === "viewer" && (
          <div className="mt-6 inline-block bg-white/10 text-zinc-300 px-4 py-2 rounded-xl text-sm font-medium">
            You are a viewer in this workspace. You can view projects but cannot edit them.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/workspaces/${workspaceId}/projects`} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
          <FolderKanban className="w-8 h-8 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold mb-1">{workspace._count?.projects || 0}</h3>
          <p className="text-zinc-400 text-sm">Total Projects</p>
        </Link>
        
        <Link href={`/workspaces/${workspaceId}/members`} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
          <Users className="w-8 h-8 text-violet-400 mb-4" />
          <h3 className="text-xl font-bold mb-1">{workspace._count?.members || 1}</h3>
          <p className="text-zinc-400 text-sm">Team Members</p>
        </Link>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <Activity className="w-8 h-8 text-emerald-400 mb-4" />
          <h3 className="text-xl font-bold mb-1">Active</h3>
          <p className="text-zinc-400 text-sm">Workspace Status</p>
        </div>
      </div>
      
      {workspace.currentUserRole !== "viewer" && (
        <div className="mt-8 flex justify-end">
          <Link
            href="/generate"
            onClick={() => localStorage.setItem("craftsite_active_workspace", workspaceId)}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Create New Project
          </Link>
        </div>
      )}
    </div>
  );
}
