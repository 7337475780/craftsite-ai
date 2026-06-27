import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { generateWebsiteWithAI, editWebsiteWithAI } from "../services/ai/index.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { UsageService } from "../services/usage.service.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { EVENTS } from "../lib/events.js";
import { getProvider, getAIConfigSummary } from "../services/ai/provider-registry.js";

export const generateRouter = Router();

const generateSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  style: z.string().optional(),
  websiteType: z.string().optional(),
  aiMode: z.enum(["balanced", "fast", "quality", "free", "code"]).optional(),
  aiProvider: z.enum(["auto", "openrouter", "gemini", "groq", "together", "mistral", "mock"]).optional(),
});

const editSchema = z.object({
  currentCode: z.string().min(20, "currentCode must be at least 20 characters"),
  editInstruction: z.string().min(5, "editInstruction must be at least 5 characters"),
  originalPrompt: z.string().optional(),
  aiMode: z.enum(["balanced", "fast", "quality", "free", "code"]).optional(),
  aiProvider: z.enum(["auto", "openrouter", "gemini", "groq", "together", "mistral", "mock"]).optional(),
});

// Middleware to protect development-only/admin routes
const checkDevOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== "production") {
    return next();
  }
  // in production, require authenticated admin user
  await requireAuth(req, res, () => {
    if (req.auth?.role === "admin") {
      return next();
    }
    res.status(403).json({ success: false, message: "Forbidden - Admin access required" });
  });
};

// GET /api/generate/provider-health — Get AI provider config health
generateRouter.get("/provider-health", checkDevOrAdmin, (req, res) => {
  const summary = getAIConfigSummary();
  return res.json(summary);
});

// POST /api/generate/test-provider — Direct model verification (does not consume credits)
generateRouter.post("/test-provider", checkDevOrAdmin, async (req, res) => {
  const { provider } = req.body;
  const validProviders = ["openrouter", "gemini", "groq", "together", "mistral", "mock"];
  if (!validProviders.includes(provider)) {
    return res.status(400).json({ success: false, message: "Invalid provider specified" });
  }

  try {
    const instance = getProvider(provider);
    if (!instance.isConfigured()) {
      return res.status(400).json({ success: false, message: `${provider} key is missing / not configured` });
    }
    const testPrompt = { prompt: "Return only: export default function GeneratedWebsite() { return <div>Hello</div>; }" };
    const resVal = await instance.generateWebsite(testPrompt);

    return res.json({
      success: true,
      message: `Verified ${provider} API successfully`,
      data: {
        generatedCode: resVal.generatedCode,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: `Verification failed: ${error.message}`,
      error: {
        message: error.message,
        errorType: error.errorType,
        status: error.status,
      },
    });
  }
});

// POST /api/generate — Generate a new website
generateRouter.post("/", requireAuth, async (req, res) => {
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

    const { prompt, style, websiteType, aiMode, aiProvider } = result.data;

    // Track generation started
    AnalyticsService.trackEvent({
      userId,
      event: "ai_generation_started",
      metadata: {
        mode: aiMode || "balanced",
        provider: aiProvider || "auto",
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    const startTime = Date.now();
    const aiResult = await generateWebsiteWithAI({
      prompt,
      style,
      websiteType,
      aiMode,
      aiProvider,
    });
    const durationMs = Date.now() - startTime;

    const creditsRemaining = await UsageService.consumeCredits(
      userId,
      "generate_website",
      1,
      { prompt, provider: aiResult.provider, isFallback: aiResult.isFallback }
    );

    // Track standard website generated event
    AnalyticsService.trackEvent({
      userId,
      event: EVENTS.WEBSITE_GENERATED,
      metadata: {
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
        creditsUsed: 1,
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    // Track granular telemetry events
    AnalyticsService.trackEvent({
      userId,
      event: "ai_generation_succeeded",
      metadata: {
        provider: aiResult.provider,
        model: aiResult.model,
        mode: aiMode || "balanced",
        isFallback: aiResult.isFallback,
        durationMs,
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    if (aiResult.isFallback) {
      AnalyticsService.trackEvent({
        userId,
        event: "ai_fallback_used",
        metadata: {
          provider: aiResult.provider,
          model: aiResult.model,
          mode: aiMode || "balanced",
        },
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });
    }

    if (aiResult.providerAttempts) {
      for (const attempt of aiResult.providerAttempts) {
        if (!attempt.success) {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_provider_failed",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              errorType: attempt.errorType || "unknown",
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        } else {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_model_selected",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "Website generated successfully",
      data: {
        prompt,
        style: style || "modern",
        websiteType: websiteType || "landing-page",
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        model: aiResult.model,
        isFallback: aiResult.isFallback,
        creditsRemaining,
        providerAttempts: aiResult.providerAttempts,
      },
    });
  } catch (error: any) {
    console.error("Generate route error:", error);

    const userId = req.auth?.userId;
    if (userId) {
      AnalyticsService.trackEvent({
        userId,
        event: "ai_generation_failed",
        metadata: {
          errorType: error.errorType || "unknown",
          errorMessage: error.message,
        },
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      if (error.providerAttempts) {
        for (const attempt of error.providerAttempts) {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_provider_failed",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              errorType: attempt.errorType || "unknown",
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        }
      }
    }

    if (error.status === 402) {
      return res.status(402).json({
        success: false,
        message: error.message,
      });
    }

    const statusCode = error.status || 500;
    const isDev = process.env.NODE_ENV !== "production";

    return res.status(statusCode).json({
      success: false,
      message: "AI generation failed. Please try again.",
      error: {
        code: statusCode,
        providerAttempts: error.providerAttempts || [],
        details: isDev ? error.message : undefined,
      },
    });
  }
});

// POST /api/generate/edit — Edit existing code without saving (unsaved preview edit)
generateRouter.post("/edit", requireAuth, async (req, res) => {
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

    const { currentCode, editInstruction, originalPrompt, aiMode, aiProvider } = result.data;

    // Track edit started
    AnalyticsService.trackEvent({
      userId,
      event: "ai_generation_started",
      metadata: {
        mode: aiMode || "balanced",
        provider: aiProvider || "auto",
        isEdit: true,
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    const startTime = Date.now();
    const aiResult = await editWebsiteWithAI({
      currentCode,
      editInstruction,
      originalPrompt,
      aiMode,
      aiProvider,
    });
    const durationMs = Date.now() - startTime;

    const creditsRemaining = await UsageService.consumeCredits(
      userId,
      "edit_website",
      1,
      { editInstruction, provider: aiResult.provider, isFallback: aiResult.isFallback }
    );

    // Track standard website edited event
    AnalyticsService.trackEvent({
      userId,
      event: EVENTS.WEBSITE_EDITED,
      metadata: {
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
        creditsUsed: 1,
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    // Track granular telemetry events
    AnalyticsService.trackEvent({
      userId,
      event: "ai_edit_succeeded",
      metadata: {
        provider: aiResult.provider,
        model: aiResult.model,
        mode: aiMode || "balanced",
        isFallback: aiResult.isFallback,
        durationMs,
      },
      ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
      userAgent: req.headers["user-agent"] || undefined,
    });

    if (aiResult.isFallback) {
      AnalyticsService.trackEvent({
        userId,
        event: "ai_fallback_used",
        metadata: {
          provider: aiResult.provider,
          model: aiResult.model,
          mode: aiMode || "balanced",
        },
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });
    }

    if (aiResult.providerAttempts) {
      for (const attempt of aiResult.providerAttempts) {
        if (!attempt.success) {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_provider_failed",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              errorType: attempt.errorType || "unknown",
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        } else {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_model_selected",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "Website edited successfully",
      data: {
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        model: aiResult.model,
        isFallback: aiResult.isFallback,
        creditsRemaining,
        providerAttempts: aiResult.providerAttempts,
      },
    });
  } catch (error: any) {
    console.error("Edit route error:", error);

    const userId = req.auth?.userId;
    if (userId) {
      AnalyticsService.trackEvent({
        userId,
        event: "ai_generation_failed",
        metadata: {
          errorType: error.errorType || "unknown",
          errorMessage: error.message,
          isEdit: true,
        },
        ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
        userAgent: req.headers["user-agent"] || undefined,
      });

      if (error.providerAttempts) {
        for (const attempt of error.providerAttempts) {
          AnalyticsService.trackEvent({
            userId,
            event: "ai_provider_failed",
            metadata: {
              provider: attempt.provider,
              model: attempt.model,
              errorType: attempt.errorType || "unknown",
              durationMs: attempt.durationMs,
            },
            ip: (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined,
            userAgent: req.headers["user-agent"] || undefined,
          });
        }
      }
    }

    if (error.status === 402) {
      return res.status(402).json({
        success: false,
        message: error.message,
      });
    }

    const statusCode = error.status || 500;
    const isDev = process.env.NODE_ENV !== "production";

    return res.status(statusCode).json({
      success: false,
      message: "AI generation failed. Please try again.",
      error: {
        code: statusCode,
        providerAttempts: error.providerAttempts || [],
        details: isDev ? error.message : undefined,
      },
    });
  }
});
