import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Read token from cookie
    let token = req.cookies?.craftsite_token;

    // 2. Fallback to Authorization Bearer header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(" ");
      if (parts[0] === "Bearer" && parts[1]) {
        token = parts[1];
      }
    }

    if (!token) {
       res.status(401).json({
        success: false,
        message: "Unauthorized - Authentication token missing",
      });
       return;
    }

    // 3. Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // 4. Fetch user to verify they are not blocked and get current role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isBlocked: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - User no longer exists",
      });
      return;
    }

    if (user.isBlocked) {
      res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
      return;
    }

    // 5. Attach auth to request
    req.auth = {
      userId: decoded.userId,
      email: decoded.email,
      role: user.role,
    };

    next();
  } catch (err) {
     res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or expired authentication token",
    });
  }
};
