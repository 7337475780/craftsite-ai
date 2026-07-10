"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet, apiPatch, apiDelete } from "../../../../lib/api-client";
import { Workspace } from "../../../../types/workspace";
import { useWorkspace } from "../../../../components/providers/WorkspaceProvider";
import { useRealtime } from "../../../../components/providers/RealtimeProvider";
import { Trash2, AlertTriangle, Save } from "lucide-react";

export default function WorkspaceSettings() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { activeWorkspaceRole, refreshWorkspaces } = useWorkspace();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const { addToast } = useRealtime();

  const fetchWorkspace = async () => {
    try {
      const data = await apiGet(`/api/workspaces/${workspaceId}`);
      setWorkspace(data);
      setName(data.name);
      setDescription(data.description || "");
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, [workspaceId]);

  if (!workspace) return null;

  const canManage = activeWorkspaceRole === "owner" || activeWorkspaceRole === "admin";
  const isOwner = activeWorkspaceRole === "owner";

  if (!canManage) {
    return (
      <div className="p-8 text-center text-zinc-400">
        You do not have permission to view workspace settings.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPatch(`/api/workspaces/${workspaceId}`, { name, description });
      await refreshWorkspaces();
      addToast({ title: "Settings Saved", message: "Workspace settings updated successfully.", type: "success" });
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to save settings.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== workspace.name) return;
    try {
      await apiDelete(`/api/workspaces/${workspaceId}`);
      await refreshWorkspaces();
      localStorage.setItem("craftsite_active_workspace", "personal");
      router.push("/workspaces");
      addToast({ title: "Workspace Deleted", message: "The workspace has been deleted.", type: "success" });
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to delete workspace.", type: "error" });
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6">General Settings</h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Workspace Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none h-24"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {isOwner && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">Danger Zone</h2>
              <p className="text-zinc-400 text-sm mb-6">
                Deleting a workspace is permanent and cannot be undone. All projects, members, and data associated with this workspace will be permanently deleted.
              </p>
              
              <div className="bg-black/50 border border-red-500/20 rounded-xl p-4 space-y-4">
                <p className="text-sm font-medium text-red-200">
                  Please type <span className="font-bold text-white">{workspace.name}</span> to confirm.
                </p>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="w-full bg-black/50 border border-red-500/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
                  placeholder={workspace.name}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleDelete}
                    disabled={deleteConfirm !== workspace.name}
                    className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
