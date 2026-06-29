"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  MessageSquareText,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";

const steps = [
  {
    id: "01",
    label: "Describe",
    title: "Describe",
    desc: "Share your website idea in plain English",
    image: "/workflow/describe.png",
    icon: MessageSquareText,
    color: "from-violet-600 via-purple-500 to-indigo-500",
    activeBorder:
      "border-violet-500/55 shadow-[0_32px_90px_rgba(124,58,237,0.2)]",
    activeText: "text-violet-700 dark:text-violet-200",
  },
  {
    id: "02",
    label: "Preview",
    title: "Preview",
    desc: "AI builds your website instantly",
    image: "/workflow/preview.png",
    icon: Eye,
    color: "from-blue-600 via-sky-500 to-cyan-400",
    activeBorder:
      "border-blue-500/55 shadow-[0_32px_90px_rgba(59,130,246,0.2)]",
    activeText: "text-blue-700 dark:text-blue-200",
  },
  {
    id: "03",
    label: "Refine",
    title: "Refine",
    desc: "Edit, customize, and perfect it with AI",
    image: "/workflow/refine.png",
    icon: Wand2,
    color: "from-cyan-500 via-teal-400 to-sky-500",
    activeBorder:
      "border-cyan-500/55 shadow-[0_32px_90px_rgba(6,182,212,0.18)]",
    activeText: "text-cyan-700 dark:text-cyan-200",
  },
  {
    id: "04",
    label: "Export",
    title: "Export & Publish",
    desc: "Export code or publish your website",
    image: "/workflow/rocket.png",
    icon: Rocket,
    color: "from-cyan-500 via-blue-500 to-violet-500",
    activeBorder:
      "border-cyan-500/55 shadow-[0_32px_90px_rgba(14,165,233,0.18)]",
    activeText: "text-sky-700 dark:text-sky-200",
  },
];

const STEP_TIME = 1450;
const CARD_ACTIVATE_DELAY = 220;
const HOLD_TIME = 1750;
const LINE_EASE = [0.22, 1, 0.36, 1] as const;

export function Workflow() {
  const [activeStep, setActiveStep] = useState(0);
  const [lineTarget, setLineTarget] = useState(0);

  useEffect(() => {
    let current = 0;
    let lineTimer: ReturnType<typeof setTimeout>;
    let activeTimer: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      const next = (current + 1) % steps.length;

      if (next === 0) {
        setLineTarget(0);

        activeTimer = setTimeout(() => {
          setActiveStep(0);
          current = 0;
          lineTimer = setTimeout(runCycle, HOLD_TIME);
        }, CARD_ACTIVATE_DELAY);

        return;
      }

      setLineTarget(next);

      activeTimer = setTimeout(() => {
        setActiveStep(next);
        current = next;
        lineTimer = setTimeout(runCycle, HOLD_TIME);
      }, STEP_TIME + CARD_ACTIVATE_DELAY);
    };

    lineTimer = setTimeout(runCycle, HOLD_TIME);

    return () => {
      clearTimeout(lineTimer);
      clearTimeout(activeTimer);
    };
  }, []);

  const progressWidth = useMemo(() => {
    return `${(lineTarget / (steps.length - 1)) * 100}%`;
  }, [lineTarget]);

  const mobileProgressHeight = useMemo(() => {
    return `${((lineTarget + 1) / steps.length) * 100}%`;
  }, [lineTarget]);

  return (
    <section
      id="workflow"
      className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Soft background glows */}
      <div className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[130px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-10 right-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-cyan-400/10 blur-[130px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-5xl text-center sm:mb-20"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200">
            <Sparkles size={14} />
            CraftSite Workflow
          </div>

          <h2 className="text-balance text-4xl font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            From prompt to website in{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              4 simple steps
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            A crisp visual workflow where the line moves first, reaches the next
            phase, and then the card activates smoothly.
          </p>
        </motion.div>

        {/* Desktop workflow */}
        <div className="relative hidden lg:block">
          {/* Center progression line */}
          <div className="pointer-events-none absolute left-[7%] right-[7%] top-[12.65rem] z-0">
            <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-slate-900/10 dark:bg-white/10" />

            <motion.div
              animate={{ width: progressWidth }}
              transition={{ duration: STEP_TIME / 1000, ease: LINE_EASE }}
              className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_26px_rgba(34,211,238,0.52)]"
            />

            <motion.span
              animate={{ left: progressWidth }}
              transition={{ duration: STEP_TIME / 1000, ease: LINE_EASE }}
              className="absolute top-1/2 z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_5px_rgba(34,211,238,0.14),0_0_26px_rgba(34,211,238,0.9)]"
            >
              <span className="absolute inset-1 rounded-full bg-cyan-400" />
            </motion.span>

            {/* Nodes */}
            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
              {steps.map((step, index) => {
                const isReached = lineTarget >= index;
                const isActive = activeStep === index;

                return (
                  <span
                    key={step.id}
                    className={`relative z-20 h-5 w-5 rounded-full border transition-all duration-300 ${isActive
                      ? "border-white bg-cyan-400 shadow-[0_0_0_6px_rgba(34,211,238,0.16),0_0_26px_rgba(34,211,238,0.85)] dark:border-[#02030d]"
                      : isReached
                        ? "border-cyan-400 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.65)]"
                        : "border-slate-300 bg-white dark:border-white/20 dark:bg-[#02030d]"
                      }`}
                  />
                );
              })}
            </div>

            {/* Clean line breaks between phases */}
            <div className="absolute inset-x-0 top-1/2 grid -translate-y-1/2 grid-cols-3 gap-[10%]">
              {[0, 1, 2].map((segment) => (
                <div key={segment} className="relative h-10">
                  <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white bg-white shadow-[0_0_18px_rgba(124,58,237,0.2)] dark:border-white/10 dark:bg-[#02030d]" />
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              const isReached = lineTarget >= index;
              const isDone = activeStep > index;

              return (
                <motion.article
                  key={step.id}
                  animate={{
                    y: isActive ? -14 : 0,
                    scale: isActive ? 1.035 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 30,
                    mass: 0.75,
                  }}
                  className={`group relative min-h-[25rem] overflow-visible rounded-[2.2rem] border bg-white/78 p-6 pt-16 text-center backdrop-blur-2xl transition-all duration-300 ease-out dark:bg-white/[0.045] ${isActive
                    ? `${step.activeBorder} dark:border-cyan-300/45 dark:shadow-[0_32px_90px_rgba(34,211,238,0.14)]`
                    : isReached
                      ? "border-cyan-400/25 shadow-[0_20px_65px_rgba(14,165,233,0.1)] dark:border-cyan-300/20"
                      : "border-slate-900/10 shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:shadow-[0_20px_70px_rgba(0,0,0,0.3)]"
                    }`}
                >
                  {/* Active moving border */}
                  {isActive && (
                    <motion.div
                      layoutId="workflow-active-card-border"
                      className="pointer-events-none absolute inset-0 rounded-[2.2rem] border-2 border-blue-500/65 shadow-[0_0_40px_rgba(59,130,246,0.28)] dark:border-cyan-300/55 dark:shadow-[0_0_50px_rgba(34,211,238,0.2)]"
                      transition={{
                        type: "spring",
                        stiffness: 420,
                        damping: 34,
                        mass: 0.75,
                      }}
                    />
                  )}

                  {/* Card glow */}
                  <div
                    className={`pointer-events-none absolute inset-x-6 top-0 h-36 rounded-full bg-gradient-to-br ${step.color} blur-3xl transition duration-300 ease-out ${isActive
                      ? "opacity-24"
                      : isReached
                        ? "opacity-14"
                        : "opacity-[0.07]"
                      }`}
                  />

                  {/* Number badge */}
                  <motion.div
                    animate={{
                      scale: isActive ? [1, 1.045, 1] : 1,
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: isActive ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                    className={`absolute left-1/2 top-0 z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-2xl font-black text-white transition ${isReached
                      ? `bg-gradient-to-br ${step.color} shadow-[0_18px_50px_rgba(59,130,246,0.32)]`
                      : "bg-slate-300 text-slate-600 shadow-lg dark:bg-white/10 dark:text-slate-400"
                      }`}
                  >
                    {step.id}
                  </motion.div>

                  {/* Illustration */}
                  <div className="relative mx-auto mb-7 flex h-40 w-40 items-center justify-center">
                    <motion.div
                      animate={{
                        y: isActive ? [-2, 2, -2] : 0,
                        scale: isActive ? 1.035 : 1,
                      }}
                      transition={{
                        duration: 3.2,
                        repeat: isActive ? Infinity : 0,
                        ease: "easeInOut",
                      }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={step.image}
                        alt={`${step.title} workflow illustration`}
                        fill
                        sizes="160px"
                        className="object-contain drop-shadow-[0_24px_45px_rgba(59,130,246,0.16)]"
                        priority={index === 0}
                      />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
                    {step.title}
                  </h3>

                  <div
                    className={`mx-auto mt-3 h-1 w-10 rounded-full bg-gradient-to-r ${step.color}`}
                  />

                  <p className="mx-auto mt-5 max-w-[13rem] text-sm font-semibold leading-7 text-slate-600 dark:text-slate-400">
                    {step.desc}
                  </p>

                  <div
                    className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${isActive
                      ? "bg-blue-500/10 text-blue-700 dark:bg-cyan-400/10 dark:text-cyan-200"
                      : isDone
                        ? "bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                        : isReached
                          ? "bg-violet-500/10 text-violet-700 dark:bg-white/[0.05] dark:text-cyan-200"
                          : "bg-slate-900/5 text-slate-500 dark:bg-white/[0.05] dark:text-slate-500"
                      }`}
                  >
                    {isActive
                      ? "Active phase"
                      : isDone
                        ? "Completed"
                        : isReached
                          ? "Reached"
                          : "Next"}
                    <ArrowRight
                      size={13}
                      className={isActive ? "animate-pulse" : ""}
                    />
                  </div>
                </motion.article>
              );
            })}
          </div>

          {/* Bottom controller */}
          <div className="mx-auto mt-20 max-w-4xl rounded-full border border-slate-900/10 bg-white/82 p-3 shadow-[0_20px_65px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            <div className="relative grid grid-cols-4 gap-2">
              <div className="absolute left-[12%] right-[12%] top-1/2 h-px -translate-y-1/2 bg-slate-900/10 dark:bg-white/10" />

              <motion.div
                animate={{ width: progressWidth }}
                transition={{ duration: STEP_TIME / 1000, ease: LINE_EASE }}
                className="absolute left-[12%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              />

              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = activeStep === index;
                const isReached = lineTarget >= index;

                return (
                  <div
                    key={step.id}
                    className={`relative z-10 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-black transition-all duration-300 ${isActive
                      ? "bg-white text-violet-700 shadow-sm border border-slate-200 dark:border-white/10 dark:bg-white/10 dark:text-cyan-200"
                      : isReached
                        ? "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 dark:bg-[#090b16] dark:border-white/5 dark:text-slate-300 dark:hover:bg-[#111428]"
                        : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 dark:bg-[#090b16] dark:border-white/5 dark:text-slate-500 dark:hover:bg-[#111428] dark:hover:text-slate-300"
                      }`}
                  >
                    <Icon size={18} />
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile workflow */}
        <div className="relative space-y-5 lg:hidden">
          <div className="pointer-events-none absolute bottom-4 left-6 top-4 w-px bg-slate-900/10 dark:bg-white/10" />

          <motion.div
            animate={{ height: mobileProgressHeight }}
            transition={{ duration: STEP_TIME / 1000, ease: LINE_EASE }}
            className="pointer-events-none absolute left-6 top-4 w-px bg-gradient-to-b from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.45)]"
          />

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === index;
            const isReached = lineTarget >= index;
            const isDone = activeStep > index;

            return (
              <motion.article
                key={step.id}
                animate={{
                  x: isActive ? 4 : 0,
                  scale: isActive ? 1.01 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 30,
                  mass: 0.75,
                }}
                className="relative pl-16"
              >
                <div
                  className={`absolute left-0 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border transition-all duration-300 ${isActive
                    ? `border-transparent bg-gradient-to-br ${step.color} text-white shadow-[0_0_28px_rgba(34,211,238,0.42)]`
                    : isReached
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-600 dark:text-cyan-200"
                      : "border-slate-900/10 bg-white text-slate-500 dark:border-white/10 dark:bg-[#02030d] dark:text-slate-400"
                    }`}
                >
                  <Icon size={18} />
                </div>

                <div
                  className={`overflow-hidden rounded-[1.5rem] border p-5 backdrop-blur-xl transition-all duration-300 ease-out ${isActive
                    ? "border-violet-500/35 bg-white/90 shadow-[0_20px_60px_rgba(79,70,229,0.15)] dark:border-cyan-300/35 dark:bg-white/[0.075]"
                    : isReached
                      ? "border-cyan-400/25 bg-white/75 shadow-[0_14px_42px_rgba(14,165,233,0.08)] dark:border-cyan-300/20 dark:bg-white/[0.045]"
                      : "border-slate-900/10 bg-white/65 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/[0.035]"
                    }`}
                >
                  <div className="mb-4 flex h-24 items-center justify-center">
                    <Image
                      src={step.image}
                      alt={`${step.title} workflow illustration`}
                      width={96}
                      height={96}
                      className="h-24 w-24 object-contain drop-shadow-[0_18px_35px_rgba(59,130,246,0.14)]"
                    />
                  </div>

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
                          : isReached
                            ? "bg-blue-500/10 text-blue-700 dark:text-cyan-200"
                            : "bg-slate-900/5 text-slate-500 dark:bg-white/[0.05]"
                        }`}
                    >
                      {isActive
                        ? "ACTIVE"
                        : isDone
                          ? "DONE"
                          : isReached
                            ? "REACHED"
                            : "NEXT"}
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