"use client";

import { button } from "framer-motion/client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white/80 text-slate-900 shadow-sm backdrop-blur-xl transition hover:scale-105 dark:border-white/10 dark:bg-white/5 dark:text-white"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
