"use client";

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/language-context";
import { DASHBOARD_I18N } from "@/components/dashboard/dashboard-copy";
import { isProjectTypeId } from "@/lib/project-types";

const GeneratorPanel = dynamic(
  () => import("@/components/ai/generator-panel").then((m) => m.GeneratorPanel),
  { ssr: false }
);

function GerarContent() {
  const searchParams = useSearchParams();
  const rawType = searchParams.get("type");
  const initialType = isProjectTypeId(rawType) ? rawType : undefined;
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const i = DASHBOARD_I18N[lang];

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
      <header className="mb-3 shrink-0 max-w-4xl">
        <h1 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{i.createProject}</h1>
        <p className="mt-0.5 text-xs text-ink-35 sm:text-sm">{i.whatCreate}</p>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ink-15 bg-cream-2/90 shadow-sm shadow-ink/[0.04]">
        <div className="min-h-0 flex-1 p-2 sm:p-4">
          <GeneratorPanel key={initialType ?? "default-type"} initialType={initialType} />
        </div>
      </div>
    </div>
  );
}

export default function GerarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 p-4 sm:p-6 animate-pulse space-y-4">
          <div className="h-8 bg-ink/[0.06] rounded-lg w-1/2 max-w-sm" />
          <div className="flex-1 min-h-[50dvh] bg-ink/[0.06] rounded-2xl" />
        </div>
      }
    >
      <GerarContent />
    </Suspense>
  );
}
