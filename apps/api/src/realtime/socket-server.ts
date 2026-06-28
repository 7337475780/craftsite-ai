import { Server } from "socket.io";
import { authenticateSocket } from "./socket-auth.js";
import { presenceManager } from "./presence-manager.js";
import { REALTIME_EVENTS } from "./realtime-events.js";
import { prisma } from "../lib/prisma.js";

let io: Server | null = null;

export function initRealtimeServer(httpServer: any): Server {
  io = new Server(httpServer, {
    cors: {
      origin: function (origin, callback) {
        const allowedOrigins = process.env.CLIENT_URLS
          ? process.env.CLIENT_URLS.split(",").map((url) => url.trim())
          : [process.env.CLIENT_URL || "http://localhost:3000"];
        const isOriginAllowed = (o: string): boolean => {
          if (process.env.NODE_ENV === "development") return true;
          if (allowedOrigins.includes(o)) return true;
          if (/^https:\/\/craftsite-ai-.*\.vercel\.app$/.test(o)) return true;
          if (/^http:\/\/localhost(:\d+)?$/.test(o) || /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(o)) return true;
          return false;
        };
        if (!origin || isOriginAllowed(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const user = socket.user;
    if (!user) {
      socket.disconnect();
      return;
    }

    const selfRoom = `user:${user.userId}`;
    socket.join(selfRoom);
    socket.emit(REALTIME_EVENTS.CONNECTED, { user });

    // Handle workspace:join
    socket.on(REALTIME_EVENTS.WORKSPACE_JOIN, async ({ workspaceId }) => {
      try {
        if (!workspaceId) return;

        const membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: user.userId,
            },
          },
        });

        if (!membership) {
          socket.emit(REALTIME_EVENTS.ERROR, { message: "Forbidden: Not a workspace member" });
          return;
        }

        const room = `workspace:${workspaceId}`;
        socket.join(room);

        presenceManager.addPresence(socket.id, user, { workspaceId });

        const presenceList = presenceManager.getRoomPresence(workspaceId, "workspace");
        io?.to(room).emit(REALTIME_EVENTS.WORKSPACE_PRESENCE, presenceList);
      } catch (err: any) {
        socket.emit(REALTIME_EVENTS.ERROR, { message: err.message });
      }
    });

    // Handle workspace:leave
    socket.on(REALTIME_EVENTS.WORKSPACE_LEAVE, ({ workspaceId }) => {
      if (!workspaceId) return;
      const room = `workspace:${workspaceId}`;
      socket.leave(room);
      presenceManager.removePresence(socket.id);

      const presenceList = presenceManager.getRoomPresence(workspaceId, "workspace");
      io?.to(room).emit(REALTIME_EVENTS.WORKSPACE_PRESENCE, presenceList);
    });

    // Handle project:join
    socket.on(REALTIME_EVENTS.PROJECT_JOIN, async ({ projectId }) => {
      try {
        if (!projectId) return;

        const project = await prisma.project.findUnique({
          where: { id: projectId },
        });

        if (!project) {
          socket.emit(REALTIME_EVENTS.ERROR, { message: "Project not found" });
          return;
        }

        if (project.workspaceId) {
          const membership = await prisma.workspaceMember.findUnique({
            where: {
              workspaceId_userId: {
                workspaceId: project.workspaceId,
                userId: user.userId,
              },
            },
          });
          if (!membership) {
            socket.emit(REALTIME_EVENTS.ERROR, { message: "Forbidden: Not a member of the project workspace" });
            return;
          }
        } else {
          if (project.userId !== user.userId) {
            socket.emit(REALTIME_EVENTS.ERROR, { message: "Forbidden: Access denied to personal project" });
            return;
          }
        }

        const room = `project:${projectId}`;
        socket.join(room);

        presenceManager.addPresence(socket.id, user, { projectId, workspaceId: project.workspaceId || undefined });

        const presenceList = presenceManager.getRoomPresence(projectId, "project");
        io?.to(room).emit(REALTIME_EVENTS.PROJECT_PRESENCE, presenceList);
      } catch (err: any) {
        socket.emit(REALTIME_EVENTS.ERROR, { message: err.message });
      }
    });

    // Handle project:leave
    socket.on(REALTIME_EVENTS.PROJECT_LEAVE, ({ projectId }) => {
      if (!projectId) return;
      const room = `project:${projectId}`;
      socket.leave(room);
      presenceManager.removePresence(socket.id);

      const presenceList = presenceManager.getRoomPresence(projectId, "project");
      io?.to(room).emit(REALTIME_EVENTS.PROJECT_PRESENCE, presenceList);
    });

    socket.on("disconnect", () => {
      const record = presenceManager.removePresence(socket.id);
      if (record) {
        if (record.workspaceId) {
          const wRoom = `workspace:${record.workspaceId}`;
          const presenceList = presenceManager.getRoomPresence(record.workspaceId, "workspace");
          io?.to(wRoom).emit(REALTIME_EVENTS.WORKSPACE_PRESENCE, presenceList);
        }
        if (record.projectId) {
          const pRoom = `project:${record.projectId}`;
          const presenceList = presenceManager.getRoomPresence(record.projectId, "project");
          io?.to(pRoom).emit(REALTIME_EVENTS.PROJECT_PRESENCE, presenceList);
        }
      }
    });
  });

  return io;
}

export function emitRealtimeEvent(room: string, event: string, payload: any) {
  if (io) {
    io.to(room).emit(event, payload);
  }
}
