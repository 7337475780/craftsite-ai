"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet, apiDelete } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Loader2, Search, Trash2, Globe, ExternalLink } from "lucide-react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await apiGet(`/api/admin/projects?search=${encodeURIComponent(search)}`);
        if (res.success) {
          setProjects(res.data.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchProjects, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this project? This action cannot be undone.")) return;
    
    setIsDeletingId(id);
    try {
      const res = await apiDelete(`/api/admin/projects/${id}`);
      if (res.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        alert(res.message || "Failed to delete project");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete project");
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                Admin Directory
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Projects
              </h1>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search project titles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 size={32} className="animate-spin text-violet-600 dark:text-cyan-400" />
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-white/50 font-semibold">
                No projects found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-white/5 dark:text-white/40">
                    <tr>
                      <th className="px-6 py-4">Title / Owner</th>
                      <th className="px-6 py-4">Provider</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created At</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {projects.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white max-w-[250px] truncate">{p.title}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50 mt-1 max-w-[250px] truncate">{p.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-white/10 dark:text-white/60">
                            {p.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.isPublished ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              <Globe size={10} /> Published
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-white/30 text-[10px] font-bold uppercase">Private</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-white/50">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {p.isPublished && p.shareSlug && (
                              <a
                                href={`/share/${p.shareSlug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                                title="View Public Share"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(p.id)}
                              disabled={isDeletingId === p.id}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-500 transition hover:bg-red-100 hover:text-red-700 disabled:opacity-50 dark:bg-red-500/10 dark:hover:bg-red-500/20"
                              title="Delete Project"
                            >
                              {isDeletingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
