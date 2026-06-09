export type PlanId = "free" | "pro" | "team";

export interface Plan {
  id: PlanId;
  amount: number; // in paise
  displayAmount: number; // in INR
  credits: number;
}

export const plans: Record<PlanId, Plan> = {
  free: {
    id: "free",
    amount: 0,
    displayAmount: 0,
    credits: 20,
  },
  pro: {
    id: "pro",
    amount: 49900,
    displayAmount: 499,
    credits: 500,
  },
  team: {
    id: "team",
    amount: 149900,
    displayAmount: 1499,
    credits: 2000,
  },
};

export function getPlan(id: string): Plan | undefined {
  return plans[id as PlanId];
}
