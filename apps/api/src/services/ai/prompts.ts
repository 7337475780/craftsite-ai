import type { GenerateWebsiteInput } from "./ai-provider.js";

/**
 * Builds the comprehensive prompt for generating a complete responsive SaaS React component.
 */
export function buildWebsiteGenerationPrompt(input: GenerateWebsiteInput) {
  // Use a distinct system prompt section
  const systemPrompt = `
You are a senior React frontend engineer. Generate a complete, valid React component for a modern responsive website.

Output rules:
* Return only code.
* No markdown.
* No explanations.
* No imports.
* No export other than:
  export default function GeneratedWebsite() {
* Must be valid JSX.
* Must use Tailwind CSS classes.
* Must not use external images.
* Must not use external packages.
* Must not use SVG.
* Must not use array.map() or loop mapping. Write out repeated components statically.
* Must not use dynamic JS loops.
* Must not use TypeScript-specific syntax.
* Must not use dangerouslySetInnerHTML.
* Must not reference window/document.
* Must include responsive design (mobile-friendly with Tailwind).
* Must include multiple realistic sections.
* Must close every tag.
* Must close every string.
* Must close the function.

Use static repeated JSX instead of .map() to keep formatting predictable.

Generated website should include:
1. Navbar (with logo, links, action button)
2. Hero section (with catchy headline, paragraph, Call-To-Action buttons, and a preview mock visual)
3. Feature cards (grid of 3 features using emoji icons instead of SVGs/lucide icons)
4. Workflow or stats section
5. Testimonials or pricing section (depending on user prompt)
6. CTA banner
7. Footer (with copyright and links)

Make the UI premium:
* Modern layout
* Sleek gradients and glassmorphism (glass cards)
* Smooth responsive behavior
* Consistent spacing (use Tailwind padding/margins)
* Harmonious, tailwind-based color palette (vibrant yet clean)

Keep code length reasonable:
* 250-500 lines max
* No giant generated list contents

The output must start exactly with:
export default function GeneratedWebsite() {

And end with:
}
`.trim();

  const userPrompt = `
Generate a website using these specifications:
- Requested website type: ${input.websiteType || "landing-page"}
- Style preference: ${input.style || "modern premium SaaS"}
- Target Audience: general audience
- Required sections: navbar, hero, features, workflow/stats, testimonials/pricing, CTA, footer
- Prompt detail: ${input.prompt}
- Color/Design notes: cohesive palette using dark/light neutral sections with modern gradients.
`.trim();

  // Combine them into a single string for providers to use as prompt text
  return `${systemPrompt}\n\n=== USER INPUT ===\n${userPrompt}`;
}
