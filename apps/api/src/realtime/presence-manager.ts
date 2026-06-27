import { Socket } from "socket.io";

export interface PresenceRecord {
  userId: string;
  name: string;
  email: string;
  image: string;
  workspaceId?: string;
  projectId?: string;
  connectedAt: Date;
  lastSeenAt: Date;
}

class PresenceManager {
  private socketPresences = new Map<string, PresenceRecord>();
  private userSockets = new Map<string, Set<string>>();

  public addPresence(
    socketId: string,
    user: { userId: string; name: string; email: string; image: string },
    context: { workspaceId?: string; projectId?: string }
  ): PresenceRecord {
    const record: PresenceRecord = {
      userId: user.userId,
      name: user.name,
      email: user.email,
      image: user.image,
      workspaceId: context.workspaceId,
      projectId: context.projectId,
      connectedAt: new Date(),
      lastSeenAt: new Date(),
    };

    this.socketPresences.set(socketId, record);

    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, new Set());
    }
    this.userSockets.get(user.userId)!.add(socketId);

    return record;
  }

  public removePresence(socketId: string): PresenceRecord | null {
    const record = this.socketPresences.get(socketId);
    if (!record) return null;

    this.socketPresences.delete(socketId);

    const sockets = this.userSockets.get(record.userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(record.userId);
      }
    }

    return record;
  }

  public getRoomPresence(roomId: string, type: "workspace" | "project"): PresenceRecord[] {
    const records: PresenceRecord[] = [];
    const uniqueUserIds = new Set<string>();

    for (const record of this.socketPresences.values()) {
      const match = type === "workspace" 
        ? record.workspaceId === roomId 
        : record.projectId === roomId;

      if (match && !uniqueUserIds.has(record.userId)) {
        uniqueUserIds.add(record.userId);
        records.push(record);
      }
    }

    return records;
  }

  public getSocketRecord(socketId: string): PresenceRecord | undefined {
    return this.socketPresences.get(socketId);
  }

  public isUserActiveInRoom(userId: string, roomId: string, type: "workspace" | "project"): boolean {
    const sockets = this.userSockets.get(userId);
    if (!sockets) return false;

    for (const sid of sockets) {
      const rec = this.socketPresences.get(sid);
      if (rec) {
        const match = type === "workspace" ? rec.workspaceId === roomId : rec.projectId === roomId;
        if (match) return true;
      }
    }
    return false;
  }
}

export const presenceManager = new PresenceManager();
