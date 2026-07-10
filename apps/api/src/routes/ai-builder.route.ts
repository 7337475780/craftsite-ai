import { Router } from "express";
import { z } from "zod";
import { BuilderSectionSchema } from "@craftsite/shared";
// Mock AI endpoint for section generation

const router = Router({ mergeParams: true });

router.post("/ai-edit", async (req: any, res: any) => {
  const { sectionId, instruction, builderData } = req.body;
  // In a real app, we would use an LLM with structured output to mutate the section.
  // We'll mock a simple response.
  res.json({ success: true, message: "AI editing mock successful." });
});

router.post("/ai-section", async (req: any, res: any) => {
  const { type, instruction } = req.body;
  // Mock AI generation of a section
  const mockSection = {
    id: `ai-${Date.now()}`,
    type: type || "hero",
    visible: true,
    order: 0,
    props: {
      heading: "AI Generated Content",
      description: "Based on: " + instruction
    }
  };
  
  try {
    const validated = BuilderSectionSchema.parse(mockSection);
    res.json(validated);
  } catch(e) {
    res.status(400).json({ error: "Failed to generate valid section" });
  }
});

export default router;
