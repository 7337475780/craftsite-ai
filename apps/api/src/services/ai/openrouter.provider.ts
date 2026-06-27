import { OpenAICompatibleProvider } from "./openai-compatible.provider.js";
import { env } from "../../config/env.js";

export class OpenRouterProvider extends OpenAICompatibleProvider {
  constructor(selectedModel?: string) {
    const siteUrl = env.OPENROUTER_SITE_URL || "http://localhost:3000";
    const appName = env.OPENROUTER_APP_NAME || "CraftSite AI";

    super(
      {
        name: "openrouter",
        baseURL: "https://openrouter.ai/api/v1",
        apiKeyEnvKey: "OPENROUTER_API_KEY",
        modelEnvKey: "OPENROUTER_MODEL",
        fallbackModelsEnvKey: "OPENROUTER_FALLBACK_MODELS",
        headersBuilder: (key) => ({
          Authorization: `Bearer ${key}`,
          "HTTP-Referer": siteUrl,
          "X-Title": appName,
        }),
      },
      selectedModel
    );
  }
}
