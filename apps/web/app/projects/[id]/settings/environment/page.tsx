"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost, apiDelete } from "@/lib/api-client";
import { ArrowLeft, KeySquare, Plus, Save, Eye, EyeOff, Trash2, Search } from "lucide-react";
import { useRealtime } from "@/components/providers/RealtimeProvider";
import Link from "next/link";

// For the UI mockup, we will store state locally in the component.
// In a full implementation, this would sync with our EnvironmentVariable Prisma model via API routes.
interface EnvVar {
  id: string;
  key: string;
  value: string;
  environment: "production" | "preview" | "development";
}

export default function EnvironmentSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const { addToast } = useRealtime();

  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newEnv, setNewEnv] = useState<"production" | "preview" | "development">("production");

  const fetchVars = async () => {
    try {
      const data = await apiGet(`/api/projects/${projectId}/environment`);
      setEnvVars(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVars();
  }, [projectId]);

  const toggleShowValue = (id: string) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey || !newValue) return;

    try {
      await apiPost(`/api/projects/${projectId}/environment`, {
        key: newKey,
        value: newValue,
        environment: newEnv
      });
      setNewKey("");
      setNewValue("");
      addToast({ title: "Variable Added", message: "Environment variable added successfully.", type: "success" });
      fetchVars();
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to add variable", type: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/api/projects/${projectId}/environment/${id}`);
      addToast({ title: "Variable Deleted", message: "Environment variable removed.", type: "success" });
      fetchVars();
    } catch (e: any) {
      addToast({ title: "Error", message: e.message || "Failed to delete variable", type: "error" });
    }
  };

  const filteredVars = envVars.filter(v => v.key.toLowerCase().includes(search.toLowerCase()));

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
                  <KeySquare className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Environment Variables</h1>
                  <p className="text-xs text-zinc-500">Project Settings</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-2">Environment Variables</h2>
            <p className="text-zinc-400 text-sm max-w-2xl">
              Provide environment variables to your deployment environments. These variables will be encrypted at rest and injected into your app securely at build and runtime.
            </p>
          </div>

          <form onSubmit={handleAdd} className="bg-zinc-900/50 p-6 rounded-xl border border-white/10 mb-12">
            <h3 className="font-medium mb-6">Add New Variable</h3>
            <div className="grid grid-cols-[1fr_2fr_1fr_auto] gap-4 items-end">
              <div>
                <label className="text-xs text-zinc-400 font-medium mb-2 block">Key</label>
                <input 
                  type="text" 
                  placeholder="API_KEY"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s/g, '_'))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 text-sm font-mono focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium mb-2 block">Value</label>
                <input 
                  type="text" 
                  placeholder="sk_live_..."
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 text-sm font-mono focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 font-medium mb-2 block">Environment</label>
                <select 
                  value={newEnv}
                  onChange={(e) => setNewEnv(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg h-10 px-3 text-sm focus:border-violet-500"
                >
                  <option value="production">Production</option>
                  <option value="preview">Preview</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <Button type="submit" disabled={!newKey || !newValue} className="bg-white text-black hover:bg-zinc-200">
                <Plus className="w-4 h-4 mr-2" /> Add
              </Button>
            </div>
          </form>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Variables</h3>
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search keys..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg h-9 pl-9 pr-4 text-sm w-64 focus:border-violet-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900/20">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-900/80 text-zinc-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 font-medium w-1/3">Key</th>
                    <th className="px-6 py-4 font-medium w-1/3">Value</th>
                    <th className="px-6 py-4 font-medium">Environment</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredVars.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 font-mono font-medium">{v.key}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-zinc-400">
                            {showValues[v.id] ? v.value : "••••••••••••••••"}
                          </span>
                          <button onClick={() => toggleShowValue(v.id)} className="text-zinc-500 hover:text-zinc-300">
                            {showValues[v.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize px-2 py-1 rounded-md bg-zinc-800 text-xs">
                          {v.environment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(v.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredVars.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                        No environment variables found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
