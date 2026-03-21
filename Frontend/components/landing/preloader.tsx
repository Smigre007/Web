"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface PreloaderProps {
  onComplete: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const [pct, setPct] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLSpanElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fade brand name in
    gsap.fromTo(
      brandRef.current,
      { opacity: 0, letterSpacing: "0.8em" },
      { opacity: 1, letterSpacing: "0.5em", duration: 0.9, ease: "expo.out" }
    );

    const interval = setInterval(() => {
      setPct((prev) => {
        const next = prev + Math.floor(Math.random() * 14 + 3);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (pct < 100 || doneRef.current) return;
    doneRef.current = true;

    setTimeout(() => {
      gsap.to(wrapRef.current, {
        opacity: 0,
        duration: 1.4,
        ease: "expo.inOut",
        onComplete,
      });
    }, 500);
  }, [pct, onComplete]);

  return (
    <div ref={wrapRef} className="preloader">
      {/* Brand */}
      <span
        ref={brandRef}
        style={{ opacity: 0 }}
        className="font-mono text-[11px] uppercase text-gold tracking-[0.5em]"
      >
        NeuroCode
      </span>

      {/* Progress bar */}
      <div className="w-[180px] h-px bg-ink-15 relative overflow-hidden">
        <span
          className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-75"
          style={{
            width: `${pct}%`,
            boxShadow: "0 0 8px rgba(168,128,74,0.65)",
          }}
        />
      </div>

      {/* Percentage */}
      <span className="font-mono text-[9px] text-ink-35 tabular-nums">
        {pct.toString().padStart(3, "0")}
      </span>
    </div>
  );
}
