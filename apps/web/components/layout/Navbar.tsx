"use client";

import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";

const navItems = [
  { label: "Product", targetId: "features" },
  { label: "Workflow", targetId: "workflow" },
  { label: "Templates", targetId: "templates" },
  { label: "Pricing", targetId: "pricing" },
  { label: "Resources", targetId: "footer" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);

      const currentSection = navItems.find((item) => {
        const section = document.getElementById(item.targetId);
        if (!section) return false;

        const rect = section.getBoundingClientRect();
        return rect.top <= 140 && rect.bottom >= 140;
      });

      setActiveSection(currentSection?.targetId || "");
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (targetId: string) => {
    setIsMobileMenuOpen(false);

    const section = document.getElementById(targetId);
    if (!section) return;

    const yOffset = -88;
    const y =
      section.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -90, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-[100] px-3 pt-3 sm:px-4"
      >
        <div
          className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border px-4 transition-all duration-300 sm:px-5 lg:px-6 ${scrolled
            ? "border-slate-900/10 bg-white/80 shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#050816]/80 dark:shadow-[0_18px_70px_rgba(0,0,0,0.45)]"
            : "border-transparent bg-transparent"
            }`}
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="CraftSite AI home"
            className="relative z-10 flex min-w-0 items-center"
          >
            <CraftSiteLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => {
              const isActive = activeSection === item.targetId;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => scrollToSection(item.targetId)}
                  className={`group relative overflow-hidden rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${isActive
                    ? "text-violet-700 dark:text-cyan-200"
                    : "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
                    }`}
                >
                  {/* Active pill */}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-link-pill"
                      className="absolute inset-0 rounded-full border border-violet-500/20 bg-violet-500/10 shadow-[0_8px_24px_rgba(124,58,237,0.12)] dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                      transition={{ duration: 0.28, ease: "easeOut" }}
                    />
                  )}

                  {/* Hover pill */}
                  <span className="absolute inset-0 rounded-full bg-slate-900/[0.045] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-white/[0.06]" />

                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {user ? (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/dashboard"
                  className="rounded-2xl border border-slate-900/10 bg-white/60 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-900/[0.045] hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-200"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl px-4 py-2 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="hidden rounded-2xl px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-900/5 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-cyan-200 sm:inline-flex"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/generate"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-4 py-2.5 text-sm font-extrabold text-white shadow-[0_16px_38px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_48px_rgba(14,165,233,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.98] dark:from-violet-600 dark:via-purple-500 dark:to-blue-500 dark:shadow-[0_0_28px_rgba(124,58,237,0.35)] sm:px-5"
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Start Building</span>
              <span className="sm:hidden">Start</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-900/10 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-white hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:text-cyan-200 lg:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-slate-950/30 backdrop-blur-sm dark:bg-black/50 lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -18, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-x-3 top-24 z-[99] overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/90 shadow-[0_28px_90px_rgba(15,23,42,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#050816]/95 dark:shadow-[0_28px_90px_rgba(0,0,0,0.55)] lg:hidden"
            >
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/25" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />

              <div className="relative z-10 p-5">
                <nav className="grid gap-2">
                  {navItems.map((item) => {
                    const isActive = activeSection === item.targetId;

                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => scrollToSection(item.targetId)}
                        className={`flex items-center justify-center rounded-2xl border px-4 py-3 text-center text-base font-black transition ${isActive
                          ? "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200"
                          : "border-slate-900/10 bg-white/60 text-slate-700 hover:bg-white hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-200"
                          }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </nav>

                <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent dark:via-white/10" />

                <div className="flex items-center justify-between rounded-2xl border border-slate-900/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
                  <span className="text-sm font-black text-slate-700 dark:text-slate-300">
                    Theme
                  </span>
                  <ThemeToggle />
                </div>

                {user ? (
                  <div className="mt-4 grid gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)]"
                    >
                      Go to Dashboard
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/15"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Link
                      href="/sign-in"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center rounded-2xl border border-slate-900/10 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:text-cyan-200"
                    >
                      Sign in
                    </Link>

                    <Link
                      href="/generate"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-3 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)]"
                    >
                      <Sparkles size={14} />
                      Start
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Space because navbar is fixed */}
      <div className="h-20" />
    </>
  );
}