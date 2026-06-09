"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { 
  Users, 
  FolderOpen, 
  Globe, 
  Sparkles, 
  Wand2, 
  Download, 
  Eye, 
  Activity,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await apiGet("/api/admin/overview");
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin overview", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <AdminGuard>
        <AppShell>
          <div className="flex h-full min-h-[60vh] items-center justify-center">
            <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
          </div>
        </AppShell>
      </AdminGuard>
    );
  }

  const metrics = [
    { label: "Total Users", value: data?.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Projects", value: data?.totalProjects, icon: FolderOpen, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Published Projects", value: data?.totalPublishedProjects, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "AI Generations", value: data?.totalGenerations, icon: Sparkles, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "AI Edits", value: data?.totalEdits, icon: Wand2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "ZIP Exports", value: data?.totalExports, icon: Download, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Share Views", value: data?.totalShareViews, icon: Eye, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Total Usage Events", value: data?.totalUsageLogs, icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
              Platform Administration
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Admin Overview
            </h1>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                  <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${m.bg} ${m.color}`}>
                    <Icon size={24} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{m.value ?? "0"}</p>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-white/50">{m.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Recent Users */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Users</h3>
                <Link href="/admin/users" className="text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400">View All</Link>
              </div>
              <div className="space-y-4">
                {data?.recentUsers?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 font-bold">
                        {u.name?.charAt(0) || u.email.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.name || "No Name"}</p>
                        <p className="text-xs text-slate-500 dark:text-white/50">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500 dark:bg-white/10 dark:text-white/50">
                        {u.plan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Projects */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Recent Projects</h3>
                <Link href="/admin/projects" className="text-sm font-bold text-violet-600 hover:text-violet-700 dark:text-violet-400">View All</Link>
              </div>
              <div className="space-y-4">
                {data?.recentProjects?.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{p.title}</p>
                      <p className="text-xs text-slate-500 dark:text-white/50">{p.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {p.isPublished && (
                        <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                          Published
                        </span>
                      )}
                      <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                        {p.provider}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
