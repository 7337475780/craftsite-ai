import { SavedProject } from "./project";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole?: WorkspaceRole;
  _count?: {
    members: number;
    projects: number;
  };
  members?: WorkspaceMember[];
  projects?: SavedProject[];
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  token: string;
  invitedById: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  workspace?: {
    name: string;
    image: string | null;
  };
  invitedBy?: {
    name: string | null;
    email: string;
  };
}
