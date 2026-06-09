"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "@/lib/api-client";

type User = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  credits: number;
  plan: string;
  role: string;
  authProvider: string;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string | undefined, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchMe = useCallback(async () => {
    try {
      const res = await apiGet("/api/auth/me");
      if (res.success && res.data) {
        setUser(res.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 1. Check if there's a token in the URL (from OAuth redirect)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      
      if (token) {
        // Save the token securely in localStorage
        localStorage.setItem("craftsite_token", token);
        
        // Remove the token from the address bar so the user doesn't accidentally copy it
        url.searchParams.delete("token");
        window.history.replaceState({}, document.title, url.toString());
      }
    }

    // 2. Fetch user profile
    refetchMe();
  }, [refetchMe]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/login", { email, password });
      if (res.success && res.data) {
        if (res.token) {
          localStorage.setItem("craftsite_token", res.token);
        }
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || "Failed to log in");
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string | undefined, email: string, password: string) => {
    setLoading(true);
    try {
      const res = await apiPost("/api/auth/register", { name, email, password });
      if (res.success && res.data) {
        if (res.token) {
          localStorage.setItem("craftsite_token", res.token);
        }
        setUser(res.data);
        return res.data;
      }
      throw new Error(res.message || "Failed to register");
    } catch (err) {
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiPost("/api/auth/logout");
    } catch (e) {
      // ignore
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("craftsite_token");
      }
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
