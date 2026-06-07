import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="px-6 py-28">
      <div className="glass-card neon-card mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-10 text-center md:p-16">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-[0_0_45px_rgba(139,92,246,0.45)]">
          <Sparkles />
        </div>

        <h2 className="mx-auto max-w-3xl text-4xl font-black md:text-6xl">
          Ready to craft your next website?
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-white/55">
          Start from a single prompt and turn your idea into a polished website
          in seconds.
        </p>

        <div className="mt-9 flex justify-center">
          <Button className="px-7">
            Start Building Now
            <ArrowRight size={17} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
