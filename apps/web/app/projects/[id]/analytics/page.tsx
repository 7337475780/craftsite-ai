"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ArrowLeft, Users, MousePointerClick, Activity, Globe2, Clock } from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

export default function AnalyticsPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await apiGet(`/api/projects/${projectId}/analytics`);
        setData(response);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [projectId]);

  if (loading || !data) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-white font-sans">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href={`/projects/${projectId}/deployments`} className="text-zinc-400 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Activity className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Analytics</h1>
                  <p className="text-xs text-zinc-500">Website Traffic & Visitors</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-12">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Users className="w-4 h-4" /> Unique Visitors
              </div>
              <div className="text-3xl font-semibold">{data.overview.uniqueVisitors.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-2">+12% this week</div>
            </div>
            
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <MousePointerClick className="w-4 h-4" /> Page Views
              </div>
              <div className="text-3xl font-semibold">{data.overview.pageViews.toLocaleString()}</div>
              <div className="text-xs text-green-400 mt-2">+18% this week</div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Globe2 className="w-4 h-4" /> Bounce Rate
              </div>
              <div className="text-3xl font-semibold">{data.overview.bounceRate}</div>
              <div className="text-xs text-amber-400 mt-2">-2% this week</div>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-zinc-400 mb-2">
                <Clock className="w-4 h-4" /> Avg Duration
              </div>
              <div className="text-3xl font-semibold">{data.overview.avgDuration}</div>
              <div className="text-xs text-zinc-500 mt-2">Stable</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traffic Sources */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-zinc-900/50">
                <h3 className="font-medium">Traffic Sources</h3>
              </div>
              <div className="p-6 space-y-4">
                {data.trafficSources.map((source: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-zinc-300">{source.source}</span>
                    <span className="font-mono text-sm">{source.visits.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Real-time Map Simulation Placeholder */}
            <div className="bg-zinc-900/30 border border-white/10 rounded-xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-white/10 bg-zinc-900/50 flex justify-between items-center">
                <h3 className="font-medium">Real-time Visitors</h3>
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <div className="flex-1 min-h-[200px] flex items-center justify-center p-6 text-zinc-500 text-sm">
                [ Map Visualization Component ]
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
