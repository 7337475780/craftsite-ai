import type { GenerateWebsiteInput } from "./ai-provider.js";

/**
 * Builds the prompt for generating a premium, responsive React component.
 * Kept concise to avoid exceeding free-tier model token limits.
 */
export function buildWebsiteGenerationPrompt(input: GenerateWebsiteInput) {
  const systemPrompt = `
You are a senior React + Tailwind CSS engineer building premium, production-ready websites.

== OUTPUT FORMAT ==
Return ONLY valid JSX — no markdown, no code fences, no imports, no TypeScript types, no explanations.
Start EXACTLY with: export default function GeneratedWebsite() {
End EXACTLY with the closing brace: }
Target 180–320 lines. Complete output is more important than length.

== RULES ==
- No imports, no array.map(), no dangerouslySetInnerHTML, no window/document references.
- No external images, no SVG elements, no external packages.
- Root element: overflow-x-hidden
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Section spacing: py-16 sm:py-20 lg:py-28
- Grids always include mobile fallback: grid-cols-1 sm:grid-cols-2 lg:grid-cols-3

== DESIGN SYSTEM ==
Background: bg-slate-950 or bg-zinc-950
Cards: bg-white/[0.04] border border-white/10 backdrop-blur-sm rounded-2xl
Accent: violet-500/violet-600 (primary), cyan-400/blue-500 (secondary)
Text: text-white (primary), text-slate-300 (secondary)
Gradient headline: bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent
Primary button: rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5
Ghost button: rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3 font-semibold text-white backdrop-blur transition hover:bg-white/10

== REQUIRED SECTIONS (in order) ==
1. Navbar — sticky top-0 z-50, bg-slate-950/80 backdrop-blur border-b border-white/[0.06], logo left + CTA right
2. Hero — large gradient headline, subtext, 2 CTA buttons, div-based UI mockup visual
3. Stats strip — 3–4 metrics (numbers + labels) in a flex row
4. Features grid — 6 cards with colored icon div, title, description; grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
5. Mockup — realistic browser frame or dashboard built from divs/spans (sidebar, metric cards, bar chart as colored divs)
6. Pricing — 3 tiers (Free/Pro/Enterprise), highlight recommended with gradient border, feature lists with ✓
7. Testimonials — 3 cards with quote, name, title, stars (★★★★★), avatar as div with initials
8. CTA — gradient banner with headline and primary button
9. Footer — logo, 3 link columns, copyright

== FORBIDDEN ==
- No Lorem ipsum, "SaaSify", "John Doe", "TechCorp", flat gray backgrounds, missing hover states
- No fixed widths without max-w-full, no emoji as primary visual
- Copyright year: 2025
`.trim();

  const userPrompt = `
Build a complete premium website:
- Type: ${input.websiteType || "landing-page"}
- Style: ${input.style || "premium dark SaaS"}
- Prompt: ${input.prompt}

Return ONLY the component. Start with: export default function GeneratedWebsite() {
`.trim();

  return `${systemPrompt}\n\n=== USER SPECIFICATION ===\n${userPrompt}`;
}
