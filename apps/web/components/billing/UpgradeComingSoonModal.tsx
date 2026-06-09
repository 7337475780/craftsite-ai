"use client";

import { motion } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface UpgradeComingSoonModalProps {
  onClose: () => void;
  title?: string;
  message?: string;
}

export function UpgradeComingSoonModal({
  onClose,
  title = "Upgrade plans are coming soon",
  message = "You've reached the limit of your free credits. Pro plans will unlock more AI generations, edits, and project capacity soon.",
}: UpgradeComingSoonModalProps) {
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "joined">("idle");

  const handleJoinWaitlist = () => {
    setWaitlistStatus("joined");
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300">
          <Zap size={24} className="fill-current" />
        </div>
        
        <h2 className="text-center text-xl font-black tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        
        <p className="mt-2 text-center text-sm leading-relaxed text-slate-500 dark:text-white/60">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleJoinWaitlist}
            disabled={waitlistStatus === "joined"}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all ${
              waitlistStatus === "joined"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-md hover:shadow-lg hover:shadow-violet-500/25"
            }`}
          >
            {waitlistStatus === "joined" ? (
              "You're on the waitlist!"
            ) : (
              <>
                <Sparkles size={16} />
                Join Waitlist / Notify Me
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-center rounded-xl border border-black/10 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              Dashboard
            </Link>
            <button
              onClick={onClose}
              className="flex items-center justify-center rounded-xl border border-black/10 bg-white py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
