"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseCountUpOptions {
  target: number;
  duration?: number;
  decimals?: number;
  /** Called once when the animation completes */
  onComplete?: () => void;
}

interface UseCountUpResult {
  count: number;
  /** Attach this ref to the element that should trigger the counter when visible */
  ref: React.RefObject<HTMLElement | null>;
  /** Formatted string with locale thousands separator */
  formatted: string;
}

/**
 * Animates a number from 0 → target when the referenced element enters the viewport.
 * Uses easeOutExpo for a premium deceleration feel.
 */
export function useCountUp({
  target,
  duration = 1800,
  decimals = 0,
  onComplete,
}: UseCountUpOptions): UseCountUpResult {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  useLayoutEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const cancelTick = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const animate = () => {
      cancelTick();
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = eased * target;
        setCount(parseFloat(current.toFixed(decimals)));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          rafRef.current = null;
          setCount(target);
          onCompleteRef.current?.();
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        if (e.isIntersecting) {
          animate();
        } else {
          cancelTick();
          setCount(0);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      cancelTick();
      observer.disconnect();
    };
  }, [target, duration, decimals]);

  const formatted =
    decimals > 0
      ? count.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      : Math.floor(count).toLocaleString("pt-BR");

  return { count, ref, formatted };
}
