import { Router } from "express";
import { z } from "zod";
import { generateWebsiteWithAI } from "../services/ai/index.js";

export const generateRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  style: z.string().optional(),
  websiteType: z.string().optional(),
});

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
