"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { pricingPlans } from "@/lib/pricing";
import { CreditCard, Zap, Check, ArrowRight, History, Crown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { trackClientEvent } from "@/lib/analytics-client";

export default function BillingPage() {
  const { user } = useAuth();
  const [billingInfo, setBillingInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBilling() {
      if (!user) return;
      try {
        const res = await apiGet("/api/billing/me");
        if (res.success) {
          setBillingInfo(res.data);
        }
        trackClientEvent("billing_page_viewed");
      } catch (err) {
        console.error("Failed to load billing info", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBilling();
  }, [user]);

  const currentPlan = pricingPlans.find((p) => p.id === user?.plan) || pricingPlans[0];
  const maxCredits = billingInfo?.limits?.monthlyCredits || currentPlan.credits;
  const creditsUsed = Math.max(0, maxCredits - (user?.credits || 0));
  const progressPercent = Math.min(100, Math.max(0, (creditsUsed / maxCredits) * 100));

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="mx-auto max-w-4xl px-2 pb-20 pt-8">
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl">
              Billing & Usage
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/60">
              Manage your subscription, credits, and payment methods.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Current Plan Card */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                    Current Plan
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {currentPlan.name}
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                  <Crown size={24} />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-white/60">
                You are currently on the {currentPlan.name} plan.
                {user?.plan === "free" && " Upgrade to a premium plan to unlock more AI generations and advanced features."}
              </p>
              
              <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
                <Link
                  href="/pricing"
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  View Plans
                </Link>
              </div>
            </div>

            {/* Credit Usage Card */}
            <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                    AI Credits
                  </p>
                  <h2 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    {user?.credits || 0} left
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  <Zap size={24} className="fill-current" />
                </div>
              </div>
              
              <div className="mt-8">
                <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-white/50 mb-2">
                  <span>{creditsUsed} used</span>
                  <span>{maxCredits} total</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
                <Link
                  href="/usage"
                  className="flex items-center gap-2 text-sm font-bold text-violet-600 transition hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                >
                  <History size={16} />
                  View detailed usage history
                </Link>
              </div>
            </div>
          </div>

          {/* Payment Method / Coming Soon Section */}
          <div className="mt-8 rounded-[2rem] border border-violet-500/20 bg-gradient-to-r from-violet-500/5 to-blue-500/5 p-8 dark:border-violet-400/20">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={20} className="text-violet-600 dark:text-violet-400" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment Methods
              </h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-white/60 mb-6 max-w-2xl">
              We are actively setting up our secure payment infrastructure. Once complete, you'll be able to upgrade your plan and manage payment methods directly from here.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-violet-100 px-4 py-2 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
              </span>
              Payments Coming Soon
            </div>
          </div>

          {/* Upgrade Cards Section */}
          <div className="mt-16">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              Available Upgrades
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {pricingPlans.filter(p => p.id !== "free").map(plan => (
                <div key={plan.id} className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-white/[0.02]">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h4>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-white/10 dark:text-white/60">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mb-6">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.priceLabel}</span>
                    <span className="text-sm text-slate-500 dark:text-white/50 pb-1">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.slice(0, 3).map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-white/60">
                        <Check size={16} className="text-emerald-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button disabled className="w-full rounded-xl bg-slate-100 py-3 text-sm font-bold text-slate-400 cursor-not-allowed dark:bg-white/5 dark:text-white/30">
                    Upgrade to {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
