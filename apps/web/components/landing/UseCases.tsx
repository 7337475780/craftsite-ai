"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Code,
  Presentation,
  Rocket,
  Smartphone,
  Sparkles,
  Store,
} from "lucide-react";

const useCases = [
  {
    title: "Portfolio websites",
    desc: "Showcase your work, projects, skills, and story with a polished personal brand website.",
    icon: Briefcase,
    glow: "from-violet-500/25 to-blue-500/10",
  },
  {
    title: "SaaS landing pages",
    desc: "Launch conversion-focused pages with hero sections, pricing, testimonials, and CTAs.",
    icon: Rocket,
    glow: "from-cyan-500/25 to-blue-500/10",
  },
  {
    title: "Startup MVP pages",
    desc: "Validate ideas quickly with modern launch pages, waitlists, and product storytelling.",
    icon: Presentation,
    glow: "from-blue-500/25 to-violet-500/10",
  },
  {
    title: "Agency mockups",
    desc: "Present high-quality website concepts to clients before writing production code.",
    icon: Code,
    glow: "from-fuchsia-500/25 to-violet-500/10",
  },
  {
    title: "App showcases",
    desc: "Highlight your product features, screenshots, benefits, and download CTAs beautifully.",
    icon: Smartphone,
    glow: "from-sky-500/25 to-cyan-500/10",
  },
  {
    title: "Ecommerce storefronts",
    desc: "Create clean product pages, storefront layouts, customer proof, and checkout-ready sections.",
    icon: Store,
    glow: "from-violet-500/25 to-cyan-500/10",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 28,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export function UseCases() {
  return (
    <section className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      {/* Decorative glows only — keeps shared page background continuous */}
      <div className="pointer-events-none absolute left-0 top-24 -z-10 h-96 w-96 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-10 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200 dark:shadow-violet-950/30">
            <Sparkles size={14} />
            Use cases
          </div>

          <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Built for every{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              website idea
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Whether you are building for yourself, a client, a startup, or a
            product launch, CraftSite gives you a premium starting point in
            seconds.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;

            return (
              <motion.article
                key={useCase.title}
                variants={cardVariants}
                transition={{ duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.015 }}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-violet-500/30 hover:shadow-[0_30px_90px_rgba(79,70,229,0.18)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.36)] dark:hover:border-cyan-300/30 sm:p-7"
              >
                <div
                  className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${useCase.glow} opacity-70 blur-2xl transition duration-500 group-hover:opacity-100`}
                />

                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/45 to-transparent blur-2xl dark:via-white/10" />
                </div>

                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 shadow-[0_18px_40px_rgba(124,58,237,0.12)] transition duration-300 group-hover:scale-105 group-hover:text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-cyan-200 dark:shadow-[0_0_34px_rgba(139,92,246,0.2)] dark:group-hover:text-cyan-100">
                      <Icon size={24} />
                    </div>

                    <span className="rounded-full border border-slate-900/10 bg-white/70 px-3 py-1.5 text-xs font-black text-slate-500 backdrop-blur dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="text-xl font-black tracking-[-0.02em] text-slate-950 dark:text-white">
                    {useCase.title}
                  </h3>

                  <p className="mt-3 flex-1 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                    {useCase.desc}
                  </p>

                  <div className="mt-7 flex items-center gap-2 text-sm font-bold text-violet-700 transition dark:text-cyan-200">
                    <span>Generate this</span>
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/70 p-5 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:p-6"
        >
          <div className="grid gap-4 text-center sm:grid-cols-3">
            {[
              ["6+", "Website categories"],
              ["60 sec", "First draft speed"],
              ["100%", "Responsive output"],
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
        </motion.div>
      </div>
    </section>
  );
}