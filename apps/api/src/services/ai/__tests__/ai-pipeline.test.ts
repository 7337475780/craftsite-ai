import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateWebsiteWithAI } from "../index.js";
import {
  stripMarkdownFences,
  validateGeneratedCode,
  repairCommonCodeIssues,
  isTruncatedOutput,
} from "../code-utils.js";
import { AIProviderError } from "../ai-provider.js";
import { getProviderChain, getAIConfigSummary } from "../provider-registry.js";

const originalEnv = { ...process.env };

describe("Code Utilities", () => {
  it("stripMarkdownFences should clean code blocks correctly", () => {
    const dirty = "```tsx\nexport default function GeneratedWebsite() {}\n```";
    expect(stripMarkdownFences(dirty)).toBe("export default function GeneratedWebsite() {}");
  });

  it("validateGeneratedCode should validate valid JSX and catch invalid JSX", () => {
    const valid = `
export default function GeneratedWebsite() {
  return (
    <main className="bg-black text-white">
      <div>Hello World</div>
    </main>
  );
}
    `.trim();
    expect(validateGeneratedCode(valid)).toBe(true);

    const missingClosingBrace = `
export default function GeneratedWebsite() {
  return (
    <main>
      <div>Hello
    </main>
  );
    `.trim();
    expect(validateGeneratedCode(missingClosingBrace)).toBe(false);
  });

  it("isTruncatedOutput should detect unclosed code structures", () => {
    expect(isTruncatedOutput("export default function GeneratedWebsite() {")).toBe(true);
    expect(isTruncatedOutput("export default function GeneratedWebsite() {}")).toBe(false);
    expect(isTruncatedOutput("export default function GeneratedWebsite() {\n  return <div")).toBe(true);
  });

  it("repairCommonCodeIssues should fix common class attributes and remove imports", () => {
    const raw = `
import React from 'react';
export default function GeneratedWebsite() {
  return <div class="bg-red-500">Test</div>;
}
    `.trim();
    const repaired = repairCommonCodeIssues(raw);
    expect(repaired).not.toContain("import ");
    expect(repaired).toContain("className=\"bg-red-500\"");
  });
});

describe("AI Provider Registry", () => {
  it("returns correct chain for different AI modes", () => {
    expect(getProviderChain("balanced")).toEqual([
      "openrouter",
      "gemini",
      "groq",
      "together",
      "mistral",
      "mock",
    ]);
    expect(getProviderChain("fast")).toEqual(["groq", "gemini", "openrouter", "mock"]);
  });

  it("hides secret API keys from the configuration summary", () => {
    process.env.OPENROUTER_API_KEY = "sk-or-secret-key-12345";
    const summary = getAIConfigSummary();
    expect(summary.providers.find((p) => p.name === "openrouter")?.configured).toBe(true);
    // Double check that secret keys are NOT leaked anywhere in the config object
    const serialized = JSON.stringify(summary);
    expect(serialized).not.toContain("sk-or-secret-key");
  });
});

describe("AI Orchestrator Pipeline", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    process.env.OPENROUTER_API_KEY = "test_or_key";
    process.env.GEMINI_API_KEY = "test_gemini_key";
    process.env.GROQ_API_KEY = "";
    process.env.TOGETHER_API_KEY = "";
    process.env.MISTRAL_API_KEY = "";
    process.env.AI_PROVIDER = "auto";
    process.env.AI_MODE = "balanced";
    process.env.ALLOW_MOCK_FALLBACK = "true";
    process.env.OPENROUTER_MODEL = "test-model-or";
    process.env.GEMINI_MODEL = "test-model-gemini";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.env = { ...originalEnv };
  });

  it("OpenRouter success returns provider openrouter", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: `export default function GeneratedWebsite() { return <div>OpenRouter Success</div>; }`,
          },
          finish_reason: "stop",
        },
      ],
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await generateWebsiteWithAI({ prompt: "Generate premium website for SaaS resume builder" });
    expect(result.provider).toBe("openrouter");
    expect(result.isFallback).toBe(false);
    expect(result.generatedCode).toContain("OpenRouter Success");
    expect(result.providerAttempts).toBeDefined();
    expect(result.providerAttempts?.[0].success).toBe(true);
  });

  it("OpenRouter rate-limit (429) tries Gemini", async () => {
    // Mock 1st call (OpenRouter 1st attempt) as 429 rate limit
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    });

    // Mock 2nd call (OpenRouter retry attempt) as 429 rate limit
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit exceeded",
    });

    // Mock 3rd call (Gemini 1st attempt) as successful
    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: `export default function GeneratedWebsite() { return <div>Gemini Success</div>; }`,
              },
            ],
          },
          finishReason: "STOP",
        },
      ],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => geminiMockResponse,
    });

    const result = await generateWebsiteWithAI({ prompt: "Generate premium website for SaaS resume builder" });
    expect(result.provider).toBe("gemini");
    expect(result.isFallback).toBe(false);
    expect(result.generatedCode).toContain("Gemini Success");
    expect(result.providerAttempts).toHaveLength(2);
    expect(result.providerAttempts?.[0].success).toBe(false);
    expect(result.providerAttempts?.[0].errorType).toBe("rate_limited");
    expect(result.providerAttempts?.[1].success).toBe(true);
  });

  it("OpenRouter invalid JSX repair succeeds", async () => {
    // 1st request returns invalid JSX (missing closing brace)
    const invalidResponse = {
      choices: [
        {
          message: {
            content: `export default function GeneratedWebsite() { return <div>Invalid JSX`,
          },
          finish_reason: "stop",
        },
      ],
    };

    // 2nd request (repair) returns valid JSX
    const repairResponse = {
      choices: [
        {
          message: {
            content: `export default function GeneratedWebsite() { return <div>Repaired JSX</div>; }`,
          },
          finish_reason: "stop",
        },
      ],
    };

    (fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => invalidResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => repairResponse,
      });

    const result = await generateWebsiteWithAI({ prompt: "Generate premium website for SaaS resume builder" });
    expect(result.provider).toBe("openrouter");
    expect(result.isFallback).toBe(false);
    expect(result.generatedCode).toContain("Repaired JSX");
  });

  it("Gemini success returns provider gemini if OpenRouter fails", async () => {
    // OpenRouter returns auth error (401)
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    // Gemini returns valid JSX
    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: `export default function GeneratedWebsite() { return <div>Gemini Worked</div>; }`,
              },
            ],
          },
          finishReason: "STOP",
        },
      ],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => geminiMockResponse,
    });

    const result = await generateWebsiteWithAI({ prompt: "Generate website" });
    expect(result.provider).toBe("gemini");
    expect(result.isFallback).toBe(false);
    expect(result.generatedCode).toContain("Gemini Worked");
  });

  it("Gemini authorization sends Bearer token if API key starts with AQ. or ya29.", async () => {
    process.env.GEMINI_API_KEY = "AQ.test_gcp_token";
    // OpenRouter fails
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    // Gemini succeeds
    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: "export default function GeneratedWebsite() { return <div>Gemini Worked</div>; }",
              },
            ],
          },
        },
      ],
    };
    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => geminiMockResponse,
    });

    await generateWebsiteWithAI({ prompt: "Generate website" });

    // The second fetch call is Gemini
    const geminiFetchCall = (fetch as any).mock.calls[1];
    expect(geminiFetchCall[1].headers["Authorization"]).toBe("Bearer AQ.test_gcp_token");
    expect(geminiFetchCall[1].headers["x-goog-api-key"]).toBeUndefined();
  });

  it("Mock is used only after real providers fail", async () => {
    // OpenRouter fails
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit",
    });
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Rate limit",
    });

    // Gemini fails
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "Overloaded",
    });
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: async () => "Overloaded",
    });

    const result = await generateWebsiteWithAI({ prompt: "Generate website" });
    expect(result.provider).toBe("mock");
    expect(result.isFallback).toBe(true);
    // Since MockProvider exports mock-safe-fallback structure:
    expect(result.generatedCode).toContain("Safe Mock Preview");
  });

  it("AI_PROVIDER=openrouter does not silently mock unless fallback enabled", async () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.ALLOW_MOCK_FALLBACK = "false";

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => "Unauthorized",
    });

    await expect(generateWebsiteWithAI({ prompt: "Generate website" })).rejects.toThrow();
  });

  it("skips unconfigured providers in auto mode", async () => {
    process.env.OPENROUTER_API_KEY = ""; // Not configured
    process.env.GEMINI_API_KEY = "test_gemini_key"; // Configured

    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: `export default function GeneratedWebsite() { return <div>Gemini Skip Test</div>; }`,
              },
            ],
          },
          finishReason: "STOP",
        },
      ],
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => geminiMockResponse,
    });

    const result = await generateWebsiteWithAI({ prompt: "Generate website" });
    expect(result.provider).toBe("gemini");
    expect(result.isFallback).toBe(false);
    expect(result.generatedCode).toContain("Gemini Skip Test");
    // Should NOT have an OpenRouter attempt log since it was skipped entirely
    expect(result.providerAttempts?.find((a) => a.provider === "openrouter")).toBeUndefined();
  });
});
