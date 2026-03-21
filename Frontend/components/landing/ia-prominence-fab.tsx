"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useLanguage } from "@/context/language-context";
import { useTheme } from "@/context/theme-context";
import {
  DASHBOARD_GENERATE_HREF,
  SIGN_UP_FOR_IA_HREF,
} from "@/lib/ia-routes";
import { isDarkColorScheme } from "@/lib/theme-storage";

/**
 * Acesso fixo à IA — sempre visível na landing (evita desistência por não achar o gerador).
 */
export function IaProminenceFab() {
  const { isSignedIn, isLoaded } = useUser();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = isDarkColorScheme(theme);

  const href = isLoaded && isSignedIn ? DASHBOARD_GENERATE_HREF : SIGN_UP_FOR_IA_HREF;
  const label = t("nav", "iaFab");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-6 z-[45] left-0 right-0 flex justify-center pointer-events-none px-4 md:hidden"
    >
      <Link
        href={href}
        className={`pointer-events-auto inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3.5 sm:px-7 sm:py-4 text-sm sm:text-base font-bold shadow-[0_12px_40px_-8px_rgba(0,0,0,0.35)] border-2 transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          isDark
            ? "bg-gradient-to-r from-[#bd93f9] to-[#ff79c6] text-[#1a1b2e] border-white/20 focus-visible:ring-[#bd93f9]"
            : "bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink border-ink/10 focus-visible:ring-gold"
        }`}
        data-cursor-hover
      >
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" aria-hidden />
        <span className="tracking-tight">{label}</span>
      </Link>
    </motion.div>
  );
}
