import { Router } from "express";
import { getInvitationByToken, acceptInvitation } from "../services/workspace-invitation.service.js";
import { requireAuth } from "../middleware/auth.middleware.js";

function getUserId(req: any): string {
  const userId = req.auth?.userId;
  if (!userId) {
    throw new Error("User ID missing from auth context");
  }
  return userId;
}

const router = Router();

router.get("/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const invitation = await getInvitationByToken(token);
    
    res.json({
      workspaceName: invitation.workspace.name,
      workspaceImage: invitation.workspace.image,
      invitedEmail: invitation.email,
      role: invitation.role,
      expiresAt: invitation.expiresAt,
      status: invitation.acceptedAt ? "accepted" : (invitation.expiresAt < new Date() ? "expired" : "pending")
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

router.post("/:token/accept", requireAuth, async (req, res, next) => {
  try {
    const { token } = req.params as { token: string };
    const userId = getUserId(req);
    
    const workspace = await acceptInvitation(token, userId);
    res.json(workspace);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export const invitationsRouter = router;
