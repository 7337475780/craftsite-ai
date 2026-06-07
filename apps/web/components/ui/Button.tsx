import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/60",
        variant === "primary" &&
          "bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-500 text-white shadow-[0_0_34px_rgba(139,92,246,0.45)] hover:scale-[1.02]",
        variant === "secondary" &&
          "border border-white/10 bg-white/[0.05] text-white hover:border-violet-400/50 hover:bg-white/[0.08]",
        variant === "ghost" && "text-white/70 hover:text-white",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
