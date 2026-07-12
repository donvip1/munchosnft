import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function GlassCard({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-white/[0.055] shadow-glass backdrop-blur-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
