import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.use(async (req: any, res: any, next: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { workspace: true },
  });

  if (!project) return res.status(404).json({ success: false, message: "Project not found" });

  if (project.userId !== req.auth?.userId && !project.workspaceId) {
    return res.status(403).json({ success: false, message: "Unauthorized access" });
  }
  next();
});

// GET /api/projects/:projectId/navigation
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const navs = await prisma.navigation.findMany({
      where: { projectId },
      include: {
        items: {
          orderBy: { order: "asc" },
        },
      },
    });
    res.json({ success: true, data: navs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:projectId/navigation
router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const { name } = req.body;
    const newNav = await prisma.navigation.create({
      data: {
        projectId,
        name: name || "Main Navigation",
      },
      include: { items: true },
    });
    res.json({ success: true, data: newNav });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:projectId/navigation/:navId/items
router.post("/:navId/items", async (req: any, res: any) => {
  const { navId } = req.params;
  try {
    const { label, url, isExternal, parentId } = req.body;
    const order = await prisma.menuItem.count({ where: { navigationId: navId, parentId: parentId || null } });
    
    const newItem = await prisma.menuItem.create({
      data: {
        navigationId: navId,
        label,
        url,
        isExternal: isExternal || false,
        parentId,
        order,
      },
    });
    res.json({ success: true, data: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:projectId/navigation/:navId/items/:itemId
router.delete("/:navId/items/:itemId", async (req: any, res: any) => {
  const { itemId } = req.params;
  try {
    await prisma.menuItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: "Item deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
