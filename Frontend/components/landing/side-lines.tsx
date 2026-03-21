"use client";

import { motion } from "framer-motion";
import { useLandingReducedMotion } from "@/components/landing/motion/use-landing-reduced-motion";

interface SideLinesProps {
  visible: boolean;
}

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function SideLines({ visible }: SideLinesProps) {
  const reduced = useLandingReducedMotion();

  if (reduced) {
    if (!visible) return null;
    return (
      <>
        <div className="vline-editorial hidden lg:block" style={{ left: "56px" }} />
        <span
          className="hidden lg:block fixed z-20 font-mono text-[8px] uppercase tracking-[.35em] text-gold/55 pointer-events-none select-none"
          style={{
            left: "18px",
            top: "50%",
            writingMode: "vertical-rl",
            transform: "translateY(-50%) rotate(180deg)",
          }}
        >
          NeuroCode AI · Plataforma IA · 2025
        </span>
        <div className="vline-editorial hidden lg:block" style={{ right: "56px" }} />
        <span
          className="hidden lg:block fixed z-20 font-mono text-[8px] uppercase tracking-[.35em] text-gold/55 pointer-events-none select-none"
          style={{
            right: "18px",
            top: "50%",
            writingMode: "vertical-rl",
            transform: "translateY(-50%)",
          }}
        >
          v1.0 · Powered by NeuroCode AI
        </span>
      </>
    );
  }

  return (
    <>
      {/* Left line */}
      <motion.div
        className="vline-editorial hidden lg:block"
        style={{ left: "56px" }}
        initial={{ opacity: 0, scaleY: 0, transformOrigin: "top" }}
        animate={visible ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 1.2, ease }}
      />
      {/* Left label */}
      <motion.span
        className="hidden lg:block fixed z-20 font-mono text-[8px] uppercase tracking-[.35em] text-gold/55 pointer-events-none select-none"
        style={{
          left: "18px",
          top: "50%",
          writingMode: "vertical-rl",
          transform: "translateY(-50%) rotate(180deg)",
        }}
        initial={{ opacity: 0, x: -8 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
        transition={{ duration: 0.8, delay: 0.5, ease }}
      >
        NeuroCode AI · Plataforma IA · 2025
      </motion.span>

      {/* Right line */}
      <motion.div
        className="vline-editorial hidden lg:block"
        style={{ right: "56px" }}
        initial={{ opacity: 0, scaleY: 0, transformOrigin: "top" }}
        animate={visible ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
        transition={{ duration: 1.2, delay: 0.1, ease }}
      />
      {/* Right label */}
      <motion.span
        className="hidden lg:block fixed z-20 font-mono text-[8px] uppercase tracking-[.35em] text-gold/55 pointer-events-none select-none"
        style={{
          right: "18px",
          top: "50%",
          writingMode: "vertical-rl",
          transform: "translateY(-50%)",
        }}
        initial={{ opacity: 0, x: 8 }}
        animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 8 }}
        transition={{ duration: 0.8, delay: 0.6, ease }}
      >
        v1.0 · Powered by NeuroCode AI
      </motion.span>
    </>
  );
}
