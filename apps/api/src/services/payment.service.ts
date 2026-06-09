import Razorpay from "razorpay";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { getPlan } from "../lib/plans";
import { z } from "zod";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createRazorpayOrder = async (userId: string, planId: string) => {
  const plan = getPlan(planId);
  if (!plan) {
    throw new Error("Invalid plan ID");
  }

  if (plan.id === "free") {
    throw new Error("Cannot checkout for free plan");
  }

  const options = {
    amount: plan.amount,
    currency: "INR",
    receipt: `receipt_${userId}_${Date.now()}`,
    notes: {
      userId,
      planId,
    },
  };

  const order = await razorpay.orders.create(options);

  await prisma.payment.create({
    data: {
      userId,
      razorpayOrderId: order.id,
      plan: plan.id,
      amount: plan.amount,
      currency: "INR",
      status: "created",
    },
  });

  return {
    orderId: order.id,
    amount: plan.amount,
    currency: "INR",
    plan: plan.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  return expectedSignature === signature;
};

export const markPaymentSuccess = async (
  userId: string,
  orderId: string,
  paymentId: string,
  signature: string
) => {
  const isValid = verifyPaymentSignature(orderId, paymentId, signature);
  if (!isValid) {
    throw new Error("Invalid payment signature");
  }

  // Use a transaction to ensure atomic updates
  return await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { razorpayOrderId: orderId },
    });

    if (!payment) {
      throw new Error("Payment order not found");
    }

    if (payment.userId !== userId) {
      throw new Error("Unauthorized to verify this payment");
    }

    if (payment.status === "paid") {
      // Prevent double crediting
      return { success: true, message: "Payment already processed", payment };
    }

    const plan = getPlan(payment.plan);
    if (!plan) {
      throw new Error("Invalid plan associated with payment");
    }

    // Mark payment as paid
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "paid",
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        creditsAdded: plan.credits,
      },
    });

    // Update user plan and credits
    await tx.user.update({
      where: { id: userId },
      data: {
        plan: plan.id,
        credits: {
          increment: plan.credits,
        },
      },
    });

    // Log the event if possible
    await tx.analyticsEvent.create({
      data: {
        userId,
        event: "plan_upgraded",
        metadata: {
          plan: plan.id,
          amount: plan.displayAmount,
          creditsAdded: plan.credits,
          paymentId: updatedPayment.id,
        },
      },
    });

    return { success: true, message: "Payment verified successfully", payment: updatedPayment };
  });
};
