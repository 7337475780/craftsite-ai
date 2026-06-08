import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

// Zod validation schemas
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

// Helper: Ensure middleware typescript types are correct
function getUserId(req: Request): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new Error("User ID missing from auth context");
  }
  return userId;
}

// GET /api/projects - Get all projects for current user
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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
});

// POST /api/projects - Create a new project
router.post("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id - Get a project by id (must own)
router.get("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== userId) {
       res.status(404).json({ success: false, message: "Project not found" });
       return;
    }

    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:id - Update project (must own)
router.patch("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
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

    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== userId) {
       res.status(404).json({ success: false, message: "Project not found" });
       return;
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        ...parsed.data,
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id - Delete a project (must own)
router.delete("/:id", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const id = req.params.id as string;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.userId !== userId) {
       res.status(404).json({ success: false, message: "Project not found" });
       return;
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export const projectsRouter = router;
