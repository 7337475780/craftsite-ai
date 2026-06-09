"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiGet } from "@/lib/api-client";
import { Zap, Clock, CreditCard, Sparkles, Wand2 } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

type UsageLog = {
  id: string;
  action: string;
  credits: number;
  metadata: any;
  createdAt: string;
};

type UsageData = {
  credits: number;
  plan: string;
  recentUsage: UsageLog[];
};

export default function UsagePage() {
  const { user } = useAuth();
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await apiGet("/api/usage/me");
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || "Failed to load usage data");
        }
      } catch (err) {
        setError("Network error occurred while fetching usage.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(dateString));
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "generate_website":
        return <Sparkles size={14} />;
      case "edit_website":
      case "project_edit":
        return <Wand2 size={14} />;
      default:
        return <Zap size={14} />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "generate_website":
        return "Generated Website";
      case "edit_website":
        return "Preview Edit";
      case "project_edit":
        return "Applied AI Edit";
      default:
        return action;
    }
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Usage & Credits</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-white/45">
              Monitor your AI generation limits and credit history.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Credits Card */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Zap size={100} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-white/50 mb-2">
                  <Zap size={16} />
                  Available Credits
                </div>
                <div className="text-5xl font-black text-slate-950 dark:text-white">
                  {loading ? "..." : data?.credits}
                </div>
                <p className="mt-4 text-xs text-slate-400 dark:text-white/40">
                  Credits are consumed when generating or editing websites.
                </p>
              </div>
            </div>

            {/* Plan Card */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)]">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-white/50 mb-2">
                  <CreditCard size={16} />
                  Current Plan
                </div>
                <div className="text-3xl font-black capitalize text-slate-950 dark:text-white mb-2">
                  {loading ? "..." : data?.plan}
                </div>
                {data?.plan === "free" && (
                  <button className="mt-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Usage History */}
          <div className="rounded-[1.75rem] border border-black/10 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-950 dark:text-white">Recent Activity</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/40">
                <Clock size={12} />
                Last 10 actions
              </div>
            </div>

            <div className="p-0">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading history...</div>
              ) : error ? (
                <div className="p-8 text-center text-sm text-red-500">{error}</div>
              ) : data?.recentUsage.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-white/[0.03]">
                    <Zap size={20} className="text-slate-300 dark:text-white/20" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 dark:text-white/60">No usage history yet</p>
                  <p className="text-xs text-slate-400 dark:text-white/40 mt-1">
                    Your generated and edited projects will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {data?.recentUsage.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                          {getActionIcon(log.action)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-950 dark:text-white">
                            {getActionLabel(log.action)}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500 dark:text-white/40">
                            <span>{formatDate(log.createdAt)}</span>
                            {log.metadata?.provider && (
                              <>
                                <span>•</span>
                                <span className="capitalize">{log.metadata.provider}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 dark:border-red-400/10 dark:bg-red-500/10 dark:text-red-400">
                        -{log.credits}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
