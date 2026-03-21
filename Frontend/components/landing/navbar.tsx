"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Menu, X, Sun, Moon, Sparkles, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-context";
import { useLanguage } from "@/context/language-context";
import { useUser, UserButton } from "@clerk/nextjs";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLandingMotionGate } from "@/components/landing/motion/landing-motion-context";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";
import { IaProminenceFab } from "@/components/landing/ia-prominence-fab";
import {
  DASHBOARD_GENERATE_HREF,
  SIGN_UP_FOR_IA_HREF,
} from "@/lib/ia-routes";
import { isDarkColorScheme } from "@/lib/theme-storage";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const { isSignedIn, isLoaded } = useUser();
  const isLanding = pathname === "/";
  const isDark = isDarkColorScheme(theme);
  const { gateOpen } = useLandingMotionGate();
  const reducedMotion = useLandingReducedMotion();
  const cinematicHomeEnter = isLanding && !reducedMotion;
  const navRevealed = !isLanding || gateOpen || reducedMotion;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { label: t("nav", "pricing"),  href: "/pricing" },
    { label: t("nav", "showcase"), href: "/showcase" },
    { label: t("nav", "about"),    href: "/about" },
  ];

  const linkClass = isDark
    ? "nav-link link-editorial-underline text-sm text-white/60 hover:text-white transition-colors duration-300"
    : "nav-link link-editorial-underline text-sm text-ink-60 hover:text-ink transition-colors duration-300";
  const scrolledBg = isDark ? "rgba(17, 19, 24, 0.92)" : "rgba(244, 239, 230, 0.88)";
  const scrolledBorder = isDark ? "border-white/10" : "border-ink-15";
  const logoTextClass = isDark
    ? "font-bold text-xl tracking-tight text-white"
    : "font-bold text-xl tracking-tight text-ink";
  const signInClass = isDark
    ? "link-editorial-underline text-sm text-white/70 hover:text-white transition-colors duration-300"
    : "link-editorial-underline text-sm text-ink-60 hover:text-ink transition-colors duration-300";
  return (
    <>
    <motion.nav
      initial={cinematicHomeEnter ? { y: -100, opacity: 0 } : false}
      animate={
        cinematicHomeEnter
          ? navRevealed
            ? { y: 0, opacity: 1 }
            : { y: -100, opacity: 0 }
          : { y: 0, opacity: 1 }
      }
      transition={{
        duration: cinematicHomeEnter ? 0.75 : 0,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`fixed top-0 left-0 right-0 z-50 font-sans transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        scrolled ? `py-3 border-b ${scrolledBorder}` : "py-5"
      }`}
      style={{
        background: scrolled ? scrolledBg : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-ink flex items-center justify-center">
            <Brain className="w-5 h-5 text-cream" />
          </div>
          <span className={logoTextClass}>NeuroCode AI</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href={isLoaded && isSignedIn ? DASHBOARD_GENERATE_HREF : SIGN_UP_FOR_IA_HREF}
            className={
              isDark
                ? "nav-link link-editorial-underline text-sm font-semibold text-amber-400/95 hover:text-amber-300 transition-colors duration-300"
                : "nav-link link-editorial-underline text-sm font-semibold text-amber-900 hover:text-ink transition-colors duration-300"
            }
          >
            {t("nav", "iaNav")}
          </Link>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/changelog"
            className={`inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] ${
              isDark
                ? "border-amber-500/30 text-amber-400 hover:border-amber-500/60"
                : "border-amber-600/30 text-amber-700 hover:border-amber-600/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
            {t("nav", "changelog")}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full border transition-all duration-300 ${
              isDark
                ? "border-white/20 text-white/70 hover:text-white hover:border-white/40"
                : "border-ink-15 text-ink-60 hover:text-ink hover:border-ink-35"
            }`}
            aria-label={isDark ? t("nav", "lightMode") : t("nav", "darkMode")}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 ${
                  isDark
                    ? "border-white/20 text-white/70 hover:text-white hover:border-white/40"
                    : "border-ink-15 text-ink-60 hover:text-ink hover:border-ink-35"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                {t("nav", "dashboard")}
              </Link>
              <Link
                href={DASHBOARD_GENERATE_HREF}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink shadow-md shadow-amber-900/15 border border-ink/10 hover:brightness-105 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4" />
                {t("nav", "createWithAI")}
              </Link>
              <LanguageSwitcher />
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <Link href="/sign-in" className={signInClass}>
                {t("nav", "signIn")}
              </Link>
              <LanguageSwitcher />
              <Link
                href={SIGN_UP_FOR_IA_HREF}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink shadow-lg shadow-amber-900/20 border border-ink/10 hover:brightness-105 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                {t("nav", "iaCta")}
              </Link>
            </div>
          )}
        </div>

        <button
          className={`md:hidden p-2 ${isDark ? "text-white/70 hover:text-white" : "text-ink-60 hover:text-ink"}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? t("nav", "closeMenu") : t("nav", "openMenu")}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`md:hidden absolute top-full left-0 right-0 border-b p-6 font-sans ${
            isDark ? "border-white/10" : "border-ink-15 bg-cream/95"
          }`}
          style={{
            backdropFilter: "blur(20px)",
            background: isDark ? "rgba(17, 19, 24, 0.98)" : "rgba(245, 242, 237, 0.98)",
          }}
        >
          <div className="flex flex-col gap-4">
            <Link
              href={isLoaded && isSignedIn ? DASHBOARD_GENERATE_HREF : SIGN_UP_FOR_IA_HREF}
              className={`link-editorial-underline w-fit font-semibold text-base ${
                isDark ? "text-amber-400" : "text-amber-900"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {t("nav", "iaNav")}
            </Link>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`link-editorial-underline w-fit ${
                  isDark ? "text-white/70 hover:text-white" : "text-ink-60 hover:text-ink"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex items-center gap-2 pt-1 pb-2 border-t border-ink-15">
              <button
                onClick={() => { toggleTheme(); setMobileOpen(false); }}
                className={`flex items-center gap-2 py-2 px-3 text-sm rounded-full border ${
                  isDark ? "border-white/20 text-white/70" : "border-ink-15 text-ink-60"
                }`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {isDark ? t("nav", "lightMode") : t("nav", "darkMode")}
              </button>
              <LanguageSwitcher />
            </div>

            {isLoaded && isSignedIn ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-center gap-2 py-2.5 text-sm rounded-full border transition-colors ${
                    isDark
                      ? "border-white/20 text-white/80 hover:text-white"
                      : "border-ink-15 text-ink-60 hover:text-ink"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("nav", "dashboard")}
                </Link>
                <Link
                  href={DASHBOARD_GENERATE_HREF}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-full bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink shadow-md border border-ink/10"
                >
                  <Sparkles className="w-4 h-4" />
                  {t("nav", "createWithAI")}
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href={SIGN_UP_FOR_IA_HREF}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 py-3.5 text-center text-sm font-bold rounded-full bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink shadow-lg border border-ink/10"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  {t("nav", "iaCta")}
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileOpen(false)}
                  className={`py-2.5 text-center text-sm rounded-full transition-colors ${
                    isDark
                      ? "border border-white/20 text-white/80 hover:text-white hover:border-white/40"
                      : "border border-ink-15 text-ink-60 hover:text-ink hover:border-ink-35"
                  }`}
                >
                  {t("nav", "signIn")}
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
    <IaProminenceFab />
    </>
  );
}
