export type BuilderSectionType = 
  | "navbar"
  | "hero"
  | "logo-cloud"
  | "stats"
  | "features"
  | "split-feature"
  | "steps"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "contact"
  | "footer";

export type BuilderTheme = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  mutedTextColor: string;
  fontFamily: string;
  headingFontFamily?: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  containerWidth: "sm" | "md" | "lg" | "xl" | "full";
  spacingScale: "compact" | "normal" | "spacious";
};

export type SectionStyles = {
  backgroundColor?: string;
  textColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  maxWidth?: string;
  alignment?: "left" | "center" | "right";
};

export type BuilderSection = {
  id: string;
  type: BuilderSectionType;
  visible: boolean;
  order: number;
  props: Record<string, any>;
  styles?: SectionStyles;
};

export type BuilderProject = {
  version: number;
  theme: BuilderTheme;
  sections: BuilderSection[];
  // Phase 27: Multi-Page support
  pages?: BuilderPage[];
  layouts?: BuilderLayout[];
  navigation?: BuilderNavigation[];
  collections?: BuilderCollection[];
};

export type BuilderPage = {
  id: string;
  title: string;
  slug: string;
  isHome: boolean;
  status: "draft" | "published";
  seoMetadata?: Record<string, any>;
  layoutId?: string;
  sections: BuilderSection[];
  order: number;
};

export type BuilderLayout = {
  id: string;
  name: string;
  type: "default" | "landing" | "blog";
  sections: BuilderSection[];
};

export type BuilderMenuItem = {
  id: string;
  label: string;
  url?: string;
  isExternal: boolean;
  children?: BuilderMenuItem[];
};

export type BuilderNavigation = {
  id: string;
  name: string;
  items: BuilderMenuItem[];
};

export type BuilderCollection = {
  id: string;
  name: string;
  slug: string;
  schema: Record<string, any>;
  items?: BuilderCollectionItem[];
};

export type BuilderCollectionItem = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  featuredImage?: string;
  richText?: string;
  customData?: Record<string, any>;
};
