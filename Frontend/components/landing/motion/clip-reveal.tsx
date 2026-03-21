"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { EDITORIAL_EASE } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";

type ClipAxis = "horizontal" | "vertical";

const initialClip: Record<ClipAxis, string> = {
  horizontal: "inset(0 100% 0 0)",
  vertical: "inset(0 0 100% 0)",
};

const animateClip: Record<ClipAxis, string> = {
  horizontal: "inset(0 0% 0 0)",
  vertical: "inset(0 0 0% 0)",
};

type ClipRevealProps = HTMLMotionProps<"div"> & {
  axis?: ClipAxis;
  /** Eyebrow row often includes a line + text */
  children: React.ReactNode;
};

export function ClipReveal({
  axis = "horizontal",
  className,
  children,
  ...rest
}: ClipRevealProps) {
  const reduced = useLandingReducedMotion();

  if (reduced) {
    return (
      <div className={className} {...(rest as object)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ clipPath: initialClip[axis], opacity: 0.85 }}
      whileInView={{
        clipPath: animateClip[axis],
        opacity: 1,
      }}
      viewport={{ once: false, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 1.05, ease: EDITORIAL_EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
