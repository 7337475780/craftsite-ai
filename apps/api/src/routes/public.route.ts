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

/**
 * GET /api/public/projects/:shareSlug/collections
 * Returns all published collections and their published items for a project.
 * No authentication required — public route.
 */
router.get(
  "/projects/:shareSlug/collections",
  async (req: Request, res: Response) => {
    try {
      const shareSlug = req.params.shareSlug as string;

      const project = await prisma.project.findFirst({
        where: { shareSlug: String(shareSlug), isPublished: true },
        select: { id: true },
      });

      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }

      const collections = await prisma.collection.findMany({
        where: { projectId: project.id },
        include: {
          items: {
            where: { status: "published" },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { name: "asc" },
      });

      return res.json({ success: true, data: collections });
    } catch (error) {
      console.error("Public collections route error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  },
);

/**
 * GET /api/public/projects/:shareSlug/collections/:collectionSlug/items/:itemSlug
 * Returns a single published collection item.
 */
router.get(
  "/projects/:shareSlug/collections/:collectionSlug/items/:itemSlug",
  async (req: Request, res: Response) => {
    try {
      const shareSlug = String(req.params.shareSlug);
      const collectionSlug = String(req.params.collectionSlug);
      const itemSlug = String(req.params.itemSlug);

      const project = await prisma.project.findFirst({
        where: { shareSlug, isPublished: true },
        select: { id: true },
      });
      if (!project) return res.status(404).json({ success: false, message: "Project not found" });

      const collection = await prisma.collection.findUnique({
        where: { projectId_slug: { projectId: project.id, slug: collectionSlug } },
        select: { id: true, name: true, slug: true },
      });
      if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

      const item = await prisma.collectionItem.findUnique({
        where: { collectionId_slug: { collectionId: collection.id, slug: itemSlug } },
      });
      if (!item || item.status !== "published") {
        return res.status(404).json({ success: false, message: "Item not found" });
      }

      return res.json({ success: true, data: { collection, item } });
    } catch (error) {
      console.error("Public collection item route error:", error);
      return res.status(500).json({ success: false, message: "Something went wrong" });
    }
  },
);

export const publicRouter = router;
