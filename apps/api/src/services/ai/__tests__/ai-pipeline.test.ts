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
import { setModelCooldown, clearAllCooldowns } from "../model-cooldown.js";

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

function createHighQualityMockCode(keyword: string): string {
  return `
export default function GeneratedWebsite() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* 1. Navbar */}
      <header className="fixed top-0 w-full backdrop-blur">
        <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="text-xl font-bold">Logo - ${keyword}</div>
          <div className="hidden md:flex gap-4">
            <a href="#">Link</a>
          </div>
        </nav>
      </header>

      {/* 2. Content with positive signals */}
      <main className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-lg">
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Title
              </h1>
              <p className="mt-4 text-slate-400">Description</p>
              {/* 3. Stylized Button */}
              <button className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 font-bold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto text-center text-slate-500">
          <p>Footer</p>
        </div>
      </footer>
    </div>
  );
}
// Line 39
// Line 40
// Line 41
// Line 42
// Line 43
// Line 44
// Line 45
// Line 46
// Line 47
// Line 48
// Line 49
// Line 50
// Line 51
// Line 52
// Line 53
// Line 54
// Line 55
// Line 56
// Line 57
// Line 58
// Line 59
// Line 60
// Line 61
// Line 62
// Line 63
// Line 64
// Line 65
// Line 66
// Line 67
// Line 68
// Line 69
// Line 70
// Line 71
// Line 72
// Line 73
// Line 74
// Line 75
// Line 76
// Line 77
// Line 78
// Line 79
// Line 80
// Line 81
// Line 82
// Line 83
// Line 84
// Line 85
// Line 86
// Line 87
// Line 88
// Line 89
// Line 90
// Line 91
// Line 92
// Line 93
// Line 94
// Line 95
// Line 96
// Line 97
// Line 98
// Line 99
// Line 100
// Line 101
// Line 102
// Line 103
// Line 104
// Line 105
`;
}

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
    clearAllCooldowns(); // Prevent cooldown state from leaking between tests
  });

  it("OpenRouter success returns provider openrouter", async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: createHighQualityMockCode("OpenRouter Success"),
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
    const make429 = () => ({
      ok: false,
      status: 429,
      headers: { get: (h: string) => (h === "Retry-After" ? "5" : null) },
      text: async () => "Rate limit exceeded",
    });

    // Mock 1st call (OpenRouter 1st attempt) as 429 rate limit
    (fetch as any).mockResolvedValueOnce(make429());
    // Mock 2nd call (OpenRouter retry attempt) as 429 rate limit (shouldn't happen but guard)
    (fetch as any).mockResolvedValueOnce(make429());

    // Mock 3rd call (Gemini 1st attempt) as successful
    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: createHighQualityMockCode("Gemini Success"),
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
            content: createHighQualityMockCode("Repaired JSX"),
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
                text: createHighQualityMockCode("Gemini Worked"),
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

  it("Gemini uses ?key= query parameter (not Authorization Bearer)", async () => {
    process.env.GEMINI_API_KEY = "AIzaSy_test_api_key";
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
                text: createHighQualityMockCode("Gemini Worked"),
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

    // The second fetch call is Gemini — verify URL contains ?key= and no Auth header
    const geminiFetchCall = (fetch as any).mock.calls[1];
    const [url, options] = geminiFetchCall;
    expect(url).toContain("?key=AIzaSy_test_api_key");
    expect(options.headers["Authorization"]).toBeUndefined();
    expect(options.headers["x-goog-api-key"]).toBeUndefined();
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
    expect(result.generatedCode).toContain("Beautiful Fallback");
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
                text: createHighQualityMockCode("Gemini Skip Test"),
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

  it("skips model in cooldown and records cooldown errorType", async () => {
    setModelCooldown("openrouter", "test-model-or", 60); // 60s cooldown

    // Gemini succeeds
    const geminiMockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: createHighQualityMockCode("Gemini After Cooldown Skip"),
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

    // OpenRouter model should be in providerAttempts with errorType: "cooldown"
    const openrouterAttempt = result.providerAttempts?.find((a) => a.provider === "openrouter");
    expect(openrouterAttempt).toBeDefined();
    expect(openrouterAttempt?.errorType).toBe("cooldown");
    expect(openrouterAttempt?.success).toBe(false);

    // Gemini should succeed
    expect(result.provider).toBe("gemini");
    // isFallback is false — Gemini is a real provider, not mock
    expect(result.isFallback).toBe(false);
  });
});
