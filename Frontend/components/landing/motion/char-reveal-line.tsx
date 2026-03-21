"use client";

import { motion } from "framer-motion";
import { EDITORIAL_EASE } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";

type CharRevealLineProps = {
  text: string;
  className?: string;
  /** Screen reader: full sentence */
  as?: "p" | "blockquote";
};

/**
 * Split-hero style: characters rise with light rotation on scroll (advanced-effects).
 */
export function CharRevealLine({ text, className, as: Tag = "p" }: CharRevealLineProps) {
  const reduced = useLandingReducedMotion();
  const chars = text.split("");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      <span aria-hidden className="inline-block">
        {chars.map((ch, i) => (
          <span key={`${ch}-${i}`} className="inline-block overflow-hidden align-baseline">
            <motion.span
              className="inline-block"
              initial={{ y: 56, opacity: 0, rotate: 5 }}
              whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              viewport={{ once: false, margin: "-12% 0px" }}
              transition={{
                duration: 0.55,
                delay: i * 0.028,
                ease: EDITORIAL_EASE,
              }}
            >
              {ch === " " ? "\u00a0" : ch}
            </motion.span>
          </span>
        ))}
      </span>
    </Tag>
  );
}
