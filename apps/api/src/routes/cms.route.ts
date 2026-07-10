import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.use(async (req: any, res: any, next: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  next();
});

// GET /api/projects/:projectId/cms/collections
router.get("/collections", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const collections = await prisma.collection.findMany({
      where: { projectId },
      include: { items: true },
    });
    res.json({ success: true, data: collections });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:projectId/cms/collections
router.post("/collections", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const { name, slug, schema } = req.body;
    const newCollection = await prisma.collection.create({
      data: {
        projectId,
        name,
        slug,
        schema: schema || {},
      },
      include: { items: true },
    });
    res.json({ success: true, data: newCollection });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/projects/:projectId/cms/collections/:collectionId/items
router.post("/collections/:collectionId/items", async (req: any, res: any) => {
  const { collectionId } = req.params;
  try {
    const { title, slug, status, featuredImage, richText, customData } = req.body;
    const newItem = await prisma.collectionItem.create({
      data: {
        collectionId,
        title,
        slug,
        status: status || "draft",
        featuredImage,
        richText,
        customData: customData || {},
      },
    });
    res.json({ success: true, data: newItem });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:projectId/cms/collections/:collectionId/items/:itemId
router.delete("/collections/:collectionId/items/:itemId", async (req: any, res: any) => {
  const { itemId } = req.params;
  try {
    await prisma.collectionItem.delete({ where: { id: itemId } });
    res.json({ success: true, message: "Item deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:projectId/cms/collections/:collectionId
router.put("/collections/:collectionId", async (req: any, res: any) => {
  const { collectionId } = req.params;
  try {
    const { name, slug, schema } = req.body;
    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: { name, slug, schema },
    });
    res.json({ success: true, data: updatedCollection });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/projects/:projectId/cms/collections/:collectionId
router.delete("/collections/:collectionId", async (req: any, res: any) => {
  const { collectionId } = req.params;
  try {
    await prisma.collection.delete({ where: { id: collectionId } });
    res.json({ success: true, message: "Collection deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/projects/:projectId/cms/collections/:collectionId/items/:itemId
router.put("/collections/:collectionId/items/:itemId", async (req: any, res: any) => {
  const { itemId } = req.params;
  try {
    const { title, slug, status, featuredImage, richText, customData } = req.body;
    const updatedItem = await prisma.collectionItem.update({
      where: { id: itemId },
      data: {
        title,
        slug,
        status,
        featuredImage,
        richText,
        customData,
      },
    });
    res.json({ success: true, data: updatedItem });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
