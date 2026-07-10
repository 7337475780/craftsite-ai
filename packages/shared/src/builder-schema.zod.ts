import { z } from "zod";

export const BuilderSectionTypeSchema = z.enum([
  "navbar",
  "hero",
  "logo-cloud",
  "stats",
  "features",
  "split-feature",
  "steps",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "contact",
  "footer"
]);

export const BuilderThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  accentColor: z.string(),
  backgroundColor: z.string(),
  textColor: z.string(),
  mutedTextColor: z.string(),
  fontFamily: z.string(),
  headingFontFamily: z.string().optional(),
  borderRadius: z.enum(["none", "sm", "md", "lg", "xl"]),
  containerWidth: z.enum(["sm", "md", "lg", "xl", "full"]),
  spacingScale: z.enum(["compact", "normal", "spacious"])
});

export const SectionStylesSchema = z.object({
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  paddingTop: z.number().optional(),
  paddingBottom: z.number().optional(),
  maxWidth: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).optional()
});

export const BuilderSectionSchema = z.object({
  id: z.string(),
  type: BuilderSectionTypeSchema,
  visible: z.boolean(),
  order: z.number(),
  props: z.record(z.any()),
  styles: SectionStylesSchema.optional()
});

export const BuilderProjectSchema = z.object({
  version: z.number(),
  theme: BuilderThemeSchema,
  sections: z.array(BuilderSectionSchema)
});
