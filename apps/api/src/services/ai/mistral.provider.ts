import { OpenAICompatibleProvider } from "./openai-compatible.provider.js";

export class MistralProvider extends OpenAICompatibleProvider {
  constructor(selectedModel?: string) {
    super(
      {
        name: "mistral",
        baseURL: "https://api.mistral.ai/v1",
        apiKeyEnvKey: "MISTRAL_API_KEY",
        modelEnvKey: "MISTRAL_MODEL",
        fallbackModelsEnvKey: "MISTRAL_FALLBACK_MODELS",
        headersBuilder: (key) => ({
          Authorization: `Bearer ${key}`,
        }),
      },
      selectedModel
    );
  }
}
