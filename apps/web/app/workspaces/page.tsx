"use client";

import { useState } from "react";
import { Plus, Users, ArrowRight } from "lucide-react";
import { useWorkspace } from "../../components/providers/WorkspaceProvider";
import { useRouter } from "next/navigation";

export default function WorkspacesPage() {
  const { workspaces, createWorkspace, loading } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ws = await createWorkspace(name, description);
    setIsModalOpen(false);
    router.push(`/workspaces/${ws.id}`);
  };

  if (loading) {
    return <div className="p-8 text-white">Loading workspaces...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              Team Workspaces
            </h1>
            <p className="text-zinc-400 mt-2">Collaborate with your team on shared projects.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Workspace
          </button>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <Users className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Workspaces Yet</h3>
            <p className="text-zinc-400 mb-6">You are not part of any team workspace yet.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 rounded-xl font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create your first workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <div
                key={ws.id}
                onClick={() => router.push(`/workspaces/${ws.id}`)}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:bg-white-[0.07]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-lg font-bold">
                    {ws.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-medium capitalize text-zinc-300">
                    {ws.currentUserRole}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-cyan-400 transition-colors">{ws.name}</h3>
                <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                  {ws.description || "No description provided."}
                </p>
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {ws._count?.members || 1}
                    </span>
                    <span>•</span>
                    <span>{ws._count?.projects || 0} projects</span>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Create Workspace</h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    placeholder="Acme Corp"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 resize-none h-24"
                    placeholder="A workspace for my awesome team."
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
