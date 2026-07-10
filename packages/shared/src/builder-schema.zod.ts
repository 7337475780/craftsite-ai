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

export type BuilderMenuItemZodType = z.ZodType<any>;
export const BuilderMenuItemSchema: BuilderMenuItemZodType = z.lazy(() => 
  z.object({
    id: z.string(),
    label: z.string(),
    url: z.string().optional(),
    isExternal: z.boolean(),
    children: z.array(BuilderMenuItemSchema).optional()
  })
);

export const BuilderNavigationSchema = z.object({
  id: z.string(),
  name: z.string(),
  items: z.array(BuilderMenuItemSchema)
});

export const BuilderPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  isHome: z.boolean(),
  status: z.enum(["draft", "published"]),
  seoMetadata: z.record(z.any()).optional(),
  layoutId: z.string().optional(),
  sections: z.array(BuilderSectionSchema),
  order: z.number()
});

export const BuilderLayoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["default", "landing", "blog"]),
  sections: z.array(BuilderSectionSchema)
});

export const BuilderCollectionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  status: z.enum(["draft", "published"]),
  featuredImage: z.string().optional(),
  richText: z.string().optional(),
  customData: z.record(z.any()).optional()
});

export const BuilderCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  schema: z.record(z.any()),
  items: z.array(BuilderCollectionItemSchema).optional()
});

export const BuilderProjectSchema = z.object({
  version: z.number(),
  theme: BuilderThemeSchema,
  sections: z.array(BuilderSectionSchema),
  pages: z.array(BuilderPageSchema).optional(),
  layouts: z.array(BuilderLayoutSchema).optional(),
  navigation: z.array(BuilderNavigationSchema).optional(),
  collections: z.array(BuilderCollectionSchema).optional()
});
