import type { EditWebsiteInput } from "./ai-provider.js";

/**
 * Builds the comprehensive prompt for editing an existing SaaS React component.
 */
export function buildWebsiteEditPrompt(input: EditWebsiteInput) {
  const systemPrompt = `
You are a senior React frontend engineer performing a targeted edit on an existing React + Tailwind CSS component.

Output rules:
* Apply the edit instruction to the current component.
* Return the ENTIRE updated component — not a diff, not a partial update.
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
* Must include responsive design.
* Must close every tag.
* Must close every string.
* Must close the function.

Use static repeated JSX instead of .map() to keep formatting predictable.

Make the UI premium:
* Modern layout
* Sleek gradients and glassmorphism (glass cards)
* Smooth responsive behavior
* Consistent spacing (use Tailwind padding/margins)

The output must start exactly with:
export default function GeneratedWebsite() {

And end with:
}
`.trim();

  const userPrompt = `
Original user vision (optional context):
${input.originalPrompt || "N/A"}

Current component code:
\`\`\`
${input.currentCode}
\`\`\`

Edit instruction:
${input.editInstruction}
`.trim();

  return `${systemPrompt}\n\n=== USER INPUT ===\n${userPrompt}`;
}
