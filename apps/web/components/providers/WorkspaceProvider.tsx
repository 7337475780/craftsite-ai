"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Workspace, WorkspaceRole } from "../../types/workspace";
import { apiGet, apiPost } from "../../lib/api-client";
import { useAuth } from "./AuthProvider";

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspaceId: string | null; // null means personal workspace
  activeWorkspace: Workspace | null;
  activeWorkspaceRole: WorkspaceRole | null;
  loading: boolean;
  setActiveWorkspaceId: (id: string | null) => void;
  refreshWorkspaces: () => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<Workspace>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    try {
      const data = await apiGet("/api/workspaces");
      setWorkspaces(data);
    } catch (error) {
      console.error("Failed to fetch workspaces:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Load persisted workspace preference
    const saved = localStorage.getItem("craftsite_active_workspace");
    if (saved && saved !== "personal") {
      setActiveWorkspaceIdState(saved);
    }
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const setActiveWorkspaceId = useCallback((id: string | null) => {
    setActiveWorkspaceIdState(id);
    if (id) {
      localStorage.setItem("craftsite_active_workspace", id);
    } else {
      localStorage.setItem("craftsite_active_workspace", "personal");
    }
  }, []);

  const createWorkspace = async (name: string, description?: string) => {
    const data = await apiPost("/api/workspaces", { name, description });
    await refreshWorkspaces();
    setActiveWorkspaceId(data.id);
    return data;
  };

  const activeWorkspace = activeWorkspaceId
    ? workspaces.find((w) => w.id === activeWorkspaceId) || null
    : null;

  const activeWorkspaceRole = activeWorkspace?.currentUserRole || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspaceId,
        activeWorkspace,
        activeWorkspaceRole,
        loading,
        setActiveWorkspaceId,
        refreshWorkspaces,
        createWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
