"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface PresenceUser {
  userId: string;
  name: string;
  email: string;
  image?: string;
}

interface PresenceAvatarsProps {
  presenceList: PresenceUser[];
  maxToShow?: number;
}

function getInitials(user: PresenceUser) {
  const name = user.name?.trim();

  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return user.email?.slice(0, 2).toUpperCase() || "U";
}

export function PresenceAvatars({
  presenceList,
  maxToShow = 4,
}: PresenceAvatarsProps) {
  const uniqueUsers = useMemo(() => {
    const map = new Map<string, PresenceUser>();

    for (const user of presenceList) {
      if (!map.has(user.userId)) {
        map.set(user.userId, user);
      }
    }

    return Array.from(map.values());
  }, [presenceList]);

  const visibleUsers = uniqueUsers.slice(0, maxToShow);
  const remainingCount = Math.max(uniqueUsers.length - maxToShow, 0);

  if (uniqueUsers.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => {
          const initials = getInitials(user);

          return (
            <motion.div
              key={user.userId}
              initial={{ opacity: 0, x: -8, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 0.25,
                delay: index * 0.04,
                ease: "easeOut",
              }}
              className="group relative inline-flex"
              style={{ zIndex: visibleUsers.length - index }}
            >
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || user.email || "Online user"}
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 rounded-2xl border border-white/70 bg-white object-cover shadow-[0_8px_24px_rgba(15,23,42,0.12)] ring-2 ring-emerald-400/80 transition duration-300 group-hover:-translate-y-1 group-hover:ring-cyan-400 dark:border-white/10 dark:bg-slate-950 dark:ring-cyan-300/60"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-gradient-to-br from-violet-600 via-blue-600 to-cyan-500 text-xs font-black text-white shadow-[0_8px_24px_rgba(79,70,229,0.2)] ring-2 ring-emerald-400/80 transition duration-300 group-hover:-translate-y-1 group-hover:ring-cyan-400 dark:border-white/10 dark:ring-cyan-300/60">
                    {initials}
                  </div>
                )}

                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] dark:border-[#02030d]" />
              </div>

              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-max max-w-56 -translate-x-1/2 translate-y-1 scale-95 rounded-2xl border border-slate-900/10 bg-white/95 px-3 py-2 text-left opacity-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)] backdrop-blur-2xl transition duration-200 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 dark:border-white/10 dark:bg-[#050816]/95 dark:shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
                <p className="truncate text-xs font-black text-slate-950 dark:text-white">
                  {user.name || "Unknown user"}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online now
                </div>

                <span className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-900/10 bg-white/95 dark:border-white/10 dark:bg-[#050816]/95" />
              </div>
            </motion.div>
          );
        })}

        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -8, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-0 flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-slate-950 text-xs font-black text-white shadow-[0_8px_24px_rgba(15,23,42,0.14)] ring-2 ring-violet-400/60 dark:border-white/10 dark:bg-white/[0.08] dark:ring-cyan-300/40"
          >
            +{remainingCount}
          </motion.div>
        )}
      </div>

      <div className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 md:flex">
        <Users size={14} className="text-violet-700 dark:text-cyan-200" />
        {uniqueUsers.length === 1
          ? "1 editor online"
          : `${uniqueUsers.length} editors online`}
      </div>
    </div>
  );
}