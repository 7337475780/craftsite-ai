"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRealtime } from "../providers/RealtimeProvider";
import { Bell } from "lucide-react";

export function NotificationBell() {
  const { unreadCount, notifications, markRead, markAllRead, fetchNotifications } = useRealtime();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications on opening
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 10);
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (id: string, readAt: string | null) => {
    if (!readAt) {
      await markRead(id);
    }
  };

  const getNotificationLink = (notification: any) => {
    const meta = notification.metadata as any;
    if (meta?.projectId) {
      return `/project/${meta.projectId}`;
    }
    return "#";
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-full p-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl border border-white/10 bg-zinc-950/90 py-1 shadow-2xl backdrop-blur-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
            <span className="text-xs font-bold text-zinc-200">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-zinc-500">
                You have no notifications.
              </div>
            ) : (
              notifications.map((notification) => {
                const isUnread = !notification.readAt;

                return (
                  <div
                    key={notification.id}
                    className={`relative px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 flex flex-col gap-0.5 cursor-pointer ${
                      isUnread ? "bg-indigo-500/5" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.readAt)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={getNotificationLink(notification)}
                        onClick={() => setIsOpen(false)}
                        className="text-xs font-semibold text-zinc-200 hover:text-indigo-400 transition-colors flex-1"
                      >
                        {notification.title}
                      </Link>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      {notification.message}
                    </p>
                    <span className="text-[9px] text-zinc-600 mt-1">
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 border-t border-white/5 text-center bg-zinc-900/20">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors block w-full"
            >
              View all notification history
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
