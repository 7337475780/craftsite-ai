"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  ChevronRight,
  Cpu,
  CreditCard,
  Crown,
  FolderOpen,
  GalleryVerticalEnd,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";

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
  { label: "Usage", href: "/usage", icon: BarChart3 },
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

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function isRouteActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function getPageMeta(pathname: string) {
  const items = [...sidebarItems, ...adminItems];

  const matched =
    items
      .filter((item) => isRouteActive(pathname, item.href))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? sidebarItems[0];

  const descriptions: Record<string, string> = {
    Dashboard: "Overview of your workspace, projects, and activity.",
    Generate: "Create new websites from prompts using CraftSite AI.",
    Projects: "Manage, preview, and continue your generated websites.",
    Templates: "Explore ready-to-use website starting points.",
    Pricing: "Choose the plan that fits your workflow.",
    Billing: "Manage payments, invoices, and subscription details.",
    Usage: "Track credits, generations, and AI usage.",
    Activity: "Review recent workspace events and updates.",
    Settings: "Control your account, workspace, and preferences.",
    Overview: "Admin overview for platform health and operations.",
    Users: "Manage registered users and permissions.",
    Analytics: "Track product usage, growth, and system insights.",
    "AI Providers": "Configure and monitor AI provider settings.",
  };

  return {
    title: matched.label,
    description:
      descriptions[matched.label] ??
      "Manage your CraftSite workspace with a clean dashboard experience.",
  };
}

function SidebarSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-4 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 dark:text-white/30">
      {children}
    </p>
  );
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950",
        active
          ? "text-white shadow-[0_16px_42px_rgba(79,70,229,0.22)] dark:text-slate-950"
          : "text-slate-600 hover:bg-slate-950/[0.045] hover:text-slate-950 dark:text-white/58 dark:hover:bg-white/[0.07] dark:hover:text-white"
      )}
    >
      {active && (
        <motion.span
          layoutId={`app-shell-active-link-${variant}`}
          className={cn(
            "absolute inset-0 rounded-2xl",
            variant === "admin"
              ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 dark:from-cyan-300 dark:via-blue-300 dark:to-violet-300"
              : "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 dark:from-white dark:via-cyan-100 dark:to-blue-100"
          )}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 34,
            mass: 0.72,
          }}
        />
      )}

      {!active && (
        <span className="absolute inset-y-2 left-0 w-1 rounded-full bg-gradient-to-b from-violet-500 to-cyan-400 opacity-0 transition-opacity duration-300" />
      )}

      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
          active
            ? "bg-white/16 dark:bg-slate-950/8"
            : "bg-slate-950/[0.04] text-slate-500 group-hover:bg-violet-500/10 group-hover:text-violet-700 dark:bg-white/[0.06] dark:text-white/50 dark:group-hover:text-cyan-200"
        )}
      >
        <Icon size={17} />
      </span>

      <span className="relative z-10 min-w-0 flex-1 truncate">
        {item.label}
      </span>

      <ChevronRight
        size={15}
        className={cn(
          "relative z-10 shrink-0 transition-all duration-300",
          active
            ? "translate-x-0 opacity-100"
            : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
        )}
      />
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
      <div>
        <SidebarSectionTitle>Workspace</SidebarSectionTitle>

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
      </div>

      {isAdmin && (
        <div className="border-t border-slate-950/5 pt-6 dark:border-white/10">
          <SidebarSectionTitle>Admin</SidebarSectionTitle>

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
    <div className="shrink-0 border-t border-slate-950/5 pt-4 dark:border-white/10">
      <div className="relative overflow-hidden rounded-[1.7rem] border border-violet-500/15 bg-white/72 p-4 shadow-[0_18px_45px_rgba(79,70,229,0.08)] backdrop-blur-xl dark:border-cyan-300/15 dark:bg-white/[0.045] dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-violet-500/20 blur-3xl dark:bg-cyan-400/16" />

        <div className="relative flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-white shadow-lg shadow-violet-500/20">
            <Crown size={18} />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950 dark:text-white">
              Pro workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-white/52">
              Unlock more generations, exports, and premium templates.
            </p>
          </div>
        </div>

        <Link
          href="/pricing"
          onClick={onNavigate}
          className={cn(
            "relative mt-4 inline-flex w-full items-center justify-center rounded-2xl",
            "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-4 py-2.5",
            "text-sm font-black text-white shadow-lg shadow-violet-500/20 transition-all duration-300",
            "hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.98]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
            "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950"
          )}
        >
          Upgrade plan
        </Link>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className={cn(
          "mt-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold",
          "text-slate-500 transition-all duration-300 hover:bg-red-500/10 hover:text-red-600 active:scale-[0.98]",
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
        "text-[11px] font-black uppercase tracking-wider transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950",
        state === "danger"
          ? "border-red-400/30 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
          : "",
        state === "warning"
          ? "border-amber-400/30 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-300"
          : "",
        state === "success"
          ? "border-emerald-400/30 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-300"
          : ""
      )}
    >
      <Zap size={11} className={credits > 0 ? "fill-current" : ""} />
      <span className="sm:hidden">{credits}</span>
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
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();
  const fallback = email?.charAt(0).toUpperCase() || name?.charAt(0) || "U";

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="hidden min-[380px]:block relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-violet-500/60 cursor-pointer overflow-hidden border border-violet-500/20 shadow-sm dark:border-cyan-300/20"
      >
        {image ? (
          <img
            src={image}
            alt={name || "Avatar"}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-violet-600/10 text-sm font-black text-violet-700 dark:bg-cyan-400/10 dark:text-cyan-300">
            {fallback}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div className="absolute right-0 top-full mt-2 w-56 p-1 rounded-xl bg-white dark:bg-zinc-900 border border-slate-900/10 dark:border-white/10 shadow-xl z-50">
            {/* Header info */}
            <div className="px-3 py-2.5 border-b border-slate-900/5 dark:border-white/5">
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {name || "User"}
              </p>
              <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                {email || ""}
              </p>
            </div>

            {/* Menu options */}
            <div className="p-1">
              <button
                onClick={() => handleNavigate("/dashboard")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                Dashboard
              </button>
              <button
                onClick={() => handleNavigate("/settings")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors mt-0.5 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                Settings
              </button>
              <button
                onClick={() => handleNavigate("/billing")}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left text-slate-700 hover:bg-slate-900/5 hover:text-slate-950 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors mt-0.5 cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-slate-500 dark:text-zinc-400" />
                Billing & Plan
              </button>
            </div>

            <div className="h-px bg-slate-900/10 dark:bg-white/10 my-1 mx-2" />

            <div className="p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </div>
          
          {/* Overlay to close on click outside */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}

function TopBarTitle({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="hidden min-w-0 flex-1 border-l border-slate-950/10 pl-4 dark:border-white/10 md:block">
      <div className="flex items-center gap-2">
        <h1 className="truncate text-sm font-black tracking-[-0.02em] text-slate-950 dark:text-white sm:text-base">
          {title}
        </h1>

        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.75)]" />
      </div>

      <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-white/45">
        {description}
      </p>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const pageMeta = useMemo(() => getPageMeta(pathname), [pathname]);
  const mobileDrawerId = useMemo(() => "mobile-sidebar", []);

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

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-[#02030d] dark:text-white">
      {/* Shared CraftSite background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(124,58,237,0.12),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_48%,#f8fafc_100%)] dark:bg-[radial-gradient(circle_at_18%_12%,rgba(124,58,237,0.2),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(34,211,238,0.14),transparent_28%),linear-gradient(180deg,#02030d_0%,#050719_48%,#02030d_100%)]" />

      <div className="pointer-events-none fixed inset-0 -z-10 opacity-35 [background-image:radial-gradient(rgba(15,23,42,0.12)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)] dark:[background-image:radial-gradient(rgba(255,255,255,0.26)_1px,transparent_1px)]" />

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-4 top-4 z-50 hidden h-[calc(100dvh-2rem)] w-72 flex-col overflow-hidden rounded-[2rem]",
          "border border-slate-950/10 bg-white/76 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.1)] backdrop-blur-2xl",
          "dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]",
          "lg:flex xl:left-5 xl:top-5 xl:h-[calc(100dvh-2.5rem)]"
        )}
      >
        <div className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full bg-violet-500/16 blur-3xl dark:bg-violet-500/12" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl dark:bg-cyan-400/10" />

        <div className="relative shrink-0 px-2 pb-6 pt-2">
          <Link
            href="/"
            className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            <CraftSiteLogo />
          </Link>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SidebarNav pathname={pathname} isAdmin={isAdmin} />
        </div>

        <div className="relative">
          <SidebarFooter onLogout={handleLogout} />
        </div>
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-md lg:hidden"
            />

            <motion.div
              id={mobileDrawerId}
              role="dialog"
              aria-modal="true"
              initial={{ x: "-104%", opacity: 0.75 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-104%", opacity: 0.75 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 260,
                mass: 0.85,
              }}
              className={cn(
                "fixed inset-y-0 left-0 z-[101] flex h-dvh w-[min(88vw,21rem)] flex-col overflow-hidden",
                "border-r border-slate-950/10 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl",
                "dark:border-white/10 dark:bg-[#080a14]/95 lg:hidden"
              )}
            >
              <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-violet-500/18 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-cyan-400/12 blur-3xl" />

              <div className="relative mb-6 flex shrink-0 items-center justify-between gap-4">
                <Link
                  href="/"
                  onClick={closeMobileMenu}
                  className="min-w-0 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                >
                  <CraftSiteLogo />
                </Link>

                <button
                  type="button"
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    "border border-slate-950/10 bg-white/80 text-slate-700 shadow-sm backdrop-blur-xl transition-all hover:bg-slate-100 active:scale-95",
                    "dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/10",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                    "dark:focus-visible:ring-cyan-300/60 dark:focus-visible:ring-offset-slate-950"
                  )}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="relative min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <SidebarNav
                  pathname={pathname}
                  isAdmin={isAdmin}
                  onNavigate={closeMobileMenu}
                />
              </div>

              <div className="relative">
                <SidebarFooter
                  onLogout={handleLogout}
                  onNavigate={closeMobileMenu}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <section className="min-h-dvh px-3 py-3 sm:px-5 sm:py-5 lg:pl-80 xl:pl-[21rem]">
        <header
          className={cn(
            "sticky top-3 z-40 mb-5 flex min-h-14 items-center justify-between gap-3 rounded-[1.55rem]",
            "border border-slate-950/10 bg-white/76 px-3 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl",
            "dark:border-white/10 dark:bg-white/[0.045] dark:shadow-[0_18px_70px_rgba(0,0,0,0.35)]",
            "sm:top-4 sm:mb-6 sm:min-h-16 sm:px-5 lg:top-5 lg:mb-8"
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                "border border-slate-950/10 bg-white/82 text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300",
                "hover:bg-slate-100 active:scale-95",
                "dark:border-white/10 dark:bg-white/[0.06] dark:text-white/80 dark:hover:bg-white/10",
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
            <div className="min-w-0 flex-1 relative z-[60]">
              <WorkspaceSwitcher />
            </div>

            <TopBarTitle
              title={pageMeta.title}
              description={pageMeta.description}
            />
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

        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[1600px]"
        >
          {children}
        </motion.div>
      </section>
    </main>
  );
}