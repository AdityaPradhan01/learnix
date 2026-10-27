import type { ButtonHTMLAttributes } from "react";
import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { clsx } from "@/lib/clsx";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost";
export type ButtonSize = "md" | "sm" | "xs";

const base =
  "pill inline-flex items-center justify-center gap-1.5 cursor-pointer font-heading font-semibold whitespace-nowrap transition-all duration-150 ease-[var(--ease-brand)] disabled:opacity-45 disabled:cursor-not-allowed";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-oxblood text-blush hover:bg-oxblood-hover hover:scale-[1.04] active:scale-100",
  secondary: "bg-pepper text-ink hover:bg-stone",
  dark: "bg-ink text-salt hover:bg-charcoal",
  ghost: "bg-transparent text-oxblood hover:underline underline-offset-4",
};

const sizes: Record<ButtonSize, string> = {
  md: "h-12 px-[26px] text-[14px]",
  sm: "h-10 px-5 text-[13px]",
  xs: "h-9 px-4 text-[12.5px]",
};

function buttonClasses(variant: ButtonVariant, size: ButtonSize, block: boolean | undefined, className?: string) {
  return clsx(base, variants[variant], sizes[size], block && "w-full", className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

export function Button({ variant = "secondary", size = "md", block, className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, size, block, className)} {...props} />;
}

interface LinkButtonProps extends LinkProps, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

/** Same pill visuals as Button, rendered as a navigable <a> — use this
 *  instead of nesting a Link inside a Button (invalid HTML). */
export function LinkButton({ variant = "secondary", size = "md", block, className, ...props }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, block, className)} {...props} />;
}
