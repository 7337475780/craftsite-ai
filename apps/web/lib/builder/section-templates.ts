import { BuilderSection, BuilderSectionType } from "@craftsite/shared";

export const sectionTemplates: Partial<Record<BuilderSectionType, Omit<BuilderSection, "id" | "order">[]>> = {
  hero: [
    {
      type: "hero",
      visible: true,
      props: {
        badge: "New Feature",
        heading: "Build faster with CraftSite",
        description: "Create production-ready websites with the power of AI in seconds, not months.",
        primaryCta: "Get Started",
        secondaryCta: "View Demo",
      },
      styles: {
        alignment: "center",
      },
      components: []
    }
  ],
  features: [
    {
      type: "features",
      visible: true,
      props: {
        title: "Everything you need",
        description: "All the features to build your next big thing.",
        items: [
          { title: "Fast", description: "Lightning fast builds", icon: "zap" },
          { title: "Secure", description: "Enterprise-grade security", icon: "shield" },
          { title: "Scalable", description: "Grows with your business", icon: "trending-up" },
        ]
      },
      components: []
    }
  ],
  pricing: [
    {
      type: "pricing",
      visible: true,
      props: {
        title: "Simple, transparent pricing",
        description: "No hidden fees. No surprise charges.",
        plans: [
          { name: "Starter", price: "$0", features: ["1 Project", "Basic Support"] },
          { name: "Pro", price: "$29", features: ["Unlimited Projects", "Priority Support", "Custom Domain"], popular: true },
          { name: "Enterprise", price: "Custom", features: ["SLA", "Dedicated Manager"] },
        ]
      },
      components: []
    }
  ],
  cta: [
    {
      type: "cta",
      visible: true,
      props: {
        title: "Ready to get started?",
        description: "Join thousands of developers building the future.",
        buttonText: "Start Building Now",
      },
      components: []
    }
  ],
  navbar: [
    {
      type: "navbar",
      visible: true,
      props: {
        logoText: "CraftSite",
        links: [
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "#pricing" },
        ]
      },
      components: []
    }
  ],
  footer: [
    {
      type: "footer",
      visible: true,
      props: {
        brand: "CraftSite AI",
        description: "Building the web of tomorrow.",
        copyright: "© 2026 CraftSite AI. All rights reserved.",
        columns: [
          { title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }] },
          { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
        ]
      },
      components: []
    }
  ]
};
