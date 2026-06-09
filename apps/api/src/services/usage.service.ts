import { prisma } from "../lib/prisma.js";

export class UsageService {
  /**
   * Get a user's current credit balance and plan.
   */
  static async getUserCredits(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, plan: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  /**
   * Check if a user has at least `cost` credits.
   * Throws an error (status 402) if insufficient.
   */
  static async ensureUserHasCredits(userId: string, cost: number = 1) {
    const { credits } = await this.getUserCredits(userId);

    if (credits < cost) {
      const error: any = new Error("You have no credits remaining.");
      error.status = 402;
      throw error;
    }

    return credits;
  }

  /**
   * Consume credits and log the action using a database transaction.
   * Prevents negative balances and ensures consistent logging.
   */
  static async consumeCredits(
    userId: string,
    action: string,
    cost: number = 1,
    metadata?: Record<string, any>
  ) {
    // We use a transaction to safely decrement the credits and log it atomically.
    return await prisma.$transaction(async (tx) => {
      // Find the current credits first inside the transaction
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });

      if (!user) {
        throw new Error("User not found");
      }

      if (user.credits < cost) {
        const error: any = new Error("You have no credits remaining.");
        error.status = 402;
        throw error;
      }

      // Decrement credits
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: cost,
          },
        },
        select: { credits: true },
      });

      // Create usage log
      await tx.usageLog.create({
        data: {
          userId,
          action,
          credits: cost,
          metadata: metadata ? metadata : undefined,
        },
      });

      return updatedUser.credits;
    });
  }
}
