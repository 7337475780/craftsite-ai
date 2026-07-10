"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Globe, Plus, Settings, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import Link from "next/link";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";

interface Domain {
  id: string;
  hostname: string;
  status: "pending" | "active" | "failed";
  sslStatus: "initializing" | "active" | "failed";
  verification: any;
  createdAt: string;
}

export default function DomainsSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [domains, setDomains] = useState<Domain[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const { addToast } = useRealtime();

  const fetchDomains = async () => {
    try {
      const data = await apiGet(`/api/projects/${projectId}/domains`);
      setDomains(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, [projectId]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;
    
    setIsAdding(true);
    try {
      await apiPost(`/api/projects/${projectId}/domains`, { hostname: newDomain });
      setNewDomain("");
      addToast({ title: "Domain Added", message: "Domain added. Please configure your DNS settings.", type: "success" });
      fetchDomains();
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to add domain", type: "error" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setVerifyingId(domainId);
    try {
      await apiPost(`/api/projects/${projectId}/domains/${domainId}/verify`, {});
      addToast({ title: "Verified", message: "Domain verified and SSL provisioned!", type: "success" });
      fetchDomains();
    } catch (e) {
      addToast({ title: "Verification Failed", message: "DNS records not detected yet. Please wait and try again.", type: "error" });
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async () => {
    if (!domainToDelete) return;
    try {
      await apiDelete(`/api/projects/${projectId}/domains/${domainToDelete}`);
      addToast({ title: "Domain Removed", message: "Domain removed successfully.", type: "success" });
      fetchDomains();
    } catch (e) {
      addToast({ title: "Error", message: "Failed to remove domain", type: "error" });
    } finally {
      setDomainToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast({ title: "Copied", message: "Copied to clipboard", type: "info" });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={`/projects/${projectId}/deployments`} className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <Settings className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Domains</h1>
                  <p className="text-xs text-zinc-500">Project Settings</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Custom Domains</h2>
            <p className="text-zinc-400 text-sm">Connect your own domain name to this project.</p>
          </div>

          <form onSubmit={handleAddDomain} className="flex gap-4 mb-12 bg-zinc-900/50 p-6 rounded-xl border border-white/10">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-400 mb-2 block">Enter Domain</label>
              <input
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-4 text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={isAdding || !newDomain} className="bg-white text-black hover:bg-zinc-200">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </form>

          <div className="space-y-6">
            {domains.map((domain) => (
              <div key={domain.id} className="bg-zinc-900/30 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      domain.status === "active" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"
                    }`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{domain.hostname}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          domain.status === "active" ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {domain.status === "active" ? "Active" : "Pending Verification"}
                        </span>
                        {domain.sslStatus === "active" && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> SSL Secured
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {domain.status !== "active" && (
                      <Button variant="outline" size="sm" onClick={() => handleVerify(domain.id)} disabled={verifyingId === domain.id}>
                        {verifyingId === domain.id ? "Verifying..." : "Verify DNS"}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setDomainToDelete(domain.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                      Remove
                    </Button>
                  </div>
                </div>

                {domain.status !== "active" && domain.verification && (
                  <div className="p-6 bg-amber-500/5">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2 text-amber-500">
                      <AlertCircle className="w-4 h-4" /> Please configure your DNS records
                    </h4>
                    <p className="text-xs text-zinc-400 mb-4">
                      Add the following TXT record to your domain's DNS settings to verify ownership and automatically provision an SSL certificate.
                    </p>
                    
                    <div className="grid grid-cols-[100px_1fr_auto] gap-4 items-center bg-zinc-950 border border-zinc-800 p-4 rounded-lg">
                      <div className="text-xs text-zinc-500 font-medium">Type</div>
                      <div className="text-sm font-mono">{domain.verification.type}</div>
                      <div />
                      
                      <div className="text-xs text-zinc-500 font-medium">Name</div>
                      <div className="text-sm font-mono truncate">{domain.verification.name}</div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(domain.verification.name)}>
                        <Copy className="w-3 h-3 text-zinc-400" />
                      </Button>
                      
                      <div className="text-xs text-zinc-500 font-medium">Value</div>
                      <div className="text-sm font-mono truncate text-emerald-400">{domain.verification.value}</div>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => copyToClipboard(domain.verification.value)}>
                        <Copy className="w-3 h-3 text-zinc-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={!!domainToDelete}
        title="Remove Domain"
        message="Are you sure you want to remove this domain?"
        confirmText="Remove"
        onConfirm={handleDelete}
        onCancel={() => setDomainToDelete(null)}
      />
    </ProtectedRoute>
  );
}
