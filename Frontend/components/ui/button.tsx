"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

function addRipple(e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) {
  const el = e.currentTarget as HTMLElement;
  if (!el.classList.contains("ripple-container")) return;
  const rect = el.getBoundingClientRect();
  const span = document.createElement("span");
  span.className = "ripple-wave";
  span.style.left = `${e.clientX - rect.left}px`;
  span.style.top = `${e.clientY - rect.top}px`;
  el.appendChild(span);
  span.addEventListener("animationend", () => span.remove());
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a8804a] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[#18140f] text-[#ede8de] shadow-md shadow-black/25 hover:bg-[#a8804a] hover:text-[#faf7f2] hover:shadow-[#a8804a]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors duration-300",
        destructive:
          "bg-red-700 text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-white/10 bg-white/[0.03] text-white/72 hover:bg-white/[0.07] hover:border-white/20 hover:text-white",
        secondary:
          "bg-white/7 text-white/72 hover:bg-white/11 hover:text-white",
        ghost:
          "text-white/62 hover:bg-white/7 hover:text-white",
        link:
          "text-[#c9a06a] underline-offset-4 hover:underline hover:text-[#ddb87e]",
        glow:
          "bg-[#18140f] text-[#ede8de] shadow-md shadow-black/25 hover:bg-[#a8804a] hover:text-[#faf7f2] hover:shadow-[#a8804a]/20 hover:scale-[1.02] active:scale-[0.98] transition-colors duration-300",
        editorial:
          "ripple-container magnetic rounded-none border border-ink bg-ink text-cream font-mono text-[10px] uppercase tracking-[0.3em] hover:bg-gold hover:border-gold transition-colors duration-300",
        "editorial-outline":
          "ripple-container rounded-none border border-ink-15 text-ink font-mono text-[10px] uppercase tracking-[0.3em] hover:border-ink transition-colors duration-300",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
      addRipple(e);
      onClick?.(e);
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        onClick={handleClick}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
