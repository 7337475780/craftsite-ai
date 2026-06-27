# Team Workspaces Architecture & Routing

## Overview
Team Workspaces enable multi-tenant collaboration in CraftSite AI. Users can create shared workspaces, invite other members, and collaborate on projects with full role-based access control (RBAC).

## Database Schema Changes
The database was updated to include:
- `Workspace`: Represents a tenant, with `name`, `slug`, and `ownerId`.
- `WorkspaceMember`: A join table linking `User` and `Workspace` with a specific `role` (owner, admin, editor, viewer).
- `WorkspaceInvitation`: Tracks pending invitations (with tokens) and their target roles.
- `Project` and `ProjectVersion` now include an optional `workspaceId` to link them to a workspace.

## Roles and Permissions (RBAC)
Roles are enforced using a dedicated permission service:
- **Owner**: Full access. Can manage billing, delete workspace, and manage all members.
- **Admin**: Can manage settings, projects, and non-admin members.
- **Editor**: Can create, edit, and delete projects. Cannot manage members or settings.
- **Viewer**: Read-only access to projects.

## Routing Logic
We isolated personal projects from workspace projects to ensure security and prevent accidental exposure:

### Personal Projects (`/api/projects/*`)
Endpoints here strictly enforce that the project's `workspaceId` is `null` and `userId` matches the current user. If a workspace project is accessed via these endpoints, a 404 is returned.

### Workspace Projects (`/api/workspaces/:workspaceId/projects/*`)
These endpoints enforce workspace membership using `requireWorkspaceMember` or `checkCanEditProjects`. 
- `GET /projects`: Fetches all projects for the given `workspaceId`.
- `POST /projects/:projectId/edit`: Uses AI to edit a project, ensuring the user has editor permissions in the workspace.
- `POST /projects/:projectId/versions/:versionId/restore`: Restores a project state, ensuring the user has editor permissions.

## Frontend UI Integration
- **WorkspaceSwitcher**: A global dropdown component allows users to switch their active context between "Personal" and their various workspaces.
- **WorkspaceProvider**: Maintains the `activeWorkspaceId` state using React Context and persists it to `localStorage`.
- **Dashboard & Generate Pages**: These core features were updated to be workspace-aware. If an `activeWorkspaceId` is set, they route API calls to the workspace endpoints.
- **Workspace Settings**: New UI for managing members, generating invite links, and modifying workspace details.

## Move / Duplicate Logic
Projects can be moved or duplicated across contexts:
- A user can duplicate any project they have access to into their personal space or a workspace they have edit rights for.
- A user can move their personal project into a workspace they have edit rights for.
