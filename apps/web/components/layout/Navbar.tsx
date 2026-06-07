"use client";

import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Product",
    href: "#features",
    hasDropdown: true,
  },
  {
    label: "Templates",
    href: "#templates",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
  {
    label: "Resources",
    href: "#resources",
    hasDropdown: true,
  },
  {
    label: "Company",
    href: "#company",
    hasDropdown: true,
  },
];

export function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-2xl dark:border-white/5 dark:bg-black/35">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-400 shadow-[0_0_28px_rgba(124,58,237,0.45)] transition group-hover:scale-105">
            <span className="text-xl font-black text-white">C</span>
            <div className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.9)]" />
          </div>

          <div className="leading-none">
            <p className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              CraftSite
            </p>
            <p className="mt-1 hidden text-xs text-slate-500 dark:text-white/45 sm:block">
              AI Website Builder
            </p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 rounded-2xl border border-black/10 bg-white/50 p-1 text-sm text-slate-700 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:text-white/70 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-1 rounded-xl px-4 py-2 transition",
                "hover:bg-black/5 hover:text-slate-950",
                "dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              {item.label}
              {item.hasDropdown && (
                <ChevronDown
                  size={14}
                  className="opacity-60 transition group-hover:rotate-180"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/sign-in"
            className="hidden rounded-xl border border-black/10 bg-white/60 px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10 sm:block"
          >
            Sign in
          </Link>

          <Link
            href="/generate"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_30px_rgba(124,58,237,0.45)] transition hover:scale-[1.03]"
          >
            <Sparkles size={16} />
            <span className="hidden sm:inline">Start Building</span>
            <span className="sm:hidden">Start</span>
          </Link>
        </div>
      </div>
    </header>
  );
}