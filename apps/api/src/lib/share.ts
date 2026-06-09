import { prisma } from "./prisma.js";

/**
 * Turn a title string into a URL-safe slug.
 * Example: "My AI SaaS Landing Page" → "my-ai-saas-landing-page"
 */
export function createShareSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")  // keep letters, digits, spaces, hyphens
    .trim()
    .replace(/\s+/g, "-")           // spaces → hyphens
    .replace(/-+/g, "-")            // collapse multiple hyphens
    .slice(0, 40)                   // max 40 chars before random suffix
    .replace(/-$/, "");             // strip trailing hyphen
}

/**
 * Generate a random 4-character alphanumeric suffix.
 */
function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Generate a slug from the title and ensure it's unique in the database.
 * Retries up to 10 times with different suffixes.
 */
export async function generateUniqueShareSlug(title: string): Promise<string> {
  const base = createShareSlug(title) || "project";

  for (let attempt = 0; attempt < 10; attempt++) {
    const slug = `${base}-${randomSuffix()}`;

    const existing = await prisma.project.findUnique({
      where: { shareSlug: slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  // Ultra-safe fallback with timestamp
  return `${base}-${Date.now().toString(36)}`;
}
