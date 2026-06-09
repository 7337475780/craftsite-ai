"use client";

import Link from "next/link";
import { ArrowRight, Wand2, Globe, FileCode2, Play } from "lucide-react";
import { CraftSiteLogo } from "@/components/CraftSiteLogo";

export default function DemoPage() {
  return (
    <main className="craftsite-bg min-h-screen text-slate-900 dark:text-white">
      {/* Navbar */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex h-20 items-center justify-between border-b border-black/10 bg-white/70 px-6 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] md:px-12 lg:px-24">
        <Link href="/">
          <CraftSiteLogo />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-bold text-slate-600 transition hover:text-slate-900 dark:text-white/60 dark:hover:text-white">
            Sign In
          </Link>
          <Link href="/sign-up" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
            Get Started
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 pt-32 pb-24 md:pt-40">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-6">
            <Play size={14} className="fill-current" /> Interactive Demo
          </div>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl lg:text-7xl">
            See how <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">CraftSite</span> works.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-white/60">
            A mocked walkthrough of our premium AI website builder workflow. Watch how easy it is to go from prompt to published.
          </p>
        </div>

        {/* Workflow Showcase */}
        <div className="mt-20 space-y-32">
          
          {/* Step 1 */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400">
                <Wand2 size={28} />
              </div>
              <h2 className="text-3xl font-black mb-4">1. Describe your vision</h2>
              <p className="text-lg text-slate-600 dark:text-white/60 mb-6">
                Just type what you want. Our AI understands complex layouts, modern design trends, and fully functional React components.
              </p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
              <div className="border-b border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-800/50 p-4 flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="p-8">
                <div className="rounded-2xl border border-violet-500/30 bg-violet-50/50 p-4 dark:bg-violet-900/10">
                  <p className="font-mono text-sm text-slate-700 dark:text-slate-300">
                    "Build a modern SaaS landing page for an AI writing tool. Use a dark mode theme with neon purple accents, a hero section with a glowing button, a features grid, and a pricing table."
                  </p>
                </div>
                <div className="mt-6 flex justify-end">
                  <div className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg">
                    <Wand2 size={16} /> Generate Website
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="grid items-center gap-12 md:grid-cols-2 md:flex-row-reverse">
            <div className="order-2 md:order-1 rounded-3xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
              <div className="h-64 bg-slate-950 p-6 flex flex-col justify-center items-center text-center">
                <h3 className="text-2xl font-black text-white mb-2">AI Writer Pro</h3>
                <p className="text-white/60 mb-6 max-w-xs text-sm">Write 10x faster with our advanced neural network.</p>
                <div className="h-10 w-32 rounded-full bg-violet-600 shadow-[0_0_20px_rgba(124,58,237,0.5)]"></div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400">
                <FileCode2 size={28} />
              </div>
              <h2 className="text-3xl font-black mb-4">2. Instant Live Preview</h2>
              <p className="text-lg text-slate-600 dark:text-white/60 mb-6">
                Within seconds, you get a fully working, interactive React preview using Sandpack. It's not a mock—it's real code you can interact with immediately.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Globe size={28} />
              </div>
              <h2 className="text-3xl font-black mb-4">3. Edit & Publish</h2>
              <p className="text-lg text-slate-600 dark:text-white/60 mb-6">
                Spot something you want to change? Just ask the AI to "make the button bigger" or "change the theme to light mode". Once perfect, publish it to a public URL instantly or export the code.
              </p>
            </div>
            <div className="rounded-3xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-slate-900 overflow-hidden">
              <div className="p-8 space-y-4">
                <div className="rounded-xl bg-slate-100 p-4 dark:bg-white/5 flex items-center justify-between">
                  <span className="font-bold">Project Status</span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">Published</span>
                </div>
                <div className="rounded-xl border border-black/10 p-4 dark:border-white/10 flex items-center justify-between">
                  <span className="text-sm font-mono text-violet-600 dark:text-cyan-400 truncate pr-4">
                    craftsite.ai/share/ai-writer-pro-xyz
                  </span>
                  <div className="text-slate-400"><Globe size={18} /></div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="mt-32 rounded-[3rem] border border-black/10 bg-white/70 p-12 text-center shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
          <h2 className="text-3xl font-black mb-6">Ready to build something amazing?</h2>
          <p className="text-slate-600 dark:text-white/60 mb-8 max-w-xl mx-auto">
            Stop writing boilerplate. Start building the future. Join CraftSite AI today and turn your ideas into functional React applications in seconds.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:shadow-violet-500/25">
            Start Generating for Free <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </main>
  );
}
