import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { EVENTS } from "../lib/events.js";

const router = Router();

/**
 * GET /api/public/projects/:shareSlug
 *
 * Returns a published project by its share slug.
 * No authentication required — public route.
 * Does NOT expose userId or any private user data.
 */
router.get(
  "/projects/:shareSlug",
  async (req: Request, res: Response) => {
    try {
      const shareSlug = req.params.shareSlug as string;

      const project = await prisma.project.findFirst({
        where: {
          shareSlug,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          prompt: true,
          generatedCode: true,
          provider: true,
          isFallback: true,
          publishedAt: true,
          createdAt: true,
          // Deliberately exclude: userId, user, versions, shareSlug, isPublished, updatedAt
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Published project not found",
        });
      }

      AnalyticsService.trackEvent({
        event: EVENTS.PUBLIC_SHARE_VIEWED,
        metadata: {
          projectId: project.id,
          shareSlug,
        },
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      return res.json({
        success: true,
        data: project,
      });
    } catch (error) {
      console.error("Public project route error:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
);

export const publicRouter = router;
