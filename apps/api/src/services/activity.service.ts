import { prisma } from "../lib/prisma.js";

export class ActivityService {
  public static async log(projectId: string, userId: string | null, action: string, metadata?: any) {
    try {
      return await prisma.projectActivity.create({
        data: {
          projectId,
          userId,
          action,
          metadata: metadata || {},
        },
      });
    } catch (err) {
      console.error("Failed to log project activity:", err);
      return null;
    }
  }
}
