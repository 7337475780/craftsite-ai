/**
 * Builds a repair prompt for incomplete or truncated React component code.
 * Used when a provider returns code that fails syntax/structural validation.
 */
export function buildIncompleteRepairPrompt(brokenCode: string): string {
  return `You returned incomplete or invalid React code. Generate a COMPLETE, production-ready React component now.

STRICT RULES:
* Return ONLY the full component code — nothing else.
* Start EXACTLY with: export default function GeneratedWebsite() {
* End EXACTLY with: }
* No markdown. No code fences. No imports. No explanations.
* No placeholder UI. No error pages. No protected preview UI.
* Must include: navbar, hero, features, pricing/benefits, CTA, footer.
* Must be mobile-first responsive using Tailwind CSS.
* Must use dark premium design (slate-950 bg, violet/cyan accents).
* No array.map(). No external images. No SVG.

Your previous incomplete output for reference:
${brokenCode.slice(0, 500)}

Now return the COMPLETE component:
export default function GeneratedWebsite() {`;
}

/**
 * Builds a repair prompt for code that is syntactically valid but has poor UI quality.
 * Used when quality score falls below threshold.
 */
export function buildUIRepairPrompt(validCode: string, qualityIssues: string[]): string {
  const issueList = qualityIssues.length > 0
    ? qualityIssues.map((i) => `  - ${i}`).join("\n")
    : "  - General UI quality improvements needed";

  return `The React component you generated is valid but the UI quality is not professional enough.

Quality issues detected:
${issueList}

Rewrite it as a PREMIUM, FULLY RESPONSIVE, SENIOR-LEVEL landing page.

REQUIREMENTS:
* Dark glassmorphism design: bg-slate-950, glass cards (bg-white/[0.04] backdrop-blur border-white/10)
* Gradient headline: bg-gradient-to-r from-violet-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent
* Consistent button system:
    Primary: rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 font-semibold text-white shadow-lg hover:-translate-y-0.5 hover:shadow-xl
    Secondary: rounded-2xl border border-white/15 bg-white/[0.06] px-6 py-3 font-semibold text-white hover:bg-white/10
* Mobile-first responsive: flex-col lg:flex-row, grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
* Max-width containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
* Responsive text: text-4xl sm:text-5xl lg:text-7xl
* Section padding: py-16 sm:py-20 lg:py-28
* Realistic div-based browser/dashboard mockup in the hero
* All sections: navbar, hero, features, stats, pricing, testimonials, CTA, footer
* No generic placeholder content — match the original prompt's domain
* overflow-x-hidden on root element

STRICT OUTPUT RULES:
* Return ONLY code starting with: export default function GeneratedWebsite() {
* No markdown. No imports. No explanations. No placeholder UI.
* No array.map(). No external images. No SVG.

Original code to improve:
${validCode.slice(0, 1200)}

Now return the COMPLETE improved component:
export default function GeneratedWebsite() {`;
}
