"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is CraftSite AI?",
    answer:
      "CraftSite AI is a platform that helps you generate, edit, preview, and export production-ready React websites using AI.",
  },
  {
    question: "Can I export the generated website?",
    answer:
      "Yes. You can export your generated website as clean source code, including React and Tailwind files, so you can customize and deploy it anywhere.",
  },
  {
    question: "Can I edit websites after generation?",
    answer:
      "Absolutely. You can refine the generated website using follow-up prompts, update sections, improve copy, change styling, and keep improving the result.",
  },
  {
    question: "Do I need to know coding?",
    answer:
      "No coding knowledge is required to generate a website. Developers can also use CraftSite to speed up UI drafts and export cleaner starter code.",
  },
  {
    question: "Can I publish or share my website?",
    answer:
      "Yes. CraftSite is designed to support public sharing and publishing workflows, so you can showcase your generated websites quickly.",
  },
  {
    question: "Is CraftSite free?",
    answer:
      "CraftSite includes a free plan to help you get started. You can upgrade later when you need more generations, exports, templates, or advanced features.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Decorative glows only — keeps shared page background continuous */}
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200">
            <HelpCircle size={14} />
            FAQ
          </div>

          <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Questions before you{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              start building?
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Everything you need to know about generating, editing, exporting,
            and publishing websites with CraftSite AI.
          </p>
        </motion.div>

        {/* FAQ Card */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/70 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-4"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/35" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/15" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/15" />

          <div className="relative z-10 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className={`overflow-hidden rounded-[1.35rem] border transition-all duration-300 ${isOpen
                    ? "border-violet-500/30 bg-white/90 shadow-[0_18px_50px_rgba(79,70,229,0.12)] dark:border-cyan-300/30 dark:bg-white/[0.075] dark:shadow-[0_0_45px_rgba(34,211,238,0.08)]"
                    : "border-slate-900/10 bg-white/55 hover:border-violet-500/25 hover:bg-white/75 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-300/25 dark:hover:bg-white/[0.055]"
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="flex items-center gap-4">
                      <span
                        className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl border text-xs font-black sm:flex ${isOpen
                          ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                          : "border-slate-900/10 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
                          }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-base font-black tracking-[-0.01em] text-slate-950 dark:text-white sm:text-lg">
                        {faq.question}
                      </span>
                    </span>

                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition ${isOpen
                        ? "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:text-cyan-200"
                        : "border-slate-900/10 bg-white/70 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
                        }`}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                          }`}
                      />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          duration: 0.28,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="px-5 pb-5 sm:px-6">
                          <div className="ml-0 border-t border-slate-900/10 pt-4 dark:border-white/10 sm:ml-13">
                            <p className="text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                              {faq.answer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-3 rounded-2xl border border-slate-900/10 bg-white/65 px-5 py-4 text-center text-sm font-semibold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
        >
          <Sparkles size={16} className="text-violet-700 dark:text-cyan-200" />
          Still have questions? Start building and explore the workflow live.
        </motion.div>
      </div>
    </section>
  );
}