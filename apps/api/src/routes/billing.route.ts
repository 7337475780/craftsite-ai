import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { createRazorpayOrder, markPaymentSuccess } from "../services/payment.service";
import { z } from "zod";

const router = Router();

// Get current billing info
router.get("/me", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true,
        credits: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const latestPayments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        plan: user.plan,
        credits: user.credits,
        latestPayments,
      },
    });
  } catch (error: any) {
    console.error("Error fetching billing info:", error);
    res.status(500).json({ success: false, message: "Failed to fetch billing info" });
  }
});

// Create Razorpay order
const createOrderSchema = z.object({
  plan: z.enum(["pro", "team"]),
});

router.post("/create-order", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const validatedData = createOrderSchema.parse(req.body);
    const orderData = await createRazorpayOrder(userId, validatedData.plan);

    res.status(200).json({
      success: true,
      data: orderData,
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
      return;
    }
    res.status(500).json({ success: false, message: error.message || "Failed to create order" });
  }
});

// Verify Payment
const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.string(),
});

router.post("/verify-payment", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verifyPaymentSchema.parse(req.body);

    const result = await markPaymentSuccess(userId, razorpay_order_id, razorpay_payment_id, razorpay_signature);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.payment,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Invalid input data", errors: error.errors });
      return;
    }
    res.status(400).json({ success: false, message: error.message || "Failed to verify payment" });
  }
});

// Get Payment History
router.get("/payments", requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: payments,
    });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment history" });
  }
});

export const billingRouter = router;
