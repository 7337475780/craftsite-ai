"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/animations/Reveal";

const generationSteps = [
  "Understanding your idea",
  "Planning website structure",
  "Designing sections",
  "Generating responsive UI",
];

const promptExamples = [
  "SaaS landing page",
  "Portfolio website",
  "Restaurant site",
  "AI startup page",
];

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push("/generate");
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    router.push(`/generate?prompt=${encodeURIComponent(example)}`);
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-5 pt-32 md:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 grid-bg" />
      <div className="noise" />

      <div className="absolute left-1/2 top-40 -z-10 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl dark:bg-violet-600/30" />
      <div className="absolute right-0 top-32 -z-10 h-[300px] w-[300px] rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/25" />

      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left Content */}
        <Reveal duration={0.8} y={40}>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm text-slate-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-white/70">
            <Sparkles size={16} className="text-violet-500 dark:text-cyan-300" />
            AI Website Builder for creators, startups & developers
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 dark:text-white md:text-7xl">
            Craft stunning websites with a{" "}
            <span className="gradient-text">single prompt.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-white/60">
            CraftSite AI turns your ideas into premium, responsive websites with
            live preview, editable sections, clean code, and export-ready
            layouts.
          </p>

          {/* Prompt Box */}
          <form 
            onSubmit={handleGenerate}
            className="mt-10 max-w-2xl rounded-3xl border border-black/10 bg-white/75 p-2 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-violet-500/30 dark:bg-black/40 dark:shadow-[0_0_50px_rgba(124,58,237,0.15)] transition-all focus-within:shadow-[0_20px_60px_rgba(124,58,237,0.15)] dark:focus-within:shadow-[0_0_60px_rgba(124,58,237,0.3)] dark:focus-within:border-violet-500/60"
          >
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-slate-100/80 px-5 py-4 text-slate-700 dark:bg-white/[0.03] dark:text-white transition-colors focus-within:bg-white dark:focus-within:bg-white/[0.08]">
                <Sparkles size={18} className="text-violet-600 dark:text-cyan-300 flex-shrink-0" />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Build a modern SaaS website for an AI tool..."
                  className="w-full bg-transparent text-sm sm:text-base outline-none placeholder:text-slate-400 dark:placeholder:text-white/30"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-6 py-4 text-sm font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] active:scale-[0.98]"
              >
                Generate
                <ArrowRight size={17} />
              </button>
            </div>
          </form>

          {/* Prompt Examples */}
          <div className="mt-5 flex flex-wrap gap-3">
            {promptExamples.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleExampleClick(item)}
                className="rounded-full border border-black/10 bg-white/60 px-4 py-2 text-sm text-slate-600 transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:text-violet-700 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white/50 dark:hover:border-cyan-400/50 dark:hover:bg-white/[0.06] dark:hover:text-white"
              >
                {item}
              </button>
            ))}
          </div>

          {/* Trust Row */}
          <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-white/45">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-500" />
              No coding required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-500" />
              Export clean code
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={17} className="text-emerald-500" />
              Responsive by default
            </div>
          </div>
        </Reveal>

        {/* Right Product Preview */}
        <Reveal delay={0.2} duration={0.8} y={40} className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-cyan-400/20 blur-2xl" />

          <div className="glass-card neon-card relative rounded-[2rem] p-4">
            {/* Browser Top */}
            <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
              <div className="flex gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>

              <div className="rounded-full border border-black/10 bg-white/60 px-4 py-1 text-xs text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45">
                craftsite.ai/live-preview
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              {/* AI Panel */}
              <div className="rounded-3xl border border-black/10 bg-white/70 p-5 dark:border-white/10 dark:bg-black/30">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-400 text-white">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">
                      AI Builder
                    </p>
                    <p className="text-xs text-slate-500 dark:text-white/45">
                      Generating...
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {generationSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-center justify-between rounded-2xl border border-black/10 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.035]"
                    >
                      <span className="text-xs text-slate-600 dark:text-white/60">
                        {step}
                      </span>
                      {index < 3 ? (
                        <CheckCircle2
                          size={16}
                          className="text-emerald-500"
                        />
                      ) : (
                        <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)]" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/10 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10">
                  <p className="text-xs font-medium text-violet-700 dark:text-cyan-200">
                    Prompt
                  </p>
                  <p className="mt-1 text-sm text-slate-700 dark:text-white/70">
                    “Create a futuristic landing page for an AI startup”
                  </p>
                </div>
              </div>

              {/* Website Preview */}
              <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-slate-950 p-6 text-white dark:border-white/10">
                <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-violet-500/30 blur-3xl" />
                <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-cyan-400/20 blur-3xl" />

                <div className="relative z-10">
                  <div className="mb-12 flex items-center justify-between text-xs text-white/55">
                    <span className="font-bold text-white">NovaAI</span>
                    <div className="hidden gap-4 sm:flex">
                      <span>Product</span>
                      <span>Features</span>
                      <span>Pricing</span>
                    </div>
                    <button className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                      Start
                    </button>
                  </div>

                  <div className="mx-auto max-w-sm text-center">
                    <div className="mx-auto mb-5 h-20 w-20 rounded-full orb" />

                    <h3 className="text-3xl font-black leading-tight">
                      Launch your AI product faster
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-white/55">
                      A polished landing page generated instantly with modern
                      sections, visuals and responsive design.
                    </p>

                    <div className="mt-6 flex justify-center gap-3">
                      <button className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold">
                        Get Started
                      </button>
                      <button className="rounded-xl border border-white/10 px-4 py-2 text-xs">
                        View Demo
                      </button>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-3">
                    {["Fast", "Smart", "Clean"].map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center"
                      >
                        <p className="text-sm font-semibold">{item}</p>
                        <p className="mt-1 text-[10px] text-white/40">
                          AI powered
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div className="absolute -bottom-6 left-8 hidden rounded-2xl border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60 dark:text-white/70 md:block">
            98% faster website creation
          </div>

          <div className="absolute -right-6 top-10 hidden rounded-2xl border border-black/10 bg-white/80 px-5 py-3 text-sm font-medium text-slate-700 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60 dark:text-white/70 md:block">
            Clean React + Tailwind code
          </div>
        </Reveal>
      </div>
    </section>
  );
}