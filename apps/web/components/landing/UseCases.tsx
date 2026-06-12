"use client";

import { Briefcase, Rocket, Presentation, Code, Smartphone, ShopWindow } from "lucide-react";

const useCases = [
  { title: "Portfolio websites", desc: "Showcase your work and attract clients.", icon: Briefcase },
  { title: "SaaS landing pages", desc: "Convert visitors into paying customers.", icon: Rocket },
  { title: "Startup MVP pages", desc: "Validate your ideas quickly and easily.", icon: Presentation },
  { title: "Agency mockups", desc: "Present professional concepts to clients.", icon: Code },
  { title: "App showcases", desc: "Highlight your app's best features.", icon: Smartphone },
  { title: "Ecommerce storefronts", desc: "Start selling your products online.", icon: ShopWindow }
];

export function UseCases() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32" style={{ background: 'var(--bg)' }}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
        <h2 data-animate className="font-black tracking-tight mb-12" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', color: 'var(--text)' }}>
          Built for every use case
        </h2>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px'
          }}
        >
          {useCases.map((useCase, idx) => {
            const Icon = useCase.icon || Briefcase;
            return (
              <div
                key={idx}
                data-animate
                className="group flex flex-col text-left transition-all duration-250 ease-out"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  boxShadow: 'var(--shadow-sm)',
                  padding: '24px',
                }}
              >
                <div 
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--accent)'
                  }}
                >
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>
                  {useCase.title}
                </h3>
                <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                  {useCase.desc}
                </p>
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
