import type {
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";

import { MockProvider } from "./mock.provider.js";
import { OpenRouterProvider } from "./openrouter.provider.js";
import { GeminiProvider } from "./gemini.provider.js";

async function tryProvider(
  name: string,
  provider: {
    generateWebsite(
      input: GenerateWebsiteInput,
    ): Promise<GenerateWebsiteOutput>;
  },
  input: GenerateWebsiteInput,
): Promise<GenerateWebsiteOutput | null> {
  try {
    console.log(`Trying AI provider: ${name}`);
    const result = await provider.generateWebsite(input);
    console.log(`AI provider succeeded: ${name}`);
    return result;
  } catch (error) {
    console.warn(`AI provider failed: ${name}`);
    console.warn(error instanceof Error ? error.message : error);
    return null;
  }
}

export async function generateWebsiteWithAI(
  input: GenerateWebsiteInput,
): Promise<GenerateWebsiteOutput> {
  const provider = process.env.AI_PROVIDER || "auto";

  if (provider === "auto") {
    const openrouterResult = await tryProvider(
      "openrouter",
      new OpenRouterProvider(),
      input,
    );

    if (openrouterResult) return { ...openrouterResult, isFallback: false };

    const geminiResult = await tryProvider(
      "gemini",
      new GeminiProvider(),
      input,
    );

    if (geminiResult) return { ...geminiResult, isFallback: false };

    console.warn("All AI providers failed. Falling back to mock.");
    const mockResult = await new MockProvider().generateWebsite(input);
    return { ...mockResult, isFallback: true };
  }

  try {
    if (provider === "openrouter") {
      return await new OpenRouterProvider().generateWebsite(input);
    }

    if (provider === "gemini") {
      return await new GeminiProvider().generateWebsite(input);
    }
  } catch (error) {
    console.warn(`${provider} failed. Falling back to mock.`);
    const mockResult = await new MockProvider().generateWebsite(input);
    return { ...mockResult, isFallback: true };
  }

  const mockResult = await new MockProvider().generateWebsite(input);
  return { ...mockResult, isFallback: false };
}
