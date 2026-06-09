"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PublicWebsitePreview } from "@/components/share/PublicWebsitePreview";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { apiGetPublic } from "@/lib/api-client";
import type { PublicProject } from "@/types/project";
import {
  Globe,
  Loader2,
  AlertTriangle,
  Wand2,
  ExternalLink,
  Cpu,
} from "lucide-react";

function formatPublishedDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function SharePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [project, setProject] = useState<PublicProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function load() {
      try {
        const result = await apiGetPublic(`/api/public/projects/${slug}`);
        if (result.success && result.data) {
          setProject(result.data);
        } else {
          setIsNotFound(true);
        }
      } catch {
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [slug]);

  const providerLabel =
    project?.provider === "openrouter"
      ? "OpenRouter"
      : project?.provider === "gemini"
        ? "Gemini Flash"
        : "AI";

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="flex h-screen flex-col items-center justify-center bg-slate-950">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 shadow-[0_0_40px_rgba(124,58,237,0.4)]">
          <Globe size={28} className="text-white" />
        </div>
        <Loader2 size={28} className="animate-spin text-violet-400" />
        <p className="mt-4 text-sm text-white/50">Loading published website…</p>
      </main>
    );
  }

  // ── Not Found ────────────────────────────────────────────────────────────
  if (isNotFound || !project) {
    return (
      <main className="flex h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 max-w-md"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg">
            <AlertTriangle size={32} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white">Page not found</h1>
            <p className="mt-3 text-base leading-7 text-white/50">
              This project may have been unpublished or the link might be invalid.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-violet-500/40"
          >
            <Wand2 size={14} />
            Build your own website
          </Link>
        </motion.div>
      </main>
    );
  }

  // ── Published Page ────────────────────────────────────────────────────────
  return (
    <main className="flex h-[100dvh] flex-col bg-slate-950 overflow-hidden">
      {/* ── Public Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative flex-none border-b border-white/[0.08] bg-slate-950/95 backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
          {/* Left: CraftSite branding */}
          <div className="flex items-center gap-4">
            <CraftSiteLogo />
            <div className="hidden h-4 w-px bg-white/15 sm:block" />
            <div className="hidden items-center gap-1.5 sm:flex">
              <Globe size={12} className="text-emerald-400" />
              <span className="text-xs font-semibold text-white/50">Published site</span>
            </div>
          </div>

          {/* Center: project info */}
          <div className="hidden min-w-0 flex-1 max-w-sm md:block">
            <p className="truncate text-center text-sm font-bold text-white/80">
              {project.title}
            </p>
            {project.publishedAt && (
              <p className="text-center text-[10px] text-white/35">
                Published {formatPublishedDate(project.publishedAt)}
              </p>
            )}
          </div>

          {/* Right: CTA */}
          <div className="flex items-center gap-3">
            {/* Provider badge */}
            <AnimatePresence>
              {!project.isFallback && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 sm:flex"
                >
                  <Cpu size={10} />
                  {providerLabel}
                </motion.span>
              )}
            </AnimatePresence>

            <Link
              href="/generate"
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition hover:scale-[1.03] hover:shadow-violet-500/35 hover:shadow-lg"
            >
              <Wand2 size={12} />
              Build your own
              <ExternalLink size={11} className="opacity-70" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Preview Area ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative flex-1 min-h-0"
      >
        <PublicWebsitePreview code={project.generatedCode} />
      </motion.div>

      {/* ── Footer bar ── */}
      <div className="flex-none border-t border-white/[0.06] bg-slate-950/80 px-5 py-2.5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="text-[11px] text-white/30">
            Built with{" "}
            <span className="font-bold text-violet-400">CraftSite AI</span>
          </p>
          <Link
            href="/generate"
            className="text-[11px] font-semibold text-white/40 transition hover:text-violet-300"
          >
            Create your own →
          </Link>
        </div>
      </div>
    </main>
  );
}
