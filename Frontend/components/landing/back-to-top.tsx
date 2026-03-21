"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useTheme } from "@/context/theme-context";
import { isDarkColorScheme } from "@/lib/theme-storage";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { theme } = useTheme();
  const isDark = isDarkColorScheme(theme);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={scrollTop}
          className={`fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full border flex items-center justify-center shadow-lg transition-colors duration-300 ${
            isDark
              ? "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30"
              : "bg-cream border-ink-15 text-ink hover:bg-ink hover:text-cream hover:border-ink"
          }`}
          aria-label="Voltar ao topo"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
