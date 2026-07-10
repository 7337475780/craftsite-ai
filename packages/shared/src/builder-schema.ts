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

export type BuilderComponent = {
  id: string;
  componentType: string;
  props: Record<string, any>;
};

export type BuilderSection = {
  id: string;
  type: BuilderSectionType;
  visible?: boolean;
  order: number;
  props?: Record<string, any>;
  components: BuilderComponent[];
  styles?: SectionStyles;
};

export type BuilderNode = {
  id: string;
  type: "section" | "component" | "element";
  name: string;
  props: Record<string, any>;
  children: BuilderNode[];
  parentId: string | null;
  isGlobal?: boolean;
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
  isHomepage: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  layoutId?: string;
  sections: BuilderSection[];
  nodes?: BuilderNode[];
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
