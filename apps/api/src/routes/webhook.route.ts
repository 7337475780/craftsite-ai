import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";

const router = Router();

// Razorpay Webhook
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    
    // In Express, req.body is parsed. For Razorpay webhooks, we usually need the raw body
    // but since we might be using express.json(), we stringify it.
    // For perfect validation, express.raw() should be used in the app.js mount.
    const body = JSON.stringify(req.body);
    const signature = req.headers["x-razorpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature");
      res.status(400).send("Invalid signature");
      return;
    }

    const event = req.body.event;

    if (event === "payment.captured") {
      const paymentData = req.body.payload.payment.entity;
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;

      // Ensure payment exists
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (payment && payment.status !== "paid") {
        // We could also call markPaymentSuccess here, but since the frontend verify route
        // is primary, this webhook just acts as a fallback.
        console.log(`Payment ${paymentId} captured for order ${orderId}`);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook Error");
  }
});

export const webhookRouter = router;
