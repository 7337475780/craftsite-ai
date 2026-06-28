"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Code2,
  Cpu,
  Eye,
  Layers3,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const templates = [
  {
    title: "AI SaaS",
    description:
      "A conversion-focused landing page for AI tools, agents, and software products.",
    badge: "AI Tools",
    color: "from-cyan-400 via-blue-500 to-violet-600",
    icon: Sparkles,
    prompt:
      "A premium AI SaaS landing page with dark design, stats section, features with icons, testimonials carousel, and direct checkout CTA.",
  },
  {
    title: "Portfolio",
    description:
      "A premium personal brand website for developers, designers, and creators.",
    badge: "Personal",
    color: "from-violet-400 via-fuchsia-500 to-blue-500",
    icon: Code2,
    prompt:
      "A sleek developer portfolio showcasing personal details, projects grid with modern hover effects, detailed tech stack badges, clean timeline for work history, and a contact form.",
  },
  {
    title: "Agency",
    description:
      "A bold agency website with services, case studies, proof, and strong CTAs.",
    badge: "Agency",
    color: "from-orange-400 via-pink-500 to-violet-600",
    icon: Layers3,
    prompt:
      "A professional creative agency website with bold headers, services grid, case studies grid with high-resolution placeholder images, and a clean meeting scheduler section.",
  },
  {
    title: "Restaurant",
    description:
      "A modern restaurant website with menu, story, gallery, and booking flow.",
    badge: "Local Biz",
    color: "from-emerald-400 via-cyan-500 to-blue-600",
    icon: Eye,
    prompt:
      "A gourmet restaurant website with an elegant food menu layout, story/history section, chef spotlight, location map details, and a table reservation form.",
  },
  {
    title: "Startup",
    description:
      "A launch-ready startup page with hero, features, social proof, and pricing.",
    badge: "Startup",
    color: "from-yellow-400 via-orange-500 to-pink-500",
    icon: Rocket,
    prompt:
      "A modern tech startup homepage with trusted logos, product feature grid with illustrations, client reviews carousel, and email newsletter sign up CTA.",
  },
  {
    title: "E-commerce",
    description:
      "A clean product storefront layout built for modern online brands.",
    badge: "E-commerce",
    color: "from-fuchsia-400 via-purple-500 to-cyan-500",
    icon: Cpu,
    prompt:
      "A clean ecommerce storefront product listing grid, feature section, customer reviews, detailed FAQs, and checkout options.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 34,
    scale: 0.96,
    filter: "blur(8px)",
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
  },
};

function TemplateCard({
  template,
  index,
  onUse,
}: {
  template: (typeof templates)[number];
  index: number;
  onUse: (prompt: string) => void;
}) {
  const Icon = template.icon;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 180, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 180, damping: 22 });

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.article
      variants={cardVariants}
      transition={{ duration: 0.58, ease: "easeOut" }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onUse(template.prompt)}
      className="group relative cursor-pointer overflow-hidden rounded-[2rem] border border-slate-900/10 bg-white/75 p-4 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition hover:border-violet-500/30 hover:shadow-[0_30px_90px_rgba(79,70,229,0.18)] dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_90px_rgba(0,0,0,0.36)] dark:hover:border-cyan-300/30"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-2xl dark:via-white/10" />
      </div>

      <div className="pointer-events-none absolute inset-x-8 -top-16 h-40 rounded-full bg-violet-500/10 blur-3xl transition duration-500 group-hover:bg-violet-500/20 dark:bg-violet-500/15" />

      {/* Mockup */}
      {/* Mockup */}
      <div className="relative h-64 overflow-hidden rounded-[1.55rem] border border-slate-900/10 bg-white/85 shadow-inner shadow-slate-900/10 dark:border-white/10 dark:bg-slate-950 dark:shadow-inner dark:shadow-black/40">
        <div
          className={`absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-gradient-to-br ${template.color} opacity-35 blur-3xl transition duration-500 group-hover:scale-125 group-hover:opacity-60 dark:opacity-75 dark:group-hover:opacity-100`}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.10),transparent_42%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_38%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.055)_1px,transparent_1px)] dark:opacity-20" />

        <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>

          <span className="rounded-full border border-slate-900/10 bg-white/80 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/10 dark:text-white/75">
            {template.badge}
          </span>
        </div>

        <div className="absolute left-5 right-5 top-16">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-2.5 w-20 rounded-full bg-slate-300 dark:bg-white/25" />
              <div className="mt-3 h-6 w-36 rounded-full bg-slate-900/80 dark:bg-white/80" />
            </div>

            <div
              className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${template.color} text-white shadow-[0_0_30px_rgba(124,58,237,0.35)]`}
            >
              <Icon size={18} />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-5 bottom-5 rounded-[1.25rem] border border-slate-900/10 bg-white/75 p-4 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-black/40 dark:shadow-2xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <span className="h-3 w-28 rounded-full bg-slate-300 dark:bg-white/25" />
            <span
              className={`h-8 w-8 rounded-full bg-gradient-to-br ${template.color}`}
            />
          </div>

          <div className="h-3 w-4/5 rounded-full bg-slate-400/70 dark:bg-white/35" />
          <div className="mt-3 h-3 w-1/2 rounded-full bg-slate-300 dark:bg-white/15" />

          <div className="mt-5 grid grid-cols-3 gap-2">
            <span className="h-12 rounded-xl border border-slate-900/10 bg-slate-100 dark:border-white/10 dark:bg-white/10" />
            <span className="h-12 rounded-xl border border-slate-900/10 bg-slate-100 dark:border-white/10 dark:bg-white/10" />
            <span className="h-12 rounded-xl border border-slate-900/10 bg-slate-100 dark:border-white/10 dark:bg-white/10" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500">
            Template 0{index + 1}
          </p>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-900/10 bg-white/80 text-slate-600 shadow-sm transition group-hover:bg-slate-950 group-hover:text-white dark:border-white/10 dark:bg-white/[0.05] dark:text-white/55 dark:group-hover:bg-white dark:group-hover:text-slate-950">
            <ArrowUpRight size={16} />
          </div>
        </div>

        <h3 className="text-2xl font-black tracking-[-0.03em] text-slate-950 dark:text-white">
          {template.title}
        </h3>

        <p className="mt-3 min-h-[4.5rem] text-sm leading-7 text-slate-600 dark:text-slate-400">
          {template.description}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onUse(template.prompt);
          }}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_18px_42px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_52px_rgba(14,165,233,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 active:scale-[0.98] dark:from-violet-600 dark:via-purple-500 dark:to-blue-500 dark:shadow-[0_0_35px_rgba(124,58,237,0.35)] dark:hover:shadow-[0_0_45px_rgba(59,130,246,0.4)] dark:focus-visible:ring-cyan-300/70"
        >
          Use template
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.article>
  );
}

export function Templates() {
  const router = useRouter();

  const handleUseTemplate = (prompt: string) => {
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <section
      id="templates"
      className="relative isolate overflow-hidden bg-transparent px-4 py-16 text-slate-950 dark:text-white sm:px-6 sm:py-20 lg:px-8 lg:py-28"
    >
      {/* Decorative glows only — no separate section background */}
      <div className="pointer-events-none absolute left-0 top-24 -z-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px] dark:bg-cyan-400/15" />
      <div className="pointer-events-none absolute bottom-10 right-0 -z-10 h-[28rem] w-[28rem] rounded-full bg-violet-500/10 blur-[120px] dark:bg-violet-500/20" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mb-12 flex flex-col justify-between gap-8 sm:mb-16 lg:flex-row lg:items-end"
        >
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/75 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-violet-700 shadow-xl shadow-violet-500/10 backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06] dark:text-cyan-200 dark:shadow-violet-950/30">
              <Sparkles size={14} />
              Templates
            </div>

            <h2 className="text-balance text-3xl font-black tracking-[-0.045em] text-slate-950 dark:text-white sm:text-4xl md:text-5xl lg:text-6xl">
              Start with beautiful{" "}
              <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent dark:from-cyan-300 dark:via-blue-400 dark:to-violet-400">
                AI-ready
              </span>{" "}
              templates
            </h2>
          </div>

          <p className="max-w-md text-pretty text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
            Pick a category, customize the prompt, and let CraftSite generate
            the first version instantly with clean responsive sections.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6"
        >
          {templates.map((template, index) => (
            <TemplateCard
              key={template.title}
              template={template}
              index={index}
              onUse={handleUseTemplate}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-slate-900/10 bg-white/70 p-5 text-center shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-cyan-200">
            <Wand2 size={20} />
          </div>

          <p className="text-sm font-semibold leading-7 text-slate-600 dark:text-slate-300">
            Every template is just a starting point. CraftSite rewrites the
            prompt into a unique, responsive website with clean React and
            Tailwind output.
          </p>
        </motion.div>
      </div>
    </section>
  );
}