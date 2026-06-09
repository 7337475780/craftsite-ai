"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AppShell } from "@/components/app/AppShell";
import { apiGet } from "@/lib/api-client";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft, CreditCard, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await apiGet("/api/admin/payments");
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch payments", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayments();
  }, []);

  return (
    <AdminGuard>
      <AppShell>
        <div className="mx-auto max-w-7xl px-2 pb-20 pt-8">
          <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 dark:text-white/50 dark:hover:text-white transition">
            <ArrowLeft size={16} />
            Back to Overview
          </Link>

          <div className="mb-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                Administration
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white md:text-4xl flex items-center gap-3">
                <CreditCard size={32} />
                Payments & Revenue
              </h1>
            </div>
          </div>

          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04]">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={32} className="animate-spin text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : data?.payments?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-white/60">
                  <thead className="border-b border-black/5 text-xs uppercase text-slate-900 dark:border-white/5 dark:text-white">
                    <tr>
                      <th className="px-6 py-4 font-black">User</th>
                      <th className="px-6 py-4 font-black">Plan</th>
                      <th className="px-6 py-4 font-black">Amount</th>
                      <th className="px-6 py-4 font-black">Status</th>
                      <th className="px-6 py-4 font-black">Date</th>
                      <th className="px-6 py-4 font-black text-right">Order ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {data.payments.map((p: any) => (
                      <tr key={p.id} className="transition hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{p.user?.name || "No Name"}</p>
                          <p className="text-xs">{p.user?.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700 dark:bg-white/10 dark:text-white/70">
                            {p.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900 dark:text-white">
                            ₹{(p.amount / 100).toFixed(2)}
                          </p>
                          <p className="text-[10px] uppercase text-slate-500">{p.currency}</p>
                        </td>
                        <td className="px-6 py-4">
                          {p.status === "paid" ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                              <CheckCircle2 size={12} /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              <Clock size={12} /> Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(p.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                          })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <code className="text-xs bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-black/5 dark:border-white/5 text-slate-500 dark:text-white/40">
                            {p.razorpayOrderId}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-sm font-medium text-slate-500 dark:text-white/50">
                No payments recorded yet.
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </AdminGuard>
  );
}
