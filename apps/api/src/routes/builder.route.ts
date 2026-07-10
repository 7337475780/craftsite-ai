import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { BuilderProjectSchema } from "@craftsite/shared";
import { compileBuilderToReact } from "../services/builder-compiler.service";

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

// Dummy auth middleware for the sake of the route. 
// In a real app, use the actual requireAuth and requireProjectAccess middlewares.
const requireAuth = (req: any, res: any, next: any) => next();

router.use(requireAuth);

router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) return res.status(404).json({ error: "Project not found" });

  res.json({
    builderEnabled: project.builderEnabled,
    builderVersion: project.builderVersion,
    builderData: project.builderData,
    generatedCode: project.generatedCode
  });
});

router.post("/initialize", async (req: any, res: any) => {
  const { projectId } = req.params;
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  
  if (!project) return res.status(404).json({ error: "Project not found" });
  if (project.builderEnabled && project.builderData) {
    return res.json(project);
  }

  // Create initial structured template
  const initialBuilderData = {
    version: 1,
    theme: {
      primaryColor: "#4f46e5",
      secondaryColor: "#f3f4f6",
      accentColor: "#8b5cf6",
      backgroundColor: "#ffffff",
      textColor: "#111827",
      mutedTextColor: "#6b7280",
      fontFamily: "Inter",
      borderRadius: "md",
      containerWidth: "lg",
      spacingScale: "normal"
    },
    sections: [
      {
        id: "nav-1",
        type: "navbar",
        visible: true,
        order: 0,
        props: { logoText: project.title, links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }] }
      },
      {
        id: "hero-1",
        type: "hero",
        visible: true,
        order: 1,
        props: { heading: project.title, description: "A beautifully generated website.", primaryCta: "Get Started" }
      },
      {
        id: "footer-1",
        type: "footer",
        visible: true,
        order: 2,
        props: { brand: project.title, copyright: "© 2026. All rights reserved." }
      }
    ]
  };

  const generatedCode = compileBuilderToReact(initialBuilderData as any);

  // Save version of current state
  await prisma.projectVersion.create({
    data: {
      projectId: project.id,
      userId: project.userId,
      versionNumber: (await prisma.projectVersion.count({ where: { projectId: project.id } })) + 1,
      generatedCode: project.generatedCode,
      title: "Before Visual Builder Conversion"
    }
  });

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: {
      builderEnabled: true,
      builderData: initialBuilderData,
      generatedCode
    }
  });

  res.json(updated);
});

router.put("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { builderData } = req.body;
  
  try {
    const parsedData = BuilderProjectSchema.parse(builderData);
    
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return res.status(404).json({ error: "Project not found" });

    // Conflict safety check could be added here checking parsedData.version == project.builderVersion

    const generatedCode = compileBuilderToReact(parsedData as any);

    // Create version
    await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        userId: project.userId, // Assume req.user.id in real app
        versionNumber: (await prisma.projectVersion.count({ where: { projectId: project.id } })) + 1,
        generatedCode: project.generatedCode,
        builderData: project.builderData || {},
        source: "visual_builder"
      }
    });

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        builderData: parsedData,
        builderVersion: { increment: 1 },
        generatedCode,
        lastBuilderSavedAt: new Date()
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: "Invalid builder data", details: error });
  }
});

router.post("/compile", async (req: any, res: any) => {
  try {
    const parsedData = BuilderProjectSchema.parse(req.body.builderData);
    const generatedCode = compileBuilderToReact(parsedData as any);
    res.json({ generatedCode });
  } catch (error) {
    res.status(400).json({ error: "Invalid builder data", details: error });
  }
});

export default router;
