"use client";

import { CharRevealLine } from "@/components/landing/motion/char-reveal-line";
import { useLanguage } from "@/context/language-context";

export function ManifestoStrip() {
  const { t } = useLanguage();
  const text = t("landingExtras", "manifesto");

  return (
    <section
      id="manifesto"
      className="border-y border-ink-15 bg-cream-2/90 py-14 md:py-16 px-6"
      aria-label={text}
    >
      <div className="max-w-4xl mx-auto text-center">
        <CharRevealLine
          as="blockquote"
          text={text}
          className="font-serif text-xl md:text-2xl lg:text-[1.65rem] leading-snug text-ink font-medium not-italic border-0 p-0 m-0"
        />
      </div>
    </section>
  );
}
