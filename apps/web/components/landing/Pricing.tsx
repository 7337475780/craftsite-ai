"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Zap } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for exploring CraftSite and testing ideas.",
    icon: Sparkles,
    features: [
      "5 AI website generations",
      "Basic templates",
      "Code copy",
      "Community support",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious builders who want to ship faster.",
    popular: true,
    icon: Zap,
    features: [
      "Unlimited projects",
      "Premium templates",
      "Export clean code",
      "Version history",
      "Priority AI generation",
    ],
    cta: "Start Pro",
  },
  {
    name: "Studio",
    price: "$49",
    description: "For agencies, freelancers, and growing teams.",
    icon: Crown,
    features: [
      "Team workspace",
      "Client projects",
      "Advanced exports",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Studio",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export function Pricing() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden px-5 py-28 md:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-pink-400/10 blur-3xl dark:bg-pink-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[320px] w-[320px] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-pink-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-pink-300">
            <Crown size={14} />
            Pricing
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Simple plans for every{" "}
            <span className="gradient-text">builder</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-white/60 md:text-lg">
            Start free, upgrade when you need more generations, premium
            templates, exports, and team workflows.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-6 lg:grid-cols-3"
        >
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                transition={{ duration: 0.55, ease: "easeOut" }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                }}
                className={`group relative overflow-hidden rounded-[2rem] border p-8 backdrop-blur-2xl transition ${
                  plan.popular
                    ? "border-violet-400/40 bg-slate-950 text-white shadow-[0_30px_100px_rgba(124,58,237,0.28)] dark:border-violet-400/50 dark:bg-white/[0.055]"
                    : "border-black/10 bg-white/75 text-slate-950 shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.035] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]"
                }`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-2xl dark:via-white/10" />
                </div>

                {plan.popular && (
                  <>
                    <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-1 text-xs font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.45)]">
                      Popular
                    </div>

                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
                  </>
                )}

                <div className="relative z-10">
                  <div
                    className={`mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                      plan.popular
                        ? "border-white/10 bg-white/10 text-cyan-200 shadow-[0_0_35px_rgba(56,189,248,0.18)]"
                        : "border-black/10 bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 shadow-[0_18px_40px_rgba(124,58,237,0.15)] dark:border-white/10 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200"
                    }`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-2xl font-black tracking-tight">
                    {plan.name}
                  </h3>

                  <p
                    className={`mt-3 leading-7 ${
                      plan.popular
                        ? "text-white/65"
                        : "text-slate-600 dark:text-white/55"
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-8 flex items-end gap-2">
                    <p className="text-5xl font-black tracking-tight">
                      {plan.price}
                    </p>
                    <p
                      className={`pb-2 text-sm ${
                        plan.popular
                          ? "text-white/45"
                          : "text-slate-500 dark:text-white/45"
                      }`}
                    >
                      /month
                    </p>
                  </div>

                  <button
                    className={`mt-8 w-full rounded-2xl px-5 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 ${
                      plan.popular
                        ? "bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 text-white shadow-[0_0_35px_rgba(124,58,237,0.45)] hover:shadow-[0_0_45px_rgba(124,58,237,0.6)]"
                        : "border border-violet-500/30 bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md hover:shadow-[0_12px_30px_rgba(124,58,237,0.35)] dark:border-white/10 dark:from-white/10 dark:to-white/10 dark:hover:from-white dark:hover:to-white dark:hover:text-slate-950"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div
                    className={`mt-8 h-px w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-transparent via-white/15 to-transparent"
                        : "bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10"
                    }`}
                  />

                  <div className="mt-8 space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-3">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-full ${
                            plan.popular
                              ? "bg-emerald-400/15 text-emerald-300"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          <Check size={15} />
                        </div>

                        <span
                          className={`text-sm ${
                            plan.popular
                              ? "text-white/72"
                              : "text-slate-600 dark:text-white/62"
                          }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
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
