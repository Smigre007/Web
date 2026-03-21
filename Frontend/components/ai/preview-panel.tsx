"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw, Maximize2, Minimize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PreviewPanelProps {
  html: string;
}

type DeviceSize = "desktop" | "tablet" | "mobile";

const DEVICE_CONFIGS: Record<DeviceSize, { width: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  desktop: { width: "100%", icon: Monitor, label: "Desktop" },
  tablet: { width: "768px", icon: Tablet, label: "Tablet (768px)" },
  mobile: { width: "375px", icon: Smartphone, label: "Mobile (375px)" },
};

export function PreviewPanel({ html }: PreviewPanelProps) {
  const [device, setDevice] = useState<DeviceSize>("desktop");
  const [key, setKey] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Close fullscreen on Escape
  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  const openInNewTab = useCallback(() => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    // Revoke after a short delay to allow the new tab to load
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    if (!win) {
      // Fallback if popup was blocked
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.click();
    }
  }, [html]);

  if (!html) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl border border-ink-15 bg-cream-2">
        <div className="text-center text-ink-35">
          <Monitor className="w-10 h-10 mx-auto mb-3 opacity-50" />
          <p>Preview será exibido aqui</p>
          <p className="text-xs mt-1 text-ink-35">Gere um projeto para ver o resultado ao vivo</p>
        </div>
      </div>
    );
  }

  const toolbar = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30 flex-shrink-0">
      {/* macOS dots */}
      <div className="flex items-center gap-1">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80 ml-1" />
        <div className="w-3 h-3 rounded-full bg-amber-500/80 ml-1" />
      </div>

      {/* Device selector */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
        {(Object.entries(DEVICE_CONFIGS) as [DeviceSize, typeof DEVICE_CONFIGS[DeviceSize]][]).map(([d, config]) => (
          <button
            key={d}
            onClick={() => setDevice(d)}
            className={`p-1.5 rounded-md transition-all ${
              device === d
                ? "bg-amber-600 text-white"
                : "text-white/40 hover:text-white"
            }`}
            title={config.label}
          >
            <config.icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        {/* Open in new tab */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={openInNewTab}
          title="Abrir em nova aba"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </Button>

        {/* Refresh */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => setKey((k) => k + 1)}
          title="Recarregar"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>

        {/* Fullscreen toggle */}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2"
          onClick={() => setFullscreen(!fullscreen)}
          title={fullscreen ? "Sair da tela cheia" : "Tela cheia"}
        >
          {fullscreen ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );

  const iframeEl = (
    <div
      className="flex justify-center bg-white/3 overflow-auto flex-1"
      style={{ minHeight: fullscreen ? "calc(100vh - 56px)" : "500px" }}
    >
      <div
        style={{
          width: DEVICE_CONFIGS[device].width,
          transition: "width 0.3s ease",
          minWidth: 0,
        }}
      >
        <iframe
          key={key}
          srcDoc={html}
          className="w-full border-0"
          style={{ height: fullscreen ? "calc(100vh - 56px)" : "700px" }}
          title="Preview"
          sandbox="allow-scripts"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Normal inline preview */}
      {!fullscreen && (
        <div className="rounded-2xl border border-white/10 overflow-hidden flex flex-col" style={{ background: "#080014" }}>
          {toolbar}
          {iframeEl}
        </div>
      )}

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col"
            style={{ background: "#080014" }}
          >
            {/* Close button overlay (also shown in toolbar) */}
            <button
              onClick={() => setFullscreen(false)}
              className="absolute top-3 right-14 z-10 p-1.5 rounded-lg bg-black/40 text-white/50 hover:text-white hover:bg-white/10 transition-all"
              title="Fechar tela cheia (Esc)"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-white/10">
              {toolbar}
            </div>
            {iframeEl}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
