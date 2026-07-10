"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  Code2,
  Eye,
  FolderOpen,
  Globe2,
  Grid3X3,
  Home,
  LayoutDashboard,
  Lock,
  Menu,
  Monitor,
  MousePointer2,
  Rocket,
  Settings,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";

const promptExamples = [
  "SaaS landing page",
  "Portfolio website",
  "Restaurant website",
  "AI startup landing page",
];

const builderSteps = [
  { label: "AI is generating website...", active: true, done: false },
  { label: "Analyzing prompt", active: false, done: true },
  { label: "Planning structure", active: false, done: true },
  { label: "Designing layout", active: true, done: true },
  { label: "Generating content", active: false, done: false },
  { label: "Building pages", active: false, done: false },
  { label: "Finalizing", active: false, done: false },
];

const sideNavItems = [
  { label: "Home", icon: Home, active: true },
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Templates", icon: Grid3X3 },
  { label: "AI Assistant", icon: Wand2 },
  { label: "Projects", icon: FolderOpen },
  { label: "Domains", icon: Globe2 },
  { label: "Team", icon: Bot },
  { label: "Settings", icon: Settings },
];

// const featureItems = [
//   {
//     icon: Sparkles,
//     title: "AI Generation",
//     desc: "Generate entire websites from natural language prompts.",
//   },
//   {
//     icon: Eye,
//     title: "Live Preview",
//     desc: "See your website come to life in real time as AI builds it.",
//   },
//   {
//     icon: Grid3X3,
//     title: "Edit & Customize",
//     desc: "Edit sections or content using AI or adjust manually.",
//   },
//   {
//     icon: Rocket,
//     title: "Export & Deploy",
//     desc: "Deploy to one click with SEO, performance and analytics.",
//   },
//   {
//     icon: Bot,
//     title: "Smart Sections",
//     desc: "AI understands your needs and creates perfect sections.",
//   },
//   {
//     icon: Monitor,
//     title: "Fully Responsive",
//     desc: "Every website is responsive and looks perfect anywhere.",
//   },
// ];

const trustedBy = ["Vercel", "Framer", "Webflow", "Relume", "Spline", "Tailwind CSS"];

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resizeTextarea = () => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(
      textareaRef.current.scrollHeight,
      150
    )}px`;
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(event.target.value);
    requestAnimationFrame(resizeTextarea);
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
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#02030d] dark:text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_80%_25%,rgba(124,58,237,0.16),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(14,165,233,0.12),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_45%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_80%_25%,rgba(84,58,255,0.28),transparent_24%),radial-gradient(circle_at_50%_0%,rgba(29,78,216,0.16),transparent_35%),linear-gradient(180deg,#02030d_0%,#030514_45%,#02030d_100%)]" />

      <div className="absolute inset-0 -z-20 opacity-45 [background-image:radial-gradient(rgba(15,23,42,0.18)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] dark:[background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)]" />

      <div className="absolute -right-32 top-28 -z-10 h-[34rem] w-[34rem] rounded-full border border-violet-400/20 bg-[radial-gradient(circle_at_35%_35%,rgba(139,92,246,0.28),rgba(37,99,235,0.15)_38%,rgba(255,255,255,0)_70%)] shadow-[0_0_140px_rgba(99,102,241,0.24)] blur-[1px] dark:bg-[radial-gradient(circle_at_35%_35%,rgba(139,92,246,0.55),rgba(37,99,235,0.28)_38%,rgba(2,6,23,0)_70%)] dark:shadow-[0_0_140px_rgba(99,102,241,0.45)]" />

      <div className="absolute -bottom-40 left-0 right-0 -z-10 h-80 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.22),transparent_58%)] blur-3xl dark:bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.45),transparent_58%)]" />

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />


      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1500px] flex-col px-4 pb-12 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-2xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300 dark:shadow-violet-950/40">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-violet-600 dark:bg-violet-500/20 dark:text-cyan-200">
              <Sparkles size={12} />
            </span>
            AI website builder for the future
          </div>

          <h1 className="max-w-5xl text-balance text-4xl font-black leading-[0.98] tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Build stunning websites
            <br className="hidden sm:block" /> with a{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              single prompt.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-pretty text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base md:text-lg">
            CraftSite AI creates modern, responsive websites in seconds. No
            coding. No limits. Just your imagination.
          </p>

          {/* Prompt Bar */}
          <form
            onSubmit={handleGenerate}
            className="mt-8 w-full max-w-4xl rounded-3xl border border-violet-500/20 bg-white/80 p-2 shadow-[0_22px_70px_rgba(79,70,229,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl dark:border-violet-400/30 dark:bg-[#080b1d]/80 dark:shadow-[0_0_50px_rgba(124,58,237,0.28),inset_0_1px_0_rgba(255,255,255,0.08)]"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-h-14 flex-1 items-start gap-3 rounded-2xl border border-slate-900/10 bg-white/75 px-4 py-3 shadow-inner shadow-slate-900/5 dark:border-white/5 dark:bg-black/20 sm:items-center">
                <Sparkles
                  size={18}
                  className="mt-1 shrink-0 text-violet-600 dark:text-violet-300 sm:mt-0"
                />
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Describe the website you want to build..."
                  className="max-h-36 min-h-7 w-full resize-none bg-transparent text-sm leading-7 text-slate-950 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-500 sm:text-base"
                />
              </div>

              <button
                type="submit"
                className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-6 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(14,165,233,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.98] dark:from-violet-600 dark:via-purple-500 dark:to-blue-500 dark:shadow-[0_0_32px_rgba(124,58,237,0.45)] dark:hover:shadow-[0_0_42px_rgba(59,130,246,0.45)] dark:focus-visible:ring-cyan-300/70 sm:w-auto"
              >
                Generate
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-0.5"
                />
              </button>
            </div>
          </form>

          <div className="mt-4 flex w-full max-w-4xl flex-wrap justify-center gap-2.5">
            {promptExamples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExampleClick(example)}
                className="rounded-xl border border-slate-900/10 bg-white/75 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-violet-500/30 hover:bg-violet-50 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 dark:border-white/10 dark:bg-[#070b1d]/80 dark:text-slate-300 dark:shadow-black/20 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Main Website Preview */}
        <div className="relative mx-auto mt-8 w-full max-w-6xl sm:mt-10">
          {/* AI progress card */}
          <div className="absolute -left-3 top-24 z-20 hidden w-56 rounded-3xl border border-slate-900/10 bg-white/85 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#050815]/85 dark:shadow-[0_24px_80px_rgba(0,0,0,0.5)] lg:block xl:-left-14">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200">
                <Bot size={14} />
              </div>
              <p className="text-xs font-bold text-slate-950 dark:text-white">
                AI is generating website...
              </p>
            </div>

            <div className="space-y-3">
              {builderSteps.map((step, index) => (
                <div key={step.label} className="flex items-center gap-3">
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${step.active
                      ? "border-violet-500 bg-violet-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.45)]"
                      : step.done
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                        : "border-slate-900/10 bg-slate-100 text-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/25"
                      }`}
                  >
                    {step.done ? (
                      <Check size={11} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] ${step.active
                      ? "font-semibold text-slate-950 dark:text-white"
                      : step.done
                        ? "text-slate-600 dark:text-slate-300"
                        : "text-slate-400 dark:text-slate-500"
                      }`}
                  >
                    {step.label}
                  </span>
                  {index < 3 && step.done && (
                    <Check size={12} className="ml-auto text-emerald-500 dark:text-emerald-300" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-violet-500/25 bg-white/85 shadow-[0_30px_90px_rgba(79,70,229,0.18)] backdrop-blur-2xl dark:border-violet-400/40 dark:bg-[#030615]/90 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_35px_110px_rgba(59,130,246,0.28)] sm:rounded-[2rem]">
            {/* Browser top */}
            <div className="flex items-center justify-between border-b border-slate-900/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-black/30 sm:px-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
              </div>

              <div className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 sm:flex">
                <Lock size={11} />
                Live preview
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-950 sm:inline-flex">
                  Get Started
                </span>
                <Menu size={16} className="text-slate-500 dark:text-white/60 sm:hidden" />
              </div>
            </div>

            {/* Website mockup content */}
            <div className="relative overflow-hidden px-4 py-8 sm:px-8 md:px-12 lg:px-16">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_35%,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_35%_20%,rgba(139,92,246,0.14),transparent_34%)] dark:bg-[radial-gradient(circle_at_72%_35%,rgba(14,165,233,0.28),transparent_35%),radial-gradient(circle_at_35%_20%,rgba(139,92,246,0.22),transparent_34%)]" />

              <div className="mx-auto max-w-4xl text-center">
                <div className="mb-5 inline-flex rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-[11px] font-bold text-violet-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-100">
                  Introducing TechNova
                </div>

                <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl">
                  The future of{" "}
                  <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:to-violet-400">
                    AI collaboration
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                  All-in-one platform to build, deploy and scale AI solutions
                  with your team.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-violet-500/30">
                    Start for free
                  </button>
                  <button className="rounded-xl border border-slate-900/10 bg-white/70 px-5 py-3 text-xs font-bold text-slate-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-white">
                    Watch demo
                  </button>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-900/10 pt-8 dark:border-white/10 sm:grid-cols-4">
                  {[
                    ["10K+", "Active Users"],
                    ["50+", "Integrations"],
                    ["99.9%", "Uptime"],
                    ["24/7", "Support"],
                  ].map(([value, label]) => (
                    <div key={label} className="text-center">
                      <p className="text-xl font-black text-slate-950 dark:text-white sm:text-2xl">
                        {value}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500 sm:text-xs">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview controls */}
            <div className="flex items-center justify-center gap-2 border-t border-slate-900/10 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-black/25">
              {[Code2, Monitor, Globe2].map((Icon, index) => (
                <button
                  key={index}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-900/10 bg-white/80 text-slate-500 transition hover:text-slate-950 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50 dark:hover:text-white"
                >
                  <Icon size={14} />
                </button>
              ))}
              <button className="ml-2 rounded-lg border border-slate-900/10 bg-white/80 px-4 py-2 text-[11px] font-semibold text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
                Preview
              </button>
            </div>
          </div>
        </div>


        {/* Feature icons */}
        {/* <div className="mx-auto mt-8 grid w-full max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {featureItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-slate-900/10 bg-white/75 p-4 text-center shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.035] dark:shadow-black/20 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/25 bg-violet-500/10 text-violet-700 shadow-[0_0_30px_rgba(139,92,246,0.16)] transition group-hover:text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-200 dark:shadow-[0_0_30px_rgba(139,92,246,0.22)] dark:group-hover:text-cyan-200">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-black text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-500">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div> */}

        <div className="mx-auto mt-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/15 text-violet-700 shadow-[0_0_30px_rgba(139,92,246,0.2)] dark:border-violet-400/40 dark:bg-violet-500/20 dark:text-violet-200 dark:shadow-[0_0_30px_rgba(139,92,246,0.35)]">
            <ArrowRight size={16} className="rotate-90" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-500">
            Scroll to explore
          </p>
        </div>
      </div>
    </section>
  );
}