"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X, Maximize2, Sparkles } from "lucide-react";
import type { DashboardDict } from "@/components/dashboard/dashboard-copy";

const AIChat = dynamic(
  () => import("@/components/ai/ai-chat").then((m) => m.AIChat),
  { ssr: false }
);

export function DashboardAiMinimal({
  i,
  onGoToFullChat,
}: {
  i: DashboardDict;
  onGoToFullChat: () => void;
}) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((o) => !o), []);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-backdrop"
            role="presentation"
            className="fixed inset-0 z-[60] bg-ink/[0.25] backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[70] flex flex-col items-end gap-2 pointer-events-none">
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div
              id="dashboard-ai-dock-panel"
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label={i.chat}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-[min(100vw-2rem,400px)] h-[min(72dvh,520px)] flex flex-col rounded-2xl border border-ink-15 bg-cream shadow-2xl shadow-ink/[0.12] overflow-hidden"
            >
              <div className="flex items-center justify-between px-3 py-2 border-b border-ink-15 bg-cream-2 shrink-0">
                <div className="flex items-center gap-2 text-ink min-w-0">
                  <Sparkles className="w-4 h-4 text-gold shrink-0" aria-hidden />
                  <span className="text-xs font-semibold font-sans truncate">{i.aiDockOpen}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={onGoToFullChat}
                    className="p-2 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05]"
                    title={i.aiDockExpand}
                    aria-label={i.aiDockExpand}
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-lg text-ink-35 hover:text-ink hover:bg-ink/[0.05]"
                    title={i.aiDockClose}
                    aria-label={i.aiDockClose}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 p-2 bg-cream">
                <AIChat variant="minimal" />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          layout
          onClick={toggle}
          aria-expanded={open}
          aria-controls={open ? "dashboard-ai-dock-panel" : undefined}
          className="pointer-events-auto flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-ink text-cream text-sm font-medium shadow-lg shadow-ink/20 hover:bg-gold hover:text-ink transition-colors border border-ink-15"
        >
          <MessageSquare className="w-4 h-4" aria-hidden />
          {i.aiDockOpen}
        </motion.button>
      </div>
    </>
  );
}
