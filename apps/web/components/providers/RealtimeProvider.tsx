"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthProvider";
import { REALTIME_EVENTS } from "@/types/realtime";
import { apiGet, apiPost, apiPatch } from "@/lib/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type ToastMessage = {
  id: string;
  title: string;
  message: string;
  type: "comment_mention" | "comment_reply" | "comment_created" | "comment_resolved" | "project_updated" | "info" | "success" | "error";
  metadata?: any;
};

type RealtimeContextType = {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: any[];
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  fetchUnreadCount: () => Promise<void>;
  fetchNotifications: (page?: number, limit?: number) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await apiGet("/api/notifications/unread-count");
      if (res.success && typeof res.data?.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
    }
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!user) return;
    try {
      const res = await apiGet(`/api/notifications?page=${page}&limit=${limit}`);
      if (res.success && res.data) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [user]);

  const markRead = useCallback(async (id: string) => {
    try {
      const res = await apiPatch(`/api/notifications/${id}/read`);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const res = await apiPost("/api/notifications/read-all");
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, readAt: new Date().toISOString() })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      setUnreadCount(0);
      setNotifications([]);
      return;
    }

    // Connect to Socket.IO server
    const token = typeof window !== "undefined" ? localStorage.getItem("craftsite_token") : null;
    const socketInstance = io(API_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      fetchUnreadCount();
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    socketInstance.on(REALTIME_EVENTS.CONNECTED, () => {
      // Handshake successful
    });

    socketInstance.on(REALTIME_EVENTS.NOTIFICATION_CREATED, (data: { notification: any }) => {
      setUnreadCount((prev) => prev + 1);
      setNotifications((prev) => [data.notification, ...prev]);

      // Add a visual toast alert
      addToast({
        title: data.notification.title || "Notification",
        message: data.notification.message,
        type: data.notification.type || "info",
        metadata: data.notification.metadata,
      });
    });

    socketInstance.on(REALTIME_EVENTS.ERROR, (err: { message: string }) => {
      console.error("Socket error event:", err.message);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      setIsConnected(false);
    };
  }, [user, fetchUnreadCount, addToast]);

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        isConnected,
        unreadCount,
        notifications,
        toasts,
        addToast,
        removeToast,
        fetchUnreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
      }}
    >
      {children}

      {/* Floating toasts container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full flex-col rounded-xl border border-white/10 bg-zinc-950/80 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-slide-in-right"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-zinc-100">{toast.title}</span>
                <span className="text-xs text-zinc-400">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors ml-4 text-xs font-semibold"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
}
