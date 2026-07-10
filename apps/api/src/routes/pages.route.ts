import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { BuilderPageSchema } from "@craftsite/shared";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Middleware to verify project access
router.use(async (req: any, res: any, next: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });

  if (!project) {
    return res.status(404).json({ success: false, message: "Project not found" });
  }

  // Basic check: user owns project or is in workspace
  if (project.userId !== req.auth?.userId && !project.workspaceId) {
    return res.status(403).json({ success: false, message: "Unauthorized access" });
  }

  next();
});

// GET /api/projects/:projectId/pages
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
    });
    res.json({ success: true, data: pages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:projectId/pages
router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const { title, slug, isHome, layoutId, builderData, status } = req.body;
    
    // Validation: if isHome is true, ensure no other page isHome
    if (isHome) {
      await prisma.page.updateMany({
        where: { projectId, isHome: true },
        data: { isHome: false },
      });
    }

    const order = await prisma.page.count({ where: { projectId } });

    const newPage = await prisma.page.create({
      data: {
        projectId,
        title,
        slug,
        isHome: isHome || false,
        layoutId,
        builderData: builderData || { sections: [] },
        status: status || "draft",
        order,
      },
    });

    res.json({ success: true, data: newPage });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(400).json({ success: false, message: "A page with this slug already exists." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:projectId/pages/:id
router.put("/:id", async (req: any, res: any) => {
  const { projectId, id } = req.params;
  try {
    const { title, slug, isHome, layoutId, builderData, status, seoMetadata } = req.body;
    
    if (isHome) {
      await prisma.page.updateMany({
        where: { projectId, isHome: true, id: { not: id } },
        data: { isHome: false },
      });
    }

    const updatedPage = await prisma.page.update({
      where: { id, projectId },
      data: {
        title,
        slug,
        isHome,
        layoutId,
        builderData,
        status,
        seoMetadata,
      },
    });

    res.json({ success: true, data: updatedPage });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(400).json({ success: false, message: "A page with this slug already exists." });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:projectId/pages/:id
router.delete("/:id", async (req: any, res: any) => {
  const { projectId, id } = req.params;
  try {
    await prisma.page.delete({
      where: { id, projectId },
    });
    res.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
