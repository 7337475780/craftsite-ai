import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { NotificationService } from "../services/notification.service.js";
import { emitRealtimeEvent } from "../realtime/socket-server.js";
import { REALTIME_EVENTS } from "../realtime/realtime-events.js";
import { rateLimit } from "express-rate-limit";

const router = Router({ mergeParams: true });

// Rate limiter for comments: max 30 comments per 10 minutes
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many comments. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Zod schemas
const createCommentSchema = z.object({
  body: z.string().min(1, "Comment body cannot be empty").max(1000, "Comment is too long"),
  parentId: z.string().uuid().optional().nullable(),
  mentionedUserIds: z.array(z.string().uuid()).optional(),
});

const updateCommentSchema = z.object({
  body: z.string().min(1, "Comment body cannot be empty").max(1000, "Comment is too long"),
});

// Access helper
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) return null;

  if (project.workspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId,
        },
      },
    });
    if (!membership) return null;
    return { project, membership };
  } else {
    if (project.userId !== userId) return null;
    return { project, membership: null };
  }
}

// GET /api/projects/:projectId/comments — Get all comments for a project
router.get("/", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as any;
    const userId = req.auth?.userId!;
    const { resolved } = req.query;

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied to project comments" });
      return;
    }

    // Prepare where filter
    const whereClause: any = {
      projectId,
      parentId: null, // load root comments
    };

    if (resolved === "true") {
      whereClause.isResolved = true;
    } else if (resolved === "false") {
      whereClause.isResolved = false;
    }

    const comments = await prisma.projectComment.findMany({
      where: whereClause,
      orderBy: { createdAt: "asc" }, // oldest first
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true },
        },
        replies: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, image: true, email: true },
            },
          },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
        mentions: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    res.json({ success: true, data: comments });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/comments — Create a new comment/reply
router.post("/", requireAuth, commentLimiter, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId } = req.params as any;
    const userId = req.auth?.userId!;
    const authorName = req.auth?.email!; // Fallback name

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied to project comments" });
      return;
    }

    const parsed = createCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.format() });
      return;
    }

    const { body, parentId, mentionedUserIds } = parsed.data;

    // Verify parent comment if provided
    if (parentId) {
      const parentComment = await prisma.projectComment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment || parentComment.projectId !== projectId) {
        res.status(400).json({ success: false, message: "Parent comment does not exist in this project" });
        return;
      }
    }

    // Verify mentions are workspace members (if workspace project)
    const validMentionIds: string[] = [];
    if (mentionedUserIds && mentionedUserIds.length > 0) {
      if (access.project.workspaceId) {
        const members = await prisma.workspaceMember.findMany({
          where: {
            workspaceId: access.project.workspaceId,
            userId: { in: mentionedUserIds },
          },
          select: { userId: true },
        });
        validMentionIds.push(...members.map((m: any) => m.userId));
      } else {
        // Personal project — can only mention owner
        if (mentionedUserIds.includes(access.project.userId)) {
          validMentionIds.push(access.project.userId);
        }
      }
    }

    // Get current user details for formatting notifications
    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const displayName = me?.name || me?.email || authorName;

    // Create comment in transaction
    const comment = await prisma.$transaction(async (tx: any) => {
      const newComment = await tx.projectComment.create({
        data: {
          projectId,
          authorId: userId,
          parentId,
          body,
        },
        include: {
          author: {
            select: { id: true, name: true, image: true, email: true },
          },
        },
      });

      // Write mentions
      if (validMentionIds.length > 0) {
        await tx.commentMention.createMany({
          data: validMentionIds.map((mid) => ({
            commentId: newComment.id,
            userId: mid,
          })),
        });
      }

      return newComment;
    });

    // Write notifications & emit Socket events
    const notifyInputs: any[] = [];
    const notifiedUsers = new Set<string>();

    // 1. Notify mentioned users (excluding self)
    validMentionIds.forEach((mid) => {
      if (mid !== userId && !notifiedUsers.has(mid)) {
        notifiedUsers.add(mid);
        notifyInputs.push({
          userId: mid,
          type: "comment_mention",
          title: "New Mention",
          message: `${displayName} mentioned you in a comment.`,
          metadata: { projectId, commentId: comment.id },
        });
      }
    });

    // 2. Notify parent author if this is a reply (excluding self)
    if (parentId) {
      const parent = await prisma.projectComment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parent && parent.authorId !== userId && !notifiedUsers.has(parent.authorId)) {
        notifiedUsers.add(parent.authorId);
        notifyInputs.push({
          userId: parent.authorId,
          type: "comment_reply",
          title: "New Reply",
          message: `${displayName} replied to your comment.`,
          metadata: { projectId, commentId: comment.id, parentId },
        });
      }
    }

    // 3. Notify project owner if workspace project and owner is not the poster
    if (access.project.userId !== userId && !notifiedUsers.has(access.project.userId)) {
      notifiedUsers.add(access.project.userId);
      notifyInputs.push({
        userId: access.project.userId,
        type: "comment_created",
        title: "New Comment",
        message: `${displayName} commented on your project.`,
        metadata: { projectId, commentId: comment.id },
      });
    }

    // Save all notifications
    if (notifyInputs.length > 0) {
      await NotificationService.createNotifications(notifyInputs);
    }

    // Broadcast comment via Socket.IO
    const room = `project:${projectId}`;
    const eventName = parentId ? REALTIME_EVENTS.COMMENT_REPLY_CREATED : REALTIME_EVENTS.COMMENT_CREATED;
    emitRealtimeEvent(room, eventName, { comment });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId/comments/:commentId — Edit own comment body
router.patch("/:commentId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, commentId } = req.params as any;
    const userId = req.auth?.userId!;

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const parsed = updateCommentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: parsed.error.format() });
      return;
    }

    const comment = await prisma.projectComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.projectId !== projectId) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Only the author can edit their own comment
    if (comment.authorId !== userId) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot edit someone else's comment" });
      return;
    }

    const updated = await prisma.projectComment.update({
      where: { id: commentId },
      data: { body: parsed.data.body },
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.COMMENT_UPDATED, { comment: updated });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId/comments/:commentId — Delete comment
router.delete("/:commentId", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, commentId } = req.params as any;
    const userId = req.auth?.userId!;

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const comment = await prisma.projectComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.projectId !== projectId) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Delete permissions: author, workspace owner/admin, or personal project owner
    const isAuthor = comment.authorId === userId;
    const isProjectOwner = access.project.userId === userId;
    const isWorkspaceAdmin = access.membership && (access.membership.role === "owner" || access.membership.role === "admin");

    if (!isAuthor && !isProjectOwner && !isWorkspaceAdmin) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot delete comment" });
      return;
    }

    await prisma.projectComment.delete({
      where: { id: commentId },
    });

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.COMMENT_DELETED, { commentId });

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/comments/:commentId/resolve — Resolve comment
router.post("/:commentId/resolve", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, commentId } = req.params as any;
    const userId = req.auth?.userId!;

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const comment = await prisma.projectComment.findUnique({
      where: { id: commentId },
      include: { author: { select: { id: true, name: true } } },
    });

    if (!comment || comment.projectId !== projectId) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    // Resolve permissions: Workspace owner/admin/editor, or personal project owner
    const isProjectOwner = access.project.userId === userId;
    const canResolveWorkspace = access.membership && (access.membership.role === "owner" || access.membership.role === "admin" || access.membership.role === "editor");

    if (!isProjectOwner && !canResolveWorkspace) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot resolve comment" });
      return;
    }

    const updated = await prisma.projectComment.update({
      where: { id: commentId },
      data: {
        isResolved: true,
        resolvedById: userId,
        resolvedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true },
        },
        resolvedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Notify author if resolved by someone else
    if (comment.authorId !== userId) {
      const me = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } });
      const resolverName = me?.name || me?.email || "Someone";
      await NotificationService.createNotification({
        userId: comment.authorId,
        type: "comment_resolved",
        title: "Comment Resolved",
        message: `Your comment was resolved by ${resolverName}.`,
        metadata: { projectId, commentId },
      });
    }

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.COMMENT_RESOLVED, { comment: updated });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

// POST /api/projects/:projectId/comments/:commentId/reopen — Reopen resolved comment
router.post("/:commentId/reopen", requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, commentId } = req.params as any;
    const userId = req.auth?.userId!;

    const access = await checkProjectAccess(projectId, userId);
    if (!access) {
      res.status(403).json({ success: false, message: "Access denied" });
      return;
    }

    const comment = await prisma.projectComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.projectId !== projectId) {
      res.status(404).json({ success: false, message: "Comment not found" });
      return;
    }

    const isProjectOwner = access.project.userId === userId;
    const canReopenWorkspace = access.membership && (access.membership.role === "owner" || access.membership.role === "admin" || access.membership.role === "editor");

    if (!isProjectOwner && !canReopenWorkspace) {
      res.status(403).json({ success: false, message: "Forbidden: Cannot reopen comment" });
      return;
    }

    const updated = await prisma.projectComment.update({
      where: { id: commentId },
      data: {
        isResolved: false,
        resolvedById: null,
        resolvedAt: null,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true, email: true },
        },
      },
    });

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.COMMENT_UPDATED, { comment: updated });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
});

export const commentsRouter = router;
