export type AIProviderName =
  | "openrouter"
  | "gemini"
  | "groq"
  | "together"
  | "mistral"
  | "mock";

export type AIMode =
  | "balanced"
  | "fast"
  | "quality"
  | "free"
  | "code";

export type AIProviderErrorType =
  | "missing_api_key"
  | "invalid_api_key"
  | "rate_limited"
  | "quota_exceeded"
  | "model_unavailable"
  | "timeout"
  | "network_error"
  | "invalid_response"
  | "invalid_code"
  | "truncated_output"
  | "unknown";

export class AIProviderError extends Error {
  constructor(
    message: string,
    public provider: AIProviderName,
    public model: string,
    public errorType: AIProviderErrorType,
    public statusCode?: number,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export type GenerateWebsiteInput = {
  prompt: string;
  style?: string;
  websiteType?: string;
};

export type EditWebsiteInput = {
  currentCode: string;
  editInstruction: string;
  originalPrompt?: string;
};

export type AIProviderAttempt = {
  provider: AIProviderName;
  model: string;
  success: boolean;
  durationMs?: number;
  errorType?: string;
  errorMessage?: string;
};

export type GenerateWebsiteOutput = {
  generatedCode: string;
  provider: AIProviderName;
  model?: string;
  isFallback: boolean;
  providerAttempts?: AIProviderAttempt[];
};

export interface AIProvider {
  name: AIProviderName;
  isConfigured(): boolean;
  getModels(): string[];
  generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput>;
  editWebsite(input: EditWebsiteInput): Promise<GenerateWebsiteOutput>;
  repairWebsite?(brokenCode: string, isEdit: boolean): Promise<GenerateWebsiteOutput>;
}
