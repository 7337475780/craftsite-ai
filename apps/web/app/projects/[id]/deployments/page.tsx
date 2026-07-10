"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, GitBranch, Globe, RefreshCcw, Server, Activity, CheckCircle2, XCircle, RotateCcw, History } from "lucide-react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface Deployment {
  id: string;
  version: string;
  environment: string;
  status: "building" | "ready" | "failed";
  buildLogs: string | null;
  url: string | null;
  deployedAt: string | null;
  createdAt: string;
}

export default function DeploymentsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string | null>(null);

  const fetchDeployments = async () => {
    try {
      const data = await apiGet(`/api/projects/${projectId}/deployments`);
      setDeployments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
    const interval = setInterval(fetchDeployments, 5000); // Poll for live updates
    return () => clearInterval(interval);
  }, [projectId]);

  const handleDeploy = async () => {
    setIsDeploying(true);
    try {
      await apiPost(`/api/projects/${projectId}/deployments/deploy`, { environment: "production" });
      fetchDeployments();
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRollback = async (deploymentId: string) => {
    try {
      await apiPost(`/api/projects/${projectId}/deployments/${deploymentId}/rollback`, {});
      fetchDeployments();
    } catch (e) {
      console.error(e);
    }
  };

  const activeDeployment = deployments.find(d => d.environment === "production" && d.status === "ready");

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-violet-500/30">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={`/projects/${projectId}`} className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                  <Server className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Deployments</h1>
                  <p className="text-xs text-zinc-500">Manage production and preview environments</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/projects/${projectId}/analytics`} className="text-sm text-zinc-400 hover:text-white">
                Analytics
              </Link>
              <Link href={`/projects/${projectId}/settings/domains`} className="text-sm text-zinc-400 hover:text-white">
                Domains
              </Link>
              <Button onClick={handleDeploy} disabled={isDeploying} className="bg-white text-black hover:bg-zinc-200 h-9 text-sm">
                {isDeploying ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <Globe className="w-4 h-4 mr-2" />}
                Deploy to Production
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Active Deployment Card */}
          <section className="mb-12">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-400" /> Current Production Build
            </h2>
            <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-6 flex items-center justify-between">
              {activeDeployment ? (
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-lg">{activeDeployment.version}</span>
                      <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium tracking-wide uppercase">
                        Live
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-zinc-400">
                      <a href={activeDeployment.url || "#"} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-violet-400 transition-colors">
                        {activeDeployment.url?.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                      </a>
                      <span>•</span>
                      <span>Deployed {new Date(activeDeployment.deployedAt!).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-zinc-500 text-sm">No active production deployment found.</div>
              )}
            </div>
          </section>

          {/* Deployment History */}
          <section>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-400" /> Deployment History
            </h2>
            
            <div className="rounded-xl border border-white/10 overflow-hidden bg-zinc-900/20">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium">Commit / Version</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Environment</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {deployments.map((dep) => (
                    <tr key={dep.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-zinc-500" /> {dep.version}
                          </span>
                          <span className="text-xs text-zinc-500 mt-1">
                            {new Date(dep.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {dep.status === "ready" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                          {dep.status === "building" && <RefreshCcw className="w-4 h-4 text-amber-400 animate-spin" />}
                          {dep.status === "failed" && <XCircle className="w-4 h-4 text-red-400" />}
                          <span className="capitalize">{dep.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 capitalize text-zinc-300">
                        {dep.environment}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {dep.status === "ready" ? "5s" : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLogs(dep.buildLogs)} className="h-8 text-xs text-zinc-400 hover:text-white">
                            Logs
                          </Button>
                          {dep.status === "ready" && activeDeployment?.id !== dep.id && (
                            <Button variant="outline" size="sm" onClick={() => handleRollback(dep.id)} className="h-8 text-xs border-zinc-700 hover:bg-zinc-800">
                              <RotateCcw className="w-3 h-3 mr-2" /> Rollback
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {deployments.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                        No deployments yet. Click "Deploy to Production" to start.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        {/* Build Logs Modal */}
        <AnimatePresence>
          {selectedLogs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
                  <h3 className="font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-400" /> Build Logs
                  </h3>
                  <button onClick={() => setSelectedLogs(null)} className="text-zinc-400 hover:text-white">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 bg-[#0d1117] overflow-y-auto max-h-[60vh] font-mono text-sm leading-relaxed text-zinc-300">
                  <pre className="whitespace-pre-wrap">{selectedLogs}</pre>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
