"use client";

import { LivePreview } from "@/components/generate/LivePreview";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api-client";
import {
  ArrowLeft,
  Code2,
  Loader2,
  Monitor,
  MonitorSmartphone,
  Palette,
  Wand2,
  Cpu,
  Copy,
  CheckCheck,
  Zap,
  Save,
  FolderOpen,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  getProjectById,
  updateProject,
  deleteProject,
  generateProjectTitle,
} from "@/lib/projects-storage";
import type { AIProviderName, SavedProject } from "@/types/project";

type GenerateResponse = {
  success: boolean;
  message: string;
  data?: {
    prompt: string;
    style: string;
    websiteType: string;
    generatedCode: string;
    provider: AIProviderName;
    isFallback: boolean;
  };
};

const STEPS = [
  "Analyzing your prompt...",
  "Designing the layout...",
  "Writing React components...",
  "Polishing styles...",
  "Spinning up the preview...",
];

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const [project, setProject] = useState<SavedProject | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("modern");
  const [websiteType, setWebsiteType] = useState("responsive");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [providerInfo, setProviderInfo] = useState<{
    provider: AIProviderName;
    isFallback: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSaved, setIsSaved] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load project from API on mount
  useEffect(() => {
    if (!id || !user) return;
    async function load() {
      try {
        const result = await apiGet(`/api/projects/${id}`);
        if (result.success) {
          const found = result.data;
          setProject(found);
          setPrompt(found.prompt);
          setGeneratedCode(found.generatedCode);
          setProviderInfo({
            provider: found.provider,
            isFallback: found.isFallback,
          });
          setIsSaved(true);
        } else {
          // Fallback to local
          const local = getProjectById(id);
          if (local) {
            setProject(local);
            setPrompt(local.prompt);
            setGeneratedCode(local.generatedCode);
            setProviderInfo({
              provider: local.provider,
              isFallback: local.isFallback,
            });
            setIsSaved(true);
          } else {
            setIsNotFound(true);
          }
        }
      } catch (err) {
        console.warn("Cloud project load failed, falling back to localStorage", err);
        const local = getProjectById(id);
        if (local) {
          setProject(local);
          setPrompt(local.prompt);
          setGeneratedCode(local.generatedCode);
          setProviderInfo({
            provider: local.provider,
            isFallback: local.isFallback,
          });
          setIsSaved(true);
        } else {
          setIsNotFound(true);
        }
      }
    }
    load();
  }, [id, user]);

  const isCompact = generatedCode.length > 0 || isGenerating;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleSave = useCallback(async () => {
    if (!id || !generatedCode || !providerInfo) return;
    setIsSaving(true);
    setError("");
    const title = generateProjectTitle(prompt);

    try {
      const result = await apiPatch(`/api/projects/${id}`, {
        title,
        prompt,
        generatedCode,
        provider: providerInfo.provider,
        isFallback: providerInfo.isFallback,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update project on cloud.");
      }

      setIsSaved(true);
      setSaveSuccess(true);
      setProject(result.data);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Cloud save failed, falling back to localStorage", err);
      const success = updateProject(id, {
        title,
        prompt,
        generatedCode,
        provider: providerInfo.provider,
        isFallback: providerInfo.isFallback,
        style,
        websiteType,
      });

      if (success) {
        setIsSaved(true);
        setSaveSuccess(true);
        setProject((prev) =>
          prev
            ? {
                ...prev,
                title,
                prompt,
                generatedCode,
                provider: providerInfo.provider,
                isFallback: providerInfo.isFallback,
                style,
                websiteType,
                updatedAt: new Date().toISOString(),
              }
            : null
        );
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError("Failed to save changes.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [id, generatedCode, prompt, providerInfo, style, websiteType]);

  const handleDelete = useCallback(async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this project?")) return;
    setIsDeleting(true);
    try {
      const result = await apiDelete(`/api/projects/${id}`);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete project");
      }
      setTimeout(() => {
        router.push("/projects");
      }, 500);
    } catch (err) {
      console.warn("Cloud delete failed, attempting local delete", err);
      deleteProject(id);
      setTimeout(() => {
        router.push("/projects");
      }, 500);
    }
  }, [id, router]);

  const handleGenerate = async () => {
    try {
      setError("");
      setProviderInfo(null);
      setLoadingStep(0);
      setIsSaved(false);

      if (prompt.trim().length < 10) {
        setError("Please enter at least 10 characters.");
        return;
      }

      setIsGenerating(true);

      const stepInterval = setInterval(() => {
        setLoadingStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      }, 1400);

      const result = (await apiPost("/api/generate", { prompt, style, websiteType })) as GenerateResponse;

      clearInterval(stepInterval);

      if (!result.success) {
        throw new Error(result.message || "Failed to generate website.");
      }

      setGeneratedCode(result.data?.generatedCode || "");
      if (result.data) {
        setProviderInfo({
          provider: result.data.provider,
          isFallback: result.data.isFallback,
        });
      }
      setViewMode("preview");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const providerLabel =
    providerInfo?.provider === "openrouter"
      ? "OpenRouter"
      : providerInfo?.provider === "gemini"
        ? "Gemini Flash"
        : "Safe Fallback";

  if (isNotFound) {
    return (
      <main className="flex h-screen flex-col items-center justify-center craftsite-bg p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04] mb-4">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
          Project Not Found
        </h1>
        <p className="text-slate-500 dark:text-white/50 mb-6 max-w-sm">
          The project you are trying to view does not exist or has been deleted.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
        >
          <FolderOpen size={14} />
          Back to Projects
        </Link>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex h-screen flex-col items-center justify-center craftsite-bg">
        <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
      </main>
    );
  }

  return (
    <ProtectedRoute>
      <main className="flex h-[100dvh] flex-col overflow-hidden craftsite-bg">
      {/* ── Premium Workspace Navbar ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="workspace-navbar relative flex-none px-4 py-3 z-50"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent dark:via-white/8" />

        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
          {/* Left: Back + Logo */}
          <div className="flex items-center gap-5">
            <Link
              href="/projects"
              className="group flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-violet-400/60 hover:bg-white hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white cursor-pointer"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              Projects
            </Link>
            <div className="h-5 w-px bg-gradient-to-b from-transparent via-black/15 to-transparent dark:via-white/15" />
            <CraftSiteLogo />
          </div>

          {/* Center breadcrumb */}
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-black/8 bg-slate-100/80 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/40">
              <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Workspace
            </div>
            <span className="text-xs text-slate-400 dark:text-white/25">/</span>
            <span className="max-w-[200px] truncate rounded-full border border-violet-400/20 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300">
              {project.title}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Provider badge */}
            <AnimatePresence>
              {providerInfo && !isGenerating && (
                <motion.div
                  key="provider"
                  initial={{ opacity: 0, scale: 0.85, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 12 }}
                  className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide sm:flex ${
                    providerInfo.isFallback
                      ? "border-orange-400/25 bg-orange-50 text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-300"
                      : "border-emerald-400/25 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                  }`}
                >
                  <Cpu size={11} />
                  {providerLabel}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Project button */}
            <AnimatePresence>
              {generatedCode && !isGenerating && (
                <motion.button
                  key="save"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  onClick={handleSave}
                  disabled={isSaved || isSaving}
                  className={`hidden items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all sm:flex cursor-pointer ${
                    saveSuccess
                      ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : isSaved
                        ? "border-black/10 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/30"
                        : "border-violet-400/30 bg-violet-50 text-violet-700 hover:border-violet-500/40 hover:bg-violet-100 hover:shadow-sm dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCheck size={12} className="text-emerald-500" />
                      Saved!
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-violet-600 dark:text-cyan-400" />
                      Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <Save size={12} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={12} />
                      Save Changes
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-red-400 dark:hover:bg-red-500/10 sm:flex cursor-pointer"
            >
              <Trash2 size={12} />
              Delete
            </button>

            {/* Copy code button */}
            <AnimatePresence>
              {generatedCode && !isGenerating && (
                <motion.button
                  key="copy"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleCopy}
                  className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-violet-400/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/10 sm:flex cursor-pointer"
                >
                  {copied ? (
                    <>
                      <CheckCheck size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      Copy Code
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* ── Main Workspace Body ── */}
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:p-5">
        {/* Left Command Panel */}
        <motion.div
          layout
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`flex flex-col gap-4 transition-all duration-500 ${
            isCompact
              ? "lg:w-[320px] xl:w-[380px]"
              : "mx-auto w-full max-w-2xl justify-center lg:w-[600px]"
          }`}
        >
          {/* Panel header */}
          <motion.div layout className="flex flex-col gap-1.5">
            <motion.h1
              layout
              className={`font-black tracking-tight text-slate-900 dark:text-white transition-all duration-300 ${
                isCompact ? "text-xl" : "text-3xl"
              }`}
            >
              Modify Project
            </motion.h1>
            <motion.p layout className="text-sm text-slate-500 dark:text-white/50">
              Refine your prompt or style preferences to update this site.
            </motion.p>
          </motion.div>

          {/* Input Card */}
          <motion.div
            layout
            className={`flex flex-col rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.1)] backdrop-blur-3xl transition-shadow duration-300 hover:shadow-[0_12px_50px_rgba(15,23,42,0.14)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_60px_rgba(0,0,0,0.4)] ${
              !isCompact ? "glow-border" : ""
            }`}
          >
            <div className="relative rounded-[1.5rem] p-5">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[1.5rem] bg-gradient-to-r from-transparent via-white to-transparent opacity-70" />

              {/* Status banners */}
              <AnimatePresence mode="popLayout">
                {providerInfo && !isGenerating && (
                  <motion.div
                    key="provider-banner"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className={`flex items-center gap-2 overflow-hidden rounded-xl border px-3.5 py-2.5 text-xs font-semibold ${
                      providerInfo.isFallback
                        ? "border-orange-400/25 bg-orange-50 text-orange-700 dark:border-orange-400/20 dark:bg-orange-500/10 dark:text-orange-300"
                        : "border-emerald-400/25 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    }`}
                  >
                    <Cpu size={12} className="shrink-0" />
                    {providerInfo.isFallback
                      ? "AI providers were busy. Showing safe fallback preview."
                      : `Powered by ${providerLabel}`}
                  </motion.div>
                )}

                {/* Save success banner */}
                {saveSuccess && (
                  <motion.div
                    key="save-success"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="flex items-center justify-between gap-2 overflow-hidden rounded-xl border border-emerald-400/25 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCheck size={12} />
                      Project updated!
                    </span>
                  </motion.div>
                )}

                {error && (
                  <motion.div
                    key="error-banner"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden rounded-xl border border-red-400/25 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Textarea */}
              <textarea
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setIsSaved(false);
                }}
                placeholder="Refine your prompt..."
                className={`w-full resize-none bg-transparent text-slate-900 outline-none placeholder:text-slate-400 transition-all duration-300 dark:text-white dark:placeholder:text-white/30 ${
                  isCompact ? "min-h-[90px] text-sm" : "min-h-[130px] text-lg"
                }`}
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    handleGenerate();
                  }
                }}
              />

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4 dark:border-white/6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setStyle(style === "modern" ? "premium" : "modern");
                      setIsSaved(false);
                    }}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      style === "modern"
                        ? "border-violet-500/60 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300"
                        : "border-black/10 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                    }`}
                  >
                    <Palette size={11} />
                    {style === "modern" ? "Modern" : "Premium"}
                  </button>

                  <button
                    onClick={() => {
                      setWebsiteType(websiteType === "responsive" ? "saas" : "responsive");
                      setIsSaved(false);
                    }}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      websiteType === "responsive"
                        ? "border-violet-500/60 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300"
                        : "border-black/10 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                    }`}
                  >
                    <MonitorSmartphone size={11} />
                    {websiteType === "responsive" ? "Responsive" : "SaaS"}
                  </button>
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || prompt.trim().length < 5}
                  className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl disabled:hover:scale-100 cursor-pointer ${
                    isGenerating
                      ? "cursor-wait bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 opacity-80 shadow-[0_0_25px_rgba(124,58,237,0.4)]"
                      : "bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0_0_35px_rgba(124,58,237,0.55)] disabled:opacity-50"
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="relative z-10 flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} />
                        Regenerate
                        <span className="hidden opacity-60 sm:inline">⌘↵</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Save & Delete (Mobile Only) */}
          <AnimatePresence>
            {isCompact && generatedCode && !isGenerating && (
              <div className="flex flex-col gap-2 sm:hidden">
                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  onClick={handleSave}
                  disabled={isSaved || isSaving}
                  className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
                    isSaved
                      ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                      : "border-violet-400/30 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300"
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <CheckCheck size={14} />
                      Saved!
                    </>
                  ) : isSaving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : isSaved ? (
                    <>
                      <CheckCheck size={14} />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 cursor-pointer"
                >
                  <Trash2 size={14} />
                  Delete Project
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Right Canvas Area ── */}
        <AnimatePresence mode="popLayout">
          {isCompact && (
            <motion.div
              layout
              key="canvas"
              initial={{ opacity: 0, x: 40, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.97 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-0 flex-1 flex-col rounded-[1.75rem] border border-black/[0.09] bg-white shadow-[0_8px_40px_rgba(15,23,42,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_8px_50px_rgba(0,0,0,0.3)]"
            >
              {/* Canvas navbar */}
              <div className="flex flex-none items-center justify-between border-b border-black/6 px-5 py-3 dark:border-white/6">
                <div className="flex items-center gap-3">
                  <div className="animate-glow-pulse flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md">
                    <Monitor size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
                      Live Canvas
                    </p>
                    <p className={`text-[10px] font-medium transition-colors duration-300 ${
                      isGenerating
                        ? "text-violet-600 dark:text-cyan-400"
                        : "text-slate-400 dark:text-white/35"
                    }`}>
                      {isGenerating ? "Building…" : "Output ready"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Preview / Code tabs */}
                  <div className="flex rounded-full border border-black/10 bg-slate-100 p-1 dark:border-white/10 dark:bg-black/30">
                    {(["preview", "code"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`relative rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                          viewMode === mode
                            ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md dark:from-white dark:to-white dark:text-slate-950"
                            : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
                        }`}
                      >
                        {mode === "preview" ? (
                          <span className="flex items-center gap-1.5">
                            <Monitor size={11} />
                            Preview
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Code2 size={11} />
                            Code
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Copy when in code view */}
                  {viewMode === "code" && generatedCode && (
                    <button
                      onClick={handleCopy}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/80 text-slate-600 transition-all hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/10 cursor-pointer"
                    >
                      {copied ? (
                        <CheckCheck size={13} className="text-emerald-500" />
                      ) : (
                        <Copy size={13} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Canvas content */}
              <div className="relative min-h-0 flex-1 overflow-hidden rounded-b-[1.75rem]">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950"
                    >
                      <div className="relative mb-10">
                        <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20 blur-2xl" />
                        <div className="absolute -inset-4 animate-pulse rounded-full bg-cyan-400/10 blur-3xl" />
                        <div className="animate-float relative flex h-24 w-24 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_60px_rgba(124,58,237,0.35)] backdrop-blur-xl">
                          <div className="animate-glow-pulse">
                            <Zap className="h-10 w-10 text-cyan-300" />
                          </div>
                        </div>
                      </div>

                      <motion.p
                        key={loadingStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="animate-shimmer mb-3 text-xl font-black tracking-tight"
                      >
                        {STEPS[loadingStep]}
                      </motion.p>

                      <div className="flex items-center gap-2">
                        {STEPS.map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              scale: i === loadingStep ? 1 : 0.7,
                              opacity: i === loadingStep ? 1 : i < loadingStep ? 0.5 : 0.25,
                            }}
                            className={`rounded-full ${
                              i === loadingStep
                                ? "h-2.5 w-2.5 bg-cyan-400"
                                : "h-2 w-2 bg-white/30"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="mt-4 max-w-xs text-center text-sm leading-relaxed text-white/40">
                        Hang tight — crafting your fully responsive website from scratch.
                      </p>
                    </motion.div>
                  ) : viewMode === "preview" ? (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0"
                    >
                      <LivePreview code={generatedCode} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col bg-slate-950"
                    >
                      <div className="flex flex-none items-center gap-3 border-b border-white/8 px-5 py-3.5">
                        <div className="flex gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-red-400/70" />
                          <span className="h-3 w-3 rounded-full bg-yellow-400/70" />
                          <span className="h-3 w-3 rounded-full bg-emerald-400/70" />
                        </div>
                        <div className="flex items-center gap-2 text-white/50">
                          <Code2 size={13} className="text-cyan-400" />
                          <span className="text-xs font-mono">GeneratedWebsite.tsx</span>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto p-6">
                        <pre className="text-xs leading-relaxed text-cyan-100/85">
                          <code>
                            {generatedCode ||
                              "// Generate a website to see the React + Tailwind code here."}
                          </code>
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
    </ProtectedRoute>
  );
}
