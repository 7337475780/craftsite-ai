import { Bot, Code2, Eye, FileCode2, Layers3, Rocket } from "lucide-react";

const features = [
  {
    title: "AI Website Generation",
    description: "Turn plain English into complete modern websites.",
    icon: Bot,
  },
  {
    title: "Live Preview",
    description: "Preview generated pages instantly before exporting.",
    icon: Eye,
  },
  {
    title: "Editable Code",
    description: "Get clean React and Tailwind code that you can customize.",
    icon: Code2,
  },
  {
    title: "Smart Templates",
    description: "Start with SaaS, portfolio, agency, restaurant and more.",
    icon: Layers3,
  },
  {
    title: "Export Code",
    description: "Download production-ready code for your project.",
    icon: FileCode2,
  },
  {
    title: "Deploy Ready",
    description: "Designed to connect with Vercel deployment later.",
    icon: Rocket,
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            Features
          </p>
          <h2 className="text-4xl font-black md:text-6xl">
            Everything needed to build{" "}
            <span className="gradient-text">faster</span>
          </h2>
          <p className="mt-5 text-white/55">
            CraftSite gives creators and developers an AI-powered workspace for
            building polished websites without starting from zero.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group glass-card rounded-3xl p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-400/40"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10 text-violet-200 shadow-[0_0_30px_rgba(139,92,246,0.18)]">
                  <Icon size={25} />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-white/50">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
