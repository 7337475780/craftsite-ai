import { Router } from "express";
import { z } from "zod";
import { BuilderSectionSchema } from "@craftsite/shared";
import { extractWebsiteContext, generateStructuralDiff, generateWebsiteCritique } from "../services/ai-agent.service";

const router = Router({ mergeParams: true });

// Phase 29: AI Chat and Structural Editing Endpoint
router.post("/chat", async (req: any, res: any) => {
  const { prompt, builderData, activePageId, selectedNodeId } = req.body;
  
  if (!prompt || !builderData) {
    return res.status(400).json({ error: "Missing required fields: prompt, builderData" });
  }

  try {
    // 1. Extract structural context to simulate LLM memory
    const context = extractWebsiteContext(builderData, activePageId);

    // 2. Generate simulated structured JSON patch / diff
    const structuralDiff = generateStructuralDiff(prompt, selectedNodeId, context);
    
    // 3. Return the natural language response + diff payload
    const textResponse = selectedNodeId 
      ? `I've analyzed your context and modified the selected component to match "${prompt}". Check the preview and apply if it looks good!`
      : `I've generated a new component based on "${prompt}". You can apply this structural change to your layout.`;

    res.json({
      role: "assistant",
      text: textResponse,
      diff: structuralDiff
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
});

// Phase 29: AI Site Analysis Endpoint (SEO, Accessibility, Design Critique)
router.post("/analyze", async (req: any, res: any) => {
  const { builderData, activePageId } = req.body;
  
  if (!builderData) return res.status(400).json({ error: "Missing builderData" });

  try {
    const context = extractWebsiteContext(builderData, activePageId);
    const critique = generateWebsiteCritique(context);
    res.json(critique);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to analyze website" });
  }
});

// Legacy Phase 28 Mock Endpoint
router.post("/ai-section", async (req: any, res: any) => {
  const { type, instruction } = req.body;
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
