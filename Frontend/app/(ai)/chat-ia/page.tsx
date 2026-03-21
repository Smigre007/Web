"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useLanguage } from "@/context/language-context";
import { DASHBOARD_I18N } from "@/components/dashboard/dashboard-copy";
import { ProjectPicker } from "@/components/ai/project-picker";

const AIChat = dynamic(
  () => import("@/components/ai/ai-chat").then((m) => m.AIChat),
  { ssr: false, loading: () => <ChatSkeleton /> }
);

function ChatSkeleton() {
  return <div className="flex-1 min-h-0 rounded-2xl border border-ink-15 bg-cream-2 animate-pulse" />;
}

export default function ChatIaPage() {
  const { language } = useLanguage();
  const lang = (language as "pt" | "en" | "es" | "fr") ?? "pt";
  const i = DASHBOARD_I18N[lang];
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectContext, setProjectContext] = useState("");

  const onProjectChange = useCallback(
    (id: string | null, ctx: string) => {
      setProjectId(id);
      setProjectContext(ctx);
    },
    []
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col px-3 py-3 sm:px-5 sm:py-4">
      <div className="mb-3 shrink-0 space-y-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{i.chat}</h1>
          <p className="mt-0.5 text-xs text-ink-35 sm:text-sm">{i.howHelp}</p>
        </div>
        <ProjectPicker lang={lang} value={projectId} onChange={onProjectChange} />
        <p className="text-[11px] text-ink-35 leading-relaxed max-w-2xl">{i.chatLinkProjectHint}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ink-15 bg-cream-2/90 shadow-sm shadow-ink/[0.04]">
        <AIChat
          key={projectId ?? "global"}
          projectId={projectId ?? undefined}
          projectContext={projectContext}
        />
      </div>
    </div>
  );
}
