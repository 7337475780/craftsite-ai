import { Router, Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { fulfillOrder } from "../services/payment.service";

const router = Router();

// Razorpay Webhook
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    
    // Because index.ts uses express.raw() for this route, req.body is a Buffer
    const signature = req.headers["x-razorpay-signature"] as string;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.warn("Invalid webhook signature");
      res.status(400).send("Invalid signature");
      return;
    }

    // Now safely parse the JSON body
    const payloadStr = req.body.toString("utf8");
    const parsedBody = JSON.parse(payloadStr);
    const event = parsedBody.event;

    if (event === "payment.captured" || event === "order.paid") {
      const paymentData = parsedBody.payload.payment.entity;
      const orderId = paymentData.order_id;
      const paymentId = paymentData.id;

      // Ensure payment exists
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (payment && payment.status !== "paid") {
        console.log(`Webhook fulfilling order: ${orderId} (Payment: ${paymentId})`);
        await fulfillOrder(orderId, paymentId);
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send("Webhook Error");
  }
});

export const webhookRouter = router;
