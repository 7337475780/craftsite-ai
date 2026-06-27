export const WORKSPACE_ROLES = ["owner", "admin", "editor", "viewer"] as const;
export type WorkspaceRole = typeof WORKSPACE_ROLES[number];

export function canManageMembers(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canEditProjects(role: string): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}

export function canDeleteProjects(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canPublishProjects(role: string): boolean {
  return role === "owner" || role === "admin" || role === "editor";
}
