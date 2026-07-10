import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

// Validate project ownership
router.use(async (req: any, res: any, next: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  next();
});

/**
 * GET /api/projects/:projectId/media
 * List all media for a project
 */
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { type } = req.query; // optional filter: image | video | document
  try {
    const media = await prisma.media.findMany({
      where: { projectId, ...(type ? { type: String(type) } : {}) },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: media });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/projects/:projectId/media
 * Register a media record (URL already uploaded externally or via base64 data-URL in dev)
 * In production, this would accept a multipart upload and push to S3/R2.
 * For now, accepts { name, url, type, size } directly.
 */
router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { name, url, type, size } = req.body;

  if (!name || !url || !type) {
    return res.status(400).json({ success: false, message: "Missing required fields: name, url, type" });
  }

  try {
    const media = await prisma.media.create({
      data: {
        projectId,
        name: String(name),
        url: String(url),
        type: String(type),
        size: Number(size) || 0,
      },
    });
    res.status(201).json({ success: true, data: media });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/projects/:projectId/media/:mediaId
 */
router.delete("/:mediaId", async (req: any, res: any) => {
  const { mediaId } = req.params;
  try {
    await prisma.media.delete({ where: { id: String(mediaId) } });
    res.json({ success: true, message: "Media deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
