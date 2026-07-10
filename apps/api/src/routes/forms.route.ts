import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.use(async (req: any, res: any, next: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  next();
});

/**
 * GET /api/projects/:projectId/forms
 * List all form submissions, newest first
 */
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { formId, status } = req.query;
  try {
    const submissions = await prisma.formSubmission.findMany({
      where: {
        projectId,
        ...(formId ? { formId: String(formId) } : {}),
        ...(status ? { status: String(status) } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: submissions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/projects/:projectId/forms/submit
 * Public submission endpoint (called from the published website's form)
 */
router.post("/submit", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { formId, data } = req.body;

  if (!formId || !data) {
    return res.status(400).json({ success: false, message: "Missing formId or data" });
  }

  try {
    const submission = await prisma.formSubmission.create({
      data: {
        projectId,
        formId: String(formId),
        data,
        visitorIp: (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || null,
        userAgent: req.headers["user-agent"] || null,
        status: "new",
      },
    });
    res.status(201).json({ success: true, data: submission });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/projects/:projectId/forms/:submissionId
 * Update submission status (new -> read -> archived)
 */
router.patch("/:submissionId", async (req: any, res: any) => {
  const { submissionId } = req.params;
  const { status } = req.body;

  const validStatuses = ["new", "read", "archived"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  try {
    const updated = await prisma.formSubmission.update({
      where: { id: String(submissionId) },
      data: { status },
    });
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * DELETE /api/projects/:projectId/forms/:submissionId
 */
router.delete("/:submissionId", async (req: any, res: any) => {
  const { submissionId } = req.params;
  try {
    await prisma.formSubmission.delete({ where: { id: String(submissionId) } });
    res.json({ success: true, message: "Submission deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
