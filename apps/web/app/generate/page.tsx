"use client";

import { AppShell } from "@/components/app/AppShell";
import { LivePreview } from "@/components/generate/LivePreview";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Loader2,
  Monitor,
  MonitorSmartphone,
  Palette,
  Sparkles,
  Wand2,
  Cpu,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type GenerateResponse = {
  success: boolean;
  message: string;
  data?: {
    prompt: string;
    style: string;
    websiteType: string;
    generatedCode: string;
    provider: "openrouter" | "gemini" | "mock";
    isFallback: boolean;
  };
};

export default function GeneratePage() {
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
    provider: string;
    isFallback: boolean;
  } | null>(null);

  const handleGenerate = async () => {
    try {
      setError("");
      setGeneratedCode("");
      setProviderInfo(null);

      if (prompt.trim().length < 10) {
        setError("Please enter at least 10 characters.");
        return;
      }

      setIsGenerating(true);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          style,
          websiteType,
        }),
      });

      const result = (await response.json()) as GenerateResponse;

      if (!response.ok || !result.success) {
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

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-10">
        {/* TOP SECTION: Massive Input Area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-none rounded-[2rem] border border-black/10 bg-white/60 p-2 shadow-xl shadow-slate-900/5 backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.02]"
        >
          <div className="relative rounded-[1.5rem] bg-white/50 p-6 dark:bg-black/20">
            {/* Provider / Error Banner Area */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" />
                <span className="text-sm font-bold text-slate-700 dark:text-white/70">
                  CraftSite Generation Engine
                </span>
              </div>

              {providerInfo && !isGenerating && (
                <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600 dark:text-green-400">
                  <Cpu size={12} />
                  {providerInfo.provider === "openrouter"
                    ? "OpenRouter"
                    : providerInfo.provider === "gemini"
                      ? "Gemini"
                      : "Mock Fallback"}
                </div>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}

            {providerInfo?.isFallback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-600 dark:text-orange-300"
              >
                AI providers are currently rate-limited. Showing a safe fallback preview layout.
              </motion.div>
            )}

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the website, dashboard, or tool you want to build..."
              className="w-full resize-none bg-transparent text-lg text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-white/30 md:text-xl lg:text-2xl"
              rows={2}
              disabled={isGenerating}
            />

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-4 dark:border-white/5">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setStyle(style === "modern" ? "premium" : "modern")}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                    style === "modern"
                      ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
                      : "border-black/10 bg-white/50 text-slate-500 hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                  }`}
                >
                  <Palette size={14} />
                  {style === "modern" ? "Modern UI" : "Premium UI"}
                </button>

                <button
                  onClick={() => setWebsiteType(websiteType === "responsive" ? "saas" : "responsive")}
                  disabled={isGenerating}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${
                    websiteType === "responsive"
                      ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300"
                      : "border-black/10 bg-white/50 text-slate-500 hover:text-slate-800 dark:border-white/10 dark:bg-black/20 dark:text-white/50 dark:hover:text-white"
                  }`}
                >
                  <MonitorSmartphone size={14} />
                  {websiteType === "responsive" ? "Responsive" : "SaaS Focus"}
                </button>
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02] disabled:opacity-70 dark:bg-white dark:text-slate-950"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-cyan-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative z-10 flex items-center gap-2">
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 size={16} />
                      Generate Now
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* BOTTOM SECTION: Full Width Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex h-[800px] flex-col rounded-[2rem] border border-black/10 bg-white/60 p-2 shadow-xl backdrop-blur-3xl dark:border-white/10 dark:bg-white/[0.02] xl:h-[1000px]"
        >
          {/* Preview Controls Navbar */}
          <div className="mb-2 flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white shadow-inner">
                <Monitor size={14} />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Live Output Workspace
              </span>
            </div>

            <div className="flex rounded-full border border-black/10 bg-white/50 p-1 dark:border-white/10 dark:bg-black/30">
              <button
                onClick={() => setViewMode("preview")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  viewMode === "preview"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setViewMode("code")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  viewMode === "code"
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white"
                }`}
              >
                Code
              </button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem]">
            <AnimatePresence mode="wait">
              {isGenerating ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400/30 blur-xl" />
                    <Loader2 className="relative h-12 w-12 animate-spin text-cyan-400" />
                  </div>
                  <p className="text-lg font-black tracking-tight">
                    Crafting your design...
                  </p>
                  <p className="mt-2 text-sm text-white/50">
                    Writing clean React components and setting up live preview
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
                  <div className="flex flex-none items-center justify-between border-b border-white/10 px-6 py-4">
                    <div className="flex items-center gap-3 text-white">
                      <Code2 size={16} className="text-cyan-400" />
                      <span className="text-sm font-bold tracking-wide">
                        GeneratedWebsite.tsx
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(generatedCode)
                      }
                      className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-6">
                    <pre className="text-sm leading-relaxed text-cyan-100/90">
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
      </div>
    </AppShell>
  );
}
