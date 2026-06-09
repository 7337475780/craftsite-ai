import type {
  AIProvider,
  EditWebsiteInput,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";
import { buildWebsiteGenerationPrompt } from "./prompts.js";
import { buildWebsiteEditPrompt } from "./edit-prompts.js";

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
};

function cleanGeneratedCode(code: string) {
  let cleaned = code
    .replace(/```tsx/g, "")
    .replace(/```ts/g, "")
    .replace(/```jsx/g, "")
    .replace(/```javascript/g, "")
    .replace(/```js/g, "")
    .replace(/```/g, "")
    .trim();

  const lucideMatch = cleaned.match(/import\s+{[^}]+}\s+from\s+['"]lucide-react['"];?/g);
  const lucideImports = lucideMatch ? lucideMatch.join("\n") + "\n\n" : "";

  const exportIndex = cleaned.indexOf("export default function");

  if (exportIndex !== -1) {
    cleaned = cleaned.slice(exportIndex).trim();
  }

  return lucideImports + cleaned;
}

function hasBalancedQuotes(code: string) {
  let doubleQuotes = 0;
  let singleQuotes = 0;
  let previousChar = "";

  for (const char of code) {
    if (char === '"' && previousChar !== "\\") doubleQuotes++;
    if (char === "'" && previousChar !== "\\") singleQuotes++;
    previousChar = char;
  }

  return doubleQuotes % 2 === 0 && singleQuotes % 2 === 0;
}

function hasBalancedBraces(code: string) {
  let round = 0;
  let curly = 0;
  let square = 0;
  let previousChar = "";
  let insideDoubleQuote = false;
  let insideSingleQuote = false;

  for (const char of code) {
    if (char === '"' && previousChar !== "\\" && !insideSingleQuote) {
      insideDoubleQuote = !insideDoubleQuote;
    }

    if (char === "'" && previousChar !== "\\" && !insideDoubleQuote) {
      insideSingleQuote = !insideSingleQuote;
    }

    if (!insideDoubleQuote && !insideSingleQuote) {
      if (char === "(") round++;
      if (char === ")") round--;
      if (char === "{") curly++;
      if (char === "}") curly--;
      if (char === "[") square++;
      if (char === "]") square--;
    }

    previousChar = char;
  }

  return round === 0 && curly === 0 && square === 0;
}

function isValidGeneratedCode(code: string) {
  const trimmed = code.trim();

  const hasRequiredShape =
    trimmed.includes("export default function GeneratedWebsite") &&
    trimmed.includes("return") &&
    trimmed.includes(");") &&
    trimmed.endsWith("}");

  const hasForbidden =
    trimmed.includes("<svg") ||
    trimmed.includes("<path");

  const hasBadEnding =
    trimmed.endsWith("className=") ||
    trimmed.endsWith('className="') ||
    trimmed.endsWith("className='") ||
    trimmed.endsWith("<header") ||
    trimmed.endsWith("<section") ||
    trimmed.endsWith("<div") ||
    trimmed.endsWith("<p") ||
    trimmed.endsWith("<span") ||
    trimmed.endsWith("<button") ||
    trimmed.endsWith("py") ||
    trimmed.endsWith("px") ||
    trimmed.endsWith("bg-") ||
    trimmed.endsWith("text-");

  return (
    hasRequiredShape &&
    hasBalancedQuotes(trimmed) &&
    hasBalancedBraces(trimmed) &&
    !hasForbidden &&
    !hasBadEnding
  );
}

export class OpenRouterProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private siteUrl: string;
  private appName: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || "";
    this.model = process.env.OPENROUTER_MODEL || "openrouter/free";
    this.siteUrl = process.env.OPENROUTER_SITE_URL || "http://localhost:3000";
    this.appName = process.env.OPENROUTER_APP_NAME || "CraftSite AI";

    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is missing in .env");
    }
  }

  private async callOpenRouter(
    messages: Array<{ role: string; content: string }>,
  ) {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": this.siteUrl,
          "X-Title": this.appName,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.15,
          max_tokens: 2800,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        throw new Error(`OPENROUTER_RATE_LIMIT:${errorText}`);
      }

      throw new Error(
        `OpenRouter request failed: ${response.status} ${errorText}`,
      );
    }

    return (await response.json()) as OpenRouterResponse;
  }

  private async repairCode(
    brokenCode: string,
    input: GenerateWebsiteInput,
  ): Promise<string> {
    const repairPrompt = `
You are a TSX repair engine.

The following React component is incomplete or invalid.

Your job:
- Fix it into complete valid JSX/TSX.
- Return ONLY valid JSX/TSX code.
- Do NOT include markdown.
- Do NOT include explanations.
- Only import from lucide-react if needed. No other imports.
- Do NOT use SVG.
- Do NOT use external libraries.
- Do NOT use array.map().
- Keep it compact.
- Ensure every className string is on one line.
- Ensure the component starts with:
export default function GeneratedWebsite() {
- Ensure the component ends with:
}

Original user request:
${input.prompt}

Broken code:
${brokenCode}
`.trim();

    const data = await this.callOpenRouter([
      {
        role: "system",
        content:
          "You repair broken TSX. Return only complete valid JSX code. No markdown. No explanation.",
      },
      {
        role: "user",
        content: repairPrompt,
      },
    ]);

    return cleanGeneratedCode(data.choices?.[0]?.message?.content || "");
  }

  private async repairEditCode(brokenCode: string): Promise<string> {
    const repairPrompt = `
You are a TSX repair engine.

The following edited React component is incomplete or invalid.

Your job:
- Fix it into complete valid JSX/TSX.
- Return ONLY valid JSX/TSX code.
- Do NOT include markdown.
- Do NOT include explanations.
- Only import from lucide-react if needed. No other imports.
- Do NOT use SVG.
- Do NOT use external libraries.
- Do NOT use array.map().
- Keep it compact.
- Ensure every className string is on one line.
- Ensure the component starts with:
export default function GeneratedWebsite() {
- Ensure the component ends with:
}

Broken code:
${brokenCode}
`.trim();

    const data = await this.callOpenRouter([
      {
        role: "system",
        content:
          "You repair broken TSX. Return only complete valid JSX code. No markdown. No explanation.",
      },
      {
        role: "user",
        content: repairPrompt,
      },
    ]);

    return cleanGeneratedCode(data.choices?.[0]?.message?.content || "");
  }

  async editWebsite(
    input: EditWebsiteInput,
  ): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteEditPrompt(input);

    const data = await this.callOpenRouter([
      {
        role: "system",
        content:
          "Return only the complete updated JSX code. No markdown. No explanation. The component must finish completely and end with a closing brace.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const rawCode = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;
    const generatedCode = cleanGeneratedCode(rawCode);

    if (finishReason !== "length" && isValidGeneratedCode(generatedCode)) {
      return {
        generatedCode,
        provider: "openrouter",
        isFallback: false,
      };
    }

    console.warn(
      "OpenRouter edit returned invalid/incomplete code. Trying repair...",
    );

    const repairedCode = await this.repairEditCode(generatedCode || rawCode);

    if (isValidGeneratedCode(repairedCode)) {
      console.warn("OpenRouter edit repair successful.");
      return {
        generatedCode: repairedCode,
        provider: "openrouter",
        isFallback: false,
      };
    }

    throw new Error("OpenRouter edit returned invalid code and repair failed.");
  }

  async generateWebsite(
    input: GenerateWebsiteInput,
  ): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteGenerationPrompt(input);

    const data = await this.callOpenRouter([
      {
        role: "system",
        content:
          "Return only complete valid JSX code. No markdown. No explanation. The component must finish completely and end with a closing brace.",
      },
      {
        role: "user",
        content: prompt,
      },
    ]);

    const rawCode = data.choices?.[0]?.message?.content || "";
    const finishReason = data.choices?.[0]?.finish_reason;
    const generatedCode = cleanGeneratedCode(rawCode);

    if (finishReason !== "length" && isValidGeneratedCode(generatedCode)) {
      return {
        generatedCode,
        provider: "openrouter",
        isFallback: false,
      };
    }

    console.warn(
      "OpenRouter returned invalid/incomplete code. Trying repair...",
    );
    console.warn("Finish reason:", finishReason);
    console.warn("Raw output preview:", rawCode.slice(0, 300));

    const repairedCode = await this.repairCode(generatedCode || rawCode, input);

    if (isValidGeneratedCode(repairedCode)) {
      console.warn("OpenRouter repair successful.");

      return {
        generatedCode: repairedCode,
        provider: "openrouter",
        isFallback: false,
      };
    }

    throw new Error("OpenRouter returned invalid code and repair failed.");
  }
}
