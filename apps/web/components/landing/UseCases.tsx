"use client";

import { motion } from "framer-motion";

const useCases = [
  "Portfolio websites",
  "SaaS landing pages",
  "Startup MVP pages",
  "Product launch pages",
  "Agency mockups",
  "Hackathon projects"
];

export function UseCases() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl mb-12">
          Built for every use case
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          {useCases.map((useCase, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="px-6 py-3 rounded-full border border-black/10 dark:border-white/10 bg-white dark:bg-slate-950 text-slate-700 dark:text-white/80 font-medium"
            >
              {useCase}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
