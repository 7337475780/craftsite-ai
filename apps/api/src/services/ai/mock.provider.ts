import type {
  AIProvider,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";

export class MockProvider implements AIProvider {
  async generateWebsite(
    input: GenerateWebsiteInput,
  ): Promise<GenerateWebsiteOutput> {
    const generatedCode = `
export default function GeneratedWebsite() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <h1 className="text-2xl font-black">CraftSite Preview</h1>

        <div className="hidden items-center gap-6 text-sm text-white/60 md:flex">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Reviews</a>
        </div>

        <button className="rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950">
          Get Started
        </button>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <div className="mx-auto mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70">
          ✦ Safe Fallback Mode
        </div>

        <h2 className="mx-auto max-w-5xl text-5xl font-black leading-tight md:text-7xl">
          Build professional websites with AI in minutes
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
          Turn your ideas into polished, fully functional React components with smart suggestions and instant optimization.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-4 text-sm font-bold text-white">
            Start Building
          </button>

          <button className="rounded-2xl border border-white/10 px-6 py-4 text-sm font-bold text-white/80">
            View Templates
          </button>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-20 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <span className="text-3xl">⚡</span>
          <h3 className="mt-4 text-xl font-black">Fast Generation</h3>
          <p className="mt-3 leading-7 text-white/55">
            Generate tailored layouts based on your prompt and requirements.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <span className="text-3xl">✓</span>
          <h3 className="mt-4 text-xl font-black">Clean Code</h3>
          <p className="mt-3 leading-7 text-white/55">
            Get production-ready React components styled with Tailwind CSS.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <span className="text-3xl">🚀</span>
          <h3 className="mt-4 text-xl font-black">Export Ready</h3>
          <p className="mt-3 leading-7 text-white/55">
            Download your code instantly and add it directly to your project.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-violet-600 to-blue-500 p-10 text-center">
          <h3 className="text-4xl font-black">
            Ready to upgrade your workflow?
          </h3>

          <p className="mx-auto mt-4 max-w-xl text-white/75">
            Start building websites that help you stand out.
          </p>

          <button className="mt-8 rounded-2xl bg-white px-6 py-4 text-sm font-black text-slate-950">
            Start Free
          </button>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-6 py-10 text-center text-sm text-white/40">
        © 2026 CraftSite AI Preview.
      </footer>
    </main>
  );
}
`.trim();

    return {
      generatedCode,
      provider: "mock",
      isFallback: true,
    };
  }
}
