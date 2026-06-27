import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { NotificationService } from "../services/notification.service.js";

const router = Router();

// GET /api/notifications — Retrieve user notifications
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { unreadOnly, page = "1", limit = "20" } = req.query;

    const parsedPage = Math.max(1, parseInt(String(page)) || 1);
    const parsedLimit = Math.max(1, Math.min(100, parseInt(String(limit)) || 20));
    const skip = (parsedPage - 1) * parsedLimit;

    // Filter
    const whereClause: any = { userId };
    if (unreadOnly === "true") {
      whereClause.readAt = null;
    }

    // Fetch count & data
    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: parsedLimit,
      }),
      prisma.notification.count({ where: whereClause }),
      NotificationService.getUnreadCount(userId),
    ]);

    const totalPages = Math.ceil(totalCount / parsedLimit);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          totalCount,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/unread-count — Get only unread notifications count
router.get("/unread-count", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const unreadCount = await NotificationService.getUnreadCount(userId);
    res.json({ success: true, data: { unreadCount } });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/notifications/:id/read — Mark single notification as read
router.patch("/:id/read", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { id } = req.params as { id: string };

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    await NotificationService.markNotificationRead(userId, id);

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
});

// POST /api/notifications/read-all — Mark all user notifications as read
router.post("/read-all", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    await NotificationService.markAllNotificationsRead(userId);
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notifications/:id — Delete a notification
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth?.userId!;
    const { id } = req.params as { id: string };

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      res.status(404).json({ success: false, message: "Notification not found" });
      return;
    }

    await prisma.notification.delete({
      where: { id },
    });

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const notificationsRouter = router;
