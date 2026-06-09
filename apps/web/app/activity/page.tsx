"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/app/AppShell";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { Loader2, Activity as ActivityIcon } from "lucide-react";

type AnalyticsEvent = {
  id: string;
  event: string;
  metadata: any;
  createdAt: string;
};

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ActivityPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      try {
        const res = await apiGet("/api/analytics/me");
        if (res.success) {
          setEvents(res.data);
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadActivity();
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-4xl px-2 pb-20 pt-8">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <ActivityIcon size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Activity Log
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-white/60">
                Your recent actions across CraftSite.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/70 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 size={32} className="animate-spin text-violet-600 dark:text-cyan-400" />
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-white/50">
                No activity found yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {events.map((ev, i) => (
                  <div
                    key={ev.id}
                    className={`flex items-center justify-between p-6 ${
                      i !== events.length - 1 ? "border-b border-black/5 dark:border-white/5" : ""
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {ev.event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-white/50">
                        {ev.metadata ? JSON.stringify(ev.metadata) : "No metadata"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 dark:text-white/40">
                        {formatRelativeDate(ev.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
