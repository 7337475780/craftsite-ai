"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { Loader2, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center craftsite-bg">
        <Loader2 size={32} className="animate-spin text-violet-600 dark:text-cyan-400" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex h-screen flex-col items-center justify-center craftsite-bg p-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-black/10 bg-white/80 shadow-sm dark:border-white/10 dark:bg-white/[0.04] mb-4">
          <ShieldAlert size={28} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
          Access Denied
        </h1>
        <p className="text-slate-500 dark:text-white/50 mb-6 max-w-md">
          You do not have permission to view this page. This area is restricted to administrators only.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
