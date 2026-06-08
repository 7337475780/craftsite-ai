"use client";

import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
  { label: "Product", targetId: "features" },
  { label: "Templates", targetId: "templates" },
  { label: "Pricing", targetId: "pricing" },
  { label: "Resources", targetId: "footer" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    const section = document.getElementById(targetId);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="fixed left-0 right-0 top-4 z-50 px-4"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* Soft outer glow — stronger when scrolled */}
        <div
          className={`absolute -inset-px rounded-4xl bg-linear-to-r from-white/30 via-violet-400/20 to-cyan-300/20 blur-2xl transition-opacity duration-500 dark:from-cyan-400/10 dark:via-violet-500/20 dark:to-fuchsia-500/10 ${
            scrolled ? "opacity-70 dark:opacity-80" : "opacity-40 dark:opacity-50"
          }`}
        />

        {/* Liquid glass navbar */}
        <div
          className={`liquid-glass relative flex h-16 items-center justify-between overflow-hidden rounded-4xl px-4 transition-shadow duration-300 md:px-6 ${
            scrolled
              ? "shadow-[0_12px_48px_rgba(15,23,42,0.15)] dark:shadow-[0_12px_48px_rgba(0,0,0,0.5)]"
              : ""
          }`}
        >
          {/* Moving glass shine */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-28 top-0 h-full w-44 rotate-12 bg-linear-to-r from-transparent via-white/24 to-transparent blur-2xl dark:via-white/8" />
          </div>

          {/* Top reflection */}
          <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/25" />

          {/* Bottom light edge */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

          {/* Logo */}
          <Link href="/" className="relative z-10 cursor-pointer">
            <CraftSiteLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="relative z-10 hidden items-center gap-2.5 lg:flex">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                onClick={() => scrollToSection(item.targetId)}
                className="group relative flex items-center gap-1.5 rounded-full border border-black/8 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md transition-colors duration-200 cursor-pointer hover:border-violet-500/40 hover:bg-white hover:text-violet-700 hover:shadow-[0_4px_16px_rgba(124,58,237,0.12)] dark:border-white/8 dark:bg-white/[0.04] dark:text-white/70 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white dark:hover:shadow-[0_4px_20px_rgba(139,92,246,0.15)]"
              >
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="relative z-10 flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden md:flex items-center justify-center rounded-full border border-black/8 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md transition-colors duration-200 cursor-pointer hover:border-violet-500/40 hover:bg-white hover:text-violet-700 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm backdrop-blur-md transition-colors duration-200 cursor-pointer hover:bg-red-500 hover:text-white dark:border-red-400/30"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="hidden sm:block"
              >
                <Link
                  href="/sign-in"
                  className="flex items-center justify-center rounded-full border border-black/8 bg-white/50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-md transition-colors duration-200 cursor-pointer hover:border-violet-500/40 hover:bg-white hover:text-violet-700 dark:border-white/8 dark:bg-white/[0.04] dark:text-white/70 dark:hover:border-violet-400/40 dark:hover:bg-violet-500/10 dark:hover:text-white"
                >
                  Sign in
                </Link>
              </motion.div>
            )}

            <motion.div
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <Link
                href="/generate"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-violet-500/20 bg-linear-to-r from-violet-600 via-purple-600 to-blue-500 px-5 py-2 text-sm font-bold text-white shadow-[0_4px_20px_rgba(124,58,237,0.3)] backdrop-blur-md transition-all duration-300 cursor-pointer hover:shadow-[0_4px_30px_rgba(124,58,237,0.5)] dark:border-violet-400/30"
              >
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/20 to-white/0 opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100" />
                <Sparkles size={14} className="relative z-10" />
                <span className="relative z-10 hidden sm:inline">Start Building</span>
                <span className="relative z-10 sm:hidden">Start</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
