"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet, apiPost } from "@/lib/api-client";
import { useEffect, useState } from "react";
import {
  Cpu,
  CheckCircle2,
  XCircle,
  Play,
  Loader2,
  Info,
  Clock,
  Settings,
  AlertTriangle,
} from "lucide-react";

export default function AdminAiSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; code?: string }>>({});

  const fetchHealth = async () => {
    try {
      const res = await apiGet("/api/generate/provider-health");
      if (res) {
        setConfig(res);
      }
    } catch (err) {
      console.error("Failed to fetch provider health:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleTestProvider = async (provider: string) => {
    setTestingProvider(provider);
    try {
      const res = await apiPost("/api/generate/test-provider", { provider });
      if (res.success) {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { success: true, message: res.message, code: res.data?.generatedCode },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [provider]: { success: false, message: res.message || "Verification failed" },
        }));
      }
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { success: false, message: err.message || "Network error" },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

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

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
              Platform Administration
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              AI Provider Registry & Fallbacks
            </h1>
            <p className="mt-2 text-slate-500 dark:text-white/50 text-sm">
              View configuration health, models chains, and directly test provider keys connections securely.
            </p>
          </div>

          {/* Settings Overview Card */}
          <div className="mb-8 rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 dark:text-cyan-400">
                <Settings size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Active Orchestrator Settings</h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">AI Provider Setting</p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white capitalize">{config?.defaultProvider || "auto"}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Fallback Mode (Chain)</p>
                <p className="mt-1 text-lg font-black text-slate-900 dark:text-white capitalize">{config?.defaultMode || "balanced"}</p>
              </div>
              <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Safe Fallback Policy</p>
                <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                  {config?.allowMockFallback ? (
                    <span className="text-emerald-500 flex items-center gap-1.5"><CheckCircle2 size={16} /> Allowed</span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1.5"><AlertTriangle size={16} /> Restricted</span>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-black/5 bg-slate-50/50 p-4 dark:border-white/5 dark:bg-white/[0.02]">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">Timeouts & Retries</p>
                <div className="mt-1 text-sm font-bold text-slate-700 dark:text-white/70 flex items-center gap-1">
                  <Clock size={14} /> Req: {config?.requestTimeoutMs / 1000}s | Edit: {config?.editTimeoutMs / 1000}s
                </div>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {config?.providers?.map((provider: any) => {
              const result = testResults[provider.name];
              const isTesting = testingProvider === provider.name;

              return (
                <div
                  key={provider.name}
                  className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white capitalize flex items-center gap-2">
                          <Cpu size={18} className="text-slate-400" />
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Active Model: <span className="font-semibold text-slate-700 dark:text-white/80">{provider.activeModel || "None"}</span>
                        </p>
                      </div>

                      {/* Status badge */}
                      {provider.configured ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          <CheckCircle2 size={12} /> Configured
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 dark:bg-white/5 dark:text-white/40">
                          <XCircle size={12} /> Unconfigured
                        </span>
                      )}
                    </div>

                    {/* Fallback chain indicator */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-wider mb-1.5">Availability in Mode Chain</p>
                      {provider.availableInChain ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          Active - Orchestrator will query this model
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 dark:text-white/30 flex items-center gap-1">
                          Inactive - Skipped by default
                        </span>
                      )}
                    </div>

                    {/* Fallback models list */}
                    {provider.fallbackModels?.length > 0 && (
                      <div className="mb-4 rounded-xl border border-black/5 bg-slate-50/50 p-3 dark:border-white/5 dark:bg-white/[0.02]">
                        <p className="text-[11px] font-bold text-slate-400 dark:text-white/30 uppercase mb-1">Fallback Queue</p>
                        <div className="flex flex-wrap gap-1">
                          {provider.fallbackModels.map((m: string) => (
                            <span key={m} className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-white/5 dark:text-slate-400">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Test Feedback */}
                  <div className="mt-4 border-t border-black/5 pt-4 dark:border-white/5">
                    <button
                      onClick={() => handleTestProvider(provider.name)}
                      disabled={isTesting || !provider.configured}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 cursor-pointer transition hover:scale-[1.01]"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" /> Verification Running...
                        </>
                      ) : (
                        <>
                          <Play size={12} /> Test Connection
                        </>
                      )}
                    </button>

                    {result && (
                      <div className={`mt-3 rounded-xl border p-3 text-xs ${
                        result.success
                          ? "border-emerald-500/20 bg-emerald-50/50 text-emerald-800 dark:border-emerald-500/10 dark:bg-emerald-500/5 dark:text-emerald-300"
                          : "border-red-500/20 bg-red-50/50 text-red-800 dark:border-red-500/10 dark:bg-red-500/5 dark:text-red-300"
                      }`}>
                        <div className="flex items-start gap-1.5">
                          <Info size={14} className="mt-0.5 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold">{result.success ? "Connection OK" : "Connection Failed"}</p>
                            <p className="mt-0.5 leading-relaxed opacity-90">{result.message}</p>
                            {result.code && (
                              <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-2 text-[10px] text-slate-600 dark:bg-black/40 dark:text-slate-400 max-h-24">
                                {result.code}
                              </pre>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
