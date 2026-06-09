export type PricingPlan = {
  id: "free" | "pro" | "team";
  name: string;
  price: number;
  priceLabel: string;
  period: string;
  credits: number;
  popular?: boolean;
  comingSoon?: boolean;
  description: string;
  features: string[];
  cta: string;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    period: "forever",
    credits: 20,
    description: "Perfect for exploring CraftSite and testing ideas.",
    features: [
      "20 starter AI credits",
      "AI website generation",
      "AI editing mode",
      "Export clean code (ZIP)",
      "Public share links",
      "Save unlimited projects",
    ],
    cta: "Start Free",
  },
  {
    id: "pro",
    name: "Pro",
    price: 19,
    priceLabel: "$19",
    period: "month",
    credits: 500,
    popular: true,
    comingSoon: true,
    description: "For serious builders who want to ship faster.",
    features: [
      "500 AI credits / month",
      "Everything in Free",
      "More AI generations",
      "Advanced editing options",
      "Priority AI generation",
      "Custom branding removal (soon)",
    ],
    cta: "Upgrade to Pro",
  },
  {
    id: "team",
    name: "Studio",
    price: 49,
    priceLabel: "$49",
    period: "month",
    credits: 2000,
    comingSoon: true,
    description: "For agencies, freelancers, and growing teams.",
    features: [
      "2000 AI credits / month",
      "Everything in Pro",
      "Team workspace (soon)",
      "Client collaboration (soon)",
      "Shared credit pool (soon)",
      "Priority email support",
    ],
    cta: "Upgrade to Studio",
  },
];
