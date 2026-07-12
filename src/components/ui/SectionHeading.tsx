import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  className?: string;
};

export function SectionHeading({ eyebrow, title, children, className }: SectionHeadingProps) {
  return (
    <div className={cn("mx-auto max-w-3xl text-center", className)}>
      <p className="font-pixel text-xs uppercase text-lemon sm:text-sm">{eyebrow}</p>
      <h2 className="mt-3 font-pixel text-3xl leading-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {children ? <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">{children}</p> : null}
    </div>
  );
}
