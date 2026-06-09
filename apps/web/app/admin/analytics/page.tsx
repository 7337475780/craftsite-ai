"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Loader2, Activity, Zap } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await apiGet("/api/admin/analytics");
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin analytics", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
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

  const events = data?.events || [];
  const activeUsers = data?.activeUsers || [];

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
              Platform Administration
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Analytics
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Events Breakdown */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  <Activity size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Event Distribution</h3>
              </div>
              
              <div className="space-y-4">
                {events.map((ev: any) => (
                  <div key={ev.event} className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {ev.event.replace(/_/g, " ")}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-white/50">
                      {ev._count.id} events
                    </span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-white/50">No events recorded yet.</p>
                )}
              </div>
            </div>

            {/* Top Active Users */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  <Zap size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Most Active Users</h3>
              </div>
              
              <div className="space-y-4">
                {activeUsers.map((u: any, idx: number) => (
                  <div key={u.email} className="flex items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4 dark:border-white/5 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-white/60">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{u.name || "Unknown"}</p>
                        <p className="text-xs text-slate-500 dark:text-white/50">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-violet-600 dark:text-cyan-400">{u.eventCount}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-white/30">Actions</p>
                    </div>
                  </div>
                ))}
                {activeUsers.length === 0 && (
                  <p className="text-sm text-slate-500 dark:text-white/50">No active users yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
