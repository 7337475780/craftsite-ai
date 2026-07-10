import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router({ mergeParams: true });

// Dummy auth middleware for the route
const requireAuth = (req: any, res: any, next: any) => next();
router.use(requireAuth);

// Get deployments for a project
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  
  try {
    const deployments = await prisma.deployment.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(deployments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch deployments" });
  }
});

// Trigger a new simulated deployment
router.post("/deploy", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { environment = "production" } = req.body;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    // Generate a unique version hash based on timestamp
    const versionHash = `v${Math.floor(Date.now() / 1000).toString(16)}`;

    // Create the deployment record in 'building' state
    const deployment = await prisma.deployment.create({
      data: {
        projectId,
        version: versionHash,
        environment,
        status: "building",
        url: `https://${project.shareSlug || project.id}-${versionHash}.craftsite.app`
      }
    });

    // Simulate async build process
    setTimeout(async () => {
      await prisma.deployment.update({
        where: { id: deployment.id },
        data: {
          status: "ready",
          deployedAt: new Date(),
          buildLogs: "[INFO] Compiling Next.js application...\n[INFO] Optimization complete.\n[SUCCESS] Deployed successfully!"
        }
      });
      // Optionally update project's published status
      if (environment === "production") {
        await prisma.project.update({
          where: { id: projectId },
          data: { isPublished: true, publishedAt: new Date() }
        });
      }
    }, 5000); // Simulate 5 second build time

    res.status(201).json(deployment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to trigger deployment" });
  }
});

// Rollback to a specific deployment
router.post("/:deploymentId/rollback", async (req: any, res: any) => {
  const { projectId, deploymentId } = req.params;

  try {
    const targetDeployment = await prisma.deployment.findUnique({
      where: { id: deploymentId }
    });

    if (!targetDeployment || targetDeployment.projectId !== projectId) {
      return res.status(404).json({ error: "Deployment not found" });
    }

    // Create a new deployment record that replicates the target
    const newVersionHash = `v${Math.floor(Date.now() / 1000).toString(16)}`;
    
    const rollbackDeployment = await prisma.deployment.create({
      data: {
        projectId,
        version: newVersionHash,
        environment: targetDeployment.environment,
        status: "building",
        buildLogs: `[INFO] Rolling back to deployment ${targetDeployment.version}...`,
        url: targetDeployment.url // In a real system, you might alias the domain
      }
    });

    // Simulate rollback
    setTimeout(async () => {
      await prisma.deployment.update({
        where: { id: rollbackDeployment.id },
        data: {
          status: "ready",
          deployedAt: new Date(),
          buildLogs: rollbackDeployment.buildLogs + "\n[SUCCESS] Rollback complete!"
        }
      });
    }, 2000);

    res.json(rollbackDeployment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to rollback" });
  }
});

export default router;
