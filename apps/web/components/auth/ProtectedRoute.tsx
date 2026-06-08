"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center craftsite-bg">
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-violet-500/20 blur-2xl" />
          <Loader2 size={40} className="animate-spin text-violet-600 dark:text-cyan-400" />
        </div>
        <p className="text-sm font-semibold text-slate-500 dark:text-white/40 uppercase tracking-widest">
          Securing session...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
