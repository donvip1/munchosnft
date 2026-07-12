import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-lemon/60 bg-lemon text-black shadow-lemon hover:bg-lemon-soft hover:shadow-[0_0_36px_rgba(200,255,0,0.38)]",
  secondary:
    "border-white/14 bg-white/[0.08] text-white hover:border-violet/60 hover:bg-violet/18 hover:shadow-violet",
  ghost: "border-transparent bg-transparent text-white/72 hover:bg-white/[0.06] hover:text-white"
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-sm sm:h-14 sm:px-7 sm:text-base"
};

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border font-pixel uppercase tracking-normal transition duration-200 focus:outline-none focus:ring-2 focus:ring-lemon/80 focus:ring-offset-2 focus:ring-offset-ink disabled:pointer-events-none disabled:opacity-55";

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;
type LinkButtonProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement>;

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button className={cn(baseClass, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

export function LinkButton({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: LinkButtonProps) {
  return (
    <a className={cn(baseClass, variants[variant], sizes[size], className)} {...props}>
      {children}
    </a>
  );
}
