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
};
