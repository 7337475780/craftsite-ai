"use client";

import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";

const navItems = [
  { label: "Product", targetId: "features", hasDropdown: true },
  { label: "Templates", targetId: "templates" },
  { label: "Pricing", targetId: "pricing" },
  { label: "Resources", targetId: "footer", hasDropdown: true },
];

export function Navbar() {
  const scrollToSection = (targetId: string) => {
    const section = document.getElementById(targetId);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4">
      <div className="relative mx-auto max-w-7xl">
        {/* Soft realistic outer glow */}
        <div className="absolute -inset-px rounded-4xl bg-linear-to-r from-white/30 via-violet-400/20 to-cyan-300/20 opacity-50 blur-2xl dark:from-cyan-400/10 dark:via-violet-500/20 dark:to-fuchsia-500/10 dark:opacity-60" />

        {/* Liquid glass navbar */}
        <div className="liquid-glass relative flex h-16 items-center justify-between overflow-hidden rounded-4xl px-4 md:px-6">
          {/* Moving glass shine */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-28 top-0 h-full w-44 rotate-12 bg-linear-to-r from-transparent via-white/24 to-transparent blur-2xl dark:via-white/8" />
          </div>

          {/* Top reflection */}
          <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-linear-to-r from-transparent via-white/70 to-transparent dark:via-white/25" />

          {/* Bottom light edge */}
          <div className="pointer-events-none absolute inset-x-6 bottom-0 h-px bg-linear-to-r from-transparent via-violet-500/30 to-transparent" />

          {/* Logo */}
          <Link href="/" className="relative z-10">
            <CraftSiteLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="relative z-10 hidden items-center gap-1 rounded-2xl border border-black/10 bg-white/35 p-1 text-sm text-slate-700 shadow-inner backdrop-blur-2xl dark:border-white/10 dark:bg-white/4.5 dark:text-white/70 lg:flex">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => scrollToSection(item.targetId)}
                className="group relative flex items-center gap-1 overflow-hidden rounded-xl px-4 py-2 transition hover:text-slate-950 dark:hover:text-white"
              >
                <span className="absolute inset-0 rounded-xl bg-linear-to-r from-violet-500/0 via-violet-500/10 to-cyan-400/0 opacity-0 transition group-hover:opacity-100" />

                <span className="relative z-10">{item.label}</span>

                {item.hasDropdown && (
                  <ChevronDown
                    size={14}
                    className="relative z-10 opacity-60 transition group-hover:rotate-180"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="relative z-10 flex items-center gap-3">
            <ThemeToggle />

            <Link
              href="/sign-in"
              className="hidden rounded-xl border border-black/10 bg-white/45 px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-xl transition hover:bg-white/80 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 sm:block"
            >
              Sign in
            </Link>

            <Link
              href="/generate"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-violet-600 via-purple-600 to-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_35px_rgba(124,58,237,0.45)] transition hover:-translate-y-0.5 hover:scale-[1.02]"
            >
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-white/0 via-white/25 to-white/0 opacity-0 transition duration-700 group-hover:translate-x-full group-hover:opacity-100" />

              <Sparkles size={16} className="relative z-10" />

              <span className="relative z-10 hidden sm:inline">
                Start Building
              </span>

              <span className="relative z-10 sm:hidden">Start</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
