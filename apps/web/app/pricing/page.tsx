import { AppShell } from "@/components/app/AppShell";
import { Pricing } from "@/components/landing/Pricing";

import { SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of all sizes.",
};

export default function PricingPage() {
  return (
    <AppShell>
      <Pricing />
    </AppShell>
  );
}
