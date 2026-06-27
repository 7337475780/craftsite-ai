import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ActivityService } from "../services/activity.service.js";
import { emitRealtimeEvent } from "../realtime/socket-server.js";
import { REALTIME_EVENTS } from "../realtime/realtime-events.js";

function getUserId(req: any): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new Error("User ID missing from auth context");
  }
  return userId;
}
import {
  requireWorkspaceMember,
  requireWorkspaceRole,
  checkCanEditProjects,
} from "../services/workspace-permission.service.js";
import {
  createInvitation,
  getInvitationByToken,
  acceptInvitation,
} from "../services/workspace-invitation.service.js";
import { WORKSPACE_ROLES, WorkspaceRole } from "../lib/workspace-roles.js";
import { editWebsiteWithAI } from "../services/ai/index.js";
import { UsageService } from "../services/usage.service.js";
import { generateUniqueShareSlug } from "../lib/share.js";

const router = Router();

// Define schemas
const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  image: z.string().optional(),
});

const updateRoleSchema = z.object({
  role: z.enum([WORKSPACE_ROLES[1], WORKSPACE_ROLES[2], WORKSPACE_ROLES[3]] as const),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum([WORKSPACE_ROLES[1], WORKSPACE_ROLES[2], WORKSPACE_ROLES[3]] as const),
});

const createProjectSchema = z.object({
  title: z.string().min(1),
  prompt: z.string(),
  generatedCode: z.string(),
  provider: z.string(),
});

// ==========================================
// WORKSPACE CRUD
// ==========================================

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const { name, description } = createWorkspaceSchema.parse(req.body);
    const userId = getUserId(req);
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: "owner",
          },
        },
      },
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { members: true, projects: true },
        },
      },
    });

    res.json(
      workspaces.map((w) => ({
        ...w,
        currentUserRole: w.members[0]?.role || "viewer",
        members: undefined,
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:workspaceId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);

    const membership = await requireWorkspaceMember(workspaceId, userId);

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        _count: {
          select: { members: true, projects: true },
        },
      },
    });

    if (!workspace) return res.status(404).json({ error: "Workspace not found" });

    res.json({ ...workspace, currentUserRole: membership.role });
  } catch (error) {
    next(error);
  }
});

router.patch("/:workspaceId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);

    await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);
    const updates = updateWorkspaceSchema.parse(req.body);

    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: updates,
    });

    res.json(workspace);
  } catch (error) {
    next(error);
  }
});

router.delete("/:workspaceId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);

    await requireWorkspaceRole(workspaceId, userId, ["owner"]);

    await prisma.workspace.delete({ where: { id: workspaceId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// MEMBER MANAGEMENT
// ==========================================

router.get("/:workspaceId/members", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);
    await requireWorkspaceMember(workspaceId, userId);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
    res.json(members);
  } catch (error) {
    next(error);
  }
});

router.patch("/:workspaceId/members/:memberId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, memberId } = req.params as { workspaceId: string, memberId: string };
    const userId = getUserId(req);

    const { role } = updateRoleSchema.parse(req.body);
    const currentUserMembership = await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(400).json({ error: "Cannot change role of workspace owner" });
    }

    if (currentUserMembership.role === "admin" && role === "admin") {
      return res.status(403).json({ error: "Admins cannot promote others to admin" });
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete("/:workspaceId/members/:memberId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, memberId } = req.params as { workspaceId: string, memberId: string };
    const userId = getUserId(req);

    const currentUserMembership = await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    const targetMember = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Member not found" });
    }

    if (targetMember.role === "owner") {
      return res.status(400).json({ error: "Cannot remove workspace owner" });
    }

    if (currentUserMembership.role === "admin" && targetMember.role === "admin") {
      return res.status(403).json({ error: "Admins cannot remove other admins" });
    }

    await prisma.workspaceMember.delete({ where: { id: memberId } });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/leave", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);

    const membership = await requireWorkspaceMember(workspaceId, userId);

    if (membership.role === "owner") {
      return res.status(400).json({ error: "Owner cannot leave workspace. Transfer ownership or delete workspace." });
    }

    await prisma.workspaceMember.delete({ where: { id: membership.id } });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// INVITATIONS
// ==========================================

router.post("/:workspaceId/invitations", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);
    await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    const { email, role } = inviteMemberSchema.parse(req.body);

    const result = await createInvitation(workspaceId, email, role, userId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:workspaceId/invitations", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);
    await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    const invitations = await prisma.workspaceInvitation.findMany({
      where: { workspaceId, acceptedAt: null },
      include: {
        invitedBy: { select: { name: true, email: true } },
      },
    });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
});

router.delete("/:workspaceId/invitations/:invitationId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, invitationId } = req.params as { workspaceId: string, invitationId: string };
    const userId = getUserId(req);
    await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    await prisma.workspaceInvitation.delete({
      where: { id: invitationId },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Note: Accepting/Declining invites might not require workspace context in URL,
// but for simplicity we will put the public accept routes at the top level or export from here.

// ==========================================
// WORKSPACE PROJECTS
// ==========================================

router.get("/:workspaceId/projects", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);
    await requireWorkspaceMember(workspaceId, userId);

    const projects = await prisma.project.findMany({
      where: { workspaceId },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/projects", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId } = req.params as { workspaceId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    const data = createProjectSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...data,
        workspaceId,
        userId, // The creator
      },
    });

    await ActivityService.log(project.id, userId, "project_created", { title: project.title });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

router.get("/:workspaceId/projects/:projectId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await requireWorkspaceMember(workspaceId, userId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        user: { select: { name: true, image: true } },
        versions: {
          select: { id: true, versionNumber: true, createdAt: true, editPrompt: true },
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.patch("/:workspaceId/projects/:projectId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    // Only allow specific updates (e.g., publish, title)
    // Full generation edit is handled separately usually, but we'll allow title/publish here.
    const updateSchema = z.object({
      title: z.string().optional(),
      isPublished: z.boolean().optional(),
    });
    
    const data = updateSchema.parse(req.body);

    const oldProject = await prisma.project.findUnique({ where: { id: projectId } });
    if (!oldProject || oldProject.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data,
    });

    if (data.title && data.title !== oldProject.title) {
      await ActivityService.log(projectId, userId, "project_renamed", {
        oldTitle: oldProject.title,
        newTitle: data.title,
      });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

router.delete("/:workspaceId/projects/:projectId", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    
    // Deleting projects in workspace is for admin/owner only by default
    await requireWorkspaceRole(workspaceId, userId, ["owner", "admin"]);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ==========================================
// WORKSPACE PROJECT AI EDIT
// ==========================================

router.post("/:workspaceId/projects/:projectId/edit", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    const editSchema = z.object({
      editInstruction: z.string().min(5),
    });
    const { editInstruction } = editSchema.parse(req.body);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    await UsageService.ensureUserHasCredits(userId, 1);

    const versionCount = await prisma.projectVersion.count({ where: { projectId } });
    const nextVersionNumber = versionCount + 1;

    await prisma.projectVersion.create({
      data: {
        projectId,
        userId,
        versionNumber: nextVersionNumber,
        title: `Version ${nextVersionNumber}`,
        generatedCode: project.generatedCode,
        editPrompt: editInstruction,
      },
    });

    const aiResult = await editWebsiteWithAI({
      currentCode: project.generatedCode,
      editInstruction,
      originalPrompt: project.prompt,
    });

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        generatedCode: aiResult.generatedCode,
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
      },
    });

    const creditsRemaining = await UsageService.consumeCredits(
      userId,
      "project_edit",
      1,
      { projectId, editInstruction, provider: aiResult.provider, isFallback: aiResult.isFallback }
    );

    await ActivityService.log(projectId, userId, "ai_edit_applied", { editInstruction, provider: aiResult.provider });

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const userName = me?.name || me?.email || "Someone";

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.PROJECT_UPDATED, {
      projectId,
      userId,
      userName,
      action: "edit",
    });

    res.json({
      success: true,
      message: "Website edited successfully",
      data: {
        project: updatedProject,
        provider: aiResult.provider,
        isFallback: aiResult.isFallback,
        creditsRemaining,
      },
    });
  } catch (error: any) {
    if (error.status === 402) {
      return res.status(402).json({ success: false, message: error.message });
    }
    next(error);
  }
});

// ==========================================
// WORKSPACE PROJECT VERSIONS
// ==========================================

router.get("/:workspaceId/projects/:projectId/versions", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await requireWorkspaceMember(workspaceId, userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const versions = await prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectId: true,
        userId: true,
        versionNumber: true,
        title: true,
        editPrompt: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: versions });
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/projects/:projectId/versions/:versionId/restore", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId, versionId } = req.params as { workspaceId: string, projectId: string, versionId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const version = await prisma.projectVersion.findUnique({ where: { id: versionId } });
    if (!version || version.projectId !== projectId) {
      return res.status(404).json({ error: "Version not found" });
    }

    const versionCount = await prisma.projectVersion.count({ where: { projectId } });
    await prisma.projectVersion.create({
      data: {
        projectId,
        userId,
        versionNumber: versionCount + 1,
        title: `Version ${versionCount + 1} (snapshot before restore)`,
        generatedCode: project.generatedCode,
        editPrompt: `Snapshot before restoring to v${version.versionNumber}`,
      },
    });

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { generatedCode: version.generatedCode },
    });

    await ActivityService.log(projectId, userId, "version_restored", { versionNumber: version.versionNumber });

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });
    const userName = me?.name || me?.email || "Someone";

    emitRealtimeEvent(`project:${projectId}`, REALTIME_EVENTS.PROJECT_UPDATED, {
      projectId,
      userId,
      userName,
      action: "restore",
    });

    res.json({ success: true, message: `Restored to version ${version.versionNumber}`, data: updatedProject });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// WORKSPACE PROJECT PUBLISH
// ==========================================

router.post("/:workspaceId/projects/:projectId/publish", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    if (project.isPublished && project.shareSlug) {
      return res.json({ success: true, message: "Already published", data: project });
    }

    const shareSlug = await generateUniqueShareSlug(project.title);
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isPublished: true, shareSlug, publishedAt: new Date() },
    });

    await ActivityService.log(projectId, userId, "project_published", { shareSlug });

    res.json({ success: true, message: "Project published", data: updated });
  } catch (error) {
    next(error);
  }
});

router.post("/:workspaceId/projects/:projectId/unpublish", requireAuth, async (req, res, next) => {
  try {
    const { workspaceId, projectId } = req.params as { workspaceId: string, projectId: string };
    const userId = getUserId(req);
    await checkCanEditProjects(workspaceId, userId);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.workspaceId !== workspaceId) {
      return res.status(404).json({ error: "Project not found" });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isPublished: false, shareSlug: null, publishedAt: null },
    });

    await ActivityService.log(projectId, userId, "project_unpublished", {});

    res.json({ success: true, message: "Project unpublished", data: updated });
  } catch (error) {
    next(error);
  }
});

export const workspacesRouter = router;
