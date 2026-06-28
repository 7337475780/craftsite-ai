import type {
  AIProvider,
  EditWebsiteInput,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";
import { AIProviderError, AIProviderErrorType } from "./ai-provider.js";
import { buildWebsiteGenerationPrompt } from "./prompts.js";
import { buildWebsiteEditPrompt } from "./edit-prompts.js";
import { normalizeGeneratedCode } from "./code-utils.js";

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
};

export class GeminiProvider implements AIProvider {
  public name = "gemini" as const;
  private apiKey: string;
  private defaultModel: string;
  private fallbackModels: string[];
  public activeModel: string;

  constructor(selectedModel?: string) {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.defaultModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.fallbackModels = process.env.GEMINI_FALLBACK_MODELS
      ? process.env.GEMINI_FALLBACK_MODELS.split(",").map((m) => m.trim()).filter(Boolean)
      : [];
    this.activeModel = selectedModel || this.defaultModel || this.getModels()[0];
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
    if (list.length === 0) {
      list.push("gemini-2.5-flash");
    }
    return list;
  }

  private async callWithTimeoutAndRetry(
    promptText: string,
    timeoutMs: number
  ): Promise<GeminiResponse> {
    if (!this.isConfigured()) {
      throw new AIProviderError(
        "Gemini API key is not configured",
        "gemini",
        this.activeModel,
        "missing_api_key",
        undefined,
        false
      );
    }

    let attempts = 0;
    const maxRetries = process.env.AI_MAX_RETRIES ? parseInt(process.env.AI_MAX_RETRIES) : 1;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.activeModel}:generateContent?key=${this.apiKey}`;

    while (attempts <= maxRetries) {
      attempts++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 8192,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = errorText;
          try {
            const parsed = JSON.parse(errorText);
            errorMessage = parsed.error?.message || errorText;
          } catch {}

          let errorType: AIProviderErrorType = "unknown";
          let retryable = false;

          if (response.status === 401 || response.status === 403) {
            errorType = "invalid_api_key";
          } else if (response.status === 402) {
            errorType = "quota_exceeded";
          } else if (response.status === 429) {
            errorType = "rate_limited";
            retryable = true;
          } else if (response.status >= 500) {
            errorType = "model_unavailable";
            retryable = true;
          }

          if (retryable && attempts <= maxRetries) {
            console.warn(`[Gemini] Transient error ${response.status}. Retrying (Attempt ${attempts} of ${maxRetries})...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            continue;
          }

          throw new AIProviderError(
            `Gemini upstream error: ${response.status} - ${errorMessage}`,
            "gemini",
            this.activeModel,
            errorType,
            response.status,
            retryable
          );
        }

        const data = await response.json();
        return data as GeminiResponse;
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.name === "AbortError" || err.message?.includes("abort")) {
          if (attempts <= maxRetries) {
            console.warn(`[Gemini] Timeout. Retrying (Attempt ${attempts} of ${maxRetries})...`);
            continue;
          }
          throw new AIProviderError(
            `Gemini request timed out after ${timeoutMs / 1000}s`,
            "gemini",
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
          console.warn(`[Gemini] Network error: ${err.message}. Retrying (Attempt ${attempts} of ${maxRetries})...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }

        throw new AIProviderError(
          `Gemini connection failed: ${err.message}`,
          "gemini",
          this.activeModel,
          "network_error",
          undefined,
          true
        );
      }
    }

    throw new AIProviderError(
      `Max retries reached for Gemini`,
      "gemini",
      this.activeModel,
      "network_error"
    );
  }

  private extractGeneratedCode(data: GeminiResponse): string {
    // 1. Check prompt feedback safety blocks
    if ((data as any).promptFeedback?.blockReason) {
      throw new AIProviderError(
        `Gemini blocked the request: ${(data as any).promptFeedback.blockReason}`,
        "gemini",
        this.activeModel,
        "safety_blocked"
      );
    }

    const candidate = data.candidates?.[0];
    if (!candidate) {
      throw new AIProviderError(
        "Invalid response from Gemini: No candidates returned",
        "gemini",
        this.activeModel,
        "invalid_response"
      );
    }

    const finishReason = candidate.finishReason;
    if (finishReason === "SAFETY" || finishReason === "safety") {
      throw new AIProviderError(
        "Gemini blocked response due to safety settings",
        "gemini",
        this.activeModel,
        "safety_blocked"
      );
    }

    if (finishReason === "MAX_TOKENS" || finishReason === "length") {
      throw new AIProviderError(
        "Gemini response was truncated due to output limit",
        "gemini",
        this.activeModel,
        "truncated_output"
      );
    }

    const part = candidate.content?.parts?.[0];
    const rawContent = part?.text || "";

    if (!rawContent) {
      throw new AIProviderError(
        "Empty response content from Gemini",
        "gemini",
        this.activeModel,
        "invalid_response"
      );
    }

    return normalizeGeneratedCode(rawContent);
  }

  async generateWebsite(input: GenerateWebsiteInput): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteGenerationPrompt(input);
    const timeout = process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS) : 90000;

    const data = await this.callWithTimeoutAndRetry(prompt, timeout);
    const generatedCode = this.extractGeneratedCode(data);

    return {
      generatedCode,
      provider: "gemini",
      model: this.activeModel,
      isFallback: false,
    };
  }

  async editWebsite(input: EditWebsiteInput): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteEditPrompt(input);
    const timeout = process.env.AI_EDIT_TIMEOUT_MS ? parseInt(process.env.AI_EDIT_TIMEOUT_MS) : 60000;

    const data = await this.callWithTimeoutAndRetry(prompt, timeout);
    const generatedCode = this.extractGeneratedCode(data);

    return {
      generatedCode,
      provider: "gemini",
      model: this.activeModel,
      isFallback: false,
    };
  }

  async repairWebsite(brokenCode: string, isEdit: boolean, qualityIssues?: string[]): Promise<GenerateWebsiteOutput> {
    const { buildIncompleteRepairPrompt, buildUIRepairPrompt } = await import("./repair-prompts.js");
    const promptText = qualityIssues 
      ? buildUIRepairPrompt(brokenCode, qualityIssues)
      : buildIncompleteRepairPrompt(brokenCode);


    const timeout = isEdit
      ? (process.env.AI_EDIT_TIMEOUT_MS ? parseInt(process.env.AI_EDIT_TIMEOUT_MS) : 60000)
      : (process.env.AI_REQUEST_TIMEOUT_MS ? parseInt(process.env.AI_REQUEST_TIMEOUT_MS) : 90000);

    const data = await this.callWithTimeoutAndRetry(promptText, timeout);
    const generatedCode = this.extractGeneratedCode(data);

    return {
      generatedCode,
      provider: "gemini",
      model: this.activeModel,
      isFallback: false,
    };
  }
}
