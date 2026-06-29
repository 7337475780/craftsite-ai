"use client";

import { AppShell } from "@/components/app/AppShell";
import { getSavedProjects, deleteProject } from "@/lib/projects-storage";
import { MigrationBanner } from "@/components/generate/MigrationBanner";
import type { SavedProject } from "@/types/project";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiGet, apiDelete } from "@/lib/api-client";
import {
  FolderOpen,
  Trash2,
  ExternalLink,
  Cpu,
  AlertTriangle,
  Wand2,
  Plus,
  Clock,
  Download,
  Globe,
} from "lucide-react";
import { exportProjectAsZip } from "@/lib/export-project";



function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.95, y: -8 },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      } catch (err) {
        console.warn("Cloud projects load failed, falling back to localStorage", err);
        setProjects(getSavedProjects());
      } finally {
        setIsLoaded(true);
      }
    }
    if (user) {
      load();
    }
  }, [user]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      const result = await apiDelete(`/api/projects/${id}`);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.warn("Cloud delete failed, attempting local delete", err);
      deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setDeletingId(null);
    }
  }, []);

  return (
    <ProtectedRoute>
      <AppShell>
      <div className="mx-auto max-w-7xl">

        {/* Page header */}
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.25em] text-violet-700 dark:text-cyan-300">
              Your workspace
            </p>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
              Saved{" "}
              <span className="gradient-text">Projects</span>
            </h1>
            <p className="mt-3 text-slate-500 dark:text-white/50">
              {isLoaded
                ? projects.length === 0
                  ? "No saved projects yet — generate one below."
                  : `${projects.length} project${projects.length !== 1 ? "s" : ""} saved`
                : "Loading…"}
            </p>
          </div>

          <Link
            href="/generate"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-[0_0_25px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
          >
            <Plus size={15} />
            New Generation
          </Link>
        </div>

        <MigrationBanner onMigrated={() => {
          window.location.reload();
        }} />

        {/* Empty state */}
        <AnimatePresence>
          {isLoaded && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/60 py-28 text-center backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.02]"
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-black/10 bg-white shadow-md dark:border-white/10 dark:bg-white/[0.06]">
                <FolderOpen size={32} className="text-slate-400 dark:text-white/30" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-white">
                No projects yet
              </h2>
              <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-white/40">
                Generate a website, then hit{" "}
                <span className="font-semibold text-violet-700 dark:text-violet-300">
                  Save Project
                </span>{" "}
                to keep it here.
              </p>
              <Link
                href="/generate"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
              >
                <Wand2 size={14} />
                Start Generating
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects grid */}
        {isLoaded && projects.length > 0 && (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
            className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  variants={cardVariants}
                  exit="exit"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  animate={deletingId === project.id ? { opacity: 0, scale: 0.93 } : { opacity: 1, scale: 1 }}
                  className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)] transition-shadow duration-300 hover:shadow-[0_16px_60px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)]"
                >
                  {/* Card top accent */}
                  <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-blue-500 opacity-70 group-hover:opacity-100 transition-opacity" />

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-6">
                    {/* Header row */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-300">
                        <Wand2 size={18} />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.isPublished && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/25 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
                            <Globe size={9} />
                            Published
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-base font-black leading-snug text-slate-950 dark:text-white">
                      {project.title}
                    </h3>

                    {/* Prompt preview */}
                    <p className="mb-5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-white/45">
                      {project.prompt}
                    </p>

                    {/* Date */}
                    <div className="mb-5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-white/30">
                      <Clock size={11} />
                      {formatDate(project.createdAt)}
                    </div>

                    {/* Divider */}
                    <div className="mb-4 h-px w-full bg-gradient-to-r from-transparent via-black/8 to-transparent dark:via-white/8" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:shadow-[0_8px_20px_rgba(124,58,237,0.4)] dark:border-violet-400/20"
                      >
                        <ExternalLink size={13} />
                        Open
                      </Link>
                      <button
                        onClick={() => exportProjectAsZip({
                          title: project.title,
                          prompt: project.prompt,
                          generatedCode: project.generatedCode
                        })}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-slate-50 text-slate-400 transition-all hover:border-violet-300/50 hover:bg-violet-50 hover:text-violet-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/30 dark:hover:border-violet-400/30 dark:hover:bg-violet-500/10 dark:hover:text-violet-400 cursor-pointer"
                        aria-label="Export project as ZIP"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-slate-50 text-slate-400 transition-all hover:border-red-300/50 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/30 dark:hover:border-red-400/30 dark:hover:bg-red-500/10 dark:hover:text-red-400 cursor-pointer"
                        aria-label="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </AppShell>
    </ProtectedRoute>
  );
}
