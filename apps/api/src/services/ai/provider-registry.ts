import { AIProvider, AIProviderName, AIMode } from "./ai-provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import { TogetherProvider } from "./together.provider.js";
import { MistralProvider } from "./mistral.provider.js";
import { MockProvider } from "./mock.provider.js";

const MODE_CHAINS: Record<AIMode, AIProviderName[]> = {
  balanced: ["openrouter", "gemini", "groq", "together", "mistral", "mock"],
  fast: ["groq", "gemini", "openrouter", "mock"],
  quality: ["gemini", "openrouter", "mistral", "together", "mock"],
  free: ["openrouter", "gemini", "mock"],
  code: ["openrouter", "together", "gemini", "mistral", "mock"],
};

export function getProvider(name: AIProviderName, selectedModel?: string): AIProvider {
  switch (name) {
    case "openrouter":
      return new OpenRouterProvider(selectedModel);
    case "gemini":
      return new GeminiProvider(selectedModel);
    case "groq":
      return new GroqProvider(selectedModel);
    case "together":
      return new TogetherProvider(selectedModel);
    case "mistral":
      return new MistralProvider(selectedModel);
    case "mock":
      return new MockProvider();
    default:
      throw new Error(`Unknown provider name: ${name}`);
  }
}

export function getConfiguredProviders(): AIProviderName[] {
  const providers: AIProviderName[] = ["openrouter", "gemini", "groq", "together", "mistral", "mock"];
  return providers.filter((name) => {
    try {
      return getProvider(name).isConfigured();
    } catch {
      return false;
    }
  });
}

export function getProviderChain(mode: AIMode): AIProviderName[] {
  return MODE_CHAINS[mode] || MODE_CHAINS.balanced;
}

export function getModelChainForProvider(providerName: AIProviderName): string[] {
  try {
    const provider = getProvider(providerName);
    return provider.getModels();
  } catch {
    return [];
  }
}

export interface AIConfigSummary {
  defaultProvider: string;
  defaultMode: string;
  allowMockFallback: boolean;
  requestTimeoutMs: number;
  editTimeoutMs: number;
  maxRetries: number;
  providers: Array<{
    name: AIProviderName;
    configured: boolean;
    activeModel: string;
    fallbackModels: string[];
    availableInChain: boolean;
  }>;
}

export function getAIConfigSummary(activeMode?: AIMode): AIConfigSummary {
  const currentMode = activeMode || (process.env.AI_MODE as AIMode) || "balanced";
  const defaultProvider = process.env.AI_PROVIDER || "auto";
  const allowMockFallback = process.env.ALLOW_MOCK_FALLBACK === "true";
  const requestTimeoutMs = process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS) : 90000;
  const editTimeoutMs = process.env.AI_EDIT_TIMEOUT_MS ? parseInt(process.env.AI_EDIT_TIMEOUT_MS) : 60000;
  const maxRetries = process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES) : 1;

  const names: AIProviderName[] = ["openrouter", "gemini", "groq", "together", "mistral", "mock"];
  const chain = getProviderChain(currentMode);

  const providers = names.map((name) => {
    try {
      const p = getProvider(name);
      const configured = p.isConfigured();
      const models = p.getModels();
      const activeModel = models[0] || "";
      const fallbackModels = models.slice(1);

      return {
        name,
        configured,
        activeModel,
        fallbackModels,
        availableInChain: chain.includes(name) && (configured || name === "mock"),
      };
    } catch {
      return {
        name,
        configured: false,
        activeModel: "",
        fallbackModels: [],
        availableInChain: false,
      };
    }
  });

  return {
    defaultProvider,
    defaultMode: currentMode,
    allowMockFallback,
    requestTimeoutMs,
    editTimeoutMs,
    maxRetries,
    providers,
  };
}
