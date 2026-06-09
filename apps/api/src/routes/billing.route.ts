import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { PlanService } from "../services/plan.service.js";

const router = Router();

/**
 * Get billing summary for the authenticated user
 */
router.get("/me", requireAuth, async (req, res) => {
  try {
    const userId = req.auth!.userId;
    const summary = await PlanService.getBillingSummary(userId);
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Future routes for Stripe integration would go here:
// router.post("/checkout", requireAuth, async (req, res) => { ... })
// router.post("/portal", requireAuth, async (req, res) => { ... })
// router.post("/webhook", express.raw({ type: 'application/json' }), async (req, res) => { ... })

export const billingRouter = router;
