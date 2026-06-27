import type {
  AIProvider,
  EditWebsiteInput,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";

const DEFAULT_MOCK_JSX = `export default function GeneratedWebsite() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white p-6">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-black tracking-tight mb-2">Safe Mock Preview</h1>
        <p className="text-sm text-slate-400 mb-6">This is a fallback template generated automatically. Configure your AI provider keys in .env to connect Gemini or OpenRouter.</p>
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-left">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mock Specs</h2>
          <ul className="space-y-1 text-xs text-slate-400">
            <li className="flex justify-between"><span>Provider Status</span><span className="font-semibold text-amber-400">Mock Mode Active</span></li>
            <li className="flex justify-between"><span>Tailwind CSS</span><span className="text-emerald-400">Enabled</span></li>
            <li className="flex justify-between"><span>Design</span><span className="text-violet-400">Premium Glassmorphic</span></li>
          </ul>
        </div>
      </div>
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
