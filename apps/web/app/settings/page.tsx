"use client";

import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEffect, useState } from "react";
import { apiPatch } from "@/lib/api-client";
import { Loader2, Shield, User, Palette, Server, Lock, AlertTriangle, LayoutDashboard, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function SettingsPage() {
  const { user, refetchMe } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Profile State
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });

  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  const [securityMsg, setSecurityMsg] = useState({ text: "", type: "" });

  // Preferences State
  const [defaultStyle, setDefaultStyle] = useState("modern");
  const [showClearDraftsConfirm, setShowClearDraftsConfirm] = useState(false);
  const { addToast } = useRealtime();

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatarUrl(user.image || "");
    }
    const savedStyle = localStorage.getItem("craftsite_default_style");
    if (savedStyle) {
      setDefaultStyle(savedStyle);
    }
  }, [user]);

  if (!user) {
    return (
      <AppShell>
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 size={36} className="animate-spin text-violet-600 dark:text-cyan-400" />
        </div>
      </AppShell>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg({ text: "", type: "" });
    try {
      const res = await apiPatch("/api/auth/profile", { name, image: avatarUrl });
      if (res.success) {
        setProfileMsg({ text: "Profile updated successfully.", type: "success" });
        await refetchMe();
      }
    } catch (err: any) {
      setProfileMsg({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSecurity(true);
    setSecurityMsg({ text: "", type: "" });
    try {
      const res = await apiPatch("/api/auth/password", { currentPassword, newPassword });
      if (res.success) {
        setSecurityMsg({ text: "Password updated successfully.", type: "success" });
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err: any) {
      setSecurityMsg({ text: err.message || "Failed to update password.", type: "error" });
    } finally {
      setIsSavingSecurity(false);
    }
  };

  const handleStyleChange = (val: string) => {
    setDefaultStyle(val);
    localStorage.setItem("craftsite_default_style", val);
  };

  const handleClearDrafts = () => {
    localStorage.removeItem("craftsite_saved_projects");
    addToast({ title: "Drafts Cleared", message: "Local drafts cleared successfully.", type: "success" });
    setShowClearDraftsConfirm(false);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-2 pb-20 pt-8">
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/60">
            Manage your account preferences and workspace settings.
          </p>
        </div>

        <div className="space-y-8">
          {/* Profile Section */}
          <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                <User size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Profile</h2>
            </div>
            
            <div className="mb-8 flex items-center gap-6">
              {user.image ? (
                <img src={user.image} alt="Avatar" className="h-24 w-24 rounded-full border-4 border-white shadow-sm dark:border-slate-800" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-cyan-100 text-4xl font-black text-violet-700 shadow-sm dark:from-violet-500/20 dark:to-cyan-500/10 dark:text-cyan-200">
                  {user.name?.charAt(0) || user.email.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
                <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/50">
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 dark:bg-white/10">{user.plan} plan</span>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">{user.credits} credits</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {profileMsg.text && (
                <div className={`rounded-xl p-4 text-sm font-semibold border ${profileMsg.type === "error" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"}`}>
                  {profileMsg.text}
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full max-w-md rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Profile Picture URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full max-w-md rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                />
              </div>
              <button
                type="submit"
                disabled={isSavingProfile || (name === user.name && avatarUrl === (user.image || ""))}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                {isSavingProfile && <Loader2 size={16} className="animate-spin" />}
                Save Changes
              </button>
            </form>
          </section>

          {/* Account Security */}
          <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300">
                <Lock size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Account Security</h2>
            </div>
            
            {user.authProvider === "credentials" ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                {securityMsg.text && (
                  <div className={`rounded-xl p-4 text-sm font-semibold border ${securityMsg.type === "error" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20" : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"}`}>
                    {securityMsg.text}
                  </div>
                )}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSavingSecurity || !currentPassword || !newPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-200 disabled:opacity-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  {isSavingSecurity && <Loader2 size={16} className="animate-spin" />}
                  Update Password
                </button>
              </form>
            ) : (
              <div className="rounded-xl border border-black/5 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/5">
                <p className="font-semibold text-slate-900 dark:text-white">Managed by {user.authProvider}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-white/50">
                  Your account is secured via {user.authProvider === "google" ? "Google OAuth" : "GitHub OAuth"}. Password management is disabled.
                </p>
              </div>
            )}
          </section>

          {/* Appearance & Workspace */}
          <div className="grid gap-8 md:grid-cols-2">
            <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300">
                  <Palette size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Appearance</h2>
              </div>
              <div className="space-y-3">
                {["system", "light", "dark"].map((t) => (
                  <label key={t} className="flex cursor-pointer items-center justify-between rounded-xl border border-black/5 bg-white/50 p-4 transition-colors hover:bg-slate-50 dark:border-white/5 dark:bg-white/5 dark:hover:bg-white/10">
                    <span className="font-semibold capitalize text-slate-900 dark:text-white">{t} Mode</span>
                    <input
                      type="radio"
                      name="theme"
                      checked={theme === t}
                      onChange={() => setTheme(t)}
                      className="h-4 w-4 text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                  <LayoutDashboard size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Workspace</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 dark:text-slate-300">Default Generation Style</label>
                  <select
                    value={defaultStyle}
                    onChange={(e) => handleStyleChange(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/50 p-3 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
                  >
                    <option value="modern" className="dark:bg-zinc-900">Modern SaaS</option>
                    <option value="minimal" className="dark:bg-zinc-900">Minimal / Clean</option>
                    <option value="portfolio" className="dark:bg-zinc-900">Creative Portfolio</option>
                    <option value="futuristic" className="dark:bg-zinc-900">Futuristic / Dark</option>
                    <option value="startup" className="dark:bg-zinc-900">Startup Landing</option>
                  </select>
                </div>
                <p className="text-xs text-slate-500 dark:text-white/50">
                  This style will be pre-selected when generating new projects.
                </p>
              </div>
            </section>
          </div>

          {/* Data & Privacy & Danger Zone */}
          <section className="rounded-[2rem] border border-red-500/20 bg-red-50/50 p-6 shadow-sm backdrop-blur-2xl dark:bg-red-500/5 md:p-10">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300">
                <AlertTriangle size={20} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Data & Danger Zone</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-red-500/10 bg-white/50 p-5 dark:border-red-500/20 dark:bg-white/5">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Clear Local Drafts</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-white/50">Removes un-saved projects from this browser. Database projects are not affected.</p>
                </div>
                <button
                  onClick={() => setShowClearDraftsConfirm(true)}
                  className="shrink-0 rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-200 dark:bg-red-500/20 dark:text-red-300 dark:hover:bg-red-500/30"
                >
                  Clear Drafts
                </button>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-red-500/10 bg-white/50 p-5 dark:border-red-500/20 dark:bg-white/5">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Delete Account</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-white/50">Permanently delete your account and all projects.</p>
                </div>
                <button
                  disabled
                  className="shrink-0 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </section>

          {/* Admin Shortcut */}
          {user.role === "admin" && (
            <section className="rounded-[2rem] border border-cyan-500/30 bg-gradient-to-br from-cyan-50 to-violet-50 p-6 shadow-sm dark:from-cyan-900/20 dark:to-violet-900/20 md:p-10">
              <div className="mb-4 flex items-center gap-3">
                <Shield size={24} className="text-cyan-600 dark:text-cyan-400" />
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Controls</h2>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-white/70">
                You have elevated privileges. You can manage platform users, monitor analytics, and moderate content.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/admin"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  Manage Users
                </Link>
              </div>
            </section>
          )}

        </div>
      </div>

      <ConfirmDialog
        isOpen={showClearDraftsConfirm}
        title="Clear Local Drafts"
        message="Are you sure you want to clear all local drafts? Database projects will NOT be deleted."
        confirmText="Clear Drafts"
        onConfirm={handleClearDrafts}
        onCancel={() => setShowClearDraftsConfirm(false)}
      />
    </AppShell>
  );
}
