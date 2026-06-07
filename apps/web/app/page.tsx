import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Templates } from "@/components/landing/Templates";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="cosmic-bg min-h-screen overflow-hidden">
      <Navbar />
      <Hero />
      <Features />
      <Templates />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
