"use client";

import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getSavedProjects } from "@/lib/projects-storage";
import type { SavedProject } from "@/types/project";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { apiGet } from "@/lib/api-client";
import Link from "next/link";
import {
  FolderOpen,
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  Wand2,
  Cpu,
  Plus,
  Globe,
  CreditCard,
  Zap
} from "lucide-react";

function formatDate(iso: string | undefined): string {
  if (!iso) return "No projects saved yet";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const result = await apiGet("/api/projects");
        if (result.success) {
          setProjects(result.data);
        } else {
          setProjects(getSavedProjects());
        }
        
        const summaryResult = await apiGet("/api/analytics/summary");
        if (summaryResult.success) {
          setSummary(summaryResult.data);
        }
      } catch (err) {
        console.warn("Cloud dashboard load failed, falling back to localStorage", err);
        setProjects(getSavedProjects());
      } finally {
        setIsLoaded(true);
      }
    }
    if (user) {
      load();
    }
  }, [user]);

  const totalProjects = projects.length;
  const latestProject = projects[0];

  const stats = [
    { label: "Generations", value: isLoaded ? (summary?.totalGenerations || 0) : "...", icon: Sparkles },
    { label: "Published", value: isLoaded ? (summary?.totalPublished || 0) : "...", icon: Globe },
    { label: "AI Edits", value: isLoaded ? (summary?.totalEdits || 0) : "...", icon: Wand2 },
    { label: "Saved Projects", value: isLoaded ? (summary?.totalProjectsCreated || 0) : "...", icon: FolderOpen },
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <ProtectedRoute>
      <AppShell>
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-700 dark:text-cyan-300">
              Dashboard
            </p>
            <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-5xl">
              Your creative <span className="gradient-text">command center</span>
            </h2>
          </div>

          <Link
            href="/generate"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] cursor-pointer"
          >
            <Plus size={15} />
            New Generation
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035]"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200">
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-black text-slate-950 dark:text-white truncate">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-white/45 uppercase tracking-wide">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Recent Projects Section */}
          <div className="rounded-[2rem] border border-black/10 bg-white/75 p-6 dark:border-white/10 dark:bg-white/[0.035]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-950 dark:text-white">
                Recent projects
              </h3>
              {totalProjects > 3 && (
                <Link
                  href="/projects"
                  className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700 dark:text-cyan-400 dark:hover:text-cyan-300 cursor-pointer"
                >
                  View all
                  <ArrowRight size={12} />
                </Link>
              )}
            </div>

            {isLoaded && recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                  <FolderOpen size={20} className="text-slate-400 dark:text-white/30" />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-white/50">
                  No projects generated yet
                </p>
                <p className="mt-1 text-xs text-slate-400 dark:text-white/30 max-w-xs">
                  Create a new design to see it here and track your history.
                </p>
                <Link
                  href="/generate"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-violet-600/10 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-600/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20 cursor-pointer"
                >
                  <Wand2 size={12} />
                  Start Building
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white/65 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-950 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                          {project.title}
                        </span>
                        {project.isFallback ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-orange-400/20 bg-orange-500/10 px-2 py-0.5 text-[9px] font-bold text-orange-400 uppercase tracking-wide">
                            Fallback
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wide">
                            <Cpu size={8} />
                            {project.provider === "openrouter" ? "OpenRouter" : "Gemini"}
                          </span>
                        )}
                        {project.isPublished && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/20 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-400 uppercase tracking-wide">
                            <Globe size={8} />
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-white/45 truncate">
                        {project.prompt}
                      </p>
                    </div>

                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:shadow-[0_4px_12px_rgba(124,58,237,0.3)] dark:border-violet-500/10 cursor-pointer w-fit"
                    >
                      Open
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Plan & Usage Side Card */}
          <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-gradient-to-br from-violet-600 via-purple-700 to-blue-600 p-6 text-white shadow-[0_0_60px_rgba(124,58,237,0.3)] dark:border-violet-400/20 flex flex-col">
            {/* Glow blobs */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/25 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-violet-800/40 blur-2xl" />
            
            <div className="relative z-10 flex items-center justify-between">
              <h3 className="text-xl font-black">Plan & Usage</h3>
              <div className="flex h-8 items-center rounded-full bg-white/20 px-3 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                {user?.plan || "Free"}
              </div>
            </div>

            <div className="relative z-10 mt-6 flex-1 space-y-4">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-cyan-300" />
                  <span className="text-sm font-bold text-white/90">Credits Remaining</span>
                </div>
                <span className="text-lg font-black">{user?.credits ?? "..."}</span>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs text-white/80 leading-relaxed">
                  Generate beautiful websites and edit them using your AI credits. Upgrade to unlock more credits and premium features.
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-6 grid grid-cols-2 gap-3">
              {user?.plan === "free" ? (
                <Link
                  href="/pricing"
                  className="flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 hover:shadow-lg"
                >
                  Upgrade
                </Link>
              ) : (
                <Link
                  href="/pricing"
                  className="flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-violet-700 transition hover:bg-violet-50 hover:shadow-lg"
                >
                  View Plans
                </Link>
              )}
              <Link
                href="/billing"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <CreditCard size={14} />
                Billing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
    </ProtectedRoute>
  );
}
