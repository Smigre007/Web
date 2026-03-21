"use client";

import { motion } from "framer-motion";
import { EDITORIAL_EASE } from "./presets";
import { useLandingReducedMotion } from "./use-landing-reduced-motion";
import { ClipReveal } from "./clip-reveal";
import { WordStagger } from "./word-stagger";

type SectionHeaderRevealProps = {
  eyebrow: React.ReactNode;
  /** Ignored when titleSlot is set */
  title?: string;
  /** Custom title block (e.g. typewriter) instead of title string */
  titleSlot?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  plainTitle?: boolean;
  /** Center-aligned header (features, how-it-works, etc.) */
  centered?: boolean;
  descriptionClassName?: string;
};

/**
 * Eyebrow clip + word-stagger title + description fade-up (each uses viewport once).
 */
export function SectionHeaderReveal({
  eyebrow,
  title = "",
  titleSlot,
  description,
  className = "mb-10",
  titleClassName = "section-title text-4xl md:text-5xl text-ink font-light mb-4",
  plainTitle = false,
  centered = false,
  descriptionClassName,
}: SectionHeaderRevealProps) {
  const reduced = useLandingReducedMotion();
  const descTransition = reduced
    ? { duration: 0 }
    : { duration: 0.72, delay: 0.12, ease: EDITORIAL_EASE };

  const clipRow = centered
    ? "section-eyebrow flex items-center justify-center gap-3 mb-4 w-full"
    : "section-eyebrow flex items-center gap-3 mb-4 w-max max-w-full";
  const descDefault = centered
    ? "text-lg text-ink-60 max-w-xl md:max-w-2xl mx-auto font-serif text-center"
    : "text-lg text-ink-60 max-w-3xl font-serif";
  const descClass = descriptionClassName ?? descDefault;

  return (
    <div className={centered ? `${className} text-center` : className}>
      <ClipReveal className={clipRow}>
        {eyebrow}
      </ClipReveal>

      {titleSlot != null ? (
        <div className={`mb-4 ${centered ? "flex justify-center" : ""}`}>{titleSlot}</div>
      ) : plainTitle ? (
        <motion.h2
          className={titleClassName}
          initial={reduced ? false : { opacity: 0, y: 22 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EDITORIAL_EASE }}
        >
          {title}
        </motion.h2>
      ) : (
        <div className={`mb-4 ${centered ? "flex justify-center" : ""}`}>
          <WordStagger
            text={title}
            className={`${titleClassName} ${centered ? "text-center max-w-5xl" : ""}`}
          />
        </div>
      )}

      {description != null && (
        <motion.div
          className={descClass}
          initial={reduced ? false : { opacity: 0, y: 20 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-8% 0px" }}
          transition={descTransition}
        >
          {description}
        </motion.div>
      )}
    </div>
  );
}
