"use client";

import { ArrowRight, CheckCircle2, Sparkles, Wand2, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { trackClientEvent } from "@/lib/analytics-client";

const benefits = [
  "Free to start",
  "No credit card required",
  "Export-ready code",
];

export function CTA() {
  return (
    <section className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[110px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[110px] dark:bg-cyan-400/15" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/75 p-6 text-center shadow-[0_28px_90px_rgba(79,70,229,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_30px_100px_rgba(0,0,0,0.45)] sm:p-10 md:p-14 lg:p-16"
      >
        {/* Inner glow layers */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/25" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/20" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent dark:via-cyan-400/40" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 shadow-[0_0_40px_rgba(139,92,246,0.18)] dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-cyan-200 dark:shadow-[0_0_45px_rgba(139,92,246,0.35)]">
            <Sparkles size={26} />
          </div>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-violet-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200">
            <Wand2 size={13} />
            Launch faster with AI
          </div>

          <h2 className="mx-auto max-w-4xl text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Ready to craft your{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              next website?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Start from a single prompt and turn your idea into a polished,
            responsive website in seconds. Preview, refine, export, and publish
            from one AI-powered workspace.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-600 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
              >
                <CheckCircle2 size={14} className="text-cyan-500 dark:text-cyan-300" />
                {benefit}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href="/generate"
              onClick={() =>
                trackClientEvent("landing_cta_clicked", {
                  target: "generate",
                })
              }
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-7 py-4 text-sm font-extrabold text-white shadow-[0_18px_45px_rgba(79,70,229,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(14,165,233,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.98] dark:from-violet-600 dark:via-purple-500 dark:to-blue-500 dark:shadow-[0_0_38px_rgba(124,58,237,0.42)] dark:hover:shadow-[0_0_55px_rgba(59,130,246,0.45)] dark:focus-visible:ring-cyan-300/70 sm:w-auto"
            >
              <Zap size={16} />
              Start Building Now
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>

            <Link
              href="/#features"
              onClick={() =>
                trackClientEvent("landing_cta_clicked", {
                  target: "features",
                })
              }
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-900/10 bg-white/75 px-7 py-4 text-sm font-bold text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-950 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-cyan-300/60 sm:w-auto"
            >
              See Features
            </Link>
          </div>

          <p className="mt-6 text-xs font-medium text-slate-500 dark:text-slate-500">
            Build your first AI-generated website in under a minute.
          </p>
        </div>
      </motion.div>
    </section>
  );
}