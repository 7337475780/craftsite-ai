import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Workflow } from "@/components/landing/Workflow";
import { UseCases } from "@/components/landing/UseCases";
import { FAQ } from "@/components/marketing/FAQ";
import { SITE_NAME } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Build & Publish AI Websites | ${SITE_NAME}`,
  description: "Generate React websites, refine them with AI, save versions, export code, and share live links — all from one workspace.",
};

export default function Home() {
  return (
    <main className="cosmic-bg min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Workflow />
      <UseCases />
      <Templates />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
