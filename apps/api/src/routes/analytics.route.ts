import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { AnalyticsService } from "../services/analytics.service.js";

const router = Router();

/**
 * Track an event from the frontend.
 * Can be called with or without auth.
 */
router.post("/track", async (req, res) => {
  try {
    const { event, metadata, path } = req.body;
    
    // Safely parse user ID if provided by the client, or extract if logged in
    const userId = (req as any).user?.id || req.body.userId;
    
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || undefined;
    const userAgent = req.headers["user-agent"] || undefined;

    if (!event) {
      return res.status(400).json({ success: false, message: "Event name is required" });
    }

    // Fire and forget
    AnalyticsService.trackEvent({
      userId,
      event,
      metadata,
      path,
      ip,
      userAgent,
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("[Analytics Route] Error tracking event:", err);
    // Always return success to client so we don't break frontend flows
    return res.json({ success: true });
  }
});

/**
 * Get current user's recent activity
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const events = await AnalyticsService.getUserActivity(userId);
    
    return res.json({ success: true, data: events });
  } catch (err) {
    console.error("[Analytics Route] Error getting user activity:", err);
    return res.status(500).json({ success: false, message: "Failed to get user activity" });
  }
});

/**
 * Get summarized metrics for the dashboard
 */
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const summary = await AnalyticsService.getUserSummary(userId);
    
    return res.json({ success: true, data: summary });
  } catch (err) {
    console.error("[Analytics Route] Error getting user summary:", err);
    return res.status(500).json({ success: false, message: "Failed to get user summary" });
  }
});

export { router as analyticsRouter };
