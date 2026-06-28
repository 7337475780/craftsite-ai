export function stripMarkdownFences(code: string): string {
  return code
    .replace(/```tsx/g, "")
    .replace(/```ts/g, "")
    .replace(/```jsx/g, "")
    .replace(/```javascript/g, "")
    .replace(/```js/g, "")
    .replace(/```/g, "")
    .trim();
}

export function extractGeneratedWebsiteComponent(text: string): string {
  const clean = stripMarkdownFences(text);
  const matchIndex = clean.indexOf("export default function GeneratedWebsite");
  if (matchIndex === -1) {
    return clean;
  }

  // Let's find the start of the function body
  const bodyStartIndex = clean.indexOf("{", matchIndex);
  if (bodyStartIndex === -1) {
    return clean.slice(matchIndex);
  }

  let braceCount = 1;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  let i = bodyStartIndex + 1;
  for (; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }

    if (inLineComment) {
      if (char === "\n" || char === "\r") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i++; // skip /
      }
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") inSingleQuote = false;
      continue;
    }
    if (inDoubleQuote) {
      if (char === '"') inDoubleQuote = false;
      continue;
    }
    if (inTemplate) {
      if (char === "`") inTemplate = false;
      continue;
    }

    // check for comments
    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i++;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = true;
      continue;
    }
    if (char === "`") {
      inTemplate = true;
      continue;
    }

    if (char === "{") {
      braceCount++;
    } else if (char === "}") {
      braceCount--;
      if (braceCount === 0) {
        return clean.slice(matchIndex, i + 1);
      }
    }
  }

  return clean.slice(matchIndex);
}

export function normalizeGeneratedCode(code: string): string {
  let cleaned = stripMarkdownFences(code);

  // Normalize newlines inside strings
  cleaned = normalizeNewLinesInsideStrings(cleaned);

  // Standardize signature
  cleaned = cleaned
    .replace(
      /export default function GeneratedWebsite\(\): (React\.)?JSX\.Element/g,
      "export default function GeneratedWebsite()"
    )
    .trim();

  return cleaned;
}

function normalizeNewLinesInsideStrings(code: string): string {
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

export function validateGeneratedCode(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;

  // 1. contains export default function GeneratedWebsite
  if (!trimmed.includes("export default function GeneratedWebsite")) {
    return false;
  }

  // 2. does not contain imports
  if (/import\s+/.test(trimmed)) {
    return false;
  }

  // 3. does not contain dangerouslySetInnerHTML
  if (trimmed.includes("dangerouslySetInnerHTML")) {
    return false;
  }

  // 4. does not contain external fetch/window/document
  if (
    /\bfetch\s*\(/.test(trimmed) ||
    /\bwindow\b/.test(trimmed) ||
    /\bdocument\b/.test(trimmed)
  ) {
    return false;
  }

  // 5. not obviously truncated
  const suspiciousEndings = [
    "className=",
    'className="',
    "className='",
    "className={`",
    "<header",
    "<section",
    "<div",
    "<p",
    "<span",
    "<button",
  ];
  if (suspiciousEndings.some((ending) => trimmed.endsWith(ending))) {
    return false;
  }

  // 6. ends with closing brace
  if (!trimmed.endsWith("}")) {
    return false;
  }

  // 7. balanced braces/parentheses/quotes
  if (!hasBalancedBracketsAndQuotes(trimmed)) {
    return false;
  }

  // 8. does not contain protected fallback phrases
  const invalidPhrases = [
    "Preview protected",
    "The AI returned incomplete code",
    "CraftSite prevented the broken code",
    "Regenerate Website"
  ];
  if (invalidPhrases.some(p => trimmed.includes(p))) {
    return false;
  }

  return true;
}

function hasBalancedBracketsAndQuotes(code: string): boolean {
  let curly = 0;
  let round = 0;
  let square = 0;
  let doubleQuotes = 0;
  let backticks = 0;

  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inTemplate = false;
  let escape = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const nextChar = code[i + 1];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }

    if (inLineComment) {
      if (char === "\n" || char === "\r") inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inSingleQuote) {
      if (char === "'") inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"') {
        inDoubleQuote = false;
        doubleQuotes++;
      }
      continue;
    }

    if (inTemplate) {
      if (char === "`") {
        inTemplate = false;
        backticks++;
      }
      continue;
    }

    // Comment checks
    if (char === "/" && nextChar === "/") {
      inLineComment = true;
      i++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      inBlockComment = true;
      i++;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      continue;
    }
    if (char === '"') {
      inDoubleQuote = true;
      doubleQuotes++;
      continue;
    }
    if (char === "`") {
      inTemplate = true;
      backticks++;
      continue;
    }

    if (char === "{") curly++;
    else if (char === "}") curly--;
    else if (char === "(") round++;
    else if (char === ")") round--;
    else if (char === "[") square++;
    else if (char === "]") square--;
  }

  return (
    curly === 0 &&
    round === 0 &&
    square === 0 &&
    doubleQuotes % 2 === 0 &&
    backticks % 2 === 0
  );
}

export function repairCommonCodeIssues(code: string): string {
  let cleaned = stripMarkdownFences(code);

  // Remove leading explanations
  const exportIndex = cleaned.indexOf("export default function GeneratedWebsite");
  if (exportIndex !== -1) {
    cleaned = cleaned.slice(exportIndex).trim();
  }

  // Convert class to className safely
  cleaned = cleaned.replace(/\sclass=/g, " className=");

  // Remove imports
  cleaned = cleaned
    .split("\n")
    .filter((line) => !line.trim().startsWith("import "))
    .join("\n")
    .trim();

  // Extract valid component body
  cleaned = extractGeneratedWebsiteComponent(cleaned);

  return cleaned;
}

export function isTruncatedOutput(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return true;
  if (!trimmed.endsWith("}")) return true;

  const suspiciousEndings = [
    "className=",
    'className="',
    "className='",
    "className={`",
    "<header",
    "<section",
    "<div",
    "<p",
    "<span",
    "<button",
  ];
  if (suspiciousEndings.some((ending) => trimmed.endsWith(ending))) {
    return true;
  }
  return false;
}

export function scoreGeneratedUIQuality(code: string, websiteType?: string): { score: number; issues: string[] } {
  let score = 100;
  const issues: string[] = [];

  const positiveSignals = [
    { regex: /sm:|md:|lg:/, weight: 10 },
    { regex: /max-w-/, weight: 10 },
    { regex: /grid-cols-/, weight: 10 },
    { regex: /rounded-(2xl|3xl)/, weight: 5 },
    { regex: /bg-gradient-to-/, weight: 5 },
    { regex: /backdrop-blur|bg-white\/\[0\.0[1-9]\]/, weight: 5 },
  ];

  const hasNavbar = /<nav|<header/i.test(code);
  const hasFooter = /<footer/i.test(code);
  const hasButton = /<button|className="[^"]*rounded-2xl[^"]*bg-gradient/.test(code);
  
  if (!hasNavbar) { score -= 15; issues.push("Missing Navbar"); }
  if (!hasFooter) { score -= 10; issues.push("Missing Footer"); }
  if (!hasButton) { score -= 10; issues.push("Missing stylized buttons"); }

  let matchCount = 0;
  for (const sig of positiveSignals) {
    if (sig.regex.test(code)) matchCount++;
  }
  if (matchCount < 3) {
    score -= 20;
    issues.push("Lacks premium styling (gradients, glassmorphism, rounded corners)");
  }

  // Negative signals
  if (!/sm:|md:|lg:|xl:/.test(code)) {
    score -= 30;
    issues.push("No responsive breakpoints (sm:, md:, lg:)");
  }
  
  if (/w-\[[0-9]+px\](?!.*max-w-full)/.test(code)) {
    score -= 20;
    issues.push("Uses fixed widths without max-w-full");
  }

  if (/bg-green-|bg-teal-/.test(code) && !websiteType?.toLowerCase().includes("green")) {
    score -= 10;
    issues.push("Uses basic green/teal template style");
  }

  if (/SaaSify|John Doe|Globex/i.test(code)) {
    score -= 15;
    issues.push("Contains placeholder dummy content (SaaSify, John Doe, Globex)");
  }

  if (code.split('\n').length < 100) {
    score -= 15;
    issues.push("Code is too short for a premium landing page (< 100 lines)");
  }

  if (!/flex-col/.test(code) && /flex-row/.test(code)) {
    score -= 10;
    issues.push("Uses flex-row without flex-col (might not stack on mobile)");
  }

  return { score: Math.max(0, score), issues };
}

export function detectResponsiveIssues(code: string): string[] {
  const issues: string[] = [];
  
  if (!/sm:|md:|lg:|xl:/.test(code)) {
    issues.push("No responsive breakpoints found");
  }
  if (/w-\[[0-9]+px\](?!.*max-w-full)/.test(code)) {
    issues.push("Fixed widths used without max-w-full");
  }
  if (/grid-cols-[2-9]/.test(code) && !/sm:grid-cols-|md:grid-cols-|lg:grid-cols-/.test(code)) {
    issues.push("Grid columns set without mobile fallback");
  }
  if (/flex-row/.test(code) && !/flex-col/.test(code)) {
    issues.push("flex-row used without flex-col fallback for mobile");
  }
  if (/w-screen/.test(code) && !/overflow-x-hidden/.test(code)) {
    issues.push("w-screen used without overflow-x-hidden (risk of horizontal scroll)");
  }
  
  return issues;
}

