import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type StatusPillProps = {
  children: ReactNode;
  tone?: "green" | "purple" | "white";
  className?: string;
};

const toneClasses = {
  green: "border-lemon/35 bg-lemon/10 text-lemon",
  purple: "border-violet/40 bg-violet/15 text-violet-soft",
  white: "border-white/12 bg-white/[0.06] text-white/70"
};

export function StatusPill({ children, tone = "white", className }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-pixel text-[11px] uppercase",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
