"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Crown,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { pricingPlans } from "@/lib/pricing";
import { useAuth } from "@/components/providers/AuthProvider";
import { trackClientEvent } from "@/lib/analytics-client";
import { apiPost } from "@/lib/api-client";
import { openRazorpayCheckout } from "@/lib/razorpay";

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

function getPlanIcon(planId: string) {
  if (planId === "free") return Sparkles;
  if (planId === "pro") return Zap;
  return Crown;
}

export function Pricing() {
  const { user, refetchMe } = useAuth();
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      router.push("/sign-up");
      return;
    }

    if (planId === "free" || user.plan === planId) {
      router.push("/dashboard");
      return;
    }

    setLoadingPlan(planId);
    setErrorMessage("");
    setSuccessMessage("");

    trackClientEvent("checkout_started", { plan: planId });

    try {
      const orderRes = await apiPost("/api/billing/create-order", {
        plan: planId,
      });

      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || "Failed to create order");
      }

      const { orderId, amount, currency, razorpayKeyId } = orderRes.data;

      await openRazorpayCheckout({
        key: razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount,
        currency,
        name: "CraftSite AI",
        description: `Upgrade to ${planId} plan`,
        order_id: orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#7c3aed",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await apiPost("/api/billing/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: planId,
            });

            if (!verifyRes.success) {
              throw new Error(
                verifyRes.message || "Payment verification failed"
              );
            }

            setSuccessMessage(
              "Upgrade successful! Credits have been added to your account."
            );
            trackClientEvent("payment_success", { plan: planId });
            await refetchMe();
          } catch (error: any) {
            console.error("Verification error:", error);
            setErrorMessage(
              error.message ||
              "Payment verification failed. Please contact support."
            );
            trackClientEvent("payment_failed", {
              reason: "verification_failed",
            });
          } finally {
            setLoadingPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPlan(null);
            trackClientEvent("payment_failed", {
              reason: "dismissed_by_user",
            });
          },
        },
      });
    } catch (error: any) {
      console.error("Checkout error:", error);
      setErrorMessage(error.message || "Something went wrong.");
      setLoadingPlan(null);
    }
  };

  return (
    <section
      id="pricing"
      className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Decorative glows only — no separate section background */}
      <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />
      <div className="pointer-events-none absolute bottom-10 right-0 -z-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-400/15" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mx-auto mb-12 max-w-3xl text-center sm:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200 dark:shadow-violet-950/30">
            <Crown size={14} />
            Pricing
          </div>

          <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Simple plans for every{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
              builder
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Start free, then upgrade when you need more AI generations,
            premium exports, advanced project workflows, and team-ready tools.
          </p>
        </motion.div>

        {(successMessage || errorMessage) && (
          <div className="mx-auto mb-8 max-w-3xl space-y-3 text-center">
            {successMessage && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur-xl dark:text-emerald-300">
                🎉 {successMessage}
              </div>
            )}

            {errorMessage && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-bold text-red-700 shadow-sm backdrop-blur-xl dark:text-red-300">
                ⚠️ {errorMessage}
              </div>
            )}
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-5 lg:grid-cols-3 lg:gap-6"
        >
          {pricingPlans.map((plan) => {
            const Icon = getPlanIcon(plan.id);
            const isCurrentPlan = user?.plan === plan.id;
            const isFree = plan.id === "free";
            const isLoading = loadingPlan === plan.id;

            let ctaText = plan.cta;

            if (isCurrentPlan) {
              ctaText = "Current Plan";
            } else if (isLoading) {
              ctaText = "Processing...";
            } else if (!user && !isFree) {
              ctaText = "Sign up to upgrade";
            }

            return (
              <motion.article
                key={plan.name}
                variants={cardVariants}
                transition={{ duration: 0.55, ease: "easeOut" }}
                whileHover={{ y: -8, scale: 1.015 }}
                className={`group relative overflow-hidden rounded-[2rem] border p-6 backdrop-blur-2xl transition sm:p-8 ${plan.popular
                  ? "border-violet-500/40 bg-slate-950 text-white shadow-[0_30px_100px_rgba(79,70,229,0.24)] dark:border-violet-400/50 dark:bg-white/[0.06] dark:shadow-[0_30px_110px_rgba(124,58,237,0.24)]"
                  : "border-slate-900/10 bg-white/75 text-slate-950 shadow-[0_22px_70px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:shadow-[0_24px_90px_rgba(0,0,0,0.36)]"
                  }`}
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                  <div className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/35 to-transparent blur-2xl dark:via-white/10" />
                </div>

                {plan.popular && (
                  <>
                    <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-3 py-1 text-xs font-black text-white shadow-[0_0_32px_rgba(124,58,237,0.45)]">
                      Popular
                    </div>
                    <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-violet-500/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl" />
                  </>
                )}

                <div className="relative z-10 flex h-full flex-col">
                  <div
                    className={`mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border ${plan.popular
                      ? "border-white/10 bg-white text-cyan-200 shadow-[0_0_35px_rgba(56,189,248,0.18)]"
                      : "border-violet-500/20 bg-violet-500/10 text-violet-700 shadow-[0_18px_40px_rgba(124,58,237,0.12)] dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-cyan-200"
                      }`}
                  >
                    <Icon size={24} />
                  </div>

                  <h3 className="text-2xl font-black tracking-[-0.02em]">
                    {plan.name}
                  </h3>

                  <p
                    className={`mt-3 min-h-[5.25rem] text-sm leading-7 sm:text-base ${plan.popular
                      ? "text-white/70"
                      : "text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    {plan.description}
                  </p>

                  <div className="mt-8 flex items-end gap-2">
                    <p className="text-4xl font-black tracking-tight sm:text-5xl">
                      {plan.priceLabel}
                    </p>
                    <p
                      className={`pb-2 text-sm ${plan.popular
                        ? "text-white/50"
                        : "text-slate-500 dark:text-slate-500"
                        }`}
                    >
                      /{plan.period}
                    </p>
                  </div>

                  {!user ? (
                    <Link
                      href="/sign-up"
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] ${plan.popular
                        ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_36px_rgba(124,58,237,0.42)] hover:shadow-[0_0_50px_rgba(59,130,246,0.45)] focus-visible:ring-cyan-300/70"
                        : "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)] hover:shadow-[0_22px_52px_rgba(14,165,233,0.22)] focus-visible:ring-violet-500/60"
                        }`}
                    >
                      {ctaText}
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <button
                      disabled={
                        isCurrentPlan || isLoading || loadingPlan !== null
                      }
                      onClick={() => handleUpgrade(plan.id)}
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-extrabold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 ${isCurrentPlan
                        ? "border border-violet-500/30 bg-violet-500/10 text-violet-700 dark:border-violet-400/25 dark:bg-violet-500/10 dark:text-violet-300"
                        : plan.popular
                          ? "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-[0_0_36px_rgba(124,58,237,0.42)] hover:shadow-[0_0_50px_rgba(59,130,246,0.45)] focus-visible:ring-cyan-300/70"
                          : "bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)] hover:shadow-[0_22px_52px_rgba(14,165,233,0.22)] focus-visible:ring-violet-500/60"
                        }`}
                    >
                      {isLoading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isCurrentPlan ? (
                        <ShieldCheck size={16} />
                      ) : (
                        <ArrowRight size={16} />
                      )}
                      {ctaText}
                    </button>
                  )}

                  <div
                    className={`my-8 h-px w-full ${plan.popular
                      ? "bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      : "bg-gradient-to-r from-transparent via-slate-900/10 to-transparent dark:via-white/10"
                      }`}
                  />

                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${plan.popular
                            ? "bg-emerald-400/15 text-emerald-300"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                        >
                          <Check size={15} />
                        </div>

                        <span
                          className={`text-sm leading-6 ${plan.popular
                            ? "text-white/75"
                            : "text-slate-600 dark:text-slate-400"
                            }`}
                        >
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white/70 p-5 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
            Need a custom plan for a team or startup?
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center justify-center gap-2 text-sm font-black text-violet-700 transition hover:text-violet-900 dark:text-cyan-200 dark:hover:text-cyan-100"
          >
            Talk to us
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}