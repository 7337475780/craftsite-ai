"use client";

import {
  ArrowRight,
  Bot,
  Code2,
  Eye,
  FileCode2,
  Layers3,
  Rocket,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "AI Website Generation",
    description:
      "Turn plain English prompts into complete, responsive website sections with polished UI and clean structure.",
    icon: Bot,
    glow: "from-violet-500/25 to-blue-500/10",
  },
  {
    title: "Live Preview",
    description:
      "Preview generated pages instantly and see your website come alive in real time across devices.",
    icon: Eye,
    glow: "from-cyan-500/25 to-blue-500/10",
  },
  {
    title: "Editable Code",
    description:
      "Get clean React and Tailwind code that you can refine, customize, export, and ship.",
    icon: Code2,
    glow: "from-blue-500/25 to-violet-500/10",
  },
  {
    title: "Smart Templates",
    description:
      "Start from SaaS, portfolio, agency, restaurant, AI startup, and ecommerce layouts.",
    icon: Layers3,
    glow: "from-fuchsia-500/25 to-violet-500/10",
  },
  {
    title: "Export Code",
    description:
      "Download production-ready code for your project without messy generated output.",
    icon: FileCode2,
    glow: "from-sky-500/25 to-cyan-500/10",
  },
  {
    title: "Deploy Ready",
    description:
      "Designed for real deployment workflows with Vercel, domains, and future hosting tools.",
    icon: Rocket,
    glow: "from-violet-500/25 to-cyan-500/10",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative isolate overflow-hidden bg-slate-50 px-4 py-16 text-slate-950 dark:bg-[#02030d] dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_50%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(124,58,237,0.24),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.14),transparent_26%),linear-gradient(180deg,#02030d_0%,#050719_52%,#02030d_100%)]" />

      <div className="absolute inset-0 -z-20 opacity-40 [background-image:radial-gradient(rgba(15,23,42,0.14)_1px,transparent_1px)] [background-size:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_75%)] dark:[background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)]" />

      <div className="pointer-events-none absolute -left-32 top-20 -z-10 h-80 w-80 rounded-full bg-violet-500/20 blur-[110px] dark:bg-violet-600/25" />
      <div className="pointer-events-none absolute -right-32 bottom-20 -z-10 h-80 w-80 rounded-full bg-cyan-400/20 blur-[110px] dark:bg-cyan-400/20" />

      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl text-center sm:mb-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200 dark:shadow-violet-950/30">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 text-violet-700 dark:bg-violet-500/20 dark:text-cyan-200">
              <Sparkles size={12} />
            </span>
            Features
          </div>

          <h2 className="text-balance text-3xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
            Everything needed to build{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              without limits
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
            CraftSite gives creators and developers an AI-powered workspace for
            building polished websites without starting from zero.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-900/10 bg-white/75 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:shadow-[0_28px_80px_rgba(79,70,229,0.16)] dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] dark:hover:border-cyan-300/30 dark:hover:bg-white/[0.07] sm:p-6 lg:p-7"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${feature.glow} opacity-80 blur-2xl transition duration-300 group-hover:opacity-100`}
                />

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 shadow-[0_0_34px_rgba(139,92,246,0.16)] transition duration-300 group-hover:scale-105 group-hover:text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-200 dark:shadow-[0_0_34px_rgba(139,92,246,0.22)] dark:group-hover:text-cyan-200">
                      <Icon size={24} />
                    </div>

                    <span className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-500 backdrop-blur dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-black tracking-[-0.02em] text-slate-950 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                    {feature.description}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-sm font-bold text-violet-700 transition dark:text-cyan-200">
                    <span>Explore feature</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bottom highlight strip */}
        <div className="mt-8 rounded-[2rem] border border-slate-900/10 bg-white/75 p-4 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6">
          <div className="grid gap-4 text-center sm:grid-cols-3">
            {[
              ["10x", "Faster website drafts"],
              ["100%", "Responsive output"],
              ["1-click", "Export-ready code"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-3xl border border-slate-900/10 bg-slate-50/80 px-4 py-5 dark:border-white/10 dark:bg-slate-950/40"
              >
                <p className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-3xl font-black text-transparent dark:from-cyan-300 dark:to-violet-400">
                  {value}
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}