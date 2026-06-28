"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { FaGithub, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import Link from "next/link";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Templates", href: "/#templates" },
      { label: "Workflow", href: "/#workflow" },
      { label: "Pricing", href: "/#pricing" },
      { label: "AI Builder", href: "/generate" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "Generate", href: "/generate" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Projects", href: "/projects" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#footer" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    icon: FaGithub,
    href: "https://github.com/craftsite-ai",
  },
  {
    label: "X",
    icon: FaXTwitter,
    href: "https://twitter.com/craftsite-ai",
  },
  {
    label: "LinkedIn",
    icon: FaLinkedin,
    href: "https://linkedin.com/company/craftsite-ai",
  },
];

export function Footer() {
  return (
    <footer
      id="footer"
      className="relative isolate overflow-hidden border-t border-slate-900/10 bg-transparent px-4 py-12 text-slate-950 dark:border-white/10 dark:text-white sm:px-6 sm:py-16 lg:px-8"
    >
      {/* Decorative glows only */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-[110px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="relative overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/75 p-6 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10"
        >
          {/* Top shine */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent dark:via-cyan-400/35" />

          <div className="grid gap-10 lg:grid-cols-[1.1fr_1.5fr_0.8fr] lg:gap-12">
            {/* Brand */}
            <div>
              <CraftSiteLogo />

              <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 dark:text-slate-400">
                AI-powered website builder for creators, developers, startups,
                and agencies. Generate, preview, edit, and export stunning
                websites from a single prompt.
              </p>

              <Link
                href="/generate"
                className="group mt-6 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(14,165,233,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.98] dark:from-violet-600 dark:via-purple-500 dark:to-blue-500 dark:shadow-[0_0_35px_rgba(124,58,237,0.35)]"
              >
                Start building
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footerLinks.map((group) => (
                <div key={group.title}>
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                    {group.title}
                  </p>

                  <div className="space-y-3">
                    {group.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="block text-sm font-medium text-slate-600 transition hover:translate-x-1 hover:text-violet-700 dark:text-slate-400 dark:hover:text-cyan-200"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-slate-950 dark:text-white">
                Connect
              </p>

              <div className="flex gap-3">
                {socialLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-900/10 bg-white/75 text-slate-700 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:border-violet-500/30 hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:border-cyan-300/30 dark:hover:bg-white dark:hover:text-slate-950"
                    >
                      <Icon size={18} />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-900/10 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-slate-950/40">
                <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-violet-700 dark:text-cyan-200">
                  <Sparkles size={14} />
                  CraftSite AI
                </div>

                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Build faster. Launch cleaner. Create websites with AI.
                </p>
              </div>
            </div>
          </div>

          <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent dark:via-white/10" />

          <div className="flex flex-col justify-between gap-4 text-sm text-slate-500 dark:text-slate-500 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} CraftSite AI. All rights reserved.</p>

            <div className="flex flex-wrap gap-5">
              <Link
                href="/privacy"
                className="transition hover:text-violet-700 dark:hover:text-cyan-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="transition hover:text-violet-700 dark:hover:text-cyan-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="transition hover:text-violet-700 dark:hover:text-cyan-200"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}