"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";

const footerLinks = [
  {
    title: "Product",
    links: ["Features", "Templates", "Pricing", "AI Builder"],
  },
  {
    title: "Company",
    links: ["About", "Contact", "Careers", "Brand"],
  },
  {
    title: "Resources",
    links: ["Docs", "Examples", "Blog", "Changelog"],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    icon: FaGithub,
  },
  {
    label: "X",
    icon: FaXTwitter,
  },
  {
    label: "LinkedIn",
    icon: FaLinkedin,
  },
];

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative overflow-hidden border-t border-black/10 px-5 py-16 dark:border-white/10 md:px-8"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[320px] w-[620px] -translate-x-1/2 rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-[260px] w-[260px] rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65 }}
          className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)] md:p-10"
        >
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1.4fr_0.7fr]">
            <div>
              <CraftSiteLogo />

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-white/55">
                AI-powered website builder for creators, developers, startups,
                and agencies. Generate, preview, edit, and export stunning
                websites from a single prompt.
              </p>

              <button className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.2)] dark:border-white/10 dark:bg-white dark:text-slate-950">
                Start building
                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                    {group.title}
                  </p>

                  <div className="space-y-3">
                    {group.links.map((link) => (
                      <button
                        key={link}
                        className="block text-sm text-slate-600 transition hover:translate-x-1 hover:text-violet-700 dark:text-white/50 dark:hover:text-cyan-300"
                      >
                        {link}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-950 dark:text-white">
                Social
              </p>

              <div className="flex gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      aria-label={item.label}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white dark:hover:text-slate-950"
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-black/10 bg-white/65 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-sm font-bold text-slate-950 dark:text-white">
                  Built for shipping fast
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-white/50">
                  CraftSite helps you move from idea to website faster with AI.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />

          <div className="mt-8 flex flex-col justify-between gap-4 text-sm text-slate-500 dark:text-white/45 md:flex-row md:items-center">
            <p>
              © {new Date().getFullYear()} CraftSite AI. All rights reserved.
            </p>

            <div className="flex flex-wrap gap-5">
              <button className="transition hover:text-slate-950 dark:hover:text-white">
                Privacy Policy
              </button>
              <button className="transition hover:text-slate-950 dark:hover:text-white">
                Terms of Service
              </button>
              <button className="transition hover:text-slate-950 dark:hover:text-white">
                Cookie Policy
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
