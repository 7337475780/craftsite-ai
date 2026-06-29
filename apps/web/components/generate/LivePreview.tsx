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
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Tablet, Smartphone } from "lucide-react";

type LivePreviewProps = {
  code: string;
};

type Viewport = "desktop" | "tablet" | "mobile";

const VIEWPORT_CONFIG: Record<
  Viewport,
  { width: string | number; label: string; Icon: React.FC<{ size?: number; className?: string }> }
> = {
  desktop: { width: "100%", label: "Desktop", Icon: Monitor },
  tablet: { width: 768, label: "Tablet", Icon: Tablet },
  mobile: { width: 390, label: "Mobile", Icon: Smartphone },
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

function hasBasicComponentShape(code: string) {
  const hasExport =
    code.includes("export default function GeneratedWebsite") ||
    code.includes("export default function App") ||
    code.includes("export default GeneratedWebsite") ||
    code.includes("export default App");
  const hasJSX = code.includes("return (") || code.includes("return(");
  const hasClosingBrace = code.trimEnd().endsWith("}");
  return hasExport && hasJSX && hasClosingBrace;
}

function isProbablyIncomplete(code: string) {
  const trimmed = code.trim();
  if (!hasBasicComponentShape(trimmed)) return true;
  if (!hasBalancedQuotes(trimmed)) return true;

  const suspiciousEndings = [
    'className="', "className='", "className={`", "className=", "className",
    "<header", "<section", "<div", "<p", "<span", "<button",
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
  const [viewport, setViewport] = useState<Viewport>("desktop");

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

  const cfg = VIEWPORT_CONFIG[viewport];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-[0_24px_90px_rgba(0,0,0,0.38)]">
      {isInvalid && (
        <div className="border-b border-red-500/20 bg-red-500/10 px-5 py-2.5 text-xs font-semibold text-red-700 dark:text-red-300">
          The generated code looked incomplete — CraftSite protected the live preview. Use the Code tab to inspect it or generate again.
        </div>
      )}

      {/* Viewport toolbar */}
      <div className="flex flex-none items-center gap-3 border-b border-black/8 bg-white/60 px-4 py-2.5 dark:border-white/8 dark:bg-black/20">
        <span className="hidden text-[11px] font-semibold text-slate-400 dark:text-white/35 sm:block">
          Viewport:
        </span>
        <div className="relative flex items-center rounded-full border border-black/10 bg-slate-100/80 p-0.5 dark:border-white/10 dark:bg-white/[0.06]">
          {(Object.keys(VIEWPORT_CONFIG) as Viewport[]).map((vp) => {
            const { label, Icon } = VIEWPORT_CONFIG[vp];
            const isActive = viewport === vp;
            return (
              <button
                key={vp}
                onClick={() => setViewport(vp)}
                className="relative z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors duration-150"
                style={{ color: isActive ? undefined : undefined }}
              >
                {/* Sliding active pill */}
                {isActive && (
                  <motion.span
                    layoutId="viewport-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 shadow-md"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className={`relative flex items-center gap-1.5 ${isActive ? "text-white" : "text-slate-500 dark:text-white/50"}`}>
                  <Icon size={11} />
                  <span className="hidden sm:inline">{label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Dimension hint */}
        <AnimatePresence mode="wait">
          <motion.span
            key={viewport}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className="ml-auto hidden text-[10px] font-mono font-semibold text-slate-400 dark:text-white/30 sm:block"
          >
            {viewport === "desktop" ? "100% width" : viewport === "tablet" ? "768px" : "390px"}
          </motion.span>
        </AnimatePresence>
      </div>

      <SandpackProvider
        template="react"
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        files={{
          "/App.js": { code: appCode, active: true },
          "/styles.css": {
            code: `
@tailwind base;
@tailwind components;
@tailwind utilities;

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  overflow-x: hidden;
}

button { font-family: inherit; }
            `.trim(),
          },
        }}
        customSetup={{
          dependencies: { react: "latest", "react-dom": "latest" },
        }}
        options={{
          externalResources: ["https://cdn.tailwindcss.com"],
          recompileMode: "delayed",
          recompileDelay: 600,
        }}
      >
        <SandpackLayout style={{ height: "100%" }} className="flex-1 min-h-0 border-none bg-transparent">
          {/* File explorer — xl only */}
          <div className="hidden h-full border-r border-black/10 dark:border-white/10 xl:block">
            <SandpackFileExplorer />
          </div>

          {/* Code editor — hidden on mobile, visible md+ */}
          <div className="hidden h-full md:block md:flex-1" style={{ minWidth: 0 }}>
            <SandpackCodeEditor
              showTabs
              showLineNumbers
              wrapContent
              closableTabs={false}
              style={{ height: "100%", minWidth: 0 }}
            />
          </div>

          {/* Live preview with viewport animation */}
          <div className="flex h-full flex-1 items-center justify-center overflow-hidden bg-slate-100/80 dark:bg-slate-950/60 p-2 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewport}
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="h-full overflow-hidden"
                style={{
                  width: viewport === "desktop" ? "100%" : undefined,
                  maxWidth: viewport === "desktop" ? "100%" : cfg.width,
                  minWidth: viewport === "desktop" ? 0 : undefined,
                  flex: viewport === "desktop" ? 1 : undefined,
                }}
              >
                {/* Device frame for tablet/mobile */}
                {viewport !== "desktop" ? (
                  <div className="flex h-full flex-col overflow-hidden rounded-[24px] border-[3px] border-slate-300 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.25)] dark:border-slate-600 dark:bg-slate-900">
                    {/* Device top bar */}
                    <div className={`flex flex-none items-center justify-center border-b border-black/5 dark:border-white/5 ${viewport === "mobile" ? "h-7" : "h-6"}`}>
                      {viewport === "mobile" ? (
                        <div className="flex items-center gap-2">
                          <span className="h-1 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="h-2.5 w-2.5 rounded-full border border-slate-300 dark:border-slate-600" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-400/70" />
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400/70" />
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
                        </div>
                      )}
                    </div>

                    {/* Preview inside device */}
                    <div className="min-h-0 flex-1 overflow-hidden">
                      <SandpackPreview
                        showOpenInCodeSandbox={false}
                        showRefreshButton
                        showSandpackErrorOverlay={false}
                        style={{ height: "100%", width: "100%", minHeight: "100%" }}
                      />
                    </div>

                    {/* Device bottom bar */}
                    {viewport === "mobile" && (
                      <div className="flex flex-none items-center justify-center border-t border-black/5 py-2 dark:border-white/5">
                        <span className="h-1 w-24 rounded-full bg-slate-300 dark:bg-slate-600" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Desktop — full bleed, no frame */
                  <div className="h-full w-full overflow-hidden rounded-xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-slate-900">
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton
                      showSandpackErrorOverlay={false}
                      style={{ height: "100%", width: "100%", minHeight: "100%" }}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
