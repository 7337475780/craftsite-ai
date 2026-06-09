import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UsageService } from "../services/usage.service.js";

export const usageRouter = Router();

// GET /api/usage/me
usageRouter.get("/me", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { credits, plan } = await UsageService.getUserCredits(userId);

    const recentUsage = await prisma.usageLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        credits,
        plan,
        recentUsage,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/usage/dev/reset-credits
usageRouter.post("/dev/reset-credits", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === "production") {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const { credits } = req.body;
    if (typeof credits !== "number" || credits < 0) {
      res.status(400).json({ success: false, message: "Invalid credits amount" });
      return;
    }

    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { credits },
    });

    res.json({ success: true, message: `Credits reset to ${credits}` });
  } catch (error) {
    next(error);
  }
});
