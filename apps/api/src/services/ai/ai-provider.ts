export type GenerateWebsiteInput = {
  prompt: string;
  style?: string;
  websiteType?: string;
};

export type GenerateWebsiteOutput = {
  generatedCode: string;
  provider: "openrouter" | "gemini" | "mock";
  isFallback: boolean;
};

export interface AIProvider {
  generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput>;
}
