import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";

const router = Router({ mergeParams: true });

// Basic encryption helper (in production, use a more robust KMS/AES-GCM approach)
const encryptValue = (val: string) => Buffer.from(val).toString('base64');
const decryptValue = (val: string) => Buffer.from(val, 'base64').toString('ascii');

// Dummy auth middleware
const requireAuth = (req: any, res: any, next: any) => next();
router.use(requireAuth);

router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const vars = await prisma.environmentVariable.findMany({
      where: { projectId },
      orderBy: { key: "asc" }
    });
    // Decrypt for UI representation
    const decrypted = vars.map(v => ({
      ...v,
      value: decryptValue(v.value)
    }));
    res.json(decrypted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch environment variables" });
  }
});

router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { key, value, environment } = req.body;

  if (!key || !value || !environment) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const newVar = await prisma.environmentVariable.create({
      data: {
        projectId,
        key: key.toUpperCase(),
        value: encryptValue(value),
        environment
      }
    });
    res.status(201).json({ ...newVar, value: decryptValue(newVar.value) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add environment variable" });
  }
});

router.delete("/:id", async (req: any, res: any) => {
  const { id } = req.params;
  try {
    await prisma.environmentVariable.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete environment variable" });
  }
});

export default router;
