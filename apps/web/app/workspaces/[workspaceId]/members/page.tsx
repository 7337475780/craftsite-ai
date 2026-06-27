"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost, apiPatch, apiDelete } from "../../../../lib/api-client";
import { WorkspaceMember, WorkspaceInvitation, WorkspaceRole } from "../../../../types/workspace";
import { useWorkspace } from "../../../../components/providers/WorkspaceProvider";
import { UserPlus, UserMinus, Shield, User, MoreVertical, Copy, Check } from "lucide-react";

export default function WorkspaceMembers() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { activeWorkspaceRole } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invitations, setInvitations] = useState<WorkspaceInvitation[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("viewer");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const canManage = activeWorkspaceRole === "owner" || activeWorkspaceRole === "admin";

  const fetchMembers = async () => {
    try {
      const data = await apiGet(`/api/workspaces/${workspaceId}/members`);
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchInvitations = async () => {
    if (!canManage) return;
    try {
      const data = await apiGet(`/api/workspaces/${workspaceId}/invitations`);
      setInvitations(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchInvitations();
  }, [workspaceId, canManage]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost(`/api/workspaces/${workspaceId}/invitations`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setIsInviteOpen(false);
      fetchInvitations();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateRole = async (memberId: string, newRole: WorkspaceRole) => {
    try {
      await apiPatch(`/api/workspaces/${workspaceId}/members/${memberId}`, { role: newRole });
      fetchMembers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      await apiDelete(`/api/workspaces/${workspaceId}/members/${memberId}`);
      fetchMembers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    try {
      await apiDelete(`/api/workspaces/${workspaceId}/invitations/${invitationId}`);
      fetchInvitations();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const copyLink = (url: string, token: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Members</h2>
        {canManage && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite Member
          </button>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-400">User</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Joined</th>
              <th className="px-6 py-4 text-sm font-semibold text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-white/[0.02]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{member.user?.name || "Unknown User"}</div>
                      <div className="text-sm text-zinc-500">{member.user?.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    member.role === 'owner' ? 'bg-violet-500/20 text-violet-300' :
                    member.role === 'admin' ? 'bg-blue-500/20 text-blue-300' :
                    member.role === 'editor' ? 'bg-cyan-500/20 text-cyan-300' :
                    'bg-slate-500/20 text-slate-300'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {new Date(member.joinedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {canManage && member.role !== "owner" && (
                    <div className="flex items-center justify-end gap-2">
                      {activeWorkspaceRole === "owner" || (activeWorkspaceRole === "admin" && member.role !== "admin") ? (
                        <select
                          value={member.role}
                          onChange={(e) => handleUpdateRole(member.id, e.target.value as WorkspaceRole)}
                          className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                        >
                          {activeWorkspaceRole === "owner" && <option value="admin">Admin</option>}
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      ) : null}
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {canManage && invitations.length > 0 && (
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-bold text-zinc-300">Pending Invitations</h3>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Email</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400">Invited By</th>
                  <th className="px-6 py-4 text-sm font-semibold text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {invitations.map((inv) => {
                  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
                  const url = `${appUrl}/invite/${inv.token}`;
                  return (
                    <tr key={inv.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-white">{inv.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium capitalize bg-white/10 text-zinc-300">
                          {inv.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{inv.invitedBy?.email}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyLink(url, inv.token)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors"
                          >
                            {copiedToken === inv.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            {copiedToken === inv.token ? "Copied" : "Copy Link"}
                          </button>
                          <button
                            onClick={() => handleCancelInvite(inv.id)}
                            className="px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" /> Invite Team Member
            </h2>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  placeholder="colleague@example.com"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-400 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="editor">Editor (Can edit projects)</option>
                  <option value="viewer">Viewer (Read-only)</option>
                  {activeWorkspaceRole === "owner" && <option value="admin">Admin (Can manage editors/viewers)</option>}
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="px-4 py-2 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
