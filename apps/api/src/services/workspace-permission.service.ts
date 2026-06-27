import { prisma } from "../lib/prisma.js";
import { WorkspaceRole, canManageMembers, canEditProjects, canDeleteProjects, canPublishProjects } from "../lib/workspace-roles.js";

export async function getWorkspaceMembership(workspaceId: string, userId: string) {
  return prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId,
      },
    },
  });
}

export async function requireWorkspaceMember(workspaceId: string, userId: string) {
  const membership = await getWorkspaceMembership(workspaceId, userId);
  if (!membership) {
    throw new Error("Forbidden: Not a member of this workspace");
  }
  return membership;
}

export async function requireWorkspaceRole(workspaceId: string, userId: string, allowedRoles: WorkspaceRole[]) {
  const membership = await requireWorkspaceMember(workspaceId, userId);
  if (!allowedRoles.includes(membership.role as WorkspaceRole)) {
    throw new Error(`Forbidden: Requires one of roles: ${allowedRoles.join(", ")}`);
  }
  return membership;
}

export async function checkCanEditProjects(workspaceId: string, userId: string) {
  const membership = await requireWorkspaceMember(workspaceId, userId);
  if (!canEditProjects(membership.role)) {
    throw new Error("Forbidden: Cannot edit projects");
  }
  return membership;
}
