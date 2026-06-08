import type {
  AIProvider,
  GenerateWebsiteInput,
  GenerateWebsiteOutput,
} from "./ai-provider.js";
import { buildWebsiteGenerationPrompt } from "./prompts.js";

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

  cleaned = cleaned
    .replace(/^import React.*?;\s*/gm, "")
    .replace(/^import .*?;\s*/gm, "")
    .replace(
      /export default function GeneratedWebsite\(\): JSX\.Element/g,
      "export default function GeneratedWebsite()",
    )
    .replace(
      /export default function GeneratedWebsite\(\): React\.JSX\.Element/g,
      "export default function GeneratedWebsite()",
    )
    .trim();

  return lucideImports + cleaned;
}

function normalizeNewLinesInsideStrings(code: string) {
  let output = "";
  let insideDoubleQuote = false;
  let insideSingleQuote = false;
  let insideTemplateString = false;
  let previousChar = "";

  for (const char of code) {
    if (
      char === '"' &&
      previousChar !== "\\" &&
      !insideSingleQuote &&
      !insideTemplateString
    ) {
      insideDoubleQuote = !insideDoubleQuote;
      output += char;
    } else if (
      char === "'" &&
      previousChar !== "\\" &&
      !insideDoubleQuote &&
      !insideTemplateString
    ) {
      insideSingleQuote = !insideSingleQuote;
      output += char;
    } else if (
      char === "`" &&
      previousChar !== "\\" &&
      !insideDoubleQuote &&
      !insideSingleQuote
    ) {
      insideTemplateString = !insideTemplateString;
      output += char;
    } else if (
      (char === "\n" || char === "\r") &&
      (insideDoubleQuote || insideSingleQuote)
    ) {
      output += " ";
    } else {
      output += char;
    }

    previousChar = char;
  }

  return output;
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

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is missing in .env");
    }
  }

  async generateWebsite(
    input: GenerateWebsiteInput,
  ): Promise<GenerateWebsiteOutput> {
    const prompt = buildWebsiteGenerationPrompt(input);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": this.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${prompt}

Extra Gemini-specific instruction:
Return only code. Start with export default function GeneratedWebsite() and end with the final closing brace. No markdown.`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4500,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 429) {
        throw new Error(`GEMINI_RATE_LIMIT:${errorText}`);
      }

      throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
    }

    const data = (await response.json()) as GeminiResponse;

    const rawCode =
      data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("") || "";

    const generatedCode = normalizeNewLinesInsideStrings(
      cleanGeneratedCode(rawCode),
    );

    if (!isValidGeneratedCode(generatedCode)) {
      console.warn("Gemini returned code that failed strict validation.");
      console.warn("Raw Gemini output preview:", rawCode.slice(0, 800));
      console.warn(
        "Cleaned Gemini output preview:",
        generatedCode.slice(0, 800),
      );

      if (
        generatedCode.includes("export default function GeneratedWebsite") &&
        generatedCode.includes("return") &&
        generatedCode.trim().endsWith("}")
      ) {
        console.warn("Gemini code passed basic validation. Returning it.");
        return {
          generatedCode,
          provider: "gemini",
          isFallback: false,
        };
      }

      throw new Error("Gemini did not return valid TSX code.");
    }

    return {
      generatedCode,
      provider: "gemini",
      isFallback: false,
    };
  }
}
