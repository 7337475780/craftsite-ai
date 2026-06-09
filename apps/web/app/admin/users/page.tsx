"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Loader2, Search, MoreHorizontal, Shield, Ban } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiGet(`/api/admin/users?search=${encodeURIComponent(search)}`);
        if (res.success) {
          setUsers(res.data.users);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">
                Admin Directory
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
                Users
              </h1>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-black/10 bg-white/50 py-3 pl-12 pr-4 text-sm font-semibold outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            {isLoading ? (
              <div className="flex justify-center p-12">
                <Loader2 size={32} className="animate-spin text-violet-600 dark:text-cyan-400" />
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-white/50 font-semibold">
                No users found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-white/5 dark:text-white/40">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Plan / Credits</th>
                      <th className="px-6 py-4">Projects</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold dark:bg-violet-500/20 dark:text-violet-300">
                              {u.name?.charAt(0) || u.email.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                {u.name || "Unknown"}
                                {u.role === "admin" && <Shield size={12} className="text-violet-500" />}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-white/50">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">{u.plan}</p>
                          <p className="text-xs text-slate-500 dark:text-white/50">{u.credits} credits</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">
                          {u.projectsCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-[10px] font-bold uppercase text-red-700 dark:bg-red-500/20 dark:text-red-300">
                              <Ban size={10} /> Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="inline-flex items-center justify-center rounded-xl bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <MoreHorizontal size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
