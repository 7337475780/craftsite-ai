import {
  AIProviderName,
  AIProvider,
  GenerateWebsiteInput,
  EditWebsiteInput,
  GenerateWebsiteOutput,
  AIProviderError,
  AIProviderErrorType,
} from "./ai-provider.js";
import { normalizeGeneratedCode } from "./code-utils.js";
import { buildWebsiteGenerationPrompt } from "./prompts.js";
import { buildWebsiteEditPrompt } from "./edit-prompts.js";

export interface OpenAIProviderConfig {
  name: AIProviderName;
  baseURL: string;
  apiKeyEnvKey: string;
  modelEnvKey: string;
  fallbackModelsEnvKey: string;
  headersBuilder: (apiKey: string) => Record<string, string>;
}

export class OpenAICompatibleProvider implements AIProvider {
  public name: AIProviderName;
  protected baseURL: string;
  protected apiKey: string;
  protected defaultModel: string;
  protected fallbackModels: string[];
  protected headersBuilder: (apiKey: string) => Record<string, string>;
  public activeModel: string;

  constructor(config: OpenAIProviderConfig, selectedModel?: string) {
    this.name = config.name;
    this.baseURL = config.baseURL;
    this.apiKey = process.env[config.apiKeyEnvKey] || "";

    const mapModelSlug = (model: string): string => {
      if (config.name === "openrouter") {
        if (model === "deepseek/deepseek-chat-v3.1:free") return "deepseek/deepseek-chat-v3.1";
        if (model === "google/gemini-2.0-flash-exp:free") return "google/gemma-4-31b-it:free";
        if (model === "meta-llama/llama-3.1-8b-instruct:free") return "meta-llama/llama-3.3-70b-instruct:free";
      }
      return model;
    };

    const rawDefault = process.env[config.modelEnvKey] || "";
    this.defaultModel = mapModelSlug(rawDefault);

    const rawFallbacks = process.env[config.fallbackModelsEnvKey]
      ? process.env[config.fallbackModelsEnvKey]!.split(",").map((m) => m.trim()).filter(Boolean)
      : [];
    this.fallbackModels = rawFallbacks.map(mapModelSlug);

    this.headersBuilder = config.headersBuilder;
    this.activeModel = selectedModel ? mapModelSlug(selectedModel) : (this.defaultModel || this.getModels()[0]);
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  getModels(): string[] {
    const list = [];
    if (this.defaultModel) list.push(this.defaultModel);
    for (const m of this.fallbackModels) {
      if (!list.includes(m)) {
        list.push(m);
      }
    }
    // Safe default fallbacks if none are configured in env
    if (list.length === 0) {
      if (this.name === "openrouter") {
        list.push("deepseek/deepseek-chat-v3.1");
        list.push("qwen/qwen3-coder:free");
        list.push("meta-llama/llama-3.3-70b-instruct:free");
      }
      else if (this.name === "groq") list.push("llama-3.3-70b-versatile");
      else if (this.name === "together") list.push("meta-llama/Llama-3.3-70B-Instruct-Turbo");
      else if (this.name === "mistral") list.push("mistral-large-latest");
    }
    return list;
  }

  protected async callCompletions(
    messages: Array<{ role: string; content: string }>,
    timeoutMs: number
  ): Promise<any> {
    if (!this.isConfigured()) {
      throw new AIProviderError(
        `API key is not configured for provider ${this.name}`,
        this.name,
        this.activeModel,
        "missing_api_key",
        undefined,
        false
      );
    }

    const maxRetries = process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES) : 1;
    let attempts = 0;

    while (attempts <= maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...this.headersBuilder(this.apiKey),
          },
          body: JSON.stringify({
            model: this.activeModel,
            messages,
            temperature: 0.3,
            max_tokens: 8192,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorType: AIProviderErrorType = "unknown";
          let retryable = false;

          if (response.status === 401 || response.status === 403) {
            errorType = "invalid_api_key";
          } else if (response.status === 402) {
            errorType = "quota_exceeded";
          } else if (response.status === 429) {
            errorType = "rate_limited";
            retryable = false; // Disable retry on the same model to move to fallbacks immediately

            let cooldownSeconds = 30; // Default fallback cooldown
            const retryAfterHeader = response.headers.get("Retry-After");
            if (retryAfterHeader) {
              const seconds = parseInt(retryAfterHeader, 10);
              if (!isNaN(seconds)) {
                cooldownSeconds = seconds;
              }
            } else {
              try {
                const parsed = JSON.parse(errorText);
                const metadata = parsed.error?.metadata;
                const bodySeconds = metadata?.retry_after_seconds || metadata?.retry_after_seconds_raw;
                if (bodySeconds && !isNaN(parseFloat(bodySeconds))) {
                  cooldownSeconds = Math.ceil(parseFloat(bodySeconds));
                }
              } catch {}
            }

            const { setModelCooldown } = await import("./model-cooldown.js");
            setModelCooldown(this.name, this.activeModel, cooldownSeconds);
          } else if (response.status >= 500) {
            errorType = "model_unavailable";
            retryable = true;
          }

          if (retryable && attempts <= maxRetries) {
            console.warn(`[${this.name}] HTTP ${response.status}. Retrying attempt ${attempts} of ${maxRetries}...`);
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }

          throw new AIProviderError(
            `HTTP ${response.status} from ${this.name}: ${errorText}`,
            this.name,
            this.activeModel,
            errorType,
            response.status,
            retryable
          );
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError" || err.message?.includes("abort")) {
          if (attempts <= maxRetries) {
            console.warn(`[${this.name}] Timeout. Retrying attempt ${attempts} of ${maxRetries}...`);
            continue;
          }
          throw new AIProviderError(
            `Request to ${this.name} timed out after ${timeoutMs}ms`,
            this.name,
            this.activeModel,
            "timeout",
            undefined,
            true
          );
        }

        if (err instanceof AIProviderError) {
          throw err;
        }

        if (attempts <= maxRetries) {
          console.warn(`[${this.name}] Network error: ${err.message}. Retrying...`);
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        throw new AIProviderError(
          `Connection to ${this.name} failed: ${err.message}`,
          this.name,
          this.activeModel,
          "network_error",
          undefined,
          true
        );
      }
    }

    throw new AIProviderError(
      `Max retries reached for ${this.name}`,
      this.name,
      this.activeModel,
      "network_error"
    );
  }

  async generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteGenerationPrompt(input);
    const messages = [
      {
        role: "system",
        content: "You are a senior React frontend engineer. Generate a complete, valid React component for a modern responsive website.",
      },
      { role: "user", content: prompt },
    ];

    const timeout = process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS) : 90000;
    const data = await this.callCompletions(messages, timeout);

    const choice = data?.choices?.[0];
    const rawContent = choice?.message?.content || "";
    const finishReason = choice?.finish_reason;

    if (!rawContent) {
      throw new AIProviderError(
        "Empty response content from provider",
        this.name,
        this.activeModel,
        "invalid_response"
      );
    }

    if (finishReason === "length") {
      throw new AIProviderError(
        "Output was truncated due to token limit constraints",
        this.name,
        this.activeModel,
        "truncated_output"
      );
    }

    const generatedCode = normalizeGeneratedCode(rawContent);

    return {
      generatedCode,
      provider: this.name,
      model: this.activeModel,
      isFallback: false,
    };
  }

  async editWebsite(input: EditWebsiteInput): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteEditPrompt(input);
    const messages = [
      {
        role: "system",
        content: "You are a senior React frontend engineer performing a targeted edit on an existing React + Tailwind CSS component.",
      },
      { role: "user", content: prompt },
    ];

    const timeout = process.env.AI_EDIT_TIMEOUT_MS ? parseInt(process.env.AI_EDIT_TIMEOUT_MS) : 60000;
    const data = await this.callCompletions(messages, timeout);

    const choice = data?.choices?.[0];
    const rawContent = choice?.message?.content || "";
    const finishReason = choice?.finish_reason;

    if (!rawContent) {
      throw new AIProviderError(
        "Empty response content from provider during edit",
        this.name,
        this.activeModel,
        "invalid_response"
      );
    }

    if (finishReason === "length") {
      throw new AIProviderError(
        "Edit output was truncated due to token limit constraints",
        this.name,
        this.activeModel,
        "truncated_output"
      );
    }

    const generatedCode = normalizeGeneratedCode(rawContent);

    return {
      generatedCode,
      provider: this.name,
      model: this.activeModel,
      isFallback: false,
    };
  }

  async repairWebsite(brokenCode: string, isEdit: boolean, qualityIssues?: string[]): Promise<GenerateWebsiteOutput> {
    const { buildIncompleteRepairPrompt, buildUIRepairPrompt } = await import("./repair-prompts.js");
    const promptText = qualityIssues 
      ? buildUIRepairPrompt(brokenCode, qualityIssues)
      : buildIncompleteRepairPrompt(brokenCode);

    const messages = [
      {
        role: "system",
        content: "You are a senior React frontend engineer. Fix the provided React component. Return only the valid code starting with export default function GeneratedWebsite() and ending with closing brace. No markdown fences. No explanations. No imports.",
      },
      {
        role: "user",
        content: promptText,
      },
    ];

    const timeout = isEdit
      ? (process.env.AI_EDIT_TIMEOUT_MS ? parseInt(process.env.AI_EDIT_TIMEOUT_MS) : 60000)
      : (process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS) : 90000);

    const data = await this.callCompletions(messages, timeout);
    const rawContent = data?.choices?.[0]?.message?.content || "";
    const generatedCode = normalizeGeneratedCode(rawContent);

    return {
      generatedCode,
      provider: this.name,
      model: this.activeModel,
      isFallback: false,
    };
  }
}
