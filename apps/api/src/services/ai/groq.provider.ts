import { OpenAICompatibleProvider } from "./openai-compatible.provider.js";

export class GroqProvider extends OpenAICompatibleProvider {
  constructor(selectedModel?: string) {
    super(
      {
        name: "groq",
        baseURL: "https://api.groq.com/openai/v1",
        apiKeyEnvKey: "GROQ_API_KEY",
        modelEnvKey: "GROQ_MODEL",
        fallbackModelsEnvKey: "GROQ_FALLBACK_MODELS",
        headersBuilder: (key) => ({
          Authorization: `Bearer ${key}`,
        }),
      },
      selectedModel
    );
  }
}
