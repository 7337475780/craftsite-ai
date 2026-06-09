"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is CraftSite AI?",
    answer: "CraftSite AI is a powerful platform that allows you to generate, edit, and publish production-ready React websites using artificial intelligence.",
  },
  {
    question: "Can I export the generated website?",
    answer: "Yes! You can instantly export your generated website as a fully functional ZIP file containing all the source code.",
  },
  {
    question: "Can I edit websites after generation?",
    answer: "Absolutely. Our AI edit mode allows you to iterate and refine your website by giving follow-up instructions, while preserving your version history.",
  },
  {
    question: "Do I need to know coding?",
    answer: "No coding knowledge is required. You can build and publish stunning websites simply by describing what you want.",
  },
  {
    question: "Can I publish/share my website?",
    answer: "Yes, you can generate public share links to showcase your projects instantly to clients, friends, or the public.",
  },
  {
    question: "Is CraftSite free?",
    answer: "We offer a free plan where you get starter credits to generate and edit websites. ZIP exports and public sharing are completely free.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-white/60">
            Everything you need to know about CraftSite AI.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition hover:border-white/20"
            >
              <button
                onClick={() => toggle(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-base font-medium text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-white/50 transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-white/60 text-sm leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
