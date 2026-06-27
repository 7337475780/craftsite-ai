import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { sendEmail } from "./email.service.js";
import { WorkspaceRole } from "../lib/workspace-roles.js";
import { logger } from "../lib/logger.js";
import { env } from "../config/env.js";

export async function createInvitation(workspaceId: string, email: string, role: WorkspaceRole, invitedById: string) {
  const normalizedEmail = email.toLowerCase().trim();

  // Check if user is already a member
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    const isMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: existingUser.id,
        },
      },
    });
    if (isMember) {
      throw new Error("User is already a member of this workspace.");
    }
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Delete existing pending invitations for this email in this workspace
  await prisma.workspaceInvitation.deleteMany({
    where: {
      workspaceId,
      email: normalizedEmail,
    },
  });

  const invitation = await prisma.workspaceInvitation.create({
    data: {
      workspaceId,
      email: normalizedEmail,
      role,
      token,
      invitedById,
      expiresAt,
    },
    include: {
      workspace: true,
      invitedBy: true,
    },
  });

  const inviteUrl = `${env.CLIENT_URL || "http://localhost:3000"}/invite/${token}`;

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: `You have been invited to join ${invitation.workspace.name}`,
      text: `You have been invited by ${invitation.invitedBy.name || invitation.invitedBy.email} to join the workspace "${invitation.workspace.name}" as a ${role}.\n\nClick the link below to accept the invitation:\n${inviteUrl}\n\nThis invitation will expire in 7 days.`,
      html: `<p>You have been invited by <b>${invitation.invitedBy.name || invitation.invitedBy.email}</b> to join the workspace <b>"${invitation.workspace.name}"</b> as a ${role}.</p>
             <p><a href="${inviteUrl}">Click here to accept the invitation</a></p>
             <p>This invitation will expire in 7 days.</p>`,
    });
  } catch (error) {
    logger.error({ err: error }, "Failed to send invitation email");
  }

  // Safe to return
  return {
    ...invitation,
    inviteUrl,
  };
}

export async function getInvitationByToken(token: string) {
  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: {
      workspace: {
        select: {
          name: true,
          image: true,
        },
      },
      invitedBy: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!invitation) {
    throw new Error("Invalid invitation token");
  }

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
  });

  if (!invitation) throw new Error("Invalid invitation token");
  if (invitation.acceptedAt) throw new Error("Invitation already accepted");
  if (invitation.expiresAt < new Date()) throw new Error("Invitation has expired");
  if (invitation.email !== user.email.toLowerCase()) {
    throw new Error("Invitation email does not match your account email");
  }

  // Create membership and mark as accepted
  const [membership, updatedInvitation, workspace] = await prisma.$transaction([
    prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
    prisma.workspace.findUnique({ where: { id: invitation.workspaceId } }),
  ]);

  return workspace;
}
