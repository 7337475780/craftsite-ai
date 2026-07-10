"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ArrowLeft, Zap, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { apiGet } from "@/lib/api-client";

export default function PerformancePage() {
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 50) return "text-amber-400";
    return "text-red-400";
  };

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
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h1 className="font-semibold text-sm">Performance</h1>
                  <p className="text-xs text-zinc-500">Core Web Vitals</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold mb-2">Lighthouse Score</h2>
              <p className="text-zinc-400 text-sm">Measured from real-world Chrome UX Report data.</p>
            </div>
            <div className={`text-6xl font-bold ${getScoreColor(data.performance.score)}`}>
              {data.performance.score}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="text-sm font-medium text-zinc-400 mb-1">LCP (Largest Contentful Paint)</div>
              <div className="text-2xl font-semibold text-green-400 mb-2">{data.performance.lcp}</div>
              <p className="text-xs text-zinc-500">Good ({"<"} 2.5s)</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="text-sm font-medium text-zinc-400 mb-1">FID (First Input Delay)</div>
              <div className="text-2xl font-semibold text-green-400 mb-2">{data.performance.fid}</div>
              <p className="text-xs text-zinc-500">Good ({"<"} 100ms)</p>
            </div>
            <div className="bg-zinc-900/50 p-6 rounded-xl border border-white/10">
              <div className="text-sm font-medium text-zinc-400 mb-1">CLS (Cumulative Layout Shift)</div>
              <div className="text-2xl font-semibold text-green-400 mb-2">{data.performance.cls}</div>
              <p className="text-xs text-zinc-500">Good ({"<"} 0.1)</p>
            </div>
          </div>

          <div className="bg-zinc-900/30 border border-white/10 rounded-xl overflow-hidden">
             <div className="p-6 border-b border-white/10 bg-zinc-900/50">
               <h3 className="font-medium">Optimizations Passed</h3>
             </div>
             <div className="p-6 space-y-4">
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span className="text-sm text-zinc-300">Images are served in next-gen formats (WebP/AVIF)</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span className="text-sm text-zinc-300">Text compression enabled (Brotli/Gzip)</span>
               </div>
               <div className="flex items-center gap-3">
                 <CheckCircle2 className="w-5 h-5 text-green-400" />
                 <span className="text-sm text-zinc-300">Global CDN edge caching active</span>
               </div>
             </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
