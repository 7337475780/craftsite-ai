"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet, apiPatch } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Shield, Ban, Check, Save } from "lucide-react";
import Link from "next/link";

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({ projectsCount: 0, recentUsage: [], recentEvents: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form State
  const [credits, setCredits] = useState<number>(0);
  const [plan, setPlan] = useState("free");
  const [role, setRole] = useState("user");
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    async function loadUser() {
      if (!id) return;
      try {
        const res = await apiGet(`/api/admin/users/${id}`);
        if (res.success) {
          setUser(res.data.user);
          setCredits(res.data.user.credits);
          setPlan(res.data.user.plan);
          setRole(res.data.user.role);
          setIsBlocked(res.data.user.isBlocked);
          setStats({
            projectsCount: res.data.projectsCount,
            recentUsage: res.data.recentUsage,
            recentEvents: res.data.recentEvents,
          });
        }
      } catch (err) {
        console.error("Failed to load user", err);
        setError("Failed to load user details.");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await apiPatch(`/api/admin/users/${id}`, {
        credits: Number(credits),
        plan,
        role,
        isBlocked,
      });

      if (res.success) {
        setSuccess(true);
        setUser(res.data);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(res.message || "Failed to update user");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <AppShell>
          <div className="flex h-full min-h-[60vh] items-center justify-center">
            <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
          </div>
        </AppShell>
      </AdminGuard>
    );
  }

  if (!user) {
    return (
      <AdminGuard>
        <AppShell>
          <div className="flex h-full min-h-[60vh] flex-col items-center justify-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">User Not Found</h2>
            <Link href="/admin/users" className="mt-4 text-violet-600 font-bold">Back to Users</Link>
          </div>
        </AppShell>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-5xl px-2 pb-20 pt-8">
          <Link
            href="/admin/users"
            className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition"
          >
            <ArrowLeft size={16} /> Back to Users
          </Link>

          <div className="grid gap-6 md:grid-cols-[1fr_400px]">
            {/* Left Col - Edit Form */}
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] flex items-center gap-6">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 text-3xl font-black text-violet-700 dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    {user.name || "Unknown User"}
                    {role === "admin" && <Shield size={18} className="text-violet-500" />}
                  </h1>
                  <p className="text-slate-500 dark:text-white/50">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-white/30">ID: {user.id}</p>
                </div>
              </div>

              {/* Management Form */}
              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
                <h3 className="mb-6 text-xl font-black text-slate-900 dark:text-white">Account Management</h3>

                {error && (
                  <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400 font-semibold border border-red-200 dark:border-red-500/20">
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Credits</label>
                    <input
                      type="number"
                      value={credits}
                      onChange={(e) => setCredits(Number(e.target.value))}
                      className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Plan</label>
                    <select
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="team">Team</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-black/5 dark:border-white/5">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`flex h-6 w-11 items-center rounded-full transition-colors ${isBlocked ? "bg-red-500" : "bg-slate-300 dark:bg-white/10"}`}>
                        <div className={`h-4 w-4 rounded-full bg-white transition-transform ${isBlocked ? "translate-x-6" : "translate-x-1"}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={isBlocked} onChange={(e) => setIsBlocked(e.target.checked)} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Block User Account</span>
                    </label>
                    <p className="mt-1 text-xs text-slate-500 dark:text-white/40 ml-14">
                      Blocked users cannot log in or generate content.
                    </p>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition ${
                        success 
                          ? "bg-emerald-500 hover:bg-emerald-600" 
                          : "bg-gradient-to-r from-violet-600 to-blue-500 hover:shadow-lg hover:-translate-y-0.5"
                      }`}
                    >
                      {success ? (
                        <><Check size={16} /> Saved Successfully</>
                      ) : isSaving ? (
                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                      ) : (
                        <><Save size={16} /> Save Changes</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col - Stats & Logs */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.projectsCount}</p>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-white/40 mt-1">Projects</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/70 p-4 text-center dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{new Date(user.createdAt).toLocaleDateString()}</p>
                  <p className="text-xs font-bold uppercase text-slate-500 dark:text-white/40 mt-1">Joined</p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Recent Activity</h3>
                {stats.recentEvents.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-white/50">No recent events.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.recentEvents.map((ev: any) => (
                      <div key={ev.id} className="text-sm">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {ev.event.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-white/30">
                          {new Date(ev.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
