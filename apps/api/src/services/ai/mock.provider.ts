import type {
  AIProvider,
  EditWebsiteInput,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";

const DEFAULT_MOCK_JSX = `export default function GeneratedWebsite() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              MockAI
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <a href="#" className="hover:text-white transition">Features</a>
              <a href="#" className="hover:text-white transition">Solutions</a>
              <a href="#" className="hover:text-white transition">Pricing</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white">Log in</button>
              <button className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 hover:-translate-y-0.5">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40 lg:pb-48">
        <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-violet-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 inline-flex rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-sm font-semibold text-violet-300">
              <span className="flex h-2 w-2 rounded-full bg-violet-400 mr-2 mt-1.5 animate-pulse"></span>
              API Connection Offline
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8">
              Beautiful Fallback <br />
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                Premium Design
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-400 sm:text-xl mb-10">
              This is a fallback template generated automatically. Configure your AI provider keys in .env to connect Gemini, OpenRouter, or Together AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-8 py-4 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:-translate-y-0.5">
                Configure API Keys
              </button>
              <button className="w-full sm:w-auto rounded-2xl border border-white/10 bg-white/[0.04] px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/10">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-slate-950/50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
          <p>© 2026 MockAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}`;

export class MockProvider implements AIProvider {
  public name = "mock" as const;

  isConfigured(): boolean {
    return true; // Always configured
  }

  getModels(): string[] {
    return ["mock-safe-fallback"];
  }

  async generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
    return {
      generatedCode: DEFAULT_MOCK_JSX,
      provider: "mock",
      model: "mock-safe-fallback",
      isFallback: true,
    };
  }

  async editWebsite(input: EditWebsiteInput): Promise<GenerateWebsiteOutput> {
    return {
      generatedCode: input.currentCode, // Simply return the code back
      provider: "mock",
      model: "mock-safe-fallback",
      isFallback: true,
    };
  }

  async repairWebsite(brokenCode: string): Promise<GenerateWebsiteOutput> {
    return {
      generatedCode: brokenCode,
      provider: "mock",
      model: "mock-safe-fallback",
      isFallback: true,
    };
  }
}
