import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { z } from "zod";
import dns from "dns/promises";

const router = Router({ mergeParams: true });

// Dummy auth middleware for the route
const requireAuth = (req: any, res: any, next: any) => next();
router.use(requireAuth);

// Get domains for a project
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  
  try {
    const domains = await prisma.domain.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" }
    });
    res.json(domains);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch domains" });
  }
});

// Add a new custom domain
router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { hostname } = req.body;

  if (!hostname) {
    return res.status(400).json({ error: "Hostname is required" });
  }

  try {
    const existing = await prisma.domain.findUnique({
      where: { hostname }
    });

    if (existing) {
      return res.status(400).json({ error: "Domain is already registered to another project." });
    }

    const domain = await prisma.domain.create({
      data: {
        projectId,
        hostname,
        status: "pending",
        sslStatus: "initializing",
        verification: {
          type: "TXT",
          name: `_craftsite-challenge.${hostname}`,
          value: `craftsite-verify=${Math.random().toString(36).substring(2, 15)}`
        }
      }
    });

    res.status(201).json(domain);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add domain" });
  }
});

// Actually check DNS verification status
router.post("/:domainId/verify", async (req: any, res: any) => {
  const { domainId } = req.params;

  try {
    const domain = await prisma.domain.findUnique({
      where: { id: domainId }
    });

    if (!domain) return res.status(404).json({ error: "Domain not found" });

    // Assuming domain.verification has type, name, value properties stored as JSON
    const verification = domain.verification as any;
    if (!verification || verification.type !== "TXT") {
       return res.status(400).json({ error: "Invalid verification records" });
    }

    try {
      // Actually resolve the TXT records via Node DNS
      const records = await dns.resolveTxt(verification.name);
      // dns.resolveTxt returns an array of arrays of strings
      const flattened = records.flat();
      
      if (!flattened.includes(verification.value)) {
        return res.status(400).json({ error: "Verification TXT record not found on DNS server." });
      }
    } catch (dnsError: any) {
      // ENOTFOUND or ENODATA etc
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Dev] Bypassing real DNS check for ${verification.name} due to error:`, dnsError.message);
      } else {
        return res.status(400).json({ error: `Failed to resolve DNS: ${dnsError.message}` });
      }
    }

    // Mark as verified
    const updated = await prisma.domain.update({
      where: { id: domainId },
      data: {
        status: "active",
        sslStatus: "active"
      }
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify domain" });
  }
});

// Delete a domain
router.delete("/:domainId", async (req: any, res: any) => {
  const { domainId } = req.params;

  try {
    await prisma.domain.delete({
      where: { id: domainId }
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete domain" });
  }
});

export default router;
