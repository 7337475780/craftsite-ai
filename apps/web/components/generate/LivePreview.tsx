"use client";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

type LivePreviewProps = {
  code: string;
};

const fallbackCode = `
export default function GeneratedWebsite() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <section className="max-w-3xl text-center">
        <div className="mx-auto mb-6 w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
          CraftSite Preview
        </div>

        <h1 className="text-5xl font-black tracking-tight">
          Your generated website will appear here
        </h1>

        <p className="mt-5 text-lg leading-8 text-white/60">
          Generate a website from your prompt to see a live preview.
        </p>

        <button className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-4 text-sm font-bold text-white">
          Generate Website
        </button>
      </section>
    </main>
  );
}
`.trim();

const invalidFallbackCode = `
export default function GeneratedWebsite() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <section className="max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
        <div className="mx-auto mb-6 w-fit rounded-full border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200">
          Preview protected
        </div>

        <h1 className="text-4xl font-black tracking-tight">
          The AI returned incomplete code
        </h1>

        <p className="mt-5 text-lg leading-8 text-white/60">
          CraftSite prevented the broken code from crashing the preview. Try generating again with a shorter prompt.
        </p>

        <button className="mt-8 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-500 px-6 py-4 text-sm font-bold text-white">
          Regenerate Website
        </button>
      </section>
    </main>
  );
}
`.trim();

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

  if (exportIndex === -1) {
    return code;
  }

  return code.slice(exportIndex).trim();
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
    if (char === '"' && previousChar !== "\\") {
      doubleQuotes++;
    }

    if (char === "'" && previousChar !== "\\") {
      singleQuotes++;
    }

    previousChar = char;
  }

  return doubleQuotes % 2 === 0 && singleQuotes % 2 === 0;
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

function isProbablyIncomplete(code: string) {
  const trimmed = code.trim();

  if (!hasBasicComponentShape(trimmed)) return true;
  if (!hasBalancedQuotes(trimmed)) return true;

  const suspiciousEndings = [
    'className="',
    "className='",
    "className={`",
    "className=",
    "className",
    "<header",
    "<section",
    "<div",
    "<p",
    "<span",
    "<button",
  ];

  return suspiciousEndings.some((ending) => trimmed.endsWith(ending));
}

function cleanPreviewCode(code: string) {
  const withoutMarkdown = removeMarkdown(code);
  const extracted = extractComponentCode(withoutMarkdown);
  const normalized = normalizeNewLinesInsideStrings(extracted);

  return normalized.trim();
}

export function LivePreview({ code }: LivePreviewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { appCode, isInvalid } = useMemo(() => {
    const rawCode = code || fallbackCode;
    const cleanedCode = cleanPreviewCode(rawCode);
    const invalid = Boolean(code) && isProbablyIncomplete(cleanedCode);

    const safeCode = invalid ? invalidFallbackCode : cleanedCode;

    return {
      isInvalid: invalid,
      appCode: `
import React from "react";
import "./styles.css";

${safeCode}
      `.trim(),
    };
  }, [code]);

  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035]">
        <p className="text-sm font-semibold text-slate-500 dark:text-white/50">
          Loading live preview...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
      {isInvalid && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-700 dark:text-red-300">
          The generated code looked incomplete, so CraftSite protected the live
          preview. Use the Code tab to inspect it or generate again.
        </div>
      )}

      <SandpackProvider
        template="react"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
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

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

button {
  font-family: inherit;
}
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
        <SandpackLayout style={{ height: "100%" }} className="flex-1 min-h-0 border-none">
          <div className="hidden h-full border-r border-black/10 dark:border-white/10 xl:block">
            <SandpackFileExplorer />
          </div>

          <SandpackCodeEditor
            showTabs
            showLineNumbers
            wrapContent
            closableTabs={false}
            style={{
              height: "100%",
              minWidth: 0,
              flex: 1,
            }}
          />

          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton
            style={{
              height: "100%",
              minWidth: 0,
              flex: 1,
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
