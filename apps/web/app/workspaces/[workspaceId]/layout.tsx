"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { apiGet } from "../../../lib/api-client";
import { Workspace } from "../../../types/workspace";
import { useWorkspace } from "../../../components/providers/WorkspaceProvider";
import Link from "next/link";
import { LayoutDashboard, Users, FolderKanban, Settings, ArrowLeft } from "lucide-react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const { workspaceId } = useParams() as { workspaceId: string };
  const pathname = usePathname();
  const router = useRouter();
  const { setActiveWorkspaceId } = useWorkspace();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiGet(`/api/workspaces/${workspaceId}`);
        setWorkspace(data);
        setActiveWorkspaceId(workspaceId);
      } catch (error) {
        console.error(error);
        router.push("/workspaces");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [workspaceId, router, setActiveWorkspaceId]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-8">Loading workspace...</div>;
  }

  if (!workspace) return null;

  const tabs = [
    { name: "Overview", href: `/workspaces/${workspaceId}`, icon: LayoutDashboard },
    { name: "Projects", href: `/workspaces/${workspaceId}/projects`, icon: FolderKanban },
    { name: "Members", href: `/workspaces/${workspaceId}/members`, icon: Users },
    ...(workspace.currentUserRole === "owner" || workspace.currentUserRole === "admin"
      ? [{ name: "Settings", href: `/workspaces/${workspaceId}/settings`, icon: Settings }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="border-b border-white/10 bg-black/50 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8">
          <div className="py-6 flex items-center gap-4">
            <Link
              href="/workspaces"
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-500 flex items-center justify-center text-xl font-bold">
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-medium text-zinc-300 capitalize">
                  {workspace.currentUserRole}
                </span>
                <span className="text-sm text-zinc-500">{workspace._count?.members || 1} Members</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-cyan-500 text-white"
                      : "border-transparent text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto p-8">
        {children}
      </div>
    </div>
  );
}
