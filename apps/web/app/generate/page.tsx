"use client";

import { LivePreview } from "@/components/generate/LivePreview";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
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
  Download,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback, Suspense } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { apiPost } from "@/lib/api-client";
import { exportProjectAsZip } from "@/lib/export-project";
import {
  saveProject,
  generateProjectTitle,
} from "@/lib/projects-storage";
import type { AIProviderName } from "@/types/project";

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

const SUGGESTIONS = [
  "AI SaaS landing page",
  "Portfolio website",
  "Startup homepage",
  "Agency website",
];

const STEPS = [
  "Analyzing your prompt...",
  "Designing the layout...",
  "Writing React components...",
  "Polishing styles...",
  "Spinning up the preview...",
];

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [prompt, setPrompt] = useState(initialPrompt);
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
  const [isSaved, setIsSaved] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { user } = useAuth();

  const handleExport = useCallback(async () => {
    if (!generatedCode) return;
    setIsExporting(true);
    setError("");
    try {
      const title = generateProjectTitle(prompt) || "CraftSite Export";
      await exportProjectAsZip({
        title,
        prompt,
        generatedCode,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }, [generatedCode, prompt]);

  // When code is generated, the input area becomes compact
  const isCompact = generatedCode.length > 0 || isGenerating;

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [generatedCode]);

  const handleSave = useCallback(async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
    if (!generatedCode || !providerInfo) return;
    setIsSaving(true);
    setError("");
    const title = generateProjectTitle(prompt);

    try {
      const result = await apiPost("/api/projects", {
        title,
        prompt,
        generatedCode,
        provider: providerInfo.provider,
        isFallback: providerInfo.isFallback,
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to save project to cloud.");
      }

      setIsSaved(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Cloud save failed, falling back to localStorage", err);
      try {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        saveProject({
          id,
          title,
          prompt,
          generatedCode,
          provider: providerInfo.provider,
          isFallback: providerInfo.isFallback,
          style,
          websiteType,
          createdAt: now,
          updatedAt: now,
        });
        setIsSaved(true);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } catch (localErr) {
        setError(err instanceof Error ? err.message : "Failed to save project.");
      }
    } finally {
      setIsSaving(false);
    }
  }, [generatedCode, prompt, providerInfo, style, websiteType, user, router]);

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

      // Cycle through loading steps
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

  return (
    <main className="flex h-[100dvh] flex-col overflow-hidden craftsite-bg">

      {/* ── Premium Workspace Navbar ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="workspace-navbar relative flex-none px-4 py-3 z-50"
      >
        {/* Accent lines */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/30" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/8 to-transparent dark:via-white/8" />

        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">

          {/* Left: Back + Logo */}
          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="group flex items-center gap-1.5 rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:border-violet-400/60 hover:bg-white hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white"
            >
              <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
              Exit
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
              {prompt.trim().length > 0
                ? prompt.slice(0, 32) + (prompt.length > 32 ? "…" : "")
                : "New Generation"}
            </span>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            {/* Provider badge */}
            <AnimatePresence>
              {providerInfo && !isGenerating && (
                <motion.div
                  key="provider"
                  initial={{ opacity: 0, scale: 0.85, x: 12 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.85, x: 12 }}
                  transition={{ duration: 0.3 }}
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
                  transition={{ duration: 0.25 }}
                  onClick={handleSave}
                  disabled={isSaved || isSaving}
                  className={`hidden items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold transition-all sm:flex ${
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
                      Save Project
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Projects link */}
            <Link
              href="/projects"
              className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/10 sm:flex"
            >
              <FolderOpen size={12} />
              Projects
            </Link>

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
                  className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-violet-400/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/10 sm:flex"
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

            {/* Export ZIP button */}
            <AnimatePresence>
              {generatedCode && !isGenerating && (
                <motion.button
                  key="export"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.25 }}
                  onClick={handleExport}
                  disabled={isExporting}
                  className="hidden items-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm transition-all hover:border-violet-400/40 hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/70 dark:hover:bg-white/10 sm:flex cursor-pointer disabled:opacity-50"
                >
                  {exportSuccess ? (
                    <>
                      <CheckCheck size={12} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Exported!</span>
                    </>
                  ) : isExporting ? (
                    <>
                      <Loader2 size={12} className="animate-spin text-violet-600 dark:text-cyan-400" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={12} />
                      Export ZIP
                    </>
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* System status */}
            <div className="hidden items-center gap-2 rounded-full border border-black/8 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/8 dark:bg-white/[0.04] dark:text-white/50 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Online
            </div>

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
              {isCompact ? "Craft Again" : "AI Website Builder"}
            </motion.h1>
            <motion.p layout className="text-sm text-slate-500 dark:text-white/50">
              {isCompact
                ? "Edit your prompt or regenerate."
                : "Describe your vision — CraftSite builds it."}
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
                      Project saved successfully!
                    </span>
                    <Link
                      href="/projects"
                      className="flex items-center gap-1 font-bold underline underline-offset-2 hover:no-underline"
                    >
                      <FolderOpen size={11} />
                      View Projects
                    </Link>
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
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  isCompact
                    ? "Refine your prompt..."
                    : "Build a sleek SaaS landing page with a hero, features, pricing..."
                }
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

              {/* Quick suggestions */}
              <AnimatePresence>
                {!isCompact && !isGenerating && prompt.trim().length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex flex-wrap gap-2 overflow-hidden"
                  >
                    {SUGGESTIONS.map((sug, i) => (
                      <motion.button
                        key={sug}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setPrompt(sug)}
                        className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-violet-400/50 hover:bg-violet-50 hover:text-violet-700 hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:text-white/55 dark:hover:border-cyan-400/40 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-200"
                      >
                        {sug}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/6 pt-4 dark:border-white/6">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setStyle(style === "modern" ? "premium" : "modern")}
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      style === "modern"
                        ? "border-violet-500/60 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-400/30 dark:bg-violet-500/10 dark:text-violet-300"
                        : "border-black/10 bg-white/60 text-slate-500 hover:border-slate-300 hover:bg-white hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                    }`}
                  >
                    <Palette size={11} />
                    {style === "modern" ? "Modern" : "Premium"}
                  </button>

                  <button
                    onClick={() =>
                      setWebsiteType(websiteType === "responsive" ? "saas" : "responsive")
                    }
                    disabled={isGenerating}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
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
                  className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all duration-200 hover:scale-[1.03] hover:shadow-xl disabled:hover:scale-100 ${
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
                        {isCompact ? "Regenerate" : "Generate"}
                        <span className="hidden opacity-60 sm:inline">⌘↵</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Footer hint / Save button (mobile) */}
          <AnimatePresence>
            {!isCompact && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-[11px] text-slate-400 dark:text-white/25"
              >
                Press <kbd className="rounded bg-black/8 px-1.5 py-0.5 font-mono text-[10px] dark:bg-white/10">⌘ Enter</kbd> to generate
              </motion.p>
            )}
            {isCompact && generatedCode && !isGenerating && (
              <motion.button
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                onClick={handleSave}
                disabled={isSaved || isSaving}
                className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition-all sm:hidden ${
                  isSaved
                    ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "border-violet-400/30 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-500/10 dark:text-violet-300"
                }`}
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isSaved ? (
                  <CheckCheck size={14} />
                ) : (
                  <Save size={14} />
                )}
                {isSaving ? "Saving..." : isSaved ? "Project Saved" : "Save Project"}
              </motion.button>
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
                        className={`relative rounded-full px-4 py-1.5 text-xs font-bold capitalize transition-all duration-200 ${
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
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/80 text-slate-600 transition-all hover:bg-white hover:shadow-sm dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/10"
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

        {/* Empty state */}
        <AnimatePresence>
          {!isCompact && (
            <motion.div
              key="empty-hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden items-center justify-center lg:flex lg:flex-1"
            >
              <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-dashed border-black/10 p-16 text-center dark:border-white/10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                  <Monitor size={24} className="text-slate-400 dark:text-white/30" />
                </div>
                <div>
                  <p className="font-bold text-slate-600 dark:text-white/50">
                    Your canvas is empty
                  </p>
                  <p className="mt-1 text-sm text-slate-400 dark:text-white/30">
                    Generate a website to see it live here
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <main className="flex h-screen flex-col items-center justify-center craftsite-bg">
          <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
        </main>
      }>
        <GeneratePageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
