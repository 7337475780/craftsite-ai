"use client";

import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useState } from "react";

type PublicWebsitePreviewProps = {
  code: string;
};

// ── Code cleaning helpers (mirrors LivePreview logic) ────────────────────────

function removeMarkdown(code: string) {
  return code
    .replace(/```tsx/g, "")
    .replace(/```ts/g, "")
    .replace(/```jsx/g, "")
    .replace(/```javascript/g, "")
    .replace(/```js/g, "")
    .replace(/```/g, "")
    .trim();
}

function extractComponentCode(code: string) {
  const exportIndex = code.indexOf("export default function");
  if (exportIndex === -1) return code;
  return code.slice(exportIndex).trim();
}

function normalizeNewLinesInsideStrings(code: string) {
  let output = "";
  let insideDoubleQuote = false;
  let insideSingleQuote = false;
  let insideTemplateString = false;
  let previousChar = "";

  for (const char of code) {
    if (char === '"' && previousChar !== "\\" && !insideSingleQuote && !insideTemplateString) {
      insideDoubleQuote = !insideDoubleQuote;
      output += char;
    } else if (char === "'" && previousChar !== "\\" && !insideDoubleQuote && !insideTemplateString) {
      insideSingleQuote = !insideSingleQuote;
      output += char;
    } else if (char === "`" && previousChar !== "\\" && !insideDoubleQuote && !insideSingleQuote) {
      insideTemplateString = !insideTemplateString;
      output += char;
    } else if ((char === "\n" || char === "\r") && (insideDoubleQuote || insideSingleQuote)) {
      output += " ";
    } else {
      output += char;
    }
    previousChar = char;
  }

  return output;
}

function hasBasicComponentShape(code: string) {
  return (
    code.includes("export default function GeneratedWebsite") &&
    code.includes("return") &&
    code.includes("<main") &&
    code.includes("</main>") &&
    code.includes(");") &&
    code.includes("}")
  );
}

function hasBalancedQuotes(code: string) {
  let dq = 0;
  let sq = 0;
  let prev = "";
  for (const c of code) {
    if (c === '"' && prev !== "\\") dq++;
    if (c === "'" && prev !== "\\") sq++;
    prev = c;
  }
  return dq % 2 === 0 && sq % 2 === 0;
}

function isProbablyIncomplete(code: string) {
  const trimmed = code.trim();
  if (!hasBasicComponentShape(trimmed)) return true;
  if (!hasBalancedQuotes(trimmed)) return true;
  const suspiciousEndings = [
    'className="', "className='", "className={`", "className=",
    "className", "<header", "<section", "<div", "<p", "<span", "<button",
  ];
  return suspiciousEndings.some((e) => trimmed.endsWith(e));
}

const brokenFallback = `
export default function GeneratedWebsite() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <section className="max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <div className="mx-auto mb-6 w-fit rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200">
          Preview unavailable
        </div>
        <h1 className="text-3xl font-black">
          This preview could not be displayed
        </h1>
        <p className="mt-4 text-white/60">
          The published code may be incomplete or invalid.
        </p>
      </section>
    </main>
  );
}
`.trim();

// ── Component ─────────────────────────────────────────────────────────────────

export function PublicWebsitePreview({ code }: PublicWebsitePreviewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const appCode = useMemo(() => {
    const raw = removeMarkdown(code || "");
    const extracted = extractComponentCode(raw);
    const normalized = normalizeNewLinesInsideStrings(extracted);
    const cleaned = normalized.trim();
    const safe = isProbablyIncomplete(cleaned) ? brokenFallback : cleaned;

    return `
import React from "react";
import "./styles.css";

${safe}
    `.trim();
  }, [code]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950">
        <p className="text-sm text-white/40">Loading preview…</p>
      </div>
    );
  }

  return (
    <SandpackProvider
      template="react"
      theme="dark"
      files={{
        "/App.js": {
          code: appCode,
          active: true,
        },
        "/styles.css": {
          code: `
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
button { font-family: inherit; }
          `.trim(),
        },
      }}
      customSetup={{
        dependencies: {
          react: "latest",
          "react-dom": "latest",
        },
      }}
      options={{
        externalResources: ["https://cdn.tailwindcss.com"],
        recompileMode: "delayed",
        recompileDelay: 600,
      }}
    >
      {/* Preview-only — no code editor, no file explorer */}
      <SandpackPreview
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        style={{ width: "100%", height: "100%" }}
      />
    </SandpackProvider>
  );
}
