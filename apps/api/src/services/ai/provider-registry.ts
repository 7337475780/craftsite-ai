import { AIProvider, AIProviderName, AIMode } from "./ai-provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import { GeminiProvider } from "./gemini.provider.js";
import { GroqProvider } from "./groq.provider.js";
import { TogetherProvider } from "./together.provider.js";
import { MistralProvider } from "./mistral.provider.js";
import { MockProvider } from "./mock.provider.js";
import { env } from "../../config/env.js";
import { isModelCoolingDown, getCooldownRemainingMs } from "./model-cooldown.js";

const MODE_CHAINS: Record<AIMode, AIProviderName[]> = {
  balanced: ["gemini", "openrouter", "groq", "together", "mistral", "mock"],
  fast: ["groq", "gemini", "openrouter", "mock"],
  quality: ["gemini", "openrouter", "mistral", "together", "mock"],
  free: ["openrouter", "gemini", "mock"],
  code: ["gemini", "openrouter", "together", "mistral", "mock"],
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
  warnings: string[];
  providers: Array<{
    name: AIProviderName;
    configured: boolean;
    activeModel: string;
    fallbackModels: string[];
    availableInChain: boolean;
    warnings: string[];
    cooldownRemainingMs?: number;
  }>;
}

export function getAIConfigSummary(activeMode?: AIMode): AIConfigSummary {
  const currentMode = activeMode || env.AI_MODE || "balanced";
  const defaultProvider = env.AI_PROVIDER || "auto";
  const allowMockFallback = env.ALLOW_MOCK_FALLBACK === true;
  const requestTimeoutMs = env.AI_REQUEST_TIMEOUT_MS || 90000;
  const editTimeoutMs = env.AI_EDIT_TIMEOUT_MS || 60000;
  const maxRetries = env.AI_MAX_RETRIES || 1;

  const names: AIProviderName[] = ["openrouter", "gemini", "groq", "together", "mistral", "mock"];
  const chain = getProviderChain(currentMode);

  const providers = names.map((name) => {
    const warnings: string[] = [];
    try {
      const p = getProvider(name);
      const configured = p.isConfigured();
      const models = p.getModels();
      const activeModel = models[0] || "";
      const fallbackModels = models.slice(1);

      if (!configured) {
        if (name === "gemini") warnings.push("gemini_key_missing");
        if (name === "openrouter") warnings.push("openrouter_key_missing");
      } else {
        if (name !== "mock" && fallbackModels.length === 0) {
          warnings.push("fallback_models_empty");
        }
      }

      let cooldownRemainingMs = 0;
      if (configured && name !== "mock") {
        if (isModelCoolingDown(name, activeModel)) {
          warnings.push("model_in_cooldown");
          cooldownRemainingMs = getCooldownRemainingMs(name, activeModel);
        }
      }

      return {
        name,
        configured,
        activeModel,
        fallbackModels,
        availableInChain: chain.includes(name) && (configured || name === "mock"),
        warnings,
        cooldownRemainingMs: cooldownRemainingMs || undefined,
      };
    } catch {
      if (name === "gemini") warnings.push("gemini_key_missing");
      if (name === "openrouter") warnings.push("openrouter_key_missing");

      return {
        name,
        configured: false,
        activeModel: "",
        fallbackModels: [],
        availableInChain: false,
        warnings,
      };
    }
  });

  const generalWarnings: string[] = [];
  if (!allowMockFallback) {
    generalWarnings.push("fallback_disabled");
  }

  const realConfiguredCount = providers.filter((p) => p.name !== "mock" && p.configured).length;
  if (realConfiguredCount === 1) {
    generalWarnings.push("only_one_real_provider_configured");
  } else if (realConfiguredCount === 0) {
    generalWarnings.push("no_real_provider_configured");
  }

  return {
    defaultProvider,
    defaultMode: currentMode,
    allowMockFallback,
    requestTimeoutMs,
    editTimeoutMs,
    maxRetries,
    warnings: generalWarnings,
    providers,
  };
}
