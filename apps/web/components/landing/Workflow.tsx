"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Download, Eye, Sparkles, Wand2 } from "lucide-react";

const steps = [
  {
    id: "01",
    title: "Describe your website",
    desc: "Type your idea in plain English and let CraftSite understand your goal.",
    icon: Sparkles,
    label: "Prompt",
  },
  {
    id: "02",
    title: "Preview instantly",
    desc: "Watch CraftSite generate a polished responsive website preview.",
    icon: Eye,
    label: "Preview",
  },
  {
    id: "03",
    title: "Refine with AI",
    desc: "Ask AI to update text, colors, layout, sections, or styling.",
    icon: Wand2,
    label: "Refine",
  },
  {
    id: "04",
    title: "Save & publish",
    desc: "Export clean code, save your project, or share a public URL.",
    icon: Download,
    label: "Launch",
  },
];

export function Workflow() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, 2200);

    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="workflow"
      className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-14 max-w-3xl text-center sm:mb-20"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200">
            Workflow
          </div>

          <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            A live path from{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              idea to website
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            A simple but powerful workflow that moves from prompt to preview,
            refinement, and publishing with a live progression effect.
          </p>
        </motion.div>

        {/* Desktop workflow */}
        <div className="relative hidden lg:block">
          {/* Center base line */}
          <div className="absolute left-[8%] right-[8%] top-[5.5rem] z-0 h-px bg-gradient-to-r from-transparent via-slate-900/15 to-transparent dark:via-white/15" />

          {/* Active segmented line */}
          <div className="absolute left-[8%] right-[8%] top-[5.5rem] z-0 grid grid-cols-3 gap-10">
            {[0, 1, 2].map((segment) => {
              const isCompleted = activeStep > segment;
              const isCurrent = activeStep === segment;

              return (
                <div key={segment} className="relative h-px overflow-visible">
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-white/10" />

                  <motion.div
                    animate={{
                      scaleX: isCompleted || isCurrent ? 1 : 0,
                      opacity: isCompleted || isCurrent ? 1 : 0.2,
                    }}
                    transition={{ duration: 0.75, ease: "easeInOut" }}
                    className="absolute inset-0 origin-left bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_24px_rgba(59,130,246,0.55)]"
                  />

                  {(isCompleted || isCurrent) && (
                    <motion.span
                      initial={{ left: "0%", opacity: 0 }}
                      animate={{
                        left: ["0%", "100%"],
                        opacity: [0, 1, 1, 0],
                      }}
                      transition={{
                        duration: 1.3,
                        repeat: isCurrent ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_22px_rgba(34,211,238,0.95)]"
                    />
                  )}

                  {/* Break dot */}
                  <span className="absolute right-[-1.55rem] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border border-white/70 bg-white shadow-[0_0_20px_rgba(124,58,237,0.25)] dark:border-cyan-300/30 dark:bg-[#02030d] dark:shadow-[0_0_22px_rgba(34,211,238,0.35)]" />
                </div>
              );
            })}
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const isDone = activeStep > index;

              return (
                <motion.article
                  key={step.id}
                  onMouseEnter={() => setActiveStep(index)}
                  animate={{
                    y: isActive ? -8 : 0,
                    scale: isActive ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`group relative overflow-hidden rounded-[1.6rem] border p-5 pt-14 backdrop-blur-xl transition-all duration-300 ${isActive
                    ? "border-violet-500/35 bg-white/90 shadow-[0_24px_70px_rgba(79,70,229,0.18)] dark:border-cyan-300/35 dark:bg-white/[0.075] dark:shadow-[0_0_60px_rgba(34,211,238,0.14)]"
                    : "border-slate-900/10 bg-white/60 shadow-[0_16px_45px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_18px_55px_rgba(0,0,0,0.28)]"
                    }`}
                >
                  {/* Soft top glow */}
                  <div
                    className={`pointer-events-none absolute inset-x-0 top-0 h-24 transition duration-500 ${isActive
                      ? "bg-gradient-to-b from-violet-500/18 via-blue-500/8 to-transparent dark:from-cyan-400/14"
                      : "bg-gradient-to-b from-slate-900/[0.03] to-transparent dark:from-white/[0.03]"
                      }`}
                  />

                  {/* Node */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.08, 1] : 1,
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={`absolute left-1/2 top-0 z-20 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border ${isActive
                      ? "border-violet-500/40 bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_34px_rgba(34,211,238,0.45)]"
                      : isDone
                        ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                        : "border-slate-900/10 bg-white text-slate-500 shadow-md dark:border-white/10 dark:bg-[#02030d] dark:text-slate-400"
                      }`}
                  >
                    <Icon size={19} />
                  </motion.div>

                  <div className="relative z-10">
                    <div className="mb-5 flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${isActive
                          ? "bg-violet-500/10 text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-200"
                          : "bg-slate-900/5 text-slate-500 dark:bg-white/[0.05] dark:text-slate-500"
                          }`}
                      >
                        {step.label}
                      </span>

                      <span
                        className={`text-3xl font-black tracking-[-0.08em] ${isActive
                          ? "text-violet-500/25 dark:text-cyan-400/25"
                          : "text-slate-200 dark:text-white/10"
                          }`}
                      >
                        {step.id}
                      </span>
                    </div>

                    <h3 className="text-lg font-black tracking-[-0.02em] text-slate-950 dark:text-white">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
                      {step.desc}
                    </p>

                    <div
                      className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${isActive
                        ? "bg-violet-500/10 text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-200"
                        : isDone
                          ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                          : "bg-slate-900/5 text-slate-500 dark:bg-white/[0.05] dark:text-slate-500"
                        }`}
                    >
                      <span>{isActive ? "Active" : isDone ? "Done" : "Next"}</span>
                      <ArrowRight
                        size={13}
                        className={isActive ? "animate-pulse" : ""}
                      />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* Mobile workflow */}
        <div className="relative space-y-5 lg:hidden">
          <div className="pointer-events-none absolute bottom-4 left-6 top-4 w-px bg-slate-900/10 dark:bg-white/10" />

          <motion.div
            animate={{
              height: `${((activeStep + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="pointer-events-none absolute left-6 top-4 w-px bg-gradient-to-b from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isDone = activeStep > index;

            return (
              <motion.article
                key={step.id}
                onMouseEnter={() => setActiveStep(index)}
                onClick={() => setActiveStep(index)}
                animate={{
                  x: isActive ? 4 : 0,
                  scale: isActive ? 1.01 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative pl-16"
              >
                <div
                  className={`absolute left-0 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border transition ${isActive
                    ? "border-violet-500/40 bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-[0_0_30px_rgba(34,211,238,0.45)]"
                    : isDone
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                      : "border-slate-900/10 bg-white text-slate-500 dark:border-white/10 dark:bg-[#02030d] dark:text-slate-400"
                    }`}
                >
                  <Icon size={18} />
                </div>

                <div
                  className={`overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-xl transition ${isActive
                    ? "border-violet-500/35 bg-white/90 shadow-[0_20px_60px_rgba(79,70,229,0.15)] dark:border-cyan-300/35 dark:bg-white/[0.075]"
                    : "border-slate-900/10 bg-white/65 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]"
                    }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`text-sm font-black tracking-[0.18em] ${isActive
                        ? "text-violet-700 dark:text-cyan-200"
                        : "text-slate-500 dark:text-slate-500"
                        }`}
                    >
                      {step.id}
                    </span>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-bold ${isActive
                        ? "bg-violet-500/10 text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-200"
                        : isDone
                          ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                          : "bg-slate-900/5 text-slate-500 dark:bg-white/[0.05]"
                        }`}
                    >
                      {isActive ? "ACTIVE" : isDone ? "DONE" : "NEXT"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-950 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-400">
                    {step.desc}
                  </p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}