"use client";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function PricingHero() {
  const { t } = useLanguage();
  return (
    <section className="relative pt-36 pb-8 px-6 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[300px] rounded-full bg-gold/[0.07] blur-[100px]" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/[0.08] text-gold text-sm mb-6">
          <Sparkles className="w-4 h-4" />
          {t("pricing", "herobadge")}
        </div>
        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 font-sans">
          <span className="text-ink">{t("pricing", "heroh1a")}</span>
          <br />
          <span className="text-[#b91c1c]">{t("pricing", "heroh1b")}</span>
        </h1>
        <p className="text-xl text-ink-60 max-w-2xl mx-auto font-serif">
          {t("pricing", "herosub")}
        </p>
      </div>
    </section>
  );
}
