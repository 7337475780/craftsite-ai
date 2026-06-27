import { OpenAICompatibleProvider } from "./openai-compatible.provider.js";

export class TogetherProvider extends OpenAICompatibleProvider {
  constructor(selectedModel?: string) {
    super(
      {
        name: "together",
        baseURL: "https://api.together.xyz/v1",
        apiKeyEnvKey: "TOGETHER_API_KEY",
        modelEnvKey: "TOGETHER_MODEL",
        fallbackModelsEnvKey: "TOGETHER_FALLBACK_MODELS",
        headersBuilder: (key) => ({
          Authorization: `Bearer ${key}`,
        }),
      },
      selectedModel
    );
  }
}
