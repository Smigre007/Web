"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "nc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
    }
  }, []);

  const accept = (choice: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[9998] px-4 pb-4 md:px-6 md:pb-6"
          role="region"
          aria-label="Aviso de cookies"
        >
          <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-surface/95 backdrop-blur-md shadow-2xl shadow-black/40 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Cookie className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-white/70 leading-relaxed">
                Usamos cookies essenciais (autenticação, sessão) e funcionais (monitoramento de erros). Sem rastreamento
                publicitário.{" "}
                <Link
                  href="/privacy"
                  className="text-white/90 underline underline-offset-2 hover:text-white transition-colors"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => accept("essential")}
                className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider text-white/50 hover:text-white border border-white/10 hover:border-white/25 hover:bg-white/5 transition-all"
              >
                Apenas essenciais
              </button>
              <button
                onClick={() => accept("all")}
                className="px-4 py-2 rounded-xl text-xs font-mono tracking-wider bg-amber-600 hover:bg-amber-500 text-white transition-colors"
              >
                Aceitar todos
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
