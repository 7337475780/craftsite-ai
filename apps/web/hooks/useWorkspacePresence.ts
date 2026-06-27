"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { REALTIME_EVENTS } from "@/types/realtime";

export function useWorkspacePresence(workspaceId: string | null | undefined) {
  const { socket, isConnected } = useRealtime();
  const [presenceList, setPresenceList] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !workspaceId) {
      setPresenceList([]);
      return;
    }

    const handlePresence = (list: any[]) => {
      setPresenceList(list);
    };

    socket.emit(REALTIME_EVENTS.WORKSPACE_JOIN, { workspaceId });

    socket.on(REALTIME_EVENTS.WORKSPACE_PRESENCE, handlePresence);

    return () => {
      socket.emit(REALTIME_EVENTS.WORKSPACE_LEAVE, { workspaceId });
      socket.off(REALTIME_EVENTS.WORKSPACE_PRESENCE, handlePresence);
    };
  }, [socket, isConnected, workspaceId]);

  return presenceList;
}
