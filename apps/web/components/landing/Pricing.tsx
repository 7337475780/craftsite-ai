import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For trying CraftSite.",
    features: [
      "5 generations",
      "Basic templates",
      "Code copy",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious builders.",
    popular: true,
    features: [
      "Unlimited projects",
      "Premium templates",
      "Export code",
      "Version history",
      "Priority AI generation",
    ],
  },
  {
    name: "Studio",
    price: "$49",
    description: "For agencies and teams.",
    features: [
      "Team workspace",
      "Client projects",
      "Advanced exports",
      "Custom branding",
      "Priority support",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">
            Pricing
          </p>
          <h2 className="text-4xl font-black md:text-6xl">
            Simple plans for every{" "}
            <span className="gradient-text">builder</span>
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card relative rounded-3xl p-8 ${
                plan.popular ? "neon-card border-violet-400/50" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 px-3 py-1 text-xs font-bold">
                  Popular
                </div>
              )}

              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <p className="mt-2 text-white/48">{plan.description}</p>

              <div className="mt-8 flex items-end gap-2">
                <p className="text-5xl font-black">{plan.price}</p>
                <p className="pb-2 text-white/45">/month</p>
              </div>

              <Button
                className="mt-8 w-full"
                variant={plan.popular ? "primary" : "secondary"}
              >
                Get Started
              </Button>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <Check size={18} className="text-emerald-400" />
                    <span className="text-sm text-white/68">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
