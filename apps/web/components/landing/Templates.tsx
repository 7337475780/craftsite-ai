"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const templates = [
  {
    title: "AI SaaS",
    description:
      "A conversion-focused landing page for AI tools and software products.",
    badge: "AI Tools",
    color: "from-cyan-400 via-blue-500 to-violet-600",
    prompt: "A premium AI SaaS landing page with dark design, stats section, features with icons, testimonials carousel, and direct checkout CTA.",
  },
  {
    title: "Portfolio",
    description:
      "A premium personal brand website for developers, designers, and creators.",
    badge: "Personal",
    color: "from-pink-400 via-violet-500 to-blue-500",
    prompt: "A sleek developer portfolio showcasing personal details, projects grid with modern hover effects, detailed tech stack badges, clean timeline for work history, and a contact form.",
  },
  {
    title: "Agency",
    description:
      "A bold agency website with services, case studies, and strong CTAs.",
    badge: "Agency",
    color: "from-orange-400 via-pink-500 to-violet-600",
    prompt: "A professional creative agency website with bold headers, services grid, case studies grid with high-resolution placeholder images, and a clean meeting scheduler section.",
  },
  {
    title: "Restaurant",
    description:
      "A modern restaurant website with menu, story, gallery, and booking flow.",
    badge: "Local Biz",
    color: "from-emerald-400 via-cyan-500 to-blue-600",
    prompt: "A gourmet restaurant website with an elegant food menu layout, story/history section, chef spotlight, location map details, and a table reservation form.",
  },
  {
    title: "Startup",
    description:
      "A launch-ready startup page with hero, features, social proof, and pricing.",
    badge: "Startup",
    color: "from-yellow-400 via-orange-500 to-pink-500",
    prompt: "A modern tech startup homepage with trusted logos, product feature grid with illustrations, client reviews carousel, and email newsletter sign up CTA.",
  },
  {
    title: "E-commerce",
    description:
      "A clean product storefront layout built for modern online brands.",
    badge: "E-commerce",
    color: "from-fuchsia-400 via-purple-500 to-cyan-500",
    prompt: "A clean ecommerce storefront product listing grid, feature section, customer reviews, detailed FAQs, and checkout options.",
  },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.96,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

export function Templates() {
  const router = useRouter();

  const handleUseTemplate = (prompt: string) => {
    router.push(`/generate?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <section
      id="templates"
      className="relative overflow-hidden px-5 py-28 md:px-8"
    >
      <div className="pointer-events-none absolute left-0 top-20 -z-10 h-[340px] w-[340px] rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />
      <div className="pointer-events-none absolute bottom-10 right-0 -z-10 h-[360px] w-[360px] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.65 }}
          className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-cyan-700 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] dark:text-cyan-300">
              <Sparkles size={14} />
              Templates
            </div>

            <h2 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
              Start with beautiful{" "}
              <span className="gradient-text">AI-ready</span> templates
            </h2>
          </div>

          <p className="max-w-md text-base leading-8 text-slate-600 dark:text-white/60">
            Pick a category, customize the prompt, and let CraftSite generate
            the first version instantly with clean responsive sections.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-120px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {templates.map((template, index) => (
            <motion.div
              key={template.title}
              variants={cardVariants}
              transition={{ duration: 0.55, ease: "easeOut" }}
              whileHover={{
                y: -8,
                scale: 1.015,
              }}
              onClick={() => handleUseTemplate(template.prompt)}
              className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 p-4 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)] cursor-pointer"
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                <div className="absolute -left-24 top-0 h-full w-40 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-2xl dark:via-white/10" />
              </div>

              <div className="relative h-60 overflow-hidden rounded-[1.5rem] border border-black/10 bg-slate-950 dark:border-white/10">
                <div
                  className={`absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full bg-gradient-to-br ${template.color} opacity-80 blur-2xl`}
                />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%)]" />

                <div className="absolute left-5 right-5 top-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 backdrop-blur-xl">
                    {template.badge}
                  </span>
                </div>

                <div className="absolute inset-x-5 bottom-5 rounded-[1.25rem] border border-white/10 bg-black/35 p-4 backdrop-blur-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="h-3 w-24 rounded-full bg-white/25" />
                    <span
                      className={`h-8 w-8 rounded-full bg-gradient-to-br ${template.color}`}
                    />
                  </div>

                  <div className="h-3 w-4/5 rounded-full bg-white/30" />
                  <div className="mt-3 h-3 w-1/2 rounded-full bg-white/15" />

                  <div className="mt-5 grid grid-cols-3 gap-2">
                    <span className="h-12 rounded-xl border border-white/10 bg-white/10" />
                    <span className="h-12 rounded-xl border border-white/10 bg-white/10" />
                    <span className="h-12 rounded-xl border border-white/10 bg-white/10" />
                  </div>
                </div>
              </div>

              <div className="relative z-10 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-white/40">
                    Template 0{index + 1}
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-slate-100 text-slate-600 transition group-hover:bg-slate-950 group-hover:text-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50 dark:group-hover:bg-white dark:group-hover:text-slate-950">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  {template.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/55">
                  {template.description}
                </p>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(template.prompt);
                  }}
                  className="mt-6 w-full rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(124,58,237,0.4)] dark:border-white/10 dark:from-white/10 dark:to-white/10 dark:hover:from-white dark:hover:to-white dark:hover:text-slate-950 cursor-pointer"
                >
                  Use template
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
