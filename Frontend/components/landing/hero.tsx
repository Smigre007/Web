"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import type { TargetAndTransition } from "framer-motion";
import { ArrowRight, Code2, Sparkles, Eye, Terminal } from "lucide-react";
import Link from "next/link";
import { useCountUp } from "@/hooks/use-count-up";
import { useMagnetic } from "@/hooks/use-magnetic";
import { useLanguage } from "@/context/language-context";
import {
  HERO_DEMO_CODE_LINES,
  HERO_DEMO_PREVIEW_HTML,
} from "@/lib/landing/hero-demo-previews";
import { useLandingMotionGate } from "@/components/landing/motion/landing-motion-context";
import { useUser } from "@clerk/nextjs";
import {
  DASHBOARD_GENERATE_HREF,
  SIGN_UP_FOR_IA_HREF,
} from "@/lib/ia-routes";

const easeEditorial = [0.22, 1, 0.36, 1] as [number, number, number, number];

type AnimPhase = "typing" | "generating" | "preview";

type DemoScenario = {
  prompt: string;
  codeLines: readonly string[];
  previewHtml: string;
  label: string;
  icon: string;
};

/** Ritmo da demo do card — valores em ms (mais altos = mais calmo) */
const DEMO_TIMING = {
  startDelay: 750,
  charTyping: 38,
  pauseAfterPrompt: 600,
  codeLineDelay: 88,
  pauseAfterCode: 800,
  previewHold: 5200,
  pauseBeforeNextScenario: 950,
} as const;

function HeroLivePreview() {
  const { language, t } = useLanguage();
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<AnimPhase>("typing");
  const [promptText, setPromptText] = useState("");
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const cancelRef = useRef<boolean>(false);
  const codeScrollRef = useRef<HTMLDivElement>(null);

  const demoScenarios = useMemo((): DemoScenario[] => {
    const previews = HERO_DEMO_PREVIEW_HTML[language];
    const icons = ["🌸", "📊", "🎓"];
    return [0, 1, 2].map((i) => ({
      prompt: t("hero", `demo_prompt_${i}`),
      codeLines: HERO_DEMO_CODE_LINES[i],
      previewHtml: previews[i],
      label: t("hero", `demo_label_${i}`),
      icon: icons[i]!,
    }));
  }, [language, t]);

  useEffect(() => {
    if (codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [codeLines]);

  useEffect(() => {
    cancelRef.current = false;
    const timeoutIds: ReturnType<typeof setTimeout>[] = [];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPromptText("");
    setCodeLines([]);
    setPhase("typing");
    setVisible(true);

    const scenario = demoScenarios[scenarioIdx];

    function schedule(fn: () => void, delay: number) {
      const id = setTimeout(() => {
        if (!cancelRef.current) fn();
      }, delay);
      timeoutIds.push(id);
      return id;
    }

    let totalDelay = DEMO_TIMING.startDelay;

    // Phase 1: type the prompt
    for (let i = 0; i < scenario.prompt.length; i++) {
      const capturedI = i;
      schedule(() => {
        setPromptText(scenario.prompt.slice(0, capturedI + 1));
      }, totalDelay);
      totalDelay += DEMO_TIMING.charTyping;
    }

    totalDelay += DEMO_TIMING.pauseAfterPrompt;
    schedule(() => setPhase("generating"), totalDelay);

    // Phase 2: add code lines
    for (let i = 0; i < scenario.codeLines.length; i++) {
      const capturedI = i;
      totalDelay += DEMO_TIMING.codeLineDelay;
      schedule(() => {
        setCodeLines((prev) => [...prev, scenario.codeLines[capturedI]]);
      }, totalDelay);
    }

    totalDelay += DEMO_TIMING.pauseAfterCode;
    schedule(() => setPhase("preview"), totalDelay);

    totalDelay += DEMO_TIMING.previewHold;
    schedule(() => {
      setVisible(false);
    }, totalDelay);

    totalDelay += DEMO_TIMING.pauseBeforeNextScenario;
    schedule(() => {
      setScenarioIdx((prev) => (prev + 1) % demoScenarios.length);
    }, totalDelay);

    return () => {
      cancelRef.current = true;
      for (const id of timeoutIds) clearTimeout(id);
    };
  }, [scenarioIdx, demoScenarios]);

  const scenario = demoScenarios[scenarioIdx];

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={scenarioIdx}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.65, ease: easeEditorial }}
          className="w-full rounded-2xl overflow-hidden border border-white/[0.08]"
          style={{ background: "rgba(17,19,24,0.95)" }}
        >
          {/* Window chrome */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/[0.06] rounded px-3 py-1 text-[9px] font-mono text-white/30 tracking-wider">
                neurocode.ai/dashboard
              </div>
            </div>
            <div className="text-[9px] font-mono text-amber-500/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              {scenario.label}
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-white/[0.06]">
            {[
              { id: "chat", label: t("demo", "tabChat"), icon: Sparkles, active: phase === "typing" },
              { id: "code", label: t("demo", "tabCode"), icon: Terminal, active: phase === "generating" },
              { id: "preview", label: t("demo", "tabPreview"), icon: Eye, active: phase === "preview" },
            ].map((tab) => (
              <div
                key={tab.id}
                className={`flex items-center gap-1 px-3 py-2 text-[10px] font-mono transition-all ${
                  tab.active
                    ? "bg-amber-600/20 text-amber-400 border-b border-amber-500"
                    : "text-white/25"
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </div>
            ))}
          </div>

          {/* Content area */}
          <div className="h-[260px] overflow-hidden relative">
            <AnimatePresence mode="wait">
              {/* TYPING PHASE */}
              {phase === "typing" && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-end p-4 gap-3"
                >
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-amber-600/90 text-white text-[11px] rounded-2xl rounded-br-sm px-3 py-2 max-w-[85%] leading-relaxed font-mono">
                      {promptText}
                      <span className="inline-block w-0.5 h-3 bg-white/80 ml-0.5 align-middle animate-pulse" />
                    </div>
                  </div>
                  <div className="text-white/20 text-[10px] font-mono text-center">
                    {t("hero", "demo_typingHint")}
                  </div>
                </motion.div>
              )}

              {/* GENERATING PHASE */}
              {phase === "generating" && (
                <motion.div
                  key="generating"
                  ref={codeScrollRef}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full overflow-y-auto p-4"
                  style={{ scrollbarWidth: "none" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 rounded bg-amber-600 flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[9px] font-mono text-amber-400 uppercase tracking-wider">
                      {t("hero", "demo_generating")}
                    </span>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 rounded-full bg-amber-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                  <pre className="text-[10px] leading-5 font-mono text-amber-300/80">
                    {codeLines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <span className="text-white/15 select-none mr-3 text-[9px]">{String(i + 1).padStart(2, " ")}</span>
                        {line}
                      </motion.div>
                    ))}
                  </pre>
                </motion.div>
              )}

              {/* PREVIEW PHASE */}
              {phase === "preview" && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: easeEditorial }}
                  className="h-full relative"
                >
                  <iframe
                    srcDoc={scenario.previewHtml}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                    title={`${t("hero", "demo_iframeTitle")}: ${scenario.label}`}
                  />
                  <div className="absolute bottom-2 right-2 bg-amber-600/90 text-white text-[9px] font-mono px-2 py-1 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                    {t("hero", "demo_liveBadge")}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.04] bg-white/[0.015]">
            <div className="flex items-center gap-2 text-[9px] font-mono text-white/25">
              <span className="text-amber-500/60">NeuroCode AI Engine</span>
              <span>·</span>
              <span>{scenario.icon} {scenario.label}</span>
            </div>
            <div className="text-[9px] font-mono text-white/20">
              {phase === "typing" && t("hero", "demo_phase_waiting")}
              {phase === "generating" &&
                `${codeLines.length}/${scenario.codeLines.length} ${t("hero", "demo_lines")}`}
              {phase === "preview" && t("hero", "demo_phase_success")}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Timing constants (relative to when loaded = true) ────────────────────────
// These mirror the VELA cinematic entrance approach
const T = {
  eyebrow:   0.3,   // eyebrow wipes right
  line:      0.5,   // decorative line extends
  word0:     0.55,  // first headline word rises
  wordStep:  0.18,  // stagger per word
  right:     0.75,  // right panel enters
  copy:      2.85,  // body copy wipes up (after last word lands)
  stats:     3.15,  // stats count up
  cta:       3.40,  // CTA buttons rise
  scroll:    4.80,  // scroll hint
  tape:      1.60,  // marquee tape
} as const;

export function Hero() {
  const { isSignedIn, isLoaded } = useUser();
  const { t } = useLanguage();
  const primaryCtaHref =
    isLoaded && isSignedIn ? DASHBOARD_GENERATE_HREF : SIGN_UP_FOR_IA_HREF;
  const HEADLINE_WORDS = t("hero", "headline").split(" ");
  const marqueePhrases = useMemo(
    () => Array.from({ length: 11 }, (_, i) => t("hero", `marquee_${i}`)),
    [t]
  );
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liveStats, setLiveStats] = useState<{ users: number; projects: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const magnetic = useMagnetic({ strength: 9 });

  // Parallax on background grid
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-18%"]);

  const heroInView = useInView(sectionRef, { once: false, amount: 0.15 });

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const { setGateOpen } = useLandingMotionGate();
  useEffect(() => {
    if (loaded) {
      setShouldAnimate(true);
      setGateOpen(true);
    }
  }, [loaded, setGateOpen]);

  // Preloader: count 0 → 100%, then fire
  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 4 + 1.5;
      if (p > 100) p = 100;
      setProgress(Math.round(p));
      if (p >= 100) {
        clearInterval(iv);
        setTimeout(() => setLoaded(true), 700);
      }
    }, 85);
    // Safety fallback: always finish within 6 s
    const fallback = setTimeout(() => setLoaded(true), 6000);
    return () => {
      clearInterval(iv);
      clearTimeout(fallback);
    };
  }, []);

  // Stats fetch
  useEffect(() => {
    fetch("/api/public/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setLiveStats(d))
      .catch(() => {});
  }, []);

  // CountUp for stats — only show real data, never fake fallbacks
  const projectsTarget = liveStats?.projects ?? 0;
  const usersTarget = liveStats?.users ?? 0;
  const { ref: projectsRef, formatted: projectsFmt } = useCountUp({ target: projectsTarget, duration: 1600 });
  const { ref: usersRef, formatted: usersFmt } = useCountUp({ target: usersTarget, duration: 1400 });

  // Helper: animate when shouldAnimate is true (after preloader finishes)
  const anim = (
    on: TargetAndTransition,
    off: TargetAndTransition = {}
  ): TargetAndTransition => (shouldAnimate && heroInView ? on : off);

  return (
    <>
      {/* ── PRELOADER ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="preloader"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: easeEditorial }}
            className="fixed inset-0 z-[9999] bg-cream flex flex-col items-center justify-center gap-7 pointer-events-none"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: easeEditorial }}
              className="font-mono text-[10px] tracking-[0.55em] uppercase text-ink"
            >
              NeuroCode AI
            </motion.p>

            <div className="w-[180px] h-px bg-ink-15 overflow-hidden">
              <motion.div
                className="h-full bg-ink"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-mono text-[9px] tracking-[0.22em] text-ink-35"
            >
              {progress}%
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section ref={sectionRef} id="hero" className="relative min-h-screen flex flex-col overflow-hidden bg-cream">
        <motion.div
          className="absolute inset-0 grid-pattern-editorial opacity-60"
          style={{ y: bgY }}
        />

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 pt-32 pb-20 lg:pb-24">

          {/* ── LEFT ──────────────────────────────────────────────────────── */}
          <div className="lg:flex-1 lg:pr-12 flex flex-col justify-center">

            {/* Eyebrow — wipes from left to right (clip-path) */}
            <motion.p
              className="section-eyebrow mb-4 flex items-center gap-3"
              initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.6 }}
              animate={anim(
                { clipPath: "inset(0 0% 0 0)", opacity: 1 },
                { clipPath: "inset(0 100% 0 0)", opacity: 0.6 }
              )}
              transition={{ duration: 1.15, delay: T.eyebrow, ease: easeEditorial }}
            >
              <motion.span
                className="h-px bg-ink-35 shrink-0"
                initial={{ width: 0 }}
                animate={anim({ width: 40 }, { width: 0 })}
                transition={{ duration: 0.9, delay: T.line, ease: easeEditorial }}
                aria-hidden
              />
              <span>{t("hero", "badge")}</span>
            </motion.p>

            {/* Headline — each word rises from behind clip mask, one by one */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold tracking-tight text-ink leading-[0.92] mb-10">
              {HEADLINE_WORDS.map((word, i) => (
                <span
                  key={i}
                  className="inline-block mr-[0.2em] overflow-hidden align-bottom pb-[0.18em] -mb-[0.18em]"
                  aria-hidden={i > 0 ? true : undefined}
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: "115%", opacity: 0 }}
                    animate={anim(
                      { y: "0%", opacity: 1 },
                      { y: "115%", opacity: 0 }
                    )}
                    transition={{
                      duration: 1.4,
                      delay: T.word0 + i * T.wordStep,
                      ease: easeEditorial,
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
              {/* Hidden for SR — full headline */}
              <span className="sr-only">{t("hero", "headline")}</span>
            </h1>

            {/* Body copy — wipes upward (clip-path reveal from top) */}
            <motion.p
              className="text-lg md:text-xl text-ink-60 max-w-lg mb-8 font-serif font-medium leading-relaxed"
              initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
              animate={anim(
                { clipPath: "inset(0 0 0% 0)", opacity: 1 },
                { clipPath: "inset(0 0 100% 0)", opacity: 0 }
              )}
              transition={{ duration: 1.35, delay: T.copy, ease: easeEditorial }}
            >
              {t("hero", "body")}
            </motion.p>

            {/* Stats — drift up */}
            <motion.div
              className="flex flex-wrap gap-6 text-sm text-ink-60 font-mono mb-10"
              initial={{ opacity: 0, y: 28 }}
              animate={anim({ opacity: 1, y: 0 }, { opacity: 0, y: 28 })}
              transition={{ duration: 1.1, delay: T.stats, ease: easeEditorial }}
            >
              {liveStats && (
                <>
                  <div>
                    <span ref={projectsRef as React.RefObject<HTMLSpanElement>} className="text-ink">
                      {projectsFmt}+
                    </span>{" "}
                    {t("hero", "stat_projects")}
                  </div>
                  <div>
                    <span ref={usersRef as React.RefObject<HTMLSpanElement>} className="text-ink">
                      {usersFmt}+
                    </span>{" "}
                    {t("hero", "stat_users")}
                  </div>
                </>
              )}
              <div>
                <span className="text-ink">9+</span> {t("hero", "stat_types")}
              </div>
            </motion.div>

            {/* CTAs — drift up, 200ms after stats */}
            <motion.div
              className="flex flex-col sm:flex-row items-start gap-6"
              initial={{ opacity: 0, y: 28 }}
              animate={anim({ opacity: 1, y: 0 }, { opacity: 0, y: 28 })}
              transition={{ duration: 1.1, delay: T.cta, ease: easeEditorial }}
            >
              <Link
                ref={magnetic.ref as React.RefObject<HTMLAnchorElement>}
                // eslint-disable-next-line react-hooks/refs
                onMouseMove={magnetic.onMouseMove as React.MouseEventHandler<HTMLAnchorElement>}
                // eslint-disable-next-line react-hooks/refs
                onMouseLeave={magnetic.onMouseLeave}
                data-cursor-hover
                href={primaryCtaHref}
                className="hero-cta-editorial inline-flex items-center gap-3 bg-gradient-to-r from-amber-500 via-gold to-amber-600 text-ink px-8 py-4 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] transition-all duration-300 hover:brightness-105 shadow-lg shadow-amber-900/15 border border-ink/10 group"
              >
                <Sparkles className="w-4 h-4 shrink-0" aria-hidden />
                <span>{t("hero", "cta")}</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="#demo"
                className="link-editorial-underline inline-flex items-center gap-2 pb-0.5 font-mono text-[10px] uppercase tracking-[0.25em] text-ink-60 transition-colors duration-300 hover:text-ink"
              >
                <Code2 className="w-4 h-4" />
                {t("hero", "ctaSecondary")}
              </Link>
            </motion.div>
          </div>

          {/* ── RIGHT — Live Preview, enters before headline finishes ─────── */}
          <div className="lg:w-[46%] lg:flex lg:items-center mt-12 lg:mt-0">
            <motion.div
              className="relative w-full max-w-md mx-auto lg:mx-0 lg:pl-10 lg:border-l border-ink-15"
              initial={{ opacity: 0, y: 52, clipPath: "inset(0 0 18% 0)" }}
              animate={anim(
                { opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" },
                { opacity: 0, y: 52, clipPath: "inset(0 0 18% 0)" }
              )}
              transition={{ duration: 1.5, delay: T.right, ease: easeEditorial }}
            >
              <HeroLivePreview />
            </motion.div>
          </div>
        </div>

        {/* Marquee tape */}
        <motion.div
          className="relative z-10 border-y border-ink-15 bg-ink py-3 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={anim({ opacity: 1, y: 0 }, { opacity: 0, y: 20 })}
          transition={{ duration: 1.1, delay: T.tape, ease: easeEditorial }}
        >
          <div className="tape-scroll flex gap-0 w-max" style={{ animationDuration: "22s" }}>
            {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
              <span
                key={i}
                className={`text-[11px] font-sans font-bold uppercase tracking-[0.25em] whitespace-nowrap px-12 border-r border-white/10 last:border-r-0 ${
                  i % 4 === 0 ? "text-gold-lt" : "tape-muted"
                }`}
              >
                {phrase}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={anim({ opacity: 1 }, { opacity: 0 })}
          transition={{ delay: T.scroll, duration: 0.8, ease: easeEditorial }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        >
          <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-ink-35">{t("hero", "scrollHint")}</span>
          {/* “Worm” vertical — advanced-effects intro-scroll */}
          <div
            className="flex h-12 w-px overflow-hidden rounded-full bg-ink-15/40"
            aria-hidden
          >
            <div className="h-full w-full origin-top bg-gradient-to-b from-ink-35 via-ink-35/90 to-transparent animate-scroll-worm" />
          </div>
        </motion.div>
      </section>
    </>
  );
}
