"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  Inbox,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import { useRealtime } from "../providers/RealtimeProvider";

export function NotificationBell() {
  const {
    unreadCount,
    notifications,
    markRead,
    markAllRead,
    fetchNotifications,
  } = useRealtime();

  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    async function loadNotifications() {
      try {
        setIsFetching(true);
        await fetchNotifications(1, 10);
      } finally {
        if (mounted) {
          setIsFetching(false);
        }
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (id: string, readAt: string | null) => {
    if (!readAt) {
      await markRead(id);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
  };

  const getNotificationLink = (notification: any) => {
    const meta = notification.metadata as any;

    if (meta?.projectId) {
      return `/projects/${meta.projectId}`;
    }

    return "/notifications";
  };

  const formatTime = (createdAt: string) => {
    try {
      return new Date(createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className={`relative flex h-10 w-10 items-center justify-center rounded-2xl border backdrop-blur-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 dark:focus-visible:ring-cyan-300/60 ${isOpen
            ? "border-violet-500/35 bg-violet-500/10 text-violet-700 shadow-[0_0_28px_rgba(124,58,237,0.18)] dark:border-cyan-300/35 dark:bg-cyan-400/10 dark:text-cyan-200 dark:shadow-[0_0_28px_rgba(34,211,238,0.16)]"
            : "border-slate-900/10 bg-white/70 text-slate-600 shadow-sm hover:-translate-y-0.5 hover:border-violet-500/25 hover:text-violet-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-cyan-300/25 dark:hover:text-cyan-200"
          }`}
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-1.5 text-[10px] font-black text-white shadow-[0_0_18px_rgba(34,211,238,0.55)] ring-2 ring-white dark:ring-[#02030d]"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-[1.5rem] border border-slate-900/10 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#050816]/95 dark:shadow-[0_24px_90px_rgba(0,0,0,0.55)]"
          >
            {/* Header */}
            <div className="relative overflow-hidden border-b border-slate-900/10 px-4 py-4 dark:border-white/10">
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-500/25" />
              <div className="pointer-events-none absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200">
                      <Sparkles size={15} />
                    </span>

                    <div>
                      <p className="text-sm font-black text-slate-950 dark:text-white">
                        Notifications
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""
                          }`
                          : "You are all caught up"}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close notifications"
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-900/10 bg-white/70 text-slate-500 transition hover:bg-slate-950 hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:bg-white dark:hover:text-slate-950"
                >
                  <X size={15} />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-bold text-violet-700 transition hover:bg-violet-500/15 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:text-cyan-200 dark:hover:bg-cyan-400/15"
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[22rem] overflow-y-auto p-2">
              {isFetching && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <Loader2 className="mb-3 h-5 w-5 animate-spin text-violet-700 dark:text-cyan-200" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Loading notifications...
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-900/10 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                    <Inbox size={20} />
                  </div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">
                    No notifications yet
                  </p>
                  <p className="mt-1 max-w-48 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Project updates, generation status, and team activity will
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((notification: any) => {
                    const isUnread = !notification.readAt;
                    const href = getNotificationLink(notification);

                    return (
                      <Link
                        key={notification.id}
                        href={href}
                        onClick={async () => {
                          await handleNotificationClick(
                            notification.id,
                            notification.readAt
                          );
                          setIsOpen(false);
                        }}
                        className={`group relative block overflow-hidden rounded-2xl border p-3 transition ${isUnread
                            ? "border-violet-500/25 bg-violet-500/10 hover:bg-violet-500/15 dark:border-cyan-300/25 dark:bg-cyan-400/10 dark:hover:bg-cyan-400/15"
                            : "border-slate-900/10 bg-white/60 hover:border-violet-500/20 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.035] dark:hover:border-cyan-300/20 dark:hover:bg-white/[0.06]"
                          }`}
                      >
                        {isUnread && (
                          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.65)]" />
                        )}

                        <div className="pr-5">
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${isUnread
                                  ? "border-violet-500/25 bg-white/70 text-violet-700 dark:border-cyan-300/25 dark:bg-white/[0.05] dark:text-cyan-200"
                                  : "border-slate-900/10 bg-slate-50 text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400"
                                }`}
                            >
                              <Bell size={15} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p
                                  className={`line-clamp-1 text-xs font-black ${isUnread
                                      ? "text-slate-950 dark:text-white"
                                      : "text-slate-700 dark:text-slate-300"
                                    }`}
                                >
                                  {notification.title}
                                </p>
                                <ExternalLink
                                  size={11}
                                  className="shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100"
                                />
                              </div>

                              <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                                {notification.message}
                              </p>

                              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                                <Clock size={11} />
                                {formatTime(notification.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-900/10 bg-slate-50/70 p-3 text-center dark:border-white/10 dark:bg-white/[0.03]">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black text-slate-600 transition hover:bg-white hover:text-violet-700 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-cyan-200"
              >
                View all notification history
                <ExternalLink size={13} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}