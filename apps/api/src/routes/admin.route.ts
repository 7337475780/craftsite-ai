import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { getSafeUser } from "../lib/auth.js";

const router = Router();

// All routes require authentication and admin role
router.use(requireAuth, requireAdmin);

/**
 * GET /api/admin/overview
 * Platform level metrics for admin dashboard
 */
router.get("/overview", async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalPublishedProjects,
      totalGenerations,
      totalEdits,
      totalExports,
      totalShareViews,
      totalUsageLogs,
      recentUsers,
      recentProjects,
      totalRevenueData,
      paidUsers,
      recentPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.project.count({ where: { isPublished: true } }),
      prisma.analyticsEvent.count({ where: { event: "website_generated" } }),
      prisma.analyticsEvent.count({ where: { event: "website_edited" } }),
      prisma.analyticsEvent.count({ where: { event: "project_exported" } }),
      prisma.analyticsEvent.count({ where: { event: "public_share_viewed" } }),
      prisma.usageLog.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, image: true, plan: true, createdAt: true },
      }),
      prisma.project.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, provider: true, isPublished: true, createdAt: true, user: { select: { email: true } } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { status: "paid" },
      }),
      prisma.user.count({
        where: { plan: { in: ["pro", "team"] } },
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true } } },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        totalPublishedProjects,
        totalGenerations,
        totalEdits,
        totalExports,
        totalShareViews,
        totalUsageLogs,
        totalRevenue: totalRevenueData?._sum?.amount || 0,
        paidUsers: paidUsers || 0,
        recentUsers,
        recentProjects,
        recentPayments: recentPayments || [],
      },
    });
  } catch (err) {
    console.error("Admin overview error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch overview" });
  }
});

/**
 * GET /api/admin/users
 * List users with pagination and search
 */
router.get("/users", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { projects: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        users: users.map((u: any) => ({ ...getSafeUser(u), projectsCount: u._count.projects })),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Admin list users error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
router.get("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: { select: { projects: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const [recentUsage, recentEvents] = await Promise.all([
      prisma.usageLog.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
      prisma.analyticsEvent.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: {
        user: getSafeUser(user),
        projectsCount: user._count.projects,
        recentUsage,
        recentEvents,
      },
    });
  } catch (err) {
    console.error("Admin user details error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch user details" });
  }
});

const updateUserSchema = z.object({
  credits: z.number().min(0).optional(),
  plan: z.enum(["free", "pro", "team"]).optional(),
  role: z.enum(["user", "admin"]).optional(),
  isBlocked: z.boolean().optional(),
});

/**
 * PATCH /api/admin/users/:id
 * Update user details
 */
router.patch("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = updateUserSchema.parse(req.body);

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) {
       res.status(404).json({ success: false, message: "User not found" });
       return;
    }

    // Prevent removing the last admin or blocking oneself if it's the only way
    if (userId === req.auth!.userId && (updates.role === "user" || updates.isBlocked === true)) {
      const adminCount = await prisma.user.count({ where: { role: "admin", isBlocked: false } });
      if (adminCount <= 1) {
         res.status(400).json({ success: false, message: "Cannot remove or block the last active admin" });
         return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    res.json({
      success: true,
      data: getSafeUser(updatedUser),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Invalid input", errors: err.issues });
    } else {
      console.error("Admin update user error:", err);
      res.status(500).json({ success: false, message: "Failed to update user" });
    }
  }
});

/**
 * GET /api/admin/projects
 * List all projects across the platform
 */
router.get("/projects", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || "";
    const published = req.query.published === "true";

    const where: any = {};
    
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    
    if (req.query.published) {
      where.isPublished = published;
    }

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Admin list projects error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch projects" });
  }
});

/**
 * DELETE /api/admin/projects/:id
 * Delete a project (moderation)
 */
router.delete("/projects/:id", async (req, res) => {
  try {
    const projectId = req.params.id;
    
    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    console.error("Admin delete project error:", err);
    res.status(500).json({ success: false, message: "Failed to delete project" });
  }
});

/**
 * GET /api/admin/analytics
 * Platform analytics overview
 */
router.get("/analytics", async (req, res) => {
  try {
    // Top active users
    const activeUsers = await prisma.user.findMany({
      take: 10,
      orderBy: {
        analyticsEvents: {
          _count: "desc"
        }
      },
      include: {
        _count: {
          select: { analyticsEvents: true }
        }
      }
    });

    // Event counts
    const eventGroups = await prisma.analyticsEvent.groupBy({
      by: ["event"],
      _count: {
        id: true
      }
    });

    res.json({
      success: true,
      data: {
        activeUsers: activeUsers.map((u: any) => ({ email: u.email, name: u.name, eventCount: u._count.analyticsEvents })),
        events: eventGroups,
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
});

/**
 * GET /api/admin/payments
 * List all payments
 */
router.get("/payments", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 20));

    const [total, payments] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Admin list payments error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch payments" });
  }
});

export const adminRouter = router;
