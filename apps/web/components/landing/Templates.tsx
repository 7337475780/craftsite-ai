const templates = [
  "AI SaaS",
  "Portfolio",
  "Agency",
  "Restaurant",
  "Startup",
  "E-commerce",
];

export function Templates() {
  return (
    <section id="templates" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Templates
            </p>
            <h2 className="max-w-2xl text-4xl font-black md:text-6xl">
              Start with beautiful{" "}
              <span className="gradient-text">AI-ready</span> templates
            </h2>
          </div>
          <p className="max-w-md text-white/50">
            Pick a category, customize the prompt, and let CraftSite generate
            the first version instantly.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, index) => (
            <div
              key={template}
              className="glass-card group overflow-hidden rounded-3xl p-4 transition hover:-translate-y-1 hover:border-cyan-400/40"
            >
              <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-violet-950/70 to-cyan-950">
                <div className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-500 blur-xl opacity-70" />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="h-3 w-20 rounded-full bg-white/20" />
                    <span className="h-8 w-8 rounded-full bg-violet-400/50" />
                  </div>
                  <div className="h-3 w-3/4 rounded-full bg-white/25" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-white/15" />
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <span className="h-12 rounded-xl bg-white/10" />
                    <span className="h-12 rounded-xl bg-white/10" />
                    <span className="h-12 rounded-xl bg-white/10" />
                  </div>
                </div>
              </div>

              <div className="p-3">
                <p className="text-xs text-white/40">Template #{index + 1}</p>
                <h3 className="mt-1 text-xl font-bold">{template}</h3>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  A polished, responsive website template generated for modern
                  brands.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
