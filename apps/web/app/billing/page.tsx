"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/app/AppShell";
import { useAuth } from "@/components/providers/AuthProvider";
import { pricingPlans } from "@/lib/pricing";
import { CreditCard, Zap, ArrowRight, History, Crown, CheckCircle2 } from "lucide-react";
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
  const maxCredits = currentPlan.credits;
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
              Manage your subscription, credits, and payment history.
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
                  {user?.plan === "free" ? "Upgrade Plan" : "View Plans"}
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
                  <span>{maxCredits} total plan credits</span>
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

          {/* Payment History Section */}
          <div className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={20} className="text-slate-900 dark:text-white" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Payment History
              </h3>
            </div>
            
            <div className="rounded-[2rem] border border-black/10 bg-white overflow-hidden shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
              {isLoading ? (
                <div className="p-8 text-center text-sm font-medium text-slate-500 dark:text-white/50">
                  Loading payment history...
                </div>
              ) : billingInfo?.latestPayments && billingInfo.latestPayments.length > 0 ? (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {billingInfo.latestPayments.map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between p-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-white capitalize">
                            {payment.plan} Plan Upgrade
                          </p>
                          {payment.status === "paid" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                              <CheckCircle2 size={12} /> Paid
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-white/50 mt-1">
                          {new Date(payment.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-slate-900 dark:text-white">
                          ₹{(payment.amount / 100).toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-white/50 mt-1 uppercase">
                          {payment.currency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm font-medium text-slate-500 dark:text-white/50">
                  No payment history found.
                </div>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
