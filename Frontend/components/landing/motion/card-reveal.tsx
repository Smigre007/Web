"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cardDropVariants } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";

type CardRevealProps = HTMLMotionProps<"article"> & {
  delay?: number;
};

export function CardReveal({ className, delay = 0, style, ...rest }: CardRevealProps) {
  const reduced = useLandingReducedMotion();
  const variants = cardDropVariants(reduced);

  return (
    <motion.article
      className={className}
      style={{ transformOrigin: "top center", ...style }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "-5% 0px -8% 0px" }}
      variants={variants}
      transition={{ delay: reduced ? 0 : delay }}
      {...rest}
    />
  );
}
