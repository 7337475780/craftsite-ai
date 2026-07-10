import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router({ mergeParams: true });

const requireAuth = (req: any, res: any, next: any) => next();

router.use(requireAuth);

// GET all pages for a project (shallow list for Sidebar)
router.get("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  try {
    const pages = await prisma.page.findMany({
      where: { projectId },
      orderBy: { order: "asc" },
      include: {
        sections: {
          include: {
            components: true
          },
          orderBy: { order: "asc" }
        }
      }
    });
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

// GET a specific page (deep fetch for visual builder)
router.get("/:pageId", async (req: any, res: any) => {
  const { projectId, pageId } = req.params;
  try {
    const page = await prisma.page.findFirst({
      where: { id: pageId, projectId },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            components: true
          }
        }
      }
    });
    
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }
    
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch page" });
  }
});

// POST create a new page
router.post("/", async (req: any, res: any) => {
  const { projectId } = req.params;
  const { title, slug, isHomepage } = req.body;
  
  try {
    const count = await prisma.page.count({ where: { projectId } });
    
    const newPage = await prisma.page.create({
      data: {
        projectId,
        title: title || "New Page",
        slug: slug || `/page-${count + 1}`,
        isHomepage: isHomepage || false,
        order: count,
        sections: {
          create: []
        }
      }
    });
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create page" });
  }
});

// PUT update page metadata
router.put("/:pageId", async (req: any, res: any) => {
  const { projectId, pageId } = req.params;
  const { title, slug, seoTitle, seoDescription, published, isHomepage } = req.body;
  
  try {
    const updatedPage = await prisma.page.update({
      where: { id: pageId, projectId },
      data: {
        title,
        slug,
        seoTitle,
        seoDescription,
        published,
        isHomepage
      }
    });
    
    res.json(updatedPage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update page" });
  }
});

// DELETE a page
router.delete("/:pageId", async (req: any, res: any) => {
  const { projectId, pageId } = req.params;
  
  try {
    await prisma.page.delete({
      where: { id: pageId, projectId }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

// POST save entire page tree (Autosave payload from Builder)
router.post("/:pageId/content", async (req: any, res: any) => {
  const { projectId, pageId } = req.params;
  const { sections } = req.body;
  
  try {
    await prisma.section.deleteMany({
      where: { pageId }
    });
    
    if (sections && sections.length > 0) {
      for (const section of sections) {
        await prisma.section.create({
          data: {
            pageId,
            id: section.id,
            type: section.type,
            order: section.order,
            components: {
              create: (section.components || []).map((comp: any) => ({
                id: comp.id,
                componentType: comp.componentType,
                props: comp.props
              }))
            }
          }
        });
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save page content" });
  }
});

export default router;
