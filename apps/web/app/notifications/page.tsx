"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AppShell } from "@/components/app/AppShell";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { apiDelete, apiGet } from "@/lib/api-client";
import { Bell, Trash2, CheckCircle, ArrowLeft, MessageSquare, ShieldAlert, Zap } from "lucide-react";
import Link from "next/link";

function groupNotificationsByDate(notifications: any[]) {
  const today: any[] = [];
  const yesterday: any[] = [];
  const older: any[] = [];

  const now = new Date();
  const todayStr = now.toDateString();

  const yesterdayDate = new Date();
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterdayStr = yesterdayDate.toDateString();

  notifications.forEach((notif) => {
    const d = new Date(notif.createdAt);
    const dStr = d.toDateString();
    if (dStr === todayStr) {
      today.push(notif);
    } else if (dStr === yesterdayStr) {
      yesterday.push(notif);
    } else {
      older.push(notif);
    }
  });

  return { today, yesterday, older };
}

export default function NotificationsPage() {
  const { unreadCount, markRead, markAllRead, fetchNotifications, notifications: initialNotifications } = useRealtime();
  const [notificationsList, setNotificationsList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async (p: number) => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/notifications?page=${p}&limit=20`);
      if (res.success && res.data) {
        setNotificationsList(res.data.notifications);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to load notifications page data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(page);
  }, [page, loadNotifications]);

  // Sync with realtime provider's notifications update (like when new notifications arrive)
  useEffect(() => {
    if (page === 1 && initialNotifications.length > 0) {
      // Blend new live notifications into our list safely
      setNotificationsList((prev) => {
        const merged = [...initialNotifications];
        prev.forEach((p) => {
          if (!merged.find((m) => m.id === p.id)) {
            merged.push(p);
          }
        });
        return merged.slice(0, 20); // Keep size clean
      });
    }
  }, [initialNotifications, page]);

  const handleMarkRead = async (id: string) => {
    await markRead(id);
    setNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    );
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await apiDelete(`/api/notifications/${id}`);
      if (res.success) {
        setNotificationsList((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead();
    setNotificationsList((prev) =>
      prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
    );
  };

  const getNotificationLink = (notification: any) => {
    const meta = notification.metadata as any;
    if (meta?.projectId) {
      return `/projects/${meta.projectId}`;
    }
    return "#";
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment_mention":
      case "comment_reply":
      case "comment_created":
        return <MessageSquare size={16} className="text-violet-400" />;
      case "project_updated":
        return <Zap size={16} className="text-amber-400" />;
      default:
        return <Bell size={16} className="text-cyan-400" />;
    }
  };

  const { today, yesterday, older } = groupNotificationsByDate(notificationsList);

  const renderSection = (title: string, items: any[]) => {
    if (items.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 pl-2">
          {title}
        </h3>
        <div className="space-y-2">
          {items.map((item) => {
            const isUnread = !item.readAt;

            return (
              <div
                key={item.id}
                className={`relative group flex flex-col justify-between sm:flex-row sm:items-center gap-4 rounded-2xl border border-black/10 bg-white/70 p-4 transition-all duration-200 dark:border-white/10 dark:bg-white/[0.02] hover:bg-white/95 dark:hover:bg-white/[0.04] ${
                  isUnread ? "ring-1 ring-violet-500/20 dark:ring-indigo-400/20 bg-violet-500/[0.01]" : ""
                }`}
              >
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Link
                        href={getNotificationLink(item)}
                        className="text-sm font-bold text-slate-950 dark:text-white hover:text-violet-600 dark:hover:text-cyan-400 transition-colors truncate"
                      >
                        {item.title}
                      </Link>
                      {isUnread && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-600 mt-1 block">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(item.id)}
                      className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-violet-500/20 bg-violet-600/10 text-xs font-semibold text-violet-700 hover:bg-violet-600/20 dark:bg-indigo-400/10 dark:text-indigo-300 dark:hover:bg-indigo-400/20 transition-all"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/5 hover:border-red-400/20 bg-slate-50 hover:bg-red-500/10 text-slate-400 hover:text-red-400 dark:bg-zinc-900 dark:border-white/5 transition-all"
                    title="Delete Notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-black/5 dark:border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 transition-all text-slate-600 dark:text-zinc-400"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white sm:text-3xl">
                  Notification Center
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Keep track of updates, comments, and member activities.
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-violet-600/10 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-600/20 dark:bg-cyan-400/10 dark:text-cyan-300 dark:hover:bg-cyan-400/20 transition-all cursor-pointer"
              >
                <CheckCircle size={13} />
                Mark all read
              </button>
            )}
          </div>

          {/* Content */}
          {loading && notificationsList.length === 0 ? (
            <div className="py-20 text-center text-sm text-slate-400 dark:text-zinc-500">
              Loading notification history...
            </div>
          ) : notificationsList.length === 0 ? (
            <div className="rounded-[2rem] border border-black/10 bg-white/75 p-12 text-center backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.02]">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                <Bell size={24} className="text-slate-400 dark:text-zinc-600" />
              </div>
              <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">
                No notification history
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                Any comments, replies, or collaboration mentions will be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {renderSection("Today", today)}
              {renderSection("Yesterday", yesterday)}
              {renderSection("Older", older)}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-black/10 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg border border-black/10 dark:border-white/10 text-xs text-slate-600 dark:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
