"use client";

import { motion } from "framer-motion";
import { Bot, Code2, Eye, FileCode2, Layers3, Rocket } from "lucide-react";

const features = [
  {
    title: "AI Website Generation",
    description:
      "Turn plain English prompts into complete, responsive website sections with polished UI.",
    icon: Bot,
  },
  {
    title: "Live Preview",
    description:
      "Preview generated pages instantly and see your website come alive in real time.",
    icon: Eye,
  },
  {
    title: "Editable Code",
    description:
      "Get clean React and Tailwind code that you can customize, export, and ship.",
    icon: Code2,
  },
  {
    title: "Smart Templates",
    description:
      "Start from SaaS, portfolio, agency, restaurant, AI startup, and ecommerce layouts.",
    icon: Layers3,
  },
  {
    title: "Export Code",
    description:
      "Download production-ready code for your project without messy generated output.",
    icon: FileCode2,
  },
  {
    title: "Deploy Ready",
    description:
      "Designed for real deployment workflows with Vercel, domains, and future hosting tools.",
    icon: Rocket,
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
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

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden px-5 py-28 md:px-8"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-90 w-90 -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-70 w-70 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-violet-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/4 dark:text-cyan-300">
            Features
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Everything needed to build{" "}
            <span className="gradient-text">without limits</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-white/60 md:text-lg">
            CraftSite gives creators and developers an AI-powered workspace for
            building polished websites without starting from zero.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                transition={{
                  duration: 0.55,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                }}
                className="group relative overflow-hidden rounded-4xl border border-black/10 bg-white/75 p-7 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]"
              >
                {/* Card shine */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-20 top-0 h-full w-32 rotate-12 bg-linear-to-r from-transparent via-white/35 to-transparent blur-2xl dark:via-white/10" />
                </div>

                {/* Accent glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20 dark:bg-violet-500/15 dark:group-hover:bg-cyan-400/20" />

                <div className="relative z-10">
                  <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-linear-to-br from-violet-100 to-cyan-100 text-violet-700 shadow-[0_18px_40px_rgba(124,58,237,0.15)] transition group-hover:scale-110 dark:border-white/10 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200 dark:shadow-[0_0_35px_rgba(139,92,246,0.16)]">
                    <Icon size={25} />
                  </div>

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-black tracking-tight text-slate-950 dark:text-white">
                      {feature.title}
                    </h3>

                    <span className="rounded-full border border-black/10 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/4 dark:text-white/40">
                      0{index + 1}
                    </span>
                  </div>

                  <p className="leading-7 text-slate-600 dark:text-white/55">
                    {feature.description}
                  </p>

                  <div className="mt-7 h-px w-full bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />

                  <div className="mt-5 flex items-center justify-between text-sm font-semibold text-violet-700 dark:text-cyan-300">
                    <span>Explore feature</span>
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
