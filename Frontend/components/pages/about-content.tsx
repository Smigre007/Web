"use client";

import { Brain, Zap, Shield, Globe, Users, Sparkles, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".", ",")}k+`;
  if (n > 0) return `${n}+`;
  return "–";
}

const VALUE_ICONS = [Users, Zap, Shield, Heart, Globe, Sparkles];

export function AboutContent({
  userCount,
  projectCount,
}: {
  userCount: number;
  projectCount: number;
}) {
  const { t } = useLanguage();

  const STATS = [
    { value: userCount > 0 ? formatCount(userCount) : t("about", "statUsersEmpty"), label: t("about", "statUsers") },
    { value: projectCount > 0 ? formatCount(projectCount) : t("about", "statProjectsEmpty"), label: t("about", "statProjects") },
    { value: "9",  label: t("about", "statTypes") },
    { value: "v2", label: t("about", "statEngine") },
  ];

  const TIMELINE = [
    { year: t("about", "timeline0year"), title: t("about", "timeline0title"), desc: t("about", "timeline0desc") },
    { year: t("about", "timeline1year"), title: t("about", "timeline1title"), desc: t("about", "timeline1desc") },
    { year: t("about", "timeline2year"), title: t("about", "timeline2title"), desc: t("about", "timeline2desc") },
    { year: t("about", "timeline3year"), title: t("about", "timeline3title"), desc: t("about", "timeline3desc") },
  ];

  const VALUES = [
    { icon: Users,    title: t("about", "value0title"), desc: t("about", "value0desc") },
    { icon: Zap,      title: t("about", "value1title"), desc: t("about", "value1desc") },
    { icon: Shield,   title: t("about", "value2title"), desc: t("about", "value2desc") },
    { icon: Heart,    title: t("about", "value3title"), desc: t("about", "value3desc") },
    { icon: Globe,    title: t("about", "value4title"), desc: t("about", "value4desc") },
    { icon: Sparkles, title: t("about", "value5title"), desc: t("about", "value5desc") },
  ];

  const ctaBody = userCount > 0
    ? t("about", "ctaBodyWith").replace("{count}", formatCount(userCount))
    : t("about", "ctaBodyWithout");

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-28 px-6 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] rounded-full bg-gold/[0.08] blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/25 bg-gold/[0.08] text-gold text-sm mb-8">
            <Heart className="w-4 h-4" />
            {t("about", "heroBadge")}
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 font-sans">
            <span className="text-ink">{t("about", "heroH1a")}</span>
            <br />
            <span className="text-[#b91c1c]">{t("about", "heroH1b")}</span>
          </h1>
          <p className="text-xl text-ink-60 leading-relaxed max-w-3xl mx-auto font-serif">
            {t("about", "heroBody")}
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-ink-15">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-black text-ink mb-1">{stat.value}</div>
              <div className="text-sm text-ink-35">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Story / Timeline */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-ink mb-4 font-sans">
              {t("about", "timelineTitle")} <span className="text-[#b91c1c]">{t("about", "timelineTitleHighlight")}</span>
            </h2>
            <p className="text-ink-60 text-lg max-w-xl mx-auto font-serif">
              {t("about", "timelineSubtitle")}
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-gold/20 hidden md:block" />
            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 w-11 h-11 rounded-full bg-gold/[0.10] border border-gold/30 flex items-center justify-center text-xs font-black text-gold hidden md:flex">
                    {i + 1}
                  </div>
                  <div className="flex-1 p-6 rounded-2xl border border-ink-15 bg-ink/[0.02] hover:border-gold/25 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-gold tracking-widest uppercase">
                        {item.year}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-ink mb-2">{item.title}</h3>
                    <p className="text-ink-60 leading-relaxed font-serif">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6 border-t border-ink-15">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-ink mb-4 font-sans">
              {t("about", "valuesTitle")} <span className="text-[#b91c1c]">{t("about", "valuesTitleHighlight")}</span>
            </h2>
            <p className="text-ink-60 text-lg font-serif">
              {t("about", "valuesSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map((value, i) => {
              const Icon = VALUE_ICONS[i] ?? Sparkles;
              return (
                <div
                  key={value.title}
                  className="p-6 rounded-2xl border border-ink-15 bg-ink/[0.02] hover:border-gold/25 hover:bg-ink/[0.04] transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-gold/[0.10] border border-gold/20 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-bold text-ink text-lg mb-2">{value.title}</h3>
                  <p className="text-ink-60 text-sm leading-relaxed font-serif">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-10 rounded-3xl border border-gold/20 bg-gold/[0.04] text-center">
            <div className="w-16 h-16 rounded-2xl bg-ink flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-cream" />
            </div>
            <h2 className="text-3xl font-black text-ink mb-4 font-sans">
              {t("about", "techTitle")}
            </h2>
            <p className="text-ink-60 leading-relaxed mb-8 max-w-2xl mx-auto font-serif">
              {t("about", "techBody")}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["NeuroCode Engine", "Adaptive Thinking", "Next.js 15", "Supabase", "Stripe", "Clerk"].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 rounded-full border border-gold/25 bg-gold/[0.08] text-gold text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-ink-15">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black text-ink mb-6 font-sans">
            {t("about", "ctaTitle")} <span className="text-[#b91c1c]">{t("about", "ctaTitleHighlight")}</span>
          </h2>
          <p className="text-ink-60 text-lg mb-10 font-serif">
            {ctaBody}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="xl" variant="glow" className="group">
                <Sparkles className="w-5 h-5" />
                {t("about", "ctaBtn")}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="xl" variant="outline">
                {t("about", "ctaBtnSecondary")}
              </Button>
            </Link>
          </div>
          <p className="text-sm text-ink-35 mt-6">
            {t("about", "ctaNote")}
          </p>
        </div>
      </section>
    </main>
  );
}
