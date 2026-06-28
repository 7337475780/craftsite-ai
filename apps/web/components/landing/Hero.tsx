"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Command,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

const promptExamples = [
  "AI SaaS landing page",
  "Developer portfolio",
  "Startup waitlist page",
  "Analytics dashboard site",
];

const trustItems = ["No code needed", "Export-ready", "Responsive", "Live preview"];

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      190
    )}px`;
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    resizeTextarea();
  };

  const goToGenerate = (value?: string) => {
    const finalPrompt = value?.trim() || prompt.trim();

    if (finalPrompt) {
      router.push(`/generate?prompt=${encodeURIComponent(finalPrompt)}`);
      return;
    }

    router.push("/generate");
  };

  const handleGenerate = (event: React.FormEvent) => {
    event.preventDefault();
    goToGenerate();
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);

    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.value = example;
      resizeTextarea();
    });

    goToGenerate(example);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      goToGenerate();
    }
  };

  return (
    <section className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8 lg:pt-36">
      {/* Background */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.28),transparent_34%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.20),transparent_30%),linear-gradient(180deg,#020617_0%,#070719_48%,#020617_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25 [mask-image:radial-gradient(circle_at_center,black,transparent_75%)]" />

      {/* Glow orbs */}
      <div className="pointer-events-none absolute -left-32 top-12 -z-10 h-72 w-72 rounded-full bg-violet-600/30 blur-[90px] sm:h-[28rem] sm:w-[28rem]" />
      <div className="pointer-events-none absolute -right-32 bottom-10 -z-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-[90px] sm:h-[25rem] sm:w-[25rem]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[110px]" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
        {/* Left Content */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-cyan-100 shadow-2xl shadow-violet-500/10 backdrop-blur-xl sm:text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
              <Sparkles size={13} />
            </span>
            AI website builder for modern creators
          </div>

          <h1 className="max-w-5xl text-balance text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Craft stunning websites with a{" "}
            <span className="bg-gradient-to-r from-violet-300 via-cyan-200 to-blue-300 bg-clip-text text-transparent">
              single prompt.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-slate-300 sm:text-lg">
            CraftSite AI turns your ideas into premium, responsive websites with
            live preview, editable sections, clean code, export-ready layouts,
            and production-focused design.
          </p>

          {/* Prompt Box */}
          <div className="mt-9 w-full rounded-[2rem] border border-white/10 bg-white/[0.07] p-3 shadow-[0_28px_90px_rgba(15,23,42,0.55)] backdrop-blur-2xl sm:p-4">
            <form onSubmit={handleGenerate}>
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-3 shadow-inner shadow-black/20 sm:p-4">
                <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  <Wand2 size={14} className="text-cyan-300" />
                  Describe your website
                </div>

                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Build a premium SaaS website for an AI analytics platform with hero, pricing, testimonials, dashboard mockup, and CTA..."
                  rows={3}
                  className="max-h-48 min-h-28 w-full resize-none bg-transparent text-base leading-7 text-white outline-none placeholder:text-slate-500 sm:text-lg"
                />
              </div>

              <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                  {promptExamples.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleExampleClick(item)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:-translate-y-0.5 hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/50 sm:text-sm"
                    >
                      <span className="text-cyan-300">+</span>
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
                  <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:inline-flex">
                    <Command size={13} />
                    Enter to generate
                  </span>

                  <button
                    type="submit"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/60 active:scale-[0.98] sm:w-auto"
                  >
                    <Sparkles size={17} />
                    Generate Website
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Trust Row */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {trustItems.map((item) => (
              <div
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl"
              >
                <CheckCircle2 size={14} className="text-cyan-300" />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right Mockup */}
        <div className="relative mx-auto hidden w-full max-w-xl lg:block">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-r from-violet-600/20 via-cyan-400/10 to-blue-500/20 blur-3xl" />

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.08] shadow-[0_30px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/70 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-slate-300">
                craftsite.ai/preview
              </div>
            </div>

            <div className="grid gap-4 p-5">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/20 via-blue-500/10 to-cyan-400/20 p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="h-3 w-24 rounded-full bg-white/25" />
                    <div className="mt-3 h-8 w-56 rounded-full bg-white/80" />
                  </div>
                  <div className="rounded-2xl bg-cyan-300/15 p-3 text-cyan-200">
                    <Zap size={20} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[72, 48, 88].map((height, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-3"
                    >
                      <div className="h-2 w-14 rounded-full bg-white/20" />
                      <div
                        className="mt-8 rounded-xl bg-gradient-to-t from-cyan-300/70 to-violet-400/70"
                        style={{ height }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["AI layout", "Clean code", "SEO ready", "Responsive"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-3xl border border-white/10 bg-slate-950/45 p-4"
                    >
                      <div className="mb-4 h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-400/30 to-cyan-300/20" />
                      <div className="h-3 w-24 rounded-full bg-white/25" />
                      <p className="mt-3 text-sm font-semibold text-white">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="h-3 w-28 rounded-full bg-white/25" />
                  <div className="h-7 w-20 rounded-full bg-cyan-300/20" />
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-2xl bg-white/10" />
                      <div className="flex-1">
                        <div className="h-2.5 w-3/4 rounded-full bg-white/20" />
                        <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 rounded-3xl border border-white/10 bg-white/[0.08] p-4 shadow-2xl backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Generated
            </p>
            <p className="mt-1 text-2xl font-black text-white">4.8s</p>
          </div>
        </div>
      </div>
    </section>
  );
}