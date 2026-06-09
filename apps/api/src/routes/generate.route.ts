import { Router } from "express";
import { z } from "zod";
import { generateWebsiteWithAI, editWebsiteWithAI } from "../services/ai/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UsageService } from "../services/usage.service.js";

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
generateRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const result = generateSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Check credits before generating (throws 402 if empty)
    await UsageService.ensureUserHasCredits(userId, 1);

    const { prompt, style, websiteType } = result.data;

    const aiResult = await generateWebsiteWithAI({
      prompt,
      style,
      websiteType,
    });

    const creditsRemaining = await UsageService.consumeCredits(
      userId,
      "generate_website",
      1,
      { prompt, provider: aiResult.provider, isFallback: aiResult.isFallback }
    );

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
        creditsRemaining,
      },
    });
  } catch (error) {
    console.error("Generate route error:", error);

    if ((error as any).status === 402) {
      return res.status(402).json({
        success: false,
        message: (error as any).message,
      });
    }

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
generateRouter.post("/edit", requireAuth, async (req, res, next) => {
  try {
    const result = editSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Check credits before editing
    await UsageService.ensureUserHasCredits(userId, 1);

    const { currentCode, editInstruction, originalPrompt } = result.data;

    const aiResult = await editWebsiteWithAI({
      currentCode,
      editInstruction,
      originalPrompt,
    });

    const creditsRemaining = await UsageService.consumeCredits(
      userId,
      "edit_website",
      1,
      { editInstruction, provider: aiResult.provider, isFallback: aiResult.isFallback }
    );

    return res.json({
      success: true,
      message: "Website edited successfully",
      data: {
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
        creditsRemaining,
      },
    });
  } catch (error) {
    console.error("Edit route error:", error);

    if ((error as any).status === 402) {
      return res.status(402).json({
        success: false,
        message: (error as any).message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Something went wrong while editing website.",
    });
  }
});
