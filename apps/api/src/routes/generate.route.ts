import { Router } from "express";
import { z } from "zod";
import { generateWebsiteWithAI, editWebsiteWithAI } from "../services/ai/index.js";

export const generateRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  style: z.string().optional(),
  websiteType: z.string().optional(),
});

const editSchema = z.object({
  currentCode: z.string().min(20, "currentCode must be at least 20 characters"),
  editInstruction: z.string().min(5, "editInstruction must be at least 5 characters"),
  originalPrompt: z.string().optional(),
});

// POST /api/generate — Generate a new website
generateRouter.post("/", async (req, res) => {
  try {
    const result = generateSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { prompt, style, websiteType } = result.data;

    const aiResult = await generateWebsiteWithAI({
      prompt,
      style,
      websiteType,
    });

    return res.json({
      success: true,
      message: "Website generated successfully",
      data: {
        prompt,
        style: style || "modern",
        websiteType: websiteType || "landing-page",
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
      },
    });
  } catch (error) {
    console.error("Generate route error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while generating website.",
    });
  }
});

// POST /api/generate/edit — Edit existing code without saving (unsaved preview edit)
generateRouter.post("/edit", async (req, res) => {
  try {
    const result = editSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { currentCode, editInstruction, originalPrompt } = result.data;

    const aiResult = await editWebsiteWithAI({
      currentCode,
      editInstruction,
      originalPrompt,
    });

    return res.json({
      success: true,
      message: "Website edited successfully",
      data: {
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
      },
    });
  } catch (error) {
    console.error("Edit route error:", error);

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while editing website.",
    });
  }
});
