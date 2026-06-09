"use client";

import { Bot, Code2, Eye, FileCode2, Layers3, Rocket } from "lucide-react";

const features = [
  {
    title: "AI Website Generation",
    description:
      "Turn plain English prompts into complete, responsive website sections with polished UI.",
    icon: Bot,
  },
  {
    title: "Live Preview",
    description:
      "Preview generated pages instantly and see your website come alive in real time.",
    icon: Eye,
  },
  {
    title: "Editable Code",
    description:
      "Get clean React and Tailwind code that you can customize, export, and ship.",
    icon: Code2,
  },
  {
    title: "Smart Templates",
    description:
      "Start from SaaS, portfolio, agency, restaurant, AI startup, and ecommerce layouts.",
    icon: Layers3,
  },
  {
    title: "Export Code",
    description:
      "Download production-ready code for your project without messy generated output.",
    icon: FileCode2,
  },
  {
    title: "Deploy Ready",
    description:
      "Designed for real deployment workflows with Vercel, domains, and future hosting tools.",
    icon: Rocket,
  },
];

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden px-5 py-28 md:px-8" style={{ background: 'var(--bg-secondary)' }}>
      <div className="mx-auto max-w-7xl">
        <div data-animate className="mx-auto mb-16 max-w-3xl text-center">
          <div 
            className="mb-4 inline-flex items-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.28em]"
            style={{ 
              background: 'var(--surface)', 
              border: '1px solid var(--border)', 
              color: 'var(--accent)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            How it works
          </div>

          <h2 data-animate className="font-black leading-tight tracking-tight mb-5" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--text)' }}>
            Everything needed to build{" "}
            <span style={{ color: 'var(--accent)' }}>without limits</span>
          </h2>

          <p data-animate className="mx-auto max-w-2xl text-base leading-8 md:text-lg" style={{ color: 'var(--text-muted)' }}>
            CraftSite gives creators and developers an AI-powered workspace for
            building polished websites without starting from zero.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                data-animate
                className="group relative overflow-hidden transition-all duration-250 ease-out flex flex-col"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '28px',
                }}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div 
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--accent)'
                    }}
                  >
                    <Icon size={25} />
                  </div>

                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                      {feature.title}
                    </h3>

                    <span 
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)'
                      }}
                    >
                      0{index + 1}
                    </span>
                  </div>

                  <p className="leading-7 flex-grow" style={{ color: 'var(--text-muted)' }}>
                    {feature.description}
                  </p>

                  <div 
                    className="mt-6 flex items-center justify-between text-sm font-semibold transition-colors duration-200"
                    style={{ color: 'var(--accent)' }}
                  >
                    <span>Explore feature</span>
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .group:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md) !important;
        }
      `}</style>
    </section>
  );
}
