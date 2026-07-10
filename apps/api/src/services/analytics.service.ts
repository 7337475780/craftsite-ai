import { prisma } from "../lib/prisma";

export interface TrackEventInput {
  userId?: string;
  event: string;
  metadata?: Record<string, unknown>;
  path?: string;
  ip?: string;
  userAgent?: string;
}

export class AnalyticsService {
  /**
   * Track an analytics event asynchronously.
   * Never throws errors to prevent breaking main product flows.
   */
  static async trackEvent(input: TrackEventInput): Promise<void> {
    try {
      // Ensure we don't accidentally store large/sensitive strings in metadata
      let safeMetadata = input.metadata;
      if (safeMetadata) {
        // Strip out generatedCode or full prompts if passed by mistake
        const { generatedCode, prompt, password, token, ...rest } = safeMetadata as any;
        safeMetadata = rest;
      }

      await prisma.analyticsEvent.create({
        data: {
          userId: input.userId || null,
          event: input.event,
          metadata: safeMetadata ? (safeMetadata as any) : undefined,
          path: input.path,
          ip: input.ip,
          userAgent: input.userAgent,
        },
      });
    } catch (err) {
      // Fail silently but log for devs
      console.error("[Analytics Error] Failed to track event:", input.event, err);
    }
  }

  /**
   * Get user's recent activity logs
   */
  static async getUserActivity(userId: string, limit = 50) {
    return await prisma.analyticsEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Get summarized metrics for the user dashboard
   */
  static async getUserSummary(userId: string) {
    // We can run parallel counts for efficiency
    const [
      totalGenerations,
      totalEdits,
      totalExports,
      totalPublished,
      totalProjectsCreated,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: { userId, event: "website_generated" } }),
      prisma.analyticsEvent.count({ where: { userId, event: "website_edited" } }),
      prisma.analyticsEvent.count({ where: { userId, event: "project_exported" } }),
      prisma.analyticsEvent.count({ where: { userId, event: "project_published" } }),
      prisma.analyticsEvent.count({ where: { userId, event: "project_created" } }),
    ]);

    // For total public views, we look for events where metadata.projectId belongs to this user
    // Since metadata querying in Prisma can be tricky, a simpler way is just to count their published projects
    // or if we strictly track public_share_viewed with projectId.
    // For now, we will return the primary metrics.

    return {
      totalGenerations,
      totalEdits,
      totalExports,
      totalPublished,
      totalProjectsCreated,
    };
  }
}
