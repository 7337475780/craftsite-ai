"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

const promptExamples = [
  "SaaS landing page",
  "Portfolio website",
  "Restaurant site",
  "AI startup page",
];

export function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/generate?prompt=${encodeURIComponent(prompt.trim())}`);
    } else {
      router.push("/generate");
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    if (textareaRef.current) {
      textareaRef.current.value = example;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
    router.push(`/generate?prompt=${encodeURIComponent(example)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleGenerate(e);
    }
  };

  return (
    <section className="hero-section relative min-h-[100svh] overflow-hidden px-5 pt-32 pb-24 md:px-8 flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-20 hero-gradient" />
      <div className="orb-1" />
      <div className="orb-2" />

      <div className="mx-auto w-full max-w-3xl flex flex-col items-center text-center relative z-10">
        
        <h1 className="hero-title max-w-4xl font-black leading-[1.05] tracking-tight text-[var(--text)] mb-6">
          Craft stunning websites with a{" "}
          <span className="text-[var(--accent)]">single prompt.</span>
        </h1>

        <p className="hero-subtext mb-10 max-w-2xl text-lg leading-8 text-[var(--text-muted)]">
          CraftSite AI turns your ideas into premium, responsive websites with live preview, editable sections, clean code, and export-ready layouts.
        </p>

        {/* Prompt Box */}
        <div className="hero-card w-full text-left">
          <form onSubmit={handleGenerate}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Build a modern SaaS website for an AI tool..."
                className="hero-textarea"
                rows={3}
              />
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {promptExamples.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleExampleClick(item)}
                    className="suggestion-chip flex items-center gap-1.5"
                  >
                    <span className="text-[var(--accent)]">+</span> {item}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
                <span className="text-[var(--text-muted)] text-[0.8rem] hidden sm:inline-block">
                  Press ⌘ Enter to generate
                </span>
                <button type="submit" className="generate-btn w-full sm:w-auto">
                  <Sparkles size={16} />
                  Generate
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .hero-section {
          width: 100%;
        }
        .hero-gradient {
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg-secondary) 50%, var(--bg) 100%);
          background-size: 300% 300%;
          animation: gradientShift 10s ease infinite;
        }
        .orb-1 {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          width: 520px;
          height: 520px;
          background: var(--accent);
          opacity: 0.18;
          filter: blur(90px);
          top: -10%;
          left: -10%;
          border-radius: 50%;
          animation: float 7s ease-in-out infinite;
        }
        .orb-2 {
          position: absolute;
          z-index: 0;
          pointer-events: none;
          width: 360px;
          height: 360px;
          background: var(--accent-2);
          opacity: 0.14;
          filter: blur(70px);
          bottom: -5%;
          right: -5%;
          border-radius: 50%;
          animation: float 9s ease-in-out infinite reverse;
        }
        .hero-title {
          font-size: clamp(2rem, 6vw, 4.5rem);
          animation: fadeUp 0.7s ease-out forwards;
        }
        .hero-subtext {
          font-size: clamp(1rem, 2vw, 1.125rem);
          opacity: 0;
          animation: fadeUp 0.7s 0.15s ease-out forwards;
        }
        .hero-card {
          opacity: 0;
          animation: fadeUp 0.7s 0.3s ease-out forwards;
          background: var(--surface);
          border: 1.5px solid var(--border);
          border-radius: 20px;
          box-shadow: var(--shadow-lg);
          padding: 24px;
        }
        .hero-textarea {
          background: var(--surface-2) !important;
          color: var(--text) !important;
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 14px 16px;
          font-size: 1rem;
          resize: none;
          min-height: 120px;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.25s, box-shadow 0.25s;
          outline: none;
        }
        .hero-textarea:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .suggestion-chip {
          background: var(--surface-2);
          border: 1px solid var(--border);
          color: var(--text);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.15s, color 0.2s;
        }
        .suggestion-chip:hover {
          background: var(--accent);
          color: #fff;
          border-color: var(--accent);
          transform: translateY(-1px);
        }
        .generate-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: #fff;
          border: none;
          border-radius: 999px;
          padding: 12px 28px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          animation: pulse 2.5s ease-in-out infinite;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .generate-btn:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 8px 24px var(--accent-glow);
          animation-play-state: paused;
        }
        .generate-btn:active {
          transform: scale(0.97);
        }
        @media (max-width: 640px) {
          .hero-card {
            padding: 16px;
          }
        }
      `}</style>
    </section>
  );
}