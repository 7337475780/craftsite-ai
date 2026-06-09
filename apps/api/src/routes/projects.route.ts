import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { editWebsiteWithAI } from "../services/ai/index.js";
import { generateUniqueShareSlug } from "../lib/share.js";
import { UsageService } from "../services/usage.service.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { EVENTS } from "../lib/events.js";

const router = Router();

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  prompt: z.string().min(1, "Prompt is required"),
  generatedCode: z.string().min(1, "Generated code is required"),
  provider: z.string(),
  isFallback: z.boolean().default(false),
});

const updateProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  prompt: z.string().optional(),
  generatedCode: z.string().optional(),
  provider: z.string().optional(),
  isFallback: z.boolean().optional(),
});

const editProjectSchema = z.object({
  editInstruction: z
    .string()
    .min(5, "Edit instruction must be at least 5 characters"),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new Error("User ID missing from auth context");
  }
  return userId;
}

// ─── Project CRUD ─────────────────────────────────────────────────────────────

// GET /api/projects — Get all projects for current user
router.get(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/projects — Create a new project
router.post(
  "/",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const parsed = createProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.format(),
        });
        return;
      }

      const project = await prisma.project.create({
        data: {
          userId,
          ...parsed.data,
        },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_CREATED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/projects/:id — Get a project by id (must own)
router.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/projects/:id — Update project (must own)
router.patch(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const parsed = updateProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.format(),
        });
        return;
      }

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      const updated = await prisma.project.update({
        where: { id },
        data: { ...parsed.data },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_UPDATED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/projects/:id — Delete a project (must own)
router.delete(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      await prisma.project.delete({
        where: { id },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_DELETED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// ─── AI Edit ──────────────────────────────────────────────────────────────────

// POST /api/projects/:id/edit — Edit project code with AI (protected)
router.post(
  "/:id/edit",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const parsed = editProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: parsed.error.format(),
        });
        return;
      }

      const { editInstruction } = parsed.data;

      // Verify project ownership
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      // Check credits before editing
      await UsageService.ensureUserHasCredits(userId, 1);

      // Determine next version number
      const versionCount = await prisma.projectVersion.count({
        where: { projectId: id },
      });
      const nextVersionNumber = versionCount + 1;

      // Save current code as a version BEFORE editing
      await prisma.projectVersion.create({
        data: {
          projectId: id,
          userId,
          versionNumber: nextVersionNumber,
          title: `Version ${nextVersionNumber}`,
          generatedCode: project.generatedCode,
          editPrompt: editInstruction,
        },
      });

      // Call AI to edit the website
      const aiResult = await editWebsiteWithAI({
        currentCode: project.generatedCode,
        editInstruction,
        originalPrompt: project.prompt,
      });

      // Update project with edited code
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          generatedCode: aiResult.generatedCode,
          provider: aiResult.provider,
          isFallback: aiResult.isFallback,
        },
      });

      // Consume credit
      const creditsRemaining = await UsageService.consumeCredits(
        userId,
        "project_edit",
        1,
        { projectId: id, editInstruction, provider: aiResult.provider, isFallback: aiResult.isFallback }
      );

      res.json({
        success: true,
        message: "Website edited successfully",
        data: {
          project: updatedProject,
          provider: aiResult.provider,
          isFallback: aiResult.isFallback,
          creditsRemaining,
        },
      });
    } catch (error) {
      if ((error as any).status === 402) {
        return res.status(402).json({
          success: false,
          message: (error as any).message,
        });
      }
      next(error);
    }
  },
);

// ─── Version History ──────────────────────────────────────────────────────────

// GET /api/projects/:id/versions — Get all versions for a project (protected)
router.get(
  "/:id/versions",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      // Verify project ownership
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      const versions = await prisma.projectVersion.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          projectId: true,
          userId: true,
          versionNumber: true,
          title: true,
          editPrompt: true,
          createdAt: true,
          // Omit generatedCode from list for performance — fetched on restore
        },
      });

      res.json({ success: true, data: versions });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/projects/:id/versions/:versionId/restore — Restore a version (protected)
router.post(
  "/:id/versions/:versionId/restore",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;
      const versionId = req.params.versionId as string;

      // Verify project ownership
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      // Find the version to restore (must belong to this project)
      const version = await prisma.projectVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || version.projectId !== id) {
        res
          .status(404)
          .json({ success: false, message: "Version not found" });
        return;
      }

      // Save current code as a new snapshot before restoring
      const versionCount = await prisma.projectVersion.count({
        where: { projectId: id },
      });
      await prisma.projectVersion.create({
        data: {
          projectId: id,
          userId,
          versionNumber: versionCount + 1,
          title: `Version ${versionCount + 1} (snapshot before restore)`,
          generatedCode: project.generatedCode,
          editPrompt: `Snapshot before restoring to v${version.versionNumber}`,
        },
      });

      // Restore the project code
      const updatedProject = await prisma.project.update({
        where: { id },
        data: {
          generatedCode: version.generatedCode,
        },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_VERSION_RESTORED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.json({
        success: true,
        message: `Restored to version ${version.versionNumber}`,
        data: updatedProject,
      });
    } catch (error) {
      next(error);
    }
  },
);

// DELETE /api/projects/:id/versions/:versionId — Delete a version (protected)
router.delete(
  "/:id/versions/:versionId",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;
      const versionId = req.params.versionId as string;

      // Verify project ownership
      const project = await prisma.project.findUnique({
        where: { id },
      });

      if (!project || project.userId !== userId) {
        res
          .status(404)
          .json({ success: false, message: "Project not found" });
        return;
      }

      // Find version and verify it belongs to this project
      const version = await prisma.projectVersion.findUnique({
        where: { id: versionId },
      });

      if (!version || version.projectId !== id) {
        res
          .status(404)
          .json({ success: false, message: "Version not found" });
        return;
      }

      await prisma.projectVersion.delete({
        where: { id: versionId },
      });

      res.json({ success: true, message: "Version deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
);

// ─── Publish / Unpublish ─────────────────────────────────────────────────────

// POST /api/projects/:id/publish — Publish a project and generate a share slug
router.post(
  "/:id/publish",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({ where: { id } });

      if (!project || project.userId !== userId) {
        res.status(404).json({ success: false, message: "Project not found" });
        return;
      }

      // If already published, return existing data
      if (project.isPublished && project.shareSlug) {
        res.json({
          success: true,
          message: "Project is already published",
          data: {
            ...project,
            shareSlug: project.shareSlug,
          },
        });
        return;
      }

      const shareSlug = await generateUniqueShareSlug(project.title);

      const updated = await prisma.project.update({
        where: { id },
        data: {
          isPublished: true,
          shareSlug,
          publishedAt: new Date(),
        },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_PUBLISHED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.json({
        success: true,
        message: "Project published successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/projects/:id/unpublish — Unpublish a project and remove share slug
router.post(
  "/:id/unpublish",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const id = req.params.id as string;

      const project = await prisma.project.findUnique({ where: { id } });

      if (!project || project.userId !== userId) {
        res.status(404).json({ success: false, message: "Project not found" });
        return;
      }

      const updated = await prisma.project.update({
        where: { id },
        data: {
          isPublished: false,
          shareSlug: null,
          publishedAt: null,
        },
      });

      AnalyticsService.trackEvent({
        userId,
        event: EVENTS.PROJECT_UNPUBLISHED,
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      res.json({
        success: true,
        message: "Project unpublished successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  },
);

export const projectsRouter = router;
