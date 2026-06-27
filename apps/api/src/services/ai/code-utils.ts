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

