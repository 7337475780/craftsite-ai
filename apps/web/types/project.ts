// AI Provider names used across the app
export type AIProviderName = "openrouter" | "gemini" | "mock";

// A project saved by the user
export type SavedProject = {
  id: string;
  title: string;
  prompt: string;
  generatedCode: string;
  provider: AIProviderName;
  isFallback: boolean;
  style: string;
  websiteType: string;
  isPublished?: boolean;
  shareSlug?: string | null;
  publishedAt?: string | null;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

// A version snapshot of a project's generated code
export type ProjectVersion = {
  id: string;
  projectId: string;
  userId: string;
  versionNumber: number;
  title?: string;
  editPrompt?: string;
  createdAt: string; // ISO date string
};

// Public project data returned by GET /api/public/projects/:shareSlug
export type PublicProject = {
  id: string;
  title: string;
  prompt: string;
  generatedCode: string;
  provider: AIProviderName;
  isFallback: boolean;
  publishedAt: string | null;
  createdAt: string;
};
