import { Request, Response, NextFunction } from "express";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  // Must be called after requireAuth
  if (!req.auth) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }

  if (req.auth.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Forbidden - Admin access required",
    });
    return;
  }

  next();
};
