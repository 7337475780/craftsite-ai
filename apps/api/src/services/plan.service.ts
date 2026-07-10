import { prisma } from "../lib/prisma";

// In a real app with Stripe, these would map to Stripe Product/Price IDs
export const PLAN_LIMITS = {
  free: {
    monthlyCredits: 20,
    maxProjects: 10, // Not enforced yet, but good for future
  },
  pro: {
    monthlyCredits: 500,
    maxProjects: 100,
  },
  team: {
    monthlyCredits: 2000,
    maxProjects: 9999,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

export class PlanService {
  /**
   * Get the current plan limits for a user
   */
  static async getUserPlanLimits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const planType = (user.plan as PlanType) || "free";
    return PLAN_LIMITS[planType] || PLAN_LIMITS.free;
  }

  /**
   * Get billing details for user dashboard
   */
  static async getBillingSummary(userId: string) {
    const limits = await this.getUserPlanLimits(userId);
    
    // In the future, this would also fetch Stripe subscription status, 
    // next billing date, payment methods, etc.
    
    return {
      limits,
      status: "active", // placeholder for subscription status
      cancelAtPeriodEnd: false, // placeholder
      currentPeriodEnd: null, // placeholder
    };
  }

  /**
   * Upgrade a user's plan manually (admin/test purposes until Stripe is added)
   */
  static async upgradeUserPlan(userId: string, newPlan: PlanType) {
    const limits = PLAN_LIMITS[newPlan];
    if (!limits) {
      throw new Error("Invalid plan type");
    }

    // Give them the full credits of the new plan immediately
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan: newPlan,
        credits: limits.monthlyCredits,
      },
    });

    return updatedUser;
  }
}
