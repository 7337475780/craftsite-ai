"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  GalleryVerticalEnd,
  CreditCard,
  Settings,
  LogOut,
  Zap,
  Receipt,
  Activity,
  Shield,
  Users,
  BarChart3,
  Menu,
  X,
  Cpu,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Generate", href: "/generate", icon: Sparkles },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Templates", href: "/templates", icon: GalleryVerticalEnd },
  { label: "Pricing", href: "/pricing", icon: Zap },
  { label: "Billing", href: "/billing", icon: Receipt },
  { label: "Usage", href: "/usage", icon: Zap },
  { label: "Activity", href: "/activity", icon: Activity },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <main className="craftsite-bg min-h-screen">
      <aside className="fixed left-5 top-5 z-50 hidden h-[calc(100vh-2.5rem)] w-72 rounded-[2rem] border border-black/10 bg-white/70 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)] lg:block">
        <Link href="/" className="mb-8 block px-2 pt-2">
          <CraftSiteLogo />
        </Link>

        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md"
                    : "text-slate-600 hover:bg-slate-950/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user?.role === "admin" && (
          <div className="mt-8">
            <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">
              Admin
            </p>
            <nav className="space-y-2">
              <Link
                href="/admin"
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname === "/admin"
                    ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                    : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                }`}
              >
                <Shield size={18} />
                Overview
              </Link>
              <Link
                href="/admin/users"
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname.startsWith("/admin/users")
                    ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                    : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                }`}
              >
                <Users size={18} />
                Users
              </Link>
              <Link
                href="/admin/projects"
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname.startsWith("/admin/projects")
                    ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                    : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                }`}
              >
                <FolderOpen size={18} />
                Projects
              </Link>
              <Link
                href="/admin/analytics"
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname.startsWith("/admin/analytics")
                    ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                    : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                }`}
              >
                <BarChart3 size={18} />
                Analytics
              </Link>
              <Link
                href="/admin/ai"
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  pathname.startsWith("/admin/ai")
                    ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                    : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                }`}
              >
                <Cpu size={18} />
                AI Providers
              </Link>
            </nav>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-3xl border border-black/10 bg-white/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Pro workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/50">
              Upgrade to unlock unlimited AI generations.
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-sm font-bold text-white"
            >
              Upgrade
            </Link>
          </div>

          <button
            onClick={() => logout()}
            className="mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-500/10 hover:text-red-600 dark:text-white/45 dark:hover:text-red-300 cursor-pointer"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm lg:hidden"
            />
            
            {/* Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-[101] flex h-full w-72 flex-col border-r border-black/10 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#0d0d14] lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  <CraftSiteLogo />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        isActive
                          ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md"
                          : "text-slate-600 hover:bg-slate-950/5 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                      }`}
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}

                {user?.role === "admin" && (
                  <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
                    <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">
                      Admin
                    </p>
                    <div className="space-y-1.5">
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          pathname === "/admin"
                            ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                            : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        }`}
                      >
                        <Shield size={18} />
                        Overview
                      </Link>
                      <Link
                        href="/admin/users"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          pathname.startsWith("/admin/users")
                            ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                            : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        }`}
                      >
                        <Users size={18} />
                        Users
                      </Link>
                      <Link
                        href="/admin/projects"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          pathname.startsWith("/admin/projects")
                            ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                            : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        }`}
                      >
                        <FolderOpen size={18} />
                        Projects
                      </Link>
                      <Link
                        href="/admin/analytics"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          pathname.startsWith("/admin/analytics")
                            ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                            : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        }`}
                      >
                        <BarChart3 size={18} />
                        Analytics
                      </Link>
                      <Link
                        href="/admin/ai"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                          pathname.startsWith("/admin/ai")
                            ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-900"
                            : "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        }`}
                      >
                        <Cpu size={18} />
                        AI Providers
                      </Link>
                    </div>
                  </div>
                )}
              </nav>

              <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                <div className="rounded-3xl border border-black/10 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    Pro workspace
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/50">
                    Upgrade to unlock unlimited AI generations.
                  </p>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5 text-sm font-bold text-white"
                  >
                    Upgrade
                  </Link>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-500 transition hover:bg-red-500/10 hover:text-red-600 dark:text-white/45 dark:hover:text-red-300 cursor-pointer"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <section className="min-h-screen px-5 py-5 lg:pl-80">
        <header className="sticky top-5 z-40 mb-8 flex h-16 items-center justify-between rounded-[2rem] border border-black/10 bg-white/70 px-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_70px_rgba(0,0,0,0.35)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/70 text-slate-700 shadow-sm backdrop-blur-xl transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/10"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <WorkspaceSwitcher />
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Link
                href="/usage"
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  user.credits === 0
                    ? "border-red-400/30 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                    : user.credits <= 5
                    ? "border-amber-400/30 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
                    : "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
                }`}
              >
                <Zap size={11} className={user.credits > 0 ? "fill-current" : ""} />
                {user.credits === 0 ? "No Credits" : `${user.credits} Credits`}
              </Link>
            )}
            <NotificationBell />
            <ThemeToggle />
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Avatar"}
                className="h-8 w-8 rounded-full object-cover border border-violet-500/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600/10 text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-300 text-sm font-bold border border-violet-500/20">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        </header>

        {children}
      </section>
    </main>
  );
}
