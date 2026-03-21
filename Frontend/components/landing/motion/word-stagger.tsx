"use client";

import { motion } from "framer-motion";
import { EDITORIAL_EASE } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";

type WordStaggerProps = {
  text: string;
  className?: string;
  /** Per-word delay after container enters view */
  wordDelay?: number;
  wordDuration?: number;
};

/**
 * H2-style headline: each word rises from masked overflow (hero pattern).
 */
export function WordStagger({
  text,
  className,
  wordDelay = 0.07,
  wordDuration = 0.75,
}: WordStaggerProps) {
  const reduced = useLandingReducedMotion();
  const words = text.trim().split(/\s+/);

  if (reduced) {
    return <h2 className={className}>{text}</h2>;
  }

  return (
    <h2 className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="inline-block mr-[0.22em] overflow-hidden align-bottom pb-[0.12em] -mb-[0.12em] last:mr-0"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "108%", opacity: 0 }}
            whileInView={{ y: "0%", opacity: 1 }}
            viewport={{ once: false, margin: "-10% 0px -10% 0px" }}
            transition={{
              duration: wordDuration,
              delay: i * wordDelay,
              ease: EDITORIAL_EASE,
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </h2>
  );
}
