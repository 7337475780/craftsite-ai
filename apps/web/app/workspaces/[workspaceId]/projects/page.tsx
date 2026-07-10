"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiDelete } from "../../../../lib/api-client";
import { useWorkspace } from "../../../../components/providers/WorkspaceProvider";
import { useRealtime } from "../../../../components/providers/RealtimeProvider";
import { ConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { SavedProject } from "../../../../types/project";
import { FolderKanban, Plus, MoreVertical, Trash2 } from "lucide-react";

export default function WorkspaceProjects() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { activeWorkspaceRole } = useWorkspace();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const router = useRouter();
  const { addToast } = useRealtime();

  const fetchProjects = async () => {
    try {
      const data = await apiGet(`/api/workspaces/${workspaceId}/projects`);
      setProjects(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [workspaceId]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      await apiDelete(`/api/workspaces/${workspaceId}/projects/${projectToDelete}`);
      fetchProjects();
      setProjectToDelete(null);
      addToast({ title: "Project Deleted", message: "The project has been deleted.", type: "success" });
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to delete project.", type: "error" });
      setProjectToDelete(null);
    }
  };

  const canManage = activeWorkspaceRole === "owner" || activeWorkspaceRole === "admin";
  const canEdit = canManage || activeWorkspaceRole === "editor";

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Projects</h2>
        {canEdit && (
          <button
            onClick={() => {
              localStorage.setItem("craftsite_active_workspace", workspaceId);
              router.push("/generate");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <FolderKanban className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Projects Yet</h3>
          <p className="text-zinc-400 mb-6">Create the first project in this workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
              <div className="aspect-video bg-zinc-900 border-b border-white/10 flex items-center justify-center p-4">
                <FolderKanban className="w-10 h-10 text-zinc-600" />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-cyan-400 transition-colors">{project.title}</h3>
                  {canManage && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setProjectToDelete(project.id);
                      }}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-4 flex-1">
                  {project.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    {project.user?.image ? (
                      <img src={project.user.image} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-zinc-700" />
                    )}
                    <span className="truncate max-w-[100px]">{project.user?.name || "Unknown"}</span>
                  </div>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!projectToDelete}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete Project"
        onConfirm={handleDelete}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
