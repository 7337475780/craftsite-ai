"use client";

import { motion } from "framer-motion";

const steps = [
  { num: "01", title: "Describe your website", desc: "Just type what you want in plain English." },
  { num: "02", title: "Preview instantly", desc: "See your fully functioning React site generated live." },
  { num: "03", title: "Refine with AI", desc: "Select any element and ask AI to change its color, layout, or text." },
  { num: "04", title: "Save, export & publish", desc: "Download the ZIP code or share a public URL." },
];

export function Workflow() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            How it works
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/[0.02]"
            >
              <div className="text-4xl font-black text-violet-500/20 dark:text-cyan-400/20 mb-4">{step.num}</div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-slate-600 dark:text-white/60 text-sm leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
