"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";
import { Loader2, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

// Google Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// GitHub Icon
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.527-10-10-10z" />
    </svg>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const oauthError = searchParams?.get("error");
    if (oauthError === "oauth_failed") {
      setError("OAuth login failed. Please try again or use email login.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    window.location.href = `${apiUrl}/api/auth/github`;
  };

  return (
    <div className="relative overflow-hidden rounded-[2.25rem] border border-black/8 bg-white/70 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/8 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.45)]">
      {/* Shine layer */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/20" />
      <div className="pointer-events-none absolute -left-32 top-0 h-full w-48 rotate-12 bg-linear-to-r from-transparent via-white/20 to-transparent blur-2xl dark:via-white/5" />

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-5 flex items-center gap-2 rounded-2xl border border-red-500/10 bg-red-500/5 p-4 text-xs font-semibold text-red-600 dark:border-red-400/20 dark:text-red-400"
        >
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Social Logins */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white/50 px-4 py-3 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/8 dark:bg-white/[0.04] dark:text-white/80 dark:hover:bg-white/10 cursor-pointer"
        >
          <GoogleIcon className="text-red-500 dark:text-red-400" />
          <span>Google</span>
        </button>
        <button
          type="button"
          onClick={handleGithubLogin}
          className="flex items-center justify-center gap-2 rounded-2xl border border-black/8 bg-white/50 px-4 py-3 text-xs font-bold text-slate-700 shadow-sm backdrop-blur-md transition-colors hover:bg-white dark:border-white/8 dark:bg-white/[0.04] dark:text-white/80 dark:hover:bg-white/10 cursor-pointer"
        >
          <GithubIcon className="text-slate-900 dark:text-white" />
          <span>GitHub</span>
        </button>
      </div>

      <div className="relative flex py-3 items-center mb-5">
        <div className="flex-grow border-t border-black/6 dark:border-white/6"></div>
        <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-white/30">
          or continue with email
        </span>
        <div className="flex-grow border-t border-black/6 dark:border-white/6"></div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
            Email Address
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-black/8 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-violet-500/30 focus:border-violet-500 focus:bg-white focus:shadow-md dark:border-white/8 dark:bg-black/20 dark:text-white dark:placeholder:text-white/20 dark:hover:border-violet-400/30 dark:focus:border-violet-400 dark:focus:bg-black/45"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/40">
            Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-black/8 bg-white/50 py-3.5 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 hover:border-violet-500/30 focus:border-violet-500 focus:bg-white focus:shadow-md dark:border-white/8 dark:bg-black/20 dark:text-white dark:placeholder:text-white/20 dark:hover:border-violet-400/30 dark:focus:border-violet-400 dark:focus:bg-black/45"
            />
          </div>
        </div>

        {/* Action button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-violet-500/40 disabled:hover:translate-y-0 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Prompt to register */}
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-white/40">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="font-bold text-violet-600 hover:underline dark:text-cyan-400 cursor-pointer"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 craftsite-bg">
      {/* Background gradients */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl dark:bg-violet-600/20" />
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-400/15" />

      {/* Top Bar controls */}
      <div className="absolute right-6 top-6 z-10 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo and Greeting */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block cursor-pointer">
            <CraftSiteLogo />
          </Link>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-white/50">
            Sign in to access your AI design workspace
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-violet-600 dark:text-cyan-400" size={32} />
          </div>
        }>
          <SignInForm />
        </Suspense>
      </motion.div>
    </main>
  );
}
