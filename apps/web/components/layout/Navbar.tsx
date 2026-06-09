"use client";

import Link from "next/link";
import { ChevronDown, Sparkles, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    setIsMobileMenuOpen(false);
    const section = document.getElementById(targetId);
    if (!section) return;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", window.location.pathname);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`sticky top-0 z-[100] w-full transition-all duration-300 border-b ${
          scrolled
            ? "border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-xl shadow-[var(--shadow-sm)]"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          
          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center gap-2">
            <CraftSiteLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => scrollToSection(item.targetId)}
                className="group relative text-sm font-medium text-[var(--text-muted)] transition-colors duration-200 hover:text-[var(--accent)]"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-[var(--accent)] transition-all duration-300 ease-out group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => logout()}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10 transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="hidden sm:block text-sm font-medium text-[var(--text)] hover:text-[var(--accent)] transition"
              >
                Sign in
              </Link>
            )}

            <Link
              href="/generate"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-white transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
              }}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">Start Building</span>
              <span className="sm:hidden">Start</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--text)]"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-[99] border-b border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)] lg:hidden"
          >
            <div className="flex flex-col px-5 py-6 space-y-6">
              <nav className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => scrollToSection(item.targetId)}
                    className="text-left text-lg font-medium text-[var(--text-muted)] hover:text-[var(--accent)]"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="h-px w-full bg-[var(--border)]" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text)]">Theme</span>
                <ThemeToggle />
              </div>

              {user ? (
                <div className="flex flex-col space-y-4 pt-2">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-medium text-[var(--text)]"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-lg font-medium text-red-500"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-[var(--text)]"
                >
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
