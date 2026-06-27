"use client";

import { useEffect, useState } from "react";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { REALTIME_EVENTS } from "@/types/realtime";

export function useProjectPresence(projectId: string | null | undefined) {
  const { socket, isConnected } = useRealtime();
  const [presenceList, setPresenceList] = useState<any[]>([]);

  useEffect(() => {
    if (!socket || !isConnected || !projectId) {
      setPresenceList([]);
      return;
    }

    const handlePresence = (list: any[]) => {
      setPresenceList(list);
    };

    socket.emit(REALTIME_EVENTS.PROJECT_JOIN, { projectId });

    socket.on(REALTIME_EVENTS.PROJECT_PRESENCE, handlePresence);

    return () => {
      socket.emit(REALTIME_EVENTS.PROJECT_LEAVE, { projectId });
      socket.off(REALTIME_EVENTS.PROJECT_PRESENCE, handlePresence);
    };
  }, [socket, isConnected, projectId]);

  return presenceList;
}
