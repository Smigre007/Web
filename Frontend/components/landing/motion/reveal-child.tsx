"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { revealChildVariants } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";

export function RevealChild({ className, ...rest }: HTMLMotionProps<"div">) {
  const reduced = useLandingReducedMotion();
  return (
    <motion.div
      className={className}
      variants={revealChildVariants(reduced)}
      {...rest}
    />
  );
}

export function RevealChildP({ className, ...rest }: HTMLMotionProps<"p">) {
  const reduced = useLandingReducedMotion();
  return (
    <motion.p
      className={className}
      variants={revealChildVariants(reduced)}
      {...rest}
    />
  );
}
