"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  FolderOpen,
  GalleryVerticalEnd,
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
  type LucideIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const sidebarItems: NavItem[] = [
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

const adminItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: Shield },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Projects", href: "/admin/projects", icon: FolderOpen },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "AI Providers", href: "/admin/ai", icon: Cpu },
];

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SidebarLink({
  item,
  active,
  onClick,
  variant = "default",
}: {
  item: NavItem;
  active: boolean;
  onClick?: () => void;
  variant?: "default" | "admin";
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950",
        active && variant === "default"
          ? "bg-slate-950 text-white shadow-md dark:bg-white dark:text-slate-950"
          : "",
        !active && variant === "default"
          ? "text-slate-600 hover:bg-slate-950/5 hover:text-slate-950 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
          : "",
        active && variant === "admin"
          ? "bg-violet-600 text-white shadow-md dark:bg-cyan-400 dark:text-slate-950"
          : "",
        !active && variant === "admin"
          ? "text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
          : ""
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function SidebarNav({
  pathname,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  isAdmin: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-7">
      <nav className="space-y-1.5">
        {sidebarItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={isRouteActive(pathname, item.href)}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {isAdmin && (
        <div className="border-t border-black/5 pt-6 dark:border-white/10">
          <p className="mb-2 px-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">
            Admin
          </p>

          <nav className="space-y-1.5">
            {adminItems.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={isRouteActive(pathname, item.href)}
                onClick={onNavigate}
                variant="admin"
              />
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

function SidebarFooter({
  onLogout,
  onNavigate,
}: {
  onLogout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="shrink-0 border-t border-black/5 pt-4 dark:border-white/10">
      <div className="rounded-3xl border border-black/10 bg-white/70 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <p className="text-sm font-bold text-slate-950 dark:text-white">
          Pro workspace
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/50">
          Upgrade to unlock unlimited AI generations.
        </p>

        <Link
          href="/pricing"
          onClick={onNavigate}
          className={cn(
            "mt-4 inline-flex w-full items-center justify-center rounded-2xl",
            "bg-gradient-to-r from-violet-600 to-blue-500 px-4 py-2.5",
            "text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-all",
            "hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950"
          )}
        >
          Upgrade
        </Link>
      </div>

      <button
        onClick={onLogout}
        className={cn(
          "mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold",
          "text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-600 active:scale-[0.98]",
          "dark:text-white/45 dark:hover:text-red-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "dark:focus-visible:ring-offset-slate-950"
        )}
      >
        <LogOut size={18} className="shrink-0" />
        Logout
      </button>
    </div>
  );
}

function CreditsBadge({ credits }: { credits: number }) {
  const state =
    credits === 0 ? "danger" : credits <= 5 ? "warning" : "success";

  return (
    <Link
      href="/usage"
      title={credits === 0 ? "No Credits" : `${credits} Credits`}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5",
        "text-[11px] font-bold uppercase tracking-wider transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950",
        state === "danger"
          ? "border-red-400/30 bg-red-50 text-red-700 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          : "",
        state === "warning"
          ? "border-amber-400/30 bg-amber-50 text-amber-700 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
          : "",
        state === "success"
          ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : ""
      )}
    >
      <Zap size={11} className={credits > 0 ? "fill-current" : ""} />
      <span className="sm:hidden">{credits === 0 ? "0" : credits}</span>
      <span className="hidden sm:inline">
        {credits === 0 ? "No Credits" : `${credits} Credits`}
      </span>
    </Link>
  );
}

function UserAvatar({
  image,
  name,
  email,
}: {
  image?: string | null;
  name?: string | null;
  email?: string | null;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt={name || "Avatar"}
        className="hidden h-8 w-8 shrink-0 rounded-full border border-violet-500/20 object-cover min-[380px]:block"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-violet-500/20 bg-violet-600/10 text-sm font-bold text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-300 min-[380px]:flex">
      {email?.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  const mobileDrawerId = useMemo(() => "mobile-sidebar", []);

  return (
    <main className="craftsite-bg min-h-dvh overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-4 top-4 z-50 hidden h-[calc(100dvh-2rem)] w-72 flex-col overflow-hidden rounded-[2rem]",
          "border border-black/10 bg-white/75 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]",
          "lg:flex xl:left-5 xl:top-5 xl:h-[calc(100dvh-2.5rem)]"
        )}
      >
        <div className="shrink-0 px-2 pb-6 pt-2">
          <Link
            href="/"
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            <CraftSiteLogo />
          </Link>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <SidebarNav pathname={pathname} isAdmin={isAdmin} />
        </div>

        <SidebarFooter onLogout={handleLogout} />
      </aside>

      {/* Mobile Sidebar Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-md lg:hidden"
            />

            <motion.div
              id={mobileDrawerId}
              role="dialog"
              aria-modal="true"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className={cn(
                "fixed inset-y-0 left-0 z-[101] flex h-dvh w-[min(88vw,20rem)] flex-col overflow-hidden",
                "border-r border-black/10 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#0d0d14]",
                "lg:hidden"
              )}
            >
              <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                  <CraftSiteLogo />
                </Link>

                <button
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    "border border-black/10 bg-slate-50 text-slate-700 transition-all hover:bg-slate-100 active:scale-95",
                    "dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950"
                  )}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <SidebarNav
                  pathname={pathname}
                  isAdmin={isAdmin}
                  onNavigate={closeMobileMenu}
                />
              </div>

              <SidebarFooter
                onLogout={handleLogout}
                onNavigate={closeMobileMenu}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <section className="min-h-dvh px-3 py-3 sm:px-5 sm:py-5 lg:pl-80 xl:pl-[21rem]">
        <header
          className={cn(
            "sticky top-3 z-40 mb-5 flex min-h-14 items-center justify-between gap-3 rounded-3xl",
            "border border-black/10 bg-white/75 px-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl",
            "dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_18px_70px_rgba(0,0,0,0.35)]",
            "sm:top-4 sm:mb-6 sm:min-h-16 sm:px-5 lg:top-5 lg:mb-8"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "border border-black/10 bg-white/80 text-slate-700 shadow-sm backdrop-blur-xl transition-all",
                "hover:bg-slate-100 active:scale-95",
                "dark:border-white/10 dark:bg-white/[0.05] dark:text-white/80 dark:hover:bg-white/10",
                "lg:hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950"
              )}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileDrawerId}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="min-w-0 flex-1 overflow-hidden">
              <WorkspaceSwitcher />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {user && <CreditsBadge credits={user.credits ?? 0} />}

            <div className="shrink-0">
              <NotificationBell />
            </div>

            <div className="shrink-0">
              <ThemeToggle />
            </div>

            <UserAvatar
              image={user?.image}
              name={user?.name}
              email={user?.email}
            />
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px]">{children}</div>
      </section>
    </main>
  );
}