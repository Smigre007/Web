import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glow?: boolean; editorial?: boolean; tilt3d?: boolean }
>(({ className, glow, editorial, tilt3d, onMouseMove, onMouseLeave, ...props }, ref) => {
  const internalRef = React.useRef<HTMLDivElement>(null);
  const resolvedRef = (ref ?? internalRef) as React.RefObject<HTMLDivElement>;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (tilt3d) {
      const el = resolvedRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / (rect.width / 2);
        const dy = (e.clientY - cy) / (rect.height / 2);
        el.style.transform = `perspective(1000px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg)`;
      }
    }
    onMouseMove?.(e);
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    if (tilt3d) {
      const el = resolvedRef.current;
      if (el) el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    }
    onMouseLeave?.(e);
  }

  return (
    <div
      ref={resolvedRef}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm text-white",
        glow && "shadow-lg shadow-amber-500/10 hover:shadow-amber-500/15 hover:border-amber-500/20 transition-all duration-300",
        editorial && "glass-premium",
        tilt3d && "card-3d",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("font-semibold leading-none tracking-tight text-white", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm text-white/55", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
