"use client";

import { AppShell } from "@/components/app/AppShell";
import { LivePreview } from "@/components/generate/LivePreview";
import { motion } from "framer-motion";
import {
  Code2,
  Loader2,
  Monitor,
  MonitorSmartphone,
  Palette,
  Sparkles,
  Wand2,
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
  const [style, setStyle] = useState("futuristic");
  const [websiteType, setWebsiteType] = useState("saas");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [providerInfo, setProviderInfo] = useState<{ provider: string; isFallback: boolean } | null>(null);

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
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8"
        >
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-violet-700 dark:text-cyan-300">
            AI Generator
          </p>

          <h2 className="mt-3 text-4xl font-black text-slate-950 dark:text-white md:text-6xl">
            Generate, edit and <span className="gradient-text">preview</span>
          </h2>

          <p className="mt-4 max-w-2xl text-slate-600 dark:text-white/60">
            Describe your website idea. CraftSite will generate React + Tailwind
            code and render it instantly in a live preview.
          </p>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="h-fit rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035]"
          >
            <label className="text-sm font-bold text-slate-950 dark:text-white">
              Website prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Build a futuristic SaaS landing page for an AI resume tool with pricing, testimonials, FAQ and CTA."
              className="mt-4 min-h-56 w-full resize-none rounded-3xl border border-black/10 bg-white/80 p-5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/35"
            />

            <div className="mt-5 grid gap-3">
              <button
                onClick={() => setStyle("modern")}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  style === "modern"
                    ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-cyan-300"
                    : "border-black/10 bg-white/70 text-slate-700 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wand2 size={17} />
                  Modern
                </span>
              </button>

              <button
                onClick={() => setWebsiteType("responsive")}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  websiteType === "responsive"
                    ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-cyan-300"
                    : "border-black/10 bg-white/70 text-slate-700 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  <MonitorSmartphone size={17} />
                  Responsive
                </span>
              </button>

              <button
                onClick={() => setStyle("premium")}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-bold transition ${
                  style === "premium"
                    ? "border-violet-500 bg-violet-500/10 text-violet-700 dark:text-cyan-300"
                    : "border-black/10 bg-white/70 text-slate-700 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Palette size={17} />
                  Premium UI
                </span>
              </button>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-6 py-4 text-sm font-black text-white shadow-[0_0_35px_rgba(124,58,237,0.35)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Website
                </>
              )}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18 }}
          >
            <div className="mb-4 flex flex-col justify-between gap-4 rounded-[1.5rem] border border-black/10 bg-white/75 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.07)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] sm:flex-row sm:items-center">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
                  <Monitor size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-950 dark:text-white">
                    Live Workspace
                  </p>
                  <p className="text-sm text-slate-500 dark:text-white/45">
                    Preview and edit generated code
                  </p>
                </div>
              </div>

              <div className="flex rounded-2xl border border-black/10 bg-white/70 p-1 dark:border-white/10 dark:bg-black/30">
                <button
                  onClick={() => setViewMode("preview")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    viewMode === "preview"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 dark:text-white/50"
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setViewMode("code")}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                    viewMode === "code"
                      ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
                      : "text-slate-600 dark:text-white/50"
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            {providerInfo?.isFallback && (
              <div className="mb-4 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm font-semibold text-orange-600 dark:text-orange-300">
                AI providers are busy. Showing safe fallback preview.
              </div>
            )}

            {providerInfo && !isGenerating && viewMode === "preview" && (
              <div className="mb-4 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-white/50">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                Generated by {providerInfo.provider === "openrouter" ? "OpenRouter" : providerInfo.provider === "gemini" ? "Gemini" : "Mock Fallback"}
              </div>
            )}

            {isGenerating ? (
              <div className="flex min-h-[620px] items-center justify-center rounded-[2rem] border border-black/10 bg-slate-950 p-8 text-white dark:border-white/10">
                <div className="text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-300" />
                  <p className="mt-4 font-bold">CraftSite is generating...</p>
                  <p className="mt-2 text-sm text-white/45">
                    Creating your website and preparing live preview
                  </p>
                </div>
              </div>
            ) : viewMode === "preview" ? (
              <LivePreview code={generatedCode} />
            ) : (
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 text-white">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Code2 size={18} />
                    <p className="text-sm font-bold">GeneratedWebsite.tsx</p>
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Copy Code
                  </button>
                </div>

                <pre className="max-h-[620px] overflow-auto p-5 text-sm leading-7 text-cyan-100">
                  <code>
                    {generatedCode ||
                      "Generate a website to see React + Tailwind code here."}
                  </code>
                </pre>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
