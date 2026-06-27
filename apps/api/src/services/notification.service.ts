import { prisma } from "../lib/prisma.js";
import { emitRealtimeEvent } from "../realtime/socket-server.js";
import { REALTIME_EVENTS } from "../realtime/realtime-events.js";

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: any;
}

export class NotificationService {
  public static async createNotification(input: CreateNotificationInput) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type,
          title: input.title,
          message: input.message,
          metadata: input.metadata || {},
        },
      });

      this.emitNotification(input.userId, notification);
      return notification;
    } catch (err) {
      console.error("Failed to create notification:", err);
      // Suppress error so critical project flows don't crash
      return null;
    }
  }

  public static async createNotifications(inputs: CreateNotificationInput[]) {
    try {
      if (inputs.length === 0) return [];

      const created = await Promise.all(
        inputs.map(async (input) => {
          return this.createNotification(input);
        })
      );

      return created.filter(Boolean);
    } catch (err) {
      console.error("Failed to create multiple notifications:", err);
      return [];
    }
  }

  public static async markNotificationRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  public static async markAllNotificationsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }

  public static async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }

  public static emitNotification(userId: string, notification: any) {
    try {
      emitRealtimeEvent(`user:${userId}`, REALTIME_EVENTS.NOTIFICATION_CREATED, notification);
    } catch (err) {
      console.error(`Failed to emit notification to user:${userId}:`, err);
    }
  }
}
