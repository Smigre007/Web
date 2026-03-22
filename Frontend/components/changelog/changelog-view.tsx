"use client";

import Link from "next/link";
import { Navbar } from "@/components/landing/navbar";
import { useLanguage } from "@/context/language-context";
import {
  CHANGELOG_TYPE_CLASS,
  getChangelogForLanguage,
  type ChangeType,
} from "@/lib/changelog-data";

export function ChangelogView() {
  const { language } = useLanguage();
  const { ui, entries } = getChangelogForLanguage(language);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto py-16 px-6 pt-28">
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-gold mb-3">{ui.badge}</p>
          <h1 className="text-4xl font-bold text-ink mb-3">{ui.title}</h1>
          <p className="text-ink-60">{ui.subtitle}</p>
        </div>

        <div className="space-y-12">
          {entries.map((entry, i) => (
            <div key={entry.version} className="relative">
              {i < entries.length - 1 && (
                <div className="absolute left-[11px] top-10 bottom-0 w-px bg-ink-15" />
              )}

              <div className="flex items-start gap-5">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                    i === 0 ? "border-gold bg-gold/[0.12]" : "border-ink-15 bg-ink/[0.03]"
                  }`}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <span className="text-ink font-bold text-lg">{entry.version}</span>
                    {i === 0 && (
                      <span className="text-[10px] font-mono bg-gold/[0.10] text-gold px-2 py-0.5 rounded-full border border-gold/20">
                        {ui.latest}
                      </span>
                    )}
                    <span className="text-ink-35 text-sm font-mono ml-auto">{entry.date}</span>
                  </div>

                  <div className="space-y-4">
                    {entry.changes.map((change, j) => (
                      <div
                        key={j}
                        className="rounded-xl border border-ink-15 bg-ink/[0.02] p-4 hover:border-gold/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border flex-shrink-0 mt-0.5 ${
                              CHANGELOG_TYPE_CLASS[change.type as ChangeType]
                            }`}
                          >
                            {ui.typeLabels[change.type as ChangeType]}
                          </span>
                          <div>
                            <p className="text-ink font-semibold text-sm mb-1">{change.title}</p>
                            <p className="text-ink-60 text-sm leading-relaxed">{change.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-ink-15 text-center">
          <p className="text-ink-35 text-sm font-mono">
            {ui.footerBefore}{" "}
            <Link href="/roadmap" className="text-gold hover:text-gold-lt transition-colors">
              {ui.footerLink}
            </Link>{" "}
            {ui.footerAfter}
          </p>
        </div>
      </div>
    </div>
  );
}
