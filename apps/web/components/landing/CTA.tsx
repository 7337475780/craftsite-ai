"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { trackClientEvent } from "@/lib/analytics-client";

export function CTA() {
  return (
    <section className="px-5 py-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)] md:p-16"
      >
        {/* Background orb glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/25" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-400/20" />

        {/* Top shine */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/30" />

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-white shadow-[0_0_45px_rgba(139,92,246,0.4)]">
            <Sparkles size={26} />
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Ready to craft your{" "}
            <span className="gradient-text">next website?</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-slate-600 dark:text-white/55 md:text-lg">
            Start from a single prompt and turn your idea into a polished,
            responsive website in seconds. No code required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/generate"
              onClick={() => trackClientEvent("landing_cta_clicked", { target: "generate" })}
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-8 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(124,58,237,0.45)] transition hover:scale-[1.03] hover:shadow-[0_0_55px_rgba(124,58,237,0.6)]"
            >
              <span>Start Building Now</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/#features"
              onClick={() => trackClientEvent("landing_cta_clicked", { target: "features" })}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white hover:shadow-md dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/10"
            >
              See Features
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400 dark:text-white/30">
            Free to start · No credit card required
          </p>
        </div>
      </motion.div>
    </section>
  );
}

