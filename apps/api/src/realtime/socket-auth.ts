import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;
  cookieHeader.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join("="));
    }
  });
  return list;
}

export interface SocketUser {
  userId: string;
  email: string;
  name: string;
  image: string;
  role: string;
}

declare module "socket.io" {
  interface Socket {
    user?: SocketUser;
  }
}

export async function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    let token = cookies.craftsite_token;

    if (!token && socket.handshake.auth?.token) {
      token = socket.handshake.auth.token;
    }
    if (!token && socket.handshake.query?.token) {
      token = String(socket.handshake.query.token);
    }

    if (!token) {
      return next(new Error("Authentication failed: Token missing"));
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isBlocked: true,
      },
    });

    if (!user) {
      return next(new Error("Authentication failed: User no longer exists"));
    }

    if (user.isBlocked) {
      return next(new Error("Authentication failed: User is blocked"));
    }

    socket.user = {
      userId: user.id,
      email: user.email,
      name: user.name || "Anonymous",
      image: user.image || "",
      role: user.role,
    };

    next();
  } catch (err: any) {
    next(new Error(`Authentication failed: ${err.message}`));
  }
}
