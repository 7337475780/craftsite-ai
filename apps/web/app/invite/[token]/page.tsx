"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGetPublic, apiPost } from "../../../lib/api-client";
import { useAuth } from "../../../components/providers/AuthProvider";
import { ShieldAlert, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface InviteData {
  workspaceName: string;
  workspaceImage: string | null;
  invitedEmail: string;
  role: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired";
}

export default function InvitePage() {
  const { token } = useParams() as { token: string };
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGetPublic(`/api/workspace-invitations/${token}`);
        setInvite(data);
      } catch (e: any) {
        setError(e.message || "Failed to load invitation");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const workspace = await apiPost(`/api/workspace-invitations/${token}/accept`);
      router.push(`/workspaces/${workspace.id}`);
    } catch (e: any) {
      setError(e.message || "Failed to accept invitation");
      setAccepting(false);
    }
  };

  if (loading || authLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invalid Invitation</h2>
          <p className="text-zinc-400 mb-6">{error || "This invitation link is invalid or has expired."}</p>
          <Link href="/" className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status === "accepted") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-2xl max-w-md w-full text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Already Accepted</h2>
          <p className="text-zinc-400 mb-6">This invitation has already been accepted.</p>
          <Link href="/workspaces" className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            View Workspaces
          </Link>
        </div>
      </div>
    );
  }

  if (invite.status === "expired") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full text-center">
          <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Invitation Expired</h2>
          <p className="text-zinc-400 mb-6">This invitation has expired. Please ask the workspace owner for a new one.</p>
          <Link href="/" className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isEmailMatch = user?.email.toLowerCase() === invite.invitedEmail.toLowerCase();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-white/10 p-8 rounded-2xl max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-cyan-500" />
        
        <div className="text-center mb-8 mt-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            {invite.workspaceName.charAt(0).toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join {invite.workspaceName}</h1>
          <p className="text-zinc-400">
            You've been invited to join as a <span className="text-white font-medium capitalize">{invite.role}</span>
          </p>
        </div>

        {!user ? (
          <div className="text-center space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-zinc-300">
              Please sign in with <span className="font-semibold text-white">{invite.invitedEmail}</span> to accept this invitation.
            </div>
            <Link
              href={`/auth?returnUrl=/invite/${token}`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-white text-black rounded-xl font-medium hover:bg-zinc-200 transition-colors"
            >
              Sign In to Accept <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : !isEmailMatch ? (
          <div className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-200">
              You are signed in as <span className="font-semibold text-white">{user.email}</span>, but this invitation was sent to <span className="font-semibold text-white">{invite.invitedEmail}</span>.
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("craftsite_token");
                window.location.href = `/auth?returnUrl=/invite/${token}`;
              }}
              className="text-zinc-400 hover:text-white underline text-sm"
            >
              Sign out and switch accounts
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {accepting ? "Accepting..." : "Accept Invitation"}
            </button>
            <p className="text-center text-xs text-zinc-500">
              By accepting, you agree to join this workspace and access its shared resources.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
