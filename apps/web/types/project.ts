// AI Provider names used across the app
export type AIProviderName = "openrouter" | "gemini" | "mock";

// A project saved by the user to localStorage
export type SavedProject = {
  id: string;
  title: string;
  prompt: string;
  generatedCode: string;
  provider: AIProviderName;
  isFallback: boolean;
  style: string;
  websiteType: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};
