"use client";

import { AppShell } from "@/components/app/AppShell";
import { motion } from "framer-motion";
import {
  Code2,
  Loader2,
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

  const handleGenerate = async () => {
    try {
      setError("");
      setGeneratedCode("");

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
            What do you want to <span className="gradient-text">build?</span>
          </h2>

          <p className="mt-4 max-w-2xl text-slate-600 dark:text-white/60">
            Describe your website idea. CraftSite will generate a clean,
            responsive layout with sections, copy, and visual structure.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1fr_500px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035]"
          >
            <label className="text-sm font-bold text-slate-950 dark:text-white">
              Website prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Build a futuristic SaaS landing page for an AI resume tool with pricing, testimonials, FAQ and CTA."
              className="mt-4 min-h-64 w-full resize-none rounded-3xl border border-black/10 bg-white/80 p-5 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-violet-500 dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder:text-white/35"
            />

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setStyle("modern")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
              >
                <Wand2 size={17} />
                Modern
              </button>

              <button
                onClick={() => setWebsiteType("responsive")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
              >
                <MonitorSmartphone size={17} />
                Responsive
              </button>

              <button
                onClick={() => setStyle("premium")}
                className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
              >
                <Palette size={17} />
                Premium UI
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
            className="rounded-[2rem] border border-black/10 bg-slate-950 p-6 text-white shadow-[0_22px_70px_rgba(15,23,42,0.18)] dark:border-white/10"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400">
                <Code2 size={20} />
              </div>

              <div>
                <p className="font-black">Generated Code</p>
                <p className="text-sm text-white/45">
                  Response from CraftSite API
                </p>
              </div>
            </div>

            {!generatedCode && !isGenerating && (
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <p className="text-sm leading-7 text-white/55">
                  Your generated website code will appear here after you click
                  Generate Website.
                </p>

                <div className="mt-6 space-y-4">
                  {[
                    "Understand business type",
                    "Create page structure",
                    "Generate visual direction",
                    "Build responsive sections",
                    "Prepare export-ready code",
                  ].map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4"
                    >
                      <span className="text-sm text-white/70">{step}</span>
                      <span className="text-xs text-white/35">
                        0{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="flex min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04]">
                <div className="text-center">
                  <Loader2 className="mx-auto h-10 w-10 animate-spin text-cyan-300" />
                  <p className="mt-4 font-bold">CraftSite is generating...</p>
                  <p className="mt-2 text-sm text-white/45">
                    Creating your website structure
                  </p>
                </div>
              </div>
            )}

            {generatedCode && (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <p className="text-sm font-bold">GeneratedWebsite.tsx</p>

                  <button
                    onClick={() => navigator.clipboard.writeText(generatedCode)}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-950"
                  >
                    Copy Code
                  </button>
                </div>

                <pre className="max-h-[520px] overflow-auto p-5 text-sm leading-7 text-cyan-100">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
